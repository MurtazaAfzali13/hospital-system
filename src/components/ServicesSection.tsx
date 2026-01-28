'use client'

import React, { useContext } from 'react'
import {
  HeartPulse,
  Brain,
  Microscope,
  Baby,
  Stethoscope,
  Ambulance,
} from 'lucide-react'
import { I18nContext } from '@/context/I18nContext'

// --- Types ---
type ServiceKey = 'emergency' | 'cardiology' | 'neurology' | 'laboratory' | 'pediatrics' | 'surgery';

interface ServiceItem {
  key: ServiceKey;
  icon: React.ElementType;
  // رنگ‌های نئونی برای هر آیکون
  glowColor: string; 
}

const servicesList: ServiceItem[] = [
  { key: 'emergency', icon: Ambulance, glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(248,113,113,0.5)]' }, // Red
  { key: 'cardiology', icon: HeartPulse, glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(251,113,133,0.5)]' }, // Rose
  { key: 'surgery', icon: Stethoscope, glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.5)]' }, // Blue
  { key: 'laboratory', icon: Microscope, glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.5)]' }, // Emerald
  { key: 'neurology', icon: Brain, glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(167,139,250,0.5)]' }, // Violet
  { key: 'pediatrics', icon: Baby, glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(250,204,21,0.5)]' }, // Yellow
]

export default function ServicesGrid() {
  const { t } = useContext(I18nContext)
  
  return (
    <section className="relative w-full py-24 overflow-hidden bg-[oklch(20.8%_0.042_265.755)]">
      
      {/* --- Background Effects --- */}
      {/* گرادینت کلی زمینه */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(17%_0.038_268)] via-transparent to-[oklch(24%_0.045_262)] opacity-80 pointer-events-none" />
      
      {/* توپ‌های نوری متحرک در پس‌زمینه */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-[90%] max-w-[90rem] mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
            {t('services.title')}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((item) => (
            <ServiceCard 
              key={item.key} 
              item={item} 
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Single Card Component ---
function ServiceCard({ 
  item, 
  t 
}: { 
  item: ServiceItem; 
  t: (key: string) => string 
}) {
  const Icon = item.icon

  return (
    <div className="group relative p-8 rounded-[2rem] border border-white/5 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white/[0.08] hover:border-white/10">
      
      {/* افکت نوری داخل کارت (Blob) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white/[0.05] to-transparent rounded-[2rem] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center h-full">
        
        {/* Icon Container - Centered */}
        <div className={`
          mb-6 p-5 rounded-2xl bg-white/5 text-purple-200 ring-1 ring-white/10
          transition-all duration-500 ease-out
          group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white group-hover:ring-purple-400
          ${item.glowColor}
        `}>
          <Icon size={36} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors">
          {t(`services.items.${item.key}.title`)}
        </h3>

        {/* Full Description - Always Visible */}
        <p className="text-gray-400 leading-relaxed text-sm md:text-base font-light group-hover:text-gray-200 transition-colors">
          {t(`services.items.${item.key}.desc`)}
        </p>
      </div>
    </div>
  )
}