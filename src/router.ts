import { createWebHistory, createRouter } from 'vue-router';

const routes = [
    { path: '/', component: () => import('./views/HomeView.vue') },
    { path: '/meter', component: () => import('./views/MeterView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})