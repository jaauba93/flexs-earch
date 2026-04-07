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
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-[var(--shadow-sm)]' : ''}`}
      style={{ borderBottom: scrolled ? 'none' : '1px solid var(--colliers-border)' }}
    >
      <div className="container-colliers flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo-light.png"
            alt="Colliers Flex"
            width={160}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <button className="nav-link flex items-center gap-1 py-5">
              Biura serwisowane <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 bg-[var(--colliers-blue)] shadow-[var(--shadow-md)] min-w-[220px] py-2 z-50">
                {cities.map((c) => (
                  <Link key={c.slug} href={`/biura-serwisowane/${c.slug}`}
                    className="block px-6 py-2.5 text-white text-sm hover:bg-[var(--colliers-blue-mid)] transition-colors">
                    {c.label}
                  </Link>
                ))}
                <div className="border-t border-[var(--colliers-blue-mid)] mt-2 pt-2">
                  <Link href="/biura-serwisowane"
                    className="block px-6 py-2.5 text-white text-sm hover:bg-[var(--colliers-blue-mid)] transition-colors font-semibold">
                    Wszystkie lokalizacje →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={onOpenForm} className="btn-primary text-sm py-2 px-6">
            Otrzymaj ofertę
          </button>
          <BasketDropdown onOpenForm={onOpenForm} />
        </div>

        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-3">
          <BasketDropdown onOpenForm={onOpenForm} />
          <button onClick={() => setMobileOpen((v) => !v)} className="p-2 text-[var(--colliers-navy)]"
            aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--colliers-border)] bg-white">
          <div className="container-colliers py-4 flex flex-col gap-1">
            <p className="overline text-xs mb-2">Biura serwisowane</p>
            {cities.map((c) => (
              <Link key={c.slug} href={`/biura-serwisowane/${c.slug}`}
                onClick={() => setMobileOpen(false)}
                className="nav-link py-2 pl-2 border-b border-[var(--colliers-bg-gray)]">
                {c.label}
              </Link>
            ))}
            <Link href="/biura-serwisowane" onClick={() => setMobileOpen(false)}
              className="nav-link py-2 pl-2 font-semibold">
              Wszystkie lokalizacje →
            </Link>
            <button onClick={() => { onOpenForm?.(); setMobileOpen(false) }}
              className="btn-primary mt-4 w-full justify-center">
              Otrzymaj ofertę
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
