<script setup>
</script>

<template>
  <div class="min-h-screen flex flex-col">

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Light Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <!-- Company Info -->
          <div class="lg:col-span-1">
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">A</span>
              </div>
              <span class="text-xl font-bold text-gray-900">
                AthleX
              </span>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed mb-4">
              連結創新者與探索者，打造獨特的活動體驗平台。在這裡，每一次參與都是一次新的發現。
            </p>
            <div class="flex space-x-4">
              <a href="#" class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors duration-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors duration-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-colors duration-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.997 1.482-1.997.699 0 1.037.219 1.037 1.142 0 .695-.442 1.736-.669 2.699-.188.794.398 1.442 1.187 1.442 1.425 0 2.522-1.505 2.522-3.679 0-1.925-1.382-3.27-3.358-3.27-2.288 0-3.632 1.717-3.632 3.489 0 .692.263 1.438.593 1.843.065.08.074.149.055.23-.061.254-.196.796-.223.907-.035.146-.116.177-.268.107-1.001-.465-1.624-1.926-1.624-3.1 0-2.538 1.845-4.868 5.324-4.868 2.794 0 4.972 1.993 4.972 4.658 0 2.778-1.752 5.011-4.182 5.011-.816 0-1.583-.426-1.845-1.067l-.5 1.916c-.181.695-.669 1.566-.995 2.097A12.013 12.013 0 0 0 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold mb-4 text-gray-900">快速連結</h3>
            <ul class="space-y-2">
              <li><router-link to="/menu" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">探索活動</router-link></li>
              <li><router-link to="/shop" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">精選推薦</router-link></li>
              <li><router-link to="/event" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">熱門活動</router-link></li>
              <li><a href="#" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">平台介紹</a></li>
            </ul>
          </div>

          <!-- Activity Categories -->
          <div>
            <h3 class="text-lg font-semibold mb-4 text-gray-900">活動類型</h3>
            <ul class="space-y-2">
              <li><a href="#" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">科技體驗</a></li>
              <li><a href="#" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">創意工坊</a></li>
              <li><a href="#" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">學習課程</a></li>
              <li><a href="#" class="text-gray-600 hover:text-indigo-600 transition-colors duration-200">社群聚會</a></li>
            </ul>
          </div>

          <!-- Platform Support -->
          <div>
            <h3 class="text-lg font-semibold mb-4 text-gray-900">平台支援</h3>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-gray-600 text-sm">常見問題</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zm18 0a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75-.75z"></path>
                </svg>
                <span class="text-gray-600 text-sm">技術支援</span>
              </div>
              <div class="flex items-center space-x-3">
                <svg class="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span class="text-gray-600 text-sm">support@athlex.com</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="text-gray-500 text-sm">
              © 2024 AthleX. 保留所有權利。
            </div>
            <div class="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" class="text-gray-500 hover:text-indigo-600 text-sm transition-colors duration-200">隱私政策</a>
              <a href="#" class="text-gray-500 hover:text-indigo-600 text-sm transition-colors duration-200">服務條款</a>
              <a href="#" class="text-gray-500 hover:text-indigo-600 text-sm transition-colors duration-200">Cookie 設定</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
</style>
