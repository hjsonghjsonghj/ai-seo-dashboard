# Next Session Handoff: Edition 11 Ready

**Project:** ai-seo-dashboard / Design System Pipeline

## Project Big Picture

- **SSOT:** React Code -> Figma Design (Target: 1:1 Parity).
- **Architecture:** Atomic Design (Atoms -> Molecules).
- **Mechanism:** Every color, spacing, and radius must be physically bound to Figma Local Variables via `setBoundVariable`. No static RGB fills allowed.
- **Critical constraint:** app/layout.tsx has NO `.dark` class on HTML element. All `dark:` Tailwind utilities are dead code in the running app. Always spec against non-dark values.

## Completed This Session (Edition 10 -> 11)

### 1. IconSlot Font Error Fix (`plugin-02a-atomic-generator/code.js`)

`generateIconSlotAtom()` was missing `await loadFonts()`. `buildAtomFrame()` uses Inter Semi Bold for column headers, but fonts were never loaded. Fixed by adding `step = 'fonts'; await loadFonts();` before `step = 'tokens'`.

### 2. SearchField Atom Background Color Fix (`plugin-02a-atomic-generator/code.js`)

SEARCH_STATES updated: bg changed from `input` (full opacity) to `surface-hover` with `bgOp: 0.5`. Disabled state uses `bgOp: 0.3`. JSON round-trip opacity fix applied after `setBoundVariable` resets paint.opacity to 1.0.

```javascript
const SEARCH_STATES = {
  default:  { border: 'border-secondary', borderW: 1, bg: 'surface-hover', bgOp: 0.5, phColor: 'foreground-muted',   compOpacity: 1   },
  focus:    { border: 'brand-deep',       borderW: 2, bg: 'surface-hover', bgOp: 0.5, phColor: 'foreground-muted',   compOpacity: 1   },
  filled:   { border: 'border-secondary', borderW: 1, bg: 'surface-hover', bgOp: 0.5, phColor: 'foreground-primary', compOpacity: 1   },
  disabled: { border: 'border-secondary', borderW: 1, bg: 'surface-hover', bgOp: 0.3, phColor: 'foreground-muted',   compOpacity: 0.5 },
};
```

### 3. FilterBar Search Placeholder Color (`app/search-visibility/page.tsx`)

Changed `placeholder:text-border-primary` to `placeholder:text-foreground-muted` to match SearchField atom.

### 4. SelectDropdown Open State Fix (`plugin-03b-molecule-assembler/code.js`)

Complete rewrite of `generateSelectDropdownMolecule()`:
- New `applyTrigger(node, textLabel, textColorTok, fixedW)` function with leading icon-slot before text
- `fixedW` param: `true` for standalone closed/selected, `false` for openTrig (allows FILL from parent)
- `buildMenu()` rows use `layoutSizingHorizontal = 'FILL'` for proper width
- `centerInCells(cs, components, H_GAP, TRIGGER_H, cs.height)` -- TRIGGER_H=36 as vGap for top-alignment
- `buildAtomFrame` with `vGap: TRIGGER_H` -- property-table cells are 36px tall

### 5. Icon Position Standardization: Icons Inside Fields

**React changes:**
- `app/search-visibility/page.tsx`: Moved Calendar icon inside Date Range SelectTrigger div; moved Filter icon inside Source SelectTrigger div
- `components/dashboard/header.tsx`: Complete rewrite -- Search uses `<Input>` with `pl-10 bg-surface-hover/50`, Date Range changed from decorative `<Button>` to real `<Select>` with Calendar icon inside trigger, notification button bg updated to `bg-surface-hover/50`

**Figma changes:**
- SelectDropdown trigger now includes leading icon-slot: `[paddingL=12][icon-16][gap-8][text FILL][gap-8][chevron-16][paddingR=12]`
- FilterBar config: `externalIcon: false` for both SelectDropdown entries (icons now inside trigger, not external)
- HeaderActionGroup config: removed custom searchGroup frame -- now uses direct SearchField atom; dateButton changed from Button variant to SelectDropdown state

### 6. HeaderActionGroup Generator Rewrite (`plugin-03b-molecule-assembler/code.js`)

Removed: custom `searchGroup` frame + icon slot + Input atom composite.
Added: direct `getVariantInstance(atomIndex, 'SearchField', S_PROPS)` call.

Removed: `getVariantInstance(atomIndex, 'Button', { variant, size, state })` for date.
Added: `getSelectDropdownInstance(D_STATE)` call.

### 7. molecule-config.json Updates (`plugin-03b-molecule-assembler/molecule-config.json`)

- FilterBar filters[0] and [1]: `"externalIcon": true` -> `"externalIcon": false`
- HeaderActionGroup `searchInput`: removed bg/border/icon/cornerRadius fields; `atomName: "SearchField"`, `atomProps: { state: "default", size: "md" }`
- HeaderActionGroup `dateButton`: removed variant/size/label fields; `state: "closed"`, fallbackW: 160

## Regeneration Required in Figma (Next Steps)

Run in this order:

1. **plugin-02a** -> Regenerate SearchField (or Generate All Atoms)
2. **plugin-03a** -> Refresh Atom Index
3. **plugin-03b** -> Generate SelectDropdown (new icon-inside trigger design)
4. **plugin-03b** -> Generate FilterBar (externalIcon=false -- no external icons, SelectDropdown instances)
5. **plugin-03b** -> Generate HeaderActionGroup (SearchField atom + SelectDropdown for date)

## Current State Summary

| Atom | Status |
|---|---|
| Button (60 variants) | Previously generated, no changes |
| Badge (5 variants) | Previously generated, no changes |
| IconSlot (5 sizes) | Generated -- no changes |
| SearchField (4 states) | Needs regeneration -- bg color fixed |
| Input, Checkbox, Radio, Switcher, Select + 11 others | Previously generated, no changes |

| Molecule | Status |
|---|---|
| SelectDropdown (3 variants: closed/open/selected) | Needs regeneration -- trigger now has leading icon |
| FilterBar | Needs regeneration -- externalIcon=false, icons inside SelectDropdown trigger |
| HeaderActionGroup | Needs regeneration -- SearchField atom + SelectDropdown for date |
| BulkActionBar | Previously generated, no changes |
| ChecklistItem, ChartLegendItem, NavItem | Previously generated, no changes |

## Known Remaining Gaps

1. HeaderActionGroup notif button is a custom frame (not a Button atom). Low priority since there is no matching icon-button variant in the Button atom set.
2. SelectDropdown trigger widths in FilterBar: Figma uses 200px (molecule default) while React uses 160px / 180px. Structural parity is correct; exact widths are overridden in React className.
3. `overrideText(searchInst, S_PH)` on a SearchField instance may not find the placeholder text node depending on how the atom nests its text. If the search field shows wrong text in Figma, the `overrideText` helper needs to recurse deeper.

## Key File Locations

- `plugin-02a-atomic-generator/code.js`: Atom factory (SearchField bg fixed)
- `plugin-03b-molecule-assembler/code.js`: Assembly engine (SelectDropdown icon-inside + HeaderActionGroup rewrite)
- `plugin-03b-molecule-assembler/molecule-config.json`: Molecule blueprint (FilterBar externalIcon=false, HeaderActionGroup SearchField+SelectDropdown)
- `components/dashboard/header.tsx`: HeaderActionGroup React source (Select for date, Input for search)
- `app/search-visibility/page.tsx`: FilterBar React source (icons inside SelectTrigger)
- `components/ui/select.tsx`: Select component (SelectDropdown molecule source of truth)
- `ATOMS.md`: Atom inventory reference

## Tech Stack Constraints (Strict)

- No `?.` or `??`: Use `&&` and `||`
- No Em-dash: Do not use in code or docs
- Variable Binding: `setBoundVariable(field, variable)` for all styles
- React-First: If Figma looks different from React, update Figma code
- No `.dark` class on HTML: `dark:` utilities are dead code -- spec against non-dark values only
- All interactive elements: h-9 (36px) is the standard desktop interactive height
- `combineAsVariants(nodes, figma.currentPage)` -- correct Figma API
- `layoutSizingHorizontal = 'FILL'` on child nodes for fill-parent
- `generateAllAtoms()` sets `_batchMode = true` before iterating and `false` after
- `generateIconSlotAtom()` must run before other atoms in `generateAllAtoms()` so `makeIconSlot()` finds the component set on the page
- JSON round-trip required after `setBoundVariable` to apply paint.opacity: `var ff = JSON.parse(JSON.stringify(node.fills)); ff[0].opacity = op; node.fills = ff;`
