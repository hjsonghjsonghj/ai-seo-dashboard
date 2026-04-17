import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground-primary placeholder:text-foreground-muted selection:bg-primary-default selection:text-foreground-strong dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-brand-deep/50 focus-visible:ring-3',
        'aria-invalid:ring-danger-soft/20 dark:aria-invalid:ring-danger-soft/40 aria-invalid:border-danger-soft',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
