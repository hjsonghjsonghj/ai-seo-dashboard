# Edition 02: Color Variable Refactoring and Custom Automation

---

## Summary

In Edition 02, I moved from rapid prototyping to System Consolidation. My goal was to achieve 100% synchronization between code and design to prevent future Design Debt. This entry was a journey of overcoming the limitations of current AI agents and building my own automation tools to bridge the gap between production code and Figma.

- The Goal: Build a Design System with 100% sync rate between code and Figma.
- The Challenge: Overcoming AI agent errors and Figma API constraints.

---

## Deep Dive: Optimizing System Architecture and Automation

**Step 1: Exploring AI Infrastructure and Constraints**

I initially investigated the Figma MCP server, newly released as of late March 2026, for Claude to automate the code-to-canvas pipeline. However, I discovered a critical technical barrier: the ability to read or write variables via MCP requires a Private Token, which is strictly limited to Figma Enterprise plan users. Since my current plan does not grant the necessary API permissions to generate these tokens, I realized this infrastructure was not a viable solution and pivoted toward building my own custom integration workflow from scratch.

**Step 2: AI-Driven Color Audit and Semantic Refactoring**

Before developing the plugin, I used AI to conduct a comprehensive Color Audit of the entire codebase to extract every active color value. I identified all hard-coded colors that were missed during Edition 01 and refactored them into a logical Semantic Naming system, such as `surface/hover` and `border/primary`. By consolidating redundant colors and ensuring all values were bound to variables, I established a clean, debt-free foundation for the design system.

**Step 3: The Limits of AI-Generated Plugins**

After organizing the code-side variables, I attempted to use Claude Cowork to develop a Design Generator Plugin to recreate this system in Figma.

- First attempt: The AI-generated plugin failed to achieve visual precision, leading to significant design mismatches.
- Second attempt: While color tokens were successfully linked, the overall visual consistency and layout integrity were still lacking.

This led me to pivot toward using html-to-design for high-fidelity imports while focusing my custom plugin development specifically on 100% precise color binding.

**Step 4: Navigating AI Hallucinations in Windsurf**

After exhausting my weekly credits on Claude Cowork, I migrated to Windsurf to refine the color binding logic. I faced constant AI hallucinations and repetitive syntax errors. Windsurf's agent claimed the issue was resolved in every turn, but the 1:1 precise matching still failed in practice. The system fluctuated between making all colors solid or incorrectly applying opacity to every single layer, draining the development momentum with minor but persistent mistakes.

**Step 5: The Gemini Breakthrough -- Solving the Opacity Bug**

Seeking a fresh perspective, I pivoted to Gemini. Unlike the previous agents, Gemini accurately identified the root cause within the Figma API structure.

- The breakthrough: The `setBoundVariableForPaint()` function resets opacity to 100% by default.
- Following Gemini's precise logic, I refactored the plugin to capture the original opacity before binding and explicitly re-inject it after the variable is linked. This finally achieved the 1:1 visual perfection I was aiming for.

---

## Critical Reflection: Architecture over Aesthetics

This Edition proved that being an AI-Native designer is not about clicking a button. It is about deep technical auditing and persistence. When I encountered infrastructure barriers like API permission restrictions and the lack of precision in AI-generated plugins, I took control of the logic myself. By navigating through different AI environments (Claude, Windsurf, and Gemini), I successfully debugged the Figma API. This allowed me to build a foundation that is mathematically and visually identical to the production code.

---

## Conclusion

The color system is now flawlessly synchronized. With this automated bridge between code and canvas, Edition 03 will focus on Atomic Component Automation to further eliminate manual design maintenance.
