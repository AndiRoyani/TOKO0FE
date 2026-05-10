import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import KasirView from '../views/KasirView.vue'
import StokView from '../views/StokView.vue'
import LaporanView from '../views/LaporanView.vue'
import MasterDataView from '../views/MasterDataView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/', redirect: '/kasir' },
    { path: '/kasir', component: KasirView, meta: { requiresAuth: true } },
    { path: '/stok', component: StokView, meta: { requiresAuth: true } },
    { path: '/master', component: MasterDataView, meta: { requiresAuth: true } },
    { path: '/laporan', component: LaporanView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) return next('/login')
  if (to.path === '/login' && token) return next('/kasir')
  next()
})

export default router