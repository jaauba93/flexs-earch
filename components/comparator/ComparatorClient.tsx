'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Mail, Phone, ArrowUp } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import MapView from '@/components/search/MapView'
import UnavailableValueTooltip from '@/components/ui/UnavailableValueTooltip'
import { useBasketContext } from '@/lib/context/BasketContext'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { formatPriceShort } from '@/lib/currency/currency'
import { getContentMessage } from '@/lib/i18n/runtime'
import { withLocalePath } from '@/lib/i18n/routing'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils/slugify'
import type { Listing, Operator, Advisor } from '@/types/database'

type FullListing = Listing & { operator: Operator; advisor: Advisor | null }

export default function ComparatorClient() {
  const { items, removeItem } = useBasketContext()
  const { currency, rates } = useCurrencyContext()
  const { locale } = useLocaleContext()
  const [listings, setListings] = useState<FullListing[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
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
  const missingPriceTooltip =
    'Nie mamy jeszcze aktualnej stawki dla tej oferty. Wyślij zapytanie, a doradca uzupełni dane po kontakcie z operatorem.'
  const t = (key: string, fallback?: string) => getContentMessage(locale, key, fallback)

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <div className="container-colliers py-12 pb-20 lg:pb-28">
        {/* Page header */}
        <div className="mb-10">
          <p className="overline mb-4">{t('compare.header.eyebrow', 'Twoje zestawienie')}</p>
          <h1
            className="text-4xl md:text-5xl font-normal text-[var(--colliers-navy)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('compare.header.title', 'Porównaj i uzyskaj ofertę na wybrane biura')}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--colliers-gray)] mb-6 text-lg">
              {t('compare.empty', 'Nie dodałeś jeszcze żadnych biur do porównywarki.')}
            </p>
            <Link href={withLocalePath(locale, '/biura-serwisowane')} className="btn-primary">
              {t('compare.empty_cta', 'Przeglądaj biura')}
            </Link>
          </div>
        ) : loading ? (
          <p className="text-[var(--colliers-gray)]">{t('compare.loading', 'Ładowanie…')}</p>
        ) : (
          <>
            {/* Advisor card + CTA */}
            <div className="mb-10 border border-[#d8e0f3] bg-[linear-gradient(120deg,#ffffff_0%,#f8fbff_50%,#f4f8ff_100%)]">
              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr]">
                <div className="p-7 md:p-8 lg:p-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] mb-5">
                    {t('compare.advisor.eyebrow', 'Twój doradca Colliers')}
                  </p>
                  <div className="flex items-center gap-5">
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
                      <p className="font-semibold text-[var(--colliers-navy)] text-lg leading-tight">
                        {advisor ? advisor.name : 'Dział biur serwisowanych Colliers'}
                      </p>
                      {advisor?.title && (
                        <p className="text-sm text-[var(--colliers-gray)] mt-1">{advisor.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6">
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
                <div className="border-t md:border-t-0 md:border-l border-[#d8e0f3] p-7 md:p-8 lg:p-10 bg-white/65 flex flex-col justify-center">
                  <p className="text-sm text-[var(--colliers-gray)] leading-relaxed mb-5">
                    {t('compare.advisor.body', 'Masz pytania? Wyślij zapytanie o wybrane biura — doradca Colliers przygotuje dla Ciebie indywidualną ofertę.')}
                  </p>
                  <button
                    onClick={() => setFormOpen(true)}
                    className="btn-primary whitespace-nowrap self-start"
                  >
                    {t('compare.advisor.cta', 'Wyślij zapytanie ofertowe')}
                  </button>
                </div>
              </div>
            </div>

            {/* Full-width comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '760px' }}>
                <thead>
                  <tr className="border-b-2 border-[var(--colliers-navy)]">
                    {[
                      '',
                      t('compare.table.col_name', 'Nazwa biura'),
                      t('compare.table.col_address', 'Adres'),
                      t('compare.table.col_operator', 'Operator'),
                      t('compare.table.col_workstations', 'Stanowiska'),
                      t('compare.table.col_price', 'Cena (biurko)'),
                      t('compare.table.col_year', 'Rok'),
                      '',
                    ].map((col) => (
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
                    const href = withLocalePath(locale, `/biura-serwisowane/${citySlug}/${districtSlug}/${l.slug}`)
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
                                <span className="text-white/20 text-xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>CF</span>
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
                              {t('compare.table.featured', 'Polecane')}
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
                                {formatPriceShort(l.price_desk_private, currency, rates)}
                              </span>
                              <span className="text-[10px] text-[var(--colliers-gray)] block">/ mies.</span>
                            </>
                          ) : (
                            <UnavailableValueTooltip value="na zapytanie" tooltip={missingPriceTooltip} />
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
                            title={t('compare.remove_title', 'Usuń z porównywarki')}
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

            {/* Map under table */}
            <div className="mt-16 mb-16">
              <div className="flex items-end justify-between gap-6 mb-5">
                <div>
                  <p className="overline mb-4">Mapa porównywarki</p>
                  <h2
                    className="text-2xl md:text-3xl font-normal text-[var(--colliers-navy)]"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Wybrane biura na mapie
                  </h2>
                </div>
                <p className="text-sm text-[var(--colliers-gray)] max-w-xl text-right">
                  Kliknij punkt, aby otworzyć etykietę i w tym samym miejscu usunąć lokalizację z porównywarki.
                </p>
              </div>
              <div className="h-[460px] border border-[var(--colliers-border)] overflow-hidden">
                <MapView
                  listings={listings}
                  highlightedId={null}
                  onMarkerClick={() => {}}
                  initialCity={listings[0]?.address_city ? slugify(listings[0].address_city) : undefined}
                  showDistrictGrid
                  showMetroLines
                />
              </div>
            </div>

            {/* Footer actions bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-[var(--colliers-border)]">
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
      {wizardOpen && <OfficeModelWizard onClose={() => setWizardOpen(false)} />}
    </>
  )
}
