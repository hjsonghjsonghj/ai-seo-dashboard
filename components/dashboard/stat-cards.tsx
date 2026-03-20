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
      className="cursor-pointer border-border/50 bg-slate-900/60 transition-colors duration-150 hover:bg-slate-800/80"
      role="article"
      aria-label={`${title}: ${value}, ${isPositive ? 'up' : 'down'} ${Math.abs(change)}% ${changeLabel}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            
            {/* Value - brighter white for emphasis */}
            <p className="text-3xl font-semibold tracking-tight text-white">
              {value}
            </p>
            
            {/* Goal with progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Goal: <span className="text-violet-400">{targetValue}{unit}</span>
                </span>
                <span className="text-xs text-slate-500">
                  ({progressPercent.toFixed(0)}%)
                </span>
              </div>
              
              {/* Progress bar */}
              <div 
                className="h-1.5 w-full rounded-full bg-slate-700"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress: ${progressPercent.toFixed(0)}% of goal`}
              >
                <div 
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            
            {/* Change indicator */}
            <div className="flex items-center gap-1.5 pt-2">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15" aria-hidden="true">
            <Icon className="h-5 w-5 text-violet-400" />
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
