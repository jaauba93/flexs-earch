import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils/slugify'
import { BASICS_ORDER } from '@/lib/basics/flexBasics'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://flex.colliers.pl'

const CITIES = ['warszawa', 'krakow', 'wroclaw', 'trojmiasto', 'poznan', 'katowice', 'lodz']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('slug, address_city, address_district, updated_at')
    .eq('is_active', true)

  type SitemapListing = { slug: string; address_city: string; address_district: string | null; updated_at: string }
  const listingUrls: MetadataRoute.Sitemap = ((listings || []) as SitemapListing[]).map((l) => ({
    url: `${BASE}/biura-serwisowane/${slugify(l.address_city)}/${l.address_district ? slugify(l.address_district) : '_'}/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const cityUrls: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${BASE}/biura-serwisowane/${c}`,
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/przewodnik-flex`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/podstawy-flex`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/raporty-miejskie`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/kalkulator-flex`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/biura-serwisowane`, changeFrequency: 'daily', priority: 0.95 },
    ...CITIES.map((c) => ({
      url: `${BASE}/raporty-miejskie/${c}`,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })),
    ...BASICS_ORDER.map((slug) => ({
      url: `${BASE}/podstawy-flex/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.72,
    })),
    ...cityUrls,
    ...listingUrls,
    { url: `${BASE}/porownaj`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/polityka-prywatnosci`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/polityka-cookies`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
