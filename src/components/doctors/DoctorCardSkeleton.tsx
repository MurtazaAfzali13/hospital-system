"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function DoctorCardSkeleton() {
  return (
    <div
      className=" group relative h-[520px] w-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-[oklch(23%_0.045_268)] via-[oklch(20.8%_0.042_265.755)] to-[oklch(26%_0.05_260)] shadow-[0_25px_60px_rgba(0,0,0,0.45)] "
    >
      {/* Animated shimmer layer */}
      <div
        className=" pointer-events-none absolute inset-0 animate-[shimmer_2.5s_infinite] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.08),transparent)] "
      />

      {/* Image skeleton */}
      <Skeleton
        className=" h-full w-full rounded-3xl bg-[oklch(18%_0.03_265)] "
      />

      {/* Overlay gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Text skeletons */}
      <div className="absolute bottom-0 z-10 w-full space-y-3 p-6">
        <Skeleton
          className=" h-6 w-3/4 bg-[oklch(30%_0.06_260)]
            animate-pulse
          "
        />
        <Skeleton
          className="h-4 w-1/2 bg-[oklch(28%_0.055_265)] animate-pulse"
        />
        <Skeleton
          className="h-4 w-2/3 bg-[oklch(26%_0.05_270)] animate-pulse"
        />
      </div>

      {/* Bottom animated accent */}
      <div
        className="  pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-40 animate-pulse"
      />
    </div>
  )
}
