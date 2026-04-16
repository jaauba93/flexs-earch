'use client'

import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { CircleHelp, SlidersHorizontal, Map as MapIcon, List, X } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ListingCard from '@/components/search/ListingCard'
import MapView, { type MapBounds } from '@/components/search/MapView'
import ContactForm, { type ContactFormPrefill } from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'
import { createClient } from '@/lib/supabase/client'
import { slugToCity, slugToDistrict, slugify } from '@/lib/utils/slugify'
import { METRO_LINES, type MetroLineId, isNearMetroLine } from '@/lib/mapbox/metro'
import { SEARCH_OPTIONS, findSearchOption, normalizeSearchText, type SearchTargetOption } from '@/lib/search/locations'
import { OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY } from '@/lib/recommendation/officeModelRecommendation'
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

function FilterLabel({
  children,
  tooltip,
}: {
  children: ReactNode
  tooltip?: string
}) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <label className="form-label mb-0">{children}</label>
      {tooltip ? (
        <span className="group relative inline-flex">
          <button
            type="button"
            tabIndex={0}
            aria-label={`Wyjaśnienie pola ${children}`}
            className="inline-flex h-4 w-4 items-center justify-center text-[#7a88b1] transition-colors hover:text-[#1C54F4] focus:text-[#1C54F4]"
          >
            <CircleHelp size={14} />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-30 w-56 -translate-x-1/2 rounded-none border border-[#dbe4f8] bg-white px-3 py-2 text-[11px] font-normal leading-relaxed text-[#5a6a95] opacity-0 shadow-[0_12px_30px_rgba(0,7,89,0.12)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            {tooltip}
          </span>
        </span>
      ) : null}
    </div>
  )
}

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
  const filterBarRef = useRef<HTMLDivElement>(null)
  const initialSearchTarget = useMemo<SearchTargetOption | null>(() => {
    if (initialDistrict) {
      return findSearchOption(`${slugToCity(initialCity ?? '')} — ${slugToDistrict(initialDistrict)}`)
    }
    if (initialCity) {
      return findSearchOption(slugToCity(initialCity))
    }
    const q = searchParams.q || searchParams.search || ''
    const type = searchParams.search_type
    if (type === 'metro' && searchParams.metro_line) {
      return SEARCH_OPTIONS.find((option) => option.type === 'metro' && option.metroLine === searchParams.metro_line as MetroLineId) ?? null
    }
    if (type === 'city' && q) {
      return findSearchOption(q)
    }
    if (type === 'district' && q) {
      return findSearchOption(q)
    }
    if (q) {
      return findSearchOption(q)
    }
    return null
  }, [initialCity, initialDistrict, searchParams.q, searchParams.search, searchParams.search_type, searchParams.metro_line])

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
  const [searchInput, setSearchInput] = useState(() => initialSearchTarget?.label || searchParams.q || searchParams.search || '')
  const [searchTarget, setSearchTarget] = useState<SearchTargetOption | null>(initialSearchTarget)
  const [selectedMetroLine, setSelectedMetroLine] = useState<MetroLineId | ''>(
    initialSearchTarget?.type === 'metro' ? (initialSearchTarget.metroLine || '') : ((searchParams.metro_line as MetroLineId | undefined) || '')
  )
  const [showDistrictGrid, setShowDistrictGrid] = useState(true)
  const [showMetroLines, setShowMetroLines] = useState(true)
  const { currency, rates } = useCurrencyContext()

  useEffect(() => {
    setSearchTarget(initialSearchTarget)
    setSearchInput(initialSearchTarget?.label || searchParams.q || searchParams.search || '')
    setSelectedMetroLine(
      initialSearchTarget?.type === 'metro'
        ? (initialSearchTarget.metroLine || '')
        : ((searchParams.metro_line as MetroLineId | undefined) || '')
    )
  }, [
    initialSearchTarget,
    searchParams.metro_line,
    searchParams.q,
    searchParams.search,
  ])

  useEffect(() => {
    if (!filtersOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFiltersOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [filtersOpen])

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
  const [wizardOpen, setWizardOpen] = useState(false)
  const [contactPrefill, setContactPrefill] = useState<ContactFormPrefill | null>(null)
  const [availableAmenitySlugs, setAvailableAmenitySlugs] = useState<string[]>([])

  const resolvedCitySlug = initialCity ?? searchTarget?.citySlug
  const resolvedDistrictSlug = initialDistrict ?? (searchTarget?.type === 'district' ? searchTarget.districtSlug : undefined)
  const city = resolvedCitySlug ? slugToCity(resolvedCitySlug) : undefined
  const district = resolvedDistrictSlug ? slugToDistrict(resolvedDistrictSlug) : undefined
  const parsedStanowiskaOd = stanowiskaOd ? parseInt(stanowiskaOd, 10) : null
  const parsedStanowiskaDo = stanowiskaDo ? parseInt(stanowiskaDo, 10) : null
  const workstationCapacityThreshold = useMemo(() => {
    const values = [parsedStanowiskaOd, parsedStanowiskaDo].filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
    )
    if (values.length === 0) return null
    return Math.min(...values)
  }, [parsedStanowiskaDo, parsedStanowiskaOd])
  const budgetThresholdPln = useMemo(() => {
    if (!ceniaDo) return null
    const amount = Number.parseInt(ceniaDo, 10)
    if (!Number.isFinite(amount)) return null
    if (currency === 'PLN') return amount
    if (!rates) return null
    return Math.round(amount * rates[currency])
  }, [ceniaDo, currency, rates])

  const filteredSearchOptions = useMemo(() => {
    const query = normalizeSearchText(searchInput)
    if (!query) return SEARCH_OPTIONS.slice(0, 12)
    return SEARCH_OPTIONS.filter((option) => {
      const values = [option.label, ...(option.aliases ?? [])]
      return values.some((value) => normalizeSearchText(value).includes(query))
    }).slice(0, 12)
  }, [searchInput])

  const clearSearchTarget = useCallback(() => {
    const params = new URLSearchParams()
    if (stanowiskaOd) params.set('stanowiska_od', stanowiskaOd)
    if (stanowiskaDo) params.set('stanowiska_do', stanowiskaDo)
    if (ceniaDo) params.set('cena_do', ceniaDo)
    if (selectedAmenities.length > 0) params.set('udogodnienia', selectedAmenities.join(','))
    if (selectedOperator) params.set('operator', selectedOperator)
    if (sort) params.set('sort', sort)

    setSearchTarget(null)
    setSearchInput('')
    setSelectedMetroLine('')
    router.replace(params.toString() ? `/biura-serwisowane?${params.toString()}` : '/biura-serwisowane', { scroll: false })
  }, [ceniaDo, router, selectedAmenities, selectedOperator, sort, stanowiskaDo, stanowiskaOd])

  // ── Fetch from Supabase ──────────────────────────────────────────────────────
  const fetchListings = useCallback(async (pg = 1) => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('listings')
      .select('*, operator:operators(*)', { count: 'exact' })
      .eq('is_active', true)

    if (city) query = query.ilike('address_city', city)
    // District filtered client-side — handles Polish diacritics in slugs
    if (workstationCapacityThreshold !== null) query = query.gte('total_workstations', workstationCapacityThreshold)
    if (budgetThresholdPln !== null) query = query.lte('price_desk_private', budgetThresholdPln)
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

    const shouldFetchAll = Boolean(initialDistrict || selectedMetroLine || searchTarget)

    // For map-heavy client filters (metro, district/city autocomplete), fetch all first.
    if (!shouldFetchAll) {
      const from = (pg - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)
    }

    const { data, count } = await query
    let results = (data || []) as ListingWithOperator[]

    // Client-side district filter — slugify comparison handles Polish diacritics
    if (initialDistrict) {
      results = results.filter((l) => slugify(l.address_district || '') === initialDistrict)
    }

    setAllFetched(results)
    setTotal(shouldFetchAll ? results.length : (count || 0))
    const listingIds = results.map((listing) => listing.id)
    if (listingIds.length > 0) {
      const { data: listingAmenityRows } = await supabase
        .from('listing_amenities')
        .select('listing_id, amenity:amenities(id, name, slug, category)')
        .in('listing_id', listingIds)

      const nextAmenitySlugs = new Set<string>()
      const typedAmenityRows = listingAmenityRows as
        | Array<{ listing_id: string; amenity: Pick<Amenity, 'slug' | 'category'> | null }>
        | null
      typedAmenityRows?.forEach((row) => {
        const amenity = row.amenity
        if (amenity?.slug) {
          nextAmenitySlugs.add(amenity.slug)
        }
      })
      setAvailableAmenitySlugs(Array.from(nextAmenitySlugs))
    } else {
      setAvailableAmenitySlugs([])
    }

    setLoading(false)
  }, [city, initialDistrict, selectedMetroLine, searchTarget, workstationCapacityThreshold, budgetThresholdPln, selectedOperator, sort, operators])

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
    if (searchTarget) {
      params.set('q', searchTarget.label)
      params.set('search_type', searchTarget.type)
      if (searchTarget.type === 'metro' && searchTarget.metroLine) {
        params.set('metro_line', searchTarget.metroLine)
      }
    }
    if (stanowiskaOd) params.set('stanowiska_od', stanowiskaOd)
    if (stanowiskaDo) params.set('stanowiska_do', stanowiskaDo)
    if (ceniaDo) params.set('cena_do', ceniaDo)
    if (selectedAmenities.length > 0) params.set('udogodnienia', selectedAmenities.join(','))
    if (selectedOperator) params.set('operator', selectedOperator)
    if (selectedMetroLine) params.set('metro_line', selectedMetroLine)
    if (sort) params.set('sort', sort)

    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(url, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stanowiskaOd, stanowiskaDo, ceniaDo, selectedAmenities, selectedOperator, selectedMetroLine, sort])

  useEffect(() => {
    if (searchParams.open_contact !== '1' || typeof window === 'undefined') return

    const storedPrefill = window.sessionStorage.getItem(OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY)
    if (!storedPrefill) return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('open_contact')

    try {
      const parsed = JSON.parse(storedPrefill) as ContactFormPrefill
      setContactPrefill(parsed)
      setFormOpen(true)
      window.sessionStorage.removeItem(OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY)
    } catch {
      window.sessionStorage.removeItem(OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY)
    }

    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams])

  // ── Client-side bbox filtering of fetched results ────────────────────────────
  const featureFiltered = allFetched.filter((listing) => {
    if (selectedMetroLine && !isNearMetroLine(listing.latitude, listing.longitude, selectedMetroLine, 1.2)) {
      return false
    }
    if (searchTarget?.type === 'city') {
      return slugify(listing.address_city) === slugify(searchTarget.label)
    }
    if (searchTarget?.type === 'district') {
      const listingCity = slugify(listing.address_city)
      const listingDistrict = slugify(listing.address_district || '')
      return listingCity === searchTarget.citySlug && listingDistrict === searchTarget.districtSlug
    }
    if (searchTarget?.type === 'metro') {
      return isNearMetroLine(listing.latitude, listing.longitude, searchTarget.metroLine as MetroLineId, 1.2)
    }
    return true
  })

  const featuredListings = featureFiltered.filter((l) => l.is_featured)
  const regularListings = featureFiltered.filter((l) => !l.is_featured)

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

  const availableAmenities = useMemo(
    () => amenities.filter((amenity) => availableAmenitySlugs.includes(amenity.slug)),
    [amenities, availableAmenitySlugs]
  )

  const amenityGroups = useMemo(() => {
    const officeAmenities = availableAmenities.filter((amenity) => amenity.category !== 'building')
    const buildingAmenities = availableAmenities.filter((amenity) => amenity.category === 'building')

    return [
      {
        key: 'office',
        title: 'Udogodnienia w biurze',
        description: 'Elementy związane z komfortem pracy w samej przestrzeni.',
        items: officeAmenities,
      },
      {
        key: 'building',
        title: 'Udogodnienia w budynku',
        description: 'Elementy dostępne w całym obiekcie lub w jego otoczeniu.',
        items: buildingAmenities,
      },
    ].filter((group) => group.items.length > 0)
  }, [availableAmenities])

  const isClientOnlyFilterActive = Boolean(selectedMetroLine || searchTarget)
  const totalPages = isClientOnlyFilterActive ? 1 : Math.ceil(total / PAGE_SIZE)

  const crumbs = [
    { label: 'Strona główna', href: '/' },
    { label: 'Wyszukaj', href: '/biura-serwisowane' },
    ...(city && resolvedCitySlug ? [{ label: city, href: `/biura-serwisowane/${resolvedCitySlug}` }] : []),
    ...(district && resolvedCitySlug && resolvedDistrictSlug ? [{ label: district, href: `/biura-serwisowane/${resolvedCitySlug}/${resolvedDistrictSlug}` }] : []),
  ]

  function handlePage(p: number) {
    setPage(p)
    fetchListings(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filterBar = (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-5 py-5">
      <div className="flex flex-col min-w-[260px] relative items-start">
        <FilterLabel>Szukaj (miasto / dzielnica / metro)</FilterLabel>
        <div className="flex items-center gap-2 border-b border-[var(--colliers-border)] pb-1 pr-1">
          <input
            value={searchInput}
            readOnly={Boolean(searchTarget)}
            onChange={(e) => {
              if (searchTarget) return
              setSearchInput(e.target.value)
            }}
            onFocus={() => {
              if (searchTarget) return
            }}
            placeholder={searchTarget ? searchTarget.label : 'np. Warszawa, Wola, M2'}
            className={`flex-1 bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 placeholder:text-slate-300 ${
              searchTarget ? 'cursor-not-allowed' : ''
            }`}
          />
          {searchTarget && (
            <button
              type="button"
              onClick={clearSearchTarget}
              className="shrink-0 text-[#1C54F4] hover:text-red-500 transition-colors"
              aria-label="Usuń filtr wyszukiwania"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {!searchTarget && filteredSearchOptions.length > 0 && searchInput.trim().length > 0 && (
          <div className="absolute top-[58px] left-0 right-0 bg-white border border-[var(--colliers-border)] shadow-[var(--shadow-md)] z-30 max-h-60 overflow-auto">
            {filteredSearchOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setSearchTarget(option)
                  setSearchInput(option.label)
                  setSelectedMetroLine(option.type === 'metro' ? (option.metroLine as MetroLineId) : '')
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--colliers-bg-light-blue)] text-[#000759] flex items-center justify-between"
              >
                <span>{option.label}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#7B8BBD]">{option.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Workstations */}
      <div className="flex flex-col items-start">
        <FilterLabel tooltip="Liczba stanowisk pracy oznacza liczbę miejsc do pracy w całym biurze, rozumianych jako biurko plus fotel.">
          Stanowiska
        </FilterLabel>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="od"
            className="w-14 bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 placeholder:text-slate-300"
            value={stanowiskaOd}
            onChange={(e) => setStanowiskaOd(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            min={1}
          />
          <span className="text-slate-300">—</span>
          <input
            type="number"
            placeholder="do"
            className="w-14 bg-transparent border-none p-0 text-sm font-bold text-[#000759] focus:ring-0 placeholder:text-slate-300"
            value={stanowiskaDo}
            onChange={(e) => setStanowiskaDo(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            min={1}
          />
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col items-start">
        <FilterLabel tooltip="Budżet oznacza miesięczny budżet za jedno stanowisko pracy.">
          Budżet ({currency})
        </FilterLabel>
        <select
          className="w-full min-w-[110px] bg-transparent border-none p-0 text-left text-sm font-bold text-[#000759] focus:ring-0 cursor-pointer"
          value={ceniaDo}
          onChange={(e) => setCeniaDo(e.target.value)}
        >
          <option value="">Dowolny</option>
          <option value="1500">Do 1 500 {currency}</option>
          <option value="2500">Do 2 500 {currency}</option>
          <option value="4000">Do 4 000 {currency}</option>
        </select>
      </div>

      {/* Operator */}
      <div className="flex flex-col items-start">
        <label className="form-label mb-1">Operator</label>
        <select
          className="w-full min-w-[110px] bg-transparent border-none p-0 text-left text-sm font-bold text-[#000759] focus:ring-0 cursor-pointer"
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
        >
          <option value="">Wszyscy</option>
          {operators.map((op) => (
            <option key={op.id} value={op.slug}>{op.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col items-start">
        <label className="form-label mb-1">Linia metra</label>
        <select
          className="w-full min-w-[110px] bg-transparent border-none p-0 text-left text-sm font-bold text-[#000759] focus:ring-0 cursor-pointer"
          value={selectedMetroLine}
          onChange={(e) => setSelectedMetroLine(e.target.value as MetroLineId | '')}
        >
          <option value="">Wszystkie</option>
          {METRO_LINES.map((line) => (
            <option key={line.id} value={line.id}>{line.name}</option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="inline-flex h-10 items-center gap-2 border border-[#dbe4f8] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#000759] transition-colors hover:border-[#1C54F4] hover:text-[#1C54F4]"
      >
        Więcej filtrów
        <SlidersHorizontal size={13} />
        {selectedAmenities.length > 0 && <span className="text-[#1C54F4]">({selectedAmenities.length})</span>}
      </button>

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
      <Header
        onOpenForm={() => {
          setContactPrefill(null)
          setFormOpen(true)
        }}
        onOpenWizard={() => setWizardOpen(true)}
      />

      <div className="flex h-[calc(100dvh-80px)] flex-col overflow-hidden">
        <div className="px-8 lg:px-16">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <div ref={filterBarRef} className="px-8 lg:px-16">
          {filterBar}
        </div>

        {/* Main content: list + map */}
        <div className="relative flex-1 min-h-0">
          {/* Desktop: side-by-side */}
          <div className="hidden lg:flex h-full min-h-0">
            {/* List — 40% */}
            <div className="w-[40%] overflow-y-auto flex-shrink-0" data-lenis-prevent>
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
                <button
                  onClick={() => {
                    setContactPrefill(null)
                    setFormOpen(true)
                  }}
                  className="btn-primary text-sm"
                >
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
            <div className="flex-1 min-h-0 overflow-hidden pr-8" data-lenis-prevent>
              <MapView
                listings={featureFiltered}
                highlightedId={highlightedId}
                onMarkerClick={(id) => setHighlightedId(id)}
                onBoundsChange={(bounds) => setMapBounds(bounds)}
                initialCity={resolvedCitySlug}
                showDistrictGrid={showDistrictGrid}
                showMetroLines={showMetroLines}
                onToggleDistrictGrid={() => setShowDistrictGrid((value) => !value)}
                onToggleMetroLines={() => setShowMetroLines((value) => !value)}
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
                    <button
                      onClick={() => {
                        setContactPrefill(null)
                        setFormOpen(true)
                      }}
                      className="btn-primary text-sm"
                    >
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
                  listings={featureFiltered}
                  highlightedId={null}
                  onMarkerClick={() => {}}
                  onBoundsChange={(bounds) => setMapBounds(bounds)}
                  initialCity={resolvedCitySlug}
                  showDistrictGrid={showDistrictGrid}
                  showMetroLines={showMetroLines}
                  onToggleDistrictGrid={() => setShowDistrictGrid((value) => !value)}
                  onToggleMetroLines={() => setShowMetroLines((value) => !value)}
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
      </div>

      <Footer />

      {/* Amenities drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[120]" data-lenis-prevent>
          <button
            type="button"
            aria-label="Zamknij panel udogodnień"
            className="absolute inset-0 bg-[rgba(0,7,89,0.34)] backdrop-blur-[10px]"
            onClick={() => setFiltersOpen(false)}
          />
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-white shadow-[0_30px_100px_rgba(0,7,89,0.25)]"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'drawer-enter 0.28s cubic-bezier(0.22,1,0.36,1)' }}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-6 border-b border-[#e9edf6] bg-white px-7 md:px-8 py-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] mb-2">Udogodnienia</p>
                <h3 className="text-2xl font-light text-[#000759]" style={{ fontFamily: 'var(--font-serif)' }}>
                  Filtruj po tym, co naprawdę jest dostępne
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#61719a]">
                  Pokazujemy tylko udogodnienia występujące w aktualnym zestawie biur. Lista wyników reaguje natychmiast.
                </p>
              </div>
              <button onClick={() => setFiltersOpen(false)} className="text-[#7a88b1] hover:text-[#000759] transition-colors mt-1">
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-7 md:px-8 py-6 space-y-7" data-lenis-prevent>
              <div className="rounded-none border border-[#dbe4f8] bg-[linear-gradient(180deg,#fbfcff_0%,#f7faff_100%)] px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] mb-1">Wyniki na żywo</p>
                  <p className="text-sm text-[#61719a]">Biura spełniające wybrane warunki</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light text-[#000759]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {allVisible.length}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#7a88b1]">ofert</p>
                </div>
              </div>

              {amenityGroups.map((group) => (
                <section key={group.key} className="space-y-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4] mb-1">{group.title}</p>
                      <p className="text-sm text-[#61719a]">{group.description}</p>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a88b1]">
                      {group.items.length} pozycji
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.items.map((amenity) => {
                      const checked = selectedAmenities.includes(amenity.slug)
                      return (
                        <label
                          key={amenity.id}
                          className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-all duration-300 ${
                            checked
                              ? 'border-[#1C54F4] bg-[#edf3ff] shadow-[0_10px_26px_rgba(28,84,244,0.09)]'
                              : 'border-[#dbe4f8] bg-white hover:border-[#9dbafc]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-[var(--colliers-navy)] shrink-0"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAmenities((prev) => [...prev, amenity.slug])
                              } else {
                                setSelectedAmenities((prev) => prev.filter((slug) => slug !== amenity.slug))
                              }
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#000759] leading-snug">{amenity.name}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="border-t border-[#e9edf6] bg-white px-7 md:px-8 py-5 sticky bottom-0 z-10 flex items-center gap-3">
              <button onClick={() => setSelectedAmenities([])} className="btn-outline flex-1 justify-center">
                Wyczyść
              </button>
              <button onClick={() => setFiltersOpen(false)} className="btn-primary flex-1 justify-center">
                Gotowe
              </button>
            </div>
          </aside>
        </div>
      )}

      {formOpen && (
        <ContactForm
          prefill={contactPrefill}
          onClose={() => {
            setFormOpen(false)
            setContactPrefill(null)
          }}
        />
      )}
      {wizardOpen && (
        <OfficeModelWizard
          onClose={() => setWizardOpen(false)}
          onOpenContactForm={(prefill) => {
            setContactPrefill(prefill)
            setFormOpen(true)
            requestAnimationFrame(() => {
              setWizardOpen(false)
            })
          }}
          onSearchCta={() => {
            setWizardOpen(false)
            requestAnimationFrame(() => {
              filterBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
          }}
        />
      )}
    </>
  )
}
