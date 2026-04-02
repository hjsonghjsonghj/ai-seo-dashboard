import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-brand-deep/50 focus-visible:ring-[3px] aria-invalid:ring-danger-soft/20 dark:aria-invalid:ring-danger-soft/40 aria-invalid:border-danger-soft transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary-default text-primary-foreground [a&]:hover:bg-primary-default/90',
        secondary:
          'border-transparent bg-surface-hover text-subdued [a&]:hover:bg-surface-hover/90',
        destructive:
          'border-transparent bg-danger-soft text-white [a&]:hover:bg-danger-soft/90 focus-visible:ring-danger-soft/20 dark:focus-visible:ring-danger-soft/40 dark:bg-danger-soft/60',
        outline:
          'text-foreground [a&]:hover:bg-brand-default [a&]:hover:text-brand-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
