'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import { slugify } from '@/lib/utils/slugify'
import { SEARCH_OPTIONS, findSearchOption, getSearchHref, normalizeSearchText } from '@/lib/search/locations'
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

const steps = [
  {
    num: '01',
    title: 'Określ swoje potrzeby',
    body: 'Powiedz nam, ilu pracowników chcesz pomieścić i jaki model pracy preferuje Twój zespół. Nasza baza zawiera setki lokalizacji w Polsce.',
    accent: '#1C54F4',
  },
  {
    num: '02',
    title: 'Porównaj najlepsze oferty',
    body: 'Przygotujemy dla Ciebie zestawienie dopasowane do budżetu i standardu, uwzględniając ukryte koszty i benefity każdej lokalizacji.',
    accent: '#25408F',
  },
  {
    num: '03',
    title: 'Sfinalizuj umowę',
    body: 'Nasi eksperci pomogą Ci wynegocjować najlepsze warunki najmu i przeprowadzą Cię przez cały proces.',
    accent: '#000759',
  },
]

const stats = [
  { value: '500+', label: 'Lokalizacji w Polsce' },
  { value: '24h', label: 'Czas reakcji' },
  { value: '100%', label: 'Bezpłatna usługa' },
]

export default function HomeClient({ featuredListings }: HomeClientProps) {
  const [searchValue, setSearchValue] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  const filteredSuggestions = searchValue.trim().length > 0
    ? SEARCH_OPTIONS.filter((s) => [s.label, ...(s.aliases ?? [])].some((value) => normalizeSearchText(value).includes(normalizeSearchText(searchValue))))
    : SEARCH_OPTIONS

  const showSuggestions = searchFocused && filteredSuggestions.length > 0

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

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} />

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO — Deep Blue block + overlapping Medium Blue block + keyline
      ════════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full min-h-[760px] flex items-center bg-[#000759] overflow-hidden">

        {/* Primary Deep Blue block (full width) */}
        <div className="absolute inset-0 bg-[#000759]" />

        {/* Secondary Medium Blue block — overlapping, positioned top-right, 3:1 ratio */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[38%]"
          style={{ background: 'linear-gradient(135deg, #1C54F4 0%, #25408F 100%)', opacity: 0.18 }}
        />

        {/* Keyline frame — Colliers signature element */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 48,
            left: 64,
            right: 64,
            bottom: 48,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />

        {/* Animated gradient keyline — top edge extends on load */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #000759 0%, #1C54F4 35%, #4D93FF 65%, #000759 100%)',
            transform: heroLoaded ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 1.4s cubic-bezier(0.4,0,0.2,1) 0.2s',
          }}
        />

        {/* Corner bracket — top left */}
        <div className="absolute pointer-events-none" style={{ top: 24, left: 24 }}>
          <div style={{ width: 28, height: 28, borderTop: '2px solid rgba(28,84,244,0.5)', borderLeft: '2px solid rgba(28,84,244,0.5)' }} />
        </div>
        {/* Corner bracket — bottom right */}
        <div className="absolute pointer-events-none" style={{ bottom: 24, right: 24 }}>
          <div style={{ width: 28, height: 28, borderBottom: '2px solid rgba(28,84,244,0.5)', borderRight: '2px solid rgba(28,84,244,0.5)' }} />
        </div>

        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Content */}
        <div className="container-colliers relative z-10 py-24">
          <div className="max-w-[680px]">

            {/* Overline with keyline accent */}
            <div
              className="flex items-center gap-4 mb-8"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1) 0.3s',
              }}
            >
              <div className="h-px w-12 bg-[#1C54F4]" />
              <p className="overline">Biura serwisowane w Polsce</p>
            </div>

            {/* H1 — Open Sans Light at large size (brand spec) */}
            <h1
              className="text-white leading-[1.08] mb-8 tracking-tight"
              style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 300,
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.45s',
              }}
            >
              Znajdź biuro{' '}
              <span style={{ fontWeight: 700, color: '#4D93FF' }}>dopasowane</span>
              {' '}do Twojej firmy
            </h1>

            {/* Body — Open Sans Regular */}
            <p
              className="text-white/70 font-normal mb-12 leading-relaxed"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.05rem',
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.6s',
              }}
            >
              Przeszukaj setki lokalizacji biur serwisowanych i coworkingów.<br />
              Porównaj oferty i uzyskaj rekomendację naszego doradcy.
            </p>

            {/* Search console */}
            <div
              className="relative"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? 'translateY(0)' : 'translateY(24px)',
                transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1) 0.75s',
              }}
            >
              {/* Corner brackets on search box */}
              <div className="absolute -top-3 -left-3 w-5 h-5 pointer-events-none" style={{ borderTop: '1.5px solid rgba(28,84,244,0.6)', borderLeft: '1.5px solid rgba(28,84,244,0.6)' }} />
              <div className="absolute -bottom-3 -right-3 w-5 h-5 pointer-events-none" style={{ borderBottom: '1.5px solid rgba(28,84,244,0.6)', borderRight: '1.5px solid rgba(28,84,244,0.6)' }} />

              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row items-stretch"
                style={{
                  background: 'rgba(0, 7, 89, 0.7)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex-grow flex items-center px-6 py-5 gap-4">
                  <svg className="text-[#1C54F4] flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    placeholder="Wpisz miasto, dzielnicę lub nazwę biura"
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/35 font-light tracking-wide"
                    style={{ outline: 'none', boxShadow: 'none', fontSize: '0.95rem' }}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  className="px-12 py-5 font-bold uppercase tracking-widest text-[11px] flex-shrink-0 transition-all duration-300"
                  style={{ background: '#1C54F4', color: 'white' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = '#4D93FF' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = '#1C54F4' }}
                >
                  Szukaj biur
                </button>
              </form>

              {/* Autocomplete */}
              {showSuggestions && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden"
                  style={{
                    background: 'rgba(0,7,89,0.94)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  {/* Keyline accent at top of dropdown */}
                  <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #1C54F4, #4D93FF, transparent)' }} />
                  <div className="px-6 pt-4 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4D93FF]">
                      {searchValue.trim() ? 'Sugestie' : 'Popularne lokalizacje'}
                    </p>
                  </div>
                  {filteredSuggestions.map((s) => (
                  <button
                      key={s.key}
                      type="button"
                      onMouseDown={() => {
                        router.push(getSearchHref(s))
                        setSearchFocused(false)
                      }}
                      className="w-full flex items-center gap-4 px-6 py-3 text-left transition-colors group"
                      style={{ borderLeft: '2px solid transparent' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(28,84,244,0.15)'; (e.currentTarget as HTMLElement).style.borderLeftColor = '#1C54F4' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent' }}
                    >
                      <svg className="text-[#1C54F4]/50 flex-shrink-0 group-hover:text-[#4D93FF] transition-colors" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className="text-sm font-light text-white/75 group-hover:text-white transition-colors">
                        {s.label}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-white/8 mt-1">
                    <button
                      type="button"
                      onMouseDown={() => { router.push('/biura-serwisowane'); setSearchFocused(false) }}
                      className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-white/5 transition-colors group"
                    >
                      <svg className="text-[#1C54F4]/40 flex-shrink-0 group-hover:text-[#4D93FF]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      <span className="text-sm font-light text-white/50 group-hover:text-white transition-colors">
                        Pokaż wszystkie biura w Polsce
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* City shortcuts */}
            <div
              className="mt-10 flex flex-wrap gap-x-6 gap-y-2 items-center"
              style={{
                opacity: heroLoaded ? 1 : 0,
                transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1) 0.95s',
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C54F4]">Popularne:</span>
              {cities.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => handleCityClick(c.slug)}
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 hover:text-white transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip — bottom of hero */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            opacity: heroLoaded ? 1 : 0,
            transition: 'opacity 0.8s ease 1.1s',
          }}
        >
          <div className="container-colliers">
            <div className="flex divide-x divide-white/10">
              {stats.map((stat) => (
                <div key={stat.label} className="flex-1 py-5 px-6">
                  <p className="text-white font-bold text-xl leading-none mb-1">{stat.value}</p>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.16em] font-bold">{stat.label}</p>
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
                {/* Headline: Open Sans Light — large, brand spec */}
                <h2
                  className="text-[#000759] leading-tight"
                  style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
                >
                  Polecane biura<br />
                  <span style={{ fontWeight: 700 }}>serwisowane</span>
                </h2>
              </div>
              {/* Keyline extends from header to link */}
              <div className="flex flex-col items-end gap-3 mt-6 md:mt-0">
                <div className="h-px w-24 bg-gradient-to-l from-[#1C54F4] to-transparent" />
                <Link href="/biura-serwisowane" className="cta-link">
                  Zobacz wszystkie →
                </Link>
              </div>
            </div>

            {/* Portrait grid — 4/5 aspect ratio, grayscale → color on hover */}
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
                    {/* Image block */}
                    <div
                      className="relative overflow-hidden bg-[#000759]"
                      style={{ aspectRatio: '4/5' }}
                    >
                      {/* Featured badge */}
                      <div className="absolute top-0 left-0 z-20 badge-featured">Polecane</div>

                      {/* Blue overlay — fades out on hover */}
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

                      {/* Info overlay — always visible at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                        {/* Keyline accent above text */}
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

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS — Steps with brand blocks + keyline
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#f8f9fb] relative overflow-hidden" data-reveal>

        {/* Background block — Colliers brand element, secondary blue block */}
        <div
          className="absolute right-0 top-0 w-[28%] h-[240px] pointer-events-none"
          style={{ background: '#DBE5FF', opacity: 0.5 }}
        />

        <div className="container-colliers relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Left column — section title */}
            <div className="lg:col-span-4" data-reveal="left">
              <p className="overline mb-6">Przewodnik</p>
              <h2
                className="text-[#000759] leading-tight mb-8"
                style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
              >
                Jak działamy<br />
                <span style={{ fontWeight: 700 }}>w Colliers Flex?</span>
              </h2>
              {/* Keyline — organizing type, extending down */}
              <div className="w-[2px] h-16 bg-gradient-to-b from-[#1C54F4] to-transparent" />

              {/* Subhead in Merriweather — brand spec for pull-quote/subhead */}
              <p
                className="mt-8 text-[#56648F] leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: '1.05rem' }}
              >
                Nasi doradcy bezpłatnie znajdą dla Ciebie idealne biuro w 24 godziny.
              </p>

              <button
                onClick={() => setFormOpen(true)}
                className="btn-primary mt-8"
              >
                Porozmawiaj z ekspertem
              </button>
            </div>

            {/* Right column — steps */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-0">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="relative p-8 border-t-2 transition-all duration-300 hover:bg-white group"
                  style={{ borderTopColor: step.accent }}
                  data-reveal={`d${i + 1}`}
                >
                  {/* Step number — Open Sans Bold, document heading spec */}
                  <div
                    className="mb-6 font-bold uppercase transition-colors duration-300"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      fontSize: '2.5rem',
                      letterSpacing: '0.1em',
                      color: step.accent,
                      lineHeight: 1,
                      opacity: 0.2,
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    className="mb-4 text-[#000759]"
                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[#56648F] leading-relaxed font-light text-sm">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA dark block — Deep Blue primary block with gradient keyline */}
          <div className="mt-24 relative overflow-hidden" data-reveal>
            {/* Primary Deep Blue block */}
            <div className="absolute inset-0 bg-[#000759]" />
            {/* Secondary block — Medium Blue, overlapping, 3:1 ratio */}
            <div
              className="absolute top-0 right-0 bottom-0 w-[32%]"
              style={{ background: 'linear-gradient(135deg, #1C54F4, #25408F)', opacity: 0.5 }}
            />
            {/* Gradient keyline at top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #1C54F4 0%, #4D93FF 50%, transparent 100%)' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 p-16">
              <div className="max-w-2xl">
                <p className="overline mb-4">Bezpłatna konsultacja</p>
                <h2
                  className="text-white leading-tight mb-5"
                  style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}
                >
                  Potrzebujesz <span style={{ fontWeight: 700 }}>personalizowanej</span><br />rekomendacji?
                </h2>
                <p className="text-white/55 font-light" style={{ fontFamily: 'var(--font-sans)' }}>
                  Nasi doradcy bezpłatnie znajdą dla Ciebie idealne biuro w 24 godziny.
                </p>
              </div>
              <button
                onClick={() => setFormOpen(true)}
                className="btn-primary-bright flex-shrink-0 px-14 py-5"
                style={{ boxShadow: '0 0 40px rgba(28,84,244,0.35)' }}
              >
                Skontaktuj się z ekspertem
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BRAND STRIP — Pale Blue Grey section, alternating per brand spec
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#DBE5FF]/30 border-y border-[#ACBBE8]/30" data-reveal>
        <div className="container-colliers">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <p className="overline mb-4">Colliers Flex</p>
              {/* Merriweather subhead — pull-quote style per brand spec */}
              <p
                className="text-[#000759] leading-relaxed"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
              >
                Maximize the potential of property<br />
                to accelerate the success of your business.
              </p>
            </div>

            {/* Keyline separator — vertical, connecting */}
            <div className="hidden md:block w-[2px] h-24 bg-gradient-to-b from-transparent via-[#ACBBE8] to-transparent flex-shrink-0" />

            <div className="flex-1 flex flex-col gap-6">
              {[
                { icon: '→', text: 'Dostęp do ponad 500 lokalizacji w całej Polsce' },
                { icon: '→', text: 'Bezpłatne doradztwo ekspertów Colliers' },
                { icon: '→', text: 'Negocjacja warunków umowy w Twoim imieniu' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-4">
                  <span className="text-[#1C54F4] font-bold mt-0.5 flex-shrink-0">{item.icon}</span>
                  <p className="text-[#353E59] text-sm font-light leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
