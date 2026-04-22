'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { getPublicMessage } from '@/lib/i18n/runtime'
import { withLocalePath } from '@/lib/i18n/routing'

const COOKIE_KEY = 'colliers-flex-cookies'

export default function CookieBanner() {
  const { locale } = useLocaleContext()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY)
      if (!stored) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function accept() {
    try { localStorage.setItem(COOKIE_KEY, 'all') } catch { /* */ }
    setVisible(false)
  }

  function reject() {
    try { localStorage.setItem(COOKIE_KEY, 'required') } catch { /* */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[var(--colliers-navy)] text-white p-4 shadow-[var(--shadow-md)]">
      <div className="container-colliers flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm flex-1 leading-relaxed">
          {getPublicMessage(locale, 'cookies.bannerText')}{' '}
          <Link href={withLocalePath(locale, '/polityka-cookies')} className="underline hover:text-white/80">
            {getPublicMessage(locale, 'cookies.policyLink')}
          </Link>.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={reject} className="text-sm text-white/82 hover:text-white underline whitespace-nowrap">
            {getPublicMessage(locale, 'cookies.reject')}
          </button>
          <button onClick={accept} className="btn-outline-white text-sm py-2 px-5 whitespace-nowrap">
            {getPublicMessage(locale, 'cookies.acceptAll')}
          </button>
          <button onClick={reject} className="text-white/78 hover:text-white" aria-label={getPublicMessage(locale, 'cookies.close')}>
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
