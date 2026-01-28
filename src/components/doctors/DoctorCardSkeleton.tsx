'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'

export default function DoctorCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="group relative h-[520px] w-[320px] overflow-hidden rounded-3xl
        bg-gradient-to-br
        from-[oklch(23%_0.045_268)]
        via-[oklch(20.8%_0.042_265.755)]
        to-[oklch(26%_0.05_260)]
        shadow-[0_30px_80px_rgba(0,0,0,0.55)]
      "
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute bottom-0 -right-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />

      {/* Advanced shimmer */}
      <div
        className="pointer-events-none absolute inset-0
        animate-[shimmer_2.8s_infinite]
        bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.12),transparent)]"
      />

      {/* Image skeleton */}
      <Skeleton className="h-full w-full rounded-3xl bg-[oklch(17%_0.03_265)]" />

      {/* Image overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

      {/* Content skeleton */}
      <div className="absolute bottom-0 z-10 w-full space-y-3 p-6">
        <Skeleton className="h-6 w-3/4 bg-[oklch(32%_0.065_260)]" />
        <Skeleton className="h-4 w-1/2 bg-[oklch(30%_0.06_265)]" />
        <Skeleton className="h-4 w-2/3 bg-[oklch(28%_0.055_270)]" />

        {/* Fake CTA */}
        <div className="pt-3 flex justify-end">
          <Skeleton className="h-4 w-24 rounded-full bg-[oklch(35%_0.09_250)]" />
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full
        bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400
        opacity-50 animate-pulse"
      />
    </motion.div>
  )
}
