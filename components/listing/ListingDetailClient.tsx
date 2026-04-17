'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { CheckCircle, Mail, Phone, ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import ListingCard from '@/components/search/ListingCard'
import NearbyExplorer from '@/components/listing/NearbyExplorer'
import { useBasketContext } from '@/lib/context/BasketContext'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'
import { formatPricePreview } from '@/lib/currency/currency'
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
  const { currency, rates } = useCurrencyContext()
  const inBasket = mounted && isInBasket(listing.id)
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const anchorWrapperRef = useRef<HTMLDivElement>(null)
  const [anchorStop, setAnchorStop] = useState(false)

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

  const sectionTabs = [
    { id: 'o-biurze', label: 'O biurze' },
    { id: 'galeria', label: 'Galeria' },
    { id: 'udogodnienia', label: 'Udogodnienia' },
    { id: 'lokalizacja', label: 'Otoczenie' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (!anchorWrapperRef.current) return
      const rect = anchorWrapperRef.current.getBoundingClientRect()
      setAnchorStop(rect.bottom < window.innerHeight - 32)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <section className="bg-white">
        <div className="container-colliers pt-12">
          <div className="max-w-4xl text-sm text-[#7181aa]">
            <Breadcrumbs crumbs={crumbs} />
          </div>
          <div className="relative pt-6">
            <h1
              id="o-biurze"
              className="text-[#000759]"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.7rem, 4.4vw, 4.6rem)', lineHeight: 1.04 }}
            >
              {listing.name}
            </h1>
            <p className="text-body-strong mt-4 max-w-3xl text-[20px] font-normal leading-relaxed">
              {listing.address_street}, {listing.address_postcode}, {listing.address_district ? `${listing.address_district}, ` : ''}{listing.address_city}
            </p>

            <div className="hidden lg:block">
              <div className={`pointer-events-none fixed left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 transition-all duration-300 ${anchorStop ? 'opacity-0' : 'opacity-100'}`} style={{ bottom: '32px' }}>
                <div className="pointer-events-auto mx-auto inline-flex w-full items-center justify-between gap-2 border border-[rgba(0,7,89,0.1)] bg-white px-4 py-4 shadow-[0_24px_48px_rgba(0,7,89,0.18)]">
                  {sectionTabs.map((tab) => (
                    <a
                      key={tab.id}
                      href={`#${tab.id}`}
                      className="inline-flex h-[44px] items-center justify-center whitespace-nowrap border border-[#dbe4f8] px-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#000759] transition-all duration-200 hover:bg-[#000759] hover:text-white hover:border-[#000759]"
                    >
                      {tab.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 translate-y-1/2 lg:hidden">
              <div className="inline-flex flex-wrap items-center gap-2 border border-[rgba(0,7,89,0.1)] bg-white px-3 py-3 shadow-[0_18px_36px_rgba(0,7,89,0.12)]">
                {sectionTabs.map((tab) => (
                  <a
                    key={tab.id}
                    href={`#${tab.id}`}
                    className="inline-flex min-h-[44px] items-center justify-center border border-[#dbe4f8] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#000759] transition-all duration-200 hover:bg-[var(--colliers-navy)] hover:text-white"
                  >
                    {tab.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-colliers py-20" ref={anchorWrapperRef}>

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
                <span className="text-white/30 text-6xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>CF</span>
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
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          {/* Left — info */}
          <div>
            <section className="mb-10">
              <p className="overline mb-5">Warunki komercyjne</p>
              <div className="surface-shell grid grid-cols-2 gap-4 p-6 sm:grid-cols-3">
              {[
                { label: 'Cena (biuro prywatne)', value: listing.price_desk_private ? formatPricePreview(listing.price_desk_private, currency, rates).replace(' / stanowisko / miesiąc', ' / st. / mies.') : '–' },
                { label: 'Hot-desk', value: listing.price_desk_hotdesk ? formatPricePreview(listing.price_desk_hotdesk, currency, rates).replace(' / stanowisko / miesiąc', ' / st. / mies.') : '–' },
                { label: 'Łączna liczba stanowisk', value: listing.total_workstations ? `${listing.total_workstations} stanowisk` : '–' },
                { label: 'Wielkość gabinetów', value: (listing.min_office_size && listing.max_office_size) ? `od ${listing.min_office_size} do ${listing.max_office_size} stanowisk` : '–' },
                { label: 'Rok otwarcia', value: listing.year_opened?.toString() || '–' },
                { label: 'Operator', value: listing.operator.name },
              ].map(({ label, value }) => (
                <div key={label} className="surface-panel-soft px-4 py-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6879a4]">{label}</p>
                  <p className="text-sm font-semibold text-[var(--colliers-navy)]">{value}</p>
                </div>
              ))}
              </div>
            </section>

            {listing.description && (
              <section className="mb-10">
                <p className="overline mb-5">Opis biura</p>
                <p className={`text-body-strong leading-relaxed ${!descExpanded && listing.description.length > 200 ? 'line-clamp-4' : ''}`}>
                  {listing.description}
                </p>
                {listing.description.length > 200 && (
                  <button onClick={() => setDescExpanded((v) => !v)}
                    className="mt-2 text-sm text-[var(--colliers-blue-bright)] font-semibold hover:underline">
                    {descExpanded ? 'Pokaż mniej' : 'Pokaż więcej'}
                  </button>
                )}
              </section>
            )}

            {listing.amenities.length > 0 && (
              <section id="udogodnienia" className="mb-12">
                <p className="overline mb-5">Udogodnienia</p>
                {amenitiesSpace.length > 0 && (
                  <>
                    <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6d7da7]">Udogodnienia w biurze</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                      {amenitiesSpace.map(({ amenity }) => (
                        <div key={amenity.id} className="surface-panel-soft flex flex-col items-center gap-2 p-3 text-center">
                          <CheckCircle size={20} style={{ color: 'var(--colliers-blue-bright)' }} />
                          <p className="text-xs text-[var(--colliers-navy)] leading-snug">{amenity.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {amenitiesBuilding.length > 0 && (
                  <>
                    <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6d7da7]">Udogodnienia w budynku</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {amenitiesBuilding.map(({ amenity }) => (
                        <div key={amenity.id} className="surface-panel-soft flex flex-col items-center gap-2 p-3 text-center">
                          <CheckCircle size={20} style={{ color: 'var(--colliers-gray)' }} />
                          <p className="text-xs text-[var(--colliers-navy)] leading-snug">{amenity.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

          </div>

          {/* Right — sticky contact panel */}
          <div>
            <div className="surface-panel sticky top-[120px] flex flex-col gap-4 p-6">
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
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6c7ca7]">Twój doradca Colliers</p>
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
                      {listing.advisor.title && <p className="mb-2 text-xs text-[#5d6d97]">{listing.advisor.title}</p>}
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

        <section id="lokalizacja" className="mb-12">
          <p className="overline mb-5">Otoczenie biura</p>
          <NearbyExplorer
            listingName={listing.name}
            addressLabel={`${listing.address_street}, ${listing.address_city}`}
            latitude={listing.latitude}
            longitude={listing.longitude}
          />
        </section>

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
      {wizardOpen && <OfficeModelWizard onClose={() => setWizardOpen(false)} />}
    </>
  )
}
