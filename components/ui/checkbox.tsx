'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded border border-foreground-tertiary bg-border-secondary/40 text-foreground-strong shadow-xs outline-none transition-colors cursor-pointer',
        'hover:border-foreground-secondary hover:bg-border-primary/80',
        'data-[state=checked]:border-brand data-[state=checked]:bg-brand-default data-[state=checked]:text-foreground-strong',
        'focus-visible:ring-2 focus-visible:ring-brand-soft/50 focus-visible:ring-offset-0',
        'aria-invalid:border-danger-soft aria-invalid:ring-danger-soft/20 dark:aria-invalid:ring-danger-soft/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
