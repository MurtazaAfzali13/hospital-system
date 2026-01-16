'use client'

import { motion } from 'framer-motion'
import { Instagram, Facebook, Phone } from 'lucide-react'

interface Props {
  instagram?: string
  facebook?: string
  phone?: string
}

export default function DoctorSocialIcons({
  instagram,
  facebook,
  phone,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mt-10 flex items-center gap-4"
    >
      {phone && (
        <SocialIcon
          href={`tel:${phone}`}
          gradient="from-emerald-400 to-cyan-400"
          label="Call"
        >
          <Phone size={20} />
        </SocialIcon>
      )}

      {instagram && (
        <SocialIcon
          href={instagram}
          gradient="from-pink-500 to-purple-500"
          label="Instagram"
        >
          <Instagram size={20} />
        </SocialIcon>
      )}

      {facebook && (
        <SocialIcon
          href={facebook}
          gradient="from-blue-500 to-cyan-500"
          label="Facebook"
        >
          <Facebook size={20} />
        </SocialIcon>
      )}
    </motion.div>
  )
}

/* ---------- Reusable Icon Button ---------- */

function SocialIcon({
  href,
  gradient,
  children,
  label,
}: {
  href: string
  gradient: string
  children: React.ReactNode
  label: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      whileHover={{ scale: 1.12, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative inline-flex h-12 w-12 items-center justify-center rounded-xl
        bg-gradient-to-br ${gradient}
        text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)]
        transition-all
      `}
      aria-label={label}
    >
      {/* Glow */}
      <span className="pointer-events-none absolute inset-0 rounded-xl bg-white/20 opacity-0 blur-md transition group-hover:opacity-100" />
      {children}
    </motion.a>
  )
}
