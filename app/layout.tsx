import type { Metadata } from 'next'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BasketProvider } from '@/lib/context/BasketContext'
import CookieBanner from '@/components/ui/CookieBanner'
import GoogleAnalytics from '@/components/ui/GoogleAnalytics'
import SmoothScroll from '@/components/ui/SmoothScroll'
import ScrollReveal from '@/components/ui/ScrollReveal'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <BasketProvider>
          {children}
          <CookieBanner />
        </BasketProvider>
        <GoogleAnalytics />
        <SmoothScroll />
        <ScrollReveal />
      </body>
    </html>
  )
}
