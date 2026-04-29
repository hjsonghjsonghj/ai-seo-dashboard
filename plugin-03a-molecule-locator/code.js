// ============================================================
// Molecule Locator -- code.js  (plugin-03a)
//
// Scans the current Figma page for all ComponentSets produced
// by plugin-02a-atomic-generator, validates them against the
// canonical atom list from ATOMS.md, caches the result in
// figma.clientStorage for plugin-03b-molecule-assembler to read,
// and renders a visual Atom Index frame on the canvas.
//
// Figma Plugin API rules:
//  - NO optional chaining (?.) or nullish coalescing (??)
//  - Async variable API: getLocalVariablesAsync / getLocalVariableCollectionsAsync
//  - setBoundVariable (not setBoundVariableForLayout) for spacing fields
// ============================================================

// ── CANONICAL ATOM LIST (mirrors ATOMS.md) ───────────────────
// These are the ComponentSet names that plugin-02a produces.
// ProgressRing is the new atom added by plugin-02a (16th atom).
var EXPECTED_ATOMS = [
  'Button',
  'Input',
  'Badge',
  'Checkbox',
  'Radio',
  'Switcher',
  'Select',
  'SearchField',
  'Progress',
  'Avatar',
  'Alert',
  'Spinner',
  'Separator',
  'Toggle',
  'Tooltip',
  'ProgressRing',
];

// Shared plugin data namespace + key (readable by any plugin with same namespace)
// figma.clientStorage is per-plugin and cannot be shared -- use sharedPluginData instead.
var SHARED_NS  = 'ds_plugin_suite';
var STORAGE_KEY = 'atomIndex_v1';

// ── COLOR TOKENS (subset -- for the index frame only) ─────────
var TOKENS = {
  'background':        { r: 0.008, g: 0.024, b: 0.090 },
  'surface-default':   { r: 0.059, g: 0.090, b: 0.165 },
  'surface-hover':     { r: 0.118, g: 0.161, b: 0.231 },
  'foreground-primary':   { r: 0.945, g: 0.961, b: 0.976 },
  'foreground-secondary': { r: 0.886, g: 0.910, b: 0.941 },
  'foreground-muted':     { r: 0.580, g: 0.639, b: 0.722 },
  'foreground-strong':    { r: 0.973, g: 0.980, b: 0.988 },
  'positive-default':  { r: 0.063, g: 0.725, b: 0.506 },
  'positive-soft':     { r: 0.204, g: 0.827, b: 0.600 },
  'danger-default':    { r: 0.937, g: 0.267, b: 0.267 },
  'danger-soft':       { r: 0.973, g: 0.443, b: 0.443 },
  'caution-default':   { r: 0.961, g: 0.620, b: 0.043 },
  'brand-deep':        { r: 0.486, g: 0.227, b: 0.929 },
  'brand-default':     { r: 0.545, g: 0.361, b: 0.965 },
  'brand-soft':        { r: 0.655, g: 0.545, b: 0.980 },
  'brand-faint':       { r: 0.769, g: 0.710, b: 0.992 },
  'border-secondary':  { r: 0.200, g: 0.255, b: 0.333 },
  'border-primary':    { r: 0.278, g: 0.333, b: 0.412 },
};

function tok(name) { return TOKENS[name] || { r: 1, g: 1, b: 1 }; }
function solid(c)  { return [{ type: 'SOLID', color: c }]; }

var FONT = 'Inter';

async function loadFonts() {
  var weights = ['Regular', 'Medium', 'Semi Bold', 'Bold'];
  await Promise.all(weights.map(function(w) {
    return figma.loadFontAsync({ family: FONT, style: w }).catch(function() {});
  }));
}

function makeText(chars, size, weight, colorTok) {
  var t = figma.createText();
  t.fontName = { family: FONT, style: weight || 'Regular' };
  t.characters = chars;
  t.fontSize = size || 12;
  t.fills = solid(tok(colorTok || 'foreground-primary'));
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
}

// ── POSITION HELPER ───────────────────────────────────────────
function getNextPosition() {
  var visible = figma.currentPage.children.filter(function(n) {
    return n.x > -1000 && n.y > -1000;
  });
  if (visible.length === 0) {
    try {
      var b = figma.viewport.bounds;
      return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) };
    } catch (_) { return { x: 0, y: 0 }; }
  }
  var maxB = -Infinity;
  var refX = 0;
  for (var i = 0; i < visible.length; i++) {
    var bottom = visible[i].y + (visible[i].height || 0);
    if (bottom > maxB) { maxB = bottom; refX = visible[i].x; }
  }
  return { x: refX, y: maxB + 80 };
}

// ── CORE: SCAN PAGE ───────────────────────────────────────────
// Walks all nodes on the current page and collects every
// COMPONENT_SET. Returns a plain object map:
//   { atomName: { id, variantCount, variantNames: [] } }
function scanPage() {
  var map = {};
  var all = figma.currentPage.findAll(function(n) {
    return n.type === 'COMPONENT_SET';
  });
  for (var i = 0; i < all.length; i++) {
    var cs = all[i];
    var name = cs.name;
    var variants = cs.children.map(function(c) { return c.name; });
    map[name] = {
      id: cs.id,
      variantCount: cs.children.length,
      variantNames: variants,
    };
  }
  return map;
}

// ── BUILD REPORT ─────────────────────────────────────────────
// Compares scan result against EXPECTED_ATOMS.
// Returns { present: [], missing: [], extra: [], index: map }
function buildReport(map) {
  var present = [];
  var missing = [];
  var extra   = [];

  for (var i = 0; i < EXPECTED_ATOMS.length; i++) {
    var name = EXPECTED_ATOMS[i];
    if (map[name]) {
      present.push({ name: name, variantCount: map[name].variantCount });
    } else {
      missing.push(name);
    }
  }

  var mapKeys = Object.keys(map);
  for (var j = 0; j < mapKeys.length; j++) {
    if (EXPECTED_ATOMS.indexOf(mapKeys[j]) === -1) {
      extra.push(mapKeys[j]);
    }
  }

  return { present: present, missing: missing, extra: extra, index: map };
}

// ── BUILD INDEX FRAME ─────────────────────────────────────────
// Renders a visual Atom Index on the canvas: one row per atom,
// showing its status, name, and variant count.
async function buildIndexFrame(report) {
  // Remove existing index frame
  var existing = figma.currentPage.findOne(function(n) {
    return n.name === '_Atom Index' && n.type === 'FRAME';
  });
  if (existing) { existing.remove(); }

  await loadFonts();

  var ROW_H    = 36;
  var PAD      = 20;
  var W        = 420;
  var TITLE_H  = 60;
  var DIVIDER_H = 1;
  var totalRows = report.present.length + report.missing.length + report.extra.length;
  var H = PAD + TITLE_H + PAD + totalRows * ROW_H + PAD;

  var frame = figma.createFrame();
  frame.name         = '_Atom Index';
  frame.resize(W, H);
  frame.layoutMode   = 'NONE';
  frame.fills        = solid(tok('background'));
  frame.strokes      = [{ type: 'SOLID', color: tok('border-secondary'), opacity: 1 }];
  frame.strokeWeight = 1;
  frame.strokeAlign  = 'INSIDE';
  frame.cornerRadius = 16;
  frame.clipsContent = true;

  var pos = getNextPosition();
  figma.currentPage.appendChild(frame);
  frame.x = pos.x;
  frame.y = pos.y;

  // Header bar
  var headerBar = figma.createFrame();
  headerBar.name = 'header';
  headerBar.resize(W, TITLE_H);
  headerBar.layoutMode = 'NONE';
  headerBar.fills = solid(tok('surface-default'));
  headerBar.strokes = [];
  frame.appendChild(headerBar);
  headerBar.x = 0; headerBar.y = 0;

  var titleTxt = makeText('Atom Index', 20, 'Semi Bold', 'foreground-strong');
  headerBar.appendChild(titleTxt);
  titleTxt.x = PAD;
  titleTxt.y = Math.round((TITLE_H - titleTxt.height) / 2);

  var totalFound = report.present.length;
  var totalExpected = EXPECTED_ATOMS.length;
  var subtitleStr = totalFound + ' / ' + totalExpected + ' atoms found';
  if (report.missing.length > 0) {
    subtitleStr = subtitleStr + '  --  ' + report.missing.length + ' missing';
  }
  var subtitle = makeText(subtitleStr, 11, 'Medium', 'foreground-muted');
  headerBar.appendChild(subtitle);
  subtitle.x = PAD;
  subtitle.y = Math.round((TITLE_H - titleTxt.height) / 2) + titleTxt.height + 4;

  // Legend badges
  var legendX = W - PAD;
  var legendItems = [
    { label: '+ extra', color: 'caution-default' },
    { label: '! missing', color: 'danger-soft' },
    { label: 'found', color: 'positive-soft' },
  ];
  for (var li = 0; li < legendItems.length; li++) {
    var leg = legendItems[li];
    var legTxt = makeText(leg.label, 10, 'Medium', leg.color);
    headerBar.appendChild(legTxt);
    legendX = legendX - legTxt.width;
    legTxt.x = legendX;
    legTxt.y = Math.round((TITLE_H - legTxt.height) / 2);
    legendX = legendX - 12;
  }

  // Divider under header
  var divider = figma.createRectangle();
  divider.name = 'divider';
  divider.resize(W, DIVIDER_H);
  divider.fills = solid(tok('border-secondary'));
  frame.appendChild(divider);
  divider.x = 0; divider.y = TITLE_H;

  // Rows
  var rowY = TITLE_H + DIVIDER_H + PAD;
  var allRows = [];

  // present atoms
  for (var pi = 0; pi < report.present.length; pi++) {
    allRows.push({ status: 'found', name: report.present[pi].name, count: report.present[pi].variantCount });
  }
  // missing atoms
  for (var mi = 0; mi < report.missing.length; mi++) {
    allRows.push({ status: 'missing', name: report.missing[mi], count: 0 });
  }
  // extra atoms
  for (var ei = 0; ei < report.extra.length; ei++) {
    allRows.push({ status: 'extra', name: report.extra[ei], count: (report.index[report.extra[ei]] && report.index[report.extra[ei]].variantCount) || 0 });
  }

  for (var ri = 0; ri < allRows.length; ri++) {
    var row = allRows[ri];

    // Alternating row bg
    if (ri % 2 === 0) {
      var rowBg = figma.createRectangle();
      rowBg.name = 'row-bg';
      rowBg.resize(W, ROW_H);
      rowBg.fills = solid(tok('surface-default'));
      frame.appendChild(rowBg);
      rowBg.x = 0; rowBg.y = rowY;
    }

    // Status dot
    var dotColor = row.status === 'found'   ? 'positive-default'
                 : row.status === 'missing' ? 'danger-default'
                 :                            'caution-default';
    var dot = figma.createEllipse();
    dot.name = 'dot';
    dot.resize(8, 8);
    dot.fills = solid(tok(dotColor));
    dot.strokes = [];
    frame.appendChild(dot);
    dot.x = PAD;
    dot.y = rowY + Math.round((ROW_H - 8) / 2);

    // Atom name
    var nameColor = row.status === 'found'   ? 'foreground-primary'
                  : row.status === 'missing' ? 'foreground-muted'
                  :                            'caution-default';
    var nameTxt = makeText(row.name, 13, 'Medium', nameColor);
    frame.appendChild(nameTxt);
    nameTxt.x = PAD + 16;
    nameTxt.y = rowY + Math.round((ROW_H - nameTxt.height) / 2);

    // Status label
    var statusStr = row.status === 'found'   ? 'found'
                  : row.status === 'missing' ? 'missing'
                  :                            'extra';
    var statusTxt = makeText(statusStr, 11, 'Regular', dotColor);
    frame.appendChild(statusTxt);
    statusTxt.x = 180;
    statusTxt.y = rowY + Math.round((ROW_H - statusTxt.height) / 2);

    // Variant count (only when found or extra)
    if (row.count > 0) {
      var countStr = row.count + ' variants';
      var countTxt = makeText(countStr, 11, 'Regular', 'foreground-muted');
      frame.appendChild(countTxt);
      countTxt.x = W - PAD - countTxt.width;
      countTxt.y = rowY + Math.round((ROW_H - countTxt.height) / 2);
    }

    rowY = rowY + ROW_H;
  }

  return frame;
}

// ── MAIN HANDLER ─────────────────────────────────────────────
figma.showUI(__html__, { width: 320, height: 520 });

figma.ui.onmessage = async function(msg) {

  // ── SCAN ────────────────────────────────────────────────────
  if (msg.type === 'scan') {
    try {
      var map    = scanPage();
      var report = buildReport(map);

      // Persist index to sharedPluginData so plugin-03b can read it.
      // sharedPluginData is accessible across plugins sharing the same namespace.
      var serialisable = {};
      var keys = Object.keys(report.index);
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        serialisable[key] = {
          id:           report.index[key].id,
          variantCount: report.index[key].variantCount,
          variantNames: report.index[key].variantNames,
        };
      }
      figma.root.setSharedPluginData(SHARED_NS, STORAGE_KEY, JSON.stringify(serialisable));

      // Send result to UI
      figma.ui.postMessage({
        type:    'scan-result',
        present: report.present,
        missing: report.missing,
        extra:   report.extra,
        total:   EXPECTED_ATOMS.length,
      });

      figma.notify(
        '✅ 스캔 완료: ' + report.present.length + '/' + EXPECTED_ATOMS.length + ' 아톰 확인'
        + (report.missing.length > 0 ? ' (' + report.missing.length + '개 누락)' : '')
      );
    } catch (err) {
      var m = (err && err.message) ? err.message : String(err);
      figma.notify('❌ 스캔 오류: ' + m, { error: true });
      figma.ui.postMessage({ type: 'scan-error', message: m });
    }
  }

  // ── BUILD INDEX FRAME ────────────────────────────────────────
  if (msg.type === 'build-frame') {
    try {
      var storedRaw = figma.root.getSharedPluginData(SHARED_NS, STORAGE_KEY);
      if (!storedRaw) {
        figma.notify('⚠️ 먼저 Scan을 실행하세요.', { error: true });
        return;
      }
      var storedMap = JSON.parse(storedRaw);
      var rpt = buildReport(storedMap);
      var indexFrame = await buildIndexFrame(rpt);
      figma.viewport.scrollAndZoomIntoView([indexFrame]);
      figma.notify('✅ Atom Index 프레임 생성 완료');
    } catch (err) {
      var m2 = (err && err.message) ? err.message : String(err);
      figma.notify('❌ 프레임 생성 오류: ' + m2, { error: true });
    }
  }

  // ── CLEAR CACHE ──────────────────────────────────────────────
  if (msg.type === 'clear-cache') {
    try {
      figma.root.setSharedPluginData(SHARED_NS, STORAGE_KEY, '');
      figma.notify('🗑 Atom Index 캐시 삭제됨');
      figma.ui.postMessage({ type: 'cache-cleared' });
    } catch (err) {
      figma.notify('❌ 캐시 삭제 오류', { error: true });
    }
  }
};
