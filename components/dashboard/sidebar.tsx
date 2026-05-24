"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Eye,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: LayoutDashboard, label: "Overview",      href: "/" },
  { icon: Eye,             label: "AI Visibility", href: "/ai-visibility" },
  { icon: FileText,        label: "Content Ops",   href: null },
  { icon: Settings,        label: "Settings",      href: null },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col border-r border-border-secondary bg-background md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border-secondary">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-default">
            <Sparkles className="h-5 w-5 text-foreground-strong" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-2 px-2 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href ? pathname === item.href : false
            const className = cn(
              "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
              isActive
                ? "bg-surface-hover text-primary-default"
                : item.href
                  ? "text-foreground-muted hover:bg-surface-hover hover:text-foreground-secondary"
                  : "text-foreground-muted/40 cursor-not-allowed"
            )
            const inner = (
              <>
                <Icon className="h-5 w-5" />
                <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md bg-background px-2 py-1 text-label-xs-medium text-foreground-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -left-2 h-5 w-1 rounded-r-full bg-primary-default" aria-hidden="true" />
                )}
              </>
            )
            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={className}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {inner}
              </Link>
            ) : (
              <span
                key={item.label}
                className={className}
                aria-label={item.label}
                aria-disabled="true"
              >
                {inner}
              </span>
            )
          })}
        </nav>

        {/* User */}
        <div className="flex flex-col items-center gap-2 border-t border-border-secondary px-2 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-hover text-body-md-medium text-foreground-secondary">
            PA
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border-secondary bg-background/95 backdrop-blur-sm md:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href ? pathname === item.href : false
          const className = cn(
            "relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors",
            isActive
              ? "text-primary-default"
              : item.href
                ? "text-foreground-muted"
                : "text-foreground-muted/40"
          )
          const inner = (
            <>
              <Icon className="h-5 w-5" />
              <span className="text-label-micro-medium font-semibold">{item.label}</span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary-default" aria-hidden="true" />
              )}
            </>
          )
          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={className}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {inner}
            </Link>
          ) : (
            <span
              key={item.label}
              className={className}
              aria-label={item.label}
              aria-disabled="true"
            >
              {inner}
            </span>
          )
        })}
      </nav>
    </>
  )
}
