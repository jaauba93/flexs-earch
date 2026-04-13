import { getCityAreas } from '@/lib/mapbox/city-areas'
import { METRO_LINES, type MetroLineId } from '@/lib/mapbox/metro'
import { slugify } from '@/lib/utils/slugify'

export type SearchTargetType = 'city' | 'district' | 'metro'

export interface SearchTargetOption {
  key: string
  label: string
  type: SearchTargetType
  citySlug?: string
  districtSlug?: string
  metroLine?: MetroLineId
  aliases?: string[]
}

const CITY_AREAS = getCityAreas()

export const CITY_OPTIONS: SearchTargetOption[] = CITY_AREAS.map((city) => ({
  key: `city-${city.city}`,
  label: city.label,
  type: 'city',
  citySlug: city.city,
  aliases: [`${city.label}, Polska`, `${city.label} Polska`],
}))

export const DISTRICT_OPTIONS: SearchTargetOption[] = CITY_AREAS.flatMap((city) =>
  city.districts.map((district) => ({
    key: `district-${city.city}-${district.slug}`,
    label: `${city.label} — ${district.label}`,
    type: 'district',
    citySlug: city.city,
    districtSlug: district.slug,
    aliases: [
      district.label,
      `${city.label}, ${district.label}`,
      `${district.label}, ${city.label}`,
      `${district.label} ${city.label}`,
    ],
  }))
)

export const METRO_OPTIONS: SearchTargetOption[] = METRO_LINES.map((line) => ({
  key: `metro-${line.id}`,
  label: `Linia ${line.id}`,
  type: 'metro',
  metroLine: line.id,
  aliases: [line.id, `${line.id}, Warszawa`, `Warszawa ${line.id}`, `Metro ${line.id}`],
}))

export const SEARCH_OPTIONS: SearchTargetOption[] = [...CITY_OPTIONS, ...DISTRICT_OPTIONS, ...METRO_OPTIONS]

export function findSearchOption(input: string): SearchTargetOption | null {
  const normalized = normalizeSearchText(input)
  if (!normalized) return null

  const exact = SEARCH_OPTIONS.find((option) => matchesSearchText(option, normalized))
  if (exact) return exact

  return SEARCH_OPTIONS.find((option) => {
    const label = normalizeSearchText(option.label)
    return label.includes(normalized) || normalized.includes(label)
  }) ?? null
}

export function getSearchHref(option: SearchTargetOption): string {
  if (option.type === 'metro' && option.metroLine) {
    const params = new URLSearchParams({
      metro_line: option.metroLine,
      q: option.label,
      search_type: 'metro',
    })
    return `/biura-serwisowane?${params.toString()}`
  }

  if (option.type === 'district' && option.citySlug && option.districtSlug) {
    const params = new URLSearchParams({
      q: option.label,
      search_type: 'district',
    })
    return `/biura-serwisowane/${option.citySlug}/${option.districtSlug}?${params.toString()}`
  }

  if (option.type === 'city' && option.citySlug) {
    const params = new URLSearchParams({
      q: option.label,
      search_type: 'city',
    })
    return `/biura-serwisowane/${option.citySlug}?${params.toString()}`
  }

  return '/biura-serwisowane'
}

export function getSearchLabel(option: SearchTargetOption | null): string {
  if (!option) return ''
  return option.label
}

export function normalizeSearchText(input: string): string {
  const cleaned = input
    .trim()
    .replace(/,\s*polska$/i, '')
    .replace(/\s+polska$/i, '')
  return slugify(cleaned)
}

function matchesSearchText(option: SearchTargetOption, normalizedInput: string): boolean {
  const haystacks = [option.label, ...(option.aliases ?? [])]
  return haystacks.some((value) => normalizeSearchText(value) === normalizedInput)
}
