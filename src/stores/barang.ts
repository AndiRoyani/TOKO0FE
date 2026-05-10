import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/axios';

export const useBarangStore = defineStore('barang', () => {
  const barangList = ref<any[]>([]);
  const loading = ref(false);

  async function fetchBarang() {
    loading.value = true;
    const res = await api.get('/barang');
    barangList.value = res.data;
    loading.value = false;
  }

  async function tambahBarang(data: {
    nama: string;
    harga: number;
    stok: number;
    kategoriId: number;
  }) {
    const res = await api.post('/barang', data);
    barangList.value.push(res.data);
  }

  async function updateBarang(id: number, data: any) {
    const res = await api.put(`/barang/${id}`, data);
    const idx = barangList.value.findIndex((b) => b.id === id);
    if (idx !== -1) barangList.value[idx] = res.data;
  }

  async function hapusBarang(id: number) {
    await api.delete(`/barang/${id}`);
    barangList.value = barangList.value.filter((b) => b.id !== id);
  }

  return { barangList, loading, fetchBarang, tambahBarang, updateBarang, hapusBarang };
});