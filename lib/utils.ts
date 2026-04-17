import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge v3 does not auto-discover custom `@utility` or `@theme`
 * classes defined in globals.css. Without registration it groups unknown
 * `text-*` utilities together with text-color classes (e.g. `text-foreground-*`)
 * and silently drops whichever one appears first in a cn() call.
 *
 * Fix: register every custom text-size token in the `font-size` class group
 * so twMerge knows it conflicts with other font-size classes (not text-color).
 *
 * Registered tokens (keep in sync with globals.css @utility / @theme):
 *   UI scale      : text-display-sm-{semibold|bold} … text-label-micro-medium   (12 tokens)
 *   Caps variants : text-label-xs-caps-{medium|semibold}, text-body-micro-caps-semibold (3 tokens)
 *   Chart scale   : text-chart-axis, text-chart-tooltip  (2 tokens — @theme)
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        // ── UI typography scale — explicit size+weight names ──
        'text-display-sm-semibold',
        'text-display-sm-bold',
        'text-title-page-semibold',
        'text-title-section-semibold',
        'text-title-sub-semibold',
        'text-body-md-regular',
        'text-body-md-medium',
        'text-body-sm-medium',
        'text-body-micro-medium',
        'text-body-micro-bold',
        'text-label-xs-medium',
        'text-label-micro-medium',
        // ── Caps variants (letter-spacing + uppercase baked in) ─
        'text-label-xs-caps-medium',
        'text-label-xs-caps-semibold',
        'text-body-micro-caps-semibold',
        // ── Chart typography scale ─────────────────────────────
        // Defined in @theme (not @utility) — still invisible to
        // tailwind-merge without explicit registration here.
        'text-chart-axis',
        'text-chart-tooltip',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
