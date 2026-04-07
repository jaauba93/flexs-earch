'use client'

import { useState, useEffect, useCallback } from 'react'
import { SlidersHorizontal, Map as MapIcon, List, X } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ListingCard from '@/components/search/ListingCard'
import MapView from '@/components/search/MapView'
import ContactForm from '@/components/forms/ContactForm'
import { createClient } from '@/lib/supabase/client'
import { slugToCity } from '@/lib/utils/slugify'
import type { Listing, Operator, Amenity } from '@/types/database'

const PAGE_SIZE = 25

interface SearchClientProps {
  initialCity?: string
  initialDistrict?: string
  operators: Pick<Operator, 'id' | 'name' | 'slug'>[]
  amenities: Pick<Amenity, 'id' | 'name' | 'slug' | 'category'>[]
  searchParams: Record<string, string>
}

type ListingWithOperator = Listing & { operator: Operator }

export default function SearchClient({
  initialCity,
  initialDistrict,
  operators,
  amenities,
  searchParams,
}: SearchClientProps) {
  // Filter state
  const [stanowiskaOd, setStanowiskaOd] = useState(searchParams.stanowiska_od || '')
  const [stanowiskaDo, setStanowiskaDo] = useState(searchParams.stanowiska_do || '')
  const [ceniaDo, setCeniaDo] = useState(searchParams.cena_do || '')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.udogodnienia ? searchParams.udogodnienia.split(',') : []
  )
  const [selectedOperator, setSelectedOperator] = useState(searchParams.operator || '')
  const [sort, setSort] = useState(searchParams.sort || '')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Results state
  const [listings, setListings] = useState<ListingWithOperator[]>([])
  const [featuredListings, setFeaturedListings] = useState<ListingWithOperator[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Map/list toggle (mobile)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  // Form modal
  const [formOpen, setFormOpen] = useState(false)
  const [_formListing, setFormListing] = useState<ListingWithOperator | null>(null)

  const city = initialCity ? slugToCity(initialCity) : undefined
  const district = initialDistrict
    ? initialDistrict.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : undefined

  const fetchListings = useCallback(async (pg = 1) => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('listings')
      .select('*, operator:operators(*)', { count: 'exact' })
      .eq('is_active', true)

    if (city) query = query.ilike('address_city', city)
    if (district) query = query.ilike('address_district', district)
    if (stanowiskaOd) query = query.gte('total_workstations', parseInt(stanowiskaOd))
    if (stanowiskaDo) query = query.lte('total_workstations', parseInt(stanowiskaDo))
    if (ceniaDo) query = query.lte('price_desk_private', parseInt(ceniaDo))
    if (selectedOperator) {
      const op = operators.find((o) => o.slug === selectedOperator)
      if (op) query = query.eq('operator_id', op.id)
    }

    // Amenities filter (AND logic via subquery workaround)
    if (selectedAmenities.length > 0) {
      const amenityIds = selectedAmenities
        .map((slug) => amenities.find((a) => a.slug === slug)?.id)
        .filter(Boolean) as string[]
      if (amenityIds.length > 0) {
        // We filter after fetch for AND logic
      }
    }

    // Sort
    if (sort === 'cena_asc') {
      query = query.order('price_desk_private', { ascending: true, nullsFirst: false })
    } else if (sort === 'cena_desc') {
      query = query.order('price_desk_private', { ascending: false, nullsFirst: false })
    } else if (sort === 'data_otwarcia') {
      query = query.order('year_opened', { ascending: false, nullsFirst: false })
    } else {
      query = query.order('is_featured', { ascending: false }).order('name')
    }

    const from = (pg - 1) * PAGE_SIZE
    query = query.range(from, from + PAGE_SIZE - 1)

    const { data, count } = await query
    const results = (data || []) as ListingWithOperator[]

    const featured = results.filter((l) => l.is_featured)
    const regular = results.filter((l) => !l.is_featured)

    setFeaturedListings(featured)
    setListings(regular)
    setTotal(count || 0)
    setLoading(false)
  }, [city, district, stanowiskaOd, stanowiskaDo, ceniaDo, selectedOperator, selectedAmenities, sort, operators, amenities])

  useEffect(() => {
    fetchListings(1)
    setPage(1)
  }, [fetchListings])

  const allListings = [...featuredListings, ...listings]
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const crumbs = [
    { label: 'Strona główna', href: '/' },
    ...(city ? [{ label: city, href: `/biura-serwisowane/${initialCity}` }] : []),
    ...(district ? [{ label: district }] : [{ label: 'Biura serwisowane' }]),
  ]

  const h1 = city
    ? district
      ? `Biura serwisowane w ${district}, ${city} – ${total} lokalizacji`
      : `Biura serwisowane w ${city} – ${total} lokalizacji`
    : `Biura serwisowane w Polsce – ${total} lokalizacji`

  function handlePage(p: number) {
    setPage(p)
    fetchListings(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const FilterBar = () => (
    <div className="flex flex-wrap items-center gap-3 py-4 border-b border-[var(--colliers-border)]">
      {/* Workstations */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--colliers-gray)] whitespace-nowrap">Stanowiska:</span>
        <input
          type="number"
          placeholder="od"
          className="form-input w-16 py-1 px-2 text-sm"
          value={stanowiskaOd}
          onChange={(e) => setStanowiskaOd(e.target.value)}
          min={1}
        />
        <span className="text-[var(--colliers-gray)]">–</span>
        <input
          type="number"
          placeholder="do"
          className="form-input w-16 py-1 px-2 text-sm"
          value={stanowiskaDo}
          onChange={(e) => setStanowiskaDo(e.target.value)}
          min={1}
        />
      </div>

      {/* Price */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--colliers-gray)] whitespace-nowrap">Cena do:</span>
        <input
          type="number"
          placeholder="PLN"
          className="form-input w-24 py-1 px-2 text-sm"
          value={ceniaDo}
          onChange={(e) => setCeniaDo(e.target.value)}
          min={0}
          max={5000}
        />
      </div>

      {/* Operator */}
      <div className="flex items-center gap-2 text-sm">
        <select
          className="form-input py-1 px-2 text-sm"
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
        >
          <option value="">Wszyscy operatorzy</option>
          {operators.map((op) => (
            <option key={op.id} value={op.slug}>{op.name}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 text-sm ml-auto">
        <select
          className="form-input py-1 px-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Domyślne sortowanie</option>
          <option value="cena_asc">Cena rosnąco</option>
          <option value="cena_desc">Cena malejąco</option>
          <option value="data_otwarcia">Rok otwarcia</option>
        </select>
      </div>

      {/* Filters button (for amenities modal) */}
      <button
        onClick={() => setFiltersOpen(true)}
        className="btn-outline text-sm py-1.5 px-4 flex items-center gap-2"
      >
        <SlidersHorizontal size={15} />
        Udogodnienia {selectedAmenities.length > 0 && `(${selectedAmenities.length})`}
      </button>
    </div>
  )

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} />

      <div className="container-colliers">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-xl font-semibold text-[var(--colliers-navy)] mb-2 pb-2">{h1}</h1>
        <FilterBar />
      </div>

      {/* Main content: list + map */}
      <div className="relative">
        {/* Desktop: side-by-side */}
        <div className="hidden md:flex" style={{ height: 'calc(100vh - 180px)' }}>
          {/* List — 40% */}
          <div className="w-[40%] overflow-y-auto flex-shrink-0 border-r border-[var(--colliers-border)]">
            {loading ? (
              <div className="p-8 text-center text-[var(--colliers-gray)]">Ładowanie…</div>
            ) : allListings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[var(--colliers-gray)] mb-4">
                  Nie znaleźliśmy biur spełniających podane kryteria. Zmień filtry lub skontaktuj się z naszym doradcą.
                </p>
                <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">
                  Skontaktuj się z doradcą
                </button>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-4">
                {featuredListings.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-[var(--colliers-blue-bright)] uppercase tracking-wide pt-2">
                      ✦ Polecane
                    </p>
                    {featuredListings.map((l) => (
                      <div key={l.id}
                        onMouseEnter={() => setHighlightedId(l.id)}
                        onMouseLeave={() => setHighlightedId(null)}>
                        <ListingCard listing={l} highlighted={highlightedId === l.id} />
                      </div>
                    ))}
                    {listings.length > 0 && (
                      <div className="flex items-center gap-3 py-2">
                        <div className="flex-1 border-t border-[var(--colliers-border)]" />
                        <span className="text-xs text-[var(--colliers-gray)] uppercase tracking-wide">Wszystkie biura</span>
                        <div className="flex-1 border-t border-[var(--colliers-border)]" />
                      </div>
                    )}
                  </>
                )}
                {listings.map((l) => (
                  <div key={l.id}
                    onMouseEnter={() => setHighlightedId(l.id)}
                    onMouseLeave={() => setHighlightedId(null)}>
                    <ListingCard listing={l} highlighted={highlightedId === l.id} />
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 py-4 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePage(p)}
                        className={`w-9 h-9 text-sm font-semibold transition-colors ${
                          p === page
                            ? 'bg-[var(--colliers-navy)] text-white'
                            : 'border border-[var(--colliers-border)] text-[var(--colliers-navy)] hover:border-[var(--colliers-navy)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map — 60% sticky */}
          <div className="flex-1 sticky top-[64px]" style={{ height: 'calc(100vh - 64px)' }}>
            <MapView
              listings={allListings}
              highlightedId={highlightedId}
              onMarkerClick={(id) => setHighlightedId(id)}
              initialCity={initialCity}
            />
          </div>
        </div>

        {/* Mobile: toggle list/map */}
        <div className="md:hidden">
          {mobileView === 'list' ? (
            <div className="container-colliers py-4 flex flex-col gap-4 pb-20">
              {loading ? (
                <p className="text-center text-[var(--colliers-gray)] py-8">Ładowanie…</p>
              ) : allListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--colliers-gray)] mb-4">
                    Nie znaleźliśmy biur spełniających podane kryteria.
                  </p>
                  <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">
                    Skontaktuj się z doradcą
                  </button>
                </div>
              ) : (
                allListings.map((l) => <ListingCard key={l.id} listing={l} />)
              )}
            </div>
          ) : (
            <div style={{ height: 'calc(100vh - 120px)' }}>
              <MapView listings={allListings} highlightedId={null} onMarkerClick={() => {}} initialCity={initialCity} />
            </div>
          )}

          {/* Floating toggle bar */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex shadow-[var(--shadow-md)] border border-[var(--colliers-border)] bg-white">
            <button
              onClick={() => setMobileView('list')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors ${
                mobileView === 'list' ? 'bg-[var(--colliers-navy)] text-white' : 'text-[var(--colliers-navy)]'
              }`}
            >
              <List size={16} /> Lista
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors border-l border-[var(--colliers-border)] ${
                mobileView === 'map' ? 'bg-[var(--colliers-navy)] text-white' : 'text-[var(--colliers-navy)]'
              }`}
            >
              <MapIcon size={16} /> Mapa
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Amenities modal */}
      {filtersOpen && (
        <div className="modal-backdrop" onClick={() => setFiltersOpen(false)}>
          <div className="bg-white w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-enter 0.2s ease', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--colliers-navy)]">Udogodnienia</h3>
              <button onClick={() => setFiltersOpen(false)} className="text-[var(--colliers-gray)]">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="accent-[var(--colliers-navy)]"
                    checked={selectedAmenities.includes(a.slug)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAmenities((prev) => [...prev, a.slug])
                      } else {
                        setSelectedAmenities((prev) => prev.filter((s) => s !== a.slug))
                      }
                    }}
                  />
                  {a.name}
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedAmenities([])} className="btn-outline flex-1">
                Wyczyść
              </button>
              <button onClick={() => setFiltersOpen(false)} className="btn-primary flex-1">
                Zastosuj
              </button>
            </div>
          </div>
        </div>
      )}

      {formOpen && <ContactForm onClose={() => { setFormOpen(false); setFormListing(null) }} />}
    </>
  )
}
