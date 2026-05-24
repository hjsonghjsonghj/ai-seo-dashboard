"use client"

import { Bell, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border-secondary/50 bg-background/80 px-4 md:px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-title-section-semibold md:text-title-page-semibold text-foreground-strong">
          Dashboard Overview
        </h1>
        <p className="hidden md:block text-body-micro-medium md:text-body-md-regular font-medium text-foreground-tertiary">
          Track your AI search visibility and performance
        </p>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            placeholder="Search metrics..."
            className="h-9 w-64 pl-10 bg-surface-hover/50 border-border-secondary placeholder:text-foreground-muted"
          />
        </div>

        {/* Date Range */}
        <Select defaultValue="30d">
          <SelectTrigger className="h-9 w-[160px] border-border-secondary bg-surface-hover/50">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-4 w-4 text-foreground-muted shrink-0" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>

        {/* Notifications */}
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 border-border-secondary bg-surface-hover/50 text-foreground-primary hover:bg-surface-hover"
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
