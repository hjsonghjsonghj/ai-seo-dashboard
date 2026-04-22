# DS Components — Atomic Generator Reference

## Plugin: plugin-02b-variable-binder

Scans atom frames produced by plugin-02a and binds Local Variables to every
color fill/stroke and cornerRadius property in one pass.

### Stages

| # | Stage | Action |
|---|-------|--------|
| 1 | Load colorMap | Reads Semantic COLOR collection; matches vars by name using SEM_MAP hex table |
| 2 | Ensure Radius vars | Get-or-creates "Radius" FLOAT collection with radius/sm(6) md(8) lg(12) xl(16) |
| 3 | Walk atoms | Recursive tree walk over wrapper FRAME -> ComponentSet -> children |
| 4 | Bind | fills, strokes via `setBoundVariableForPaint`; cornerRadius via `setBoundVariable` |

### Scope modes

- **All Atoms** (default) -- finds every top-level FRAME whose name matches an atom name
- **Selection** -- walks only the currently selected layers

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

plugin-01-color-sync must have run first so the "Semantic" COLOR collection exists.
If no Semantic variables are found the plugin surfaces an error before touching any nodes.

### Verified API patterns

```js
// Color binding (fill)
var bound = figma.variables.setBoundVariableForPaint(paint, 'color', variable);
node.fills = [...newFills];  // then re-apply opacity if < 0.99

// cornerRadius binding (uniform only -- never figma.mixed)
node.setBoundVariable('cornerRadius', radiusVariable);

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

---

## Atoms (15 total)

### Button — 48 variants (4 variant x 4 state x 3 size)
- **Variants**: primary, secondary, ghost, destructive
- **States**: default, hover, focus, disabled
- **Sizes**: sm (h32 / px12), md (h36 / px16), lg (h40 / px24)
- **Typography**: `body-sm-medium`
- **Table**: colHeaders=variants, rowGroups=sizes, rowLabels=states

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
v.fills = solid(tok('border-primary'));
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
