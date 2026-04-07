import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SearchClient from '@/components/search/SearchClient'
import { slugToCity } from '@/lib/utils/slugify'

interface Props {
  params: Promise<{ miasto: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { miasto } = await params
  const city = slugToCity(miasto)
  return {
    title: `Biura serwisowane w ${city}`,
    description: `Znajdź biuro serwisowane lub coworking w ${city}. Porównaj ceny, lokalizacje i udogodnienia.`,
  }
}

export default async function MiastoPage({ params, searchParams }: Props) {
  const { miasto } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const [{ data: operators }, { data: amenities }] = await Promise.all([
    supabase.from('operators').select('id, name, slug').order('name'),
    supabase.from('amenities').select('id, name, slug, category').order('sort_order'),
  ])

  return (
    <SearchClient
      initialCity={miasto}
      initialDistrict={undefined}
      operators={operators || []}
      amenities={amenities || []}
      searchParams={sp}
    />
  )
}
