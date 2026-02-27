import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number
  max?: number
  showText?: boolean
  text?: string
  className?: string
  invert?: boolean
}

export function ProgressBar({ value, max = 100, showText = false, text, className, invert = false }: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const getColor = () => {
    const p = invert ? 100 - percentage : percentage
    if (p < 33) return 'bg-green-500'
    if (p < 67) return 'bg-yellow-500'
    if (p < 100) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={cn('relative w-full h-10 bg-muted rounded overflow-hidden', className)}>
      <div
        className={cn(
          'absolute inset-y-0 left-0 transition-all duration-1000 ease-linear',
          getColor()
        )}
        style={{ width: `${percentage}%` }}
      />
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-foreground mix-blend-difference">
            {text || `${Math.round(percentage)}%`}
          </span>
        </div>
      )}
    </div>
  )
}
