import { useState } from 'react'
import { ScreenNav } from '@/components/ScreenNav'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'
import type { ScreenId } from '@/types/screen'
import './App.css'

function App() {
  const [screen, setScreen] = useState<ScreenId>(1)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ScreenNav current={screen} onSelect={setScreen} />

      <ScreenPlaceholder screen={screen} />
    </div>
  )
}

export default App
