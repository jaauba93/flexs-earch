'use client'

import { useEffect, useRef, useState } from 'react'
import type mapboxgl from 'mapbox-gl'
import type { Listing, Operator } from '@/types/database'
import { POLAND_CENTER, POLAND_ZOOM, CITY_CENTERS } from '@/lib/mapbox/helpers'
import { METRO_LINES } from '@/lib/mapbox/metro'
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
  showDistrictGrid?: boolean
  showMetroLines?: boolean
  onToggleDistrictGrid?: () => void
  onToggleMetroLines?: () => void
}

const LISTINGS_SOURCE_ID = 'listings-source'
const DISTRICTS_SOURCE_ID = 'districts-source'
const METRO_SOURCE_ID = 'metro-source'
const CLUSTERS_LAYER_ID = 'clusters-layer'
const CLUSTER_COUNT_LAYER_ID = 'cluster-count-layer'
const POINTS_LAYER_ID = 'points-layer'
const HIGHLIGHTED_LAYER_ID = 'highlighted-layer'
const DISTRICT_FILL_LAYER_ID = 'district-fill-layer'
const DISTRICT_LINE_LAYER_ID = 'district-line-layer'
const DISTRICT_ADMIN_LAYER_ID = 'district-admin-lines-layer'
const METRO_LINE_LAYER_ID = 'metro-line-layer'

const BASKET_KEY = 'colliers-flex-basket'
const MAX_BASKET = 10

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

  const compareLink = document.createElement('button')
  compareLink.type = 'button'
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
  compareLink.style.background = 'transparent'
  compareLink.style.borderLeft = 'none'
  compareLink.style.borderTop = 'none'
  compareLink.style.borderRight = 'none'
  compareLink.style.borderRadius = '0'
  compareLink.style.cursor = 'pointer'
  compareLink.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    addListingToBasket(listing)
  })

  actions.append(detailsLink, compareLink)
  root.append(actions)

  return root
}

function buildListingsGeoJson(listings: (Listing & { operator: Operator })[]) {
  return {
    type: 'FeatureCollection' as const,
    features: listings.map((listing) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [listing.longitude, listing.latitude] as [number, number],
      },
      properties: {
        id: listing.id,
        isFeatured: listing.is_featured ? 1 : 0,
      },
    })),
  }
}

const EMPTY_GEOJSON = { type: 'FeatureCollection' as const, features: [] }

async function fetchDistrictsGeoJson(citySlug?: string): Promise<typeof EMPTY_GEOJSON> {
  try {
    const res = await fetch('/data/districts.geojson')
    if (!res.ok) return EMPTY_GEOJSON
    const all = await res.json()
    if (!citySlug) return all
    return {
      ...all,
      features: all.features.filter(
        (f: { properties: { city: string } }) => f.properties.city === citySlug
      ),
    }
  } catch {
    return EMPTY_GEOJSON
  }
}

function buildMetroGeoJson() {
  return {
    type: 'FeatureCollection' as const,
    features: METRO_LINES.map((line) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: line.path,
      },
      properties: {
        id: line.id,
        color: line.color,
      },
    })),
  }
}

export default function MapView({
  listings,
  highlightedId,
  onMarkerClick,
  onBoundsChange,
  initialCity,
  showDistrictGrid = true,
  showMetroLines = true,
  onToggleDistrictGrid,
  onToggleMetroLines,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const listingsByIdRef = useRef<Map<string, Listing & { operator: Operator }>>(new Map())
  const hasUserInteracted = useRef(false)
  const activePopupRef = useRef<mapboxgl.Popup | null>(null)
  const lockedPopupIdRef = useRef<string | null>(null)
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

      map.on('load', () => {
        map.addSource(LISTINGS_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 13,
          clusterRadius: 48,
        })

        map.addLayer({
          id: CLUSTERS_LAYER_ID,
          type: 'circle',
          source: LISTINGS_SOURCE_ID,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#4D93FF',
            'circle-stroke-color': '#25408F',
            'circle-stroke-width': 2,
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              14,
              15, 18,
              40, 24,
              100, 30,
            ],
          },
        })

        map.addLayer({
          id: CLUSTER_COUNT_LAYER_ID,
          type: 'symbol',
          source: LISTINGS_SOURCE_ID,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: {
            'text-color': '#FFFFFF',
          },
        })

        map.addLayer({
          id: POINTS_LAYER_ID,
          type: 'circle',
          source: LISTINGS_SOURCE_ID,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': 6,
            'circle-color': [
              'case',
              ['==', ['get', 'isFeatured'], 1],
              '#1C54F4',
              '#25408F',
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF',
          },
        })

        map.addLayer({
          id: HIGHLIGHTED_LAYER_ID,
          type: 'circle',
          source: LISTINGS_SOURCE_ID,
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'circle-radius': 9,
            'circle-color': '#000759',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#FFFFFF',
          },
        })

        map.addSource(DISTRICTS_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        map.addLayer({
          id: DISTRICT_FILL_LAYER_ID,
          type: 'fill',
          source: DISTRICTS_SOURCE_ID,
          paint: {
            'fill-color': '#1C54F4',
            'fill-opacity': 0.05,
          },
        })

        map.addLayer({
          id: DISTRICT_LINE_LAYER_ID,
          type: 'line',
          source: DISTRICTS_SOURCE_ID,
          paint: {
            'line-color': '#1C54F4',
            'line-width': 1.5,
            'line-opacity': 0.55,
            'line-dasharray': [4, 3],
          },
        })

        // Real Mapbox admin boundaries from composite/streets tileset (admin_level 7-9 = city districts)
        map.addLayer({
          id: DISTRICT_ADMIN_LAYER_ID,
          type: 'line',
          source: 'composite',
          'source-layer': 'admin',
          minzoom: 9,
          filter: ['all',
            ['>=', ['get', 'admin_level'], 7],
            ['<=', ['get', 'admin_level'], 9],
          ],
          paint: {
            'line-color': '#000759',
            'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.8, 12, 1.4, 15, 2.0],
            'line-opacity': 0.5,
          },
        }, 'road-label')

        map.addSource(METRO_SOURCE_ID, {
          type: 'geojson',
          data: buildMetroGeoJson(),
        })

        map.addLayer({
          id: METRO_LINE_LAYER_ID,
          type: 'line',
          source: METRO_SOURCE_ID,
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#1C54F4'],
            'line-width': 3,
            'line-opacity': 0.75,
          },
        })

        map.on('click', CLUSTERS_LAYER_ID, (event) => {
          const feature = event.features?.[0]
          if (!feature) return
          const clusterId = feature.properties?.cluster_id
          const source = map.getSource(LISTINGS_SOURCE_ID) as mapboxgl.GeoJSONSource
          source.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || typeof zoom !== 'number' || !feature.geometry || feature.geometry.type !== 'Point') return
            map.easeTo({
              center: feature.geometry.coordinates as [number, number],
              zoom,
              duration: 500,
            })
          })
        })

        map.on('mouseenter', CLUSTERS_LAYER_ID, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', CLUSTERS_LAYER_ID, () => {
          map.getCanvas().style.cursor = ''
        })

        map.on('click', POINTS_LAYER_ID, (event) => {
          event.originalEvent.stopPropagation()
          const feature = event.features?.[0]
          if (!feature) return
          const listingId = feature?.properties?.id as string | undefined
          if (!listingId) return

          const listing = listingsByIdRef.current.get(listingId)
          if (!listing) return

          if (!feature.geometry || feature.geometry.type !== 'Point') return
          if (lockedPopupIdRef.current === listingId) {
            onMarkerClickRef.current(listingId)
            return
          }
          lockedPopupIdRef.current = listingId
          activePopupRef.current?.remove()
          activePopupRef.current = new mapboxgl.default.Popup({
            offset: 15,
            closeButton: false,
            className: 'mapbox-popup-colliers',
          })
            .setDOMContent(buildPopupContent(listing))
            .setLngLat(feature.geometry.coordinates as [number, number])
            .addTo(map)

          onMarkerClickRef.current(listingId)
        })

        map.on('mouseenter', POINTS_LAYER_ID, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', POINTS_LAYER_ID, () => {
          map.getCanvas().style.cursor = ''
        })

        setMapLoaded(true)
      })
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
    const map = mapRef.current
    const cityData = initialCity ? CITY_CENTERS[initialCity] : null
    map.easeTo({
      center: cityData ? cityData.center : POLAND_CENTER,
      zoom: cityData ? cityData.zoom : POLAND_ZOOM,
      duration: 500,
    })

    const districtSource = map.getSource(DISTRICTS_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
    if (districtSource) {
      fetchDistrictsGeoJson(initialCity).then((geojson) => {
        // Re-check source still exists (map may have been unmounted)
        const src = mapRef.current?.getSource(DISTRICTS_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
        src?.setData(geojson as Parameters<typeof src.setData>[0])
      })
    }

    activePopupRef.current?.remove()
    activePopupRef.current = null
    lockedPopupIdRef.current = null
  }, [initialCity, mapLoaded])

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    
    const valid = listings.filter(
      (listing) =>
        listing.latitude != null &&
        listing.longitude != null &&
        Number.isFinite(listing.latitude) &&
        Number.isFinite(listing.longitude)
    )

    listingsByIdRef.current = new Map(valid.map((listing) => [listing.id, listing]))

    const map = mapRef.current
    const listingSource = map.getSource(LISTINGS_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
    if (listingSource) listingSource.setData(buildListingsGeoJson(valid))

    // Auto-fit bounds on initial load only
    if (!hasUserInteracted.current && valid.length > 0 && valid.length < 100) {
      const minLng = Math.min(...valid.map((item) => item.longitude))
      const maxLng = Math.max(...valid.map((item) => item.longitude))
      const minLat = Math.min(...valid.map((item) => item.latitude))
      const maxLat = Math.max(...valid.map((item) => item.latitude))
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 80, maxZoom: 14, duration: 600 }
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, mapLoaded])

  // ── Update highlighted point ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const highlightFilter = highlightedId
      ? ['==', ['get', 'id'], highlightedId]
      : ['==', ['get', 'id'], '']
    mapRef.current.setFilter(HIGHLIGHTED_LAYER_ID, highlightFilter as mapboxgl.FilterSpecification)
  }, [highlightedId, mapLoaded])

  // ── Toggle map overlays ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    const vis = showDistrictGrid ? 'visible' : 'none'
    const safeSet = (layerId: string) => {
      try { if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', vis) } catch { /* layer not ready */ }
    }
    safeSet(DISTRICT_FILL_LAYER_ID)
    safeSet(DISTRICT_LINE_LAYER_ID)
    safeSet(DISTRICT_ADMIN_LAYER_ID)
  }, [mapLoaded, showDistrictGrid])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return
    try {
      if (map.getLayer(METRO_LINE_LAYER_ID)) {
        map.setLayoutProperty(METRO_LINE_LAYER_ID, 'visibility', showMetroLines ? 'visible' : 'none')
      }
    } catch { /* layer not ready */ }
  }, [mapLoaded, showMetroLines])

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
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur border border-[var(--colliers-border)] shadow-[var(--shadow-md)] px-3 py-2 rounded-md">
          <button
            type="button"
            onClick={() => onToggleMetroLines?.()}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
              showMetroLines ? 'text-[#1C54F4]' : 'text-[#7B8BBD]'
            }`}
          >
            Linie metra
          </button>
          <span className="text-[10px] text-slate-300">|</span>
          <button
            type="button"
            onClick={() => onToggleDistrictGrid?.()}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
              showDistrictGrid ? 'text-[#1C54F4]' : 'text-[#7B8BBD]'
            }`}
          >
            Dzielnice
          </button>
        </div>
      </div>
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
