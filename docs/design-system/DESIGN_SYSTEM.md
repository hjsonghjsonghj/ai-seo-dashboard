# DESIGN_SYSTEM.md

> **Purpose:** This document is the single source of truth for generating new pages and components in this project. It describes available atoms, molecules, design tokens, and usage conventions. All new pages must follow these patterns exactly.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Color Tokens](#color-tokens)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Border Radius](#border-radius)
6. [Atoms](#atoms)
7. [Molecules](#molecules)
8. [Organisms](#organisms)
9. [Page Templates](#page-templates)
10. [Layout Conventions](#layout-conventions)
11. [Rules](#rules)

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 — config lives in `app/globals.css` inside `@theme`. No `tailwind.config.js`.
- **Font:** Geist (sans) / Geist Mono — loaded via `next/font` in the layout.
- **Icons:** Lucide React
- **Charts:** Recharts
- **UI Primitives:** `components/ui/` (shadcn-style, custom-styled)

---

## Color Tokens

All tokens are defined in `app/globals.css` inside the `@theme` block. Use them as Tailwind utilities: `bg-{token}`, `text-{token}`, `border-{token}`.

### Background

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#020617` | Page background, sidebar base, popover |
| `surface-default` | `#0f172a` | Cards, panels |
| `surface-hover` | `#1e293b` | Hover surfaces, elevated cards, secondary bg |
| `input` | `#1e293b` | Input / textarea field background |

### Foreground (Text)

| Token | Hex | Usage |
|-------|-----|-------|
| `foreground-primary` | `#f1f5f9` | Primary body text |
| `foreground-secondary` | `#e2e8f0` | Secondary text, sidebar labels |
| `foreground-tertiary` | `#CBD5E1` | Meta text, captions |
| `foreground-strong` | `#f8fafc` | Text on colored backgrounds |
| `foreground-muted` | `#94a3b8` | Placeholder, disabled labels |

### Border

| Token | Hex | Usage |
|-------|-----|-------|
| `border-primary` | `#475569` | Checkbox and input edges |
| `border-secondary` | `#334155` | General borders, dividers |

### Brand (Violet)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-deep` | `#7c3aed` | Focus rings, hover pressed |
| `brand-default` | `#8b5cf6` | Filled elements, accent |
| `brand-soft` | `#a78bfa` | Icons, focus dots |
| `brand-faint` | `#c4b5fd` | Secondary brand text |

### Primary Action (Blue)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-default` | `#3b82f6` | Primary buttons, selected states, checkboxes |

### Semantic Status

| Token | Hex | Usage |
|-------|-----|-------|
| `positive-default` | `#10b981` | Success, positive trends |
| `positive-soft` | `#34d399` | Secondary positive indicators |
| `danger-deep` | `#dc2626` | Critical error emphasis |
| `danger-default` | `#ef4444` | Error states, destructive actions |
| `danger-soft` | `#f87171` | Error rings, danger text |
| `caution-default` | `#f59e0b` | Warning states |
| `caution-soft` | `#fbbf24` | Secondary caution indicators |

### Chart Colors (JS-only, not Tailwind classes)

Read at runtime via `getComputedStyle(document.documentElement).getPropertyValue(...)`.

| Variable | Hex | Usage |
|----------|-----|-------|
| `--chart-1` | `#8b5cf6` | AI Discovery area |
| `--chart-2` | `#10b981` | Organic Search area |
| `--chart-4` | `#60a5fa` | Citations area |
| `--chart-grid-line` | `#334155` | CartesianGrid stroke |
| `--chart-axis-text` | `#94a3b8` | Axis labels |
| `--chart-reference-line` | `#7c3aed` | ReferenceLine stroke |
| `--chart-label` | `#a78bfa` | ReferenceLine event labels |

### Opacity Modifiers

All `@theme` token values are direct hex, so `/50`, `/80`, `/15` etc. work correctly — e.g. `bg-brand-default/15`, `bg-surface-default/60`.

### Text on Colored Backgrounds

Always use `text-foreground-strong` for text placed on brand, primary, danger, or caution filled backgrounds.

---

## Typography

All typography is defined as composite utility classes — each class sets font-family, size, line-height, weight, and letter-spacing in one go. **Never combine raw `text-*`, `font-*`, or `tracking-*` utilities alongside these composites.**

### Available Classes

#### Display
| Class | Size | Weight | Use case |
|-------|------|--------|----------|
| `text-display-sm-semibold` | 30px | 600 | Large headings |
| `text-display-sm-bold` | 30px | 700 | KPI stat numbers |

#### Title
| Class | Size | Weight | Use case |
|-------|------|--------|----------|
| `text-title-page-semibold` | 20px | 600 | Page-level headings |
| `text-title-section-semibold` | 18px | 600 | Section headings |
| `text-title-sub-semibold` | 16px | 600 | Sub-section headings |

#### Body
| Class | Size | Weight | Use case |
|-------|------|--------|----------|
| `text-body-md-regular` | 16px | 400 | Prose body text |
| `text-body-md-medium` | 16px | 500 | Interactive body text |
| `text-body-sm-medium` | 14px | 500 | Small body text |
| `text-body-micro-medium` | 13px | 500 | Micro body text |
| `text-body-micro-bold` | 13px | 700 | Micro body emphasis |

#### Label
| Class | Size | Weight | Use case |
|-------|------|--------|----------|
| `text-label-xs-medium` | 12px | 500 | Standard XS labels |
| `text-label-micro-medium` | 11px | 500 | Micro labels |

#### Caps Variants (uppercase + 0.01em tracking)
| Class | Size | Weight | Use case |
|-------|------|--------|----------|
| `text-label-xs-caps-medium` | 12px | 500 | Stat cell labels |
| `text-label-xs-caps-semibold` | 12px | 600 | Table column headers |
| `text-body-micro-caps-semibold` | 13px | 600 | Insight card type labels |

---

## Spacing

Base grid: **4px**. Prefer 8px steps for component padding and layout gaps.

| Tailwind Utility | px | Notes |
|------------------|----|-------|
| `p-1` / `gap-1` | 4px | Icon padding, badge gap |
| `p-2` / `gap-2` | 8px | Compact padding, cell gap |
| `p-3` / `gap-3` | 12px | Medium-small |
| `p-4` / `gap-4` | 16px | Default card padding, form gap |
| `p-5` / `gap-5` | 20px | Card content padding |
| `p-6` / `gap-6` | 24px | Section padding |
| `p-8` / `gap-8` | 32px | Large sections |
| `py-1.5` | 6px | Half-step |
| `py-2.5` | 10px | Half-step |
| `max-w-container` | 1600px | Page-level layout container |

**Never use arbitrary `[px]` syntax** for values that exist in the numeric scale.

---

## Border Radius

| Tailwind | px | Usage |
|----------|----|-------|
| `rounded-sm` | 2px | Subtle rounding |
| `rounded` | 4px | Small chips |
| `rounded-md` | 6px | Small inner elements |
| `rounded-lg` | 8px | Buttons, inputs, badges, tooltip |
| `rounded-xl` | 12px | Alerts, cards |
| `rounded-2xl` | 16px | Large wrapper panels |
| `rounded-full` | 9999px | Pills, avatars, dots |

---

## Atoms

Atom components live in `components/ui/`. They are the primitive building blocks. Always use atom components — never build custom replacements inline.

---

### Button

**File:** `components/ui/button.tsx`

**Variants:** `default` (primary blue) | `secondary` | `outline` | `ghost` | `destructive`

**Sizes:** `sm` (h-8) | `default` (h-9) | `lg` (h-10) | `icon` (square)

```tsx
import { Button } from "@/components/ui/button"

// Primary action
<Button variant="default" size="default">Save</Button>

// Secondary
<Button variant="secondary" size="sm">Cancel</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Icon button
<Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>

// Ghost (low-priority, icon-only nav)
<Button variant="ghost" size="sm">Clear</Button>
```

**Token summary:**
- `default` → `primary-default` bg, `foreground-strong` text
- `secondary` → `surface-hover` bg, `foreground-secondary` text
- `outline` → `background` bg, `foreground-primary` border + text; hover → `brand-default` bg
- `ghost` → transparent bg, hover → `surface-hover`
- `destructive` → `danger-default` bg, `foreground-strong` text

**Focus ring:** `ring-3 ring-brand-deep/50`

---

### Input

**File:** `components/ui/input.tsx`

**States:** default | focus | error | disabled

**Sizes (via className):** sm `h-8` | md `h-9` | lg `h-10`

```tsx
import { Input } from "@/components/ui/input"

<Input placeholder="Search..." className="h-9 w-64" />

// With label
<div className="space-y-1.5">
  <label className="text-label-xs-medium text-foreground-secondary">Email</label>
  <Input type="email" placeholder="you@example.com" />
</div>
```

**Token summary:** `bg-input` (slate-800), `border-border-secondary`, `text-foreground-primary`, placeholder `text-foreground-muted`. Focus: `border-primary-default ring-1 ring-primary-default`.

---

### Badge

**File:** `components/ui/badge.tsx`

**Variants:** `neutral` | `success` | `warning` | `danger` | `info`

Style: pill (`rounded-full`), 15% opacity fill background, no border.

Typography: `text-label-xs-caps-semibold`

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="success">Active</Badge>
<Badge variant="danger">Urgent</Badge>
<Badge variant="warning">Pending</Badge>
```

---

### Checkbox

**File:** `components/ui/checkbox.tsx`

**States:** unchecked | checked | disabled

```tsx
import { Checkbox } from "@/components/ui/checkbox"

<div className="flex items-center gap-3">
  <Checkbox id="opt1" />
  <label htmlFor="opt1" className="text-body-sm-medium text-foreground-primary">Option</label>
</div>
```

**Token summary:** unchecked → `border-primary` border + `surface-hover` bg. Checked → `primary-default` fill, white checkmark.

---

### Radio

**File:** `components/ui/radio-group.tsx`

**States:** unchecked | checked | disabled

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup defaultValue="a">
  <div className="flex items-center gap-3">
    <RadioGroupItem value="a" id="a" />
    <label htmlFor="a" className="text-body-sm-medium text-foreground-primary">Option A</label>
  </div>
</RadioGroup>
```

---

### Switcher (Switch)

**File:** `components/ui/switch.tsx`

**States:** off | on | disabled

Track: 32x18px. Thumb: 14x14px.

```tsx
import { Switch } from "@/components/ui/switch"

<div className="flex items-center gap-3">
  <Switch id="notifications" />
  <label htmlFor="notifications" className="text-body-sm-medium text-foreground-primary">Enable notifications</label>
</div>
```

---

### Select

**File:** `components/ui/select.tsx`

**States:** default | open | selected | disabled

**Sizes (via className on SelectTrigger):** sm `h-8` | md `h-9` | lg `h-10`

```tsx
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-[180px] bg-surface-hover/50 border-border-secondary">
    <SelectValue placeholder="Select range" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="7d">Last 7 days</SelectItem>
    <SelectItem value="30d">Last 30 days</SelectItem>
    <SelectItem value="90d">Last 90 days</SelectItem>
  </SelectContent>
</Select>
```

**Token summary:** `bg-surface-hover/50`, `border-border-secondary`, chevron-down trailing icon, `text-body-md-regular`.

---

### SearchField

**File:** Inline pattern — `<Input>` with a Search icon overlay.

```tsx
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
  <Input
    placeholder="Search..."
    className="pl-10 h-9 bg-surface-default/30 border-border-secondary"
  />
</div>
```

---

### Progress (Bar)

**File:** `components/ui/progress.tsx`

Track: `bg-border-secondary`, height `h-2`, `rounded-full`. Fill: color token.

```tsx
import { Progress } from "@/components/ui/progress"

// Brand fill (default)
<Progress value={72} className="h-2" />
```

For custom fill colors, override via className on the indicator or wrap manually:

```tsx
<div className="h-2 rounded-full bg-border-secondary ring-1 ring-white/10">
  <div
    className="h-full rounded-full bg-brand-default"
    style={{ width: `${pct}%` }}
  />
</div>
```

---

### Avatar

**File:** `components/ui/avatar.tsx`

**Sizes:** xs 24px | sm 32px | md 40px | lg 56px

**States:** default | online (positive-default dot, bottom-right)

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// With image
<Avatar className="h-10 w-10">
  <AvatarImage src="/avatar.png" alt="HJ" />
  <AvatarFallback className="bg-brand-default/25 text-foreground-strong text-body-sm-medium">HJ</AvatarFallback>
</Avatar>

// Online indicator
<div className="relative">
  <Avatar className="h-10 w-10">
    <AvatarFallback className="bg-brand-default/25 text-foreground-strong">HJ</AvatarFallback>
  </Avatar>
  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-positive-default ring-2 ring-background" />
</div>
```

---

### Alert

**File:** `components/ui/alert.tsx`

**Variants:** `info` | `success` | `warning` | `destructive`

Style: colored 1px border, 8% opacity background, `rounded-xl`.

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Something went wrong</AlertTitle>
  <AlertDescription>Please try again or contact support.</AlertDescription>
</Alert>
```

---

### Spinner

**File:** `components/ui/spinner.tsx` (or inline arc pattern)

**Sizes:** sm 16px | md 24px | lg 32px

```tsx
// Typical inline usage
<div className="h-6 w-6 animate-spin rounded-full border-2 border-border-primary border-t-brand-default" />
```

---

### Separator

**File:** `components/ui/separator.tsx`

**Orientations:** horizontal (1px height) | vertical (1px width)

Fill: `bg-border-secondary`

```tsx
import { Separator } from "@/components/ui/separator"

<Separator />                          {/* horizontal */}
<Separator orientation="vertical" />   {/* vertical */}
```

---

### Toggle

**File:** `components/ui/toggle.tsx`

**States:** default | active | hover | disabled

**Sizes (icon-only):** sm 28px | md 32px | lg 36px

Active state: `bg-brand-deep`, inactive: transparent with hover `bg-surface-hover`.

```tsx
import { Toggle } from "@/components/ui/toggle"
import { Bold } from "lucide-react"

<Toggle aria-label="Bold">
  <Bold className="h-4 w-4" />
</Toggle>
```

---

### Tooltip

**File:** `components/ui/tooltip.tsx`

**Placements:** top | right | bottom | left

Style: `bg-surface-hover`, `border-border-primary`, `rounded-lg`, `shadow-md`.

```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button>
    </TooltipTrigger>
    <TooltipContent>
      <p className="text-label-xs-medium text-foreground-primary">Helpful hint</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Card

**File:** `components/ui/card.tsx`

The base surface container. Used for every panel, stat block, and content section.

```tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

<Card className="bg-surface-default/60 hover:bg-surface-hover/80 transition-colors">
  <CardHeader className="px-5 pt-5 pb-0">
    <CardTitle className="text-title-sub-semibold text-foreground-secondary">Section Title</CardTitle>
  </CardHeader>
  <CardContent className="px-5 pb-5 pt-4">
    {/* content */}
  </CardContent>
</Card>
```

Standard card bg: `bg-surface-default/60`. Hover: `bg-surface-hover/80`.

---

## Molecules

Molecules are composed from atoms. They are either implemented as dedicated component files or as inline patterns within larger components.

---

### StatCard

**File:** `components/dashboard/stat-cards.tsx`

Displays a single KPI metric with an icon badge, progress bar toward a goal, and a trend indicator.

```tsx
<StatCard
  title="AI Visibility Score"
  value="87.3%"
  change={12.5}
  changeLabel="vs last month"
  targetValue={100}
  currentValue={87.3}
  icon={TrendingUp}
/>
```

**Layout pattern:**
```
Card (p-5, bg-surface-default/60)
  Row (flex justify-between)
    Left: title (text-body-micro-medium / foreground-secondary)
          value (text-display-sm-bold / foreground-strong / tabular-nums)
    Right: Icon badge (h-10 w-10, rounded-lg, bg-brand-default/15, icon text-brand-soft)
  Bottom (mt-5, space-y-3)
    Goal row: "Goal:" text-foreground-tertiary + target (text-brand-faint font-semibold)
    ProgressBar (h-2, brand-default fill)
    Trend row: TrendIcon + change% (positive-soft / danger-soft) + changeLabel (foreground-tertiary)
```

---

### InsightCard

**File:** `components/dashboard/strategic-insights.tsx`

Strategic insight card with a severity type, icon badge, badge pill, headline, description, and CTA button.

**Types:** `critical` | `opportunity` | `optimization`

**Type-to-token mapping:**
- `critical` → `danger-default/15` badge bg, `danger-soft` icon, `danger-default` button
- `opportunity` → `brand-default/15` badge bg, `brand-soft` icon, `brand-default` button
- `optimization` → `caution-default/15` badge bg, `caution-default` icon + button

```
Card (flex flex-col h-full, bg-surface-default/60)
  CardHeader: Row (icon badge + type label caps + Badge atom)
  CardContent: headline (title-sub-semibold) + description (body-micro-medium) + Button (w-full)
```

---

### ProgressRing

**File:** `components/dashboard/citations-table.tsx`

SVG ring showing an optimization score 0-100. Color branches automatically by value.

```tsx
<ProgressRing progress={72} size={40} />   // desktop (40px)
<ProgressRing progress={72} size={44} />   // mobile card (44px)
```

**Color logic:**
- `< 40` → `stroke-danger-default`, text `color: var(--color-danger-soft)`
- `40-74` → `stroke-caution-default`, text `color: var(--color-caution-soft)`
- `>= 75` → `stroke-positive-default`, text `color: var(--color-positive-soft)`

Text: `text-label-micro-medium tabular-nums`

---

### CitationTableRow

**File:** `components/dashboard/citations-table.tsx`

One row in the Citations table (desktop). Includes an optional Checkbox, ProgressRing, TrendIcon, and a Review button.

**Row background states:**
- highlighted → `bg-positive-default/10 transition-colors duration-700`
- selected → `bg-surface-default/20`
- default → `hover:bg-surface-default/20`

**Review button style:**
```
h-6 px-2.5 gap-1.5
border-brand/30
bg-brand-default/10 hover:bg-brand-default/20
text-brand-faint text-label-xs-medium font-semibold
```

**Trend colors:** up → `text-positive-soft`, down → `text-danger-soft`, stable → `text-foreground-muted`

---

### CitationCard (Mobile)

**File:** `components/dashboard/citations-table.tsx`

Card-style layout for each citation on mobile (`md:hidden`).

```
div (flex justify-between, rounded-lg, bg-surface-default/40 hover:bg-surface-hover/50, p-5)
  Left: ProgressRing (size=44) + info column (source, page, mentions)
  Right: Button ghost icon (ChevronRight)
```

---

### FilterBar

**File:** `app/search-visibility/page.tsx`

Horizontal filter row with Date Range select, Source select, and a Search input.

```
Card (bg-surface-default/60)
  "Filters" header (title-sub-semibold)
  flex flex-wrap gap-4:
    [Calendar icon] + Select (w-[160px]) — date range
    [Filter icon]   + Select (w-[180px]) — source
    [Search icon]   + Input (flex-1 min-w-[240px] pl-10) — query
```

All form controls: `bg-surface-hover/50 border-border-secondary text-body-md-regular`

---

### BulkActionBar

**File:** `app/search-visibility/page.tsx`

Fixed bottom bar that appears when rows are selected. Floats centered above the page bottom.

```
div (fixed bottom-4 left-1/2 -translate-x-1/2 z-50)
  flex items-center gap-3
  rounded-xl border-border-secondary bg-background/95 px-4 py-3
  backdrop-blur shadow-lg
  "{n} citations selected" (body-md-medium / foreground-secondary)
  Button outline sm — "Export"
  Button default sm — "Mark as Resolved"
  Button ghost sm   — "Clear Selection"
```

---

### NavItem

**File:** `components/dashboard/sidebar.tsx`

A single navigation item supporting both desktop icon-only (with hover tooltip) and mobile (icon + label) layouts.

**Desktop:**
```
button (h-10 w-10, rounded-lg)
  active   → bg-surface-hover / text-primary-default
  inactive → text-foreground-muted / hover:bg-surface-hover hover:text-foreground-secondary
  Active indicator: absolute -left-2, h-5 w-1, rounded-r-full, bg-primary-default
  Tooltip:  absolute left-full ml-2, text-label-xs-medium, bg-background, rounded-md
```

**Mobile:**
```
button (h-full flex-col px-4)
  Active top bar: h-0.5 w-8 rounded-full bg-primary-default (opacity-0 when inactive)
  Icon (h-5 w-5)
  label (text-label-micro-medium font-semibold)
```

---

### ChecklistItem

**File:** `components/ui/checklist-item.tsx`

A Checkbox atom paired with a text label. Used inside the Citation Details Drawer.

```tsx
<ChecklistItem
  text="Add structured data markup"
  done={false}
  onCheckedChange={(checked) => handleChange(checked)}
/>
```

**States:**
- done=true → Checkbox checked (`primary-default` fill), text `text-foreground-tertiary`
- done=false → Checkbox unchecked, text `text-foreground-primary`

Typography: `text-body-sm-medium`

---

### StatCell

**File:** `components/dashboard/citation-details-drawer.tsx`

A small stat display block used in 2-column grids inside the Drawer.

```
div (rounded-lg border border-border-secondary/50 bg-surface-hover/50 p-4)
  label (text-label-xs-caps-medium / text-border-primary)
  value (text-title-sub-semibold / tabular-nums / mt-1)
    Mentions     → text-foreground-strong
    Optimization → >= 75 → text-positive-default
                   >= 40 → text-caution-default
                   < 40  → text-danger-soft
```

---

### ChartLegendItem

**File:** `components/dashboard/trends-chart.tsx`

A single entry in a chart legend row. Color is injected via JS from `--chart-*` CSS variables.

```tsx
<div className="flex items-center gap-2">
  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
  <span className="text-body-micro-medium text-foreground-secondary">{label}</span>
</div>
```

---

### ChartTooltip

**File:** `components/dashboard/trends-chart.tsx`

Custom Recharts tooltip overlay.

```
div (rounded-lg border-border-secondary bg-surface-default/95 p-4 shadow-xl)
  date (body-md-regular font-semibold / foreground-strong)
  [optional event badge: bg-brand-default/15, dot brand-soft, text brand-faint]
  series rows (space-y-1.5):
    each: color dot + name (foreground-tertiary) + value (foreground-strong font-semibold tabular-nums)
```

---

### HeaderActionGroup

**File:** `components/dashboard/header.tsx`

The right-side action cluster in the page header: Search input + Date Range button + Notification button.

**SearchInput (hidden below md):**
```
div relative
  Search icon (absolute left-3 / foreground-muted)
  input (h-9 w-64, rounded-lg, bg-surface-default/30, border-border-secondary, pl-10)
  focus: border-primary-default ring-1 ring-primary-default
```

**DateRange Button (outline sm):**
```
gap-1.5 border-border-secondary bg-surface-default/30
[Calendar icon] "Last 30 days" [ChevronDown icon]
text: hidden sm:inline label-xs-medium / md body-micro-medium
```

**Notification Button (outline icon):**
```
h-8 w-8 md:h-9 md:w-9, border-border-secondary, bg-surface-default/30
Bell icon
Badge: absolute -right-1 -top-1, h-4 w-4, rounded-full, bg-primary-default
       count: label-micro-medium / foreground-strong
```

---

## Organisms

Organisms are large, page-level composite components. They are assembled from molecules.

| Organism | File | Composing Molecules |
|----------|------|---------------------|
| `StatCards` | `stat-cards.tsx` | StatCard x4 (2 / 4 col grid) |
| `StrategicInsights` | `strategic-insights.tsx` | InsightCard x3 (1 / 2 / 3 col grid) |
| `TrendsChart` | `trends-chart.tsx` | ChartLegendItem x3, ChartTooltip (Recharts) |
| `CitationsTable` | `citations-table.tsx` | CitationTableRow (desktop) + CitationCard (mobile) + ProgressRing |
| `CitationDetailsDrawer` | `citation-details-drawer.tsx` | ChecklistItem x4, StatCell x2 |
| `Header` | `header.tsx` | HeaderActionGroup |
| `Sidebar` | `sidebar.tsx` | NavItem x4, Logo, Avatar |

---

## Page Templates

### Dashboard (`/`)

```
layout: flex h-screen overflow-hidden bg-background
  Sidebar (fixed left, icon-only desktop / bottom bar mobile)
  main (flex-1 overflow-y-auto)
    div mx-auto max-w-container flex flex-col gap-6 p-6
      Header
      StatCards (grid 2→4 cols)
      StrategicInsights (grid 1→2→3 cols)
      TrendsChart (full width card)
      CitationsTable (full width card, desktop table + mobile card list)
```

### Search Visibility (`/search-visibility`)

```
layout: same Sidebar + main wrapper
  div mx-auto max-w-container flex flex-col gap-6 p-6
    Header (page title + HeaderActionGroup)
    FilterBar (full width)
    CitationsTable (with showSelectionColumn=true)
    BulkActionBar (fixed bottom, conditional)
    CitationDetailsDrawer (Sheet, right side)
```

---

## Layout Conventions

**Page wrapper:**
```tsx
<div className="mx-auto max-w-container flex flex-col gap-6 p-6">
```

**Responsive grid — StatCards:**
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
```

**Responsive grid — InsightCards:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Card standard padding:** `px-5 pt-5 pb-5` (use `CardHeader pb-0` + `CardContent pt-4` when splitting header / body)

**Focus rings:** `ring-3 ring-brand-deep/50` for brand-focus (inputs, selects). `ring-1 ring-primary-default` for primary-focus (header search).

**Danger validation rings:** `ring-danger-soft/20` (light mode equivalent)

**Backdrop blur overlays:** `bg-background/95 backdrop-blur` (BulkActionBar, ChartTooltip)

**Transition defaults:** `transition-colors duration-200` on interactive surfaces, `duration-700` on highlight row fade.

**Mobile breakpoints:**
- Sidebar switches to bottom nav at `md`
- Table switches to card list at `md` (table `hidden md:block`, cards `md:hidden`)
- HeaderActionGroup SearchInput hidden below `md`

---

## Rules

1. **Never use raw hex values** in className strings. Always use token utilities.
2. **Never combine** a typography composite class with separate `font-*`, `text-*`, or `tracking-*` overrides.
3. **Never use arbitrary `[px]` syntax** for spacing values that exist in the numeric scale.
4. **Never add `--spacing-xs/sm/md/lg/xl`** as token names — these silently break Tailwind v4's `max-w-*` scale.
5. **Text on colored backgrounds** always uses `text-foreground-strong`.
6. **Chart colors** (`--chart-*`) are JS-only — use `getComputedStyle` to read them, never use them as Tailwind class strings.
7. **Always use existing atom components** from `components/ui/` — never build one-off replacements inline.
8. **Cards use `bg-surface-default/60`** as the standard background. Hover state is `bg-surface-hover/80`.
9. **All spacing must align to the 4px grid.** Prefer 8px multiples for component padding and gaps.
10. **Page layout max-width** is always `max-w-container` (1600px) — never hardcode a pixel value.
