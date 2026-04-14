import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge v3 does not auto-discover custom `@utility` classes defined
 * in globals.css. Without registration, it groups unknown `text-*` utilities
 * together with text-color classes (e.g. `text-foreground-*`) and silently
 * drops whichever one appears first — causing `text-body-sm` etc. to vanish.
 *
 * Fix: register every custom text-size token in the `font-size` class group
 * so twMerge knows it conflicts with other font-size classes (not text-color).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display-sm',
        'text-title-page',
        'text-title-section',
        'text-title-sub',
        'text-body-lg',
        'text-body-md',
        'text-body-sm',
        'text-label-xs',
        'text-label-micro',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
