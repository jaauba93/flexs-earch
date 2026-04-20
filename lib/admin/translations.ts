import * as XLSX from 'xlsx'
import { createAdminClient } from '@/lib/supabase/admin'
import { publicUiMessages, type PublicLocale } from '@/lib/i18n/messages'
import { getStaticPageContentEntries } from '@/lib/i18n/contentCatalog'

type TranslationSupport = {
  listings: {
    name_en: boolean
    name_uk: boolean
    description_en: boolean
    description_uk: boolean
  }
  amenities: {
    name_en: boolean
    name_uk: boolean
  }
  publicUiTable: boolean
}

export interface TranslationImportSummary {
  listingsUpdated: number
  amenitiesUpdated: number
  publicUiUpdated: number
  pageContentUpdated: number
  errors: string[]
}

function flattenMessages(
  input: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      acc[nextKey] = value
      return acc
    }
    if (value && typeof value === 'object') {
      Object.assign(acc, flattenMessages(value as Record<string, unknown>, nextKey))
    }
    return acc
  }, {})
}

function normalizeSheetRows(sheet: XLSX.WorkSheet | undefined) {
  if (!sheet) return []
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
}

async function detectTranslationSupport(): Promise<TranslationSupport> {
  const admin = createAdminClient()
  const [{ data: listingRows }, { data: amenityRows }] = await Promise.all([
    admin.from('listings').select('*').limit(1),
    admin.from('amenities').select('*').limit(1),
  ])

  const listingRow = (listingRows?.[0] ?? {}) as Record<string, unknown>
  const amenityRow = (amenityRows?.[0] ?? {}) as Record<string, unknown>

  let publicUiTable = true
  const { error: publicUiError } = await (admin as any)
    .from('public_site_translations')
    .select('key')
    .limit(1)

  if (publicUiError) {
    publicUiTable = false
  }

  return {
    listings: {
      name_en: 'name_en' in listingRow,
      name_uk: 'name_uk' in listingRow,
      description_en: 'description_en' in listingRow,
      description_uk: 'description_uk' in listingRow,
    },
    amenities: {
      name_en: 'name_en' in amenityRow,
      name_uk: 'name_uk' in amenityRow,
    },
    publicUiTable,
  }
}

export async function buildTranslationWorkbook() {
  const admin = createAdminClient()
  const support = await detectTranslationSupport()

  const listingSelect = [
    'id',
    'slug',
    'name',
    'description',
    ...(support.listings.name_en ? ['name_en'] : []),
    ...(support.listings.name_uk ? ['name_uk'] : []),
    ...(support.listings.description_en ? ['description_en'] : []),
    ...(support.listings.description_uk ? ['description_uk'] : []),
  ].join(', ')

  const amenitySelect = [
    'id',
    'slug',
    'category',
    'name',
    ...(support.amenities.name_en ? ['name_en'] : []),
    ...(support.amenities.name_uk ? ['name_uk'] : []),
  ].join(', ')

  const [{ data: listings }, { data: amenities }] = await Promise.all([
    admin
      .from('listings')
      .select(listingSelect)
      .order('address_city')
      .order('name'),
    admin
      .from('amenities')
      .select(amenitySelect)
      .order('category')
      .order('sort_order'),
  ])

  let publicUiOverrides = new Map<string, Record<PublicLocale, string>>()

  if (support.publicUiTable) {
    const { data: rows } = await (admin as any)
      .from('public_site_translations')
      .select('key, value_pl, value_en, value_uk')
      .order('key')

    publicUiOverrides = new Map(
      ((rows as Array<{ key: string; value_pl: string | null; value_en: string | null; value_uk: string | null }> | null) ?? []).map((row) => [
        row.key,
        {
          pl: row.value_pl ?? '',
          en: row.value_en ?? '',
          uk: row.value_uk ?? '',
        },
      ])
    )
  }

  const workbook = XLSX.utils.book_new()

  const listingRows =
    ((listings as Array<Record<string, unknown>> | null) ?? []).map((listing) => ({
      id: listing.id,
      slug: listing.slug,
      name_pl: listing.name ?? '',
      name_en: support.listings.name_en ? (listing.name_en ?? '') : '',
      name_uk: support.listings.name_uk ? (listing.name_uk ?? '') : '',
      description_pl: listing.description ?? '',
      description_en: support.listings.description_en ? (listing.description_en ?? '') : '',
      description_uk: support.listings.description_uk ? (listing.description_uk ?? '') : '',
    }))

  const amenityRows =
    ((amenities as Array<Record<string, unknown>> | null) ?? []).map((amenity) => ({
      id: amenity.id,
      slug: amenity.slug,
      category: amenity.category,
      name_pl: amenity.name ?? '',
      name_en: support.amenities.name_en ? (amenity.name_en ?? '') : '',
      name_uk: support.amenities.name_uk ? ((amenity as Record<string, unknown>).name_uk ?? '') : '',
    }))

  const flattenedPl = flattenMessages(publicUiMessages.pl)
  const flattenedEn = flattenMessages(publicUiMessages.en)
  const flattenedUk = flattenMessages(publicUiMessages.uk)
  const staticPageContent = getStaticPageContentEntries()
  const publicUiRows = Object.keys(flattenedPl)
    .sort()
    .map((key) => {
      const override = publicUiOverrides.get(key)
      return {
        key,
        value_pl: override?.pl || flattenedPl[key] || '',
        value_en: override?.en || flattenedEn[key] || '',
        value_uk: override?.uk || flattenedUk[key] || '',
      }
    })

  const pageContentRows = staticPageContent
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((item) => {
      const override = publicUiOverrides.get(item.key)
      return {
        key: item.key,
        group: item.group,
        route: item.route,
        value_pl: override?.pl || item.value_pl || '',
        value_en: override?.en || '',
        value_uk: override?.uk || '',
      }
    })

  const instructionsRows = [
    {
      sheet: 'listings_translations',
      purpose: 'Tłumaczenia nazw i opisów ofert. Zostaw kolumny `*_pl` jako referencję źródłową.',
    },
    {
      sheet: 'amenities_translations',
      purpose: 'Tłumaczenia nazw amenities. Można uzupełniać zbiorczo poza CMS.',
    },
    {
      sheet: 'public_ui_translations',
      purpose: 'Wspólne stringi interfejsu. Import zapisze je do bazy po uruchomieniu migracji SQL dla public_site_translations.',
    },
    {
      sheet: 'page_content_translations',
      purpose: 'Treści strony głównej, podstron, polityk, części CTA i metadata/SEO. To jest główny arkusz do zbiorczego tłumaczenia contentu.',
    },
    {
      sheet: 'status',
      purpose: support.publicUiTable
        ? 'Tabela public_site_translations jest dostępna i może przyjmować import.'
        : 'Tabela public_site_translations nie istnieje jeszcze w bazie. Uruchom skrypt SQL przed importem tej zakładki.',
    },
  ]

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(listingRows), 'listings_translations')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(amenityRows), 'amenities_translations')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(publicUiRows), 'public_ui_translations')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(pageContentRows), 'page_content_translations')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(instructionsRows), 'instructions')

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

export async function importTranslationWorkbook(buffer: ArrayBuffer): Promise<TranslationImportSummary> {
  const admin = createAdminClient()
  const support = await detectTranslationSupport()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const listingRows = normalizeSheetRows(workbook.Sheets.listings_translations)
  const amenityRows = normalizeSheetRows(workbook.Sheets.amenities_translations)
  const publicUiRows = normalizeSheetRows(workbook.Sheets.public_ui_translations)
  const pageContentRows = normalizeSheetRows(workbook.Sheets.page_content_translations)

  const summary: TranslationImportSummary = {
    listingsUpdated: 0,
    amenitiesUpdated: 0,
    publicUiUpdated: 0,
    pageContentUpdated: 0,
    errors: [],
  }

  for (let index = 0; index < listingRows.length; index += 1) {
    const row = listingRows[index]
    const id = String(row.id || '').trim()
    const slug = String(row.slug || '').trim()
    if (!id && !slug) continue

    const payload: Record<string, string | null> = {}

    if (support.listings.name_en) payload.name_en = String(row.name_en || '').trim() || null
    if (support.listings.name_uk) payload.name_uk = String(row.name_uk || '').trim() || null
    if (support.listings.description_en) payload.description_en = String(row.description_en || '').trim() || null
    if (support.listings.description_uk) payload.description_uk = String(row.description_uk || '').trim() || null

    if (Object.keys(payload).length === 0) continue

    const query = (admin as any).from('listings').update(payload)
    const { error } = id ? await query.eq('id', id) : await query.eq('slug', slug)

    if (error) {
      summary.errors.push(`Listings row ${index + 2}: ${error.message}`)
      continue
    }

    summary.listingsUpdated += 1
  }

  for (let index = 0; index < amenityRows.length; index += 1) {
    const row = amenityRows[index]
    const id = String(row.id || '').trim()
    const slug = String(row.slug || '').trim()
    if (!id && !slug) continue

    const payload: Record<string, string | null> = {}

    if (support.amenities.name_en) payload.name_en = String(row.name_en || '').trim() || null
    if (support.amenities.name_uk) payload.name_uk = String(row.name_uk || '').trim() || null

    if (Object.keys(payload).length === 0) continue

    const query = (admin as any).from('amenities').update(payload)
    const { error } = id ? await query.eq('id', id) : await query.eq('slug', slug)

    if (error) {
      summary.errors.push(`Amenities row ${index + 2}: ${error.message}`)
      continue
    }

    summary.amenitiesUpdated += 1
  }

  if (support.publicUiTable) {
    for (let index = 0; index < publicUiRows.length; index += 1) {
      const row = publicUiRows[index]
      const key = String(row.key || '').trim()
      if (!key) continue

      const payload = {
        key,
        value_pl: String(row.value_pl || '').trim() || null,
        value_en: String(row.value_en || '').trim() || null,
        value_uk: String(row.value_uk || '').trim() || null,
      }

      const { error } = await (admin as any)
        .from('public_site_translations')
        .upsert(payload, { onConflict: 'key' })

      if (error) {
        summary.errors.push(`Public UI row ${index + 2}: ${error.message}`)
        continue
      }

      summary.publicUiUpdated += 1
    }

    for (let index = 0; index < pageContentRows.length; index += 1) {
      const row = pageContentRows[index]
      const key = String(row.key || '').trim()
      if (!key) continue

      const payload = {
        key,
        value_pl: String(row.value_pl || '').trim() || null,
        value_en: String(row.value_en || '').trim() || null,
        value_uk: String(row.value_uk || '').trim() || null,
      }

      const { error } = await (admin as any)
        .from('public_site_translations')
        .upsert(payload, { onConflict: 'key' })

      if (error) {
        summary.errors.push(`Page content row ${index + 2}: ${error.message}`)
        continue
      }

      summary.pageContentUpdated += 1
    }
  }

  return summary
}
