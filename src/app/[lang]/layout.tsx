
import type { ReactNode } from 'react'
import ClientProviders from './providers'
import { Language } from '@/context/I18nContext'
import en from '@/dictionaries/en.json'
import fa from '@/dictionaries/fa.json'
import dynamic from 'next/dynamic'



import './globals.css'
import Footer from '@/components/Footer'
import NavbarClient from '@/components/NavbarClient'

const dictionaries: Record<Language, any> = { en, fa }
export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }> // params حالا Promise است
}) {
  const resolvedParams = await params; // unwrap the promise

  const safeLang: Language =
    resolvedParams.lang === 'fa' || resolvedParams.lang === 'en'
      ? resolvedParams.lang
      : 'en';

  const dict = dictionaries[safeLang];

  return (
    <html lang={safeLang} dir={dict.common.direction}>
      <body>
        <ClientProviders lang={safeLang} dict={dict}>
          <NavbarClient />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
