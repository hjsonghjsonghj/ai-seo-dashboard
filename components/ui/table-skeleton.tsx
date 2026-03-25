"use client"

export function TableSkeleton({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="mb-3 h-6 w-56 animate-pulse rounded bg-v0-slate-800/70" />
      <div className="overflow-hidden rounded-lg border border-border/50">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={`h-${i}`} className="h-10 animate-pulse border-b border-border/50 bg-v0-slate-800/55" />
          ))}
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div
              key={`c-${i}`}
              className="h-12 animate-pulse border-b border-border/30 bg-v0-slate-900/45"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

