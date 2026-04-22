# Project Guidelines

## Style & Design System
- Refer to STYLE_SPACING.md for layout and spacing rules.
- Refer to STYLE_COLOR.md for theme colors and semantic tokens.
- Refer to STYLE_TYPOGRAPHY.md for font scales and hierarchy.
- Strictly avoid hardcoded arbitrary values (e.g., m-[13px]). Use defined theme tokens in @theme block instead.

## Commands
- Build: npm run build
- Dev: npm run dev
- Lint: npm run lint

## Figma Plugin Development Rules
- Always use safe ES6 JavaScript syntax for code.js files inside Figma plugin folders.
- Avoid nullish coalescing (`??`) and optional chaining (`?.`) — they cause syntax errors in the Figma plugin environment. Use `||` and explicit `&&` checks instead.
- Never use the em dash character (—) in any documentation or code comments.
- Use `figma.combineAsVariants(nodes, figma.currentPage)` — NOT `combineAsComponentSet` (does not exist).
- `counterAxisSizingMode` only accepts `'FIXED'` or `'AUTO'`. Never set it to `'FILL'` — use `layoutSizingHorizontal = 'FILL'` on child nodes instead.
- Never override `textCase` after setting `textStyleId` — it breaks the style binding in Figma's properties panel. Caps styles must have UPPER set inside the Figma text style itself.
- Refer to DS-COMPONENTS.md for the full atom inventory, plugin architecture, and verified API patterns.
