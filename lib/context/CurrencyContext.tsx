'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CURRENCY_ORDER,
  type CurrencyCode,
  type CurrencyRates,
  isCurrencyCode,
} from '@/lib/currency/currency'

const CURRENCY_STORAGE_KEY = 'colliers-flex-selected-currency'
const RATES_STORAGE_KEY = 'colliers-flex-nbp-rates'

interface CurrencyContextValue {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  rates: Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'> | null
  ratesMeta: Pick<CurrencyRates, 'effectiveDate' | 'fetchedAt' | 'source'> | null
  ratesLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'PLN'
  const value = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
  return value && isCurrencyCode(value) ? value : 'PLN'
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('PLN')
  const [rates, setRates] = useState<Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'> | null>(null)
  const [ratesMeta, setRatesMeta] = useState<Pick<CurrencyRates, 'effectiveDate' | 'fetchedAt' | 'source'> | null>(null)
  const [ratesLoading, setRatesLoading] = useState(true)

  useEffect(() => {
    setCurrencyState(readStoredCurrency())

    try {
      const storedRates = window.localStorage.getItem(RATES_STORAGE_KEY)
      if (storedRates) {
        const parsed = JSON.parse(storedRates) as CurrencyRates
        if (parsed && parsed.EUR && parsed.USD && parsed.GBP) {
          setRates({ EUR: parsed.EUR, USD: parsed.USD, GBP: parsed.GBP })
          setRatesMeta({
            effectiveDate: parsed.effectiveDate,
            fetchedAt: parsed.fetchedAt,
            source: parsed.source,
          })
        }
      }
    } catch {
      // ignore invalid cache
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false

    async function loadRates() {
      try {
        const res = await fetch('/api/exchange-rates', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch rates')
        const data = (await res.json()) as CurrencyRates

        if (cancelled) return

        setRates({ EUR: data.EUR, USD: data.USD, GBP: data.GBP })
        setRatesMeta({
          effectiveDate: data.effectiveDate,
          fetchedAt: data.fetchedAt,
          source: data.source,
        })
        window.localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(data))
      } catch {
        // keep cached values if they exist; otherwise prices stay in PLN
      } finally {
        if (!cancelled) setRatesLoading(false)
      }
    }

    loadRates()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  }, [currency])

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency: setCurrencyState,
      rates,
      ratesMeta,
      ratesLoading,
    }),
    [currency, rates, ratesLoading, ratesMeta]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrencyContext() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    return {
      currency: 'PLN' as CurrencyCode,
      setCurrency: () => {},
      rates: null,
      ratesMeta: null,
      ratesLoading: true,
    }
  }
  return ctx
}

export { CURRENCY_ORDER }
