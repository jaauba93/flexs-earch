import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SearchClient from '@/components/search/SearchClient'
import { slugToCity } from '@/lib/utils/slugify'

interface Props {
  params: Promise<{ miasto: string; dzielnica: string }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { miasto, dzielnica } = await params
  const city = slugToCity(miasto)
  const district = dzielnica.charAt(0).toUpperCase() + dzielnica.slice(1).replace(/-/g, ' ')
  return {
    title: `Biura serwisowane — ${district}, ${city}`,
    description: `Biura serwisowane i coworki w dzielnicy ${district} w ${city}.`,
  }
}

export default async function DzielnicaPage({ params, searchParams }: Props) {
  const { miasto, dzielnica } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const [{ data: operators }, { data: amenities }] = await Promise.all([
    supabase.from('operators').select('id, name, slug').order('name'),
    supabase.from('amenities').select('id, name, slug, category').order('sort_order'),
  ])

  return (
    <SearchClient
      initialCity={miasto}
      initialDistrict={dzielnica}
      operators={operators || []}
      amenities={amenities || []}
      searchParams={sp}
    />
  )
}
