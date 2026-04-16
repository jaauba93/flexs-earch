'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useBasketContext } from '@/lib/context/BasketContext'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'
import { formatPricePreview } from '@/lib/currency/currency'
import { slugify } from '@/lib/utils/slugify'
import type { Listing, Operator } from '@/types/database'

interface ListingCardProps {
  listing: Listing & { operator: Operator }
  onOpenForm?: (_listing?: Listing & { operator: Operator }) => void
  highlighted?: boolean
}

export default function ListingCard({ listing, highlighted }: ListingCardProps) {
  const { addItem, removeItem, isInBasket, mounted } = useBasketContext()
  const { currency, rates } = useCurrencyContext()
  const inBasket = mounted && isInBasket(listing.id)

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
        {listing.is_featured && (
          <div className="absolute top-0 left-0 z-10 badge-featured text-[8px]">Polecane</div>
        )}
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
            <span className="text-white/15 font-light" style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 300 }}>CF</span>
          </div>
        )}
      </div>

      {/* Content — 62% */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          {/* Location + operator overline */}
          <div className="flex justify-between items-start mb-2 gap-2">
            <p
              className="text-[10px] font-bold uppercase text-[#7B8BBD]"
              style={{ letterSpacing: '0.14em' }}
            >
              {listing.address_district ? `${listing.address_district}` : listing.address_city}
            </p>
            <span className="text-[9px] text-[#ACBBE8] font-semibold truncate ml-1 flex-shrink-0">
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

          {listing.description && (
            <p className="text-[11px] text-[#7B8BBD] mt-2 leading-relaxed line-clamp-2 font-light">
              {listing.description}
            </p>
          )}
        </div>

        {/* Bottom — price + actions */}
        <div className="border-t border-[#f2f4f6] pt-3 mt-2">
          <div className="mb-2.5">
            <p className="text-[9px] font-bold uppercase text-[#ACBBE8] mb-0.5" style={{ letterSpacing: '0.14em' }}>Cena od</p>
            <p className="font-bold text-[#000759] leading-none" style={{ fontSize: '0.95rem' }}>
              {listing.price_desk_private
                ? <>{formatPricePreview(listing.price_desk_private, currency, rates).replace(' / stanowisko / miesiąc', '')} <span className="text-[10px] font-normal text-[#ACBBE8]">/ mies.</span></>
                : <span className="text-[#ACBBE8] text-sm font-normal">–</span>
              }
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (inBasket) { removeItem(listing.id) } else { addItem(basketItem) }
              }}
              className={`relative z-10 text-[9px] font-bold uppercase transition-colors flex items-center gap-1.5 ${
                inBasket
                  ? 'text-[#ED1B34] hover:text-[#B51227]'
                  : 'text-[#56648F] hover:text-[#1C54F4]'
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
              className="relative z-10 text-[9px] font-bold uppercase text-[#000759] hover:text-[#1C54F4] transition-colors flex items-center gap-1"
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
    </article>
  )
}
