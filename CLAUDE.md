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
- Avoid nullish coalescing (`??`) and optional chaining (`?.`) -- they cause syntax errors in the Figma plugin environment. Use `||` and explicit `&&` checks instead.
- Never use the em dash character (--) in any documentation or code comments.
