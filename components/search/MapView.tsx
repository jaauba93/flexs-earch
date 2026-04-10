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
  listingId: string
  isFeatured: boolean
}

function getMarkerStyle(isHighlighted: boolean, isFeatured: boolean): string {
  return `
    width: ${isHighlighted ? 14 : 11}px;
    height: ${isHighlighted ? 14 : 11}px;
    border-radius: 50%;
    background: ${isFeatured ? '#1C54F4' : isHighlighted ? '#000759' : '#25408F'};
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,7,89,0.35);
    cursor: pointer;
    transition: transform 0.15s ease, width 0.15s ease, height 0.15s ease;
    transform: ${isHighlighted ? 'scale(1.4)' : 'scale(1)'};
  `
}

function buildPopupHTML(listing: Listing & { operator: Operator }): string {
  const citySlug = slugify(listing.address_city)
  const districtSlug = listing.address_district ? slugify(listing.address_district) : '_'
  const href = `/biura-serwisowane/${citySlug}/${districtSlug}/${listing.slug}`
  return `
    <div style="font-family:'Open Sans',sans-serif;min-width:180px;padding:4px 2px">
      <p style="font-weight:700;color:#000759;margin:0 0 3px;font-size:13px;line-height:1.3">${listing.name}</p>
      <p style="color:#777;margin:0 0 6px;font-size:11px">${listing.address_street ?? ''}</p>
      ${listing.price_desk_private ? `<p style="color:#1C54F4;margin:0 0 10px;font-size:12px;font-weight:700">od ${listing.price_desk_private.toLocaleString('pl-PL')} PLN / mies.</p>` : ''}
      <a href="${href}" style="display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#000759;text-decoration:none;border-bottom:1px solid #000759;padding-bottom:1px">Szczegóły →</a>
    </div>
  `
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
        el.style.cssText = getMarkerStyle(false, !!listing.is_featured)

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
            .setHTML(buildPopupHTML(listing))
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

        markerEntriesRef.current.push({ marker, el, listingId: listing.id, isFeatured: !!listing.is_featured })
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
    markerEntriesRef.current.forEach(({ el, listingId, isFeatured }) => {
      el.style.cssText = getMarkerStyle(listingId === highlightedId, isFeatured)
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
