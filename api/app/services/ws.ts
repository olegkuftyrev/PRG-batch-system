import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'

/**
 * Socket.IO service. Boot after HTTP server is ready.
 * Rooms: stirfry, fryer, sides, grill
 */
class WsService {
  io: Server | undefined
  #booted = false

  boot() {
    if (this.#booted) return
    this.#booted = true
    const nodeServer = server.getNodeServer()
    if (!nodeServer) {
      console.warn('HTTP server not ready, skipping WebSocket initialization')
      return
    }
    this.io = new Server(nodeServer, {
      cors: { origin: '*' },
      path: '/socket.io',
    })
  }

  /** Broadcast to a station room */
  toStation(station: string, event: string, data: unknown) {
    if (this.io) this.io.to(station).emit(event, data)
  }

  /** Broadcast to all (e.g. menu_updated) */
  broadcast(event: string, data: unknown) {
    if (this.io) this.io.emit(event, data)
  }
}

export default new WsService()
