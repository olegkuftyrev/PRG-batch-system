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
    <Card className="flex flex-col border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{item.code}</Badge>
          <CardTitle className="text-base font-medium leading-tight">
            {item.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="flex flex-col gap-1">
          {item.batchSizes.map((size) => (
            <div key={size} className="relative">
              <Button
                variant={batchSize === size ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setBatchSize(size)}
                disabled={disabled}
              >
                Batch {size}
              </Button>
              {size === recommendedBatch && (
                <Badge
                  className="absolute -top-1 -right-1 shrink-0 text-[10px] font-normal px-1.5 py-0 border-0 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200"
                >
                  Recommended
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-col gap-1">
        {disabledReason && (
          <p className="text-xs text-muted-foreground">{disabledReason}</p>
        )}
        <Button
          className="w-full"
          onClick={handleCall}
          disabled={loading || disabled}
        >
          {loading ? 'Calling…' : disabled ? 'Unavailable' : 'Call'}
        </Button>
      </CardFooter>
    </Card>
  )
}
