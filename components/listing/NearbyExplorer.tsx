'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type mapboxgl from 'mapbox-gl'
import { Bike, Bus, Car, CircleParking, Dumbbell, Info, Loader2, ShoppingBag, TrainFront, TramFront, Trees, UtensilsCrossed, Waves } from 'lucide-react'

type SurroundingCategory =
  | 'bus'
  | 'tram'
  | 'rail'
  | 'metroStation'
  | 'metroLine'
  | 'publicParking'
  | 'privateParking'
  | 'bike'
  | 'food'
  | 'fitness'
  | 'retail'
  | 'park'

interface SurroundingFeature {
  id: string
  name: string
  category: SurroundingCategory
  lat: number
  lng: number
  distanceMeters: number
  walkMinutes: number
  lines: string[]
}

interface CategoryMeta {
  label: string
  color: string
}

interface ViewBounds {
  north: number
  south: number
  east: number
  west: number
}

interface NearbyExplorerProps {
  listingName: string
  addressLabel: string
  latitude: number | null
  longitude: number | null
}

const CATEGORY_GROUPS: { title: string; categories: SurroundingCategory[] }[] = [
  { title: 'Komunikacja', categories: ['bus', 'tram', 'rail', 'metroStation', 'metroLine'] },
  { title: 'Mobilność i parkowanie', categories: ['publicParking', 'privateParking', 'bike'] },
  { title: 'Atrakcje i udogodnienia', categories: ['food', 'fitness', 'retail', 'park'] },
]

const CATEGORY_ICONS: Record<SurroundingCategory, typeof Bus> = {
  bus: Bus,
  tram: TramFront,
  rail: TrainFront,
  metroStation: Waves,
  metroLine: Waves,
  publicParking: CircleParking,
  privateParking: Car,
  bike: Bike,
  food: UtensilsCrossed,
  fitness: Dumbbell,
  retail: ShoppingBag,
  park: Trees,
}

const EMPTY_COUNTS: Record<SurroundingCategory, number> = {
  bus: 0,
  tram: 0,
  rail: 0,
  metroStation: 0,
  metroLine: 0,
  publicParking: 0,
  privateParking: 0,
  bike: 0,
  food: 0,
  fitness: 0,
  retail: 0,
  park: 0,
}

const MAP_SOURCE_ID = 'nearby-surroundings'
const MAP_LAYER_ID = 'nearby-surroundings-layer'
const LISTING_LAYER_ID = 'nearby-listing-layer'

export default function NearbyExplorer({
  listingName,
  addressLabel,
  latitude,
  longitude,
}: NearbyExplorerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)
  const featuresRef = useRef<SurroundingFeature[]>([])
  const [features, setFeatures] = useState<SurroundingFeature[]>([])
  const [categories, setCategories] = useState<Record<SurroundingCategory, CategoryMeta> | null>(null)
  const [enabledCategories, setEnabledCategories] = useState<Record<SurroundingCategory, boolean>>({
    bus: true,
    tram: true,
    rail: true,
    metroStation: true,
    metroLine: true,
    publicParking: false,
    privateParking: false,
    bike: false,
    food: false,
    fitness: false,
    retail: false,
    park: false,
  })
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [viewBounds, setViewBounds] = useState<ViewBounds | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return

    let cancelled = false
    setLoading(true)
    setFailed(false)

    fetch(`/api/listing-surroundings?lat=${latitude}&lng=${longitude}&radius=900`)
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return
        setFeatures(payload.features || [])
        setCategories(payload.categories || null)
      })
      .catch(() => {
        if (cancelled) return
        setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [latitude, longitude])

  const visibleFeatures = useMemo(
    () => features.filter((feature) => enabledCategories[feature.category]),
    [enabledCategories, features]
  )

  const featuresInView = useMemo(() => {
    if (!viewBounds) return features
    return features.filter(
      (feature) =>
        feature.lat >= viewBounds.south &&
        feature.lat <= viewBounds.north &&
        feature.lng >= viewBounds.west &&
        feature.lng <= viewBounds.east
    )
  }, [features, viewBounds])

  const visibleFeaturesInView = useMemo(
    () => featuresInView.filter((feature) => enabledCategories[feature.category]),
    [enabledCategories, featuresInView]
  )

  useEffect(() => {
    featuresRef.current = features
  }, [features])

  const groupedFeatures = useMemo(() => {
    const nextGroups = new Map<SurroundingCategory, SurroundingFeature[]>()
    visibleFeaturesInView.forEach((feature) => {
      const current = nextGroups.get(feature.category) || []
      current.push(feature)
      nextGroups.set(feature.category, current)
    })
    return nextGroups
  }, [visibleFeaturesInView])

  const counts = useMemo(() => {
    return features.reduce<Record<SurroundingCategory, number>>((acc, feature) => {
      acc[feature.category] = (acc[feature.category] || 0) + 1
      return acc
    }, { ...EMPTY_COUNTS })
  }, [features])

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return
    }

    let destroyed = false

    import('mapbox-gl').then((mapboxgl) => {
      if (destroyed || !containerRef.current) return

      mapboxgl.default.accessToken = token
      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [longitude, latitude],
        zoom: 16,
        pitch: 54,
        bearing: -18,
      })
      mapRef.current = map

      const wheelContainer = map.getCanvasContainer()
      const stopWheel = (event: WheelEvent) => {
        event.preventDefault()
        event.stopPropagation()
      }
      wheelContainer.addEventListener('wheel', stopWheel, { passive: false })
      const syncViewBounds = () => {
        const bounds = map.getBounds()
        if (!bounds) return
        setViewBounds({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        })
      }

      map.on('load', () => {
        setMapLoaded(true)
        const layers = map.getStyle().layers || []
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout && (layer.layout as Record<string, unknown>)['text-field']
        )?.id

        map.addLayer({
          id: 'nearby-buildings-3d',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#e9e4db',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.72,
          },
        }, labelLayerId)

        map.addSource(MAP_SOURCE_ID, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        })

        map.addLayer({
          id: MAP_LAYER_ID,
          type: 'circle',
          source: MAP_SOURCE_ID,
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'active'], 1],
              11,
              ['==', ['get', 'category'], 'metroLine'],
              9,
              8,
            ],
            'circle-color': ['coalesce', ['get', 'color'], '#1C54F4'],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.94,
          },
        })

        map.addSource(LISTING_LAYER_ID, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [longitude, latitude] },
                properties: { name: listingName },
              },
            ],
          },
        })

        map.addLayer({
          id: LISTING_LAYER_ID,
          type: 'circle',
          source: LISTING_LAYER_ID,
          paint: {
            'circle-radius': 12,
            'circle-color': '#000759',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
          },
        })

        map.on('click', MAP_LAYER_ID, (event) => {
          const clicked = event.features?.[0]
          if (!clicked) return
          const featureId = String(clicked.properties?.id || '')
          const nearbyFeature = featuresRef.current.find((item) => item.id === featureId)
          if (!nearbyFeature) return
          setActiveFeatureId(featureId)

          popupRef.current?.remove()
          popupRef.current = new mapboxgl.default.Popup({
            closeButton: false,
            offset: 18,
            maxWidth: '260px',
            className: 'surroundings-popup',
          })
            .setLngLat([nearbyFeature.lng, nearbyFeature.lat])
            .setHTML(
              `
                <div style="padding:4px 2px;font-family:'Open Sans',sans-serif;min-width:180px;">
                  <p style="margin:0 0 4px;color:${clicked.properties?.color};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;">
                    ${clicked.properties?.label}
                  </p>
                  <p style="margin:0 0 6px;color:#000759;font-size:14px;font-weight:700;line-height:1.3;">
                    ${nearbyFeature.name}
                  </p>
                  <p style="margin:0;color:#5c6b95;font-size:12px;">${nearbyFeature.walkMinutes} min spacerem</p>
                  ${
                    nearbyFeature.lines.length > 0
                      ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${nearbyFeature.lines
                          .map(
                            (line) =>
                              `<span style="border:1px solid #c8d6fb;padding:4px 8px;font-size:11px;font-weight:700;color:#000759;">${line}</span>`
                          )
                          .join('')}</div>`
                      : ''
                  }
                </div>
              `
            )
            .addTo(map)
        })

        map.on('mouseenter', MAP_LAYER_ID, () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', MAP_LAYER_ID, () => {
          map.getCanvas().style.cursor = ''
        })

        syncViewBounds()
      })

      map.on('moveend', syncViewBounds)

      return () => {
        wheelContainer.removeEventListener('wheel', stopWheel)
        map.off('moveend', syncViewBounds)
      }
    })

    return () => {
      destroyed = true
      setMapLoaded(false)
      popupRef.current?.remove()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [latitude, longitude, listingName, token])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getSource(MAP_SOURCE_ID)) return

    const nextGeoJson = {
      type: 'FeatureCollection' as const,
      features: visibleFeatures.map((feature) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [feature.lng, feature.lat] as [number, number],
        },
        properties: {
          id: feature.id,
          category: feature.category,
          label: categories?.[feature.category]?.label || feature.category,
          color: categories?.[feature.category]?.color || '#1C54F4',
          active: feature.id === activeFeatureId ? 1 : 0,
        },
      })),
    }

    ;(map.getSource(MAP_SOURCE_ID) as mapboxgl.GeoJSONSource).setData(nextGeoJson)
  }, [activeFeatureId, categories, mapLoaded, visibleFeatures])

  useEffect(() => {
    const map = mapRef.current
    if (!map || visibleFeatures.length === 0 || typeof latitude !== 'number' || typeof longitude !== 'number') return

    import('mapbox-gl').then((mapboxgl) => {
      const bounds = new mapboxgl.default.LngLatBounds([longitude, latitude], [longitude, latitude])
      visibleFeatures.forEach((feature) => {
        bounds.extend([feature.lng, feature.lat])
      })
      map.fitBounds(bounds, {
        padding: { top: 60, right: 60, bottom: 60, left: 60 },
        duration: 900,
        maxZoom: 16.4,
      })
    })
  }, [latitude, longitude, visibleFeatures])

  useEffect(() => {
    if (!activeFeatureId) return
    if (!visibleFeatures.some((feature) => feature.id === activeFeatureId)) {
      setActiveFeatureId(null)
      popupRef.current?.remove()
    }
  }, [activeFeatureId, visibleFeatures])

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border border-[#dbe4f8] bg-[linear-gradient(180deg,#f7f9ff_0%,#f2f6ff_100%)] p-6">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#1C54F4]">Otoczenie biura</p>
        <h3
          className="mb-1 text-2xl font-normal text-[#000759]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {listingName}
        </h3>
        <p className="mb-5 text-sm text-[#6c7aa4]">{addressLabel}</p>

        <div className="space-y-5 border-y border-[#dbe4f8] py-4">
          {CATEGORY_GROUPS.map((group, groupIndex) => {
            const visibleGroupItems = group.categories.filter((category) => {
              const meta = categories?.[category]
              const count = counts[category] || 0
              return meta && count > 0
            })

            if (visibleGroupItems.length === 0) return null

            return (
              <div key={group.title} className={groupIndex > 0 ? 'border-t border-[#e7edf8] pt-5' : ''}>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f7fa8]">
                  {group.title}
                </p>
                <div className="space-y-3">
                  {visibleGroupItems.map((category) => {
                    const meta = categories?.[category]
                    const count = counts[category] || 0
                    if (!meta || count === 0) return null
                    const Icon = CATEGORY_ICONS[category]
                    const enabled = enabledCategories[category]

                    return (
                      <label key={category} className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#473fd9]"
                          checked={enabled}
                          onChange={() =>
                            setEnabledCategories((prev) =>
                              ({ ...prev, [category]: !enabled })
                            )
                          }
                        />
                        <span
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                        >
                          <Icon size={15} />
                        </span>
                        <span className="flex-1 text-sm font-semibold text-[#23325f]">{meta.label}</span>
                        <span className="rounded-full border border-[#d7e1fa] bg-white px-2 py-0.5 text-[11px] font-bold text-[#6c7aa4]">
                          {count}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 rounded-none border border-[#dbe4f8] bg-white p-4 text-sm text-[#5e6d98]">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 text-[#6b78b8]" />
            <p>Kliknij znaczniki na mapie, aby sprawdzić nazwę punktu, czas dojścia i dostępne linie.</p>
          </div>
        </div>

        {!loading && !failed && features.length === 0 ? (
          <div className="mt-4 rounded-none border border-[#dbe4f8] bg-[#f8fbff] p-4 text-sm leading-relaxed text-[#5e6d98]">
            Nie udało się potwierdzić punktów w bezpośrednim otoczeniu tej lokalizacji. Mapa nadal pokazuje samą pozycję biura, a po wysłaniu zapytania doradca może uzupełnić dane ręcznie.
          </div>
        ) : null}
      </aside>

      <div className="border border-[#dbe4f8] bg-white p-4 shadow-[0_18px_46px_rgba(0,7,89,0.08)]">
        <div className="flex h-full min-h-[760px] flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4]">Najbliższe punkty</p>
              <p className="mt-1 text-sm text-[#5d6d97]">
                Aktywne kategorie: {Object.entries(enabledCategories)
                  .filter(([, enabled]) => enabled)
                  .map(([category]) => categories?.[category as SurroundingCategory]?.label || category)
                  .join(', ')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(groupedFeatures.entries())
                .slice(0, 6)
                .map(([category, categoryFeatures]) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-2 border border-[#dbe4f8] bg-[#f7f9ff] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5e6d98]"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: categories?.[category]?.color || '#1C54F4' }}
                    />
                    {categories?.[category]?.label}: {categoryFeatures.length}
                  </span>
                ))}
            </div>
          </div>

          <div className="relative min-h-[620px] flex-1 overflow-hidden">
            <div ref={containerRef} className="h-full w-full overflow-hidden" data-lenis-prevent />
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-white/80 backdrop-blur-[2px] text-[#5e6d98]">
                <Loader2 size={18} className="animate-spin" />
                <span>Sprawdzamy najbliższe otoczenie biura…</span>
              </div>
            ) : null}
            {failed ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-center text-[#5e6d98]">
                Nie udało się pobrać danych o otoczeniu. Spróbuj ponownie za chwilę.
              </div>
            ) : null}
            {!loading && !failed && features.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/75 text-center text-[#5e6d98]">
                Brak potwierdzonych punktów w promieniu 900 m.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
