# Edition 05: Molecule Assembly and Strategic Recalibration

---

## Summary

In Edition 05, I built the molecule layer of the design system. Seven molecules now exist in Figma as real components, composed from atom instances with token binding. Generating them revealed how far Figma had drifted from the live product. I found and fixed six visual issues: but more importantly, I made a strategic decision: **stop chasing pixel-perfect Figma sync automatically, and shift focus to what actually enables consistent design expansion.**

---

## The Goal / The Challenge

**Goal:** Generate all seven molecules in Figma using Molecule Assembler (plugin-03b), so the design system reflects the full component inventory of the live product.

**Challenge:** After more than a month of work, I had only two product pages to show. I needed an honest review of the return on investment.

---

## Deep Dive

**Step 1: Molecule assembly**

Molecule Assembler (plugin-03b) builds each molecule from real atom instances, not copies, using a JSON config as the blueprint. Token changes in atoms propagate into molecules automatically. The atom index is maintained by Molecule Locator (plugin-03a).

I generated seven molecules: ChecklistItem, ChartLegendItem, NavItem, BulkActionBar, SelectDropdown, FilterBar, HeaderActionGroup.

During HeaderActionGroup assembly, I discovered a deeper problem: the plugin had been building a **fake search field**: a custom frame that just looked like a SearchField but had no connection to the real atom. Same for the date button, which was a styled Button pretending to be a dropdown. I replaced both with their proper component counterparts.

**Step 2: Visual fixes, and why they matter**

Once the molecules were generated, I compared them against the live product one by one. Almost every molecule had something wrong. ChecklistItem, NavItem, BulkActionBar, SelectDropdown, FilterBar, HeaderActionGroup: each needed manual correction. Some issues were small (wrong text size, wrong placeholder color), some required a full redesign (the SelectDropdown trigger had no leading icon at all and had to be rebuilt from scratch). Icons were placed outside fields in some components and inside in others. The SearchField background was fully opaque when it should be semi-transparent. The dropdown checkmark was always muted gray regardless of state. A white border appeared around menus because of a wrong border token.

The list kept growing. **Each fix required identifying the gap, updating the plugin logic or config, regenerating the component, and checking again.** There was no shortcut.

This is what made the scale of the problem clear. It was not a matter of fixing a few bugs: it was a structural issue. Every time the live product changes, Figma falls behind. And catching up always costs the same amount of manual effort, no matter how well the plugin is built.

**Step 3: Instance Swap on icon slots**

I added an **Instance Swap property** to all components with icon slots so designers can swap icons directly from Figma's Properties panel without entering the component.

**Step 4: Select atom removed**

No current component uses the form-style Select atom. I removed it to keep the atom set clean. Atom count: 17 to 16.

**Step 5: Strategic recalibration**

The molecule correction work made one thing undeniable: **component-level sync cannot be automated.** Figma components are static. The live product uses dynamic CSS, runtime behavior, and component internals that a plugin simply cannot track. Every product change creates new gaps, and closing them always costs the same manual effort.

After more than a month of this, I decided the approach needed to change.

My plan for design expansion became **Lovable**: an AI tool that generates new pages from prompts using the codebase as context, not Figma. What Lovable needs to produce consistent output is not a pixel-perfect Figma file. It needs `DESIGN_SYSTEM.md`: a document describing available components, their usage patterns, and design token conventions. Building that document became Edition 06. Figma stays useful as a layout planning tool before writing a Lovable prompt, but I paused the automated sync pipeline.

---

## Critical Reflection

**I was wrong to assume that code and Figma could stay in sync automatically.** The gap is structural, not fixable. The work across Editions 01 to 05 produced a real, usable component library. But I realized the most valuable next investment was documentation, not more plugins.

---

## Conclusion / Next Step

**Achieved:** 7 molecules in Figma, 6 visual issues fixed, Instance Swap on all icon components, Select atom removed, **design expansion strategy confirmed.**

**Edition 06:** Write `DESIGN_SYSTEM.md`. Test with a first Lovable-generated page. Plugin development is paused.
