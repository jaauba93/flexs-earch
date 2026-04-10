'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle, Mail, Phone, ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import MapView from '@/components/search/MapView'
import ContactForm from '@/components/forms/ContactForm'
import ListingCard from '@/components/search/ListingCard'
import { useBasketContext } from '@/lib/context/BasketContext'
import type { Listing, Operator, Advisor, ListingImage, Amenity } from '@/types/database'

interface FullListing extends Listing {
  operator: Operator
  advisor: Advisor | null
  images: ListingImage[]
  amenities: { amenity: Amenity }[]
}

interface Props {
  listing: FullListing
  relatedListings: (Listing & { operator: Operator })[]
  citySlug: string
  districtSlug: string
}

export default function ListingDetailClient({ listing, relatedListings, citySlug, districtSlug }: Props) {
  const { addItem, removeItem, isInBasket, isFull, mounted } = useBasketContext()
  const inBasket = mounted && isInBasket(listing.id)
  const [formOpen, setFormOpen] = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)

  const images = listing.images.length > 0 ? listing.images : []
  const allImages = listing.main_image_url
    ? [{ id: 'main', image_url: listing.main_image_url, alt_text: listing.name, sort_order: -1, listing_id: listing.id, created_at: '' }, ...images]
    : images

  const amenitiesSpace = listing.amenities.filter((a) => a.amenity.category === 'space' || a.amenity.category === 'operator')
  const amenitiesBuilding = listing.amenities.filter((a) => a.amenity.category === 'building')

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

  const crumbs = [
    { label: 'Strona główna', href: '/' },
    { label: listing.address_city, href: `/biura-serwisowane/${citySlug}` },
    ...(listing.address_district ? [{ label: listing.address_district, href: `/biura-serwisowane/${citySlug}/${districtSlug}` }] : []),
    { label: listing.name },
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address_street,
      addressLocality: listing.address_city,
      postalCode: listing.address_postcode,
      addressCountry: 'PL',
    },
    geo: { '@type': 'GeoCoordinates', latitude: listing.latitude, longitude: listing.longitude },
    ...(listing.price_desk_private ? { priceRange: `od ${listing.price_desk_private} PLN` } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header onOpenForm={() => setFormOpen(true)} />

      <div className="container-colliers">
        <Breadcrumbs crumbs={crumbs} />
      </div>

      {/* Sticky inner tabs */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-[var(--colliers-border)] shadow-[var(--shadow-sm)]">
        <div className="container-colliers flex gap-6 overflow-x-auto">
          {['O biurze', 'Galeria', 'Lokalizacja', 'Udogodnienia'].map((tab) => (
            <a key={tab} href={`#${tab.toLowerCase().replace(' ', '-')}`}
              className="py-3 text-sm font-semibold text-[var(--colliers-gray)] hover:text-[var(--colliers-navy)] whitespace-nowrap border-b-2 border-transparent hover:border-[var(--colliers-navy)] transition-colors">
              {tab}
            </a>
          ))}
        </div>
      </div>

      <div className="container-colliers py-8">
        {/* Heading */}
        <h1 id="o-biurze" className="text-3xl font-semibold text-[var(--colliers-navy)] mb-1">{listing.name}</h1>
        <p className="text-[var(--colliers-gray)] mb-6">{listing.address_street}, {listing.address_postcode}, {listing.address_district ? `${listing.address_district}, ` : ''}{listing.address_city}</p>

        {/* Gallery */}
        <section id="galeria" className="mb-10">
          <div className="relative overflow-hidden bg-[var(--colliers-bg-gray)]" style={{ height: '420px' }}>
            {allImages.length > 0 ? (
              <Image
                src={allImages[galleryIdx]?.image_url}
                alt={allImages[galleryIdx]?.alt_text || listing.name}
                fill
                className="object-cover"
                style={{ transition: 'opacity 0.3s ease' }}
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--colliers-navy)] to-[var(--colliers-blue)] flex items-center justify-center">
                <span className="text-white/30 text-6xl font-light" style={{ fontFamily: 'var(--font-serif)' }}>CF</span>
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setGalleryIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow-md transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setGalleryIdx((i) => (i + 1) % allImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow-md transition-colors">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button key={img.id} onClick={() => setGalleryIdx(i)}
                  className={`flex-shrink-0 w-20 h-14 overflow-hidden border-2 transition-colors ${i === galleryIdx ? 'border-[var(--colliers-navy)]' : 'border-transparent'}`}>
                  <Image src={img.image_url} alt={img.alt_text || ''} width={80} height={56} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Main grid: 60/40 */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-12">
          {/* Left — info */}
          <div>
            {/* Key data */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 p-6 bg-[var(--colliers-bg-light-blue)]">
              {[
                { label: 'Cena (biuro prywatne)', value: listing.price_desk_private ? `od ${listing.price_desk_private.toLocaleString('pl-PL')} PLN / st. / mies.` : '–' },
                { label: 'Hot-desk', value: listing.price_desk_hotdesk ? `od ${listing.price_desk_hotdesk.toLocaleString('pl-PL')} PLN / st. / mies.` : '–' },
                { label: 'Łączna liczba stanowisk', value: listing.total_workstations ? `${listing.total_workstations} stanowisk` : '–' },
                { label: 'Wielkość gabinetów', value: (listing.min_office_size && listing.max_office_size) ? `od ${listing.min_office_size} do ${listing.max_office_size} stanowisk` : '–' },
                { label: 'Rok otwarcia', value: listing.year_opened?.toString() || '–' },
                { label: 'Operator', value: listing.operator.name },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-[var(--colliers-gray)] mb-1">{label}</p>
                  <p className="font-semibold text-[var(--colliers-navy)] text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mb-8">
                <p className={`text-[var(--colliers-gray)] leading-relaxed ${!descExpanded && listing.description.length > 200 ? 'line-clamp-4' : ''}`}>
                  {listing.description}
                </p>
                {listing.description.length > 200 && (
                  <button onClick={() => setDescExpanded((v) => !v)}
                    className="mt-2 text-sm text-[var(--colliers-blue-bright)] font-semibold hover:underline">
                    {descExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right — sticky contact panel */}
          <div>
            <div className="sticky top-[120px] border border-[var(--colliers-border)] p-6 flex flex-col gap-4">
              <button onClick={() => setFormOpen(true)} className="btn-primary w-full justify-center py-3 text-base">
                Otrzymaj ofertę
              </button>
              <button
                onClick={() => inBasket ? removeItem(listing.id) : addItem(basketItem)}
                disabled={!inBasket && isFull}
                className={`w-full py-2.5 px-4 border font-semibold transition-colors flex items-center justify-center gap-2 text-sm ${
                  inBasket ? 'border-[var(--colliers-green)] text-[var(--colliers-green)] bg-[#F9FFFA]' : 'btn-outline'
                }`}
              >
                {inBasket ? <Check size={16} /> : <Plus size={16} />}
                {inBasket ? 'Dodano do porównywarki' : 'Dodaj do porównywarki'}
              </button>

              {/* Advisor */}
              <div className="border-t border-[var(--colliers-border)] pt-4 mt-2">
                <p className="text-xs text-[var(--colliers-gray)] mb-3 uppercase tracking-wide font-semibold">Twój doradca Colliers</p>
                {listing.advisor ? (
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 flex-shrink-0 bg-[var(--colliers-bg-blue-tint)] flex items-center justify-center font-semibold text-[var(--colliers-navy)] overflow-hidden">
                      {listing.advisor.photo_url ? (
                        <Image src={listing.advisor.photo_url} alt={listing.advisor.name} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        listing.advisor.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--colliers-navy)]">{listing.advisor.name}</p>
                      {listing.advisor.title && <p className="text-xs text-[var(--colliers-gray)] mb-2">{listing.advisor.title}</p>}
                      <a href={`mailto:${listing.advisor.email}`} className="text-sm text-[var(--colliers-blue-bright)] hover:underline flex items-center gap-1">
                        <Mail size={13} /> {listing.advisor.email}
                      </a>
                      {listing.advisor.phone && (
                        <a href={`tel:${listing.advisor.phone}`} className="text-sm text-[var(--colliers-navy)] hover:text-[var(--colliers-blue-bright)] flex items-center gap-1 mt-1">
                          <Phone size={13} /> {listing.advisor.phone}
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

        {/* Map */}
        <section id="lokalizacja" className="mt-12 mb-12">
          <h2 className="text-xl font-semibold text-[var(--colliers-navy)] mb-4">Lokalizacja</h2>
          <div style={{ height: 360, overflow: 'hidden', position: 'relative' }}>
            <MapView
              listings={[listing as any]}
              highlightedId={listing.id}
              onMarkerClick={() => {}}
              initialCity={listing.address_city.toLowerCase()}
            />
          </div>
        </section>

        {/* Amenities */}
        {listing.amenities.length > 0 && (
          <section id="udogodnienia" className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--colliers-navy)] mb-6">Udogodnienia</h2>
            {amenitiesSpace.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-[var(--colliers-gray)] uppercase tracking-wide mb-4">Udogodnienia w biurze</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                  {amenitiesSpace.map(({ amenity }) => (
                    <div key={amenity.id} className="flex flex-col items-center gap-2 p-3 border border-[var(--colliers-border)] text-center">
                      <CheckCircle size={20} style={{ color: 'var(--colliers-blue-bright)' }} />
                      <p className="text-xs text-[var(--colliers-navy)] leading-snug">{amenity.name}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {amenitiesBuilding.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-[var(--colliers-gray)] uppercase tracking-wide mb-4">Udogodnienia w budynku</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {amenitiesBuilding.map(({ amenity }) => (
                    <div key={amenity.id} className="flex flex-col items-center gap-2 p-3 border border-[var(--colliers-border)] text-center">
                      <CheckCircle size={20} style={{ color: 'var(--colliers-gray)' }} />
                      <p className="text-xs text-[var(--colliers-navy)] leading-snug">{amenity.name}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Related */}
        {relatedListings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--colliers-navy)] mb-6">Zobacz również</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
      {formOpen && (
        <ContactForm
          onClose={() => setFormOpen(false)}
          preselectedListing={basketItem}
        />
      )}
    </>
  )
}
