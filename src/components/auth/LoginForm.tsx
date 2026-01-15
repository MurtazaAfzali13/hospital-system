'use client'

import * as React from 'react'
import { useContext } from 'react'
import { I18nContext } from '@/context/I18nContext'
import { loginAction, LoginState } from './LoginActions'

const initialState: LoginState = {}

export default function LoginForm() {
  const { lang, t } = useContext(I18nContext)
  const isRTL = lang === 'fa'

  const [state, formAction, pending] =
    React.useActionState(loginAction, initialState)

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden" >
      {/* Glow background */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="absolute bottom-0 -right-40 h-[400px] w-[400px] rounded-full bg-emerald-500/20 blur-[120px]" />

      {/* Card */}
      <form
        action={formAction}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-8 space-y-6" >
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">
            {t('login.title')}
          </h2>
          <p className="text-sm text-white/60">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/70">
            {t('login.email')}
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder={t('login.email')}
            className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/70">
            {t('login.password')}
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder={t('login.password')}
            className="w-full rounded-xl bg-slate-800 border border-white/10 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
        </div>

        {/* Messages */}
        {state?.error && (
          <p className="text-sm text-red-400 text-center">
            {state.error}
          </p>
        )}

        {state?.success && (
          <p className="text-sm text-emerald-400 text-center">
            {state.success}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-semibold text-black shadow-[0_0_30px_rgba(34,211,238,0.4)] transition disabled:opacity-60" >
          <span className="relative z-10">
            {pending ? t('login.loading') : t('login.submit')}
          </span>
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-cyan-400 to-emerald-400" />
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-white/60">
          {t('login.noAccount')}{' '}
          <a
            href={`/${lang}/register`}
            className="font-medium text-cyan-400 hover:text-cyan-300 transition"
          >
            {t('login.register')}
          </a>
        </p>
      </form>
    </div>
  )
}
