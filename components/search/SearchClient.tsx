'use client'

import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { CircleHelp, SlidersHorizontal, Map as MapIcon, List, X, ChevronDown, Check } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ListingCard from '@/components/search/ListingCard'
import MapView, { type MapBounds } from '@/components/search/MapView'
import ContactForm, { type ContactFormPrefill } from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'
import { createClient } from '@/lib/supabase/client'
import { slugToCity, slugToDistrict, slugify } from '@/lib/utils/slugify'
import { METRO_LINES, type MetroLineId, isNearMetroLine } from '@/lib/mapbox/metro'
import { getCityAreas } from '@/lib/mapbox/city-areas'
import { OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY } from '@/lib/recommendation/officeModelRecommendation'
import type { Listing, Operator, Amenity } from '@/types/database'

const PAGE_SIZE = 25
const CITY_AREAS = getCityAreas()

interface SearchClientProps {
  initialCity?: string
  initialDistrict?: string
  operators: Pick<Operator, 'id' | 'name' | 'slug'>[]
  amenities: Pick<Amenity, 'id' | 'name' | 'slug' | 'category'>[]
  searchParams: Record<string, string>
}

type ListingWithOperator = Listing & { operator: Operator }
type FilterMenuId = 'city' | 'district' | 'budget' | 'operator' | 'metro' | 'sort' | null

function FilterLabel({
  children,
  tooltip,
  labelClass = '',
}: {
  children: ReactNode
  tooltip?: string
  labelClass?: string
}) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <label className={`form-label mb-0 ${labelClass}`}>{children}</label>
      {tooltip ? (
        <span className="group relative inline-flex">
          <button
            type="button"
            tabIndex={0}
            aria-label={`Wyjaśnienie pola ${children}`}
            className="inline-flex h-4 w-4 items-center justify-center text-white/50 transition-colors hover:text-white focus:text-white"
          >
            <CircleHelp size={14} />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-30 w-56 -translate-x-1/2 rounded-none border border-[#dbe4f8] bg-white px-3 py-2 text-[11px] font-normal leading-relaxed text-[#5c6d97] opacity-0 shadow-[0_12px_30px_rgba(0,7,89,0.12)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
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
  const filterMenusRef = useRef<HTMLDivElement>(null)

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
  const [openMenu, setOpenMenu] = useState<FilterMenuId>(null)
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>(() => initialCity || '')
  const [selectedDistrictSlugs, setSelectedDistrictSlugs] = useState<string[]>(() => {
    if (searchParams.districts) return searchParams.districts.split(',').filter(Boolean)
    if (initialDistrict) return [initialDistrict]
    return []
  })
  const [draftDistrictSlugs, setDraftDistrictSlugs] = useState<string[]>(() => {
    if (searchParams.districts) return searchParams.districts.split(',').filter(Boolean)
    if (initialDistrict) return [initialDistrict]
    return []
  })
  const [selectedMetroLine, setSelectedMetroLine] = useState<MetroLineId | ''>(
    (searchParams.metro_line as MetroLineId | undefined) || ''
  )
  const [showDistrictGrid, setShowDistrictGrid] = useState(true)
  const [showMetroLines, setShowMetroLines] = useState(true)
  const { currency, rates } = useCurrencyContext()

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

  useEffect(() => {
    if (!openMenu) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!filterMenusRef.current?.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [openMenu])

  useEffect(() => {
    setSelectedCitySlug(initialCity || '')
  }, [initialCity])

  useEffect(() => {
    if (searchParams.districts) {
      const nextDistricts = searchParams.districts.split(',').filter(Boolean)
      setSelectedDistrictSlugs(nextDistricts)
      setDraftDistrictSlugs(nextDistricts)
      return
    }
    const nextDistricts = initialDistrict ? [initialDistrict] : []
    setSelectedDistrictSlugs(nextDistricts)
    setDraftDistrictSlugs(nextDistricts)
  }, [initialDistrict, searchParams.districts])

  useEffect(() => {
    setSelectedMetroLine((searchParams.metro_line as MetroLineId | undefined) || '')
  }, [searchParams.metro_line])

  useEffect(() => {
    if (!selectedCitySlug) {
      setSelectedDistrictSlugs([])
      setDraftDistrictSlugs([])
      setSelectedMetroLine('')
      setOpenMenu(null)
      return
    }

    const nextDistrictOptions =
      CITY_AREAS.find((area) => area.city === selectedCitySlug)?.districts.map((district) => district.slug) || []

    setSelectedDistrictSlugs((prev) => prev.filter((slug) => nextDistrictOptions.includes(slug)))
    setDraftDistrictSlugs((prev) => prev.filter((slug) => nextDistrictOptions.includes(slug)))

    if (selectedCitySlug !== 'warszawa') {
      setSelectedMetroLine('')
    }
  }, [selectedCitySlug])

  useEffect(() => {
    if (openMenu === 'district') {
      setDraftDistrictSlugs(selectedDistrictSlugs)
    }
  }, [openMenu, selectedDistrictSlugs])

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

  const city = selectedCitySlug ? slugToCity(selectedCitySlug) : undefined
  const districtOptions = useMemo(
    () => CITY_AREAS.find((area) => area.city === selectedCitySlug)?.districts || [],
    [selectedCitySlug]
  )
  const selectedDistrictLabels = useMemo(
    () =>
      selectedDistrictSlugs
        .map((slug) => districtOptions.find((districtItem) => districtItem.slug === slug)?.label || slugToDistrict(slug))
        .filter(Boolean),
    [districtOptions, selectedDistrictSlugs]
  )
  const districtSummary = useMemo(() => {
    if (!selectedCitySlug) return 'Najpierw wybierz miasto'
    if (selectedDistrictLabels.length === 0) return 'Wszystkie dzielnice'
    if (selectedDistrictLabels.length <= 2) return selectedDistrictLabels.join(', ')
    return `${selectedDistrictLabels.slice(0, 2).join(', ')} +${selectedDistrictLabels.length - 2}`
  }, [selectedCitySlug, selectedDistrictLabels])
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

  const clearCitySelection = useCallback(() => {
    setSelectedCitySlug('')
    setSelectedDistrictSlugs([])
    setDraftDistrictSlugs([])
    setSelectedMetroLine('')
    setOpenMenu(null)
  }, [])

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
    } else {
      query = query.order('name')
    }

    const shouldFetchAll = selectedDistrictSlugs.length > 0 || Boolean(selectedMetroLine)

    // For map-heavy client filters (metro, district/city autocomplete), fetch all first.
    if (!shouldFetchAll) {
      const from = (pg - 1) * PAGE_SIZE
      query = query.range(from, from + PAGE_SIZE - 1)
    }

    const { data, count } = await query
    let results = (data || []) as ListingWithOperator[]

    if (selectedDistrictSlugs.length > 0) {
      results = results.filter((l) => selectedDistrictSlugs.includes(slugify(l.address_district || '')))
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
  }, [budgetThresholdPln, city, selectedDistrictSlugs, selectedMetroLine, selectedOperator, sort, workstationCapacityThreshold, operators])

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
    if (selectedMetroLine) params.set('metro_line', selectedMetroLine)
    if (selectedDistrictSlugs.length > 1) params.set('districts', selectedDistrictSlugs.join(','))
    if (sort) params.set('sort', sort)

    const basePath = selectedCitySlug
      ? selectedDistrictSlugs.length === 1
        ? `/biura-serwisowane/${selectedCitySlug}/${selectedDistrictSlugs[0]}`
        : `/biura-serwisowane/${selectedCitySlug}`
      : '/biura-serwisowane'

    const url = params.toString() ? `${basePath}?${params.toString()}` : basePath
    router.replace(url, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceniaDo, router, selectedAmenities, selectedCitySlug, selectedDistrictSlugs, selectedMetroLine, selectedOperator, sort, stanowiskaDo, stanowiskaOd])

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
    if (selectedCitySlug && slugify(listing.address_city) !== selectedCitySlug) {
      return false
    }
    if (selectedDistrictSlugs.length > 0) {
      return selectedDistrictSlugs.includes(slugify(listing.address_district || ''))
    }
    return true
  })

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

  const allVisible = applyBbox(featureFiltered)

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

  const isClientOnlyFilterActive = Boolean(selectedMetroLine || selectedDistrictSlugs.length > 0)
  const totalPages = isClientOnlyFilterActive ? 1 : Math.ceil(total / PAGE_SIZE)

  function handlePage(p: number) {
    setPage(p)
    fetchListings(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Compact inline-label filter style — h-10, matches header button scale
  const filterTriggerClass =
    'flex h-10 w-full items-center justify-between gap-2 bg-white pl-4 pr-3 text-left transition-all duration-200 hover:bg-[#eef3ff]'
  const filterMenuClass =
    'absolute left-0 top-[calc(100%+6px)] z-30 min-w-[300px] border border-[#d8e2fb] bg-white shadow-[0_24px_56px_rgba(0,7,89,0.12)]'
  const filterFieldWrapClass = 'flex flex-col xl:flex-1 xl:min-w-0'
  const filterLabelClass = 'mb-2 block px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white'
  const filterLabelItemClass = 'mb-2 block px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white'
  const budgetOptions = [
    { value: '', label: 'Dowolny' },
    { value: '1500', label: `Do 1 500 ${currency}` },
    { value: '2500', label: `Do 2 500 ${currency}` },
    { value: '4000', label: `Do 4 000 ${currency}` },
  ]
  const sortOptions = [
    { value: '', label: 'Domyślne (A–Z)' },
    { value: 'cena_asc', label: 'Cena: od najniższej' },
    { value: 'cena_desc', label: 'Cena: od najwyższej' },
  ]
  const selectedOperatorLabel = operators.find((op) => op.slug === selectedOperator)?.name || 'Wszyscy'
  const selectedMetroLabel = METRO_LINES.find((line) => line.id === selectedMetroLine)?.name || 'Wszystkie'
  const selectedBudgetLabel = budgetOptions.find((option) => option.value === ceniaDo)?.label || 'Dowolny'
  const selectedSortLabel = sortOptions.find((option) => option.value === sort)?.label || 'Domyślne (A–Z)'

  const filterBar = (
    <div
      ref={filterMenusRef}
      className="grid items-start gap-5 md:grid-cols-2 xl:flex xl:flex-nowrap xl:items-start xl:gap-x-3"
    >
      <div className={`relative ${filterFieldWrapClass}`}>
        <p className={filterLabelClass}>Miasto</p>
        <button type="button" onClick={() => setOpenMenu((value) => (value === 'city' ? null : 'city'))} className={filterTriggerClass}>
          <span className="truncate">{selectedCitySlug ? slugToCity(selectedCitySlug) : 'Cała Polska'}</span>
          <span className="flex items-center gap-2">
            {selectedCitySlug ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation()
                  clearCitySelection()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    clearCitySelection()
                  }
                }}
                className="text-[#92a1ca] transition-colors hover:text-[#ED1B34]"
              >
                <X size={15} />
              </span>
            ) : null}
            <ChevronDown size={15} className={`transition-transform ${openMenu === 'city' ? 'rotate-180' : ''}`} />
          </span>
        </button>
        {openMenu === 'city' ? (
          <div className={`${filterMenuClass} filter-menu-enter`}>
            <div className="max-h-72 overflow-y-auto overscroll-contain px-3 py-3 space-y-2" data-lenis-prevent>
              <button
                type="button"
                onClick={() => {
                  clearCitySelection()
                  setOpenMenu(null)
                }}
                className="flex w-full items-center justify-between border border-[#e7edf9] bg-white px-4 py-3 text-left text-[15px] font-medium text-[#000759] transition-all hover:border-[#b7cbff] hover:bg-[#f8fbff]"
              >
                <span>Cała Polska</span>
                {!selectedCitySlug ? <Check size={14} className="text-[#1C54F4]" /> : null}
              </button>
              {CITY_AREAS.map((cityArea) => {
                const checked = selectedCitySlug === cityArea.city
                return (
                  <button
                    key={cityArea.city}
                    type="button"
                    onClick={() => {
                      setSelectedCitySlug(cityArea.city)
                      setOpenMenu(null)
                    }}
                    className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] font-medium transition-all ${
                      checked ? 'border-[#1C54F4] bg-[#edf3ff] text-[#000759]' : 'border-[#e7edf9] bg-white text-[#000759] hover:border-[#b7cbff] hover:bg-[#f8fbff]'
                    }`}
                  >
                    <span>{cityArea.label}</span>
                    {checked ? <Check size={14} className="text-[#1C54F4]" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className={`relative ${filterFieldWrapClass}`}>
        <p className={filterLabelClass}>Dzielnice</p>
        {/* District dropdown is intentionally wider than its trigger via min-w on filterMenuClass */}
        <button
          type="button"
          disabled={!selectedCitySlug}
          onClick={() => selectedCitySlug && setOpenMenu((value) => (value === 'district' ? null : 'district'))}
          className={`${filterTriggerClass} ${
            selectedCitySlug ? '' : 'cursor-not-allowed text-[#acbbe8] bg-[#f8f9fd]'
          }`}
        >
          <span className="truncate">
            {selectedDistrictLabels.length === 0
              ? districtSummary
              : selectedDistrictLabels.length === 1
                ? selectedDistrictLabels[0]
                : `Wybrane dzielnice (${selectedDistrictLabels.length})`}
          </span>
          <ChevronDown size={15} className={`shrink-0 transition-transform ${openMenu === 'district' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'district' && selectedCitySlug ? (
          <div className={`${filterMenuClass} min-w-[420px] filter-menu-enter`}>
            <div className="flex items-center justify-between border-b border-[#edf2fb] px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C54F4]">Dzielnice</p>
                <p className="mt-1 text-[11px] text-[#61719a]">Możesz wybrać kilka dzielnic jednocześnie.</p>
              </div>
              <button
                type="button"
                onClick={() => setDraftDistrictSlugs([])}
                className="eyebrow-label text-[10px] transition-colors hover:text-[#000759]"
              >
                Wyczyść
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto overscroll-contain px-4 py-3 space-y-2" data-lenis-prevent>
              {districtOptions.map((districtItem) => {
                const checked = draftDistrictSlugs.includes(districtItem.slug)
                return (
                  <label
                    key={districtItem.slug}
                    className={`flex cursor-pointer items-center gap-3 border px-3 py-3 transition-all ${
                      checked ? 'border-[#1C54F4] bg-[#edf3ff]' : 'border-[#e7edf9] bg-white hover:border-[#b7cbff]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => {
                        setDraftDistrictSlugs((prev) =>
                          checked ? prev.filter((slug) => slug !== districtItem.slug) : [...prev, districtItem.slug]
                        )
                      }}
                    />
                    <span className={`flex h-5 w-5 items-center justify-center border ${checked ? 'border-[#1C54F4] bg-[#1C54F4] text-white' : 'border-[#c6d5f8] text-transparent'}`}>
                      <Check size={12} />
                    </span>
                    <span className="text-[15px] font-medium text-[#000759]">{districtItem.label}</span>
                  </label>
                )
              })}
            </div>
            <div className="border-t border-[#edf2fb] px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrictSlugs(draftDistrictSlugs)
                  setOpenMenu(null)
                }}
                className="btn-primary w-full justify-center"
              >
                Zastosuj
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className={filterFieldWrapClass}>
        <FilterLabel tooltip="Liczba stanowisk pracy oznacza liczbę miejsc do pracy w całym biurze, rozumianych jako biurko plus fotel." labelClass={filterLabelItemClass}>
          Stanowiska
        </FilterLabel>
        <div className="flex h-10 w-full items-center gap-2 bg-white px-4">
          <input
            type="number"
            placeholder="od"
            className="w-full min-w-0 bg-transparent border-none p-0 text-left text-sm font-bold text-[#000759] focus:ring-0 placeholder:text-slate-300"
            value={stanowiskaOd}
            onChange={(e) => setStanowiskaOd(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            min={1}
          />
          <span className="text-slate-300">—</span>
          <input
            type="number"
            placeholder="do"
            className="w-full min-w-0 bg-transparent border-none p-0 text-left text-sm font-bold text-[#000759] focus:ring-0 placeholder:text-slate-300"
            value={stanowiskaDo}
            onChange={(e) => setStanowiskaDo(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            min={1}
          />
        </div>
      </div>

      <div className={`relative ${filterFieldWrapClass}`}>
        <FilterLabel tooltip="Budżet oznacza miesięczny budżet za jedno stanowisko pracy." labelClass={filterLabelItemClass}>
          Budżet ({currency})
        </FilterLabel>
        <button type="button" onClick={() => setOpenMenu((value) => (value === 'budget' ? null : 'budget'))} className={filterTriggerClass}>
          <span className="truncate">{selectedBudgetLabel}</span>
          <ChevronDown size={15} className={`transition-transform ${openMenu === 'budget' ? 'rotate-180' : ''}`} />
        </button>
        {openMenu === 'budget' ? (
          <div className={`${filterMenuClass} filter-menu-enter`}>
            <div className="max-h-72 overflow-y-auto overscroll-contain px-3 py-3 space-y-2" data-lenis-prevent>
              {budgetOptions.map((option) => {
                const checked = ceniaDo === option.value
                return (
                  <button
                    key={option.value || 'any'}
                    type="button"
                    onClick={() => {
                      setCeniaDo(option.value)
                      setOpenMenu(null)
                    }}
                    className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] font-medium transition-all ${
                      checked ? 'border-[#1C54F4] bg-[#edf3ff] text-[#000759]' : 'border-[#e7edf9] bg-white text-[#000759] hover:border-[#b7cbff] hover:bg-[#f8fbff]'
                    }`}
                  >
                    <span>{option.label}</span>
                    {checked ? <Check size={14} className="text-[#1C54F4]" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className={`relative ${filterFieldWrapClass}`}>
        <p className={filterLabelClass}>Operator</p>
        <button type="button" onClick={() => setOpenMenu((value) => (value === 'operator' ? null : 'operator'))} className={filterTriggerClass}>
          <span className="truncate">{selectedOperatorLabel}</span>
          <ChevronDown size={15} className={`transition-transform ${openMenu === 'operator' ? 'rotate-180' : ''}`} />
        </button>
        {openMenu === 'operator' ? (
          <div className={`${filterMenuClass} filter-menu-enter`}>
            <div className="max-h-72 overflow-y-auto overscroll-contain px-3 py-3 space-y-2" data-lenis-prevent>
              <button
                type="button"
                onClick={() => {
                  setSelectedOperator('')
                  setOpenMenu(null)
                }}
                className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] font-medium transition-all ${
                  !selectedOperator ? 'border-[#1C54F4] bg-[#edf3ff] text-[#000759]' : 'border-[#e7edf9] bg-white text-[#000759] hover:border-[#b7cbff] hover:bg-[#f8fbff]'
                }`}
              >
                <span>Wszyscy</span>
                {!selectedOperator ? <Check size={14} className="text-[#1C54F4]" /> : null}
              </button>
              {operators.map((op) => {
                const checked = selectedOperator === op.slug
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setSelectedOperator(op.slug)
                      setOpenMenu(null)
                    }}
                    className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] font-medium transition-all ${
                      checked ? 'border-[#1C54F4] bg-[#edf3ff] text-[#000759]' : 'border-[#e7edf9] bg-white text-[#000759] hover:border-[#b7cbff] hover:bg-[#f8fbff]'
                    }`}
                  >
                    <span>{op.name}</span>
                    {checked ? <Check size={14} className="text-[#1C54F4]" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>

      {selectedCitySlug === 'warszawa' ? (
        <div className={`relative ${filterFieldWrapClass}`}>
          <p className={filterLabelClass}>Linia metra</p>
          <button type="button" onClick={() => setOpenMenu((value) => (value === 'metro' ? null : 'metro'))} className={filterTriggerClass}>
            <span className="truncate">{selectedMetroLabel}</span>
            <ChevronDown size={15} className={`transition-transform ${openMenu === 'metro' ? 'rotate-180' : ''}`} />
          </button>
          {openMenu === 'metro' ? (
            <div className={`${filterMenuClass} filter-menu-enter`}>
              <div className="max-h-72 overflow-y-auto overscroll-contain px-3 py-3 space-y-2" data-lenis-prevent>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMetroLine('')
                    setOpenMenu(null)
                  }}
                  className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] font-medium transition-all ${
                    !selectedMetroLine ? 'border-[#1C54F4] bg-[#edf3ff] text-[#000759]' : 'border-[#e7edf9] bg-white text-[#000759] hover:border-[#b7cbff] hover:bg-[#f8fbff]'
                  }`}
                >
                  <span>Wszystkie</span>
                  {!selectedMetroLine ? <Check size={14} className="text-[#1C54F4]" /> : null}
                </button>
                {METRO_LINES.map((line) => {
                  const checked = selectedMetroLine === line.id
                  return (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => {
                        setSelectedMetroLine(line.id)
                        setOpenMenu(null)
                      }}
                      className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] font-medium transition-all ${
                        checked ? 'border-[#1C54F4] bg-[#edf3ff] text-[#000759]' : 'border-[#e7edf9] bg-white text-[#000759] hover:border-[#b7cbff] hover:bg-[#f8fbff]'
                      }`}
                    >
                      <span>{line.name}</span>
                      {checked ? <Check size={14} className="text-[#1C54F4]" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={`${filterFieldWrapClass}`}>
        <p className={`${filterLabelClass} opacity-0`}>Filtry</p>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 bg-[rgba(255,255,255,0.08)] px-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white hover:text-[#000759]"
        >
          Więcej filtrów
          <SlidersHorizontal size={13} />
          {selectedAmenities.length > 0 ? <span className="text-current">({selectedAmenities.length})</span> : null}
        </button>
      </div>

      <div className={`relative ${filterFieldWrapClass}`}>
        <p className={filterLabelClass}>Sortowanie</p>
        <button type="button" onClick={() => setOpenMenu((value) => (value === 'sort' ? null : 'sort'))} className={filterTriggerClass}>
          <span className="truncate">{selectedSortLabel}</span>
          <ChevronDown size={15} className={`transition-transform ${openMenu === 'sort' ? 'rotate-180' : ''}`} />
        </button>
        {openMenu === 'sort' ? (
          <div className={`${filterMenuClass} filter-menu-enter`}>
            <div className="max-h-72 overflow-y-auto overscroll-contain px-3 py-3 space-y-2" data-lenis-prevent>
              {sortOptions.map((option) => {
                const checked = sort === option.value
                return (
                  <button
                    key={option.value || 'recommended'}
                    type="button"
                    onClick={() => {
                      setSort(option.value)
                      setOpenMenu(null)
                    }}
                    className={`flex w-full items-center justify-between border px-4 py-3 text-left text-[15px] font-medium transition-all ${
                      checked ? 'border-[#1C54F4] bg-[#edf3ff] text-[#000759]' : 'border-[#e7edf9] bg-white text-[#000759] hover:border-[#b7cbff] hover:bg-[#f8fbff]'
                    }`}
                  >
                    <span>{option.label}</span>
                    {checked ? <Check size={14} className="text-[#1C54F4]" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
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

      <div className="flex h-[calc(100dvh-80px)] flex-col overflow-hidden bg-white">
        <div className="px-8 pb-4 pt-6 lg:px-16">
          <div className="bg-[var(--colliers-navy)] px-8 py-6 shadow-[0_18px_40px_rgba(0,7,89,0.18)]" ref={filterBarRef}>{filterBar}</div>
        </div>

        {/* Main content: list + map */}
        <div className="relative min-h-0 flex-1 bg-white px-8 pb-6 lg:px-16">
          {/* Desktop: side-by-side */}
          <div className="hidden h-full min-h-0 gap-4 lg:flex">
            {/* List — 40% */}
            <div className="surface-panel w-[40%] flex-shrink-0 overflow-y-auto" data-lenis-prevent>
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
              <div className="flex flex-col gap-4 px-8 pb-6 pt-6">
                {allVisible.map((l) => (
                  <div
                    key={l.id}
                    onMouseEnter={() => setHighlightedId(l.id)}
                    onMouseLeave={() => setHighlightedId(null)}
                  >
                    <ListingCard
                      listing={l}
                      highlighted={highlightedId === l.id}
                      selectedWorkstationsFrom={stanowiskaOd ? Number(stanowiskaOd) : null}
                      selectedWorkstationsTo={stanowiskaDo ? Number(stanowiskaDo) : null}
                    />
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
            <div className="surface-panel min-h-0 flex-1 overflow-hidden" data-lenis-prevent>
              <MapView
                listings={featureFiltered}
                highlightedId={highlightedId}
                onMarkerClick={(id) => setHighlightedId(id)}
                onBoundsChange={(bounds) => setMapBounds(bounds)}
                initialCity={selectedCitySlug || undefined}
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
              <div className="flex flex-col gap-4 pb-20">
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
                  allVisible.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      selectedWorkstationsFrom={stanowiskaOd ? Number(stanowiskaOd) : null}
                      selectedWorkstationsTo={stanowiskaDo ? Number(stanowiskaDo) : null}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="overflow-hidden border border-[#e6ebf7] bg-white shadow-[0_16px_44px_rgba(0,7,89,0.05)]" style={{ height: 'calc(100vh - 160px)' }}>
                <MapView
                  listings={featureFiltered}
                  highlightedId={null}
                  onMarkerClick={() => {}}
                  onBoundsChange={(bounds) => setMapBounds(bounds)}
                  initialCity={selectedCitySlug || undefined}
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
                <h3 className="text-2xl font-normal text-[#000759]" style={{ fontFamily: 'var(--font-serif)' }}>
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
                  <p className="text-2xl font-normal text-[#000759]" style={{ fontFamily: 'var(--font-serif)' }}>
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
