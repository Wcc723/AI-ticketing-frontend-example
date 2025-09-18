<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const loading = ref(true)
const product = ref(null)
const selected = ref({ color: '', size: '' })
const qty = ref(1)
const activeImage = ref(0)
const activeTab = ref('description')

// --- Data Fetching ---
onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/data/womens-sneakers.json')
    product.value = await res.json()
    selected.value.color = product.value?.variants?.color?.[0] ?? ''
    selected.value.size = product.value?.variants?.size?.[0] ?? ''
  } catch (error) {
    console.error("Failed to load product data:", error)
  } finally {
    loading.value = false
  }
})

// --- Formatting Helpers ---
const dateFormatter = new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' })
const formatPrice = (price) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(price)

// --- Pricing & Discount ---
const priceTWD = computed(() => formatPrice(product.value?.price || 0))
const isDiscountActive = computed(() => {
  if (!product.value?.promotions?.discountPercent) return false
  const now = new Date()
  const start = new Date(`${product.value.promotions.discountStartDate}T00:00:00`)
  const end = new Date(`${product.value.promotions.discountEndDate}T23:59:59`)
  return now >= start && now <= end
})
const discountedPrice = computed(() => {
  if (!isDiscountActive.value) return product.value?.price || 0
  const discount = product.value.promotions.discountPercent || 0
  return Math.round(product.value.price * (100 - discount) / 100)
})
const discountedPriceTWD = computed(() => formatPrice(discountedPrice.value))
const discountDaysLeft = computed(() => {
  if (!isDiscountActive.value) return 0
  const end = new Date(`${product.value.promotions.discountEndDate}T23:59:59`)
  const diff = end.getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// --- Stock & Availability ---
const stockMap = computed(() => {
  const map = new Map()
  product.value?.inventory.forEach(item => {
    if (!map.has(item.color)) map.set(item.color, new Map())
    map.get(item.color).set(item.size, item.stock)
  })
  return map
})
const isColorAvailable = (color) => Array.from(stockMap.value.get(color)?.values() || []).some(stock => stock > 0)
const isSizeAvailable = (size) => (stockMap.value.get(selected.value.color)?.get(size) || 0) > 0
const currentSkuStock = computed(() => stockMap.value.get(selected.value.color)?.get(selected.value.size) ?? 0)

// --- Image Gallery ---
const gradientPalette = [
  { bg: 'bg-gradient-to-br from-slate-900 to-slate-700', swatch: 'bg-slate-800' },
  { bg: 'bg-gradient-to-br from-gray-200 to-gray-50', swatch: 'bg-white' },
  { bg: 'bg-gradient-to-br from-sky-200 to-blue-200', swatch: 'bg-sky-400' },
]
const gallerySlides = computed(() => 
  product.value?.variants.color.map((color, idx) => ({
    id: color,
    label: color,
    ...gradientPalette[idx % gradientPalette.length]
  })) || []
)
const currentSlide = computed(() => gallerySlides.value[activeImage.value] || {})

// --- UI Logic ---
const canAddToCart = computed(() => currentSkuStock.value > 0 && qty.value > 0)
const selectColor = (color) => {
  if (isColorAvailable(color)) selected.value.color = color
}

// --- Feature Highlights ---
const highlights = computed(() => [
  { icon: 'feather', title: '極致輕量', desc: `僅重 ${product.value?.specs['重量'] || '210g'}` },
  { icon: 'wind', title: '全方位透氣', desc: product.value?.specs['鞋面'] || '工程網布鞋面' },
  { icon: 'zap', title: '高效能量回饋', desc: product.value?.specs['中底'] || '回彈核心' },
])

// --- Watchers ---
watch(() => selected.value.color, (newColor) => {
  activeImage.value = gallerySlides.value.findIndex(s => s.label === newColor)
  qty.value = 1
  if (!isSizeAvailable(selected.value.size)) {
    const firstAvailable = product.value?.variants.size.find(s => isSizeAvailable(s))
    selected.value.size = firstAvailable || ''
  }
})
watch(currentSkuStock, (newStock) => {
  if (qty.value > newStock) qty.value = newStock > 0 ? newStock : 1
})

</script>

<template>
  <div class="min-h-screen bg-slate-100 font-sans text-slate-800">
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="product" class="max-w-7xl mx-auto">
      <main class="grid lg:grid-cols-2 min-h-screen">
        <!-- Left: Image Gallery -->
        <div class="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between p-8 bg-white">
          <div class="flex justify-between items-center">
            <router-link to="/menu" class="flex items-center gap-2 group">
              <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-300 transition-shadow">
                <span class="text-white font-bold text-lg">A</span>
              </div>
              <span class="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">AthleX</span>
            </router-link>
            <div class="text-sm text-slate-500">/ {{ product.category }}</div>
          </div>

          <div class="relative aspect-square my-8">
            <div v-for="(slide, idx) in gallerySlides" :key="slide.id" 
                 class="absolute inset-0 transition-opacity duration-500" 
                 :class="idx === activeImage ? 'opacity-100' : 'opacity-0'">
              <div :class="slide.bg" class="h-full w-full rounded-3xl flex items-center justify-center">
                <span class="text-9xl drop-shadow-lg">👟</span>
              </div>
            </div>
          </div>

          <div class="text-center">
            <p class="text-slate-600">{{ currentSlide.label }}</p>
          </div>
        </div>

        <!-- Right: Product Info & Actions -->
        <div class="p-8 lg:p-16 space-y-10">
          <div class="space-y-4">
            <h1 class="text-5xl font-extrabold text-slate-900 tracking-tight">{{ product.name }}</h1>
            <div class="flex items-center gap-4 text-slate-500">
              <div class="flex items-center gap-1 text-amber-500">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span class="font-semibold text-slate-700">{{ product.rating }}</span>
              </div>
              <span>·</span>
              <span>{{ product.reviewsCount }} 則評論</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <div v-for="item in highlights" :key="item.title" class="text-center">
              <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg mb-2">
                <svg v-if="item.icon === 'feather'" class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5zM16 8L2 22M17.5 15H9"/></svg>
                <svg v-if="item.icon === 'wind'" class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>
                <svg v-if="item.icon === 'zap'" class="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 11-12h-9z"/></svg>
              </div>
              <h3 class="font-semibold text-slate-800">{{ item.title }}</h3>
              <p class="text-sm text-slate-500">{{ item.desc }}</p>
            </div>
          </div>

          <!-- Action Box -->
          <div class="bg-white rounded-3xl p-8 shadow-2xl shadow-slate-200/80 space-y-8">
            <div class="space-y-4">
              <div class="flex items-baseline justify-between">
                <div class="space-y-1">
                  <div class="text-sm text-slate-500">價格</div>
                  <div class="flex items-baseline gap-3">
                    <span class="text-4xl font-bold tracking-tight text-indigo-600">{{ discountedPriceTWD }}</span>
                    <span v-if="isDiscountActive" class="text-xl font-medium text-slate-400 line-through">{{ priceTWD }}</span>
                  </div>
                </div>
                <div v-if="isDiscountActive" class="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full text-sm">-{{ product.promotions.discountPercent }}%</div>
              </div>
              <div v-if="isDiscountActive" class="flex items-center gap-2 text-sm text-red-600 font-semibold">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>限時優惠，僅剩 {{ discountDaysLeft }} 天！</span>
              </div>
            </div>

            <div class="space-y-2">
              <div v-if="product.promotions.coupon" class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">優惠券</span>
                <span class="font-semibold text-slate-700 text-sm">{{ product.promotions.coupon }}</span>
              </div>
              <div v-if="product.promotions.installment" class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">分期</span>
                <span class="font-semibold text-slate-700 text-sm">{{ product.promotions.installment }}</span>
              </div>
            </div>

            <div class="space-y-5">
              <div>
                <label class="block text-base font-bold text-slate-800 mb-3">顏色</label>
                <div class="flex flex-wrap gap-3">
                  <button v-for="(slide, idx) in gallerySlides" :key="slide.id" @click="selectColor(slide.label)" :disabled="!isColorAvailable(slide.label)" class="w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center" :class="[selected.color === slide.label ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent', !isColorAvailable(slide.label) && 'opacity-40 cursor-not-allowed']">
                    <span :class="slide.swatch" class="w-8 h-8 rounded-full shadow-inner border border-slate-200/50"></span>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-base font-bold text-slate-800 mb-3">尺寸</label>
                <div class="grid grid-cols-4 gap-3">
                  <button v-for="s in product.variants.size" :key="s" @click="selected.size = s" :disabled="!isSizeAvailable(s)" class="px-3 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 shadow-sm" :class="[s === selected.size ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300', !isSizeAvailable(s) && 'opacity-40 cursor-not-allowed line-through']">{{ s }}</button>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-6">
              <div class="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button @click="qty = Math.max(1, qty - 1)" :disabled="qty <= 1" class="w-12 h-12 grid place-items-center text-slate-700 text-xl hover:bg-slate-50 disabled:opacity-40 transition-colors">-</button>
                <input v-model.number="qty" type="number" min="1" :max="currentSkuStock" class="w-14 text-center text-lg font-bold outline-none text-slate-800" />
                <button @click="qty = Math.min(currentSkuStock, qty + 1)" :disabled="qty >= currentSkuStock" class="w-12 h-12 grid place-items-center text-slate-700 text-xl hover:bg-slate-50 disabled:opacity-40 transition-colors">+</button>
              </div>
              <button :disabled="!canAddToCart" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl shadow-indigo-400/50 hover:shadow-indigo-400/80 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg disabled:transform-none">
                {{ canAddToCart ? '加入購物車' : '已售完' }}
              </button>
            </div>
          </div>

          <!-- Details Tabs -->
          <div class="pt-8">
            <div class="flex border-b border-slate-200">
              <button @click="activeTab = 'description'" class="px-6 py-3 font-semibold transition-colors" :class="activeTab === 'description' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-800'">商品描述</button>
              <button @click="activeTab = 'specs'" class="px-6 py-3 font-semibold transition-colors" :class="activeTab === 'specs' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-800'">詳細規格</button>
              <button @click="activeTab = 'shipping'" class="px-6 py-3 font-semibold transition-colors" :class="activeTab === 'shipping' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-800'">運送 & 政策</button>
            </div>
            <div class="py-8">
              <div v-if="activeTab === 'description'" class="prose prose-slate max-w-none" v-html="product.descriptionDelta.ops.map(op => op.insert).join('\n').replace(/\n/g, '<br>')"></div>
              <div v-if="activeTab === 'specs'" class="grid grid-cols-2 gap-x-8 gap-y-4">
                <div v-for="(v, k) in product.specs" :key="k" class="border-b border-slate-200/80 py-2 flex justify-between text-sm">
                  <span class="text-slate-500">{{ k }}</span>
                  <span class="font-semibold text-slate-800">{{ v }}</span>
                </div>
              </div>
              <div v-if="activeTab === 'shipping'" class="text-sm text-slate-600 space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <h4 class="font-semibold text-slate-800 mb-1">運送資訊</h4>
                      <p>滿 {{ formatPrice(product.shipping.freeThreshold) }} 免運</p>
                      <p>運費: {{ formatPrice(product.shipping.fee) }}</p>
                      <p>出貨地: {{ product.shipping.shipFrom }}</p>
                    </div>
                    <div>
                      <h4 class="font-semibold text-slate-800 mb-1">售後政策</h4>
                      <p>退貨: {{ product.policies.return }}</p>
                      <p>保固: {{ product.policies.warranty }}</p>
                    </div>
                  </div>
                  <div>
                    <h4 class="font-semibold text-slate-800 mb-1">平台保障</h4>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="g in product.guarantees" :key="g" class="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-medium">{{ g }}</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.prose {
  color: #475569;
}
.prose h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}
.prose h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
}
.prose p, .prose ul, .prose ol {
  margin-bottom: 1rem;
}
.prose strong {
  color: #0f172a;
}
</style>