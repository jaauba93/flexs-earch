import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HomeClient from '@/components/home/HomeClient'

export const metadata: Metadata = {
  title: 'Colliers Flex — Biura serwisowane w Polsce',
  description: 'Przeszukaj setki lokalizacji biur serwisowanych i coworkingów w Polsce. Porównaj oferty i uzyskaj rekomendację doradcy Colliers.',
  openGraph: {
    title: 'Colliers Flex — Biura serwisowane w Polsce',
    description: 'Wyszukiwarka biur serwisowanych i coworkingów dla Twojej firmy.',
  },
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredListings } = await supabase
    .from('listings')
    .select('*, operator:operators(*)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('name')
    .limit(6)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <HomeClient featuredListings={(featuredListings as any) || []} />
}
