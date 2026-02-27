import * as React from 'react'
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('border rounded-lg overflow-hidden', className)}>
      <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors">
        <div className="flex items-center gap-2">
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')}
          />
          <span className="font-medium">{title}</span>
          {count !== undefined && (
            <span className="text-sm text-muted-foreground">({count})</span>
          )}
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="p-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
