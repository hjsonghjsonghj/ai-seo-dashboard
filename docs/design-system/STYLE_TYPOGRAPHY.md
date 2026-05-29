# Typography System

All typography tokens are defined in `app/globals.css`.
Font-size and font-weight primitives live in `@theme`. Composite utilities are defined with `@utility`.

---

## Fonts

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Geist, system-ui, sans-serif | Default sans-serif font |
| `--font-mono` | Geist Mono, ui-monospace | Code and monospace contexts |
| `--font-family-base` | `"Geist", sans-serif` | Typography utility binding token |

Geist is loaded via `next/font` in the layout. The `--font-family-base` variable is referenced by all `@utility` typography classes.

---

## Composite Utility Pattern

Every typography utility bundles **all five typographic properties** in a single class:

```
font-family + font-size + line-height + font-weight + letter-spacing
```

This means **no** separate `font-*`, `text-*`, `tracking-*`, `leading-*`, or `uppercase` overrides
are needed in component JSX alongside these utilities.

Pattern naming:
- `text-{size-token}-{weight}` - normal letter-spacing
- `text-{size-token}-caps-{weight}` - uppercase with 0.01em letter-spacing

---

## Type Scale

### Font Sizes (`@theme`)

| Token | Size | Line Height | Computed |
|-------|------|------------|---------|
| `--text-display-sm` | 30px | 1.2 | 36px |
| `--text-title-page` | 20px | 1.4 | 28px |
| `--text-title-section` | 18px | 1.5 | 27px |
| `--text-title-sub` | 16px | 1.5 | 24px |
| `--text-body-md` | 16px | 1.5 | 24px |
| `--text-body-sm` | 14px | 1.428 | approx 20px |
| `--text-body-micro` | 13px | 1.385 | approx 18px |
| `--text-label-xs` | 12px | 1.333 | approx 16px |
| `--text-label-micro` | 11px | 1 | 11px |

### Font Weights

| Token | Weight | Notes |
|-------|--------|-------|
| `regular` | 400 | Body prose |
| `medium` | 500 | Interactive body, labels |
| `semibold` | 600 | Headings, emphasis |
| `bold` | 700 | KPI stat numbers, micro emphasis |

---

## Available Utility Classes

### Display

| Class | Size | Weight | Use case |
|-------|------|--------|---------|
| `text-display-sm-semibold` | 30px | 600 | Large headings |
| `text-display-sm-bold` | 30px | 700 | KPI stat numbers |

### Title

| Class | Size | Weight | Use case |
|-------|------|--------|---------|
| `text-title-page-semibold` | 20px | 600 | Page-level headings |
| `text-title-section-semibold` | 18px | 600 | Section headings |
| `text-title-sub-semibold` | 16px | 600 | Sub-section headings |

### Body

| Class | Size | Weight | Use case |
|-------|------|--------|---------|
| `text-body-md-regular` | 16px | 400 | Prose body text |
| `text-body-md-medium` | 16px | 500 | Interactive body text |
| `text-body-sm-medium` | 14px | 500 | Small body text |
| `text-body-micro-medium` | 13px | 500 | Micro body text |
| `text-body-micro-bold` | 13px | 700 | Micro body emphasis |

### Label

| Class | Size | Weight | Use case |
|-------|------|--------|---------|
| `text-label-xs-medium` | 12px | 500 | Standard XS labels |
| `text-label-micro-medium` | 11px | 500 | Micro labels |

### Caps Variants (uppercase + 0.01em tracking)

| Class | Size | Weight | Use case |
|-------|------|--------|---------|
| `text-label-xs-caps-medium` | 12px | 500 | Stat cell labels (drawer) |
| `text-label-xs-caps-semibold` | 12px | 600 | Table column headers |
| `text-body-micro-caps-semibold` | 13px | 600 | Insight card type labels |

### Chart Typography

| Class | Source Variable | Use case |
|-------|----------------|---------|
| `text-chart-axis` | `--chart-axis-font-size` (12px) | Axis tick labels |
| `text-chart-tooltip` | `--chart-tooltip-font-size` (12px) | Tooltip body text |
| `font-chart-label` | `--chart-tooltip-label-font-weight` (500) | Tooltip metric names |
| `font-chart-value` | `--chart-tooltip-value-font-weight` (500) | Tooltip numeric values |

---

## Letter Spacing

| Token | Value | Applied by |
|-------|-------|-----------|
| `--ls-normal` | `normal` | All non-caps utilities (font default kerning) |
| `--ls-caps` | `0.01em` | All `-caps-` utilities (subtle professional tracking) |

---

## Rules for New Typography

1. **Always use a composite utility** (e.g. `text-body-md-medium`) instead of combining raw `text-*`, `font-*`, `tracking-*`.
2. **For uppercase labels**, use a `-caps-` variant - do not add `uppercase` manually.
3. **Do not mix** typography utility classes with `font-weight` or `tracking` utilities.
4. **Chart text** is set via `:root` CSS variables and read by JS - do not set font sizes on SVG elements directly.
5. **To add a new size**, define `--text-{name}` and `--text-{name}--line-height` in `@theme`, then create `@utility` blocks for each weight variant.
