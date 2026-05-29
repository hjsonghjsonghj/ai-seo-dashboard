# Lovable Prompt — AI Visibility Page

---

## Context

This is a Next.js 15 App Router project with Tailwind CSS v4 (config inside `app/globals.css` @theme block — no tailwind.config.js). All design tokens, typography utilities, and component patterns are documented in `DESIGN_SYSTEM.md`. Read it fully before writing any code.

The project already has two pages:
- `/` — Dashboard Overview
- `/search-visibility` — Full citation table with filters

You are building the third page: **AI Visibility** at `app/ai-visibility/page.tsx`.

---

## Goal

A dedicated analytics page that breaks down AI citation performance **per platform** (ChatGPT, Claude, Perplexity, Google AI, Copilot). The dashboard shows aggregate numbers — this page shows how each AI tool is performing individually.

---

## Data Source

Import `citationsData` from `@/components/dashboard/citations-table`. Do not create new mock data — derive everything from this array.

```ts
import { citationsData } from "@/components/dashboard/citations-table"
```

Each item in `citationsData` has:
```ts
{
  id: number
  source: "ChatGPT" | "Claude" | "Perplexity" | "Google AI" | "Copilot"
  page: string
  mentions: number
  trend: "up" | "down" | "stable"
  optimizationProgress: number   // 0–100
  lastSeen: string
  aiContext: string
}
```

### Derived per-platform stats (compute with useMemo)

For each of the 5 platforms, derive:
- `totalMentions` — sum of `mentions`
- `citationCount` — count of items
- `avgOptimization` — average of `optimizationProgress` (round to integer)
- `trendUp` — count where trend === "up"
- `trendDown` — count where trend === "down"
- `trendStable` — count where trend === "stable"
- `topPage` — the item with highest `mentions` for that platform
- `shareOfTotal` — totalMentions / sum of all mentions × 100

**Expected derived values (for reference — must match):**
| Platform | totalMentions | avgOpt | citations | trendUp | trendDown |
|----------|--------------|--------|-----------|---------|-----------|
| ChatGPT  | 2109 | 66% | 5 | 2 | 1 |
| Claude   | 1675 | 63% | 5 | 3 | 0 |
| Perplexity | 1352 | 69% | 5 | 2 | 1 |
| Google AI | 1127 | 47% | 5 | 1 | 2 |
| Copilot  | 974  | 81% | 5 | 4 | 0 |

---

## Platform Color Map

Define this constant at the top of the file. Use CSS variable values from `:root` (not @theme) where available:

```ts
const PLATFORM_COLORS: Record<string, string> = {
  ChatGPT:    "#8b5cf6",   // brand-default (violet-500)
  Claude:     "#10b981",   // positive-default (emerald-500)
  Perplexity: "#60a5fa",   // chart-4 (blue-400)
  "Google AI":"#f59e0b",   // caution-default (amber-500)
  Copilot:    "#f87171",   // danger-soft (red-400)
}
```

---

## Page Structure

```
<div className="min-h-screen bg-background tracking-tighter">
  <Sidebar />                        {/* import from @/components/dashboard/sidebar */}
  <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-2 md:gap-3">
    [Inline Page Header]
    <main className="px-4 pt-2 pb-4 md:px-6 md:pt-2 md:pb-6">
      <div className="mx-auto max-w-container space-y-4 md:space-y-6">
        [Section 1: Platform Summary Cards]
        [Section 2: Mentions Chart + Platform Ranking]
        [Section 3: Optimization Score Chart + Trend Breakdown]
        [Section 4: Top Citations per Platform]
      </div>
    </main>
  </div>
</div>
```

---

## Section 1 — Inline Page Header

Do NOT import the `Header` component (it has hardcoded Dashboard text). Build an inline header instead, matching the exact same DOM structure and className patterns:

```tsx
<header className="flex h-16 items-center justify-between border-b border-border-secondary/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
  <div>
    <h1 className="text-title-section-semibold md:text-title-page-semibold text-foreground-strong">
      AI Visibility
    </h1>
    <p className="text-body-micro-medium md:text-body-md-regular font-medium text-foreground-tertiary">
      Performance breakdown by AI platform
    </p>
  </div>
  <div className="flex items-center gap-2 md:gap-3">
    {/* Date range Select — reuse same pattern as header.tsx */}
    <Select defaultValue="30d">
      <SelectTrigger className="h-9 w-[160px] border-border-secondary bg-surface-hover/50">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-foreground-muted shrink-0" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="1y">Last year</SelectItem>
      </SelectContent>
    </Select>
  </div>
</header>
```

---

## Section 2 — Platform Summary Cards

5-column grid (1 col on mobile, 2 on sm, 5 on xl). One card per platform.

```
grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4
```

Each card:
```
Card (bg-surface-default/60 hover:bg-surface-hover/80 transition-colors cursor-default)
  CardContent (p-5)
    Row: flex justify-between items-start
      Left:
        Platform color dot (h-2 w-2 rounded-full, backgroundColor: PLATFORM_COLORS[platform])
        Platform name (text-body-micro-medium text-foreground-secondary, ml-2, inline)
      Right:
        trend badge — if trendUp > trendDown → Badge variant="success" "Growing"
                    — if trendDown > trendUp → Badge variant="danger" "Declining"
                    — else → Badge variant="neutral" "Stable"
    mt-3:
      Total mentions (text-display-sm-bold text-foreground-strong tabular-nums)
      "total mentions" label (text-label-xs-medium text-foreground-muted mt-0.5)
    mt-4: progress bar toward 100% share-of-total
      track: h-1.5 rounded-full bg-border-secondary
      fill:  rounded-full, backgroundColor: PLATFORM_COLORS[platform], width: shareOfTotal%
    mt-3: flex justify-between
      Left:  avgOptimization% (text-body-micro-bold text-foreground-secondary)
             " avg score" (text-label-xs-medium text-foreground-muted)
      Right: citationCount (text-body-micro-bold text-foreground-secondary tabular-nums)
             " pages" (text-label-xs-medium text-foreground-muted)
```

---

## Section 3 — Mentions Chart + Platform Ranking

Two-column grid: `grid grid-cols-1 lg:grid-cols-3 gap-4`

### Left (lg:col-span-2) — Mentions by Platform (Bar Chart)

```
Card (bg-surface-default/60)
  CardHeader (px-5 pt-5 pb-0)
    CardTitle: "Mentions by Platform" (text-title-sub-semibold text-foreground-secondary)
    subtitle: "Total AI-generated citations across all tracked pages" (text-body-micro-medium text-foreground-muted mt-0.5)
  CardContent (px-5 pb-5 pt-4)
    div h-[260px]
    BarChart (Recharts, horizontal=false, data=platformStats array)
      CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-secondary)" vertical=false
      XAxis dataKey="platform" tick fontSize=12 fill="var(--color-foreground-muted)" axisLine=false tickLine=false
      YAxis tick fontSize=12 fill="var(--color-foreground-muted)" axisLine=false tickLine=false
      Tooltip — custom tooltip: bg-surface-default/95 border-border-secondary rounded-lg p-3 shadow-xl
        show platform name (text-label-xs-medium text-foreground-muted)
        show value (text-body-sm-medium font-semibold text-foreground-strong tabular-nums) + " mentions"
      Bar dataKey="totalMentions" radius={[4,4,0,0]}
        each bar fill = PLATFORM_COLORS[entry.platform]   ← use Cell from recharts
```

### Right (lg:col-span-1) — Platform Ranking

```
Card (bg-surface-default/60)
  CardHeader (px-5 pt-5 pb-0)
    CardTitle: "Platform Ranking" (text-title-sub-semibold text-foreground-secondary)
  CardContent (px-5 pb-5 pt-4)
    space-y-3
    For each platform sorted by totalMentions desc:
      div (flex items-center gap-3)
        Rank number (text-label-xs-medium text-foreground-muted w-4 text-right tabular-nums)
        Color dot (h-2.5 w-2.5 rounded-full flex-shrink-0)
        Platform name (text-body-sm-medium text-foreground-secondary flex-1)
        Progress track (flex-1 max-w-[80px] h-1.5 rounded-full bg-border-secondary)
          fill width = totalMentions / max(totalMentions) × 100%
          fill color = PLATFORM_COLORS[platform]
        mentions value (text-body-micro-bold text-foreground-secondary tabular-nums w-10 text-right)
```

---

## Section 4 — Optimization Score Chart + Trend Breakdown

Two-column grid: `grid grid-cols-1 lg:grid-cols-2 gap-4`

### Left — Average Optimization Score by Platform (Horizontal Bar)

```
Card (bg-surface-default/60)
  CardHeader: "Optimization Score" / "Average content optimization per platform"
  CardContent px-5 pb-5 pt-4
    space-y-4
    For each platform sorted by avgOptimization desc:
      div
        flex justify-between mb-1.5
          platform name (text-body-sm-medium text-foreground-secondary)
          score (text-body-sm-medium font-semibold tabular-nums)
            color: >=75 text-positive-default / >=50 text-caution-default / <50 text-danger-soft
        Progress track (h-2 rounded-full bg-border-secondary)
          fill: width=avgOptimization%, rounded-full, backgroundColor=PLATFORM_COLORS[platform]
          transition-all duration-500
```

### Right — Trend Distribution (Stacked Visual)

```
Card (bg-surface-default/60)
  CardHeader: "Citation Trends" / "Up / stable / down breakdown per platform"
  CardContent px-5 pb-5 pt-4
    space-y-4
    For each platform:
      div
        flex justify-between mb-1.5
          platform name (text-body-sm-medium text-foreground-secondary)
          row of 3 badges:
            if trendUp > 0   → span text-label-xs-medium text-positive-default "↑ {trendUp}"
            if trendStable>0 → span text-label-xs-medium text-foreground-muted  "→ {trendStable}"
            if trendDown > 0 → span text-label-xs-medium text-danger-soft       "↓ {trendDown}"
        Stacked bar (h-2 rounded-full flex overflow-hidden bg-border-secondary)
          up segment:     flex-grow proportional, bg-positive-default
          stable segment: flex-grow proportional, bg-border-primary
          down segment:   flex-grow proportional, bg-danger-soft
          (proportional = count / citationCount)
```

---

## Section 5 — Top Citations Per Platform

Tabbed view — one tab per platform showing that platform's top 3 citations.

```
Card (bg-surface-default/60)
  CardHeader (px-5 pt-5 pb-0)
    flex justify-between items-center
      CardTitle "Top Citations by Platform" (text-title-sub-semibold text-foreground-secondary)
      Link to /search-visibility:
        Button variant="ghost" size="sm"
          "View all" + ArrowRight icon (h-3.5 w-3.5)
          text-brand-faint hover:text-brand-soft
  CardContent (px-5 pb-5 pt-4)
    Tabs defaultValue="ChatGPT"
      TabsList (bg-surface-hover rounded-lg p-1 h-auto flex-wrap gap-1)
        For each platform:
          TabsTrigger value={platform}
            flex items-center gap-1.5
            Color dot h-1.5 w-1.5 rounded-full backgroundColor=PLATFORM_COLORS[platform]
            platform name
      For each platform:
        TabsContent value={platform}
          space-y-2 mt-4
          For top 3 citations (sorted by mentions desc) of that platform:
            div (flex items-center gap-4 rounded-lg bg-surface-hover/40 hover:bg-surface-hover/70 px-4 py-3 transition-colors)
              ProgressRing progress={optimizationProgress} size={36}    ← import from citations-table
              div flex-1 min-w-0
                page path (text-body-sm-medium text-foreground-secondary truncate)
                mentions count + "mentions" (text-label-xs-medium text-foreground-muted mt-0.5 tabular-nums)
              Trend icon:
                up   → TrendingUp h-4 w-4 text-positive-soft
                down → TrendingDown h-4 w-4 text-danger-soft
                else → Minus h-4 w-4 text-foreground-muted
```

---

## Imports Checklist

```ts
"use client"
import { useMemo } from "react"
import { citationsData } from "@/components/dashboard/citations-table"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Minus, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
```

Also import `ProgressRing` — it is defined inside `citations-table.tsx`. If it is not exported, replicate it inline:
```tsx
// Inline ProgressRing (only if not exported from citations-table)
function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const color = progress >= 75 ? "#10b981" : progress >= 40 ? "#f59e0b" : "#ef4444"
  const textColor = progress >= 75 ? "var(--color-positive-soft)" : progress >= 40 ? "var(--color-caution-soft)" : "var(--color-danger-soft)"
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-border-secondary" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" strokeWidth={strokeWidth} stroke={color}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-label-micro-medium tabular-nums"
        style={{ color: textColor, fontSize: 9 }}>{progress}</span>
    </div>
  )
}
```

---

## Critical Rules

1. All spacing uses Tailwind numeric scale (p-1/2/3/4/5/6/8, gap-1/2/3/4). No arbitrary `[px]` values except chart heights.
2. All colors use design token utilities (text-foreground-secondary, bg-surface-default/60, etc.) — never raw hex in className. Raw hex is only allowed in `style={{ color }}` or `style={{ backgroundColor }}` for the dynamic per-platform colors.
3. All typography uses composite utility classes from the design system (text-body-sm-medium, text-label-xs-medium, text-display-sm-bold, etc.). Never combine raw font-size + font-weight utilities.
4. Cards always use `bg-surface-default/60` base, `hover:bg-surface-hover/80` on interactive cards.
5. Chart tooltip must match ChartTooltip molecule pattern: `bg-surface-default/95 border border-border-secondary rounded-lg shadow-xl p-3`.
6. The Sidebar's active nav item must show "AI Visibility" as active. The Sidebar component currently manages its own state internally — add a `useEffect` that sets the document title to "AI Visibility" so at minimum the tab title is correct. If Sidebar accepts an `activeItem` prop, pass "AI Visibility".
7. Page wrapper must follow this exact pattern to match the other pages:
   ```
   <div className="min-h-screen bg-background tracking-tighter">
     <Sidebar />
     <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-2 md:gap-3">
   ```
8. Do not install new dependencies. Recharts is already installed.
9. Do not create separate CSS files. All styles go in className strings.
10. Do not add `"use server"` — this page is client-side (`"use client"`).
