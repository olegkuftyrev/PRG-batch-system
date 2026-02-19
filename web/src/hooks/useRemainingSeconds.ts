import { useEffect, useState } from 'react'

/**
 * Returns remaining seconds for a timer, or null if not started.
 * Updates every second. Returns 0 when done (quality check).
 */
export function useRemainingSeconds(
  startedAtMs: number | undefined,
  durationSeconds: number | undefined,
  offsetMs: number
): number | null {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (startedAtMs == null || durationSeconds == null) {
      setRemaining(null)
      return
    }

    function compute() {
      if (startedAtMs == null || durationSeconds == null) return 0
      const serverNowSec = (Date.now() + offsetMs) / 1000
      const startedAtSec = startedAtMs / 1000
      const elapsed = serverNowSec - startedAtSec
      return Math.max(0, Math.round(durationSeconds - elapsed))
    }

    setRemaining(compute())
    const id = setInterval(() => setRemaining(compute()), 1000)
    return () => clearInterval(id)
  }, [startedAtMs, durationSeconds, offsetMs])

  return remaining
}
