// ============================================================
// Atomic Component Generator — code.js
// Source of truth: app/globals.css (@theme) + components/ui/*
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
// ============================================================

// ── 1. TOKEN MAP ──────────────────────────────────────────────
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
const FONT   = 'Inter';

// ── 2. BASE HELPERS ───────────────────────────────────────────
function tok(name) { return TOKENS[name] || { r: 1, g: 1, b: 1 }; }
function solid(color) { return [{ type: 'SOLID', color }]; }
function solidOpacity(color, opacity) { return [{ type: 'SOLID', color, opacity }]; }

async function loadFonts() {
  await Promise.all([
    figma.loadFontAsync({ family: FONT, style: 'Regular' }),
    figma.loadFontAsync({ family: FONT, style: 'Medium' }),
    figma.loadFontAsync({ family: FONT, style: 'Semi Bold' }),
    figma.loadFontAsync({ family: FONT, style: 'Bold' }),
  ]);
}

function makeText(chars, { size = 14, weight = 'Medium', colorTok = 'foreground-primary', lineH, uppercase = false } = {}) {
  const t = figma.createText();
  t.fontName   = { family: FONT, style: weight };
  t.fontSize   = size;
  t.characters = chars;
  t.fills      = solid(tok(colorTok));
  if (lineH)    t.lineHeight = { value: lineH, unit: 'PIXELS' };
  if (uppercase) t.textCase  = 'UPPER';
  return t;
}

function viewportCenter() {
  try { const b = figma.viewport.bounds; return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }
  catch (_) { return { x: 0, y: 0 }; }
}

// ── 3. POSITIONING ────────────────────────────────────────────
// Stacks new components below existing canvas content, never overlapping.
function getNextPosition(width, height) {
  // Exclude parked slot (at -9999) and any other off-canvas helpers
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
  const slash  = tokenName.replace(/-/g, '/');
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

    // ── Capture & Re-inject pattern ──────────────────────────────
    // Step 1: capture opacity BEFORE binding (Figma resets it to 1 on bind)
    const originalOpacity = typeof paint.opacity === 'number' ? paint.opacity : 1;

    // Step 2: bind the variable — apply result to node.fills immediately
    const boundPaint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
    node.fills = [boundPaint];

    // Step 3: re-read node.fills AFTER binding (Figma's normalised representation),
    //         clone it, then re-inject the stored opacity to override Figma's reset
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

    // ── Capture & Re-inject pattern ──────────────────────────────
    // Step 1: capture opacity BEFORE binding
    const originalOpacity = typeof paint.opacity === 'number' ? paint.opacity : 1;

    // Step 2: bind and apply
    const boundPaint = figma.variables.setBoundVariableForPaint(paint, 'color', v);
    node.strokes = [boundPaint];

    // Step 3: re-read, clone, re-inject
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
// Centralises the combineAsComponentSet pattern:
//   1. combine in-memory components  2. append to page  3. position  4. zoom
// Fallback for older Figma: groups components instead of ComponentSet.
function combineAndPlace(components, name) {
  if (typeof figma.combineAsComponentSet === 'function') {
    // ✅ Modern Figma — creates proper ComponentSet with Variants panel
    const set = figma.combineAsComponentSet(components);
    set.name  = name;
    figma.currentPage.appendChild(set);
    const pos = getNextPosition(set.width, set.height);
    set.x = pos.x;
    set.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([set]);
    return set;
  }

  // ⚠️ Fallback: combineAsComponentSet unavailable (Figma app outdated).
  // Components' x/y are already set relatively in the position step.
  // Offset them all to the next canvas slot, then group for organisation.
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
    figma.currentPage.appendChild(comp); // must be on page before createInstance()
    comp.x = -9999; comp.y = -9999;      // park off-canvas
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
const BTN_VARIANTS = {
  default:     { bg: 'primary-default', text: 'foreground-strong',    border: null },
  destructive: { bg: 'danger-soft',     text: 'foreground-strong',    border: null },
  outline:     { bg: null,              text: 'foreground-primary',   border: 'border-primary' },
  secondary:   { bg: 'surface-hover',   text: 'foreground-secondary', border: null },
  ghost:       { bg: null,              text: 'foreground-primary',   border: null },
  link:        { bg: null,              text: 'primary-default',      border: null, underline: true },
};
const BTN_SIZES = {
  default: { h: 36, pl: 16, pr: 16, fs: 14, gap: 8 },
  sm:      { h: 32, pl: 12, pr: 12, fs: 14, gap: 6 },
  lg:      { h: 40, pl: 24, pr: 24, fs: 14, gap: 8 },
  icon:    { h: 36, pl: 0,  pr: 0,  fs: 14, gap: 0, fixed: 36 },
  'icon-sm': { h: 32, pl: 0,  pr: 0,  fs: 14, gap: 0, fixed: 32 },
  'icon-lg': { h: 40, pl: 0,  pr: 0,  fs: 14, gap: 0, fixed: 40 },
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
        const comp   = figma.createComponent(); // in memory — NOT appended yet
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
          comp.primaryAxisSizingMode = 'AUTO';
          comp.counterAxisSizingMode = 'FIXED';
        }

        if (vConf.bg) { comp.fills = solid(tok(vConf.bg)); bindFill(comp, vConf.bg, vars); }
        else { comp.fills = []; }

        if (vConf.border) {
          comp.strokes = solid(tok(vConf.border)); comp.strokeWeight = 1; comp.strokeAlign = 'INSIDE';
          bindStroke(comp, vConf.border, vars);
        } else { comp.strokes = []; }

        if (!isIcon) {
          const lbl = makeText('Button', { size: sConf.fs, weight: 'Medium', colorTok: vConf.text });
          if (vConf.underline) lbl.textDecoration = 'UNDERLINE';
          bindFill(lbl, vConf.text, vars);
          comp.appendChild(lbl);
        }

        step = `slot[${vName}/${sName}]`;
        attachSlot(comp, slotComp, isIcon);
        components.push(comp);
      }
    }

    // Grid-position children BEFORE combining
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
// Mirrors: components/ui/badge.tsx semantic variants
// Shape: rounded-full (pill) · Font: 12px Bold UPPERCASE
// Fill: 15% opacity background · Border: none
// Variant names match badge.tsx exactly: danger / positive / caution
const BADGE_VARIANTS = {
  danger:   { bgColor: 'danger-default',  bgOpacity: 0.15, textColor: 'danger-soft',    label: 'Danger'   },
  positive: { bgColor: 'brand-default',   bgOpacity: 0.15, textColor: 'brand-soft',     label: 'Positive' },
  caution:  { bgColor: 'caution-default', bgOpacity: 0.15, textColor: 'caution-default', label: 'Caution' },
};

async function generateBadgeSet() {
  let step = 'init';
  try {
    step = 'fonts'; await loadFonts();
    step = 'vars';  const vars = await loadColorVars();

    const components = [];
    for (const [vName, vConf] of Object.entries(BADGE_VARIANTS)) {
      step = `comp[${vName}]`;
      const comp = figma.createComponent(); // in memory — NOT appended yet
      comp.name  = `variant=${vName}`;

      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.paddingLeft = comp.paddingRight = 8;
      comp.paddingTop  = comp.paddingBottom = 2;
      comp.itemSpacing  = 4;
      comp.cornerRadius = 9999; // rounded-full (pill)
      comp.strokes      = [];   // border-transparent

      // 0.15 opacity fill — bindFill re-injects opacity via JSON-clone pattern
      comp.fills = solidOpacity(tok(vConf.bgColor), vConf.bgOpacity);
      bindFill(comp, vConf.bgColor, vars);

      step = `text[${vName}]`;
      // Bold + uppercase to match badge.tsx semantic variant style
      const lbl = makeText(vConf.label, { size: 12, weight: 'Bold', colorTok: vConf.textColor, uppercase: true });
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
  unchecked: { bg: 'input',           border: 'border-secondary',  hasCheck: false },
  checked:   { bg: 'primary-default', border: 'primary-default',   hasCheck: true  },
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

      // 16×16 checkbox box
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
        const check = makeText('✓', { size: 10, weight: 'Medium', colorTok: 'foreground-strong' });
        check.textAlignHorizontal = 'CENTER';
        bindFill(check, 'foreground-strong', vars);
        box.appendChild(check);
      }

      const label = makeText('Checkbox', { size: 14, weight: 'Regular', colorTok: 'foreground-primary' });
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
  unchecked: { bg: 'input',           border: 'border-secondary',   hasDot: false },
  checked:   { bg: 'primary-default', border: 'primary-default',    hasDot: true  },
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

      // 16×16 circle
      const circle = figma.createFrame();
      circle.name         = 'radio';
      circle.resize(16, 16);
      circle.layoutMode   = 'NONE';
      circle.cornerRadius = 8; // full circle
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
        dot.x = 5; dot.y = 5; // center in 16×16
        circle.appendChild(dot);
      }

      const label = makeText('Radio option', { size: 14, weight: 'Regular', colorTok: 'foreground-primary' });
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
  off:      { trackBg: 'border-secondary',  thumbX: 1  },
  on:       { trackBg: 'primary-default',   thumbX: 14 },
  disabled: { trackBg: 'surface-hover',     thumbX: 1  },
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

      // Track: 32×18
      const track = figma.createFrame();
      track.name         = 'track';
      track.resize(32, 18);
      track.layoutMode   = 'NONE';
      track.cornerRadius = 9;
      track.fills        = solid(tok(vConf.trackBg));
      bindFill(track, vConf.trackBg, vars);
      track.strokes      = [];

      // Thumb: 16×16
      const thumb = figma.createFrame();
      thumb.name         = 'thumb';
      thumb.resize(16, 16);
      thumb.layoutMode   = 'NONE';
      thumb.cornerRadius = 8;
      thumb.fills        = solid(tok('foreground-strong'));
      bindFill(thumb, 'foreground-strong', vars);
      thumb.x = vConf.thumbX;
      thumb.y = 1; // (18-16)/2 = 1
      track.appendChild(thumb);

      const label = makeText('Switch', { size: 14, weight: 'Regular', colorTok: 'foreground-primary' });
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
  sm:      { size: 24 },
  default: { size: 32 },
  lg:      { size: 48 },
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
      comp.cornerRadius = vConf.size / 2; // circle
      comp.clipsContent = true;
      comp.fills        = solid(tok('surface-hover'));
      bindFill(comp, 'surface-hover', vars);

      // Initials placeholder
      const fs = vConf.size <= 24 ? 9 : vConf.size <= 32 ? 12 : 16;
      const initials = makeText('JD', { size: fs, weight: 'Semi Bold', colorTok: 'foreground-muted' });
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
    const ph = makeText('Placeholder text', { size: 14, weight: 'Regular', colorTok: 'foreground-muted' });
    bindFill(ph, 'foreground-muted', vars);
    comp.appendChild(ph);

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
    const cardTitle = makeText('Card Title', { size: 16, weight: 'Semi Bold', colorTok: 'foreground-primary' });
    bindFill(cardTitle, 'foreground-primary', vars);
    const cardDesc  = makeText('Card description goes here', { size: 14, weight: 'Regular', colorTok: 'foreground-muted', lineH: 20 });
    bindFill(cardDesc, 'foreground-muted', vars);
    header.appendChild(cardTitle); header.appendChild(cardDesc);

    step = 'content';
    const content = section('CardContent');
    content.paddingLeft = content.paddingRight = 24;
    content.paddingTop = 24; content.paddingBottom = 0;
    const contentText = makeText('Content area', { size: 14, weight: 'Regular', colorTok: 'foreground-secondary' });
    bindFill(contentText, 'foreground-secondary', vars);
    content.appendChild(contentText);

    step = 'footer';
    const footer = section('CardFooter', 'HORIZONTAL');
    footer.counterAxisAlignItems = 'CENTER';
    footer.paddingLeft = footer.paddingRight = 24;
    footer.paddingTop = 16; footer.paddingBottom = 24; footer.itemSpacing = 8;
    const footerText = makeText('Footer', { size: 14, weight: 'Regular', colorTok: 'foreground-muted' });
    bindFill(footerText, 'foreground-muted', vars);
    footer.appendChild(footerText);

    comp.appendChild(header); comp.appendChild(content); comp.appendChild(footer);
    // Apply FILL sizing AFTER appendChild (avoids Figma API ordering bug)
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
      if (i === 0)           { node.topLeftRadius = baseRadius; node.bottomLeftRadius = baseRadius; node.topRightRadius = 0; node.bottomRightRadius = 0; }
      else if (i === COUNT-1){ node.topLeftRadius = 0; node.bottomLeftRadius = 0; node.topRightRadius = baseRadius; node.bottomRightRadius = baseRadius; }
      else                   { node.topLeftRadius = node.bottomLeftRadius = node.topRightRadius = node.bottomRightRadius = 0; }
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

    const lbl = makeText('Label', { size: 14, weight: 'Medium', colorTok: 'foreground-primary' });
    bindFill(lbl, 'foreground-primary', vars);
    comp.appendChild(lbl);

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
    const ph = makeText('Placeholder', { size: 14, weight: 'Regular', colorTok: 'foreground-muted' });
    bindFill(ph, 'foreground-muted', vars); inp.appendChild(ph);

    const helper = makeText('Helper text', { size: 12, weight: 'Regular', colorTok: 'foreground-muted' });
    bindFill(helper, 'foreground-muted', vars);
    comp.appendChild(inp); comp.appendChild(helper);

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
// Mirrors: components/ui/toggle.tsx (improved)
// Dimensions: variant(2) × state(3) × size(3) = 18 components
//
// default/off  → ghost: transparent bg, subtle border
// default/on   → soft brand: brand-default/15 bg, brand-soft text
// outline/off  → bordered: border-secondary visible
// outline/on   → solid brand: brand-default fill, foreground-strong text
// any/disabled → comp.opacity = 0.5 (mirrors disabled:opacity-50)

// Each state: { bg, bgOpacity, text, stroke, strokeOpacity }
const TOGGLE_VARIANT_STATES = {
  default: {
    off:      { bg: null,            bgOpacity: 1,    text: 'foreground-secondary', stroke: null,             strokeOpacity: 1    },
    on:       { bg: 'brand-default', bgOpacity: 0.15, text: 'brand-soft',           stroke: 'brand-default',  strokeOpacity: 0.25 },
    disabled: { bg: null,            bgOpacity: 1,    text: 'foreground-muted',     stroke: null,             strokeOpacity: 1    },
  },
  outline: {
    off:      { bg: null,            bgOpacity: 1,    text: 'foreground-secondary', stroke: 'border-secondary', strokeOpacity: 1  },
    on:       { bg: 'brand-default', bgOpacity: 1,    text: 'foreground-strong',    stroke: 'brand-default',    strokeOpacity: 1  },
    disabled: { bg: null,            bgOpacity: 1,    text: 'foreground-muted',     stroke: 'border-secondary', strokeOpacity: 1  },
  },
};

const TOGGLE_SIZES = {
  default: { h: 36, px: 12, minW: 36, fs: 14 },
  sm:      { h: 32, px: 10, minW: 32, fs: 14 },
  lg:      { h: 40, px: 16, minW: 40, fs: 14 },
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

          comp.layoutMode            = 'HORIZONTAL';
          comp.primaryAxisAlignItems = 'CENTER';
          comp.counterAxisAlignItems = 'CENTER';
          comp.primaryAxisSizingMode = 'AUTO';
          comp.counterAxisSizingMode = 'FIXED';
          comp.resize(sConf.minW, sConf.h);
          comp.paddingLeft = comp.paddingRight = sConf.px;
          comp.paddingTop  = comp.paddingBottom = 0;
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

          // Label text
          const lbl = makeText('Toggle', { size: sConf.fs, weight: 'Medium', colorTok: vConf.text });
          bindFill(lbl, vConf.text, vars);
          comp.appendChild(lbl);

          // disabled:opacity-50
          if (stKey === 'disabled') comp.opacity = 0.5;

          components.push(comp);
        }
      }
    }

    // Grid layout: each row = one (variant/state) × all sizes
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
      const iconText = makeText(vConf.icon, { size: 16, weight: 'Medium', colorTok: vConf.text });
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

      const title = makeText('Alert Title', { size: 14, weight: 'Medium', colorTok: 'foreground-primary' });
      bindFill(title, 'foreground-primary', vars);
      const desc  = makeText('Alert description text.', { size: 14, weight: 'Regular', colorTok: 'foreground-muted' });
      bindFill(desc, 'foreground-muted', vars);
      textBlock.appendChild(title);
      textBlock.appendChild(desc);

      comp.appendChild(iconText);
      comp.appendChild(textBlock);
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
