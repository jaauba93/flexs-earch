import { createAdminClient } from '@/lib/supabase/admin'
import { getStaticPageContentEntries, type StaticContentEntry } from '@/lib/i18n/contentCatalog'
import type { PublicLocale } from '@/lib/i18n/messages'

export interface WebRouteSummary {
  route: string
  routeId: string
  title: string
  keyCount: number
  groups: string[]
}

export interface WebRouteEditorItem {
  key: string
  group: string
  value_pl: string
  value_en: string
  value_uk: string
}

export interface WebRouteEditorData {
  route: string
  routeId: string
  title: string
  items: WebRouteEditorItem[]
}

type TranslationRow = {
  key: string
  value_pl: string | null
  value_en: string | null
  value_uk: string | null
}

function encodeRouteId(route: string) {
  return Buffer.from(route, 'utf8').toString('base64url')
}

export function decodeRouteId(routeId: string) {
  return Buffer.from(routeId, 'base64url').toString('utf8')
}

function routeTitle(entries: StaticContentEntry[], route: string) {
  const titleEntry =
    entries.find((entry) => entry.key.endsWith('.hero.title')) ??
    entries.find((entry) => entry.key.endsWith('.title')) ??
    entries.find((entry) => entry.key.startsWith('meta.') && entry.key.endsWith('.title'))

  if (titleEntry?.value_pl) {
    return titleEntry.value_pl
  }

  if (route === '/') return 'Strona główna'
  if (route === 'global') return 'Globalne treści i metadata'
  if (route.startsWith('modal:')) return `Komponent ${route.replace('modal:', '')}`

  return route
}

async function getOverrideMap() {
  const admin = createAdminClient()
  const { data } = await (admin as any)
    .from('public_site_translations')
    .select('key, value_pl, value_en, value_uk')

  return (((data as TranslationRow[] | null) ?? [])).reduce<Record<string, TranslationRow>>((acc, row) => {
    acc[row.key] = row
    return acc
  }, {})
}

export async function getWebRouteSummaries(): Promise<WebRouteSummary[]> {
  const entries = getStaticPageContentEntries()
  const grouped = new Map<string, StaticContentEntry[]>()

  entries.forEach((entry) => {
    const current = grouped.get(entry.route) ?? []
    current.push(entry)
    grouped.set(entry.route, current)
  })

  return Array.from(grouped.entries())
    .map(([route, routeEntries]) => ({
      route,
      routeId: encodeRouteId(route),
      title: routeTitle(routeEntries, route),
      keyCount: routeEntries.length,
      groups: Array.from(new Set(routeEntries.map((entry) => entry.group))),
    }))
    .sort((a, b) => a.route.localeCompare(b.route, 'pl'))
}

export async function getWebRouteEditorData(routeId: string): Promise<WebRouteEditorData | null> {
  const route = decodeRouteId(routeId)
  const entries = getStaticPageContentEntries().filter((entry) => entry.route === route)

  if (entries.length === 0) {
    return null
  }

  const overrides = await getOverrideMap()

  return {
    route,
    routeId,
    title: routeTitle(entries, route),
    items: entries
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((entry) => ({
        key: entry.key,
        group: entry.group,
        value_pl: overrides[entry.key]?.value_pl ?? entry.value_pl ?? '',
        value_en: overrides[entry.key]?.value_en ?? '',
        value_uk: overrides[entry.key]?.value_uk ?? '',
      })),
  }
}

export function buildWebTranslationUpserts(
  routeData: WebRouteEditorData,
  values: Record<string, Partial<Record<PublicLocale, string>>>
) {
  return routeData.items.map((item) => ({
    key: item.key,
    value_pl: values[item.key]?.pl ?? item.value_pl,
    value_en: values[item.key]?.en ?? item.value_en,
    value_uk: values[item.key]?.uk ?? item.value_uk,
  }))
}
