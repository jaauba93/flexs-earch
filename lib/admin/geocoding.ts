import { getCityAreaPolygonsByCity, getCityAreas, type CitySlug } from '@/lib/mapbox/city-areas'
import { slugify } from '@/lib/utils/slugify'

type MapboxFeature = {
  center?: [number, number]
  place_name?: string
  text?: string
  properties?: Record<string, unknown>
  context?: Array<{ id?: string; text?: string; short_code?: string }>
}

export interface GeocodedAddress {
  latitude: number | null
  longitude: number | null
  district: string | null
  placeName: string | null
}

const CITY_AREAS = getCityAreas()

function isPointInPolygon(longitude: number, latitude: number, polygon: [number, number][]) {
  let isInside = false

  for (let currentIndex = 0, previousIndex = polygon.length - 1; currentIndex < polygon.length; previousIndex = currentIndex++) {
    const [currentLongitude, currentLatitude] = polygon[currentIndex]
    const [previousLongitude, previousLatitude] = polygon[previousIndex]

    const intersects =
      currentLatitude > latitude !== previousLatitude > latitude &&
      longitude <
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          ((previousLatitude - currentLatitude) || Number.EPSILON) +
          currentLongitude

    if (intersects) {
      isInside = !isInside
    }
  }

  return isInside
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function toCitySlug(value: string): CitySlug | null {
  const slug = slugify(value)

  if (
    slug === 'warszawa' ||
    slug === 'krakow' ||
    slug === 'wroclaw' ||
    slug === 'trojmiasto' ||
    slug === 'poznan' ||
    slug === 'katowice' ||
    slug === 'lodz'
  ) {
    return slug
  }

  return null
}

function canonicalizeDistrict(rawDistrict: string, city: string) {
  const citySlug = toCitySlug(city)
  const cleaned = rawDistrict
    .replace(/^dzielnica\s+/i, '')
    .replace(/^district\s+/i, '')
    .replace(/^borough\s+/i, '')
    .replace(/^m\.\s*st\.\s*/i, '')
    .replace(/^miasto\s+/i, '')
    .replace(/\bm\.?\s*st\.?\s*warszawy\b/i, '')
    .replace(/\bwarszawy\b/i, '')
    .trim()

  if (!cleaned) return null
  if (!citySlug) return titleCase(cleaned)

  const cityArea = CITY_AREAS.find((area) => area.city === citySlug)
  if (!cityArea) return titleCase(cleaned)

  const normalized = slugify(cleaned)
  const exactMatch = cityArea.districts.find(
    (district) => district.slug === normalized || slugify(district.label) === normalized
  )

  if (exactMatch) return exactMatch.label

  const looseMatch = cityArea.districts.find(
    (district) =>
      normalized.includes(district.slug) ||
      district.slug.includes(normalized) ||
      normalized.includes(slugify(district.label))
  )

  return looseMatch?.label ?? titleCase(cleaned)
}

function normalizeDistrict(feature: MapboxFeature, city: string) {
  const context = feature.context ?? []
  const districtLike =
    context.find((item) => item.id?.startsWith('locality.'))?.text ||
    context.find((item) => item.id?.startsWith('district.'))?.text ||
    context.find((item) => item.id?.startsWith('neighborhood.'))?.text ||
    null

  if (!districtLike) return null
  return canonicalizeDistrict(districtLike, city)
}

function inferDistrictFromCoordinates(latitude: number, longitude: number, city: string) {
  const citySlug = toCitySlug(city)
  if (!citySlug) return null

  const polygons = getCityAreaPolygonsByCity(citySlug)
  const match = polygons.find((polygon) =>
    polygon.coordinates.some((ring) => isPointInPolygon(longitude, latitude, ring))
  )

  return match?.label ?? null
}

export async function geocodeAddress(address: {
  street: string
  postcode?: string | null
  city: string
}): Promise<GeocodedAddress> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!token) {
    return {
      latitude: null,
      longitude: null,
      district: null,
      placeName: null,
    }
  }

  const query = [address.street, [address.postcode, address.city].filter(Boolean).join(' '), 'Poland']
    .filter(Boolean)
    .join(', ')

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=PL&limit=1&language=pl`,
    {
      headers: {
        'User-Agent': 'Colliers-Flex-CMS/1.0',
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    return {
      latitude: null,
      longitude: null,
      district: null,
      placeName: null,
    }
  }

  const payload = (await response.json()) as { features?: MapboxFeature[] }
  const feature = payload.features?.[0]

  if (!feature?.center) {
    return {
      latitude: null,
      longitude: null,
      district: null,
      placeName: null,
    }
  }

  return {
    latitude: feature.center[1] ?? null,
    longitude: feature.center[0] ?? null,
    district:
      normalizeDistrict(feature, address.city) ||
      (feature.center?.[1] != null && feature.center?.[0] != null
        ? inferDistrictFromCoordinates(feature.center[1], feature.center[0], address.city)
        : null),
    placeName: feature.place_name ?? null,
  }
}
