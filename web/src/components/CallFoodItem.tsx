import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { MenuItem } from '@/api/menu'
import { getRecommendedBatch } from '@/helpers/daypart'

/** When set, Call button is disabled and optional reason is shown. */
type Props = {
  item: MenuItem
  onCall: (menuItemId: number, batchSize: string) => Promise<void>
  disabled?: boolean
  disabledReason?: string
}

export function CallFoodItem({ item, onCall, disabled = false, disabledReason }: Props) {
  const recommendedBatch = getRecommendedBatch(
    item.recommendedBatch ?? {},
    item.batchSizes ?? []
  )
  const [batchSize, setBatchSize] = useState(recommendedBatch)
  const [loading, setLoading] = useState(false)

  const handleCall = async () => {
    setLoading(true)
    try {
      await onCall(item.id, batchSize)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-white font-bold text-sm px-3 py-1 rounded">
            {item.code}
          </div>
          <CardTitle className="text-base font-semibold uppercase tracking-wide">
            {item.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3 pt-0">
        <div className="flex flex-col">
          {item.batchSizes.map((size) => (
            <button
              key={size}
              className={`
                relative flex items-center justify-between py-3 px-4 border-b border-border last:border-0
                transition-colors
                ${batchSize === size ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}
                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
              onClick={() => !disabled && setBatchSize(size)}
              disabled={disabled}
            >
              <span className="font-semibold text-sm">BATCH {size}</span>
              {size === recommendedBatch && (
                <Badge
                  className="shrink-0 text-[10px] font-normal px-2 py-0.5 border-0 bg-orange-100 text-orange-800"
                >
                  Recommended
                </Badge>
              )}
            </button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4 px-4 flex flex-col gap-2">
        {disabledReason && (
          <p className="text-xs text-muted-foreground text-center">{disabledReason}</p>
        )}
        <Button
          className="w-full h-12 text-base font-semibold"
          onClick={handleCall}
          disabled={loading || disabled}
        >
          {loading ? 'Calling…' : disabled ? 'Unavailable' : 'Call'}
        </Button>
      </CardFooter>
    </Card>
  )
}
