import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BatchToggle } from '@/components/ui/batch-toggle'
import { ProgressBar } from '@/components/ui/progress-bar'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
import { AlertDialog } from '@/components/ui/alert-dialog'
import type { MenuItem } from '@/api/menu'
import { getRecommendedBatch } from '@/helpers/daypart'

type Props = {
  item: MenuItem
  onCall: (menuItemId: number, batchSize: string) => Promise<void>
  onCancel?: (ticketId: number) => Promise<void>
  onPriority?: (ticketId: number) => Promise<void>
  disabled?: boolean
  disabledReason?: string
  activeTicketId?: number
  remainingSeconds?: number | null
  totalSeconds?: number
  lastCalledAt?: Date | null
  isPriority?: boolean
}

export function CallFoodItem({ 
  item, 
  onCall, 
  onCancel,
  onPriority,
  disabled = false, 
  disabledReason,
  activeTicketId,
  remainingSeconds,
  totalSeconds,
  lastCalledAt,
  isPriority = false,
}: Props) {
  const recommendedBatch = getRecommendedBatch(
    item.recommendedBatch ?? {},
    item.batchSizes ?? []
  )
  const [batchSize, setBatchSize] = useState(recommendedBatch)
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleCall = async () => {
    setLoading(true)
    try {
      await onCall(item.id, batchSize)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    if (!activeTicketId || !onCancel) return
    setCanceling(true)
    try {
      await onCancel(activeTicketId)
    } finally {
      setCanceling(false)
    }
  }

  const handlePriority = async () => {
    if (!activeTicketId || !onPriority) return
    await onPriority(activeTicketId)
  }

  const isCooking = remainingSeconds !== null && remainingSeconds !== undefined && remainingSeconds > 0
  const isQualityCheck = remainingSeconds !== null && remainingSeconds !== undefined && remainingSeconds <= 0
  const progress = totalSeconds && remainingSeconds !== null && remainingSeconds !== undefined
    ? Math.min(((totalSeconds - remainingSeconds) / totalSeconds) * 100, 100)
    : 0

  const holdTimeSeconds = item.holdTime ?? 600
  const qualityCheckElapsed = isQualityCheck && remainingSeconds !== null && remainingSeconds !== undefined
    ? Math.abs(remainingSeconds)
    : 0
  const holdTimeRemaining = holdTimeSeconds - qualityCheckElapsed
  const isHoldExpiring = isQualityCheck && holdTimeRemaining <= holdTimeSeconds / 2
  const isHoldExpired = isQualityCheck && holdTimeRemaining <= 0

  const imageUrl = item.imageUrl ? `${import.meta.env.VITE_API_URL || ''}${item.imageUrl}` : null

  const getTimeSinceLastCall = (date: Date | null | undefined) => {
    if (!date) return null
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    return {
      diffMins,
      formatted: diffMins < 1 ? 'Just now' :
                 diffMins < 60 ? `${diffMins}m ago` :
                 diffMins < 24 * 60 ? `${Math.floor(diffMins / 60)}h ago` :
                 `${Math.floor(diffMins / (24 * 60))}d ago`
    }
  }

  const timeSinceLastCall = getTimeSinceLastCall(lastCalledAt)
  
  const getQualityBadge = () => {
    if (!timeSinceLastCall) return null
    const mins = timeSinceLastCall.diffMins
    
    if (mins > 15) return { text: 'Call Now', variant: 'destructive' as const, style: 'destructive' }
    if (mins >= 10) return { text: 'B quality', variant: 'default' as const, style: 'warning' }
    if (mins < 5) return { text: 'A quality', variant: 'default' as const, style: 'success' }
    return null
  }
  
  const qualityBadge = getQualityBadge()

  let buttonText = 'Call'
  if (loading) buttonText = 'Calling…'
  else if (disabled && disabledReason) buttonText = disabledReason
  else if (isHoldExpired) buttonText = '⚠️ EXPIRED - DISCARD'
  else if (isQualityCheck) {
    const mins = Math.floor(holdTimeRemaining / 60)
    const secs = holdTimeRemaining % 60
    buttonText = `Quality Hold ${mins}:${String(secs).padStart(2, '0')}`
  }
  else if (isCooking) {
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    buttonText = `${mins}:${String(secs).padStart(2, '0')}`
  }

  let cardClassName = "flex flex-col"
  if (isHoldExpired) {
    cardClassName += " border-4 border-red-600 bg-red-50"
  } else if (isHoldExpiring) {
    cardClassName += " border-2 border-red-500 animate-pulse"
  }

  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div 
            className={`font-bold text-lg px-2 py-1 rounded ${
              item.color === 'blue' ? 'bg-blue-500 text-white' :
              item.color === 'red' ? 'bg-red-500 text-white' :
              item.color === 'green' ? 'bg-green-500 text-white' :
              item.color === 'orange' ? 'bg-orange-500 text-white' :
              item.color === 'yellow' ? 'bg-yellow-400 text-black' :
              ''
            }`}
          >
            {item.code}
          </div>
          {qualityBadge ? (
            <Badge 
              variant={qualityBadge.variant} 
              className={`text-xs font-semibold ${
                qualityBadge.style === 'destructive' ? 'animate-pulse' :
                qualityBadge.style === 'warning' ? 'bg-yellow-500 text-white border-yellow-500' :
                qualityBadge.style === 'success' ? 'bg-green-500 text-white border-green-500' :
                ''
              }`}
            >
              {qualityBadge.text}
            </Badge>
          ) : timeSinceLastCall && (
            <span className="text-xs text-muted-foreground">
              {timeSinceLastCall.formatted}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold uppercase tracking-wide mt-2 text-center">
          {item.title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3 pt-0 space-y-3">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.title} 
            className="w-full aspect-[6/4] object-cover rounded"
          />
        ) : (
          <ImagePlaceholder className="aspect-[6/4]" />
        )}
        
        {item.batchSizes.length === 3 ? (
          <BatchToggle
            options={item.batchSizes}
            value={batchSize}
            onChange={setBatchSize}
            disabled={disabled}
            recommended={recommendedBatch}
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
        {(isCooking || isQualityCheck) ? (
          <div className="flex gap-2 w-full items-center">
            <ProgressBar
              value={isCooking ? progress : 100}
              max={100}
              showText={true}
              text={buttonText}
              className="flex-1 h-12"
              complete={isQualityCheck}
            />
            {activeTicketId && onCancel && (
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 bg-black border-black hover:bg-black/90"
                onClick={handleCancelClick}
                disabled={canceling}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-2 w-full items-center">
            <Button
              className="flex-1 h-12 text-base font-semibold"
              onClick={handleCall}
              disabled={loading || disabled}
            >
              {buttonText}
            </Button>
            {activeTicketId && onPriority && (
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 shrink-0 font-bold text-base border-2 ${
                  isPriority
                    ? 'bg-red-600 border-red-600 text-white hover:bg-red-700'
                    : 'bg-orange-500 border-orange-500 text-white hover:bg-orange-600'
                }`}
                onClick={handlePriority}
              >
                !!!
              </Button>
            )}
            {activeTicketId && onCancel && (
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 bg-black border-black hover:bg-black/90"
                onClick={handleCancelClick}
                disabled={canceling}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>

      <AlertDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Order?"
        description="This will cancel the cooking ticket. This action cannot be undone."
        cancelLabel="Go Back"
        actionLabel="Cancel Order"
        variant="destructive"
        onAction={handleCancelConfirm}
      />
    </Card>
  )
}
