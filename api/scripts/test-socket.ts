/**
 * Quick Socket.IO test. Run: npx tsx scripts/test-socket.ts
 */
import { io } from 'socket.io-client'

const socket = io('http://127.0.0.1:3333')

socket.on('connect', () => {
  console.log('Connected:', socket.id)
  socket.emit('join', ['stirfry'])
})

socket.on('snapshot', (data) => {
  console.log('Snapshot:', JSON.stringify(data, null, 2))
})

socket.on('ticket_created', (data) => {
  console.log('ticket_created:', data)
})

socket.on('timer_started', (data) => {
  console.log('timer_started:', data)
})

socket.on('timer_ended', (data) => {
  console.log('timer_ended:', data)
})

socket.on('ticket_completed', (data) => {
  console.log('ticket_completed:', data)
})

socket.on('disconnect', () => {
  console.log('Disconnected')
})

// Keep running
setTimeout(() => {
  console.log('Done (10s)')
  socket.disconnect()
  process.exit(0)
}, 10000)
