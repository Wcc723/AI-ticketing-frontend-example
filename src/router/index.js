import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/menu' },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('@/views/Menu.vue'),
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('@/views/Shop.vue'),
    },
    {
      path: '/shop-claude',
      name: 'shop-claude',
      component: () => import('@/views/Shop-Claude.vue'),
    },
  ],
});

export default router
