<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
    <div class="max-w-4xl mx-auto p-6">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">AthleX 體驗中心</h1>
        <p class="text-lg text-gray-600">探索運動與生活的無限可能</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- 活動參與卡片 -->
        <div class="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div class="aspect-video bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center">
            <div class="text-5xl group-hover:scale-110 transition-transform duration-300">🚀</div>
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">科技體驗活動</h3>
            <p class="text-gray-600 mb-6">探索未來科技的無限可能，體驗最新的科幻技術展示</p>
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-2">
                <span class="text-xl font-bold text-indigo-600">NT$ 1,580</span>
                <span class="text-sm text-gray-400 line-through">NT$ 1,980</span>
              </div>
              <span class="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-medium">限時優惠</span>
            </div>
            <router-link to="/event"
              class="block w-full text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
              查看活動詳情
            </router-link>
          </div>
        </div>

        <!-- 活動申請卡片 -->
        <div class="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div class="aspect-video bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
            <div class="text-5xl group-hover:scale-110 transition-transform duration-300">📝</div>
          </div>
          <div class="p-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-3">活動申請中心</h3>
            <p class="text-gray-600 mb-6">想要舉辦自己的活動嗎？透過我們的申請系統輕鬆提交你的活動企劃</p>
            <div class="mb-6">
              <div class="flex items-center space-x-2 text-emerald-600 mb-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-sm font-medium">免費申請</span>
              </div>
              <div class="flex items-center space-x-2 text-emerald-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm font-medium">快速審核</span>
              </div>
            </div>
            <router-link to="/event/application"
              class="block w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
              開始申請活動
            </router-link>
          </div>
        </div>
      </div>

      <!-- 功能說明區塊 -->
      <div class="mt-16 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 border border-gray-100">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">平台特色</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div class="text-center">
            <div class="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">活動體驗</h3>
            <p class="text-gray-600">探索最新科技趨勢，參與創新體驗活動，開拓視野並獲得實際操作經驗</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">活動申請</h3>
            <p class="text-gray-600">簡單便捷的活動申請流程，讓您輕鬆提交活動企劃，快速獲得審核回饋</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

