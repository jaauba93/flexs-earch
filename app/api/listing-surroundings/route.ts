import { NextRequest, NextResponse } from 'next/server'

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

interface OverpassElement {
  id: number
  type: 'node' | 'way' | 'relation'
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

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

const CATEGORY_META: Record<SurroundingCategory, { label: string; color: string }> = {
  bus: { label: 'Autobus', color: '#ff6b8a' },
  tram: { label: 'Tramwaj', color: '#8f6bff' },
  rail: { label: 'Dworzec kolejowy', color: '#79c27f' },
  metroStation: { label: 'Stacja metra', color: '#4da3ff' },
  metroLine: { label: 'Linia metra', color: '#3f61ff' },
  publicParking: { label: 'Parking miejski', color: '#ffc940' },
  privateParking: { label: 'Parking prywatny', color: '#ff8a24' },
  bike: { label: 'Rower miejski', color: '#60c26c' },
  food: { label: 'Kawiarnie i restauracje', color: '#f07b63' },
  fitness: { label: 'Siłownia i fitness', color: '#8a6cf4' },
  retail: { label: 'Sklepy i convenience', color: '#4e9c87' },
  park: { label: 'Parki i rekreacja', color: '#6bb56f' },
}

function toRad(value: number) {
  return (value * Math.PI) / 180
}

function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const earthRadius = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(earthRadius * c)
}

function resolveCoordinates(element: OverpassElement) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lng: element.lon }
  }
  if (element.center) {
    return { lat: element.center.lat, lng: element.center.lon }
  }
  return null
}

function splitLineRefs(value?: string) {
  if (!value) return []
  return value
    .split(/[;,/]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
}

function classifyElement(element: OverpassElement): { category: SurroundingCategory; lines: string[] } | null {
  const tags = element.tags || {}
  
  if (
    tags.proposed === 'yes' ||
    tags.proposed === 'station' ||
    tags.construction === 'yes' ||
    tags.railway === 'proposed' ||
    tags.railway === 'construction' ||
    tags.station === 'proposed' ||
    tags.station === 'construction' ||
    tags.lifecycle === 'proposed' ||
    tags.lifecycle === 'construction' ||
    tags.disused === 'yes' ||
    tags.abandoned === 'yes'
  ) {
    return null
  }

  const refs = splitLineRefs(tags.route_ref || tags.ref || tags.lines)

  if (tags.amenity === 'bicycle_rental') {
    return { category: 'bike', lines: [] }
  }

  if (['restaurant', 'cafe', 'fast_food', 'bar', 'pub'].includes(tags.amenity || '')) {
    return { category: 'food', lines: [] }
  }

  if (tags.leisure === 'fitness_centre' || tags.sport === 'fitness') {
    return { category: 'fitness', lines: [] }
  }

  if (['supermarket', 'convenience', 'mall'].includes(tags.shop || '')) {
    return { category: 'retail', lines: [] }
  }

  if (tags.leisure === 'park' || tags.leisure === 'garden' || tags.landuse === 'recreation_ground') {
    return { category: 'park', lines: [] }
  }

  if (tags.amenity === 'parking') {
    const isPrivate = tags.access === 'private' || tags.access === 'customers' || tags.parking === 'private'
    return { category: isPrivate ? 'privateParking' : 'publicParking', lines: [] }
  }

  if (tags.station === 'subway' || tags.railway === 'subway_entrance') {
    return { category: 'metroStation', lines: refs }
  }

  if (tags.railway === 'station' || tags.railway === 'halt') {
    return { category: 'rail', lines: refs }
  }

  if (tags.railway === 'tram_stop' || tags.tram === 'yes') {
    return { category: 'tram', lines: refs }
  }

  if (tags.highway === 'bus_stop' || tags.bus === 'yes' || tags.amenity === 'bus_station') {
    return { category: 'bus', lines: refs }
  }

  return null
}

function toFeature(element: OverpassElement, originLat: number, originLng: number): SurroundingFeature | null {
  const coords = resolveCoordinates(element)
  const classification = classifyElement(element)
  if (!coords || !classification) return null

  const distanceMeters = calculateDistanceMeters(originLat, originLng, coords.lat, coords.lng)
  const walkMinutes = Math.max(1, Math.round(distanceMeters / 80))
  const fallbackName = `${CATEGORY_META[classification.category].label} ${element.id}`

  return {
    id: `${classification.category}-${element.type}-${element.id}`,
    name: element.tags?.name || fallbackName,
    category: classification.category,
    lat: coords.lat,
    lng: coords.lng,
    distanceMeters,
    walkMinutes,
    lines: classification.lines,
  }
}

function appendMetroLineFeatures(features: SurroundingFeature[]) {
  const uniqueRefs = new Map<string, SurroundingFeature>()

  features
    .filter((feature) => feature.category === 'metroStation' && feature.lines.length > 0)
    .forEach((feature) => {
      feature.lines.forEach((line) => {
        const normalized = line.toUpperCase()
        if (!/^M\d+/.test(normalized)) return
        if (uniqueRefs.has(normalized)) return
        uniqueRefs.set(normalized, {
          ...feature,
          id: `metro-line-${normalized}-${feature.id}`,
          category: 'metroLine',
          name: normalized,
          lines: [normalized],
        })
      })
    })

  return [...features, ...Array.from(uniqueRefs.values())]
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = Number.parseFloat(searchParams.get('lat') || '')
  const lng = Number.parseFloat(searchParams.get('lng') || '')
  const radius = Math.min(Number.parseInt(searchParams.get('radius') || '700', 10) || 700, 1200)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const overpassQuery = `
    [out:json][timeout:20];
    (
      nwr(around:${radius},${lat},${lng})["highway"="bus_stop"];
      nwr(around:${radius},${lat},${lng})["amenity"="bus_station"];
      nwr(around:${radius},${lat},${lng})["railway"="tram_stop"];
      nwr(around:${radius},${lat},${lng})["railway"="station"];
      nwr(around:${radius},${lat},${lng})["railway"="halt"];
      nwr(around:${radius},${lat},${lng})["station"="subway"];
      nwr(around:${radius},${lat},${lng})["railway"="subway_entrance"];
      nwr(around:${radius},${lat},${lng})["amenity"="parking"];
      nwr(around:${radius},${lat},${lng})["amenity"="bicycle_rental"];
      nwr(around:${radius},${lat},${lng})["amenity"~"restaurant|cafe|fast_food|bar|pub"];
      nwr(around:${radius},${lat},${lng})["leisure"="fitness_centre"];
      nwr(around:${radius},${lat},${lng})["sport"="fitness"];
      nwr(around:${radius},${lat},${lng})["shop"~"supermarket|convenience|mall"];
      nwr(around:${radius},${lat},${lng})["leisure"~"park|garden"];
      nwr(around:${radius},${lat},${lng})["landuse"="recreation_ground"];
    );
    out center tags;
  `

  try {
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ]

    let response: Response | null = null
    let lastError: string | null = null

    for (const endpoint of endpoints) {
      try {
        const nextResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: overpassQuery,
          next: { revalidate: 3600 },
        })

        if (!nextResponse.ok) {
          lastError = `Overpass failed with ${nextResponse.status}`
          continue
        }

        response = nextResponse
        break
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Overpass request failed'
      }
    }

    if (!response) {
      throw new Error(lastError || 'Overpass request failed')
    }

    const payload = (await response.json()) as { elements?: OverpassElement[] }
    const baseFeatures = (payload.elements || [])
      .map((element) => toFeature(element, lat, lng))
      .filter((feature): feature is SurroundingFeature => Boolean(feature))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)

    const features = appendMetroLineFeatures(baseFeatures)
    const counts = features.reduce<Record<SurroundingCategory, number>>((acc, feature) => {
      acc[feature.category] = (acc[feature.category] || 0) + 1
      return acc
    }, {
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
    })

    return NextResponse.json({
      radius,
      features,
      counts,
      categories: CATEGORY_META,
    })
  } catch (error) {
    console.error('listing-surroundings', error)
    return NextResponse.json(
      {
        radius,
        features: [],
        counts: {
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
        },
        categories: CATEGORY_META,
      },
      { status: 200 }
    )
  }
}
