// Shared platform constants — single source of truth for all pages.

export const PLATFORMS = ["ChatGPT", "Claude", "Perplexity", "Gemini", "Copilot"] as const
export type Platform = (typeof PLATFORMS)[number]

export const PLATFORM_COLORS: Record<Platform, string> = {
  ChatGPT:    "#8b5cf6",  // violet
  Claude:     "#2dd4bf",  // teal-400 — distinct from positive-default (#10b981)
  Perplexity: "#60a5fa",  // blue-400
  Gemini:     "#f97316",  // orange-500 — distinct from caution-default (#f59e0b)
  Copilot:    "#e879f9",  // fuchsia-400 — distinct from Gemini orange
}

export const PLATFORM_ABBREV: Record<Platform, string> = {
  ChatGPT:    "GPT",
  Claude:     "Claude",
  Perplexity: "Perp",
  Gemini:     "Gemini",
  Copilot:    "Copilot",
}
