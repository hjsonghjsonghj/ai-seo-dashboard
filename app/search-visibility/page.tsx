"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Calendar, Filter, TrendingUp, TrendingDown, Minus, Share2, Download, Sparkles, ExternalLink, Lightbulb, Target, FileText } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

// Extended citation data matching dashboard (20+ rows)
const citationData = [
  { id: 1, source: "ChatGPT", page: "/best-seo-tools-2026", mentions: 847, optimizationScore: 92, status: "optimized", trend: [65, 72, 78, 82, 85, 88, 92], lastSeen: "2 min ago" },
  { id: 2, source: "Claude", page: "/ai-content-optimization", mentions: 623, optimizationScore: 78, status: "in-progress", trend: [55, 62, 58, 71, 75, 78, 82], lastSeen: "5 min ago" },
  { id: 3, source: "Perplexity", page: "/enterprise-seo-guide", mentions: 412, optimizationScore: 65, status: "in-progress", trend: [60, 62, 64, 65, 64, 65, 65], lastSeen: "12 min ago" },
  { id: 4, source: "Google AI", page: "/technical-seo-checklist", mentions: 389, optimizationScore: 34, status: "needs-work", trend: [52, 48, 45, 42, 38, 36, 34], lastSeen: "1 hour ago" },
  { id: 5, source: "Copilot", page: "/link-building-strategies", mentions: 256, optimizationScore: 88, status: "optimized", trend: [68, 72, 76, 80, 84, 86, 88], lastSeen: "3 min ago" },
  { id: 6, source: "ChatGPT", page: "/keyword-research-guide", mentions: 734, optimizationScore: 85, status: "optimized", trend: [70, 74, 78, 80, 82, 84, 85], lastSeen: "8 min ago" },
  { id: 7, source: "Perplexity", page: "/local-seo-strategies", mentions: 521, optimizationScore: 72, status: "in-progress", trend: [58, 62, 65, 68, 70, 71, 72], lastSeen: "15 min ago" },
  { id: 8, source: "Claude", page: "/content-marketing-tips", mentions: 489, optimizationScore: 81, status: "optimized", trend: [62, 68, 72, 75, 78, 80, 81], lastSeen: "22 min ago" },
  { id: 9, source: "Google AI", page: "/site-speed-optimization", mentions: 445, optimizationScore: 45, status: "needs-work", trend: [55, 52, 50, 48, 47, 46, 45], lastSeen: "30 min ago" },
  { id: 10, source: "Copilot", page: "/mobile-seo-best-practices", mentions: 398, optimizationScore: 90, status: "optimized", trend: [75, 80, 83, 86, 88, 89, 90], lastSeen: "18 min ago" },
  { id: 11, source: "ChatGPT", page: "/ecommerce-seo-guide", mentions: 612, optimizationScore: 77, status: "in-progress", trend: [60, 65, 68, 72, 74, 76, 77], lastSeen: "25 min ago" },
  { id: 12, source: "Perplexity", page: "/voice-search-optimization", mentions: 334, optimizationScore: 58, status: "in-progress", trend: [48, 50, 52, 54, 56, 57, 58], lastSeen: "40 min ago" },
  { id: 13, source: "Claude", page: "/schema-markup-tutorial", mentions: 567, optimizationScore: 94, status: "optimized", trend: [80, 84, 87, 90, 92, 93, 94], lastSeen: "7 min ago" },
  { id: 14, source: "Google AI", page: "/backlink-analysis-guide", mentions: 423, optimizationScore: 29, status: "needs-work", trend: [45, 40, 36, 33, 31, 30, 29], lastSeen: "2 hours ago" },
  { id: 15, source: "Copilot", page: "/seo-audit-checklist", mentions: 378, optimizationScore: 83, status: "optimized", trend: [68, 72, 75, 78, 80, 82, 83], lastSeen: "35 min ago" },
  { id: 16, source: "ChatGPT", page: "/international-seo", mentions: 289, optimizationScore: 67, status: "in-progress", trend: [52, 56, 59, 62, 64, 66, 67], lastSeen: "45 min ago" },
  { id: 17, source: "Perplexity", page: "/video-seo-strategies", mentions: 456, optimizationScore: 71, status: "in-progress", trend: [55, 60, 63, 66, 68, 70, 71], lastSeen: "50 min ago" },
  { id: 18, source: "Claude", page: "/ai-seo-automation", mentions: 698, optimizationScore: 89, status: "optimized", trend: [72, 76, 80, 83, 86, 88, 89], lastSeen: "10 min ago" },
  { id: 19, source: "Google AI", page: "/meta-tags-optimization", mentions: 312, optimizationScore: 42, status: "needs-work", trend: [58, 54, 50, 48, 45, 43, 42], lastSeen: "1.5 hours ago" },
  { id: 20, source: "Copilot", page: "/structured-data-guide", mentions: 534, optimizationScore: 86, status: "optimized", trend: [70, 74, 78, 81, 83, 85, 86], lastSeen: "20 min ago" },
  { id: 21, source: "ChatGPT", page: "/competitor-analysis", mentions: 445, optimizationScore: 73, status: "in-progress", trend: [58, 62, 65, 68, 70, 72, 73], lastSeen: "55 min ago" },
  { id: 22, source: "Perplexity", page: "/core-web-vitals-guide", mentions: 387, optimizationScore: 79, status: "in-progress", trend: [62, 66, 70, 73, 76, 78, 79], lastSeen: "28 min ago" },
]

type Citation = typeof citationData[0]

// AI Optimization suggestions by source
const optimizationSuggestions: Record<string, { title: string; description: string; priority: "high" | "medium" | "low" }[]> = {
  "ChatGPT": [
    { title: "Optimize for conversational queries", description: "Structure content to answer natural language questions directly.", priority: "high" },
    { title: "Include comprehensive examples", description: "ChatGPT favors content with practical, step-by-step examples.", priority: "high" },
    { title: "Add FAQ sections", description: "Create FAQ blocks that address common user questions.", priority: "medium" },
    { title: "Use clear headings structure", description: "Organize content with H2/H3 hierarchy for better parsing.", priority: "medium" },
  ],
  "Claude": [
    { title: "Focus on accuracy and citations", description: "Include verifiable data sources and research references.", priority: "high" },
    { title: "Provide nuanced explanations", description: "Claude prefers balanced, thorough analysis over simplified content.", priority: "high" },
    { title: "Add technical depth", description: "Include advanced technical details for expert audiences.", priority: "medium" },
    { title: "Structure with clear logic", description: "Use logical flow and clear argumentation in content.", priority: "low" },
  ],
  "Perplexity": [
    { title: "Optimize for real-time relevance", description: "Keep content updated with current data and trends.", priority: "high" },
    { title: "Include source links", description: "Perplexity values content that references authoritative sources.", priority: "high" },
    { title: "Create concise summaries", description: "Add TL;DR sections for quick information retrieval.", priority: "medium" },
    { title: "Use data visualizations", description: "Include charts and graphs for statistical content.", priority: "low" },
  ],
  "Google AI": [
    { title: "Implement structured data", description: "Add Schema.org markup for enhanced AI understanding.", priority: "high" },
    { title: "Optimize E-E-A-T signals", description: "Demonstrate expertise, experience, authoritativeness, and trust.", priority: "high" },
    { title: "Improve page experience", description: "Ensure fast load times and mobile responsiveness.", priority: "medium" },
    { title: "Add author credentials", description: "Include author bios with relevant expertise.", priority: "medium" },
  ],
  "Copilot": [
    { title: "Format for code snippets", description: "Use proper code blocks with syntax highlighting.", priority: "high" },
    { title: "Include actionable steps", description: "Copilot prefers content with clear action items.", priority: "high" },
    { title: "Add integration examples", description: "Show how concepts integrate with Microsoft ecosystem.", priority: "medium" },
    { title: "Provide templates", description: "Include downloadable templates and starter files.", priority: "low" },
  ],
}

// Mini sparkline component
function Sparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "stable" }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 24
  const padding = 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(" ")

  const strokeColor = trend === "up" 
    ? "rgb(52, 211, 153)" 
    : trend === "down" 
      ? "rgb(248, 113, 113)" 
      : "rgb(148, 163, 184)"

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Optimization score badge
function OptimizationBadge({ score }: { score: number }) {
  let bgColor = "bg-emerald-500/20 text-emerald-400"
  let label = "High"
  
  if (score < 40) {
    bgColor = "bg-rose-500/20 text-rose-400"
    label = "Low"
  } else if (score < 75) {
    bgColor = "bg-amber-500/20 text-amber-400"
    label = "Medium"
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] font-semibold tabular-nums text-white">{score}%</span>
      <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${bgColor}`} style={{ letterSpacing: '0.01em' }}>
        {label}
      </span>
    </div>
  )
}

// Status badge
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "optimized": "bg-emerald-500/20 text-emerald-400",
    "in-progress": "bg-amber-500/20 text-amber-400",
    "needs-work": "bg-rose-500/20 text-rose-400",
  }
  
  const labels: Record<string, string> = {
    "optimized": "Optimized",
    "in-progress": "In Progress",
    "needs-work": "Needs Work",
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${styles[status]}`} style={{ letterSpacing: '0.01em' }}>
      {labels[status]}
    </span>
  )
}

// Priority badge for suggestions
function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const styles: Record<string, string> = {
    "high": "bg-rose-500/20 text-rose-400",
    "medium": "bg-amber-500/20 text-amber-400",
    "low": "bg-slate-500/20 text-slate-400",
  }

  return (
    <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium uppercase ${styles[priority]}`} style={{ letterSpacing: '0.01em' }}>
      {priority}
    </span>
  )
}

export default function SearchVisibilityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("30d")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredCitations = citationData.filter(citation => {
    const matchesSearch = citation.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         citation.page.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSource = sourceFilter === "all" || citation.source === sourceFilter
    return matchesSearch && matchesSource
  })

  const handleRowClick = (citation: Citation) => {
    setSelectedCitation(citation)
    setIsDrawerOpen(true)
  }

  const getTrendDirection = (trend: number[]): "up" | "down" | "stable" => {
    const first = trend[0]
    const last = trend[trend.length - 1]
    if (last > first + 5) return "up"
    if (last < first - 5) return "down"
    return "stable"
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
            Detailed Citation Analysis
          </h1>
        </header>

        <main className="px-4 md:px-6">
          <div className="mx-auto max-w-[1600px] flex flex-col gap-14">
            {/* Filter Bar */}
            <Card className="border-border/50 bg-slate-900/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-[16px] font-semibold tracking-normal text-white">
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
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

            {/* Citation Analysis Table */}
            <Card className="border-border/50 bg-slate-900/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[16px] font-semibold tracking-normal text-white">
                      AI Search Citations
                    </CardTitle>
                    <p className="text-[14px] font-medium tracking-normal text-slate-400 mt-1">
                      Click a row to view optimization suggestions
                    </p>
                  </div>
                  <span className="text-[14px] font-medium tabular-nums text-slate-300">
                    {filteredCitations.length} citations
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4">
                          Source
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4 text-right">
                          Mentions
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4">
                          Optimization Score
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4">
                          Status
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4 text-center">
                          Trend
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCitations.map((citation) => {
                        const trendDirection = getTrendDirection(citation.trend)
                        
                        return (
                          <TableRow 
                            key={citation.id} 
                            className="border-border/30 transition-colors hover:bg-muted/20 cursor-pointer"
                            onClick={() => handleRowClick(citation)}
                          >
                            <TableCell className="py-4 px-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[14px] font-semibold tracking-normal text-violet-300">
                                  {citation.source}
                                </span>
                                <span className="text-[12px] font-medium text-slate-500" style={{ letterSpacing: '0.01em' }}>
                                  {citation.page}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-right">
                              <span className="text-[14px] font-semibold tabular-nums text-white">
                                {citation.mentions.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <OptimizationBadge score={citation.optimizationScore} />
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <StatusBadge status={citation.status} />
                            </TableCell>
                            <TableCell className="py-4 px-4 text-center">
                              <Sparkline data={citation.trend} trend={trendDirection} />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {filteredCitations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-[14px] font-medium text-slate-400">
                      No citations found matching your filters
                    </p>
                    <p className="text-[14px] text-slate-500 mt-1">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Side Drawer for Citation Details */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-slate-900 border-slate-800 overflow-y-auto">
          {selectedCitation && (
            <>
              <SheetHeader className="px-6 pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <SheetTitle className="text-[16px] font-semibold tracking-normal text-white">
                      {selectedCitation.source}
                    </SheetTitle>
                    <SheetDescription className="text-[14px] font-medium text-slate-400">
                      {selectedCitation.page}
                    </SheetDescription>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <p className="text-[12px] font-medium text-slate-400" style={{ letterSpacing: '0.01em' }}>Mentions</p>
                    <p className="text-[16px] font-semibold tabular-nums text-white">{selectedCitation.mentions.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <p className="text-[12px] font-medium text-slate-400" style={{ letterSpacing: '0.01em' }}>Score</p>
                    <p className="text-[16px] font-semibold tabular-nums text-white">{selectedCitation.optimizationScore}%</p>
                  </div>
                  <div className="rounded-lg bg-slate-800/50 p-3">
                    <p className="text-[12px] font-medium text-slate-400" style={{ letterSpacing: '0.01em' }}>Last Seen</p>
                    <p className="text-[14px] font-semibold text-white">{selectedCitation.lastSeen}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="px-6 py-6 space-y-6">
                {/* AI Optimization Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <h3 className="text-[14px] font-semibold text-white">
                      AI Optimization Suggestions
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {optimizationSuggestions[selectedCitation.source]?.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="rounded-lg border border-border/50 bg-slate-800/30 p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-[14px] font-semibold text-white">
                            {suggestion.title}
                          </h4>
                          <PriorityBadge priority={suggestion.priority} />
                        </div>
                        <p className="text-[14px] font-medium text-slate-400 leading-relaxed">
                          {suggestion.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-4 w-4 text-violet-400" />
                    <h3 className="text-[14px] font-semibold text-white">
                      Quick Actions
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-[14px]">View Full Report</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-[14px]">Open Page</span>
                    </Button>
                  </div>
                </div>
              </div>

              <SheetFooter className="px-6 pb-6 gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-[14px]">Share with Team</span>
                </Button>
                <Button 
                  className="flex-1 gap-2 bg-violet-600 text-white hover:bg-violet-700"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-[14px]">Export Data</span>
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
