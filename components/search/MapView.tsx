'use client'

import { useEffect, useRef, useState } from 'react'
import type mapboxgl from 'mapbox-gl'
import type { Listing, Operator } from '@/types/database'
import { POLAND_CENTER, POLAND_ZOOM, CITY_CENTERS } from '@/lib/mapbox/helpers'

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

export default function MapView({ listings, highlightedId, onMarkerClick, onBoundsChange, initialCity }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const hasUserInteracted = useRef(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

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

      // Track user interaction
      map.on('dragstart', () => { hasUserInteracted.current = true })
      map.on('wheel', () => { hasUserInteracted.current = true })

      // Report bounds after user moves the map
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
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, initialCity])

  // Update markers when listings or highlight changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    import('mapbox-gl').then((mapboxgl) => {
      // Remove old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      // Only render listings with valid coordinates
      const valid = listings.filter(
        (l) => l.latitude != null && l.longitude != null && isFinite(l.latitude) && isFinite(l.longitude)
      )

      valid.forEach((listing) => {
        const isHighlighted = listing.id === highlightedId

        const el = document.createElement('div')
        el.style.cssText = `
          width: ${isHighlighted ? 14 : 11}px;
          height: ${isHighlighted ? 14 : 11}px;
          border-radius: 50%;
          background: ${listing.is_featured ? '#1C54F4' : (isHighlighted ? '#000759' : '#25408F')};
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,7,89,0.35);
          cursor: pointer;
          transition: transform 0.15s ease, width 0.15s ease, height 0.15s ease;
          transform: ${isHighlighted ? 'scale(1.4)' : 'scale(1)'};
        `

        const currentMap = mapRef.current
        if (!currentMap) return

        const marker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([listing.longitude, listing.latitude])
          .addTo(currentMap)

        el.addEventListener('click', () => onMarkerClick(listing.id))

        const popup = new mapboxgl.default.Popup({ offset: 15, closeButton: false, className: 'mapbox-popup-colliers' })
          .setHTML(`
            <div style="font-family:'Open Sans',sans-serif;min-width:160px;padding:4px 2px">
              <p style="font-weight:700;color:#000759;margin:0 0 3px;font-size:13px;line-height:1.3">${listing.name}</p>
              <p style="color:#777;margin:0 0 4px;font-size:11px">${listing.address_street}</p>
              ${listing.price_desk_private ? `<p style="color:#1C54F4;margin:0;font-size:12px;font-weight:700">od ${listing.price_desk_private.toLocaleString('pl-PL')} PLN / mies.</p>` : ''}
            </div>
          `)

        el.addEventListener('mouseenter', () => {
          if (mapRef.current) popup.addTo(mapRef.current).setLngLat([listing.longitude, listing.latitude])
        })
        el.addEventListener('mouseleave', () => popup.remove())

        markersRef.current.push(marker)
      })

      // Auto-fit bounds only on initial load (not user-initiated moves)
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
  }, [listings, highlightedId, mapLoaded, onMarkerClick])

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
