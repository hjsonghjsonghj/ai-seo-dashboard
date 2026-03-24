"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, TrendingDown, Minus, Eye, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// 1. 필요한 데이터 및 헬퍼 함수 (그대로 유지)
const citations: any[] = [
  { id: 1, source: "ChatGPT", page: "/best-seo-tools-2026", mentions: 847, trend: "up", optimizationProgress: 92, lastSeen: "2 min ago" },
  { id: 2, source: "Claude", page: "/ai-content-optimization", mentions: 623, trend: "up", optimizationProgress: 78, lastSeen: "5 min ago" },
  { id: 3, source: "Perplexity", page: "/enterprise-seo-guide", mentions: 412, trend: "stable", optimizationProgress: 65, lastSeen: "12 min ago" },
  { id: 4, source: "Google AI", page: "/technical-seo-checklist", mentions: 389, trend: "down", optimizationProgress: 34, lastSeen: "1 hour ago" },
  { id: 5, source: "Copilot", page: "/link-building-strategies", mentions: 256, trend: "up", optimizationProgress: 88, lastSeen: "3 min ago" },
];

const trendIcons: any = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColors: any = {
  up: "text-v0-emerald-400",
  down: "text-v0-rose-400",
  stable: "text-muted-foreground",
};

function getProgressColor(progress: number): string {
  if (progress < 40) return "stroke-v0-red-500";
  if (progress < 75) return "stroke-v0-amber-500";
  return "stroke-v0-emerald-500";
}

function getProgressTextColor(progress: number): string {
  if (progress < 40) return "text-v0-red-400";
  if (progress < 75) return "text-v0-amber-400";
  return "text-v0-emerald-400";
}

function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const colorClass = getProgressColor(progress);
  const textColorClass = getProgressTextColor(progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-v0-slate-700" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
          className={colorClass}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: "stroke-dashoffset 0.5s ease-out, stroke 0.3s ease" }}
        />
      </svg>
      <span className={cn("absolute text-[12px] font-semibold tabular-nums tracking-normal", textColorClass)}>
        {progress}%
      </span>
    </div>
  );
}

// 2. Mobile card view (onReview 추가)
function CitationCard({ citation, onReview }: { citation: any; onReview?: (c: any) => void }) {
  const TrendIcon = trendIcons[citation.trend];

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-border/50 bg-v0-slate-900/40 p-5 transition-colors hover:bg-v0-slate-800/50 cursor-pointer"
      onClick={() => onReview?.(citation)}
    >
      <div className="flex items-center gap-4">
        <ProgressRing progress={citation.optimizationProgress} size={44} />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold tracking-normal text-v0-white">{citation.source}</span>
            <TrendIcon className={cn("h-3.5 w-3.5", trendColors[citation.trend])} />
          </div>
          <p className="text-[13px] font-medium tracking-normal text-v0-slate-400 truncate max-w-[140px]">{citation.page}</p>
          <div className="flex items-center gap-2 text-[13px] tracking-normal">
            <span suppressHydrationWarning className="font-semibold tabular-nums text-v0-white">
              {citation.mentions.toLocaleString()}
            </span>
            <span className="font-medium text-v0-slate-400">mentions</span>
          </div>
        </div>
      </div>
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-v0-slate-400 hover:text-v0-white">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// 3. 메인 컴포넌트 (onReview 연결)
export function CitationsTableComponent({
  data,
  onReview,
  headerAction,
  title = "Top AI Search Citations",
  description = "Real-time tracking with optimization status"
}: {
  data?: any[];
  onReview?: (c: any) => void;
  headerAction?: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const displayData = data && data.length > 0 ? data : citations;

  return (
    <Card className="border-border/50 bg-v0-slate-900/60 transition-colors duration-150">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold tracking-normal text-v0-white">{title}</CardTitle>
            <p className="text-[13px] font-medium tracking-normal text-v0-slate-400 mt-1">{description}</p>
          </div>
          <div className="flex items-center">
            {headerAction ? headerAction : (
              <Link href="/search-visibility">
                <button className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-[13px] font-medium tracking-normal text-v0-slate-300 transition-colors hover:bg-secondary">
                  View all <ExternalLink className="h-3 w-3" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="hidden md:block overflow-hidden rounded-lg border border-border/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">Source</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">Page</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">Mentions</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">Trend</th>
                <th className="px-4 py-3.5 text-center text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">Optimization</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">Last Seen</th>
                <th className="px-4 py-3.5 text-center text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {displayData.map((citation: any) => {
                const TrendIcon = trendIcons[citation.trend];
                return (
                  <tr key={citation.id} className="transition-colors hover:bg-muted/20">
                    <td className="whitespace-nowrap px-4 py-4"><span className="text-[14px] font-semibold text-v0-white">{citation.source}</span></td>
                    <td className="px-4 py-4"><span className="text-[13px] font-medium text-v0-slate-400">{citation.page}</span></td>
                    <td className="whitespace-nowrap px-4 py-4"><span suppressHydrationWarning className="text-[14px] font-semibold tabular-nums text-v0-white">{citation.mentions.toLocaleString()}</span></td>
                    <td className="whitespace-nowrap px-4 py-4"><TrendIcon className={cn("h-4 w-4", trendColors[citation.trend])} /></td>
                    <td className="whitespace-nowrap px-4 py-4"><div className="flex justify-center"><ProgressRing progress={citation.optimizationProgress} /></div></td>
                    <td className="whitespace-nowrap px-4 py-4 text-[13px] font-medium text-v0-slate-400">{citation.lastSeen}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex justify-center">
                        <Button
                          size="sm" variant="outline"
                          className="h-7 gap-1.5 border-v0-violet-500/30 bg-v0-violet-500/10 px-2.5 text-[13px] font-semibold text-v0-violet-300 hover:bg-v0-violet-500/20"
                          onClick={() => onReview?.(citation)}
                        >
                          <Eye className="h-3 w-3" /> Review
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
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
  );
}

export default CitationsTableComponent;
