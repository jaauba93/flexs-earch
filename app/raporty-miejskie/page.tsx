import type { Metadata } from 'next'
import ReportsHubClient from '@/components/reports/ReportsHubClient'

export const metadata: Metadata = {
  title: 'Raporty miejskie',
  description:
    'Porównaj rynki biur elastycznych w największych miastach Polski: podaż, zajętość, ceny i strukturę operatorów.',
  openGraph: {
    title: 'Raporty miejskie — Colliers Flex',
    description:
      'Przekrojowe raporty rynków flex: Warszawa, Kraków, Wrocław, Trójmiasto, Poznań, Łódź i Katowice.',
  },
}

export default function ReportsHubPage() {
  return <ReportsHubClient />
}
