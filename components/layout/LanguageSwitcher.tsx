'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import {
  PUBLIC_SITE_LOCALE_FLAGS,
  PUBLIC_SITE_LOCALE_LABELS,
  PUBLIC_SITE_LOCALE_SHORT_LABELS,
  PUBLIC_SITE_LOCALES,
} from '@/lib/i18n/messages'
import { getPublicMessage } from '@/lib/i18n/runtime'
import { withLocalePath } from '@/lib/i18n/routing'

interface LanguageSwitcherProps {
  transparent?: boolean
}

export default function LanguageSwitcher({ transparent = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocaleContext()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
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
        aria-label={`${getPublicMessage(locale, 'header.language')}: ${PUBLIC_SITE_LOCALE_LABELS[locale]}`}
        aria-expanded={open}
      >
        <span className="text-sm leading-none">{PUBLIC_SITE_LOCALE_FLAGS[locale]}</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${transparent ? 'text-white/90 group-hover:text-white' : 'text-[var(--colliers-navy)]/80 group-hover:text-[var(--colliers-navy)]'}`}>
          {PUBLIC_SITE_LOCALE_SHORT_LABELS[locale]}
        </span>
        <ChevronDown size={16} className={`${transparent ? 'text-white' : 'text-[var(--colliers-navy)]'} transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[260px] rounded-none border border-[#dbe4f8] bg-white shadow-[0_24px_56px_rgba(0,7,89,0.16)]">
          <div className="border-b border-[#edf2fb] px-4 py-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4]">
              {getPublicMessage(locale, 'header.language')}
            </p>
            <p className="text-[11px] leading-relaxed text-body-muted">
              {locale === 'pl'
                ? 'Wybierz język interfejsu i treści ofert tam, gdzie tłumaczenia są już dostępne.'
                : locale === 'en'
                  ? 'Choose the interface language and listing content where translations are already available.'
                  : 'Оберіть мову інтерфейсу та контенту офісів там, де переклади вже доступні.'}
            </p>
          </div>

          <div className="p-2">
            {PUBLIC_SITE_LOCALES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setLocale(option)
                  const nextPath = withLocalePath(option, pathname || '/')
                  const search = searchParams?.toString()
                  setOpen(false)
                  router.push(search ? `${nextPath}?${search}` : nextPath)
                }}
                className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors ${
                  option === locale ? 'bg-[#edf3ff] text-[#000759]' : 'text-[#000759] hover:bg-[#f7faff]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base leading-none">{PUBLIC_SITE_LOCALE_FLAGS[option]}</span>
                  <div>
                    <span className="block text-sm font-semibold">{PUBLIC_SITE_LOCALE_LABELS[option]}</span>
                    <span className="block text-[11px] text-[#7a88b1]">{PUBLIC_SITE_LOCALE_SHORT_LABELS[option]}</span>
                  </div>
                </div>
                {option === locale ? <span className="text-xs font-bold text-[#1C54F4]">✓</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
