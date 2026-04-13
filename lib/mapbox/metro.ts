export type MetroLineId = 'M1' | 'M2'

export type MetroLine = {
  id: MetroLineId
  name: string
  color: string
  // [lng, lat]
  path: [number, number][]
}

export const METRO_LINES: MetroLine[] = [
  {
    id: 'M1',
    name: 'M1',
    color: '#25408F',
    path: [
      [20.9366, 52.2922], // Mlociny
      [20.9378, 52.2683], // Slodowiec
      [20.9662, 52.2576], // Dw. Gdanski
      [21.0027, 52.2476], // Ratusz Arsenal
      [21.0106, 52.2297], // Swietokrzyska
      [21.0167, 52.2144], // Politechnika
      [21.0072, 52.1897], // Wierzbno
      [21.0074, 52.1737], // Wilanowska
      [21.0288, 52.1495], // Kabaty
    ],
  },
  {
    id: 'M2',
    name: 'M2',
    color: '#1C54F4',
    path: [
      [20.9121, 52.2391], // Bemowo
      [20.9379, 52.2378], // Plocka
      [20.9686, 52.2332], // Rondo Daszynskiego
      [20.9982, 52.2307], // Rondo ONZ
      [21.0106, 52.2297], // Swietokrzyska
      [21.0348, 52.2370], // Stadion Narodowy
      [21.0511, 52.2482], // Dw. Wilenski
      [21.0784, 52.2504], // Zacisze
      [21.0909, 52.2588], // Brudno
    ],
  },
]

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Rough local conversion around Warsaw for fast UI filtering
function toKmXY(lat: number, lng: number): { x: number; y: number } {
  const latFactor = 111.32
  const lonFactor = 111.32 * Math.cos((lat * Math.PI) / 180)
  return { x: lng * lonFactor, y: lat * latFactor }
}

function pointToSegmentDistanceKm(
  pointLat: number,
  pointLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const p = toKmXY(pointLat, pointLng)
  const a = toKmXY(aLat, aLng)
  const b = toKmXY(bLat, bLng)

  const abx = b.x - a.x
  const aby = b.y - a.y
  const apx = p.x - a.x
  const apy = p.y - a.y
  const ab2 = abx * abx + aby * aby
  const t = ab2 === 0 ? 0 : clamp((apx * abx + apy * aby) / ab2, 0, 1)
  const cx = a.x + t * abx
  const cy = a.y + t * aby
  return Math.hypot(p.x - cx, p.y - cy)
}

export function isNearMetroLine(
  lat: number,
  lng: number,
  lineId: MetroLineId,
  maxDistanceKm = 1
): boolean {
  const line = METRO_LINES.find((item) => item.id === lineId)
  if (!line) return false

  for (let i = 0; i < line.path.length - 1; i += 1) {
    const [aLng, aLat] = line.path[i]
    const [bLng, bLat] = line.path[i + 1]
    if (pointToSegmentDistanceKm(lat, lng, aLat, aLng, bLat, bLng) <= maxDistanceKm) {
      return true
    }
  }
  return false
}
