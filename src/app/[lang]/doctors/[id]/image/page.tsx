'use client'

import { useDoctors } from '@/context/DoctorsContext'
import Image from 'next/image'
import { useParams } from 'next/navigation'

export default function DoctorImagePage() {
  const params = useParams()
  const id = params.id as string

  const { getDoctorById, state } = useDoctors()
  const doctor = getDoctorById(id)

  if (state.loading || !doctor) {
    return (
      <p className="text-center mt-10 text-gray-400">
        Loading image...
      </p>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-6">
      <Image
        src={doctor.image_url}
        alt={doctor.full_name}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 80vw"
        className="max-h-[90vh] w-auto rounded-2xl object-contain"
        priority
      />
    </div>
  )
}
