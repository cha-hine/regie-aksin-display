<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import pb from '@/lib/pocketbase'

const router = useRouter()

const articles = ref([])
const loading = ref(false)
const error = ref(null)

const newTitle = ref('')
const newContent = ref('')

// Logout admin
const logout = () => {
  pb.authStore.clear()
  router.push({ name: 'admin-login' })
}

// Récupérer les données depuis PocketBase (collection "articles")
const fetchArticles = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await pb.collection('articles').getList(1, 50, {
      sort: '-created',
    })
    articles.value = res.items
  } catch (e) {
    error.value = e?.message || 'Erreur de chargement des articles'
  } finally {
    loading.value = false
  }
}

// Création d’un nouvel article
const createArticle = async () => {
  try {
    const record = await pb.collection('articles').create({
      title: newTitle.value,
      content: newContent.value,
      published: false,
    })
    articles.value.unshift(record)
    newTitle.value = ''
    newContent.value = ''
  } catch (e) {
    alert(e?.message || 'Erreur lors de la création')
  }
}

// Suppression
const deleteArticle = async (id) => {
  if (!confirm('Supprimer cet article ?')) return
  try {
    await pb.collection('articles').delete(id)
    articles.value = articles.value.filter((a) => a.id !== id)
  } catch (e) {
    alert(e?.message || 'Erreur lors de la suppression')
  }
}

onMounted(fetchArticles)
</script>

<template>
  <div>
    <header style="display: flex; justify-content: space-between; align-items: center">
      <h1>Admin – Articles</h1>
      <button @click="logout">Déconnexion</button>
    </header>

    <section style="margin: 1.5rem 0">
      <h2>Créer un article</h2>
      <form @submit.prevent="createArticle">
        <div>
          <label>Titre</label>
          <input v-model="newTitle" required />
        </div>
        <div>
          <label>Contenu</label>
          <textarea v-model="newContent" required />
        </div>
        <button type="submit">Créer</button>
      </form>
    </section>

    <section>
      <h2>Liste des articles</h2>
      <p v-if="loading">Chargement…</p>
      <p v-if="error" style="color: red">{{ error }}</p>

      <table v-if="articles.length">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Publié</th>
            <th>Créé le</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in articles" :key="a.id">
            <td>{{ a.title }}</td>
            <td>{{ a.published ? 'Oui' : 'Non' }}</td>
            <td>{{ new Date(a.created).toLocaleString() }}</td>
            <td>
              <button @click="deleteArticle(a.id)">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>Pas encore d’articles.</p>
    </section>
  </div>
</template>
