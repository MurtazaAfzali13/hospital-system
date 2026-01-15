import Image from 'next/image'
import Link from 'next/link'
import { Doctor } from '@/context/DoctorsContext'

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <article
      className=" group relative flex h-full flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(23%_0.045_268)] via-[oklch(20.8%_0.042_265.755)] to-[oklch(26%_0.05_260)] text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out hover:-translate-y-3 hover:rotate-[0.3deg]"
    >
      {/* Glow on hover */}
      <div
        className=" pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br  from-[oklch(35%_0.08_260)] to-transparent  "
      />

      {/* Header */}
      <header className="relative z-10">
        {/* Image */}
        <div className="relative h-[22rem] overflow-hidden">
          <Image
            src={doctor.image_url}
            alt={doctor.full_name}
            fill
            className="  object-cover transition duration-700 ease-out group-hover:scale-110 "
          />

          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

        {/* Header Text */}
        <div className="px-5 pt-4">
          <h2 className="text-xl font-semibold tracking-wide">
            {doctor.full_name}
          </h2>
          <p className="mt-1 text-xs uppercase tracking-widest text-cyan-300">
            Doctor
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Summary */}
        <p className="px-5 pt-4 text-sm leading-relaxed text-gray-200 line-clamp-4">
          {doctor.bio}
        </p>

        {/* Actions */}
        <div className="p-5">
          <Link
            href={`/doctors/${doctor.id}`}
            className="
              inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 bg-gradient-to-r  from-cyan-500 to-emerald-500 font-semibold text-white  transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]
            "
          >
            View Details
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="
          absolute bottom-0 left-0 h-1 w-0   bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500 group-hover:w-full
        "
      />
    </article>
  )
}
