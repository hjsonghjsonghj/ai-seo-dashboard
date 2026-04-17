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
import { TableSkeleton } from "@/components/ui/table-skeleton"
import Head from "next/head"
import { useCitations } from "@/components/dashboard/citations-context"

export default function DashboardPage() {
  const { citations, markResolvedByIds } = useCitations()
  const dashboardCitations = citations
    .slice()
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 5)
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<number | null>(null)
  const [isTableLoading, setIsTableLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsTableLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("id")
    const sidebarParam = params.get("sidebar")
    if (id && sidebarParam === "true") {
      const citation = citations.find((c) => c.id === Number(id))
      if (citation) {
        setSelectedCitation(citation)
        setIsDrawerOpen(true)
      }
    }
  }, [])

  useEffect(() => {
    document.title = "Dashboard"
  }, [])

  function handleResolve(citation: any) {
    markResolvedByIds([citation.id], {
      lastSeen: new Date().toLocaleString(),
      aiContext:
        "All optimization tasks completed. Content is now fully optimized for AI search visibility with comprehensive structured data, clear examples, and proper schema implementation.",
    })
    setIsDrawerOpen(false)
    setHighlightedId(citation.id)
    setTimeout(() => setHighlightedId(null), 2000)
    toast.success("Citation marked as resolved")
  }

  return (
    <div className="min-h-screen bg-background tracking-tighter">
      <Head>
        <title>Dashboard</title>
      </Head>
      {/* Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <Sidebar />

      {/* Main Content */}
      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-2 md:gap-3">
        <Header />


        <main className="px-4 pt-2 pb-4 md:px-6 md:pt-2 md:pb-6">
          <div className="mx-auto max-w-container space-y-4 md:space-y-6">
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
                data={dashboardCitations}
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
