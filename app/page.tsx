import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { StrategicInsights } from "@/components/dashboard/strategic-insights"
import { TrendsChart } from "@/components/dashboard/trends-chart"
import { CitationsTable } from "@/components/dashboard/citations-table"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background tracking-tighter">
      {/* Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <Sidebar />

      {/* Main Content */}
      <div className="pb-20 md:ml-16 md:pb-0">
        <Header />
        
        <main className="p-4 md:p-6">
          <div className="mx-auto max-w-[1600px] space-y-4 md:space-y-6">
            {/* Stats Row */}
            <StatCards />

            {/* Strategic Insights - Prominent position */}
            <StrategicInsights />

            {/* Chart */}
            <TrendsChart />

            {/* Citations Table */}
            <CitationsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
