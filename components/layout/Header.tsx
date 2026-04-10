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
      className={`sticky top-0 z-40 h-20 nav-glass transition-shadow duration-200 ${scrolled ? 'shadow-[0_2px_20px_rgba(0,7,89,0.08)]' : 'border-b border-black/5'}`}
    >
      <div className="w-full px-8 lg:px-16 flex justify-between items-center h-full">

        {/* Left: Logo + Nav */}
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
              <button className="nav-link active flex items-center gap-1 h-full border-b-2 border-[#1C54F4] opacity-100">
                Wyszukaj <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 bg-white shadow-[0_8px_32px_rgba(0,7,89,0.12)] min-w-[200px] py-2 z-50 border border-black/5">
                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/biura-serwisowane/${c.slug}`}
                      className="block px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#000759] hover:bg-[var(--surface-container-low)] hover:text-[#1C54F4] transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}
                  <div className="border-t border-[var(--surface-container-high)] mt-1 pt-1">
                    <Link
                      href="/biura-serwisowane"
                      className="block px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#1C54F4] hover:bg-[var(--surface-container-low)] transition-colors"
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
            className="p-2 text-[var(--colliers-navy)]"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[var(--colliers-border)] bg-white">
          <div className="px-8 py-4 flex flex-col gap-1">
            <p className="overline text-[10px] mb-3">Biura serwisowane</p>
            {cities.map((c) => (
              <Link
                key={c.slug}
                href={`/biura-serwisowane/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="py-2 pl-2 text-[11px] font-bold uppercase tracking-widest text-[var(--colliers-navy)] hover:text-[#1C54F4] border-b border-[var(--surface-container-high)] transition-colors"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/biura-serwisowane"
              onClick={() => setMobileOpen(false)}
              className="py-2 pl-2 text-[11px] font-bold uppercase tracking-widest text-[#1C54F4]"
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
