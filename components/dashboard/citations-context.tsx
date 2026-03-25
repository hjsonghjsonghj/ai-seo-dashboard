"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { citationsData } from "@/components/dashboard/citations-table"

type Citation = (typeof citationsData)[number]

type CitationsContextValue = {
  citations: Citation[]
  markResolvedByIds: (ids: number[], payload: { lastSeen: string; aiContext: string }) => void
}

const CitationsContext = createContext<CitationsContextValue | null>(null)

export function CitationsProvider({ children }: { children: React.ReactNode }) {
  const [citations, setCitations] = useState<Citation[]>(() => [...citationsData])

  const value = useMemo<CitationsContextValue>(() => {
    return {
      citations,
      markResolvedByIds: (ids, payload) => {
        setCitations((prev) =>
          prev.map((c) =>
            ids.includes(c.id)
              ? {
                  ...c,
                  optimizationProgress: 100,
                  trend: "up",
                  aiContext: payload.aiContext,
                  lastSeen: payload.lastSeen,
                }
              : c
          )
        )
      },
    }
  }, [citations])

  return <CitationsContext.Provider value={value}>{children}</CitationsContext.Provider>
}

export function useCitations() {
  const ctx = useContext(CitationsContext)
  if (!ctx) throw new Error("useCitations must be used within CitationsProvider")
  return ctx
}

