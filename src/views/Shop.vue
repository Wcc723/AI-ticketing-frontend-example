<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const loading = ref(true)
const product = ref(null)
const selected = ref({ color: '', size: '' })
const qty = ref(1)
const activeTab = ref('desc')
const activeImage = ref(0)

const dateFormatter = new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' })

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
const discountStart = computed(() => {
  if (!product.value?.promotions?.discountStartDate) return null
  return new Date(`${product.value.promotions.discountStartDate}T00:00:00`)
})
const discountEnd = computed(() => {
  if (!product.value?.promotions?.discountEndDate) return null
  return new Date(`${product.value.promotions.discountEndDate}T23:59:59`)
})
const isDiscountActive = computed(() => {
  if (!hasDiscount.value) return false
  const now = new Date()
  if (discountStart.value && now < discountStart.value) return false
  if (discountEnd.value && now > discountEnd.value) return false
  return true
})
const showDiscountPricing = computed(() => hasDiscount.value && isDiscountActive.value)

const discounted = computed(() => {
  if (!product.value) return 0
  if (!showDiscountPricing.value) return product.value.price
  const d = product.value.promotions.discountPercent || 0
  return Math.round(product.value.price * (100 - d)) / 100
})
const discountedTWD = computed(() =>
  product.value ? new Intl.NumberFormat('zh-TW', { style: 'currency', currency: product.value.currency || 'TWD' }).format(discounted.value) : ''
)

const discountPeriod = computed(() => {
  if (!hasDiscount.value || !discountStart.value || !discountEnd.value) return ''
  return `${dateFormatter.format(discountStart.value)} - ${dateFormatter.format(discountEnd.value)}`
})

const discountDaysLeft = computed(() => {
  if (!discountEnd.value) return null
  const now = new Date()
  const diff = discountEnd.value.getTime() - now.getTime()
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const discountStatus = computed(() => {
  if (!hasDiscount.value) return ''
  const now = new Date()
  if (discountStart.value && now < discountStart.value) {
    return `${dateFormatter.format(discountStart.value)} 開始`
  }
  if (!isDiscountActive.value) return '優惠已結束'
  if (discountDaysLeft.value === 0) return '今日截止'
  if (discountDaysLeft.value != null) return `剩 ${discountDaysLeft.value} 天`
  return '限時優惠'
})

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

const totalStock = computed(() =>
  product.value?.inventory?.reduce((sum, item) => sum + (item.stock || 0), 0) ?? 0
)

const gradientPalette = [
  { from: 'from-rose-200', to: 'to-pink-100', emoji: '👟' },
  { from: 'from-sky-200', to: 'to-indigo-100', emoji: '🌈' },
  { from: 'from-amber-200', to: 'to-orange-100', emoji: '⚡️' },
  { from: 'from-emerald-200', to: 'to-teal-100', emoji: '🌿' },
  { from: 'from-purple-200', to: 'to-fuchsia-100', emoji: '✨' }
]

const gallerySlides = computed(() => {
  if (!product.value) return []
  const colors = product.value.variants?.color || []
  const slides = colors.map((color, idx) => {
    const palette = gradientPalette[idx % gradientPalette.length]
    return {
      id: `${color}-${idx}`,
      label: color,
      color,
      from: palette.from,
      to: palette.to,
      emoji: palette.emoji
    }
  })
  if (slides.length) return slides
  const palette = gradientPalette[0]
  return [
    {
      id: 'default',
      label: product.value.name || '商品',
      color: '',
      from: palette.from,
      to: palette.to,
      emoji: palette.emoji
    }
  ]
})

const currentSlide = computed(() => gallerySlides.value[activeImage.value] || null)

const featureHighlights = computed(() => {
  if (!product.value) return []
  const specs = product.value.specs || {}
  return [
    {
      icon: 'feather',
      title: '輕盈透氣鞋面',
      description: specs['鞋面']
        ? `鞋面：${specs['鞋面']}`
        : '透氣結構讓足部保持乾爽舒適。'
    },
    {
      icon: 'energy',
      title: '回彈動力中底',
      description: specs['中底']
        ? `${specs['中底']} ・ ${specs['落差'] || '自然腳感'}`
        : 'EVA 發泡結合回彈核心，提供動能支撐。'
    },
    {
      icon: 'shield',
      title: '穩固抓地大底',
      description: specs['大底']
        ? specs['大底']
        : '耐磨橡膠搭配多向紋路，穩定每一步。'
    }
  ]
})

const shippingHighlights = computed(() => {
  if (!product.value?.shipping) return []
  const ship = product.value.shipping
  return [
    { icon: 'truck', label: '免運門檻', value: `滿 ${ship.freeThreshold} 免運` },
    { icon: 'coin', label: '運費', value: `未滿加收 ${ship.fee}` },
    { icon: 'location', label: '出貨地', value: ship.shipFrom },
    { icon: 'calendar', label: '到貨', value: ship.etaDays }
  ]
})

const policyHighlights = computed(() => {
  if (!product.value?.policies) return []
  return [
    { label: '退貨', value: product.value.policies.return || '—' },
    { label: '保固', value: product.value.policies.warranty || '—' }
  ]
})

const canAddToCart = computed(() => skuStock.value > 0)
const canIncrease = computed(() => qty.value < skuStock.value)
const canDecrease = computed(() => qty.value > 1)

const selectSlide = (index) => {
  if (index < 0 || index >= gallerySlides.value.length) return
  activeImage.value = index
  const slide = gallerySlides.value[index]
  if (slide?.color && slide.color !== selected.value.color) {
    if (product.value?.variants?.color?.includes(slide.color) && isColorAvailable(slide.color)) {
      selected.value.color = slide.color
    }
  }
}

// 簡易 Quill Delta 轉 HTML（僅處理粗體、標題與段落）
function renderDelta(delta) {
  if (!delta?.ops) return ''
  const segments = []
  let paragraph = ''

  const flushParagraph = () => {
    const trimmed = paragraph.trim()
    if (trimmed) segments.push(`<p class="mb-4 leading-relaxed">${trimmed}</p>`)
    paragraph = ''
  }

  const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  for (const op of delta.ops) {
    const rawText = escape(op.insert || '')
    const attrs = op.attributes || {}

    if (attrs.header === 2 || attrs.header === 3) {
      flushParagraph()
      const level = attrs.header === 2 ? 'h2' : 'h3'
      const cls = attrs.header === 2
        ? 'text-xl font-semibold text-gray-900 mb-3 mt-6 first:mt-0'
        : 'text-lg font-semibold text-gray-900 mb-2 mt-5'
      const headingText = rawText.replace(/\n/g, '')
      segments.push(`<${level} class="${cls}">${headingText}</${level}>`)
      continue
    }

    const parts = rawText.split('\n')
    parts.forEach((part, idx) => {
      if (part) {
        const content = attrs.bold
          ? `<strong class="font-semibold text-gray-900">${part}</strong>`
          : part
        paragraph += content
      }
      if (idx < parts.length - 1) {
        flushParagraph()
      }
    })
  }

  flushParagraph()
  return segments.join('')
}

watch(gallerySlides, (slides) => {
  if (!slides.length) {
    activeImage.value = 0
    return
  }
  if (activeImage.value >= slides.length) {
    activeImage.value = 0
  }
  const idx = slides.findIndex(slide => slide.color === selected.value.color)
  if (idx >= 0) {
    activeImage.value = idx
  }
})

watch(() => selected.value.color, (color) => {
  if (!product.value) return
  const availableSizes = product.value.variants.size.filter((size) => (stockMap.value[color]?.[size] ?? 0) > 0)
  if (!availableSizes.includes(selected.value.size)) {
    selected.value.size = availableSizes[0] ?? ''
  }
  qty.value = 1
  const slides = gallerySlides.value
  const idx = slides.findIndex(slide => slide.color === color)
  if (idx >= 0) {
    activeImage.value = idx
  }
})

watch(skuStock, (stock) => {
  if (stock <= 0) {
    qty.value = 1
    return
  }
  if (qty.value > stock) {
    qty.value = stock
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50">
    <div class="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10 space-y-10">
      <nav class="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol class="flex items-center gap-2">
          <li><router-link class="hover:text-rose-600 transition" to="/menu">選單</router-link></li>
          <li>/</li>
          <li v-if="!loading && product" class="text-gray-700">{{ product.category }}</li>
          <li v-if="!loading && product">/</li>
          <li v-if="!loading && product" class="text-gray-900 font-medium">{{ product.name }}</li>
        </ol>
      </nav>
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="flex flex-col items-center space-y-4">
          <div class="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin"></div>
          <p class="text-gray-500 text-sm">載入中...</p>
        </div>
      </div>
      <div v-else class="space-y-12">
        <section class="grid lg:grid-cols-5 gap-10">
          <div class="lg:col-span-3 space-y-5">
            <div class="relative aspect-square overflow-hidden rounded-3xl bg-white/70 shadow-xl ring-1 ring-rose-100">
              <div
                v-if="currentSlide"
                :class="`absolute inset-0 bg-gradient-to-br ${currentSlide.from} ${currentSlide.to}`"
              ></div>
              <div v-else class="absolute inset-0 bg-gray-100"></div>
              <div class="relative flex h-full items-center justify-center select-none">
                <span class="text-7xl sm:text-8xl drop-shadow-sm">{{ currentSlide?.emoji || '👟' }}</span>
              </div>
            </div>
            <div class="grid grid-cols-4 sm:grid-cols-5 gap-3">
              <button
                v-for="(slide, idx) in gallerySlides"
                :key="slide.id"
                class="group relative aspect-square overflow-hidden rounded-2xl border transition transform hover:-translate-y-0.5"
                :class="idx === activeImage ? 'border-rose-500 ring-2 ring-rose-200 shadow-lg' : 'border-transparent shadow-sm hover:shadow-md'"
                type="button"
                @click="selectSlide(idx)"
              >
                <div :class="`absolute inset-0 bg-gradient-to-br ${slide.from} ${slide.to}`"></div>
                <div class="relative flex h-full items-center justify-center text-2xl">
                  <span>{{ slide.emoji }}</span>
                </div>
                <span class="absolute bottom-2 left-2 right-2 rounded-full bg-black/30 px-2 py-1 text-[11px] font-medium text-white tracking-wide text-center">
                  {{ slide.label }}
                </span>
              </button>
            </div>
            <div class="grid gap-4 md:grid-cols-3">
              <div
                v-for="highlight in featureHighlights"
                :key="highlight.title"
                class="rounded-2xl bg-white/85 backdrop-blur shadow-sm ring-1 ring-gray-100 p-5 flex gap-3"
              >
                <div
                  class="w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-lg"
                  :class="highlight.icon === 'feather' ? 'bg-gradient-to-br from-sky-500 to-sky-600' : highlight.icon === 'energy' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'"
                >
                  <svg
                    v-if="highlight.icon === 'feather'"
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.248 5.248a4.5 4.5 0 00-6.364 0l-9.9 9.9a3 3 0 004.243 4.243l4.243-4.243m0 0l3.182-3.182a3 3 0 00-4.243-4.243L7.1 11.293" />
                  </svg>
                  <svg
                    v-else-if="highlight.icon === 'energy'"
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7z" />
                  </svg>
                  <svg
                    v-else
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6l7 4-7 4-7-4 7-4zm0 0V4m0 6v10m7-6v2a2 2 0 01-1 1.732l-6 3.464a2 2 0 01-2 0l-6-3.464A2 2 0 014 12v-2" />
                  </svg>
                </div>
                <div class="space-y-1">
                  <p class="font-semibold text-gray-900">{{ highlight.title }}</p>
                  <p class="text-sm text-gray-600 leading-relaxed">{{ highlight.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <aside class="lg:col-span-2 space-y-6 lg:pt-2">
            <div class="rounded-3xl bg-white/85 backdrop-blur shadow-lg ring-1 ring-gray-100 p-6 space-y-4">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-2">
                  <div class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-rose-500">
                    <span>{{ product.brand }}</span>
                    <span class="w-1 h-1 rounded-full bg-rose-300"></span>
                    <span>{{ product.category }}</span>
                  </div>
                  <h1 class="text-2xl font-bold text-gray-900 leading-snug">{{ product.name }}</h1>
                </div>
                <button class="p-2 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition" type="button" aria-label="收藏商品">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5a4.72 4.72 0 00-3.527 1.61A4.72 4.72 0 009.258 3.75C6.67 3.75 4.57 5.765 4.57 8.25c0 7.22 7.742 11.25 7.742 11.25s7.742-4.03 7.742-11.25z" />
                  </svg>
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div class="flex items-center gap-1 text-amber-500">
                  <span v-for="i in 5" :key="`rating-star-${i}`" class="inline-flex">
                    <span v-if="i <= Math.round(product.rating)">★</span>
                    <span v-else class="text-gray-300">★</span>
                  </span>
                </div>
                <span class="text-gray-700 font-medium">{{ product.rating }}</span>
                <span class="text-gray-500">({{ product.reviewsCount }} 則評論)</span>
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  本月熱銷
                </span>
                <span v-if="product.promotions?.coupon" class="px-2 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-medium">
                  {{ product.promotions.coupon }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span v-if="showDiscountPricing" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500 text-white font-medium shadow-sm">
                  限時 {{ discountedTWD }}
                </span>
                <span v-if="discountStatus" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-rose-600 font-medium shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ discountStatus }}
                </span>
                <span v-if="discountPeriod" class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-gray-600 shadow-sm">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h8m-9 4h10m-6 4h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0H8a2 2 0 00-2 2v12a2 2 0 002 2h2" />
                  </svg>
                  {{ discountPeriod }}
                </span>
              </div>
              <div v-if="product.tags?.length" class="flex flex-wrap gap-2 pt-1">
                <span
                  v-for="tag in product.tags"
                  :key="tag"
                  class="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
                >#{{ tag }}</span>
              </div>
            </div>
            <div class="sticky top-24 space-y-6">
              <div class="rounded-3xl bg-white/90 backdrop-blur shadow-xl ring-1 ring-rose-100 p-6 space-y-6">
                <div class="space-y-2">
                  <div class="flex items-end gap-3">
                    <span class="text-4xl font-bold text-rose-600">{{ discountedTWD }}</span>
                    <span v-if="showDiscountPricing" class="text-lg text-gray-400 line-through">{{ priceTWD }}</span>
                  </div>
                  <div class="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span v-if="product.promotions?.installment" class="px-2 py-1 rounded bg-white/80 shadow-sm">{{ product.promotions.installment }}</span>
                    <span class="px-2 py-1 rounded bg-white/80 shadow-sm">現貨 {{ totalStock }}</span>
                  </div>
                </div>
                <div class="grid gap-4 text-sm">
                  <div>
                    <div class="flex items-center justify-between text-gray-600 font-medium">
                      <span>顏色</span>
                      <span v-if="selected.color" class="text-xs text-gray-500">已選 {{ selected.color }}</span>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <button
                        v-for="c in product.variants.color"
                        :key="c"
                        class="px-3 py-1.5 rounded-full border text-sm transition shadow-sm"
                        :disabled="!isColorAvailable(c)"
                        :class="[
                          c === selected.color ? 'border-rose-500 bg-rose-50 text-rose-700 shadow' : 'border-gray-200 bg-white hover:border-rose-200',
                          !isColorAvailable(c) && 'opacity-40 cursor-not-allowed line-through'
                        ]"
                        @click="isColorAvailable(c) && (selected.color = c)"
                      >{{ c }}</button>
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between text-gray-600 font-medium">
                      <span>尺寸</span>
                      <span v-if="selected.size" class="text-xs text-gray-500">已選 {{ selected.size }}</span>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <button
                        v-for="s in product.variants.size"
                        :key="s"
                        class="px-3 py-1.5 rounded-full border text-sm transition shadow-sm"
                        :disabled="!isSizeAvailable(s)"
                        :class="[
                          s === selected.size ? 'border-rose-500 bg-rose-50 text-rose-700 shadow' : 'border-gray-200 bg-white hover:border-rose-200',
                          !isSizeAvailable(s) && 'opacity-40 cursor-not-allowed line-through'
                        ]"
                        @click="isSizeAvailable(s) && (selected.size = s)"
                      >{{ s }}</button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-gray-600">
                    <span>庫存狀態</span>
                    <span
                      class="px-2 py-0.5 rounded-full ring-1 text-xs"
                      :class="skuStock > 0 ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-50 text-gray-500 ring-gray-200'"
                    >{{ skuStock > 0 ? '現貨 ' + skuStock : '缺貨' }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-gray-600">購買數量</span>
                    <div class="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <button class="w-10 h-10 grid place-items-center text-gray-700 hover:bg-gray-50 disabled:opacity-30" :disabled="!canDecrease" @click="qty = Math.max(1, qty - 1)">−</button>
                      <input class="w-12 text-center outline-none text-gray-700" type="number" min="1" :max="skuStock" v-model.number="qty" />
                      <button class="w-10 h-10 grid place-items-center text-gray-700 hover:bg-gray-50 disabled:opacity-30" :disabled="!canIncrease" @click="qty = Math.min(skuStock, qty + 1)">＋</button>
                    </div>
                  </div>
                </div>
                <div class="space-y-3">
                  <button
                    class="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium py-4 rounded-2xl shadow-lg hover:shadow-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
                    :disabled="!canAddToCart"
                  >
                    加入購物車
                  </button>
                  <button class="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition">
                    立即購買
                  </button>
                </div>
              </div>
              <div class="rounded-3xl bg-white/80 backdrop-blur shadow-lg ring-1 ring-gray-100 p-6 space-y-4">
                <h3 class="text-sm font-semibold text-gray-900">出貨與保障</h3>
                <div class="grid gap-3 sm:grid-cols-2 text-sm">
                  <div
                    v-for="item in shippingHighlights"
                    :key="item.label"
                    class="flex items-start gap-3"
                  >
                    <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                      <svg v-if="item.icon === 'truck'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16V7a2 2 0 012-2h9v11m0 0a2 2 0 104 0m-4 0a2 2 0 11-4 0m8 0h1a2 2 0 002-2v-3.5a1 1 0 00-.293-.707l-2-2A1 1 0 0018.586 7H14" />
                      </svg>
                      <svg v-else-if="item.icon === 'coin'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 8h4a2 2 0 010 4h-2a2 2 0 000 4h4" />
                      </svg>
                      <svg v-else-if="item.icon === 'location'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-6-4.686-6-10a6 6 0 1112 0c0 5.314-6 10-6 10z" />
                        <circle cx="12" cy="11" r="2" />
                      </svg>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10m-9 4h8m-9 4h10m-6 4h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0H8a2 2 0 00-2 2v12a2 2 0 002 2h2" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 uppercase tracking-wide">{{ item.label }}</p>
                      <p class="text-sm text-gray-700 font-medium mt-0.5">{{ item.value }}</p>
                    </div>
                  </div>
                </div>
                <div class="grid gap-2 text-sm border-t border-dashed border-gray-200 pt-4">
                  <div
                    v-for="policy in policyHighlights"
                    :key="policy.label"
                    class="flex items-center justify-between text-gray-600"
                  >
                    <span class="text-xs text-gray-500 uppercase tracking-wide">{{ policy.label }}</span>
                    <span class="text-sm text-gray-700">{{ policy.value }}</span>
                  </div>
                </div>
                <div v-if="product.guarantees?.length" class="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  <span
                    v-for="g in product.guarantees"
                    :key="g"
                    class="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium ring-1 ring-rose-100"
                  >{{ g }}</span>
                </div>
              </div>
              <div class="rounded-3xl bg-slate-900 text-white p-6 shadow-xl">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm uppercase tracking-wide text-white/60">賣家資訊</p>
                    <p class="text-xl font-semibold mt-2">{{ product.seller?.name || '官方賣場' }}</p>
                    <p class="text-sm text-white/70 mt-1">
                      評分 {{ product.seller?.rating || '—' }} ・ 追蹤 {{ product.seller?.followers?.toLocaleString?.() || '—' }}
                    </p>
                    <p v-if="product.seller?.shipSpeed" class="text-sm text-white/70 mt-1">{{ product.seller.shipSpeed }}</p>
                  </div>
                  <button class="px-3 py-1.5 text-sm rounded-full bg-white/10 hover:bg-white/20 transition">追蹤</button>
                </div>
                <button class="mt-5 w-full bg-white text-slate-900 font-medium py-3 rounded-2xl hover:bg-rose-100 transition">
                  進入賣場
                </button>
              </div>
            </div>
          </aside>
        </section>
        <section class="rounded-3xl bg-white/85 backdrop-blur shadow-xl ring-1 ring-gray-100">
          <div class="px-6 pt-6">
            <div class="flex flex-wrap gap-3 text-sm">
              <button
                class="px-4 py-2 rounded-full font-medium transition"
                :class="activeTab==='desc' ? 'bg-rose-600 text-white shadow' : 'bg-white/80 text-gray-600 hover:bg-white'"
                @click="activeTab='desc'"
              >商品描述</button>
              <button
                class="px-4 py-2 rounded-full font-medium transition"
                :class="activeTab==='specs' ? 'bg-rose-600 text-white shadow' : 'bg-white/80 text-gray-600 hover:bg-white'"
                @click="activeTab='specs'"
              >商品規格</button>
              <button
                class="px-4 py-2 rounded-full font-medium transition"
                :class="activeTab==='policy' ? 'bg-rose-600 text-white shadow' : 'bg-white/80 text-gray-600 hover:bg-white'"
                @click="activeTab='policy'"
              >購買須知</button>
            </div>
          </div>
          <div class="px-6 pb-8 pt-4">
            <div v-show="activeTab==='desc'" class="prose prose-sm max-w-none text-gray-800 leading-relaxed" v-html="renderDelta(product.descriptionDelta)"></div>
            <div v-show="activeTab==='specs'" class="grid gap-4 sm:grid-cols-2 mt-2">
              <div
                v-for="(v, k) in product.specs"
                :key="k"
                class="rounded-2xl bg-white/70 border border-gray-100 px-4 py-3 flex items-center justify-between text-sm"
              >
                <span class="text-gray-500">{{ k }}</span>
                <span class="text-gray-800 font-medium text-right">{{ v }}</span>
              </div>
            </div>
            <div v-show="activeTab==='policy'" class="grid gap-4 md:grid-cols-2 mt-2 text-sm">
              <div class="rounded-2xl bg-white/70 border border-gray-100 p-5 space-y-2">
                <h3 class="text-base font-semibold text-gray-900">運送資訊</h3>
                <p class="text-gray-700">滿 {{ product.shipping.freeThreshold }} 免運，未滿需付 {{ product.shipping.fee }} 運費。</p>
                <p class="text-gray-700">出貨地：{{ product.shipping.shipFrom }}，預計到貨 {{ product.shipping.etaDays }}。</p>
              </div>
              <div class="rounded-2xl bg-white/70 border border-gray-100 p-5 space-y-2">
                <h3 class="text-base font-semibold text-gray-900">售後與保固</h3>
                <p class="text-gray-700">退貨：{{ product.policies.return }}</p>
                <p class="text-gray-700">保固：{{ product.policies.warranty }}</p>
              </div>
              <div class="md:col-span-2 rounded-2xl bg-white/70 border border-gray-100 p-5">
                <p class="text-sm text-gray-600 mb-2">平台保障</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="g in product.guarantees || []"
                    :key="g"
                    class="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium ring-1 ring-rose-100"
                  >{{ g }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose h2 {
  margin-top: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.prose h3 {
  margin-top: 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2937;
}

.prose p {
  margin-bottom: 0.75rem;
}
</style>
