"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Label,
} from "recharts"
import { useMediaQuery } from "@/hooks/use-media-query"

const data = [
  { date: "Jan", aiDiscovery: 2400, organicSearch: 1800, citations: 1200 },
  { date: "Feb", aiDiscovery: 2800, organicSearch: 2000, citations: 1400 },
  { date: "Mar", aiDiscovery: 3200, organicSearch: 2200, citations: 1800, event: "Google AI Update" },
  { date: "Apr", aiDiscovery: 3000, organicSearch: 2400, citations: 1600 },
  { date: "May", aiDiscovery: 4200, organicSearch: 2800, citations: 2200 },
  { date: "Jun", aiDiscovery: 4800, organicSearch: 3000, citations: 2600, event: "Competitor Launch" },
  { date: "Jul", aiDiscovery: 5200, organicSearch: 3400, citations: 2800 },
  { date: "Aug", aiDiscovery: 5800, organicSearch: 3800, citations: 3200, event: "Algorithm Shift" },
  { date: "Sep", aiDiscovery: 6200, organicSearch: 4200, citations: 3600 },
  { date: "Oct", aiDiscovery: 7000, organicSearch: 4600, citations: 4000 },
  { date: "Nov", aiDiscovery: 7400, organicSearch: 5000, citations: 4200, event: "ChatGPT Update" },
  { date: "Dec", aiDiscovery: 8200, organicSearch: 5400, citations: 4800 },
]

const events = data.filter(d => d.event).map(d => ({ date: d.date, event: d.event, value: d.aiDiscovery }))

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload) return null

  const eventItem = data.find(d => d.date === label)

  return (
    <div className="rounded-lg border border-border bg-slate-900/95 p-3 shadow-xl" role="tooltip">
      <p className="mb-2 text-sm font-medium text-white">{label}</p>
      {eventItem?.event && (
        <div className="mb-2 flex items-center gap-1.5 rounded bg-violet-500/15 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden="true" />
          <span className="text-xs font-medium text-violet-400">{eventItem.event}</span>
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-white">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TrendsChart() {
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  return (
    <Card className="border-border/50 bg-slate-900/60 transition-colors duration-150 hover:bg-slate-800/80">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold tracking-tight text-white">
            Search Visibility Trends
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monthly performance with AI event markers
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4" role="list" aria-label="Chart legend">
          <div className="flex items-center gap-2" role="listitem">
            <div className="h-2 w-2 rounded-full bg-violet-500" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">AI Discovery</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.7 0.18 220)" }} aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Organic Search</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "oklch(0.75 0.15 200)" }} aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Citations</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[320px] w-full" role="img" aria-label="Area chart showing search visibility trends over 12 months with AI event markers">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: isMobile ? 10 : 30, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="aiDiscovery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.22 285)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.65 0.22 285)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="organicSearch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.18 220)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.7 0.18 220)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="citations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.15 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="oklch(0.25 0.01 285)"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0.01 285)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(0.6 0.01 285)", fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000}K`}
                dx={-10}
              />
              {/* Event labels only on desktop */}
              {!isMobile && events.map((e) => (
                <ReferenceLine
                  key={e.date}
                  x={e.date}
                  stroke="oklch(0.5 0.15 285)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                >
                  <Label
                    value={e.event}
                    position="top"
                    fill="oklch(0.7 0.15 285)"
                    fontSize={10}
                    fontWeight={500}
                    offset={10}
                  />
                </ReferenceLine>
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="aiDiscovery"
                name="AI Discovery"
                stroke="oklch(0.65 0.22 285)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#aiDiscovery)"
              />
              <Area
                type="monotone"
                dataKey="organicSearch"
                name="Organic Search"
                stroke="oklch(0.7 0.18 220)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#organicSearch)"
              />
              <Area
                type="monotone"
                dataKey="citations"
                name="Citations"
                stroke="oklch(0.75 0.15 200)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#citations)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
