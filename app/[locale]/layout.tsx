import { notFound } from 'next/navigation'
import { PUBLIC_SITE_LOCALES } from '@/lib/i18n/messages'

export default async function PublicLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!PUBLIC_SITE_LOCALES.includes(locale as (typeof PUBLIC_SITE_LOCALES)[number])) {
    notFound()
  }

  return children
}
