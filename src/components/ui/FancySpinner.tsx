'use client'

import { motion } from 'framer-motion'

export default function FancySpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="relative flex flex-col items-center gap-6">
        
        {/* Glow */}
        <div className="absolute h-32 w-32 rounded-full bg-cyan-500/30 blur-3xl" />

        {/* Spinner */}
        <motion.div
          className="relative h-16 w-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-400"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 1,
          }}
        />

        {/* Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
          }}
          className="text-sm tracking-widest text-cyan-300"
        >
          {text}
        </motion.p>
      </div>
    </div>
  )
}
