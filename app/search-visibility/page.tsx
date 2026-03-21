"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Calendar, Filter, TrendingUp, TrendingDown, Minus, Eye, ExternalLink, Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/sidebar"
import { cn } from "@/lib/utils"

// Expanded citations data (25 rows) - exact schema from CitationsTable
const citations = [
  { id: 1, source: "ChatGPT", page: "/best-seo-tools-2026", mentions: 847, trend: "up" as const, optimizationProgress: 92, lastSeen: "2 min ago" },
  { id: 2, source: "Claude", page: "/ai-content-optimization", mentions: 623, trend: "up" as const, optimizationProgress: 78, lastSeen: "5 min ago" },
  { id: 3, source: "Perplexity", page: "/enterprise-seo-guide", mentions: 412, trend: "stable" as const, optimizationProgress: 65, lastSeen: "12 min ago" },
  { id: 4, source: "Google AI", page: "/technical-seo-checklist", mentions: 389, trend: "down" as const, optimizationProgress: 34, lastSeen: "1 hour ago" },
  { id: 5, source: "Copilot", page: "/link-building-strategies", mentions: 256, trend: "up" as const, optimizationProgress: 88, lastSeen: "3 min ago" },
  { id: 6, source: "ChatGPT", page: "/keyword-research-guide", mentions: 734, trend: "up" as const, optimizationProgress: 85, lastSeen: "8 min ago" },
  { id: 7, source: "Perplexity", page: "/local-seo-strategies", mentions: 521, trend: "up" as const, optimizationProgress: 72, lastSeen: "15 min ago" },
  { id: 8, source: "Claude", page: "/content-marketing-tips", mentions: 489, trend: "up" as const, optimizationProgress: 81, lastSeen: "22 min ago" },
  { id: 9, source: "Google AI", page: "/site-speed-optimization", mentions: 445, trend: "down" as const, optimizationProgress: 45, lastSeen: "30 min ago" },
  { id: 10, source: "Copilot", page: "/mobile-seo-best-practices", mentions: 398, trend: "up" as const, optimizationProgress: 90, lastSeen: "18 min ago" },
  { id: 11, source: "ChatGPT", page: "/ecommerce-seo-guide", mentions: 612, trend: "up" as const, optimizationProgress: 77, lastSeen: "25 min ago" },
  { id: 12, source: "Perplexity", page: "/voice-search-optimization", mentions: 334, trend: "stable" as const, optimizationProgress: 58, lastSeen: "40 min ago" },
  { id: 13, source: "Claude", page: "/schema-markup-tutorial", mentions: 567, trend: "up" as const, optimizationProgress: 94, lastSeen: "7 min ago" },
  { id: 14, source: "Google AI", page: "/backlink-analysis-guide", mentions: 423, trend: "down" as const, optimizationProgress: 29, lastSeen: "2 hours ago" },
  { id: 15, source: "Copilot", page: "/seo-audit-checklist", mentions: 378, trend: "up" as const, optimizationProgress: 83, lastSeen: "35 min ago" },
  { id: 16, source: "ChatGPT", page: "/international-seo", mentions: 289, trend: "stable" as const, optimizationProgress: 67, lastSeen: "45 min ago" },
  { id: 17, source: "Perplexity", page: "/video-seo-strategies", mentions: 456, trend: "up" as const, optimizationProgress: 71, lastSeen: "50 min ago" },
  { id: 18, source: "Claude", page: "/ai-seo-automation", mentions: 698, trend: "up" as const, optimizationProgress: 89, lastSeen: "10 min ago" },
  { id: 19, source: "Google AI", page: "/meta-tags-optimization", mentions: 312, trend: "down" as const, optimizationProgress: 42, lastSeen: "1.5 hours ago" },
  { id: 20, source: "Copilot", page: "/structured-data-guide", mentions: 534, trend: "up" as const, optimizationProgress: 86, lastSeen: "20 min ago" },
  { id: 21, source: "ChatGPT", page: "/competitor-analysis", mentions: 445, trend: "up" as const, optimizationProgress: 73, lastSeen: "55 min ago" },
  { id: 22, source: "Perplexity", page: "/core-web-vitals-guide", mentions: 387, trend: "up" as const, optimizationProgress: 79, lastSeen: "28 min ago" },
  { id: 23, source: "Claude", page: "/content-gap-analysis", mentions: 356, trend: "stable" as const, optimizationProgress: 68, lastSeen: "1 hour ago" },
  { id: 24, source: "Google AI", page: "/crawl-budget-optimization", mentions: 278, trend: "down" as const, optimizationProgress: 38, lastSeen: "3 hours ago" },
  { id: 25, source: "Copilot", page: "/serp-feature-targeting", mentions: 423, trend: "up" as const, optimizationProgress: 91, lastSeen: "14 min ago" },
]

type Citation = typeof citations[0]

// Exact trendIcons and trendColors from CitationsTable
const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
}

const trendColors = {
  up: "text-emerald-400",
  down: "text-rose-400",
  stable: "text-muted-foreground",
}

// Exact progress color functions from CitationsTable
function getProgressColor(progress: number): string {
  if (progress < 40) return "stroke-red-500"
  if (progress < 75) return "stroke-amber-500"
  return "stroke-emerald-500"
}

function getProgressTextColor(progress: number): string {
  if (progress < 40) return "text-red-400"
  if (progress < 75) return "text-amber-400"
  return "text-emerald-400"
}

// Exact ProgressRing component from CitationsTable
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorClass}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 0.5s ease-out, stroke 0.3s ease",
          }}
        />
      </svg>
      <span className={cn("absolute text-[11px] font-semibold tabular-nums tracking-normal", textColorClass)}>
        {progress}%
      </span>
    </div>
  )
}

// Optimization checklist items based on score
function getOptimizationChecklist(citation: Citation) {
  const items = []

  if (citation.optimizationProgress < 40) {
    items.push(
      { text: "Add structured data markup for better AI comprehension", done: false },
      { text: "Improve content depth with comprehensive examples", done: false },
      { text: "Optimize meta descriptions for AI snippet extraction", done: false },
      { text: "Include FAQ sections addressing common queries", done: false }
    )
  } else if (citation.optimizationProgress < 75) {
    items.push(
      { text: "Add structured data markup for better AI comprehension", done: true },
      { text: "Improve content depth with comprehensive examples", done: false },
      { text: "Optimize meta descriptions for AI snippet extraction", done: false },
      { text: "Include FAQ sections addressing common queries", done: true }
    )
  } else {
    items.push(
      { text: "Add structured data markup for better AI comprehension", done: true },
      { text: "Improve content depth with comprehensive examples", done: true },
      { text: "Optimize meta descriptions for AI snippet extraction", done: true },
      { text: "Include FAQ sections addressing common queries", done: citation.optimizationProgress > 85 }
    )
  }

  return items
}

// AI Context explanation based on source
function getAIContext(source: string, page: string) {
  const contexts: Record<string, string> = {
    "ChatGPT": `ChatGPT is citing ${page} because the content provides clear, conversational answers that align with user queries. The structured format and comprehensive coverage make it ideal for AI-generated responses.`,
    "Claude": `Claude references ${page} due to its well-researched content with verifiable sources. The balanced analysis and technical depth match Claude's preference for nuanced, accurate information.`,
    "Perplexity": `Perplexity cites ${page} for its real-time relevance and authoritative source links. The concise summaries and data visualizations support quick information retrieval.`,
    "Google AI": `Google AI surfaces ${page} based on strong E-E-A-T signals and proper Schema.org implementation. The optimized page experience and mobile responsiveness contribute to visibility.`,
    "Copilot": `Copilot references ${page} for its actionable content format with clear code examples. The step-by-step structure and integration guidance align with developer-focused queries.`,
  }
  return contexts[source] || `This AI source is citing ${page} based on content relevance and quality signals.`
}

export default function SearchVisibilityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("30d")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredCitations = citations.filter(citation => {
    const matchesSearch = citation.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      citation.page.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSource = sourceFilter === "all" || citation.source === sourceFilter
    return matchesSearch && matchesSource
  })

  const handleReviewClick = (e: React.MouseEvent, citation: Citation) => {
    e.stopPropagation()
    setSelectedCitation(citation)
    setIsDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-14">
        {/* Header with Back Button */}
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-300 hover:text-white">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-[14px] font-medium">Back to Dashboard</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-[16px] font-semibold tracking-normal text-white">
            All AI Search Citations
          </h1>
        </header>

        <main className="px-4 md:px-6">
          <div className="mx-auto max-w-[1600px] flex flex-col gap-6">
            {/* Filter Bar */}
            <Card className="border-border/50 bg-slate-900/60">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-[16px] font-semibold tracking-normal text-white">
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Date Range */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[160px] bg-slate-800/50 border-slate-700 text-[14px]">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d" className="text-[14px]">Last 7 days</SelectItem>
                        <SelectItem value="30d" className="text-[14px]">Last 30 days</SelectItem>
                        <SelectItem value="90d" className="text-[14px]">Last 90 days</SelectItem>
                        <SelectItem value="1y" className="text-[14px]">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-[14px]">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-[14px]">All Sources</SelectItem>
                        <SelectItem value="ChatGPT" className="text-[14px]">ChatGPT</SelectItem>
                        <SelectItem value="Claude" className="text-[14px]">Claude</SelectItem>
                        <SelectItem value="Perplexity" className="text-[14px]">Perplexity</SelectItem>
                        <SelectItem value="Google AI" className="text-[14px]">Google AI</SelectItem>
                        <SelectItem value="Copilot" className="text-[14px]">Copilot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search by source or page..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-[14px] placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Citations Table - Exact structure from CitationsTable */}
            <Card className="border-border/50 bg-slate-900/60 transition-colors duration-150">
              <CardHeader className="pb-4 px-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold tracking-normal text-white">
                      Top AI Search Citations
                    </CardTitle>
                    <p className="text-[13px] font-medium tracking-normal text-slate-400 mt-1">
                      Real-time tracking with optimization status
                    </p>
                  </div>
                  <span className="text-[14px] font-medium tabular-nums text-slate-300">
                    {filteredCitations.length} citations
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {/* Desktop table view */}
                <div className="hidden md:block overflow-hidden rounded-lg border border-border/50">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-400">
                          Source
                        </th>
                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-400">
                          Page
                        </th>
                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-400">
                          Mentions
                        </th>
                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-400">
                          Trend
                        </th>
                        <th className="px-4 py-3.5 text-center text-[13px] font-semibold uppercase tracking-wide text-slate-400">
                          Optimization
                        </th>
                        <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-400">
                          Last Seen
                        </th>
                        <th className="px-4 py-3.5 text-center text-[13px] font-semibold uppercase tracking-wide text-slate-400">
                          Quick Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredCitations.map((citation) => {
                        const TrendIcon = trendIcons[citation.trend]
                        return (
                          <tr
                            key={citation.id}
                            className="transition-colors hover:bg-muted/20"
                          >
                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="text-[14px] font-semibold tracking-normal text-white">
                                {citation.source}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-[13px] font-medium tracking-normal text-slate-400">
                                {citation.page}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <span className="text-[14px] font-semibold tabular-nums text-white">
                                {citation.mentions.toLocaleString()}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <TrendIcon
                                className={cn("h-4 w-4", trendColors[citation.trend])}
                              />
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex justify-center">
                                <ProgressRing progress={citation.optimizationProgress} />
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-[13px] font-medium tracking-normal text-slate-400">
                              {citation.lastSeen}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 gap-1.5 border-violet-500/30 bg-violet-500/10 px-2.5 text-[13px] font-semibold tracking-normal text-violet-300 hover:bg-violet-500/20 hover:text-violet-200"
                                  onClick={(e) => handleReviewClick(e, citation)}
                                >
                                  <Eye className="h-3 w-3" />
                                  Review
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card view */}
                <div className="md:hidden space-y-3">
                  {filteredCitations.map((citation) => {
                    const TrendIcon = trendIcons[citation.trend]
                    return (
                      <div
                        key={citation.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-slate-900/40 p-5 transition-colors hover:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-4">
                          <ProgressRing progress={citation.optimizationProgress} size={44} />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold tracking-normal text-white">{citation.source}</span>
                              <TrendIcon className={cn("h-3.5 w-3.5", trendColors[citation.trend])} />
                            </div>
                            <p className="text-[13px] font-medium tracking-normal text-slate-400 truncate max-w-[140px]">{citation.page}</p>
                            <div className="flex items-center gap-2 text-[13px] tracking-normal">
                              <span className="font-semibold tabular-nums text-white">{citation.mentions.toLocaleString()}</span>
                              <span className="font-medium text-slate-400">mentions</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                          onClick={(e) => handleReviewClick(e, citation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Side Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md bg-slate-900 border-slate-800 overflow-y-auto">
          {selectedCitation && (
            <>
              <SheetHeader className="px-6 pt-6">
                <SheetTitle className="text-[16px] font-semibold tracking-normal text-white">
                  {selectedCitation.source}
                </SheetTitle>
                <SheetDescription className="text-[14px] font-medium tracking-normal text-slate-400">
                  {selectedCitation.page}
                </SheetDescription>
              </SheetHeader>

              <div className="px-6 py-6 space-y-8">
                {/* Optimization Checklist */}
                <div className="space-y-4">
                  <h3 className="text-[14px] font-semibold tracking-normal text-white">
                    Optimization Checklist
                  </h3>
                  <div className="space-y-3">
                    {getOptimizationChecklist(selectedCitation).map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2
                          className={cn(
                            "h-5 w-5 mt-0.5 shrink-0",
                            item.done ? "text-emerald-400" : "text-slate-600"
                          )}
                        />
                        <span className={cn(
                          "text-[14px] font-medium tracking-normal",
                          item.done ? "text-slate-300" : "text-slate-500"
                        )}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Context */}
                <div className="space-y-4">
                  <h3 className="text-[14px] font-semibold tracking-normal text-white">
                    AI Context
                  </h3>
                  <p className="text-[14px] font-medium tracking-normal text-slate-400 leading-relaxed">
                    {getAIContext(selectedCitation.source, selectedCitation.page)}
                  </p>
                </div>

                {/* Current Stats */}
                <div className="space-y-4">
                  <h3 className="text-[14px] font-semibold tracking-normal text-white">
                    Current Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border/50 bg-slate-800/50 p-4">
                      <p className="text-[12px] font-medium uppercase tracking-wide text-slate-500" style={{ letterSpacing: '0.01em' }}>
                        Mentions
                      </p>
                      <p className="text-[16px] font-semibold tabular-nums text-white mt-1">
                        {selectedCitation.mentions.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-slate-800/50 p-4">
                      <p className="text-[12px] font-medium uppercase tracking-wide text-slate-500" style={{ letterSpacing: '0.01em' }}>
                        Optimization
                      </p>
                      <p className={cn(
                        "text-[16px] font-semibold tabular-nums mt-1",
                        selectedCitation.optimizationProgress >= 75 ? "text-emerald-400" :
                          selectedCitation.optimizationProgress >= 40 ? "text-amber-400" : "text-red-400"
                      )}>
                        {selectedCitation.optimizationProgress}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="px-6 pb-6 flex-col gap-3 sm:flex-col">
                <Button
                  className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[14px] font-semibold"
                >
                  <Download className="h-4 w-4" />
                  Export to Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white text-[14px] font-semibold"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Resolved
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
