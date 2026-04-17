// ============================================================
// AI SEO Dashboard – Variable Binder (GET or CREATE 적용 버전)
// ============================================================

function hex(h) {
  return {
    r: parseInt(h.slice(1, 3), 16) / 255,
    g: parseInt(h.slice(3, 5), 16) / 255,
    b: parseInt(h.slice(5, 7), 16) / 255,
  };
}

var SCALES = {
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
};

var SEM_MAP = [
  { name: 'background', hex: '#020617', ref: 'slate/950' },
  { name: 'foreground/primary', hex: '#f1f5f9', ref: 'slate/100' },
  { name: 'foreground/secondary', hex: '#e2e8f0', ref: 'slate/200' },
  { name: 'foreground/tertiary', hex: '#cbd5e1', ref: 'slate/300' },
  { name: 'foreground/strong', hex: '#f8fafc', ref: 'slate/50' },
  { name: 'foreground/muted', hex: '#94a3b8', ref: 'slate/400' },
  { name: 'primary/default', hex: '#3b82f6', ref: 'blue/500' },
  { name: 'input', hex: '#1e293b', ref: 'slate/800' },
  { name: 'surface/default', hex: '#0f172a', ref: 'slate/900' },
  { name: 'surface/hover', hex: '#1e293b', ref: 'slate/800' },
  { name: 'border/primary', hex: '#475569', ref: 'slate/600' },
  { name: 'border/secondary', hex: '#334155', ref: 'slate/700' },
  { name: 'brand/deep', hex: '#7c3aed', ref: 'violet/600' },
  { name: 'brand/default', hex: '#8b5cf6', ref: 'violet/500' },
  { name: 'brand/soft', hex: '#a78bfa', ref: 'violet/400' },
  { name: 'brand/faint', hex: '#c4b5fd', ref: 'violet/300' },
  { name: 'positive/default', hex: '#10b981', ref: 'emerald/500' },
  { name: 'positive/soft', hex: '#34d399', ref: 'emerald/400' },
  { name: 'danger/deep', hex: '#dc2626', ref: 'red/600' },
  { name: 'danger/default', hex: '#ef4444', ref: 'red/500' },
  { name: 'danger/soft', hex: '#f87171', ref: 'red/400' },
  { name: 'caution/default', hex: '#f59e0b', ref: 'amber/500' },
  { name: 'caution/soft', hex: '#fbbf24', ref: 'amber/400' },
  { name: 'chart/1', hex: '#8b5cf6', ref: 'violet/500' },
  { name: 'chart/2', hex: '#10b981', ref: 'emerald/500' },
  { name: 'chart/4', hex: '#60a5fa', ref: 'blue/400' },
];

var DIRECT_TOL = 1.5 / 255;
var PREMUL_TOL = 8 / 255;
var MIN_OPACITY = 0.04;

function findVarMatch(rgb, colorMap) {
  for (var i = 0; i < colorMap.length; i++) {
    var entry = colorMap[i];
    var ref = entry.rgb;
    if (Math.abs(rgb.r - ref.r) < DIRECT_TOL && Math.abs(rgb.g - ref.g) < DIRECT_TOL && Math.abs(rgb.b - ref.b) < DIRECT_TOL) {
      return { variable: entry.variable, inferredOpacity: null };
    }
  }
  return null;
}

async function bindNode(node, colorMap) {
  var boundCount = 0;
  if ('fills' in node && Array.isArray(node.fills) && node.fills !== figma.mixed) {
    var originalFills = node.fills;
    var newFills = [];
    var needsManualFillOpacity = [];
    var changedF = false;

    for (var i = 0; i < originalFills.length; i++) {
      var p = originalFills[i];
      if (p.type === 'SOLID') {
        var match = findVarMatch(p.color, colorMap);
        if (match) {
          var boundPaint = figma.variables.setBoundVariableForPaint(p, 'color', match.variable);
          newFills.push(boundPaint);
          var origFillOp = (p.opacity !== undefined) ? p.opacity : 1;
          if (origFillOp < 0.99) needsManualFillOpacity.push({ index: i, opacity: origFillOp });
          changedF = true;
          boundCount++;
          continue;
        }
      }
      newFills.push(p);
    }

    if (changedF) {
      node.fills = newFills;
      if (needsManualFillOpacity.length > 0) {
        var tempFills = JSON.parse(JSON.stringify(node.fills));
        for (var f = 0; f < needsManualFillOpacity.length; f++) {
          tempFills[needsManualFillOpacity[f].index].opacity = needsManualFillOpacity[f].opacity;
        }
        node.fills = tempFills;
      }
    }
  }

  if ('strokes' in node && Array.isArray(node.strokes)) {
    var originalStrokes = node.strokes;
    var newStrokes = [];
    var needsManualStrokeOpacity = [];
    var changedS = false;

    for (var j = 0; j < originalStrokes.length; j++) {
      var s = originalStrokes[j];
      if (s.type === 'SOLID') {
        var matchS = findVarMatch(s.color, colorMap);
        if (matchS) {
          var boundStroke = figma.variables.setBoundVariableForPaint(s, 'color', matchS.variable);
          newStrokes.push(boundStroke);
          var origStrokeOp = (s.opacity !== undefined) ? s.opacity : 1;
          if (origStrokeOp < 0.99) needsManualStrokeOpacity.push({ index: j, opacity: origStrokeOp });
          changedS = true;
          boundCount++;
          continue;
        }
      }
      newStrokes.push(s);
    }

    if (changedS) {
      node.strokes = newStrokes;
      if (needsManualStrokeOpacity.length > 0) {
        var tempStrokes = JSON.parse(JSON.stringify(node.strokes));
        for (var sIdx = 0; sIdx < needsManualStrokeOpacity.length; sIdx++) {
          tempStrokes[needsManualStrokeOpacity[sIdx].index].opacity = needsManualStrokeOpacity[sIdx].opacity;
        }
        node.strokes = tempStrokes;
      }
    }
  }

  if ('children' in node) {
    for (var k = 0; k < node.children.length; k++) {
      boundCount += await bindNode(node.children[k], colorMap);
    }
  }
  return boundCount;
}

async function createVariables() {
  var collections = figma.variables.getLocalVariableCollections();
  var primC, semC;

  // 1. 기존 컬렉션 탐색 (삭제 안 함)
  for (var i = 0; i < collections.length; i++) {
    if (collections[i].name === 'Primitives') primC = collections[i];
    if (collections[i].name === 'Semantic') semC = collections[i];
  }

  // 2. 없으면 생성
  if (!primC) primC = figma.variables.createVariableCollection('Primitives');
  if (!semC) semC = figma.variables.createVariableCollection('Semantic');

  var primM = primC.defaultModeId;
  var semM = semC.defaultModeId;

  // 3. Primitives 변수 생성/참조
  var P = {};
  var allVars = figma.variables.getLocalVariables();

  for (var scale in SCALES) {
    var steps = SCALES[scale];
    for (var step in steps) {
      var vName = scale + '/' + step;
      var existingV = allVars.find(function (v) { return v.name === vName && v.variableCollectionId === primC.id; });
      if (!existingV) {
        existingV = figma.variables.createVariable(vName, primC, 'COLOR');
      }
      existingV.setValueForMode(primM, hex(steps[step]));
      P[vName] = existingV;
    }
  }

  // 4. Semantic 변수 생성/참조 및 Alias 연결
  var S = {};
  for (var j = 0; j < SEM_MAP.length; j++) {
    var item = SEM_MAP[j];
    var existingS = allVars.find(function (v) { return v.name === item.name && v.variableCollectionId === semC.id; });
    if (!existingS) {
      existingS = figma.variables.createVariable(item.name, semC, 'COLOR');
    }
    existingS.setValueForMode(semM, { type: 'VARIABLE_ALIAS', id: P[item.ref].id });
    S[item.name] = existingS;
  }
  return { S: S };
}

async function main() {
  try {
    figma.notify('⚙️ 디자인 토큰 바인딩 중...');
    var res = await createVariables();
    var colorMap = SEM_MAP.map(function (item) {
      return { rgb: hex(item.hex), variable: res.S[item.name] };
    });

    var totalBound = 0;
    var children = figma.currentPage.children;
    for (var i = 0; i < children.length; i++) {
      totalBound += await bindNode(children[i], colorMap);
    }

    figma.notify('✅ 완료: ' + totalBound + '개 바인딩됨');
    figma.closePlugin();
  } catch (err) {
    figma.closePlugin('❌ 에러: ' + err.message);
  }
}

main();