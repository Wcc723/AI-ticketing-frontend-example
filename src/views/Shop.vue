<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const product = ref(null)
const selected = ref({ color: '', size: '' })
const selectedTags = ref([])

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

const skuStock = computed(() => {
  if (!product.value) return 0
  const it = product.value.inventory.find(
    i => i.color === selected.value.color && i.size === selected.value.size
  )
  return it ? it.stock : 0
})

const canAddToCart = computed(() => skuStock.value > 0)

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
      <!-- Gallery 佔位（無圖片，僅示意） -->
      <section class="lg:col-span-6">
        <div class="aspect-square w-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
          圖片佔位（女用運動鞋）
        </div>
        <div class="mt-3 grid grid-cols-4 gap-2">
          <div class="h-20 rounded bg-gray-100"></div>
          <div class="h-20 rounded bg-gray-100"></div>
          <div class="h-20 rounded bg-gray-100"></div>
          <div class="h-20 rounded bg-gray-100"></div>
        </div>
      </section>

      <!-- 產品資訊 -->
      <section class="lg:col-span-6 space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ product.name }}</h1>
          <p class="text-sm text-gray-500 mt-1">{{ product.brand }} ・ {{ product.category }}</p>
          <div class="flex items-center gap-3 mt-2">
            <span class="text-rose-600 text-2xl font-semibold">{{ priceTWD }}</span>
            <span class="text-yellow-500">★ {{ product.rating }}</span>
            <span class="text-gray-500 text-sm">({{ product.reviewsCount }} 則評價)</span>
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
                class="px-3 py-1 rounded border transition"
                :class="c === selected.color ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 hover:border-gray-300'"
                @click="selected.color = c"
              >{{ c }}</button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">尺寸</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="s in product.variants.size"
                :key="s"
                class="px-3 py-1 rounded border transition"
                :class="s === selected.size ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 hover:border-gray-300'"
                @click="selected.size = s"
              >{{ s }}</button>
            </div>
          </div>

          <div class="text-sm text-gray-600">
            當前庫存：
            <span :class="skuStock > 0 ? 'text-emerald-600' : 'text-gray-400'">{{ skuStock }}</span>
          </div>

          <div>
            <label class="block text-sm text-gray-600 mb-1">標籤（多選）</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="tag in product.tags" :key="tag" class="inline-flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer select-none"
                     :class="selectedTags.includes(tag) ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200'">
                <input type="checkbox" class="hidden" :value="tag" v-model="selectedTags" />
                <span class="text-sm">#{{ tag }}</span>
              </label>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="px-4 py-2 rounded bg-rose-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!canAddToCart"
            >加入購物車</button>
            <button class="px-4 py-2 rounded border border-gray-300">加入願望清單</button>
          </div>
        </div>

        <!-- 產品規格 -->
        <div class="border-t pt-4">
          <h3 class="font-semibold mb-2">商品規格</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div v-for="(v, k) in product.specs" :key="k" class="flex justify-between gap-3 border-b py-2">
              <span class="text-gray-500">{{ k }}</span>
              <span class="text-gray-800">{{ v }}</span>
            </div>
          </div>
        </div>

        <!-- 商品描述（富文字） -->
        <div class="border-t pt-4">
          <h3 class="font-semibold mb-2">商品描述</h3>
          <div class="prose prose-sm max-w-none" v-html="renderDelta(product.descriptionDelta)"></div>
        </div>

        <!-- 運送與政策 -->
        <div class="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div class="p-3 rounded border bg-gray-50">
            <div class="font-medium mb-1">運送資訊</div>
            <div>滿 {{ product.shipping.freeThreshold }} 免運，未滿運費 {{ product.shipping.fee }}</div>
            <div>出貨地：{{ product.shipping.shipFrom }}</div>
          </div>
          <div class="p-3 rounded border bg-gray-50">
            <div class="font-medium mb-1">售後政策</div>
            <div>退貨：{{ product.policies.return }}</div>
            <div>保固：{{ product.policies.warranty }}</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.prose h2 { margin-top: 0.5rem; }
</style>

