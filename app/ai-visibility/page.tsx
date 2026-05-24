"use client"

import { useMemo } from "react"
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Bell, Calendar, Activity, Target, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Pie Chart Tooltip ────────────────────────────────────────────────────────

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload || !payload.length) return null
  const entry = payload[0]
  const color = PLATFORM_COLORS[entry.name as Platform]
  return (
    <div className="rounded-lg border border-border-secondary bg-surface-default/95 p-3 shadow-xl" role="tooltip">
      <div className="flex items-center gap-2 text-body-micro-medium">
        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
        <span className="font-medium text-foreground-tertiary">{entry.name}:</span>
        <span className="font-semibold tabular-nums text-foreground-strong">
          {entry.value.toLocaleString()} mentions
        </span>
      </div>
    </div>
  )
}

// ── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = ["ChatGPT", "Claude", "Perplexity", "Gemini", "Copilot"] as const
type Platform = (typeof PLATFORMS)[number]

const PLATFORM_COLORS: Record<Platform, string> = {
  ChatGPT:    "#8b5cf6",  // brand-default
  Claude:     "#10b981",  // positive-default
  Perplexity: "#60a5fa",  // chart-4
  "Gemini":"#f59e0b",  // caution-default
  Copilot:    "#f87171",  // danger-soft
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AiVisibilityPage() {

  // Per-platform stats
  const platformStats = useMemo(() => {
    return PLATFORMS.map((platform) => {
      const rows = citationsData.filter((c) => c.source === platform)
      const totalMentions = rows.reduce((s, r) => s + r.mentions, 0)
      const avgOptimization = rows.length
        ? Math.round(rows.reduce((s, r) => s + r.optimizationProgress, 0) / rows.length)
        : 0
      const trendUp     = rows.filter((r) => r.trend === "up").length
      const trendDown   = rows.filter((r) => r.trend === "down").length
      const trendStable = rows.filter((r) => r.trend === "stable").length
      return { platform, totalMentions, avgOptimization, trendUp, trendDown, trendStable, citationCount: rows.length }
    })
  }, [])

  // Page × Platform coverage matrix
  const pageMatrix = useMemo(() => {
    const map = new Map<string, {
      page: string
      optimizationProgress: number
      cells: Partial<Record<Platform, number>>
      totalMentions: number
    }>()
    citationsData.forEach((c) => {
      if (!map.has(c.page)) {
        map.set(c.page, { page: c.page, optimizationProgress: c.optimizationProgress, cells: {}, totalMentions: 0 })
      }
      const entry = map.get(c.page)!
      entry.cells[c.source as Platform] = c.mentions
      entry.totalMentions += c.mentions
    })
    return Array.from(map.values()).sort((a, b) => b.totalMentions - a.totalMentions)
  }, [])

  const totalMentions      = platformStats.reduce((s, p) => s + p.totalMentions, 0)
  const avgOptimization    = Math.round(platformStats.reduce((s, p) => s + p.avgOptimization, 0) / platformStats.length)
  const topPlatform        = platformStats.reduce((a, b) => a.totalMentions > b.totalMentions ? a : b)
  const sortedByMentions   = platformStats.slice().sort((a, b) => b.totalMentions - a.totalMentions)
  const sortedByOpt        = platformStats.slice().sort((a, b) => b.avgOptimization - a.avgOptimization)
  const donutData          = platformStats.map((p) => ({ name: p.platform, value: p.totalMentions }))

  return (
    <div className="min-h-screen bg-background tracking-tighter">
      <Sidebar />
      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-2 md:gap-3">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex h-16 items-center justify-between border-b border-border-secondary/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
          <div>
            <h1 className="text-title-section-semibold md:text-title-page-semibold text-foreground-strong">
              AI Visibility
            </h1>
            <p className="hidden md:block text-body-micro-medium md:text-body-md-regular font-medium text-foreground-tertiary">
              Brand citations across ChatGPT, Claude, Perplexity, Gemini and Copilot
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

        <main className="px-4 pt-2 pb-4 md:px-6 md:pt-2 md:pb-6">
          <div className="mx-auto max-w-container space-y-4 md:space-y-6">

            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="cursor-pointer bg-surface-default/60 transition-colors duration-150 hover:bg-surface-hover/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-body-micro-medium text-foreground-secondary">Total Mentions</p>
                      <p className="text-display-sm-bold tabular-nums text-foreground-strong">
                        {totalMentions.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
                      <Activity className="h-5 w-5 text-brand-soft" />
                    </div>
                  </div>
                  <p className="mt-3 text-body-micro-medium text-foreground-tertiary">Across all 5 platforms</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer bg-surface-default/60 transition-colors duration-150 hover:bg-surface-hover/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-body-micro-medium text-foreground-secondary">Top Platform</p>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: PLATFORM_COLORS[topPlatform.platform] }} />
                        <span className="text-display-sm-semibold text-foreground-strong">{topPlatform.platform}</span>
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
                      <BarChart2 className="h-5 w-5 text-brand-soft" />
                    </div>
                  </div>
                  <p className="mt-3 text-body-micro-medium text-foreground-tertiary">
                    {topPlatform.totalMentions.toLocaleString()} total mentions
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer bg-surface-default/60 transition-colors duration-150 hover:bg-surface-hover/80">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-body-micro-medium text-foreground-secondary">Avg Optimization</p>
                      <p className={cn(
                        "text-display-sm-bold tabular-nums",
                        avgOptimization >= 75 ? "text-positive-default" : avgOptimization >= 50 ? "text-caution-default" : "text-danger-soft"
                      )}>
                        {avgOptimization}%
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
                      <Target className="h-5 w-5 text-brand-soft" />
                    </div>
                  </div>
                  <p className="mt-3 text-body-micro-medium text-foreground-tertiary">Content optimization score</p>
                </CardContent>
              </Card>
            </section>

            {/* ── Donut + Optimization Score ───────────────────────────────── */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">

              {/* Donut Chart + Ranking */}
              <Card className="bg-surface-default/60 lg:col-span-2">
                <CardHeader className="px-5 pt-5 pb-0">
                  <CardTitle className="text-title-sub-semibold text-foreground-secondary">Mentions by Platform</CardTitle>
                  <p className="text-body-micro-medium text-foreground-muted mt-0.5">Share of total AI-generated citations</p>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
                    <div className="relative h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={80} outerRadius={120} paddingAngle={2} stroke="none">
                            {donutData.map((d) => (
                              <Cell key={d.name} fill={PLATFORM_COLORS[d.name as Platform]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={<CustomPieTooltip />}
                            wrapperStyle={{ outline: "none", zIndex: 9999 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-display-sm-bold tabular-nums text-foreground-strong">{totalMentions.toLocaleString()}</span>
                        <span className="text-label-xs-caps-medium text-foreground-muted mt-1">Total</span>
                      </div>
                    </div>
                    <ul className="flex flex-col divide-y divide-border-secondary">
                      {sortedByMentions.map((p, i) => {
                        const pct = ((p.totalMentions / totalMentions) * 100).toFixed(1)
                        return (
                          <li key={p.platform} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-label-xs-medium text-foreground-muted w-4 tabular-nums text-right">{i + 1}</span>
                              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PLATFORM_COLORS[p.platform] }} />
                              <span className="text-body-sm-medium text-foreground-secondary">{p.platform}</span>
                            </div>
                            <div className="flex items-baseline gap-3 tabular-nums">
                              <span className="text-body-sm-medium font-semibold text-foreground-secondary">{p.totalMentions.toLocaleString()}</span>
                              <span className="w-10 text-right text-label-xs-medium text-foreground-muted">{pct}%</span>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Score per Platform */}
              <Card className="bg-surface-default/60">
                <CardHeader className="px-5 pt-5 pb-0">
                  <CardTitle className="text-title-sub-semibold text-foreground-secondary">Optimization Score</CardTitle>
                  <p className="text-body-micro-medium text-foreground-muted mt-0.5">Average content score per platform</p>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-4 space-y-4">
                  {sortedByOpt.map((p) => (
                    <div key={p.platform}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-body-sm-medium text-foreground-secondary">{p.platform}</span>
                        <span className={cn(
                          "text-body-sm-medium font-semibold tabular-nums",
                          p.avgOptimization >= 75 ? "text-positive-default" : p.avgOptimization >= 50 ? "text-caution-default" : "text-danger-soft"
                        )}>
                          {p.avgOptimization}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-border-secondary">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.avgOptimization}%`, backgroundColor: PLATFORM_COLORS[p.platform] }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            {/* ── Trend Breakdown ─────────────────────────────────────────── */}
            <Card className="bg-surface-default/60">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle className="text-title-sub-semibold text-foreground-secondary">Citation Trends</CardTitle>
                <p className="text-body-micro-medium text-foreground-muted mt-0.5">Up / stable / down breakdown per platform</p>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-4 space-y-4">
                {platformStats.map((p) => (
                  <div key={p.platform}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-body-sm-medium text-foreground-secondary">{p.platform}</span>
                      <div className="flex items-center gap-3">
                        {p.trendUp > 0     && <span className="text-label-xs-medium text-positive-default">↑ {p.trendUp}</span>}
                        {p.trendStable > 0 && <span className="text-label-xs-medium text-foreground-muted">→ {p.trendStable}</span>}
                        {p.trendDown > 0   && <span className="text-label-xs-medium text-danger-soft">↓ {p.trendDown}</span>}
                      </div>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-border-secondary">
                      {p.trendUp > 0     && <div className="h-full bg-positive-default" style={{ width: `${(p.trendUp     / p.citationCount) * 100}%` }} />}
                      {p.trendStable > 0 && <div className="h-full bg-border-primary"  style={{ width: `${(p.trendStable / p.citationCount) * 100}%` }} />}
                      {p.trendDown > 0   && <div className="h-full bg-danger-soft"     style={{ width: `${(p.trendDown   / p.citationCount) * 100}%` }} />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ── Coverage Matrix ──────────────────────────────────────────── */}
            <Card className="bg-surface-default/60">
              <CardHeader className="px-5 pt-5 pb-0">
                <CardTitle className="text-title-sub-semibold text-foreground-secondary">Coverage Matrix</CardTitle>
                <p className="text-body-micro-medium text-foreground-muted mt-0.5">
                  Which pages are cited by which platform — and how many times
                </p>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-secondary bg-surface-hover/40">
                        <th className="px-5 py-3 text-left text-label-xs-caps-semibold text-foreground-muted font-medium w-[220px]">
                          Page
                        </th>
                        {PLATFORMS.map((p) => (
                          <th key={p} className="px-4 py-3 text-center text-label-xs-caps-semibold text-foreground-muted font-medium">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PLATFORM_COLORS[p] }} />
                              <span className="hidden sm:inline">{p}</span>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-label-xs-caps-semibold text-foreground-muted font-medium">
                          Score
                        </th>
                        <th className="px-5 py-3 text-right text-label-xs-caps-semibold text-foreground-muted font-medium">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageMatrix.map((row) => (
                        <tr
                          key={row.page}
                          className="border-b border-border-secondary last:border-0 hover:bg-surface-hover/30 transition-colors"
                        >
                          {/* Page path */}
                          <td className="px-5 py-3 text-body-sm-medium text-foreground-secondary max-w-[220px] truncate">
                            {row.page}
                          </td>

                          {/* Per-platform cells */}
                          {PLATFORMS.map((p) => {
                            const mentions = row.cells[p]
                            return (
                              <td
                                key={p}
                                className="px-4 py-3 text-center"
                                style={mentions ? { backgroundColor: PLATFORM_COLORS[p] + "12" } : {}}
                              >
                                {mentions ? (
                                  <span
                                    className="text-body-sm-medium font-semibold tabular-nums"
                                    style={{ color: PLATFORM_COLORS[p] }}
                                  >
                                    {mentions.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-label-xs-medium text-foreground-muted/30">—</span>
                                )}
                              </td>
                            )
                          })}

                          {/* Optimization score */}
                          <td className="px-4 py-3 text-right">
                            <span className={cn(
                              "text-body-sm-medium font-semibold tabular-nums",
                              row.optimizationProgress >= 75 ? "text-positive-default"
                                : row.optimizationProgress >= 40 ? "text-caution-default"
                                : "text-danger-soft"
                            )}>
                              {row.optimizationProgress}%
                            </span>
                          </td>

                          {/* Total mentions */}
                          <td className="px-5 py-3 text-right text-body-sm-medium font-semibold tabular-nums text-foreground-secondary">
                            {row.totalMentions.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
}
