<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-slate-800">Kategori Barang</h2>
        <p class="text-sm text-slate-400 mt-0.5">Kelola kategori untuk pengelompokan barang</p>
      </div>
      <button
        @click="showModal = true"
        class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
      >
        <span class="text-lg leading-none">+</span> Tambah Kategori
      </button>
    </div>

    <!-- Grid Kategori -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div
        v-for="(k, i) in kategoriStore.kategoriList"
        :key="k.id"
        class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition"
      >
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" :class="warnaBadge[i % warnaBadge.length]">
          {{ ikon[i % ikon.length] }}
        </div>
        <div class="font-semibold text-slate-700 text-sm">{{ k.nama }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ k._count?.barang ?? 0 }} barang</div>
      </div>

      <!-- Empty -->
      <div v-if="kategoriStore.kategoriList.length === 0" class="col-span-4 text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
        Belum ada kategori. Tambah kategori pertama!
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-semibold text-slate-800">Tambah Kategori Baru</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <div class="mb-4">
          <label class="text-xs font-medium text-slate-500 mb-1.5 block">Nama Kategori</label>
          <input
            v-model="namaKategori"
            @keyup.enter="tambah"
            placeholder="Misal: Minuman, Rokok, Sembako..."
            class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>
        <div class="flex gap-3">
          <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">Batal</button>
          <button @click="tambah" :disabled="loading" class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition disabled:opacity-40">
            {{ loading ? 'Menyimpan...' : 'Tambah' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useKategoriStore } from '../stores/kategori'

const kategoriStore = useKategoriStore()
const namaKategori = ref('')
const showModal = ref(false)
const loading = ref(false)

const warnaBadge = [
  'bg-orange-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100', 'bg-yellow-100'
]
const ikon = ['🍜', '🥤', '🚬', '🛒', '🧴', '🍬']

onMounted(() => kategoriStore.fetchKategori())

async function tambah() {
  if (!namaKategori.value.trim()) return alert('Isi nama kategori!')
  loading.value = true
  await kategoriStore.tambahKategori(namaKategori.value.trim())
  namaKategori.value = ''
  loading.value = false
  showModal.value = false
}
</script>

<style></style>