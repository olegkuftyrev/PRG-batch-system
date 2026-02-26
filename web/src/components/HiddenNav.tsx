import { useState } from 'react'
import { ScreenNav } from './ScreenNav'
import type { ScreenId } from '@/types/screen'
import { cn } from '@/lib/utils'

type Props = {
  current: ScreenId
  onSelect: (screen: ScreenId) => void
}

export function HiddenNav({ current, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleNav = () => setIsOpen(!isOpen)

  const handleSelect = (screen: ScreenId) => {
    onSelect(screen)
    setIsOpen(false)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <button
        type="button"
        onClick={toggleNav}
        className="w-full h-8 bg-background border-b flex items-center justify-center text-xs text-muted-foreground hover:bg-accent transition-colors relative group"
        aria-label="Toggle menu"
      >
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <span className="flex-1 h-px bg-border" />
          <span className="px-4 bg-background z-10">menu</span>
          <span className="flex-1 h-px bg-border" />
        </span>
      </button>

      <div
        className={cn(
          'absolute top-8 left-0 right-0 bg-background border-b shadow-lg transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ScreenNav current={current} onSelect={handleSelect} />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 top-[calc(200px+2rem)]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
