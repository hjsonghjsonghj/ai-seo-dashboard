// ============================================================
// Molecule Assembler -- code.js  (plugin-03b)
// Universal Assembly Engine -- project-agnostic
//
// Token colors:   resolved from Figma Local Variables at runtime.
//                 Falls back to FALLBACK_TOKENS when variables not found.
//
// Molecule config: loaded from figma.root sharedPluginData.
//                  Load via ui.html "Load Config" button.
//                  Falls back to built-in defaults when config not found.
//
// Atom index:     read from plugin-03a sharedPluginData.
//                 Falls back to dashed placeholders when atom missing.
//
// Figma Plugin API rules (CLAUDE.md):
//   - No ?. or ??  -- use && and explicit null checks.
//   - combineAsVariants(nodes, figma.currentPage)
//   - counterAxisSizingMode: FIXED or AUTO only (never FILL)
//   - layoutSizingHorizontal = 'FILL' on children for fill-parent
//   - setBoundVariable for spacing (setBoundVariableForLayout does not exist)
// ============================================================

var SHARED_NS   = 'ds_plugin_suite';
var STORAGE_KEY = 'atomIndex_v1';
var CONFIG_KEY  = 'moleculeConfig_v1';

// ── FALLBACK COLOR TOKENS ─────────────────────────────────────
// Used only when Figma Local Variables are not available or the
// token name is not found in the variable collection.
var FALLBACK_TOKENS = {
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
  'danger-default':       { r: 0.937, g: 0.267, b: 0.267 },
  'danger-soft':          { r: 0.973, g: 0.443, b: 0.443 },
  'caution-default':      { r: 0.961, g: 0.620, b: 0.043 },
  'caution-soft':         { r: 0.984, g: 0.749, b: 0.141 },
  'border-primary':       { r: 0.278, g: 0.333, b: 0.412 },
  'border-secondary':     { r: 0.200, g: 0.255, b: 0.333 },
  'chart-citations':      { r: 0.376, g: 0.647, b: 0.980 },
};

var RADIUS = { sm: 6, md: 8, lg: 12, xl: 16 };
var FONT   = 'Inter';

// Typography scale -- generic fallback, not project-specific.
// Used when Figma text styles are not found by name.
var TYPOGRAPHY_MAP = {
  'display-sm-semibold':      { size: 30, lh: 36, weight: 'Semi Bold' },
  'title-sub-semibold':       { size: 16, lh: 24, weight: 'Semi Bold' },
  'body-md-regular':          { size: 16, lh: 24, weight: 'Regular'   },
  'body-md-medium':           { size: 16, lh: 24, weight: 'Medium'    },
  'body-sm-medium':           { size: 14, lh: 20, weight: 'Medium'    },
  'body-micro-medium':        { size: 13, lh: 18, weight: 'Medium'    },
  'body-micro-bold':          { size: 13, lh: 18, weight: 'Bold'      },
  'label-xs-medium':          { size: 12, lh: 16, weight: 'Medium'    },
  'label-micro-medium':       { size: 11, lh: 14, weight: 'Medium'    },
  'label-xs-caps-medium':     { size: 12, lh: 16, weight: 'Medium',    uppercase: true },
  'label-xs-caps-semibold':   { size: 12, lh: 16, weight: 'Semi Bold', uppercase: true },
  'body-micro-caps-semibold': { size: 13, lh: 18, weight: 'Semi Bold', uppercase: true },
};

var LINE_H = { 30:36, 20:28, 18:27, 16:24, 14:20, 13:18, 12:16, 11:14, 10:14, 9:12 };

// ── RUNTIME TOKEN MAP ─────────────────────────────────────────
// Populated at the start of each generator via resolveTokensFromFigma().
var _tokenMap = {};

// Resolve one COLOR Variable to { r, g, b }. Follows VARIABLE_ALIAS chain.
function resolveVariableColor(variable) {
  try {
    var collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
    if (!collection || !collection.modes || collection.modes.length === 0) return null;
    var modeId = collection.modes[0].modeId;
    var value  = variable.valuesByMode[modeId];
    var depth  = 0;
    while (value && value.type === 'VARIABLE_ALIAS' && depth < 5) {
      var aliasVar = figma.variables.getVariableById(value.id);
      if (!aliasVar) break;
      var aliasCol = figma.variables.getVariableCollectionById(aliasVar.variableCollectionId);
      if (!aliasCol || !aliasCol.modes || aliasCol.modes.length === 0) break;
      value = aliasVar.valuesByMode[aliasCol.modes[0].modeId];
      depth++;
    }
    if (value && typeof value.r !== 'undefined') {
      return { r: value.r, g: value.g, b: value.b };
    }
  } catch (_) {}
  return null;
}

// Build runtime token map from Figma Local Variables (COLOR type).
// Stores each variable under multiple normalized key formats so that
// token names used in config (e.g. "primary-default") match regardless
// of how the variable collection is organized ("Primary/Default", etc.).
async function resolveTokensFromFigma() {
  var map = {};
  try {
    var vars = await figma.variables.getLocalVariablesAsync('COLOR');
    if (!vars || vars.length === 0) return map;
    for (var i = 0; i < vars.length; i++) {
      var v   = vars[i];
      var rgb = resolveVariableColor(v);
      if (!rgb) continue;
      var rawName  = v.name;
      var segments = rawName.split('/');

      // leaf:     last segment, spaces converted to dashes
      //           "Primary/Default" -> "default"  (too short, also store full)
      var leaf = segments[segments.length - 1].toLowerCase().replace(/\s+/g, '-');

      // full:     whole path with / replaced by -, spaces to dashes
      //           "colors/primary-default" -> "colors-primary-default"
      var full = rawName.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-');

      // noPfx:    path without the first segment (collection name removed)
      //           "colors/primary/default" -> "primary-default"
      var noPfx = segments.length > 1
        ? segments.slice(1).join('/').toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')
        : full;

      if (!map[leaf])  map[leaf]  = rgb;
      if (!map[full])  map[full]  = rgb;
      if (!map[noPfx]) map[noPfx] = rgb;
    }
  } catch (_) {}
  return map;
}

// Synchronous token lookup -- runtime map first, fallback second.
function tok(name) {
  return _tokenMap[name] || FALLBACK_TOKENS[name] || { r: 1, g: 0, b: 1 };
}

// ── MOLECULE CONFIG ───────────────────────────────────────────
// Config is stored in figma.root sharedPluginData.
// Load it from disk via the "Load Config" button in ui.html.

function loadMoleculeConfig() {
  try {
    var raw = figma.root.getSharedPluginData(SHARED_NS, CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) { return null; }
}

// Returns the config object for one molecule, or {} when not found.
function getMoleculeCfg(name) {
  var config    = loadMoleculeConfig();
  var molecules = config && config.molecules;
  return (molecules && molecules[name]) || {};
}

// ── BASE HELPERS ──────────────────────────────────────────────
function solid(c)            { return [{ type: 'SOLID', color: c }]; }
function solidOpacity(c, op) { return [{ type: 'SOLID', color: c, opacity: op }]; }

async function loadFonts() {
  var fallback = [
    { family: FONT, style: 'Regular'   },
    { family: FONT, style: 'Medium'    },
    { family: FONT, style: 'Semi Bold' },
    { family: FONT, style: 'Bold'      },
  ];
  var styleFonts = [];
  try { styleFonts = figma.getLocalTextStyles().map(function(s) { return s.fontName; }).filter(Boolean); } catch (_) {}
  var all = fallback.concat(styleFonts);
  var seen = {}, unique = [];
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
  var size          = opts.size          || 14;
  var weight        = opts.weight        || 'Medium';
  var colorTok      = opts.colorTok      || 'foreground-primary';
  var lineH         = opts.lineH         || null;
  var typographyKey = opts.typographyKey || null;

  var t = figma.createText();

  if (typographyKey) {
    var style  = findTextStyle(typographyKey);
    var mapDef = TYPOGRAPHY_MAP[typographyKey];
    if (style) {
      try { t.fontName = style.fontName; } catch (_) {
        t.fontName = { family: FONT, style: (mapDef && mapDef.weight) || weight };
      }
    } else {
      t.fontName = { family: FONT, style: (mapDef && mapDef.weight) || weight };
    }
    t.characters = chars;
    if (style) {
      try { t.textStyleId = style.id; } catch (_) {}
    } else if (mapDef) {
      t.fontSize   = mapDef.size;
      t.lineHeight = { value: mapDef.lh, unit: 'PIXELS' };
    } else {
      t.fontSize   = size;
      t.lineHeight = { value: lineH || LINE_H[size] || Math.round(size * 1.4), unit: 'PIXELS' };
    }
  } else {
    t.fontName   = { family: FONT, style: weight };
    t.characters = chars;
    t.fontSize   = size;
    t.lineHeight = { value: lineH || LINE_H[size] || Math.round(size * 1.4), unit: 'PIXELS' };
  }

  t.fills          = solid(tok(colorTok));
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}

function makeIconSlot(size) {
  // Prefer a real IconSlot component instance from the atom index.
  // Falls back to a plain dashed frame when the atom is not available.
  var atomIndex = loadAtomIndex();
  if (atomIndex) {
    var entry = atomIndex['IconSlot'];
    if (entry) {
      var cs = figma.getNodeById(entry.id);
      if (cs && cs.type === 'COMPONENT_SET') {
        for (var i = 0; i < cs.children.length; i++) {
          if (variantMatch(cs.children[i].name, 'size', String(size))) {
            return cs.children[i].createInstance();
          }
        }
        if (cs.children.length > 0) { return cs.children[0].createInstance(); }
      }
    }
  }
  var slot = figma.createFrame();
  slot.name         = 'Icon-Slot';
  slot.resize(size, size);
  slot.layoutMode   = 'NONE';
  slot.fills        = [];
  slot.strokes      = [{ type: 'SOLID', color: tok('foreground-muted'), opacity: 1 }];
  slot.strokeWeight = 1;
  slot.strokeAlign  = 'INSIDE';
  slot.dashPattern  = [4, 4];
  return slot;
}

// Binds an INSTANCE_SWAP component property to iconNode so designers can
// swap icons via the Properties panel. No-ops if iconNode is not an instance.
function tryAddIconSwapProp(comp, iconNode, propName) {
  if (!iconNode || iconNode.type !== 'INSTANCE') return;
  if (!iconNode.mainComponent) return;
  try {
    var key = comp.addComponentProperty(propName, 'INSTANCE_SWAP', iconNode.mainComponent.id);
    iconNode.componentPropertyReferences = { mainComponent: key };
  } catch (_) {}
}

function viewportCenter() {
  try {
    var b = figma.viewport.bounds;
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  } catch (_) { return { x: 0, y: 0 }; }
}

// Positions new frames LEFT-TO-RIGHT (rightmost edge + 80px gap).
function getNextPosition() {
  var visible = figma.currentPage.children.filter(function(n) { return n.x > -1000 && n.y > -1000; });
  if (visible.length === 0) {
    var vc = viewportCenter();
    return { x: Math.round(vc.x), y: Math.round(vc.y) };
  }
  var maxRight = -Infinity, refY = 0;
  for (var i = 0; i < visible.length; i++) {
    var r = visible[i].x + (visible[i].width || 0);
    if (r > maxRight) { maxRight = r; refY = visible[i].y; }
  }
  return { x: maxRight + 80, y: refY };
}

async function deleteExistingNode(name) {
  try {
    var cs = figma.currentPage.findOne(function(n) { return n.name === name && n.type === 'COMPONENT_SET'; });
    if (cs) { await cs.remove(); }
    var fr = figma.currentPage.findOne(function(n) { return n.name === name && n.type === 'FRAME'; });
    if (fr) { await fr.remove(); }
  } catch (_) {}
}

function centerInCells(cs, components, hGap, vGap, csH) {
  for (var i = 0; i < components.length; i++) {
    var c  = components[i];
    var cx = Math.max(0, Math.round((hGap - c.width)  / 2));
    var cy = vGap > 0
      ? Math.max(0, Math.round((vGap - c.height) / 2))
      : Math.max(0, Math.round((csH  - c.height) / 2));
    c.x = c.x + cx;
    c.y = c.y + cy;
  }
  var maxR = 0, maxB = 0;
  for (var j = 0; j < components.length; j++) {
    maxR = Math.max(maxR, components[j].x + (components[j].width  || 0));
    maxB = Math.max(maxB, components[j].y + (components[j].height || 0));
  }
  try { cs.resize(Math.max(1, maxR), Math.max(1, maxB)); } catch (_) {}
}

function buildAtomFrame(cs, title, config) {
  var hGap       = config.hGap;
  var vGap       = config.vGap       || 0;
  var numCols    = config.numCols;
  var numRows    = config.numRows    || 1;
  var colHeaders = config.colHeaders || [];
  var rowGroups  = config.rowGroups  || [];
  var rowLabels  = config.rowLabels  || [];
  var HAS_ROW_HDR = rowGroups.length > 0;
  var HAS_ROW_LBL = rowLabels.length > 0;
  var WRAP_PAD  = 40;
  var TITLE_H   = 60;
  var COL_HDR_H = 36;
  var ROW_HDR_W = (HAS_ROW_HDR ? 80 : 0) + (HAS_ROW_LBL ? 80 : 0);
  var PURPLE    = tok('brand-deep');

  var rowStep  = vGap > 0 ? vGap : cs.height;
  // overrideOverlayW: for AUTO-sized molecules the component width can exceed numCols * hGap.
  // Pass cs.width from the caller so the _property-table and wrapper frame cover the actual component.
  var overlayW = (config.overrideOverlayW && config.overrideOverlayW > numCols * hGap)
    ? config.overrideOverlayW
    : numCols * hGap;
  var overlayH = numRows * rowStep;
  var csX  = WRAP_PAD + ROW_HDR_W;
  var csY  = WRAP_PAD + TITLE_H + COL_HDR_H;
  var wrapW = csX + overlayW + WRAP_PAD;
  var wrapH = csY + overlayH + WRAP_PAD;

  var wrapper = figma.createFrame();
  wrapper.name         = title;
  wrapper.resize(wrapW, wrapH);
  wrapper.layoutMode   = 'NONE';
  wrapper.fills        = solid(tok('background'));
  wrapper.strokes      = [{ type: 'SOLID', color: tok('border-secondary'), opacity: 1 }];
  wrapper.strokeWeight = 1;
  wrapper.strokeAlign  = 'INSIDE';
  wrapper.cornerRadius = RADIUS.xl;
  wrapper.clipsContent = false;
  figma.currentPage.appendChild(wrapper);

  var titleTxt = makeText(title, { colorTok: 'foreground-primary', typographyKey: 'display-sm-semibold' });
  wrapper.appendChild(titleTxt);
  titleTxt.x = WRAP_PAD;
  titleTxt.y = WRAP_PAD;

  for (var ci = 0; ci < colHeaders.length; ci++) {
    var colTxt = makeText(colHeaders[ci], { colorTok: 'foreground-muted', typographyKey: 'label-xs-caps-semibold' });
    wrapper.appendChild(colTxt);
    var colCx = csX + ci * hGap + Math.round(hGap / 2);
    colTxt.x = Math.round(colCx - colTxt.width / 2);
    colTxt.y = WRAP_PAD + TITLE_H + Math.round((COL_HDR_H - 16) / 2);
  }

  for (var ri = 0; ri < rowGroups.length; ri++) {
    var rg    = rowGroups[ri];
    var rgTxt = makeText(rg.label, { colorTok: 'foreground-muted', typographyKey: 'label-xs-caps-semibold' });
    wrapper.appendChild(rgTxt);
    rgTxt.x = WRAP_PAD;
    rgTxt.y = csY + rg.rowIndex * rowStep + Math.round((rowStep - 16) / 2);
  }

  var stateLabelX = WRAP_PAD + (HAS_ROW_HDR ? 80 : 0);
  for (var li = 0; li < rowLabels.length; li++) {
    var rl    = rowLabels[li];
    var rlTxt = makeText(rl.label, { colorTok: 'foreground-muted', typographyKey: 'label-xs-caps-semibold' });
    wrapper.appendChild(rlTxt);
    rlTxt.x = stateLabelX;
    rlTxt.y = csY + rl.rowIndex * rowStep + Math.round((rowStep - 16) / 2);
  }

  var overlay = figma.createFrame();
  overlay.name         = '_property-table';
  overlay.resize(overlayW, overlayH);
  overlay.layoutMode   = 'NONE';
  overlay.fills        = [];
  overlay.strokes      = [];
  overlay.clipsContent = false;

  var cellW = numCols > 0 ? Math.round(overlayW / numCols) : overlayW;
  for (var col = 0; col < numCols; col++) {
    for (var row = 0; row < numRows; row++) {
      var cell = figma.createFrame();
      cell.name         = 'cell';
      cell.resize(cellW, rowStep);
      cell.layoutMode   = 'NONE';
      cell.fills        = [];
      cell.strokes      = [{ type: 'SOLID', color: PURPLE, opacity: 1 }];
      cell.strokeWeight = 1;
      cell.strokeAlign  = 'INSIDE';
      cell.dashPattern  = [4, 4];
      cell.x = col * cellW;
      cell.y = row * rowStep;
      overlay.appendChild(cell);
    }
  }

  wrapper.appendChild(cs);
  cs.x = csX; cs.y = csY;
  try { cs.clipsContent = false; } catch (_) {}
  wrapper.appendChild(overlay);
  overlay.x = csX; overlay.y = csY;

  return wrapper;
}

// ══════════════════════════════════════════════════════════════
// ── ATOM INDEX HELPERS ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

function loadAtomIndex() {
  try {
    var raw = figma.root.getSharedPluginData(SHARED_NS, STORAGE_KEY);
    if (!raw) { return null; }
    return JSON.parse(raw);
  } catch (_) { return null; }
}

function variantMatch(compName, key, value) {
  var pattern = key + '=' + value;
  var idx     = compName.indexOf(pattern);
  if (idx === -1) return false;
  var prevOk  = idx === 0 || compName.substring(idx - 2, idx) === ', ';
  var nextIdx = idx + pattern.length;
  var nextOk  = nextIdx >= compName.length || compName[nextIdx] === ',';
  return prevOk && nextOk;
}

function getVariantInstance(atomIndex, atomName, variantProps) {
  if (!atomIndex) { return null; }
  var entry = atomIndex[atomName];
  if (!entry) {
    figma.notify('Index miss: ' + atomName + ' -- re-run plugin 03a', { timeout: 4000 });
    return null;
  }
  var cs = figma.getNodeById(entry.id);
  if (!cs || cs.type !== 'COMPONENT_SET') {
    figma.notify('Node ID expired: ' + atomName + ' -- re-run plugin 02a, then 03a', { timeout: 4000 });
    return null;
  }
  var propKeys = Object.keys(variantProps);
  var matched  = null;
  for (var i = 0; i < cs.children.length; i++) {
    var c  = cs.children[i];
    var ok = true;
    for (var j = 0; j < propKeys.length; j++) {
      if (!variantMatch(c.name, propKeys[j], variantProps[propKeys[j]])) {
        ok = false; break;
      }
    }
    if (ok) { matched = c; break; }
  }
  if (!matched && cs.children.length > 0) { matched = cs.children[0]; }
  return matched ? matched.createInstance() : null;
}

function makeAtomPlaceholder(name, w, h) {
  var f = figma.createFrame();
  f.name         = 'placeholder:' + name;
  f.resize(w, h);
  f.layoutMode   = 'NONE';
  f.fills        = solidOpacity(tok('brand-deep'), 0.08);
  f.strokes      = [{ type: 'SOLID', color: tok('brand-deep'), opacity: 1 }];
  f.strokeWeight = 1;
  f.strokeAlign  = 'INSIDE';
  f.dashPattern  = [4, 4];
  f.cornerRadius = RADIUS.md;
  var t = makeText(name, { size: 10, weight: 'Medium', colorTok: 'brand-faint' });
  f.appendChild(t);
  t.x = Math.round((w - t.width)  / 2);
  t.y = Math.round((h - t.height) / 2);
  return f;
}

function overrideText(instance, label) {
  if (!instance) return;
  try {
    var texts = instance.findAll(function(n) { return n.type === 'TEXT'; });
    if (texts.length > 0) { texts[0].characters = label; }
  } catch (_) {}
}

// ══════════════════════════════════════════════════════════════
// ── MOLECULE 01: CHECKLISTITEM  (2 variants) ─────────────────
// ══════════════════════════════════════════════════════════════
async function generateChecklistItemMolecule() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('ChecklistItem');
    step = 'fonts';  await loadFonts();
    step = 'tokens'; _tokenMap = await resolveTokensFromFigma();
    step = 'index';
    var atomIndex = loadAtomIndex();
    if (!atomIndex) { figma.notify('Atom index missing -- using placeholders', { timeout: 3000 }); }

    var cfg = getMoleculeCfg('ChecklistItem');

    var H_GAP       = cfg.hGap          || 360;
    var TEXT_W      = cfg.textWidth      || 220;
    var SAMPLE_TEXT = cfg.sampleText     || 'Add structured data markup for better AI comprehension';
    var TEXT_TYPO   = cfg.textTypography || 'body-sm-medium';
    var VARIANTS    = (cfg.variants && cfg.variants.length > 0) ? cfg.variants : [
      { key: 'undone', checkState: 'unchecked', textTok: 'foreground-primary'  },
      { key: 'done',   checkState: 'checked',   textTok: 'foreground-tertiary' },
    ];

    var components = [];

    for (var vi = 0; vi < VARIANTS.length; vi++) {
      var v      = VARIANTS[vi];
      var isDone = v.key === 'done';
      step = 'comp[' + v.key + ']';

      var comp = figma.createComponent();
      comp.name = 'state=' + v.key;
      comp.x = vi * H_GAP; comp.y = 0;
      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'MIN';
      comp.counterAxisAlignItems = 'MIN';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.paddingTop    = 0; comp.paddingBottom = 0;
      comp.paddingLeft   = 0; comp.paddingRight  = 0;
      comp.itemSpacing   = 12;
      comp.fills         = [];
      comp.strokes       = [];

      step = 'checkbox[' + v.key + ']';
      var cbInst = getVariantInstance(atomIndex, 'Checkbox', { state: v.checkState });
      if (cbInst) {
        comp.appendChild(cbInst);
        for (var ti = 0; ti < cbInst.children.length; ti++) {
          if (cbInst.children[ti].type === 'TEXT') {
            cbInst.children[ti].visible = false;
          }
        }
      } else {
        var box = figma.createFrame();
        box.name         = 'checkbox-box';
        box.resize(16, 16);
        box.layoutMode   = 'NONE';
        box.cornerRadius = 4;
        if (isDone) {
          box.fills   = solid(tok('primary-default'));
          box.strokes = [];
          var chk = makeText('v', { size: 11, weight: 'Bold', colorTok: 'foreground-strong' });
          box.appendChild(chk);
          chk.x = Math.round((16 - chk.width)  / 2);
          chk.y = Math.round((16 - chk.height) / 2);
        } else {
          box.fills        = solid(tok('surface-hover'));
          box.strokes      = [{ type: 'SOLID', color: tok('border-primary'), opacity: 1 }];
          box.strokeWeight = 1;
          box.strokeAlign  = 'INSIDE';
        }
        comp.appendChild(box);
      }

      var lbl = makeText(SAMPLE_TEXT, { typographyKey: TEXT_TYPO, colorTok: v.textTok });
      comp.appendChild(lbl);
      lbl.textAutoResize = 'HEIGHT';
      lbl.resize(TEXT_W, lbl.height || 20);

      components.push(comp);
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'ChecklistItem';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, H_GAP, 0, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'ChecklistItem', {
      hGap: H_GAP, vGap: 0, numCols: VARIANTS.length, numRows: 1,
      colHeaders: VARIANTS.map(function(vv) { return vv.key; }),
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('ChecklistItem generated');
  } catch (err) {
    figma.notify('ChecklistItem[' + step + ']: ' + ((err && err.message) || err), { error: true });
  }
}

// ══════════════════════════════════════════════════════════════
// ── MOLECULE 02: CHARTLEGENDITEM  (3 variants) ───────────────
// ══════════════════════════════════════════════════════════════
async function generateChartLegendItemMolecule() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('ChartLegendItem');
    step = 'fonts';  await loadFonts();
    step = 'tokens'; _tokenMap = await resolveTokensFromFigma();

    var cfg = getMoleculeCfg('ChartLegendItem');

    var H_GAP    = cfg.hGap             || 180;
    var DOT_SIZE = cfg.dotSize          || 8;
    var LBL_TYPO = cfg.labelTypography  || 'body-micro-medium';
    var LBL_TOK  = cfg.labelTok         || 'foreground-secondary';
    var VARIANTS = (cfg.variants && cfg.variants.length > 0) ? cfg.variants : [
      { key: 'ai-discovery',   dotTok: 'brand-default',    label: 'AI Discovery'   },
      { key: 'organic-search', dotTok: 'positive-default', label: 'Organic Search' },
      { key: 'citations',      dotTok: 'chart-citations',  label: 'Citations'      },
    ];

    var components = [];

    for (var vi = 0; vi < VARIANTS.length; vi++) {
      var v = VARIANTS[vi];
      step = 'comp[' + v.key + ']';

      var comp = figma.createComponent();
      comp.name = 'series=' + v.key;
      comp.x = vi * H_GAP; comp.y = 0;
      comp.layoutMode            = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'MIN';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.paddingTop    = 0; comp.paddingBottom = 0;
      comp.paddingLeft   = 0; comp.paddingRight  = 0;
      comp.itemSpacing   = 8;
      comp.fills         = [];
      comp.strokes       = [];

      var dot = figma.createEllipse();
      dot.name = 'dot';
      dot.resize(DOT_SIZE, DOT_SIZE);
      dot.fills   = solid(tok(v.dotTok));
      dot.strokes = [];
      comp.appendChild(dot);

      var lbl = makeText(v.label, { typographyKey: LBL_TYPO, colorTok: LBL_TOK });
      comp.appendChild(lbl);

      components.push(comp);
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'ChartLegendItem';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, H_GAP, 0, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'ChartLegendItem', {
      hGap: H_GAP, vGap: 0, numCols: VARIANTS.length, numRows: 1,
      colHeaders: VARIANTS.map(function(vv) { return vv.key; }),
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('ChartLegendItem generated');
  } catch (err) {
    figma.notify('ChartLegendItem[' + step + ']: ' + ((err && err.message) || err), { error: true });
  }
}

// ══════════════════════════════════════════════════════════════
// ── MOLECULE 03: NAVITEM  (4 variants) ───────────────────────
// ══════════════════════════════════════════════════════════════
async function generateNavItemMolecule() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('NavItem');
    step = 'fonts';  await loadFonts();
    step = 'tokens'; _tokenMap = await resolveTokensFromFigma();

    var cfg  = getMoleculeCfg('NavItem');
    var dCfg = (cfg && cfg.desktop) || {};
    var mCfg = (cfg && cfg.mobile)  || {};

    var H_GAP     = cfg.hGap || 120;
    var V_GAP     = cfg.vGap || 100;
    var PLATFORMS = (cfg && cfg.platforms) || ['desktop', 'mobile'];
    var STATES    = (cfg && cfg.states)    || ['default', 'active'];

    // Desktop
    var D_SIZE      = dCfg.size             || 40;
    var D_ICON_SZ   = dCfg.iconSize         || 20;
    var D_RADIUS    = dCfg.cornerRadius      !== undefined ? dCfg.cornerRadius     : RADIUS.md;
    var D_ACTIVE_BG = dCfg.activeBgTok      || 'surface-hover';
    var D_BAR_W     = dCfg.activeBarW       || 4;
    var D_BAR_H     = dCfg.activeBarH       || 20;
    var D_BAR_OX    = dCfg.activeBarOffsetX !== undefined ? dCfg.activeBarOffsetX : -8;
    var D_BAR_TOK   = dCfg.activeBarTok     || 'primary-default';
    var D_ACT_ICON  = dCfg.activeIconTok    || 'primary-default';
    var D_DEF_ICON  = dCfg.defaultIconTok   || 'foreground-muted';

    // Mobile
    var M_W        = mCfg.width              || 72;
    var M_ICON_SZ  = mCfg.iconSize           || 20;
    var M_PAD_BOT  = mCfg.paddingBottom      || 8;
    var M_SPACING  = mCfg.itemSpacing        || 4;
    var M_PAD_ACT  = mCfg.paddingTopActive   !== undefined ? mCfg.paddingTopActive   : 0;
    var M_PAD_DEF  = mCfg.paddingTopInactive !== undefined ? mCfg.paddingTopInactive : 11;
    var M_IND_W    = mCfg.indicatorW         || 32;
    var M_IND_H    = mCfg.indicatorH         || 2;
    var M_IND_TOK  = mCfg.indicatorTok       || 'primary-default';
    var M_ACT_ICON = mCfg.activeIconTok      || 'primary-default';
    var M_DEF_ICON = mCfg.defaultIconTok     || 'foreground-muted';
    var M_LABEL    = mCfg.sampleLabel        || 'Overview';
    var M_LBL_TYPO = mCfg.labelTypography    || 'label-micro-medium';
    var M_LBL_WGT  = mCfg.labelWeight        || 'Semi Bold';

    var components = [];

    for (var pi = 0; pi < PLATFORMS.length; pi++) {
      var platform = PLATFORMS[pi];
      for (var si = 0; si < STATES.length; si++) {
        var state    = STATES[si];
        var isActive = state === 'active';
        step = 'comp[' + platform + '/' + state + ']';

        var comp = figma.createComponent();
        comp.name = 'platform=' + platform + ', state=' + state;
        comp.x = pi * H_GAP;
        comp.y = si * V_GAP;
        comp.fills   = [];
        comp.strokes = [];

        if (platform === 'desktop') {
          comp.layoutMode   = 'NONE';
          comp.resize(D_SIZE, D_SIZE);
          comp.cornerRadius = D_RADIUS;
          comp.clipsContent = false;

          if (isActive) {
            comp.fills = solid(tok(D_ACTIVE_BG));
            var bar = figma.createRectangle();
            bar.name              = 'active-bar';
            bar.resize(D_BAR_W, D_BAR_H);
            bar.fills             = solid(tok(D_BAR_TOK));
            bar.topLeftRadius     = 0;
            bar.topRightRadius    = 9999;
            bar.bottomLeftRadius  = 0;
            bar.bottomRightRadius = 9999;
            comp.appendChild(bar);
            bar.x = D_BAR_OX;
            bar.y = Math.round((D_SIZE - D_BAR_H) / 2);
          }

          var icon = makeIconSlot(D_ICON_SZ);
          icon.strokes = [{ type: 'SOLID', color: tok(isActive ? D_ACT_ICON : D_DEF_ICON), opacity: 1 }];
          comp.appendChild(icon);
          tryAddIconSwapProp(comp, icon, 'Icon');
          icon.x = Math.round((D_SIZE - D_ICON_SZ) / 2);
          icon.y = Math.round((D_SIZE - D_ICON_SZ) / 2);

        } else {
          comp.layoutMode            = 'VERTICAL';
          comp.primaryAxisAlignItems = 'MIN';
          comp.counterAxisAlignItems = 'CENTER';
          comp.counterAxisSizingMode = 'FIXED';
          comp.clipsContent          = false;
          comp.resize(M_W, 10);
          comp.primaryAxisSizingMode = 'AUTO';
          comp.paddingTop    = isActive ? M_PAD_ACT : M_PAD_DEF;
          comp.paddingBottom = M_PAD_BOT;
          comp.paddingLeft   = 0;
          comp.paddingRight  = 0;
          comp.itemSpacing   = M_SPACING;

          var iconColor = isActive ? M_ACT_ICON : M_DEF_ICON;

          if (isActive) {
            var topBar = figma.createRectangle();
            topBar.name         = 'active-indicator';
            topBar.resize(M_IND_W, M_IND_H);
            topBar.fills        = solid(tok(M_IND_TOK));
            topBar.cornerRadius = 9999;
            comp.appendChild(topBar);

            var spacer = figma.createRectangle();
            spacer.name    = 'spacer';
            spacer.resize(1, 1);
            spacer.fills   = [];
            spacer.opacity = 0;
            comp.appendChild(spacer);
          }

          var mobileIcon = makeIconSlot(M_ICON_SZ);
          mobileIcon.strokes = [{ type: 'SOLID', color: tok(iconColor), opacity: 1 }];
          comp.appendChild(mobileIcon);
          tryAddIconSwapProp(comp, mobileIcon, 'Icon');

          var lbl = makeText(M_LABEL, { typographyKey: M_LBL_TYPO, weight: M_LBL_WGT, colorTok: iconColor });
          comp.appendChild(lbl);
        }

        components.push(comp);
      }
    }

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'NavItem';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, H_GAP, V_GAP, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'NavItem', {
      hGap: H_GAP, vGap: V_GAP,
      numCols: PLATFORMS.length, numRows: STATES.length,
      colHeaders: PLATFORMS,
      rowGroups: STATES.map(function(s, i) { return { label: s.toUpperCase(), rowIndex: i }; }),
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('NavItem generated');
  } catch (err) {
    figma.notify('NavItem[' + step + ']: ' + ((err && err.message) || err), { error: true });
  }
}

// ══════════════════════════════════════════════════════════════
// ── MOLECULE 04: BULKACTIONBAR  (1 variant) ──────────────────
// ══════════════════════════════════════════════════════════════
async function generateBulkActionBarMolecule() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('BulkActionBar');
    step = 'fonts';  await loadFonts();
    step = 'tokens'; _tokenMap = await resolveTokensFromFigma();
    step = 'index';
    var atomIndex = loadAtomIndex();
    if (!atomIndex) { figma.notify('Atom index missing -- using placeholders', { timeout: 3000 }); }

    var cfg = getMoleculeCfg('BulkActionBar');

    var H_GAP   = cfg.hGap              || 640;
    var GAP     = cfg.gap               || 12;
    var PAD_H   = cfg.paddingH          || 16;
    var PAD_V   = cfg.paddingV          || 12;
    var RADIUS_ = cfg.cornerRadius      !== undefined ? cfg.cornerRadius : RADIUS.xl;
    var BG_TOK  = cfg.bgTok             || 'background';
    var BD_TOK  = cfg.borderTok         || 'border-secondary';
    var CNT_LBL = cfg.countLabel        || '3 citations selected';
    var CNT_TYPO = cfg.countLabelTypography || 'body-md-medium';
    var CNT_TOK  = cfg.countLabelTok    || 'foreground-secondary';
    var BUTTONS  = (cfg.buttons && cfg.buttons.length > 0) ? cfg.buttons : [
      { variant: 'secondary', size: 'sm', state: 'default', label: 'Export',           fallbackW: 80,  fallbackH: 32 },
      { variant: 'primary',   size: 'sm', state: 'default', label: 'Mark as Resolved', fallbackW: 140, fallbackH: 32 },
      { variant: 'ghost',     size: 'sm', state: 'default', label: 'Clear Selection',  fallbackW: 120, fallbackH: 32 },
    ];

    var components = [];
    step = 'comp';

    var comp = figma.createComponent();
    comp.name = 'variant=default';
    comp.x = 0; comp.y = 0;
    comp.layoutMode            = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'MIN';
    comp.counterAxisAlignItems = 'CENTER';
    comp.primaryAxisSizingMode = 'AUTO';
    comp.counterAxisSizingMode = 'AUTO';
    comp.paddingTop    = PAD_V; comp.paddingBottom = PAD_V;
    comp.paddingLeft   = PAD_H; comp.paddingRight  = PAD_H;
    comp.itemSpacing   = GAP;
    comp.cornerRadius  = RADIUS_;
    comp.fills         = solid(tok(BG_TOK));
    comp.strokes       = [{ type: 'SOLID', color: tok(BD_TOK), opacity: 1 }];
    comp.strokeWeight  = 1;
    comp.strokeAlign   = 'INSIDE';

    var countLbl = makeText(CNT_LBL, { typographyKey: CNT_TYPO, colorTok: CNT_TOK });
    comp.appendChild(countLbl);

    for (var bi = 0; bi < BUTTONS.length; bi++) {
      var bd   = BUTTONS[bi];
      var inst = getVariantInstance(atomIndex, 'Button', { variant: bd.variant, size: bd.size, state: bd.state || 'default' });
      step = 'btn[' + bd.variant + ']';
      if (inst) {
        comp.appendChild(inst);
        overrideText(inst, bd.label);
      } else {
        comp.appendChild(makeAtomPlaceholder('Button/' + bd.variant, bd.fallbackW, bd.fallbackH));
      }
    }

    components.push(comp);

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'BulkActionBar';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, H_GAP, 0, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'BulkActionBar', {
      hGap: H_GAP, vGap: 0, numCols: 1, numRows: 1,
      colHeaders: ['default'],
      overrideOverlayW: cs.width,
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('BulkActionBar generated');
  } catch (err) {
    figma.notify('BulkActionBar[' + step + ']: ' + ((err && err.message) || err), { error: true });
  }
}

// ══════════════════════════════════════════════════════════════
// ── MOLECULE 05: FILTERBAR  (1 variant) ──────────────────────
// ══════════════════════════════════════════════════════════════
async function generateFilterBarMolecule() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('FilterBar');
    step = 'fonts';  await loadFonts();
    step = 'tokens'; _tokenMap = await resolveTokensFromFigma();
    step = 'index';
    var atomIndex = loadAtomIndex();
    if (!atomIndex) { figma.notify('Atom index missing -- using placeholders', { timeout: 3000 }); }

    var cfg = getMoleculeCfg('FilterBar');

    var H_GAP     = cfg.hGap                  || 680;
    var RADIUS_   = cfg.cornerRadius           !== undefined ? cfg.cornerRadius           : RADIUS.lg;
    var BG_OP     = cfg.bgOpacity              !== undefined ? cfg.bgOpacity              : 0.6;
    var BG_TOK    = cfg.bgTok                  || 'surface-default';
    var BD_TOK    = cfg.borderTok              || 'border-secondary';
    var HDR_TITLE = cfg.headerTitle            || 'Filters';
    var HDR_TYPO  = cfg.headerTypography       || 'title-sub-semibold';
    var HDR_TOK   = cfg.headerTitleTok         || 'foreground-secondary';
    var HDR_PAD_T = cfg.headerPaddingTop       !== undefined ? cfg.headerPaddingTop       : 20;
    var HDR_PAD_B = cfg.headerPaddingBottom    !== undefined ? cfg.headerPaddingBottom    : 12;
    var CNT_PAD_B = cfg.contentPaddingBottom   !== undefined ? cfg.contentPaddingBottom   : 20;
    var CNT_GAP   = cfg.contentGap             !== undefined ? cfg.contentGap             : 16;
    var FILTERS   = (cfg.filters && cfg.filters.length > 0) ? cfg.filters : [
      { externalIcon: true,  iconSize: 16, atomName: 'Select',      props: { state: 'default', size: 'sm' }, fallbackW: 200, fallbackH: 32 },
      { externalIcon: true,  iconSize: 16, atomName: 'Select',      props: { state: 'default', size: 'sm' }, fallbackW: 200, fallbackH: 32 },
      { externalIcon: false, iconSize: 16, atomName: 'SearchField', props: { state: 'default', size: 'md' }, fallbackW: 280, fallbackH: 36 },
    ];

    var components = [];
    step = 'comp';

    var comp = figma.createComponent();
    comp.name = 'variant=default';
    comp.x = 0; comp.y = 0;
    comp.layoutMode            = 'VERTICAL';
    comp.primaryAxisAlignItems = 'MIN';
    comp.counterAxisAlignItems = 'MIN';
    comp.primaryAxisSizingMode = 'AUTO';
    comp.counterAxisSizingMode = 'AUTO';
    comp.paddingTop    = 0; comp.paddingBottom = 0;
    comp.paddingLeft   = 0; comp.paddingRight  = 0;
    comp.itemSpacing   = 0;
    comp.cornerRadius  = RADIUS_;
    comp.fills         = solidOpacity(tok(BG_TOK), BG_OP);
    comp.strokes       = [{ type: 'SOLID', color: tok(BD_TOK), opacity: 1 }];
    comp.strokeWeight  = 1;
    comp.strokeAlign   = 'INSIDE';

    var header = figma.createFrame();
    header.name            = 'header';
    header.layoutMode      = 'HORIZONTAL';
    header.primaryAxisAlignItems = 'MIN';
    header.counterAxisAlignItems = 'CENTER';
    header.primaryAxisSizingMode = 'AUTO';
    header.counterAxisSizingMode = 'AUTO';
    header.paddingTop      = HDR_PAD_T; header.paddingBottom = HDR_PAD_B;
    header.paddingLeft     = 20; header.paddingRight = 20;
    header.itemSpacing     = 0;
    header.fills           = [];
    header.strokes         = [];
    comp.appendChild(header);

    var headerTitle = makeText(HDR_TITLE, { typographyKey: HDR_TYPO, colorTok: HDR_TOK });
    header.appendChild(headerTitle);

    var content = figma.createFrame();
    content.name            = 'content';
    content.layoutMode      = 'HORIZONTAL';
    content.primaryAxisAlignItems = 'MIN';
    content.counterAxisAlignItems = 'CENTER';
    content.primaryAxisSizingMode = 'AUTO';
    content.counterAxisSizingMode = 'AUTO';
    content.paddingTop      = 0; content.paddingBottom = CNT_PAD_B;
    content.paddingLeft     = 20; content.paddingRight = 20;
    content.itemSpacing     = CNT_GAP;
    content.fills           = [];
    content.strokes         = [];
    comp.appendChild(content);

    for (var fi = 0; fi < FILTERS.length; fi++) {
      var f = FILTERS[fi];
      step = 'filter[' + fi + ']';
      // externalIcon=true means the icon sits OUTSIDE the atom (Calendar/Filter icons next to Select).
      // externalIcon=false means the atom already contains its own icon (e.g. SearchField with built-in
      // search icon-slot, matching React's <Search /> + <Input pl-10> composite pattern).
      var hasExtIcon = (f.externalIcon !== false);

      if (hasExtIcon) {
        var group = figma.createFrame();
        group.name            = 'filter-group';
        group.layoutMode      = 'HORIZONTAL';
        group.primaryAxisAlignItems = 'MIN';
        group.counterAxisAlignItems = 'CENTER';
        group.primaryAxisSizingMode = 'AUTO';
        group.counterAxisSizingMode = 'AUTO';
        group.paddingTop      = 0; group.paddingBottom = 0;
        group.paddingLeft     = 0; group.paddingRight  = 0;
        group.itemSpacing     = 8;
        group.fills           = [];
        group.strokes         = [];
        content.appendChild(group);

        var iconSlot = makeIconSlot(f.iconSize);
        group.appendChild(iconSlot);

        var inst;
        if (f.atomName === 'SelectDropdown') {
          var sdState = (f.props && f.props.state) || 'closed';
          inst = getSelectDropdownInstance(sdState);
          if (!inst) { figma.notify('SelectDropdown missing -- generate it first, then regenerate FilterBar', { timeout: 4000 }); }
        } else {
          inst = getVariantInstance(atomIndex, f.atomName, f.props);
        }
        if (inst) {
          group.appendChild(inst);
        } else {
          group.appendChild(makeAtomPlaceholder(f.atomName, f.fallbackW, f.fallbackH));
        }
      } else {
        // No external icon: drop the atom directly into content (it owns its own icon).
        var instSolo;
        if (f.atomName === 'SelectDropdown') {
          instSolo = getSelectDropdownInstance((f.props && f.props.state) || 'closed');
        } else {
          instSolo = getVariantInstance(atomIndex, f.atomName, f.props);
        }
        if (instSolo) {
          content.appendChild(instSolo);
        } else {
          content.appendChild(makeAtomPlaceholder(f.atomName, f.fallbackW, f.fallbackH));
        }
      }
    }

    components.push(comp);

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'FilterBar';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, H_GAP, 0, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'FilterBar', {
      hGap: H_GAP, vGap: 0, numCols: 1, numRows: 1,
      colHeaders: ['default'],
      overrideOverlayW: cs.width,
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('FilterBar generated');
  } catch (err) {
    figma.notify('FilterBar[' + step + ']: ' + ((err && err.message) || err), { error: true });
  }
}

// ══════════════════════════════════════════════════════════════
// ── MOLECULE 06: HEADERACTIONGROUP  (1 variant) ───────────────
// ══════════════════════════════════════════════════════════════
async function generateHeaderActionGroupMolecule() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('HeaderActionGroup');
    step = 'fonts';  await loadFonts();
    step = 'tokens'; _tokenMap = await resolveTokensFromFigma();
    step = 'index';
    var atomIndex = loadAtomIndex();
    if (!atomIndex) { figma.notify('Atom index missing -- using placeholders', { timeout: 3000 }); }

    var cfg  = getMoleculeCfg('HeaderActionGroup');
    var sCfg = (cfg && cfg.searchInput)  || {};
    var dCfg = (cfg && cfg.dateButton)   || {};
    var nCfg = (cfg && cfg.notifButton)  || {};

    var H_GAP = cfg.hGap || 580;
    var GAP   = cfg.gap  || 8;

    var S_ATOM    = sCfg.atomName       || 'SearchField';
    var S_PROPS   = sCfg.atomProps      || { state: 'default', size: 'md' };
    var S_PH      = sCfg.placeholder    || 'Search metrics...';
    var S_FB_W    = sCfg.fallbackW      || 200;
    var S_FB_H    = sCfg.fallbackH      || 36;

    var D_STATE   = dCfg.state          || 'closed';
    var D_FB_W    = dCfg.fallbackW      || 160;
    var D_FB_H    = dCfg.fallbackH      || 36;

    var N_SIZE    = nCfg.size           || 36;
    var N_ICON_SZ = nCfg.iconSize       || 16;
    var N_BG_OP   = nCfg.bgOpacity      !== undefined ? nCfg.bgOpacity  : 0.3;
    var N_BG_TOK  = nCfg.bgTok          || 'surface-default';
    var N_BD_TOK  = nCfg.borderTok      || 'border-secondary';
    var N_RADIUS  = nCfg.cornerRadius   !== undefined ? nCfg.cornerRadius : RADIUS.md;
    var N_BADGE   = nCfg.badgeCount     || '3';
    var N_BDG_TOK = nCfg.badgeTok       || 'primary-default';
    var N_BDG_BD  = nCfg.badgeBorderTok || 'background';
    var N_BDG_TXT = nCfg.badgeTextTok   || 'foreground-strong';

    var components = [];
    step = 'comp';

    var comp = figma.createComponent();
    comp.name = 'variant=default';
    comp.x = 0; comp.y = 0;
    comp.layoutMode            = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'MIN';
    comp.counterAxisAlignItems = 'CENTER';
    comp.primaryAxisSizingMode = 'AUTO';
    comp.counterAxisSizingMode = 'AUTO';
    comp.paddingTop    = 0; comp.paddingBottom = 0;
    comp.paddingLeft   = 0; comp.paddingRight  = 0;
    comp.itemSpacing   = GAP;
    comp.fills         = [];
    comp.strokes       = [];

    step = 'search';
    var searchInst = getVariantInstance(atomIndex, S_ATOM, S_PROPS);
    if (searchInst) {
      comp.appendChild(searchInst);
      overrideText(searchInst, S_PH);
    } else {
      comp.appendChild(makeAtomPlaceholder(S_ATOM, S_FB_W, S_FB_H));
    }

    step = 'btn-date';
    var dateBtn = getSelectDropdownInstance(D_STATE);
    if (dateBtn) {
      comp.appendChild(dateBtn);
    } else {
      comp.appendChild(makeAtomPlaceholder('SelectDropdown/' + D_STATE, D_FB_W, D_FB_H));
    }

    step = 'btn-notif';
    var notifFrame = figma.createFrame();
    notifFrame.name            = 'notification-btn';
    notifFrame.layoutMode      = 'HORIZONTAL';
    notifFrame.primaryAxisAlignItems = 'CENTER';
    notifFrame.counterAxisAlignItems = 'CENTER';
    notifFrame.primaryAxisSizingMode = 'FIXED';
    notifFrame.counterAxisSizingMode = 'FIXED';
    notifFrame.resize(N_SIZE, N_SIZE);
    notifFrame.cornerRadius    = N_RADIUS;
    notifFrame.fills           = solidOpacity(tok(N_BG_TOK), N_BG_OP);
    notifFrame.strokes         = [{ type: 'SOLID', color: tok(N_BD_TOK), opacity: 1 }];
    notifFrame.strokeWeight    = 1;
    notifFrame.strokeAlign     = 'INSIDE';
    comp.appendChild(notifFrame);

    var bellSlot = makeIconSlot(N_ICON_SZ);
    notifFrame.appendChild(bellSlot);
    tryAddIconSwapProp(comp, bellSlot, 'Bell');
    var bellCenter = Math.round((N_SIZE - N_ICON_SZ) / 2);
    bellSlot.x = bellCenter; bellSlot.y = bellCenter;

    var badge = figma.createEllipse();
    badge.name = 'notification-badge';
    badge.resize(14, 14);
    badge.fills        = solid(tok(N_BDG_TOK));
    badge.strokes      = [{ type: 'SOLID', color: tok(N_BDG_BD), opacity: 1 }];
    badge.strokeWeight = 1.5;
    notifFrame.appendChild(badge);
    badge.x = N_SIZE - 14 + 1; badge.y = -1;
    var badgeTxt = makeText(N_BADGE, { size: 9, weight: 'Medium', colorTok: N_BDG_TXT });
    notifFrame.appendChild(badgeTxt);
    badgeTxt.x = Math.round(badge.x + (14 - badgeTxt.width)  / 2);
    badgeTxt.y = Math.round(badge.y + (14 - badgeTxt.height) / 2);

    components.push(comp);

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'HeaderActionGroup';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    centerInCells(cs, components, H_GAP, 0, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'HeaderActionGroup', {
      hGap: H_GAP, vGap: 0, numCols: 1, numRows: 1,
      colHeaders: ['default'],
      overrideOverlayW: cs.width,
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('HeaderActionGroup generated');
  } catch (err) {
    figma.notify('HeaderActionGroup[' + step + ']: ' + ((err && err.message) || err), { error: true });
  }
}

// ── HELPER: SelectDropdown page-based instance lookup ─────────
function getSelectDropdownInstance(state) {
  var cs = figma.currentPage.findOne(function(n) {
    return n.name === 'SelectDropdown' && n.type === 'COMPONENT_SET';
  });
  if (!cs) { return null; }
  for (var i = 0; i < cs.children.length; i++) {
    if (variantMatch(cs.children[i].name, 'state', state)) {
      return cs.children[i].createInstance();
    }
  }
  return cs.children.length > 0 ? cs.children[0].createInstance() : null;
}

// ══════════════════════════════════════════════════════════════
// ── MOLECULE 07: SELECTDROPDOWN  (3 variants) ─────────────────
// Represents React select.tsx in closed / open / selected states.
//
// Trigger anatomy (matches FilterBar/HeaderActionGroup React usage):
//   [paddingLeft=12] [icon-16] [gap-8] [text FILL] [gap-8] [chevron-16] [paddingRight=12]
//   h-9 rounded-md border-secondary bg-transparent
//
// Open state: VERTICAL component (trigger row + 4px gap + menu panel).
// The trigger frame inside openComp uses counterAxisSizingMode=FIXED
// (height=36) and layoutSizingHorizontal=FILL (parent controls width).
// All other variants are standalone FIXED-size components.
//
// Property table uses vGap=TRIGGER_H so all columns top-align and
// only cover the trigger row height in the cell overlay -- the open
// state menu panel extends below the cells by design.
// ══════════════════════════════════════════════════════════════
async function generateSelectDropdownMolecule() {
  var step = 'init';
  try {
    step = 'delete'; await deleteExistingNode('SelectDropdown');
    step = 'fonts';  await loadFonts();
    step = 'tokens'; _tokenMap = await resolveTokensFromFigma();

    var cfg       = getMoleculeCfg('SelectDropdown');
    var H_GAP     = cfg.hGap                             || 240;
    var TRIGGER_W = cfg.triggerW                         || 200;
    var TRIGGER_H = cfg.triggerH                         || 36;
    var PH        = cfg.placeholder                      || 'Select option';
    var SEL_VAL   = cfg.selectedValue                    || 'Last 30 days';
    var MENU_PAD  = (cfg.menuPadding      !== undefined) ? cfg.menuPadding      : 4;
    var ITEM_PV   = (cfg.menuItemPaddingV !== undefined) ? cfg.menuItemPaddingV : 6;
    var ITEM_PL   = (cfg.menuItemPaddingL !== undefined) ? cfg.menuItemPaddingL : 8;
    var ITEM_PR   = (cfg.menuItemPaddingR !== undefined) ? cfg.menuItemPaddingR : 8;
    var MENU_CR   = (cfg.menuCornerRadius !== undefined) ? cfg.menuCornerRadius : 6;
    var ITEMS     = (cfg.items && cfg.items.length > 0) ? cfg.items : [
      { label: 'Last 7 days',  focused: true  },
      { label: 'Last 30 days', focused: false },
      { label: 'Last 90 days', focused: false },
      { label: 'Last year',    focused: false },
    ];
    var BD_TOK = 'border-secondary';
    var CR     = 8;

    var components = [];

    // Fills `node` with trigger layout + children.
    // `node` must already be appended to a parent if it needs FILL sizing
    // (caller does: node.layoutSizingHorizontal = 'FILL' after this call).
    // For standalone components pass fixedW=true to use FIXED primary sizing.
    function applyTrigger(node, textLabel, textColorTok, fixedW) {
      node.layoutMode            = 'HORIZONTAL';
      node.primaryAxisAlignItems = 'MIN';
      node.counterAxisAlignItems = 'CENTER';
      if (fixedW) { node.primaryAxisSizingMode = 'FIXED'; }
      node.counterAxisSizingMode = 'FIXED';
      node.resize(TRIGGER_W, TRIGGER_H);
      node.paddingLeft   = 12; node.paddingRight  = 12;
      node.paddingTop    = 0;  node.paddingBottom = 0;
      node.itemSpacing   = 8;
      node.fills         = [];
      node.strokes       = [{ type: 'SOLID', color: tok(BD_TOK), opacity: 1 }];
      node.strokeWeight  = 1;
      node.strokeAlign   = 'INSIDE';
      node.cornerRadius  = CR;
      node.clipsContent  = false;
      // Leading icon slot (represents Calendar / Filter / etc.)
      var leadIcon = makeIconSlot(16);
      node.appendChild(leadIcon);
      // Label text (FILL = takes remaining space, chevron pushed to right)
      var lbl = makeText(textLabel, { size: 14, weight: 'Regular', colorTok: textColorTok });
      node.appendChild(lbl);
      lbl.textAutoResize         = 'HEIGHT';
      lbl.layoutSizingHorizontal = 'FILL';
      // Trailing chevron
      var chev = makeIconSlot(16);
      node.appendChild(chev);
      return leadIcon;
    }

    // Builds the floating menu panel shown in the open state.
    function buildMenu() {
      var panel = figma.createFrame();
      panel.name                   = 'menu';
      panel.layoutMode             = 'VERTICAL';
      panel.primaryAxisAlignItems  = 'MIN';
      panel.counterAxisAlignItems  = 'MIN';
      panel.primaryAxisSizingMode  = 'AUTO';
      panel.counterAxisSizingMode  = 'FIXED';
      panel.resize(TRIGGER_W, 10);
      panel.paddingLeft   = MENU_PAD; panel.paddingRight  = MENU_PAD;
      panel.paddingTop    = MENU_PAD; panel.paddingBottom = MENU_PAD;
      panel.itemSpacing   = 0;
      panel.fills         = solid(tok('background'));
      panel.strokes       = [{ type: 'SOLID', color: tok(BD_TOK), opacity: 1 }];
      panel.strokeWeight  = 1;
      panel.strokeAlign   = 'INSIDE';
      panel.cornerRadius  = MENU_CR;
      panel.clipsContent  = false;
      for (var ii = 0; ii < ITEMS.length; ii++) {
        var itm     = ITEMS[ii];
        var focused = (itm.focused === true);
        var row = figma.createFrame();
        row.name                  = focused ? 'item-focus' : 'item';
        row.layoutMode            = 'HORIZONTAL';
        row.primaryAxisAlignItems = 'MIN';
        row.counterAxisAlignItems = 'CENTER';
        row.counterAxisSizingMode = 'AUTO';
        row.paddingLeft  = ITEM_PL; row.paddingRight  = ITEM_PR;
        row.paddingTop   = ITEM_PV; row.paddingBottom = ITEM_PV;
        row.itemSpacing  = 4;
        row.cornerRadius = 4;
        row.strokes      = [];
        row.fills        = focused ? solid(tok('brand-default')) : [];
        var rowLbl = makeText(itm.label, {
          size: 14, weight: 'Regular',
          colorTok: focused ? 'foreground-strong' : 'foreground-primary',
        });
        row.appendChild(rowLbl);
        rowLbl.textAutoResize = 'HEIGHT';
        if (focused) {
          var chkSlot = makeIconSlot(16);
          row.appendChild(chkSlot);
        }
        panel.appendChild(row);
        row.layoutSizingHorizontal = 'FILL';
        rowLbl.layoutSizingHorizontal = 'FILL';
      }
      return panel;
    }

    // ── state=closed (standalone FIXED component) ─────────────
    step = 'comp[closed]';
    var closedComp = figma.createComponent();
    closedComp.name = 'state=closed';
    closedComp.x = 0; closedComp.y = 0;
    var closedLeadIcon = applyTrigger(closedComp, PH, 'foreground-muted', true);
    tryAddIconSwapProp(closedComp, closedLeadIcon, 'Icon');
    components.push(closedComp);

    // ── state=open (VERTICAL: trigger row + 4px + menu panel) ─
    // openComp is FIXED-width, AUTO-height (grows to contain menu).
    // The trigger frame inside it uses counterAxis-FIXED (height=36)
    // and FILL from the parent for width.
    step = 'comp[open]';
    var openComp = figma.createComponent();
    openComp.name = 'state=open';
    openComp.x = H_GAP; openComp.y = 0;
    openComp.layoutMode            = 'VERTICAL';
    openComp.primaryAxisAlignItems = 'MIN';
    openComp.counterAxisAlignItems = 'MIN';
    openComp.primaryAxisSizingMode = 'AUTO';
    openComp.counterAxisSizingMode = 'FIXED';
    openComp.resize(TRIGGER_W, TRIGGER_H);
    openComp.paddingLeft   = 0; openComp.paddingRight  = 0;
    openComp.paddingTop    = 0; openComp.paddingBottom = 0;
    openComp.itemSpacing   = 4;
    openComp.fills         = [];
    openComp.strokes       = [];
    openComp.clipsContent  = false;

    // Build trigger frame BEFORE appending so children get correct parent.
    var openTrig = figma.createFrame();
    openTrig.name = 'trigger';
    // Apply trigger layout without FIXED primary (width will come from FILL).
    var openLeadIcon = applyTrigger(openTrig, PH, 'foreground-muted', false);
    openComp.appendChild(openTrig);
    // After appending, tell the VERTICAL parent to give this child full width.
    openTrig.layoutSizingHorizontal = 'FILL';
    tryAddIconSwapProp(openComp, openLeadIcon, 'Icon');

    var menu = buildMenu();
    openComp.appendChild(menu);
    menu.layoutSizingHorizontal = 'FILL';

    components.push(openComp);

    // ── state=selected (standalone FIXED component) ───────────
    step = 'comp[selected]';
    var selComp = figma.createComponent();
    selComp.name = 'state=selected';
    selComp.x = H_GAP * 2; selComp.y = 0;
    var selLeadIcon = applyTrigger(selComp, SEL_VAL, 'foreground-primary', true);
    tryAddIconSwapProp(selComp, selLeadIcon, 'Icon');
    components.push(selComp);

    step = 'combine';
    var pos = getNextPosition();
    var cs = figma.combineAsVariants(components, figma.currentPage);
    cs.name = 'SelectDropdown';
    try { cs.layoutMode = 'NONE'; } catch (_) {}
    // Pass TRIGGER_H as vGap so all variants are top-aligned within a 36px
    // cell row. The open state menu panel extends below the cells by design.
    centerInCells(cs, components, H_GAP, TRIGGER_H, cs.height);

    step = 'wrap';
    var wrapper = buildAtomFrame(cs, 'SelectDropdown', {
      hGap: H_GAP, vGap: TRIGGER_H, numCols: 3, numRows: 1,
      colHeaders: ['closed', 'open', 'selected'],
    });
    wrapper.x = pos.x; wrapper.y = pos.y;
    figma.viewport.scrollAndZoomIntoView([wrapper]);
    figma.notify('SelectDropdown generated');
  } catch (err) {
    figma.notify('SelectDropdown[' + step + ']: ' + ((err && err.message) || err), { error: true });
  }
}

// ══════════════════════════════════════════════════════════════
// ── GENERATE ALL ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
async function generateAllMolecules() {
  try {
    figma.notify('Generating molecule system... (7 total)', { timeout: 60000 });
    await generateChecklistItemMolecule();
    await generateChartLegendItemMolecule();
    await generateNavItemMolecule();
    await generateBulkActionBarMolecule();
    await generateSelectDropdownMolecule();
    await generateFilterBarMolecule();
    await generateHeaderActionGroupMolecule();
    figma.notify('All molecules generated (7 total)');
  } catch (err) {
    var m = (err && err.message) ? err.message : String(err);
    figma.notify('generateAllMolecules: ' + m, { error: true });
    console.error('[Molecule Assembler 03b]', err);
  }
}

// ══════════════════════════════════════════════════════════════
// ── MESSAGE HANDLER ───────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
figma.showUI(__html__, { width: 300, height: 600 });

figma.ui.onmessage = async function(msg) {
  try {
    switch (msg.type) {
      case 'generate-all':                 await generateAllMolecules();              break;
      case 'generate-checklist-item':      await generateChecklistItemMolecule();     break;
      case 'generate-chart-legend-item':   await generateChartLegendItemMolecule();   break;
      case 'generate-nav-item':            await generateNavItemMolecule();           break;
      case 'generate-bulk-action-bar':     await generateBulkActionBarMolecule();     break;
      case 'generate-select-dropdown':     await generateSelectDropdownMolecule();    break;
      case 'generate-filter-bar':          await generateFilterBarMolecule();         break;
      case 'generate-header-action-group': await generateHeaderActionGroupMolecule(); break;

      case 'load-config':
        if (msg.config) {
          figma.root.setSharedPluginData(SHARED_NS, CONFIG_KEY, JSON.stringify(msg.config));
          var count = (msg.config.molecules) ? Object.keys(msg.config.molecules).length : 0;
          figma.ui.postMessage({ type: 'config-loaded', count: count });
          figma.notify('Config loaded (' + count + ' molecules)');
        }
        break;

      case 'check-config':
        var cfgRaw = figma.root.getSharedPluginData(SHARED_NS, CONFIG_KEY);
        var cfgObj = null;
        try { cfgObj = cfgRaw ? JSON.parse(cfgRaw) : null; } catch (_) {}
        var molCount = (cfgObj && cfgObj.molecules) ? Object.keys(cfgObj.molecules).length : 0;
        figma.ui.postMessage({ type: 'config-status', found: !!cfgObj, count: molCount });
        break;

      case 'check-index':
        var idxRaw = figma.root.getSharedPluginData(SHARED_NS, STORAGE_KEY);
        var idxObj = null;
        try { idxObj = idxRaw ? JSON.parse(idxRaw) : null; } catch (_) {}
        var atomCount = idxObj ? Object.keys(idxObj).length : 0;
        figma.ui.postMessage({ type: 'index-status', found: !!idxObj, atomCount: atomCount });
        break;

      default: figma.notify('Unknown action: ' + msg.type, { error: true });
    }
  } catch (err) {
    var m = (err && err.message) ? err.message : String(err);
    figma.notify('Error: ' + m, { error: true });
    console.error('[Molecule Assembler 03b]', err);
  }
};
