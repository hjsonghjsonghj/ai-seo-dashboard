// ============================================================
// DS Sync v2 — seo-analytics_design-system
// ──────────────────────────────────────────────────────────
// Stage 1 │ Primitives + Semantic variables (Get-or-Create)
// Stage 2 │ Text Styles + variable binding
// Stage 3 │ Auto-scan & bind existing TextNodes
// Stage 4 │ figma.notify summary
//
// ── Zero-Exceptions Namespace Policy ──────────────────────
// ALL variables in both collections live under the single typography/ root.
//
// Primitives collection:
//   typography/size/*                  px font-size values
//   typography/lh/*                    px line-height values
//   typography/weight/*                STRING font style names ("Regular", "SemiBold" …)
//   typography/font-family/*           STRING font family names ("Geist")
//   typography/letter-spacing/*        FLOAT % values (0.01em = 1%)
//
// Semantic collection:
//   typography/{css-key}/*             UI text scale — aliases typography/ primitives
//   typography/chart/*                 Chart text scale — also aliases typography/ primitives
//                                      (unified under typography/ — no separate chart/ root)
//
// Naming is 1:1 with globals.css / lib/utils.ts tokens:
//   CSS utility                  │ Semantic variable prefix                   │ Text Style
//   text-display-sm-semibold     │ typography/display-sm-semibold/*            │ Typography/display-sm-semibold
//   text-display-sm-bold         │ typography/display-sm-bold/*                │ Typography/display-sm-bold
//   text-body-md-medium          │ typography/body-md-medium/*                 │ Typography/body-md-medium
//   …                            │ …                                           │ …
// ============================================================
//
// ── CSS ↔ Figma Font Weight Mapping Guide ─────────────────
//   globals.css value   │ Primitives var                  │ STRING value  │ CSS utility
//   --fw-*: 400         │ typography/weight/regular        │ "Regular"     │ font-normal
//   --fw-*: 500         │ typography/weight/medium         │ "Medium"      │ font-medium
//   --fw-*: 600         │ typography/weight/semibold       │ "SemiBold"    │ font-semibold
//   --fw-*: 700         │ typography/weight/bold           │ "Bold"        │ font-bold
//
// weight/* Primitives are STRING type (Figma font style name).
// size/* and lh/* Primitives are FLOAT type (px value).
// letter-spacing/* Primitives are FLOAT type (% value, e.g. 0.01em → 1.0).
//
// Why STRING for weight/family?
//   fontName.style / fontName.family in Figma API accept string values.
//   Storing the string directly in the variable eliminates a
//   numeric→string conversion step and makes the token self-documenting.
// ============================================================

async function main() {

  // ── Stats ─────────────────────────────────────────────────
  const stats = {
    primCreated: 0, primUpdated: 0,
    semCreated: 0, semUpdated: 0,
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
  // title-sub(16px/"SemiBold"), body-md-regular(16px/"Regular"), and body-md-medium(16px/"Medium")
  // all share the same font-size but are correctly distinguished by weightStyle during auto-detection.
  const TOKENS = [
    // ── UI text scale (size + line-height + weight) ────────────────────────
    // key = CSS utility suffix  (text-{key})
    // Every key encodes BOTH the size token and the weight name — 1:1 with
    // the @utility classes in globals.css (text-display-sm-semibold, etc.)
    // weightStyle = Figma fontName.style string (see mapping guide above)
    { key: "display-sm-semibold", size: 30, lh: 36, weightStyle: "SemiBold", sizePrim: "typography/size/700", lhPrim: "typography/lh/display-sm", weightPrim: "typography/weight/semibold" },
    { key: "display-sm-bold", size: 30, lh: 36, weightStyle: "Bold", sizePrim: "typography/size/700", lhPrim: "typography/lh/display-sm", weightPrim: "typography/weight/bold" },
    { key: "title-page-semibold", size: 20, lh: 28, weightStyle: "SemiBold", sizePrim: "typography/size/600", lhPrim: "typography/lh/title-page", weightPrim: "typography/weight/semibold" },
    { key: "title-section-semibold", size: 18, lh: 27, weightStyle: "SemiBold", sizePrim: "typography/size/500", lhPrim: "typography/lh/title-section", weightPrim: "typography/weight/semibold" },
    { key: "title-sub-semibold", size: 16, lh: 24, weightStyle: "SemiBold", sizePrim: "typography/size/400", lhPrim: "typography/lh/title-sub", weightPrim: "typography/weight/semibold" },
    { key: "body-md-regular", size: 16, lh: 24, weightStyle: "Regular", sizePrim: "typography/size/400", lhPrim: "typography/lh/body-md", weightPrim: "typography/weight/regular" },
    { key: "body-md-medium", size: 16, lh: 24, weightStyle: "Medium", sizePrim: "typography/size/400", lhPrim: "typography/lh/body-md", weightPrim: "typography/weight/medium" },
    { key: "body-sm-medium", size: 14, lh: 20, weightStyle: "Medium", sizePrim: "typography/size/300", lhPrim: "typography/lh/body-sm", weightPrim: "typography/weight/medium" },
    { key: "body-micro-medium", size: 13, lh: 18, weightStyle: "Medium", sizePrim: "typography/size/200", lhPrim: "typography/lh/body-micro", weightPrim: "typography/weight/medium" },
    { key: "body-micro-bold", size: 13, lh: 18, weightStyle: "Bold", sizePrim: "typography/size/200", lhPrim: "typography/lh/body-micro", weightPrim: "typography/weight/bold" },
    { key: "label-xs-medium", size: 12, lh: 16, weightStyle: "Medium", sizePrim: "typography/size/100", lhPrim: "typography/lh/label-xs", weightPrim: "typography/weight/medium" },
    { key: "label-micro-medium", size: 11, lh: 14, weightStyle: "Medium", sizePrim: "typography/size/50", lhPrim: "typography/lh/label-micro", weightPrim: "typography/weight/medium" },
    // ── Caps variants — uppercase labels with 0.01em letter-spacing ───────
    // lsPrim marks these as caps — Stage 1-B creates a semantic ls var aliasing
    // letter-spacing/caps (1%). Excluded from TOKEN_LOOKUP: auto-detection by
    // size+weight alone cannot distinguish caps from non-caps counterparts.
    { key: "label-xs-caps-medium", size: 12, lh: 16, weightStyle: "Medium", sizePrim: "typography/size/100", lhPrim: "typography/lh/label-xs", weightPrim: "typography/weight/medium", lsPrim: "typography/letter-spacing/caps" },
    { key: "label-xs-caps-semibold", size: 12, lh: 16, weightStyle: "SemiBold", sizePrim: "typography/size/100", lhPrim: "typography/lh/label-xs", weightPrim: "typography/weight/semibold", lsPrim: "typography/letter-spacing/caps" },
    { key: "body-micro-caps-semibold", size: 13, lh: 18, weightStyle: "SemiBold", sizePrim: "typography/size/200", lhPrim: "typography/lh/body-micro", weightPrim: "typography/weight/semibold", lsPrim: "typography/letter-spacing/caps" },
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
      "normal": "regular", "roman": "regular",
      "book": "regular", "upright": "regular",
      "demi": "semibold", "demibold": "semibold",
      "heavy": "bold",
    };
    return synonyms[norm] !== undefined ? synonyms[norm] : norm;
  }

  // ── Auto-detection lookup ─────────────────────────────────
  // Key: "${Math.round(size)}_${normalizeWeightStyle(weightStyle)}"
  // e.g. "16_semibold" → "title-sub",  "16_regular" → "body-md-regular",  "16_medium" → "body-md-medium"
  // Caps tokens (lsPrim set) are excluded from auto-detection: their size+weight
  // overlaps with non-caps counterparts (e.g. 12_medium matches both label-xs-medium
  // and label-xs-caps-medium). Filtering prevents the caps entry from overwriting the
  // standard one — caps tokens are only applied via explicit textStyleId assignment.
  const TOKEN_LOOKUP = new Map(
    TOKENS.filter(t => !t.lsPrim).map(t => [`${t.size}_${normalizeWeightStyle(t.weightStyle)}`, t.key])
  );
  // Chart addition: 12px/Regular has no existing match in TOKENS (label-xs is Medium).
  // 12_regular → "typography/chart/axis" so axis-tick text nodes get the chart style.
  TOKEN_LOOKUP.set("12_regular", "typography/chart/axis");

  // ── Chart Semantic Variable Definitions ───────────────────
  // 1:1 mapping with globals.css :root --chart-* typography variables.
  // Fully unified: all chart semantics live under typography/chart/ in the
  // Semantic collection — same root as UI scale typography/{key}/*.
  // All prim paths point to typography/ primitives (no chart/ folder in Primitives).
  //
  //   CSS variable                          Semantic var name                        Primitive alias (typography/)
  //   --chart-axis-font-size   : 12px  →   typography/chart/axis/size               typography/size/100
  //   --chart-axis-font-weight : 400   →   typography/chart/axis/weight             typography/weight/regular  "Regular"
  //   --chart-label-font-size  : 12px  →   typography/chart/label/size              typography/size/100
  //   --chart-label-font-weight: 500   →   typography/chart/label/weight            typography/weight/medium   "Medium"
  //   --chart-label-ls: 0.01em         →   typography/chart/label/letter-spacing    typography/letter-spacing/chart-label (1.0%)
  //   --chart-tooltip-font-size: 12px  →   typography/chart/tooltip/size            typography/size/100
  //   (tooltip label weight)           →   typography/chart/tooltip/label/weight    typography/weight/medium
  //   (tooltip value weight)           →   typography/chart/tooltip/value/weight    typography/weight/medium
  //   (chart font family)              →   typography/chart/family                  typography/font-family/base  "Geist"
  //
  // Note: globals.css :root --chart-* vars retain hard-coded px/numeric values
  // (not CSS var chains) because Recharts reads them via getComputedStyle() and
  // passes literal strings to SVG attributes — CSS variable chaining cannot be
  // resolved at that layer. The Figma variables above represent the design intent.
  //
  // Weight mapping (same table as header):
  //   400 / Regular  → typography/weight/regular → "Regular"
  //   500 / Medium   → typography/weight/medium  → "Medium"
  const CHART_SEM_VARS = [
    { name: "typography/chart/family", type: "STRING", prim: "typography/font-family/base" },
    { name: "typography/chart/axis/size", type: "FLOAT", prim: "typography/size/100" },
    { name: "typography/chart/axis/weight", type: "STRING", prim: "typography/weight/regular" },
    { name: "typography/chart/label/size", type: "FLOAT", prim: "typography/size/100" },
    { name: "typography/chart/label/weight", type: "STRING", prim: "typography/weight/medium" },
    { name: "typography/chart/label/letter-spacing", type: "FLOAT", prim: "typography/letter-spacing/chart-label" },
    { name: "typography/chart/tooltip/size", type: "FLOAT", prim: "typography/size/100" },
    { name: "typography/chart/tooltip/label/weight", type: "STRING", prim: "typography/weight/medium" },
    { name: "typography/chart/tooltip/value/weight", type: "STRING", prim: "typography/weight/medium" },
  ];

  // ── Chart Text Style Definitions ──────────────────────────
  // Two styles cover the visually distinct chart text layers:
  //   chart/axis  — axis tick labels (12px Regular, no letter-spacing)
  //   chart/label — event reference labels (12px Medium, 1% letter-spacing)
  // Tooltip text is intentionally omitted: it's HTML (not SVG) and already
  // covered by label-xs (12px Medium) for Figma mockup purposes.
  const CHART_STYLE_DEFS = [
    {
      styleName: "Typography/chart/axis",
      tokenKey: "typography/chart/axis",     // → textStyleMap key for Stage 3 lookup
      weightStyle: "Regular",
      size: 12, lh: 16,                      // lh reuses label-xs-medium/lh (16px)
      sizeVarName: "typography/chart/axis/size",
      lhSemKey: "label-xs-medium/lh",       // alias to label-xs-medium semantic lh var
    },
    {
      styleName: "Typography/chart/label",
      tokenKey: "typography/chart/label",
      weightStyle: "Medium",
      size: 12, lh: 16,
      lsPct: 1,                              // 1% = 0.01em — mirrors --chart-label-letter-spacing
      sizeVarName: "typography/chart/label/size",
      lhSemKey: "label-xs-medium/lh",
    },
  ];

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

  // Helper: Assign restrictive scopes so variables appear only in relevant Figma dropdowns.
  // All typography/* names follow a predictable path structure — match on path segment.
  //   /size                       → FONT_SIZE, GAP, GRID_SIZE
  //   /lh                         → LINE_HEIGHT
  //   /weight                     → FONT_STYLE   (font style / weight dropdown; STRING type)
  //   /family or /font-family     → FONT_FAMILY  (STRING type)
  //   /ls or /letter-spacing      → LETTER_SPACING
  //
  // Errors are pushed to stats.errors (not swallowed) so scope failures are visible
  // in the Stage 4 summary — useful for diagnosing API scope-type mismatches.
  function applyScopes(v, name) {
    var scopes;
    if (name.includes('/size')) {
      scopes = ['FONT_SIZE'];
    } else if (name.includes('/lh')) {
      scopes = ['LINE_HEIGHT'];
    } else if (name.includes('/weight')) {
      scopes = ['FONT_STYLE'];
    } else if (name.includes('/family') || name.includes('/font-family')) {
      scopes = ['FONT_FAMILY'];
    } else if (name.includes('/ls') || name.includes('/letter-spacing')) {
      scopes = ['LETTER_SPACING'];
    }
    if (scopes) {
      try {
        v.scopes = scopes;
      } catch (e) {
        stats.errors.push('스코프 설정 실패 \'' + name + '\': ' + e.message);
      }
    }
  }

  // Helper: Get or Create a Variable, with type-mismatch migration.
  // If an existing variable has the wrong type (e.g. old FLOAT weight vars
  // being upgraded to STRING), it is removed and recreated.
  // Scopes are applied on every pass (create and update) to self-heal after renames.
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
        // All names start with typography/ — distinguish Primitive vs Semantic by collection.
        const isSem = collection.name === "Semantic";
        isSem ? stats.semUpdated++ : stats.primUpdated++;
        applyScopes(found, name);
        return found;
      }
    }

    const isSem = collection.name === "Semantic";
    isSem ? stats.semCreated++ : stats.primCreated++;
    const v = figma.variables.createVariable(name, collection, type);
    applyScopes(v, name);
    return v;
  }

  // ── 1-A. Primitives ───────────────────────────────────────
  const primColl = getOrCreateCollection("Primitives");
  const primMode = primColl.defaultModeId;

  // FLOAT primitives: size/* and lh/*
  const PRIM_FLOAT = {
    // Font-size scale (px) — matches globals.css --text-* vars
    "typography/size/700": 30, "typography/size/600": 20, "typography/size/500": 18, "typography/size/400": 16,
    "typography/size/300": 14, "typography/size/200": 13, "typography/size/100": 12, "typography/size/50": 11,
    // Line-height scale (px computed) — matches --text-*--line-height vars
    "typography/lh/display-sm": 36, "typography/lh/title-page": 28, "typography/lh/title-section": 27,
    "typography/lh/title-sub": 24, "typography/lh/body-md": 24, "typography/lh/body-sm": 20,
    "typography/lh/body-micro": 18, "typography/lh/label-xs": 16, "typography/lh/label-micro": 14,
    // Letter-spacing primitives — value in Figma PERCENT unit (= em × 100)
    // e.g. 0.01em = 1%
    "typography/letter-spacing/chart-label": 1,   // 1%   = 0.01em — chart event labels
    "typography/letter-spacing/caps": 1.0, // 1%   = 0.01em — ALL_CAPS uppercase labels
    "typography/letter-spacing/normal": 0,   // 0%   = 0em   — standard text (font default)
  };

  // STRING primitives: weight/*
  // Value = Figma fontName.style string — ready to use directly, no conversion needed.
  // See mapping guide at the top of this file for CSS numeric equivalents.
  const PRIM_STRING = {
    "typography/font-family/base": "Geist",     // CSS: "Geist", sans-serif — font binding token
    "typography/weight/regular": "Regular",   // CSS: 400 / font-normal
    "typography/weight/medium": "Medium",    // CSS: 500 / font-medium
    "typography/weight/semibold": "SemiBold",  // CSS: 600 / font-semibold
    "typography/weight/bold": "Bold",      // CSS: 700 / font-bold
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

    // ls (letter-spacing): FLOAT alias — ALL tokens get one.
    // Caps tokens use letter-spacing/caps (1% = 0.01em).
    // Standard tokens use letter-spacing/normal (0% = font default).
    const effectiveLsPrim = token.lsPrim || "typography/letter-spacing/normal";
    const lsVar = getOrCreateVar(`${base}/ls`, semColl, "FLOAT");
    if (lsVar) {
      lsVar.setValueForMode(semMode, figma.variables.createVariableAlias(primVarMap[effectiveLsPrim]));
      semVarMap[`${token.key}/ls`] = lsVar;
    }

    // family (font-family): STRING alias — all tokens share typography/font-family/base.
    // Enables the hexagonal variable icon next to font name on TextNodes in Figma.
    const familyVar = getOrCreateVar(`${base}/family`, semColl, "STRING");
    if (familyVar) {
      familyVar.setValueForMode(semMode, figma.variables.createVariableAlias(primVarMap["typography/font-family/base"]));
      semVarMap[`${token.key}/family`] = familyVar;
    }
  }

  // ── 1-C. Chart Semantic Variables ─────────────────────────
  // Creates chart variables in Semantic collection under "typography/chart/".
  // Each is an alias to the matching typography/ Primitive — same Primitives →
  // Semantic indirection used by the UI text scale in 1-B.
  //
  // Weight mapping applied here (same rule as 1-B):
  //   400 → typography/weight/regular → "Regular"   (axis ticks)
  //   500 → typography/weight/medium  → "Medium"    (event labels, tooltip)
  const chartSemVarMap = {}; // "typography/chart/axis/size" etc. → Variable

  for (const cv of CHART_SEM_VARS) {
    const prim = primVarMap[cv.prim];
    if (!prim) {
      stats.errors.push(`차트 변수 스킵 '${cv.name}': primitive '${cv.prim}' 없음`);
      continue;
    }
    const v = getOrCreateVar(cv.name, semColl, cv.type);
    if (v) {
      v.setValueForMode(semMode, figma.variables.createVariableAlias(prim));
      chartSemVarMap[cv.name] = v;
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
    const styleName = `${token.key}`;

    const style = getOrCreateTextStyle(styleName);
    style.name = styleName;
    // weightStyle is the Figma font style string — used directly, no conversion.
    style.fontName = { family: resolvedFamily, style: token.weightStyle };
    style.fontSize = token.size;
    style.lineHeight = { value: token.lh, unit: "PIXELS" };
    // 만약 토큰에 lsPrim이 있으면(Caps 변형이면) 대문자로 설정, 아니면 원래대로
    if (token.lsPrim) {
      style.textCase = "UPPER"; // 대문자 적용
    } else {
      style.textCase = "ORIGINAL"; // 일반 스타일은 원래대로
    }
    tryBind(style, "fontSize", semVarMap[`${token.key}/size`], styleName);
    tryBind(style, "lineHeight", semVarMap[`${token.key}/lh`], styleName);
    // Note: Figma API does not support binding STRING variables (family, weight) to
    // fontName fields on TextStyle. Those bindings are applied to TextNodes in Stage 3.

    // letterSpacing: set + bind for ALL tokens (every token now has a semantic ls var).
    // Caps: 1% = 0.01em. Standard: 0% (font default).
    style.letterSpacing = { value: token.lsPrim ? 1.0 : 0, unit: "PERCENT" };
    if (semVarMap[`${token.key}/ls`]) {
      tryBind(style, "letterSpacing", semVarMap[`${token.key}/ls`], styleName);
    }

    textStyleMap[token.key] = style;
  }

  // ── Chart Text Styles ─────────────────────────────────────
  // Creates Typography/chart/axis and Typography/chart/label text styles.
  // Each style is bound to its chart semantic size + shared label-xs lh var.
  // "Regular" is loaded via body-md-regular; "Medium" via body-md-medium.
  for (const def of CHART_STYLE_DEFS) {
    const style = getOrCreateTextStyle(def.styleName);
    style.name = def.styleName;
    style.fontName = { family: resolvedFamily, style: def.weightStyle };
    style.fontSize = def.size;
    style.lineHeight = { value: def.lh, unit: "PIXELS" };
    // letter-spacing: only chart/label has this (0.01em = 1%)
    if (def.lsPct !== undefined) {
      style.letterSpacing = { value: def.lsPct, unit: "PERCENT" };
    }
    // Bind fontSize to chart semantic var (FLOAT)
    tryBind(style, "fontSize", chartSemVarMap[def.sizeVarName], def.styleName);
    // Bind lineHeight to existing label-xs/lh semantic var (FLOAT, 16px)
    tryBind(style, "lineHeight", semVarMap[def.lhSemKey], def.styleName);
    // Register so Stage 3 can apply the style by tokenKey
    textStyleMap[def.tokenKey] = style;
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
    const nodeSize = Math.round(node.fontSize);
    const nodeNormStyle = normalizeWeightStyle(node.fontName.style);
    const tokenKey = TOKEN_LOOKUP.get(`${nodeSize}_${nodeNormStyle}`);

    if (!tokenKey) { stats.layersSkipped++; continue; }

    const isChartToken = tokenKey.startsWith("typography/chart/");
    const matchedToken = isChartToken ? null : TOKENS.find(t => t.key === tokenKey);
    const style = textStyleMap[tokenKey];

    if (!style) { stats.layersSkipped++; continue; }

    // ── Pre-flight unit normalisation ──────────────────────────
    // Some Figma API versions error when textStyleId is assigned while the node
    // carries an incompatible lineHeight or letterSpacing unit. Set canonical
    // units before the style assignment to prevent those errors.
    // (Variable bindings are applied manually to Text Styles — not to nodes here.)

    // lineHeight: ensure PIXELS unit.
    const nodeLh = isChartToken ? 16 : (matchedToken && matchedToken.lh ? matchedToken.lh : 16);
    if (node.lineHeight !== figma.mixed && node.lineHeight && node.lineHeight.unit !== "PIXELS") {
      try { node.lineHeight = { value: nodeLh, unit: "PIXELS" }; }
      catch (_) { }
    }

    // letterSpacing: ensure PERCENT unit for non-chart tokens.
    if (!isChartToken && node.letterSpacing !== figma.mixed) {
      const lsValue = (matchedToken && matchedToken.lsPrim) ? 1.0 : 0;
      try { node.letterSpacing = { value: lsValue, unit: "PERCENT" }; }
      catch (_) { }
    }

    // ── Style inheritance ──────────────────────────────────────
    // Assign the Text Style only — all property+variable bindings inherit from the style.
    try {
      node.textStyleId = style.id;
      stats.layersBound++;
    } catch (e) {
      stats.errors.push(`스타일 적용 실패 [${node.name}]: ${e.message}`);
      stats.layersSkipped++;
    }
  }

  // ────────────────────────────────────────────────────────
  // STAGE 4: Summary
  // ────────────────────────────────────────────────────────
  const varTotal = stats.primCreated + stats.primUpdated + stats.semCreated + stats.semUpdated;
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
