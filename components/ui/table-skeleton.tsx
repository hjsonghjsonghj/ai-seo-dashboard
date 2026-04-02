"use client"

export function TableSkeleton({ rows = 5, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-surface-track/50 bg-surface-default p-5">
      <div className="mb-3 h-6 w-56 animate-pulse rounded bg-surface-hover/70" />
      <div className="overflow-hidden rounded-lg border border-surface-track/50">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={`h-${i}`} className="h-10 animate-pulse border-b border-surface-track/50 bg-surface-hover/55" />
          ))}
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div
              key={`c-${i}`}
              className="h-12 animate-pulse border-b border-surface-track/30 bg-surface-default/45"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

