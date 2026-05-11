<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total Barang</p>
        <p class="text-3xl font-bold text-slate-800">{{ barangStore.barangList.length }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Stok Menipis</p>
        <p class="text-3xl font-bold text-orange-500">{{ stokMenipis }}</p>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total Kategori</p>
        <p class="text-3xl font-bold text-slate-800">{{ kategoriStore.kategoriList.length }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <h2 class="font-semibold text-slate-700">Daftar Barang</h2>
        <div class="flex gap-3">
          <input v-model="search" placeholder="Cari barang..." class="text-sm px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-slate-400 w-52" />
          <button @click="exportExcel" class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            📥 Export Excel
          </button>
          <button @click="showModal = true" class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            <span class="text-base leading-none">+</span> Tambah Barang
          </button>
        </div>
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <th class="text-left px-6 py-3 font-medium">#</th>
            <th class="text-left px-6 py-3 font-medium">Nama Barang</th>
            <th class="text-left px-6 py-3 font-medium">Kategori</th>
            <th class="text-left px-6 py-3 font-medium">Harga</th>
            <th class="text-left px-6 py-3 font-medium">Info Satuan</th>
            <th class="text-left px-6 py-3 font-medium">Stok</th>
            <th class="text-left px-6 py-3 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-if="barangFiltered.length === 0">
            <td colspan="7" class="text-center py-12 text-slate-400">Belum ada barang</td>
          </tr>
          <tr v-for="(b, i) in barangFiltered" :key="b.id" class="hover:bg-slate-50 transition">
            <td class="px-6 py-4 text-slate-400">{{ i + 1 }}</td>
            <td class="px-6 py-4 font-medium text-slate-700">{{ b.nama }}</td>
            <td class="px-6 py-4">
              <span class="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg">{{ b.kategori?.nama }}</span>
            </td>
            <td class="px-6 py-4 text-slate-700">
              <div>Rp {{ b.harga.toLocaleString('id-ID') }}</div>
              <div v-if="b.hargaSatuanKecil" class="text-xs text-orange-500">
                Rp {{ b.hargaSatuanKecil.toLocaleString('id-ID') }}/{{ b.satuanKecil }}
              </div>
              <div v-if="b.hargaPerKg" class="text-xs text-blue-500">
                Rp {{ b.hargaPerKg.toLocaleString('id-ID') }}/kg
              </div>
            </td>
            <td class="px-6 py-4">
              <span v-if="b.satuanKecil" class="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg">
                🚬 1 bungkus = {{ b.jumlahPerSatuan }} {{ b.satuanKecil }}
              </span>
              <span v-else-if="b.hargaPerKg" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                ⚖️ Jual per berat
              </span>
              <span v-else class="text-xs text-slate-300">—</span>
            </td>
            <td class="px-6 py-4">
              <span class="text-xs font-semibold px-2 py-1 rounded-lg" :class="b.stok <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'">
                {{ b.stok }} pcs
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button @click="editBarang(b)" class="text-xs px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition">Edit</button>
                <button @click="hapus(b.id)" class="text-xs px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Tambah/Edit -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-semibold text-slate-800 text-base">{{ editMode ? 'Edit Barang' : 'Tambah Barang Baru' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
        </div>

        <div class="flex flex-col gap-4">
          <div>
            <label class="text-xs font-medium text-slate-500 mb-1 block">Nama Barang</label>
            <input v-model="form.nama" placeholder="Misal: Terigu Segitiga Biru" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-slate-500 mb-1 block">Harga Jual (Rp)</label>
              <input v-model.number="form.harga" type="number" placeholder="12000" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500 mb-1 block">Stok</label>
              <input v-model.number="form.stok" type="number" placeholder="50" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 mb-1 block">Kategori</label>
            <select v-model.number="form.kategoriId" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white">
              <option value="" disabled>Pilih kategori</option>
              <option v-for="k in kategoriStore.kategoriList" :key="k.id" :value="k.id">{{ k.nama }}</option>
            </select>
          </div>

          <!-- Satuan kecil khusus rokok -->
          <div v-if="isRokok" class="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col gap-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-base">🚬</span>
              <span class="text-xs font-semibold text-orange-700">Pengaturan Jual Per Batang</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-medium text-slate-500 mb-1 block">Nama Satuan Kecil</label>
                <input v-model="form.satuanKecil" placeholder="batang" class="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white" />
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500 mb-1 block">Isi Per Bungkus</label>
                <input v-model.number="form.jumlahPerSatuan" type="number" placeholder="12" class="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white" />
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500 mb-1 block">Harga Per Batang (Rp)</label>
              <input v-model.number="form.hargaSatuanKecil" type="number" :placeholder="hargaPerBatangOtomatis > 0 ? 'Otomatis: ' + hargaPerBatangOtomatis : '2000'" class="w-full px-4 py-2.5 border border-orange-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 bg-white" />
              <p v-if="hargaPerBatangOtomatis > 0 && !form.hargaSatuanKecil" class="text-xs text-orange-500 mt-1">
                💡 Otomatis: Rp {{ hargaPerBatangOtomatis.toLocaleString('id-ID') }}/batang
              </p>
            </div>
          </div>

          <!-- Harga per kg khusus sembako -->
          <div v-if="isSembako" class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-base">⚖️</span>
              <span class="text-xs font-semibold text-blue-700">Pengaturan Jual Per Berat (Opsional)</span>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500 mb-1 block">Harga Per Kg (Rp)</label>
              <input v-model.number="form.hargaPerKg" type="number" placeholder="Misal: 12000" class="w-full px-4 py-2.5 border border-blue-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white" />
              <p class="text-xs text-blue-500 mt-1">💡 Isi jika ingin bisa jual per 1/4 kg, 1/2 kg, dll. Kosongkan jika tidak perlu.</p>
            </div>
            <div v-if="form.hargaPerKg > 0" class="grid grid-cols-3 gap-2">
              <div class="bg-white rounded-lg p-2 text-center border border-blue-100">
                <div class="text-xs text-slate-400">1/4 kg</div>
                <div class="text-sm font-semibold text-blue-600">Rp {{ Math.ceil(form.hargaPerKg / 4).toLocaleString('id-ID') }}</div>
              </div>
              <div class="bg-white rounded-lg p-2 text-center border border-blue-100">
                <div class="text-xs text-slate-400">1/2 kg</div>
                <div class="text-sm font-semibold text-blue-600">Rp {{ Math.ceil(form.hargaPerKg / 2).toLocaleString('id-ID') }}</div>
              </div>
              <div class="bg-white rounded-lg p-2 text-center border border-blue-100">
                <div class="text-xs text-slate-400">1 kg</div>
                <div class="text-sm font-semibold text-blue-600">Rp {{ form.hargaPerKg.toLocaleString('id-ID') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeModal" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">Batal</button>
          <button @click="simpan" :disabled="loading" class="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition disabled:opacity-40">
            {{ loading ? 'Menyimpan...' : (editMode ? 'Simpan Perubahan' : 'Tambah Barang') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { useBarangStore } from '../stores/barang'
import { useKategoriStore } from '../stores/kategori'

const barangStore = useBarangStore()
const kategoriStore = useKategoriStore()

const search = ref('')
const showModal = ref(false)
const editMode = ref(false)
const loading = ref(false)
const editId = ref<number | null>(null)
const form = ref({
  nama: '',
  harga: 0,
  stok: 0,
  kategoriId: '' as any,
  satuanKecil: 'batang',
  hargaSatuanKecil: 0,
  jumlahPerSatuan: 0,
  hargaPerKg: 0,
})

const stokMenipis = computed(() => barangStore.barangList.filter(b => b.stok <= 5).length)
const barangFiltered = computed(() =>
  barangStore.barangList.filter(b => b.nama.toLowerCase().includes(search.value.toLowerCase()))
)

const isRokok = computed(() => {
  const kat = kategoriStore.kategoriList.find(k => k.id === Number(form.value.kategoriId))
  return kat?.nama?.toLowerCase().includes('rokok')
})

const isSembako = computed(() => {
  const kat = kategoriStore.kategoriList.find(k => k.id === Number(form.value.kategoriId))
  return kat?.nama?.toLowerCase().includes('sembako')
})

const hargaPerBatangOtomatis = computed(() => {
  if (form.value.harga && form.value.jumlahPerSatuan) {
    return Math.ceil(form.value.harga / form.value.jumlahPerSatuan)
  }
  return 0
})

onMounted(async () => {
  await barangStore.fetchBarang()
  await kategoriStore.fetchKategori()
})

function editBarang(b: any) {
  editMode.value = true
  editId.value = b.id
  form.value = {
    nama: b.nama,
    harga: b.harga,
    stok: b.stok,
    kategoriId: b.kategoriId,
    satuanKecil: b.satuanKecil || 'batang',
    hargaSatuanKecil: b.hargaSatuanKecil || 0,
    jumlahPerSatuan: b.jumlahPerSatuan || 0,
    hargaPerKg: b.hargaPerKg || 0,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editMode.value = false
  editId.value = null
  form.value = { nama: '', harga: 0, stok: 0, kategoriId: '', satuanKecil: 'batang', hargaSatuanKecil: 0, jumlahPerSatuan: 0, hargaPerKg: 0 }
}

async function simpan() {
  if (!form.value.nama || !form.value.harga || !form.value.kategoriId) return alert('Isi semua field!')
  loading.value = true

  const data: any = {
    nama: form.value.nama,
    harga: form.value.harga,
    stok: form.value.stok,
    kategoriId: Number(form.value.kategoriId),
    satuanKecil: null,
    hargaSatuanKecil: null,
    jumlahPerSatuan: null,
    hargaPerKg: null,
  }

  if (isRokok.value) {
    data.satuanKecil = form.value.satuanKecil || 'batang'
    data.jumlahPerSatuan = form.value.jumlahPerSatuan
    data.hargaSatuanKecil = form.value.hargaSatuanKecil || hargaPerBatangOtomatis.value
  }

  if (isSembako.value && form.value.hargaPerKg > 0) {
    data.hargaPerKg = form.value.hargaPerKg
  }

  if (editMode.value && editId.value) {
    await barangStore.updateBarang(editId.value, data)
  } else {
    await barangStore.tambahBarang(data)
  }
  closeModal()
  loading.value = false
}

async function hapus(id: number) {
  if (!confirm('Yakin hapus barang ini?')) return
  await barangStore.hapusBarang(id)
}

function exportExcel() {
  const data = barangStore.barangList.map((b, i) => ({
    'No': i + 1,
    'Nama Barang': b.nama,
    'Kategori': b.kategori?.nama ?? '-',
    'Harga Jual': b.harga,
    'Harga Satuan Kecil': b.hargaSatuanKecil ?? '-',
    'Satuan Kecil': b.satuanKecil ?? '-',
    'Isi Per Bungkus': b.jumlahPerSatuan ?? '-',
    'Harga Per Kg': b.hargaPerKg ?? '-',
    'Stok': b.stok,
    'Status Stok': b.stok <= 5 ? 'Hampir Habis' : 'Aman',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = [
    { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
    { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Stok Barang')
  const tanggal = new Date().toLocaleDateString('id-ID').replace(/\//g, '-')
  XLSX.writeFile(wb, `Stok-Barang-${tanggal}.xlsx`)
}
</script>

<style></style>