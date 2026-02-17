import { useState } from 'react'
import { ScreenNav } from '@/components/ScreenNav'
import { ScreenContent } from '@/components/ScreenContent'
import { useSocket } from '@/hooks/useSocket'
import type { ScreenId } from '@/types/screen'
import './App.css'

function App() {
  const [screen, setScreen] = useState<ScreenId>(1)
  const socketState = useSocket(screen)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScreenNav current={screen} onSelect={setScreen} />

      <main className="flex-1 overflow-hidden flex flex-col">
        <ScreenContent screen={screen} socketState={socketState} />
      </main>
    </div>
  )
}

export default App
