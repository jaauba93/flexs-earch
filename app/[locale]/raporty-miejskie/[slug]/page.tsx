import { CITY_REPORT_ORDER } from '@/lib/reports/cityReports'
export { generateMetadata, dynamicParams } from '@/app/raporty-miejskie/[slug]/page'
export { default } from '@/app/raporty-miejskie/[slug]/page'

export function generateStaticParams() {
  return ['pl', 'en', 'uk'].flatMap((locale) =>
    CITY_REPORT_ORDER.map((slug) => ({ locale, slug }))
  )
}
