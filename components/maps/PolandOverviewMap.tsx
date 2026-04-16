'use client'

import { useEffect, useMemo, useRef } from 'react'
import type mapboxgl from 'mapbox-gl'
import Link from 'next/link'
import { CITY_CENTERS, POLAND_BOUNDS, POLAND_CENTER } from '@/lib/mapbox/helpers'
import { CITY_REPORTS, CITY_REPORT_ORDER, type CityReportSlug } from '@/lib/reports/cityReports'

interface PolandOverviewMapProps {
  activeCity: CityReportSlug
  onActiveCityChange: (city: CityReportSlug) => void
  className?: string
  showCard?: boolean
}

export default function PolandOverviewMap({
  activeCity,
  onActiveCityChange,
  className = '',
  showCard = true,
}: PolandOverviewMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerElementsRef = useRef<Map<CityReportSlug, HTMLButtonElement>>(new Map())
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  const cityData = useMemo(
    () =>
      CITY_REPORT_ORDER.map((slug) => ({
        slug,
        label: CITY_REPORTS[slug].cityName,
        teaser: CITY_REPORTS[slug].positioningHeadline,
        metric: CITY_REPORTS[slug].kpiSupply,
        href: `/raporty-miejskie/${slug}`,
        center: CITY_CENTERS[slug],
      })),
    []
  )

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return

    let map: mapboxgl.Map
    const markerElements = markerElementsRef.current
    import('mapbox-gl').then((mapboxglLib) => {
      mapboxglLib.default.accessToken = token
      map = new mapboxglLib.default.Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: POLAND_CENTER,
        zoom: 5.5,
        interactive: false,
        attributionControl: false,
      })
      mapRef.current = map

      map.on('load', () => {
        map.fitBounds(
          [
            [POLAND_BOUNDS[0], POLAND_BOUNDS[1]],
            [POLAND_BOUNDS[2], POLAND_BOUNDS[3]],
          ],
          { padding: 36, duration: 0 }
        )

        cityData.forEach((city) => {
          const markerEl = document.createElement('button')
          markerEl.type = 'button'
          markerEl.setAttribute('aria-label', city.label)
          markerEl.className = 'city-overview-pin'
          markerEl.addEventListener('mouseenter', () => onActiveCityChange(city.slug))
          markerEl.addEventListener('focus', () => onActiveCityChange(city.slug))
          markerEl.addEventListener('click', (event) => {
            event.preventDefault()
            onActiveCityChange(city.slug)
          })

          markerElements.set(city.slug, markerEl)

          new mapboxglLib.default.Marker({ element: markerEl })
            .setLngLat(city.center.center)
            .addTo(map)
        })
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markerElements.clear()
    }
  }, [cityData, onActiveCityChange, token])

  useEffect(() => {
    markerElementsRef.current.forEach((markerEl, slug) => {
      markerEl.dataset.active = slug === activeCity ? 'true' : 'false'
    })
  }, [activeCity])

  const active = CITY_REPORTS[activeCity]

  if (!token) {
    return (
      <div className={`h-full w-full flex items-center justify-center bg-[#f8fbff] border border-[#dbe4f8] ${className}`}>
        <p className="text-sm text-[#5a6a95]">Mapa niedostępna (brak tokenu Mapbox)</p>
      </div>
    )
  }

  return (
    <div className={`relative h-full w-full ${className}`} data-lenis-prevent>
      <div ref={containerRef} className="h-full w-full" data-lenis-prevent />
      {showCard && (
        <div className="absolute right-4 bottom-4 border border-[#cedcfb] bg-white/95 px-4 py-3 max-w-[280px] pointer-events-auto">
          <p className="text-[#000759] font-semibold text-lg">{active.cityName}</p>
          <p className="text-[#1C54F4] text-sm font-semibold mb-1">{active.kpiSupply}</p>
          <p className="text-[#5f6e98] text-xs leading-relaxed mb-3">{active.positioningHeadline}</p>
          <Link
            href={`/raporty-miejskie/${active.citySlug}`}
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1C54F4] hover:text-[#000759] transition-colors"
          >
            Otwórz raport →
          </Link>
        </div>
      )}
    </div>
  )
}
