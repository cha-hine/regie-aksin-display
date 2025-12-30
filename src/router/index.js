// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import pb from '@/lib/pocketbase'

// Définition des routes
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLogin,
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }, // route protégée
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard global pour protéger les routes avec meta.requiresAuth
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !pb.authStore.isValid) {
    next({ name: 'admin-login' })
  } else {
    next()
  }
})

export default router
