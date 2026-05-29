# DS Components — Atomic Generator Reference

## Plugin: plugin-02b-variable-binder

Scans atom frames produced by plugin-02a and binds Local Variables to every
cornerRadius and spacing property in one pass. Color fills/strokes are now
bound at creation time inside plugin-02a (see "Variable binding" section
below), so the color stage of 02b acts as a top-up sweep - it covers any
nodes built before the 02a binding refactor or imported from elsewhere.

### Stages

| # | Stage | Action |
|---|-------|--------|
| 1 | Load colorMap | Reads Semantic COLOR collection; matches vars by name using SEM_MAP hex table |
| 2 | Ensure Radius vars | Get-or-creates "Radius" FLOAT collection with radius/sm(6) md(8) lg(12) xl(16) |
| 3 | Load spacingMap | Reads existing "Spacing" FLOAT collection (plugin-01c); builds value -> Variable map |
| 4 | Walk atoms | Recursive tree walk over wrapper FRAME -> ComponentSet -> children |
| 5 | Bind | fills/strokes via `setBoundVariableForPaint`; cornerRadius + padding/gap via `setBoundVariable` |

### Scope modes

- **Full Page** (default) -- walks ALL nodes on the current page with no name filtering; new components are picked up automatically
- **Selection** -- walks only the currently selected layers and their descendants

### Radius token table

| Variable | Value | px constant in 02a |
|----------|-------|--------------------|
| `radius/sm` | 6 | `RADIUS.sm` |
| `radius/md` | 8 | `RADIUS.md` |
| `radius/lg` | 12 | `RADIUS.lg` |
| `radius/xl` | 16 | `RADIUS.xl` |

Radius values not in this table (4, 7, 9, 9999, d/2) are left as raw numbers.

### Opacity preservation

`solidOpacity(color, opacity)` fills carry a sub-1 `fill.opacity`.
After `setBoundVariableForPaint` the fill is re-serialised (JSON round-trip) to
restore the original opacity value, matching the approach used in plugin-01.

### Pre-condition

plugin-01-color-sync should have run first so the "Semantic" COLOR collection exists.
If no Semantic variables are found, color binding is skipped with a console warning — radius and spacing binding still run.

### Verified API patterns

```js
// Color binding (fill / stroke)
var bound = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
node.fills = [...newFills];  // then re-apply opacity if < 0.99

// cornerRadius binding (uniform only -- never figma.mixed)
node.setBoundVariable('cornerRadius', radiusVariable);

// Auto Layout spacing binding (padding + gap)
// setBoundVariableForLayout does NOT exist in the current Figma API -- always fails silently.
// Use the same setBoundVariable used for cornerRadius. Pass the Variable object, NOT .id.
node.setBoundVariable('paddingTop', spacingVariable);
node.setBoundVariable('paddingLeft', spacingVariable);
node.setBoundVariable('itemSpacing', spacingVariable);
// Fields: paddingTop/Right/Bottom/Left, itemSpacing, counterAxisSpacing (WRAP only)
// Unmatched values (not in the Spacing collection) are collected and reported -- not thrown as errors.

// Async variable loading (requires enableProposedApi: true)
var allVars = await figma.variables.getLocalVariablesAsync('COLOR');
var allVars = await figma.variables.getLocalVariablesAsync('FLOAT');
var colls   = await figma.variables.getLocalVariableCollectionsAsync();
```

---

## Plugin: plugin-02a-atomic-generator

Generates Figma ComponentSet atoms wrapped in a dark Property Table frame (Propstar-style).
Each atom has dashed purple grid cells aligned to its property columns and rows.

---

## Architecture

### buildAtomFrame(cs, title, config)

Wraps a ComponentSet in a dark frame (#020617) with:
- Title text (`display-sm-semibold`, top-left)
- Column headers (`label-xs-caps-semibold`, centered over each cell column)
- Row group labels — size column (SM / MD / LG), optional
- Row state labels — state column (default / hover / focus / disabled), optional
- Purple dashed grid overlay (`brand-deep`, dashPattern:[4,4], opacity:1)

Config keys: `hGap, vGap, numCols, numRows, colHeaders, rowGroups, rowLabels`

`ROW_HDR_W` expands automatically: +80px per active label column (rowGroups, rowLabels).

### centerInCells(cs, components, hGap, vGap, csH)

Called after `figma.combineAsVariants`. Adds centering offsets to each component's
local x,y inside the ComponentSet, then calls `cs.resize(maxR, maxB)` to expand
bounds and prevent clipping when components are smaller than the cell dimensions.

### getNextPosition()

Snapshots the canvas bottom BEFORE `combineAsVariants` to avoid counting the new
ComponentSet in the layout calculation. Always call before combine, set wrapper.x/y after.

### Icon-Slot convention

All icon placeholder frames inside components are named `Icon-Slot`:
- No fill, dashed `foreground-muted` (slate-400) 1px stroke, dashPattern:[4,4]
- Size matches the icon context (12px, 16px, etc.)
- Designer replaces manually with the real lucide icon

### Variable binding (built into plugin-02a)

Atom paints are bound to Figma local Variables at creation time, not after the fact.

Helpers in `code.js`:
- `resolveVariablesFromFigma()` - runs at the start of every generator. Reads `figma.variables.getLocalVariablesAsync('COLOR')`, follows VARIABLE_ALIAS chains, populates two runtime caches keyed by normalized token name (leaf, full, and no-prefix forms): `_tokenMap` for resolved RGB and `_variableByName` for Variable references.
- `paint(tokenName, opacity?)` - returns one SOLID Paint with `boundVariables.color = { type: 'VARIABLE_ALIAS', id: variable.id }` when a Variable exists for the token. Falls back to `FALLBACK_TOKENS` RGB when the Variable is missing. The static color is always set as well, so the paint stays valid even if the binding can't resolve.
- `paints(tokenName, opacity?)` - single-paint array, ready to assign to `node.fills` or `node.strokes`.

All generators (16) call `await resolveVariablesFromFigma()` after `loadFonts()`. Every fill/stroke (component bg, border, text fill, icon-slot stroke, dot, indicator, arc, track, etc.) goes through `paints(...)`. The legacy `solid()` / `solidOpacity()` helpers are kept only for the rare spots that pass an already-resolved RGB and intentionally never bind (e.g. inline `PURPLE_PAINT` reused across QA grid cells).

**SSOT consequence:** editing a Variable in the Figma collection updates every atom instance immediately - no plugin re-run needed. plugin-02b is therefore now optional for color binding (still useful for Radius / Spacing). When plugin-01-color-sync hasn't run yet, atoms render with `FALLBACK_TOKENS` RGB and the bindings simply stay unbound until variables exist.

---

## Atoms (16 total - 169 component variants)

| Atom | Variants | Formula |
|------|----------|---------|
| Button | **60** | 5 variant × 4 state × 3 size |
| Input | 12 | 4 state × 3 size |
| Badge | 5 | 5 variant |
| Checkbox | 3 | 3 state |
| Radio | 3 | 3 state |
| Switcher | 3 | 3 state |
| Select | 12 | 4 state × 3 size |
| SearchField | 12 | 4 state × 3 size |
| Progress | 20 | 4 color × 5 value |
| Avatar | 8 | 4 size × 2 state |
| Alert | 4 | 4 variant |
| Spinner | 3 | 3 size |
| Separator | 2 | 2 orientation |
| Toggle | 12 | 4 state × 3 size |
| Tooltip | 4 | 4 placement |
| ProgressRing | 6 | 3 state × 2 size |

(Was 157 before adding the Button `outline` variant; +12 Button components -> 169.)


### Button — 60 variants (5 variant x 4 state x 3 size)
- **Variants**: primary, secondary, outline, ghost, destructive
- **States**: default, hover, focus, disabled
- **Sizes**: sm (h32 / px12), md (h36 / px16), lg (h40 / px24)
- **Typography**: `body-sm-medium`
- **Table**: colHeaders=variants, rowGroups=sizes, rowLabels=states
- **outline variant tokens** (resolved against actual running app -- no .dark class on HTML element):
  - app/layout.tsx does NOT add .dark class, so dark: utilities are dead code in the running app.
  - button.tsx: `border bg-background shadow-xs hover:bg-brand-default hover:text-foreground-strong`
  - `border` without color = currentColor = text color = foreground-primary (near-white)
  - default:  bg `background`,    border `foreground-primary` 1px, text `foreground-primary`, shadow-xs
  - hover:    bg `brand-default`, border `foreground-primary` 1px, text `foreground-strong`,  shadow-xs
  - focus:    bg `background`,    border `brand-deep` 2px,         text `foreground-primary`, shadow-xs
  - disabled: bg `background`,    border `foreground-primary` 1px, text `foreground-muted` (component opacity 0.5)
- **React mapping** (components/ui/button.tsx cva):
  - `default → primary`, `secondary → secondary`, `outline → outline`,
    `ghost → ghost`, `destructive → destructive`, `link → not represented` (text-only)

### Input — 12 variants (4 state x 3 size)
- **States**: default, focus, error, disabled
- **Sizes**: sm (240x32), md (280x36), lg (320x40)
- **Typography**: `label-xs-medium` (label), `body-sm-medium` (placeholder)
- **Table**: colHeaders=states, rowGroups=sizes

### Badge — 5 variants
- **Variants**: neutral, success, warning, danger, info
- **Style**: pill (cornerRadius:9999), 15% opacity fill, no outline
- **Typography**: `label-xs-caps-semibold`

### Checkbox — 3 variants
- **States**: unchecked, checked, disabled
- **Box**: 16x16px, cornerRadius:4; checkmark '✓' when checked
- **Colors**: unchecked → `border-primary` border + `surface-hover` bg / checked → `primary-default` fill + white checkmark
- **Typography**: `body-sm-medium`

### Radio — 3 variants
- **States**: unchecked, checked, disabled
- **Circle**: 16x16px, cornerRadius:8; 6px dot when checked
- **Typography**: `body-sm-medium`

### Switcher — 3 variants
- **States**: off, on, disabled
- **Track**: 32x18px / Thumb: 14x14px, cornerRadius:7

### Select — 12 variants (4 state x 3 size)
- **States**: default, open, selected, disabled
- **Sizes**: sm (200x32), md (240x36), lg (280x40)
- **Contains**: value text (FILL) + Icon-Slot 12px (chevron-down)
- **Typography**: `body-sm-medium`
- **Table**: colHeaders=states, rowGroups=sizes

### SearchField — 12 variants (4 state x 3 size)
- **States**: default, focus, filled, disabled
- **Sizes**: sm (240x32), md (280x36), lg (320x40)
- **Contains**: Icon-Slot 16px (search) + placeholder text (FILL)
- **Typography**: `body-sm-medium`
- **Table**: colHeaders=states, rowGroups=sizes

### Progress — 20 variants (4 color x 5 value)
- **Colors**: brand, success, warning, danger
- **Values**: 0%, 25%, 50%, 75%, 100%
- **Track**: 200x8px, cornerRadius:4, fill=surface-hover
- **Fill frame**: width = trackW * pct/100, same height, fill=color token
- **Table**: colHeaders=percentages, rowGroups=colors

### Avatar — 8 variants (4 size x 2 state)
- **Sizes**: xs (24px), sm (32px), md (40px), lg (56px)
- **States**: default, online (positive-default dot, bottom-right)
- **Style**: circle (cornerRadius=d/2), brand-default/25% fill, initials 'HJ'
- **Table**: colHeaders=sizes, rowGroups=states

### Alert — 4 variants
- **Variants**: info, success, warning, destructive
- **Contains**: Icon-Slot 16px + content column (title + description, FILL width)
- **Style**: colored 1px border + 8% opacity background fill, cornerRadius:12
- **Typography**: `body-sm-medium` (title), `label-xs-medium` (description)
- **Note**: `textCol.counterAxisSizingMode = 'AUTO'` — 'FILL' throws a validation error

### Spinner — 3 variants
- **Sizes**: sm (16px), md (24px), lg (32px)
- **Style**: fill-based ring using arcData + innerRadius (NOT stroke-based)
  - Track: `border-primary` fill, `arcData: { startingAngle:0, endingAngle:0, innerRadius:0.75 }`
  - Arc: `brand-default` fill, `arcData: { startingAngle:-Math.PI/2, endingAngle:Math.PI, innerRadius:0.75 }`
  - `innerRadius:0` creates a pie/wedge shape. `innerRadius:0.75` creates a ring.

### Separator — 2 variants
- **Orientations**: horizontal (240x1px), vertical (1x80px)
- **Fill**: `border-secondary`

### Toggle — 12 variants (4 state x 3 size)
- **States**: default, active (brand-deep bg), hover, disabled
- **Sizes**: sm (28x28), md (32x32), lg (36x36)
- **Contains**: Icon-Slot (12px / 14px / 16px matching size)

### Tooltip — 4 variants
- **Placements**: top, right, bottom, left
- **Bubble**: surface-hover fill, border-primary 1px stroke, cornerRadius:8
- **Arrow**: `figma.createVector()` with explicit SVG path — proper directional triangle
  - top:    `'M 0 0 L 8 0 L 4 6 Z'` (pointing down)
  - bottom: `'M 0 6 L 8 6 L 4 0 Z'` (pointing up)
  - left:   `'M 0 0 L 0 8 L 6 4 Z'` (pointing right)
  - right:  `'M 6 0 L 6 8 L 0 4 Z'` (pointing left)
- **Positioning**: right arrow `x = bubble.x - 6` so base touches bubble edge

### ProgressRing — 6 variants (3 state x 2 size)
- **States**: critical (progress=20, danger-default arc), moderate (progress=55, caution-default arc), good (progress=85, positive-default arc)
- **Sizes**: sm (40px -- desktop CitationTableRow), lg (44px -- mobile CitationCard)
- **Structure**: NONE-layout component frame containing track ellipse + arc ellipse + centered label text
  - Track: `border-secondary` fill, `arcData: { startingAngle:0, endingAngle:0, innerRadius:ir }` (full circle)
  - Arc: semantic color fill, `arcData: { startingAngle:-Math.PI/2, endingAngle:(-PI/2 + progress/100*2PI), innerRadius:ir }`
  - innerRadius formula: `(d/2 - 3) / (d/2)` so ring wall = 3px
  - Label: `label-micro-medium`, color matches arc state (danger-soft / caution-soft / positive-soft)
- **Arc color map**: critical=danger-default  moderate=caution-default  good=positive-default
- **Text color map**: critical=danger-soft     moderate=caution-soft     good=positive-soft
- **Note**: Classified as atom (not molecule) in Figma because it is a self-contained,
  single-responsibility drawable that plugin-03b creates instances of during molecule assembly.
  In MOLECULES.md it is documented as molecule #03 for web-component reference only.

---

## RADIUS Constants (Figma plugin cornerRadius)

| Key | px | Usage |
|-----|----|-------|
| `RADIUS.sm` | 6 | Small inner elements |
| `RADIUS.md` | 8 | Buttons, inputs, tooltips, cells |
| `RADIUS.lg` | 12 | Alerts, cards |
| `RADIUS.xl` | 16 | Wrapper atom frames |

---

## Verified API Patterns

### Component creation lifecycle
```js
// 1. Snapshot position BEFORE combine (avoids self-count)
var pos = getNextPosition();

// 2. Combine — correct API name
var cs = figma.combineAsVariants(components, figma.currentPage);
cs.name = 'Button';
try { cs.layoutMode = 'NONE'; } catch (_) {}

// 3. Center within cells (also resizes cs to prevent clipping)
centerInCells(cs, components, H_GAP, V_GAP, cs.height);

// 4. Wrap in Property Table frame
var wrapper = buildAtomFrame(cs, 'Button', { ... });
wrapper.x = pos.x;
wrapper.y = pos.y;
```

### Text style binding
```js
t.textStyleId = style.id;
// NEVER set t.textCase after textStyleId — breaks the binding in Figma UI.
// Caps styles must have UPPER set inside the Figma text style itself.
```

### counterAxisSizingMode
```js
frame.counterAxisSizingMode = 'AUTO';   // correct
frame.counterAxisSizingMode = 'FIXED';  // correct
frame.counterAxisSizingMode = 'FILL';   // throws validation error
// To fill a parent auto-layout container, use on the child node:
child.layoutSizingHorizontal = 'FILL';
```

### Vector triangles
```js
var v = figma.createVector();
v.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 0 0 L 8 0 L 4 6 Z' }];
v.fills = paints('border-primary');   // bound to border-primary variable
v.strokes = [];
parent.appendChild(v);
v.x = xPos; v.y = yPos; // position after append
```

---

## Syntax Constraints (Figma plugin jsvm-cpp parser)

| Forbidden | Safe replacement |
|-----------|-----------------|
| `obj?.prop` | `(obj && obj.prop)` |
| `a ?? b` | `a \|\| b` for strings/objects; `(a !== null && a !== undefined ? a : b)` for numerics where 0 is valid |

Use the strict ternary for numeric fields (`paddingLeft`, `itemSpacing`, etc.) where `0` is a valid value.

---

## Duplicate Prevention

Every generator calls `deleteExistingNode(name)` as its first step.
Removes any existing COMPONENT_SET or FRAME with the same name before creating new nodes.
