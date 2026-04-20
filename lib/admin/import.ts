import * as XLSX from 'xlsx'
import type { Listing } from '@/types/database'
import { slugify } from '@/lib/utils/slugify'
import type { ListingTranslationSupport } from '@/lib/admin/data'

export interface ParsedImportRow {
  action: 'upsert' | 'delete'
  id: string | null
  slug: string | null
  operator_slug: string | null
  operator_name: string | null
  name: string | null
  name_en: string | null
  name_uk: string | null
  description: string | null
  description_en: string | null
  description_uk: string | null
  address_street: string | null
  address_postcode: string | null
  address_city: string | null
  address_district: string | null
  latitude: number | null
  longitude: number | null
  price_desk_private: number | null
  price_desk_hotdesk: number | null
  total_workstations: number | null
  min_office_size: number | null
  max_office_size: number | null
  year_opened: number | null
  main_image_url: string | null
  is_active: boolean | null
  is_featured: boolean | null
  advisor_email: string | null
  amenity_slugs: string[]
}

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value])
  )
}

function readText(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  return String(value).trim() || null
}

function readNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function readBoolean(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const normalized = String(value).trim().toLowerCase()
  if (['1', 'true', 'tak', 'yes', 'y'].includes(normalized)) return true
  if (['0', 'false', 'nie', 'no', 'n'].includes(normalized)) return false
  return null
}

function normalizeImportedCity(value: string | null) {
  if (!value) return null

  const normalized = slugify(value)
  const cityMap: Record<string, string> = {
    warsaw: 'Warszawa',
    warszawa: 'Warszawa',
    gdansk: 'Gdańsk',
    gdańsk: 'Gdańsk',
    krakow: 'Kraków',
    kraków: 'Kraków',
    wroclaw: 'Wrocław',
    wrocław: 'Wrocław',
    poznan: 'Poznań',
    poznań: 'Poznań',
    lodz: 'Łódź',
    łódź: 'Łódź',
    bialystok: 'Białystok',
    białystok: 'Białystok',
    bydgoszcz: 'Bydgoszcz',
    katowice: 'Katowice',
    lublin: 'Lublin',
    rzeszow: 'Rzeszów',
    rzeszów: 'Rzeszów',
    szczecin: 'Szczecin',
    gdynia: 'Gdynia',
    sopot: 'Sopot',
  }

  return cityMap[normalized] ?? value
}

export function parseImportWorkbook(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' })

  return rows.map((row) => {
    const normalized = normalizeRow(row)
    const action = readText(normalized.action)?.toLowerCase() === 'delete' ? 'delete' : 'upsert'
    const amenitySlugs = Object.entries(normalized)
      .filter(([key, value]) => key.startsWith('amenity__') && readBoolean(value) === true)
      .map(([key]) => key.replace(/^amenity__/, ''))

    return {
      action,
      id: readText(normalized.id),
      slug: readText(normalized.slug),
      operator_slug: readText(normalized.operator_slug),
      operator_name: readText(normalized.operator_name),
      name: readText(normalized.name ?? normalized.name_pl),
      name_en: readText(normalized.name_en),
      name_uk: readText(normalized.name_uk),
      description: readText(normalized.description ?? normalized.description_pl),
      description_en: readText(normalized.description_en),
      description_uk: readText(normalized.description_uk),
      address_street: readText(normalized.address_street),
      address_postcode: readText(normalized.address_postcode),
      address_city: normalizeImportedCity(readText(normalized.address_city)),
      address_district: readText(normalized.address_district),
      latitude: readNumber(normalized.latitude),
      longitude: readNumber(normalized.longitude),
      price_desk_private: readNumber(normalized.price_desk_private),
      price_desk_hotdesk: readNumber(normalized.price_desk_hotdesk),
      total_workstations: readNumber(normalized.total_workstations),
      min_office_size: readNumber(normalized.min_office_size),
      max_office_size: readNumber(normalized.max_office_size),
      year_opened: readNumber(normalized.year_opened),
      main_image_url: readText(normalized.main_image_url),
      is_active: readBoolean(normalized.is_active),
      is_featured: readBoolean(normalized.is_featured),
      advisor_email: readText(normalized.advisor_email),
      amenity_slugs: amenitySlugs,
    } satisfies ParsedImportRow
  })
}

export function buildImportPayload(
  row: ParsedImportRow,
  support: ListingTranslationSupport,
  existing?: Listing | null
) {
  const slug = row.slug || slugify(row.name || existing?.name || '')

  const payload: Record<string, unknown> = {
    slug,
    name: row.name ?? existing?.name,
    description: row.description ?? existing?.description ?? null,
    address_street: row.address_street ?? existing?.address_street,
    address_postcode: row.address_postcode ?? existing?.address_postcode,
    address_city: row.address_city ?? existing?.address_city,
    address_district: row.address_district ?? existing?.address_district ?? null,
    latitude: row.latitude ?? existing?.latitude,
    longitude: row.longitude ?? existing?.longitude,
    price_desk_private: row.price_desk_private ?? existing?.price_desk_private ?? null,
    price_desk_hotdesk: row.price_desk_hotdesk ?? existing?.price_desk_hotdesk ?? null,
    total_workstations: row.total_workstations ?? existing?.total_workstations ?? null,
    min_office_size: row.min_office_size ?? existing?.min_office_size ?? null,
    max_office_size: row.max_office_size ?? existing?.max_office_size ?? null,
    year_opened: row.year_opened ?? existing?.year_opened ?? null,
    main_image_url: row.main_image_url ?? existing?.main_image_url ?? null,
    is_active: row.is_active ?? existing?.is_active ?? true,
    is_featured: row.is_featured ?? existing?.is_featured ?? false,
  }

  if (support.name_en) payload.name_en = row.name_en
  if (support.name_uk) payload.name_uk = row.name_uk
  if (support.description_en) payload.description_en = row.description_en
  if (support.description_uk) payload.description_uk = row.description_uk

  return payload
}
