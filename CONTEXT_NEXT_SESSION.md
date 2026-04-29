# 📄 Next Session Handoff: Edition 05 Ready

**Project:** ai-seo-dashboard / Design System Pipeline

## 🎯 Project Big Picture

- **SSOT:** React Code → Figma Design (Current Target: 1:1 Parity).
    
- **Architecture:** Atomic Design (Atoms → Molecules).
    
- **Mechanism:** Every color, spacing, and radius must be **physically bound** to Figma Local Variables via `setBoundVariable`. No static RGB fills allowed.
    

## ✅ Completed Last Session (Edition 04 Final)

1. **Atom Builder (plugin-02a) Overhaul:**
    
    - **New Variant:** Added `outline` button (12 variants: 4 states × 3 sizes).
        
    - **Binding Engine:** Replaced all `solid(tok())` calls with a new `paints(tokenName)` helper that performs **Variable Alias Binding** at runtime.
        
    - **Resolution:** Added `resolveVariablesFromFigma()` to scan Local Variables and build a 5-level deep alias map.
        
2. **Atom Scanner (plugin-03a):**
    
    - Updated to index **16 atoms (169 components total)**, including the new `outline` buttons.
        
3. **Molecule Assembler (03b) Refactor:**
    
    - Fully English UI & English `MOLECULES.md` spec.
        
    - `FilterBar` structure corrected to use `SearchField` atom instead of manual Icon+Input.
        

## ⚠️ CRITICAL ISSUE: `outline` Button Mismatch

`plugin-02a`에서 생성된 `outline` 버튼이 현재 React의 실제 디자인과 일치하지 않음. **다음 세션 시작 시 이 부분의 스펙(Border width, Color mapping, Hover state)을 먼저 교정해야 함.**

## 🚀 Next Session Must-Do (Action Items)

### 1. Fix `outline` Button Specification (in `plugin-02a/code.js`)

- **Inspect React:** `components/ui/button.tsx` (cva variant: outline)의 정확한 Tailwind 값을 확인할 것.
    
- **Update Code:** `BUTTON_VARIANTS.outline` 객체의 `bg`, `border`, `text` 토큰 매핑 및 `opacity` 값 수정.
    
- **Regenerate:** Delete old buttons → Run `02a` → Run `03a` (Index Refresh).
    

### 2. Complete Molecule Assembly (in `plugin-03b`)

- **BulkActionBar:** `secondary`로 임시 설정된 'Export' 버튼을 신규 `outline` 아톰으로 교체.
    
- **HeaderActionGroup:** 'DateRange' 버튼을 `outline` 아톰으로 교체.
    
- **Variable Binding Check:** 모든 분자의 텍스트와 배경이 `paints()` 헬퍼를 통해 Variable에 정상적으로 바운딩되어 생성되는지 최종 확인.
    

## 📂 Key File Locations

- `plugin-02a-atom-builder/code.js`: The "Material Factory" (Binding logic & `outline` spec).
    
- `plugin-03b-molecule-assembler/molecule-config.json`: The "Blueprint" (Molecule composition).
    
- `ATOMS.md`: Updated inventory (16 atoms / 169 variants).
    
- `MOLECULES.md`: English spec for 13 molecules.
    

## 🛠 Tech Stack Constraints (Strict)

- **No `?.` or `??`:** Use `&&` and `||`.
    
- **No Em-dash (`—`):** Do not use in code or docs.
    
- **Variable Binding:** Use `setBoundVariable(field, variable)` for all styles.
    
- **React-First:** If Figma looks different from React, Figma code (`02a` or `03b`) must be updated.