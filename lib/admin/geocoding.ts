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

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function normalizeDistrict(feature: MapboxFeature) {
  const context = feature.context ?? []
  const districtLike =
    context.find((item) => item.id?.startsWith('locality.'))?.text ||
    context.find((item) => item.id?.startsWith('district.'))?.text ||
    context.find((item) => item.id?.startsWith('neighborhood.'))?.text ||
    null

  if (!districtLike) return null

  const cleaned = districtLike
    .replace(/^dzielnica\s+/i, '')
    .replace(/^district\s+/i, '')
    .trim()

  return cleaned ? titleCase(cleaned) : null
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
    district: normalizeDistrict(feature),
    placeName: feature.place_name ?? null,
  }
}
