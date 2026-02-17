import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import type { ScreenId } from '@/types/screen'

const ROOMS_BY_SCREEN: Record<ScreenId, string[]> = {
  1: ['foh'],
  2: ['drive_thru'],
  3: ['stirfry'],
  4: ['fryer'],
  5: ['sides', 'grill'],
  menu: [],
}

export type SnapshotTicket = {
  id: number
  station: string
  seq: number
  state: string
  source?: string
  startedAt?: number
  durationSeconds?: number
  menuVersionAtCall?: number
  itemTitleSnapshot?: string
  batchSizeSnapshot?: string
  durationSnapshot?: number
}

export type Snapshot = {
  tickets: SnapshotTicket[]
  completedTickets?: SnapshotTicket[]
  menuVersion: number
  serverNowMs: number
}

export type SocketState = {
  connected: boolean
  offsetMs: number
  snapshot: Snapshot | null
  tickets: SnapshotTicket[]
  completedTickets: SnapshotTicket[]
  menuVersion: number
}

/** Normalize socket/API payload (snake_case or camelCase) to SnapshotTicket. */
function toTicket(t: unknown): SnapshotTicket {
  const o = t as Record<string, unknown>
  const startedAt = o.startedAt ?? o.started_at
  const startedMs =
    typeof startedAt === 'number' ? startedAt : typeof startedAt === 'string' ? new Date(startedAt).getTime() : undefined
  return {
    id: (o.id as number) ?? 0,
    station: (o.station as string) ?? '',
    seq: (o.stationSeq ?? o.station_seq ?? o.seq) as number,
    state: (o.state as string) ?? 'created',
    source: (o.source as string) ?? undefined,
    startedAt: startedMs,
    durationSeconds: (o.durationSeconds ?? o.duration_seconds) as number | undefined,
    menuVersionAtCall: (o.menuVersionAtCall ?? o.menu_version_at_call) as number | undefined,
    itemTitleSnapshot: (o.itemTitleSnapshot ?? o.item_title_snapshot) as string | undefined,
    batchSizeSnapshot: (o.batchSizeSnapshot ?? o.batch_size_snapshot) as string | undefined,
    durationSnapshot: (o.durationSnapshot ?? o.duration_snapshot) as number | undefined,
  }
}

export function useSocket(screen: ScreenId) {
  const roomsRef = useRef(ROOMS_BY_SCREEN[screen])
  roomsRef.current = ROOMS_BY_SCREEN[screen]
  const [state, setState] = useState<SocketState>({
    connected: false,
    offsetMs: 0,
    snapshot: null,
    tickets: [],
    completedTickets: [],
    menuVersion: 0,
  })
  const socketRef = useRef<ReturnType<typeof io> | null>(null)

  useEffect(() => {
    const socket = io({ path: '/socket.io' })
    socketRef.current = socket

    socket.on('connect', () => {
      setState((s) => ({ ...s, connected: true }))
    })

    socket.on('disconnect', () => {
      setState((s) => ({ ...s, connected: false }))
    })

    socket.on('snapshot', (data: Snapshot) => {
      const offsetMs = data.serverNowMs - Date.now()
      const rawTickets = data.tickets ?? []
      const rawCompleted = data.completedTickets ?? []
      const tickets = rawTickets.map((t) => toTicket(t))
      const completedTickets = rawCompleted.map((t) => toTicket(t))
      setState((s) => ({
        ...s,
        offsetMs,
        snapshot: { ...data, tickets, completedTickets },
        tickets,
        completedTickets,
        menuVersion: data.menuVersion ?? s.menuVersion,
      }))
    })

    socket.on('menu_updated', (data: { version?: number }) => {
      const v = data?.version
      if (typeof v === 'number') {
        setState((s) => ({ ...s, menuVersion: v }))
      }
    })

    socket.on('ticket_created', (data: unknown) => {
      const t = toTicket(data)
      const rooms = roomsRef.current
      const match = rooms.includes(t.station) || (t.source && rooms.includes(t.source))
      if (!match) return
      setState((s) => ({
        ...s,
        tickets: [t, ...s.tickets],
      }))
    })

    socket.on('timer_started', (data: { ticketId: number; startedAt: number; durationSeconds: number }) => {
      setState((s) => ({
        ...s,
        tickets: s.tickets.map((t) =>
          t.id === data.ticketId
            ? { ...t, state: 'started', startedAt: data.startedAt, durationSeconds: data.durationSeconds }
            : t
        ),
      }))
    })

    socket.on('ticket_completed', (data: unknown) => {
      const t = toTicket(data)
      const rooms = roomsRef.current
      const match = rooms.includes(t.station) || (t.source && rooms.includes(t.source))
      if (!match) return
      setState((s) => ({
        ...s,
        tickets: s.tickets.filter((x) => x.id !== t.id),
        completedTickets: [{ ...t, state: 'completed' }, ...s.completedTickets].slice(0, 50),
      }))
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket?.connected) return
    socket.emit('join', roomsRef.current)
  }, [screen, state.connected])

  return state
}
