# Spacing Sync Pro

## Overview

Spacing Sync Pro is a Figma plugin that syncs spacing tokens defined in
`STYLE_SPACING.md` into Figma Variables and auto-binds them to Auto Layout
layers in the current selection. It creates a live design token link between
the codebase spacing scale and Figma frame properties.

---

## UI Settings

| Setting | Value |
|---------|-------|
| Width | 360px |
| Height | 550px |
| Language | English |
| Theme | Figma system colors |

The `figma.showUI` height in `code.js` and the `min-height` in `ui.html` are
kept identical to prevent content clipping.

---

## Variable Structure

Variables follow a hierarchical naming convention using Figma's slash-notation,
grouping all spacing tokens under the `layout` folder inside the `Spacing`
collection:

```
Spacing (collection)
  layout/0    ->  0px
  layout/2    ->  2px
  layout/4    ->  4px
  layout/6    ->  6px
  layout/8    ->  8px
  layout/10   -> 10px
  layout/12   -> 12px
  layout/16   -> 16px
  layout/20   -> 20px
  layout/24   -> 24px
  layout/32   -> 32px
```

All variables are type `FLOAT` and store raw pixel values.

---

## Key Logic

### getOrCreateCollection

Calls `figma.variables.getLocalVariableCollectionsAsync()` and searches for an
existing collection named "Spacing". If found, it is reused; if not, a new one
is created. This prevents duplicate collections from accumulating across runs.

### setBoundVariableForLayout

Padding and gap fields are bound using the official layout binding API:

```js
frame.setBoundVariableForLayout(field, matchVar.id);
```

This activates the variable chip icon in the Figma right panel for each bound
spacing property, ensuring the token relationship is visible and persistent
across mode switches. Raw value assignment (`frame.paddingLeft = 16`) does not
create this link.

Safety checks applied before each call:
- `field in frame` - property must exist on the node
- `typeof rawValue === "number"` - value must be a valid number
- `frame.boundVariables && frame.boundVariables[field]` - skip if already bound
- `matchVar && matchVar.id` - variable reference must be valid
- `typeof frame.setBoundVariableForLayout === "function"` - method must exist

### Recursive Node Walking

`walkNodes` visits every node in the selection depth-first and recurses into
children:

```js
function walkNodes(nodes) {
  nodes.forEach(function(node) {
    if (node.layoutMode && node.layoutMode !== "NONE") {
      bindFrame(node);
    }
    if ("children" in node) {
      walkNodes(node.children);
    }
  });
}
```

The Auto Layout guard prevents `setBoundVariableForLayout` from being called
on frames with no layout mode, which would throw a TypeError.

Each `bindFrame` call is wrapped in its own `try/catch` so a single problem
node does not abort the entire walk.

---

## Compatibility and Constraints

- ES6 only. The Figma plugin sandbox does not support Nullish Coalescing (`??`)
  or Optional Chaining (`?.`). All conditional access uses `||` or explicit
  `if` checks.
- No em dash (`-`) characters in documentation or code comments. Use a regular
  hyphen or rewrite the sentence.
- No arrow functions in `code.js` inner callbacks (use `function()` instead).

---

## How to Use

1. Select one or more Auto Layout layers in the Figma canvas (nested frames are
   processed automatically).
2. Open the plugin via Plugins > Development > Spacing Sync Pro.
3. Click **Sync Spacing Tokens** to create or update the `layout/*` variables
   in the Spacing collection.
4. Click **Apply to Selected Layers** to bind matching padding and gap values
   to the corresponding variables.

---

## File Reference

| File | Role |
|------|------|
| `code.js` | Plugin main thread: variable creation, binding logic |
| `ui.html` | Plugin iframe: token preview, buttons, status messages |
| `manifest.json` | Plugin metadata (name, id, main, ui) |
| `plugin.md` | This document |
