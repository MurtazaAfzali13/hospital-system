'use client'

import { useDoctors } from '@/context/DoctorsContext'
import DoctorCard from './DoctorCard'
import DoctorCardSkeleton from './DoctorCardSkeleton'
import { Doctor } from '../../../types/type'
import DoctorsSearchBar from './DoctorsSearchBar'

export default function DoctorsGrid() {
  const {
    state: { filteredDoctors, loading },
  } = useDoctors()

  return (
    <section className=" relative overflow-hidden py-24 bg-[oklch(20.8%_0.042_265.755)] " >
      {/* Subtle depth gradient */}
      <div className=" pointer-events-none absolute inset-0 bg-gradient-to-br from-[oklch(17%_0.038_268)] via-[oklch(20.8%_0.042_265.755)] to-[oklch(24%_0.045_262)] " />
        <div className='mb-8'>
           <DoctorsSearchBar />
        </div>
      {/* Very soft glow accents */}
      <div
        className=" pointer-events-none absolute -top-56 -left-56 h-[520px] w-[520px] rounded-full bg-[oklch(30%_0.06_260)] blur-[160px] opacity-25 " />
      <div className=" pointer-events-none absolute bottom-0 -right-56 h-[480px] w-[480px] rounded-full bg-[oklch(28%_0.055_275)] blur-[160px] opacity-20 " />

      {/* Content */}
      <ul
        className=" relative z-10 mx-auto w-[90%] max-w-[90rem] grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-20 list-none p-0 "
      >
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}

        {!loading &&
          filteredDoctors.map((doctor:Doctor) => (
            <li key={doctor.id}>
              <DoctorCard doctor={doctor} />
            </li>
          ))}
      </ul>
    </section>
  )
}
