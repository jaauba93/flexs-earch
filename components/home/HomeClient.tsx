'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Building2, BarChart3, MessageSquare } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import ListingCard from '@/components/search/ListingCard'
import type { Listing, Operator } from '@/types/database'

const cities = [
  { label: 'Warszawa', slug: 'warszawa' },
  { label: 'Kraków', slug: 'krakow' },
  { label: 'Wrocław', slug: 'wroclaw' },
  { label: 'Trójmiasto', slug: 'trojmiasto' },
  { label: 'Poznań', slug: 'poznan' },
  { label: 'Katowice', slug: 'katowice' },
  { label: 'Łódź', slug: 'lodz' },
]

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Wyszukaj',
    desc: 'Skorzystaj z wyszukiwarki i filtrów, aby znaleźć biura serwisowane spełniające wymagania Twojej firmy — w wybranym mieście, dzielnicy lub przy konkretnej stacji metra.',
  },
  {
    icon: BarChart3,
    number: '02',
    title: 'Porównaj',
    desc: 'Dodaj interesujące Cię lokalizacje do porównywarki i oceń je obok siebie. Sprawdź cenę za stanowisko, udogodnienia i rok otwarcia.',
  },
  {
    icon: MessageSquare,
    number: '03',
    title: 'Uzyskaj ofertę',
    desc: 'Wyślij zapytanie ofertowe bezpośrednio ze strony. Doradca Colliers skontaktuje się z Tobą w ciągu jednego dnia roboczego z indywidualną ofertą i rekomendacją.',
  },
]

interface HomeClientProps {
  featuredListings: (Listing & { operator: Operator })[]
}

export default function HomeClient({ featuredListings }: HomeClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) {
      router.push('/biura-serwisowane')
      return
    }
    const q = encodeURIComponent(query.trim())
    router.push(`/biura-serwisowane?q=${q}`)
  }

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[75vh] px-6 text-center"
        style={{ background: 'var(--colliers-navy)' }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="overline text-white mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Biura serwisowane w Polsce
          </p>
          <h1 className="heading-serif text-white text-4xl md:text-5xl mb-6 leading-tight"
            style={{ color: '#fff', fontFamily: 'var(--font-serif)' }}>
            Znajdź biuro dopasowane do Twojej firmy
          </h1>
          <p className="text-white/75 text-lg mb-10 leading-relaxed">
            Przeszukaj setki lokalizacji biur serwisowanych i coworkingów w Polsce.<br />
            Porównaj oferty i uzyskaj rekomendację naszego doradcy.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-stretch max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Wpisz miasto, dzielnicę lub nazwę biura"
              className="flex-1 px-5 py-4 text-[var(--colliers-navy)] bg-white focus:outline-none text-base"
              style={{ borderRadius: '0' }}
            />
            <button type="submit" className="btn-primary px-8 py-4 text-base"
              style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
              <Search size={18} />
              Szukaj biur
            </button>
          </form>

          {/* City shortcuts */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {cities.map((c) => (
              <Link key={c.slug} href={`/biura-serwisowane/${c.slug}`}
                className="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-2 decoration-white/30 hover:decoration-white">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ──────────────────────────────────────────── */}
      {featuredListings.length > 0 && (
        <section className="py-16" style={{ background: 'var(--colliers-bg-light-blue)' }}>
          <div className="container-colliers">
            <p className="overline mb-2">Wybrane przez Colliers</p>
            <h2 className="heading-serif text-3xl mb-10"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
              Polecane biura serwisowane
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onOpenForm={() => setFormOpen(true)} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/biura-serwisowane" className="btn-outline inline-flex items-center gap-2">
                Zobacz wszystkie biura <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container-colliers">
          <p className="overline mb-2">Prosty proces</p>
          <h2 className="heading-serif text-3xl mb-12"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
            Trzy kroki do nowego biura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-light text-[var(--colliers-bg-blue-tint)]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {step.number}
                  </span>
                  <step.icon size={28} style={{ color: 'var(--colliers-blue-bright)' }} />
                </div>
                <h3 className="text-xl font-semibold text-[var(--colliers-navy)] mb-3">{step.title}</h3>
                <p className="text-[var(--colliers-gray)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA dark section ──────────────────────────────────────────── */}
      <section className="py-16" style={{ background: 'var(--colliers-navy)' }}>
        <div className="container-colliers text-center">
          <Building2 size={36} className="mx-auto mb-4 text-white/40" />
          <h2 className="heading-serif text-3xl text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}>
            Potrzebujesz pomocy w wyborze biura?
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Skontaktuj się z naszym doradcą — bezpłatnie przeprowadzi Cię przez dostępne opcje i przygotuje indywidualną ofertę.
          </p>
          <button onClick={() => setFormOpen(true)} className="btn-primary text-lg px-10 py-4">
            Otrzymaj ofertę
          </button>
        </div>
      </section>

      <Footer />

      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
