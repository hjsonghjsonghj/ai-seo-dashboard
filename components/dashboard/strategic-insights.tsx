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
    bg: "bg-slate-900/60 hover:bg-slate-800/80",
    badge: "bg-red-500/15 text-red-400",
    button: "bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-500",
    icon: "bg-red-500/15 text-red-400",
  },
  opportunity: {
    bg: "bg-slate-900/60 hover:bg-slate-800/80",
    badge: "bg-violet-500/15 text-violet-400",
    button: "bg-violet-500 hover:bg-violet-600 text-white focus-visible:ring-violet-500",
    icon: "bg-violet-500/15 text-violet-400",
  },
  optimization: {
    bg: "bg-slate-900/60 hover:bg-slate-800/80",
    badge: "bg-amber-500/15 text-amber-400",
    button: "bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-amber-500",
    icon: "bg-amber-500/15 text-amber-400",
  },
}

export function StrategicInsights() {
  return (
    <section className="space-y-4" aria-labelledby="insights-heading">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15" aria-hidden="true">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <h2
            id="insights-heading"
            className="text-lg font-semibold tracking-tight text-white"
          >
            AI-Generated Strategic Insights
          </h2>
          <p className="text-sm text-muted-foreground">
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
                "cursor-pointer border-border/50 transition-colors duration-150 flex flex-col h-full",
                styles.bg
              )}
              role="article"
              aria-labelledby={`insight-${insight.id}-headline`}
            >
              <CardHeader className="pb-3 shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", styles.icon)} aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {insight.title}
                      </CardTitle>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      styles.badge
                    )}
                  >
                    {insight.priority}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 pb-6">
                <div className="flex-1">
                  <h3
                    id={`insight-${insight.id}-headline`}
                    className="mb-1.5 text-base font-semibold tracking-tight text-white"
                  >
                    {insight.headline}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
                <Button
                  className={cn("w-full font-medium mt-4", styles.button)}
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
