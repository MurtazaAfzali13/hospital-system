'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useDoctors } from '@/context/DoctorsContext'
import DoctorSocialIcons from "../../../../components/doctors/DoctorSocialIcons"
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import { I18nContext } from '@/context/I18nContext'

// کامپوننت BookingSection که ساختیم را import کن
import ModernBookingSection from '@/components/booking/ModernBookingSection'

export default function DoctorDetailsPage() {
    const { lang } = useContext(I18nContext)
    const { id } = useParams()
    const { getDoctorById, state } = useDoctors()
    const doctor = getDoctorById(id as string)

    const [schedules, setSchedules] = useState<any[]>([])

    useEffect(() => {
        if (!doctor?.id) return

        const fetchSchedules = async () => {
            const res = await fetch(`/api/doctors/${doctor.id}/schedules`)
            const data = await res.json()
            setSchedules(data)
        }

        fetchSchedules()
    }, [doctor?.id])

    if (state.loading || !doctor) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-300">
                Loading doctor details...
            </div>
        )
    }

    return (
        <section className="relative overflow-hidden py-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background gradients */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

            {/* Glow accents */}
            <div className="pointer-events-none absolute -top-60 -left-60 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-[160px] opacity-30" />
            <div className="pointer-events-none absolute bottom-0 -right-60 h-[480px] w-[480px] rounded-full bg-emerald-500/20 blur-[160px] opacity-25" />

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-10 mx-auto w-[90%] max-w-6xl"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* Image */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.7 }}
                        className="relative"
                    >
                        <div className="relative h-[34rem] w-full overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                            <Link href={`/${lang}/doctors/${doctor.id}/image`} scroll={false}>
                                <Image
                                    src={doctor.image_url}
                                    alt={doctor.full_name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover cursor-zoom-in cursor-pointer"
                                />
                            </Link>

                            {/* Gradient overlay */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </div>

                        {/* Image glow */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-transparent opacity-0 hover:opacity-100 transition duration-700" />
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35, duration: 0.7 }}
                        className="text-white"
                    >
                        <h1 className="text-4xl xl:text-5xl font-bold tracking-tight">
                            {doctor.full_name}
                        </h1>

                        <p className="mt-3 text-sm uppercase tracking-widest text-cyan-300">
                            {lang === 'fa' ? 'پزشک حرفه‌ای' : 'Professional Doctor'}
                        </p>

                        <p className="mt-6 max-w-xl text-gray-300 leading-relaxed">
                            {doctor.bio}
                        </p>

                        {/* 🔴 اینجا BookingSection را اضافه کن */}
                        <div className="mt-8">
                            <ModernBookingSection
                                schedules={schedules}
                                doctorId={doctor.id}
                                doctorName={doctor.full_name}
                            />
                        </div>

                        {/* Social Icons بعد از BookingSection */}
                        <div className="mt-8">
                            <DoctorSocialIcons
                                phone={doctor.phone_number}
                                instagram={doctor.instagram_url}
                                facebook={doctor.facebook_url}
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}