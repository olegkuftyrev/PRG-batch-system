import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { BatchToggle } from '@/components/ui/batch-toggle'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ColorBadge } from '@/components/ui/color-badge'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import type { MenuItem } from '@/api/menu'
import { getRecommendedBatch } from '@/helpers/daypart'

type Props = {
  item: MenuItem
  onCall: (menuItemId: number, batchSize: string) => Promise<void>
  onCancel?: (ticketId: number) => Promise<void>
  disabled?: boolean
  disabledReason?: string
  activeTicketId?: number
  remainingSeconds?: number | null
  totalSeconds?: number
}

export function CallFoodItem({ 
  item, 
  onCall, 
  onCancel,
  disabled = false, 
  disabledReason,
  activeTicketId,
  remainingSeconds,
  totalSeconds
}: Props) {
  const recommendedBatch = getRecommendedBatch(
    item.recommendedBatch ?? {},
    item.batchSizes ?? []
  )
  const [batchSize, setBatchSize] = useState(recommendedBatch)
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const handleCall = async () => {
    setLoading(true)
    try {
      await onCall(item.id, batchSize)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!activeTicketId || !onCancel) return
    setCanceling(true)
    try {
      await onCancel(activeTicketId)
    } finally {
      setCanceling(false)
    }
  }

  const isCooking = remainingSeconds !== null && remainingSeconds !== undefined && remainingSeconds > 0
  const isQualityCheck = remainingSeconds !== null && remainingSeconds !== undefined && remainingSeconds <= 0
  const progress = totalSeconds && remainingSeconds !== null && remainingSeconds !== undefined
    ? Math.min(((totalSeconds - remainingSeconds) / totalSeconds) * 100, 100)
    : 0

  const imageUrl = item.imageUrl ? `${import.meta.env.VITE_API_URL || ''}${item.imageUrl}` : null

  let buttonText = 'Call'
  if (loading) buttonText = 'Calling…'
  else if (disabled && disabledReason) buttonText = disabledReason
  else if (isQualityCheck) buttonText = 'Quality Check'
  else if (isCooking) {
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    buttonText = `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-lg">{item.code}</div>
          {item.color && <ColorBadge color={item.color} className="self-start" />}
        </div>
        <h3 className="text-base font-semibold uppercase tracking-wide mt-1">
          {item.title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3 pt-0 space-y-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.title} 
            className="w-full h-32 object-cover rounded"
          />
        ) : (
          <ImagePlaceholder className="h-32" />
        )}
        
        {item.batchSizes.length === 3 ? (
          <BatchToggle
            options={item.batchSizes}
            value={batchSize}
            onChange={setBatchSize}
            disabled={disabled}
          />
        ) : (
          <div className="flex gap-1 justify-center">
            {item.batchSizes.map((size) => (
              <button
                key={size}
                onClick={() => !disabled && setBatchSize(size)}
                disabled={disabled}
                className={`
                  px-4 py-2 min-w-[44px] rounded-md font-medium transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${batchSize === size
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4 flex flex-col gap-2">
        <div className="relative w-full">
          <Button
            className="w-full h-12 text-base font-semibold relative overflow-hidden"
            onClick={handleCall}
            disabled={loading || disabled}
          >
            {isCooking && (
              <div className="absolute inset-0">
                <ProgressBar 
                  value={progress} 
                  max={100}
                  showText={false}
                />
              </div>
            )}
            <span className="relative z-10 mix-blend-difference">
              {buttonText}
            </span>
          </Button>
        </div>
        
        {activeTicketId && onCancel && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCancel}
            disabled={canceling}
          >
            {canceling ? 'Canceling…' : 'Cancel'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
