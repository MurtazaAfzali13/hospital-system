'use client';

import { useContext } from 'react';
import { motion } from 'framer-motion';

import { I18nContext } from '@/context/I18nContext';
import { Building2, Target, Eye, Heart, Phone, Calendar,Users,Award,Shield } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const { t, lang } = useContext(I18nContext);
    const isRtl = lang === 'fa';

    const missionItems = [
        {
            icon: Target,
            title: t('about.mission.ourMission') || 'ماموریت ما',
            description: t('about.mission.ourMissionDesc') || 'ارائه خدمات درمانی با کیفیت، قابل دسترس و مقرون به صرفه به همه افراد جامعه'
        },
        {
            icon: Eye,
            title: t('about.mission.ourVision') || 'چشم‌انداز ما',
            description: t('about.mission.ourVisionDesc') || 'تبدیل شدن به پیشروترین مرکز درمانی منطقه تا سال ۱۴۰۵'
        },
        {
            icon: Heart,
            title: t('about.mission.ourValues') || 'ارزش‌های ما',
            description: t('about.mission.ourValuesDesc') || 'صداقت، کیفیت، همدلی و تعهد به بیمار در قلب فعالیت‌های ما قرار دارد'
        },
        {
            icon: Building2,
            title: t('about.mission.socialCommitment') || 'تعهد اجتماعی',
            description: t('about.mission.socialCommitmentDesc') || 'مشارکت در ارتقای سلامت جامعه و ارائه خدمات رایگان به نیازمندان'
        }
    ];

    const stats = [
        { value: '۱۵+', label: t('about.experienceYears') || 'سال تجربه' },
        { value: '۵۰+', label: t('about.stats.expertsLabel') || 'متخصصین' },
        { value: '۲۰۰+', label: t('about.stats.patientsLabel') || 'روزانه بیمار' },
        { value: '۹۸٪', label: t('about.stats.satisfactionLabel') || 'رضایت بیماران' }
    ];

    return (
        <div className="min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url(/images/hero/hero5.jpg)',
                        }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${isRtl ? 'from-slate-900/80 via-slate-900/60 to-slate-900/40' : 'from-slate-900/40 via-slate-900/60 to-slate-900/80'}`} />
                    </div>

                    {/* Animated Background Elements - فقط در دسکتاپ نمایش داده شود */}
                    <motion.div
                        className="absolute top-4 right-4 text-blue-300/20 md:top-10 md:right-10 lg:block hidden"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <Heart size={40} className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14" />
                    </motion.div>
                    <motion.div
                        className="absolute bottom-4 left-4 text-emerald-300/20 md:bottom-10 md:left-10 lg:block hidden"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                    >
                        <Building2 size={40} className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16" />
                    </motion.div>
                </div>

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* محتوی اصلی */}
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        {/* متن سمت چپ/راست */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 w-full"
                        >
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-xs sm:text-sm font-semibold tracking-wider text-cyan-300 bg-cyan-900/30 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full mb-4 inline-block"
                            >
                                {t('about.title') || 'درباره ما'}
                            </motion.span>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                                {t('about.title') || 'درباره'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                                    {t('about.headline.part2') || 'شفاخانه'}
                                </span>
                            </h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="text-sm sm:text-base md:text-lg text-slate-200 mb-6 sm:mb-8 leading-relaxed"
                            >
                                {t('about.description') || 'بیش از یک دهه تعهد به سلامت جامعه با ارائه خدمات درمانی مدرن و مراقبت‌های انسانی'}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                            >
                                <Link href="/appointment" className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 w-full text-sm sm:text-base"
                                    >
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>{t('common_hero.bookAppointment') || 'دریافت نوبت آنلاین'}</span>
                                    </motion.button>
                                </Link>

                                <a href="tel:02112345678" className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center justify-center gap-2 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 w-full text-sm sm:text-base"
                                    >
                                        <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>{t('common_hero.contact') || 'تماس با ما'}</span>
                                    </motion.button>
                                </a>
                            </motion.div>
                        </motion.div>

                        {/* کارت‌های آمار - در موبایل زیر محتوی، در دسکتاپ کنار آن */}
                        <div className="lg:w-1/2 w-full mt-8 lg:mt-0">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
                                        whileHover={{ y: -3 }}
                                    >
                                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs sm:text-sm md:text-base text-slate-200">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* اطلاعات اضافی - فقط در دسکتاپ */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.9 }}
                                className="mt-6 p-4 sm:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hidden lg:block"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{t('about.values.safety') || 'ایمنی و کیفیت'}</p>
                                        <p className="text-slate-300 text-sm">{t('about.values.safetyDesc')?.substring(0, 60) || 'بالاترین استانداردهای ایمنی...'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{t('about.values.care') || 'مراقبت دلسوزانه'}</p>
                                        <p className="text-slate-300 text-sm">{t('about.values.careDesc')?.substring(0, 60) || 'با دلسوزی و همدلی...'}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* ناوبری پایین - فقط در دسکتاپ */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 1 }}
                        className="hidden lg:flex justify-center mt-12 pt-8 border-t border-white/10"
                    >
                    
                    </motion.div>

                    {/* اسکرول داون - فقط در دسکتاپ */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="hidden lg:flex flex-col items-center absolute bottom-6 left-1/2 transform -translate-x-1/2"
                    >
                        <span className="text-sm text-white/60 mb-2">{t('common_hero.scroll') || 'Scroll'}</span>
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2" />
                        </div>
                    </motion.div>
                </div>

                {/* کارت‌های موبایل - در موبایل با فاصله بیشتر نمایش داده شود */}
                <div className="container mx-auto px-4 lg:hidden mt-8">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            {
                                icon: Award,
                                title: t('about.stats.expertsLabel') || 'متخصصین',
                                value: '۵۰+',
                                color: 'from-blue-500 to-cyan-500'
                            },
                            {
                                icon: Users,
                                title: t('about.stats.patientsLabel') || 'بیمار روزانه',
                                value: '۲۰۰+',
                                color: 'from-emerald-500 to-teal-500'
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
                                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                                        <item.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{item.value}</div>
                                        <div className="text-xs text-slate-200">{item.title}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
                        >
                            {t('about.mission.title') || 'ما برای سلامت شما متعهد هستیم'}
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
                        >
                            {t('about.content2') || 'شفاخانه با هدف ایجاد تحول در نظام سلامت، با ترکیب تکنولوژی پیشرفته و مراقبت‌های انسانی، محیطی امن و کارآمد برای بیماران فراهم کرده است.'}
                        </motion.p>
                    </div>

                    {/* Mission Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        {missionItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.2 }
                                }}
                                className="group relative"
                            >
                                {/* Gradient Border Effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />

                                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-100 to-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <item.icon className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>


                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 md:py-28 bg-gradient-to-r from-blue-600 to-emerald-500">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            {/* Floating Elements */}
                            <div className="relative mb-12">
                                <motion.div
                                    className="absolute -top-10 -right-10 text-white/20"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Heart size={80} />
                                </motion.div>
                                <motion.div
                                    className="absolute -bottom-10 -left-10 text-white/20"
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <Building2 size={60} />
                                </motion.div>
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                                {t('about.cta.title') || 'آماده خدمت‌رسانی به شما هستیم'}
                            </h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-lg md:text-xl text-blue-50 mb-8 max-w-2xl mx-auto leading-relaxed"
                            >
                                {t('about.cta.description') || 'برای دریافت نوبت یا مشاوره رایگان با ما تماس بگیرید'}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <a href="tel:02112345678">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:shadow-xl transition-all duration-300 min-w-[200px] ${isRtl ? 'flex-row-reverse' : ''
                                            }`}
                                    >
                                        <Phone className="w-5 h-5" />
                                        <span>{t('about.cta.phone') || 'تماس با ما: ۰۲۱-۱۲۳۴۵۶۷۸'}</span>
                                    </motion.button>
                                </a>

                                <Link href="/appointment">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 min-w-[200px]"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span>{t('about.cta.appointment') || 'دریافت نوبت آنلاین'}</span>
                                    </motion.button>
                                </Link>
                            </motion.div>

                            {/* Additional Info */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                viewport={{ once: true }}
                                className="mt-12 pt-8 border-t border-white/20"
                            >
                                <p className="text-white/80 text-sm md:text-base">
                                    {t('common_hero.emergencyService') || 'خدمات اورژانسی ۲۴/۷'} •
                                    {' '}{t('about.stats.expertsLabel') || 'متخصصین مجرب'} •
                                    {' '}{t('common_hero.support') || 'پشتیبانی'}
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Floating Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="fixed bottom-8 right-8 z-50 hidden md:block"
            >
                <div className="flex flex-col gap-3">
                    <motion.a
                        href="#top"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.a>

                    <motion.a
                        href="/appointment"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200"
                    >
                        <Calendar className="w-6 h-6" />
                    </motion.a>
                </div>
            </motion.div>
        </div>
    );
}