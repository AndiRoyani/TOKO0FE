import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useTransaksiStore = defineStore('transaksi', () => {
  const transaksiList = ref<any[]>([])
  const laporan = ref<any>(null)
  const loading = ref(false)

  async function fetchHariIni() {
    loading.value = true
    const res = await api.get('/transaksi/hari-ini')
    transaksiList.value = res.data
    loading.value = false
  }

  async function fetchLaporan() {
    const res = await api.get('/transaksi/laporan')
    laporan.value = res.data
  }

  async function buatTransaksi(data: {
    bayar: number
    items: { barangId: number; qty: number }[]
  }) {
    const res = await api.post('/transaksi', data)
    transaksiList.value.unshift(res.data)
    return res.data
  }

  async function buatTransaksiManual(data: {
    bayar: number
    total: number
    kembalian: number
    items: { barangId: number; qty: number }[]
    detail: { barangId: number; qty: number; hargaSatuan: number; subtotal: number }[]
  }) {
    const res = await api.post('/transaksi/manual', data)
    transaksiList.value.unshift(res.data)
    return res.data
  }

  return { transaksiList, laporan, loading, fetchHariIni, fetchLaporan, buatTransaksi, buatTransaksiManual }
})