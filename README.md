# AI SEO Dashboard

A B2B analytics dashboard for tracking AI search visibility, content health, and optimization priorities. Built and shipped as a portfolio project to document an AI-native design and development workflow.

**Live:** [ai-seo-dashboard.vercel.app](https://ai-seo-dashboard.vercel.app)

---

## What it does

Four pages, each answering a different question:

- **AI Visibility** — which pages are being cited by AI platforms (Claude, Gemini, Copilot) and how often
- **Coverage Matrix** — which topics have coverage gaps across platforms
- **Content Ops** — a Monday morning check: what needs fixing, what's in the pipeline, how content is distributed by status
- **Fix First** — pages ranked by optimization score, lowest first, with a recommended action per row

---

## What this project is really about

The dashboard is the artifact. The actual work was building the system behind it.

Over 7 documented editions, I built a full code-to-canvas pipeline from scratch:

- Rapid prototyped the dashboard in v0, then refactored into a modular component architecture in Cursor
- Discovered the Figma MCP server required Enterprise API tokens, so built custom plugins instead
- Audited every color, typography value, and spacing token in the codebase and refactored them into semantic variables
- Built 7 Figma plugins to sync color, typography, and spacing tokens between code and Figma — and to generate and bind atomic components programmatically
- Documented the design system in `DESIGN_SYSTEM.md` to use as context for AI-generated page expansion

The full process is documented in [`/docs/editions`](./docs/editions).

---

## Tech stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS v4, custom CSS variables
- **Design system:** Token-based, synced to Figma via custom plugins
- **Deployment:** Vercel
- **Tooling:** Cursor, Claude, v0, Gemini

---

## Figma plugins (in `/plugin-*`)

| Plugin | What it does |
|--------|--------------|
| `plugin-01-color-sync` | Syncs color tokens from CSS to Figma variables |
| `plugin-01b-typography-variables-injector` | Generates and binds typography tokens in Figma |
| `plugin-01c-spacing-sync` | Syncs spacing scale from Tailwind to Figma auto-layout |
| `plugin-02a-atomic-generator` | Generates atomic components (buttons, inputs, etc.) in Figma |
| `plugin-02b-variable-binder` | Binds variables to existing Figma layers |
| `plugin-03a-molecule-locator` | Maintains the atom index for molecule assembly |
| `plugin-03b-molecule-assembler` | Assembles molecules from atom instances using a JSON config |

---

## Editions (build log)

| Edition | Focus |
|---------|-------|
| 01 | Rapid prototyping, component architecture, Vercel deployment |
| 02 | Color audit, semantic refactoring, custom color sync plugin |
| 03 | Typography variable system, style inheritance model |
| 04 | Atomic component generation, spacing automation |
| 05 | Molecule assembly, strategic recalibration |
| 06 | Design system documentation |
| 07 | Content Ops page, platform color system, consistency audit |
