"use client"

import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, Bell, Search } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-lg md:text-xl font-semibold tracking-normal text-white">
          Dashboard Overview
        </h1>
        <p className="text-[13px] md:text-[14px] font-medium tracking-normal text-dim">
          Track your AI search visibility and performance
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search metrics..."
            className="h-9 w-64 rounded-lg border border-border bg-muted/30 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Date Range */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 md:gap-2 border-border bg-muted/30 text-foreground hover:bg-muted/50"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline text-xs md:text-sm">Last 30 days</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 md:h-9 md:w-9 border-border bg-muted/30 text-foreground hover:bg-muted/50"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            3
          </span>
        </Button>
      </div>
    </header>
  )
}
