# Project Guidelines

## Style & Design System
- Refer to docs/design-system/STYLE_SPACING.md for layout and spacing rules.
- Refer to docs/design-system/STYLE_COLOR.md for theme colors and semantic tokens.
- Refer to docs/design-system/STYLE_TYPOGRAPHY.md for font scales and hierarchy.
- Strictly avoid hardcoded arbitrary values (e.g., m-[13px]). Use defined theme tokens in @theme block instead.

## Commands
- Build: npm run build
- Dev: npm run dev
- Lint: npm run lint

## Communication Rules
- Never use em-dashes (—) in any response, document, or code comment.
- Write in a friendly conversational tone. Do not use formal declarative sentence endings.

## Figma Plugin Development Rules
- Always use safe ES6 JavaScript syntax for code.js files inside Figma plugin folders.
- Avoid nullish coalescing (`??`) and optional chaining (`?.`) — they cause syntax errors in the Figma plugin environment. Use `||` and explicit `&&` checks instead.
- Never use the em dash character (—) in any documentation or code comments.
- Use `figma.combineAsVariants(nodes, figma.currentPage)` — NOT `combineAsComponentSet` (does not exist).
- `counterAxisSizingMode` only accepts `'FIXED'` or `'AUTO'`. Never set it to `'FILL'` — use `layoutSizingHorizontal = 'FILL'` on child nodes instead.
- Never override `textCase` after setting `textStyleId` — it breaks the style binding in Figma's properties panel. Caps styles must have UPPER set inside the Figma text style itself.
- Use `node.setBoundVariable(field, variable)` for ALL variable binding including Auto Layout spacing fields (paddingTop/Right/Bottom/Left, itemSpacing, counterAxisSpacing). `setBoundVariableForLayout` does NOT exist in the current Figma API and will silently fail.
- Refer to docs/design-system/ATOMS.md for the full atom inventory, plugin architecture, and verified API patterns.
