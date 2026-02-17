import { useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

export function useServerTime(socket: Socket | null, connected: boolean) {
  const [offsetMs, setOffsetMs] = useState(0)
  const measurementsRef = useRef<number[]>([])
  
  useEffect(() => {
    if (!socket || !connected) return
    
    const measureOffset = () => {
      const clientSendTime = Date.now()
      
      socket.once('pong', (data: { serverNowMs: number }) => {
        const clientReceiveTime = Date.now()
        const rtt = clientReceiveTime - clientSendTime
        const serverTime = data.serverNowMs
        const estimatedServerNow = serverTime + rtt / 2
        const newOffset = estimatedServerNow - clientReceiveTime
        
        measurementsRef.current.push(newOffset)
        if (measurementsRef.current.length > 5) {
          measurementsRef.current.shift()
        }
        
        const avg = measurementsRef.current.reduce((a, b) => a + b, 0) / measurementsRef.current.length
        setOffsetMs((prev) => (prev === 0 ? avg : 0.7 * prev + 0.3 * avg))
      })
      
      socket.emit('ping')
    }
    
    measureOffset()
    
    const interval = setInterval(measureOffset, 30000)
    
    return () => clearInterval(interval)
  }, [socket, connected])
  
  return offsetMs
}
