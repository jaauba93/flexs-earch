'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useBasketContext } from '@/lib/context/BasketContext'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'
import { formatPricePreview } from '@/lib/currency/currency'
import UnavailableValueTooltip from '@/components/ui/UnavailableValueTooltip'
import { slugify } from '@/lib/utils/slugify'
import type { Listing, Operator } from '@/types/database'

interface ListingCardProps {
  listing: Listing & { operator: Operator }
  onOpenForm?: (_listing?: Listing & { operator: Operator }) => void
  highlighted?: boolean
  selectedWorkstationsFrom?: number | null
  selectedWorkstationsTo?: number | null
}

export default function ListingCard({ listing, highlighted, selectedWorkstationsFrom = null, selectedWorkstationsTo = null }: ListingCardProps) {
  const { addItem, removeItem, isInBasket, mounted } = useBasketContext()
  const { currency, rates } = useCurrencyContext()
  const inBasket = mounted && isInBasket(listing.id)
  const missingPriceTooltip =
    'Nie mamy jeszcze aktualnej stawki dla tej oferty. Wyślij zapytanie, a doradca uzupełni dane po kontakcie z operatorem.'

  const citySlug = slugify(listing.address_city)
  const districtSlug = listing.address_district ? slugify(listing.address_district) : '_'
  const href = `/biura-serwisowane/${citySlug}/${districtSlug}/${listing.slug}`

  const basketItem = {
    id: listing.id,
    name: listing.name,
    address_street: listing.address_street,
    address_city: listing.address_city,
    address_district: listing.address_district,
    address_postcode: listing.address_postcode,
    main_image_url: listing.main_image_url,
    slug: listing.slug,
  }

  const pricePerDeskLabel = listing.price_desk_private
    ? formatPricePreview(listing.price_desk_private, currency, rates).replace(' / stanowisko / miesiąc', '')
    : null

  const totalPriceFromLabel =
    listing.price_desk_private && selectedWorkstationsFrom
      ? formatPricePreview(listing.price_desk_private * selectedWorkstationsFrom, currency, rates).replace(' / stanowisko / miesiąc', '')
      : null

  const totalPriceToLabel =
    listing.price_desk_private && selectedWorkstationsTo
      ? formatPricePreview(listing.price_desk_private * selectedWorkstationsTo, currency, rates).replace(' / stanowisko / miesiąc', '')
      : null

  const totalPriceRows = [
    selectedWorkstationsFrom
      ? {
          label: `${selectedWorkstationsFrom} st.`,
          value: totalPriceFromLabel ? (
            totalPriceFromLabel
          ) : (
            <UnavailableValueTooltip value="na zapytanie" tooltip={missingPriceTooltip} />
          ),
        }
      : null,
    selectedWorkstationsTo && selectedWorkstationsTo !== selectedWorkstationsFrom
      ? {
          label: `${selectedWorkstationsTo} st.`,
          value: totalPriceToLabel ? (
            totalPriceToLabel
          ) : (
            <UnavailableValueTooltip value="na zapytanie" tooltip={missingPriceTooltip} />
          ),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string | JSX.Element }>

  return (
    <article
      className={`relative flex flex-row bg-white group cursor-pointer h-[200px] overflow-hidden transition-all duration-300 ${
        highlighted
          ? 'shadow-[0_0_0_2px_#1C54F4,0_4px_20px_rgba(28,84,244,0.15)]'
          : 'border border-[#e7e8ea] hover:border-[#1C54F4] hover:shadow-[0_4px_20px_rgba(0,7,89,0.1)]'
      }`}
    >
      {/* Cover link */}
      <Link href={href} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true" />

      {/* Keyline left accent — brand signature element, animates on hover */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] z-10 transition-all duration-300 origin-top"
        style={{
          background: highlighted
            ? 'linear-gradient(to bottom, #1C54F4, #4D93FF)'
            : 'linear-gradient(to bottom, #1C54F4, transparent)',
          transform: highlighted ? 'scaleY(1)' : 'scaleY(0)',
        }}
      />
      <style jsx>{`
        article:hover .keyline-left { transform: scaleY(1) !important; }
      `}</style>
      <div
        className="keyline-left absolute left-0 top-0 bottom-0 w-[2px] z-10 transition-transform duration-400 origin-top"
        style={{
          background: 'linear-gradient(to bottom, #1C54F4, #4D93FF)',
          transform: highlighted ? 'scaleY(1)' : 'scaleY(0)',
        }}
      />

      {/* Image — 38% */}
      <div className="w-[38%] relative overflow-hidden flex-shrink-0">
        {listing.main_image_url ? (
          <Image
            src={listing.main_image_url}
            alt={listing.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 40vw, 20vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#000759] via-[#25408F] to-[#353E59] flex items-center justify-center">
            <span className="text-white/15 font-normal" style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 300 }}>CF</span>
          </div>
        )}
      </div>

      {/* Content — 62% */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          {/* Location + operator overline */}
          <div className="flex justify-between items-start mb-2 gap-2">
            <p
              className="text-[10px] font-bold uppercase text-[#6374a0]"
              style={{ letterSpacing: '0.14em' }}
            >
              {listing.address_district ? `${listing.address_district}` : listing.address_city}
            </p>
            <span className="ml-1 flex-shrink-0 truncate text-[10px] font-semibold text-[#7e8db4]">
              {listing.operator.name}
            </span>
          </div>

          {/* Name — Open Sans Light at mid size */}
          <h3
            className="text-[#000759] leading-tight group-hover:text-[#1C54F4] transition-colors duration-200"
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {listing.name}
          </h3>
        </div>

        {/* Bottom — price + actions */}
        <div className="mt-2 border-t border-[#edf2f9] pt-3">
          <div className="mb-2">
            <p className="mb-0.5 text-[9px] font-bold uppercase text-[#7d8cb4]" style={{ letterSpacing: '0.14em' }}>Cena od</p>
            <p className="font-bold text-[#000759] leading-none" style={{ fontSize: '0.95rem' }}>
              {pricePerDeskLabel ? (
                <>{pricePerDeskLabel} <span className="text-[10px] font-normal text-[#7d8cb4]">/ st. / mies.</span></>
              ) : (
                <UnavailableValueTooltip value="na zapytanie" tooltip={missingPriceTooltip} />
              )}
            </p>
            {totalPriceRows.length > 0 ? (
              <div className="mt-2 grid gap-1">
                {totalPriceRows.map((row) => (
                  <p key={row.label} className="text-[10px] font-semibold leading-snug text-[#56648F]">
                    {row.label}: <span className="text-[#000759]">{row.value}</span>
                  </p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="relative z-10 flex flex-wrap items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (inBasket) { removeItem(listing.id) } else { addItem(basketItem) }
                }}
                className={`inline-flex items-center gap-1.5 border px-3 py-2 text-[9px] font-bold uppercase transition-colors ${
                  inBasket
                    ? 'border-[#ED1B34]/30 bg-[#fff5f6] text-[#ED1B34] hover:text-[#B51227]'
                    : 'border-[#d9e3f5] text-[#56648F] hover:border-[#1C54F4] hover:text-[#1C54F4]'
                }`}
                style={{ letterSpacing: '0.12em' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {inBasket
                    ? <><line x1="5" y1="12" x2="19" y2="12"/></>
                    : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                  }
                </svg>
                {inBasket ? 'Usuń' : 'Porównaj'}
              </button>

              <Link
                href={href}
                className="inline-flex items-center gap-1 border border-[#d9e3f5] px-3 py-2 text-[9px] font-bold uppercase text-[#000759] transition-colors hover:border-[#1C54F4] hover:text-[#1C54F4]"
                style={{ letterSpacing: '0.12em' }}
              >
                Szczegóły
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
