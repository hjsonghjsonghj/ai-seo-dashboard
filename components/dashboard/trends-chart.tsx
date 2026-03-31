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
import { useState, useEffect } from "react"
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
    <div className="rounded-lg border border-border bg-surface/95 p-4 shadow-xl" role="tooltip">
      <p className="mb-2 text-[14px] font-semibold tracking-normal text-white">{label}</p>
      {eventItem?.event && (
        <div className="mb-2 flex items-center gap-1.5 rounded bg-brand/15 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-soft" aria-hidden="true" />
          <span className="text-[13px] font-medium tracking-normal text-brand-faint">{eventItem.event}</span>
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-[13px]">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="font-medium tracking-normal text-dim">{entry.name}:</span>
            <span className="font-semibold tabular-nums text-white">
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

  const [chartColors, setChartColors] = useState({
    aiDiscovery: '#8b5cf6',   /* --chart-1: violet-500 */
    organicSearch: '#10b981', /* --chart-2: emerald-500 */
    citations: '#60a5fa',     /* --chart-4: blue-400 */
  })
  const [gridLine, setGridLine] = useState('#334155')   /* --chart-grid-line */
  const [axisText, setAxisText] = useState('#94a3b8')   /* --chart-axis-text */
  const [refLine, setRefLine] = useState('#7c3aed')     /* --chart-reference-line */
  const [chartLabel, setChartLabel] = useState('#a78bfa') /* --chart-label */

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement)
    setChartColors({
      aiDiscovery: rootStyles.getPropertyValue('--chart-1').trim(),
      organicSearch: rootStyles.getPropertyValue('--chart-2').trim(),
      citations: rootStyles.getPropertyValue('--chart-4').trim(),
    })
    setGridLine(rootStyles.getPropertyValue('--chart-grid-line').trim())
    setAxisText(rootStyles.getPropertyValue('--chart-axis-text').trim())
    setRefLine(rootStyles.getPropertyValue('--chart-reference-line').trim())
    setChartLabel(rootStyles.getPropertyValue('--chart-label').trim())
  }, [])

  return (
    <Card className="bg-surface/60 transition-colors duration-150">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 px-5 pt-5 pb-1.5">
        <div>
          <CardTitle className="text-lg font-semibold tracking-normal text-white">
            Search Visibility Trends
          </CardTitle>
          <p className="text-[13px] font-medium tracking-normal text-dim mt-1">
            Monthly performance with AI event markers
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4" role="list" aria-label="Chart legend">
          <div className="flex items-center gap-2" role="listitem">
            <div className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
            <span className="text-[13px] font-medium tracking-normal text-subdued">AI Discovery</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.organicSearch }} aria-hidden="true" />
            <span className="text-[13px] font-medium tracking-normal text-subdued">Organic Search</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.citations }} aria-hidden="true" />
            <span className="text-[13px] font-medium tracking-normal text-subdued">Citations</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3.5">
        <div className="h-[320px] w-full" role="img" aria-label="Area chart showing search visibility trends over 12 months with AI event markers">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: isMobile ? 10 : 30, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="aiDiscovery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.aiDiscovery} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColors.aiDiscovery} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="organicSearch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.organicSearch} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColors.organicSearch} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="citations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.citations} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColors.citations} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridLine}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisText, fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: axisText, fontSize: 12 }}
                tickFormatter={(value) => `${value / 1000}K`}
                dx={-10}
              />
              {/* Event labels only on desktop */}
              {!isMobile && events.map((e) => (
                <ReferenceLine
                  key={e.date}
                  x={e.date}
                  stroke={refLine}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                >
                  <Label
                    value={e.event}
                    position="top"
                    fill={chartLabel}
                    fontSize={12}
                    fontWeight={500}
                    offset={10}
                    style={{ letterSpacing: '0.01em' }}
                  />
                </ReferenceLine>
              ))}
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="aiDiscovery"
                name="AI Discovery"
                stroke={chartColors.aiDiscovery}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#aiDiscovery)"
              />
              <Area
                type="monotone"
                dataKey="organicSearch"
                name="Organic Search"
                stroke={chartColors.organicSearch}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#organicSearch)"
              />
              <Area
                type="monotone"
                dataKey="citations"
                name="Citations"
                stroke={chartColors.citations}
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
