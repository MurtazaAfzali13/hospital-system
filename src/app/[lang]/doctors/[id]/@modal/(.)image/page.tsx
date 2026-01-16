'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDoctors } from '@/context/DoctorsContext'

export default function DoctorImageModal() {
  const { id } = useParams()
  const router = useRouter()
  const { getDoctorById, state } = useDoctors()

  const doctor = getDoctorById(id as string)

  // بستن با ESC
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [router])

  if (state.loading || !doctor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <p className="text-white animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={(e) => e.target === e.currentTarget && router.back()}
    >
      <div className="relative">
        {/* Close */}
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-white/20 text-xl text-white hover:bg-white/30"
        >
          ×
        </button>

        <Image
          src={doctor.image_url}
          alt={doctor.full_name}
          width={1200}
          height={800}
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
          className="max-h-[90vh] w-auto rounded-2xl object-contain"
        />
      </div>
    </div>
  )
}
