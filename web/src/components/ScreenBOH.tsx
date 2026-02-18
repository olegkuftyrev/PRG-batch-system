import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { startTicket, completeTicket } from '@/api/tickets'
import type { SnapshotTicket, SocketState } from '@/hooks/useSocket'
import { useRemainingSeconds } from '@/hooks/useRemainingSeconds'
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

function BOHTicket({
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

  if (ticket.state === 'created') {
    return (
      <Card className="border-0">
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">Batch {ticket.batchSizeSnapshot} - {ticket.itemTitleSnapshot} _{ticket.seq}</span>
            <Button size="sm" onClick={() => onStart(ticket.id)}>
              Start
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (ticket.state === 'started') {
    return (
      <Card className={cn('border-0', isQualityCheck && 'ring-2 ring-orange-500')}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">Batch {ticket.batchSizeSnapshot} - {ticket.itemTitleSnapshot} _{ticket.seq}</span>
            {isQualityCheck ? (
              <span className="text-orange-600 font-semibold">Quality check</span>
            ) : (
              <span className="tabular-nums">{Math.floor((remaining ?? 0) / 60)}:{(remaining ?? 0) % 60 < 10 ? '0' : ''}{(remaining ?? 0) % 60}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="py-2 px-3 pt-0">
          <Button size="sm" className="w-full" onClick={() => onComplete(ticket.id)}>
            Complete
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}

type Props = {
  screen: ScreenId
  socketState: SocketState
}

export function ScreenBOH({ screen, socketState }: Props) {
  const { tickets, completedTickets, offsetMs } = socketState
  const playedSoundRef = useRef<Set<number>>(new Set())

  const handleStart = async (id: number) => {
    try {
      await startTicket(id)
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Failed to start')
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await completeTicket(id)
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : 'Failed to complete')
    }
  }

  const waiting = tickets.filter((t) => t.state === 'created').sort((a, b) => b.seq - a.seq)
  const inProgress = tickets.filter((t) => t.state === 'started').sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))

  const title = TITLE_BY_SCREEN[screen]

  return (
    <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
      {title && (
        <h1 className="text-xl font-semibold">{title}</h1>
      )}
      <section>
        <h2 className="text-lg font-semibold mb-2">Waiting</h2>
        <div className="flex flex-col gap-2">
          {waiting.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tickets waiting</p>
          ) : (
            waiting.map((t) => (
              <BOHTicket
                key={t.id}
                ticket={t}
                offsetMs={offsetMs}
                onStart={handleStart}
                onComplete={handleComplete}
                playedSoundRef={playedSoundRef}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">In progress</h2>
        <div className="flex flex-col gap-2">
          {inProgress.length === 0 ? (
            <p className="text-muted-foreground text-sm">No timers running</p>
          ) : (
            inProgress.map((t) => (
              <BOHTicket
                key={t.id}
                ticket={t}
                offsetMs={offsetMs}
                onStart={handleStart}
                onComplete={handleComplete}
                playedSoundRef={playedSoundRef}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-auto pt-4 border-t">
        <h2 className="text-lg font-semibold mb-2">Completed</h2>
        <div className="flex flex-col gap-1">
          {completedTickets.length === 0 ? (
            <p className="text-muted-foreground text-sm">No completed tickets</p>
          ) : (
            completedTickets.slice(0, 10).map((t) => (
              <div key={t.id} className="text-sm text-muted-foreground py-1">
                Batch {t.batchSizeSnapshot} - {t.itemTitleSnapshot} _{t.seq}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
