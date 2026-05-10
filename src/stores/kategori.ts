import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/axios';

export const useKategoriStore = defineStore('kategori', () => {
  const kategoriList = ref<any[]>([]);

  async function fetchKategori() {
    const res = await api.get('/kategori');
    kategoriList.value = res.data;
  }

  async function tambahKategori(nama: string) {
    const res = await api.post('/kategori', { nama });
    kategoriList.value.push(res.data);
  }

  return { kategoriList, fetchKategori, tambahKategori };
});