'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import { slugify } from '@/lib/utils/slugify'
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
  },
  {
    num: '02',
    title: 'Porównaj najlepsze oferty',
    body: 'Przygotujemy dla Ciebie zestawienie dopasowane do budżetu i standardu, uwzględniając ukryte koszty i benefity każdej lokalizacji.',
  },
  {
    num: '03',
    title: 'Sfinalizuj umowę',
    body: 'Nasi eksperci pomogą Ci wynegocjować najlepsze warunki najmu i przeprowadzą Cię przez cały proces.',
  },
]

const suggestions = [
  { label: 'Warszawa — Śródmieście', city: 'warszawa', district: 'srodmiescie' },
  { label: 'Warszawa — Wola', city: 'warszawa', district: 'wola' },
  { label: 'Warszawa — Mokotów', city: 'warszawa', district: 'mokotow' },
  { label: 'Kraków — Podgórze', city: 'krakow', district: 'podgorze' },
  { label: 'Wrocław — Stare Miasto', city: 'wroclaw', district: 'stare-miasto' },
  { label: 'Trójmiasto', city: 'trojmiasto', district: null },
  { label: 'Poznań', city: 'poznan', district: null },
  { label: 'Katowice', city: 'katowice', district: null },
]

export default function HomeClient({ featuredListings }: HomeClientProps) {
  const [searchValue, setSearchValue] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const router = useRouter()

  const filteredSuggestions = searchValue.trim().length > 0
    ? suggestions.filter(s => s.label.toLowerCase().includes(searchValue.toLowerCase()))
    : suggestions

  const showSuggestions = searchFocused && filteredSuggestions.length > 0

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const val = searchValue.trim()
    if (!val) return
    const slug = slugify(val)
    router.push(`/biura-serwisowane/${slug}`)
  }

  function handleCityClick(slug: string) {
    router.push(`/biura-serwisowane/${slug}`)
  }

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[720px] flex items-center bg-[#000759]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000759] via-[#000759]/90 to-[#000759]/60" />
          <div className="absolute inset-0 hud-scanline opacity-40" />
        </div>

        <div className="container-colliers relative z-10 py-24">
          <div className="max-w-3xl">
            {/* Overline */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-10 bg-[#1C54F4]" />
              <p className="overline">Biura serwisowane w Polsce</p>
            </div>

            {/* H1 */}
            <h1
              className="text-white font-light leading-[1.1] mb-8"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
            >
              Znajdź biuro{' '}
              <span className="font-bold">dopasowane do Twojej firmy</span>
            </h1>

            <p className="text-white/60 font-light mb-12 leading-relaxed text-lg max-w-2xl">
              Przeszukaj setki lokalizacji biur serwisowanych i coworkingów. Porównaj oferty i uzyskaj rekomendację naszego doradcy.
            </p>

            {/* Search console */}
            <div className="relative max-w-3xl">
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#1C54F4]/50 pointer-events-none" />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#1C54F4]/50 pointer-events-none" />

              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row items-stretch"
                style={{
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  background: 'rgba(0, 7, 89, 0.75)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 0 60px rgba(0,0,0,0.4)',
                }}
              >
                <div className="flex-grow flex items-center px-6 py-5">
                  <svg className="text-[#1C54F4] mr-4 flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                    placeholder="Wpisz miasto, dzielnicę lub nazwę biura"
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 text-base font-light tracking-wide"
                    style={{ outline: 'none', boxShadow: 'none' }}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#1C54F4] text-white px-12 py-5 font-bold uppercase tracking-widest text-[11px] hover:bg-white hover:text-[#000759] transition-all duration-300 flex-shrink-0"
                >
                  Szukaj biur
                </button>
              </form>

              {/* Autocomplete suggestions */}
              {showSuggestions && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden"
                  style={{
                    background: 'rgba(0,7,89,0.92)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="px-6 pt-4 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#1C54F4]">
                      {searchValue.trim() ? 'Sugestie' : 'Popularne lokalizacje'}
                    </p>
                  </div>
                  {filteredSuggestions.map((s) => (
                    <button
                      key={`${s.city}-${s.district}`}
                      type="button"
                      onMouseDown={() => {
                        const path = s.district
                          ? `/biura-serwisowane/${s.city}/${s.district}`
                          : `/biura-serwisowane/${s.city}`
                        router.push(path)
                        setSearchFocused(false)
                      }}
                      className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-white/10 transition-colors group"
                    >
                      <svg className="text-[#1C54F4]/60 group-hover:text-[#1C54F4] flex-shrink-0 transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className="text-sm font-light text-white/80 group-hover:text-white transition-colors">
                        {s.label}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-white/10 mt-1">
                    <button
                      type="button"
                      onMouseDown={() => { router.push('/biura-serwisowane'); setSearchFocused(false) }}
                      className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-white/10 transition-colors group"
                    >
                      <svg className="text-[#1C54F4]/60 group-hover:text-[#1C54F4] flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      <span className="text-sm font-light text-white/60 group-hover:text-white transition-colors">
                        Pokaż wszystkie biura w Polsce
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* City shortcuts */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 items-center text-[10px] font-bold uppercase tracking-widest">
              <span className="text-[#1C54F4]">Popularne:</span>
              {cities.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => handleCityClick(c.slug)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ────────────────────────────────────────────────── */}
      {featuredListings.length > 0 && (
        <section className="py-28 bg-white" data-reveal>
          <div className="container-colliers">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-20" data-reveal>
              <div>
                <p className="overline mb-4">Wybrane lokalizacje</p>
                <h2 className="text-4xl md:text-5xl font-light text-[#000759]">
                  Polecane biura serwisowane
                </h2>
              </div>
              <Link
                href="/biura-serwisowane"
                className="mt-6 md:mt-0 text-[11px] font-bold uppercase tracking-widest text-[#000759] hover:text-[#1C54F4] transition-colors"
              >
                Zobacz wszystkie →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredListings.map((listing) => {
                const citySlug = slugify(listing.address_city)
                const districtSlug = listing.address_district ? slugify(listing.address_district) : '_'
                const href = `/biura-serwisowane/${citySlug}/${districtSlug}/${listing.slug}`
                return (
                  <Link key={listing.id} href={href} className="group cursor-pointer block">
                    {/* Portrait image */}
                    <div
                      className="relative overflow-hidden bg-[var(--surface-container-high)]"
                      style={{ aspectRatio: '4/5' }}
                    >
                      <div className="absolute top-0 left-0 z-10 badge-featured">Polecane</div>
                      {listing.main_image_url ? (
                        <Image
                          src={listing.main_image_url}
                          alt={listing.name}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#000759] to-[#25408F] flex items-center justify-center">
                          <span className="text-white/20 text-5xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>CF</span>
                        </div>
                      )}
                    </div>

                    {/* Info below image */}
                    <div className="py-7">
                      <p className="overline mb-3">
                        {listing.address_district
                          ? `${listing.address_district}, ${listing.address_city}`
                          : listing.address_city}
                      </p>
                      <h3 className="text-2xl font-light text-[#000759] group-hover:text-[#1C54F4] transition-colors leading-snug">
                        {listing.name}
                      </h3>
                      <div className="mt-5 flex items-center gap-6 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                        {listing.min_office_size && listing.max_office_size && (
                          <span>{listing.min_office_size}–{listing.max_office_size} os.</span>
                        )}
                        {listing.price_desk_private && (
                          <span className="text-[#000759]">
                            od {listing.price_desk_private.toLocaleString('pl-PL')} PLN
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── JAK TO DZIAŁA ─────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#F8F9FB] border-y border-slate-100" data-reveal>
        <div className="container-colliers">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16">
            <div className="lg:col-span-1">
              <p className="overline mb-6">Przewodnik</p>
              <h2 className="text-4xl font-light text-[#000759] leading-tight mb-8">
                Jak działamy w Colliers Flex?
              </h2>
              <div className="h-1 w-12 bg-[#000759]" />
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col" data-reveal={`d${i + 1}`}>
                  <span className="text-6xl font-light text-slate-200 mb-8 leading-none">{step.num}</span>
                  <h3
                    className="text-base font-bold text-[#000759] mb-4 tracking-tight uppercase"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed font-light text-sm">{step.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA dark block */}
          <div className="mt-24 relative overflow-hidden bg-[#000759] text-white p-16" data-reveal>
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, #1C54F4 0%, transparent 70%)' }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-light mb-5">
                  Potrzebujesz personalizowanej rekomendacji?
                </h2>
                <p className="text-white/60 text-lg font-light">
                  Nasi doradcy bezpłatnie znajdą dla Ciebie idealne biuro w 24 godziny.
                </p>
              </div>
              <button
                onClick={() => setFormOpen(true)}
                className="btn-primary-bright px-14 py-5 flex-shrink-0"
                style={{ boxShadow: '0 0 30px rgba(28,84,244,0.3)' }}
              >
                Skontaktuj się z ekspertem
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
