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
  }

  const changeLang = (newLang: Language) => {
    setLang(newLang)
    const newPath = pathname.replace(/^\/(en|fa)/, `/${newLang}`)
    router.push(newPath)
    setMobileMenuOpen(false)
  }

  const isRtl = lang === 'fa'

  const navItems = [
    { name: t('navbar.home'), href: `/${lang}` },
    { name: t('navbar.doctors'), href: `/${lang}/doctors` },
    { name: t('navbar.departments'), href: `/${lang}/departments` },
    { name: t('navbar.services'), href: `/${lang}/services` },
    { name: t('common_hero.contact'), href: `/${lang}/contact` },
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
        <div className="mx-auto max-w-7xl px-4 py-2 flex justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="animate-pulse">🚑</span>
            {t('common_hero.emergencyService')}:
            <strong>{t('common_hero.emergencyContact')}</strong>
          </span>
          <span className="hidden md:block">
            📍 {lang === 'fa' ? 'هرات' : 'Herat'}
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-[0_0_30px_rgba(34,211,238,0.4)]" >
              🏥
            </motion.div>
            <div>
              <p className="text-lg font-bold text-white group-hover:text-cyan-400">
                {t('navbar.hospitalName')}
              </p>
              <p className="text-xs text-cyan-400">
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

          {/* Right */}
          <div className="hidden lg:flex items-center gap-4">
            <select
              value={lang}
              onChange={e => changeLang(e.target.value as Language)}
              className="bg-slate-800 border border-white/10 text-white text-sm rounded-full px-4 py-2 focus:ring-2 focus:ring-cyan-500" >
              <option value="en">EN</option>
              <option value="fa">FA</option>
            </select>

            {loading ? (
              <div className="h-10 w-24 rounded-full bg-slate-700 animate-pulse" />
            ) : user ? (
              <button
                onClick={handleLogout}
                className="rounded-full px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 transition" >
                {t('navbar.logout')}
              </button>
            ) : (
              <Link
                href={`/${lang}/login`}
                className="rounded-full px-6 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-lg hover:scale-105 transition" >
                {t('navbar.login')}
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col p-4 gap-3">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 hover:text-cyan-400 transition"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
