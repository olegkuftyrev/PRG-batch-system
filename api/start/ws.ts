import app from '@adonisjs/core/services/app'
import Ws from '#services/ws'
import { rescheduleOnBoot } from '#services/timer'
import Ticket from '#models/ticket'
import MenuVersion from '#models/menu_version'

const STATIONS = ['stirfry', 'fryer', 'sides', 'grill']

app.ready(async () => {
  Ws.boot()
  const io = Ws.io!

  async function buildSnapshot(stations: string[]) {
    const tickets = await Ticket.query()
      .whereIn('station', stations)
      .whereNot('state', 'completed')
      .orderBy('station_day', 'desc')
      .orderBy('station_seq', 'desc')
    const versionRow = await MenuVersion.query().first()
    return {
      tickets: tickets.map((t) => ({
        id: t.id,
        station: t.station,
        seq: t.stationSeq,
        state: t.state,
        startedAt: t.startedAt?.toMillis(),
        durationSeconds: t.durationSeconds,
        menuVersionAtCall: t.menuVersionAtCall,
        itemTitleSnapshot: t.itemTitleSnapshot,
        batchSizeSnapshot: t.batchSizeSnapshot,
        durationSnapshot: t.durationSnapshot,
      })),
      menuVersion: versionRow?.version ?? 1,
      serverNowMs: Date.now(),
    }
  }

  io.on('connection', (socket) => {
    socket.on('join', async (stations: string[]) => {
      if (!Array.isArray(stations)) return
      const valid = stations.filter((s) => STATIONS.includes(s))
      for (const s of valid) {
        socket.join(s)
      }
      const snapshot = await buildSnapshot(valid)
      socket.emit('snapshot', snapshot)
    })
  })

  await rescheduleOnBoot()
})
