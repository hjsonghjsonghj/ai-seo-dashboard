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
        'peer size-4 shrink-0 rounded-[4px] border border-v0-slate-400 bg-v0-slate-700/40 text-v0-white shadow-xs outline-none transition-colors cursor-pointer',
        'hover:border-v0-slate-300 hover:bg-v0-slate-500/80',
        'data-[state=checked]:border-v0-violet-500 data-[state=checked]:bg-v0-violet-500 data-[state=checked]:text-v0-white',
        'focus-visible:ring-2 focus-visible:ring-v0-violet-400/50 focus-visible:ring-offset-0',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
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
