import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ListingDetailClient from '@/components/listing/ListingDetailClient'

interface Props {
  params: Promise<{ miasto: string; dzielnica: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('listings').select('name, description, address_city, address_district').eq('slug', slug).maybeSingle()
  if (!data) return { title: 'Biuro nie znalezione' }
  const listing = data as { name: string; description: string | null; address_city: string; address_district: string | null }
  return {
    title: `${listing.name} — biuro serwisowane, ${listing.address_district ? listing.address_district + ', ' : ''}${listing.address_city}`,
    description: listing.description?.substring(0, 160) || `Biuro serwisowane ${listing.name} w ${listing.address_city}.`,
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug, miasto, dzielnica } = await params
  const supabase = await createClient()

  const { data: listingRaw } = await supabase
    .from('listings')
    .select(`
      *,
      operator:operators(*),
      advisor:advisors(*),
      images:listing_images(*),
      amenities:listing_amenities(amenity:amenities(*))
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!listingRaw) notFound()

  const listing = listingRaw as any

  // Related listings
  const { data: related } = await supabase
    .from('listings')
    .select('*, operator:operators(*)')
    .eq('is_active', true)
    .eq('address_city', listing.address_city as string)
    .neq('id', listing.id as string)
    .limit(3)

  return (
    <ListingDetailClient
      listing={listing}
      relatedListings={(related as any) || []}
      citySlug={miasto}
      districtSlug={dzielnica}
    />
  )
}
