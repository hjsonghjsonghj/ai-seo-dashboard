"use client"
import CitationsTableComponent from "@/components/dashboard/citations-table"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { StrategicInsights } from "@/components/dashboard/strategic-insights"
import { TrendsChart } from "@/components/dashboard/trends-chart"
import CitationsTable from "@/components/dashboard/citations-table"
import { useState } from "react"
import { CitationDetailsDrawer } from "@/components/dashboard/citation-details-drawer"

export default function DashboardPage() {
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background tracking-tighter">
      {/* Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <Sidebar />

      {/* Main Content */}
      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-14">
        <Header />

        <main className="p-4 md:p-6">
          <div className="mx-auto max-w-[1600px] space-y-4 md:space-y-6">
            {/* Stats Row */}
            <StatCards />

            {/* Strategic Insights - Prominent position */}
            <StrategicInsights />

            {/* Chart */}
            <TrendsChart />

            {/* Desktop table & Mobile card view */}
            <CitationsTableComponent
              onReview={(citation) => {
                setSelectedCitation(citation);
                setIsDrawerOpen(true);
              }}
            />

            {/* Side Drawer */}
            <CitationDetailsDrawer
              open={isDrawerOpen}
              onOpenChange={setIsDrawerOpen}
              selectedCitation={selectedCitation}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
