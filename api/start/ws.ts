import app from '@adonisjs/core/services/app'
import Ws from '#services/ws'
import { rescheduleOnBoot } from '#services/timer'
import Ticket from '#models/ticket'
import MenuVersion from '#models/menu_version'

const STATIONS = ['stirfry', 'fryer', 'sides', 'grill']
const SOURCE_ROOMS = ['foh', 'drive_thru']
const ALL_ROOMS = [...STATIONS, ...SOURCE_ROOMS]

function ticketToSnapshot(t: Ticket) {
  return {
    id: t.id,
    station: t.station,
    seq: t.stationSeq,
    state: t.state,
    source: t.source,
    startedAt: t.startedAt?.toMillis(),
    durationSeconds: t.durationSeconds,
    menuVersionAtCall: t.menuVersionAtCall,
    itemTitleSnapshot: t.itemTitleSnapshot,
    batchSizeSnapshot: t.batchSizeSnapshot,
    durationSnapshot: t.durationSnapshot,
  }
}

app.ready(async () => {
  Ws.boot()
  const io = Ws.io!

  async function buildSnapshot(rooms: string[]) {
    const versionRow = await MenuVersion.query().first()
    const menuVersion = versionRow?.version ?? 1
    const stationRooms = rooms.filter((s) => STATIONS.includes(s))
    const sourceRooms = rooms.filter((s) => SOURCE_ROOMS.includes(s))

    let tickets: ReturnType<typeof ticketToSnapshot>[] = []
    let completedTickets: ReturnType<typeof ticketToSnapshot>[] = []

    if (stationRooms.length > 0) {
      const byStation = await Ticket.query()
        .whereIn('station', stationRooms)
        .whereNot('state', 'completed')
        .orderBy('station_day', 'desc')
        .orderBy('station_seq', 'desc')
      tickets = [...tickets, ...byStation.map(ticketToSnapshot)]
    }

    if (sourceRooms.length > 0) {
      const bySource = await Ticket.query()
        .whereIn('source', sourceRooms)
        .whereNot('state', 'completed')
        .orderBy('station_day', 'desc')
        .orderBy('station_seq', 'desc')
      
      const ticketMap = new Map<number, ReturnType<typeof ticketToSnapshot>>()
      for (const t of tickets) ticketMap.set(t.id, t)
      for (const t of bySource.map(ticketToSnapshot)) ticketMap.set(t.id, t)
      tickets = Array.from(ticketMap.values())
      
      const completed = await Ticket.query()
        .whereIn('source', sourceRooms)
        .where('state', 'completed')
        .orderBy('updatedAt', 'desc')
        .limit(20)
      completedTickets = completed.map(ticketToSnapshot)
    }

    return {
      tickets,
      completedTickets,
      menuVersion,
      serverNowMs: Date.now(),
    }
  }

  io.on('connection', (socket) => {
    socket.on('join', async (rooms: string[]) => {
      if (!Array.isArray(rooms)) return
      for (const s of ALL_ROOMS) {
        socket.leave(s)
      }
      const valid = rooms.filter((s) => ALL_ROOMS.includes(s))
      for (const s of valid) {
        socket.join(s)
      }
      const snapshot = await buildSnapshot(valid)
      socket.emit('snapshot', snapshot)
    })
  })

  await rescheduleOnBoot()
})

    socket.on('ping', () => {
      socket.emit('pong', { serverNowMs: Date.now() })
    })
