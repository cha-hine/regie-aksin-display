import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_STRAPI_API_URL || 'http://127.0.0.1:1337',
})

export default api
