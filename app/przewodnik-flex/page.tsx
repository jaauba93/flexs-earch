import type { Metadata } from 'next'
import GuideClient from '@/components/guide/GuideClient'

export const metadata: Metadata = {
  title: 'Przewodnik po biurach elastycznych',
  description:
    'Modele najmu, różnice względem biura tradycyjnego, kryteria wyboru i raporty miejskie rynku flex w Polsce.',
  openGraph: {
    title: 'Przewodnik po biurach elastycznych',
    description:
      'Poznaj podstawy flex, porównaj modele najmu i sprawdź raporty miejskie dla największych rynków w Polsce.',
  },
}

export default function GuidePage() {
  return <GuideClient />
}
