# Edition 06: Design System Documentation and AI Visibility Page

---

## Summary

Executed the plan from Edition 05: write `DESIGN_SYSTEM.md`, generate the AI Visibility page with Lovable, fix what comes out. The page was generated but required a full correction pass: wrong framework, wrong tokens, duplicate data structure. After fixing, a second round of UI consistency work followed across both pages. **Lovable is a fast starting point. The correction pass is not optional, it is the job.**

---

## The Goal / The Challenge

**Goal:** Write `DESIGN_SYSTEM.md` as a Lovable prompt reference, generate AI Visibility with Lovable, ship a working page.

**Challenge:** Lovable was connected to the GitHub repo and could read the codebase. But Lovable's internal runtime is TanStack Start, not Next.js. Reading the source and executing inside it are two different things. No matter how precise the prompt or how well-prepared the design system doc, the output came out shaped by Lovable's own environment: TanStack routing, shadcn token defaults, its own component conventions. Every gap had to be closed by hand.

---

## Deep Dive

**Generating and correcting the page**

`DESIGN_SYSTEM.md` was written first: all color tokens, typography composite utilities, atom and molecule inventory, layout conventions, 10 rules for Lovable prompting. Then `LOVABLE_PROMPT_AI_VISIBILITY.md` specified the exact file path, imports, data derivation, platform colors, and section structure.

Lovable's output used `createFileRoute` inside the component body (renders nothing in Next.js), shadcn tokens throughout, and `max-w-7xl` instead of `max-w-container`. The full correction pass: TanStack imports removed, Next.js routing wired in, every token replaced, typography switched to composite utilities, sidebar connected, platform names aligned.

**Coverage Matrix and data redesign**

Lovable added a citations table to AI Visibility, identical to the one on Search Visibility and Dashboard Top 5. Three views of the same flat data adds nothing.

Replaced it with a Coverage Matrix: rows are pages, columns are platforms, each cell shows mention count or a dash. The view answers a different question than the table: which pages are being cited by multiple AI platforms at the same time.

The underlying data also needed a fix. The original mock had each page cited by exactly one platform (25 rows, 25 unique pages). This made the matrix pointless. Redesigned to 10 pages, 26 rows. High-optimization pages are cited by multiple platforms simultaneously. `/best-seo-tools-2026` (opt: 94) hit all 5 platforms. `/keyword-research-2026` (opt: 38) hit only Claude. The correlation between optimization score and coverage breadth is now readable in the matrix.

**UI consistency pass**

After the page was working, several inconsistencies were found and fixed across both Dashboard and AI Visibility:

- Sidebar routing: `useState` for active state replaced with `usePathname()`, AI Visibility nav item connected with `href: "/ai-visibility"`
- AI Visibility stat cards: rebuilt to match Dashboard stat cards exactly. Single `CardContent p-5`, icon in `h-10 w-10 rounded-lg bg-brand-default/15` top-right, same typography and spacing
- Pie chart tooltip: z-index raised to 9999 (was rendering behind other elements). Replaced hardcoded hex `contentStyle` with `CustomPieTooltip` matching the Trends chart pattern: colored dot, `text-foreground-tertiary` label, `tabular-nums text-foreground-strong` value
- Strategic Insights section moved into a Card. It was the only section sitting outside a box, making its title appear misaligned with the other sections
- Section title consistency: unified all three card sections to `text-title-section-semibold text-foreground-secondary` for titles, `text-body-micro-medium text-foreground-tertiary mt-1` for subtitles, `px-5 pt-5 pb-3` for CardHeader padding. Trends had `text-foreground-strong` (too bright), Citations had `text-body-md-medium` subtitle (too large)
- Section title icons: added icon boxes to all three sections for consistency, then removed all three. At the section level, same-sized icon boxes on every card created visual noise rather than hierarchy
- Mobile header overflow: subtitle text hidden on mobile (`hidden md:block`) on both pages. On the Citations card, description hidden on mobile and button given `whitespace-nowrap shrink-0` to prevent two-line wrapping
- Platform name corrected from `Google AI` to `Gemini` across all files for consistency with ChatGPT, Claude, Perplexity, and Copilot

---

## Critical Reflection

**Lovable's design system support works inside Lovable projects, not across them.** When a project is started inside Lovable and the design system is defined there, Lovable validates against its own environment and stays consistent. Bringing an existing Next.js codebase and connecting it via GitHub gives Lovable read access, not runtime access. It cannot validate custom Tailwind v4 tokens it never executes. The correction pass is structural, not a preparation failure. `DESIGN_SYSTEM.md` was well-prepared. Its value turned out to be as a correction reference, not as a generation guide.

**Two Lovable workflows that actually work:** start inside Lovable from scratch, or use Lovable purely as a layout sketch and rewrite from its structure. We were between those modes.

---

## Conclusion / Next Step

**Achieved:** `DESIGN_SYSTEM.md` and `LOVABLE_PROMPT_AI_VISIBILITY.md` written, AI Visibility page generated and fully corrected, Coverage Matrix replacing duplicate table, citationsData redesigned with realistic multi-platform citations, UI consistency pass across both pages (routing, stat cards, tooltips, section layout, typography, mobile overflow), platform name corrected to Gemini.

**Files changed this edition:**
- `DESIGN_SYSTEM.md` (created)
- `LOVABLE_PROMPT_AI_VISIBILITY.md` (created)
- `app/ai-visibility/page.tsx` (created + corrected)
- `components/dashboard/sidebar.tsx` (routing)
- `components/dashboard/citations-table.tsx` (data redesign + mobile fixes)
- `components/dashboard/strategic-insights.tsx` (moved into Card)
- `components/dashboard/trends-chart.tsx` (title + subtitle consistency)
- `components/dashboard/header.tsx` (mobile subtitle hidden)

**Edition 07:** Next feature expansion. Candidates: Content Ops page, Settings page, or deeper interactivity on existing pages.

---

## Suggested Images

**1. AI Visibility page, full view (desktop)**
_Caption: The new AI Visibility page. Five sections: stat cards, platform donut chart, optimization score bars, trend breakdown, and Coverage Matrix._

**2. Coverage Matrix close-up**
_Caption: Coverage Matrix showing which pages are cited by which AI platforms. High-optimization pages fill multiple columns; low-optimization pages show mostly dashes. The pattern is the insight._

**3. Lovable output vs corrected output, side by side (code or screenshot)**
_Caption: Lovable generated TanStack routing and shadcn tokens. The correction pass rewired everything to Next.js App Router and project design tokens._

**4. Tooltip before and after**
_Caption: Before: hardcoded hex colors, wrong z-index. After: CustomPieTooltip using project tokens, matching the Trends chart pattern._

**5. Mobile header before and after**
_Caption: Subtitle text hidden on mobile. The page title alone carries enough context; the subtitle was causing overflow on narrow viewports._
