import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PUBLIC_SITE_LOCALES } from '@/lib/i18n/messages'
import { slugify } from '@/lib/utils/slugify'
import { BASICS_ORDER } from '@/lib/basics/flexBasics'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flex.colliers.pl'

const CITIES = ['warszawa', 'krakow', 'wroclaw', 'trojmiasto', 'poznan', 'katowice', 'lodz']

function makeLocaleUrls(
  path: string,
  options?: Omit<MetadataRoute.Sitemap[number], 'url'>
): MetadataRoute.Sitemap {
  return PUBLIC_SITE_LOCALES.map((locale) => ({
    url: `${BASE}/${locale}${path === '/' ? '' : path}`,
    ...options,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('slug, address_city, address_district, updated_at')
    .eq('is_active', true)

  type SitemapListing = { slug: string; address_city: string; address_district: string | null; updated_at: string }
  const listingUrls: MetadataRoute.Sitemap = ((listings || []) as SitemapListing[]).flatMap((l) =>
    makeLocaleUrls(
      `/biura-serwisowane/${slugify(l.address_city)}/${l.address_district ? slugify(l.address_district) : '_'}/${l.slug}`,
      {
        lastModified: new Date(l.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    )
  )

  const cityUrls: MetadataRoute.Sitemap = CITIES.flatMap((c) =>
    makeLocaleUrls(`/biura-serwisowane/${c}`, {
      changeFrequency: 'daily',
      priority: 0.9,
    })
  )

  return [
    ...makeLocaleUrls('/', { changeFrequency: 'weekly', priority: 1.0 }),
    ...makeLocaleUrls('/przewodnik-flex', { changeFrequency: 'weekly', priority: 0.8 }),
    ...makeLocaleUrls('/podstawy-flex', { changeFrequency: 'weekly', priority: 0.8 }),
    ...makeLocaleUrls('/raporty-miejskie', { changeFrequency: 'weekly', priority: 0.8 }),
    ...makeLocaleUrls('/kalkulator-flex', { changeFrequency: 'monthly', priority: 0.7 }),
    ...makeLocaleUrls('/biura-serwisowane', { changeFrequency: 'daily', priority: 0.95 }),
    ...CITIES.flatMap((c) =>
      makeLocaleUrls(`/raporty-miejskie/${c}`, {
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })
    ),
    ...BASICS_ORDER.flatMap((slug) =>
      makeLocaleUrls(`/podstawy-flex/${slug}`, {
        changeFrequency: 'weekly' as const,
        priority: 0.72,
      })
    ),
    ...cityUrls,
    ...listingUrls,
    ...makeLocaleUrls('/porownaj', { changeFrequency: 'monthly', priority: 0.5 }),
    ...makeLocaleUrls('/polityka-prywatnosci', { changeFrequency: 'yearly', priority: 0.2 }),
    ...makeLocaleUrls('/polityka-cookies', { changeFrequency: 'yearly', priority: 0.2 }),
  ]
}
