# Context: Edition 08 Session Handoff

> Supersedes: `CONTEXT_NEXT_SESSION_20260528.md` (Edition 07 planning)
> Edition 07 completed: Content Ops page built without Lovable (solo).

---

## Edition 07 Summary (completed)

- `app/content-ops/page.tsx` created from scratch
- `components/dashboard/sidebar.tsx` — Content Ops `href` activated
- No Lovable used: design system and page patterns were established enough to build directly
- TypeScript: zero errors (`npx tsc --noEmit` clean)

---

## Current Pages

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | Complete |
| `/ai-visibility` | `app/ai-visibility/page.tsx` | Complete |
| `/search-visibility` | `app/search-visibility/page.tsx` | Complete |
| `/content-ops` | `app/content-ops/page.tsx` | Complete (Edition 07) |
| `/settings` | not created | Next candidate |

---

## Sidebar Nav (current)

`components/dashboard/sidebar.tsx`

```tsx
const navItems = [
  { icon: LayoutDashboard, label: "Overview",      href: "/" },
  { icon: Eye,             label: "AI Visibility", href: "/ai-visibility" },
  { icon: FileText,        label: "Content Ops",   href: "/content-ops" },
  { icon: Settings,        label: "Settings",      href: null },          // disabled
]
```

---

## Edition 08 Candidates

- **Settings page** (`/settings`) — connected accounts, notifications, team members, API keys
- **Deeper interactivity** — live filtering in Coverage Matrix, drill-down from stat cards
- **Competitor Intelligence page** — AI citation rate vs. competitors per platform

---

## Project Stack

- **Framework:** Next.js 15 App Router (`"use client"`, `usePathname`, `Link`, default exports)
- **Styling:** Tailwind CSS v4 (CSS-first config in `app/globals.css` @theme block, no `tailwind.config.js`)
- **Charts:** Recharts (PieChart, BarChart, AreaChart, Cell, Tooltip, ResponsiveContainer)
- **Components:** shadcn/ui base + custom design tokens
- **Deploy:** Vercel

---

## Lovable Workflow Notes

- Lovable is connected to GitHub but runs on TanStack Start internally. Output always needs a correction pass.
- Correction checklist: TanStack imports, shadcn tokens, typography utilities, `max-w-7xl`, routing, platform names.
- From Edition 07: if design system + patterns are fully established, building solo is faster than Lovable + correction.
- Detailed prompt template: `docs/context/LOVABLE_PROMPT_AI_VISIBILITY.md` (use as reference if Lovable is needed)

---

## Design Token System

All tokens defined in `app/globals.css` @theme block. Never use hardcoded hex or arbitrary values.

**Key token patterns:**
- Background: `bg-background`, `bg-surface-default/60`, `bg-surface-hover/50`, `bg-surface-hover/80`
- Text: `text-foreground-strong`, `text-foreground-secondary`, `text-foreground-tertiary`, `text-foreground-muted`
- Border: `border-border-secondary`, `border-border-secondary/50`
- Brand: `bg-brand-default/15`, `text-brand-soft`, `text-primary-default`
- Semantic: `text-positive-default`, `text-positive-soft`, `text-danger-soft`, `text-caution-default`
- Opacity modifiers work correctly (`/10`, `/15`, `/60` etc.) — @theme uses direct hex, not var() chains

**Typography composite utilities** (defined in globals.css, not raw font sizes):
- Titles: `text-title-page-semibold`, `text-title-section-semibold`, `text-title-sub-semibold`
- Body: `text-body-md-regular`, `text-body-sm-medium`, `text-body-micro-medium`
- Labels: `text-label-xs-medium`, `text-label-xs-caps-semibold`, `text-label-micro-medium`
- Display: `text-display-sm-bold`, `text-display-sm-semibold`

Full reference: `docs/design-system/DESIGN_SYSTEM.md`

---

## Platform Colors

```tsx
const PLATFORM_COLORS = {
  ChatGPT:    "#8b5cf6",
  Claude:     "#10b981",
  Perplexity: "#60a5fa",
  Gemini:     "#f59e0b",
  Copilot:    "#f87171",
}
```

---

## Data: citationsData

Single source of truth in `components/dashboard/citations-table.tsx`.

```ts
type Citation = {
  id: number
  source: "ChatGPT" | "Claude" | "Perplexity" | "Gemini" | "Copilot"
  page: string              // e.g. "/best-seo-tools-2026"
  mentions: number
  trend: "up" | "down" | "stable"
  optimizationProgress: number  // 0-100
  lastSeen: string
  aiContext: string
}
```

26 rows, 10 unique pages. High-optimization pages cited by multiple platforms.
Consumed by: Dashboard, Search Visibility, AI Visibility, Content Ops.

---

## Page Layout Pattern

Every page follows this structure:

```tsx
"use client"

export default function PageName() {
  return (
    <div className="min-h-screen bg-background tracking-tighter">
      <Sidebar />
      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-2 md:gap-3">

        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border-secondary/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
          <div>
            <h1 className="text-title-section-semibold md:text-title-page-semibold text-foreground-strong">
              Page Title
            </h1>
            <p className="hidden md:block text-body-micro-medium md:text-body-md-regular font-medium text-foreground-tertiary">
              Subtitle (hidden on mobile)
            </p>
          </div>
          {/* right: Select + Bell */}
        </header>

        {/* Main content */}
        <main className="px-4 pt-2 pb-4 md:px-6 md:pt-2 md:pb-6">
          <div className="mx-auto max-w-container space-y-4 md:space-y-6">
            {/* sections */}
          </div>
        </main>

      </div>
    </div>
  )
}
```

---

## Card Section Pattern

```tsx
<Card className="bg-surface-default/60 transition-colors duration-150">
  <CardHeader className="px-5 pt-5 pb-3">
    <CardTitle className="text-title-section-semibold text-foreground-secondary">
      Section Title
    </CardTitle>
    <p className="hidden md:block text-body-micro-medium text-foreground-tertiary mt-1">
      Subtitle
    </p>
  </CardHeader>
  <CardContent className="px-5 pb-5 pt-0">
    {/* content */}
  </CardContent>
</Card>
```

---

## Stat Card Pattern

```tsx
<Card className="cursor-pointer bg-surface-default/60 transition-colors duration-150 hover:bg-surface-hover/80">
  <CardContent className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-1.5">
        <p className="text-body-micro-medium text-foreground-secondary">Title</p>
        <p className="text-display-sm-bold tabular-nums text-foreground-strong">Value</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
        <Icon className="h-5 w-5 text-brand-soft" />
      </div>
    </div>
    <p className="mt-3 text-body-micro-medium text-foreground-tertiary">Subtitle</p>
  </CardContent>
</Card>
```

---

## File Structure (Key Files)

```
app/
  page.tsx                          Dashboard (Overview)
  ai-visibility/page.tsx            AI Visibility
  search-visibility/page.tsx        Search Visibility
  content-ops/page.tsx              Content Ops (Edition 07)
  globals.css                       Tailwind v4 theme + tokens

components/dashboard/
  sidebar.tsx                       Nav (add href to activate new pages)
  header.tsx                        Dashboard header
  stat-cards.tsx                    Dashboard stat cards
  citations-table.tsx               citationsData + CitationsTable component
  trends-chart.tsx                  Trends area chart (12-month)
  strategic-insights.tsx            AI-Generated Strategic Insights cards
  citation-details-drawer.tsx       Slide-out detail drawer
  citations-context.tsx             Citation state context (optimistic updates)

docs/
  design-system/                    DESIGN_SYSTEM.md, ATOMS.md, STYLE_*.md
  editions/                         EDITION-01 through EDITION-06-PORTFOLIO
  context/                          Session handoffs (this file), Lovable prompts
```

---

## Content Inventory

What each page contains. Use this to avoid duplication when designing new pages.

---

### Overview `/`

**User scenario:** First screen opened in the morning. Quickly assess overall health, decide what needs attention today.

**Stat Cards** — `components/dashboard/stat-cards.tsx` — grid 2-col (mobile) / 4-col (desktop)

| Card | Value | Icon | Special |
|---|---|---|---|
| AI Share of Voice | 34.2% | `Activity` | Goal 40%, progress bar + trend delta |
| Content Health Score | 87 | `HeartPulse` | Goal 95, progress bar + trend delta |
| Citation Accuracy | 92.4% | `Target` | Goal 98%, trend: -2.1% (danger color) |
| Projected Growth | +23.8% | `Rocket` | Goal 30%, next quarter |

Each card: value + goal progress bar + trend (+/-%) — 3-layer structure unique to Dashboard.

**AI-Generated Strategic Insights** — `components/dashboard/strategic-insights.tsx` — 3-col grid

| Card | Type | Badge | CTA button color |
|---|---|---|---|
| Citation Drop Detected | critical | Urgent | danger |
| Emerging Topic Surge | opportunity | High Impact | brand (violet) |
| Schema Enhancement | optimization | Medium | caution (amber) |

**Trends Chart** — `components/dashboard/trends-chart.tsx`

- AreaChart, 12-month (Jan–Dec static data)
- 3 series: AI Discovery (violet), Organic Search (emerald), Citations (blue)
- 4 ReferenceLine events: Google AI Update, Competitor Launch, Algorithm Shift, ChatGPT Update
- Custom tooltip: month label + event chip + 3 metric rows

**Top 5 AI Search Citations** — `CitationsTableComponent` (top 5 by mentions)

- Columns: Source, Page, Mentions, Trend, Optimization ring, Last Seen, Review button
- "View all" link → `/search-visibility`
- 800ms skeleton loading on mount
- Review → Citation Details Drawer

**Citation Details Drawer** — `components/dashboard/citation-details-drawer.tsx`

- Slide-out panel: Source, Page, Mentions, full aiContext text
- Resolve button → optimistic update + toast + 2s table row highlight

---

### AI Visibility `/ai-visibility`

**User scenario:** Understand brand presence broken down by AI platform. Which platforms cite us most, and how well is content optimized for each.

**Stat Cards** — 3-col grid (1-col on mobile)

| Card | Value | Icon |
|---|---|---|
| Total Mentions | sum of all 26 rows | `Activity` |
| Top Platform | platform name + color dot | `BarChart2` |
| Avg Optimization | % with semantic color | `Target` |

**Mentions by Platform** — 2/3 width, PieChart (donut) + ranking list

- Donut: innerRadius 80, outerRadius 120, platform colors, no stroke
- Center overlay: total mentions + "Total" label
- Ranking list: rank number, color dot, platform name, mentions count, % share

**Optimization Score per Platform** — 1/3 width

- Per-platform avg optimizationProgress
- Progress bar colored with platform's own color
- Score label: 75+ green, 50+ caution, below danger

**Citation Trends** — full width

- Per platform: up / stable / down count shown as `↑ n → n ↓ n`
- Stacked progress bar: green (up) + slate (stable) + red (down) segments

**Coverage Matrix** — full width, scrollable

- Rows: 10 unique pages sorted by total mentions desc
- Columns: 5 platforms + Score + Total
- Cell value: mentions count; empty = `—`
- Cell background: platform color + `12` hex opacity tint
- Score column: semantic color by threshold (75+ / 40+ / below)

---

### Search Visibility `/search-visibility`

**User scenario:** Work screen. Dig into the full citation list, process individual items or bulk-resolve. Entered from Dashboard "View all" link.

**Header** — Back button only (no h1; title is browser tab only: "AI Search Citations")

**Filter Bar** — Card with 3 controls

- Date range Select: 7d / 30d / 90d / 1y
- Source Select: All + 5 platforms
- Search Input: filters by source or page slug, real-time

**Full Citations Table** — all 26 rows, `CitationsTableComponent` with extended props

- Default sort: mentions desc
- Sortable columns: Mentions, Optimization, Last Seen (click to toggle asc/desc)
- Row checkbox: single + select-all (indeterminate state supported)
- Columns: checkbox, Source, Page, Mentions, Trend, Optimization ring, Last Seen, Review button
- Review → Citation Details Drawer
- 800ms skeleton on mount

**Citation Details Drawer** — same as Dashboard

**Bulk Action Bar** — fixed bottom, only visible when rows selected

- Shows count: "n citations selected"
- Export → `.txt` download (per-citation checklist format)
- Mark as Resolved → `window.confirm` → optimistic bulk update + 2s highlight
- Clear Selection

---

### Content Ops `/content-ops`

**User scenario:** Monday morning check. SEO manager sees which pages need work, in what order, and what the overall content health looks like across all tracked pages.

**Stat Cards** — 2-col (mobile) / 4-col (desktop), all derived from citationsData

| Card | Value | Icon | Special |
|---|---|---|---|
| Pages Tracked | 10 | `FileText` | Count of unique pages |
| Needs Attention | 3 | `AlertCircle` | danger color; score < 60 or trend down |
| Avg AI Score | 71% | `Zap` | Average optimizationProgress across 10 pages |
| Total Mentions | 9,109 | `TrendingUp` | Sum of all mentions |

**Fix First** — left column of 2-col grid

- 6 pages sorted ascending by optimizationProgress (score < 85 only)
- Each row: rank number chip, page slug, ProgressBar, recommended action tag
- Action tags: static per-page strings (e.g. "Add Case Studies", "Expand Schema Types")

**Platform Coverage** — right column of 2-col grid, BarChart

- X: page slug (abbreviated, angle -38deg)
- Y: platform count (0–5)
- Bar color: 4+ = green, 2–3 = violet, 1 = amber
- Custom tooltip

**Content Pipeline** — full width table

- Status filter dropdown: All / Live / Needs Update / In Review / Draft
- Sortable: AI Score, Mentions (click header)
- Columns: Page, AI Score (ProgressBar), Platforms (PlatformDots), Mentions, Trend, Status badge, Action button
- Empty state: "No pages match this filter."
- Mobile: card view per page (slug + StatusBadge + ProgressBar + PlatformDots + mentions + action)

**Data derivation** — `derivePageData()` in `content-ops/page.tsx`

- Groups citationsData by page slug
- Computes: totalMentions (sum), trend (majority vote: trendScore), platforms (Set), platformCount
- Static maps: `PAGE_STATUS`, `PAGE_ACTION` (keyed by page slug)
- Status values: `"Live"` / `"Needs Update"` / `"In Review"` / `"Draft"`
