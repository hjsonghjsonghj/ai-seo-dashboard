// ============================================================
// Spacing Sync Pro  (compiled from code.ts)
// Syncs the 4px base grid from STYLE_SPACING.md into Figma
// Variables and auto-binds matching Auto Layout frames.
//
// Token source : STYLE_SPACING.md / globals.css @theme
// Collection   : "Spacing"
// Variable     : layout/{px}  (FLOAT, pixel unit)
//
// Stage 1   Create / update "Spacing" VariableCollection
// Stage 2   Register each grid step as a FLOAT variable
// Stage 3   Walk selected layers, bind padding + gap to vars
// Stage 4   Report results to UI
// ============================================================

const COLLECTION_NAME = "Spacing";

// ============================================================
// Token table: mirrors the 4px base grid in STYLE_SPACING.md
// All values are pixels (Figma FLOAT variables store raw px).
// ============================================================
const SPACING_TOKENS = [
  { name: "layout/0", value: 0, description: "None: remove all spacing" },
  { name: "layout/2", value: 2, description: "Micro: border offset, outline gap" },
  { name: "layout/4", value: 4, description: "Tight: icon padding, badge gap (p-1)" },
  { name: "layout/6", value: 6, description: "Half-step: compact label gap (py-1.5)" },
  { name: "layout/8", value: 8, description: "Compact: cell gap, small button pad (p-2)" },
  { name: "layout/10", value: 10, description: "Half-step: medium compact gap (py-2.5)" },
  { name: "layout/12", value: 12, description: "Medium-small: form row gap (p-3)" },
  { name: "layout/16", value: 16, description: "Default: card padding, form gap (p-4)" },
  { name: "layout/20", value: 20, description: "Medium-large: section sub-gap (p-5)" },
  { name: "layout/24", value: 24, description: "Spacious: section padding, card gap (p-6)" },
  { name: "layout/32", value: 32, description: "Large: sidebar items, page sections (p-8)" },
];

const PADDING_FIELDS = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];

// ============================================================
// UI bridge
// ============================================================
figma.showUI(__html__, {
  width: 360,
  height: 380,
  title: "Spacing Sync Pro",
  themeColors: true,
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === "sync-tokens") {
    await syncTokens();
  } else if (msg.type === "apply-to-layers") {
    await applyToLayers();
  }
};

// ============================================================
// Stage 1+2: Create / update the Spacing variable collection
// ============================================================
async function getOrCreateCollection() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find((c) => c.name === COLLECTION_NAME) || null;

  if (!collection) {
    collection = figma.variables.createVariableCollection(COLLECTION_NAME);
  }

  return { collection, modeId: collection.defaultModeId };
}

async function syncTokens() {
  try {
    const { collection, modeId } = await getOrCreateCollection();
    const existingVars = await figma.variables.getLocalVariablesAsync("FLOAT");

    let created = 0;
    let updated = 0;

    for (const token of SPACING_TOKENS) {
      const existing = existingVars.find(
        (v) => v.variableCollectionId === collection.id && v.name === token.name
      );

      if (existing) {
        existing.setValueForMode(modeId, token.value);
        existing.description = token.description;
        updated++;
      } else {
        const variable = figma.variables.createVariable(token.name, collection, "FLOAT");
        variable.setValueForMode(modeId, token.value);
        variable.description = token.description;
        created++;
      }
    }

    figma.ui.postMessage({ type: "sync-done", created, updated });
  } catch (err) {
    console.error("[SpacingSync] syncTokens error:", err);
    figma.ui.postMessage({ type: "error", message: String(err) });
  }
}

// ============================================================
// Stage 3: Walk selection, bind matching values to variables
// ============================================================
async function applyToLayers() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.notify("Please select at least one layer.");
      figma.ui.postMessage({ type: "error", message: "Please select at least one layer." });
      return;
    }

    const { collection, modeId } = await getOrCreateCollection();
    const allVars = await figma.variables.getLocalVariablesAsync("FLOAT");
    const spacingVars = allVars.filter((v) => v.variableCollectionId === collection.id);

    // Build px-value -> Variable lookup map
    const valueMap = new Map();
    console.log("[SpacingSync] Building value map from", spacingVars.length, "variable(s), modeId:", modeId);
    for (const v of spacingVars) {
      var modeVal = v.valuesByMode;
      if (!modeVal) {
        console.warn("[SpacingSync] Variable has no valuesByMode:", v.name);
        continue;
      }
      var val = modeVal[modeId];
      if (typeof val === "number") {
        valueMap.set(val, v);
        console.log("[SpacingSync] Mapped", val, "px ->", v.name, "(id:", v.id + ")");
      } else {
        console.warn("[SpacingSync] Skipped variable (value not a number):", v.name, "| raw value:", val);
      }
    }
    console.log("[SpacingSync] Value map ready. Total entries:", valueMap.size);

    let boundCount = 0;

    function bindFrame(frame) {
      try {
        var extraFields = [];
        if ("layoutWrap" in frame && frame.layoutWrap === "WRAP") {
          extraFields = ["counterAxisSpacing"];
        }
        var fields = PADDING_FIELDS.concat(["itemSpacing"], extraFields);

        for (var fi = 0; fi < fields.length; fi++) {
          var field = fields[fi];

          if (!(field in frame)) continue;

          var rawValue = frame[field];
          if (typeof rawValue !== "number") continue;

          console.log("[SpacingSync] Layer:", frame.name, "| field:", field, "| value:", rawValue, "| Attempting match...");

          if (typeof frame.setBoundVariableForLayout !== "function") {
            console.warn("[SpacingSync] setBoundVariableForLayout not available on:", frame.name);
            continue;
          }

          // Force-clear any existing binding before applying new one
          frame.setBoundVariableForLayout(field, null);

          var matchVar = valueMap.get(rawValue);
          if (!matchVar || !matchVar.id) {
            console.log("[SpacingSync] No matching variable for value:", rawValue, "on field:", field);
            continue;
          }

          console.log("[SpacingSync] Matched variable id:", matchVar.id, "(", matchVar.name, ")");

          try {
            frame.setBoundVariableForLayout(field, matchVar.id);
            boundCount++;
            console.log("[SpacingSync] Binding result: SUCCESS -", frame.name, field, "->", matchVar.name);
          } catch (bindErr) {
            console.error("[SpacingSync] Binding result: FAILED -", frame.name, field, bindErr);
          }
        }
      } catch (frameErr) {
        console.error("[SpacingSync] bindFrame error on node:", frame.name, frameErr);
      }
    }

    function walkNodes(nodes) {
      nodes.forEach(function (node) {
        if (node.layoutMode && node.layoutMode !== "NONE") {
          bindFrame(node);
        }
        if ("children" in node) {
          walkNodes(node.children);
        }
      });
    }

    walkNodes(selection);

    figma.ui.postMessage({ type: "apply-done", bound: boundCount });
  } catch (err) {
    console.error("[SpacingSync] applyToLayers error:", err);
    figma.ui.postMessage({ type: "error", message: String(err) });
  }
}
