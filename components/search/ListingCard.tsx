'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useBasketContext } from '@/lib/context/BasketContext'
import { slugify } from '@/lib/utils/slugify'
import type { Listing, Operator } from '@/types/database'

interface ListingCardProps {
  listing: Listing & { operator: Operator }
  onOpenForm?: (_listing?: Listing & { operator: Operator }) => void
  highlighted?: boolean
}

export default function ListingCard({ listing, highlighted }: ListingCardProps) {
  const { addItem, removeItem, isInBasket, mounted } = useBasketContext()
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
      className={`relative flex flex-row bg-white border group cursor-pointer transition-colors h-[210px] overflow-hidden ${
        highlighted
          ? 'border-[#1C54F4]'
          : 'border-[var(--colliers-border)] hover:border-[#1C54F4]'
      }`}
    >
      {/* Cover link — spans entire card, interactive elements use z-10 to sit above it */}
      <Link href={href} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true" />

      {/* Image — 40% */}
      <div className="w-2/5 relative overflow-hidden flex-shrink-0">
        {listing.is_featured && (
          <div className="absolute top-0 left-0 z-10 badge-featured">Polecane</div>
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
          <div className="w-full h-full bg-gradient-to-br from-[#000759] to-[#25408F] flex items-center justify-center">
            <span className="text-white/20 text-3xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>CF</span>
          </div>
        )}
      </div>

      {/* Content — 60% */}
      <div className="w-3/5 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {listing.address_district ? `${listing.address_district}, ` : ''}{listing.address_city}
            </p>
            <span className="text-[9px] text-slate-400 font-semibold truncate ml-2">
              {listing.operator.name}
            </span>
          </div>
          <h3 className="text-base font-bold text-[#000759] leading-tight group-hover:text-[#1C54F4] transition-colors">
            {listing.name}
          </h3>
          {listing.description && (
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed line-clamp-2">
              {listing.description}
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="mb-2">
            <p className="text-[9px] text-slate-400 mb-0.5">Cena od</p>
            <p className="text-base font-bold text-[#000759]">
              {listing.price_desk_private
                ? <>{listing.price_desk_private.toLocaleString('pl-PL')} PLN <span className="text-[10px] font-normal text-slate-400">/ mies.</span></>
                : <span className="text-slate-400 text-sm font-normal">–</span>
              }
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (inBasket) { removeItem(listing.id) } else { addItem(basketItem) }
              }}
              className={`relative z-10 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${
                inBasket
                  ? 'text-[#468254]'
                  : 'text-[#000759] hover:text-[#1C54F4]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {inBasket
                  ? <><polyline points="20 6 9 17 4 12"/></>
                  : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                }
              </svg>
              {inBasket ? 'Dodano' : 'Porównaj'}
            </button>

            <Link
              href={href}
              className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-[#000759] hover:text-[#1C54F4] transition-colors flex items-center gap-1"
            >
              Szczegóły <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
