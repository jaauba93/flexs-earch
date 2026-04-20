import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BasketProvider } from '@/lib/context/BasketContext'
import { CurrencyProvider } from '@/lib/context/CurrencyContext'
import { LocaleProvider, LOCALE_COOKIE_NAME } from '@/lib/context/LocaleContext'
import CookieBanner from '@/components/ui/CookieBanner'
import GoogleAnalytics from '@/components/ui/GoogleAnalytics'
import SmoothScroll from '@/components/ui/SmoothScroll'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { DEFAULT_PUBLIC_LOCALE, PUBLIC_SITE_LOCALES } from '@/lib/i18n/messages'

export const metadata: Metadata = {
  metadataBase: new URL(
    (() => {
      const u = process.env.NEXT_PUBLIC_SITE_URL || 'https://flex.colliers.pl'
      return u.startsWith('http') ? u : `https://${u}`
    })()
  ),
  title: {
    default: 'Colliers Flex — Biura serwisowane w Polsce',
    template: '%s | Colliers Flex',
  },
  description: 'Wyszukiwarka biur serwisowanych i coworkingów w Polsce. Porównaj oferty, sprawdź ceny i uzyskaj rekomendację doradcy Colliers.',
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'Colliers Flex',
  },
  robots: { index: true, follow: true },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  const initialLocale =
    localeCookie && PUBLIC_SITE_LOCALES.includes(localeCookie as (typeof PUBLIC_SITE_LOCALES)[number])
      ? (localeCookie as (typeof PUBLIC_SITE_LOCALES)[number])
      : DEFAULT_PUBLIC_LOCALE

  return (
    <html lang={initialLocale}>
      <body>
        <BasketProvider>
          <LocaleProvider initialLocale={initialLocale}>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </LocaleProvider>
          <CookieBanner />
        </BasketProvider>
        <GoogleAnalytics />
        <SmoothScroll />
        <ScrollReveal />
      </body>
    </html>
  )
}
