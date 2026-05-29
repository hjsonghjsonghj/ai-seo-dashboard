# AI Native Workflow Log — Context Reference

> For use as a context-loader when writing future Editions.
> Last updated: Edition 05. Do NOT treat this as a design spec — it is a narrative and decision log.

---

## Project: ai-seo-dashboard

B2B SEO Analytics Dashboard. Built with Next.js + Tailwind v4. Design system lives in both code (CSS variables) and Figma (variables + styles), maintained in sync via custom plugins.

**Tech Stack**
- Framework: Next.js
- Styling: Tailwind v4 (`globals.css` with `:root`, `@theme`, utility classes)
- Component library: React
- Design: Figma (variables, text styles, components)
- Deploy: Vercel
- AI tools used: v0, Claude Cowork, Cursor, Windsurf, Gemini

---

## Edition Arc (what has been done)

| Edition | Theme | Status |
|---|---|---|
| 01 | Rapid Prototyping & System Setup | Complete |
| 02 | Color Variable Refactoring & Figma Sync | Complete |
| 03 | Typography Variable System | Complete |
| 04 | Automated Atomic Generation | Complete |
| 05 | Molecule Assembly & Strategic Recalibration | Complete |
| **06** | **Design System Documentation + Lovable Workflow** | **Next** |

---

## Design System: Current State

### Color
- All colors refactored into semantic tokens (e.g., `surface/hover`, `border/primary`)
- No hard-coded color values remain in codebase
- Figma variables 1:1 bound to code variables
- Opacity bug solved: capture opacity before `setBoundVariableForPaint()`, re-inject after binding

### Typography
- All font sizes/weights replaced with CSS variables in `globals.css` (e.g., `--text-body-sm`)
- `lib/utils.ts` uses `extendTailwindMerge` to register custom typography group (prevents tailwind-merge overwrite)
- Figma text styles auto-generated and bound via plugin using `TextStyleId` only (no direct layer-level variable injection — breaks inheritance)
- `textCase: UPPER` applied at style level for caps tokens (e.g., `label-xs-caps`) — NOT overridden post-bind
- Hybrid workflow for Font Family and Font Weight (numerical → String variable mapping): those two are linked manually due to Figma API limits

### Spacing
- Full spacing scale defined as Tailwind v4 variables in CSS
- Custom Spacing Sync Plugin generates and binds Figma Variables programmatically
- Covers Auto Layout gap/padding fields

### Atoms (Edition 04-05 output)
- 16 atomic components generated in Figma (Edition 05: Select atom removed — no current usage; consolidated into SelectDropdown molecule)
- 36+ button variations organized into Component Sets mirroring React Size/Variant props
- 3-step pipeline: (1) Create nodes, (2) Bind variables after nodes are stable, (3) Assemble molecules
- All variable binding uses `setBoundVariable()` — `setBoundVariableForLayout` is deprecated and must NOT be used
- IconSlot (5 sizes: 12/14/16/20/24px) is a proper Component Set — enables Instance Swap properties on all icon-bearing atoms
- INSTANCE_SWAP component properties added to: SearchField, Alert, Toggle, NavItem (desktop+mobile), SelectDropdown (leading icon x3 states), HeaderActionGroup (bell)
- JSON round-trip required for paint opacity after `setBoundVariable`: `var ff = JSON.parse(JSON.stringify(node.fills)); ff[0].opacity = op; node.fills = ff;`

### Molecules (Edition 05 output)
Plugin: `plugin-03b-molecule-assembler`. Assembly engine with JSON config (`molecule-config.json`) and atom index from plugin-03a.

| Molecule | Variants | Notes |
|---|---|---|
| ChecklistItem | undone/done | |
| ChartLegendItem | ai-discovery/organic-search/citations | |
| NavItem | desktop-default/active, mobile-default/active | Icon swap property |
| BulkActionBar | default | |
| SelectDropdown | closed/open/selected | Leading icon + checkmark on focused item |
| FilterBar | default | SelectDropdown x2 + SearchField |
| HeaderActionGroup | default | SearchField atom + SelectDropdown + notif button |

Key technical findings:
- Mixed-height variants in a Component Set: pass `vGap = TRIGGER_H` to `centerInCells` for top-alignment within fixed-height cells
- `applyTrigger(node, label, colorTok, fixedW)`: `fixedW=false` when trigger is child of VERTICAL parent; `fixedW=true` for standalone
- `buildMenu()` row sizing: `layoutSizingHorizontal = 'FILL'` must be set AFTER appending row to panel
- All interactive elements are h-9 (36px)

---

## Figma API: Confirmed Constraints

| Issue | Detail |
|---|---|
| `setBoundVariableForLayout` | Deprecated. Use `setBoundVariable(field, variable)` for all fields including padding/gap |
| `setBoundVariableForPaint()` | Resets opacity to 100% by default. Must capture and re-inject opacity manually |
| Font Family binding | Cannot be programmatically bound via API. Manual step required |
| Font Weight (numerical) | Cannot map `700` → `"Bold"` via API. Use String variable + manual link |
| `textCase` after `textStyleId` | Never override `textCase` after setting `textStyleId` — breaks style binding |
| `counterAxisSizingMode` | Only accepts `'FIXED'` or `'AUTO'`. Use `layoutSizingHorizontal = 'FILL'` on child nodes for fill behavior |
| `combineAsComponentSet` | Does not exist. Use `figma.combineAsVariants(nodes, figma.currentPage)` |
| Variable scoping | Scope each token attribute strictly (Size, Weight, LH, LS appear only in their respective panels) |
| Mixed-height variant sets | Pass `vGap = shortest_variant_height` to `centerInCells` and `buildAtomFrame` for top-alignment |
| `addComponentProperty` (INSTANCE_SWAP) | Call on the Component node (not Frame). Set `iconNode.componentPropertyReferences = { mainComponent: key }` on the nested instance |
| `layoutSizingHorizontal = 'FILL'` | Must be set AFTER appending the node to its parent |
| MCP + Figma Variables | Requires Private Token, Enterprise plan only. Not viable for this project |
| Modern JS in Figma sandbox | No `?.` (optional chaining) or `??` (nullish coalescing). Use `||` and explicit `&&` checks |

---

## Plugin Architecture

Custom Figma plugins live in `/docs` and the project repo. Plugins:
- Color Binding Plugin — syncs color variables
- Typography Sync Plugin — generates text styles, scopes attributes, auto-binds `TextStyleId`
- Spacing Sync Plugin — generates spacing variables, binds to Auto Layout fields
- Atom Generator Plugin — creates atomic components, binds tokens via 3-step decoupled pipeline

**Plugin code.js rule**: Safe ES6 only. No `??`, no `?.`, no em dash (`—`).

---

## Documentation Architecture

`/docs` folder structure acts as AI context-loader:
- `STYLE_COLOR.md` — theme colors, semantic tokens
- `STYLE_TYPOGRAPHY.md` — font scale, hierarchy
- `STYLE_SPACING.md` — layout and spacing rules
- `DS-COMPONENTS.md` — component inventory (in progress)
- `ATOMS.md` — atom inventory, plugin architecture, verified API patterns

---

## Key Strategic Decisions (with rationale)

**Dropped Supernova.io** — Forces tokens into its own JSON schema, conflicts with Tailwind v4 `globals.css` structure. Would require re-linking every variable. Chose custom JSON-based pipeline to preserve SSOT.

**Dropped Figma MCP** — Requires Enterprise plan for Private Token (variable read/write). Not viable.

**Dropped direct layer-level variable injection for typography** — Breaks inheritance from parent Text Styles. Style inheritance via `TextStyleId` is the correct architecture.

**3-step decoupled pipeline for atoms** — Creation → render fully → bind. Prevents "disappearing node" crashes from async/await race conditions in Figma engine.

**Paused Code-to-Canvas automation (Edition 05)** — Structural divergence between React and Figma is unbounded. Token sync has value; component-level pixel parity does not justify ongoing maintenance cost. Existing molecules stay as-is. New plugin work only when a specific need arises.

**Lovable as design expansion engine (Edition 05)** — New features and pages generated via Lovable prompts. Consistency comes from: (1) existing React component library, (2) CSS variable token system, (3) `DESIGN_SYSTEM.md` context document (Edition 06 deliverable). Figma is the human designer's spec tool before writing Lovable prompts.

---

## AI Tool Lessons (from Editions 01–05)

- **v0**: Good for first functional draft, visual hierarchy exploration
- **Claude Cowork**: Strong for architecture decisions and plugin logic; can miss small attributes (Font Weight, Letter Spacing)
- **Windsurf**: Persistent hallucinations on Figma API — claimed success while errors remained
- **Gemini**: Identified root cause of opacity bug (`setBoundVariableForPaint` behavior) when others failed
- **Lovable**: Generates React pages from prompts using the codebase as context. Consistent output requires well-structured components + CSS variables + a design system document. Figma component parity is NOT required.
- **General**: AI often declares tasks "done" prematurely. Always audit output for missing attributes and test in actual Figma environment

---

## Writing Style for Editions

Each Edition follows this structure:
1. **Summary** — 1 paragraph, goal + challenge
2. **The Goal / The Challenge** — explicit statement
3. **Deep Dive** — numbered Steps with what was done and why
4. **Critical Reflection** — honest assessment of AI limits and manual interventions
5. **Conclusion / Next Step** — what was achieved, what comes next

**Language rules:**
- B2-level English — clear and direct, no complex vocabulary
- Keep it concise — cut anything that doesn't add information
- No em-dashes (`—`) anywhere in the document
- **Bold** key facts and decisions so the reader can scan quickly
- Tone: technical, first-person, honest about failures. Shows process, not just results.
