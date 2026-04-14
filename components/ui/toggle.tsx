'use client'

import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleVariants = cva(
  // Base — layout, typography, transitions, a11y
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-brand-soft/50 focus-visible:ring-offset-0 aria-invalid:ring-danger-soft/20 dark:aria-invalid:ring-danger-soft/40",
  {
    variants: {
      variant: {
        // Ghost toggle — invisible at rest, subtle on hover, soft-brand when ON
        default: [
          'border border-transparent bg-transparent text-foreground-secondary',
          'hover:bg-surface-hover hover:text-foreground-primary hover:border-border-secondary',
          'data-[state=on]:bg-brand-default/15 data-[state=on]:text-brand-soft data-[state=on]:border-brand-default/25',
        ].join(' '),
        // Outlined toggle — visible border at rest, strong-brand fill when ON
        outline: [
          'border border-border-secondary bg-transparent text-foreground-secondary shadow-xs',
          'hover:bg-surface-hover hover:text-foreground-primary hover:border-border-primary',
          'data-[state=on]:bg-brand-default data-[state=on]:text-foreground-strong data-[state=on]:border-brand-default data-[state=on]:shadow-none',
        ].join(' '),
      },
      size: {
        // px values corrected for text content (was icon-button-level px-2/1.5/2.5)
        default: 'h-9 px-3 min-w-9',
        sm:      'h-8 px-2.5 min-w-8',
        lg:      'h-10 px-4 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
