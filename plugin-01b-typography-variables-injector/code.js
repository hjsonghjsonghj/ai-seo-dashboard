// ============================================================
// DS Sync v2 — seo-analytics_design-system
// ──────────────────────────────────────────────────────────
// Stage 1 │ Primitives + Semantic variables (Get-or-Create)
// Stage 2 │ Text Styles + variable binding
// Stage 3 │ Auto-scan & bind existing TextNodes
// Stage 4 │ figma.notify summary
//
// Naming is 1:1 with globals.css / lib/utils.ts tokens:
//   CSS utility        │ Semantic variable prefix       │ Text Style
//   text-display-sm    │ typography/display-sm/*         │ Typography/display-sm
//   text-body-md       │ typography/body-md/*            │ Typography/body-md
//   …                  │ …                               │ …
// ============================================================
//
// ── CSS ↔ Figma Font Weight Mapping Guide ─────────────────
//   globals.css value   │ Primitives var        │ STRING value  │ CSS utility
//   --fw-*: 400         │ weight/regular        │ "Regular"     │ font-normal
//   --fw-*: 500         │ weight/medium         │ "Medium"      │ font-medium
//   --fw-*: 600         │ weight/semibold       │ "SemiBold"    │ font-semibold
//   --fw-*: 700         │ weight/bold           │ "Bold"        │ font-bold
//
// weight/* Primitives are STRING type (Figma font style name).
// size/* and lh/* Primitives are FLOAT type (px value).
//
// Why STRING?
//   fontName.style in Figma API accepts a string ("SemiBold" etc.).
//   Storing the string directly in the variable eliminates a
//   numeric→string conversion step and makes the token self-documenting.
// ============================================================

async function main() {

  // ── Stats ─────────────────────────────────────────────────
  const stats = {
    primCreated: 0, primUpdated: 0,
    semCreated:  0, semUpdated:  0,
    styleCreated: 0, styleUpdated: 0,
    layersBound: 0, layersSkipped: 0,
    errors: [],
  };

  // ── Token table (single source of truth) ─────────────────
  // Mirrors globals.css @theme + --fw-* values exactly.
  //   key         = CSS token suffix  (→ text-{key} Tailwind utility)
  //   size        = px font-size      (→ --text-{key})
  //   lh          = px line-height    (→ --text-{key}--line-height, computed)
  //   weightStyle = Figma font style  (→ --fw-{key} numeric, see mapping guide above)
  //   sizePrim / lhPrim / weightPrim  = Primitives variable names
  //
  // title-sub(16px/"SemiBold") and body-lg(16px/"Regular") share the same
  // font-size but are correctly distinguished by weightStyle during auto-detection.
  const TOKENS = [
    { key: "display-sm",    size: 30, lh: 36, weightStyle: "SemiBold", sizePrim: "size/700", lhPrim: "lh/display-sm",    weightPrim: "weight/semibold" },
    { key: "title-page",    size: 20, lh: 28, weightStyle: "SemiBold", sizePrim: "size/600", lhPrim: "lh/title-page",    weightPrim: "weight/semibold" },
    { key: "title-section", size: 18, lh: 27, weightStyle: "SemiBold", sizePrim: "size/500", lhPrim: "lh/title-section", weightPrim: "weight/semibold" },
    { key: "title-sub",     size: 16, lh: 24, weightStyle: "SemiBold", sizePrim: "size/400", lhPrim: "lh/title-sub",     weightPrim: "weight/semibold" },
    { key: "body-lg",       size: 16, lh: 24, weightStyle: "Regular",  sizePrim: "size/400", lhPrim: "lh/body-lg",       weightPrim: "weight/regular"  },
    { key: "body-md",       size: 14, lh: 20, weightStyle: "Medium",   sizePrim: "size/300", lhPrim: "lh/body-md",       weightPrim: "weight/medium"   },
    { key: "body-sm",       size: 13, lh: 18, weightStyle: "Medium",   sizePrim: "size/200", lhPrim: "lh/body-sm",       weightPrim: "weight/medium"   },
    { key: "label-xs",      size: 12, lh: 16, weightStyle: "Medium",   sizePrim: "size/100", lhPrim: "lh/label-xs",      weightPrim: "weight/medium"   },
    { key: "label-micro",   size: 11, lh: 14, weightStyle: "Medium",   sizePrim: "size/50",  lhPrim: "lh/label-micro",   weightPrim: "weight/medium"   },
  ];

  // ── Weight style normaliser (for auto-detection) ──────────
  // Converts any Figma font style string to a canonical lowercase key
  // that matches the lowercased weightStyle values in TOKENS above.
  //
  // Examples:
  //   "SemiBold" | "Semi Bold" | "DemiBold" → "semibold"
  //   "Regular"  | "Normal"    | "Roman"    → "regular"
  //   "Bold Italic"                         → "bold"  (italic stripped)
  //   "ExtraBold"                           → "extrabold" (no match → skipped)
  //
  // Note: no numeric conversion needed any more. The lookup key is
  // "${size}_${normStyle}", e.g. "16_semibold" or "16_regular".
  function normalizeWeightStyle(str) {
    const norm = (str || "")
      .toLowerCase()
      .replace(/italic/g, "")          // strip italic suffix
      .replace(/[\s\-_]/g, "")         // strip spaces / hyphens
      .trim();
    // Synonym map → canonical names that match TOKENS[].weightStyle.toLowerCase()
    const synonyms = {
      "normal": "regular", "roman":    "regular",
      "book":   "regular", "upright":  "regular",
      "demi":   "semibold","demibold": "semibold",
      "heavy":  "bold",
    };
    return synonyms[norm] !== undefined ? synonyms[norm] : norm;
  }

  // ── Auto-detection lookup ─────────────────────────────────
  // Key: "${Math.round(size)}_${normalizeWeightStyle(weightStyle)}"
  // e.g. "16_semibold" → "title-sub",  "16_regular" → "body-lg"
  const TOKEN_LOOKUP = new Map(
    TOKENS.map(t => [`${t.size}_${normalizeWeightStyle(t.weightStyle)}`, t.key])
  );

  // ────────────────────────────────────────────────────────
  // STAGE 0: Font Loading
  // ────────────────────────────────────────────────────────
  const FONT_CANDIDATES = ["Geist", "Inter", "SF Pro Text", "Helvetica Neue", "Roboto"];
  let resolvedFamily = null;

  for (const family of FONT_CANDIDATES) {
    try {
      await figma.loadFontAsync({ family, style: "Regular" });
      resolvedFamily = family;
      break;
    } catch (_) { /* try next */ }
  }

  if (!resolvedFamily) {
    figma.closePlugin("❌ 사용 가능한 폰트를 찾을 수 없습니다. Geist 또는 Inter를 Figma에 설치하세요.");
    return;
  }

  // Pre-load all font styles we'll use (derived directly from token weightStyle)
  const requiredStyles = [...new Set(TOKENS.map(t => t.weightStyle))];
  for (const style of requiredStyles) {
    try { await figma.loadFontAsync({ family: resolvedFamily, style }); }
    catch (_) { stats.errors.push(`폰트 로드 실패: ${resolvedFamily} ${style}`); }
  }

  // ────────────────────────────────────────────────────────
  // STAGE 1: Variables — Primitives + Semantic
  // ────────────────────────────────────────────────────────

  // Helper: Get or Create a VariableCollection
  function getOrCreateCollection(name) {
    const found = figma.variables.getLocalVariableCollections().find(c => c.name === name);
    if (found) return found;
    return figma.variables.createVariableCollection(name);
  }

  // Helper: Get or Create a Variable, with type-mismatch migration.
  // If an existing variable has the wrong type (e.g. old FLOAT weight vars
  // being upgraded to STRING), it is removed and recreated.
  function getOrCreateVar(name, collection, type) {
    const found = figma.variables.getLocalVariables()
      .find(v => v.variableCollectionId === collection.id && v.name === name);

    if (found) {
      if (found.resolvedType !== type) {
        // Type changed (e.g. FLOAT → STRING for weight vars): migrate by removing old var.
        try { found.remove(); }
        catch (e) {
          stats.errors.push(`타입 마이그레이션 실패 '${name}': ${e.message}. 수동으로 삭제 후 재실행하세요.`);
          return null;
        }
        // Fall through to create with correct type
      } else {
        const isSem = name.startsWith("typography/");
        isSem ? stats.semUpdated++ : stats.primUpdated++;
        return found;
      }
    }

    const isSem = name.startsWith("typography/");
    isSem ? stats.semCreated++ : stats.primCreated++;
    return figma.variables.createVariable(name, collection, type);
  }

  // ── 1-A. Primitives ───────────────────────────────────────
  const primColl = getOrCreateCollection("Primitives");
  const primMode = primColl.defaultModeId;

  // FLOAT primitives: size/* and lh/*
  const PRIM_FLOAT = {
    // Font-size scale (px) — matches globals.css --text-* vars
    "size/700": 30, "size/600": 20, "size/500": 18, "size/400": 16,
    "size/300": 14, "size/200": 13, "size/100": 12, "size/50":  11,
    // Line-height scale (px computed) — matches --text-*--line-height vars
    "lh/display-sm":    36, "lh/title-page":    28, "lh/title-section": 27,
    "lh/title-sub":     24, "lh/body-lg":       24, "lh/body-md":       20,
    "lh/body-sm":       18, "lh/label-xs":      16, "lh/label-micro":   14,
  };

  // STRING primitives: weight/*
  // Value = Figma fontName.style string — ready to use directly, no conversion needed.
  // See mapping guide at the top of this file for CSS numeric equivalents.
  const PRIM_STRING = {
    "weight/regular":  "Regular",   // CSS: 400 / font-normal
    "weight/medium":   "Medium",    // CSS: 500 / font-medium
    "weight/semibold": "SemiBold",  // CSS: 600 / font-semibold
    "weight/bold":     "Bold",      // CSS: 700 / font-bold
  };

  const primVarMap = {}; // "size/700" | "lh/body-sm" | "weight/semibold" → Variable

  for (const [name, value] of Object.entries(PRIM_FLOAT)) {
    const v = getOrCreateVar(name, primColl, "FLOAT");
    if (v) { v.setValueForMode(primMode, value); primVarMap[name] = v; }
  }

  for (const [name, value] of Object.entries(PRIM_STRING)) {
    const v = getOrCreateVar(name, primColl, "STRING");
    if (v) { v.setValueForMode(primMode, value); primVarMap[name] = v; }
  }

  // ── 1-B. Semantic ─────────────────────────────────────────
  // Naming: typography/{css-key}/{size|lh|weight}
  //   typography/display-sm/size   ←→  --text-display-sm (30px)
  //   typography/display-sm/lh     ←→  --text-display-sm--line-height (36px)
  //   typography/display-sm/weight ←→  weight/semibold ("SemiBold") — STRING alias
  const semColl = getOrCreateCollection("Semantic");
  const semMode = semColl.defaultModeId;

  const semVarMap = {}; // "{key}/size|lh|weight" → Variable

  for (const token of TOKENS) {
    const base = `typography/${token.key}`;

    const sizeVar = getOrCreateVar(`${base}/size`, semColl, "FLOAT");
    if (sizeVar) {
      sizeVar.setValueForMode(semMode, figma.variables.createVariableAlias(primVarMap[token.sizePrim]));
      semVarMap[`${token.key}/size`] = sizeVar;
    }

    const lhVar = getOrCreateVar(`${base}/lh`, semColl, "FLOAT");
    if (lhVar) {
      lhVar.setValueForMode(semMode, figma.variables.createVariableAlias(primVarMap[token.lhPrim]));
      semVarMap[`${token.key}/lh`] = lhVar;
    }

    // weight: STRING alias → Primitives weight/* (also STRING)
    const weightVar = getOrCreateVar(`${base}/weight`, semColl, "STRING");
    if (weightVar) {
      weightVar.setValueForMode(semMode, figma.variables.createVariableAlias(primVarMap[token.weightPrim]));
      semVarMap[`${token.key}/weight`] = weightVar;
    }
  }

  // ────────────────────────────────────────────────────────
  // STAGE 2: Text Styles + Variable Binding
  // ────────────────────────────────────────────────────────

  function getOrCreateTextStyle(name) {
    const found = figma.getLocalTextStyles().find(s => s.name === name);
    if (found) { stats.styleUpdated++; return found; }
    stats.styleCreated++;
    return figma.createTextStyle();
  }

  function tryBind(target, field, variable, label) {
    if (!variable) return;
    try {
      if (typeof target.setBoundVariable === "function") {
        target.setBoundVariable(field, variable);
      }
    } catch (e) {
      stats.errors.push(`바인딩 실패 [${label}.${field}]: ${e.message}`);
    }
  }

  const textStyleMap = {}; // token.key → TextStyle

  for (const token of TOKENS) {
    const styleName = `Typography/${token.key}`;

    const style = getOrCreateTextStyle(styleName);
    style.name     = styleName;
    // weightStyle is the Figma font style string — used directly, no conversion.
    style.fontName   = { family: resolvedFamily, style: token.weightStyle };
    style.fontSize   = token.size;
    style.lineHeight = { value: token.lh, unit: "PIXELS" };

    tryBind(style, "fontSize",   semVarMap[`${token.key}/size`], styleName);
    tryBind(style, "lineHeight", semVarMap[`${token.key}/lh`],   styleName);
    // Note: Figma API does not support binding STRING variables to fontName.style
    // on TextStyle. The weight variable serves as a design-token reference.

    textStyleMap[token.key] = style;
  }

  // ────────────────────────────────────────────────────────
  // STAGE 3: Auto-scan & bind existing TextNodes
  // ────────────────────────────────────────────────────────

  function collectTextNodes(node, acc = []) {
    if (node.type === "TEXT") acc.push(node);
    else if ("children" in node) node.children.forEach(c => collectTextNodes(c, acc));
    return acc;
  }

  const allTextNodes = collectTextNodes(figma.currentPage);

  for (const node of allTextNodes) {
    if (node.fontSize === figma.mixed || node.fontName === figma.mixed || node.locked) {
      stats.layersSkipped++;
      continue;
    }

    // Match by normalised (size, weightStyle) pair — same logic as TOKEN_LOOKUP key.
    const nodeSize      = Math.round(node.fontSize);
    const nodeNormStyle = normalizeWeightStyle(node.fontName.style);
    const tokenKey      = TOKEN_LOOKUP.get(`${nodeSize}_${nodeNormStyle}`);

    if (!tokenKey) { stats.layersSkipped++; continue; }

    const matchedToken = TOKENS.find(t => t.key === tokenKey);
    const style        = textStyleMap[tokenKey];

    if (style) {
      try { node.textStyleId = style.id; }
      catch (e) { stats.errors.push(`스타일 적용 실패 [${node.name}]: ${e.message}`); }
    }

    // Ensure PIXELS unit before binding lineHeight variable
    if (node.lineHeight !== figma.mixed && node.lineHeight && node.lineHeight.unit !== "PIXELS") {
      try { node.lineHeight = { value: matchedToken.lh, unit: "PIXELS" }; }
      catch (_) { /* segment-level lock, skip */ }
    }

    tryBind(node, "fontSize",   semVarMap[`${tokenKey}/size`], node.name);
    tryBind(node, "lineHeight", semVarMap[`${tokenKey}/lh`],   node.name);

    stats.layersBound++;
  }

  // ────────────────────────────────────────────────────────
  // STAGE 4: Summary
  // ────────────────────────────────────────────────────────
  const varTotal   = stats.primCreated + stats.primUpdated + stats.semCreated + stats.semUpdated;
  const styleTotal = stats.styleCreated + stats.styleUpdated;

  figma.notify(
    `✅ DS Sync 완료 | 변수 ${varTotal}개 | 스타일 ${styleTotal}개 | 레이어 ${stats.layersBound}개 바인딩`,
    { timeout: 5000 }
  );

  const errorSummary = stats.errors.length > 0
    ? `\n⚠️  경고 ${stats.errors.length}건:\n` + stats.errors.slice(0, 5).map(e => `   • ${e}`).join("\n")
    : "";

  figma.closePlugin(
    `✅ DS Sync v2 완료\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `[변수]\n` +
    `  Primitives : 생성 ${stats.primCreated}개 / 업데이트 ${stats.primUpdated}개\n` +
    `  Semantic   : 생성 ${stats.semCreated}개 / 업데이트 ${stats.semUpdated}개\n` +
    `[스타일]\n` +
    `  Text Style : 생성 ${stats.styleCreated}개 / 업데이트 ${stats.styleUpdated}개\n` +
    `[레이어 바인딩]\n` +
    `  바인딩 완료 : ${stats.layersBound}개\n` +
    `  스킵        : ${stats.layersSkipped}개 (mixed 값·잠금)\n` +
    `[폰트]\n` +
    `  사용 폰트   : ${resolvedFamily}` +
    errorSummary
  );
}

main().catch(err => {
  figma.closePlugin(`❌ 치명적 오류: ${err.message}\n${err.stack || ""}`);
});
