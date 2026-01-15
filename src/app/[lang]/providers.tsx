'use client'

import { ReactNode } from 'react'
import { DoctorsProvider } from '@/context/DoctorsContext'
import { I18nProvider, Language } from '@/context/I18nContext'

export default function ClientProviders({
  children,
  lang,
  dict,
}: {
  children: ReactNode
  lang: Language
  dict: any
}) {
  return (
    <DoctorsProvider>
      <I18nProvider initialLang={lang} initialDict={dict}>
        {children}
      </I18nProvider>
    </DoctorsProvider>
  )
}
