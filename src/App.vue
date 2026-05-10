<template>
  <div v-if="!isLoginPage" class="flex min-h-screen bg-slate-100">
    <!-- Sidebar -->
    <aside class="fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-50">
      <!-- Brand -->
      <div class="px-6 py-5 border-b border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg">🏪</div>
          <div>
            <div class="text-white font-bold text-sm leading-tight">Warung Saya</div>
            <div class="text-slate-400 text-xs">Manajemen Toko</div>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-4 py-5 flex flex-col gap-1">
        <p class="text-slate-500 text-xs font-semibold px-3 mb-3 uppercase tracking-widest">Menu</p>
        <RouterLink to="/kasir" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium no-underline" active-class="!text-white !bg-slate-800 border border-slate-700">
          <span class="text-base">🧾</span><span>Kasir</span>
        </RouterLink>
        <RouterLink to="/stok" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium no-underline" active-class="!text-white !bg-slate-800 border border-slate-700">
          <span class="text-base">📦</span><span>Stok Barang</span>
        </RouterLink>
        <RouterLink to="/master" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium no-underline" active-class="!text-white !bg-slate-800 border border-slate-700">
          <span class="text-base">🗂️</span><span>Master Data</span>
        </RouterLink>
        <RouterLink to="/laporan" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium no-underline" active-class="!text-white !bg-slate-800 border border-slate-700">
          <span class="text-base">📊</span><span>Laporan</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="px-4 mb-3">
        <div class="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <div class="text-white text-xs font-semibold">{{ authStore.user?.nama }}</div>
            <div class="text-slate-400 text-xs">{{ authStore.user?.username }}</div>
          </div>
          <button @click="logout" class="text-slate-400 hover:text-red-400 text-xs transition font-medium">
            Keluar
          </button>
        </div>
      </div>

      <!-- Clock -->
      <div class="px-6 py-4 border-t border-slate-700 text-center">
        <div class="text-white font-bold text-2xl tracking-widest tabular-nums">{{ waktu }}</div>
        <div class="text-slate-500 text-xs mt-1">{{ tanggal }}</div>
      </div>
    </aside>

    <!-- Main -->
    <div class="ml-64 flex-1 flex flex-col min-h-screen">
      <!-- Topbar -->
      <div class="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <h1 class="text-sm font-semibold text-slate-700">{{ pageTitle }}</h1>
        <div class="text-xs text-slate-400">{{ tanggal }}</div>
      </div>
      <!-- Content -->
      <div class="flex-1 p-8">
        <RouterView />
      </div>
    </div>
  </div>

  <!-- Login page tanpa sidebar -->
  <div v-else>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const waktu = ref('')
const tanggal = ref('')

const isLoginPage = computed(() => route.path === '/login')

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/kasir': 'Kasir — Transaksi Penjualan',
    '/stok': 'Manajemen Stok Barang',
    '/master': 'Master Data',
    '/laporan': 'Laporan Harian',
  }
  return map[route.path] || 'Warung Saya'
})

function updateWaktu() {
  const now = new Date()
  waktu.value = now.toLocaleTimeString('id-ID')
  tanggal.value = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function logout() {
  authStore.logout()
  router.push('/login')
}

let interval: any
onMounted(() => { updateWaktu(); interval = setInterval(updateWaktu, 1000) })
onUnmounted(() => clearInterval(interval))
</script>

<style></style>