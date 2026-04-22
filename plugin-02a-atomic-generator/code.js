// ============================================================
// Atomic Component Generator -- code.js  (plugin-02a)
// Atoms: Button · Input Field · Badge · Checkbox · Radio · Switcher
//
// Figma Plugin API rules:
//  - NO optional chaining (?.) or nullish coalescing (??)
//  - combineAsVariants(nodes, parent) -- correct API name
//  - x,y set inline before combine (bounds required)
//  - buildAtomFrame wraps ComponentSet in white Frame + overlay
// ============================================================

// ── COLOR TOKENS ─────────────────────────────────────────────
const TOKENS = {
  'background':           { r: 0.008, g: 0.024, b: 0.090 },
  'surface-default':      { r: 0.059, g: 0.090, b: 0.165 },
  'surface-hover':        { r: 0.118, g: 0.161, b: 0.231 },
  'input':                { r: 0.118, g: 0.161, b: 0.231 },
  'foreground-primary':   { r: 0.945, g: 0.961, b: 0.976 },
  'foreground-secondary': { r: 0.886, g: 0.910, b: 0.941 },
  'foreground-tertiary':  { r: 0.796, g: 0.835, b: 0.882 },
  'foreground-strong':    { r: 0.973, g: 0.980, b: 0.988 },
  'foreground-muted':     { r: 0.580, g: 0.639, b: 0.722 },
  'primary-default':      { r: 0.231, g: 0.510, b: 0.965 },
  'brand-deep':           { r: 0.486, g: 0.227, b: 0.929 },
  'brand-default':        { r: 0.545, g: 0.361, b: 0.965 },
  'brand-soft':           { r: 0.655, g: 0.545, b: 0.980 },
  'brand-faint':          { r: 0.769, g: 0.710, b: 0.992 },
  'positive-default':     { r: 0.063, g: 0.725, b: 0.506 },
  'positive-soft':        { r: 0.204, g: 0.827, b: 0.600 },
  'danger-deep':          { r: 0.863, g: 0.149, b: 0.149 },
  'danger-default':       { r: 0.937, g: 0.267, b: 0.267 },
  'danger-soft':          { r: 0.973, g: 0.443, b: 0.443 },
  'caution-default':      { r: 0.961, g: 0.620, b: 0.043 },
  'caution-soft':         { r: 0.984, g: 0.749, b: 0.141 },
  'border-primary':       { r: 0.278, g: 0.333, b: 0.412 },
  'border-secondary':     { r: 0.200, g: 0.255, b: 0.333 },
};

const RADIUS = { sm: 6, md: 8, lg: 12, xl: 16 };
const FONT   = 'Inter';

const TYPOGRAPHY_MAP = {
  'display-sm-semibold':      { size: 30, lh: 36, weight: 'Semi Bold' },
  'display-sm-bold':          { size: 30, lh: 36, weight: 'Bold' },
  'title-page-semibold':      { size: 20, lh: 28, weight: 'Semi Bold' },
  'title-section-semibold':   { size: 18, lh: 27, weight: 'Semi Bold' },
  'title-sub-semibold':       { size: 16, lh: 24, weight: 'Semi Bold' },
  'body-md-regular':          { size: 16, lh: 24, weight: 'Regular' },
  'body-md-medium':           { size: 16, lh: 24, weight: 'Medium' },
  'body-sm-medium':           { size: 14, lh: 20, weight: 'Medium' },
  'body-micro-medium':        { size: 13, lh: 18, weight: 'Medium' },
  'body-micro-bold':          { size: 13, lh: 18, weight: 'Bold' },
  'label-xs-medium':          { size: 12, lh: 16, weight: 'Medium' },
  'label-micro-medium':       { size: 11, lh: 14, weight: 'Medium' },
  'label-xs-caps-medium':     { size: 12, lh: 16, weight: 'Medium',    uppercase: true },
  'label-xs-caps-semibold':   { size: 12, lh: 16, weight: 'Semi Bold', uppercase: true },
  'body-micro-caps-semibold': { size: 13, lh: 18, weight: 'Semi Bold', uppercase: true },
};

const LINE_H = { 30:36, 20:28, 18:27, 16:24, 14:20, 13:18, 12:16, 11:14, 10:14, 9:12 };

// ── BASE HELPERS ──────────────────────────────────────────────
function tok(name) { return TOKENS[name] || { r:1, g:1, b:1 }; }
function solid(color) { return [{ type: 'SOLID', color: color }]; }
function solidOpacity(color, opacity) { return [{ type: 'SOLID', color: color, opacity: opacity }]; }

async function loadFonts() {
  var fallback = [
    { family: FONT, style: 'Regular' },
    { family: FONT, style: 'Medium' },
    { family: FONT, style: 'Semi Bold' },
    { family: FONT, style: 'Bold' },
  ];
  var styleFonts = [];
  try { styleFonts = figma.getLocalTextStyles().map(function(s) { return s.fontName; }).filter(Boolean); } catch (_) {}
  var all    = fallback.concat(styleFonts);
  var seen   = {};
  var unique = [];
  for (var i = 0; i < all.length; i++) {
    var key = all[i].family + '|' + all[i].style;
    if (!seen[key]) { seen[key] = true; unique.push(all[i]); }
  }
  await Promise.all(unique.map(function(f) { return figma.loadFontAsync(f).catch(function() {}); }));
}

function findTextStyle(key) {
  try { return figma.getLocalTextStyles().find(function(s) { return s.name === key; }) || null; }
  catch (_) { return null; }
}

function makeText(chars, opts) {
  opts = opts || {};
  var size         = opts.size         || 14;
  var weight       = opts.weight       || 'Medium';
  var colorTok     = opts.colorTok     || 'foreground-primary';
  var lineH        = opts.lineH        || null;
  var uppercase    = opts.uppercase    || false;
  var typographyKey = opts.typographyKey || null;

  var t = figma.createText();

  if (typographyKey) {
    var style  = findTextStyle(typographyKey);
    var mapDef = TYPOGRAPHY_MAP[typographyKey];
    if (style) {
      try { t.fontName = style.fontName; }
      catch (_) { t.fontName = { family: FONT, style: (mapDef && mapDef.weight) || weight }; }
    } else {
      t.fontName = { family: FONT, style: (mapDef && mapDef.weight) || weight };
    }
    t.characters = chars;
    if (style) {
      try { t.textStyleId = style.id; } catch (_) {}
    } else if (mapDef) {
      t.fontSize = mapDef.size;
      t.lineHeight = { value: mapDef.lh, unit: 'PIXELS' };
    } else {
      t.fontSize = size;
      t.lineHeight = { value: lineH || LINE_H[size] || Math.round(size * 1.4), unit: 'PIXELS' };
    }
    // textCase is intentionally NOT forced here.
    // Caps styles (label-xs-caps-semibold etc.) should have UPPER already
    // set within the Figma text style itself. Overriding after textStyleId
    // binding breaks the style linkage in Figma's properties panel.
  } else {
    t.fontName   = { family: FONT, style: weight };
    t.characters = chars;
    t.fontSize   = size;
    t.lineHeight = { value: lineH || LINE_H[size] || Math.round(size * 1.4), unit: 'PIXELS' };
    // Same: no textCase override on explicit path either.
  }

  t.fills          = solid(tok(colorTok));
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}

// Empty icon placeholder frame with dashed slate-400 outline.
// Designers replace the slot manually with the real lucide icon.
function makeIconSlot(size) {
  var slot = figma.createFrame();
  slot.name = 'Icon-Slot';
  slot.resize(size, size);
  slot.layoutMode = 'NONE';
  slot.fills = [];
  slot.strokes = [{ type: 'SOLID', color: tok('foreground-muted'), opacity: 1 }];
  slot.strokeWeight = 1;
  slot.strokeAlign = 'INSIDE';
  slot.dashPattern = [4, 4];
  return slot;
}

function viewportCenter() {
  try {
    var b = figma.viewport.bounds;
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  } catch (_) { return { x: 0, y: 0 }; }
}

// Snapshot canvas slot BEFORE new nodes are added to the page.
function getNextPosition() {
  var visible = figma.currentPage.children.filter(function(n) { return n.x > -1000 && n.y > -1000; });
  if (visible.length === 0) {
    var vc = viewportCenter();
    return { x: Math.round(vc.x), y: Math.round(vc.y) };
  }
  var maxBottom = -Infinity, refX = 0;
  for (var i = 0; i < visible.length; i++) {
    var n = visible[i];
    var b = n.y + (n.height || 0);
    if (b > maxBottom) { maxBottom = b; refX = n.x; }
  }
  return { x: refX, y: maxBottom + 80 };
}

async function deleteExistingNode(name) {
  try {
    var existing = figma.currentPage.findOne(function(n) { return n.name === name && n.type === 'COMPONENT_SET'; });
    if (existing) { await existing.remove(); }
    var existingFrame = figma.currentPage.findOne(function(n) { return n.name === name && n.type === 'FRAME'; });
    if (existingFrame) { await existingFrame.remove(); }
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════════
// ── CENTER COMPONENTS IN CELLS ────────────────────────────────
// Called AFTER combineAsVariants + layoutMode='NONE'.
// Adds centering offsets to each component's x,y in the
// ComponentSet's local coordinate space.
//   hGap / vGap  -- cell dimensions
//   vGap = 0     -- single-row atom: center vertically using csH
//   csH          -- ComponentSet height (used when vGap = 0)
// ══════════════════════════════════════════════════════════════
function centerInCells(cs, components, hGap, vGap, csH) {
  // 1. Add centering offsets to each component's local position
  for (var i = 0; i < components.length; i++) {
    var c  = components[i];
    var cx = Math.max(0, Math.round((hGap - c.width)  / 2));
    var cy = vGap > 0
      ? Math.max(0, Math.round((vGap - c.height) / 2))
      : Math.max(0, Math.round((csH  - c.height) / 2));
    c.x = c.x + cx;
    c.y = c.y + cy;
  }
  // 2. Resize ComponentSet to fully encompass all repositioned children
  //    (prevents clipping when children move beyond original bounds)
  var maxR = 0, maxB = 0;
  for (var j = 0; j < components.length; j++) {
    maxR = Math.max(maxR, components[j].x + (components[j].width  || 0));
    maxB = Math.max(maxB, components[j].y + (components[j].height || 0));
  }
  try { cs.resize(Math.max(1, maxR), Math.max(1, maxB)); } catch (_) {}
}

// ══════════════════════════════════════════════════════════════
// ── BUILD ATOM FRAME ──────────────────────────────────────────
// Wraps a ComponentSet in a dark Frame with:
//   - Title text (display-sm-semibold, top-left)
//   - Column header labels (label-xs-caps-semibold)
//   - Row group labels (label-xs-caps-semibold, optional)
//   - Purple dashed grid overlay (Propstar-style)
//
// Overlay is sized to numCols*hGap x numRows*rowStep so all
// cells are uniform width/height regardless of cs.width.
// ══════════════════════════════════════════════════════════════
function buildAtomFrame(cs, title, config) {
  var hGap       = config.hGap;
  var vGap       = config.vGap  || 0;
  var numCols    = config.numCols;
  var numRows    = config.numRows || 1;
  var colHeaders = config.colHeaders || [];
  var rowGroups  = config.rowGroups  || [];

  var rowLabels   = config.rowLabels || [];  // [{label, rowIndex}] -- state column
  var HAS_ROW_HDR = rowGroups.length > 0;
  var HAS_ROW_LBL = rowLabels.length > 0;
  var WRAP_PAD    = 40;
  var TITLE_H     = 60;
  var COL_HDR_H   = 36;
  // ROW_HDR_W = size-group column (80) + state-label column (80, if present)
  var ROW_HDR_W   = (HAS_ROW_HDR ? 80 : 0) + (HAS_ROW_LBL ? 80 : 0);
  var PURPLE      = tok('brand-deep');

  // Overlay dimensions: uniform cells, independent of cs.width/height
  var rowStep  = vGap > 0 ? vGap : cs.height;
  var overlayW = numCols * hGap;
  var overlayH = numRows * rowStep;

  // Where ComponentSet + overlay sit inside wrapper
  var csX = WRAP_PAD + ROW_HDR_W;
  var csY = WRAP_PAD + TITLE_H + COL_HDR_H;

  // Wrapper sized to overlay (not cs) so last column never clips
  var wrapW = csX + overlayW + WRAP_PAD;
  var wrapH = csY + overlayH + WRAP_PAD;

  // ── Wrapper Frame (dark background) ───────────────────────
  var wrapper = figma.createFrame();
  wrapper.name         = title;
  wrapper.resize(wrapW, wrapH);
  wrapper.layoutMode   = 'NONE';
  wrapper.fills        = solid(tok('background'));   // #020617
  wrapper.strokes      = [{ type: 'SOLID', color: tok('border-secondary'), opacity: 1 }];
  wrapper.strokeWeight = 1;
  wrapper.strokeAlign  = 'INSIDE';
  wrapper.cornerRadius = RADIUS.xl;
  wrapper.clipsContent = false;
  figma.currentPage.appendChild(wrapper);

  // ── Title ──────────────────────────────────────────────────
  var titleTxt = makeText(title, { colorTok: 'foreground-primary', typographyKey: 'display-sm-semibold' });
  wrapper.appendChild(titleTxt);
  titleTxt.x = WRAP_PAD;
  titleTxt.y = WRAP_PAD;

  // ── Column headers ─────────────────────────────────────────
  for (var ci = 0; ci < colHeaders.length; ci++) {
    var colTxt = makeText(colHeaders[ci], { colorTok: 'foreground-muted', typographyKey: 'label-xs-caps-semibold' });
    wrapper.appendChild(colTxt);
    var colCx = csX + ci * hGap + Math.round(hGap / 2);
    colTxt.x = Math.round(colCx - colTxt.width / 2);
    colTxt.y = WRAP_PAD + TITLE_H + Math.round((COL_HDR_H - 16) / 2);
  }

  // ── Row group labels (size: SM / MD / LG) ─────────────────
  for (var ri = 0; ri < rowGroups.length; ri++) {
    var rg    = rowGroups[ri];
    var rgTxt = makeText(rg.label, { colorTok: 'foreground-muted', typographyKey: 'label-xs-caps-semibold' });
    wrapper.appendChild(rgTxt);
    rgTxt.x = WRAP_PAD;
    rgTxt.y = csY + rg.rowIndex * rowStep + Math.round((rowStep - 16) / 2);
  }

  // ── Row labels (state: default / hover / focus / disabled) ─
  // Positioned in a second column immediately left of the grid.
  var stateLabelX = WRAP_PAD + (HAS_ROW_HDR ? 80 : 0);
  for (var li = 0; li < rowLabels.length; li++) {
    var rl    = rowLabels[li];
    var rlTxt = makeText(rl.label, { colorTok: 'foreground-muted', typographyKey: 'label-xs-caps-semibold' });
    wrapper.appendChild(rlTxt);
    rlTxt.x = stateLabelX;
    rlTxt.y = csY + rl.rowIndex * rowStep + Math.round((rowStep - 16) / 2);
  }

  // ── Overlay: uniform dashed cells ─────────────────────────
  var overlay = figma.createFrame();
  overlay.name         = '_property-table';
  overlay.resize(overlayW, overlayH);
  overlay.layoutMode   = 'NONE';
  overlay.fills        = [];
  overlay.strokes      = [];
  overlay.clipsContent = false;

  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var cell = figma.createFrame();
      cell.name         = 'cell';
      cell.resize(hGap, rowStep);   // all cells same size
      cell.layoutMode   = 'NONE';
      cell.fills        = [];
      cell.strokes      = [{ type: 'SOLID', color: PURPLE, opacity: 1 }];
      cell.strokeWeight = 1;
      cell.strokeAlign  = 'INSIDE';
      cell.dashPattern  = [4, 4];
      cell.x = col * hGap;
      cell.y = row * rowStep;
      overlay.appendChild(cell);
    }
  }

  // ── Move ComponentSet into wrapper, overlay on top ────────
  wrapper.appendChild(cs);
  cs.x = csX;
  cs.y = csY;
  try { cs.clipsContent = false; } catch (_) {}

  wrapper.appendChild(overlay);
  overlay.x = csX;
  overlay.y = csY;

  return wrapper;
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 1: BUTTON  (4 variants × 4 states × 3 sizes = 48) ──
// ══════════════════════════════════════════════════════════════
const BUTTON_VARIANTS = {
  primary: {
    default:  { bg: 'primary-default', bgOp: 1, text: 'foreground-strong',    stroke: null,             strokeW: 0 },
    hover:    { bg: 'primary-default', bgOp: 1, text: 'foreground-strong',    stroke: 'border-primary', strokeW: 2 },
    focus:    { bg: 'primary-default', bgOp: 1, text: 'foreground-strong',    stroke: 'brand-deep',     strokeW: 2 },
    disabled: { bg: 'surface-hover',   bgOp: 1, text: 'foreground-muted',     stroke: null,             strokeW: 0, compOpacity: 0.5 },
  },
  secondary: {
    default:  { bg: 'surface-hover',   bgOp: 1, text: 'foreground-secondary', stroke: 'border-secondary', strokeW: 1 },
    hover:    { bg: 'surface-default', bgOp: 1, text: 'foreground-primary',   stroke: 'border-primary',   strokeW: 1 },
    focus:    { bg: 'surface-default', bgOp: 1, text: 'foreground-primary',   stroke: 'brand-deep',       strokeW: 2 },
    disabled: { bg: 'surface-hover',   bgOp: 1, text: 'foreground-muted',     stroke: 'border-secondary', strokeW: 1, compOpacity: 0.5 },
  },
  ghost: {
    default:  { bg: null,              bgOp: 1, text: 'foreground-primary',   stroke: null,             strokeW: 0 },
    hover:    { bg: 'surface-hover',   bgOp: 1, text: 'foreground-primary',   stroke: null,             strokeW: 0 },
    focus:    { bg: 'surface-hover',   bgOp: 1, text: 'foreground-primary',   stroke: 'brand-deep',     strokeW: 2 },
    disabled: { bg: null,              bgOp: 1, text: 'foreground-muted',     stroke: null,             strokeW: 0, compOpacity: 0.5 },
  },
  destructive: {
    default:  { bg: 'danger-default',  bgOp: 1, text: 'foreground-strong',    stroke: null,             strokeW: 0 },
    hover:    { bg: 'danger-deep',     bgOp: 1, text: 'foreground-strong',    stroke: null,             strokeW: 0 },
    focus:    { bg: 'danger-default',  bgOp: 1, text: 'foreground-strong',    stroke: 'danger-soft',    strokeW: 2 },
    disabled: { bg: 'surface-hover',   bgOp: 1, text: 'foreground-muted',     stroke: null,             strokeW: 0, compOpacity: 0.5 },
  },
};

const BUTTON_SIZES = {
  sm: { h: 32, pl: 12, pr: 12, gap: 6, typoKey: 'body-sm-medium' },
  md: { h: 36, pl: 16, pr: 16, gap: 8, typoKey: 'body-sm-medium' },
  lg: { h: 40, pl: 24, pr: 24, gap: 8, typoKey: 'body-sm-medium' },
};

async function generateButtonAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Button');
    step = 'fonts';  await loadFonts();

    var BTN_H_GAP = 240;
    var BTN_V_GAP = 140;

    var components  = [];
    var varKeys     = Object.keys(BUTTON_VARIANTS);
    var stateKeys   = ['default', 'hover', 'focus', 'disabled'];
    var sizeEntries = Object.entries(BUTTON_SIZES);
    var nStates     = stateKeys.length;
    var nSizes      = sizeEntries.length;

    for (var vi = 0; vi < varKeys.length; vi++) {
      var vName   = varKeys[vi];
      var vStates = BUTTON_VARIANTS[vName];
      for (var si = 0; si < stateKeys.length; si++) {
        var stName = stateKeys[si];
        var stConf = vStates[stName];
        for (var zi = 0; zi < sizeEntries.length; zi++) {
          var zName = sizeEntries[zi][0];
          var zConf = sizeEntries[zi][1];
          step = 'comp[' + vName + '/' + stName + '/' + zName + ']';

          var comp = figma.createComponent();
          comp.name = 'variant=' + vName + ', state=' + stName + ', size=' + zName;
          comp.x = vi * BTN_H_GAP;
          comp.y = (zi * nStates + si) * BTN_V_GAP;

          comp.layoutMode            = 'HORIZONTAL';
          comp.primaryAxisAlignItems = 'CENTER';
          comp.counterAxisAlignItems = 'CENTER';
          comp.resize(10, zConf.h);
          comp.primaryAxisSizingMode = 'AUTO';
          comp.counterAxisSizingMode = 'FIXED';
          comp.paddingLeft   = zConf.pl;
          comp.paddingRight  = zConf.pr;
          comp.paddingTop    = 0;
          comp.paddingBottom = 0;
          comp.itemSpacing   = zConf.gap;
          comp.cornerRadius  = RADIUS.md;

          if (stConf.bg) {
            comp.fills = stConf.bgOp < 1 ? solidOpacity(tok(stConf.bg), stConf.bgOp) : solid(tok(stConf.bg));
          } else { comp.fills = []; }

          if (stConf.stroke && stConf.strokeW > 0) {
            comp.strokes = solid(tok(stConf.stroke));
            comp.strokeWeight = stConf.strokeW;
            comp.strokeAlign  = 'INSIDE';
          } else { comp.strokes = []; }

          var lbl = makeText('Button', { colorTok: stConf.text, typographyKey: zConf.typoKey });
          comp.appendChild(lbl);
          if (stConf.compOpacity) { comp.opacity = stConf.compOpacity; }
          components.push(comp);
        }
      }
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Button';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, BTN_H_GAP, BTN_V_GAP, cs.height);

    step = 'wrap';
    // Build state rowLabels for all 12 rows (4 states × 3 sizes)
    var stateRowLabels = [];
    for (var zz = 0; zz < nSizes; zz++) {
      for (var ss = 0; ss < nStates; ss++) {
        stateRowLabels.push({ label: stateKeys[ss], rowIndex: zz * nStates + ss });
      }
    }

    var wrapper = buildAtomFrame(cs, 'Button', {
      hGap: BTN_H_GAP, vGap: BTN_V_GAP,
      numCols: varKeys.length,
      numRows: nStates * nSizes,
      colHeaders: varKeys,
      rowGroups: [
        { label: 'SM', rowIndex: 0 },
        { label: 'MD', rowIndex: nStates },
        { label: 'LG', rowIndex: nStates * 2 },
      ],
      rowLabels: stateRowLabels,
    });
    wrapper.x = pos.x;
    wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Button 시스템 생성 및 정렬 완료!');
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    figma.notify('❌ Button[' + step + ']: ' + msg, { error: true });
    console.error('[Button][' + step + ']', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 2: INPUT FIELD  (4 states × 3 sizes = 12) ───────────
// ══════════════════════════════════════════════════════════════
const INPUT_STATES = {
  default:  { border: 'border-secondary', borderW: 1, bg: 'input',          labelColor: 'foreground-primary', phColor: 'foreground-muted', compOpacity: 1 },
  focus:    { border: 'brand-deep',       borderW: 2, bg: 'input',          labelColor: 'foreground-primary', phColor: 'foreground-muted', compOpacity: 1 },
  error:    { border: 'danger-soft',      borderW: 2, bg: 'input',          labelColor: 'danger-soft',        phColor: 'foreground-muted', compOpacity: 1 },
  disabled: { border: 'border-secondary', borderW: 1, bg: 'surface-default', labelColor: 'foreground-muted',  phColor: 'foreground-muted', compOpacity: 0.5 },
};

const INPUT_SIZES = {
  sm: { w: 240, inputH: 32, ph: 10, labelKey: 'label-xs-medium', phSize: 12, phWeight: 'Regular', fieldGap: 4 },
  md: { w: 280, inputH: 36, ph: 12, labelKey: 'body-sm-medium',  phSize: 14, phWeight: 'Regular', fieldGap: 6 },
  lg: { w: 320, inputH: 40, ph: 16, labelKey: 'body-sm-medium',  phSize: 14, phWeight: 'Regular', fieldGap: 6 },
};

async function generateInputAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Input');
    step = 'fonts';  await loadFonts();

    var INP_H_GAP = 380;
    var INP_V_GAP = 140;

    var components  = [];
    var stateKeys   = Object.keys(INPUT_STATES);
    var sizeEntries = Object.entries(INPUT_SIZES);
    var nSizes      = sizeEntries.length;

    for (var si = 0; si < stateKeys.length; si++) {
      var stName = stateKeys[si];
      var stConf = INPUT_STATES[stName];
      for (var zi = 0; zi < sizeEntries.length; zi++) {
        var zName = sizeEntries[zi][0];
        var zConf = sizeEntries[zi][1];
        step = 'comp[' + stName + '/' + zName + ']';

        var comp = figma.createComponent();
        comp.name = 'state=' + stName + ', size=' + zName;
        comp.x = si * INP_H_GAP;
        comp.y = zi * INP_V_GAP;

        comp.layoutMode            = 'VERTICAL';
        comp.primaryAxisAlignItems = 'MIN';
        comp.counterAxisAlignItems = 'MIN';
        comp.resize(zConf.w, 10);
        comp.primaryAxisSizingMode = 'AUTO';
        comp.counterAxisSizingMode = 'FIXED';
        comp.itemSpacing   = zConf.fieldGap;
        comp.paddingLeft   = 0; comp.paddingRight  = 0;
        comp.paddingTop    = 0; comp.paddingBottom = 0;
        comp.fills = [];

        var labelNode = makeText('Label', { colorTok: stConf.labelColor, typographyKey: zConf.labelKey });
        comp.appendChild(labelNode);
        try { labelNode.layoutSizingHorizontal = 'FILL'; } catch (_) {}

        var inputBox = figma.createFrame();
        inputBox.name = 'input-box';
        inputBox.layoutMode            = 'HORIZONTAL';
        inputBox.primaryAxisAlignItems = 'CENTER';
        inputBox.counterAxisAlignItems = 'CENTER';
        inputBox.primaryAxisSizingMode = 'FIXED';
        inputBox.counterAxisSizingMode = 'FIXED';
        inputBox.resize(zConf.w, zConf.inputH);
        inputBox.paddingLeft  = zConf.ph; inputBox.paddingRight  = zConf.ph;
        inputBox.paddingTop   = 0;        inputBox.paddingBottom = 0;
        inputBox.itemSpacing  = 8;
        inputBox.cornerRadius = RADIUS.md;
        inputBox.fills   = solid(tok(stConf.bg));
        inputBox.strokes = solid(tok(stConf.border));
        inputBox.strokeWeight = stConf.borderW;
        inputBox.strokeAlign  = 'INSIDE';

        var ph = makeText('Placeholder text', { colorTok: stConf.phColor, typographyKey: 'body-sm-medium' });
        inputBox.appendChild(ph);
        try { ph.layoutSizingHorizontal = 'FILL'; } catch (_) {}

        comp.appendChild(inputBox);
        try { inputBox.layoutSizingHorizontal = 'FILL'; } catch (_) {}

        if (stConf.compOpacity < 1) { comp.opacity = stConf.compOpacity; }
        components.push(comp);
      }
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Input';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, INP_H_GAP, INP_V_GAP, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Input', {
      hGap: INP_H_GAP, vGap: INP_V_GAP,
      numCols: stateKeys.length,
      numRows: nSizes,
      colHeaders: stateKeys,
      rowGroups: [
        { label: 'SM', rowIndex: 0 },
        { label: 'MD', rowIndex: 1 },
        { label: 'LG', rowIndex: 2 },
      ],
    });
    wrapper.x = pos.x;
    wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Input 시스템 생성 및 정렬 완료!');
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    figma.notify('❌ Input[' + step + ']: ' + msg, { error: true });
    console.error('[Input][' + step + ']', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 3: BADGE  (5 variants) ──────────────────────────────
// ══════════════════════════════════════════════════════════════
const BADGE_VARIANTS = {
  neutral: { bgColor: 'foreground-muted',  bgOpacity: 0.15, textColor: 'foreground-tertiary', label: 'Neutral' },
  success: { bgColor: 'positive-default',  bgOpacity: 0.15, textColor: 'positive-soft',       label: 'Success' },
  warning: { bgColor: 'caution-default',   bgOpacity: 0.15, textColor: 'caution-soft',         label: 'Warning' },
  danger:  { bgColor: 'danger-default',    bgOpacity: 0.15, textColor: 'danger-soft',          label: 'Danger'  },
  info:    { bgColor: 'primary-default',   bgOpacity: 0.15, textColor: 'foreground-secondary', label: 'Info'    },
};

async function generateBadgeAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Badge');
    step = 'fonts';  await loadFonts();

    var BADGE_H_GAP = 140;

    var components = [];
    var varKeys    = Object.keys(BADGE_VARIANTS);

    for (var vi = 0; vi < varKeys.length; vi++) {
      var vName = varKeys[vi];
      var vConf = BADGE_VARIANTS[vName];
      step = 'comp[' + vName + ']';

      var comp = figma.createComponent();
      comp.name = 'variant=' + vName;
      comp.x = vi * BADGE_H_GAP;
      comp.y = 0;

      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.paddingLeft   = 8; comp.paddingRight  = 8;
      comp.paddingTop    = 2; comp.paddingBottom = 2;
      comp.itemSpacing   = 4;
      comp.cornerRadius  = 9999;
      comp.strokes       = [];
      comp.fills = solidOpacity(tok(vConf.bgColor), vConf.bgOpacity);

      var lbl = makeText(vConf.label, { colorTok: vConf.textColor, typographyKey: 'label-xs-caps-semibold' });
      comp.appendChild(lbl);
      components.push(comp);
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Badge';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, BADGE_H_GAP, 80, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Badge', {
      hGap: BADGE_H_GAP, vGap: 80,
      numCols: varKeys.length,
      numRows: 1,
      colHeaders: varKeys,
      rowGroups: [],
    });
    wrapper.x = pos.x;
    wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Badge 시스템 생성 및 정렬 완료!');
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    figma.notify('❌ Badge[' + step + ']: ' + msg, { error: true });
    console.error('[Badge][' + step + ']', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 4: CHECKBOX  (3 states) ─────────────────────────────
// ══════════════════════════════════════════════════════════════
const CHECKBOX_STATES = {
  unchecked: { bg: 'input',           border: 'border-secondary', hasCheck: false, labelColor: 'foreground-primary', compOpacity: 1 },
  checked:   { bg: 'primary-default', border: 'primary-default', hasCheck: true,  labelColor: 'foreground-primary', compOpacity: 1 },
  disabled:  { bg: 'surface-hover',   border: 'border-secondary', hasCheck: false, labelColor: 'foreground-muted',   compOpacity: 0.5 },
};

async function generateCheckboxAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Checkbox');
    step = 'fonts';  await loadFonts();

    var CB_H_GAP = 240;
    var components = [];
    var stateKeys  = Object.keys(CHECKBOX_STATES);

    for (var si = 0; si < stateKeys.length; si++) {
      var sName = stateKeys[si];
      var sConf = CHECKBOX_STATES[sName];
      step = 'comp[' + sName + ']';

      var comp = figma.createComponent();
      comp.name = 'state=' + sName;
      comp.x = si * CB_H_GAP;
      comp.y = 0;

      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.itemSpacing = 8;
      comp.fills = [];

      var box = figma.createFrame();
      box.name = 'box';
      box.resize(16, 16);
      box.layoutMode            = 'VERTICAL';
      box.primaryAxisAlignItems = 'CENTER';
      box.counterAxisAlignItems = 'CENTER';
      box.primaryAxisSizingMode = 'FIXED';
      box.counterAxisSizingMode = 'FIXED';
      box.cornerRadius  = 4;
      box.fills   = solid(tok(sConf.bg));
      box.strokes = solid(tok(sConf.border));
      box.strokeWeight = 1.5;
      box.strokeAlign  = 'INSIDE';

      if (sConf.hasCheck) {
        var check = makeText('✓', { size: 10, weight: 'Medium', colorTok: 'foreground-strong' });
        check.textAlignHorizontal = 'CENTER';
        box.appendChild(check);
      }

      var label = makeText('Checkbox label', { colorTok: sConf.labelColor, typographyKey: 'body-sm-medium' });
      comp.appendChild(box);
      comp.appendChild(label);
      if (sConf.compOpacity < 1) { comp.opacity = sConf.compOpacity; }
      components.push(comp);
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Checkbox';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, CB_H_GAP, 80, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Checkbox', {
      hGap: CB_H_GAP, vGap: 80,
      numCols: stateKeys.length,
      numRows: 1,
      colHeaders: stateKeys,
      rowGroups: [],
    });
    wrapper.x = pos.x;
    wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Checkbox 시스템 생성 및 정렬 완료!');
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    figma.notify('❌ Checkbox[' + step + ']: ' + msg, { error: true });
    console.error('[Checkbox][' + step + ']', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 5: RADIO  (3 states) ────────────────────────────────
// ══════════════════════════════════════════════════════════════
const RADIO_STATES = {
  unchecked: { bg: 'input',           border: 'border-secondary', hasDot: false, labelColor: 'foreground-primary', compOpacity: 1 },
  checked:   { bg: 'primary-default', border: 'primary-default', hasDot: true,  labelColor: 'foreground-primary', compOpacity: 1 },
  disabled:  { bg: 'surface-hover',   border: 'border-secondary', hasDot: false, labelColor: 'foreground-muted',   compOpacity: 0.5 },
};

async function generateRadioAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Radio');
    step = 'fonts';  await loadFonts();

    var RADIO_H_GAP = 240;
    var components = [];
    var stateKeys  = Object.keys(RADIO_STATES);

    for (var si = 0; si < stateKeys.length; si++) {
      var sName = stateKeys[si];
      var sConf = RADIO_STATES[sName];
      step = 'comp[' + sName + ']';

      var comp = figma.createComponent();
      comp.name = 'state=' + sName;
      comp.x = si * RADIO_H_GAP;
      comp.y = 0;

      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.itemSpacing = 8;
      comp.fills = [];

      var circle = figma.createFrame();
      circle.name = 'radio';
      circle.resize(16, 16);
      circle.layoutMode   = 'NONE';
      circle.cornerRadius = 8;
      circle.fills   = solid(tok(sConf.bg));
      circle.strokes = solid(tok(sConf.border));
      circle.strokeWeight = 1.5;
      circle.strokeAlign  = 'INSIDE';

      if (sConf.hasDot) {
        var dot = figma.createEllipse();
        dot.resize(6, 6);
        dot.fills = solid(tok('foreground-strong'));
        dot.x = 5; dot.y = 5;
        circle.appendChild(dot);
      }

      var label = makeText('Radio option', { colorTok: sConf.labelColor, typographyKey: 'body-sm-medium' });
      comp.appendChild(circle);
      comp.appendChild(label);
      if (sConf.compOpacity < 1) { comp.opacity = sConf.compOpacity; }
      components.push(comp);
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Radio';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, RADIO_H_GAP, 80, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Radio', {
      hGap: RADIO_H_GAP, vGap: 80,
      numCols: stateKeys.length,
      numRows: 1,
      colHeaders: stateKeys,
      rowGroups: [],
    });
    wrapper.x = pos.x;
    wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Radio 시스템 생성 및 정렬 완료!');
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    figma.notify('❌ Radio[' + step + ']: ' + msg, { error: true });
    console.error('[Radio][' + step + ']', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 6: SWITCHER  (3 states) ─────────────────────────────
// ══════════════════════════════════════════════════════════════
const SWITCHER_STATES = {
  off:      { trackBg: 'border-secondary', thumbX: 2,  labelColor: 'foreground-primary', compOpacity: 1 },
  on:       { trackBg: 'primary-default',  thumbX: 16, labelColor: 'foreground-primary', compOpacity: 1 },
  disabled: { trackBg: 'surface-hover',    thumbX: 2,  labelColor: 'foreground-muted',   compOpacity: 0.5 },
};

async function generateSwitcherAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Switcher');
    step = 'fonts';  await loadFonts();

    var SW_H_GAP = 240;
    var components = [];
    var stateKeys  = Object.keys(SWITCHER_STATES);

    for (var si = 0; si < stateKeys.length; si++) {
      var sName = stateKeys[si];
      var sConf = SWITCHER_STATES[sName];
      step = 'comp[' + sName + ']';

      var comp = figma.createComponent();
      comp.name = 'state=' + sName;
      comp.x = si * SW_H_GAP;
      comp.y = 0;

      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.itemSpacing = 8;
      comp.fills = [];

      var track = figma.createFrame();
      track.name = 'track';
      track.resize(32, 18);
      track.layoutMode   = 'NONE';
      track.cornerRadius = 9;
      track.fills   = solid(tok(sConf.trackBg));
      track.strokes = [];

      var thumb = figma.createFrame();
      thumb.name = 'thumb';
      thumb.resize(14, 14);
      thumb.layoutMode   = 'NONE';
      thumb.cornerRadius = 7;
      thumb.fills = solid(tok('foreground-strong'));
      thumb.x = sConf.thumbX;
      thumb.y = 2;
      track.appendChild(thumb);

      var label = makeText('Switch label', { colorTok: sConf.labelColor, typographyKey: 'body-sm-medium' });
      comp.appendChild(track);
      comp.appendChild(label);
      if (sConf.compOpacity < 1) { comp.opacity = sConf.compOpacity; }
      components.push(comp);
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Switcher';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, SW_H_GAP, 80, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Switcher', {
      hGap: SW_H_GAP, vGap: 80,
      numCols: stateKeys.length,
      numRows: 1,
      colHeaders: stateKeys,
      rowGroups: [],
    });
    wrapper.x = pos.x;
    wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Switcher 시스템 생성 및 정렬 완료!');
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    figma.notify('❌ Switcher[' + step + ']: ' + msg, { error: true });
    console.error('[Switcher][' + step + ']', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 7: SELECT / DROPDOWN  (4 states × 3 sizes = 12) ─────
// ══════════════════════════════════════════════════════════════
const SELECT_STATES = {
  default:  { border: 'border-secondary', borderW: 1, bg: 'input',           textColor: 'foreground-muted',   compOpacity: 1   },
  open:     { border: 'brand-deep',       borderW: 2, bg: 'input',           textColor: 'foreground-primary', compOpacity: 1   },
  selected: { border: 'border-secondary', borderW: 1, bg: 'input',           textColor: 'foreground-primary', compOpacity: 1   },
  disabled: { border: 'border-secondary', borderW: 1, bg: 'surface-default', textColor: 'foreground-muted',   compOpacity: 0.5 },
};
const SELECT_SIZES = {
  sm: { w: 200, h: 32, ph: 10 },
  md: { w: 240, h: 36, ph: 12 },
  lg: { w: 280, h: 40, ph: 16 },
};

async function generateSelectAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Select');
    step = 'fonts';  await loadFonts();
    var SEL_H = 360, SEL_V = 140;
    var components = [];
    var stKeys    = Object.keys(SELECT_STATES);
    var szEntries = Object.entries(SELECT_SIZES);
    for (var si = 0; si < stKeys.length; si++) {
      var stN = stKeys[si]; var stC = SELECT_STATES[stN];
      for (var zi = 0; zi < szEntries.length; zi++) {
        var zN = szEntries[zi][0]; var zC = szEntries[zi][1];
        step = 'comp[' + stN + '/' + zN + ']';
        var comp = figma.createComponent();
        comp.name = 'state=' + stN + ', size=' + zN;
        comp.x = si * SEL_H; comp.y = zi * SEL_V;
        comp.layoutMode = 'HORIZONTAL';
        comp.primaryAxisAlignItems = 'CENTER'; comp.counterAxisAlignItems = 'CENTER';
        comp.primaryAxisSizingMode = 'FIXED';  comp.counterAxisSizingMode = 'FIXED';
        comp.resize(zC.w, zC.h);
        comp.paddingLeft = zC.ph; comp.paddingRight = zC.ph;
        comp.paddingTop = 0; comp.paddingBottom = 0; comp.itemSpacing = 8;
        comp.cornerRadius = RADIUS.md;
        comp.fills   = solid(tok(stC.bg));
        comp.strokes = solid(tok(stC.border)); comp.strokeWeight = stC.borderW; comp.strokeAlign = 'INSIDE';
        var valStr = (stN === 'selected') ? 'Option selected' : 'Select option...';
        var val = makeText(valStr, { colorTok: stC.textColor, typographyKey: 'body-sm-medium' });
        comp.appendChild(val);
        try { val.layoutSizingHorizontal = 'FILL'; } catch (_) {}
        var chev = makeIconSlot(12);
        comp.appendChild(chev);
        if (stC.compOpacity < 1) { comp.opacity = stC.compOpacity; }
        components.push(comp);
      }
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Select'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, SEL_H, SEL_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Select', {
      hGap: SEL_H, vGap: SEL_V, numCols: stKeys.length, numRows: szEntries.length,
      colHeaders: stKeys,
      rowGroups: [{ label: 'SM', rowIndex: 0 }, { label: 'MD', rowIndex: 1 }, { label: 'LG', rowIndex: 2 }],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Select 생성 완료!');
  } catch (err) { figma.notify('❌ Select[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 8: SEARCH FIELD  (4 states × 3 sizes = 12) ──────────
// ══════════════════════════════════════════════════════════════
const SEARCH_STATES = {
  default:  { border: 'border-secondary', borderW: 1, bg: 'input',           phColor: 'foreground-muted',   compOpacity: 1   },
  focus:    { border: 'brand-deep',       borderW: 2, bg: 'input',           phColor: 'foreground-muted',   compOpacity: 1   },
  filled:   { border: 'border-secondary', borderW: 1, bg: 'input',           phColor: 'foreground-primary', compOpacity: 1   },
  disabled: { border: 'border-secondary', borderW: 1, bg: 'surface-default', phColor: 'foreground-muted',   compOpacity: 0.5 },
};
const SEARCH_SIZES = {
  sm: { w: 240, h: 32, ph: 10 },
  md: { w: 280, h: 36, ph: 12 },
  lg: { w: 320, h: 40, ph: 16 },
};

async function generateSearchFieldAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('SearchField');
    step = 'fonts';  await loadFonts();
    var SRC_H = 380, SRC_V = 140;
    var components = [];
    var stKeys    = Object.keys(SEARCH_STATES);
    var szEntries = Object.entries(SEARCH_SIZES);
    for (var si = 0; si < stKeys.length; si++) {
      var stN = stKeys[si]; var stC = SEARCH_STATES[stN];
      for (var zi = 0; zi < szEntries.length; zi++) {
        var zN = szEntries[zi][0]; var zC = szEntries[zi][1];
        step = 'comp[' + stN + '/' + zN + ']';
        var comp = figma.createComponent();
        comp.name = 'state=' + stN + ', size=' + zN;
        comp.x = si * SRC_H; comp.y = zi * SRC_V;
        comp.layoutMode = 'HORIZONTAL';
        comp.primaryAxisAlignItems = 'CENTER'; comp.counterAxisAlignItems = 'CENTER';
        comp.primaryAxisSizingMode = 'FIXED';  comp.counterAxisSizingMode = 'FIXED';
        comp.resize(zC.w, zC.h);
        comp.paddingLeft = zC.ph; comp.paddingRight = zC.ph;
        comp.paddingTop = 0; comp.paddingBottom = 0; comp.itemSpacing = 8;
        comp.cornerRadius = RADIUS.md;
        comp.fills   = solid(tok(stC.bg));
        comp.strokes = solid(tok(stC.border)); comp.strokeWeight = stC.borderW; comp.strokeAlign = 'INSIDE';
        var iconTxt = makeIconSlot(16);
        comp.appendChild(iconTxt);
        var phStr = (stN === 'filled') ? 'Search results...' : 'Search...';
        var ph = makeText(phStr, { colorTok: stC.phColor, typographyKey: 'body-sm-medium' });
        comp.appendChild(ph);
        try { ph.layoutSizingHorizontal = 'FILL'; } catch (_) {}
        if (stC.compOpacity < 1) { comp.opacity = stC.compOpacity; }
        components.push(comp);
      }
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'SearchField'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, SRC_H, SRC_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'SearchField', {
      hGap: SRC_H, vGap: SRC_V, numCols: stKeys.length, numRows: szEntries.length,
      colHeaders: stKeys,
      rowGroups: [{ label: 'SM', rowIndex: 0 }, { label: 'MD', rowIndex: 1 }, { label: 'LG', rowIndex: 2 }],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ SearchField 생성 완료!');
  } catch (err) { figma.notify('❌ SearchField[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 9: PROGRESS BAR  (4 colors × 5 values = 20) ─────────
// ══════════════════════════════════════════════════════════════
const PROGRESS_COLORS = {
  brand:   { fillColor: 'brand-default'    },
  success: { fillColor: 'positive-default' },
  warning: { fillColor: 'caution-default'  },
  danger:  { fillColor: 'danger-default'   },
};
const PROGRESS_VALUES = [0, 25, 50, 75, 100];
const PROGRESS_BAR_W = 200;
const PROGRESS_BAR_H = 8;

async function generateProgressAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Progress');
    step = 'fonts';  await loadFonts();
    var PRG_H = 300, PRG_V = 100;
    var components = [];
    var colorKeys = Object.keys(PROGRESS_COLORS);
    for (var ci = 0; ci < colorKeys.length; ci++) {
      var cN = colorKeys[ci]; var cC = PROGRESS_COLORS[cN];
      for (var vi = 0; vi < PROGRESS_VALUES.length; vi++) {
        var pct = PROGRESS_VALUES[vi];
        step = 'comp[' + cN + '/' + pct + ']';
        var comp = figma.createComponent();
        comp.name = 'color=' + cN + ', value=' + pct;
        comp.x = vi * PRG_H; comp.y = ci * PRG_V;
        comp.layoutMode = 'NONE';
        comp.resize(PROGRESS_BAR_W, PROGRESS_BAR_H);
        comp.cornerRadius = 4;
        comp.fills   = solid(tok('surface-hover'));
        comp.strokes = [];
        if (pct > 0) {
          var fill = figma.createFrame();
          fill.name = 'fill';
          fill.resize(Math.max(1, Math.round(PROGRESS_BAR_W * pct / 100)), PROGRESS_BAR_H);
          fill.layoutMode = 'NONE';
          fill.cornerRadius = 4;
          fill.fills   = solid(tok(cC.fillColor));
          fill.strokes = [];
          fill.x = 0; fill.y = 0;
          comp.appendChild(fill);
        }
        components.push(comp);
      }
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Progress'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, PRG_H, PRG_V, cs.height);
    step = 'wrap';
    var pctHeaders = PROGRESS_VALUES.map(function(v) { return v + '%'; });
    var wrapper = buildAtomFrame(cs, 'Progress', {
      hGap: PRG_H, vGap: PRG_V, numCols: PROGRESS_VALUES.length, numRows: colorKeys.length,
      colHeaders: pctHeaders,
      rowGroups: colorKeys.map(function(k, i) { return { label: k, rowIndex: i }; }),
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Progress 생성 완료!');
  } catch (err) { figma.notify('❌ Progress[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 10: AVATAR  (4 sizes × 2 states = 8) ────────────────
// ══════════════════════════════════════════════════════════════
const AVATAR_SIZES = {
  xs: { d: 24, fontSize:  9, weight: 'Medium'    },
  sm: { d: 32, fontSize: 11, weight: 'Medium'    },
  md: { d: 40, fontSize: 14, weight: 'Medium'    },
  lg: { d: 56, fontSize: 18, weight: 'Semi Bold' },
};
const AVATAR_STATES = {
  default: { showIndicator: false },
  online:  { showIndicator: true  },
};

async function generateAvatarAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Avatar');
    step = 'fonts';  await loadFonts();
    var AVT_H = 160, AVT_V = 120;
    var components = [];
    var sizeKeys  = Object.keys(AVATAR_SIZES);
    var stateKeys = Object.keys(AVATAR_STATES);
    for (var si = 0; si < sizeKeys.length; si++) {
      var sN = sizeKeys[si]; var sC = AVATAR_SIZES[sN];
      for (var ti = 0; ti < stateKeys.length; ti++) {
        var tN = stateKeys[ti]; var tC = AVATAR_STATES[tN];
        step = 'comp[' + sN + '/' + tN + ']';
        var comp = figma.createComponent();
        comp.name = 'size=' + sN + ', state=' + tN;
        comp.x = si * AVT_H; comp.y = ti * AVT_V;
        comp.layoutMode = 'NONE';
        comp.resize(sC.d, sC.d);
        comp.cornerRadius = sC.d / 2;
        comp.fills   = solidOpacity(tok('brand-default'), 0.25);
        comp.strokes = [{ type: 'SOLID', color: tok('brand-soft'), opacity: 0.4 }];
        comp.strokeWeight = 1; comp.strokeAlign = 'INSIDE';
        var initials = makeText('HJ', { size: sC.fontSize, weight: sC.weight, colorTok: 'brand-soft' });
        comp.appendChild(initials);
        initials.x = Math.round((sC.d - initials.width)  / 2);
        initials.y = Math.round((sC.d - initials.height) / 2);
        if (tC.showIndicator) {
          var dotD = Math.max(6, Math.round(sC.d * 0.22));
          var dot = figma.createEllipse();
          dot.name = 'indicator';
          dot.resize(dotD, dotD);
          dot.fills   = solid(tok('positive-default'));
          dot.strokes = solid(tok('background'));
          dot.strokeWeight = 1.5;
          dot.x = sC.d - dotD;
          dot.y = sC.d - dotD;
          comp.appendChild(dot);
        }
        components.push(comp);
      }
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Avatar'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, AVT_H, AVT_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Avatar', {
      hGap: AVT_H, vGap: AVT_V, numCols: sizeKeys.length, numRows: stateKeys.length,
      colHeaders: sizeKeys,
      rowGroups: stateKeys.map(function(k, i) { return { label: k, rowIndex: i }; }),
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Avatar 생성 완료!');
  } catch (err) { figma.notify('❌ Avatar[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 11: ALERT  (4 variants) ─────────────────────────────
// ══════════════════════════════════════════════════════════════
const ALERT_VARIANTS = {
  info:        { border: 'primary-default',  bgColor: 'primary-default',  bgOpacity: 0.08, icon: 'i', iconColor: 'foreground-secondary', titleColor: 'foreground-primary', textColor: 'foreground-secondary' },
  success:     { border: 'positive-default', bgColor: 'positive-default', bgOpacity: 0.08, icon: '✓', iconColor: 'positive-soft',        titleColor: 'foreground-primary', textColor: 'foreground-secondary' },
  warning:     { border: 'caution-default',  bgColor: 'caution-default',  bgOpacity: 0.08, icon: '!', iconColor: 'caution-soft',          titleColor: 'foreground-primary', textColor: 'foreground-secondary' },
  destructive: { border: 'danger-default',   bgColor: 'danger-default',   bgOpacity: 0.08, icon: '✕', iconColor: 'danger-soft',           titleColor: 'foreground-primary', textColor: 'foreground-secondary' },
};

async function generateAlertAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Alert');
    step = 'fonts';  await loadFonts();
    var ALT_H = 360, ALT_V = 120;
    var components = [];
    var varKeys = Object.keys(ALERT_VARIANTS);
    for (var vi = 0; vi < varKeys.length; vi++) {
      var vN = varKeys[vi]; var vC = ALERT_VARIANTS[vN];
      step = 'comp[' + vN + ']';
      var comp = figma.createComponent();
      comp.name = 'variant=' + vN;
      comp.x = vi * ALT_H; comp.y = 0;
      comp.layoutMode = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'MIN'; comp.counterAxisAlignItems = 'MIN';
      comp.primaryAxisSizingMode = 'FIXED'; comp.counterAxisSizingMode = 'AUTO';
      comp.resize(300, 10);
      comp.paddingLeft = 16; comp.paddingRight = 16;
      comp.paddingTop = 14; comp.paddingBottom = 14;
      comp.itemSpacing = 12;
      comp.cornerRadius = RADIUS.lg;
      comp.fills   = solidOpacity(tok(vC.bgColor), vC.bgOpacity);
      comp.strokes = solid(tok(vC.border)); comp.strokeWeight = 1; comp.strokeAlign = 'INSIDE';

      // Icon slot — designer drops in the real lucide icon
      var iconBox = makeIconSlot(16);
      comp.appendChild(iconBox);

      // Content column
      var textCol = figma.createFrame();
      textCol.name = 'content';
      textCol.layoutMode = 'VERTICAL';
      textCol.primaryAxisAlignItems = 'MIN'; textCol.counterAxisAlignItems = 'MIN';
      textCol.primaryAxisSizingMode = 'AUTO'; textCol.counterAxisSizingMode = 'AUTO';
      textCol.itemSpacing = 4; textCol.fills = [];
      try { textCol.layoutSizingHorizontal = 'FILL'; } catch (_) {}
      var titleTxt = makeText('Alert title', { colorTok: vC.titleColor, typographyKey: 'body-sm-medium' });
      var descTxt  = makeText('This is a description message for the alert.', { colorTok: vC.textColor, typographyKey: 'label-xs-medium' });
      textCol.appendChild(titleTxt);
      textCol.appendChild(descTxt);
      comp.appendChild(textCol);
      components.push(comp);
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Alert'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, ALT_H, ALT_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Alert', {
      hGap: ALT_H, vGap: ALT_V, numCols: varKeys.length, numRows: 1,
      colHeaders: varKeys, rowGroups: [],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Alert 생성 완료!');
  } catch (err) { figma.notify('❌ Alert[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 12: SPINNER  (3 sizes) ──────────────────────────────
// ══════════════════════════════════════════════════════════════
const SPINNER_SIZES = {
  sm: { d: 16, sw: 2 },
  md: { d: 24, sw: 3 },
  lg: { d: 32, sw: 4 },
};

async function generateSpinnerAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Spinner');
    step = 'fonts';  await loadFonts();
    var SPN_H = 120, SPN_V = 80;
    var components = [];
    var szKeys = Object.keys(SPINNER_SIZES);
    for (var si = 0; si < szKeys.length; si++) {
      var sN = szKeys[si]; var sC = SPINNER_SIZES[sN];
      step = 'comp[' + sN + ']';
      var comp = figma.createComponent();
      comp.name = 'size=' + sN;
      comp.x = si * SPN_H; comp.y = 0;
      comp.layoutMode = 'NONE';
      comp.resize(sC.d, sC.d);
      comp.fills = []; comp.strokes = [];
      // Track: full ring (fill-based donut, innerRadius = 0.75 gives consistent ring width)
      var track = figma.createEllipse();
      track.name = 'track';
      track.resize(sC.d, sC.d);
      track.fills   = solid(tok('border-primary'));
      track.strokes = [];
      track.arcData = { startingAngle: 0, endingAngle: 0, innerRadius: 0.75 };
      track.x = 0; track.y = 0;
      comp.appendChild(track);
      // Arc: 270-degree colored ring segment (on top), starting from 12 o'clock
      var arc = figma.createEllipse();
      arc.name = 'arc';
      arc.resize(sC.d, sC.d);
      arc.fills   = solid(tok('brand-default'));
      arc.strokes = [];
      arc.arcData = { startingAngle: -Math.PI / 2, endingAngle: Math.PI, innerRadius: 0.75 };
      arc.x = 0; arc.y = 0;
      comp.appendChild(arc);
      components.push(comp);
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Spinner'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, SPN_H, SPN_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Spinner', {
      hGap: SPN_H, vGap: SPN_V, numCols: szKeys.length, numRows: 1,
      colHeaders: szKeys, rowGroups: [],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Spinner 생성 완료!');
  } catch (err) { figma.notify('❌ Spinner[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 13: SEPARATOR  (2 orientations) ─────────────────────
// ══════════════════════════════════════════════════════════════
async function generateSeparatorAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Separator');
    step = 'fonts';  await loadFonts();
    var SEP_H = 280, SEP_V = 100;
    var components = [];
    var hComp = figma.createComponent();
    hComp.name = 'orientation=horizontal';
    hComp.x = 0; hComp.y = 0;
    hComp.layoutMode = 'NONE';
    hComp.resize(240, 1);
    hComp.fills   = solid(tok('border-secondary'));
    hComp.strokes = [];
    components.push(hComp);
    var vComp = figma.createComponent();
    vComp.name = 'orientation=vertical';
    vComp.x = SEP_H; vComp.y = 0;
    vComp.layoutMode = 'NONE';
    vComp.resize(1, 80);
    vComp.fills   = solid(tok('border-secondary'));
    vComp.strokes = [];
    components.push(vComp);
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Separator'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, SEP_H, SEP_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Separator', {
      hGap: SEP_H, vGap: SEP_V, numCols: 2, numRows: 1,
      colHeaders: ['horizontal', 'vertical'], rowGroups: [],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Separator 생성 완료!');
  } catch (err) { figma.notify('❌ Separator[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 14: TOGGLE / ICON BUTTON  (4 states × 3 sizes = 12) ─
// ══════════════════════════════════════════════════════════════
const TOGGLE_STATES = {
  default:  { bg: null,            stroke: 'border-secondary', strokeW: 1, iconColor: 'foreground-secondary', compOpacity: 1   },
  active:   { bg: 'brand-deep',    stroke: 'brand-deep',       strokeW: 1, iconColor: 'foreground-strong',    compOpacity: 1   },
  hover:    { bg: 'surface-hover', stroke: 'border-primary',   strokeW: 1, iconColor: 'foreground-primary',   compOpacity: 1   },
  disabled: { bg: null,            stroke: 'border-secondary', strokeW: 1, iconColor: 'foreground-muted',     compOpacity: 0.5 },
};
const TOGGLE_SIZES = {
  sm: { s: 28, iconSize: 12 },
  md: { s: 32, iconSize: 14 },
  lg: { s: 36, iconSize: 16 },
};

async function generateToggleAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Toggle');
    step = 'fonts';  await loadFonts();
    var TGL_H = 140, TGL_V = 120;
    var components = [];
    var stKeys    = Object.keys(TOGGLE_STATES);
    var szEntries = Object.entries(TOGGLE_SIZES);
    for (var si = 0; si < stKeys.length; si++) {
      var stN = stKeys[si]; var stC = TOGGLE_STATES[stN];
      for (var zi = 0; zi < szEntries.length; zi++) {
        var zN = szEntries[zi][0]; var zC = szEntries[zi][1];
        step = 'comp[' + stN + '/' + zN + ']';
        var comp = figma.createComponent();
        comp.name = 'state=' + stN + ', size=' + zN;
        comp.x = si * TGL_H; comp.y = zi * TGL_V;
        comp.layoutMode = 'HORIZONTAL';
        comp.primaryAxisAlignItems = 'CENTER'; comp.counterAxisAlignItems = 'CENTER';
        comp.primaryAxisSizingMode = 'FIXED';  comp.counterAxisSizingMode = 'FIXED';
        comp.resize(zC.s, zC.s);
        comp.paddingLeft = 0; comp.paddingRight = 0;
        comp.paddingTop = 0;  comp.paddingBottom = 0;
        comp.cornerRadius = RADIUS.md;
        comp.fills   = stC.bg ? solid(tok(stC.bg)) : [];
        comp.strokes = solid(tok(stC.stroke)); comp.strokeWeight = stC.strokeW; comp.strokeAlign = 'INSIDE';
        var icon = makeIconSlot(zC.iconSize);
        comp.appendChild(icon);
        if (stC.compOpacity < 1) { comp.opacity = stC.compOpacity; }
        components.push(comp);
      }
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Toggle'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, TGL_H, TGL_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Toggle', {
      hGap: TGL_H, vGap: TGL_V, numCols: stKeys.length, numRows: szEntries.length,
      colHeaders: stKeys,
      rowGroups: [{ label: 'SM', rowIndex: 0 }, { label: 'MD', rowIndex: 1 }, { label: 'LG', rowIndex: 2 }],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Toggle 생성 완료!');
  } catch (err) { figma.notify('❌ Toggle[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── ATOM 16: TOOLTIP  (4 placements) ─────────────────────────
// ══════════════════════════════════════════════════════════════
const TOOLTIP_PLACEMENTS = ['top', 'right', 'bottom', 'left'];

async function generateTooltipAtom() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('Tooltip');
    step = 'fonts';  await loadFonts();
    var TIP_W = 160, TIP_H_INNER = 32, ARROW = 8;
    var TTP_H = 260, TTP_V = 100;
    var components = [];
    for (var pi = 0; pi < TOOLTIP_PLACEMENTS.length; pi++) {
      var placement = TOOLTIP_PLACEMENTS[pi];
      step = 'comp[' + placement + ']';
      var isVert = (placement === 'top' || placement === 'bottom');
      var compW = isVert ? TIP_W : (TIP_W + ARROW + 8);
      var compH = isVert ? (TIP_H_INNER + ARROW + 8) : TIP_H_INNER;
      var comp = figma.createComponent();
      comp.name = 'placement=' + placement;
      comp.x = pi * TTP_H; comp.y = 0;
      comp.layoutMode = 'NONE';
      comp.resize(compW, compH);
      comp.fills = []; comp.strokes = [];
      // Bubble
      var bubble = figma.createFrame();
      bubble.name = 'bubble';
      bubble.layoutMode = 'HORIZONTAL';
      bubble.primaryAxisAlignItems = 'CENTER'; bubble.counterAxisAlignItems = 'CENTER';
      bubble.primaryAxisSizingMode = 'FIXED';  bubble.counterAxisSizingMode = 'FIXED';
      bubble.resize(TIP_W, TIP_H_INNER);
      bubble.paddingLeft = 10; bubble.paddingRight = 10;
      bubble.paddingTop = 6;   bubble.paddingBottom = 6;
      bubble.cornerRadius = RADIUS.md;
      bubble.fills   = solid(tok('surface-hover'));
      bubble.strokes = solid(tok('border-primary')); bubble.strokeWeight = 1; bubble.strokeAlign = 'INSIDE';
      var tipTxt = makeText('Tooltip label', { colorTok: 'foreground-secondary', typographyKey: 'label-xs-medium' });
      bubble.appendChild(tipTxt);
      if (placement === 'top')    { bubble.x = 0; bubble.y = 0; }
      if (placement === 'bottom') { bubble.x = 0; bubble.y = ARROW + 8; }
      if (placement === 'left')   { bubble.x = 0; bubble.y = 0; }
      if (placement === 'right')  { bubble.x = ARROW + 8; bubble.y = 0; }
      comp.appendChild(bubble);
      // Arrow: proper triangle vector for each placement direction
      var arrowVec = figma.createVector();
      arrowVec.name = 'arrow';
      arrowVec.fills   = solid(tok('border-primary'));
      arrowVec.strokes = [];
      if (placement === 'top') {
        // Downward triangle — base at top, tip at bottom
        arrowVec.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 0 0 L 8 0 L 4 6 Z' }];
        comp.appendChild(arrowVec);
        arrowVec.x = Math.round(TIP_W / 2) - 4;
        arrowVec.y = TIP_H_INNER - 1;
      } else if (placement === 'bottom') {
        // Upward triangle — tip at top, base at bottom
        arrowVec.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 0 6 L 8 6 L 4 0 Z' }];
        comp.appendChild(arrowVec);
        arrowVec.x = Math.round(TIP_W / 2) - 4;
        arrowVec.y = 10;
      } else if (placement === 'left') {
        // Rightward triangle — base at left, tip at right
        arrowVec.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 0 0 L 0 8 L 6 4 Z' }];
        comp.appendChild(arrowVec);
        arrowVec.x = TIP_W - 1;
        arrowVec.y = Math.round(TIP_H_INNER / 2) - 4;
      } else {
        // Leftward triangle — base at right, tip at left
        arrowVec.vectorPaths = [{ windingRule: 'NONZERO', data: 'M 6 0 L 6 8 L 0 4 Z' }];
        comp.appendChild(arrowVec);
        arrowVec.x = 10;
        arrowVec.y = Math.round(TIP_H_INNER / 2) - 4;
      }
      components.push(comp);
    }
    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'Tooltip'; try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, TTP_H, TTP_V, cs.height);
    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'Tooltip', {
      hGap: TTP_H, vGap: TTP_V, numCols: TOOLTIP_PLACEMENTS.length, numRows: 1,
      colHeaders: TOOLTIP_PLACEMENTS, rowGroups: [],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('✅ Tooltip 생성 완료!');
  } catch (err) { figma.notify('❌ Tooltip[' + step + ']: ' + ((err && err.message) || err), { error: true }); }
}

// ══════════════════════════════════════════════════════════════
// ── GENERATE ALL ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
async function generateAllAtoms() {
  try {
    figma.notify('⏳ Atomic Components 시스템 생성 중...', { timeout: 60000 });
    await generateButtonAtom();
    await generateInputAtom();
    await generateBadgeAtom();
    await generateCheckboxAtom();
    await generateRadioAtom();
    await generateSwitcherAtom();
    await generateSelectAtom();
    await generateSearchFieldAtom();
    await generateProgressAtom();
    await generateAvatarAtom();
    await generateAlertAtom();
    await generateSpinnerAtom();
    await generateSeparatorAtom();
    await generateToggleAtom();
    await generateTooltipAtom();
    figma.notify('✅ 모든 Atomic Components 생성 완료! (15개)');
  } catch (err) {
    var msg = (err && err.message) ? err.message : String(err);
    figma.notify('❌ generateAllAtoms: ' + msg, { error: true });
    console.error('[generateAllAtoms]', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── MESSAGE HANDLER ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
figma.showUI(__html__, { width: 300, height: 620 });

figma.ui.onmessage = async function(msg) {
  try {
    switch (msg.type) {
      case 'generate-all':          await generateAllAtoms();          break;
      case 'generate-button':       await generateButtonAtom();        break;
      case 'generate-input':        await generateInputAtom();         break;
      case 'generate-badge':        await generateBadgeAtom();         break;
      case 'generate-checkbox':     await generateCheckboxAtom();      break;
      case 'generate-radio':        await generateRadioAtom();         break;
      case 'generate-switcher':     await generateSwitcherAtom();      break;
      case 'generate-select':       await generateSelectAtom();        break;
      case 'generate-search-field': await generateSearchFieldAtom();   break;
      case 'generate-progress':     await generateProgressAtom();      break;
      case 'generate-avatar':       await generateAvatarAtom();        break;
      case 'generate-alert':        await generateAlertAtom();         break;
      case 'generate-spinner':      await generateSpinnerAtom();       break;
      case 'generate-separator':    await generateSeparatorAtom();     break;
      case 'generate-toggle':       await generateToggleAtom();        break;
      case 'generate-tooltip':      await generateTooltipAtom();       break;
      default: figma.notify('Unknown action: ' + msg.type, { error: true });
    }
  } catch (err) {
    var m = (err && err.message) ? err.message : String(err);
    figma.notify('❌ 오류: ' + m, { error: true });
    console.error('[Atomic Generator 02a]', err);
  }
};
