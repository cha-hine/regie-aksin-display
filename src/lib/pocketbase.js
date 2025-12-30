// src/lib/pocketbase.js
import PocketBase from 'pocketbase'

// URL de ton instance PocketBase (ex: http://127.0.0.1:8090 ou ton domaine)
const pb = new PocketBase(import.meta.env.VITE_PB_API_URL || 'http://127.0.0.1:8090')

// (optionnel) : si tu veux gérer les cookies plus tard
// pb.authStore.loadFromCookie(document.cookie)

export default pb
