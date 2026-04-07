import type { Metadata } from 'next'
import ComparatorClient from '@/components/comparator/ComparatorClient'

export const metadata: Metadata = {
  title: 'Porównaj biura serwisowane',
  description: 'Porównaj wybrane biura serwisowane obok siebie i uzyskaj zbiorczą ofertę Colliers.',
}

export default function PorownajPage() {
  return <ComparatorClient />
}
