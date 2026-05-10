<template>
  <div class="flex gap-6 h-[calc(100vh-120px)]">
    <!-- Kiri: Daftar Barang -->
    <div class="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100">
        <input
          v-model="search"
          placeholder="🔍 Cari barang..."
          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="barangFiltered.length === 0" class="text-center py-16 text-slate-400 text-sm">Barang tidak ditemukan</div>
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="b in barangFiltered"
            :key="b.id"
            @click="addToCart(b)"
            class="bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-300 rounded-xl p-4 cursor-pointer transition-all active:scale-95"
          >
            <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm">🛒</div>
            <div class="font-semibold text-slate-700 text-sm leading-tight mb-1">{{ b.nama }}</div>
            <div class="text-orange-500 font-bold text-sm">Rp {{ b.harga.toLocaleString('id-ID') }}</div>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs px-2 py-0.5 rounded-lg" :class="b.stok <= 5 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'">
                Stok: {{ b.stok }}
              </span>
              <span class="text-xs text-slate-400">{{ b.kategori?.nama }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Kanan: Keranjang -->
    <div class="w-80 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-700">🧾 Keranjang</h2>
        <span v-if="cart.length" class="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{{ cart.length }} item</span>
      </div>
      <div class="flex-1 overflow-y-auto px-4 py-3">
        <div v-if="cart.length === 0" class="text-center py-12 text-slate-400 text-sm">
          <div class="text-4xl mb-3">🛒</div>Pilih barang dari kiri
        </div>
        <div v-else class="flex flex-col gap-2">
          <div v-for="item in cart" :key="item.barangId" class="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-slate-700 truncate">{{ item.nama }}</div>
              <div class="text-xs text-orange-500 font-semibold">Rp {{ (item.harga * item.qty).toLocaleString('id-ID') }}</div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button @click="changeQty(item, -1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex items-center justify-center text-sm transition">−</button>
              <span class="text-sm font-semibold text-slate-700 w-5 text-center">{{ item.qty }}</span>
              <button @click="changeQty(item, 1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600 flex items-center justify-center text-sm transition">+</button>
            </div>
          </div>
        </div>
      </div>
      <div class="px-5 py-4 border-t border-slate-100 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-500">Total</span>
          <span class="text-xl font-bold text-slate-800">Rp {{ total.toLocaleString('id-ID') }}</span>
        </div>
        <div>
          <label class="text-xs font-medium text-slate-400 mb-1 block">Uang Bayar</label>
          <input v-model.number="bayar" type="number" placeholder="Masukkan nominal..." class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
        </div>
        <div v-if="bayar > 0" class="flex items-center justify-between px-4 py-2.5 rounded-xl" :class="kembalian >= 0 ? 'bg-green-50' : 'bg-red-50'">
          <span class="text-xs font-medium" :class="kembalian >= 0 ? 'text-green-600' : 'text-red-500'">Kembalian</span>
          <span class="text-sm font-bold" :class="kembalian >= 0 ? 'text-green-700' : 'text-red-600'">
            {{ kembalian >= 0 ? 'Rp ' + kembalian.toLocaleString('id-ID') : '- Rp ' + Math.abs(kembalian).toLocaleString('id-ID') }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <button v-for="n in nominalCepat" :key="n" @click="bayar = n" class="text-xs py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition">
            {{ n >= 1000 ? (n/1000) + 'rb' : n }}
          </button>
        </div>
        <button @click="proses" :disabled="cart.length === 0 || kembalian < 0 || loading" class="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm">
          {{ loading ? 'Memproses...' : '✓ Proses Pembayaran' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Struk -->
  <div v-if="showStruk" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
      <!-- Struk content -->
      <div id="struk" class="p-6 bg-white">
        <!-- Header struk -->
        <div class="text-center mb-4">
          <div class="text-2xl mb-1">🏪</div>
          <div class="font-bold text-lg text-slate-800">Warung Saya</div>
          <div class="text-xs text-slate-400 mt-0.5">Terima kasih telah berbelanja</div>
          <div class="border-t border-dashed border-slate-300 mt-3 pt-3 text-xs text-slate-500">
            {{ waktuStruk }}
          </div>
        </div>

        <!-- Items -->
        <div class="border-t border-dashed border-slate-300 py-3 flex flex-col gap-2">
          <div v-for="item in strukData.items" :key="item.barangId" class="flex justify-between text-sm">
            <div>
              <div class="font-medium text-slate-700">{{ item.nama }}</div>
              <div class="text-xs text-slate-400">{{ item.qty }} x Rp {{ item.harga.toLocaleString('id-ID') }}</div>
            </div>
            <div class="font-semibold text-slate-700">Rp {{ (item.qty * item.harga).toLocaleString('id-ID') }}</div>
          </div>
        </div>

        <!-- Total -->
        <div class="border-t border-dashed border-slate-300 pt-3 flex flex-col gap-1.5">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Total</span>
            <span class="font-bold text-slate-800">Rp {{ strukData.total.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Bayar</span>
            <span class="text-slate-700">Rp {{ strukData.bayar.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Kembalian</span>
            <span class="font-bold text-green-600">Rp {{ strukData.kembalian.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-dashed border-slate-300 mt-3 pt-3 text-center text-xs text-slate-400">
          <div>Simpan struk ini sebagai bukti pembelian</div>
          <div class="mt-1 font-medium text-slate-500">★ Terima Kasih ★</div>
        </div>
      </div>

      <!-- Tombol aksi -->
      <div class="flex gap-3 px-6 pb-6">
        <button @click="cetakStruk" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
          🖨️ Cetak Struk
        </button>
        <button @click="showStruk = false" class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition">
          Transaksi Baru
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBarangStore } from '../stores/barang'
import { useTransaksiStore } from '../stores/transaksi'

const barangStore = useBarangStore()
const transaksiStore = useTransaksiStore()

const search = ref('')
const cart = ref<any[]>([])
const bayar = ref<number>(0)
const loading = ref(false)
const showStruk = ref(false)
const waktuStruk = ref('')
const nominalCepat = [5000, 10000, 20000, 50000, 100000, 200000]

const strukData = ref({
  items: [] as any[],
  total: 0,
  bayar: 0,
  kembalian: 0,
})

onMounted(() => barangStore.fetchBarang())

const barangFiltered = computed(() =>
  barangStore.barangList.filter(
    b => b.stok > 0 && b.nama.toLowerCase().includes(search.value.toLowerCase())
  )
)

const total = computed(() => cart.value.reduce((s, i) => s + i.harga * i.qty, 0))
const kembalian = computed(() => bayar.value - total.value)

function addToCart(b: any) {
  const existing = cart.value.find(i => i.barangId === b.id)
  if (existing) {
    if (existing.qty >= b.stok) return
    existing.qty++
  } else {
    cart.value.push({ barangId: b.id, nama: b.nama, harga: b.harga, qty: 1 })
  }
}

function changeQty(item: any, delta: number) {
  const b = barangStore.barangList.find(x => x.id === item.barangId)
  const newQty = item.qty + delta
  if (newQty <= 0) { cart.value = cart.value.filter(i => i.barangId !== item.barangId); return }
  if (b && newQty > b.stok) return
  item.qty = newQty
}

async function proses() {
  loading.value = true
  try {
    await transaksiStore.buatTransaksi({
      bayar: bayar.value,
      items: cart.value.map(i => ({ barangId: i.barangId, qty: i.qty }))
    })
    await barangStore.fetchBarang()

    // Isi data struk
    strukData.value = {
      items: cart.value.map(i => ({ ...i })),
      total: total.value,
      bayar: bayar.value,
      kembalian: kembalian.value,
    }
    waktuStruk.value = new Date().toLocaleString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })

    cart.value = []
    bayar.value = 0
    showStruk.value = true
  } catch (e: any) {
    alert(e.response?.data?.message || 'Terjadi kesalahan')
  }
  loading.value = false
}

function cetakStruk() {
  const el = document.getElementById('struk')
  if (!el) return
  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) return
  win.document.write(`
    <html>
      <head>
        <title>Struk Warung Saya</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 16px; width: 300px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .small { font-size: 11px; color: #555; }
          .large { font-size: 16px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center">
          <div class="large">WARUNG SAYA</div>
          <div class="small">Terima kasih telah berbelanja</div>
          <div class="divider"></div>
          <div class="small">${waktuStruk.value}</div>
        </div>
        <div class="divider"></div>
        ${strukData.value.items.map(item => `
          <div>
            <div class="bold">${item.nama}</div>
            <div class="row">
              <span class="small">${item.qty} x Rp ${item.harga.toLocaleString('id-ID')}</span>
              <span>Rp ${(item.qty * item.harga).toLocaleString('id-ID')}</span>
            </div>
          </div>
        `).join('')}
        <div class="divider"></div>
        <div class="row"><span>Total</span><span class="bold">Rp ${strukData.value.total.toLocaleString('id-ID')}</span></div>
        <div class="row"><span>Bayar</span><span>Rp ${strukData.value.bayar.toLocaleString('id-ID')}</span></div>
        <div class="row"><span>Kembalian</span><span class="bold">Rp ${strukData.value.kembalian.toLocaleString('id-ID')}</span></div>
        <div class="divider"></div>
        <div class="center small">Simpan struk ini sebagai bukti pembelian</div>
        <div class="center bold">★ Terima Kasih ★</div>
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 500)
}
</script>

<style></style>