import type { Advisor, Amenity, Listing, ListingImage, Operator } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'

export interface ListingTranslationSupport {
  name_en: boolean
  name_uk: boolean
  description_en: boolean
  description_uk: boolean
}

export type AdminListingRecord = Listing & {
  name_en?: string | null
  name_uk?: string | null
  description_en?: string | null
  description_uk?: string | null
}

export interface ListingSummary {
  id: string
  slug: string
  name: string
  is_active: boolean
  is_featured: boolean
  updated_at: string
  address_city: string
  address_district: string | null
  operator_name: string | null
}

export interface ListingEditorData {
  listing: AdminListingRecord | null
  images: ListingImage[]
  operators: Pick<Operator, 'id' | 'name' | 'slug'>[]
  advisors: Pick<Advisor, 'id' | 'name' | 'email'>[]
  amenities: Pick<Amenity, 'id' | 'name' | 'slug' | 'category' | 'sort_order'>[]
  selectedAmenityIds: string[]
  translationSupport: ListingTranslationSupport
}

export interface AdvisorSummary {
  id: string
  name: string
  title: string | null
  email: string
  phone: string | null
  photo_url: string | null
}

export async function getTranslationSupport() {
  const admin = createAdminClient()
  const { data } = await admin.from('listings').select('*').limit(1)
  const row = (data?.[0] ?? {}) as Record<string, unknown>

  return {
    name_en: 'name_en' in row,
    name_uk: 'name_uk' in row,
    description_en: 'description_en' in row,
    description_uk: 'description_uk' in row,
  } satisfies ListingTranslationSupport
}

export async function getAdminDashboardStats() {
  const admin = createAdminClient()

  const [
    { count: totalListings },
    { count: activeListings },
    { count: featuredListings },
    { count: enquiries },
  ] = await Promise.all([
    admin.from('listings').select('*', { count: 'exact', head: true }),
    admin.from('listings').select('*', { count: 'exact', head: true }).eq('is_active', true),
    admin.from('listings').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    admin.from('enquiries').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalListings: totalListings ?? 0,
    activeListings: activeListings ?? 0,
    featuredListings: featuredListings ?? 0,
    enquiries: enquiries ?? 0,
  }
}

export async function getListingSummaries() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('listings')
    .select('id, slug, name, is_active, is_featured, updated_at, address_city, address_district, operator:operators(name)')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(`Nie udało się pobrać ofert: ${error.message}`)
  }

  return ((data as Array<Listing & { operator: { name: string } | null }>) ?? []).map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    is_active: item.is_active,
    is_featured: item.is_featured,
    updated_at: item.updated_at,
    address_city: item.address_city,
    address_district: item.address_district,
    operator_name: item.operator?.name ?? null,
  })) satisfies ListingSummary[]
}

export async function getListingEditorData(id?: string): Promise<ListingEditorData> {
  const admin = createAdminClient()
  const translationSupport = await getTranslationSupport()

  const [operatorsResult, advisorsResult, amenitiesResult, listingResult, imagesResult, listingAmenitiesResult] = await Promise.all([
    admin.from('operators').select('id, name, slug').order('name'),
    admin.from('advisors').select('id, name, email').order('name'),
    admin.from('amenities').select('id, name, slug, category, sort_order').order('category').order('sort_order'),
    id ? admin.from('listings').select('*').eq('id', id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    id
      ? admin.from('listing_images').select('*').eq('listing_id', id).order('sort_order')
      : Promise.resolve({ data: [], error: null }),
    id
      ? admin.from('listing_amenities').select('amenity_id').eq('listing_id', id)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (operatorsResult.error) {
    throw new Error(`Nie udało się pobrać operatorów: ${operatorsResult.error.message}`)
  }

  if (advisorsResult.error) {
    throw new Error(`Nie udało się pobrać doradców: ${advisorsResult.error.message}`)
  }

  if (listingResult?.error) {
    throw new Error(`Nie udało się pobrać oferty: ${listingResult.error.message}`)
  }

  if (amenitiesResult.error) {
    throw new Error(`Nie udało się pobrać udogodnień: ${amenitiesResult.error.message}`)
  }

  if (imagesResult?.error) {
    throw new Error(`Nie udało się pobrać zdjęć: ${imagesResult.error.message}`)
  }

  if (listingAmenitiesResult?.error) {
    throw new Error(`Nie udało się pobrać relacji udogodnień: ${listingAmenitiesResult.error.message}`)
  }

  return {
    listing: (listingResult?.data as AdminListingRecord | null) ?? null,
    images: (imagesResult?.data as ListingImage[]) ?? [],
    operators: (operatorsResult.data as Pick<Operator, 'id' | 'name' | 'slug'>[]) ?? [],
    advisors: (advisorsResult.data as Pick<Advisor, 'id' | 'name' | 'email'>[]) ?? [],
    amenities: (amenitiesResult.data as Pick<Amenity, 'id' | 'name' | 'slug' | 'category' | 'sort_order'>[]) ?? [],
    selectedAmenityIds:
      ((listingAmenitiesResult?.data as Array<{ amenity_id: string }> | null) ?? []).map((item) => item.amenity_id),
    translationSupport,
  }
}

export async function getAdvisorSummaries() {
  const admin = createAdminClient()
  const { data, error } = await admin.from('advisors').select('*').order('name')

  if (error) {
    throw new Error(`Nie udało się pobrać doradców: ${error.message}`)
  }

  return (data ?? []) as AdvisorSummary[]
}

export async function getAdvisorEditorData(id?: string) {
  const admin = createAdminClient()

  if (!id) {
    return null
  }

  const { data, error } = await admin.from('advisors').select('*').eq('id', id).maybeSingle()

  if (error) {
    throw new Error(`Nie udało się pobrać doradcy: ${error.message}`)
  }

  return (data as Advisor | null) ?? null
}
