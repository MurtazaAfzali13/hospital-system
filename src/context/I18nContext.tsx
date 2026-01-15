'use client'

import * as React from 'react'
import type { ReactNode } from 'react'

export type Language = 'en' | 'fa'

type I18nContextType = {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

export const I18nContext = React.createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key
})

type I18nProviderProps = {
  children: ReactNode
  initialLang?: Language
  initialDict?: Record<string, any>
}

export function I18nProvider({ children, initialLang = 'en', initialDict }: I18nProviderProps) {
  const [lang, setLang] = React.useState<Language>(initialLang)
  const [dict, setDict] = React.useState<Record<string, any>>(initialDict || {})

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = dict
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return key
    }
    return value
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}
