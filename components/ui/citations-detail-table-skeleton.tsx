"use client"

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border-secondary/35 to-transparent" style={{ transform: "translateX(-100%)", animation: "citations-shimmer 1.2s ease-in-out infinite" }} />
    </div>
  )
}

export function CitationsDetailTableSkeleton({ rows = 25 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border-secondary/50 bg-surface-default p-5">
      <div className="mb-3 h-6 w-56 animate-pulse rounded bg-surface-hover/70" />

      <div className="overflow-hidden rounded-lg border border-border-secondary/50">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-secondary/50 bg-surface-default/30">
              <th className="w-10 px-3 py-3 text-center">
                <ShimmerBlock className="mx-auto h-4 w-4 rounded border border-border-primary bg-surface-hover/30" />
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <ShimmerBlock className="mx-auto h-4 w-20 rounded bg-surface-hover/35" />
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <ShimmerBlock className="mx-auto h-4 w-16 rounded bg-surface-hover/35" />
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <ShimmerBlock className="mx-auto h-4 w-24 rounded bg-surface-hover/35" />
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <ShimmerBlock className="mx-auto h-4 w-14 rounded bg-surface-hover/35" />
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <ShimmerBlock className="mx-auto h-4 w-28 rounded bg-surface-hover/35" />
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <ShimmerBlock className="mx-auto h-4 w-24 rounded bg-surface-hover/35" />
              </th>
              <th className="px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <ShimmerBlock className="mx-auto h-4 w-28 rounded bg-surface-hover/35" />
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/30">
            {Array.from({ length: rows }).map((_, idx) => (
              <tr key={idx} className="transition-colors">
                <td className="w-10 px-3 py-2.5 text-center">
                  <ShimmerBlock className="mx-auto h-4 w-4 rounded border border-border-primary bg-surface-hover/30" />
                </td>
                <td className="px-4 py-2.5">
                  <ShimmerBlock className="h-4 w-24 rounded bg-surface-hover/35" />
                </td>
                <td className="px-4 py-2.5">
                  <ShimmerBlock className="h-4 w-32 rounded bg-surface-hover/35" />
                </td>
                <td className="px-4 py-2.5">
                  <ShimmerBlock className="h-4 w-16 rounded bg-surface-hover/35" />
                </td>
                <td className="px-4 py-2.5">
                  <ShimmerBlock className="mx-auto h-4 w-4 rounded-full bg-surface-hover/35" />
                </td>
                <td className="px-4 py-2.5">
                  <ShimmerBlock className="h-4 w-20 rounded bg-surface-hover/35" />
                </td>
                <td className="px-4 py-2.5">
                  <ShimmerBlock className="h-4 w-24 rounded bg-surface-hover/35" />
                </td>
                <td className="px-4 py-2.5">
                  <ShimmerBlock className="mx-auto h-8 w-20 rounded bg-surface-hover/30" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx global>{`
        @keyframes citations-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

