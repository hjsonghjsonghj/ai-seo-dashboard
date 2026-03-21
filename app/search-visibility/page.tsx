"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Calendar, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react"
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
import { Sidebar } from "@/components/dashboard/sidebar"

// Keyword data synced with Top AI Search Citations from dashboard
const keywordData = [
  { id: 1, keyword: "best-seo-tools-2026", source: "ChatGPT", volume: 847, difficulty: 92, rank: 1, previousRank: 3, trend: [65, 72, 78, 82, 85, 88, 92] },
  { id: 2, keyword: "ai-content-optimization", source: "Claude", volume: 623, difficulty: 78, rank: 2, previousRank: 4, trend: [55, 62, 58, 71, 75, 78, 82] },
  { id: 3, keyword: "enterprise-seo-guide", source: "Perplexity", volume: 412, difficulty: 65, rank: 5, previousRank: 5, trend: [60, 62, 64, 65, 64, 65, 65] },
  { id: 4, keyword: "technical-seo-checklist", source: "Google AI", volume: 389, difficulty: 34, rank: 8, previousRank: 6, trend: [52, 48, 45, 42, 38, 36, 34] },
  { id: 5, keyword: "link-building-strategies", source: "Copilot", volume: 256, difficulty: 88, rank: 3, previousRank: 5, trend: [68, 72, 76, 80, 84, 86, 88] },
]

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

// Difficulty badge component
function DifficultyBadge({ value }: { value: number }) {
  let bgColor = "bg-emerald-500/20 text-emerald-400"
  let label = "Easy"
  
  if (value >= 70) {
    bgColor = "bg-rose-500/20 text-rose-400"
    label = "Hard"
  } else if (value >= 50) {
    bgColor = "bg-amber-500/20 text-amber-400"
    label = "Medium"
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] font-semibold tabular-nums text-white">{value}</span>
      <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${bgColor}`} style={{ letterSpacing: '0.01em' }}>
        {label}
      </span>
    </div>
  )
}

// Rank trend component
function RankTrend({ current, previous }: { current: number; previous: number }) {
  const diff = previous - current
  
  if (diff > 0) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[14px] font-semibold tabular-nums text-white">{current}</span>
        <div className="flex items-center gap-0.5 text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-[14px] font-semibold tabular-nums">+{diff}</span>
        </div>
      </div>
    )
  } else if (diff < 0) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[14px] font-semibold tabular-nums text-white">{current}</span>
        <div className="flex items-center gap-0.5 text-rose-400">
          <TrendingDown className="h-4 w-4" />
          <span className="text-[14px] font-semibold tabular-nums">{diff}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[14px] font-semibold tabular-nums text-white">{current}</span>
      <div className="flex items-center gap-0.5 text-slate-400">
        <Minus className="h-4 w-4" />
        <span className="text-[14px] font-medium tabular-nums">0</span>
      </div>
    </div>
  )
}

export default function SearchVisibilityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("30d")
  const [category, setCategory] = useState("all")

  const filteredKeywords = keywordData.filter(kw =>
    kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                <span className="text-[16px] font-medium">Back to Dashboard</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-[17px] font-semibold tracking-normal text-white">
            Search Visibility Analysis
          </h1>
        </header>

        <main className="px-4 md:px-6">
          <div className="mx-auto max-w-[1600px] flex flex-col gap-14">
            {/* Filter Bar */}
            <Card className="border-border/50 bg-slate-900/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-[17px] font-semibold tracking-normal text-white">
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Date Range */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[160px] bg-slate-800/50 border-slate-700 text-[16px]">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d" className="text-[16px]">Last 7 days</SelectItem>
                        <SelectItem value="30d" className="text-[16px]">Last 30 days</SelectItem>
                        <SelectItem value="90d" className="text-[16px]">Last 90 days</SelectItem>
                        <SelectItem value="1y" className="text-[16px]">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-[16px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-[16px]">All Categories</SelectItem>
                        <SelectItem value="ai" className="text-[16px]">AI & Machine Learning</SelectItem>
                        <SelectItem value="seo" className="text-[16px]">SEO Tools</SelectItem>
                        <SelectItem value="content" className="text-[16px]">Content Optimization</SelectItem>
                        <SelectItem value="analytics" className="text-[16px]">Analytics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-[16px] placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keyword Analysis Table */}
            <Card className="border-border/50 bg-slate-900/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[17px] font-semibold tracking-normal text-white">
                      AI Citation Analysis
                    </CardTitle>
                    <p className="text-[14px] font-medium tracking-normal text-slate-400 mt-1">
                      Detailed view of top AI search citations and optimization status
                    </p>
                  </div>
                  <span className="text-[14px] font-medium tabular-nums text-slate-300">
                    {filteredKeywords.length} keywords
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="overflow-hidden rounded-lg border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4">
                          Keyword
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4">
                          Source
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4 text-right">
                          Mentions
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4">
                          Optimization
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4">
                          Rank Trend
                        </TableHead>
                        <TableHead className="text-[14px] font-semibold tracking-normal text-slate-300 py-4 px-4 text-center">
                          Sparkline
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeywords.map((kw) => {
                        const trendDirection = kw.rank < kw.previousRank 
                          ? "up" 
                          : kw.rank > kw.previousRank 
                            ? "down" 
                            : "stable"
                        
                        return (
                          <TableRow 
                            key={kw.id} 
                            className="border-border/30 transition-colors hover:bg-muted/20"
                          >
                            <TableCell className="py-4 px-4">
                              <span className="text-[14px] font-medium tracking-normal text-white">
                                {kw.keyword}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <span className="text-[14px] font-semibold tracking-normal text-violet-300">
                                {kw.source}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4 text-right">
                              <span className="text-[14px] font-semibold tabular-nums text-white">
                                {kw.volume.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <DifficultyBadge value={kw.difficulty} />
                            </TableCell>
                            <TableCell className="py-4 px-4">
                              <RankTrend current={kw.rank} previous={kw.previousRank} />
                            </TableCell>
                            <TableCell className="py-4 px-4 text-center">
                              <Sparkline data={kw.trend} trend={trendDirection} />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {filteredKeywords.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-[16px] font-medium text-slate-400">
                      No keywords found matching your search
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
    </div>
  )
}
