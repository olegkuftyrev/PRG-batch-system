import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CollapsableProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  count?: number
  className?: string
}

export function Collapsable({ title, children, defaultOpen = false, count, className }: CollapsableProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('transition-transform', isOpen ? 'rotate-90' : 'rotate-0')}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="font-medium">{title}</span>
          {count !== undefined && (
            <span className="text-sm text-muted-foreground">({count})</span>
          )}
        </div>
      </button>
      
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
