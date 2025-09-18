<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const event = ref(null)
const activeTab = ref('info')

async function loadEvent() {
  try {
    const res = await fetch('/data/leather-workshop.json')
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
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-900/30 to-transparent"></div>
        <!-- 模擬背景圖片 -->
        <div class="w-full h-full bg-gradient-to-br from-amber-800/20 to-orange-900/40 flex items-center justify-center">
          <div class="text-6xl text-amber-200/30">🧳</div>
        </div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>

        <div v-else-if="event" class="max-w-4xl">
          <!-- 麵包屑 -->
          <nav class="mb-6 text-sm text-orange-100">
            <router-link to="/menu" class="hover:text-white transition-colors">首頁</router-link>
            <span class="mx-2">></span>
            <span class="text-white">活動體驗</span>
          </nav>

          <!-- 活動標題 -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <span class="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">
                {{ event.category }}
              </span>
              <span class="px-3 py-1 bg-white/20 text-white text-sm rounded-full backdrop-blur-sm">
                {{ event.status }}
              </span>
            </div>

            <h1 class="text-4xl md:text-5xl font-bold text-white leading-tight">
              {{ event.title }}
            </h1>

            <p class="text-xl text-orange-100 max-w-2xl">
              {{ event.subtitle }}
            </p>

            <!-- 快速資訊 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-sm text-orange-200">活動時間</span>
                </div>
                <div class="font-semibold">{{ eventDate }}</div>
                <div class="text-sm text-orange-200">{{ event.schedule.time }}</div>
              </div>

              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span class="text-sm text-orange-200">活動地點</span>
                </div>
                <div class="font-semibold">{{ event.location.venue }}</div>
                <div class="text-sm text-orange-200">{{ event.location.district }}</div>
              </div>

              <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                <div class="flex items-center space-x-2 mb-2">
                  <svg class="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span class="text-sm text-orange-200">活動費用</span>
                </div>
                <div class="flex items-baseline space-x-2">
                  <span class="text-2xl font-bold">{{ priceTWD }}</span>
                  <span class="text-sm line-through text-orange-300">{{ originalPriceTWD }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!loading && event" class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Navigation Tabs -->
          <div class="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
            <div class="flex border-b border-orange-100">
              <button
                v-for="tab in [
                  { id: 'info', label: '活動資訊', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { id: 'schedule', label: '活動流程', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { id: 'reviews', label: '學員評價', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
                ]"
                :key="tab.id"
                class="flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                :class="activeTab === tab.id
                  ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-600'
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
              <div v-show="activeTab === 'info'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">活動介紹</h3>
                  <p class="text-gray-700 leading-relaxed mb-4">{{ event.description.brief }}</p>

                  <div class="space-y-3">
                    <div v-for="highlight in event.description.highlights" :key="highlight"
                         class="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                      <span class="text-lg">{{ highlight.split(' ')[0] }}</span>
                      <span class="text-gray-700 text-sm">{{ highlight.substring(highlight.indexOf(' ') + 1) }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">活動詳情</h3>
                  <p class="text-gray-700 leading-relaxed">{{ event.description.details }}</p>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">講師介紹</h3>
                  <div class="bg-gray-50 rounded-xl p-6">
                    <div class="flex items-start space-x-4">
                      <div class="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center">
                        <span class="text-2xl">👨‍🏫</span>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold text-gray-900">{{ event.instructor.name }}</h4>
                        <p class="text-orange-600 text-sm mb-2">{{ event.instructor.title }}</p>
                        <p class="text-gray-600 text-sm mb-3">{{ event.instructor.experience }}</p>
                        <div class="space-y-1">
                          <div v-for="achievement in event.instructor.achievements" :key="achievement"
                               class="text-sm text-gray-600 flex items-center space-x-2">
                            <svg class="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            <span>{{ achievement }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 活動流程 -->
              <div v-show="activeTab === 'schedule'" class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">活動時程表</h3>
                  <div class="space-y-4">
                    <div v-for="(session, index) in event.schedule.sessions" :key="index"
                         class="flex items-start space-x-4 p-4 bg-white border border-orange-100 rounded-xl">
                      <div class="flex-shrink-0 w-20 text-sm font-medium text-orange-600">
                        {{ session.time }}
                      </div>
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900">{{ session.activity }}</h4>
                      </div>
                      <div class="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span class="text-xs font-bold text-orange-600">{{ index + 1 }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">注意事項</h3>
                  <ul class="space-y-2">
                    <li v-for="requirement in event.requirements" :key="requirement"
                        class="flex items-start space-x-2 text-sm text-gray-600">
                      <svg class="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{{ requirement }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <!-- 學員評價 -->
              <div v-show="activeTab === 'reviews'" class="space-y-6">
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
            <div class="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
              <div class="p-6">
                <div class="text-center mb-6">
                  <div class="flex items-baseline justify-center space-x-2 mb-2">
                    <span class="text-3xl font-bold text-gray-900">{{ priceTWD }}</span>
                    <span class="text-lg text-gray-400 line-through">{{ originalPriceTWD }}</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2 text-sm">
                    <span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      早鳥優惠 {{ event.pricing.discountPercent }}% OFF
                    </span>
                    <span class="text-gray-500">至 {{ discountDeadline }}</span>
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
                         :class="isAlmostFull ? 'bg-red-500' : 'bg-orange-500'"
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
                        class="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  <span v-if="isFull">已額滿</span>
                  <span v-else>立即報名</span>
                </button>

                <!-- 聯絡資訊 -->
                <div class="mt-6 pt-6 border-t border-gray-100">
                  <h4 class="font-medium text-gray-900 mb-3">主辦單位</h4>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0v2a2 2 0 002 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2z"></path>
                      </svg>
                      <span>{{ event.organizer.name }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>{{ event.organizer.contact.phone }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 地點資訊 -->
            <div class="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                </svg>
                <span>活動地點</span>
              </h4>

              <div class="space-y-3">
                <div>
                  <h5 class="font-medium text-gray-900">{{ event.location.venue }}</h5>
                  <p class="text-sm text-gray-600">{{ event.location.address }}</p>
                </div>

                <div>
                  <h6 class="text-sm font-medium text-gray-700 mb-2">交通方式</h6>
                  <ul class="space-y-1">
                    <li v-for="transport in event.location.transportation" :key="transport"
                        class="text-xs text-gray-600 flex items-start space-x-2">
                      <svg class="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      <span>{{ transport }}</span>
                    </li>
                  </ul>
                </div>

                <!-- 簡化的地圖佔位 -->
                <div class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div class="text-center text-gray-500">
                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    <p class="text-xs">點擊查看地圖</p>
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