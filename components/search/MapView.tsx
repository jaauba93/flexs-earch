'use client'

import { useEffect, useRef, useState } from 'react'
import type mapboxgl from 'mapbox-gl'
import type { Listing, Operator } from '@/types/database'
import { POLAND_CENTER, POLAND_ZOOM, CITY_CENTERS } from '@/lib/mapbox/helpers'

interface MapViewProps {
  listings: (Listing & { operator: Operator })[]
  highlightedId: string | null
  onMarkerClick: (id: string) => void
  initialCity?: string
}

export default function MapView({ listings, highlightedId, onMarkerClick, initialCity }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
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
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [token, initialCity])

  // Update markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    import('mapbox-gl').then((mapboxgl) => {
      // Remove old markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      listings.forEach((listing) => {
        const el = document.createElement('div')
        el.className = 'mapbox-marker'
        const isHighlighted = listing.id === highlightedId
        el.style.cssText = `
          width: ${isHighlighted ? 14 : 12}px;
          height: ${isHighlighted ? 14 : 12}px;
          border-radius: 50%;
          background: ${listing.is_featured ? '#1C54F4' : (isHighlighted ? '#000759' : '#25408F')};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,7,89,0.3);
          cursor: pointer;
          transition: transform 0.15s ease;
          transform: ${isHighlighted ? 'scale(1.3)' : 'scale(1)'};
        `

        const currentMap = mapRef.current
        if (!currentMap) return

        const marker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([listing.longitude, listing.latitude])
          .addTo(currentMap)

        el.addEventListener('click', () => onMarkerClick(listing.id))

        // Popup
        const popup = new mapboxgl.default.Popup({ offset: 15, closeButton: false })
          .setHTML(`
            <div style="font-family:'Open Sans',sans-serif;min-width:160px;padding:4px">
              <p style="font-weight:600;color:#000759;margin:0 0 2px;font-size:13px">${listing.name}</p>
              <p style="color:#555;margin:0;font-size:12px">${listing.address_street}</p>
              ${listing.price_desk_private ? `<p style="color:#1C54F4;margin:4px 0 0;font-size:12px;font-weight:600">od ${listing.price_desk_private.toLocaleString('pl-PL')} PLN</p>` : ''}
            </div>
          `)

        el.addEventListener('mouseenter', () => popup.addTo(currentMap).setLngLat([listing.longitude, listing.latitude]))
        el.addEventListener('mouseleave', () => popup.remove())

        markersRef.current.push(marker)
      })

      // Fit bounds if there are listings
      if (listings.length > 0 && listings.length < 50 && mapRef.current) {
        const bounds = listings.reduce(
          (b, l) => b.extend([l.longitude, l.latitude] as [number, number]),
          new mapboxgl.default.LngLatBounds([listings[0].longitude, listings[0].latitude], [listings[0].longitude, listings[0].latitude])
        )
        mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 500 })
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
          <p className="text-[var(--colliers-gray)] text-sm">Ładowanie mapy…</p>
        </div>
      )}
    </div>
  )
}
