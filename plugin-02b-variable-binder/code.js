// ============================================================
// Variable Binder  (plugin-02b)
//
// Reads atoms produced by plugin-02a and wires every color
// fill / stroke and every cornerRadius to the Local Variables
// that plugin-01-color-sync already created.
//
// Stage 1  Load Semantic COLOR variables -> build colorMap
// Stage 2  Create / ensure "Radius" FLOAT variable collection
// Stage 3  Walk target nodes, bind fills + strokes + cornerRadius
// Stage 4  Post results to UI
//
// Figma jsvm-cpp constraints observed throughout:
//   - NO optional chaining (?.)
//   - NO nullish coalescing (??)
//   - Use || and explicit && checks instead
// ============================================================

// ── Semantic color map (mirrors SEM_MAP in plugin-01) ────────
// hex values are the source of truth used for RGB matching.
var SEM_MAP = [
  { name: 'background',           hex: '#020617' },
  { name: 'foreground/primary',   hex: '#f1f5f9' },
  { name: 'foreground/secondary', hex: '#e2e8f0' },
  { name: 'foreground/tertiary',  hex: '#cbd5e1' },
  { name: 'foreground/strong',    hex: '#f8fafc' },
  { name: 'foreground/muted',     hex: '#94a3b8' },
  { name: 'primary/default',      hex: '#3b82f6' },
  { name: 'input',                hex: '#1e293b' },
  { name: 'surface/default',      hex: '#0f172a' },
  { name: 'surface/hover',        hex: '#1e293b' },
  { name: 'border/primary',       hex: '#475569' },
  { name: 'border/secondary',     hex: '#334155' },
  { name: 'brand/deep',           hex: '#7c3aed' },
  { name: 'brand/default',        hex: '#8b5cf6' },
  { name: 'brand/soft',           hex: '#a78bfa' },
  { name: 'brand/faint',          hex: '#c4b5fd' },
  { name: 'positive/default',     hex: '#10b981' },
  { name: 'positive/soft',        hex: '#34d399' },
  { name: 'danger/deep',          hex: '#dc2626' },
  { name: 'danger/default',       hex: '#ef4444' },
  { name: 'danger/soft',          hex: '#f87171' },
  { name: 'caution/default',      hex: '#f59e0b' },
  { name: 'caution/soft',         hex: '#fbbf24' },
  { name: 'chart/1',              hex: '#8b5cf6' },
  { name: 'chart/2',              hex: '#10b981' },
  { name: 'chart/4',              hex: '#60a5fa' },
];

// ── Radius tokens (mirrors RADIUS in plugin-02a) ──────────────
var RADIUS_COLLECTION = 'Radius';
var RADIUS_TOKENS = [
  { name: 'radius/sm', value: 6,  description: 'Small inner elements' },
  { name: 'radius/md', value: 8,  description: 'Buttons, inputs, tooltips, cells' },
  { name: 'radius/lg', value: 12, description: 'Alerts, cards' },
  { name: 'radius/xl', value: 16, description: 'Wrapper atom frames' },
];

// Radius values that have a matching variable (quick lookup set)
var BOUND_RADII = { 6: true, 8: true, 12: true, 16: true };

// ── Atom wrapper frame names (plugin-02a title param) ─────────
var ATOM_NAMES = [
  'Button', 'Input', 'Badge', 'Checkbox', 'Radio', 'Switcher',
  'Select', 'SearchField', 'Progress', 'Avatar', 'Alert',
  'Spinner', 'Separator', 'Toggle', 'Tooltip',
];

// RGB match tolerance (±1.5 / 255 ≈ 0.6%)
var COLOR_TOL = 1.5 / 255;

// ── UI bridge ─────────────────────────────────────────────────
figma.showUI(__html__, {
  width: 340,
  height: 460,
  title: 'Variable Binder 02b',
  themeColors: true,
});

figma.ui.onmessage = function(msg) {
  if (msg.type === 'run') {
    run(msg.scope || 'all-atoms').catch(function(err) {
      figma.ui.postMessage({ type: 'error', message: String(err) });
    });
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// ── Helpers ───────────────────────────────────────────────────
function post(type, payload) {
  var msg = payload || {};
  msg.type = type;
  figma.ui.postMessage(msg);
}

function hexToRgb(h) {
  return {
    r: parseInt(h.slice(1, 3), 16) / 255,
    g: parseInt(h.slice(3, 5), 16) / 255,
    b: parseInt(h.slice(5, 7), 16) / 255,
  };
}

function colorMatch(a, b) {
  return (
    Math.abs(a.r - b.r) < COLOR_TOL &&
    Math.abs(a.g - b.g) < COLOR_TOL &&
    Math.abs(a.b - b.b) < COLOR_TOL
  );
}

function findColorVar(rgb, colorMap) {
  for (var i = 0; i < colorMap.length; i++) {
    if (colorMatch(rgb, colorMap[i].rgb)) {
      return colorMap[i].variable;
    }
  }
  return null;
}

// ── Stage 1: Build colorMap from Semantic collection ─────────
// Looks up variables by name so we never need to resolve aliases.
async function buildColorMap() {
  var allVars = await figma.variables.getLocalVariablesAsync('COLOR');
  var colorMap = [];

  for (var i = 0; i < SEM_MAP.length; i++) {
    var entry = SEM_MAP[i];
    var found = null;
    for (var j = 0; j < allVars.length; j++) {
      if (allVars[j].name === entry.name) {
        found = allVars[j];
        break;
      }
    }
    if (found) {
      colorMap.push({ rgb: hexToRgb(entry.hex), variable: found });
    }
  }

  return colorMap;
}

// ── Stage 2: Ensure Radius collection + variables ─────────────
async function ensureRadiusVars() {
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var radC = null;
  for (var i = 0; i < collections.length; i++) {
    if (collections[i].name === RADIUS_COLLECTION) {
      radC = collections[i];
      break;
    }
  }
  if (!radC) {
    radC = figma.variables.createVariableCollection(RADIUS_COLLECTION);
  }

  var modeId = radC.defaultModeId;
  var allFloats = await figma.variables.getLocalVariablesAsync('FLOAT');

  // radiusMap: numeric value -> Variable object
  var radiusMap = {};

  for (var t = 0; t < RADIUS_TOKENS.length; t++) {
    var tok = RADIUS_TOKENS[t];
    var existing = null;
    for (var v = 0; v < allFloats.length; v++) {
      if (allFloats[v].name === tok.name && allFloats[v].variableCollectionId === radC.id) {
        existing = allFloats[v];
        break;
      }
    }
    if (!existing) {
      existing = figma.variables.createVariable(tok.name, radC, 'FLOAT');
    }
    existing.setValueForMode(modeId, tok.value);
    existing.description = tok.description;
    radiusMap[tok.value] = existing;
  }

  return radiusMap;
}

// ── Stage 3: Find root nodes to walk ─────────────────────────
function findRoots(scope) {
  if (scope === 'selection') {
    var sel = figma.currentPage.selection;
    if (sel && sel.length > 0) { return sel; }
    // fall through to all-atoms if nothing selected
  }

  // 'all-atoms': find FRAME nodes whose name matches an atom
  var roots = [];
  var pageChildren = figma.currentPage.children;
  for (var i = 0; i < pageChildren.length; i++) {
    var ch = pageChildren[i];
    for (var k = 0; k < ATOM_NAMES.length; k++) {
      if (ch.name === ATOM_NAMES[k]) {
        roots.push(ch);
        break;
      }
    }
  }

  if (roots.length > 0) { return roots; }

  // Last resort: entire page
  return pageChildren;
}

// ── Stage 3: Node walker ──────────────────────────────────────
function walkNode(node, colorMap, radiusMap, stats) {
  stats.nodes++;

  // ── Fills ────────────────────────────────────────────────
  if ('fills' in node && Array.isArray(node.fills) && node.fills !== figma.mixed) {
    var origFills = node.fills;
    var newFills = [];
    var opacityPatches = []; // { index, opacity } for sub-1 fill opacities
    var fillChanged = false;

    for (var i = 0; i < origFills.length; i++) {
      var p = origFills[i];
      if (p.type === 'SOLID') {
        var cVar = findColorVar(p.color, colorMap);
        if (cVar) {
          var bound = figma.variables.setBoundVariableForPaint(p, 'color', cVar);
          newFills.push(bound);
          // Preserve explicit fill-level opacity (used by solidOpacity())
          var origOp = (p.opacity !== undefined && p.opacity !== null) ? p.opacity : 1;
          if (origOp < 0.99) {
            opacityPatches.push({ index: i, opacity: origOp });
          }
          fillChanged = true;
          stats.colors++;
          continue;
        }
      }
      newFills.push(p);
    }

    if (fillChanged) {
      try {
        node.fills = newFills;
        // Re-apply opacity after assignment (setBoundVariableForPaint may strip it)
        if (opacityPatches.length > 0) {
          var patchedFills = JSON.parse(JSON.stringify(node.fills));
          for (var fp = 0; fp < opacityPatches.length; fp++) {
            patchedFills[opacityPatches[fp].index].opacity = opacityPatches[fp].opacity;
          }
          node.fills = patchedFills;
        }
      } catch (e) {
        stats.errors.push('fill @ ' + node.name);
      }
    }
  }

  // ── Strokes ──────────────────────────────────────────────
  if ('strokes' in node && Array.isArray(node.strokes)) {
    var origStrokes = node.strokes;
    var newStrokes = [];
    var strokeOpacityPatches = [];
    var strokeChanged = false;

    for (var j = 0; j < origStrokes.length; j++) {
      var s = origStrokes[j];
      if (s.type === 'SOLID') {
        var sVar = findColorVar(s.color, colorMap);
        if (sVar) {
          var boundS = figma.variables.setBoundVariableForPaint(s, 'color', sVar);
          newStrokes.push(boundS);
          var sOp = (s.opacity !== undefined && s.opacity !== null) ? s.opacity : 1;
          if (sOp < 0.99) {
            strokeOpacityPatches.push({ index: j, opacity: sOp });
          }
          strokeChanged = true;
          stats.colors++;
          continue;
        }
      }
      newStrokes.push(s);
    }

    if (strokeChanged) {
      try {
        node.strokes = newStrokes;
        if (strokeOpacityPatches.length > 0) {
          var patchedStrokes = JSON.parse(JSON.stringify(node.strokes));
          for (var sp = 0; sp < strokeOpacityPatches.length; sp++) {
            patchedStrokes[strokeOpacityPatches[sp].index].opacity = strokeOpacityPatches[sp].opacity;
          }
          node.strokes = patchedStrokes;
        }
      } catch (e) {
        stats.errors.push('stroke @ ' + node.name);
      }
    }
  }

  // ── cornerRadius ─────────────────────────────────────────
  // Only bind uniform radius values that map to our 4 tokens.
  // Skip figma.mixed (individual corner overrides) and unlisted values.
  if (
    'cornerRadius' in node &&
    node.cornerRadius !== figma.mixed &&
    typeof node.cornerRadius === 'number'
  ) {
    var rv = node.cornerRadius;
    if (BOUND_RADII[rv] && radiusMap[rv]) {
      try {
        node.setBoundVariable('cornerRadius', radiusMap[rv]);
        stats.radii++;
      } catch (e) {
        stats.errors.push('radius @ ' + node.name);
      }
    }
  }

  // ── Recurse ───────────────────────────────────────────────
  if ('children' in node && node.children) {
    for (var k = 0; k < node.children.length; k++) {
      walkNode(node.children[k], colorMap, radiusMap, stats);
    }
  }
}

// ── Main entry ────────────────────────────────────────────────
async function run(scope) {
  try {
    post('stage', { text: 'Loading Semantic color variables...', progress: 10 });
    var colorMap = await buildColorMap();

    if (!colorMap || colorMap.length === 0) {
      post('error', {
        message: 'No Semantic color variables found.\nRun plugin-01-color-sync first.',
      });
      return;
    }

    post('stage', { text: 'Ensuring Radius variable collection...', progress: 30 });
    var radiusMap = await ensureRadiusVars();

    post('stage', { text: 'Locating atom frames...', progress: 50 });
    var roots = findRoots(scope);

    post('stage', { text: 'Binding variables...', progress: 65 });
    var stats = { colors: 0, radii: 0, nodes: 0, errors: [] };
    for (var i = 0; i < roots.length; i++) {
      walkNode(roots[i], colorMap, radiusMap, stats);
    }

    post('done', {
      colors:     stats.colors,
      radii:      stats.radii,
      nodes:      stats.nodes,
      errorCount: stats.errors.length,
      errors:     stats.errors.slice(0, 20), // cap for UI
      colorVars:  colorMap.length,
      atomsFound: roots.length,
    });

  } catch (err) {
    post('error', { message: String(err) });
  }
}
