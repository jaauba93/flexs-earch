import type { Metadata } from 'next'
import FlexCalculatorClient from '@/components/flex-calculator/FlexCalculatorClient'
import { getFlexCalculatorPublicData } from '@/lib/flex-calculator/data'

export const metadata: Metadata = {
  title: 'Kalkulator flex',
  description:
    'Porównaj orientacyjny koszt biura serwisowanego i najmu konwencjonalnego dla swojego zespołu z wykorzystaniem założeń Colliers i kursu NBP.',
}

export default async function KalkulatorFlexPage() {
  const data = await getFlexCalculatorPublicData()

  return <FlexCalculatorClient data={data} />
}
