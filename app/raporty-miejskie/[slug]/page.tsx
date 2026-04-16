import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import CityReportClient from '@/components/reports/CityReportClient'
import { createClient } from '@/lib/supabase/server'
import { CITY_REPORT_ORDER, getCityReport } from '@/lib/reports/cityReports'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return CITY_REPORT_ORDER.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const report = getCityReport(params.slug)
  if (!report) return {}
  return {
    title: `Raport miejski: ${report.cityName}`,
    description: `${report.heroLead} Sprawdź oferty, poziom cen i strukturę operatorów.`,
    openGraph: {
      title: `Raport miejski: ${report.cityName}`,
      description: report.heroLead,
    },
  }
}

export default async function CityReportPage({ params }: PageProps) {
  const report = getCityReport(params.slug)
  if (!report) return notFound()

  const supabase = await createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, operator:operators(*)')
    .eq('is_active', true)
    .in('address_city', report.cityDbNames)
    .order('is_featured', { ascending: false })
    .order('name')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CityReportClient report={report} listings={(listings as any) || []} />
}

export const dynamicParams = false
