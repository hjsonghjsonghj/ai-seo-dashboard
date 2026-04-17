"use client"

import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, Bell, Search } from "lucide-react"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border-secondary/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-title-section-semibold md:text-title-page-semibold text-foreground-strong">
          Dashboard Overview
        </h1>
        <p className="text-body-micro-medium md:text-body-md-regular font-medium text-foreground-tertiary">
          Track your AI search visibility and performance
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search metrics..."
            className="h-9 w-64 rounded-lg border border-border-secondary bg-surface-default/30 pl-9 pr-4 text-body-md-medium text-foreground-primary placeholder:text-foreground-muted focus:border-primary-default focus:outline-none focus:ring-1 focus:ring-primary-default"
          />
        </div>

        {/* Date Range */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 md:gap-2 border-border-secondary bg-surface-default/30 text-foreground-primary hover:bg-surface-default/50"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline text-label-xs-medium md:text-body-micro-medium">Last 30 days</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="outline"
          size="icon"
          className="relative h-8 w-8 md:h-9 md:w-9 border-border-secondary bg-surface-default/30 text-foreground-primary hover:bg-surface-default/50"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-default text-label-micro-medium leading-none text-foreground-strong">
            3
          </span>
        </Button>
      </div>
    </header>
  )
}
