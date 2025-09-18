<script setup>
</script>

<template>
  <div>
    <header class="border-b bg-white/70 backdrop-blur sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <router-link to="/menu" class="text-lg font-semibold">AthleX</router-link>
        <nav class="flex items-center gap-4 text-sm">
          <router-link to="/menu" class="hover:text-rose-600">選單</router-link>
          <router-link to="/shop" class="hover:text-rose-600">商品</router-link>
        </nav>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
  
</template>

<style scoped>
</style>
