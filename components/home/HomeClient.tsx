'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import { slugify } from '@/lib/utils/slugify'
import { CITY_OPTIONS, DISTRICT_OPTIONS, METRO_OPTIONS, findSearchOption, getSearchHref, normalizeSearchText } from '@/lib/search/locations'
import type { Listing, Operator } from '@/types/database'

type ListingWithOperator = Listing & { operator: Operator }

interface HomeClientProps {
  featuredListings: ListingWithOperator[]
}

const cities = [
  { label: 'Warszawa', slug: 'warszawa' },
  { label: 'Kraków', slug: 'krakow' },
  { label: 'Wrocław', slug: 'wroclaw' },
  { label: 'Trójmiasto', slug: 'trojmiasto' },
  { label: 'Poznań', slug: 'poznan' },
  { label: 'Katowice', slug: 'katowice' },
]

const TRANSITION_MS = 900
const TRANSITION_EASING = 'cubic-bezier(0.77, 0, 0.175, 1)'

export default function HomeClient({ featuredListings }: HomeClientProps) {
  const [searchValue, setSearchValue] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [heroOverlay, setHeroOverlay] = useState(true)
  const [activePanel, setActivePanel] = useState(0)
  const router = useRouter()

  // Refs
  const heroWrapperRef = useRef<HTMLDivElement>(null)
  const activePanelRef = useRef(0)
  const isTransitioningRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Track if header should be transparent (hero visible)
  useEffect(() => {
    const onScroll = () => {
      const wrapper = heroWrapperRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      setHeroOverlay(rect.top <= 0 && rect.bottom > 80)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Dot + panel indicator: sync with activePanelRef
  const syncActivePanel = () => setActivePanel(activePanelRef.current)

  // Wheel handler — intercepts scroll while hero is in view
  useEffect(() => {
    function goToPanel(next: number) {
      isTransitioningRef.current = true
      activePanelRef.current = next
      syncActivePanel()
      setTimeout(() => {
        isTransitioningRef.current = false
      }, TRANSITION_MS + 50)
    }

    function onWheel(e: WheelEvent) {
      const wrapper = heroWrapperRef.current
      if (!wrapper) return

      const rect = wrapper.getBoundingClientRect()
      // Hero is "active" when its sticky stage is visible in viewport
      const inHero = rect.top <= 0 && rect.bottom > 0

      if (!inHero) return

      if (isTransitioningRef.current) {
        e.preventDefault()
        return
      }

      const current = activePanelRef.current

      if (e.deltaY > 0) {
        // Scrolling down
        if (current < 2) {
          e.preventDefault()
          goToPanel(current + 1)
        }
        // current === 2: allow natural page scroll downward
      } else if (e.deltaY < 0) {
        // Scrolling up
        if (current > 0) {
          e.preventDefault()
          goToPanel(current - 1)
        }
        // current === 0: allow natural page scroll upward
      }
    }

    // capture: true so we run before Lenis / other listeners
    window.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => window.removeEventListener('wheel', onWheel, true)
  }, [])

  // ── Search logic ────────────────────────────────────────────────────────────
  const normalizedSearch = normalizeSearchText(searchValue)
  const showSuggestions = searchFocused

  const featuredListingSuggestions = featuredListings.slice(0, 3).map((listing) => ({
    key: `listing-${listing.id}`,
    label: listing.name,
    href: `/biura-serwisowane/${slugify(listing.address_city)}/${listing.address_district ? slugify(listing.address_district) : '_'}/${listing.slug}`,
  }))

  const searchGroups = [
    {
      title: 'Miasta',
      icon: 'location_on',
      items: CITY_OPTIONS.filter((item) =>
        !normalizedSearch || [item.label, ...(item.aliases ?? [])].some((value) => normalizeSearchText(value).includes(normalizedSearch))
      ).slice(0, 3).map((item) => ({ key: item.key, label: item.label, href: getSearchHref(item) })),
    },
    {
      title: 'Biura',
      icon: 'apartment',
      items: featuredListingSuggestions.filter((item) => !normalizedSearch || normalizeSearchText(item.label).includes(normalizedSearch)).slice(0, 3),
    },
    {
      title: 'Linie metra',
      icon: 'alt_route',
      items: METRO_OPTIONS.filter((item) =>
        !normalizedSearch || [item.label, ...(item.aliases ?? [])].some((value) => normalizeSearchText(value).includes(normalizedSearch))
      ).slice(0, 3).map((item) => ({ key: item.key, label: item.label, href: getSearchHref(item) })),
    },
    {
      title: 'Dzielnice',
      icon: 'map',
      items: DISTRICT_OPTIONS.filter((item) =>
        !normalizedSearch || [item.label, ...(item.aliases ?? [])].some((value) => normalizeSearchText(value).includes(normalizedSearch))
      ).slice(0, 3).map((item) => ({ key: item.key, label: item.label, href: getSearchHref(item) })),
    },
  ]

  const hasSuggestions = searchGroups.some((group) => group.items.length > 0)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const val = searchValue.trim()
    if (!val) return
    const option = findSearchOption(val)
    router.push(option ? getSearchHref(option) : `/biura-serwisowane?q=${encodeURIComponent(val)}`)
  }

  function handleCityClick(slug: string) {
    router.push(`/biura-serwisowane/${slug}`)
  }

  // Panel transform helper
  const panelTransform = (panelIndex: number) =>
    activePanel >= panelIndex ? 'translateY(0%)' : 'translateY(100%)'

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} transparent={heroOverlay} />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — 3-panel overlay stack
          300vh wrapper in page flow; sticky stage holds panels.
          Panels slide ON TOP of each other (overlay effect).
          Wheel handler intercepts scroll while hero is visible.
      ════════════════════════════════════════════════════════════════════════ */}
      <div ref={heroWrapperRef} style={{ height: '300vh', position: 'relative' }}>

        {/* Sticky stage — always 100vh, clips all 3 panels */}
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

          {/* ── Panel 1: Wyszukiwarka — z-index 10, always below ─────────── */}
          <section
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
            className="relative overflow-hidden bg-[#000759] text-white"
          >
            {/* Background layers */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,7,89,0.85) 0%, rgba(0,7,89,0.55) 50%, rgba(0,7,89,0.92) 100%)' }} />
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
              {/* Blue radial glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[55%] opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1C54F4 0%, transparent 70%)' }} />
            </div>
            {/* Keyline top */}
            <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ background: 'linear-gradient(90deg, #000759 0%, #1C54F4 40%, #4D93FF 70%, #000759 100%)' }} />

            {/* Content — pushed high so autocomplete dropdown fits below */}
            <div className="relative z-10 w-full px-8 lg:px-16" style={{ paddingTop: 'clamp(4rem, 16vh, 9rem)' }}>
              <div className="max-w-4xl mx-auto text-center">

                <p
                  className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#4D93FF] mb-6"
                  style={{ opacity: heroLoaded ? 1 : 0, transition: 'opacity 0.8s ease 0.1s' }}
                >
                  Biura serwisowane w Polsce
                </p>

                <h1
                  className="font-light leading-tight mb-6"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.4rem, 5vw, 5rem)',
                    opacity: heroLoaded ? 1 : 0,
                    transform: heroLoaded ? 'translateY(0)' : 'translateY(24px)',
                    transition: 'all 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s',
                  }}
                >
                  Znajdź biuro serwisowane{' '}
                  <br className="hidden md:block" />
                  <span style={{ fontWeight: 700 }}>z pomocą Colliers</span>
                </h1>

                <p
                  className="text-white/60 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed"
                  style={{
                    opacity: heroLoaded ? 1 : 0,
                    transform: heroLoaded ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'all 0.9s cubic-bezier(0.22,1,0.36,1) 0.28s',
                  }}
                >
                  Przeszukaj oferty w największych miastach, porównaj lokalizacje i zawęź wybór szybciej.
                </p>

                {/* Search box */}
                <div
                  className="relative max-w-3xl mx-auto"
                  style={{
                    opacity: heroLoaded ? 1 : 0,
                    transform: heroLoaded ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'all 0.9s cubic-bezier(0.22,1,0.36,1) 0.38s',
                  }}
                >
                  <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row items-stretch overflow-hidden border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                    style={{ backdropFilter: 'blur(24px)', background: 'rgba(0,7,89,0.82)' }}
                  >
                    <div className="flex-grow flex items-center gap-4 px-7 py-5">
                      <svg className="text-[#1C54F4] flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                      </svg>
                      <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                        placeholder="Wpisz miasto, dzielnicę lub nazwę biura..."
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 font-light tracking-wide"
                        style={{ outline: 'none', boxShadow: 'none', fontSize: '1rem' }}
                        autoComplete="off"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#1C54F4] text-white px-10 py-5 font-bold uppercase tracking-[0.22em] text-[11px] flex-shrink-0 hover:bg-white hover:text-[#000759] transition-all duration-300"
                    >
                      Szukaj biur
                    </button>
                  </form>

                  {/* Autocomplete dropdown */}
                  {showSuggestions && hasSuggestions && (
                    <div
                      className="absolute left-0 right-0 top-full mt-2 z-50 border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                      style={{ backdropFilter: 'blur(24px)', background: 'rgba(0,7,89,0.94)' }}
                    >
                      <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #1C54F4, #4D93FF, transparent)' }} />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
                        {searchGroups.map((group) => (
                          group.items.length > 0 && (
                            <div key={group.title}>
                              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#4D93FF] mb-4">{group.title}</p>
                              <div className="flex flex-col gap-2">
                                {group.items.map((item: { key: string; label: string; href: string }) => (
                                  <button
                                    key={item.key}
                                    type="button"
                                    onMouseDown={() => { router.push(item.href); setSearchFocused(false) }}
                                    className="flex items-center gap-3 py-1.5 text-left text-white/80 hover:text-white transition-colors"
                                  >
                                    <span className="h-1 w-1 rounded-full bg-[#4D93FF] shrink-0" />
                                    <span className="text-sm font-light">{item.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                      <div className="border-t border-white/8 px-6 py-3">
                        <button
                          type="button"
                          onMouseDown={() => { router.push('/biura-serwisowane'); setSearchFocused(false) }}
                          className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C3E6FF] hover:text-white transition-colors"
                        >
                          Pokaż wszystkie biura w Polsce →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Popular cities */}
                  <div className="mt-7 flex flex-wrap justify-center items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] mr-1">Popularne:</span>
                    {cities.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => handleCityClick(c.slug)}
                        className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/65 hover:text-white transition-colors px-1"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scroll indicator */}
                <div className="mt-10 flex flex-col items-center gap-2 animate-bounce">
                  <svg className="text-white/30" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* ── Panel 2: Narzędzia — slides OVER panel 1 ─────────────────── */}
          <section
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              transform: panelTransform(1),
              transition: `transform ${TRANSITION_MS}ms ${TRANSITION_EASING}`,
            }}
            className="relative overflow-hidden bg-[#000759] text-white flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,7,89,0.75) 0%, rgba(10,20,100,0.65) 100%)' }} />
              {/* Blue glow bottom-right */}
              <div className="absolute bottom-0 right-0 w-[55%] h-[55%] opacity-25" style={{ background: 'radial-gradient(ellipse at 100% 100%, #1C54F4 0%, transparent 65%)' }} />
              <div className="absolute top-0 left-0 w-[40%] h-[40%] opacity-15" style={{ background: 'radial-gradient(ellipse at 0% 0%, #4D93FF 0%, transparent 65%)' }} />
            </div>
            <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ background: 'linear-gradient(90deg, #000759 0%, #1C54F4 40%, #4D93FF 70%, #000759 100%)' }} />

            <div className="relative z-10 w-full px-8 lg:px-16">
              <div className="max-w-4xl mx-auto text-center">
                <h2
                  className="font-light leading-tight mb-5"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)' }}
                >
                  Porównaj modele i oszacuj koszty
                </h2>
                <p className="text-white/65 text-lg font-light mb-14 max-w-2xl mx-auto leading-relaxed">
                  Nie każda firma potrzebuje tego samego typu biura. Skorzystaj z naszych narzędzi, aby sprawdzić, który model będzie najbardziej racjonalny biznesowo.
                </p>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Card: Porównywarka */}
                  <div className="bg-white p-10 text-center group hover:bg-[#1C54F4] transition-all duration-500 cursor-pointer" onClick={() => router.push('/porownaj')}>
                    <div className="flex justify-center mb-5">
                      <svg className="text-[#1C54F4] group-hover:text-white transition-colors" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-[0.12em] text-[#000759] group-hover:text-white mb-3 transition-colors">Porównywarka modeli biura</h3>
                    <p className="text-[#56648F] text-sm font-light group-hover:text-white/80 mb-7 leading-relaxed transition-colors">Sprawdź, czy lepszym wyborem będzie biuro serwisowane, najem tradycyjny czy model hybrydowy.</p>
                    <div className="w-full bg-[#1C54F4] group-hover:bg-white text-white group-hover:text-[#000759] py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                      Porównaj modele
                    </div>
                  </div>

                  {/* Card: Kalkulator */}
                  <div className="bg-white p-10 text-center group hover:bg-[#1C54F4] transition-all duration-500 cursor-pointer" onClick={() => setFormOpen(true)}>
                    <div className="flex justify-center mb-5">
                      <svg className="text-[#1C54F4] group-hover:text-white transition-colors" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="4" y="2" width="16" height="20" rx="0"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/>
                      </svg>
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-[0.12em] text-[#000759] group-hover:text-white mb-3 transition-colors">Kalkulator kosztów biura</h3>
                    <p className="text-[#56648F] text-sm font-light group-hover:text-white/80 mb-7 leading-relaxed transition-colors">Oszacuj orientacyjny koszt biura dla Twojego zespołu i zobacz, jak różne założenia wpływają na budżet.</p>
                    <div className="w-full bg-[#1C54F4] group-hover:bg-white text-white group-hover:text-[#000759] py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                      Uruchom kalkulator
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-2 animate-bounce">
                  <svg className="text-white/30" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* ── Panel 3: Doradztwo — slides OVER panel 2 ─────────────────── */}
          <section
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              transform: panelTransform(2),
              transition: `transform ${TRANSITION_MS}ms ${TRANSITION_EASING}`,
            }}
            className="relative overflow-hidden bg-[#000759] text-white flex items-center"
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,7,89,0.92) 0%, rgba(0,7,89,0.78) 50%, rgba(0,7,89,0.95) 100%)' }} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[60%] h-[60%] opacity-20" style={{ background: 'radial-gradient(ellipse, #1C54F4 0%, transparent 65%)' }} />
              </div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ background: 'linear-gradient(90deg, #000759 0%, #1C54F4 40%, #4D93FF 70%, #000759 100%)' }} />

            <div className="relative z-10 w-full px-8 lg:px-16">
              <div className="max-w-3xl mx-auto text-center">
                <h2
                  className="font-light leading-tight mb-7"
                  style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4.5vw, 4.5rem)' }}
                >
                  Wolisz porównać rynek z doradcą?
                </h2>
                <p className="text-white/65 text-xl font-light mb-12 max-w-xl mx-auto leading-relaxed">
                  Nasi eksperci pomogą Ci zawęzić wybór, porównać operatorów i wynegocjować lepsze warunki — bez dodatkowego kosztu po Twojej stronie.
                </p>
                <button
                  onClick={() => setFormOpen(true)}
                  className="bg-[#1C54F4] text-white px-14 py-5 font-bold uppercase tracking-[0.22em] text-[11px] hover:bg-white hover:text-[#000759] transition-all duration-300 shadow-[0_20px_60px_rgba(28,84,244,0.35)]"
                >
                  Porozmawiaj z doradcą
                </button>

                {/* Trust badges */}
                <div className="mt-10 flex flex-wrap justify-center gap-6">
                  {['Bezpośredni kontakt', 'Bezpłatne wsparcie', 'Negocjacja warunków'].map((item) => (
                    <span key={item} className="border border-white/15 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Dot navigation ────────────────────────────────────────────── */}
          <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (isTransitioningRef.current) return
                  const diff = Math.abs(index - activePanelRef.current)
                  // Animate through panels sequentially for multi-step jumps
                  if (diff <= 1) {
                    isTransitioningRef.current = true
                    activePanelRef.current = index
                    setActivePanel(index)
                    setTimeout(() => { isTransitioningRef.current = false }, TRANSITION_MS + 50)
                  } else {
                    // Step through
                    const step = index > activePanelRef.current ? 1 : -1
                    let current = activePanelRef.current
                    const interval = setInterval(() => {
                      current += step
                      activePanelRef.current = current
                      setActivePanel(current)
                      if (current === index) {
                        clearInterval(interval)
                        setTimeout(() => { isTransitioningRef.current = false }, TRANSITION_MS + 50)
                      }
                    }, TRANSITION_MS + 60)
                    isTransitioningRef.current = true
                  }
                }}
                className={`h-2.5 w-2.5 rounded-full border transition-all duration-400 ${
                  activePanel === index
                    ? 'border-white bg-white scale-110 shadow-[0_0_0_4px_rgba(255,255,255,0.15)]'
                    : 'border-white/40 bg-white/15 hover:bg-white/35'
                }`}
                aria-label={`Przejdź do panelu ${index + 1}`}
              />
            ))}
          </div>

        </div>{/* /sticky stage */}
      </div>{/* /hero wrapper 300vh */}

      {/* ═══════════════════════════════════════════════════════════════════════
          JAK DZIAŁAMY — 3 kroki
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 bg-[#F8F9FB] border-y border-slate-100" data-reveal>
        <div className="container-colliers">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">

            {/* Left: heading */}
            <div className="lg:col-span-1">
              <p className="overline mb-6">Przewodnik</p>
              <h2
                className="text-[#000759] leading-snug"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}
              >
                Jak działamy<br />
                <span style={{ fontWeight: 700 }}>w Colliers Flex?</span>
              </h2>
            </div>

            {/* Right: steps */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
              {[
                {
                  num: '01',
                  title: 'Określ swoje potrzeby',
                  desc: 'Powiedz nam, ile stanowisk szukasz, w jakim mieście i na jak długo. Możesz też skorzystać z porównywarki modeli.',
                },
                {
                  num: '02',
                  title: 'Porównaj najlepsze oferty',
                  desc: 'Dobierzemy dla Ciebie oferty dopasowane do budżetu i wymagań. Możesz zestawić je ze sobą w naszej porównywarce.',
                },
                {
                  num: '03',
                  title: 'Sfinalizuj umowę',
                  desc: 'Nasz doradca przeprowadzi Cię przez negocjacje i formalności — bezpłatnie, bez zobowiązań.',
                },
              ].map(({ num, title, desc }, i) => (
                <div key={num} data-reveal={`d${i + 1}`}>
                  {/* Step number */}
                  <p
                    className="font-bold text-[#E8ECFF] mb-5 leading-none select-none"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '4.5rem', letterSpacing: '-0.02em' }}
                  >
                    {num}
                  </p>
                  {/* Keyline */}
                  <div className="w-8 h-[2px] bg-[#1C54F4] mb-5" />
                  <h3
                    className="text-[#000759] mb-4 leading-snug"
                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.02em' }}
                  >
                    {title}
                  </h3>
                  <p className="text-[#56648F] text-sm font-light leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURED — Portrait cards, magazine layout
      ════════════════════════════════════════════════════════════════════════ */}
      {featuredListings.length > 0 && (
        <section className="py-28 bg-white" data-reveal>
          <div className="container-colliers">

            {/* Section header with keyline */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-20" data-reveal>
              <div>
                <p className="overline mb-5">Wybrane lokalizacje</p>
                <h2
                  className="text-[#000759] leading-tight"
                  style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                >
                  Polecane biura<br />
                  <span style={{ fontWeight: 700 }}>serwisowane</span>
                </h2>
              </div>
              <div className="flex flex-col items-end gap-3 mt-6 md:mt-0">
                <div className="h-px w-24 bg-gradient-to-l from-[#1C54F4] to-transparent" />
                <Link href="/biura-serwisowane" className="cta-link">
                  Zobacz wszystkie →
                </Link>
              </div>
            </div>

            {/* Portrait grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {featuredListings.map((listing, index) => {
                const citySlug = slugify(listing.address_city)
                const districtSlug = listing.address_district ? slugify(listing.address_district) : '_'
                const href = `/biura-serwisowane/${citySlug}/${districtSlug}/${listing.slug}`
                return (
                  <Link
                    key={listing.id}
                    href={href}
                    className="group cursor-pointer block"
                    data-reveal={`d${(index % 3) + 1}`}
                  >
                    <div
                      className="relative overflow-hidden bg-[#000759]"
                      style={{ aspectRatio: '4/5' }}
                    >
                      {/* Featured badge */}
                      <div className="absolute top-0 left-0 z-20 badge-featured">Polecane</div>

                      {/* Blue overlay */}
                      <div
                        className="absolute inset-0 z-10 transition-opacity duration-700"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,7,89,0.2) 0%, rgba(0,7,89,0.7) 100%)', opacity: 1 }}
                      />
                      <div
                        className="absolute inset-0 z-10 bg-[#1C54F4]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />

                      {listing.main_image_url ? (
                        <Image
                          src={listing.main_image_url}
                          alt={listing.name}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-104 transition-all duration-700"
                          style={{ '--tw-scale-x': '1.04', '--tw-scale-y': '1.04' } as React.CSSProperties}
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#000759] via-[#25408F] to-[#353E59] flex items-center justify-center">
                          <span className="text-white/15 font-light" style={{ fontFamily: 'var(--font-sans)', fontSize: '5rem', fontWeight: 300 }}>CF</span>
                        </div>
                      )}

                      {/* Info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                        <div className="w-8 h-[2px] bg-[#1C54F4] mb-3 transition-all duration-500 group-hover:w-16" />
                        <p className="overline mb-2 text-white/60">{listing.address_district || listing.address_city}</p>
                        <h3
                          className="text-white leading-snug group-hover:text-[#C3E6FF] transition-colors duration-300"
                          style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '1.25rem' }}
                        >
                          {listing.name}
                        </h3>
                        <div className="mt-3 flex items-center justify-between">
                          {listing.price_desk_private && (
                            <span className="text-[#4D93FF] font-bold text-sm">
                              od {listing.price_desk_private.toLocaleString('pl-PL')} PLN
                            </span>
                          )}
                          <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold ml-auto">
                            {listing.operator.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
