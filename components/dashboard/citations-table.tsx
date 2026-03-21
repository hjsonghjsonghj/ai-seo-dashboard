"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, TrendingDown, Minus, Eye, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const citations = [
  {
    id: 1,
    source: "ChatGPT",
    page: "/best-seo-tools-2026",
    mentions: 847,
    trend: "up" as const,
    optimizationProgress: 92,
    lastSeen: "2 min ago",
  },
  {
    id: 2,
    source: "Claude",
    page: "/ai-content-optimization",
    mentions: 623,
    trend: "up" as const,
    optimizationProgress: 78,
    lastSeen: "5 min ago",
  },
  {
    id: 3,
    source: "Perplexity",
    page: "/enterprise-seo-guide",
    mentions: 412,
    trend: "stable" as const,
    optimizationProgress: 65,
    lastSeen: "12 min ago",
  },
  {
    id: 4,
    source: "Google AI",
    page: "/technical-seo-checklist",
    mentions: 389,
    trend: "down" as const,
    optimizationProgress: 34,
    lastSeen: "1 hour ago",
  },
  {
    id: 5,
    source: "Copilot",
    page: "/link-building-strategies",
    mentions: 256,
    trend: "up" as const,
    optimizationProgress: 88,
    lastSeen: "3 min ago",
  },
]

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
          className="stroke-muted/30"
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
      <span className={cn("absolute text-[10px] font-medium", textColorClass)}>
        {progress}%
      </span>
    </div>
  )
}

// Mobile card view for each citation
function CitationCard({ citation }: { citation: typeof citations[0] }) {
  const TrendIcon = trendIcons[citation.trend]

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-slate-900/40 p-4 transition-colors hover:bg-slate-800/50">
      <div className="flex items-center gap-3">
        <ProgressRing progress={citation.optimizationProgress} size={44} />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{citation.source}</span>
            <TrendIcon className={cn("h-3.5 w-3.5", trendColors[citation.trend])} />
          </div>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{citation.page}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-white font-medium">{citation.mentions.toLocaleString()}</span>
            <span>mentions</span>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:border-violet-600 active:scale-95"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function CitationsTable() {
  return (
    <Card className="border-border/50 bg-slate-900/60 transition-colors duration-150">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-white">
              Top AI Search Citations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Real-time tracking with optimization status
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary">
            View all
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop table view */}
        <div className="hidden md:block overflow-hidden rounded-lg border border-border/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Page
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Mentions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Trend
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Optimization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Seen
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quick Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {citations.map((citation) => {
                const TrendIcon = trendIcons[citation.trend]
                return (
                  <tr
                    key={citation.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="font-medium text-white">
                        {citation.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-muted-foreground">
                        {citation.page}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="text-sm font-medium text-white">
                        {citation.mentions.toLocaleString()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <TrendIcon
                        className={cn("h-4 w-4", trendColors[citation.trend])}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex justify-center">
                        <ProgressRing progress={citation.optimizationProgress} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm text-muted-foreground">
                      {citation.lastSeen}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1.5 border-violet-500/30 bg-violet-500/10 px-2.5 text-xs font-medium text-violet-400 hover:bg-violet-500/20 hover:text-violet-300"
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
          {citations.map((citation) => (
            <CitationCard key={citation.id} citation={citation} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
