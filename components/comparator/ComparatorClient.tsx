'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Mail, Phone } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import { useBasketContext } from '@/lib/context/BasketContext'
import { createClient } from '@/lib/supabase/client'
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

      <div className="container-colliers py-10">
        <h1 className="heading-serif text-3xl mb-8"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
          Porównaj i uzyskaj ofertę na wybrane biura
        </h1>

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
          <div className="grid lg:grid-cols-[3fr_2fr] gap-12">
            {/* Compare table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-[var(--colliers-gray)] uppercase tracking-wide py-3 pr-4 w-40">Biuro</th>
                    {listings.map((l) => (
                      <th key={l.id} className="text-left py-3 px-4 border-b border-[var(--colliers-border)]">
                        <div className="flex items-start gap-2">
                          <div className="w-12 h-10 flex-shrink-0 bg-[var(--colliers-bg-gray)] overflow-hidden">
                            {l.main_image_url ? (
                              <Image src={l.main_image_url} alt={l.name} width={48} height={40} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[var(--colliers-navy)] to-[var(--colliers-blue)]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--colliers-navy)] leading-snug">{l.name}</p>
                            <button onClick={() => removeItem(l.id)} className="text-xs text-[var(--colliers-gray)] hover:text-red-500 flex items-center gap-1 mt-1">
                              <X size={12} /> Usuń
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Adres', key: (l: FullListing) => `${l.address_street}, ${l.address_city}` },
                    { label: 'Operator', key: (l: FullListing) => l.operator.name },
                    { label: 'Maks. stanowisk', key: (l: FullListing) => l.total_workstations ? `${l.total_workstations}` : '–' },
                    { label: 'Cena / stanowisko', key: (l: FullListing) => l.price_desk_private ? `od ${l.price_desk_private.toLocaleString('pl-PL')} PLN / mies.` : '–' },
                    { label: 'Rok otwarcia', key: (l: FullListing) => l.year_opened?.toString() || '–' },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-[var(--colliers-bg-gray)]">
                      <td className="py-3 pr-4 text-xs text-[var(--colliers-gray)] font-semibold align-top">{row.label}</td>
                      {listings.map((l) => (
                        <td key={l.id} className="py-3 px-4 text-sm text-[var(--colliers-navy)] align-top">{row.key(l)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sticky contact panel */}
            <div>
              <div className="sticky top-[80px] border border-[var(--colliers-border)] p-6 flex flex-col gap-4">
                <p className="text-sm text-[var(--colliers-gray)]">
                  Masz pytania? Wyślij zapytanie o wybrane biura — doradca Colliers przygotuje dla Ciebie indywidualną ofertę.
                </p>
                <button onClick={() => setFormOpen(true)} className="btn-primary w-full justify-center">
                  Wyślij zapytanie o wybrane biura
                </button>

                {/* Advisor */}
                <div className="border-t border-[var(--colliers-border)] pt-4">
                  <p className="text-xs text-[var(--colliers-gray)] mb-3 uppercase tracking-wide font-semibold">Twój doradca Colliers</p>
                  {advisor ? (
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-[var(--colliers-bg-blue-tint)] flex items-center justify-center font-semibold text-[var(--colliers-navy)] overflow-hidden">
                        {advisor.photo_url ? (
                          <Image src={advisor.photo_url} alt={advisor.name} width={48} height={48} className="object-cover" />
                        ) : (
                          advisor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--colliers-navy)]">{advisor.name}</p>
                        {advisor.title && <p className="text-xs text-[var(--colliers-gray)] mb-2">{advisor.title}</p>}
                        <a href={`mailto:${advisor.email}`} className="text-sm text-[var(--colliers-blue-bright)] hover:underline flex items-center gap-1">
                          <Mail size={13} /> {advisor.email}
                        </a>
                        {advisor.phone && (
                          <a href={`tel:${advisor.phone}`} className="text-sm flex items-center gap-1 mt-1 hover:text-[var(--colliers-blue-bright)]">
                            <Phone size={13} /> {advisor.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-[var(--colliers-navy)]">Dział biur serwisowanych Colliers</p>
                      <a href="mailto:jakub.bawol@colliers.com" className="text-sm text-[var(--colliers-blue-bright)] hover:underline flex items-center gap-1 mt-2">
                        <Mail size={13} /> jakub.bawol@colliers.com
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
