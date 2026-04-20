# Spacing System

This project uses **Tailwind CSS v4.2** (CSS-first config via `@theme` in `app/globals.css`).
All custom spacing tokens live in the `@theme` block. There is no `tailwind.config.js`.

---

## 4px Base Grid

All spacing values must align to the **4px base grid**.
The 8px grid (multiples of 8) is preferred for component padding and layout gaps.
4px steps are allowed for fine-grained internal adjustments.

| Step | px | rem | Notes |
|------|----|-----|-------|
| 0.5x | 2px | 0.125rem | Micro gaps only (border, outline offset) |
| 1x | 4px | 0.25rem | Icon padding, badge gap, micro spacing |
| 1.5x | 6px | 0.375rem | Half-step, use numeric scale `py-1.5` |
| 2x | 8px | 0.5rem | Compact: cell gap, small button pad |
| 2.5x | 10px | 0.625rem | Half-step, use numeric scale `py-2.5` |
| 3x | 12px | 0.75rem | Medium-small, use numeric scale `p-3` |
| 4x | 16px | 1rem | Default: card padding, form gap |
| 5x | 20px | 1.25rem | Medium-large, use numeric scale `p-5` |
| 6x | 24px | 1.5rem | Section padding, card gap |
| 8x | 32px | 2rem | Large: sidebar items, page sections |

---

## Named Tokens (`@theme`)

Only one custom spacing token is defined (beyond the numeric scale).
The names `xs`, `sm`, `md`, `lg`, `xl` are **reserved** by Tailwind v4 for the `max-w-*` container scale
and MUST NOT be used as `--spacing-*` token names, as they will silently override `max-w-sm`, `max-w-md`,
`max-w-lg`, `max-w-xl` and break Sheet, Dialog, Drawer, and similar components that rely on those utilities.

Defined in `app/globals.css` under the `@theme` block:

| CSS Variable | Value | Generated Utility | Usage |
|-------------|-------|------------------|-------|
| `--spacing-container` | `1600px` | `max-w-container` | Page-level layout container max-width |

### DO NOT add `--spacing-xs/sm/md/lg/xl`

These names were added and immediately caused a regression: `sm:max-w-sm` on the Sheet component
collapsed the Citation Details Drawer to 8px wide on desktop. They were removed.
Use Tailwind's numeric scale instead: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px).

### Named token usage example

```tsx
// Page wrapper
<div className="mx-auto max-w-container flex flex-col gap-6">
  ...
</div>
```

---

## Standard Tailwind Utilities in Use

These are built-in Tailwind utilities used in place of arbitrary values.
Use these for half-step or intermediate values not covered by the named scale above.

### Spacing frequency map (top 15 by occurrence)

| Utility | Value | Occurrences |
|---------|-------|-------------|
| `gap-2` | 8px | 68 |
| `px-4` | 16px | 41 |
| `px-2` | 8px | 30 |
| `py-1.5` | 6px | 23 |
| `gap-1` | 4px | 23 |
| `py-3` | 12px | 22 |
| `gap-1.5` | 6px | 19 |
| `gap-4` | 16px | 18 |
| `py-2.5` | 10px | 16 |
| `px-3` | 12px | 16 |
| `pl-8` | 32px | 15 |
| `p-4` | 16px | 12 |
| `px-6` | 24px | 11 |
| `p-1` | 4px | 10 |
| `p-2` | 8px | 9 |

---

## Replacement History: Arbitrary to Standard

All these conversions were applied to the codebase.

### Phase 1 - Tailwind built-in replacements (no new tokens needed)

| Before | After | Value | Occurrences | Files |
|--------|-------|-------|-------------|-------|
| `ring-[3px]` | `ring-3` | 3px | 17 | 15 |
| `min-w-[8rem]` | `min-w-32` | 8rem | 7 | 5 |
| `min-w-[12rem]` | `min-w-48` | 12rem | 1 | 1 |
| `rounded-[2px]` | `rounded-sm` | 2px | 3 | 2 |
| `rounded-[4px]` | `rounded` | 4px | 1 | 1 |

### Phase 2 - Layout token replacements

| Before | After | Value | Occurrences | Files |
|--------|-------|-------|-------------|-------|
| `max-w-[1600px]` | `max-w-container` | 1600px | 2 | 2 |

### Phase 3 - Semantic scale replacements (near-value corrections applied)

| Before | After | Before px | After px | Delta | Files |
|--------|-------|-----------|----------|-------|-------|
| `p-[3px]` | `p-1` | 3px | 4px | +1px | tabs.tsx |
| `translate-y-[2px]` | `translate-y-0.5` | 2px | 2px | 0px | table.tsx (x2) |

Near-value correction tolerance: **±2px**. Values corrected within this tolerance are
marked with a non-zero delta above.

### Phase 3 rollback: `--spacing-xs/sm/md/lg/xl` removed

Tokens `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl` were briefly
added to `@theme` but removed immediately after causing a production regression. In Tailwind v4,
`--spacing-{name}` generates `max-w-{name}` as well, silently overriding the built-in container scale:

| Token (removed) | Intended value | Broken utility | Was | Became |
|-----------------|---------------|----------------|-----|--------|
| `--spacing-xs` | 4px | `max-w-xs` | 20rem | 4px |
| `--spacing-sm` | 8px | `max-w-sm` | 24rem | 8px |
| `--spacing-md` | 16px | `max-w-md` | 28rem | 16px |
| `--spacing-lg` | 24px | `max-w-lg` | 32rem | 24px |
| `--spacing-xl` | 32px | `max-w-xl` | 36rem | 32px |

Effect: Sheet/Drawer panel (`sm:max-w-sm`) collapsed to 8px wide on desktop. Dialog/AlertDialog
(`sm:max-w-lg`) collapsed to 24px. Citation Details Drawer became invisible.

**Rule: Never use xs/sm/md/lg/xl as `--spacing-*` token names in Tailwind v4.**

---

## Intentionally Left as Arbitrary Values

These values remain as `[...]` arbitrary syntax. Each is a single-use,
context-specific dimension that does not belong in the shared spacing system.

| Class | Location | Reason |
|-------|----------|--------|
| `h-[320px]` | `trends-chart.tsx` | Chart canvas fixed height |
| `max-h-[80vh]` | `drawer.tsx` | Viewport-relative, drawer-specific |
| `w-[160px]`, `w-[180px]` | `search-visibility/page.tsx` | Select trigger widths |
| `min-w-[240px]` | `search-visibility/page.tsx` | Search input minimum width |
| `max-w-[140px]` | `citations-table.tsx` | Table cell text truncation |
| `w-[100px]` | `drawer.tsx` | Drawer handle width |
| `w-[2px]` | `sidebar.tsx` | Sidebar resize handle line |
| `max-h-[300px]` | `command.tsx` | Command palette list height |
| `max-w-[420px]` | `toast.tsx` | Toast notification width |
| `h-[1.15rem]` | `switch.tsx` | Switch height (component spec) |
| `border-[1.5px]` | `chart.tsx` | Dashed chart legend line |
| `top-[50%]`, `left-[50%]` | `dialog.tsx`, `alert-dialog.tsx` | Modal centering pattern |
| `top-[60%]` | `navigation-menu.tsx` | Dropdown arrow positioning |
| `top-[1px]` | `navigation-menu.tsx` | Chevron micro-offset (1px) |
| `z-[100]`, `z-[1]` | `toast.tsx`, `navigation-menu.tsx` | Z-index (not spacing) |
| `text-[0.8rem]` | `calendar.tsx` | Calendar nav (type system) |

### Exception report: values outside correction tolerance (>2px from grid)

| Class | Value | Nearest grid | Delta | Decision |
|-------|-------|-------------|-------|---------|
| `top-[1px]` | 1px | 0px or 4px | +1 / -3px | Leave: positioning micro-offset |
| `h-[1.15rem]` | ~18.4px | 16px or 20px | ~2.4px | Leave: component spec value |
| `border-[1.5px]` | 1.5px | 0px or 2px | 1.5px | Leave: chart dashed line spec |
| `w-[2px]` | 2px | 0px or 4px | 2px | Leave: thin divider line |

---

## Rules for New Spacing Values

1. **Use the 4px grid.** All spacing must be a multiple of 4px.
2. **Prefer the 8px grid** for component padding and layout gaps.
3. **Use Tailwind numeric scale** for the 5 key steps: `p-1` (4px), `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px).
4. **Use numeric scale** for half-steps: `py-1.5` (6px), `py-2.5` (10px), `p-3` (12px), `p-5` (20px).
5. **Never write `[px]` syntax** for values that exist in the named or numeric scale.
6. **If a new `--spacing-*` token is needed**, do NOT use `xs`, `sm`, `md`, `lg`, `xl` as the name. These conflict with Tailwind v4's `max-w-*` container scale.
7. **Never hardcode layout container width** - always use `max-w-container`.
8. **Viewport-relative values** (`vh`, `vw`) are acceptable as arbitrary values.
