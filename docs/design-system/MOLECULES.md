# Molecule Schema - AI SEO Dashboard

Molecule specification based on Atomic Design.
Atoms follow ATOMS.md. A molecule = composition of two or more atoms, or an atom + a layout pattern.

---

## Hierarchy Summary

```
Atoms (DS-COMPONENTS.md)
  Molecules (this document)
        Organisms  (Header / Sidebar / StatCards / StrategicInsights / TrendsChart / CitationsTable / CitationDetailsDrawer)
              Templates  (DashboardPage / SearchVisibilityPage)
```

---

## Molecule Inventory (13 total)

| # | Molecule | Source File | Used On |
|---|----------|-------------|---------|
| 01 | StatCard | stat-cards.tsx | Dashboard |
| 02 | InsightCard | strategic-insights.tsx | Dashboard |
| 03 | ProgressRing | citations-table.tsx | Dashboard / SearchVisibility |
| 04 | CitationTableRow | citations-table.tsx | Dashboard / SearchVisibility |
| 05 | CitationCard (Mobile) | citations-table.tsx | Dashboard / SearchVisibility |
| 06 | FilterBar | search-visibility/page.tsx | SearchVisibility |
| 07 | BulkActionBar | search-visibility/page.tsx | SearchVisibility |
| 08 | NavItem | sidebar.tsx | Dashboard / SearchVisibility |
| 09 | ChecklistItem | citation-details-drawer.tsx | Drawer (both pages) |
| 10 | StatCell | citation-details-drawer.tsx | Drawer (both pages) |
| 11 | ChartLegendItem | trends-chart.tsx | Dashboard |
| 12 | ChartTooltip | trends-chart.tsx | Dashboard |
| 13 | HeaderActionGroup | header.tsx | Dashboard |

---

## 01 - StatCard

**File:** `components/dashboard/stat-cards.tsx`
**Used in:** Dashboard `<StatCards />` grid (4 columns)

### Composing Atoms
- `Card / CardContent` (surface container)
- Icon (Lucide, inside the brand badge)
- ProgressBar (brand fill, track = `border-secondary`)
- TrendIcon (`TrendingUp` / `TrendingDown`)

### Props Interface
```ts
interface StatCardProps {
  title: string          // top label of the card
  value: string          // main metric value (display string)
  change: number         // delta percentage (positive / negative)
  changeLabel: string    // text next to the delta ("vs last month" etc.)
  targetValue: number    // target value (basis for progress calculation)
  currentValue: number   // current value (numeric)
  icon: React.ElementType
  unit?: string          // default "%"
}
```

### Layout Structure
```
Card (bg-surface-default/60, hover:bg-surface-hover/80, p-5)
  ├── Row: flex items-start justify-between gap-3
  │     ├── Left: flex-1 space-y-1.5
  │     │     ├── title  - text-body-micro-medium / text-foreground-secondary
  │     │     └── value  - text-display-sm-bold / text-foreground-strong / tabular-nums
  │     └── Right: Icon Badge
  │           - h-10 w-10, rounded-lg, bg-brand-default/15
  │           - Icon h-5 w-5 / text-brand-soft
  └── Bottom: mt-5 space-y-3
        ├── Goal row  - text-body-micro-medium
        │     "Goal:" text-foreground-tertiary
        │     targetValue - text-brand-faint / font-semibold
        │     progressPct - text-foreground-tertiary
        ├── ProgressBar
        │     track: h-2, rounded-full, bg-border-secondary, ring-1 ring-white/10
        │     fill:  bg-brand-default, shadow-[0_0_8px_rgba(139,92,246,0.3)]
        └── Trend row  - gap-1.5
              TrendIcon h-3.5 w-3.5
              change% - text-body-micro-medium font-bold / tabular-nums
                         positive→text-positive-soft  negative→text-danger-soft
              changeLabel - text-body-micro-medium / text-foreground-tertiary
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `surface-default/60` | card bg |
| `surface-hover/80` | card hover bg |
| `brand-default/15` | icon badge bg |
| `brand-soft` | icon color |
| `brand-default` | progress fill |
| `brand-faint` | target value text |
| `border-secondary` | progress track |
| `positive-soft` | upward trend |
| `danger-soft` | downward trend |
| `display-sm-bold` | metric value |
| `body-micro-medium` | label, delta, goal row |

---

## 02 - InsightCard

**File:** `components/dashboard/strategic-insights.tsx`
**Used in:** Dashboard `<StrategicInsights />` grid (1 / 2 / 3 columns)

### Composing Atoms
- `Card / CardHeader / CardContent` (surface container)
- Icon Badge (icon + circular background container)
- `Badge` atom (DS atom - variant: danger / positive / caution)
- `Button` atom (variant: filled, size: sm)

### Props Interface
```ts
type InsightType = "critical" | "opportunity" | "optimization"

interface InsightCardProps {
  id: number
  type: InsightType
  title: string        // top label of the card (caps)
  headline: string     // main headline
  description: string  // body description
  action: string       // CTA button label
  icon: React.ElementType
  priority: string     // Badge text ("Urgent" / "High Impact" / "Medium")
}
```

### Type-to-Token Mapping
```ts
const typeStyles = {
  critical:     { icon: "bg-danger-default/15 text-danger-soft",   button: "bg-danger-default hover:bg-danger-deep" },
  opportunity:  { icon: "bg-brand-default/15 text-brand-soft",     button: "bg-brand-default hover:bg-brand-deep" },
  optimization: { icon: "bg-caution-default/15 text-caution-default", button: "bg-caution-default hover:bg-caution-default/90" },
}

const badgeVariantMap = {
  critical:     "danger",
  opportunity:  "positive",
  optimization: "caution",
}
```

### Layout Structure
```
Card (flex flex-col h-full, bg-surface-default/60, hover:bg-surface-hover/80)
  ├── CardHeader (px-5 pt-5 pb-0)
  │     └── Row: flex items-start justify-between gap-2
  │           ├── Left: flex items-center gap-2
  │           │     ├── Icon Badge - h-9 w-9, rounded-lg, type-specific
  │           │     └── title - text-body-micro-caps-semibold / text-foreground-tertiary
  │           └── Badge atom (variant by type, shrink-0)
  └── CardContent (px-5 pb-5 pt-0, flex flex-col flex-1)
        ├── flex-1
        │     ├── headline - text-title-sub-semibold / text-foreground-secondary
        │     └── description - text-body-micro-medium / text-foreground-tertiary
        └── Button (w-full, size:sm, mt-4, type-specific styles)
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `surface-default/60` | card bg |
| `danger-default/15`, `brand-default/15`, `caution-default/15` | icon badge bg |
| `danger-soft`, `brand-soft`, `caution-default` | icon color |
| `danger-default`, `brand-default`, `caution-default` | button bg |
| `foreground-strong` | button text |
| `body-micro-caps-semibold` | card type label |
| `title-sub-semibold` | headline |
| `body-micro-medium` | description |

---

## 03 - ProgressRing

**File:** `components/dashboard/citations-table.tsx`
**Used in:** CitationTableRow, CitationCard (both pages)

### Composition
- Two SVG `<circle>` elements (track + arc)
- A `<span>` percentage text - absolute center

### Props Interface
```ts
interface ProgressRingProps {
  progress: number   // 0-100
  size?: number      // default 40 (px)
}
```

### Color Branching
```ts
// stroke (SVG class)
progress < 40  → stroke-danger-default
progress < 75  → stroke-caution-default
progress >= 75 → stroke-positive-default

// text (CSS variable)
progress < 40  → var(--color-danger-soft)
progress < 75  → var(--color-caution-soft)
progress >= 75 → var(--color-positive-soft)
```

### Geometry Constants
```
strokeWidth = 3
radius      = (size - strokeWidth) / 2
track fill  = stroke-border-secondary
arc         = strokeLinecap="round", strokeDasharray=circumference, strokeDashoffset=offset
text        = text-label-micro-medium / tabular-nums / absolute center
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `border-secondary` | track stroke |
| `danger-default` | arc stroke (critical) |
| `caution-default` | arc stroke (moderate) |
| `positive-default` | arc stroke (good) |
| `danger-soft`, `caution-soft`, `positive-soft` | percentage text color |
| `label-micro-medium` | percentage text |

---

## 04 - CitationTableRow

**File:** `components/dashboard/citations-table.tsx`
**Used in:** CitationsTable desktop view, inside `<tbody>`

### Composing Atoms
- `Checkbox` atom (selection column, only when `showSelectionColumn=true`)
- `ProgressRing` molecule (optimization column)
- TrendIcon (Lucide - `TrendingUp` / `TrendingDown` / `Minus`)
- `Button` atom (size:sm, variant:outline - Review CTA)

### Props Interface
```ts
interface CitationTableRowProps {
  citation: Citation        // { id, source, page, mentions, trend, optimizationProgress, lastSeen }
  isSelected: boolean
  isHighlighted: boolean
  showSelectionColumn: boolean
  onReview?: (c: Citation) => void
  onToggleRow?: (id: number, checked: boolean) => void
}
```

### Row Background States
```
highlighted → bg-positive-default/10 / transition-colors duration-700
selected    → bg-surface-default/20
default     → hover:bg-surface-default/20
```

### Column Order (when showSelectionColumn=true)
| Column | Content | Typography |
|--------|---------|------------|
| Checkbox | Checkbox atom | - |
| Source | source text | `body-md-regular font-semibold / foreground-secondary` |
| Page | page text | `body-md-medium / foreground-tertiary` |
| Mentions | number (toLocaleString) | `body-md-regular font-semibold tabular-nums / foreground-secondary` |
| Trend | TrendIcon h-4 w-4 | color by trend |
| Optimization | ProgressRing (size=40) | - |
| Last Seen | lastSeen text | `body-md-medium / foreground-tertiary` |
| Quick Action | Button Review | `label-xs-medium font-semibold / brand-faint` |

### Review Button Tokens
```
h-6, gap-1.5, px-2.5
border-brand/30
bg-brand-default/10
hover:bg-brand-default/20
text-brand-faint
```

### Trend Colors
```
up     → text-positive-soft
down   → text-danger-soft
stable → text-foreground-muted
```

---

## 05 - CitationCard (Mobile)

**File:** `components/dashboard/citations-table.tsx`
**Used in:** CitationsTable mobile view (`md:hidden`)

### Composing Atoms
- `ProgressRing` molecule (size=44)
- TrendIcon (Lucide)
- `Button` atom (size:sm, variant:ghost, h-8 w-8 p-0 - ChevronRight)

### Props Interface
```ts
interface CitationCardProps {
  citation: Citation
  onReview?: (c: Citation) => void
}
```

### Layout Structure
```
div (flex items-center justify-between, rounded-lg)
  bg-surface-default/40, p-5, hover:bg-surface-hover/50
  ├── Left: flex items-center gap-4
  │     ├── ProgressRing (size=44)
  │     └── Info: space-y-1.5
  │           ├── Row: source - label-micro-medium font-semibold / foreground-secondary
  │           │         TrendIcon h-3.5 w-3.5
  │           ├── page  - body-md-medium / foreground-tertiary / truncate max-w-[140px]
  │           └── mentions row - font-semibold tabular-nums / foreground-secondary
  │                             + "mentions" / foreground-tertiary
  └── Right: Button (ChevronRight, ghost) - text-foreground-tertiary hover:text-foreground-strong
```

---

## 06 - FilterBar

**File:** `app/search-visibility/page.tsx`
**Used in:** Top filter section of SearchVisibilityPage

### Composing Atoms
- `Card / CardHeader / CardContent`
- `Select / SelectTrigger / SelectContent / SelectItem` atom (x2: dateRange, sourceFilter)
- `Input` atom (searchQuery)
- Lucide icons (Calendar, Filter, Search)

### Props Interface (wired directly to page state)
```ts
interface FilterBarProps {
  dateRange: string
  onDateRangeChange: (v: string) => void
  sourceFilter: string
  onSourceFilterChange: (v: string) => void
  searchQuery: string
  onSearchQueryChange: (v: string) => void
}
```

### Layout Structure
```
Card (bg-surface-default/60)
  ├── CardHeader (pb-3 px-5 pt-5)
  │     └── "Filters" - text-title-sub-semibold / text-foreground-secondary
  └── CardContent (px-5 pb-5)
        └── flex flex-wrap items-center gap-4
              ├── DateRange: flex items-center gap-2
              │     Calendar icon (h-4 w-4 / text-foreground-muted)
              │     Select (w-[160px]) - 7d / 30d / 90d / 1y
              ├── SourceFilter: flex items-center gap-2
              │     Filter icon (h-4 w-4 / text-foreground-muted)
              │     Select (w-[180px]) - All / ChatGPT / Claude / Perplexity / Google AI / Copilot
              └── Search: relative flex-1 min-w-[240px]
                    Search icon (absolute left-3, -translate-y-1/2)
                    Input (pl-10)
```

### Shared Select / Input Style
```
bg-surface-hover/50
border-border-secondary
text-body-md-regular
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `surface-default/60` | Card bg |
| `surface-hover/50` | Select / Input bg |
| `border-secondary` | Select / Input border |
| `foreground-muted` | icon color |
| `foreground-secondary` | header title |
| `title-sub-semibold` | header title |
| `body-md-regular` | Select / Input text |

> **Figma plugin note:** the Search field is a composite of `<Search />` icon + `<Input pl-10>`, which corresponds 1:1 to the `SearchField` atom in plugin-02a (atom carries an internal Icon-Slot). plugin-03b therefore drops the `SearchField` instance directly into the FilterBar without an external Icon-Slot wrapper. The other two filters (Date / Source) keep their external Lucide icon next to the `Select` instance, which matches the React layout.

---

## 07 - BulkActionBar

**File:** `app/search-visibility/page.tsx`
**Used in:** SearchVisibilityPage - fixed bottom bar that renders only while `selectedRows.size > 0`

### Composing Atoms
- `Button` atom x3 (outline / filled / ghost)
- `<span>` selection count text

### Props Interface
```ts
interface BulkActionBarProps {
  selectedCount: number
  onExport: () => void
  onBulkResolve: () => void
  onClearSelection: () => void
}
```

### Layout Structure
```
div (fixed bottom-4 left-1/2, -translate-x-1/2, z-50)
  flex items-center gap-3
  rounded-xl, border-border-secondary
  bg-background/95, px-4 py-3
  shadow-lg, backdrop-blur
  ├── "{n} citations selected" - text-body-md-medium / text-foreground-secondary
  ├── Button (size:sm, variant:outline) - "Export"
  ├── Button (size:sm, variant:default) - "Mark as Resolved"
  └── Button (size:sm, variant:ghost)  - "Clear Selection"
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `background/95` | bar bg |
| `border-secondary` | bar border |
| `foreground-secondary` | count text |
| `body-md-medium` | count text |

> **SSOT gap (Button atom):** React maps `default → primary`, `outline → ?`, `ghost → ghost`. The Figma `Button` atom (plugin-02a) currently exposes `primary | secondary | ghost | destructive`, so the React `outline` variant has no exact counterpart. The molecule config falls back to `secondary` as the closest match. Adding an `outline` variant to plugin-02a is the proper fix for full bidirectional sync.

---

## 08 - NavItem

**File:** `components/dashboard/sidebar.tsx`
**Used in:** Sidebar (desktop vertical / mobile bottom bar)

### Composing Atoms
- Lucide Icon
- Tooltip label `<span>` (desktop hover only)
- Active indicator bar `<span>` (desktop) / Active indicator top bar (mobile)

### Props Interface
```ts
interface NavItemProps {
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick: () => void
}
```

### Desktop Variant
```
button (h-10 w-10, rounded-lg, relative)
  active   → bg-surface-hover / text-primary-default
  inactive → text-foreground-muted / hover:bg-surface-hover hover:text-foreground-secondary

  Icon (h-5 w-5)

  Tooltip span (absolute left-full ml-2, opacity-0 group-hover:opacity-100)
    bg-background, px-2 py-1, rounded-md, shadow-md
    text-label-xs-medium / text-foreground-primary

  Active indicator (absolute -left-2, h-5 w-1, rounded-r-full, bg-primary-default)
```

### Mobile Variant
```
button (h-full flex-col items-center, px-4 pt-0 pb-2, nav: items-stretch)
  active   → text-primary-default
  inactive → text-foreground-muted

  Active indicator span - in-flow first child (h-0.5 w-8 rounded-full)
    active   → bg-primary-default
    inactive → opacity-0 (invisible placeholder, keeps height consistent)
  Inner span (flex flex-1 flex-col items-center justify-center gap-1)
    Icon (h-5 w-5)
    label span - text-label-micro-medium font-semibold
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `primary-default` | active text, active indicator |
| `surface-hover` | active/hover bg (desktop) |
| `foreground-muted` | inactive icon |
| `foreground-secondary` | hover icon |
| `foreground-primary` | tooltip text |
| `background` | tooltip bg |
| `label-xs-medium` | tooltip text |
| `label-micro-medium` | mobile label |

---

## 09 - ChecklistItem

**File:** `components/ui/checklist-item.tsx`
**Used in:** "Optimization Checklist" section of CitationDetailsDrawer

### Composing Atoms
- `Checkbox` atom (`components/ui/checkbox.tsx`) - interactive, individually toggleable
- `<span>` text

> **Figma plugin note:** the Checkbox atom is a `[box + label]` structure. plugin-03b creates an instance and then hides the inner TEXT node via `visible=false`, exposing the box only. The atom link is preserved, so any change to the Checkbox atom propagates into ChecklistItem automatically.

### Props Interface
```ts
interface ChecklistItemProps {
  text: string
  done: boolean
  className?: string
  onCheckedChange?: (checked: boolean) => void
}
```

### Layout Structure
```
div (flex items-start gap-3)
  Checkbox (mt-0.5 shrink-0)
    done=true  → checked  / primary-default bg + white checkmark
    done=false → unchecked / border-primary border + surface-hover bg
  span (text-body-sm-medium font-medium leading-snug)
    done=true  → text-foreground-tertiary
    done=false → text-foreground-primary
```

### State Management
`CitationDetailsDrawer` keeps the checklist array in local state via `useState`.
A `useEffect` reinitializes the array whenever `selectedCitation` changes.

#### Initial Values (driven by optimizationProgress)
```
< 40   → all done=false (4 items)
40-74  → items 0,3 done=true / items 1,2 done=false
>= 75  → 0,1,2 done=true / item 3 done=true when progress > 85
```

#### "Mark as Resolved" Behavior
Items are checked sequentially at 120 ms intervals; 400 ms after the final check, `onResolve` fires and the drawer closes.

### Token Usage
| Token | Applied To |
|-------|------------|
| `primary-default` | done Checkbox bg |
| `border-primary` | unchecked Checkbox border |
| `surface-hover` | unchecked Checkbox bg |
| `foreground-tertiary` | done text |
| `foreground-primary` | undone text |
| `body-sm-medium` | text |

---

## 10 - StatCell

**File:** `components/dashboard/citation-details-drawer.tsx`
**Used in:** CitationDetailsDrawer "Current Stats" 2-column grid

### Composition
- container div (no atom - bespoke layout)
- label `<p>` (caps label)
- value `<p>` (number)

### Props Interface
```ts
interface StatCellProps {
  label: string
  value: string | number
  valueColorClass?: string   // Tailwind text-* class (conditional)
}
```

### Layout Structure
```
div (rounded-lg, border border-border-secondary/50, bg-surface-hover/50, p-4)
  label - text-label-xs-caps-medium / text-border-primary
  value - text-title-sub-semibold / tabular-nums / mt-1
    Mentions    → text-foreground-strong
    Optimization → progress >= 75 → text-positive-default
                   progress >= 40 → text-caution-default
                   progress < 40  → text-danger-soft
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `border-secondary/50` | cell border |
| `surface-hover/50` | cell bg |
| `border-primary` | label text |
| `foreground-strong` | mentions value |
| `positive-default` | optimization value (good) |
| `caution-default` | optimization value (moderate) |
| `danger-soft` | optimization value (critical) |
| `label-xs-caps-medium` | label |
| `title-sub-semibold` | value |

---

## 11 - ChartLegendItem

**File:** `components/dashboard/trends-chart.tsx`
**Used in:** Legend row inside the TrendsChart CardHeader

### Composition
- color dot `<div>` (circular)
- label `<span>`

### Props Interface
```ts
interface ChartLegendItemProps {
  color: string   // hex (read at runtime from a JS CSS variable)
  label: string
}
```

### Layout Structure
```
div (flex items-center gap-2, role="listitem")
  dot div (h-2 w-2 rounded-full, style={{ backgroundColor: color }})
  label span - text-body-micro-medium / text-foreground-secondary
```

### Color Source (read at runtime from CSS variables)
```
AI Discovery   → --chart-1  (#8b5cf6 violet-500)
Organic Search → --chart-2  (#10b981 emerald-500)
Citations      → --chart-4  (#60a5fa blue-400)
```

> **Note:** chart colors are defined on `:root` outside `@theme`. They cannot be used as Tailwind classes - only via the `style` prop.

---

## 12 - ChartTooltip

**File:** `components/dashboard/trends-chart.tsx`
**Used in:** `<Tooltip content={<CustomTooltip />} />` - integrates with Recharts

### Composition
- container div (surface overlay)
- date label `<p>`
- event badge (conditional)
- series rows xN (dot + name + value)

### Props Interface
```ts
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string    // X-axis date value
}
```

### Layout Structure
```
div (rounded-lg, border-border-secondary, bg-surface-default/95, p-4, shadow-xl)
  label - text-body-md-regular font-semibold / text-foreground-strong / mb-2
  [event badge - conditional]
    div (rounded, bg-brand-default/15, px-2 py-1, mb-2, flex items-center gap-1.5)
      dot div (h-1.5 w-1.5 rounded-full bg-brand-soft)
      eventName - text-body-micro-medium / text-brand-faint
  payload rows: space-y-1.5
    each row: flex items-center gap-2 / text-body-micro-medium
      dot div (h-2 w-2 rounded-full, style={{ backgroundColor: entry.color }})
      name - font-medium / text-foreground-tertiary
      value - font-semibold tabular-nums / text-foreground-strong
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `border-secondary` | container border |
| `surface-default/95` | container bg |
| `foreground-strong` | date, value text |
| `brand-default/15` | event badge bg |
| `brand-soft` | event badge dot |
| `brand-faint` | event name |
| `foreground-tertiary` | series name |
| `body-md-regular` | date label |
| `body-micro-medium` | series rows, event text |

---

## 13 - HeaderActionGroup

**File:** `components/dashboard/header.tsx`
**Used in:** Right-side action area of the Dashboard Header

### Composing Atoms
- `SearchInput` - `<input>` + Search icon overlay (hidden md:block)
- `Button` atom (variant:outline, size:sm) - DateRange
- `Button` atom (variant:outline, size:icon) - Notification + Badge

### Sub-molecule: SearchInput (inline)
```
div (relative, hidden md:block)
  Search icon (absolute left-3, -translate-y-1/2, h-4 w-4 / text-foreground-muted)
  input (h-9 w-64, rounded-lg, border-border-secondary, bg-surface-default/30)
    text-body-md-medium / text-foreground-primary
    placeholder:text-foreground-muted
    focus: border-primary-default, ring-1 ring-primary-default
```

### Sub-molecule: NotificationButton (inline)
```
Button (variant:outline, size:icon, h-8 w-8 md:h-9 md:w-9)
  border-border-secondary, bg-surface-default/30
  Bell icon (h-4 w-4)
  Badge span (absolute -right-1 -top-1, h-4 w-4, rounded-full, bg-primary-default)
    count - text-label-micro-medium / text-foreground-strong
```

### DateRange Button
```
Button (variant:outline, size:sm)
  gap-1.5 md:gap-2, border-border-secondary, bg-surface-default/30
  Calendar icon (h-4 w-4)
  "Last 30 days" - hidden sm:inline, text-label-xs-medium md:text-body-micro-medium
  ChevronDown (h-3.5 w-3.5)
```

### Token Usage
| Token | Applied To |
|-------|------------|
| `surface-default/30` | input / button bg |
| `border-secondary` | input / button border |
| `primary-default` | focus ring, notification badge bg |
| `foreground-muted` | Search icon, placeholder |
| `foreground-primary` | input text |
| `foreground-strong` | badge count |
| `label-micro-medium` | badge count |
| `body-md-medium` | input text |
| `label-xs-medium` | date button text (sm) |
| `body-micro-medium` | date button text (md+) |

---

## Organism Composition Reference

| Organism | Composing Molecules | File |
|----------|---------------------|------|
| `StatCards` | StatCard x4 (2 / 4 column grid) | stat-cards.tsx |
| `StrategicInsights` | InsightCard x3 (1 / 2 / 3 column grid) | strategic-insights.tsx |
| `TrendsChart` | ChartLegendItem x3, ChartTooltip | trends-chart.tsx |
| `CitationsTable` | CitationTableRow (desktop) / CitationCard (mobile) / ProgressRing | citations-table.tsx |
| `CitationDetailsDrawer` | ChecklistItem x4, StatCell x2 | citation-details-drawer.tsx |
| `Header` | HeaderActionGroup | header.tsx |
| `Sidebar` | NavItem x4, Logo, Avatar | sidebar.tsx |

---

## Notes for Figma Plugin Implementation

1. **ProgressRing** - not a stroke-based pattern; uses SVG circle strokeDasharray. In Figma, implement via the arcData approach (`startingAngle`, `endingAngle`, `innerRadius`), the same arc method used by the Spinner atom.

2. **Typography overlap warning** - the code mixes compound classes such as `text-body-md-regular font-semibold` in many places. A Figma text style only allows binding to a single key like `body-md-regular`; the `font-semibold` override cannot be applied after `textStyleId` is set.

3. **Dynamic colors (StatCell, ProgressRing)** - color is decided at runtime based on optimization progress. In Figma, split each state (critical / moderate / good) into its own variant.

4. **Chart colors** - managed as `:root` CSS variables, outside `@theme`. They are not subject to Figma variable binding; specify hex values manually.

5. **BulkActionBar** - uses the `fixed bottom-4 left-1/2 -translate-x-1/2` pattern. In Figma, place it on a separate overlay frame.

6. **CitationTableRow row states** - highlighted (positive-default/10), selected (surface-default/20), default (transparent → surface-default/20 hover). Implement as a 4-state Figma variant.

7. **SSOT gaps to track** - `outline` Button variant exists in React but not in the Figma `Button` atom (plugin-02a only ships primary / secondary / ghost / destructive). BulkActionBar Export, HeaderActionGroup DateRange / Notification, and CitationTableRow Review all hit this gap. Adding an `outline` variant to plugin-02a is the bidirectional-SSOT fix.
