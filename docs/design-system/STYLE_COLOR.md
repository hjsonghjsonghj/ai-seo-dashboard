# Color System

All color tokens are defined in `app/globals.css` inside the `@theme` block.
Tailwind v4 generates utilities directly from these tokens (e.g. `bg-background`, `text-foreground-primary`).

Dark mode is handled via the `.dark` class using `@custom-variant dark (&:is(.dark *))`.

---

## Token Architecture

```
@theme {
  --color-{category}-{scale}: {hex};
}
```

Generated utilities: `bg-{token}`, `text-{token}`, `border-{token}`, `ring-{token}`, `fill-{token}`

---

## Background

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#020617` (slate-950) | Page background, popover, sidebar base |
| `surface-default` | `#0f172a` (slate-900) | Cards, panels, muted backgrounds |
| `surface-hover` | `#1e293b` (slate-800) | Hover states, elevated surfaces, secondary backgrounds |
| `input` | `#1e293b` (slate-800) | Input and textarea field background |

---

## Foreground (Text)

| Token | Hex | Usage |
|-------|-----|-------|
| `foreground-primary` | `#f1f5f9` (slate-100) | Primary body text |
| `foreground-secondary` | `#e2e8f0` (slate-200) | Secondary text, sidebar labels |
| `foreground-tertiary` | `#CBD5E1` (slate-300) | Tertiary and meta text |
| `foreground-strong` | `#f8fafc` (slate-50) | Text on colored backgrounds (primary, brand, danger, caution) |
| `foreground-muted` | `#94a3b8` (slate-400) | Placeholder text, captions, disabled labels |

---

## Border

| Token | Hex | Usage |
|-------|-----|-------|
| `border-primary` | `#475569` (slate-600) | Checkbox and input edges |
| `border-secondary` | `#334155` (slate-700) | General borders, dividers, SVG strokes |

---

## Brand (Violet)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-deep` | `#7c3aed` (violet-600) | Focus rings, hover pressed states |
| `brand-default` | `#8b5cf6` (violet-500) | Filled elements, accent color |
| `brand-soft` | `#a78bfa` (violet-400) | Icons, focus dots |
| `brand-faint` | `#c4b5fd` (violet-300) | Secondary brand text |

---

## Primary Action (Blue)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-default` | `#3b82f6` (blue-500) | Primary buttons, selected states, checkboxes |

---

## Semantic Status Colors

### Positive (Green)

| Token | Hex | Usage |
|-------|-----|-------|
| `positive-default` | `#10b981` (emerald-500) | Success states, positive trends |
| `positive-soft` | `#34d399` (emerald-400) | Secondary positive indicators |

### Danger (Red)

| Token | Hex | Usage |
|-------|-----|-------|
| `danger-deep` | `#dc2626` (red-600) | Critical error emphasis |
| `danger-default` | `#ef4444` (red-500) | Error states, destructive actions |
| `danger-soft` | `#f87171` (red-400) | Error rings, danger text |

### Caution (Amber)

| Token | Hex | Usage |
|-------|-----|-------|
| `caution-default` | `#f59e0b` (amber-500) | Warning states, caution indicators |
| `caution-soft` | `#fbbf24` (amber-400) | Secondary caution indicators |

---

## Chart Colors

Defined in `:root` (not `@theme`) - read by JavaScript via `getPropertyValue()`.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--chart-1` | `#8b5cf6` (violet-500) | AI Discovery area |
| `--chart-2` | `#10b981` (emerald-500) | Organic Search area |
| `--chart-4` | `#60a5fa` (blue-400) | Citations area |
| `--chart-grid-line` | `#334155` (slate-700) | CartesianGrid stroke |
| `--chart-axis-text` | `#94a3b8` (slate-400) | XAxis and YAxis labels |
| `--chart-reference-line` | `#7c3aed` (violet-600) | ReferenceLine stroke |
| `--chart-label` | `#a78bfa` (violet-400) | ReferenceLine event labels |

---

## Usage Rules

1. **Never use raw hex values** in component className strings. Always use token utilities.
2. **Text on colored backgrounds** always uses `text-foreground-strong` (slate-50).
3. **Focus rings** use `ring-brand-deep/50` with `ring-3` width.
4. **Danger validation** states use `ring-danger-soft/20` (dark: `/40`).
5. **Chart colors** are JS-only tokens - do not use them in Tailwind class strings.
6. **Opacity modifiers** (`/50`, `/80`, etc.) work correctly because all `@theme` values are direct hex - no `var()` chains.
