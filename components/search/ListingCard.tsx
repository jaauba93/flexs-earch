'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Check, Plus } from 'lucide-react'
import { useBasketContext } from '@/lib/context/BasketContext'
import { slugify } from '@/lib/utils/slugify'
import type { Listing, Operator } from '@/types/database'

interface ListingCardProps {
  listing: Listing & { operator: Operator }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOpenForm?: (_listing?: Listing & { operator: Operator }) => void
  highlighted?: boolean
}

export default function ListingCard({ listing, onOpenForm, highlighted }: ListingCardProps) {
  const { addItem, removeItem, isInBasket, isFull, mounted } = useBasketContext()
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
    <div className={`card flex flex-col transition-shadow hover:shadow-[var(--shadow-md)] ${highlighted ? 'ring-2 ring-[var(--colliers-blue-bright)]' : ''}`}>
      {/* Image */}
      <div className="relative h-44 bg-[var(--colliers-bg-gray)] overflow-hidden">
        {listing.is_featured && (
          <span className="badge-featured absolute top-3 left-3 z-10">Polecane</span>
        )}
        {listing.main_image_url ? (
          <Image
            src={listing.main_image_url}
            alt={listing.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--colliers-navy)] to-[var(--colliers-blue)] flex items-center justify-center">
            <span className="text-white/30 text-4xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>CF</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-2">
        <p className="text-xs text-[var(--colliers-gray)]">{listing.operator.name}</p>
        <h3 className="font-semibold text-[var(--colliers-navy)] text-base leading-snug">{listing.name}</h3>
        <p className="text-sm text-[var(--colliers-gray)]">
          {listing.address_district ? `${listing.address_district}, ` : ''}{listing.address_city}
        </p>
        <p className="text-sm font-semibold text-[var(--colliers-navy)] mt-1">
          {listing.price_desk_private
            ? `od ${listing.price_desk_private.toLocaleString('pl-PL')} PLN / stanowisko / mies.`
            : '–'}
        </p>

        <div className="flex flex-col gap-2 mt-auto pt-3">
          <Link href={href} className="btn-primary text-sm py-2.5 justify-center">
            Zobacz szczegóły
          </Link>
          <button
            onClick={() => inBasket ? removeItem(listing.id) : addItem(basketItem)}
            disabled={!inBasket && isFull}
            className={`text-sm py-2 px-4 border font-semibold transition-colors flex items-center justify-center gap-2 ${
              inBasket
                ? 'border-[var(--colliers-green)] text-[var(--colliers-green)] bg-[#F9FFFA]'
                : 'btn-outline'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={!inBasket && isFull ? 'Osiągnięto limit 10 biur. Usuń jedno, żeby dodać kolejne.' : undefined}
          >
            {inBasket ? <Check size={15} /> : <Plus size={15} />}
            {inBasket ? 'Dodano' : 'Dodaj do porównywarki'}
          </button>
        </div>
      </div>
    </div>
  )
}
