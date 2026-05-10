<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">🏪</div>
        <h1 class="text-white font-bold text-2xl">Warung Saya</h1>
        <p class="text-slate-400 text-sm mt-1">Masuk untuk melanjutkan</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="font-bold text-slate-800 text-lg mb-6">Login</h2>

        <div class="flex flex-col gap-4">
          <div>
            <label class="text-xs font-medium text-slate-500 mb-1.5 block">Username</label>
            <input
              v-model="form.username"
              @keyup.enter="login"
              placeholder="Masukkan username"
              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-500 mb-1.5 block">Password</label>
            <input
              v-model="form.password"
              @keyup.enter="login"
              type="password"
              placeholder="Masukkan password"
              class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
            {{ error }}
          </div>

          <button
            @click="login"
            :disabled="loading"
            class="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-xl transition text-sm mt-1"
          >
            {{ loading ? 'Masuk...' : 'Masuk' }}
          </button>
        </div>
      </div>

      <p class="text-center text-slate-500 text-xs mt-6">Warung Saya © 2026</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function login() {
  if (!form.value.username || !form.value.password) {
    error.value = 'Username dan password wajib diisi'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value.username, form.value.password)
    router.push('/kasir')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Username atau password salah'
  }
  loading.value = false
}
</script>

<style></style>