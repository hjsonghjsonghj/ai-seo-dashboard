"use client"
import { CitationDetailsDrawer } from "@/components/dashboard/citation-details-drawer"
import CitationsTable from "@/components/dashboard/citations-table"
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
import { Form } from "@/components/ui/form"

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

            {/* Desktop table & Mobile card view */}
            <CitationsTable
              data={filteredCitations}
              onReview={(citation) => {
                setSelectedCitation(citation);
                setIsDrawerOpen(true);
              }}
              headerAction={
                <span className="text-[14px] font-medium tabular-nums text-slate-300">
                  {`${filteredCitations.length} citations`}
                </span>
              }
            />

            {/* Side Drawer */}
            <CitationDetailsDrawer
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
              selectedCitation={selectedCitation}
            />
          </div>
        </main>
      </div>
    </div>
  )
}




