<template>
  <div v-if="!isLoginPage" class="flex min-h-screen bg-slate-100">
    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-full bg-slate-900 flex flex-col z-50 transition-all duration-300"
      :class="sidebarOpen ? 'w-64' : 'w-16'"
    >
      <!-- Brand -->
      <div class="px-4 py-5 border-b border-slate-700 flex items-center justify-between min-h-[72px]">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg shadow-lg shrink-0">🏪</div>
          <div v-if="sidebarOpen" class="overflow-hidden">
            <div class="text-white font-bold text-sm leading-tight whitespace-nowrap">MITRA CCL</div>
            <div class="text-slate-400 text-xs whitespace-nowrap">Manajemen Toko</div>
          </div>
        </div>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="text-slate-400 hover:text-white transition shrink-0 ml-1"
        >
          <span class="text-lg">{{ sidebarOpen ? '◀' : '▶' }}</span>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-2 py-4 flex flex-col gap-1">
        <p v-if="sidebarOpen" class="text-slate-500 text-xs font-semibold px-3 mb-2 uppercase tracking-widest">Menu</p>
        <RouterLink
          v-for="menu in menus"
          :key="menu.path"
          :to="menu.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm font-medium no-underline"
          active-class="!text-white !bg-slate-800 border border-slate-700"
          :title="!sidebarOpen ? menu.label : ''"
        >
          <span class="text-base shrink-0">{{ menu.icon }}</span>
          <span v-if="sidebarOpen" class="whitespace-nowrap">{{ menu.label }}</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="px-2 mb-3">
        <div class="bg-slate-800 rounded-xl px-3 py-3 flex items-center gap-3">
          <div class="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
            {{ authStore.user?.nama?.charAt(0) }}
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <div class="text-white text-xs font-semibold truncate">{{ authStore.user?.nama }}</div>
            <div class="text-slate-400 text-xs truncate">{{ authStore.user?.username }}</div>
          </div>
          <button v-if="sidebarOpen" @click="logout" class="text-slate-400 hover:text-red-400 text-xs transition font-medium shrink-0">
            Keluar
          </button>
        </div>
      </div>

      <!-- Clock -->
      <div class="px-4 py-4 border-t border-slate-700 text-center">
        <div class="text-white font-bold tracking-widest tabular-nums" :class="sidebarOpen ? 'text-2xl' : 'text-sm'">
          {{ sidebarOpen ? waktu : waktu.slice(0,5) }}
        </div>
        <div v-if="sidebarOpen" class="text-slate-500 text-xs mt-1">{{ tanggal }}</div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-h-screen transition-all duration-300" :class="sidebarOpen ? 'ml-64' : 'ml-16'">
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

  <!-- Login page -->
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

const sidebarOpen = ref(true)
const waktu = ref('')
const tanggal = ref('')

const menus = [
  { path: '/kasir', icon: '🧾', label: 'Kasir' },
  { path: '/stok', icon: '📦', label: 'Stok Barang' },
  { path: '/master', icon: '🗂️', label: 'Master Data' },
  { path: '/laporan', icon: '📊', label: 'Laporan' },
]

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