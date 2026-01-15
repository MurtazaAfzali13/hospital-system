'use client'

import { useDoctors } from '@/context/DoctorsContext'
import { useContext, useEffect, useState } from 'react'
import { I18nContext } from '@/context/I18nContext'

const DoctorsSearchBar = () => {
  const { dispatch } = useDoctors()
  const [value, setValue] = useState('')
  const { lang, t } = useContext(I18nContext)

  const isRtl = lang === 'fa'

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch({
        type: 'SEARCH',
        payload: value.trim(),
      })
    }, 300)

    return () => clearTimeout(handler)
  }, [value, dispatch])

  return (
    <div
      className="relative mx-auto mt-10 w-[90%] max-w-xl"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-[oklch(35%_0.08_265)] blur-2xl opacity-20" />

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('search_doctor_placeholder')}
        className="
          w-full rounded-xl border border-white/10
          bg-[oklch(18%_0.04_265)]
          px-5 py-4 text-white
          placeholder-white/40
          shadow-lg backdrop-blur
          focus:outline-none focus:ring-2 focus:ring-[oklch(65%_0.15_255)]
        "
      />

      {value && (
        <button
          onClick={() => setValue('')}
          className={`absolute top-1/2 -translate-y-1/2 text-white/40 hover:text-white ${
            isRtl ? 'left-4' : 'right-4'
          }`}
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default DoctorsSearchBar
