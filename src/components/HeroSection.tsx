// components/HeroSection.tsx
'use client';

import { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { I18nContext } from '@/context/I18nContext';
import { usePathname } from 'next/navigation';

// تابع تولید اعداد تصادفی با seed ثابت (برای جلوگیری از خطای hydration)
function seededRandom(seed: number): () => number {
    let s = seed;
    return function () {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const { lang, t } = useContext(I18nContext);
    const pathname = usePathname();

    const currentLang = pathname.split('/')[1] || 'en';
    const isRtl = currentLang === 'fa';

    useEffect(() => {
        setIsClient(true);

        // بررسی سایز صفحه برای تشخیص موبایل/دسکتاپ
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Slides data با fallback برای زمانی که ترجمه موجود نیست
    const slides = useMemo(() => {
        const defaultSlides = [
            {
                title: "Advanced Healthcare Solutions",
                subtitle: "World-Class Medical Excellence",
                description: "Providing exceptional patient care with cutting-edge technology and compassionate professionals.",
                cta: "Book Appointment",
                secondaryCta: "Learn More",
                color: "from-blue-900/70 to-teal-800/60",
                images: {
                    desktop: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
                    mobile: "/images/hero/hero1.jpg"
                }
            },
            {
                title: "Expert Doctors & Specialists",
                subtitle: "Trusted Medical Professionals",
                description: "Our board-certified specialists are dedicated to your health and well-being with personalized care.",
                cta: "Meet Our Team",
                secondaryCta: "View Departments",
                color: "from-emerald-900/70 to-cyan-800/60",
                images: {
                    desktop: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1932&auto=format&fit=crop",
                    mobile: "/images/hero/hero2.jpg"
                }
            },
            {
                title: "24/7 Emergency Care",
                subtitle: "Always Here When You Need Us",
                description: "Our emergency department is open round the clock with state-of-the-art facilities and rapid response.",
                cta: "Emergency Contact",
                secondaryCta: "View Services",
                color: "from-rose-900/70 to-indigo-800/60",
                images: {
                    desktop: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=2070&auto=format&fit=crop",
                    mobile: "/images/hero/hero4.jpg"
                }
            }
        ];

        return defaultSlides.map((slide, index) => ({
            ...slide,
            title: t(`hero.slide${index + 1}.title`) || slide.title,
            subtitle: t(`hero.slide${index + 1}.subtitle`) || slide.subtitle,
            description: t(`hero.slide${index + 1}.description`) || slide.description,
            cta: t(`common_hero.${index === 0 ? 'bookAppointment' : index === 1 ? 'meetOurTeam' : 'emergencyContactBtn'}`) || slide.cta,
            secondaryCta: t(`common_hero.${index === 0 ? 'learnMore' : index === 1 ? 'viewDepartments' : 'viewServices'}`) || slide.secondaryCta,
            // انتخاب عکس بر اساس دستگاه
            image: isClient && isMobile ? slide.images.mobile : slide.images.desktop
        }));
    }, [t, isClient, isMobile]);

    // Floating dots با مقادیر ثابت (seed ثابت برای جلوگیری از hydration error)
    const floatingDots = useMemo(() => {
        const random = seededRandom(12345);
        return Array.from({ length: 10 }, (_, i) => ({
            id: i,
            left: random() * 100,
            top: random() * 100,
            duration: 3 + random() * 2,
            delay: random() * 2
        }));
    }, []);

    const emergencyLabel = `${t('common_hero.emergency') || 'Emergency'}: ${t('common_hero.emergencyContact') || '(123) 456-7890'}`;
    const scrollText = t('common_hero.scroll') || 'Scroll';

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    const handleDotClick = (index: number) => {
        setCurrentSlide(index);
    };

    const handleEmergencyClick = () => {
        window.location.href = 'tel:1234567890';
    };

    return (
        <section
            ref={heroRef}
            className="relative h-screen overflow-hidden"
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {/* Emergency Quick Access */}
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 w-full px-4"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEmergencyClick}
                    className="flex items-center justify-center space-x-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-lg hover:shadow-red-500/25 transition-all duration-300 w-full max-w-sm mx-auto"
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.5L18.5 8.25V15.75L12 19.5L5.5 15.75V8.25L12 4.5ZM12 7L8 11H11V16H13V11H16L12 7Z" />
                    </svg>
                    <span className="font-semibold text-sm sm:text-base truncate">{emergencyLabel}</span>
                </motion.button>
            </motion.div>

            {/* Background Slides */}
            <div className="absolute inset-0">
                {slides.map((slide, index) => (
                    <motion.div
                        key={index}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${slide.image})`,
                            willChange: 'opacity'
                        }}
                        initial={false}
                        animate={{
                            opacity: currentSlide === index ? 1 : 0,
                        }}
                        transition={{
                            opacity: { duration: 0.8, ease: "easeInOut" }
                        }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${slide.color}`} />
                    </motion.div>
                ))}
            </div>


            {/* Animated Medical Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className={`absolute top-1/4 ${isRtl ? 'right-10' : 'left-10'} text-white/20 hidden sm:block`}
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <MedicalIcon size={60} />
                </motion.div>
                <motion.div
                    className={`absolute bottom-1/3 ${isRtl ? 'left-20' : 'right-20'} text-white/15 hidden lg:block`}
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <HeartIcon size={80} />
                </motion.div>
                <motion.div
                    className={`absolute top-40 ${isRtl ? 'left-1/4' : 'right-1/4'} text-white/10 hidden md:block`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <CrossIcon size={50} />
                </motion.div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Text Content */}
                <div className="flex-1 flex items-center px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="max-w-3xl">
                            {slides.map((slide, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{
                                        opacity: currentSlide === index ? 1 : 0,
                                        y: currentSlide === index ? 0 : 30
                                    }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className={`absolute ${isRtl ? 'text-right' : 'text-left'}`}
                                >
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Animated underline */}
                                        <motion.span
                                            initial={{ width: 0 }}
                                            animate={{ width: currentSlide === index ? '100%' : 0 }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className={`block h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 mb-4 rounded-full ${isRtl ? 'ml-auto' : 'mr-auto'}`}
                                            style={{ maxWidth: '200px' }}
                                        />

                                        {/* Subtitle */}
                                        <h2 className="text-sm sm:text-base md:text-lg font-semibold text-cyan-300 mb-2 tracking-wider">
                                            {slide.subtitle}
                                        </h2>

                                        {/* Main Title */}
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                                            {slide.title}
                                        </h1>

                                        {/* Description */}
                                        <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 max-w-2xl leading-relaxed">
                                            {slide.description}
                                        </p>

                                        {/* Buttons */}
                                        <div className={`flex flex-col sm:flex-row gap-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 text-sm sm:text-base"
                                            >
                                                {slide.cta}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 text-sm sm:text-base"
                                            >
                                                {slide.secondaryCta}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Slide Dots - موقعیت اصلاح شده */}
                <div className="px-4 pb-8 sm:pb-12 md:pb-16">
                    <div className={`flex justify-center space-x-3 ${isRtl ? 'space-x-reverse' : ''}`}>
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                                    ? 'bg-cyan-400 w-8 sm:w-10'
                                    : 'bg-white/50 w-3'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            {isClient && (
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-8 ${isRtl ? 'left-8' : 'right-8'} hidden lg:block`}
                >
                    <div className="text-white/60 flex flex-col items-center">
                        <span className="text-sm mb-2">
                            {scrollText}
                        </span>
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2" />
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Floating Elements Background - فقط در کلاینت */}
            {isClient && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {floatingDots.map((dot) => (
                        <motion.div
                            key={dot.id}
                            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full hidden sm:block"
                            style={{
                                left: `${dot.left}%`,
                                top: `${dot.top}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                                duration: dot.duration,
                                repeat: Infinity,
                                delay: dot.delay,
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

const MedicalIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM12 4.5L18.5 8.25V15.75L12 19.5L5.5 15.75V8.25L12 4.5ZM12 7L8 11H11V16H13V11H16L12 7Z" />
    </svg>
);

const HeartIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
    </svg>
);

const CrossIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" />
    </svg>
);

export default HeroSection;