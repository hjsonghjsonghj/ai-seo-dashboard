"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ExternalLink, TrendingUp, TrendingDown, Minus, Eye, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Single source of truth for citation data.
// Distribution: High(90-100%): 5, Good(70-89%): 6, Medium(50-69%): 6, Low(30-49%): 5, Critical(0-29%): 3
export const citationsData: any[] = [
  // ── High Optimization (90–100%) ────────────────────────────────────────────
  {
    id: 1, source: "ChatGPT", page: "/best-seo-tools-2026", mentions: 847, trend: "up", optimizationProgress: 96, lastSeen: "2 min ago",
    aiContext: "Content excels with comprehensive tool comparisons, well-structured comparison tables, and clear FAQ schema markup that enables direct AI extraction. The hierarchical H2/H3 structure with specific use-case examples and side-by-side feature breakdowns makes each tool's benefits immediately accessible to AI models. Regularly updated pricing data and real-user reviews further strengthen AI citation frequency. This page represents a near-ideal format for AI-generated responses across a wide range of tool-selection queries.",
  },
  {
    id: 2, source: "Claude", page: "/ai-content-optimization", mentions: 623, trend: "up", optimizationProgress: 78, lastSeen: "5 min ago",
    aiContext: "Content demonstrates exceptional AI optimization with thorough step-by-step guides, concrete before/after examples, and well-implemented structured data markup throughout. The balanced analysis with verifiable performance metrics and technical depth aligns precisely with Claude's preference for nuanced, evidence-backed information. Comprehensive FAQ sections address every major user question, maximizing AI snippet extraction potential across query variations. Strong internal linking and authoritative external citations reinforce content trustworthiness for high-confidence AI referencing.",
  },
  {
    id: 3, source: "Perplexity", page: "/enterprise-seo-guide", mentions: 534, trend: "up", optimizationProgress: 63, lastSeen: "8 min ago",
    aiContext: "Content achieves near-perfect AI visibility with concise section summaries, data-backed claims with source attribution, and authoritative external links throughout each major section. The modular structure with clearly defined enterprise use cases allows Perplexity to retrieve precise, context-specific answers to complex organizational queries. Rich statistics, ROI benchmarks, and detailed case studies provide the concrete evidence AI engines require for high-confidence citations. Implementation checklists and tiered guidance by company size make the content accessible and retrievable across a wide range of experience levels.",
  },
  {
    id: 4, source: "Google AI", page: "/structured-data-guide", mentions: 412, trend: "up", optimizationProgress: 35, lastSeen: "11 min ago",
    aiContext: "Content exhibits strong E-E-A-T signals with expert-authored JSON-LD examples, comprehensive Schema.org type coverage, and real-world validation results using Google's Rich Results Test. The clear progression from basic to advanced structured data types supports varied query complexity, from beginner definitions to complex implementation patterns. Testing tool references, Google Search Console integration guides, and common error troubleshooting sections further reinforce practical authority. Each schema type is accompanied by working code samples and live preview examples, ideal for AI to generate specific, actionable responses.",
  },
  {
    id: 5, source: "Copilot", page: "/link-building-strategies", mentions: 389, trend: "up", optimizationProgress: 92, lastSeen: "3 min ago",
    aiContext: "Content provides excellent actionable structure with numbered outreach processes, automation tool integrations, and developer-friendly code examples for email and API-based link acquisition workflows. Each strategy includes step-by-step implementation details with measurable success metrics, enabling AI to synthesize precise, practical answers. Clear categorization by link type, difficulty level, and required resources enables accurate query-to-content matching. The integration guidance sections and workflow automation examples align directly with Copilot's preference for developer-oriented, task-completion content.",
  },
  // ── Good Optimization (70–89%) ─────────────────────────────────────────────
  {
    id: 6, source: "ChatGPT", page: "/on-page-seo-checklist", mentions: 756, trend: "up", optimizationProgress: 82, lastSeen: "7 min ago",
    aiContext: "Content provides a solid checklist format with clear action items and helpful explanations for each SEO element, supporting basic AI snippet extraction effectively. The structured layout covers core on-page factors well, though adding FAQ schema markup for each checklist section would significantly improve AI visibility for question-based queries. Some checklist items would benefit from expanded implementation examples and before/after comparisons to match the depth of competing resources. Overall a strong foundational resource that could reach top-tier citation rates with targeted schema additions and deeper per-item guidance.",
  },
  {
    id: 7, source: "Claude", page: "/keyword-research-2026", mentions: 621, trend: "up", optimizationProgress: 28, lastSeen: "15 min ago",
    aiContext: "Content offers well-researched keyword methodology with verifiable data sources, trend analysis, and a balanced assessment of current search behavior shifts in 2026. The technical depth generally aligns with Claude's preference for accurate, nuanced information, though some sections lack supporting citations and specific data points to confirm claims. Adding more real-world case studies with documented keyword strategy outcomes and specific tool comparisons with feature matrices would strengthen AI comprehension of practical applications. FAQ sections addressing common keyword research process questions would also improve snippet extraction frequency for conversational queries.",
  },
  {
    id: 8, source: "Perplexity", page: "/local-seo-strategy", mentions: 445, trend: "up", optimizationProgress: 97, lastSeen: "20 min ago",
    aiContext: "Content covers local SEO fundamentals effectively with relevant statistics and actionable advice for small-to-medium business owners across multiple industries. Section summaries are present but adding more specific data points, geo-targeted performance benchmarks, and industry-specific examples would improve Perplexity's ability to answer precise location-based queries. The current structure supports basic AI visibility but lacks the granular detail needed for complex multi-location or service-area business questions. Implementing LocalBusiness and GeoCoordinates schema markup throughout would meaningfully boost citation accuracy for local intent queries.",
  },
  {
    id: 9, source: "Google AI", page: "/core-web-vitals-guide", mentions: 398, trend: "stable", optimizationProgress: 45, lastSeen: "30 min ago",
    aiContext: "Content provides adequate Core Web Vitals coverage with technical explanations and optimization recommendations across LCP, FID, and CLS metrics. E-E-A-T signals are present but could be strengthened with more explicit expert authorship indicators and updated benchmark data reflecting 2026 Google threshold changes. Adding proper HowTo schema for each optimization technique and more code-level implementation examples would improve Google AI's confidence in citing specific fixes. Performance metrics tables with before/after CWV scores from real implementations would significantly enhance AI snippet extraction accuracy.",
  },
  {
    id: 10, source: "Copilot", page: "/technical-seo-audit", mentions: 312, trend: "up", optimizationProgress: 88, lastSeen: "45 min ago",
    aiContext: "Content delivers practical audit workflows with tool references, Screaming Frog configuration examples, and step-by-step diagnostic processes that align with Copilot's developer-focused audience. The action-oriented format is effective, though expanding code snippets for Python-based audit automation and adding more specific API integration examples (Search Console API, GSC bulk data exports) would increase citation relevance. Current structure supports AI visibility for general audit queries but lacks depth for advanced technical implementation questions around crawl analysis and log file parsing. Adding structured diagnostic flowcharts and scripted audit workflows would improve complex query matching.",
  },
  {
    id: 11, source: "ChatGPT", page: "/content-marketing-roi", mentions: 287, trend: "stable", optimizationProgress: 74, lastSeen: "1 hour ago",
    aiContext: "Content addresses ROI measurement fundamentals with reasonable framework explanations and some useful industry benchmarks for content performance evaluation. The conversational structure provides accessible answers but would benefit from more specific measurement methodologies, attribution model comparisons, and industry-standard KPI definitions. Adding FAQ schema markup addressing common ROI calculation questions would improve AI snippet extraction rates for this high-intent topic. More detailed case studies with actual content performance data, channel-specific attribution examples, and reporting template references would elevate this from basic to comprehensive coverage.",
  },
  // ── Medium Optimization (50–69%) ───────────────────────────────────────────
  {
    id: 12, source: "Claude", page: "/voice-search-optimization", mentions: 234, trend: "stable", optimizationProgress: 52, lastSeen: "1 hour ago",
    aiContext: "Content has potential but lacks the structured data markup and conversational query formats that voice search optimization specifically requires for AI discoverability. The basic information covers key concepts but misses critical NLP optimization techniques, featured snippet targeting strategies, and Speakable schema implementation guidance. Adding FAQ sections with natural question-and-answer pairs, implementing Speakable schema markup, and expanding natural language content examples would significantly improve AI visibility. Without these elements, the content struggles to match the long-tail conversational queries that drive the majority of voice search traffic.",
  },
  {
    id: 13, source: "Perplexity", page: "/mobile-seo-best-practices", mentions: 198, trend: "stable", optimizationProgress: 84, lastSeen: "2 hours ago",
    aiContext: "Content covers mobile SEO basics adequately but lacks specific technical implementation details, mobile performance benchmark comparisons, and data visualizations that support quick information retrieval. Key areas including Core Web Vitals on mobile, mobile-first indexing implications, and AMP deprecation guidance need deeper treatment with current data. The absence of structured data markup and concise section summaries prevents effective AI snippet extraction for specific mobile optimization queries. Adding mobile performance benchmarks by industry, implementation code examples, and proper MobileApplication schema markup would substantially improve AI citation rates.",
  },
  {
    id: 14, source: "Google AI", page: "/ecommerce-seo-guide", mentions: 176, trend: "stable", optimizationProgress: 93, lastSeen: "2 hours ago",
    aiContext: "Content addresses ecommerce SEO broadly but lacks the Product, Review, and BreadcrumbList schema implementations that Google AI prioritizes for commerce-related queries. E-E-A-T signals are weak, with limited expert citations, no clear author credentials, and insufficient platform-specific guidance for Shopify, WooCommerce, and Magento environments. The content structure needs clearer H2/H3 hierarchy with dedicated technical, on-page, and off-page optimization sections to support varied query types. Adding structured data examples, platform migration guidance, and conversion-focused case studies with measurable outcomes would meaningfully improve AI visibility.",
  },
  {
    id: 15, source: "Copilot", page: "/international-seo-tactics", mentions: 154, trend: "stable", optimizationProgress: 60, lastSeen: "3 hours ago",
    aiContext: "Content introduces international SEO concepts but lacks the technical implementation depth and code examples that Copilot's developer audience requires for practical application. Hreflang implementation guidance is surface-level, missing critical edge cases around x-default handling, pagination, and dynamic rendering scenarios that practitioners frequently encounter. The current structure provides basic answers but cannot support complex multi-regional implementation questions covering subdomain vs. subdirectory architecture decisions. Adding working hreflang code samples for major CMS platforms, geo-targeting configuration walkthroughs, and country-specific canonicalization examples would close the most critical content gaps.",
  },
  {
    id: 16, source: "ChatGPT", page: "/image-optimization-seo", mentions: 143, trend: "stable", optimizationProgress: 47, lastSeen: "3 hours ago",
    aiContext: "Content covers image SEO fundamentals but misses the comprehensive approach needed for reliable AI extraction across the wide range of image optimization queries users submit. Alt text best practices and file format comparisons are present but lack specific implementation examples, measurable performance impact data, and lazy loading implementation guidance. The content would benefit significantly from ImageObject schema markup examples, next-gen format (WebP, AVIF) implementation guides, and CDN-specific configuration details. Without FAQ sections addressing common image optimization questions and structured data for visual content, AI models struggle to extract precise, actionable answers.",
  },
  {
    id: 17, source: "Claude", page: "/page-speed-optimization", mentions: 132, trend: "stable", optimizationProgress: 31, lastSeen: "4 hours ago",
    aiContext: "Content provides reasonable page speed coverage with some technical recommendations but lacks code-level implementation examples and testing methodology depth that Claude's fact-checking processes require for confident citation. Performance budgeting frameworks and optimization priority guidance are mentioned but not developed with sufficient supporting data or real-world performance outcomes. Adding specific before/after performance metrics from documented case studies, server-side optimization code snippets, and CDN/edge caching configuration examples would significantly strengthen AI citation potential. Current content answers basic speed optimization questions but falls short for advanced server infrastructure and rendering pipeline queries.",
  },
  // ── Low Optimization (30–49%) ──────────────────────────────────────────────
  {
    id: 18, source: "Perplexity", page: "/backlink-analysis-guide", mentions: 112, trend: "down", optimizationProgress: 95, lastSeen: "5 hours ago",
    aiContext: "Content is being cited but optimization is poor, with missing structured data and insufficient authoritative source references for a topic that requires high credibility signals to support claims. The backlink analysis methodology lacks specificity, with vague guidance on metric interpretation that AI cannot reliably translate into actionable answers for users seeking specific analytical outcomes. Critical gaps include no tool comparison data with feature matrices, absent link quality metric definitions, and missing case studies demonstrating real analysis outcomes with documented results. Immediate action required: add HowTo schema, restructure with clear analytical frameworks by link type, and expand with concrete backlink audit examples before declining citation rates accelerate.",
  },
  {
    id: 19, source: "Google AI", page: "/technical-seo-checklist", mentions: 98, trend: "down", optimizationProgress: 66, lastSeen: "6 hours ago",
    aiContext: "Content is currently cited but faces significant optimization deficiencies that place it at high risk of rapid citation loss as competing resources improve. The checklist format lacks structured data markup, hierarchical priority tiers, and the technical depth that Google AI requires for reliable information extraction on technical topics. Missing elements include HowTo schema implementation, crawler optimization guidance with configuration examples, and server-side performance recommendations with measurable benchmarks. The current flat checklist structure makes it difficult for AI to extract coherent, prioritized answers — reorganizing with clear severity tiers and adding ItemList schema markup is urgently needed.",
  },
  {
    id: 20, source: "Copilot", page: "/seo-audit-template", mentions: 87, trend: "down", optimizationProgress: 56, lastSeen: "8 hours ago",
    aiContext: "Content provides a basic audit template but lacks the code-level automation examples and tool integration details that Copilot's developer audience requires for practical implementation. Critical sections on log file analysis, JavaScript rendering diagnostics, and API-based auditing are either missing entirely or insufficiently developed with only conceptual descriptions. The current format supports simple audit queries but fails for advanced technical implementation questions around crawl efficiency and rendering pipeline analysis. Adding Python audit scripts, Search Console API integration examples, and automated reporting templates with real output samples would substantially improve citation viability for developer-oriented queries.",
  },
  {
    id: 21, source: "ChatGPT", page: "/competitor-analysis-seo", mentions: 76, trend: "down", optimizationProgress: 55, lastSeen: "10 hours ago",
    aiContext: "Content covers competitor analysis concepts superficially without the specific methodologies and data interpretation frameworks needed to enable reliable, actionable AI responses. Key analytical processes including content gap analysis, SERP feature tracking, and competitive link profile benchmarking lack the structured step-by-step treatment that users expect when searching for competitive research guidance. Vague tool selection advice and undefined metric prioritization further reduce the content's utility as a reliable AI citation source. Complete restructuring required: implement a clear analytical workflow with FAQ schema for specific research questions, add tool comparison data, and include real competitor analysis examples with documented findings and strategic outcomes.",
  },
  {
    id: 22, source: "Claude", page: "/anchor-text-strategy", mentions: 65, trend: "down", optimizationProgress: 33, lastSeen: "12 hours ago",
    aiContext: "Content is being cited despite significant structural and depth deficiencies that are actively contributing to declining citation accuracy and frequency. The anchor text guidance lacks nuanced analysis of natural link profile construction, algorithmic penalty avoidance thresholds, and anchor ratio optimization approaches — all areas Claude's fact-checking processes require supporting evidence for. Missing critical elements include anchor text distribution benchmarks by industry, Penguin penalty recovery frameworks, and disavow strategy guidance with documented case outcomes. Immediate restructuring recommended: add comprehensive ratio guidelines with supporting data, implement FAQ schema for the most common anchor text strategy questions, and expand with penalty case studies demonstrating recovery methodologies.",
  },
  // ── Critical Optimization (0–29%) ─────────────────────────────────────────
  {
    id: 23, source: "Perplexity", page: "/schema-markup-guide", mentions: 54, trend: "down", optimizationProgress: 18, lastSeen: "1 day ago",
    aiContext: "Critical optimization failure detected. Content lacks any working schema markup examples, provides no structured data validation guidance, and presents information in dense unstructured paragraphs that prevent effective AI comprehension of this technical topic. The fundamental mismatch between the page topic (schema markup implementation) and its own complete absence of schema markup severely undermines content credibility and authority signals. Perplexity cannot extract coherent, reliable answers due to poor information hierarchy, missing code examples for all major schema types, and no troubleshooting guidance for common implementation errors. Complete overhaul required: implement full JSON-LD examples for all major schema types (Organization, Product, FAQ, HowTo, Article), restructure with type-by-type implementation sections, add Rich Results Test validation guidance, and create FAQ sections addressing the most common schema implementation questions.",
  },
  {
    id: 24, source: "Google AI", page: "/crawl-budget-optimization", mentions: 43, trend: "down", optimizationProgress: 72, lastSeen: "1 day ago",
    aiContext: "Critical optimization failure. Content discusses crawl budget concepts at a surface level without the technical depth, server log analysis methodology, or crawl directive configuration examples that Google AI requires for authoritative citations on this highly technical topic. Information is fragmented across disconnected paragraphs with no clear optimization framework, priority hierarchy, or actionable diagnostic process for identifying crawl efficiency problems. The absence of robots.txt directive examples, crawl rate configuration guidance, and site architecture optimization recommendations makes this content unreliable for generating precise AI answers. Complete overhaul required: implement HowTo schema with a step-by-step crawl optimization diagnostic process, add Googlebot log analysis examples with annotated outputs, restructure around a crawl efficiency framework, and include a comprehensive troubleshooting section for the most common crawl budget issues.",
  },
  {
    id: 25, source: "Copilot", page: "/robots-txt-guide", mentions: 32, trend: "down", optimizationProgress: 12, lastSeen: "2 days ago",
    aiContext: "Critical optimization failure representing the lowest visibility score in the dataset. Content provides only surface-level robots.txt syntax coverage with no advanced directive use cases, edge case handling guidance, or automation-friendly code examples for the developer audience Copilot serves. The complete absence of structured data markup, clear directive categorization by CMS platform, and implementation validation workflows prevents reliable AI extraction for even basic technical configuration queries. Copilot cannot generate useful responses from this content due to missing context for complex crawl control scenarios including conditional blocking, dynamic rendering directives, and multi-environment configuration management. Complete overhaul required: add comprehensive directive examples for all major CMS platforms (WordPress, Shopify, Next.js), implement HowTo schema for common configuration tasks, create a troubleshooting FAQ section, and include testing and validation workflow guidance using robots.txt testing tools.",
  },
]

const trendIcons: any = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const trendColors: any = {
  up: "text-positive-soft",
  down: "text-danger-soft",
  stable: "text-muted-foreground",
}

function getProgressColor(progress: number): string {
  if (progress < 40) return "stroke-danger-default"
  if (progress < 75) return "stroke-caution-default"
  return "stroke-positive-default"
}

function getProgressTextColor(progress: number): string {
  if (progress < 40) return "text-danger-soft"
  if (progress < 75) return "text-caution-soft"
  return "text-positive-soft"
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-surface-track" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          className={colorClass}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: "stroke-dashoffset 0.5s ease-out, stroke 0.3s ease" }}
        />
      </svg>
      <span className={cn("absolute text-[11px] font-semibold tabular-nums tracking-normal", textColorClass)}>
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
            <span className="text-[14px] font-semibold tracking-normal text-subdued">{citation.source}</span>
            <TrendIcon className={cn("h-3.5 w-3.5", trendColors[citation.trend])} />
          </div>
          <p className="text-[13px] font-medium tracking-normal text-dim truncate max-w-[140px]">{citation.page}</p>
          <div className="flex items-center gap-2 text-[13px] tracking-normal">
            <span suppressHydrationWarning className="font-semibold tabular-nums text-subdued">
              {citation.mentions.toLocaleString()}
            </span>
            <span className="font-medium text-dim">mentions</span>
          </div>
        </div>
      </div>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-dim hover:text-white">
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
      ? <ArrowUp className="h-3.5 w-3.5 text-white" />
      : <ArrowDown className="h-3.5 w-3.5 text-white" />
  }

  return (
    <Card className="bg-surface-default/60 transition-colors duration-150">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold tracking-normal text-subdued">{title}</CardTitle>
            <p className="text-[13px] font-medium tracking-normal text-dim mt-1">{description}</p>
          </div>
          <div className="flex items-center">
            {headerAction ? headerAction : (
              <Link href="/search-visibility">
                <button className="flex items-center gap-1.5 rounded-lg border border-surface-track bg-surface-hover/50 px-3 py-1.5 text-[13px] font-medium tracking-normal text-subdued transition-colors hover:bg-surface-hover">
                  View all <ExternalLink className="h-3 w-3" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="hidden md:block overflow-hidden rounded-lg border border-surface-track/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-track/50 bg-surface-default/30">
                {showSelectionColumn && (
                  <th className="w-10 px-3 py-3 text-center">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={(checked) => onToggleAllVisible?.(checked === true, visibleIds)}
                      aria-label="Select all visible citations"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-dim">Source</th>
                <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-dim">Page</th>
                <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-dim">
                  {onSortToggle ? (
                    <button
                      type="button"
                      onClick={() => onSortToggle("mentions")}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors cursor-pointer",
                        sortBy === "mentions"
                          ? "text-white"
                          : "text-brand-faint hover:text-white"
                      )}
                      aria-label={`Sort by mentions ${sortBy === "mentions" ? `currently ${sortDirection}` : ""}`}
                    >
                      MENTIONS
                      <SortIndicator column="mentions" />
                    </button>
                  ) : (
                    <span className="text-dim">MENTIONS</span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-dim">Trend</th>
                <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-dim">
                  {onSortToggle ? (
                    <button
                      type="button"
                      onClick={() => onSortToggle("optimization")}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors cursor-pointer",
                        sortBy === "optimization"
                          ? "text-white"
                          : "text-brand-faint hover:text-white"
                      )}
                      aria-label={`Sort by optimization score ${sortBy === "optimization" ? `currently ${sortDirection}` : ""}`}
                    >
                      OPTIMIZATION
                      <SortIndicator column="optimization" />
                    </button>
                  ) : (
                    <span className="text-dim">OPTIMIZATION</span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-dim">
                  {onSortToggle ? (
                    <button
                      type="button"
                      onClick={() => onSortToggle("lastSeen")}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors cursor-pointer",
                        sortBy === "lastSeen"
                          ? "text-white"
                          : "text-brand-faint hover:text-white"
                      )}
                      aria-label={`Sort by last seen ${sortBy === "lastSeen" ? `currently ${sortDirection}` : ""}`}
                    >
                      LAST SEEN
                      <SortIndicator column="lastSeen" />
                    </button>
                  ) : (
                    <span className="text-dim">LAST SEEN</span>
                  )}
                </th>
                <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-dim">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-track/30">
              {displayData.map((citation: any) => {
                const TrendIcon = trendIcons[citation.trend]
                const isSelected = selectedRowIds?.has(citation.id) ?? false
                const isHighlighted = citation.id === highlightedId || highlightedIds?.has(citation.id)
                return (
                  <tr
                    key={citation.id}
                    className={cn(
                      "transition-colors duration-700",
                      isHighlighted ? "bg-positive-default/10" : isSelected ? "bg-surface-default/20" : "hover:bg-surface-default/20"
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
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><span className="text-[14px] font-semibold text-subdued">{citation.source}</span></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><span className="text-[13px] font-medium text-dim">{citation.page}</span></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><span suppressHydrationWarning className="text-[14px] font-semibold tabular-nums text-subdued">{citation.mentions.toLocaleString()}</span></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center"><TrendIcon className={cn("h-4 w-4 inline-block", trendColors[citation.trend])} /></td>
                    <td className="whitespace-nowrap px-4 py-2.5"><div className="flex justify-center"><ProgressRing progress={citation.optimizationProgress} /></div></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center text-[13px] font-medium text-dim">{citation.lastSeen}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <div className="flex justify-center">
                        <Button
                          size="sm" variant="outline"
                          className="h-6 gap-1.5 border-brand/30 bg-brand-default/10 px-2.5 text-[13px] font-semibold text-brand-faint hover:bg-brand-default/20"
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
