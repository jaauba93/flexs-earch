'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  DEFAULT_PUBLIC_LOCALE,
  PUBLIC_SITE_LOCALES,
  type PublicLocale,
} from '@/lib/i18n/messages'

const LOCALE_STORAGE_KEY = 'colliers-flex-selected-locale'
const LOCALE_COOKIE_NAME = 'colliers-flex-locale'

interface LocaleContextValue {
  locale: PublicLocale
  setLocale: (locale: PublicLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function isPublicLocale(value: string): value is PublicLocale {
  return (PUBLIC_SITE_LOCALES as readonly string[]).includes(value)
}

function readStoredLocale() {
  if (typeof window === 'undefined') return DEFAULT_PUBLIC_LOCALE
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return stored && isPublicLocale(stored) ? stored : DEFAULT_PUBLIC_LOCALE
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale: PublicLocale
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<PublicLocale>(initialLocale)

  useEffect(() => {
    setLocaleState(readStoredLocale())
  }, [])

  useEffect(() => {
    setLocaleState(initialLocale)
  }, [initialLocale])

  const setLocale = useCallback((nextLocale: PublicLocale) => {
    setLocaleState(nextLocale)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
      document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    }

    router.refresh()
  }, [router])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocaleContext() {
  const context = useContext(LocaleContext)

  if (!context) {
    return {
      locale: DEFAULT_PUBLIC_LOCALE,
      setLocale: () => {},
    }
  }

  return context
}

export { LOCALE_COOKIE_NAME }
