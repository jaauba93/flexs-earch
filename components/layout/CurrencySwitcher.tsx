'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  CURRENCY_LABELS,
  CURRENCY_NOTE,
  CURRENCY_ORDER,
  CURRENCY_SHORT_LABELS,
  type CurrencyCode,
} from '@/lib/currency/currency'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'

interface CurrencySwitcherProps {
  transparent?: boolean
}

export default function CurrencySwitcher({ transparent = false }: CurrencySwitcherProps) {
  const { currency, setCurrency, rates, ratesLoading, ratesMeta } = useCurrencyContext()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function selectCurrency(next: CurrencyCode) {
    setCurrency(next)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative flex items-center gap-2 px-4 py-3 transition-all group ${
          transparent
            ? 'border border-white/30 text-white hover:bg-white/8 hover:border-white/55'
            : 'border border-[var(--colliers-navy)]/20 hover:bg-[var(--colliers-navy)]/5 hover:border-[var(--colliers-navy)]/40 text-[var(--colliers-navy)]'
        }`}
        aria-label={`Waluta: ${CURRENCY_LABELS[currency]}`}
        aria-expanded={open}
      >
        <span className={`text-[10px] font-bold uppercase tracking-widest ${transparent ? 'text-white/90 group-hover:text-white' : 'text-[var(--colliers-navy)]/80 group-hover:text-[var(--colliers-navy)]'}`}>
          {CURRENCY_SHORT_LABELS[currency]}
        </span>
        <ChevronDown size={16} className={`${transparent ? 'text-white' : 'text-[var(--colliers-navy)]'} transition-transform ${open ? 'rotate-180' : ''}`} />
        {!ratesLoading && ratesMeta && currency !== 'PLN' && (
          <span className={`absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${transparent ? 'bg-white text-[#000759]' : 'bg-[#1C54F4] text-white'}`}>
            ✓
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] rounded-none border border-[#dbe4f8] bg-white shadow-[0_24px_56px_rgba(0,7,89,0.16)] z-50">
          <div className="px-4 py-3 border-b border-[#edf2fb]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4] mb-1">Waluta</p>
            <p className="text-[11px] leading-relaxed text-body-muted">
              {CURRENCY_NOTE}
            </p>
          </div>

          <div className="p-2">
            {CURRENCY_ORDER.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => selectCurrency(option)}
                className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors ${
                  option === currency
                    ? 'bg-[#edf3ff] text-[#000759]'
                    : 'text-[#000759] hover:bg-[#f7faff]'
                }`}
              >
                <div>
                  <span className="block text-sm font-semibold">{CURRENCY_LABELS[option]}</span>
                  {option !== 'PLN' && rates ? (
                    <span className="block text-[11px] text-[#7a88b1]">
                      Kurs NBP: 1 {option} = {rates[option].toLocaleString('pl-PL', { maximumFractionDigits: 4 })} PLN
                    </span>
                  ) : option === 'PLN' ? (
                    <span className="block text-[11px] text-[#7a88b1]">Cena źródłowa w złotówkach</span>
                  ) : (
                    <span className="block text-[11px] text-[#7a88b1]">Ładowanie kursu NBP…</span>
                  )}
                </div>
                {option === currency && <span className="text-[#1C54F4] text-xs font-bold">Aktywna</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
