// ============================================================
// AI SEO Dashboard – Variable Binder (FINAL FIX)
// 1. 변수 바인딩 후 유실되는 투명도를 2단계 재주입으로 복구
// 2. 구형 실행 환경 호환성을 위해 구식 문법(ES6 이전) 사용
// ============================================================

function hex(h) {
  return {
    r: parseInt(h.slice(1, 3), 16) / 255,
    g: parseInt(h.slice(3, 5), 16) / 255,
    b: parseInt(h.slice(5, 7), 16) / 255,
  };
}

const SCALES = {
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
};

const SEM_MAP = [
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

const DIRECT_TOL = 1.5 / 255;
const PREMUL_TOL = 8 / 255;
const MIN_OPACITY = 0.04;

function findVarMatch(rgb, colorMap) {
  for (var i = 0; i < colorMap.length; i++) {
    var entry = colorMap[i];
    var ref = entry.rgb;
    if (Math.abs(rgb.r - ref.r) < DIRECT_TOL && Math.abs(rgb.g - ref.g) < DIRECT_TOL && Math.abs(rgb.b - ref.b) < DIRECT_TOL) {
      return { variable: entry.variable, inferredOpacity: null };
    }
  }

  var best = null;
  var bestScore = PREMUL_TOL * 3;
  for (var j = 0; j < colorMap.length; j++) {
    var entry2 = colorMap[j];
    var ref2 = entry2.rgb;
    var estimates = [];
    if (ref2.r > 0.02) estimates.push(rgb.r / ref2.r);
    if (ref2.g > 0.02) estimates.push(rgb.g / ref2.g);
    if (ref2.b > 0.02) estimates.push(rgb.b / ref2.b);
    if (estimates.length === 0) continue;

    var sum = 0;
    for (var k = 0; k < estimates.length; k++) sum += estimates[k];
    var opEst = sum / estimates.length;

    if (opEst < MIN_OPACITY || opEst > 1.01) continue;
    var op = Math.min(1, Math.max(MIN_OPACITY, opEst));
    var score = Math.abs(rgb.r - ref2.r * op) + Math.abs(rgb.g - ref2.g * op) + Math.abs(rgb.b - ref2.b * op);
    if (score < bestScore) {
      bestScore = score;
      best = { variable: entry2.variable, inferredOpacity: op };
    }
  }
  return best;
}

// ── 변수 바인딩 핵심 로직 ───────────────────────
async function bindNode(node, colorMap) {
  var boundCount = 0;

  // 1. Fills 처리
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
          // 변수 바인딩 실행 (오퍼시티가 1로 초기화됨)
          var boundPaint = figma.variables.setBoundVariableForPaint(p, 'color', match.variable);
          newFills.push(boundPaint);

          // 원본 오퍼시티가 0.99 미만인 경우 나중에 덮어쓸 목록에 추가
          var origFillOp = (p.opacity !== undefined) ? p.opacity : 1;
          if (origFillOp < 0.99) {
            needsManualFillOpacity.push({ index: i, opacity: origFillOp });
          }
          changedF = true;
          boundCount++;
          continue;
        }
      }
      newFills.push(p);
    }

    if (changedF) {
      node.fills = newFills; // 1차 적용
      // 2차 강제 주입 (변수가 연결된 상태에서 오퍼시티만 덮어쓰기)
      if (needsManualFillOpacity.length > 0) {
        var tempFills = JSON.parse(JSON.stringify(node.fills));
        for (var f = 0; f < needsManualFillOpacity.length; f++) {
          var itemF = needsManualFillOpacity[f];
          tempFills[itemF.index].opacity = itemF.opacity;
        }
        node.fills = tempFills;
      }
    }
  }

  // 2. Strokes 처리
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
          if (origStrokeOp < 0.99) {
            needsManualStrokeOpacity.push({ index: j, opacity: origStrokeOp });
          }
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
          var itemS = needsManualStrokeOpacity[sIdx];
          tempStrokes[itemS.index].opacity = itemS.opacity;
        }
        node.strokes = tempStrokes;
      }
    }
  }

  // 3. 자식 노드 재귀
  if ('children' in node) {
    for (var k = 0; k < node.children.length; k++) {
      boundCount += await bindNode(node.children[k], colorMap);
    }
  }
  return boundCount;
}

// ── 컬렉션 및 변수 생성 ────────────────────────
async function createVariables() {
  var collections = figma.variables.getLocalVariableCollections();
  for (var i = 0; i < collections.length; i++) {
    var col = collections[i];
    if (['Primitives', 'Semantic'].indexOf(col.name) !== -1) col.remove();
  }

  var primC = figma.variables.createVariableCollection('Primitives');
  var primM = primC.defaultModeId;
  var P = {};
  for (var scale in SCALES) {
    var steps = SCALES[scale];
    for (var step in steps) {
      var v = figma.variables.createVariable(scale + '/' + step, primC, 'COLOR');
      v.setValueForMode(primM, hex(steps[step]));
      P[scale + '/' + step] = v;
    }
  }

  var semC = figma.variables.createVariableCollection('Semantic');
  var semM = semC.defaultModeId;
  var S = {};
  for (var j = 0; j < SEM_MAP.length; j++) {
    var item = SEM_MAP[j];
    var v2 = figma.variables.createVariable(item.name, semC, 'COLOR');
    v2.setValueForMode(semM, { type: 'VARIABLE_ALIAS', id: P[item.ref].id });
    S[item.name] = v2;
  }
  return { S: S };
}

// ── 실행 ───────────────────────────────────────
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
