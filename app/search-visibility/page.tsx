"use client"
import { CitationDetailsDrawer } from "@/components/dashboard/citation-details-drawer"
import CitationsTable, { citationsData } from "@/components/dashboard/citations-table"
import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/dashboard/sidebar"
import { toast } from "sonner"

type Citation = typeof citationsData[0]
type SortKey = "mentions" | "optimization" | "lastSeen"
type SortDirection = "asc" | "desc"

const RESOLVED_AI_CONTEXT =
  "All optimization tasks completed. Content is now fully optimized for AI search visibility with comprehensive structured data, clear examples, and proper schema implementation."

function lastSeenToSeconds(lastSeen: string): number {
  const raw = lastSeen.trim().toLowerCase()
  if (raw === "just now") return 0
  const match = raw.match(/^(\d+)\s*(min|mins|minute|minutes|hour|hours|day|days)/)
  if (!match) {
    const parsed = Date.parse(lastSeen)
    if (!Number.isNaN(parsed)) {
      return Math.max(0, Math.floor((Date.now() - parsed) / 1000))
    }
    return Number.MAX_SAFE_INTEGER
  }
  const value = Number(match[1])
  const unit = match[2]
  if (unit.startsWith("min")) return value * 60
  if (unit.startsWith("hour")) return value * 3600
  return value * 86400
}

function sortByMentionsThenRecent(a: Citation, b: Citation): number {
  if (b.mentions !== a.mentions) return b.mentions - a.mentions
  return lastSeenToSeconds(a.lastSeen) - lastSeenToSeconds(b.lastSeen)
}

export default function SearchVisibilityPage() {
  // Shared source is imported from citations-table; detail page keeps local state for resolve updates.
  const [citations, setCitations] = useState<Citation[]>(() =>
    [...citationsData].sort(sortByMentionsThenRecent)
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState("30d")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set())
  const [sortBy, setSortBy] = useState<SortKey>("mentions")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const filteredCitations = useMemo(
    () =>
      citations
        .filter((citation) => {
          const matchesSearch =
            citation.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
            citation.page.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesSource = sourceFilter === "all" || citation.source === sourceFilter
          return matchesSearch && matchesSource
        })
        .sort((a, b) => {
          // One active sort at a time; default is mentions desc.
          if (sortBy === "mentions") {
            const value = a.mentions - b.mentions
            if (value !== 0) return sortDirection === "asc" ? value : -value
            return sortByMentionsThenRecent(a, b)
          }
          if (sortBy === "optimization") {
            const value = a.optimizationProgress - b.optimizationProgress
            if (value !== 0) return sortDirection === "asc" ? value : -value
            return sortByMentionsThenRecent(a, b)
          }
          const value = lastSeenToSeconds(a.lastSeen) - lastSeenToSeconds(b.lastSeen)
          if (value !== 0) return sortDirection === "asc" ? -value : value
          return sortByMentionsThenRecent(a, b)
        }),
    [citations, searchQuery, sourceFilter, sortBy, sortDirection]
  )

  function handleSortToggle(column: SortKey) {
    if (sortBy !== column) {
      setSortBy(column)
      setSortDirection("asc")
      return
    }
    if (sortDirection === "asc") {
      setSortDirection("desc")
      return
    }
    setSortBy("mentions")
    setSortDirection("desc")
  }

  function handleToggleRow(id: number, checked: boolean) {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function handleToggleAllVisible(checked: boolean, visibleIds: number[]) {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      visibleIds.forEach((id) => {
        if (checked) next.add(id)
        else next.delete(id)
      })
      return next
    })
  }

  function handleExportSelected() {
    const selected = filteredCitations.filter((item) => selectedRows.has(item.id))
    if (selected.length === 0) return
    const report = selected
      .map((item, idx) => {
        const checklist = [
          "[✓] Add structured data markup for better AI comprehension",
          "[✓] Improve content depth with comprehensive examples",
          "[✓] Optimize meta descriptions for AI snippet extraction",
          "[✓] Include FAQ sections addressing common queries",
        ].join("\n")
        return [
          `#${idx + 1}`,
          `Source: ${item.source}`,
          `Page: ${item.page}`,
          `Mentions: ${item.mentions}`,
          `Optimization Score: ${item.optimizationProgress}%`,
          `AI Context: ${item.aiContext}`,
          "Checklist Items:",
          checklist,
        ].join("\n")
      })
      .join("\n\n---\n\n")

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `citations-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${selected.length} citations exported`)
  }

  function handleResolve(citation: Citation) {
    const now = new Date().toLocaleString()
    setCitations((prev) =>
      prev
        .map((item) =>
          item.source === citation.source && item.page === citation.page
            ? {
                ...item,
                optimizationProgress: 100,
                trend: "up",
                aiContext: RESOLVED_AI_CONTEXT,
                lastSeen: now,
              }
            : item
        )
        .sort(sortByMentionsThenRecent)
    )
    setIsDrawerOpen(false)
    setSelectedCitation(null)
    setHighlightedIds(new Set([citation.id]))
    setTimeout(() => setHighlightedIds(new Set()), 2000)
    toast.success("Citation marked as resolved")
  }

  function handleBulkResolve() {
    const selected = filteredCitations.filter((item) => selectedRows.has(item.id))
    if (selected.length === 0) return
    const confirmed = window.confirm(`Mark ${selected.length} citations as resolved?`)
    if (!confirmed) return

    const idsToUpdate = new Set(selected.map((item) => item.id))
    const now = new Date().toLocaleString()
    setCitations((prev) =>
      prev
        .map((item) =>
          idsToUpdate.has(item.id)
            ? {
                ...item,
                optimizationProgress: 100,
                trend: "up",
                aiContext:
                  "All optimization tasks completed. Content is now fully optimized for AI search visibility.",
                lastSeen: now,
              }
            : item
        )
        .sort(sortByMentionsThenRecent)
    )
    setHighlightedIds(idsToUpdate)
    setTimeout(() => setHighlightedIds(new Set()), 2000)
    setSelectedRows(new Set())
    toast.success(`${idsToUpdate.size} citations marked as resolved`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="pb-20 md:ml-16 md:pb-0 flex flex-col gap-14">
        {/* Header with Back Button */}
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="gap-2 text-slate-300 hover:text-white">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-[14px] font-medium">Back to Dashboard</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-[16px] font-semibold tracking-normal text-white">
            All AI Search Citations
          </h1>
        </header>

        <main className="px-4 md:px-6">
          <div className="mx-auto max-w-[1600px] flex flex-col gap-6">
            {/* Filter Bar */}
            <Card className="border-border/50 bg-slate-900/60">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-[16px] font-semibold tracking-normal text-white">
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Date Range */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-[160px] bg-slate-800/50 border-slate-700 text-[14px]">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d" className="text-[14px]">Last 7 days</SelectItem>
                        <SelectItem value="30d" className="text-[14px]">Last 30 days</SelectItem>
                        <SelectItem value="90d" className="text-[14px]">Last 90 days</SelectItem>
                        <SelectItem value="1y" className="text-[14px]">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700 text-[14px]">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-[14px]">All Sources</SelectItem>
                        <SelectItem value="ChatGPT" className="text-[14px]">ChatGPT</SelectItem>
                        <SelectItem value="Claude" className="text-[14px]">Claude</SelectItem>
                        <SelectItem value="Perplexity" className="text-[14px]">Perplexity</SelectItem>
                        <SelectItem value="Google AI" className="text-[14px]">Google AI</SelectItem>
                        <SelectItem value="Copilot" className="text-[14px]">Copilot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search by source or page..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-[14px] placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desktop table & Mobile card view */}
            <div className="detail-table-three-state">
              <CitationsTable
                data={filteredCitations}
                highlightedIds={highlightedIds}
                stickyHeader
                showSelectionColumn
                title="AI Search Citations"
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortToggle={handleSortToggle}
                selectedRowIds={selectedRows}
                onToggleRow={handleToggleRow}
                onToggleAllVisible={handleToggleAllVisible}
                onReview={(citation) => {
                  setSelectedCitation(citation);
                  setIsDrawerOpen(true);
                }}
                headerAction={
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium tabular-nums text-slate-300">
                      {`${filteredCitations.length} citations`}
                    </span>
                    {selectedRows.size > 0 && (
                      <span className="text-[13px] font-medium text-v0-emerald-400">
                        {selectedRows.size} items selected
                      </span>
                    )}
                  </div>
                }
              />
            </div>

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
      {selectedRows.size > 0 && (
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
          <span className="text-sm font-medium text-v0-white">{selectedRows.size} citations selected</span>
          <Button size="sm" variant="outline" onClick={handleExportSelected}>
            Export
          </Button>
          <Button size="sm" onClick={handleBulkResolve}>
            Mark as Resolved
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedRows(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}
      <style jsx global>{`
        /* Detail-page only 3-state sorting header design */
        .detail-table-three-state thead th {
          cursor: default;
        }

        /* State 2: sortable but inactive */
        .detail-table-three-state thead th button[aria-label^="Sort by"] {
          cursor: pointer;
          background: transparent;
          color: var(--v0-violet-300);
          box-shadow: none;
        }
        .detail-table-three-state thead th button[aria-label^="Sort by"] svg {
          color: var(--v0-violet-300);
        }
        .detail-table-three-state thead th button[aria-label^="Sort by"]:hover {
          color: var(--v0-white);
        }
        .detail-table-three-state thead th button[aria-label^="Sort by"]:hover svg {
          color: var(--v0-white);
        }

        /* State 1: currently selected sort column */
        .detail-table-three-state thead th button[aria-label*="currently"] {
          background: transparent;
          color: var(--v0-white);
          box-shadow: none;
        }
        .detail-table-three-state thead th button[aria-label*="currently"] svg {
          color: var(--v0-white);
        }
      `}</style>
    </div>
  )
}




