import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsable } from '@/components/ui/collapsible'
import { startTicket, completeTicket } from '@/api/tickets'
import type { SnapshotTicket, SocketState } from '@/hooks/useSocket'
import { useRemainingSeconds } from '@/hooks/useRemainingSeconds'
import { useMenu } from '@/hooks/useMenu'
import type { ScreenId } from '@/types/screen'
import { cn } from '@/lib/utils'

const TITLE_BY_SCREEN: Record<ScreenId, string> = {
  1: '',
  2: '',
  3: 'Stir fry',
  4: 'Fryer',
  5: 'Sides + Grill',
  menu: '',
}

/** Simple beep via Web Audio */
function playQualityCheckSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Ignore audio errors
  }
}

/** Parse code and title from itemTitleSnapshot like "Super Greens (V1)" */
function parseItemSnapshot(snapshot: string): { code: string; title: string } {
  const match = snapshot.match(/^(.+?)\s*\(([^)]+)\)$/)
  if (match) {
    return { title: match[1].trim(), code: match[2].trim() }
  }
  return { title: snapshot, code: '' }
}

function BatchRow({
  ticket,
  offsetMs,
  onStart,
  onComplete,
  playedSoundRef,
}: {
  ticket: SnapshotTicket
  offsetMs: number
  onStart: (id: number) => void
  onComplete: (id: number) => void
  playedSoundRef: React.MutableRefObject<Set<number>>
}) {
  const remaining = useRemainingSeconds(ticket.startedAt, ticket.durationSeconds ?? ticket.durationSnapshot, offsetMs)
  const isQualityCheck = remaining !== null && remaining <= 0

  useEffect(() => {
    if (isQualityCheck && !playedSoundRef.current.has(ticket.id)) {
      playedSoundRef.current.add(ticket.id)
      playQualityCheckSound()
    }
  }, [isQualityCheck, ticket.id, playedSoundRef])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} MIN ${secs} SEC`
  }

  const getWaitingTime = () => {
    if (!ticket.createdAt) return null
    const now = Date.now() - offsetMs
    const elapsedMs = now - ticket.createdAt
    const elapsedSec = Math.floor(elapsedMs / 1000)
    return elapsedSec > 0 ? elapsedSec : 0
  }

  const getResponseTime = () => {
    if (!ticket.createdAt || !ticket.startedAt) return null
    const responseMs = ticket.startedAt - ticket.createdAt
    const responseSec = Math.floor(responseMs / 1000)
    return responseSec > 0 ? responseSec : 0
  }

  if (ticket.state === 'created') {
    const waitingSec = getWaitingTime()
    return (
      <div className="flex items-center justify-between py-3 px-4 border-b border-border last:border-0">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-sm">BATCH {ticket.batchSizeSnapshot}</span>
          {waitingSec !== null && (
            <span className="text-xs text-amber-600">Waiting: {formatTime(waitingSec)}</span>
          )}
        </div>
        <Button size="sm" onClick={() => onStart(ticket.id)}>
          Start
        </Button>
      </div>
    )
  }

  if (ticket.state === 'started') {
    const responseSec = getResponseTime()
    return (
      <div className={cn(
        "flex items-center justify-between py-3 px-4 border-b border-border last:border-0",
        isQualityCheck && "bg-orange-50"
      )}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">BATCH {ticket.batchSizeSnapshot}</span>
            {isQualityCheck ? (
              <span className="text-orange-600 font-semibold text-xs">QUALITY CHECK</span>
            ) : (
              <span className="text-muted-foreground text-xs tabular-nums">{formatTime(remaining ?? 0)}</span>
            )}
          </div>
          {responseSec !== null && (
            <span className="text-xs text-muted-foreground">Response: {formatTime(responseSec)}</span>
          )}
        </div>
        <Button size="sm" variant={isQualityCheck ? "default" : "outline"} onClick={() => onComplete(ticket.id)}>
          Complete
        </Button>
      </div>
    )
  }

  return null
}

function ItemCard({
  code,
  title,
  tickets,
  offsetMs,
  onStart,
  onComplete,
  playedSoundRef,
  color,
}: {
  code: string
  title: string
  tickets: SnapshotTicket[]
  offsetMs: number
  onStart: (id: number) => void
  onComplete: (id: number) => void
  playedSoundRef: React.MutableRefObject<Set<number>>
  color?: string | null
}) {
  const colorClass = 
    color === 'blue' ? 'bg-blue-500 text-white' :
    color === 'red' ? 'bg-red-500 text-white' :
    color === 'green' ? 'bg-green-500 text-white' :
    color === 'orange' ? 'bg-orange-500 text-white' :
    'bg-green-500 text-white'

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`font-bold text-sm px-3 py-1 rounded ${colorClass}`}>
            {code}
          </div>
          <h3 className="font-semibold text-lg uppercase tracking-wide">{title}</h3>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {tickets.map((ticket) => (
          <BatchRow
            key={ticket.id}
            ticket={ticket}
            offsetMs={offsetMs}
            onStart={onStart}
            onComplete={onComplete}
            playedSoundRef={playedSoundRef}
          />
        ))}
      </CardContent>
    </Card>
  )
}

type Props = {
  screen: ScreenId
  socketState: SocketState
}

export function ScreenBOH({ screen, socketState }: Props) {
  const { tickets, completedTickets, offsetMs, menuVersion } = socketState
  const { menu } = useMenu(menuVersion)
  const playedSoundRef = useRef<Set<number>>(new Set())
  
  const getItemColor = (code: string) => {
    if (!menu) return null
    const item = menu.items.find(i => i.code === code)
    return item?.color ?? null
  }

  const handleStart = async (id: number) => {
    try {
      await startTicket(id)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to start')
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await completeTicket(id)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to complete')
    }
  }

  // Group tickets by item (code + title)
  const groupByItem = (ticketList: SnapshotTicket[]) => {
    const groups = new Map<string, { code: string; title: string; tickets: SnapshotTicket[] }>()
    
    for (const ticket of ticketList) {
      const { code, title } = parseItemSnapshot(ticket.itemTitleSnapshot ?? '')
      const key = `${code}|${title}`
      
      if (!groups.has(key)) {
        groups.set(key, { code, title, tickets: [] })
      }
      groups.get(key)!.tickets.push(ticket)
    }
    
    // Sort tickets within each group by seq asc (oldest first)
    for (const group of groups.values()) {
      group.tickets.sort((a, b) => a.seq - b.seq)
    }
    
    return Array.from(groups.values())
  }

  const waiting = tickets.filter((t) => t.state === 'created')
  const inProgress = tickets.filter((t) => t.state === 'started')
  
  const waitingGroups = groupByItem(waiting)
  const inProgressGroups = groupByItem(inProgress)

  const title = TITLE_BY_SCREEN[screen]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {title && (
        <h1 className="text-xl font-semibold px-4 pt-4">{title}</h1>
      )}

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <h2 className="text-lg font-semibold px-4 py-3 border-b border-border shrink-0">In progress</h2>
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
            {inProgressGroups.length === 0 ? (
              <p className="text-muted-foreground text-sm">No timers running</p>
            ) : (
              inProgressGroups.map((group) => (
                <ItemCard
                  key={`${group.code}-${group.title}`}
                  code={group.code}
                  title={group.title}
                  tickets={group.tickets}
                  offsetMs={offsetMs}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  playedSoundRef={playedSoundRef}
                  color={getItemColor(group.code)}
                />
              ))
            )}
          </div>
        </section>

        <section className="flex-1 flex flex-col overflow-hidden">
          <h2 className="text-lg font-semibold px-4 py-3 border-b border-border shrink-0">Waiting</h2>
          <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
            {waitingGroups.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tickets waiting</p>
            ) : (
              waitingGroups.map((group) => (
                <ItemCard
                  key={`${group.code}-${group.title}`}
                  code={group.code}
                  title={group.title}
                  tickets={group.tickets}
                  offsetMs={offsetMs}
                  onStart={handleStart}
                  onComplete={handleComplete}
                  playedSoundRef={playedSoundRef}
                  color={getItemColor(group.code)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <section className="border-t border-border shrink-0 px-4 py-3">
        <Collapsable
          title="Completed"
          count={completedTickets.length}
          defaultOpen={false}
        >
          <div className="flex flex-col gap-1 mt-2">
            {completedTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm">No completed tickets</p>
            ) : (
              completedTickets.slice(0, 20).map((t) => (
                <div key={t.id} className="text-sm text-muted-foreground py-1">
                  Batch {t.batchSizeSnapshot} - {t.itemTitleSnapshot} _{t.seq}
                </div>
              ))
            )}
          </div>
        </Collapsable>
      </section>
    </div>
  )
}
