import { Server } from 'socket.io';
import server from '@adonisjs/core/services/server';
/**
 * Socket.IO service. Boot after HTTP server is ready.
 * Rooms: stirfry, fryer, sides, grill
 */
class WsService {
    io;
    #booted = false;
    boot() {
        if (this.#booted)
            return;
        this.#booted = true;
        const nodeServer = server.getNodeServer();
        if (!nodeServer)
            throw new Error('HTTP server not ready');
        this.io = new Server(nodeServer, {
            cors: { origin: '*' },
            path: '/socket.io',
        });
    }
    /** Broadcast to a station room */
    toStation(station, event, data) {
        if (this.io)
            this.io.to(station).emit(event, data);
    }
    /** Broadcast to all (e.g. menu_updated) */
    broadcast(event, data) {
        if (this.io)
            this.io.emit(event, data);
    }
}
export default new WsService();
