import { BASICS_ORDER } from '@/lib/basics/flexBasics'
export { generateMetadata, dynamicParams } from '@/app/podstawy-flex/[slug]/page'
export { default } from '@/app/podstawy-flex/[slug]/page'

export function generateStaticParams() {
  return ['pl', 'en', 'uk'].flatMap((locale) =>
    BASICS_ORDER.map((slug) => ({ locale, slug }))
  )
}
