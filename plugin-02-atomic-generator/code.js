// ============================================================
// Atomic Component Generator — code.js  (v3 — Typography-Bound)
// Source of truth: app/globals.css (@theme) + components/ui/*
//                 plugin-01b injector (text style names)
//
// Figma Plugin API rules:
//  • primaryAxisSizingMode / counterAxisSizingMode → 'AUTO' | 'FIXED' only
//  • ComponentSetNode: never touch layoutWrap/counterAxisSpacing on it
//    → position children manually BEFORE combineAsComponentSet()
//  • combineAsComponentSet() flow:
//      1. createComponent() → in memory (DO NOT appendChild yet)
//      2. combineAsComponentSet(components) → ComponentSet in memory
//      3. figma.currentPage.appendChild(set) → NOW put on page
//    Pre-appending components before combine causes "not a function" errors.
//  • Slot component: getOrCreateSlot() appends it to page (needed for createInstance)
//  • Opacity: setBoundVariableForPaint resets opacity to 1
//    → CAPTURE original opacity → bind → RE-INJECT opacity (spread pattern)
//  • textAutoResize = 'WIDTH_AND_HEIGHT':
//    Text dimensions are driven by content, preventing the text-overflows-frame bug.
//    layoutSizingHorizontal = 'FILL' can be applied on top where needed (Card, Field…).
// ============================================================

// ── 1-A. COLOR TOKEN MAP ──────────────────────────────────────
const TOKENS = {
  'background':           { r: 0.008, g: 0.024, b: 0.090 }, // #020617
  'surface-default':      { r: 0.059, g: 0.090, b: 0.165 }, // #0f172a
  'surface-hover':        { r: 0.118, g: 0.161, b: 0.231 }, // #1e293b
  'input':                { r: 0.118, g: 0.161, b: 0.231 }, // #1e293b
  'foreground-primary':   { r: 0.945, g: 0.961, b: 0.976 }, // #f1f5f9
  'foreground-secondary': { r: 0.886, g: 0.910, b: 0.941 }, // #e2e8f0
  'foreground-tertiary':  { r: 0.796, g: 0.835, b: 0.882 }, // #CBD5E1
  'foreground-strong':    { r: 0.973, g: 0.980, b: 0.988 }, // #f8fafc
  'foreground-muted':     { r: 0.580, g: 0.639, b: 0.722 }, // #94a3b8
  'primary-default':      { r: 0.231, g: 0.510, b: 0.965 }, // #3b82f6
  'brand-deep':           { r: 0.486, g: 0.227, b: 0.929 }, // #7c3aed
  'brand-default':        { r: 0.545, g: 0.361, b: 0.965 }, // #8b5cf6
  'brand-soft':           { r: 0.655, g: 0.545, b: 0.980 }, // #a78bfa
  'brand-faint':          { r: 0.769, g: 0.710, b: 0.992 }, // #c4b5fd
  'positive-default':     { r: 0.063, g: 0.725, b: 0.506 }, // #10b981
  'positive-soft':        { r: 0.204, g: 0.827, b: 0.600 }, // #34d399
  'danger-deep':          { r: 0.863, g: 0.149, b: 0.149 }, // #dc2626
  'danger-default':       { r: 0.937, g: 0.267, b: 0.267 }, // #ef4444
  'danger-soft':          { r: 0.973, g: 0.443, b: 0.443 }, // #f87171
  'caution-default':      { r: 0.961, g: 0.620, b: 0.043 }, // #f59e0b
  'caution-soft':         { r: 0.984, g: 0.749, b: 0.141 }, // #fbbf24
  'border-primary':       { r: 0.278, g: 0.333, b: 0.412 }, // #475569
  'border-secondary':     { r: 0.200, g: 0.255, b: 0.333 }, // #334155
};

const RADIUS = { sm: 6, md: 8, lg: 12, xl: 16 };
const FONT   = 'Inter'; // Fallback font — DS Sync injector may use Geist

// ── 1-B. TYPOGRAPHY TOKEN MAP ─────────────────────────────────
// Mirrors plugin-01b (DS Sync Injector) TOKENS exactly.
// Purpose: two-layer binding strategy
//   Layer 1 (strict)   — textStyleId applied when Figma style exists
//   Layer 2 (fallback) — these values used when DS Sync hasn't been run yet
//
// key         = Figma text style name created by the injector
// size        = px font-size (matches globals.css --text-{key})
// lh          = px line-height (matches --text-{key}--line-height)
// weight      = Figma fontName.style string for Inter fallback
// uppercase   = true → textCase = 'UPPER' (caps tokens only)
//
// Component → token mapping:
//   button / toggle label  → body-sm-medium          (14 / 20px  / Medium)
//   badge label            → label-xs-caps-semibold  (12 / 16px  / SemiBold / UPPER)
//   checkbox / radio label → body-sm-medium
//   switch label           → body-sm-medium
//   card title             → title-sub-semibold      (16 / 24px  / SemiBold)
//   field label            → body-sm-medium
//   alert title            → body-sm-medium
//   avatar initials (md)   → label-xs-medium         (12 / 16px  / Medium)
//   avatar initials (lg)   → body-md-medium          (16 / 24px  / Medium)
const TYPOGRAPHY_MAP = {
  'display-sm-semibold':      { size: 30, lh: 36, weight: 'Semi Bold'  },
  'display-sm-bold':          { size: 30, lh: 36, weight: 'Bold'       },
  'title-page-semibold':      { size: 20, lh: 28, weight: 'Semi Bold'  },
  'title-section-semibold':   { size: 18, lh: 27, weight: 'Semi Bold'  },
  'title-sub-semibold':       { size: 16, lh: 24, weight: 'Semi Bold'  },
  'body-md-regular':          { size: 16, lh: 24, weight: 'Regular'    },
  'body-md-medium':           { size: 16, lh: 24, weight: 'Medium'     },
  'body-sm-medium':           { size: 14, lh: 20, weight: 'Medium'     },
  'body-micro-medium':        { size: 13, lh: 18, weight: 'Medium'     },
  'body-micro-bold':          { size: 13, lh: 18, weight: 'Bold'       },
  'label-xs-medium':          { size: 12, lh: 16, weight: 'Medium'     },
  'label-micro-medium':       { size: 11, lh: 14, weight: 'Medium'     },
  'label-xs-caps-medium':     { size: 12, lh: 16, weight: 'Medium',    uppercase: true },
  'label-xs-caps-semibold':   { size: 12, lh: 16, weight: 'Semi Bold', uppercase: true },
  'body-micro-caps-semibold': { size: 13, lh: 18, weight: 'Semi Bold', uppercase: true },
};

// ── 1-C. LINE-HEIGHT FALLBACK MAP ─────────────────────────────
// Ultimate fallback when neither textStyleId nor TYPOGRAPHY_MAP covers a size.
// Formula: size × line-height-ratio from globals.css @theme, rounded to integer.
const LINE_H = {
  30: 36,  // display-sm:    30 × 1.2
  20: 28,  // title-page:    20 × 1.4
  18: 27,  // title-section: 18 × 1.5
  16: 24,  // title-sub / body-md: 16 × 1.5
  14: 20,  // body-sm:       14 × 1.428 ≈ 20
  13: 18,  // body-micro:    13 × 1.385 ≈ 18
  12: 16,  // label-xs:      12 × 1.333 ≈ 16
  11: 14,  // label-micro:   11 × 1.273 ≈ 14
  10: 14,  // fallback
   9: 12,  // avatar sm initials
};

// ── 2. BASE HELPERS ───────────────────────────────────────────
function tok(name) { return TOKENS[name] || { r: 1, g: 1, b: 1 }; }
function solid(color) { return [{ type: 'SOLID', color }]; }
function solidOpacity(color, opacity) { return [{ type: 'SOLID', color, opacity }]; }

// ── FONT LOADING ──────────────────────────────────────────────
// Loads Inter fallback fonts + any font used by locally registered
// text styles (created by plugin-01b DS Sync Injector, e.g. Geist).
// All calls are guarded — missing fonts are silently skipped.
async function loadFonts() {
  const fallback = [
    { family: FONT, style: 'Regular'   },
    { family: FONT, style: 'Medium'    },
    { family: FONT, style: 'Semi Bold' },
    { family: FONT, style: 'Bold'      },
  ];

  // Collect unique fonts from registered text styles
  let styleFonts = [];
  try {
    styleFonts = figma.getLocalTextStyles()
      .map(s => s.fontName)
      .filter(Boolean);
  } catch (_) {}

  const all = [...fallback, ...styleFonts];
  const unique = [...new Map(all.map(f => [`${f.family}|${f.style}`, f])).values()];
  await Promise.all(unique.map(f => figma.loadFontAsync(f).catch(() => {})));
}

// ── TEXT STYLE LOOKUP ─────────────────────────────────────────
// Returns the Figma TextStyle whose name matches `key`, or null.
// Styles are created by plugin-01b; if DS Sync hasn't been run,
// makeText() falls back gracefully to TYPOGRAPHY_MAP values.
function findTextStyle(key) {
  try {
    return figma.getLocalTextStyles().find(s => s.name === key) || null;
  } catch (_) { return null; }
}

// ── MAKE TEXT NODE ────────────────────────────────────────────
// Creates a text node with strict typography token binding.
//
// Binding priority:
//   1. Figma text style (textStyleId) — when DS Sync has been run
//   2. TYPOGRAPHY_MAP fallback values — per-token explicit metrics
//   3. Explicit size / weight / lineH params — legacy/override path
//
// textAutoResize = 'WIDTH_AND_HEIGHT':
//   Both dimensions adapt to content. Prevents the "text overflows frame"
//   rendering defect in FIXED-height Auto Layout containers (Toggle, Button…).
//   For wrapping text, apply layoutSizingHorizontal = 'FILL' AFTER appendChild.
function makeText(chars, {
  size     = 14,
  weight   = 'Medium',
  colorTok = 'foreground-primary',
  lineH,
  uppercase     = false,
  typographyKey = null,
} = {}) {
  const t = figma.createText();

  if (typographyKey) {
    const style  = findTextStyle(typographyKey);
    const mapDef = TYPOGRAPHY_MAP[typographyKey];

    // ── Step 1: Set fontName before characters (Figma API requirement) ────
    if (style) {
      try { t.fontName = style.fontName; }
      catch (_) { t.fontName = { family: FONT, style: mapDef?.weight ?? weight }; }
    } else {
      t.fontName = { family: FONT, style: mapDef?.weight ?? weight };
    }

    // ── Step 2: Set text content ──────────────────────────────────────────
    t.characters = chars;

    // ── Step 3: Apply text style or TYPOGRAPHY_MAP metrics ───────────────
    if (style) {
      // Strict binding: textStyleId inherits size / lh / weight / letterSpacing
      try { t.textStyleId = style.id; } catch (_) {}
    } else if (mapDef) {
      // Fallback: explicit metrics from TYPOGRAPHY_MAP
      t.fontSize   = mapDef.size;
      t.lineHeight = { value: mapDef.lh, unit: 'PIXELS' };
    } else {
      t.fontSize   = size;
      t.lineHeight = { value: lineH ?? (LINE_H[size] ?? Math.round(size * 1.4)), unit: 'PIXELS' };
    }

    // ── Step 4: Text case — uppercase AFTER style (overrides style's textCase) ──
    if (uppercase || mapDef?.uppercase) {
      try { t.textCase = 'UPPER'; } catch (_) {}
    }

  } else {
    // Legacy / explicit path — no token binding
    t.fontName   = { family: FONT, style: weight };
    t.characters = chars;
    t.fontSize   = size;
    t.lineHeight = { value: lineH ?? (LINE_H[size] ?? Math.round(size * 1.4)), unit: 'PIXELS' };
    if (uppercase) t.textCase = 'UPPER';
  }

  // Color fill (always explicit — text styles don't carry color)
  t.fills = solid(tok(colorTok));

  // WIDTH_AND_HEIGHT: text determines its own size from content.
  // Eliminates vertical / horizontal overflow in Auto Layout containers.
  // Post-append, set layoutSizingHorizontal = 'FILL' where spanning is needed.
  t.textAutoResize = 'WIDTH_AND_HEIGHT';

  return t;
}

function viewportCenter() {
  try { const b = figma.viewport.bounds; return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
  catch (_) { return { x: 0, y: 0 }; }
}

// ── 3. POSITIONING ────────────────────────────────────────────
// Stacks new components below existing canvas content, never overlapping.
function getNextPosition(width, height) {
  const visible = figma.currentPage.children.filter(n => n.x > -1000 && n.y > -1000);
  if (visible.length === 0) {
    const vc = viewportCenter();
    return { x: Math.round(vc.x - width / 2), y: Math.round(vc.y - height / 2) };
  }
  let maxBottom = -Infinity, refX = 0;
  for (const n of visible) {
    const b = n.y + (n.height || 0);
    if (b > maxBottom) { maxBottom = b; refX = n.x; }
  }
  return { x: refX, y: maxBottom + 80 };
}

// ── 4. VARIABLE BINDING ───────────────────────────────────────
// setBoundVariableForPaint resets opacity to 1.
// Pattern: CAPTURE opacity → BIND → RE-INJECT opacity (spread).
function _findVar(vars, tokenName) {
  if (!vars || vars.length === 0) return null;
  const dash  = tokenName;
  const slash = tokenName.replace(/-/g, '/');
  const exact = vars.find(v => v.name === dash || v.name === slash);
  if (exact) return exact;
  return vars.find(v => v.name.endsWith('/' + dash) || v.name.endsWith('/' + slash));
}

function bindFill(node, tokenName, vars) {
  try {
    if (!node.fills || node.fills.length === 0) return;
    const v = _findVar(vars, tokenName);
    if (!v) return;
    const paint = node.fills[0];
    if (paint.type !== 'SOLID') return;
    const originalOpacity = typeof paint.opacity === 'number' ? paint.opacity : 1;
    const boundPaint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
    node.fills = [boundPaint];
    const newFills = JSON.parse(JSON.stringify(node.fills));
    newFills[0].opacity = originalOpacity;
    node.fills = newFills;
  } catch (_) {}
}

function bindStroke(node, tokenName, vars) {
  try {
    if (!node.strokes || node.strokes.length === 0) return;
    const v = _findVar(vars, tokenName);
    if (!v) return;
    const paint = node.strokes[0];
    if (paint.type !== 'SOLID') return;
    const originalOpacity = typeof paint.opacity === 'number' ? paint.opacity : 1;
    const boundPaint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
    node.strokes = [boundPaint];
    const newStrokes = JSON.parse(JSON.stringify(node.strokes));
    newStrokes[0].opacity = originalOpacity;
    node.strokes = newStrokes;
  } catch (_) {}
}

async function loadColorVars() {
  try { return await figma.variables.getLocalVariablesAsync('COLOR'); }
  catch (_) { return []; }
}

// ── 5. COMBINE HELPER ─────────────────────────────────────────
function combineAndPlace(components, name) {
  if (typeof figma.combineAsComponentSet === 'function') {
    const set = figma.combineAsComponentSet(components);
    set.name  = name;
    figma.currentPage.appendChild(set);
    const pos = getNextPosition(set.width, set.height);
    set.x = pos.x;
    set.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([set]);
    return set;
  }

  let bboxW = 0, bboxH = 0;
  for (const comp of components) {
    bboxW = Math.max(bboxW, comp.x + (comp.width  || 100));
    bboxH = Math.max(bboxH, comp.y + (comp.height || 40));
  }
  const pos = getNextPosition(bboxW, bboxH);
  for (const comp of components) {
    comp.x += pos.x;
    comp.y += pos.y;
    figma.currentPage.appendChild(comp);
  }
  try {
    const group = figma.group(components, figma.currentPage);
    group.name  = name + ' (group)';
    figma.viewport.scrollAndZoomIntoView([group]);
    figma.notify('⚠️ ' + name + ': Figma 업데이트 후 Variants로 변환됩니다', { timeout: 5000 });
    return group;
  } catch (_) {
    figma.viewport.scrollAndZoomIntoView(components);
    figma.notify('⚠️ ' + name + ': 개별 컴포넌트로 생성 (Figma 업데이트 권장)', { timeout: 5000 });
    return components[0];
  }
}

// ── 6. SLOT SYSTEM ────────────────────────────────────────────
async function getOrCreateSlot() {
  let comp = figma.currentPage.findOne(
    n => n.type === 'COMPONENT' && n.name === '_Internal/Slot'
  );
  if (!comp || comp.type !== 'COMPONENT') {
    comp = figma.createComponent();
    comp.name  = '_Internal/Slot';
    comp.resize(20, 20);
    comp.layoutMode            = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'CENTER';
    comp.counterAxisAlignItems = 'CENTER';
    comp.primaryAxisSizingMode = 'FIXED';
    comp.counterAxisSizingMode = 'FIXED';
    figma.currentPage.appendChild(comp);
    comp.x = -9999; comp.y = -9999;
  }
  comp.fills        = [];
  comp.cornerRadius = 2;
  comp.strokes      = solid(tok('border-primary'));
  comp.strokeWeight = 1.5;
  comp.strokeAlign  = 'INSIDE';
  comp.dashPattern  = [3, 3];
  return comp;
}

function attachSlot(btnComp, slotComp, defaultVisible) {
  try {
    const slotInst = slotComp.createInstance();
    slotInst.name  = '↳ Icon Placeholder';
    btnComp.insertChild(0, slotInst);
    if (typeof btnComp.addComponentProperty !== 'function') {
      slotInst.visible = !!defaultVisible; return;
    }
    const showKey = btnComp.addComponentProperty('Show Icon', 'BOOLEAN', !!defaultVisible);
    slotInst.componentPropertyReferences = { visible: showKey };
    try {
      const swapKey = btnComp.addComponentProperty('Icon Placeholder', 'INSTANCE_SWAP', slotComp.id);
      slotInst.componentPropertyReferences = { visible: showKey, mainComponent: swapKey };
    } catch (_) {}
  } catch (e) { console.warn('[Slot]', e.message || e); }
}

async function generateSlotComponent() {
  const slot = await getOrCreateSlot();
  const vc = viewportCenter();
  slot.x = Math.round(vc.x - 10);
  slot.y = Math.round(vc.y - 10);
  figma.viewport.scrollAndZoomIntoView([slot]);
  figma.notify('✅ _Internal/Slot 생성 완료');
}

// ── 7. BUTTON SET ─────────────────────────────────────────────
// Layout: HORIZONTAL Auto Layout · Hugs content (AUTO) × Fixed height
// Text: body-sm-medium (14/20px Medium) bound via textStyleId
const BTN_VARIANTS = {
  default:     { bg: 'primary-default', text: 'foreground-strong',    border: null },
  destructive: { bg: 'danger-soft',     text: 'foreground-strong',    border: null },
  outline:     { bg: null,              text: 'foreground-primary',   border: 'border-primary' },
  secondary:   { bg: 'surface-hover',   text: 'foreground-secondary', border: null },
  ghost:       { bg: null,              text: 'foreground-primary',   border: null },
  link:        { bg: null,              text: 'primary-default',      border: null, underline: true },
};

// typoKey replaces fs: 14 — font metrics flow from the text style
const BTN_SIZES = {
  default:   { h: 36, pl: 16, pr: 16, gap: 8,  typoKey: 'body-sm-medium' },
  sm:        { h: 32, pl: 12, pr: 12, gap: 6,  typoKey: 'body-sm-medium' },
  lg:        { h: 40, pl: 24, pr: 24, gap: 8,  typoKey: 'body-sm-medium' },
  icon:      { h: 36, pl: 0,  pr: 0,  gap: 0,  fixed: 36 },
  'icon-sm': { h: 32, pl: 0,  pr: 0,  gap: 0,  fixed: 32 },
  'icon-lg': { h: 40, pl: 0,  pr: 0,  gap: 0,  fixed: 40 },
};

async function generateButtonSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    figma.notify('버튼 생성 중…', { timeout: 3000 });
    step = 'vars';  const vars = await loadColorVars();
    step = 'slot';  const slotComp = await getOrCreateSlot();

    const components  = [];
    const varEntries  = Object.entries(BTN_VARIANTS);
    const sizeEntries = Object.entries(BTN_SIZES);

    for (const [vName, vConf] of varEntries) {
      for (const [sName, sConf] of sizeEntries) {
        step = `comp[${vName}/${sName}]`;
        const comp   = figma.createComponent();
        comp.name    = `variant=${vName}, size=${sName}`;
        const isIcon = !!sConf.fixed;

        comp.layoutMode            = 'HORIZONTAL';
        comp.primaryAxisAlignItems = 'CENTER';
        comp.counterAxisAlignItems = 'CENTER';
        comp.paddingLeft  = sConf.pl; comp.paddingRight  = sConf.pr;
        comp.paddingTop   = 0;        comp.paddingBottom = 0;
        comp.itemSpacing  = sConf.gap;
        comp.cornerRadius = RADIUS.md;

        if (isIcon) {
          comp.resize(sConf.fixed, sConf.h);
          comp.primaryAxisSizingMode = 'FIXED';
          comp.counterAxisSizingMode = 'FIXED';
        } else {
          comp.resize(10, sConf.h);
          comp.primaryAxisSizingMode = 'AUTO';   // Hugs text width
          comp.counterAxisSizingMode = 'FIXED';  // Height locked
        }

        if (vConf.bg) { comp.fills = solid(tok(vConf.bg)); bindFill(comp, vConf.bg, vars); }
        else { comp.fills = []; }

        if (vConf.border) {
          comp.strokes = solid(tok(vConf.border)); comp.strokeWeight = 1; comp.strokeAlign = 'INSIDE';
          bindStroke(comp, vConf.border, vars);
        } else { comp.strokes = []; }

        if (!isIcon) {
          // body-sm-medium: 14px / 20px lh / Medium — strict textStyleId binding
          const lbl = makeText('Button', { colorTok: vConf.text, typographyKey: sConf.typoKey });
          if (vConf.underline) lbl.textDecoration = 'UNDERLINE';
          bindFill(lbl, vConf.text, vars);
          comp.appendChild(lbl);
        }

        step = `slot[${vName}/${sName}]`;
        attachSlot(comp, slotComp, isIcon);
        components.push(comp);
      }
    }

    step = 'position';
    let yOff = 0;
    for (let vi = 0; vi < varEntries.length; vi++) {
      let xOff = 0, rowH = 0;
      for (let si = 0; si < sizeEntries.length; si++) {
        const c = components[vi * sizeEntries.length + si];
        c.x = xOff; c.y = yOff;
        xOff += (c.width || 120) + 24;
        rowH  = Math.max(rowH, c.height || 36);
      }
      yOff += rowH + 16;
    }

    step = 'combine';
    combineAndPlace(components, 'Button');
    figma.notify('✅ Button 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Button[${step}]: ${msg}`, { error: true });
    console.error(`[Button][${step}]`, err);
  }
}

// ── 8. BADGE SET ──────────────────────────────────────────────
// Semantic naming: danger / positive / caution
// → Figma property: variant=danger | positive | caution
//
// positive variant FIXED: now uses positive-default/positive-soft (green)
//   (was incorrectly using brand-default/brand-soft — purple)
//
// Text: label-xs-caps-semibold (12px / 16px lh / SemiBold / UPPERCASE)
//   — strict textStyleId binding; falls back to TYPOGRAPHY_MAP metrics
const BADGE_VARIANTS = {
  danger:   { bgColor: 'danger-default',    bgOpacity: 0.15, textColor: 'danger-soft',    label: 'Danger'   },
  positive: { bgColor: 'positive-default',  bgOpacity: 0.15, textColor: 'positive-soft',  label: 'Positive' },
  caution:  { bgColor: 'caution-default',   bgOpacity: 0.15, textColor: 'caution-soft',   label: 'Caution'  },
};

async function generateBadgeSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(BADGE_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent();
      comp.name  = `variant=${vName}`;

      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';   // Hugs text width
      comp.counterAxisSizingMode = 'AUTO';   // Hugs text height + paddingTop/Bottom
      comp.paddingLeft = comp.paddingRight = 8;
      comp.paddingTop  = comp.paddingBottom = 2;
      comp.itemSpacing  = 4;
      comp.cornerRadius = 9999; // rounded-full pill
      comp.strokes      = [];

      // 0.15 opacity background — bindFill re-injects opacity via JSON-clone pattern
      comp.fills = solidOpacity(tok(vConf.bgColor), vConf.bgOpacity);
      bindFill(comp, vConf.bgColor, vars);

      step = `text[${vName}]`;
      // label-xs-caps-semibold: 12px / 16px lh / SemiBold / UPPERCASE
      // textCase = 'UPPER' is set by the style; makeText also applies it via mapDef.uppercase
      const lbl = makeText(vConf.label, {
        colorTok:     vConf.textColor,
        typographyKey: 'label-xs-caps-semibold',
      });
      bindFill(lbl, vConf.textColor, vars);
      comp.appendChild(lbl);
      components.push(comp);
    }

    step = 'position';
    let xOff = 0;
    for (const comp of components) {
      comp.x = xOff; comp.y = 0;
      xOff += (comp.width || 60) + 16;
    }

    step = 'combine';
    combineAndPlace(components, 'Badge');
    figma.notify('✅ Badge 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Badge[${step}]: ${msg}`, { error: true });
    console.error(`[Badge][${step}]`, err);
  }
}

// ── 9. CHECKBOX SET ───────────────────────────────────────────
const CHECKBOX_VARIANTS = {
  unchecked: { bg: 'input',           border: 'border-secondary',   hasCheck: false },
  checked:   { bg: 'primary-default', border: 'primary-default',    hasCheck: true  },
  disabled:  { bg: 'surface-hover',   border: 'foreground-tertiary', hasCheck: false },
};

async function generateCheckboxSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(CHECKBOX_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent();
      comp.name  = `state=${vName}`;
      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.itemSpacing = 8;
      comp.fills       = [];

      // 16×16 checkbox box — FIXED size, independent of text
      const box = figma.createFrame();
      box.name         = 'box';
      box.resize(16, 16);
      box.layoutMode   = 'VERTICAL';
      box.primaryAxisAlignItems  = 'CENTER';
      box.counterAxisAlignItems  = 'CENTER';
      box.primaryAxisSizingMode  = 'FIXED';
      box.counterAxisSizingMode  = 'FIXED';
      box.cornerRadius = 4;
      box.fills        = solid(tok(vConf.bg));
      bindFill(box, vConf.bg, vars);
      box.strokes      = solid(tok(vConf.border));
      box.strokeWeight = 1.5;
      box.strokeAlign  = 'INSIDE';
      bindStroke(box, vConf.border, vars);

      if (vConf.hasCheck) {
        // Checkmark — small glyph, no typography token match, explicit sizing
        const check = makeText('✓', { size: 10, weight: 'Medium', colorTok: 'foreground-strong' });
        check.textAlignHorizontal = 'CENTER';
        bindFill(check, 'foreground-strong', vars);
        box.appendChild(check);
      }

      // body-sm-medium: 14px / 20px lh / Medium
      const label = makeText('Checkbox', { colorTok: 'foreground-primary', typographyKey: 'body-sm-medium' });
      bindFill(label, 'foreground-primary', vars);
      comp.appendChild(box);
      comp.appendChild(label);
      components.push(comp);
    }

    step = 'position';
    let xOff = 0;
    for (const c of components) { c.x = xOff; c.y = 0; xOff += (c.width || 120) + 16; }

    step = 'combine';
    combineAndPlace(components, 'Checkbox');
    figma.notify('✅ Checkbox 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Checkbox[${step}]: ${msg}`, { error: true });
    console.error(`[Checkbox][${step}]`, err);
  }
}

// ── 10. RADIO SET ─────────────────────────────────────────────
const RADIO_VARIANTS = {
  unchecked: { bg: 'input',           border: 'border-secondary',    hasDot: false },
  checked:   { bg: 'primary-default', border: 'primary-default',     hasDot: true  },
  disabled:  { bg: 'surface-hover',   border: 'foreground-tertiary', hasDot: false },
};

async function generateRadioSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(RADIO_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent();
      comp.name  = `state=${vName}`;
      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.itemSpacing = 8;
      comp.fills       = [];

      // 16×16 circle — FIXED size
      const circle = figma.createFrame();
      circle.name         = 'radio';
      circle.resize(16, 16);
      circle.layoutMode   = 'NONE';
      circle.cornerRadius = 8;
      circle.fills        = solid(tok(vConf.bg));
      bindFill(circle, vConf.bg, vars);
      circle.strokes      = solid(tok(vConf.border));
      circle.strokeWeight = 1.5;
      circle.strokeAlign  = 'INSIDE';
      bindStroke(circle, vConf.border, vars);

      if (vConf.hasDot) {
        const dot = figma.createEllipse();
        dot.resize(6, 6);
        dot.fills = solid(tok('foreground-strong'));
        bindFill(dot, 'foreground-strong', vars);
        dot.x = 5; dot.y = 5;
        circle.appendChild(dot);
      }

      const label = makeText('Radio option', { colorTok: 'foreground-primary', typographyKey: 'body-sm-medium' });
      bindFill(label, 'foreground-primary', vars);
      comp.appendChild(circle);
      comp.appendChild(label);
      components.push(comp);
    }

    step = 'position';
    let xOff = 0;
    for (const c of components) { c.x = xOff; c.y = 0; xOff += (c.width || 120) + 16; }

    step = 'combine';
    combineAndPlace(components, 'Radio');
    figma.notify('✅ Radio 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Radio[${step}]: ${msg}`, { error: true });
    console.error(`[Radio][${step}]`, err);
  }
}

// ── 11. SWITCH SET ────────────────────────────────────────────
const SWITCH_VARIANTS = {
  off:      { trackBg: 'border-secondary', thumbX: 1  },
  on:       { trackBg: 'primary-default',  thumbX: 14 },
  disabled: { trackBg: 'surface-hover',    thumbX: 1  },
};

async function generateSwitchSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(SWITCH_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent();
      comp.name  = `state=${vName}`;
      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.itemSpacing = 8;
      comp.fills       = [];

      // Track: 32×18 — FIXED size
      const track = figma.createFrame();
      track.name         = 'track';
      track.resize(32, 18);
      track.layoutMode   = 'NONE';
      track.cornerRadius = 9;
      track.fills        = solid(tok(vConf.trackBg));
      bindFill(track, vConf.trackBg, vars);
      track.strokes      = [];

      // Thumb: 16×16 — FIXED size, positioned inside track
      const thumb = figma.createFrame();
      thumb.name         = 'thumb';
      thumb.resize(16, 16);
      thumb.layoutMode   = 'NONE';
      thumb.cornerRadius = 8;
      thumb.fills        = solid(tok('foreground-strong'));
      bindFill(thumb, 'foreground-strong', vars);
      thumb.x = vConf.thumbX;
      thumb.y = 1; // (18 - 16) / 2 = 1
      track.appendChild(thumb);

      const label = makeText('Switch', { colorTok: 'foreground-primary', typographyKey: 'body-sm-medium' });
      bindFill(label, 'foreground-primary', vars);
      comp.appendChild(track);
      comp.appendChild(label);
      components.push(comp);
    }

    step = 'position';
    let xOff = 0;
    for (const c of components) { c.x = xOff; c.y = 0; xOff += (c.width || 120) + 16; }

    step = 'combine';
    combineAndPlace(components, 'Switch');
    figma.notify('✅ Switch 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Switch[${step}]: ${msg}`, { error: true });
    console.error(`[Switch][${step}]`, err);
  }
}

// ── 12. AVATAR SET ────────────────────────────────────────────
const AVATAR_VARIANTS = {
  sm:      { size: 24, typoKey: null           },  // 9px — no token match, explicit
  default: { size: 32, typoKey: 'label-xs-medium' }, // 12px Medium
  lg:      { size: 48, typoKey: 'body-md-medium'  }, // 16px Medium
};

async function generateAvatarSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(AVATAR_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent();
      comp.name  = `size=${vName}`;
      comp.layoutMode            = 'VERTICAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'FIXED';
      comp.counterAxisSizingMode = 'FIXED';
      comp.resize(vConf.size, vConf.size);
      comp.cornerRadius = vConf.size / 2;
      comp.clipsContent = true;
      comp.fills        = solid(tok('surface-hover'));
      bindFill(comp, 'surface-hover', vars);

      // Initials placeholder — token key where available, explicit for sm
      const initials = vConf.typoKey
        ? makeText('JD', { colorTok: 'foreground-muted', typographyKey: vConf.typoKey })
        : makeText('JD', { size: 9, weight: 'Semi Bold', colorTok: 'foreground-muted' });
      bindFill(initials, 'foreground-muted', vars);
      comp.appendChild(initials);
      components.push(comp);
    }

    step = 'position';
    let xOff = 0;
    for (const c of components) { c.x = xOff; c.y = 0; xOff += (c.width || 48) + 16; }

    step = 'combine';
    combineAndPlace(components, 'Avatar');
    figma.notify('✅ Avatar 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Avatar[${step}]: ${msg}`, { error: true });
    console.error(`[Avatar][${step}]`, err);
  }
}

// ── 13. SEPARATOR SET ─────────────────────────────────────────
const SEPARATOR_VARIANTS = {
  horizontal: { w: 200, h: 1 },
  vertical:   { w: 1,   h: 48 },
};

async function generateSeparatorSet() {
  let step = 'init';
  try {
    step = 'vars'; const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(SEPARATOR_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent();
      comp.name  = `orientation=${vName}`;
      comp.resize(vConf.w, vConf.h);
      comp.primaryAxisSizingMode = 'FIXED';
      comp.counterAxisSizingMode = 'FIXED';
      comp.fills  = solid(tok('border-secondary'));
      bindFill(comp, 'border-secondary', vars);
      comp.strokes = [];
      components.push(comp);
    }

    step = 'position';
    let xOff = 0;
    for (const c of components) { c.x = xOff; c.y = 0; xOff += (c.width || 200) + 24; }

    step = 'combine';
    combineAndPlace(components, 'Separator');
    figma.notify('✅ Separator 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Separator[${step}]: ${msg}`, { error: true });
    console.error(`[Separator][${step}]`, err);
  }
}

// ── 14. INPUT ─────────────────────────────────────────────────
async function generateInput() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    step = 'comp';
    const comp = figma.createComponent();
    comp.name  = 'Input';
    comp.layoutMode            = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'CENTER';
    comp.counterAxisAlignItems = 'CENTER';
    comp.resize(280, 36);
    comp.primaryAxisSizingMode = 'FIXED';
    comp.counterAxisSizingMode = 'FIXED';
    comp.paddingLeft = comp.paddingRight = 12;
    comp.paddingTop  = comp.paddingBottom = 0;
    comp.itemSpacing  = 8;
    comp.cornerRadius = RADIUS.md;
    comp.fills        = solid(tok('input'));
    bindFill(comp, 'input', vars);
    comp.strokes      = solid(tok('border-secondary'));
    comp.strokeWeight = 1; comp.strokeAlign = 'INSIDE';
    bindStroke(comp, 'border-secondary', vars);

    step = 'text';
    // Placeholder: 14px Regular — no dedicated token (body-sm is Medium-only).
    // Explicit params used; textAutoResize = 'WIDTH_AND_HEIGHT' still applied.
    const ph = makeText('Placeholder text', { size: 14, weight: 'Regular', colorTok: 'foreground-muted' });
    bindFill(ph, 'foreground-muted', vars);
    comp.appendChild(ph);
    // FILL: placeholder spans input width cleanly
    try { ph.layoutSizingHorizontal = 'FILL'; } catch (_) {}

    step = 'place';
    const pos = getNextPosition(comp.width, comp.height);
    figma.currentPage.appendChild(comp);
    comp.x = pos.x; comp.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([comp]);
    figma.notify('✅ Input 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Input[${step}]: ${msg}`, { error: true });
    console.error(`[Input][${step}]`, err);
  }
}

// ── 15. CARD ──────────────────────────────────────────────────
async function generateCard() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    step = 'comp';
    const comp = figma.createComponent();
    comp.name  = 'Card';
    comp.layoutMode            = 'VERTICAL';
    comp.primaryAxisAlignItems = 'MIN';
    comp.counterAxisAlignItems = 'STRETCH';
    comp.resize(320, 10);
    comp.primaryAxisSizingMode = 'AUTO';
    comp.counterAxisSizingMode = 'FIXED';
    comp.itemSpacing   = 0;
    comp.cornerRadius  = RADIUS.xl;
    comp.clipsContent  = true;
    comp.fills         = solid(tok('surface-default'));
    bindFill(comp, 'surface-default', vars);

    function section(name, dir) {
      const f = figma.createFrame();
      f.name  = name; f.layoutMode = dir || 'VERTICAL';
      f.primaryAxisAlignItems  = 'MIN'; f.counterAxisAlignItems = 'MIN';
      f.primaryAxisSizingMode  = 'AUTO'; f.counterAxisSizingMode = 'FIXED';
      f.fills = []; return f;
    }

    step = 'header';
    const header = section('CardHeader');
    header.paddingLeft = header.paddingRight = 24;
    header.paddingTop = 24; header.paddingBottom = 0; header.itemSpacing = 6;

    // title-sub-semibold: 16px / 24px lh / SemiBold
    const cardTitle = makeText('Card Title', {
      colorTok: 'foreground-primary',
      typographyKey: 'title-sub-semibold',
    });
    bindFill(cardTitle, 'foreground-primary', vars);

    // Card description: 14px Regular — no token match; explicit fallback
    const cardDesc = makeText('Card description goes here', {
      size: 14, weight: 'Regular', colorTok: 'foreground-muted',
    });
    bindFill(cardDesc, 'foreground-muted', vars);
    header.appendChild(cardTitle); header.appendChild(cardDesc);
    try { cardTitle.layoutSizingHorizontal = 'FILL'; } catch (_) {}
    try { cardDesc.layoutSizingHorizontal  = 'FILL'; } catch (_) {}

    step = 'content';
    const content = section('CardContent');
    content.paddingLeft = content.paddingRight = 24;
    content.paddingTop = 24; content.paddingBottom = 0;
    const contentText = makeText('Content area', {
      colorTok: 'foreground-secondary',
      typographyKey: 'body-sm-medium',
    });
    bindFill(contentText, 'foreground-secondary', vars);
    content.appendChild(contentText);
    try { contentText.layoutSizingHorizontal = 'FILL'; } catch (_) {}

    step = 'footer';
    const footer = section('CardFooter', 'HORIZONTAL');
    footer.counterAxisAlignItems = 'CENTER';
    footer.paddingLeft = footer.paddingRight = 24;
    footer.paddingTop = 16; footer.paddingBottom = 24; footer.itemSpacing = 8;
    const footerText = makeText('Footer', {
      colorTok: 'foreground-muted',
      typographyKey: 'body-sm-medium',
    });
    bindFill(footerText, 'foreground-muted', vars);
    footer.appendChild(footerText);
    try { footerText.layoutSizingHorizontal = 'FILL'; } catch (_) {}

    comp.appendChild(header); comp.appendChild(content); comp.appendChild(footer);
    try { header.layoutSizingHorizontal  = 'FILL'; } catch (_) {}
    try { content.layoutSizingHorizontal = 'FILL'; } catch (_) {}
    try { footer.layoutSizingHorizontal  = 'FILL'; } catch (_) {}

    step = 'place';
    const pos = getNextPosition(comp.width, comp.height);
    figma.currentPage.appendChild(comp);
    comp.x = pos.x; comp.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([comp]);
    figma.notify('✅ Card 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Card[${step}]: ${msg}`, { error: true });
    console.error(`[Card][${step}]`, err);
  }
}

// ── 16. BUTTON GROUP (Molecule) ───────────────────────────────
async function generateButtonGroup() {
  let step = 'init';
  try {
    step = 'selection';
    const sel = figma.currentPage.selection;
    if (sel.length === 0) { figma.notify('❌ 개별 Button 컴포넌트를 선택하고 실행해주세요', { error: true }); return; }
    const source = sel[0];
    if (source.type === 'COMPONENT_SET') { figma.notify('❌ ComponentSet 말고 개별 컴포넌트를 선택하세요', { error: true }); return; }

    const baseRadius = (typeof source.cornerRadius === 'number') ? source.cornerRadius : RADIUS.md;

    step = 'frame';
    const frame = figma.createFrame();
    frame.name = 'ButtonGroup';
    frame.layoutMode = 'HORIZONTAL'; frame.primaryAxisAlignItems = 'CENTER';
    frame.counterAxisAlignItems = 'STRETCH'; frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO'; frame.itemSpacing = 0; frame.fills = [];
    figma.currentPage.appendChild(frame);

    step = 'children';
    const COUNT = 3;
    for (let i = 0; i < COUNT; i++) {
      const node = (source.type === 'COMPONENT' || source.type === 'INSTANCE') ? source.createInstance() : source.clone();
      if (i === 0)            { node.topLeftRadius = baseRadius; node.bottomLeftRadius = baseRadius; node.topRightRadius = 0; node.bottomRightRadius = 0; }
      else if (i === COUNT-1) { node.topLeftRadius = 0; node.bottomLeftRadius = 0; node.topRightRadius = baseRadius; node.bottomRightRadius = baseRadius; }
      else                    { node.topLeftRadius = node.bottomLeftRadius = node.topRightRadius = node.bottomRightRadius = 0; }
      frame.appendChild(node);
    }

    step = 'convert';
    const comp = figma.createComponentFromNode(frame);
    comp.name  = 'ButtonGroup / horizontal';
    comp.x     = source.x; comp.y = source.y + (source.height || 40) + 48;
    figma.viewport.scrollAndZoomIntoView([comp]);
    figma.notify('✅ ButtonGroup 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ ButtonGroup[${step}]: ${msg}`, { error: true });
    console.error(`[ButtonGroup][${step}]`, err);
  }
}

// ── 17. FIELD (Molecule) ──────────────────────────────────────
async function generateField() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    step = 'comp';
    const comp = figma.createComponent();
    comp.name  = 'Field / vertical';
    comp.layoutMode            = 'VERTICAL';
    comp.primaryAxisAlignItems = 'MIN';
    comp.counterAxisAlignItems = 'STRETCH';
    comp.resize(280, 10);
    comp.primaryAxisSizingMode = 'AUTO';
    comp.counterAxisSizingMode = 'FIXED';
    comp.itemSpacing = 6; comp.fills = [];

    // Field label: body-sm-medium (14px / 20px lh / Medium)
    const lbl = makeText('Label', { colorTok: 'foreground-primary', typographyKey: 'body-sm-medium' });
    bindFill(lbl, 'foreground-primary', vars);
    comp.appendChild(lbl);
    try { lbl.layoutSizingHorizontal = 'FILL'; } catch (_) {}

    step = 'input';
    const inp = figma.createFrame();
    inp.name = 'Input'; inp.layoutMode = 'HORIZONTAL';
    inp.primaryAxisAlignItems = 'CENTER'; inp.counterAxisAlignItems = 'CENTER';
    inp.resize(280, 36); inp.primaryAxisSizingMode = 'FIXED'; inp.counterAxisSizingMode = 'FIXED';
    try { inp.layoutSizingHorizontal = 'FILL'; } catch (_) {}
    inp.paddingLeft = inp.paddingRight = 12; inp.paddingTop = inp.paddingBottom = 0;
    inp.itemSpacing = 8; inp.cornerRadius = RADIUS.md;
    inp.fills   = solid(tok('input')); bindFill(inp, 'input', vars);
    inp.strokes = solid(tok('border-secondary')); inp.strokeWeight = 1; inp.strokeAlign = 'INSIDE';
    bindStroke(inp, 'border-secondary', vars);

    // Placeholder: 14px Regular — explicit fallback (no body-sm-regular token)
    const ph = makeText('Placeholder', { size: 14, weight: 'Regular', colorTok: 'foreground-muted' });
    bindFill(ph, 'foreground-muted', vars);
    inp.appendChild(ph);
    try { ph.layoutSizingHorizontal = 'FILL'; } catch (_) {}

    // Helper text: label-xs-medium (12px / 16px lh / Medium)
    const helper = makeText('Helper text', { colorTok: 'foreground-muted', typographyKey: 'label-xs-medium' });
    bindFill(helper, 'foreground-muted', vars);
    comp.appendChild(inp); comp.appendChild(helper);
    try { helper.layoutSizingHorizontal = 'FILL'; } catch (_) {}

    step = 'place';
    const pos = getNextPosition(comp.width, comp.height);
    figma.currentPage.appendChild(comp);
    comp.x = pos.x; comp.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([comp]);
    figma.notify('✅ Field 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Field[${step}]: ${msg}`, { error: true });
    console.error(`[Field][${step}]`, err);
  }
}

// ── 18. TOGGLE SET ────────────────────────────────────────────
// Mirrors: components/ui/toggle.tsx — variant × state × size = 18 components
//
// OVERFLOW FIX (v3):
//   Root cause: text node width was set to the natural single-line value
//   ('HEIGHT' mode) while the parent frame had counterAxisSizingMode = 'FIXED'.
//   In some Figma versions this creates a layout conflict that renders text
//   outside the frame boundary.
//
//   Resolution:
//   1. makeText now sets textAutoResize = 'WIDTH_AND_HEIGHT' — text node
//      dimensions are always driven by content, never by frame constraints.
//   2. typoKey references body-sm-medium (14px / lh 20px). With the frame
//      height at 32–40px, the text sits at (h - 20) / 2 = 6–10px from top/bottom.
//      counterAxisAlignItems = 'CENTER' distributes this gap symmetrically.
//   3. paddingTop = paddingBottom = 0 keeps the centering governed purely by
//      Auto Layout alignment, not by manual padding.
//
// Semantic naming (Figma Properties):
//   variant  = default | outline
//   state    = off | on | disabled
//   size     = default | sm | lg
//
// default/off  → ghost: no bg, no border
// default/on   → soft brand fill (brand-default @ 15%) + brand border (@ 25%)
// outline/off  → border-secondary visible
// outline/on   → solid brand fill, foreground-strong text
// any/disabled → comp.opacity = 0.5 (mirrors disabled:opacity-50)

const TOGGLE_VARIANT_STATES = {
  default: {
    off:      { bg: null,            bgOpacity: 1,    text: 'foreground-secondary', stroke: null,              strokeOpacity: 1    },
    on:       { bg: 'brand-default', bgOpacity: 0.15, text: 'brand-soft',           stroke: 'brand-default',   strokeOpacity: 0.25 },
    disabled: { bg: null,            bgOpacity: 1,    text: 'foreground-muted',     stroke: null,              strokeOpacity: 1    },
  },
  outline: {
    off:      { bg: null,            bgOpacity: 1,    text: 'foreground-secondary', stroke: 'border-secondary', strokeOpacity: 1    },
    on:       { bg: 'brand-default', bgOpacity: 1,    text: 'foreground-strong',    stroke: 'brand-default',    strokeOpacity: 1    },
    disabled: { bg: null,            bgOpacity: 1,    text: 'foreground-muted',     stroke: 'border-secondary', strokeOpacity: 1    },
  },
};

// typoKey replaces fs: 14 — font metrics driven by text style registration
// Frame heights are intentionally larger than body-sm-medium lh (20px):
//   sm  h=32  →  (32-20)/2 = 6px top/bottom breathing room
//   default h=36 →  (36-20)/2 = 8px
//   lg  h=40  →  (40-20)/2 = 10px
// All values > 0, so text is always fully inside the frame.
const TOGGLE_SIZES = {
  default: { h: 36, px: 12, minW: 36, typoKey: 'body-sm-medium' },
  sm:      { h: 32, px: 10, minW: 32, typoKey: 'body-sm-medium' },
  lg:      { h: 40, px: 16, minW: 40, typoKey: 'body-sm-medium' },
};

async function generateToggleSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components  = [];
    const varEntries  = Object.entries(TOGGLE_VARIANT_STATES);
    const stateKeys   = ['off', 'on', 'disabled'];
    const sizeEntries = Object.entries(TOGGLE_SIZES);

    for (const [vName, vStates] of varEntries) {
      for (const stKey of stateKeys) {
        const vConf = vStates[stKey];
        for (const [sName, sConf] of sizeEntries) {
          step = `comp[${vName}/${stKey}/${sName}]`;
          const comp = figma.createComponent();
          comp.name  = `variant=${vName}, state=${stKey}, size=${sName}`;

          // ── Auto Layout ────────────────────────────────────────────────
          // HORIZONTAL: text flows left-to-right, vertically centered.
          // AUTO width (Hugs): frame grows with text content.
          // FIXED height: locked at sConf.h regardless of text.
          comp.layoutMode            = 'HORIZONTAL';
          comp.primaryAxisAlignItems = 'CENTER';   // horizontal: center text
          comp.counterAxisAlignItems = 'CENTER';   // vertical:   center text (key fix)
          comp.primaryAxisSizingMode = 'AUTO';     // Hugs content width
          comp.counterAxisSizingMode = 'FIXED';    // Height locked
          comp.resize(sConf.minW, sConf.h);
          comp.paddingLeft  = sConf.px;
          comp.paddingRight = sConf.px;
          comp.paddingTop   = 0;  // centering is handled by counterAxisAlignItems
          comp.paddingBottom = 0;
          comp.itemSpacing  = 8;
          comp.cornerRadius = RADIUS.md;

          // Background fill
          if (vConf.bg) {
            comp.fills = solidOpacity(tok(vConf.bg), vConf.bgOpacity);
            bindFill(comp, vConf.bg, vars);
          } else {
            comp.fills = [];
          }

          // Border stroke
          if (vConf.stroke) {
            comp.strokes      = solidOpacity(tok(vConf.stroke), vConf.strokeOpacity);
            comp.strokeWeight = 1;
            comp.strokeAlign  = 'INSIDE';
            bindStroke(comp, vConf.stroke, vars);
          } else {
            comp.strokes = [];
          }

          // Label — body-sm-medium (14px / 20px lh / Medium)
          // textAutoResize = 'WIDTH_AND_HEIGHT' (set by makeText) ensures
          // the text node never exceeds the frame's FIXED height.
          const lbl = makeText('Toggle', {
            colorTok:      vConf.text,
            typographyKey: sConf.typoKey,
          });
          bindFill(lbl, vConf.text, vars);
          comp.appendChild(lbl);

          // disabled:opacity-50 — mirrors Tailwind disabled:opacity-50
          if (stKey === 'disabled') comp.opacity = 0.5;

          components.push(comp);
        }
      }
    }

    // Grid layout: variant group → state row → size columns
    step = 'position';
    let yOff = 0;
    const nStates = stateKeys.length;
    const nSizes  = sizeEntries.length;
    for (let vi = 0; vi < varEntries.length; vi++) {
      for (let si = 0; si < nStates; si++) {
        let xOff = 0, rowH = 0;
        for (let sz = 0; sz < nSizes; sz++) {
          const c = components[vi * nStates * nSizes + si * nSizes + sz];
          c.x = xOff; c.y = yOff;
          xOff += (c.width || 80) + 16;
          rowH  = Math.max(rowH, c.height || 36);
        }
        yOff += rowH + 12;
      }
      yOff += 32; // extra gap between variant groups
    }

    step = 'combine';
    combineAndPlace(components, 'Toggle');
    figma.notify('✅ Toggle 세트 생성 완료 (18 variants)');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Toggle[${step}]: ${msg}`, { error: true });
    console.error(`[Toggle][${step}]`, err);
  }
}

// ── 19. ALERT SET ─────────────────────────────────────────────
// Mirrors: components/ui/alert.tsx
// Variants: default · destructive
const ALERT_VARIANTS = {
  default:     { bg: 'surface-default', text: 'foreground-primary', border: 'border-secondary', icon: '○' },
  destructive: { bg: 'surface-default', text: 'danger-soft',        border: 'danger-default',   icon: '!' },
};

async function generateAlertSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(ALERT_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent();
      comp.name  = `variant=${vName}`;
      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'MIN';
      comp.counterAxisAlignItems = 'MIN';
      comp.primaryAxisSizingMode = 'FIXED';
      comp.counterAxisSizingMode = 'AUTO';
      comp.resize(320, 10);
      comp.paddingLeft = comp.paddingRight = 16;
      comp.paddingTop  = comp.paddingBottom = 12;
      comp.itemSpacing  = 12;
      comp.cornerRadius = RADIUS.lg;
      comp.fills        = solid(tok(vConf.bg));
      bindFill(comp, vConf.bg, vars);
      comp.strokes      = solid(tok(vConf.border));
      comp.strokeWeight = 1;
      comp.strokeAlign  = 'INSIDE';
      bindStroke(comp, vConf.border, vars);

      step = `icon[${vName}]`;
      // Icon glyph: title-sub-semibold (16px / 24px lh / SemiBold)
      const iconText = makeText(vConf.icon, { colorTok: vConf.text, typographyKey: 'title-sub-semibold' });
      bindFill(iconText, vConf.text, vars);

      step = `textblock[${vName}]`;
      const textBlock = figma.createFrame();
      textBlock.name = 'text-block';
      textBlock.layoutMode            = 'VERTICAL';
      textBlock.primaryAxisAlignItems = 'MIN';
      textBlock.counterAxisAlignItems = 'MIN';
      textBlock.primaryAxisSizingMode = 'AUTO';
      textBlock.counterAxisSizingMode = 'AUTO';
      textBlock.itemSpacing = 4;
      textBlock.fills = [];

      // Alert title: body-sm-medium (14px / 20px lh / Medium)
      const title = makeText('Alert Title', { colorTok: 'foreground-primary', typographyKey: 'body-sm-medium' });
      bindFill(title, 'foreground-primary', vars);

      // Alert description: 14px Regular — explicit fallback (no body-sm-regular token)
      const desc = makeText('Alert description text.', { size: 14, weight: 'Regular', colorTok: 'foreground-muted' });
      bindFill(desc, 'foreground-muted', vars);
      textBlock.appendChild(title);
      textBlock.appendChild(desc);
      try { title.layoutSizingHorizontal = 'FILL'; } catch (_) {}
      try { desc.layoutSizingHorizontal  = 'FILL'; } catch (_) {}

      comp.appendChild(iconText);
      comp.appendChild(textBlock);
      try { textBlock.layoutSizingHorizontal = 'FILL'; } catch (_) {}
      components.push(comp);
    }

    step = 'position';
    let xOff = 0;
    for (const c of components) {
      c.x = xOff; c.y = 0;
      xOff += (c.width || 320) + 24;
    }

    step = 'combine';
    combineAndPlace(components, 'Alert');
    figma.notify('✅ Alert 세트 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Alert[${step}]: ${msg}`, { error: true });
    console.error(`[Alert][${step}]`, err);
  }
}

// ── 20. COLOR PALETTE ─────────────────────────────────────────
async function generateColorPalette() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();
    const SW = 48, GAP = 8;

    step = 'frame';
    const wrapper = figma.createFrame();
    wrapper.name = 'Color Palette / Token Reference';
    wrapper.layoutMode = 'HORIZONTAL'; wrapper.layoutWrap = 'WRAP';
    wrapper.primaryAxisSizingMode = 'AUTO'; wrapper.counterAxisSizingMode = 'AUTO';
    wrapper.itemSpacing = GAP; wrapper.counterAxisSpacing = GAP * 2;
    wrapper.paddingLeft = wrapper.paddingRight = wrapper.paddingTop = wrapper.paddingBottom = 24;
    wrapper.fills = solid(tok('surface-default')); wrapper.cornerRadius = RADIUS.xl;

    step = 'swatches';
    for (const [name, color] of Object.entries(TOKENS)) {
      const col = figma.createFrame();
      col.name = name; col.layoutMode = 'VERTICAL';
      col.primaryAxisSizingMode = 'AUTO'; col.counterAxisSizingMode = 'AUTO';
      col.itemSpacing = 4; col.fills = [];

      const swatch = figma.createRectangle();
      swatch.resize(SW, SW); swatch.cornerRadius = 6;
      swatch.fills = solid(color); bindFill(swatch, name, vars);
      swatch.strokes = solid(tok('border-secondary')); swatch.strokeWeight = 1; swatch.strokeAlign = 'INSIDE';

      const lbl2 = figma.createText();
      lbl2.fontName = { family: FONT, style: 'Regular' }; lbl2.fontSize = 9;
      lbl2.characters = name; lbl2.fills = solid(tok('foreground-muted'));
      lbl2.resize(SW + 12, 16); lbl2.textAutoResize = 'NONE'; lbl2.textTruncation = 'ENDING';

      col.appendChild(swatch); col.appendChild(lbl2); wrapper.appendChild(col);
    }

    step = 'place';
    const pos = getNextPosition(wrapper.width, wrapper.height);
    figma.currentPage.appendChild(wrapper);
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Color Palette 생성 완료');
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    figma.notify(`❌ Palette[${step}]: ${msg}`, { error: true });
    console.error(`[Palette][${step}]`, err);
  }
}

// ── 21. MESSAGE HANDLER ───────────────────────────────────────
figma.showUI(__html__, { width: 320, height: 640 });

figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'generate-slot':      await generateSlotComponent();  break;
      case 'generate-palette':   await generateColorPalette();   break;
      case 'generate-button':    await generateButtonSet();       break;
      case 'generate-badge':     await generateBadgeSet();        break;
      case 'generate-checkbox':  await generateCheckboxSet();     break;
      case 'generate-radio':     await generateRadioSet();        break;
      case 'generate-switch':    await generateSwitchSet();       break;
      case 'generate-avatar':    await generateAvatarSet();       break;
      case 'generate-separator': await generateSeparatorSet();    break;
      case 'generate-toggle':    await generateToggleSet();       break;
      case 'generate-alert':     await generateAlertSet();        break;
      case 'generate-input':     await generateInput();           break;
      case 'generate-card':      await generateCard();            break;
      case 'generate-button-group': await generateButtonGroup();  break;
      case 'generate-field':     await generateField();           break;
      default:
        figma.notify(`Unknown action: ${msg.type}`, { error: true });
    }
  } catch (err) {
    const m = err && err.message ? err.message : String(err);
    figma.notify(`❌ 오류: ${m}`, { error: true });
    console.error('[Atomic Generator]', err);
  }
};
