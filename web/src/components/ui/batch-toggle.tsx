import { cn } from '@/lib/utils'

export interface BatchToggleProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  recommended?: string
}

export function BatchToggle({ options, value, onChange, disabled, className, recommended }: BatchToggleProps) {
  if (options.length !== 3) {
    console.warn('BatchToggle expects exactly 3 options')
  }

  const selectedIndex = options.indexOf(value)

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {recommended && (
        <div className="w-full flex justify-center">
          <span className="text-xs text-muted-foreground">
            Recommended: <span className="font-semibold">{recommended}</span>
          </span>
        </div>
      )}
      <div className="flex gap-1">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              'px-4 py-2 min-w-[44px] rounded-md font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              selectedIndex === index
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {option}
          </button>
        ))}
      </div>
      
      <div className="relative w-full max-w-[200px] h-1 bg-muted rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
          style={{
            width: '33.33%',
            transform: `translateX(${selectedIndex * 100}%)`,
          }}
        />
      </div>
    </div>
  )
}
