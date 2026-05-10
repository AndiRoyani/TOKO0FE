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
            class="bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all"
            :class="b.stok > 0 ? 'hover:bg-orange-50 hover:border-orange-200' : 'opacity-40'"
          >
            <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm">
              {{ b.kategori?.nama?.toLowerCase().includes('rokok') ? '🚬' : '🛒' }}
            </div>
            <div class="font-semibold text-slate-700 text-sm leading-tight mb-1">{{ b.nama }}</div>
            <div class="text-orange-500 font-bold text-sm">Rp {{ b.harga.toLocaleString('id-ID') }}</div>
            <div v-if="b.hargaSatuanKecil" class="text-xs text-slate-400 mt-0.5">
              Rp {{ b.hargaSatuanKecil.toLocaleString('id-ID') }}/{{ b.satuanKecil }}
            </div>
            <div class="mt-1">
              <span class="text-xs px-2 py-0.5 rounded-lg" :class="b.stok <= 5 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'">
                Stok: {{ b.stok }} bungkus
              </span>
            </div>
            <div class="mt-3 flex gap-1.5">
              <button
                @click="addToCart(b, 'bungkus')"
                :disabled="b.stok <= 0"
                class="flex-1 text-xs py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg transition"
              >
                + Bungkus
              </button>
              <button
                v-if="b.hargaSatuanKecil"
                @click="addToCart(b, 'satuan')"
                class="flex-1 text-xs py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition"
              >
                + {{ b.satuanKecil }}
              </button>
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
          <div v-for="item in cart" :key="item.cartId" class="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-slate-700 truncate">{{ item.nama }}</div>
              <div class="text-xs text-orange-500 font-semibold">Rp {{ (item.harga * item.qty).toLocaleString('id-ID') }}</div>
              <div v-if="item.mode === 'satuan'" class="text-xs text-slate-400">per {{ item.satuanKecil }}</div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button @click="changeQty(item, -1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex items-center justify-center text-sm transition">−</button>
              <span class="text-sm font-semibold text-slate-700 w-5 text-center">{{ item.qty }}</span>
              <button @click="changeQty(item, 1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600 flex items-center justify-center text-sm transition">+</button>
            </div>
            <button @click="removeFromCart(item.cartId)" class="text-slate-300 hover:text-red-400 transition text-sm">✕</button>
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
            {{ n >= 1000 ? (n / 1000) + 'rb' : n }}
          </button>
        </div>
        <button
          @click="proses"
          :disabled="cart.length === 0 || kembalian < 0 || loading"
          class="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm"
        >
          {{ loading ? 'Memproses...' : '✓ Proses Pembayaran' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Struk -->
  <div v-if="showStruk" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
      <div id="struk" class="p-6 bg-white">
        <div class="text-center mb-4">
          <div class="text-2xl mb-1">🏪</div>
          <div class="font-bold text-lg text-slate-800">Warung Saya</div>
          <div class="text-xs text-slate-400 mt-0.5">Terima kasih telah berbelanja</div>
          <div class="border-t border-dashed border-slate-300 mt-3 pt-3 text-xs text-slate-500">{{ waktuStruk }}</div>
        </div>
        <div class="border-t border-dashed border-slate-300 py-3 flex flex-col gap-2">
          <div v-for="item in strukData.items" :key="item.cartId" class="flex justify-between text-sm">
            <div>
              <div class="font-medium text-slate-700">{{ item.nama }}</div>
              <div class="text-xs text-slate-400">{{ item.qty }} x Rp {{ item.harga.toLocaleString('id-ID') }}</div>
            </div>
            <div class="font-semibold text-slate-700">Rp {{ (item.qty * item.harga).toLocaleString('id-ID') }}</div>
          </div>
        </div>
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
        <div class="border-t border-dashed border-slate-300 mt-3 pt-3 text-center text-xs text-slate-400">
          <div>Simpan struk ini sebagai bukti pembelian</div>
          <div class="mt-1 font-medium text-slate-500">★ Terima Kasih ★</div>
        </div>
      </div>
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
    b => b.nama.toLowerCase().includes(search.value.toLowerCase())
  )
)

const total = computed(() => cart.value.reduce((s, i) => s + i.harga * i.qty, 0))
const kembalian = computed(() => bayar.value - total.value)

function addToCart(b: any, mode: 'bungkus' | 'satuan' = 'bungkus') {
  const isSatuan = mode === 'satuan' && b.hargaSatuanKecil
  const cartId = `${b.id}-${mode}`
  const existing = cart.value.find(i => i.cartId === cartId)

  if (isSatuan) {
    if (existing) {
      existing.qty++
    } else {
      cart.value.push({
        cartId,
        barangId: b.id,
        nama: b.nama + ' (per ' + b.satuanKecil + ')',
        harga: b.hargaSatuanKecil,
        qty: 1,
        mode: 'satuan',
        satuanKecil: b.satuanKecil,
      })
    }
  } else {
    if (b.stok <= 0) return
    if (existing) {
      if (existing.qty >= b.stok) return alert('Stok tidak cukup!')
      existing.qty++
    } else {
      cart.value.push({
        cartId,
        barangId: b.id,
        nama: b.nama,
        harga: b.harga,
        qty: 1,
        mode: 'bungkus',
        satuanKecil: null,
      })
    }
  }
}

function changeQty(item: any, delta: number) {
  const newQty = item.qty + delta
  if (newQty <= 0) {
    cart.value = cart.value.filter(i => i.cartId !== item.cartId)
    return
  }
  item.qty = newQty
}

function removeFromCart(cartId: string) {
  cart.value = cart.value.filter(i => i.cartId !== cartId)
}

async function proses() {
  loading.value = true
  try {
    // Hanya kirim item mode bungkus ke backend untuk kurangi stok
    const itemsBungkus = cart.value
      .filter(i => i.mode === 'bungkus')
      .map(i => ({ barangId: i.barangId, qty: i.qty }))

    // Item satuan tidak kurangi stok bungkus (hanya catat penjualan)
    const itemsSatuan = cart.value
      .filter(i => i.mode === 'satuan')
      .map(i => ({ barangId: i.barangId, qty: 0 }))

    const items = [...itemsBungkus, ...itemsSatuan].filter(i => i.qty >= 0)

    // Kirim transaksi dengan total manual
    await transaksiStore.buatTransaksiManual({
      bayar: bayar.value,
      total: total.value,
      kembalian: kembalian.value,
      items: itemsBungkus, // hanya bungkus yang kurangi stok
      detail: cart.value.map(i => ({
        barangId: i.barangId,
        qty: i.qty,
        hargaSatuan: i.harga,
        subtotal: i.harga * i.qty,
      }))
    })

    await barangStore.fetchBarang()
    kembalianTerakhir.value = kembalian.value
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

const kembalianTerakhir = ref(0)

function cetakStruk() {
  const win = window.open('', '_blank', 'width=220,height=600')
  if (!win) return

  const garis = '--------------------------------'
  const garisTebal = '================================'
  const padLeft = (str: string, len: number) => str.toString().padStart(len)
  const padRight = (str: string, len: number) => str.toString().padEnd(len)

  win.document.write(`
    <html>
      <head>
        <title>Struk</title>
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 58mm; padding: 2mm; line-height: 1.4; }
          pre { font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          @media print { @page { size: 58mm auto; margin: 0; } body { padding: 1mm; } }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:14px">WARUNG SAYA</div>
        <div class="center" style="font-size:11px">Toko Kelontong Terpercaya</div>
        <pre>${garis}</pre>
        <div style="font-size:11px">${waktuStruk.value}</div>
        <div style="font-size:11px">No: #${Date.now().toString().slice(-6)}</div>
        <pre>${garis}</pre>
        ${strukData.value.items.map(item => `
        <div class="bold">${item.nama}</div>
        <pre>${padRight(item.qty + ' x Rp ' + item.harga.toLocaleString('id-ID'), 20)}${padLeft('Rp ' + (item.qty * item.harga).toLocaleString('id-ID'), 12)}</pre>
        `).join('')}
        <pre>${garis}</pre>
        <pre>${padRight('Subtotal (' + strukData.value.items.reduce((s: number, i: any) => s + i.qty, 0) + ' item)', 20)}${padLeft('Rp ' + strukData.value.total.toLocaleString('id-ID'), 12)}</pre>
        <pre>${garisTebal}</pre>
        <div class="bold" style="font-size:13px">${padRight('TOTAL', 20)}${padLeft('Rp ' + strukData.value.total.toLocaleString('id-ID'), 12)}</div>
        <pre>${garis}</pre>
        <pre>${padRight('Tunai', 20)}${padLeft('Rp ' + strukData.value.bayar.toLocaleString('id-ID'), 12)}</pre>
        <div class="bold">${padRight('Kembali', 20)}${padLeft('Rp ' + strukData.value.kembalian.toLocaleString('id-ID'), 12)}</div>
        <pre>${garisTebal}</pre>
        <div class="center" style="margin-top:4px;font-size:11px">Terima kasih telah berbelanja!</div>
        <div class="center" style="font-size:11px">Barang yang sudah dibeli</div>
        <div class="center" style="font-size:11px">tidak dapat dikembalikan</div>
        <pre>${garis}</pre>
        <div class="center bold">*** SELAMAT BERBELANJA ***</div>
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 500)
}
</script>

<style></style>