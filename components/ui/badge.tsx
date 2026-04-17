import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-brand-deep/50 focus-visible:ring-3 aria-invalid:ring-danger-soft/20 dark:aria-invalid:ring-danger-soft/40 aria-invalid:border-danger-soft transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        // ── General-purpose variants ──────────────────────────
        default:
          'border-transparent bg-primary-default text-foreground-strong [a&]:hover:bg-primary-default/90',
        secondary:
          'border-transparent bg-surface-hover text-foreground-secondary [a&]:hover:bg-surface-hover/90',
        destructive:
          'border-transparent bg-danger-soft text-foreground-strong [a&]:hover:bg-danger-soft/90 focus-visible:ring-danger-soft/20 dark:focus-visible:ring-danger-soft/40 dark:bg-danger-soft/60',
        outline:
          'text-foreground-primary [a&]:hover:bg-brand-default [a&]:hover:text-foreground-strong',
        // ── Semantic status variants (pill · bold · uppercase) ─
        // rounded-full / font-bold / uppercase override the base rounded-md / font-medium
        danger:
          'border-transparent bg-danger-default/15 text-danger-soft rounded-full font-bold uppercase',
        positive:
          'border-transparent bg-brand-default/15 text-brand-soft rounded-full font-bold uppercase',
        caution:
          'border-transparent bg-caution-default/15 text-caution-default rounded-full font-bold uppercase',
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
