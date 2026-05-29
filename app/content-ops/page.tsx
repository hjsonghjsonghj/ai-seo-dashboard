"use client"

import { useMemo, useState } from "react"
import { citationsData } from "@/components/dashboard/citations-table"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  Calendar,
  AlertCircle,
  FileText,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PLATFORMS, PLATFORM_COLORS, PLATFORM_ABBREV, type Platform } from "@/lib/platforms"

// ── Static per-page metadata ──────────────────────────────────────────────────

const PAGE_STATUS: Record<string, Status> = {
  "/best-seo-tools-2026":      "Live",
  "/on-page-seo-checklist":    "Live",
  "/link-building-strategies": "Live",
  "/ai-content-optimization":  "Live",
  "/enterprise-seo-guide":     "Needs Update",
  "/technical-seo-audit":      "Live",
  "/core-web-vitals-guide":    "Needs Update",
  "/structured-data-guide":    "Needs Update",
  "/local-seo-strategy":       "In Review",
  "/keyword-research-2026":    "Draft",
}

const PAGE_ACTION: Record<string, string> = {
  "/best-seo-tools-2026":      "Update Pricing Tables",
  "/on-page-seo-checklist":    "Add FAQ Schema",
  "/link-building-strategies": "Expand Outreach Examples",
  "/ai-content-optimization":  "Add Industry Data",
  "/enterprise-seo-guide":     "Add Organization Schema",
  "/technical-seo-audit":      "Add API Examples",
  "/core-web-vitals-guide":    "Add 2026 Benchmarks",
  "/structured-data-guide":    "Expand Schema Types",
  "/local-seo-strategy":       "Add LocalBusiness Schema",
  "/keyword-research-2026":    "Add Case Studies",
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "Live" | "Needs Update" | "In Review" | "Draft"

type PageSummary = {
  page: string
  optimizationProgress: number
  totalMentions: number
  trend: "up" | "down" | "stable"
  platforms: Platform[]
  platformCount: number
  lastSeen: string
  status: Status
  recommendedAction: string
}

// ── Status distribution config (for Status Distribution card) ────────────────

const STATUS_DIST_CONFIG: { label: Status; textClass: string; barClass: string }[] = [
  { label: "Live",         textClass: "text-positive-default", barClass: "bg-positive-default" },
  { label: "Needs Update", textClass: "text-caution-default",  barClass: "bg-caution-default" },
  { label: "In Review",    textClass: "text-brand-soft",       barClass: "bg-brand-default" },
  { label: "Draft",        textClass: "text-foreground-muted", barClass: "bg-foreground-muted" },
]

// ── Data derivation ───────────────────────────────────────────────────────────

function derivePageData(): PageSummary[] {
  const pageMap = new Map<string, {
    opt: number
    mentions: number
    trendScore: number
    platforms: Set<Platform>
    lastSeen: string
  }>()

  for (const row of citationsData) {
    const trendDelta = row.trend === "up" ? 1 : row.trend === "down" ? -1 : 0
    const existing = pageMap.get(row.page)
    if (!existing) {
      pageMap.set(row.page, {
        opt: row.optimizationProgress,
        mentions: row.mentions,
        trendScore: trendDelta,
        platforms: new Set([row.source as Platform]),
        lastSeen: row.lastSeen,
      })
    } else {
      existing.mentions += row.mentions
      existing.trendScore += trendDelta
      existing.platforms.add(row.source as Platform)
    }
  }

  return Array.from(pageMap.entries()).map(([page, data]) => {
    const trend: "up" | "down" | "stable" =
      data.trendScore > 0 ? "up" : data.trendScore < 0 ? "down" : "stable"
    const platforms = Array.from(data.platforms)
    return {
      page,
      optimizationProgress: data.opt,
      totalMentions: data.mentions,
      trend,
      platforms,
      platformCount: platforms.length,
      lastSeen: data.lastSeen,
      status: PAGE_STATUS[page] ?? "Live",
      recommendedAction: PAGE_ACTION[page] ?? "Review Content",
    }
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  const barColor =
    value >= 80 ? "bg-positive-default" :
    value >= 60 ? "bg-caution-default" :
    "bg-danger-default"
  const textColor =
    value >= 80 ? "text-positive-soft" :
    value >= 60 ? "text-caution-default" :
    "text-danger-soft"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-hover">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn("text-label-xs-medium tabular-nums", textColor)}>
        {value}%
      </span>
    </div>
  )
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")   return <TrendingUp   className="h-4 w-4 text-positive-soft" />
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-danger-soft" />
  return <Minus className="h-4 w-4 text-foreground-muted" />
}

function PlatformBadges({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap justify-center">
      {platforms.map((p) => (
        <span key={p} className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: PLATFORM_COLORS[p] }}
          />
          <span className="text-label-xs-medium text-foreground-secondary">
            {PLATFORM_ABBREV[p]}
          </span>
        </span>
      ))}
    </div>
  )
}

const STATUS_CONFIG: Record<Status, { className: string }> = {
  "Live":         { className: "bg-positive-default/15 text-positive-soft" },
  "Needs Update": { className: "bg-caution-default/15 text-caution-default" },
  "In Review":    { className: "bg-brand-default/15 text-brand-soft" },
  "Draft":        { className: "bg-surface-hover text-foreground-muted" },
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-2 py-0.5 text-label-xs-medium font-semibold whitespace-nowrap",
      STATUS_CONFIG[status].className
    )}>
      {status}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContentOpsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [sortCol, setSortCol]           = useState<"score" | "mentions">("score")
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("asc")

  const pageData = useMemo(() => derivePageData(), [])

  // ── Stat calculations ────────────────────────────────────────────────────
  const totalPages     = pageData.length
  const needsAttention = pageData.filter(p => p.optimizationProgress < 60 || p.trend === "down").length
  const avgScore       = Math.round(pageData.reduce((s, p) => s + p.optimizationProgress, 0) / pageData.length)
  const totalMentions  = pageData.reduce((s, p) => s + p.totalMentions, 0)

  // ── Priority queue: low-score pages only, ascending ──────────────────────
  const priorityQueue = useMemo(
    () => [...pageData]
      .filter(p => p.optimizationProgress < 85)
      .sort((a, b) => a.optimizationProgress - b.optimizationProgress)
      .slice(0, 6),
    [pageData]
  )

  // ── Pipeline table with filter + sort ────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = [...pageData]
    if (statusFilter !== "All") data = data.filter(p => p.status === statusFilter)
    data.sort((a, b) => {
      const av = sortCol === "score" ? a.optimizationProgress : a.totalMentions
      const bv = sortCol === "score" ? b.optimizationProgress : b.totalMentions
      return sortDir === "asc" ? av - bv : bv - av
    })
    return data
  }, [pageData, statusFilter, sortCol, sortDir])

  function toggleSort(col: "score" | "mentions") {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortCol(col)
      setSortDir("desc")
    }
  }

  function SortIndicator({ col }: { col: "score" | "mentions" }) {
    if (sortCol !== col) return <ArrowUpDown className="h-3 w-3 text-foreground-muted" />
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 text-foreground-strong" />
      : <ArrowDown className="h-3 w-3 text-foreground-strong" />
  }

  return (
    <div className="min-h-screen bg-background tracking-tighter">
      <Sidebar />
      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-2 md:gap-3">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex h-16 items-center justify-between border-b border-border-secondary/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
          <div>
            <h1 className="text-title-section-semibold md:text-title-page-semibold text-foreground-strong">
              Content Ops
            </h1>
            <p className="hidden md:block text-body-micro-medium md:text-body-md-regular font-medium text-foreground-tertiary">
              Track, prioritize, and optimize every page for AI visibility
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Select defaultValue="30d">
              <SelectTrigger className="h-9 w-[160px] border-border-secondary bg-surface-hover/50">
                <div className="flex min-w-0 items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-foreground-muted" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 border-border-secondary bg-surface-hover/50 text-foreground-primary hover:bg-surface-hover"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-default text-label-micro-medium leading-none text-foreground-strong">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <main className="px-4 pt-2 pb-4 md:px-6 md:pt-2 md:pb-6">
          <div className="mx-auto max-w-container space-y-4 md:space-y-6">

            {/* ── Stat Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

              <Card className="bg-surface-default/60 transition-colors duration-150">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-body-micro-medium text-foreground-secondary">Pages Tracked</p>
                      <p className="text-display-sm-bold tabular-nums text-foreground-strong">{totalPages}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
                      <FileText className="h-5 w-5 text-brand-soft" />
                    </div>
                  </div>
                  <p className="mt-3 text-body-micro-medium text-foreground-tertiary">Across all categories</p>
                </CardContent>
              </Card>

              <Card className="bg-surface-default/60 transition-colors duration-150">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-body-micro-medium text-foreground-secondary">Needs Attention</p>
                      <p className="text-display-sm-bold tabular-nums text-danger-soft">{needsAttention}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-default/10">
                      <AlertCircle className="h-5 w-5 text-danger-soft" />
                    </div>
                  </div>
                  <p className="mt-3 text-body-micro-medium text-foreground-tertiary">Score below 60 or declining</p>
                </CardContent>
              </Card>

              <Card className="bg-surface-default/60 transition-colors duration-150">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-body-micro-medium text-foreground-secondary">Avg AI Score</p>
                      <p className="text-display-sm-bold tabular-nums text-foreground-strong">{avgScore}%</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
                      <Zap className="h-5 w-5 text-brand-soft" />
                    </div>
                  </div>
                  <p className="mt-3 text-body-micro-medium text-foreground-tertiary">Across all tracked pages</p>
                </CardContent>
              </Card>

              <Card className="bg-surface-default/60 transition-colors duration-150">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-body-micro-medium text-foreground-secondary">Total Mentions</p>
                      <p className="text-display-sm-bold tabular-nums text-foreground-strong">
                        {totalMentions.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
                      <TrendingUp className="h-5 w-5 text-brand-soft" />
                    </div>
                  </div>
                  <p className="mt-3 text-body-micro-medium text-foreground-tertiary">Combined across all platforms</p>
                </CardContent>
              </Card>

            </div>

            {/* ── Two-col: Priority Queue + Coverage Chart ───────────────── */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">

              {/* Priority Queue */}
              <Card className="bg-surface-default/60 transition-colors duration-150">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-title-section-semibold text-foreground-secondary">
                    Fix First
                  </CardTitle>
                  <p className="hidden md:block text-body-micro-medium text-foreground-tertiary mt-1">
                    Pages ranked by improvement opportunity
                  </p>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0 space-y-1">
                  {priorityQueue.map((p, i) => (
                    <div
                      key={p.page}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-surface-hover/50 cursor-pointer"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-hover text-label-xs-medium text-foreground-muted tabular-nums">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm-medium text-foreground-secondary">{p.page}</p>
                        <div className="mt-1.5">
                          <ProgressBar value={p.optimizationProgress} />
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center rounded-md bg-brand-default/10 px-2 py-0.5 text-label-xs-medium text-brand-soft whitespace-nowrap">
                        {p.recommendedAction}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="bg-surface-default/60 transition-colors duration-150">
                <CardHeader className="px-5 pt-5 pb-3">
                  <CardTitle className="text-title-section-semibold text-foreground-secondary">
                    Status Distribution
                  </CardTitle>
                  <p className="hidden md:block text-body-micro-medium text-foreground-tertiary mt-1">
                    Publishing state across all tracked pages
                  </p>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-2">
                  <div className="space-y-4">
                    {STATUS_DIST_CONFIG.map(({ label, textClass, barClass }) => {
                      const count = pageData.filter(p => p.status === label).length
                      const pct = pageData.length > 0 ? (count / pageData.length) * 100 : 0
                      return (
                        <div key={label} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={cn("text-body-sm-medium", textClass)}>{label}</span>
                            <span className="text-body-micro-medium tabular-nums text-foreground-tertiary">
                              {count} / {pageData.length}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-surface-hover/50">
                            <div
                              className={cn("h-2 rounded-full transition-all duration-500", barClass)}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* ── Content Pipeline Table ─────────────────────────────────── */}
            <Card className="bg-surface-default/60 transition-colors duration-150">
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-title-section-semibold text-foreground-secondary">
                      Content Pipeline
                    </CardTitle>
                    <p className="hidden md:block text-body-micro-medium text-foreground-tertiary mt-1">
                      Full status overview across all tracked pages
                    </p>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 w-36 border-border-secondary bg-surface-default/60 text-body-sm-medium text-foreground-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Live">Live</SelectItem>
                      <SelectItem value="Needs Update">Needs Update</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">

                {/* Desktop table */}
                <div className="hidden md:block overflow-hidden rounded-lg border border-border-secondary/50">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b border-border-secondary/50 bg-surface-default/30">
                        <th className="px-4 py-3 text-left text-label-xs-caps-semibold text-foreground-tertiary">
                          Page
                        </th>
                        <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                          <button
                            type="button"
                            onClick={() => toggleSort("score")}
                            className="inline-flex items-center gap-1 cursor-pointer transition-colors hover:text-foreground-strong"
                          >
                            AI Score <SortIndicator col="score" />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                          Platforms
                        </th>
                        <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                          <button
                            type="button"
                            onClick={() => toggleSort("mentions")}
                            className="inline-flex items-center gap-1 cursor-pointer transition-colors hover:text-foreground-strong"
                          >
                            Mentions <SortIndicator col="mentions" />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                          Trend
                        </th>
                        <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-tertiary">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-hover">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-body-micro-medium text-foreground-muted">
                            No pages match this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((p) => (
                          <tr
                            key={p.page}
                            className="transition-colors duration-150 hover:bg-surface-default/20"
                          >
                            <td className="px-4 py-3">
                              <span className="text-body-md-medium text-foreground-secondary">{p.page}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <ProgressBar value={p.optimizationProgress} />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <PlatformBadges platforms={p.platforms} />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-body-md-medium tabular-nums text-foreground-secondary">
                                {p.totalMentions.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <TrendIcon trend={p.trend} />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <StatusBadge status={p.status} />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <button className="flex items-center gap-1 rounded-md bg-surface-hover px-2.5 py-1 text-label-xs-medium text-foreground-secondary transition-colors hover:text-foreground-strong whitespace-nowrap">
                                  {p.recommendedAction} <ChevronRight className="h-3 w-3 shrink-0" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filteredData.length === 0 ? (
                    <p className="py-8 text-center text-body-micro-medium text-foreground-muted">
                      No pages match this filter.
                    </p>
                  ) : (
                    filteredData.map((p) => (
                      <div
                        key={p.page}
                        className="rounded-lg bg-surface-default/40 p-4 space-y-3 transition-colors hover:bg-surface-hover/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-body-sm-medium text-foreground-secondary">{p.page}</p>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <ProgressBar value={p.optimizationProgress} />
                          <PlatformBadges platforms={p.platforms} />
                          <TrendIcon trend={p.trend} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-body-micro-medium text-foreground-tertiary">
                            {p.totalMentions.toLocaleString()} mentions
                          </span>
                          <button className="flex items-center gap-1 rounded-md bg-surface-hover px-2.5 py-1 text-label-xs-medium text-foreground-secondary whitespace-nowrap">
                            {p.recommendedAction} <ChevronRight className="h-3 w-3 shrink-0" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
