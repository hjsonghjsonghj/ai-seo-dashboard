# Context — Next Session Handoff
# Project: ai-seo-dashboard / plugin-03b Molecule Assembler

---

## Big Picture (Keep in mind throughout all work)

This plugin suite is the **SSOT (Single Source of Truth)** foundation for the design system.

Current direction: **Code → Design** (React code is source of truth; Figma must match it)
Future direction: **Design → Code** (once Figma is locked as SSOT, changes in Figma propagate back to code)

This means every molecule spec must be precise enough to support bidirectional sync. Every layout value, token name, spacing, and variant in the Figma plugin output must be 1:1 with the React implementation. The JSON config (`molecule-config.json`) is the bridge — it should eventually be derivable from either the React codebase or the Figma file.

---

## Plugin Suite Overview

Located in `/Users/milchreis/Desktop/ai-seo-dashboard/`

```
plugin-01-token-exporter/        — exports design tokens from CSS to Figma
plugin-02a-atom-builder/         — builds atom components in Figma
plugin-03a-atom-scanner/         — scans built atoms, writes index to sharedPluginData
plugin-03b-molecule-assembler/   — assembles molecules from atom index (THIS PLUGIN)
```

### plugin-03b files
```
code.js               — Universal Assembly Engine (refactored — project-agnostic)
ui.html               — Plugin UI (refactored — English, config status, Load JSON button)
molecule-config.json  — Molecule definitions (new — project-specific config)
```

Shared plugin data namespace: `ds_plugin_suite`
- Atom index key:    `atomIndex_v1`   (written by 03a)
- Molecule config key: `moleculeConfig_v1` (written by 03b ui via Load JSON)

---

## What Was Done Last Session

### 1. Universal Engine Refactor (COMPLETED)
- Removed hardcoded `TOKENS` map → replaced with `FALLBACK_TOKENS` (fallback only)
- Added `resolveTokensFromFigma()`: reads Figma Local Variables (COLOR type) at runtime, builds `_tokenMap`, follows VARIABLE_ALIAS chains up to 5 levels
- Added `getMoleculeCfg(name)`: loads `molecule-config.json` data from sharedPluginData
- Each generator now: loads tokens at start, reads all values from config with hardcoded defaults as fallback
- New message handlers: `load-config`, `check-config`
- UI updated: config status banner, "Load JSON" file picker button

### 2. molecule-config.json (CREATED)
All 6 molecules defined: ChecklistItem, ChartLegendItem, NavItem, BulkActionBar, FilterBar, HeaderActionGroup

### 3. NavItem (COMPLETED in prior sessions)
- Desktop active indicator: `w-1`(4px) bar, right corners only rounded (`rounded-r-full`), positioned at `x=-8` (outside button bounds, matches `-left-2`)
- Mobile active indicator: `absolute -top-0.5`, `h-0.5 w-8`, `rounded-full`
- Figma spacer trick: `itemSpacing=4`, bar(2px)[4px]spacer(1px)[4px]icon = 9px gap matching React

---

## PENDING FIXES (Next Session Must-Do)

### Fix 1: Translate plugin UI and MOLECULES.md to English
**Files to change:**
- `plugin-03b-molecule-assembler/ui.html` — Korean text in banners and hints → English
- `MOLECULES.md` — Entire file is in Korean → translate to English

MOLECULES.md is a large spec file (~700+ lines). It covers 13 molecules with layout structure, token tables, props interfaces. Translate all Korean prose, headings, and comments to English. Keep code blocks, token names, and class names unchanged.

---

### Fix 2: BulkActionBar — "3 citations selected" text color and "Export" button color don't match React

**React implementation** (`components/dashboard/search-visibility/page.tsx` or similar):
- Check actual BulkActionBar component for:
  - Text color of the count label ("3 citations selected")
  - Exact variant of the "Export" button

**Current Figma plugin config** (`molecule-config.json`):
```json
"countLabelTok": "foreground-secondary",
"buttons": [
  { "variant": "secondary", ... "label": "Export" },
  ...
]
```

**Action:** Find the React component, check exact Tailwind classes for:
1. Count label text color — is it `foreground-secondary` or something else?
2. "Export" button — is it `secondary` or `ghost` variant?

Then update `molecule-config.json` accordingly (no code.js changes needed, config-only fix).

---

### Fix 3: FilterBar — search field uses wrong atom (Input instead of SearchInput pattern)

**Problem:** The third filter group uses `Input` atom directly, but the React implementation has a search field with a built-in icon slot (not a separate icon + plain Input). The current config puts an `Icon-Slot` + `Input` atom side by side, but the React search field is a single composited component.

**React implementation** — check `components/dashboard/search-visibility/page.tsx` for the actual FilterBar search field structure.

**Relevant config section** (`molecule-config.json`):
```json
"filters": [
  { "iconSize": 16, "atomName": "Select", ... },
  { "iconSize": 16, "atomName": "Select", ... },
  { "iconSize": 16, "atomName": "Input",  "props": { "state": "default", "size": "lg" }, ... }
]
```

The third filter group needs to match whatever the React code actually renders — possibly an `Input` atom that already contains an icon, or a different structure entirely. Investigate and fix both `molecule-config.json` and the FilterBar generator in `code.js` if the structure needs to change.

---

## Key File Locations

| File | Purpose |
|------|---------|
| `plugin-03b-molecule-assembler/code.js` | Universal engine — token resolution, molecule generators |
| `plugin-03b-molecule-assembler/ui.html` | Plugin UI — config/index status, molecule buttons |
| `plugin-03b-molecule-assembler/molecule-config.json` | Project-specific molecule definitions |
| `components/dashboard/sidebar.tsx` | NavItem React source of truth |
| `components/dashboard/search-visibility/page.tsx` | BulkActionBar + FilterBar React source of truth |
| `MOLECULES.md` | Molecule spec (needs full English translation) |
| `ATOMS.md` | Atom inventory and verified Figma API patterns |
| `CLAUDE.md` | Project rules including Figma API constraints |

---

## Critical Figma API Rules (from CLAUDE.md)

- No `?.` or `??` — use `&&` and explicit null checks, use `||` instead of `??`
- `figma.combineAsVariants(nodes, figma.currentPage)` — NOT `combineAsComponentSet`
- `counterAxisSizingMode`: only `'FIXED'` or `'AUTO'` — never `'FILL'`
- Use `layoutSizingHorizontal = 'FILL'` on child nodes for fill-parent behavior
- `setBoundVariable(field, variable)` for ALL variable binding including spacing
- Never override `textCase` after setting `textStyleId`
- No em dash character in comments or docs

---

## Token System

Runtime resolution priority:
1. `_tokenMap` — built from Figma Local Variables at runtime via `resolveTokensFromFigma()`
2. `FALLBACK_TOKENS` — hardcoded RGB values, used only when variable not found

Variable name normalization (handles all common formats):
- `"Primary/Default"` → stores as `"default"`, `"primary-default"`, `"primary-default"`
- `"colors/primary-default"` → stores as `"primary-default"`, `"colors-primary-default"`, `"primary-default"`

Token names used across molecules (all must exist in Figma Local Variables):
`background`, `surface-default`, `surface-hover`, `foreground-primary`, `foreground-secondary`,
`foreground-tertiary`, `foreground-strong`, `foreground-muted`, `primary-default`,
`brand-deep`, `brand-default`, `brand-soft`, `brand-faint`, `positive-default`,
`danger-default`, `caution-default`, `border-primary`, `border-secondary`, `chart-citations`

---

## React Component → Figma Molecule Mapping

| React Component | Figma Molecule | Generator Function |
|----------------|---------------|-------------------|
| `<NavItem>` in sidebar.tsx | NavItem (4 variants) | `generateNavItemMolecule()` |
| BulkActionBar in search-visibility | BulkActionBar (1 variant) | `generateBulkActionBarMolecule()` |
| FilterBar in search-visibility | FilterBar (1 variant) | `generateFilterBarMolecule()` |
| `<Header>` action group | HeaderActionGroup (1 variant) | `generateHeaderActionGroupMolecule()` |
| Checklist items in drawer | ChecklistItem (2 variants) | `generateChecklistItemMolecule()` |
| Chart legend | ChartLegendItem (3 variants) | `generateChartLegendItemMolecule()` |

---

## Session Work Order (Recommended)

1. Fix 2: BulkActionBar colors — read React component, update `molecule-config.json`
2. Fix 3: FilterBar search field — read React component, update config + generator if needed
3. Fix 1: Translate `ui.html` banners/hints to English
4. Fix 1: Translate `MOLECULES.md` (~700 lines) to English — large task, do in sections
