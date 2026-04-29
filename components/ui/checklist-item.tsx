'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface ChecklistItemProps {
  text: string
  done: boolean
  className?: string
  onCheckedChange?: (checked: boolean) => void
}

export function ChecklistItem({ text, done, className, onCheckedChange }: ChecklistItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Checkbox
        checked={done}
        onCheckedChange={onCheckedChange}
        className="mt-0.5 shrink-0"
      />
      <span
        className={cn(
          'text-body-sm-medium font-medium leading-snug',
          done ? 'text-foreground-tertiary' : 'text-foreground-primary'
        )}
      >
        {text}
      </span>
    </div>
  )
}
