'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Mail, Phone, ArrowUp } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import { useBasketContext } from '@/lib/context/BasketContext'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import type { Listing, Operator, Advisor } from '@/types/database'

type FullListing = Listing & { operator: Operator; advisor: Advisor | null }

export default function ComparatorClient() {
  const { items, removeItem } = useBasketContext()
  const [listings, setListings] = useState<FullListing[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return }

    const supabase = createClient()
    supabase
      .from('listings')
      .select('*, operator:operators(*), advisor:advisors(*)')
      .in('id', items.map((i) => i.id))
      .then(({ data }) => {
        setListings((data as FullListing[]) || [])
        setLoading(false)
      })
  }, [items])

  const advisor = listings.find((l) => l.advisor)?.advisor || null

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} />

      <div className="container-colliers py-12">
        {/* Page header */}
        <div className="mb-10">
          <p className="overline mb-4">Twoje zestawienie</p>
          <h1
            className="text-4xl md:text-5xl font-light text-[var(--colliers-navy)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Porównaj i uzyskaj ofertę<br />na wybrane biura
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--colliers-gray)] mb-6 text-lg">
              Nie dodałeś jeszcze żadnych biur do porównywarki.
            </p>
            <Link href="/biura-serwisowane" className="btn-primary">
              Przeglądaj biura
            </Link>
          </div>
        ) : loading ? (
          <p className="text-[var(--colliers-gray)]">Ładowanie…</p>
        ) : (
          <>
            {/* Advisor card + CTA */}
            <div className="flex flex-col md:flex-row gap-0 mb-10 border border-[var(--colliers-border)]">
              {/* Advisor info */}
              <div className="flex items-center gap-5 flex-1 p-6">
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-[var(--colliers-bg-blue-tint)] flex items-center justify-center font-semibold text-[var(--colliers-navy)] text-lg">
                  {advisor?.photo_url ? (
                    <Image
                      src={advisor.photo_url}
                      alt={advisor.name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span>
                      {advisor
                        ? advisor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                        : 'CF'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#1C54F4] mb-1">
                    Twój doradca Colliers
                  </p>
                  <p className="font-semibold text-[var(--colliers-navy)]">
                    {advisor ? advisor.name : 'Dział biur serwisowanych Colliers'}
                  </p>
                  {advisor?.title && (
                    <p className="text-xs text-[var(--colliers-gray)]">{advisor.title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
                    <a
                      href={`mailto:${advisor ? advisor.email : 'jakub.bawol@colliers.com'}`}
                      className="text-sm text-[var(--colliers-blue-bright)] hover:underline flex items-center gap-1"
                    >
                      <Mail size={13} />
                      {advisor ? advisor.email : 'jakub.bawol@colliers.com'}
                    </a>
                    {advisor?.phone && (
                      <a
                        href={`tel:${advisor.phone}`}
                        className="text-sm text-[var(--colliers-navy)] hover:text-[var(--colliers-blue-bright)] flex items-center gap-1 transition-colors"
                      >
                        <Phone size={13} /> {advisor.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px bg-[var(--colliers-border)]" />
              <div className="block md:hidden h-px bg-[var(--colliers-border)]" />

              {/* CTA */}
              <div className="flex flex-col justify-center gap-3 p-6 md:max-w-sm">
                <p className="text-sm text-[var(--colliers-gray)] leading-relaxed">
                  Masz pytania? Wyślij zapytanie o wybrane biura — doradca Colliers przygotuje
                  dla Ciebie indywidualną ofertę.
                </p>
                <button
                  onClick={() => setFormOpen(true)}
                  className="btn-primary whitespace-nowrap self-start"
                >
                  Wyślij zapytanie ofertowe
                </button>
              </div>
            </div>

            {/* Full-width comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '760px' }}>
                <thead>
                  <tr className="border-b-2 border-[var(--colliers-navy)]">
                    {['Zdjęcie', 'Nazwa biura', 'Adres', 'Operator', 'Stanowiska', 'Cena (biurko)', 'Rok', ''].map((col) => (
                      <th
                        key={col}
                        className="text-left py-3 pr-5 text-[10px] font-bold uppercase tracking-[3px] text-[#1C54F4] whitespace-nowrap last:pr-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => {
                    const citySlug = slugify(l.address_city)
                    const districtSlug = l.address_district ? slugify(l.address_district) : '_'
                    const href = `/biura-serwisowane/${citySlug}/${districtSlug}/${l.slug}`
                    return (
                      <tr
                        key={l.id}
                        className="border-b border-[var(--colliers-border)] hover:bg-[var(--colliers-bg-gray)] transition-colors group"
                      >
                        {/* Image */}
                        <td className="py-4 pr-5 align-top">
                          <div className="w-40 h-24 overflow-hidden bg-[var(--colliers-bg-gray)] flex-shrink-0">
                            {l.main_image_url ? (
                              <Image
                                src={l.main_image_url}
                                alt={l.name}
                                width={160}
                                height={96}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[var(--colliers-navy)] to-[var(--colliers-blue)] flex items-center justify-center">
                                <span className="text-white/20 text-xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>CF</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-4 pr-5 align-top">
                          <Link
                            href={href}
                            className="font-bold text-[var(--colliers-navy)] hover:text-[#1C54F4] transition-colors text-sm leading-snug block"
                          >
                            {l.name}
                          </Link>
                          {l.is_featured && (
                            <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-[2px] text-[#1C54F4]">
                              Polecane
                            </span>
                          )}
                        </td>

                        {/* Address */}
                        <td className="py-4 pr-5 align-top text-sm text-[var(--colliers-gray)] leading-relaxed">
                          {l.address_street}<br />
                          {l.address_postcode} {l.address_city}
                          {l.address_district && (
                            <><br /><span className="text-xs">{l.address_district}</span></>
                          )}
                        </td>

                        {/* Operator */}
                        <td className="py-4 pr-5 align-top text-sm text-[var(--colliers-navy)]">
                          {l.operator.name}
                        </td>

                        {/* Workstations */}
                        <td className="py-4 pr-5 align-top text-sm text-[var(--colliers-navy)]">
                          {l.total_workstations ? `${l.total_workstations}` : '–'}
                        </td>

                        {/* Price */}
                        <td className="py-4 pr-5 align-top">
                          {l.price_desk_private ? (
                            <>
                              <span className="font-bold text-[#1C54F4] text-sm">
                                od {l.price_desk_private.toLocaleString('pl-PL')} PLN
                              </span>
                              <span className="text-[10px] text-[var(--colliers-gray)] block">/ mies.</span>
                            </>
                          ) : (
                            <span className="text-sm text-[var(--colliers-gray)]">–</span>
                          )}
                        </td>

                        {/* Year */}
                        <td className="py-4 pr-5 align-top text-sm text-[var(--colliers-navy)]">
                          {l.year_opened || '–'}
                        </td>

                        {/* Remove */}
                        <td className="py-4 align-top">
                          <button
                            onClick={() => removeItem(l.id)}
                            className="text-[var(--colliers-gray)] hover:text-red-500 transition-colors p-1"
                            title="Usuń z porównywarki"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer actions bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-[var(--colliers-border)]">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[11px] font-bold uppercase tracking-widest text-[var(--colliers-gray)] hover:text-[var(--colliers-navy)] flex items-center gap-2 transition-colors"
              >
                <ArrowUp size={14} /> Wróć na górę
              </button>

              <div className="flex items-center gap-4">
                {advisor?.photo_url && (
                  <div className="w-8 h-8 overflow-hidden flex-shrink-0">
                    <Image
                      src={advisor.photo_url}
                      alt={advisor.name}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <button onClick={() => setFormOpen(true)} className="btn-primary">
                  Wyślij zapytanie ofertowe
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
