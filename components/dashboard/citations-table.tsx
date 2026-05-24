"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, TrendingUp, TrendingDown, Minus, Eye, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Single source of truth for citation data.
// Pages with high optimization scores are cited by multiple platforms simultaneously.
// Each row = one (page, platform) pair. optimizationProgress is a page-level property.
export const citationsData: any[] = [

  // ── /best-seo-tools-2026 — opt: 94 — cited by all 5 platforms ──────────────
  { id: 1,  source: "ChatGPT",   page: "/best-seo-tools-2026",       mentions: 847, trend: "up",     optimizationProgress: 94, lastSeen: "2 min ago",
    aiContext: "Comprehensive tool comparisons with side-by-side feature tables and FAQ schema markup make this page ideal for AI extraction. The H2/H3 hierarchy with use-case examples lets ChatGPT generate precise, tool-specific answers across a wide range of selection queries. Regularly updated pricing and real-user reviews further strengthen citation frequency." },
  { id: 2,  source: "Claude",    page: "/best-seo-tools-2026",       mentions: 623, trend: "up",     optimizationProgress: 94, lastSeen: "5 min ago",
    aiContext: "Thorough before/after examples and verifiable performance metrics align with Claude's preference for evidence-backed content. Comprehensive FAQ sections address every major query variation. Strong internal linking and authoritative citations reinforce trustworthiness for high-confidence referencing." },
  { id: 3,  source: "Perplexity",page: "/best-seo-tools-2026",       mentions: 534, trend: "up",     optimizationProgress: 94, lastSeen: "8 min ago",
    aiContext: "Concise section summaries and data-backed claims with source attribution allow Perplexity to retrieve precise, context-specific answers. Rich statistics and detailed case studies provide the evidence AI engines require for high-confidence citations." },
  { id: 4,  source: "Gemini", page: "/best-seo-tools-2026",       mentions: 412, trend: "up",     optimizationProgress: 94, lastSeen: "11 min ago",
    aiContext: "Strong E-E-A-T signals with expert-authored comparison tables and clear Schema.org markup. The progression from basic to advanced tool categories supports varied query complexity and enables Gemini to generate specific, actionable responses." },
  { id: 5,  source: "Copilot",   page: "/best-seo-tools-2026",       mentions: 389, trend: "up",     optimizationProgress: 94, lastSeen: "3 min ago",
    aiContext: "Developer-friendly API and integration examples alongside automation workflow details align with Copilot's audience. Numbered comparison processes and measurable success metrics enable precise synthesis of practical answers." },

  // ── /on-page-seo-checklist — opt: 82 — cited by 4 platforms ──────────────
  { id: 6,  source: "ChatGPT",   page: "/on-page-seo-checklist",     mentions: 756, trend: "up",     optimizationProgress: 82, lastSeen: "7 min ago",
    aiContext: "Solid checklist format with clear action items supports AI snippet extraction effectively. Adding FAQ schema per checklist section would significantly improve visibility for question-based queries." },
  { id: 7,  source: "Claude",    page: "/on-page-seo-checklist",     mentions: 445, trend: "up",     optimizationProgress: 82, lastSeen: "15 min ago",
    aiContext: "Well-structured content with verifiable recommendations and nuanced explanations matches Claude's fact-checking requirements. Expanding per-item implementation examples would further strengthen citation confidence." },
  { id: 8,  source: "Perplexity",page: "/on-page-seo-checklist",     mentions: 312, trend: "stable", optimizationProgress: 82, lastSeen: "20 min ago",
    aiContext: "Clear modular structure allows Perplexity to retrieve precise answers. Adding more geo-specific performance data and industry benchmarks would improve complex query matching." },
  { id: 9,  source: "Copilot",   page: "/on-page-seo-checklist",     mentions: 198, trend: "up",     optimizationProgress: 82, lastSeen: "30 min ago",
    aiContext: "Action-oriented checklist with implementation steps suits Copilot's developer audience. Expanding code-level examples and tooling references would increase citation relevance for technical queries." },

  // ── /link-building-strategies — opt: 91 — cited by 3 platforms ───────────
  { id: 10, source: "Copilot",   page: "/link-building-strategies",  mentions: 534, trend: "up",     optimizationProgress: 91, lastSeen: "4 min ago",
    aiContext: "Numbered outreach processes with automation tool integrations and developer-friendly code examples align directly with Copilot's task-completion focus. Clear categorization by link type and difficulty enables accurate query-to-content matching." },
  { id: 11, source: "ChatGPT",   page: "/link-building-strategies",  mentions: 389, trend: "up",     optimizationProgress: 91, lastSeen: "9 min ago",
    aiContext: "Step-by-step implementation details with measurable success metrics enable ChatGPT to synthesize precise answers. The strategy categorization and workflow automation examples provide broad coverage across link-acquisition query types." },
  { id: 12, source: "Perplexity",page: "/link-building-strategies",  mentions: 234, trend: "stable", optimizationProgress: 91, lastSeen: "25 min ago",
    aiContext: "Data-backed outreach benchmarks and ROI case studies provide the evidence Perplexity requires. Tiered guidance by link type makes content accessible across experience levels." },

  // ── /ai-content-optimization — opt: 78 — cited by 3 platforms ────────────
  { id: 13, source: "ChatGPT",   page: "/ai-content-optimization",   mentions: 445, trend: "up",     optimizationProgress: 78, lastSeen: "12 min ago",
    aiContext: "Concrete before/after optimization examples with performance data give ChatGPT reliable material for generating improvement-focused responses. FAQ sections cover the most common query variations comprehensively." },
  { id: 14, source: "Claude",    page: "/ai-content-optimization",   mentions: 398, trend: "up",     optimizationProgress: 78, lastSeen: "18 min ago",
    aiContext: "Technical depth with verifiable metrics and nuanced analysis aligns with Claude's evidence requirements. Strong structured data markup throughout supports high-confidence AI referencing." },
  { id: 15, source: "Perplexity",page: "/ai-content-optimization",   mentions: 287, trend: "up",     optimizationProgress: 78, lastSeen: "35 min ago",
    aiContext: "Modular structure with section summaries and authoritative external references suits Perplexity's retrieval patterns. Adding more industry-specific data points would improve niche query matching." },

  // ── /enterprise-seo-guide — opt: 68 — cited by 2 platforms ──────────────
  { id: 16, source: "Perplexity",page: "/enterprise-seo-guide",      mentions: 356, trend: "stable", optimizationProgress: 68, lastSeen: "45 min ago",
    aiContext: "Tiered enterprise use cases with ROI benchmarks allow Perplexity to retrieve context-specific answers. Expanding multi-location and service-area guidance would improve complex organizational queries." },
  { id: 17, source: "Gemini", page: "/enterprise-seo-guide",      mentions: 176, trend: "stable", optimizationProgress: 68, lastSeen: "1 hour ago",
    aiContext: "E-E-A-T signals present but Schema.org coverage is incomplete for enterprise use cases. Adding Organization and LocalBusiness markup alongside platform-specific migration guidance would strengthen citation confidence." },

  // ── /technical-seo-audit — opt: 88 — cited by 2 platforms ───────────────
  { id: 18, source: "Copilot",   page: "/technical-seo-audit",       mentions: 312, trend: "up",     optimizationProgress: 88, lastSeen: "6 min ago",
    aiContext: "Practical audit workflows with Screaming Frog configuration examples and Python automation scripts align well with Copilot's developer audience. Adding Search Console API integration examples would further increase citation relevance." },
  { id: 19, source: "ChatGPT",   page: "/technical-seo-audit",       mentions: 143, trend: "stable", optimizationProgress: 88, lastSeen: "40 min ago",
    aiContext: "Step-by-step diagnostic processes with tool references support accurate ChatGPT responses for general audit queries. Expanding crawl analysis and log file parsing sections would improve complex query matching." },

  // ── /core-web-vitals-guide — opt: 55 — cited by 2 platforms ─────────────
  { id: 20, source: "Gemini", page: "/core-web-vitals-guide",     mentions: 287, trend: "stable", optimizationProgress: 55, lastSeen: "1 hour ago",
    aiContext: "Adequate technical coverage of LCP, FID, and CLS with optimization recommendations. E-E-A-T signals need strengthening with updated 2026 threshold benchmarks. HowTo schema for each technique would significantly improve citation accuracy." },
  { id: 21, source: "Claude",    page: "/core-web-vitals-guide",     mentions: 154, trend: "down",   optimizationProgress: 55, lastSeen: "2 hours ago",
    aiContext: "Technical recommendations present but lack supporting before/after performance data that Claude's fact-checking requires. Code-level implementation examples and CWV score comparisons from real cases would strengthen citation confidence." },

  // ── /structured-data-guide — opt: 45 — cited by 2 platforms ─────────────
  { id: 22, source: "Gemini", page: "/structured-data-guide",     mentions: 198, trend: "down",   optimizationProgress: 45, lastSeen: "2 hours ago",
    aiContext: "JSON-LD examples present but Schema.org type coverage is incomplete. Rich Results Test references help but common error troubleshooting and validation workflows are missing for reliable AI extraction." },
  { id: 23, source: "ChatGPT",   page: "/structured-data-guide",     mentions: 98,  trend: "stable", optimizationProgress: 45, lastSeen: "3 hours ago",
    aiContext: "Working code samples cover basic schema types but advanced patterns and CMS-specific implementation guidance are absent. Expanding FAQ schema and adding live preview examples would improve extraction accuracy." },

  // ── /local-seo-strategy — opt: 72 — cited by 2 platforms ────────────────
  { id: 24, source: "Perplexity",page: "/local-seo-strategy",        mentions: 189, trend: "up",     optimizationProgress: 72, lastSeen: "1 hour ago",
    aiContext: "Local SEO fundamentals with relevant statistics suit Perplexity's retrieval patterns. Adding geo-targeted benchmarks and LocalBusiness schema throughout would improve citation accuracy for location-based queries." },
  { id: 25, source: "Gemini", page: "/local-seo-strategy",        mentions: 112, trend: "stable", optimizationProgress: 72, lastSeen: "2 hours ago",
    aiContext: "Solid foundational coverage with actionable advice. GeoCoordinates and LocalBusiness schema implementation would meaningfully boost citation accuracy for local intent queries across service-area businesses." },

  // ── /keyword-research-2026 — opt: 38 — cited by 1 platform ──────────────
  { id: 26, source: "Claude",    page: "/keyword-research-2026",     mentions: 87,  trend: "down",   optimizationProgress: 38, lastSeen: "4 hours ago",
    aiContext: "Well-researched methodology with verifiable data sources. However, some sections lack supporting citations and specific data points. Real-world case studies with documented outcomes and tool comparison matrices would strengthen AI comprehension significantly." },
]

const trendIcons: any = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const trendColors: any = {
  up: "text-positive-soft",
  down: "text-danger-soft",
  stable: "text-foreground-muted",
}

function getProgressColor(progress: number): string {
  if (progress < 40) return "stroke-danger-default"
  if (progress < 75) return "stroke-caution-default"
  return "stroke-positive-default"
}

function getProgressTextColor(progress: number): string {
  if (progress < 40) return "var(--color-danger-soft)";
  if (progress < 75) return "var(--color-caution-soft)";
  return "var(--color-positive-soft)";
}

function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  const colorClass = getProgressColor(progress)
  const textColorClass = getProgressTextColor(progress)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-border-secondary" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          className={colorClass}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: "stroke-dashoffset 0.5s ease-out, stroke 0.3s ease" }}
        />
      </svg>
      <span
        className="absolute text-label-micro-medium leading-none tabular-nums"
        style={{
          ["--current-progress-color" as any]: getProgressTextColor(progress)
        }}
      >
        {progress}%
      </span>
    </div>
  )
}

// Mobile card view
function CitationCard({ citation, onReview }: { citation: any; onReview?: (c: any) => void }) {
  const TrendIcon = trendIcons[citation.trend]

  return (
    <div
      className="flex items-center justify-between rounded-lg bg-surface-default/40 p-5 transition-colors hover:bg-surface-hover/50 cursor-pointer"
      onClick={() => onReview?.(citation)}
    >
      <div className="flex items-center gap-4">
        <ProgressRing progress={citation.optimizationProgress} size={44} />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-label-micro-medium font-semibold text-foreground-secondary">{citation.source}</span>
            <TrendIcon className={cn("h-3.5 w-3.5", trendColors[citation.trend])} />
          </div>
          <p className="text-body-md-medium text-foreground-tertiary truncate max-w-[140px]">{citation.page}</p>
          <div className="flex items-center gap-2 text-body-md-medium">
            <span suppressHydrationWarning className="font-semibold tabular-nums text-foreground-secondary">
              {citation.mentions.toLocaleString()}
            </span>
            <span className="font-medium text-foreground-tertiary">mentions</span>
          </div>
        </div>
      </div>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-foreground-tertiary hover:text-foreground-strong">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function CitationsTableComponent({
  data,
  onReview,
  headerAction,
  highlightedId,
  highlightedIds,
  // Detail-page only controls: sorting + selection + bulk helpers.
  sortBy,
  sortDirection,
  onSortToggle,
  selectedRowIds,
  onToggleRow,
  onToggleAllVisible,
  showSelectionColumn = false,
  title = "Top 5 AI Search Citations",
  description = "Real-time tracking with optimization status",
}: {
  data?: any[]
  onReview?: (c: any) => void
  headerAction?: React.ReactNode
  highlightedId?: number | null
  highlightedIds?: Set<number>
  sortBy?: "mentions" | "optimization" | "lastSeen"
  sortDirection?: "asc" | "desc"
  onSortToggle?: (key: "mentions" | "optimization" | "lastSeen") => void
  selectedRowIds?: Set<number>
  onToggleRow?: (id: number, checked: boolean) => void
  onToggleAllVisible?: (checked: boolean, visibleIds: number[]) => void
  showSelectionColumn?: boolean
  title?: string
  description?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const displayData = data && data.length > 0 ? data : citationsData
  const visibleIds = displayData.map((item: any) => item.id)
  const selectedCount = selectedRowIds
    ? visibleIds.filter((id: number) => selectedRowIds.has(id)).length
    : 0
  const allSelected = visibleIds.length > 0 && selectedCount === visibleIds.length
  const someSelected = selectedCount > 0 && !allSelected

  function SortIndicator({ column }: { column: "mentions" | "optimization" | "lastSeen" }) {
    if (sortBy !== column) return <ArrowUpDown className="h-3.5 w-3.5 text-brand-faint" />
    return sortDirection === "asc"
      ? <ArrowUp className="h-3.5 w-3.5 text-foreground-strong" />
      : <ArrowDown className="h-3.5 w-3.5 text-foreground-strong" />
  }

  return (
    <Card className="bg-surface-default/60 transition-colors duration-150">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-title-section-semibold text-foreground-secondary">{title}</CardTitle>
            <p className="hidden md:block text-body-micro-medium text-foreground-tertiary mt-1">{description}</p>
          </div>
          <div className="flex shrink-0 items-center">
            {headerAction ? headerAction : (
              <Link href="/search-visibility">
                <button className="flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-lg border border-border-secondary bg-surface-hover/50 px-3 py-1.5 text-label-xs-medium text-foreground-secondary transition-colors hover:bg-surface-hover">
                  View all <ExternalLink className="h-3 w-3" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="hidden md:block overflow-hidden rounded-lg border border-border-secondary/50">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-border-secondary/50 bg-surface-default/30">
                {showSelectionColumn && (
                  <th className="w-10 px-3 py-3 text-center">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(checked) => onToggleAllVisible?.(checked === true, visibleIds)}
                      aria-label="Select all visible citations"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">Source</th>
                <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">Page</th>
                <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                  {onSortToggle ? (
                    <button
                      type="button"
                      onClick={() => onSortToggle("mentions")}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors cursor-pointer",
                        sortBy === "mentions"
                          ? "text-foreground-strong"
                          : "text-brand-faint hover:text-foreground-strong"
                      )}
                      aria-label={`Sort by mentions ${sortBy === "mentions" ? `currently ${sortDirection}` : ""}`}
                    >
                      MENTIONS
                      <SortIndicator column="mentions" />
                    </button>
                  ) : (
                    <span className="text-foreground-tertiary">MENTIONS</span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">Trend</th>
                <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                  {onSortToggle ? (
                    <button
                      type="button"
                      onClick={() => onSortToggle("optimization")}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors cursor-pointer",
                        sortBy === "optimization"
                          ? "text-foreground-strong"
                          : "text-brand-faint hover:text-foreground-strong"
                      )}
                      aria-label={`Sort by optimization score ${sortBy === "optimization" ? `currently ${sortDirection}` : ""}`}
                    >
                      OPTIMIZATION
                      <SortIndicator column="optimization" />
                    </button>
                  ) : (
                    <span className="text-foreground-tertiary">OPTIMIZATION</span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                  {onSortToggle ? (
                    <button
                      type="button"
                      onClick={() => onSortToggle("lastSeen")}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors cursor-pointer",
                        sortBy === "lastSeen"
                          ? "text-foreground-strong"
                          : "text-brand-faint hover:text-foreground-strong"
                      )}
                      aria-label={`Sort by last seen ${sortBy === "lastSeen" ? `currently ${sortDirection}` : ""}`}
                    >
                      LAST SEEN
                      <SortIndicator column="lastSeen" />
                    </button>
                  ) : (
                    <span className="text-foreground-tertiary">LAST SEEN</span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-hover">
              {displayData.map((citation: any) => {
                const TrendIcon = trendIcons[citation.trend]
                const isSelected = selectedRowIds?.has(citation.id) ?? false
                const isHighlighted = citation.id === highlightedId || highlightedIds?.has(citation.id)
                return (
                  <tr
                    key={citation.id}
                    className={cn(
                      isHighlighted
                        ? "bg-positive-default/10 transition-colors duration-700"
                        : isSelected
                          ? "bg-surface-default/20 transition-colors duration-150"
                          : "hover:bg-surface-default/20 transition-colors duration-150"
                    )}
                  >
                    {showSelectionColumn && (
                      <td className="whitespace-nowrap px-3 py-2.5 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => onToggleRow?.(citation.id, checked === true)}
                          aria-label={`Select citation ${citation.source} ${citation.page}`}
                        />
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><span className="text-body-md-regular font-semibold text-foreground-secondary">{citation.source}</span></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><span className="text-body-md-medium text-foreground-tertiary">{citation.page}</span></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><span suppressHydrationWarning className="text-body-md-regular font-semibold tabular-nums text-foreground-secondary">{citation.mentions.toLocaleString()}</span></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><TrendIcon className={cn("h-4 w-4 inline-block", trendColors[citation.trend])} /></td>
                    <td className="whitespace-nowrap px-4 py-2.5"><div className="flex justify-center"><ProgressRing progress={citation.optimizationProgress} /></div></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center text-body-md-medium text-foreground-tertiary">{citation.lastSeen}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="flex justify-center">
                        <Button
                          size="sm" variant="outline"
                          className="h-6 gap-1.5 border-brand/30 bg-brand-default/10 px-2.5 text-label-xs-medium font-semibold text-brand-faint hover:bg-brand-default/20"
                          onClick={() => onReview?.(citation)}
                        >
                          <Eye className="h-3 w-3" /> Review
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          {displayData.map((citation: any) => (
            <CitationCard key={citation.id} citation={citation} onReview={onReview} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CitationsTableComponent
