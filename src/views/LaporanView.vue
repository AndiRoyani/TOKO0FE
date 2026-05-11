<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">💰</div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pendapatan Hari Ini</span>
        </div>
        <div class="text-3xl font-bold text-slate-800">Rp {{ (laporan?.totalPendapatan || 0).toLocaleString('id-ID') }}</div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🧾</div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Jumlah Transaksi</span>
        </div>
        <div class="text-3xl font-bold text-slate-800">{{ laporan?.jumlahTransaksi || 0 }}</div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">📦</div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rata-rata Transaksi</span>
        </div>
        <div class="text-3xl font-bold text-slate-800">Rp {{ rataRata.toLocaleString('id-ID') }}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <!-- Barang Terlaris -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-700">🏆 Barang Terlaris Hari Ini</h2>
        </div>
        <div v-if="!laporan?.terlaris?.length" class="text-center py-12 text-slate-400 text-sm">
          Belum ada transaksi hari ini
        </div>
        <div v-else class="divide-y divide-slate-50">
          <div v-for="(item, i) in laporan.terlaris" :key="i" class="flex items-center gap-4 px-6 py-3.5">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              :class="(i as number) === 0 ? 'bg-yellow-100 text-yellow-700' : (i as number) === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'">
              {{ (i as number) + 1 }}
            </div>
            <div class="flex-1 text-sm font-medium text-slate-700">{{ item.nama }}</div>
            <div class="text-sm font-semibold text-orange-500">{{ item.qty }} terjual</div>
          </div>
        </div>
      </div>

      <!-- Riwayat Transaksi -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-700">🕐 Riwayat Transaksi</h2>
        </div>
        <div v-if="transaksiStore.transaksiList.length === 0" class="text-center py-12 text-slate-400 text-sm">
          Belum ada transaksi hari ini
        </div>
        <div v-else class="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          <div
            v-for="t in transaksiStore.transaksiList"
            :key="t.id"
            class="px-6 py-3.5 cursor-pointer hover:bg-slate-50 transition"
            @click="lihatDetail(t)"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-slate-400">{{ new Date(t.createdAt).toLocaleTimeString('id-ID') }}</span>
              <span class="text-sm font-semibold text-slate-700">Rp {{ t.total.toLocaleString('id-ID') }}</span>
            </div>
            <div class="text-xs text-slate-400 truncate">
              {{ t.detail.map((d: any) => `${d.barang.nama} x${d.qty}`).join(', ') }}
            </div>
            <div class="flex items-center justify-between mt-1">
              <div class="text-xs text-green-600">Kembalian Rp {{ t.kembalian.toLocaleString('id-ID') }}</div>
              <div class="text-xs text-orange-500 font-medium">Lihat detail →</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detail Transaksi -->
    <div v-if="selectedTransaksi" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="selectedTransaksi = null"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <!-- Header modal -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-slate-800">Detail Transaksi</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ new Date(selectedTransaksi.createdAt).toLocaleString('id-ID') }}</p>
          </div>
          <button @click="selectedTransaksi = null" class="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <!-- Items -->
        <div class="px-6 py-4 divide-y divide-slate-50 max-h-64 overflow-y-auto">
          <div v-for="d in selectedTransaksi.detail" :key="d.id" class="py-3 flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-slate-700">{{ d.barang.nama }}</div>
              <div class="text-xs text-slate-400">{{ d.qty }} x Rp {{ d.hargaSatuan.toLocaleString('id-ID') }}</div>
            </div>
            <div class="text-sm font-semibold text-slate-700">Rp {{ d.subtotal.toLocaleString('id-ID') }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-slate-500">Subtotal</span>
            <span class="text-slate-700">Rp {{ selectedTransaksi.total.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-slate-500">Dibayar</span>
            <span class="text-slate-700">Rp {{ selectedTransaksi.bayar.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between text-base font-bold">
            <span class="text-slate-700">Kembalian</span>
            <span class="text-green-600">Rp {{ selectedTransaksi.kembalian.toLocaleString('id-ID') }}</span>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-200 text-center">
            <span class="text-xs text-slate-400">Total {{ selectedTransaksi.detail.length }} jenis barang · {{ selectedTransaksi.detail.reduce((s: number, d: any) => s + d.qty, 0) }} item</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTransaksiStore } from '../stores/transaksi'

const transaksiStore = useTransaksiStore()
const laporan = computed(() => transaksiStore.laporan)
const selectedTransaksi = ref<any>(null)

const rataRata = computed(() => {
  if (!laporan.value?.jumlahTransaksi) return 0
  return Math.round(Number(laporan.value.totalPendapatan) / Number(laporan.value.jumlahTransaksi))
})

function lihatDetail(t: any) {
  selectedTransaksi.value = t
}

onMounted(async () => {
  await transaksiStore.fetchHariIni()
  await transaksiStore.fetchLaporan()
})
</script>

<style></style>