<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const product = ref(null)
const selected = ref({ color: '', size: '' })
const qty = ref(1)
const activeTab = ref('desc')

async function load() {
  const res = await fetch('/data/womens-sneakers.json')
  product.value = await res.json()
  // 預設選第一個變體
  selected.value.color = product.value?.variants?.color?.[0] ?? ''
  selected.value.size = product.value?.variants?.size?.[0] ?? ''
  loading.value = false
}

onMounted(load)

const priceTWD = computed(() =>
  product.value ? new Intl.NumberFormat('zh-TW', { style: 'currency', currency: product.value.currency || 'TWD' }).format(product.value.price) : ''
)

const hasDiscount = computed(() => !!product.value?.promotions?.discountPercent)
const discounted = computed(() => {
  if (!product.value) return 0
  const d = product.value.promotions?.discountPercent || 0
  return Math.round(product.value.price * (100 - d)) / 100
})
const discountedTWD = computed(() =>
  product.value ? new Intl.NumberFormat('zh-TW', { style: 'currency', currency: product.value.currency || 'TWD' }).format(discounted.value) : ''
)

// 建立存貨查詢 map：color -> size -> stock
const stockMap = computed(() => {
  const map = {}
  if (!product.value) return map
  for (const it of product.value.inventory) {
    map[it.color] ??= {}
    map[it.color][it.size] = it.stock
  }
  return map
})

const isColorAvailable = (color) => {
  const bySize = stockMap.value[color] || {}
  return Object.values(bySize).some(s => s > 0)
}

const isSizeAvailable = (size) => {
  const bySize = stockMap.value[selected.value.color] || {}
  return (bySize[size] ?? 0) > 0
}

const skuStock = computed(() => {
  const bySize = stockMap.value[selected.value.color] || {}
  return bySize[selected.value.size] ?? 0
})

const canAddToCart = computed(() => skuStock.value > 0)
const canIncrease = computed(() => qty.value < skuStock.value)
const canDecrease = computed(() => qty.value > 1)

// 簡易 Quill Delta 轉 HTML（僅處理粗體、標題與段落）
function renderDelta(delta) {
  if (!delta?.ops) return ''
  let html = ''
  for (const op of delta.ops) {
    const text = (op.insert || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const attrs = op.attributes || {}
    if (attrs.header === 2) {
      html += `<h2 class="text-xl font-semibold mb-2">${text}</h2>`
    } else if (attrs.bold) {
      html += `<strong>${text}</strong>`
    } else if (text === '\n') {
      html += '<br />'
    } else {
      html += text
    }
  }
  // 分段
  return html
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
    <div v-if="loading" class="text-center text-gray-500">載入中…</div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <nav class="lg:col-span-12 text-sm text-gray-500 -mb-4" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2">
          <li><router-link class="hover:text-rose-600" to="/menu">選單</router-link></li>
          <li>/</li>
          <li class="text-gray-700">{{ product.category }}</li>
          <li>/</li>
          <li class="text-gray-900">{{ product.name }}</li>
        </ol>
      </nav>
      <!-- Gallery 佔位（無圖片，僅示意） -->
      <section class="lg:col-span-6">
        <div class="aspect-square w-full rounded-xl bg-gray-50 ring-1 ring-gray-200 flex items-center justify-center text-gray-400">
          圖片佔位（女用運動鞋）
        </div>
        <div class="mt-3 grid grid-cols-4 gap-2">
          <div class="h-20 rounded-lg bg-gray-50 ring-1 ring-gray-200"></div>
          <div class="h-20 rounded-lg bg-gray-50 ring-1 ring-gray-200"></div>
          <div class="h-20 rounded-lg bg-gray-50 ring-1 ring-gray-200"></div>
          <div class="h-20 rounded-lg bg-gray-50 ring-1 ring-gray-200"></div>
        </div>
      </section>

      <!-- 產品資訊 -->
      <section class="lg:col-span-6 space-y-6 lg:sticky lg:top-20 self-start">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{{ product.name }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ product.brand }} ・ {{ product.category }}</p>
          <div class="flex items-center flex-wrap gap-3 mt-3">
            <template v-if="hasDiscount">
              <span class="text-rose-600 text-3xl font-semibold">{{ discountedTWD }}</span>
              <span class="text-gray-400 line-through text-lg">{{ priceTWD }}</span>
              <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-xs">-{{ product.promotions.discountPercent }}%</span>
            </template>
            <template v-else>
              <span class="text-rose-600 text-3xl font-semibold">{{ priceTWD }}</span>
            </template>
            <span class="inline-flex items-center gap-1 text-amber-600 text-sm">
              <span class="leading-none">
                <span v-for="i in 5" :key="i" class="inline-block">
                  <span v-if="i <= Math.round(product.rating)" class="text-amber-500">★</span>
                  <span v-else class="text-gray-300">★</span>
                </span>
              </span>
              <span class="text-gray-700">{{ product.rating }}</span>
              <span class="text-gray-500">({{ product.reviewsCount }})</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 ring-1 ring-rose-200">本月熱銷</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <span v-if="product.promotions?.coupon" class="px-2 py-1 rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">{{ product.promotions.coupon }}</span>
            <span v-if="product.promotions?.installment" class="px-2 py-1 rounded bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">{{ product.promotions.installment }}</span>
            <span v-if="product.shipping && product.price >= product.shipping.freeThreshold" class="px-2 py-1 rounded bg-teal-50 text-teal-700 ring-1 ring-teal-200">滿 {{ product.shipping.freeThreshold }} 免運</span>
          </div>
        </div>

        <!-- 規格選擇 -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">顏色</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in product.variants.color"
                :key="c"
                class="px-3 py-1 rounded-full border transition text-sm"
                :disabled="!isColorAvailable(c)"
                :class="[
                  c === selected.color && 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm',
                  c !== selected.color && 'border-gray-200 hover:border-gray-300',
                  !isColorAvailable(c) && 'opacity-40 cursor-not-allowed line-through'
                ]"
                @click="isColorAvailable(c) && (selected.color = c)"
              >{{ c }}</button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">尺寸</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in product.variants.size"
                :key="s"
                class="px-3 py-1 rounded-full border transition text-sm"
                :disabled="!isSizeAvailable(s)"
                :class="[
                  s === selected.size && 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm',
                  s !== selected.size && 'border-gray-200 hover:border-gray-300',
                  !isSizeAvailable(s) && 'opacity-40 cursor-not-allowed line-through'
                ]"
                @click="isSizeAvailable(s) && (selected.size = s)"
              >{{ s }}</button>
            </div>
          </div>

          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-600">庫存</span>
            <span
              class="px-2 py-0.5 rounded-full ring-1 text-xs"
              :class="skuStock > 0 ? 'text-emerald-700 bg-emerald-50 ring-emerald-200' : 'text-gray-500 bg-gray-50 ring-gray-200'"
            >{{ skuStock > 0 ? `現貨 ${skuStock}` : '缺貨' }}</span>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">標籤</label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in product.tags"
                :key="tag"
                class="px-3 py-1 rounded-full border text-sm bg-white ring-1 ring-gray-200 text-gray-700"
              >#{{ tag }}</span>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="inline-flex items-center border rounded-lg overflow-hidden">
              <button class="w-9 h-9 grid place-items-center text-gray-700 hover:bg-gray-50 disabled:opacity-40" :disabled="!canDecrease" @click="qty = Math.max(1, qty - 1)">−</button>
              <input class="w-12 text-center outline-none" type="number" min="1" :max="skuStock" v-model.number="qty" />
              <button class="w-9 h-9 grid place-items-center text-gray-700 hover:bg-gray-50 disabled:opacity-40" :disabled="!canIncrease" @click="qty = Math.min(skuStock, qty + 1)">＋</button>
            </div>
            <div class="flex gap-3">
              <button
                class="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                :disabled="!canAddToCart"
              >加入購物車</button>
              <button class="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">立即購買</button>
            </div>
          </div>

          <div class="mt-4 p-4 rounded-lg border bg-white ring-1 ring-gray-200 flex items-center justify-between">
            <div>
              <div class="font-medium">{{ product.seller?.name || '官方賣場' }}</div>
              <div class="text-xs text-gray-500 mt-0.5">評分 {{ product.seller?.rating || '—' }} ・ 追蹤 {{ product.seller?.followers?.toLocaleString?.() || '—' }} ・ {{ product.seller?.shipSpeed || '' }}</div>
            </div>
            <button class="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50">進入賣場</button>
          </div>
        </div>

        <!-- Tabs: 描述 / 規格 / 購買須知 -->
        <div class="border-t pt-4">
          <div class="flex gap-4 text-sm">
            <button :class="activeTab==='desc' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-600'" class="pb-2" @click="activeTab='desc'">商品描述</button>
            <button :class="activeTab==='specs' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-600'" class="pb-2" @click="activeTab='specs'">商品規格</button>
            <button :class="activeTab==='policy' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-gray-600'" class="pb-2" @click="activeTab='policy'">購買須知</button>
          </div>
          <div class="mt-4">
            <div v-show="activeTab==='desc'" class="prose prose-sm max-w-none leading-relaxed text-gray-800" v-html="renderDelta(product.descriptionDelta)"></div>
            <div v-show="activeTab==='specs'" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div v-for="(v, k) in product.specs" :key="k" class="flex justify-between gap-3 border-b py-2">
                <span class="text-gray-500">{{ k }}</span>
                <span class="text-gray-800">{{ v }}</span>
              </div>
            </div>
            <div v-show="activeTab==='policy'" class="grid gap-4 sm:grid-cols-2 text-sm">
              <div class="p-4 rounded-lg border bg-gray-50 ring-1 ring-gray-200">
                <div class="font-medium mb-1">運送資訊</div>
                <div>滿 {{ product.shipping.freeThreshold }} 免運，未滿運費 {{ product.shipping.fee }}</div>
                <div>出貨地：{{ product.shipping.shipFrom }} ・ 預計到貨：{{ product.shipping.etaDays }}</div>
              </div>
              <div class="p-4 rounded-lg border bg-gray-50 ring-1 ring-gray-200">
                <div class="font-medium mb-1">售後與保固</div>
                <div>退貨：{{ product.policies.return }}</div>
                <div>保固：{{ product.policies.warranty }}</div>
              </div>
              <div class="sm:col-span-2 flex flex-wrap gap-2 items-center">
                <span class="text-sm text-gray-600">平台保障：</span>
                <span v-for="g in product.guarantees || []" :key="g" class="px-2 py-1 rounded bg-white ring-1 ring-gray-200 text-gray-700 text-xs">{{ g }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.prose h2 { margin-top: 0.5rem; }
</style>
