<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const event = ref(null)
const activeTab = ref('info')

async function loadEvent() {
  try {
    const res = await fetch('/data/sci-fi-workshop.json')
    event.value = await res.json()
    loading.value = false
  } catch (error) {
    console.error('Failed to load event data:', error)
    loading.value = false
  }
}

onMounted(loadEvent)

const priceTWD = computed(() =>
  event.value ? new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: event.value.pricing.currency || 'TWD'
  }).format(event.value.pricing.currentPrice) : ''
)

const originalPriceTWD = computed(() =>
  event.value ? new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: event.value.pricing.currency || 'TWD'
  }).format(event.value.pricing.originalPrice) : ''
)

const discountDeadline = computed(() => {
  if (!event.value?.pricing?.earlyBirdDeadline) return null
  const deadline = new Date(event.value.pricing.earlyBirdDeadline)
  return deadline.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const eventDate = computed(() => {
  if (!event.value?.schedule?.date) return ''
  const date = new Date(event.value.schedule.date)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const registrationProgress = computed(() => {
  if (!event.value?.capacity) return 0
  return Math.round((event.value.capacity.registered / event.value.capacity.total) * 100)
})

const isAlmostFull = computed(() => registrationProgress.value >= 80)
const isFull = computed(() => event.value?.capacity?.remaining <= 0)
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
              <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">A</span>
              </div>
              <span class="text-xl font-bold text-gray-900">AthleX</span>
            </router-link>

            <!-- Breadcrumb -->
            <nav class="hidden md:flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-sm text-gray-500">
                <li><router-link to="/menu" class="hover:text-indigo-600 transition-colors">探索</router-link></li>
                <li><span class="text-gray-300">/</span></li>
                <li v-if="event" class="text-gray-700">{{ event.category }}</li>
                <li v-if="event"><span class="text-gray-300">/</span></li>
                <li v-if="event" class="text-gray-900 font-medium truncate max-w-48">{{ event.title }}</li>
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
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </button>

            <!-- Cart -->
            <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
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

    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
      <div class="absolute inset-0 bg-white/60"></div>
      <div class="absolute inset-0">
        <!-- 科幻背景效果 -->
        <div class="w-full h-full bg-gradient-to-br from-indigo-100/30 to-purple-100/40 flex items-center justify-center relative">
          <div class="text-6xl text-indigo-300/40">🚀</div>
          <!-- 添加一些科幻元素 -->
          <div class="absolute inset-0 opacity-30">
            <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <div class="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
            <div class="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>

        <div v-else-if="event" class="max-w-4xl">

          <!-- 活動標題 -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-full shadow-lg">
                {{ event.category }}
              </span>
              <span class="px-3 py-1 bg-white/70 text-indigo-700 text-sm rounded-full backdrop-blur-sm border border-indigo-200">
                {{ event.status }}
              </span>
            </div>

            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {{ event.title }}
            </h1>

            <p class="text-xl text-gray-700 max-w-2xl">
              {{ event.subtitle }}
            </p>

            <!-- 快速資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-sm text-gray-600">活動時間</span>
                </div>
                <div class="font-semibold text-gray-900">{{ eventDate }}</div>
                <div class="text-sm text-gray-600">全日體驗 (10:00-18:00)</div>
              </div>

              <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-sm text-gray-600">活動地點</span>
                </div>
                <div class="font-semibold text-gray-900">{{ event.location.venue }}</div>
                <div class="text-sm text-gray-600">{{ event.location.district }}</div>
              </div>

              <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span class="text-sm text-gray-600">活動費用</span>
                </div>
                <div class="flex items-baseline space-x-2">
                  <span class="text-2xl font-bold text-gray-900">{{ priceTWD }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!loading && event" class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Navigation Tabs -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="flex border-b border-gray-200">
              <button
                v-for="tab in [
                  { id: 'info', label: '活動資訊', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { id: 'reviews', label: '學員評價', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
                ]"
                :key="tab.id"
                class="flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                :class="activeTab === tab.id
                  ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
                @click="activeTab = tab.id"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"></path>
                </svg>
                <span>{{ tab.label }}</span>
              </button>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
              <!-- 活動資訊 -->
              <div v-show="activeTab === 'info'" class="space-y-8">
                <!-- 活動介紹 -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">活動介紹</h3>
                  <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed" v-html="event.description"></div>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">專家講師</h3>
                  <div class="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                    <div class="flex items-start space-x-4">
                      <div class="w-16 h-16 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full flex items-center justify-center">
                        <span class="text-2xl">🧑‍🔬</span>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">{{ event.instructor.name }}</h4>
                        <p class="text-indigo-600 text-sm mb-2">{{ event.instructor.title }}</p>
                        <p class="text-gray-600 text-sm mb-3">{{ event.instructor.experience }}</p>
                        <p class="text-gray-700 text-sm mb-3 italic">{{ event.instructor.specialization }}</p>
                        <div class="space-y-1">
                          <div v-for="achievement in event.instructor.achievements" :key="achievement"
                               class="text-sm text-gray-600 flex items-center space-x-2">
                            <svg class="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            <span>{{ achievement }}</span>
                          </div>
                        </div>
                        <div class="mt-4 p-3 bg-white/70 rounded-lg border border-indigo-100">
                          <p class="text-sm text-gray-700 italic">{{ event.instructor.socialProof }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <!-- 參與要求 -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">參與要求</h3>
                  <div class="prose prose-sm max-w-none text-gray-700" v-html="event.requirements"></div>
                </div>

                <!-- FAQ 常見問題 -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">常見問題</h3>
                  <div class="prose prose-sm max-w-none text-gray-700" v-html="event.faq"></div>
                </div>
              </div>


              <!-- 學員評價 -->
              <div v-show="activeTab === 'reviews'" id="content" class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-900">學員心得分享</h3>
                <div class="space-y-4">
                  <div v-for="review in event.reviews" :key="review.id"
                       class="bg-white border border-gray-200 rounded-xl p-6">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                          <span class="text-sm font-semibold text-orange-700">{{ review.author[0] }}</span>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">{{ review.author }}</h4>
                          <p class="text-xs text-gray-500">{{ review.date }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-1">
                        <span v-for="i in 5" :key="i" class="text-sm">
                          <span v-if="i <= review.rating" class="text-yellow-400">★</span>
                          <span v-else class="text-gray-300">★</span>
                        </span>
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm leading-relaxed">{{ review.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-6 space-y-6">
            <!-- 報名卡片 -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="p-6">
                <div class="text-center mb-6">
                  <div class="flex items-baseline justify-center space-x-2 mb-2">
                    <span class="text-3xl font-bold text-gray-900">{{ priceTWD }}</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    全息科技體驗完整價格
                  </div>
                </div>

                <!-- 報名進度 -->
                <div class="mb-6">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">報名進度</span>
                    <span class="text-sm text-gray-500">{{ event.capacity.registered }}/{{ event.capacity.total }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300"
                         :class="isAlmostFull ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'"
                         :style="{ width: `${registrationProgress}%` }"></div>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <span class="text-xs text-gray-500">
                      <span v-if="isAlmostFull" class="text-red-600 font-medium">即將額滿！</span>
                      <span v-else>還有 {{ event.capacity.remaining }} 個名額</span>
                    </span>
                    <span class="text-xs text-gray-500">{{ registrationProgress }}%</span>
                  </div>
                </div>

                <!-- 報名按鈕 -->
                <button :disabled="isFull"
                        class="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  <span v-if="isFull">已額滿</span>
                  <span v-else>立即報名</span>
                </button>

                <!-- 聯絡資訊 -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <h4 class="font-medium text-gray-900 mb-3">主辦單位</h4>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0v2a2 2 0 002 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2z"></path>
                      </svg>
                      <span>{{ event.organizer.name }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>{{ event.organizer.contact.phone }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      <span>{{ event.organizer.contact.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 地點資訊 -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                <span>活動地點</span>
              </h4>

              <div class="space-y-4">
                <div>
                  <h5 class="font-medium text-gray-900">{{ event.location.venue }}</h5>
                  <p class="text-sm text-gray-600">{{ event.location.address }}</p>
                  <p class="text-sm text-indigo-600 mt-1">{{ event.location.description }}</p>
                </div>

                <!-- 特殊設施 -->
                <div v-if="event.location.specialFeatures">
                  <h6 class="text-sm font-medium text-gray-700 mb-2">場地特色</h6>
                  <div class="prose prose-sm max-w-none text-xs text-gray-600" v-html="event.location.specialFeatures"></div>
                </div>

                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-2">交通方式</h6>
                  <div class="prose prose-sm max-w-none text-xs text-gray-600" v-html="event.location.transportation"></div>
                </div>
              </div>
            </div>

            <!-- 大型 Google Map 區域 -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div class="p-4 border-b border-gray-200">
                <h4 class="font-semibold text-gray-900 flex items-center space-x-2">
                  <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                  </svg>
                  <span>實驗室位置</span>
                </h4>
              </div>

              <!-- 大型地圖區域 -->
              <div class="relative">
                <div class="w-full h-80 bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
                  <!-- 模擬地圖背景 -->
                  <div class="absolute inset-0 opacity-20">
                    <div class="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200"></div>
                    <!-- 模擬地圖線條 -->
                    <div class="absolute top-1/4 left-0 right-0 h-px bg-gray-300 transform rotate-12"></div>
                    <div class="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -rotate-6"></div>
                    <div class="absolute bottom-1/4 left-0 right-0 h-px bg-gray-300 transform rotate-3"></div>
                    <div class="absolute top-0 bottom-0 left-1/4 w-px bg-gray-300 transform rotate-12"></div>
                    <div class="absolute top-0 bottom-0 right-1/4 w-px bg-gray-300 transform -rotate-6"></div>
                  </div>

                  <!-- 地圖標記 -->
                  <div class="relative z-10 text-center">
                    <div class="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg animate-pulse">
                      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div class="text-center text-gray-700">
                      <p class="font-semibold text-sm">{{ event.location.venue }}</p>
                      <p class="text-xs text-gray-500 mt-1">台北 101 頂樓</p>
                      <p class="text-xs text-indigo-600 mt-2 font-medium cursor-pointer hover:text-indigo-800 transition-colors">點擊開啟 Google Maps</p>
                    </div>
                  </div>

                  <!-- 科幻效果 -->
                  <div class="absolute inset-0 pointer-events-none">
                    <div class="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                    <div class="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                    <div class="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 bg-indigo-400 rounded-full animate-ping" style="animation-delay: 1s;"></div>
                  </div>
                </div>

                <!-- 地圖控制按鈕 -->
                <div class="absolute top-4 right-4 flex flex-col space-y-2">
                  <button class="w-8 h-8 bg-white shadow-md rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </button>
                  <button class="w-8 h-8 bg-white shadow-md rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 地址資訊 -->
              <div class="p-4 bg-gray-50">
                <div class="flex items-start space-x-3">
                  <svg class="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ event.location.address }}</p>
                    <p class="text-xs text-gray-600 mt-1">{{ event.location.district }}</p>
                    <div class="mt-2 flex space-x-4 text-xs text-gray-500">
                      <span>緯度: {{ event.location.coordinates.lat }}</span>
                      <span>經度: {{ event.location.coordinates.lng }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose h2 {
  margin-top: 0.5rem;
}
</style>