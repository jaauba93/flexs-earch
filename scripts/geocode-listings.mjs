/**
 * geocode-listings.mjs
 *
 * Geokoduje listingi przez Nominatim (OSM) — lepsza baza adresowa dla PL.
 * Fallback: Mapbox Geocoding API.
 *
 * Użycie:
 *   node scripts/geocode-listings.mjs            (zapis do bazy)
 *   node scripts/geocode-listings.mjs --dry-run  (podgląd bez zapisu)
 */

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const MAPBOX_TOKEN  = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const DRY_RUN       = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SUPABASE_KEY || !MAPBOX_TOKEN) {
  throw new Error(
    'Brakuje wymaganych zmiennych środowiskowych: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_MAPBOX_TOKEN.'
  )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return res.json()
}

/** Nominatim (OSM) — główne źródło */
async function nominatimGeocode(street, postcode, city) {
  const q = encodeURIComponent(`${street}, ${postcode} ${city}`)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=3&countrycodes=pl&addressdetails=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Colliers-Flex/1.0 geocode-script' },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!data.length) return null
  // prefer house/building, then address, then anything
  const best = data.find(f => ['house','building','commercial','office'].includes(f.type))
           ?? data.find(f => f.class === 'building' || f.type === 'residential')
           ?? data[0]
  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    place_name: best.display_name,
    source: 'nominatim',
  }
}

/** Mapbox — fallback */
async function mapboxGeocode(street, postcode, city) {
  const q   = encodeURIComponent(`${street}, ${postcode} ${city}, Poland`)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json`
            + `?access_token=${MAPBOX_TOKEN}&country=PL&limit=1&types=address,poi`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const f = data.features?.[0]
  if (!f) return null
  return {
    lat: f.center[1],
    lng: f.center[0],
    place_name: f.place_name,
    source: 'mapbox',
  }
}

function distanceM(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * 111_320
  const dLng = (lng2 - lng1) * 111_320 * Math.cos((lat1 * Math.PI) / 180)
  return Math.round(Math.sqrt(dLat ** 2 + dLng ** 2))
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ─── main ─────────────────────────────────────────────────────────────────────

const listings = await supabaseFetch(
  '/listings?select=id,slug,name,address_street,address_postcode,address_city,latitude,longitude&is_active=eq.true&order=address_city.asc'
)

console.log(`\nZnaleziono ${listings.length} listingów.\n`)
if (DRY_RUN) console.log('⚠️  TRYB PODGLĄDU — brak zapisu.\n')

const updates = []

for (const l of listings) {
  console.log(`── ${l.name} (${l.address_street}, ${l.address_city})`)

  // 1. Nominatim
  let result = await nominatimGeocode(l.address_street, l.address_postcode, l.address_city)
  await sleep(1100) // Nominatim rate-limit: max 1 req/s

  // 2. Mapbox fallback
  if (!result) {
    result = await mapboxGeocode(l.address_street, l.address_postcode, l.address_city)
    await sleep(250)
  }

  if (!result) {
    console.log(`   ✗ brak wyniku\n`)
    continue
  }

  const dist = l.latitude && l.longitude
    ? distanceM(result.lat, result.lng, l.latitude, l.longitude)
    : null

  console.log(`   źródło:   ${result.source}`)
  console.log(`   Wynik:    ${result.place_name.slice(0, 90)}`)
  console.log(`   nowe:     ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`)
  if (dist !== null) console.log(`   poprz.:   ${l.latitude}, ${l.longitude}  (diff ~${dist} m)`)
  console.log()

  updates.push({ id: l.id, slug: l.slug, lat: result.lat, lng: result.lng })

  if (!DRY_RUN) {
    await supabaseFetch(`/listings?id=eq.${l.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ latitude: result.lat, longitude: result.lng }),
    })
    process.stdout.write(`   ✓ zaktualizowano\n\n`)
  }
}

console.log('─────────────────────────────────────────')
if (DRY_RUN) {
  console.log('SQL do ręcznego zastosowania:')
  for (const u of updates) {
    console.log(`UPDATE listings SET latitude=${u.lat.toFixed(6)}, longitude=${u.lng.toFixed(6)} WHERE slug='${u.slug}';`)
  }
} else {
  console.log(`Gotowe. ${updates.length}/${listings.length} zaktualizowanych.`)
}
