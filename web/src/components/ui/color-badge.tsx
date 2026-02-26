import { cn } from '@/lib/utils'

export type ColorType = 'blue' | 'red' | 'green' | 'orange' | null

export interface ColorBadgeProps {
  color: ColorType
  label?: string
  className?: string
}

const COLOR_CONFIG = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
    label: 'LTO',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    label: 'Slow',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
    label: 'Busy',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
    label: 'Medium',
  },
}

export function ColorBadge({ color, label, className }: ColorBadgeProps) {
  if (!color) return null

  const config = COLOR_CONFIG[color]
  const displayLabel = label || config.label

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', config.text.replace('text-', 'bg-'))} />
      {displayLabel}
    </div>
  )
}
