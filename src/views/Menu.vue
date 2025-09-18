<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
    <div class="max-w-4xl mx-auto p-6">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">AthleX 體驗中心</h1>
        <p class="text-lg text-gray-600">探索運動與生活的無限可能</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 商品展示卡片 -->
        <div class="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div class="aspect-video bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
            <div class="text-4xl group-hover:scale-110 transition-transform duration-300">👟</div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">女用運動鞋</h3>
            <p class="text-gray-600 text-sm mb-4">專業運動鞋履，結合時尚與功能性設計</p>
            <div class="space-y-2">
              <router-link to="/shop"
                class="block w-full text-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium">
                經典版本
              </router-link>
              <router-link to="/shop-claude"
                class="block w-full text-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all text-sm font-medium">
                Claude 精選版
              </router-link>
            </div>
          </div>
        </div>

        <!-- 活動體驗卡片 -->
        <div class="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div class="aspect-video bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
            <div class="text-4xl group-hover:scale-110 transition-transform duration-300">🧳</div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">皮革手作體驗</h3>
            <p class="text-gray-600 text-sm mb-4">親手製作專屬皮革小物，感受傳統工藝魅力</p>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <span class="text-lg font-bold text-orange-600">NT$ 1,580</span>
                <span class="text-sm text-gray-400 line-through">NT$ 1,980</span>
              </div>
              <span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">限時優惠</span>
            </div>
            <router-link to="/event"
              class="block w-full text-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all text-sm font-medium">
              立即報名
            </router-link>
          </div>
        </div>

        <!-- 即將推出卡片 -->
        <div class="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 opacity-75">
          <div class="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <div class="text-4xl group-hover:scale-110 transition-transform duration-300">🚀</div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">更多精彩內容</h3>
            <p class="text-gray-600 text-sm mb-4">更多運動體驗和生活服務即將上線</p>
            <button disabled
              class="block w-full text-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium">
              敬請期待
            </button>
          </div>
        </div>
      </div>

      <!-- 功能說明區塊 -->
      <div class="mt-16 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 border border-gray-100">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">平台特色</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">精選商品</h3>
            <p class="text-sm text-gray-600">嚴選優質運動用品，提供最佳使用體驗</p>
          </div>

          <div class="text-center">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">體驗活動</h3>
            <p class="text-sm text-gray-600">豐富的手作體驗課程，創造美好回憶</p>
          </div>

          <div class="text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">創新科技</h3>
            <p class="text-sm text-gray-600">運用最新技術打造優質購物體驗</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

