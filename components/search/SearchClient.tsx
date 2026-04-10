'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SlidersHorizontal, Map as MapIcon, List, X, MapPin } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ListingCard from '@/components/search/ListingCard'
import MapView, { type MapBounds } from '@/components/search/MapView'
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
  const router = useRouter()
  const pathname = usePathname()
  const didMountRef = useRef(false)

  // ── Filter state (initialised from URL params) ───────────────────────────────
  const [stanowiskaOd, setStanowiskaOd] = useState(searchParams.stanowiska_od || '')
  const [stanowiskaDo, setStanowiskaDo] = useState(searchParams.stanowiska_do || '')
  const [ceniaDo, setCeniaDo] = useState(searchParams.cena_do || '')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.udogodnienia ? searchParams.udogodnienia.split(',') : []
  )
  const [selectedOperator, setSelectedOperator] = useState(searchParams.operator || '')
  const [sort, setSort] = useState(searchParams.sort || '')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // ── Map bbox filter (client-side) ────────────────────────────────────────────
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null)

  // ── Results state ────────────────────────────────────────────────────────────
  const [allFetched, setAllFetched] = useState<ListingWithOperator[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const city = initialCity ? slugToCity(initialCity) : undefined
  const district = initialDistrict
    ? initialDistrict.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : undefined

  // ── Fetch from Supabase ──────────────────────────────────────────────────────
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

    // Amenities: AND logic post-fetch filter (handled below)

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

    setAllFetched(results)
    setTotal(count || 0)
    setLoading(false)
  }, [city, district, stanowiskaOd, stanowiskaDo, ceniaDo, selectedOperator, sort, operators])

  useEffect(() => {
    fetchListings(1)
    setPage(1)
    setMapBounds(null) // reset bbox when server filters change
  }, [fetchListings])

  // ── Sync filter state → URL (debounced, skip first render) ───────────────────
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    const params = new URLSearchParams()
    if (stanowiskaOd) params.set('stanowiska_od', stanowiskaOd)
    if (stanowiskaDo) params.set('stanowiska_do', stanowiskaDo)
    if (ceniaDo) params.set('cena_do', ceniaDo)
    if (selectedAmenities.length > 0) params.set('udogodnienia', selectedAmenities.join(','))
    if (selectedOperator) params.set('operator', selectedOperator)
    if (sort) params.set('sort', sort)

    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(url, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanowiskaOd, stanowiskaDo, ceniaDo, selectedAmenities, selectedOperator, sort])

  // ── Client-side bbox filtering of fetched results ────────────────────────────
  const featuredListings = allFetched.filter((l) => l.is_featured)
  const regularListings = allFetched.filter((l) => !l.is_featured)

  const applyBbox = (list: ListingWithOperator[]) => {
    if (!mapBounds) return list
    return list.filter(
      (l) =>
        l.latitude >= mapBounds.south &&
        l.latitude <= mapBounds.north &&
        l.longitude >= mapBounds.west &&
        l.longitude <= mapBounds.east
    )
  }

  const visibleFeatured = applyBbox(featuredListings)
  const visibleRegular = applyBbox(regularListings)
  const allVisible = [...visibleFeatured, ...visibleRegular]

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
    <div className="flex flex-wrap items-end gap-8 py-4 border-b border-[var(--colliers-border)]">
      {city && (
        <div className="flex flex-col min-w-[140px]">
          <label className="form-label mb-1">Lokalizacja</label>
          <span className="text-sm font-bold text-[#000759]">{city}</span>
        </div>
      )}

      {/* Workstations */}
      <div className="flex flex-col">
        <label className="form-label mb-1">Stanowiska</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="od"
            className="w-14 bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 placeholder:text-slate-300"
            value={stanowiskaOd}
            onChange={(e) => setStanowiskaOd(e.target.value)}
            min={1}
          />
          <span className="text-slate-300">—</span>
          <input
            type="number"
            placeholder="do"
            className="w-14 bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 placeholder:text-slate-300"
            value={stanowiskaDo}
            onChange={(e) => setStanowiskaDo(e.target.value)}
            min={1}
          />
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col">
        <label className="form-label mb-1">Budżet (PLN)</label>
        <select
          className="bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 cursor-pointer"
          value={ceniaDo}
          onChange={(e) => setCeniaDo(e.target.value)}
        >
          <option value="">Dowolny</option>
          <option value="1500">Do 1 500</option>
          <option value="2500">Do 2 500</option>
          <option value="4000">Do 4 000</option>
        </select>
      </div>

      {/* Operator */}
      <div className="flex flex-col">
        <label className="form-label mb-1">Operator</label>
        <select
          className="bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 cursor-pointer"
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
        >
          <option value="">Wszyscy</option>
          {operators.map((op) => (
            <option key={op.id} value={op.slug}>{op.name}</option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 group">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#000759] group-hover:text-[#1C54F4] transition-colors">
          Więcej filtrów <SlidersHorizontal size={12} className="inline" />
          {selectedAmenities.length > 0 && ` (${selectedAmenities.length})`}
        </span>
      </button>

      {/* Bbox active indicator */}
      {mapBounds && (
        <button
          onClick={() => setMapBounds(null)}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#1C54F4] hover:text-red-500 transition-colors"
        >
          <MapPin size={11} /> Widok mapy
          <X size={10} />
        </button>
      )}

      {/* Sort */}
      <div className="flex flex-col ml-auto items-end">
        <label className="form-label mb-1">Sortowanie</label>
        <select
          className="bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 cursor-pointer"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Rekomendowane</option>
          <option value="cena_asc">Cena: od najniższej</option>
          <option value="cena_desc">Cena: od najwyższej</option>
          <option value="data_otwarcia">Rok otwarcia</option>
        </select>
      </div>
    </div>
  )

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} />

      <div className="px-8 lg:px-16">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-xl font-semibold text-[var(--colliers-navy)] mb-4 pb-0">{h1}</h1>
      </div>
      <div className="px-8 lg:px-16">
        <FilterBar />
      </div>

      {/* Main content: list + map */}
      <div className="relative">
        {/* Desktop: side-by-side */}
        <div className="hidden lg:flex" style={{ height: 'calc(100vh - 80px)' }}>
          {/* List — 40% */}
          <div className="w-[40%] overflow-y-auto flex-shrink-0 border-r border-[var(--colliers-border)]" data-lenis-prevent>
            {loading ? (
              <div className="p-8 flex flex-col items-center gap-3 text-[var(--colliers-gray)]">
                <div className="w-5 h-5 border-2 border-[#1C54F4] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Ładowanie…</span>
              </div>
            ) : allVisible.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[var(--colliers-gray)] mb-4">
                  Nie znaleźliśmy biur spełniających podane kryteria. Zmień filtry lub skontaktuj się z naszym doradcą.
                </p>
                {mapBounds && (
                  <button
                    onClick={() => setMapBounds(null)}
                    className="text-sm text-[#1C54F4] hover:underline mb-4 block"
                  >
                    Wyczyść filtr obszaru mapy
                  </button>
                )}
                <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">
                  Skontaktuj się z doradcą
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-4 pl-16 pr-4 flex flex-col gap-4">
                {visibleFeatured.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-[var(--colliers-blue-bright)] uppercase tracking-wide pt-2">
                      ✦ Polecane
                    </p>
                    {visibleFeatured.map((l) => (
                      <div
                        key={l.id}
                        onMouseEnter={() => setHighlightedId(l.id)}
                        onMouseLeave={() => setHighlightedId(null)}
                      >
                        <ListingCard listing={l} highlighted={highlightedId === l.id} />
                      </div>
                    ))}
                    {visibleRegular.length > 0 && (
                      <div className="flex items-center gap-3 py-2">
                        <div className="flex-1 border-t border-[var(--colliers-border)]" />
                        <span className="text-xs text-[var(--colliers-gray)] uppercase tracking-wide">Wszystkie biura</span>
                        <div className="flex-1 border-t border-[var(--colliers-border)]" />
                      </div>
                    )}
                  </>
                )}
                {visibleRegular.map((l) => (
                  <div
                    key={l.id}
                    onMouseEnter={() => setHighlightedId(l.id)}
                    onMouseLeave={() => setHighlightedId(null)}
                  >
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

          {/* Map — 60% */}
          <div className="flex-1 overflow-hidden pr-16" data-lenis-prevent>
            <MapView
              listings={allFetched}
              highlightedId={highlightedId}
              onMarkerClick={(id) => setHighlightedId(id)}
              onBoundsChange={(bounds) => setMapBounds(bounds)}
              initialCity={initialCity}
            />
          </div>
        </div>

        {/* Mobile: toggle list/map */}
        <div className="lg:hidden">
          {mobileView === 'list' ? (
            <div className="container-colliers py-4 flex flex-col gap-4 pb-20">
              {loading ? (
                <p className="text-center text-[var(--colliers-gray)] py-8">Ładowanie…</p>
              ) : allVisible.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--colliers-gray)] mb-4">
                    Nie znaleźliśmy biur spełniających podane kryteria.
                  </p>
                  <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">
                    Skontaktuj się z doradcą
                  </button>
                </div>
              ) : (
                allVisible.map((l) => <ListingCard key={l.id} listing={l} />)
              )}
            </div>
          ) : (
            <div style={{ height: 'calc(100vh - 120px)' }}>
              <MapView
                listings={allFetched}
                highlightedId={null}
                onMarkerClick={() => {}}
                onBoundsChange={(bounds) => setMapBounds(bounds)}
                initialCity={initialCity}
              />
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
          <div
            className="bg-white w-full max-w-lg p-8"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modal-enter 0.2s ease', maxHeight: '80vh', overflowY: 'auto' }}
          >
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
              <button onClick={() => setSelectedAmenities([])} className="btn-outline flex-1">Wyczyść</button>
              <button onClick={() => setFiltersOpen(false)} className="btn-primary flex-1">Zastosuj</button>
            </div>
          </div>
        </div>
      )}

      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
    </>
  )
}
