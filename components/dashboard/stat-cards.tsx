"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, HeartPulse, Target, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  targetValue: number
  currentValue: number
  icon: React.ElementType
  unit?: string
}

function StatCard({ title, value, change, changeLabel, targetValue, currentValue, icon: Icon, unit = "%" }: StatCardProps) {
  const isPositive = change >= 0
  const progressPercent = Math.min((currentValue / targetValue) * 100, 100)

  return (
    <Card
      className="cursor-pointer bg-surface-default/60 transition-colors duration-150 hover:bg-surface-hover/80"
      role="article"
      aria-label={`${title}: ${value}, ${isPositive ? 'up' : 'down'} ${Math.abs(change)}% ${changeLabel}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <p className="text-body-sm font-medium tracking-normal text-foreground-secondary">{title}</p>
            <p className="text-3xl font-bold tracking-normal tabular-nums text-foreground-strong">{value}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-default/15">
            <Icon className="h-5 w-5 text-brand-soft" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-1.5 text-body-sm">
            <span className="font-medium tracking-normal text-foreground-tertiary">Goal:</span>
            <span className="font-semibold tabular-nums text-brand-faint">{targetValue}{unit}</span>
            <span className="font-medium tabular-nums text-foreground-tertiary">({Math.round(progressPercent)}%)</span>
          </div>

          <div className="h-2 w-full rounded-full bg-border-secondary ring-1 ring-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-default shadow-[0_0_8px_rgba(139,92,246,0.3)] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-positive-soft" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-danger-soft" />
            )}
            <span className={cn("text-body-sm font-bold tabular-nums", isPositive ? "text-positive-soft" : "text-danger-soft")}>
              {isPositive ? "+" : ""}{change}%
            </span>
            <span className="text-body-sm font-medium tracking-normal text-foreground-tertiary">{changeLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCards() {
  const stats = [
    {
      title: "AI Share of Voice",
      value: "34.2%",
      change: 12.5,
      changeLabel: "vs last month",
      targetValue: 40,
      currentValue: 34.2,
      unit: "%",
      icon: Activity,
    },
    {
      title: "Content Health Score",
      value: "87",
      change: 8.3,
      changeLabel: "improvement",
      targetValue: 95,
      currentValue: 87,
      unit: "",
      icon: HeartPulse,
    },
    {
      title: "Citation Accuracy",
      value: "92.4%",
      change: -2.1,
      changeLabel: "this week",
      targetValue: 98,
      currentValue: 92.4,
      unit: "%",
      icon: Target,
    },
    {
      title: "Projected Growth",
      value: "+23.8%",
      change: 15.7,
      changeLabel: "next quarter",
      targetValue: 30,
      currentValue: 23.8,
      unit: "%",
      icon: Rocket,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="region" aria-label="Key metrics">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
