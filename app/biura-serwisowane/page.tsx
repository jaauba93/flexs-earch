import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SearchClient from '@/components/search/SearchClient'

export const metadata: Metadata = {
  title: 'Biura serwisowane w Polsce',
  description: 'Wyszukaj i porównaj biura serwisowane w największych miastach Polski. Filtruj po cenie, lokalizacji i udogodnieniach.',
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const supabase = await createClient()

  const [{ data: operators }, { data: amenities }] = await Promise.all([
    supabase.from('operators').select('id, name, slug').order('name'),
    supabase.from('amenities').select('id, name, slug, category').order('sort_order'),
  ])

  return (
    <SearchClient
      initialCity={undefined}
      initialDistrict={undefined}
      operators={operators || []}
      amenities={amenities || []}
      searchParams={params}
    />
  )
}
