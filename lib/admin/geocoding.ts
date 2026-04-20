import { getCityAreaPolygonsByCity, getCityAreas, type CitySlug } from '@/lib/mapbox/city-areas'
import { slugify } from '@/lib/utils/slugify'

type MapboxFeature = {
  center?: [number, number]
  place_name?: string
  text?: string
  address?: string
  properties?: Record<string, unknown>
  context?: Array<{ id?: string; text?: string; short_code?: string }>
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: {
    street?: string
    housenumber?: string
    postcode?: string
    district?: string
    locality?: string
    city?: string
    name?: string
  }
}

type NominatimResult = {
  lat?: string
  lon?: string
  display_name?: string
  address?: {
    postcode?: string
    city?: string
    town?: string
    village?: string
    city_district?: string
    suburb?: string
    neighbourhood?: string
  }
}

export interface GeocodedAddress {
  latitude: number | null
  longitude: number | null
  district: string | null
  postcode: string | null
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
    .map((part) =>
      part
        .split('-')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ')
}

function normalizeStreetForComparison(value: string) {
  return slugify(
    value
      .replace(/\bul\.?\b/gi, '')
      .replace(/\bal\.?\b/gi, 'aleja')
      .replace(/[./]/g, ' ')
      .trim()
  )
}

function normalizeStreetToken(token: string) {
  return slugify(token)
    .replace(/^(ul|ulica|aleja|aleje|alei|plac|pl|rondo)$/, '')
    .replace(/^(sw|swieta|swiety|im)$/, '')
    .replace(/(skiego|skiej|skich|owie|owa|owe|ami|ach|ego|iej|ich|ie|y|a|e|ow|owa|ów)$/, '')
}

function tokenizeStreet(value: string) {
  return normalizeStreetForComparison(value)
    .split('-')
    .map((token) => normalizeStreetToken(token))
    .filter(Boolean)
}

function streetMatches(requestedStreet: string, candidateStreet: string) {
  const requestedNormalized = normalizeStreetForComparison(requestedStreet)
  const candidateNormalized = normalizeStreetForComparison(candidateStreet)

  if (!requestedNormalized || !candidateNormalized) {
    return false
  }

  if (
    requestedNormalized === candidateNormalized ||
    candidateNormalized.includes(requestedNormalized) ||
    requestedNormalized.includes(candidateNormalized)
  ) {
    return true
  }

  const requestedTokens = tokenizeStreet(requestedStreet)
  const candidateTokens = tokenizeStreet(candidateStreet)
  if (requestedTokens.length === 0 || candidateTokens.length === 0) {
    return false
  }

  const matchedTokens = requestedTokens.filter((requestedToken) =>
    candidateTokens.some(
      (candidateToken) =>
        candidateToken === requestedToken ||
        candidateToken.startsWith(requestedToken) ||
        requestedToken.startsWith(candidateToken)
    )
  )

  return matchedTokens.length >= Math.min(requestedTokens.length, candidateTokens.length)
}

function extractStreetName(street: string) {
  return street
    .replace(/\s+\d+[a-zA-Z]?(?:[-/]\d+[a-zA-Z]?)?$/, '')
    .trim()
}

function extractHouseNumber(street: string) {
  const match = street.match(/(\d+[a-zA-Z]?(?:[-/]\d+[a-zA-Z]?)?)$/)
  return match?.[1]?.trim() ?? null
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

function resolvePostcodeFromContext(feature: MapboxFeature) {
  const context = feature.context ?? []
  return context.find((item) => item.id?.startsWith('postcode.'))?.text ?? null
}

function resolveCityFromContext(feature: MapboxFeature) {
  const context = feature.context ?? []
  return (
    context.find((item) => item.id?.startsWith('place.'))?.text ??
    context.find((item) => item.id?.startsWith('locality.'))?.text ??
    context.find((item) => item.id?.startsWith('region.'))?.text ??
    null
  )
}

function isValidMapboxCandidate(feature: MapboxFeature, address: { street: string; postcode?: string | null; city: string }) {
  if (!feature.center) return false

  const expectedPostcode = address.postcode?.trim() || null
  const actualPostcode = resolvePostcodeFromContext(feature)
  if (expectedPostcode && actualPostcode && expectedPostcode !== actualPostcode) {
    return false
  }

  const requestedStreet = normalizeStreetForComparison(extractStreetName(address.street))
  const candidateStreet = normalizeStreetForComparison(feature.text || feature.place_name || '')
  if (!requestedStreet || !candidateStreet) return true

  const actualCity = resolveCityFromContext(feature)
  if (actualCity && slugify(actualCity) !== slugify(address.city)) {
    return false
  }

  return streetMatches(extractStreetName(address.street), feature.text || feature.place_name || '')
}

async function geocodeWithPhoton(address: { street: string; postcode?: string | null; city: string }) {
  const query = [address.street, address.postcode, address.city, 'Poland'].filter(Boolean).join(', ')
  const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`, {
    headers: {
      'User-Agent': 'Colliers-Flex-CMS/1.0',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as { features?: PhotonFeature[] }
  const requestedStreet = normalizeStreetForComparison(extractStreetName(address.street))
  const requestedHouseNumber = extractHouseNumber(address.street)
  const requestedPostcode = address.postcode?.trim() || null

  const feature =
    payload.features?.find((candidate) => {
      const properties = candidate.properties
      const coordinates = candidate.geometry?.coordinates
      if (!properties || !coordinates) return false

      const street = properties.street || properties.name || ''
      if (requestedStreet && street && !streetMatches(extractStreetName(address.street), street)) {
        return false
      }

      if (requestedHouseNumber && properties.housenumber && slugify(properties.housenumber) !== slugify(requestedHouseNumber)) {
        return false
      }

      if (requestedPostcode && properties.postcode && requestedPostcode !== properties.postcode.trim()) {
        return false
      }

      if (properties.city && slugify(properties.city) !== slugify(address.city)) {
        return false
      }

      return true
    }) ?? null

  if (!feature?.geometry?.coordinates) {
    return null
  }

  const [longitude, latitude] = feature.geometry.coordinates
  return {
    latitude,
    longitude,
    district:
      canonicalizeDistrict(feature.properties?.district || feature.properties?.locality || '', address.city) ||
      inferDistrictFromCoordinates(latitude, longitude, address.city),
    postcode: feature.properties?.postcode?.trim() ?? address.postcode?.trim() ?? null,
    placeName: query,
  } satisfies GeocodedAddress
}

async function geocodeByFreeformQuery(query: string, city: string, postcode?: string | null) {
  const fullQuery = [query, city, 'Poland'].filter(Boolean).join(', ')
  const requestedCity = slugify(city)
  const requestedPostcode = postcode?.trim() || null

  const photonResponse = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(fullQuery)}&limit=5`, {
    headers: {
      'User-Agent': 'Colliers-Flex-CMS/1.0',
    },
    cache: 'no-store',
  })

  if (photonResponse.ok) {
    const payload = (await photonResponse.json()) as { features?: PhotonFeature[] }
    const feature =
      payload.features?.find((candidate) => {
        const properties = candidate.properties
        const coordinates = candidate.geometry?.coordinates
        if (!properties || !coordinates) return false

        if (properties.city && slugify(properties.city) !== requestedCity) {
          return false
        }

        if (requestedPostcode && properties.postcode && properties.postcode.trim() !== requestedPostcode) {
          return false
        }

        return true
      }) ?? null

    if (feature?.geometry?.coordinates) {
      const [longitude, latitude] = feature.geometry.coordinates
      return {
        latitude,
        longitude,
        district:
          canonicalizeDistrict(feature.properties?.district || feature.properties?.locality || '', city) ||
          inferDistrictFromCoordinates(latitude, longitude, city),
        postcode: feature.properties?.postcode?.trim() ?? requestedPostcode,
        placeName: fullQuery,
      } satisfies GeocodedAddress
    }
  }

  const nominatimResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=pl&addressdetails=1&q=${encodeURIComponent(fullQuery)}`,
    {
      headers: {
        'User-Agent': 'Colliers-Flex-CMS/1.0',
        'Accept-Language': 'pl',
      },
      cache: 'no-store',
    }
  )

  if (!nominatimResponse.ok) {
    return null
  }

  const payload = (await nominatimResponse.json()) as NominatimResult[]
  const match =
    payload.find((candidate) => {
      const candidateCity = candidate.address?.city || candidate.address?.town || candidate.address?.village || ''
      if (candidateCity && slugify(candidateCity) !== requestedCity) {
        return false
      }

      return Boolean(candidate.lat && candidate.lon)
    }) ?? null

  if (!match?.lat || !match.lon) {
    return null
  }

  const latitude = Number(match.lat)
  const longitude = Number(match.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
    district:
      canonicalizeDistrict(
        match.address?.city_district || match.address?.suburb || match.address?.neighbourhood || '',
        city
      ) || inferDistrictFromCoordinates(latitude, longitude, city),
    postcode: match.address?.postcode?.trim() ?? requestedPostcode,
    placeName: match.display_name ?? null,
  } satisfies GeocodedAddress
}

async function geocodeWithNominatim(address: { street: string; postcode?: string | null; city: string }) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'pl',
    addressdetails: '1',
    street: address.street,
    city: address.city,
  })

  if (address.postcode?.trim()) {
    params.set('postalcode', address.postcode.trim())
  }

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      'User-Agent': 'Colliers-Flex-CMS/1.0',
      'Accept-Language': 'pl',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as NominatimResult[]
  const requestedCity = slugify(address.city)

  const match =
    payload.find((candidate) => {
      const candidateCity = candidate.address?.city || candidate.address?.town || candidate.address?.village || ''
      if (candidateCity && slugify(candidateCity) !== requestedCity) {
        return false
      }

      return Boolean(candidate.lat && candidate.lon)
    }) ?? null

  if (!match?.lat || !match.lon) {
    return null
  }

  const latitude = Number(match.lat)
  const longitude = Number(match.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
    district:
      canonicalizeDistrict(
        match.address?.city_district || match.address?.suburb || match.address?.neighbourhood || '',
        address.city
      ) || inferDistrictFromCoordinates(latitude, longitude, address.city),
    postcode: match.address?.postcode?.trim() ?? address.postcode?.trim() ?? null,
    placeName: match.display_name ?? null,
  } satisfies GeocodedAddress
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
  fallbackQueries?: string[]
}): Promise<GeocodedAddress> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!token) {
    const photonOnly = await geocodeWithPhoton(address)
    if (photonOnly) return photonOnly

    const nominatimOnly = await geocodeWithNominatim(address)
    if (nominatimOnly) return nominatimOnly

    return {
      latitude: null,
      longitude: null,
      district: null,
      postcode: address.postcode?.trim() || null,
      placeName: null,
    }
  }

  const photonResult = await geocodeWithPhoton(address)
  if (photonResult) {
    return photonResult
  }

  const query = [address.street, [address.postcode, address.city].filter(Boolean).join(' '), 'Poland']
    .filter(Boolean)
    .join(', ')

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=PL&limit=1&language=pl`,
      {
        headers: {
          'User-Agent': 'Colliers-Flex-CMS/1.0',
        },
        cache: 'no-store',
      }
    )

    if (response.ok) {
      const payload = (await response.json()) as { features?: MapboxFeature[] }
      const feature = payload.features?.find((candidate) => isValidMapboxCandidate(candidate, address))

      if (feature?.center) {
        return {
          latitude: feature.center[1] ?? null,
          longitude: feature.center[0] ?? null,
          district:
            normalizeDistrict(feature, address.city) ||
            inferDistrictFromCoordinates(feature.center[1], feature.center[0], address.city),
          postcode: resolvePostcodeFromContext(feature) ?? address.postcode?.trim() ?? null,
          placeName: feature.place_name ?? null,
        }
      }
    }
  } catch {
    // Mapbox is only one of the sources. We intentionally fall back below.
  }

  const nominatimResult = await geocodeWithNominatim(address)
  if (nominatimResult) {
    return nominatimResult
  }

  for (const fallbackQuery of address.fallbackQueries ?? []) {
    const normalizedQuery = fallbackQuery.trim()
    if (!normalizedQuery) continue

    const fallbackResult = await geocodeByFreeformQuery(
      normalizedQuery,
      address.city,
      address.postcode?.trim() || null
    )

    if (fallbackResult) {
      return fallbackResult
    }
  }

  return {
    latitude: null,
    longitude: null,
    district: null,
    postcode: address.postcode?.trim() || null,
    placeName: null,
  }
}
