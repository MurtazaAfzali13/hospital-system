// components/Navbar.tsx
'use client'

import { useEffect, useState, useContext } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientSupabaseClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { I18nContext, Language } from '@/context/I18nContext'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const { lang, t, setLang } = useContext(I18nContext)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push(pathname.split('/').slice(0, 2).join('/') || '/en')
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }

  const changeLang = (newLang: Language) => {
    setLang(newLang)
    const newPath = pathname.replace(/^\/(en|fa)/, `/${newLang}`)
    router.push(newPath)
    setMobileMenuOpen(false)
    setLanguageDropdownOpen(false)
  }

  const isRtl = lang === 'fa'

  const navItems = [
    { name: t('navbar.home'), href: `/${lang}` },
    { name: t('navbar.doctors'), href: `/${lang}/doctors` },
    { name: t('navbar.departments'), href: `/${lang}/departments` },
    { name: t('navbar.services'), href: `/${lang}/services` },
    { name: t('common_hero.contact'), href: `/${lang}/contact` },
    { name: t('navbar.about'), href: `/${lang}/about` },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`fixed top-0 z-50 w-full transition-all duration-300
        ${scrolled
          ? 'bg-slate-900/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] border-b border-white/5'
          : 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-lg'
        }`}
    >

      {/* Emergency Bar */}
      <div className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-2 flex justify-between items-center text-sm">
          <span className="flex items-center gap-2">
            <span className="animate-pulse">🚑</span>
            {t('common_hero.emergencyService')}:
            <strong>{t('common_hero.emergencyContact')}</strong>
          </span>
          <span className="hidden md:block flex items-center gap-1">
            📍 {lang === 'fa' ? 'هرات' : 'Herat'}
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            href={`/${lang}`}
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              🏥
            </motion.div>
            <div>
              <p className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400">
                {t('navbar.hospitalName')}
              </p>
              <p className="text-xs text-cyan-400 hidden sm:block">
                {t('navbar.leadingCenter')}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex gap-6">
            {navItems.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.name} href={item.href} className="relative">
                  <span className={`text-sm font-medium transition
                    ${active ? 'text-cyan-400' : 'text-white/70 hover:text-cyan-400'}
                  `}>
                    {item.name}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-[2px]
                      bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Dropdown for Desktop */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="flex items-center gap-2 bg-slate-800 border border-white/10 text-white text-sm rounded-full px-4 py-2 hover:bg-slate-700 transition"
              >
                <span className="w-5">{lang === 'fa' ? 'فا' : 'EN'}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {languageDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 bg-slate-800 border border-white/10 rounded-lg shadow-lg min-w-[120px] z-50"
                  >
                    <button
                      onClick={() => changeLang('en')}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition ${lang === 'en' ? 'text-cyan-400' : 'text-white'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLang('fa')}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-700 transition ${lang === 'fa' ? 'text-cyan-400' : 'text-white'}`}
                    >
                      فارسی
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Section for Desktop */}
            {loading ? (
              <div className="h-10 w-24 rounded-full bg-slate-700 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-800 border border-white/10 text-white text-sm rounded-full px-4 py-2 hover:bg-slate-700 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                    <span className="text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 right-0 bg-slate-800 border border-white/10 rounded-lg shadow-lg min-w-[160px] z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{user.email}</p>
                      </div>
                      <Link
                        href={`/${lang}/profile`}
                        className="block px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        {t('navbar.profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition"
                      >
                        {t('navbar.logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={`/${lang}/login`}
                className="rounded-full px-6 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-lg hover:scale-105 transition"
              >
                {t('navbar.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button with Login Indicator */}
          <div className="lg:hidden flex items-center gap-4">
            {/* Mobile Language and Login Indicators */}
            {!loading && (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    className="flex items-center gap-1 text-white/70 hover:text-white"
                  >
                    <span className="text-sm">{lang === 'fa' ? 'فا' : 'EN'}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" />
                    </svg>
                  </button>

                  {user ? (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                      <span className="text-sm text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/${lang}/login`}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      {t('navbar.login')}
                    </Link>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 transition"
            >
              {mobileMenuOpen ? (
                <span className="text-white text-xl">✕</span>
              ) : (
                <span className="text-white text-xl">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 lg:hidden overflow-hidden"
          >
            <div className="p-4">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-1 mb-6">
                {navItems.map(item => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg transition ${active
                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-white/80 hover:text-cyan-400 hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        {active && (
                          <motion.div
                            layoutId="mobile-nav-indicator"
                            className="h-2 w-2 rounded-full bg-cyan-400"
                          />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Language Selector */}
              <div className="mb-6">
                <div className="px-4 py-2 text-sm text-white/60 mb-2">
                  {t('navbar.language')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => changeLang('en')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition ${lang === 'en'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">🇺🇸</span>
                      <span className="font-medium">English</span>
                    </div>
                  </button>
                  <button
                    onClick={() => changeLang('fa')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition ${lang === 'fa'
                      ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">🇦🇫</span>

                      <span className="font-medium">فارسی</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Mobile User Section */}
              <div className="border-t border-white/10 pt-4">
                {loading ? (
                  <div className="h-12 rounded-lg bg-slate-800 animate-pulse" />
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user.email}</p>
                        <p className="text-xs text-white/60">{t('navbar.loggedIn')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/${lang}/profile`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 text-center rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition"
                      >
                        {t('navbar.profile')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-3 text-center rounded-lg bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 hover:bg-red-500/30 transition border border-red-500/30"
                      >
                        {t('navbar.logout')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href={`/${lang}/login`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 text-center rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-medium hover:opacity-90 transition"
                    >
                      {t('navbar.login')}
                    </Link>
                    <Link
                      href={`/${lang}/register`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-3 text-center rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition"
                    >
                      {t('navbar.register')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Emergency Contact in Mobile Menu */}
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-cyan-600/20 to-emerald-600/20 border border-cyan-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl animate-pulse">🚑</span>
                  <span className="font-medium text-white">{t('common_hero.emergency')}</span>
                </div>
                <button
                  onClick={() => {
                    window.location.href = 'tel:1234567890';
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:opacity-90 transition"
                >
                  {t('common_hero.emergencyContact')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}