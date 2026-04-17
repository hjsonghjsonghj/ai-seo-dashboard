# Spacing System

This project uses **Tailwind CSS v4.2** (CSS-first config via `@theme` in `app/globals.css`).
All custom spacing tokens live in the `@theme` block. There is no `tailwind.config.js`.

---

## 8px Grid Principle

All spacing values should align to the **8px base grid** (or its half-step of 4px for fine-tuning).

| Multiplier | Value | Tailwind token |
|-----------|-------|---------------|
| 0.5x | 4px | `p-1`, `m-1`, `gap-1` |
| 1x | 8px | `p-2`, `m-2`, `gap-2` |
| 1.5x | 12px | `p-3`, `m-3`, `gap-3` |
| 2x | 16px | `p-4`, `m-4`, `gap-4` |
| 3x | 24px | `p-6`, `m-6`, `gap-6` |
| 4x | 32px | `p-8`, `m-8`, `gap-8` |
| 6x | 48px | `p-12`, `m-12`, `gap-12` |

Tailwind v4 spacing scale: `1 unit = 0.25rem (4px)` at 16px root font size.

---

## Custom Spacing Tokens (`@theme`)

Defined in `app/globals.css` under the `@theme` block:

| CSS Variable | Value | Generated Utility | Usage |
|-------------|-------|------------------|-------|
| `--spacing-container` | `1600px` | `max-w-container` | Page-level layout container max-width |

### Usage example

```tsx
// Page layout wrapper
<div className="mx-auto max-w-container flex flex-col gap-6">
  ...
</div>
```

---

## Standard Tailwind Utilities in Use

These are built-in Tailwind utilities used in place of arbitrary values.
No custom tokens needed - they resolve from the default spacing scale.

| Utility | Value | Replaces | Usage |
|---------|-------|---------|-------|
| `ring-3` | 3px ring | `ring-[3px]` | Focus ring on all interactive elements |
| `min-w-32` | 8rem (128px) | `min-w-[8rem]` | Dropdown and select menu minimum width |
| `min-w-48` | 12rem (192px) | `min-w-[12rem]` | Menubar content minimum width |
| `rounded-sm` | 0.125rem (2px) | `rounded-[2px]` | Chart legend color indicators, tooltip arrow |
| `rounded` | 0.25rem (4px) | `rounded-[4px]` | Checkbox border radius |

---

## Intentionally Left as Arbitrary Values

These values are left as `[...]` arbitrary syntax. Each is a single-use,
context-specific size that does not belong in the shared token system.

| Class | Location | Reason |
|-------|----------|--------|
| `h-[320px]` | `trends-chart.tsx` | Chart canvas height, chart-specific |
| `max-h-[80vh]` | `drawer.tsx` | Viewport-relative, drawer-specific |
| `w-[160px]`, `w-[180px]` | `search-visibility/page.tsx` | Select trigger widths, one-off |
| `min-w-[240px]` | `search-visibility/page.tsx` | Search input minimum width |
| `max-w-[140px]` | `citations-table.tsx` | Table cell text truncation |
| `w-[100px]` | `drawer.tsx` | Drawer handle width |
| `w-[2px]` | `sidebar.tsx` | Sidebar resize handle line |
| `max-h-[300px]` | `command.tsx` | Command palette list height |
| `max-w-[420px]` | `toast.tsx` | Toast notification width |
| `p-[3px]` | `tabs.tsx` | Tab list inner padding |
| `h-[1.15rem]` | `switch.tsx` | Switch height (component spec) |
| `border-[1.5px]` | `chart.tsx` | Dashed chart line |
| `top-[50%]`, `left-[50%]` | `dialog.tsx`, `alert-dialog.tsx` | Modal centering pattern |
| `z-[100]` | `toast.tsx` | Toast z-index layer |

---

## Rules for New Spacing Values

1. **Use 8px grid multiples** wherever possible (`gap-2`, `p-4`, `m-6`, etc.).
2. **Use the Tailwind default scale** before writing an arbitrary value.
3. **If a value appears 3 or more times**, add it as a `--spacing-*` token in `@theme`.
4. **Never hardcode layout container width** - use `max-w-container`.
5. **Viewport-relative values** (`vh`, `vw`) are acceptable as arbitrary values.
6. **Micro-adjustment values** (1px, 2px positioning) are acceptable as arbitrary values.
