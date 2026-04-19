'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react'
import BasketDropdown from '@/components/comparator/BasketDropdown'
import CurrencySwitcher from '@/components/layout/CurrencySwitcher'

const cities = [
  { label: 'Warszawa', slug: 'warszawa' },
  { label: 'Kraków', slug: 'krakow' },
  { label: 'Wrocław', slug: 'wroclaw' },
  { label: 'Trójmiasto', slug: 'trojmiasto' },
  { label: 'Poznań', slug: 'poznan' },
  { label: 'Katowice', slug: 'katowice' },
  { label: 'Łódź', slug: 'lodz' },
]

interface HeaderProps {
  onOpenForm?: () => void
  onOpenWizard?: () => void
  transparent?: boolean
  overlay?: boolean
}

const guideBasics = [
  { label: 'Czym są biura elastyczne', href: '/podstawy-flex/czym-sa-biura-elastyczne' },
  { label: 'Modele biur elastycznych', href: '/podstawy-flex/modele-biur-elastycznych' },
  { label: 'Kiedy warto wybrać flex', href: '/podstawy-flex/kiedy-warto-wybrac-flex' },
  { label: 'Flex a najem tradycyjny', href: '/podstawy-flex/flex-a-najem-tradycyjny' },
  { label: 'Jak wybrać biuro flex', href: '/podstawy-flex/jak-wybrac-biuro-flex' },
]

const guideCities = [
  { label: 'Warszawa', href: '/raporty-miejskie/warszawa' },
  { label: 'Kraków', href: '/raporty-miejskie/krakow' },
  { label: 'Wrocław', href: '/raporty-miejskie/wroclaw' },
  { label: 'Trójmiasto', href: '/raporty-miejskie/trojmiasto' },
  { label: 'Poznań', href: '/raporty-miejskie/poznan' },
  { label: 'Łódź', href: '/raporty-miejskie/lodz' },
  { label: 'Katowice', href: '/raporty-miejskie/katowice' },
]

const guideTools = [
  { label: 'Kalkulator kosztów', href: '/kalkulator-flex' },
  { label: 'Dobierz model biura', href: '/porownaj#porownanie-modeli' },
  { label: 'Baza wiedzy', href: '/podstawy-flex' },
]

const menuMotionClass =
  'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'

export default function Header({ onOpenForm, onOpenWizard, transparent = false, overlay = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<'search' | 'guide' | 'why' | null>(null)
  const [activeMenu, setActiveMenu] = useState<'search' | 'guide' | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!mobileOpen) {
      setMobileSection(null)
    }
  }, [mobileOpen])

  function openMenu(menu: 'search' | 'guide') {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setActiveMenu(menu)
  }

  function scheduleClose() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setActiveMenu(null)
      closeTimerRef.current = null
    }, 300)
  }

  return (
    <header
      className={`${overlay ? 'fixed left-0 top-0 w-full' : 'sticky top-0'} z-40 h-20 transition-all duration-300 ${
        transparent
          ? 'bg-transparent border-b border-white/10 shadow-none'
          : `nav-glass ${scrolled ? 'shadow-[0_2px_24px_rgba(0,7,89,0.1)]' : 'border-b border-[#000759]/6'}`
      }`}
    >
      {/* Keyline gradient — top border that shifts color slightly on scroll */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, #000759 0%, #1C54F4 40%, #4D93FF 70%, #000759 100%)',
          opacity: transparent ? 0.25 : (scrolled ? 0.7 : 0.25),
        }}
      />

      <div className="w-full px-8 lg:px-16 flex justify-between items-center h-full">

        {/* Logo */}
        <div className="flex items-center gap-12 h-full">
          <Link href="/" className="flex items-center h-full py-4 flex-shrink-0">
            <Image
              src={transparent ? '/images/logo-light.png' : '/images/logo-dark.png'}
              alt="Colliers Flex"
              width={120}
              height={120}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex gap-10 items-center h-full"
            style={{ marginLeft: 'max(1.75rem, calc(((100vw - var(--container-max)) / 2) - 7.5rem))' }}
          >
            <div
              className="relative h-full flex items-center after:absolute after:content-[''] after:left-0 after:right-0 after:top-full after:h-4"
              onMouseEnter={() => openMenu('search')}
              onMouseLeave={scheduleClose}
            >
              <Link
                href="/biura-serwisowane"
                className="nav-link active flex items-center gap-1.5 h-full border-b-2 border-[#1C54F4] opacity-100"
                style={transparent ? { color: '#ffffff' } : undefined}
              >
                Wyszukaj
                <ChevronDown
                  size={13}
                  className={`${menuMotionClass} ${activeMenu === 'search' ? 'rotate-180' : ''}`}
                />
              </Link>

              {/* Dropdown — styled with brand block: Dark Blue bg */}
              <div
                className={`absolute top-full left-0 z-50 min-w-[260px] ${menuMotionClass} ${
                  activeMenu === 'search'
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-3 opacity-0'
                }`}
                onMouseEnter={() => openMenu('search')}
                onMouseLeave={scheduleClose}
              >
                <div
                  className="mt-3 overflow-hidden border border-[#dfe5f2] bg-white shadow-[0_24px_64px_rgba(0,7,89,0.14)]"
                  style={{
                    transformOrigin: 'top left',
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, #1C54F4, #4D93FF, transparent)' }}
                  />

                  <p className="px-6 pt-5 pb-3 text-[11px] font-bold uppercase text-[#1C54F4]" style={{ letterSpacing: '0.24em' }}>
                    Biura w Polsce
                  </p>

                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/biura-serwisowane/${c.slug}`}
                      className="flex items-center px-6 py-3 text-[0.98rem] font-normal text-[#222c4d] hover:bg-[#f5f8ff] hover:text-[#1C54F4] transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}

                  <div className="border-t border-[#f2f4f6] mt-2 pt-2">
                    <Link
                      href="/biura-serwisowane"
                      className="flex items-center gap-3 px-6 py-3 text-[11px] font-bold uppercase text-[#1C54F4] hover:bg-[#EDF2FF] transition-colors"
                      style={{ letterSpacing: '0.2em' }}
                    >
                      Wszystkie lokalizacje →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => openMenu('guide')}
              onMouseLeave={scheduleClose}
            >
              <Link
                href="/przewodnik-flex"
                className={`nav-link h-full flex items-center gap-1.5 ${activeMenu === 'guide' ? 'opacity-100 border-b-2 border-[#1C54F4]' : ''}`}
                style={transparent ? { color: '#ffffff', opacity: activeMenu === 'guide' ? 1 : 0.9 } : undefined}
              >
                Przewodnik flex
                <ChevronDown
                  size={13}
                  className={`${menuMotionClass} ${activeMenu === 'guide' ? 'rotate-180' : ''}`}
                />
              </Link>
            </div>

            <button
              type="button"
              className="nav-link h-full flex items-center"
              style={transparent ? { color: '#ffffff', opacity: 0.9 } : undefined}
            >
              Dlaczego z Colliers
            </button>
          </nav>
        </div>

        {/* Right: Compare + CTA */}
        <div className="hidden lg:flex items-center gap-6">
          <BasketDropdown onOpenForm={onOpenForm} variant="desktop" transparent={transparent} />
          <CurrencySwitcher transparent={transparent} />
          <button onClick={onOpenForm} className={transparent ? 'btn-primary-bright' : 'btn-primary'}>
            Otrzymaj ofertę
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex lg:hidden items-center gap-4">
          <BasketDropdown onOpenForm={onOpenForm} transparent={transparent} />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className={`p-2 ${transparent ? 'text-white' : 'text-[#000759]'}`}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-[#e7e8ea] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fd_100%)] max-h-[calc(100dvh-5rem)] overflow-y-auto"
          style={{ boxShadow: '0 10px 34px rgba(0,7,89,0.12)' }}
        >
          <div className="px-8 py-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setMobileSection((current) => (current === 'search' ? null : 'search'))}
              className="flex items-center justify-between border border-[#e3e9f6] bg-white px-4 py-3 text-left text-[11px] font-bold uppercase text-[#000759] shadow-[0_12px_26px_rgba(0,7,89,0.05)]"
              style={{ letterSpacing: '0.14em' }}
              aria-expanded={mobileSection === 'search'}
            >
              <span>Wyszukaj</span>
              <ChevronDown size={14} className={`transition-transform ${mobileSection === 'search' ? 'rotate-180' : ''}`} />
            </button>
            {mobileSection === 'search' && (
              <div className="pl-3 pr-1 pb-2">
                <div className="eyebrow-label mb-3 text-[9px]">
                  Biura w Polsce
                </div>
                <div className="flex flex-col">
                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/biura-serwisowane/${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="list-none py-2 pl-0 text-[11px] font-bold uppercase text-[#000759] hover:text-[#1C54F4] transition-colors before:content-none"
                      style={{ letterSpacing: '0.14em' }}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/biura-serwisowane"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex text-[11px] font-bold uppercase text-[#1C54F4]"
                  style={{ letterSpacing: '0.14em' }}
                >
                  Wszystkie lokalizacje →
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileSection((current) => (current === 'guide' ? null : 'guide'))}
              className="flex items-center justify-between border border-[#e3e9f6] bg-white px-4 py-3 text-left text-[11px] font-bold uppercase text-[#000759] shadow-[0_12px_26px_rgba(0,7,89,0.05)]"
              style={{ letterSpacing: '0.14em' }}
              aria-expanded={mobileSection === 'guide'}
            >
              <span>Przewodnik flex</span>
              <ChevronDown size={14} className={`transition-transform ${mobileSection === 'guide' ? 'rotate-180' : ''}`} />
            </button>
            {mobileSection === 'guide' && (
              <div className="pl-3 pr-1 pb-2 space-y-4">
                <div>
                  <p className="eyebrow-label mb-3 text-[9px]">
                    Podstawy flex
                  </p>
                  <div className="flex flex-col">
                    {guideBasics.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="py-1.5 pl-0 text-[11px] font-bold uppercase text-[#000759] hover:text-[#1C54F4] transition-colors before:content-none"
                        style={{ letterSpacing: '0.12em' }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow-label mb-3 text-[9px]">
                    Raporty miejskie
                  </p>
                  <div className="flex flex-col">
                    {guideCities.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="list-none py-1.5 pl-0 text-[11px] font-bold uppercase text-[#000759] hover:text-[#1C54F4] transition-colors before:content-none"
                        style={{ letterSpacing: '0.12em' }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="eyebrow-label mb-3 text-[9px]">
                    Narzędzia
                  </p>
                  <div className="flex flex-col gap-1">
                    {guideTools.map((item) =>
                      item.label === 'Dobierz model biura' && onOpenWizard ? (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => { onOpenWizard(); setMobileOpen(false) }}
                          className="py-1.5 pl-0 text-left text-[11px] font-bold uppercase text-[#000759] hover:text-[#1C54F4] transition-colors before:content-none"
                          style={{ letterSpacing: '0.12em' }}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="py-1.5 text-[11px] font-bold uppercase text-[#000759] hover:text-[#1C54F4] transition-colors"
                          style={{ letterSpacing: '0.12em' }}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileSection((current) => (current === 'why' ? null : 'why'))}
              className="flex items-center justify-between border border-[#e3e9f6] bg-white px-4 py-3 text-left text-[11px] font-bold uppercase text-[#000759] shadow-[0_12px_26px_rgba(0,7,89,0.05)]"
              style={{ letterSpacing: '0.14em' }}
              aria-expanded={mobileSection === 'why'}
            >
              <span>Dlaczego z Colliers</span>
              <ChevronDown size={14} className={`transition-transform ${mobileSection === 'why' ? 'rotate-180' : ''}`} />
            </button>
            {mobileSection === 'why' && (
              <div className="px-4 py-3 text-sm text-body-muted leading-relaxed border border-[#e3e9f6] bg-white/80">
                Colliers łączy wiedzę rynkową, narzędzia decyzyjne i wsparcie doradców, żeby szybciej zawęzić wybór i przygotować realną ofertę.
              </div>
            )}
            <button
              onClick={() => { onOpenForm?.(); setMobileOpen(false) }}
              className="btn-primary mt-4 w-full justify-center"
            >
              Otrzymaj ofertę
            </button>
          </div>
        </div>
      )}

      <div
        className={`absolute left-0 right-0 top-full z-[60] hidden lg:block ${menuMotionClass} ${
          activeMenu === 'guide'
            ? 'pointer-events-auto opacity-100 translate-y-0'
            : 'pointer-events-none opacity-0 -translate-y-4'
        }`}
        onMouseEnter={() => openMenu('guide')}
        onMouseLeave={scheduleClose}
      >
        <div className="border-t border-[#e7e8ea] bg-white shadow-[0_28px_80px_rgba(0,7,89,0.14)]">
          <div className="container-colliers">
            <div className="grid grid-cols-[1fr_3fr]">
              <div className="border-r border-[#e7e8ea] py-16 pr-12">
                <p className="font-serif text-[3rem] leading-none text-[#000759] mb-6">Przewodnik flex</p>
                <p className="max-w-md text-[1.05rem] leading-relaxed text-[#4c587b] mb-10">
                  Przewodnik po biurach elastycznych w Polsce: modelach najmu, różnicach względem biura tradycyjnego,
                  decyzjach zakupowych i sytuacji na największych rynkach miejskich.
                </p>
                <Link
                  href="/przewodnik-flex"
                  className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#1C54F4] hover:text-[#000759] transition-colors"
                >
                  Dowiedz się więcej
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-12 py-16 pl-10 pr-2">
                <div className="animate-[modal-enter_0.24s_ease]">
                  <p className="pb-4 mb-6 text-[11px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] border-b border-[#e7e8ea]">
                    Podstawy flex
                  </p>
                  <div className="space-y-5">
                    {guideBasics.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-left text-[0.98rem] leading-snug text-[#222c4d] hover:text-[#1C54F4] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="animate-[modal-enter_0.28s_ease]">
                  <Link
                    href="/raporty-miejskie"
                    className="inline-block pb-4 mb-6 text-[11px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] border-b border-[#e7e8ea] hover:text-[#000759] transition-colors"
                  >
                    Raporty miejskie
                  </Link>
                  <div className="space-y-5">
                    {guideCities.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-left text-[0.98rem] leading-snug text-[#222c4d] hover:text-[#1C54F4] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="animate-[modal-enter_0.32s_ease]">
                  <p className="pb-4 mb-6 text-[11px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] border-b border-[#e7e8ea]">
                    Narzędzia
                  </p>
                  <div className="space-y-5">
                    {guideTools.map((item) => (
                      item.label === 'Dobierz model biura' && onOpenWizard ? (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => { onOpenWizard(); setActiveMenu(null) }}
                          className="block text-left text-[0.98rem] leading-snug text-[#222c4d] hover:text-[#1C54F4] transition-colors"
                        >
                          {item.label}
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block text-left text-[0.98rem] leading-snug text-[#222c4d] hover:text-[#1C54F4] transition-colors"
                        >
                          {item.label}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
