import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CallFoodItem } from '@/components/CallFoodItem'
import { useMenu, groupMenuByFohSections } from '@/hooks/useMenu'
import { createTicket, type Ticket } from '@/api/tickets'
import { useRemainingSeconds } from '@/hooks/useRemainingSeconds'
import type { SocketState, SnapshotTicket } from '@/hooks/useSocket'
import type { MenuItem } from '@/api/menu'

/** True if there is an active call for this item (waiting or timer running) — block until cook completes. */
function hasActiveCallForItem(myCalls: SnapshotTicket[], item: MenuItem): boolean {
  return myCalls.some(
    (t) =>
      (t.itemTitleSnapshot === item.title || t.itemTitleSnapshot === `${item.title} (${item.code})`) &&
      t.station === item.station &&
      t.state !== 'completed'
  )
}

/** Get the active ticket for this item (if any) */
function getActiveTicketForItem(myCalls: SnapshotTicket[], item: MenuItem): SnapshotTicket | undefined {
  return myCalls.find(
    (t) =>
      (t.itemTitleSnapshot === item.title || t.itemTitleSnapshot === `${item.title} (${item.code})`) &&
      t.station === item.station &&
      t.state !== 'completed'
  )
}

function toSnapshotTicket(t: Ticket): SnapshotTicket {
  return {
    id: t.id,
    station: t.station,
    seq: t.stationSeq,
    state: t.state,
    source: t.source,
    itemTitleSnapshot: t.itemTitleSnapshot,
    batchSizeSnapshot: t.batchSizeSnapshot,
    durationSeconds: t.durationSeconds,
    durationSnapshot: t.durationSnapshot,
    startedAt: t.startedAt,
  }
}

function MyCallRow({ ticket, offsetMs }: { ticket: SnapshotTicket; offsetMs: number }) {
  const remaining = useRemainingSeconds(
    ticket.startedAt,
    ticket.durationSeconds ?? ticket.durationSnapshot,
    offsetMs
  )
  const isQualityCheck = remaining !== null && remaining <= 0

  let status = 'Waiting'
  let variant: 'secondary' | 'default' | 'outline' = 'secondary'
  if (ticket.state === 'completed') {
    status = 'Done'
    variant = 'outline'
  } else if (ticket.state === 'started') {
    status = isQualityCheck ? 'Quality check' : `${Math.floor((remaining ?? 0) / 60)}:${String((remaining ?? 0) % 60).padStart(2, '0')}`
    variant = isQualityCheck ? 'default' : 'default'
  }

  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b border-border">
      <span className="text-foreground truncate min-w-0">
        {ticket.itemTitleSnapshot} × {ticket.batchSizeSnapshot}
      </span>
      <Badge variant={variant} className={isQualityCheck ? 'bg-orange-500 hover:bg-orange-500 shrink-0' : ''}>
        {status}
      </Badge>
    </li>
  )
}

type Props = { socketState: SocketState }

export function ScreenFOH({ socketState }: Props) {
  const { menu, loading, error } = useMenu(socketState.menuVersion)
  const [lastError, setLastError] = useState<string | null>(null)
  const [optimisticTickets, setOptimisticTickets] = useState<SnapshotTicket[]>([])
  const { tickets, completedTickets, offsetMs, snapshot, isInitializing } = socketState
  const hasReceivedSnapshot = snapshot !== null

  const byId = new Map<number, SnapshotTicket>()
  for (const t of optimisticTickets) byId.set(t.id, t)
  for (const t of tickets) byId.set(t.id, t)
  for (const t of completedTickets) byId.set(t.id, t)
  const myCalls = Array.from(byId.values()).sort((a, b) => b.seq - a.seq)

  const handleCall = async (menuItemId: number, batchSize: string) => {
    setLastError(null)
    try {
      const ticket = await createTicket({
        menuItemId,
        batchSize,
        source: 'foh',
      })
      setOptimisticTickets((prev) => [toSnapshotTicket(ticket), ...prev].slice(0, 20))
    } catch (e) {
      setLastError(e instanceof Error ? e.message : 'Failed to call')
    }
  }

  if (loading) return <div className="p-6 text-muted-foreground">Loading menu…</div>
  if (error) return <div className="p-6 text-destructive">{error}</div>
  if (!menu) return null

  const { section1, section2, section3 } = groupMenuByFohSections(menu.items)

  function CallFoodItemWithTimer({ item }: { item: MenuItem }) {
    const activeTicket = getActiveTicketForItem(myCalls, item)
    const remaining = useRemainingSeconds(
      activeTicket?.startedAt,
      activeTicket?.durationSeconds ?? activeTicket?.durationSnapshot,
      offsetMs
    )
    
    const activeForItem = hasActiveCallForItem(myCalls, item)
    const disabled = isInitializing || !hasReceivedSnapshot || activeForItem
    
    let disabledReason: string | undefined
    if (isInitializing) {
      disabledReason = "Loading…"
    } else if (!hasReceivedSnapshot) {
      disabledReason = 'Connecting…'
    } else if (activeForItem && activeTicket) {
      if (activeTicket.state === 'created') {
        disabledReason = 'Waiting to start'
      } else if (remaining !== null && remaining > 0) {
        const mins = Math.floor(remaining / 60)
        const secs = remaining % 60
        disabledReason = `${mins}:${String(secs).padStart(2, '0')} remaining`
      } else {
        disabledReason = 'Quality check in progress'
      }
    }
    
    return (
      <CallFoodItem
        item={item}
        onCall={handleCall}
        disabled={disabled}
        disabledReason={disabledReason}
      />
    )
  }

  function Section({ title, items }: { title: string; items: typeof section1 }) {
    if (items.length === 0) return null
    return (
      <section>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {items.map((item) => (
            <CallFoodItemWithTimer key={item.id} item={item} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {lastError && (
        <div className="text-destructive text-sm bg-destructive/10 p-2 rounded">
          {lastError}
        </div>
      )}
      <Section title="Section 1" items={section1} />
      <Section title="Section 2" items={section2} />
      <Section title="Section 3" items={section3} />
      {myCalls.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">My calls</h2>
          <ul className="text-sm space-y-2">
            {myCalls.map((t) => (
              <MyCallRow key={t.id} ticket={t} offsetMs={offsetMs} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
