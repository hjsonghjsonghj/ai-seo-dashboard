"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Rocket, Zap, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const insights = [
  {
    id: 1,
    type: "critical" as const,
    title: "Critical Action Required",
    headline: "Citation Drop Detected",
    description:
      "Your /technical-seo-checklist page has lost 23% AI citations in the last 48 hours. Immediate content refresh recommended.",
    action: "Fix Now",
    icon: AlertTriangle,
    priority: "Urgent",
  },
  {
    id: 2,
    type: "opportunity" as const,
    title: "Growth Opportunity",
    headline: "Emerging Topic Surge",
    description:
      "AI search engines are increasingly citing 'multimodal SEO' content. Your competitors lack coverage—first-mover advantage available.",
    action: "Generate Strategy",
    icon: Rocket,
    priority: "High Impact",
  },
  {
    id: 3,
    type: "optimization" as const,
    title: "Optimization Alert",
    headline: "Schema Enhancement",
    description:
      "Adding structured data to your top 5 pages could increase AI citation accuracy by an estimated 34% based on current patterns.",
    action: "Generate Strategy",
    icon: Zap,
    priority: "Medium",
  },
]

const typeStyles = {
  critical: {
    bg: "bg-v0-slate-900/60 hover:bg-v0-slate-800/80",
    badge: "bg-v0-red-500/15 text-v0-red-400",
    button: "bg-v0-red-500 hover:bg-v0-red-600 text-v0-slate-300 focus-visible:ring-v0-red-500",
    icon: "bg-v0-red-500/15 text-v0-red-400",
  },
  opportunity: {
    bg: "bg-v0-slate-900/60 hover:bg-v0-slate-800/80",
    badge: "bg-v0-violet-500/15 text-v0-violet-400",
    button: "bg-v0-violet-500 hover:bg-v0-violet-600 text-v0-slate-300 focus-visible:ring-v0-violet-500",
    icon: "bg-v0-violet-500/15 text-v0-violet-400",
  },
  optimization: {
    bg: "bg-v0-slate-900/60 hover:bg-v0-slate-800/80",
    badge: "bg-warning/15 text-warning",
    button: "bg-warning hover:bg-warning/90 text-warning-foreground focus-visible:ring-warning",
    icon: "bg-warning/15 text-warning",
  },
}

export function StrategicInsights() {
  return (
    <section className="space-y-4" aria-labelledby="insights-heading">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-v0-violet-500/15" aria-hidden="true">
          <Sparkles className="h-4 w-4 text-v0-violet-400" />
        </div>
        <div>
          <h2
            id="insights-heading"
            className="text-lg font-semibold tracking-normal text-v0-slate-300"
          >
            AI-Generated Strategic Insights
          </h2>
          <p className="text-[13px] font-medium tracking-normal text-v0-slate-400">
            Actionable recommendations powered by Peec Intelligence
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => {
          const Icon = insight.icon
          const styles = typeStyles[insight.type]

          return (
            <Card
              key={insight.id}
              className={cn(
                "cursor-pointer transition-colors duration-150 flex flex-col h-full",
                styles.bg
              )}
              role="article"
              aria-labelledby={`insight-${insight.id}-headline`}
            >
              <CardHeader className="pb-0 shrink-0 px-5 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", styles.icon)} aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-[13px] font-semibold uppercase tracking-wide text-v0-slate-400">
                        {insight.title}
                      </CardTitle>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[12px] font-semibold uppercase tracking-normal",
                      styles.badge
                    )}
                  >
                    {insight.priority}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 px-5 pb-5 pt-0">
                <div className="flex-1">
                  <h3
                    id={`insight-${insight.id}-headline`}
                    className="mb-0 text-base font-semibold tracking-normal text-v0-slate-300"
                  >
                    {insight.headline}
                  </h3>
                  <p className="text-[13px] font-medium leading-relaxed tracking-normal text-v0-slate-400">
                    {insight.description}
                  </p>
                </div>
                <Button
                  className={cn("w-full font-semibold mt-4", styles.button)}
                  size="sm"
                >
                  {insight.action}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
