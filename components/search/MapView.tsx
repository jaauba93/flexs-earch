'use client'

import { useEffect, useRef, useState } from 'react'
import type mapboxgl from 'mapbox-gl'
import type { Listing, Operator } from '@/types/database'
import { POLAND_CENTER, POLAND_ZOOM, CITY_CENTERS } from '@/lib/mapbox/helpers'
import { slugify } from '@/lib/utils/slugify'

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

interface MapViewProps {
  listings: (Listing & { operator: Operator })[]
  highlightedId: string | null
  onMarkerClick: (id: string) => void
  onBoundsChange?: (bounds: MapBounds) => void
  initialCity?: string
}

type MarkerEntry = {
  marker: mapboxgl.Marker
  el: HTMLDivElement
  dotEl: HTMLDivElement
  listingId: string
  isFeatured: boolean
}

const BASKET_KEY = 'colliers-flex-basket'
const MAX_BASKET = 10

function applyMarkerStyle(el: HTMLDivElement, isHighlighted: boolean, isFeatured: boolean) {
  el.style.width = `${isHighlighted ? 14 : 11}px`
  el.style.height = `${isHighlighted ? 14 : 11}px`
  el.style.borderRadius = '9999px'
  el.style.background = isFeatured ? '#1C54F4' : isHighlighted ? '#000759' : '#25408F'
  el.style.border = '2px solid white'
  el.style.boxShadow = '0 2px 8px rgba(0,7,89,0.35)'
  el.style.cursor = 'pointer'
  el.style.transition = 'transform 0.15s ease, width 0.15s ease, height 0.15s ease, background 0.15s ease'
  el.style.transform = isHighlighted ? 'scale(1.4)' : 'scale(1)'
}

function addListingToBasket(listing: Listing & { operator: Operator }) {
  const nextItem = {
    id: listing.id,
    name: listing.name,
    address_street: listing.address_street,
    address_city: listing.address_city,
    address_district: listing.address_district,
    address_postcode: listing.address_postcode,
    main_image_url: listing.main_image_url,
    slug: listing.slug,
  }

  try {
    const stored = window.localStorage.getItem(BASKET_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    const items = Array.isArray(parsed) ? parsed : []

    if (items.some((item) => item?.id === listing.id)) return
    if (items.length >= MAX_BASKET) return

    window.localStorage.setItem(BASKET_KEY, JSON.stringify([...items, nextItem]))
    window.dispatchEvent(new Event('basket:update'))
  } catch {
    // ignore basket persistence issues in popup CTA
  }
}

function buildPopupContent(listing: Listing & { operator: Operator }): HTMLDivElement {
  const citySlug = slugify(listing.address_city)
  const districtSlug = listing.address_district ? slugify(listing.address_district) : '_'
  const detailsHref = `/biura-serwisowane/${citySlug}/${districtSlug}/${listing.slug}`
  const compareHref = '/porownaj'

  const root = document.createElement('div')
  root.style.fontFamily = "'Open Sans', sans-serif"
  root.style.minWidth = '180px'
  root.style.padding = '4px 2px'

  const title = document.createElement('p')
  title.textContent = listing.name
  title.style.fontWeight = '700'
  title.style.color = '#000759'
  title.style.margin = '0 0 3px'
  title.style.fontSize = '13px'
  title.style.lineHeight = '1.3'

  const address = document.createElement('p')
  address.textContent = listing.address_street ?? ''
  address.style.color = '#777'
  address.style.margin = '0 0 6px'
  address.style.fontSize = '11px'

  root.append(title, address)

  if (listing.price_desk_private) {
    const price = document.createElement('p')
    price.textContent = `od ${listing.price_desk_private.toLocaleString('pl-PL')} PLN / mies.`
    price.style.color = '#1C54F4'
    price.style.margin = '0 0 10px'
    price.style.fontSize = '12px'
    price.style.fontWeight = '700'
    root.append(price)
  }

  const actions = document.createElement('div')
  actions.style.display = 'flex'
  actions.style.alignItems = 'center'
  actions.style.gap = '14px'
  actions.style.flexWrap = 'wrap'

  const detailsLink = document.createElement('a')
  detailsLink.href = detailsHref
  detailsLink.textContent = 'Szczegóły →'
  detailsLink.style.display = 'inline-block'
  detailsLink.style.fontSize = '10px'
  detailsLink.style.fontWeight = '700'
  detailsLink.style.textTransform = 'uppercase'
  detailsLink.style.letterSpacing = '0.08em'
  detailsLink.style.color = '#000759'
  detailsLink.style.textDecoration = 'none'
  detailsLink.style.borderBottom = '1px solid #000759'
  detailsLink.style.paddingBottom = '1px'

  const compareLink = document.createElement('a')
  compareLink.href = compareHref
  compareLink.textContent = 'Porównaj →'
  compareLink.style.display = 'inline-block'
  compareLink.style.fontSize = '10px'
  compareLink.style.fontWeight = '700'
  compareLink.style.textTransform = 'uppercase'
  compareLink.style.letterSpacing = '0.08em'
  compareLink.style.color = '#1C54F4'
  compareLink.style.textDecoration = 'none'
  compareLink.style.borderBottom = '1px solid #1C54F4'
  compareLink.style.paddingBottom = '1px'
  compareLink.addEventListener('click', () => {
    addListingToBasket(listing)
  })

  actions.append(detailsLink, compareLink)
  root.append(actions)

  return root
}

export default function MapView({ listings, highlightedId, onMarkerClick, onBoundsChange, initialCity }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerEntriesRef = useRef<MarkerEntry[]>([])
  const hasUserInteracted = useRef(false)
  const lockedIdRef = useRef<string | null>(null)
  const activePopupRef = useRef<mapboxgl.Popup | null>(null)
  const onMarkerClickRef = useRef(onMarkerClick)
  const [mapLoaded, setMapLoaded] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Keep callback ref current so marker closures don't go stale
  useEffect(() => { onMarkerClickRef.current = onMarkerClick }, [onMarkerClick])

  // ── Initialize map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return

    let map: mapboxgl.Map
    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = token
      const cityData = initialCity ? CITY_CENTERS[initialCity] : null
      map = new mapboxgl.default.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: cityData ? cityData.center : POLAND_CENTER,
        zoom: cityData ? cityData.zoom : POLAND_ZOOM,
      })
      mapRef.current = map

      map.on('load', () => setMapLoaded(true))
      map.on('dragstart', () => { hasUserInteracted.current = true })
      map.on('wheel', () => { hasUserInteracted.current = true })

      map.on('moveend', () => {
        if (!hasUserInteracted.current || !onBoundsChange) return
        const bounds = map.getBounds()
        if (bounds) {
          onBoundsChange({
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest(),
          })
        }
      })

      // Click on empty map area: release locked popup
      map.on('click', () => {
        lockedIdRef.current = null
        activePopupRef.current?.remove()
        activePopupRef.current = null
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, initialCity])

  // ── Create markers when listing data changes (NOT on highlight change) ──────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    import('mapbox-gl').then((mapboxgl) => {
      // Remove old markers and clear any open popup
      markerEntriesRef.current.forEach(({ marker }) => marker.remove())
      markerEntriesRef.current = []
      lockedIdRef.current = null
      activePopupRef.current?.remove()
      activePopupRef.current = null

      const valid = listings.filter(
        (l) => l.latitude != null && l.longitude != null && isFinite(l.latitude) && isFinite(l.longitude)
      )

      valid.forEach((listing) => {
        const el = document.createElement('div')
        el.style.display = 'flex'
        el.style.alignItems = 'center'
        el.style.justifyContent = 'center'

        const dotEl = document.createElement('div')
        applyMarkerStyle(dotEl, false, !!listing.is_featured)
        el.append(dotEl)

        const currentMap = mapRef.current
        if (!currentMap) return

        const marker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([listing.longitude, listing.latitude])
          .addTo(currentMap)

        const openPopup = () => {
          activePopupRef.current?.remove()
          const popup = new mapboxgl.default.Popup({
            offset: 15,
            closeButton: false,
            className: 'mapbox-popup-colliers',
          })
            .setDOMContent(buildPopupContent(listing))
            .setLngLat([listing.longitude, listing.latitude])
          if (mapRef.current) {
            popup.addTo(mapRef.current)
            activePopupRef.current = popup
          }
        }

        el.addEventListener('mouseenter', (e) => {
          e.stopPropagation()
          openPopup()
        })
        el.addEventListener('mouseleave', () => {
          // Keep popup if this marker is locked (clicked)
          if (lockedIdRef.current === listing.id) return
          activePopupRef.current?.remove()
          activePopupRef.current = null
        })
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          lockedIdRef.current = listing.id
          openPopup()
          onMarkerClickRef.current(listing.id)
        })

        markerEntriesRef.current.push({ marker, el, dotEl, listingId: listing.id, isFeatured: !!listing.is_featured })
      })

      // Auto-fit bounds on initial load only
      if (!hasUserInteracted.current && valid.length > 0 && valid.length < 60 && mapRef.current) {
        const bounds = valid.reduce(
          (b, l) => b.extend([l.longitude, l.latitude] as [number, number]),
          new mapboxgl.default.LngLatBounds(
            [valid[0].longitude, valid[0].latitude],
            [valid[0].longitude, valid[0].latitude]
          )
        )
        mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 600 })
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, mapLoaded])

  // ── Update highlight style without recreating markers ───────────────────────
  useEffect(() => {
    markerEntriesRef.current.forEach(({ dotEl, listingId, isFeatured }) => {
      applyMarkerStyle(dotEl, listingId === highlightedId, isFeatured)
    })
  }, [highlightedId])

  if (!token) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--colliers-bg-light-blue)] text-[var(--colliers-gray)]">
        <p className="text-sm">Mapa niedostępna (brak tokenu Mapbox)</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--colliers-bg-light-blue)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#1C54F4] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--colliers-gray)] text-sm">Ładowanie mapy…</p>
          </div>
        </div>
      )}
    </div>
  )
}
