// src/services/socket.ts
import { io } from 'socket.io-client'

const socket = io('http://localhost:1337', {
  //transports: ['websocket'],
})

export default socket
