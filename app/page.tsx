"use client"
import CitationsTableComponent, { citationsData } from "@/components/dashboard/citations-table"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { StrategicInsights } from "@/components/dashboard/strategic-insights"
import { TrendsChart } from "@/components/dashboard/trends-chart"
import { useEffect, useState } from "react"
import { CitationDetailsDrawer } from "@/components/dashboard/citation-details-drawer"
import { toast } from "sonner"

function TableSkeleton({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-4 h-6 w-56 animate-pulse rounded bg-v0-slate-800/70" />
      <div className="overflow-hidden rounded-lg border border-border/50">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={`h-${i}`} className="h-11 animate-pulse border-b border-border/50 bg-v0-slate-800/55" />
          ))}
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div key={`c-${i}`} className="h-14 animate-pulse border-b border-border/30 bg-v0-slate-900/45" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [citations, setCitations] = useState<any[]>(
    [...citationsData].sort((a, b) => b.mentions - a.mentions).slice(0, 5)
  )
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [isTableLoading, setIsTableLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsTableLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  function handleResolve(citation: any) {
    setCitations(prev => prev.map(c =>
      c.id === citation.id
        ? { ...c, optimizationProgress: 100, trend: "up", lastSeen: "just now" }
        : c
    ))
    setIsDrawerOpen(false)
    setHighlightedId(citation.id)
    setTimeout(() => setHighlightedId(null), 2000)
    toast.success("Citation marked as resolved")
  }

  return (
    <div className="min-h-screen bg-background tracking-tighter">
      {/* Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <Sidebar />

      {/* Main Content */}
      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-4 md:gap-6">
        <Header />

        <main className="px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6">
          <div className="mx-auto max-w-[1600px] space-y-4 md:space-y-6">
            {/* Stats Row */}
            <StatCards />

            {/* Strategic Insights - Prominent position */}
            <StrategicInsights />

            {/* Chart */}
            <TrendsChart />

            {/* Desktop table & Mobile card view */}
            {isTableLoading ? (
              <TableSkeleton rows={5} cols={7} />
            ) : (
              <CitationsTableComponent
                data={citations}
                highlightedId={highlightedId}
                onReview={(citation) => {
                  setSelectedCitation(citation)
                  setIsDrawerOpen(true)
                }}
              />
            )}

            {/* Side Drawer */}
            <CitationDetailsDrawer
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
              selectedCitation={selectedCitation}
              onResolve={handleResolve}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
