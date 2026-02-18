// src/services/socket.ts
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_STRAPI_UPLOAD_URL, {
  transports: ['websocket'],
})

export default socket
