# Context: Next Session — 2026-05-28

## Goal for Next Session

Expand the dashboard with a new feature or page. Candidates:
- **Content Ops page** (`/content-ops`)
- **Settings page** (`/settings`)
- Deeper interactivity on existing pages (live filtering in Coverage Matrix, drill-down from stat cards)

---

## Project Stack

- **Framework:** Next.js 15 App Router (`"use client"`, `usePathname`, `Link`, default exports)
- **Styling:** Tailwind CSS v4 (CSS-first config in `app/globals.css` @theme block, no `tailwind.config.js`)
- **Charts:** Recharts (PieChart, BarChart, AreaChart, Cell, Tooltip, ResponsiveContainer)
- **Components:** shadcn/ui base + custom design tokens
- **Deploy:** Vercel

---

## Current Pages

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | Complete |
| `/ai-visibility` | `app/ai-visibility/page.tsx` | Complete |
| `/search-visibility` | `app/search-visibility/page.tsx` | Complete |
| `/content-ops` | not created | Next candidate |
| `/settings` | not created | Next candidate |

---

## Sidebar Nav

`components/dashboard/sidebar.tsx`

```tsx
const navItems = [
  { icon: LayoutDashboard, label: "Overview",      href: "/" },
  { icon: Eye,             label: "AI Visibility", href: "/ai-visibility" },
  { icon: FileText,        label: "Content Ops",   href: null },       // disabled
  { icon: Settings,        label: "Settings",      href: null },       // disabled
]
```

To activate a new page: set `href` to the route path.

---

## Design Token System

All tokens defined in `app/globals.css` @theme block. Never use hardcoded hex or arbitrary values.

**Key token patterns:**
- Background: `bg-background`, `bg-surface-default/60`, `bg-surface-hover/50`, `bg-surface-hover/80`
- Text: `text-foreground-strong`, `text-foreground-secondary`, `text-foreground-tertiary`, `text-foreground-muted`
- Border: `border-border-secondary`, `border-border-secondary/50`
- Brand: `bg-brand-default/15`, `text-brand-soft`, `text-primary-default`
- Semantic: `text-positive-default`, `text-positive-soft`, `text-danger-soft`, `text-caution-default`

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
  Gemini:     "#f59e0b",   // was "Google AI" — corrected to Gemini in Edition 06
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

26 rows, 10 unique pages. High-optimization pages cited by multiple platforms. Consumed by Dashboard, Search Visibility, and AI Visibility pages.

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

All sections use this consistent structure:

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

Matches Dashboard stat cards:

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

## Lovable Workflow Notes (from Edition 06)

- Lovable is connected to GitHub but runs on TanStack Start internally. Output always needs a correction pass.
- Correction checklist: TanStack imports, shadcn tokens, typography utilities, `max-w-7xl`, routing, platform names.
- `DESIGN_SYSTEM.md` is useful as a correction reference, not a generation guide.
- Best use: layout structure and component ideas. Rewrite from its structure, don't transplant directly.
- Detailed prompt template: `docs/context/LOVABLE_PROMPT_AI_VISIBILITY.md` (use as reference for next page prompt)

---

## File Structure (Key Files)

```
app/
  page.tsx                          Dashboard
  ai-visibility/page.tsx            AI Visibility
  search-visibility/page.tsx        Search Visibility
  globals.css                       Tailwind v4 theme + tokens

components/dashboard/
  sidebar.tsx                       Nav (add href to activate new pages)
  header.tsx                        Dashboard header
  stat-cards.tsx                    Dashboard stat cards
  citations-table.tsx               citationsData + CitationsTable component
  trends-chart.tsx                  Search Visibility Trends chart
  strategic-insights.tsx            AI-Generated Strategic Insights
  citation-details-drawer.tsx       Detail drawer
  citations-context.tsx             Citation state context

docs/
  design-system/                    DESIGN_SYSTEM.md, ATOMS.md, STYLE_*.md
  editions/                         EDITION-01 through EDITION-06-PORTFOLIO
  context/                          Session handoffs, Lovable prompts
```

---

## Edition 06 Summary (completed)

- DESIGN_SYSTEM.md written
- AI Visibility page generated with Lovable, fully corrected
- Coverage Matrix replacing duplicate citations table
- citationsData redesigned (multi-platform citations)
- UI consistency pass: stat cards, tooltips, section titles, Strategic Insights into Card, mobile overflow fixes
- Platform name corrected: Google AI -> Gemini across all files

Next: **Edition 07** — new page or deeper interactivity.
