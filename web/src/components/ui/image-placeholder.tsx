import { cn } from '@/lib/utils'

export interface ImagePlaceholderProps {
  className?: string
  message?: string
}

export function ImagePlaceholder({
  className,
  message = 'Please upload picture for this item',
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center',
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground mb-2"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  )
}
