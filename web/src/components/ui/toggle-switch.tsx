import { cn } from '@/lib/utils'

export interface ToggleSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function ToggleSwitch({ checked, onCheckedChange, disabled, className }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-11 w-20 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-green-500' : 'bg-gray-300',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-9 w-9 rounded-full bg-white shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-10' : 'translate-x-1'
        )}
      />
    </button>
  )
}
