'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Menu, X } from 'lucide-react'
import BasketDropdown from '@/components/comparator/BasketDropdown'

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
}

export default function Header({ onOpenForm }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 h-20 nav-glass transition-all duration-300 ${
        scrolled
          ? 'shadow-[0_2px_24px_rgba(0,7,89,0.1)]'
          : 'border-b border-[#000759]/6'
      }`}
    >
      {/* Keyline gradient — top border that shifts color slightly on scroll */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, #000759 0%, #1C54F4 40%, #4D93FF 70%, #000759 100%)',
          opacity: scrolled ? 0.7 : 0.25,
        }}
      />

      <div className="w-full px-8 lg:px-16 flex justify-between items-center h-full">

        {/* Logo */}
        <div className="flex items-center gap-12 h-full">
          <Link href="/" className="flex items-center h-full py-4 flex-shrink-0">
            <Image
              src="/images/logo-colliers.png"
              alt="Colliers Flex"
              width={120}
              height={120}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex gap-10 items-center h-full">
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="nav-link active flex items-center gap-1.5 h-full border-b-2 border-[#1C54F4] opacity-100">
                Wyszukaj
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown — styled with brand block: Dark Blue bg */}
              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 min-w-[220px] py-3 z-50"
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(0,7,89,0.08)',
                    boxShadow: '0 12px 40px rgba(0,7,89,0.14)',
                  }}
                >
                  {/* Keyline accent at top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: 'linear-gradient(90deg, #1C54F4, #4D93FF, transparent)' }}
                  />

                  <p className="px-6 pb-2 text-[9px] font-bold uppercase text-[#7B8BBD]" style={{ letterSpacing: '0.18em' }}>
                    Biura w Polsce
                  </p>

                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/biura-serwisowane/${c.slug}`}
                      className="flex items-center gap-3 px-6 py-2.5 text-[11px] font-bold uppercase text-[#000759] hover:bg-[#f2f4f6] hover:text-[#1C54F4] transition-colors group"
                      style={{ letterSpacing: '0.14em' }}
                    >
                      <span className="w-1 h-1 rounded-full bg-[#ACBBE8] group-hover:bg-[#1C54F4] transition-colors flex-shrink-0" />
                      {c.label}
                    </Link>
                  ))}

                  <div className="border-t border-[#f2f4f6] mt-2 pt-2">
                    <Link
                      href="/biura-serwisowane"
                      className="flex items-center gap-3 px-6 py-2.5 text-[11px] font-bold uppercase text-[#1C54F4] hover:bg-[#EDF2FF] transition-colors"
                      style={{ letterSpacing: '0.14em' }}
                    >
                      Wszystkie lokalizacje →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <a href="#" className="nav-link h-full flex items-center">O nas</a>
            <a href="#" className="nav-link h-full flex items-center">Blog</a>
          </nav>
        </div>

        {/* Right: Compare + CTA */}
        <div className="hidden lg:flex items-center gap-6">
          <BasketDropdown onOpenForm={onOpenForm} variant="desktop" />
          <button onClick={onOpenForm} className="btn-primary">
            Otrzymaj ofertę
          </button>
        </div>

        {/* Mobile actions */}
        <div className="flex lg:hidden items-center gap-4">
          <BasketDropdown onOpenForm={onOpenForm} />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 text-[#000759]"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t border-[#e7e8ea] bg-white"
          style={{ boxShadow: '0 8px 32px rgba(0,7,89,0.12)' }}
        >
          <div className="px-8 py-4 flex flex-col gap-1">
            <p className="text-[9px] font-bold uppercase text-[#7B8BBD] mb-3" style={{ letterSpacing: '0.2em' }}>
              Biura serwisowane
            </p>
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/biura-serwisowane/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="py-2.5 pl-2 text-[11px] font-bold uppercase text-[#000759] hover:text-[#1C54F4] border-b border-[#f2f4f6] transition-colors"
                style={{ letterSpacing: '0.14em' }}
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/biura-serwisowane"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 pl-2 text-[11px] font-bold uppercase text-[#1C54F4]"
              style={{ letterSpacing: '0.14em' }}
            >
              Wszystkie lokalizacje →
            </Link>
            <button
              onClick={() => { onOpenForm?.(); setMobileOpen(false) }}
              className="btn-primary mt-4 w-full justify-center"
            >
              Otrzymaj ofertę
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
