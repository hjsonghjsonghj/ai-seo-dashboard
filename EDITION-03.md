# Edition 03: Typography Variable System

---

## Summary

While building Atomic Components, I identified and resolved inconsistencies within the typography system. After defining new CSS variables and refactoring the codebase, the Figma plugin was evolved into a "Style Inheritance" architecture. This ensures the design system is a living reflection of the production environment, capable of intelligent self-healing and automated binding.

---

## Key Technical Breakthroughs

**1. Full Codebase Refactoring with CSS Variables**

All hard-coded font sizes and weights were replaced with structured variables in `globals.css` (e.g., `--text-body-sm`). The entire UI is now controlled by a centralized system, making global updates possible with a single change in CSS.

**2. Fixing tailwind-merge Conflicts**

Custom typography utilities were being overwritten by tailwind-merge. Fixed by updating `lib/utils.ts` using `extendTailwindMerge` to register the custom typography group.

**3. Multi-Property Scoping: Attribute Isolation**

Variable overload in Figma property panels caused confusion during the design process. Strict scoping logic was applied to each attribute (Size, Weight, LH, LS) to ensure variables appear only in their corresponding Figma panels. This prevents typography tokens from cluttering unrelated layout settings.

**4. Integrated Token Generation and Auto-Binding**

A scanning engine was built to detect raw text layers and automatically bind them to the newly generated typography tokens and styles. This turned manual design maintenance into a seamless, one-click synchronization process.

**5. Strategic Bridge: Handling API Limitations**

The Figma API cannot programmatically bind variables to "Font Family" or map numerical values (700) to "Font Styles" (Bold) within a Text Style. A hybrid workflow was established where numerical CSS values are mapped to String variables (e.g., "Bold") for visual perfection. While numerical values are synced automatically, font family and weight variables are linked manually to bypass technical blockers.

**6. Shift to Pure Style Inheritance**

Direct variable injection into layers broke the inheritance link to parent Text Styles. Direct layer-level bindings were eliminated in favor of assigning `TextStyleId`s only. This ensures all layers perfectly inherit properties from the central style definition.

**7. Automation of Visual Semantics (TextCase: UPPER)**

Styles requiring all-caps (e.g., `label-xs-caps`) had to be toggled manually in Figma. Logic was integrated to detect caps-specific tokens and automatically force the UPPER text case at the style level. This guarantees 100% visual parity between the code and Figma.

---

## Critical Reflection: Bridging the Gap Between AI and Production

This process showed that while AI is a powerful tool, it often misses the small but critical details of a Code-to-Canvas workflow. Even though the AI claimed the task was "done," it failed to include basic attributes like Font Weight and Letter Spacing, and it could not solve the tailwind-merge conflicts on its own.

Building a solid system requires more than simple automation. It took significant trial and error to find the gaps the AI left behind. Manual fixes were required for missing attribute mappings, and a custom bridge was needed to work around Figma API limits. The system is reliable because of this manual oversight, ensuring the codebase is perfectly mirrored on the Figma canvas.

---

## Next Step

With the typography inheritance model perfected, the project is moving to Atomic Component Automation.
