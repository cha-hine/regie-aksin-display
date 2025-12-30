<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import pb from '@/lib/pocketbase'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)

const login = async () => {
  loading.value = true
  error.value = null

  try {
    // ➜ OPTION 1 : login avec un admin PocketBase (email + mdp admin)
    // await pb.admins.authWithPassword(email.value, password.value)

    // ➜ OPTION 2 : login avec une collection "users" de type auth :
    await pb.collection('users').authWithPassword(email.value, password.value)

    router.push({ name: 'admin-dashboard' })
  } catch (e) {
    error.value = e?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <h1>Connexion Admin</h1>

    <form @submit.prevent="login">
      <div>
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>

      <div>
        <label>Mot de passe</label>
        <input v-model="password" type="password" required />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>

      <p v-if="error" style="color: red">{{ error }}</p>
    </form>
  </div>
</template>
