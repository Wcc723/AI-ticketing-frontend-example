<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const product = ref(null)
const selected = ref({ color: '' })
const selectedTags = ref([])

async function load() {
  const res = await fetch('/data/womens-sneakers.json')
  product.value = await res.json()
  // 預設選第一個變體
  selected.value.color = product.value?.variants?.color?.[0] ?? ''
  loading.value = false
}

onMounted(load)

const priceTWD = computed(() =>
  product.value ? new Intl.NumberFormat('zh-TW', { style: 'currency', currency: product.value.currency || 'TWD' }).format(product.value.price) : ''
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

const skuStock = computed(() => {
  const bySize = stockMap.value[selected.value.color] || {}
  return Object.values(bySize).reduce((total, stock) => total + stock, 0)
})

const canAddToCart = computed(() => skuStock.value > 0)

// 折扣相關計算
const hasDiscount = computed(() => !!product.value?.promotions?.discountPercent)
const discountedPrice = computed(() => {
  if (!product.value || !hasDiscount.value) return product.value?.price || 0
  const discount = product.value.promotions.discountPercent
  return Math.round(product.value.price * (100 - discount)) / 100
})
const discountedPriceTWD = computed(() =>
  product.value ? new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: product.value.currency || 'TWD'
  }).format(discountedPrice.value) : ''
)

// 折扣期限
const discountEndDate = computed(() => {
  if (!product.value?.promotions?.discountEndDate) return null
  return new Date(product.value.promotions.discountEndDate)
})

const discountDaysLeft = computed(() => {
  if (!discountEndDate.value) return 0
  const now = new Date()
  const timeDiff = discountEndDate.value.getTime() - now.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
})

const formatDiscountPeriod = computed(() => {
  if (!product.value?.promotions) return ''
  const start = new Date(product.value.promotions.discountStartDate)
  const end = new Date(product.value.promotions.discountEndDate)
  const startStr = `${start.getMonth() + 1}/${start.getDate()}`
  const endStr = `${end.getMonth() + 1}/${end.getDate()}`
  return `${startStr} - ${endStr}`
})

// 簡易 Quill Delta 轉 HTML（僅處理粗體、標題與段落）
function renderDelta(delta) {
  if (!delta?.ops) return ''
  let html = ''
  for (const op of delta.ops) {
    const text = (op.insert || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const attrs = op.attributes || {}
    if (attrs.header === 2) {
      html += `<h2 class="text-xl font-bold mb-4 text-gray-900 mt-6 first:mt-0">${text}</h2>`
    } else if (attrs.header === 3) {
      html += `<h3 class="text-lg font-semibold mb-3 text-gray-900 mt-5">${text}</h3>`
    } else if (attrs.bold) {
      html += `<strong class="font-semibold text-gray-900">${text}</strong>`
    } else if (text === '\n') {
      html += '<br />'
    } else {
      html += text
    }
  }
  return html
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
    <!-- Navigation Bar -->
    <nav class="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo and brand -->
          <div class="flex items-center space-x-8">
            <router-link to="/menu" class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">A</span>
              </div>
              <span class="text-xl font-bold text-gray-900">AthleX</span>
            </router-link>

            <!-- Breadcrumb -->
            <nav class="hidden md:flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm text-gray-500">
                <li><router-link to="/menu" class="hover:text-rose-600 transition-colors">選單</router-link></li>
                <li><span class="text-gray-300">/</span></li>
                <li v-if="product" class="text-gray-700">{{ product.category }}</li>
                <li v-if="product"><span class="text-gray-300">/</span></li>
                <li v-if="product" class="text-gray-900 font-medium truncate max-w-48">{{ product.name }}</li>
              </ol>
            </nav>
          </div>

          <!-- Right side actions -->
          <div class="flex items-center space-x-4">
            <!-- Search -->
            <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>

            <!-- Wishlist -->
            <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>

            <!-- Cart -->
            <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L5.4 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"></path>
              </svg>
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
            </button>

            <!-- User menu -->
            <div class="flex items-center space-x-2">
              <button class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex items-center justify-center min-h-96">
        <div class="flex flex-col items-center space-y-4">
          <div class="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
          <p class="text-gray-500 text-sm">載入中...</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Gallery Section - Enhanced with better shadows and spacing -->
        <section class="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div class="relative group">
            <div class="aspect-square w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-500">
              <div class="text-center">
                <div class="text-4xl mb-2">👟</div>
                <p class="text-sm font-medium">{{ product.name }}</p>
                <p class="text-xs text-gray-400 mt-1">主要產品圖片</p>
              </div>
            </div>
            <!-- Zoom indicator -->
            <div class="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
              </svg>
            </div>
          </div>

          <!-- Thumbnail grid with improved styling -->
          <div class="grid grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i"
                 class="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-rose-200"
                 :class="i === 1 ? 'border-rose-300 ring-1 ring-rose-200' : 'border-transparent'">
              <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                圖 {{ i }}
              </div>
            </div>
          </div>
        </section>

        <!-- Product Info Section - Completely redesigned -->
        <section class="space-y-8">
          <!-- Header with better typography -->
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <div class="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{{ product.brand }}</span>
                  <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{{ product.category }}</span>
                </div>
                <h1 class="text-3xl font-bold text-gray-900 leading-tight">
                  {{ product.name }}
                </h1>
              </div>
              <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg class="w-6 h-6 text-gray-400 hover:text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </button>
            </div>

            <!-- Price and Rating with enhanced design -->
            <div class="space-y-3">
              <!-- Pricing -->
              <div class="flex items-baseline space-x-3">
                <template v-if="hasDiscount">
                  <span class="text-3xl font-bold text-rose-600">{{ discountedPriceTWD }}</span>
                  <span class="text-lg text-gray-400 line-through">{{ priceTWD }}</span>
                  <span class="px-2 py-1 bg-rose-500 text-white text-sm font-medium rounded-full">
                    -{{ product.promotions.discountPercent }}%
                  </span>
                </template>
                <template v-else>
                  <span class="text-3xl font-bold text-gray-900">{{ priceTWD }}</span>
                </template>
              </div>

              <!-- Discount Period -->
              <div v-if="hasDiscount && formatDiscountPeriod" class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm text-rose-600 font-medium">
                  限時優惠 {{ formatDiscountPeriod }}
                  <span v-if="discountDaysLeft > 0" class="text-rose-700">
                    (剩餘 {{ discountDaysLeft }} 天)
                  </span>
                </span>
              </div>

              <!-- Rating -->
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <div class="flex items-center">
                    <span v-for="i in 5" :key="i" class="text-amber-400">
                      <svg v-if="i <= Math.round(product.rating)" class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <svg v-else class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </span>
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ product.rating }}</span>
                  <span class="text-sm text-gray-500">({{ product.reviewsCount }} 評價)</span>
                </div>
              </div>
            </div>

            <!-- Status badge -->
            <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
              <div class="w-2 h-2 bg-rose-400 rounded-full mr-2 animate-pulse"></div>
              本月熱銷商品
            </div>
          </div>

          <!-- Selection Options with modern card design -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <!-- Color Selection -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-900">顏色</label>
                <span class="text-xs text-gray-500">已選擇: {{ selected.color }}</span>
              </div>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="c in product.variants.color"
                  :key="c"
                  class="relative px-4 py-2 rounded-xl border-2 transition-all duration-200 text-sm font-medium"
                  :disabled="!isColorAvailable(c)"
                  :class="[
                    c === selected.color
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50',
                    !isColorAvailable(c) && 'opacity-40 cursor-not-allowed'
                  ]"
                  @click="isColorAvailable(c) && (selected.color = c)"
                >
                  {{ c }}
                  <div v-if="c === selected.color" class="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white"></div>
                </button>
              </div>
            </div>


            <!-- Stock Status -->
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span class="text-sm text-gray-600">庫存狀態</span>
              <div class="flex items-center space-x-2">
                <div class="flex items-center space-x-1">
                  <div :class="skuStock > 0 ? 'w-2 h-2 bg-emerald-400 rounded-full' : 'w-2 h-2 bg-gray-400 rounded-full'"></div>
                  <span class="text-sm font-medium" :class="skuStock > 0 ? 'text-emerald-700' : 'text-gray-500'">
                    {{ skuStock > 0 ? `現貨 ${skuStock} 件` : '暫時缺貨' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Subtly displayed tags - much less prominent -->
          <div class="space-y-2">
            <label class="text-xs text-gray-400 uppercase tracking-wide">特色標籤</label>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in product.tags"
                :key="tag"
                class="inline-flex items-center px-2 py-0.5 rounded-md text-xs text-gray-500 bg-gray-50 border border-gray-100"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Action Buttons with enhanced design -->
          <div class="space-y-3">
            <button
              class="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:pointer-events-none"
              :disabled="!canAddToCart"
            >
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L5.4 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6"></path>
                </svg>
                <span>加入購物車</span>
              </div>
            </button>

            <div class="grid grid-cols-2 gap-3">
              <button class="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span class="text-sm font-medium">收藏</span>
              </button>
              <button class="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                </svg>
                <span class="text-sm font-medium">分享</span>
              </button>
            </div>
          </div>

          <!-- Product Details in collapsible sections -->
          <div class="space-y-4">
            <!-- Product Highlights -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg class="w-5 h-5 text-rose-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                產品亮點
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">超輕量設計</h4>
                    <p class="text-sm text-gray-600 mt-1">僅約 210g 重量，讓每一步都更輕盈自在</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">透氣舒適</h4>
                    <p class="text-sm text-gray-600 mt-1">工程網布鞋面，即使長時間運動也保持乾爽</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">彈性回饋</h4>
                    <p class="text-sm text-gray-600 mt-1">EVA 發泡中底配合回彈核心，提供優異推進力</p>
                  </div>
                </div>

                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">防滑耐磨</h4>
                    <p class="text-sm text-gray-600 mt-1">橡膠大底配專業抓地紋路，濕滑路面也穩定</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Suitable Activities -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 text-rose-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                適用場景
              </h3>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl mb-2">🏃‍♀️</div>
                  <p class="text-sm font-medium text-gray-800">慢跑運動</p>
                </div>
                <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl mb-2">💪</div>
                  <p class="text-sm font-medium text-gray-800">健身房訓練</p>
                </div>
                <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl mb-2">🧘‍♀️</div>
                  <p class="text-sm font-medium text-gray-800">有氧課程</p>
                </div>
                <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl mb-2">🚶‍♀️</div>
                  <p class="text-sm font-medium text-gray-800">日常通勤</p>
                </div>
                <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl mb-2">🏃‍♀️</div>
                  <p class="text-sm font-medium text-gray-800">間歇訓練</p>
                </div>
                <div class="text-center p-3 bg-white rounded-lg shadow-sm">
                  <div class="text-2xl mb-2">👟</div>
                  <p class="text-sm font-medium text-gray-800">休閒穿搭</p>
                </div>
              </div>
            </div>

            <!-- Care Instructions -->
            <div class="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 class="font-medium text-amber-900 mb-2 flex items-center">
                <svg class="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                保養小提醒
              </h4>
              <p class="text-sm text-amber-800">建議使用中性清潔劑手洗，自然陰乾避免曝曬，可延長鞋子使用壽命。</p>
            </div>

            <!-- Specifications -->
            <details class="group">
              <summary class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                <h3 class="font-medium text-gray-900">商品規格</h3>
                <svg class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </summary>
              <div class="px-4 pt-2 pb-4 space-y-2">
                <div v-for="(v, k) in product.specs" :key="k" class="flex justify-between py-2 border-b border-gray-100 last:border-0">
                  <span class="text-sm text-gray-500">{{ k }}</span>
                  <span class="text-sm font-medium text-gray-900">{{ v }}</span>
                </div>
              </div>
            </details>

            <!-- Description -->
            <details class="group">
              <summary class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                <h3 class="font-medium text-gray-900">商品描述</h3>
                <svg class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </summary>
              <div class="px-4 pt-2 pb-4">
                <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed" v-html="renderDelta(product.descriptionDelta)"></div>
              </div>
            </details>

            <!-- Shipping & Policies -->
            <details class="group">
              <summary class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                <h3 class="font-medium text-gray-900">運送與政策</h3>
                <svg class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </summary>
              <div class="px-4 pt-2 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-900">運送資訊</h4>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p>滿 {{ product.shipping.freeThreshold }} 免運費</p>
                    <p>運費: {{ product.shipping.fee }}</p>
                    <p>出貨地: {{ product.shipping.shipFrom }}</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-900">售後政策</h4>
                  <div class="text-sm text-gray-600 space-y-1">
                    <p>退貨: {{ product.policies.return }}</p>
                    <p>保固: {{ product.policies.warranty }}</p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand and description -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">A</span>
              </div>
              <span class="text-xl font-bold text-gray-900">AthleX</span>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              專業運動用品販售平台，提供最優質的運動鞋履和運動配件，讓您的運動表現更加出色。
            </p>
            <div class="flex items-center space-x-4">
              <button class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </button>
              <button class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </button>
              <button class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Product categories -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">商品分類</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">女用運動鞋</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">男用運動鞋</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">運動服飾</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">運動配件</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">戶外用品</a></li>
            </ul>
          </div>

          <!-- Customer service -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">客戶服務</h3>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">聯絡我們</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">配送資訊</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">退換貨政策</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">尺寸指南</a></li>
              <li><a href="#" class="text-gray-600 hover:text-rose-600 transition-colors">常見問題</a></li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wider">訂閱電子報</h3>
            <p class="text-sm text-gray-600">
              訂閱我們的電子報，第一時間獲得最新商品和優惠資訊。
            </p>
            <div class="flex space-x-2">
              <input
                type="email"
                placeholder="輸入電子信箱"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <button class="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium">
                訂閱
              </button>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-xs text-gray-500">SSL 安全加密</span>
              </div>
              <div class="flex items-center space-x-1">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-xs text-gray-500">隱私保護</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom footer -->
        <div class="mt-8 pt-8 border-t border-gray-200">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div class="flex items-center space-x-6 text-sm text-gray-500">
              <span>&copy; 2024 AthleX. 保留所有權利。</span>
              <a href="#" class="hover:text-rose-600 transition-colors">隱私政策</a>
              <a href="#" class="hover:text-rose-600 transition-colors">服務條款</a>
            </div>

            <!-- Payment methods -->
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500">付款方式：</span>
              <div class="flex items-center space-x-2">
                <div class="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                <div class="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                <div class="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">JCB</div>
                <div class="w-8 h-5 bg-gray-700 rounded text-white text-xs flex items-center justify-center font-bold">AE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.prose h2 {
  margin-top: 0.5rem;
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth animations */
* {
  scroll-behavior: smooth;
}
</style>