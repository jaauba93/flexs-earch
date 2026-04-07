import type { Metadata } from 'next'
import './globals.css'
import { BasketProvider } from '@/lib/context/BasketContext'
import CookieBanner from '@/components/ui/CookieBanner'
import GoogleAnalytics from '@/components/ui/GoogleAnalytics'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flex.colliers.pl'),
  title: {
    default: 'Colliers Flex — Biura serwisowane w Polsce',
    template: '%s | Colliers Flex',
  },
  description: 'Wyszukiwarka biur serwisowanych i coworkingów w Polsce. Porównaj oferty, sprawdź ceny i uzyskaj rekomendację doradcy Colliers.',
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'Colliers Flex',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
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
      </body>
    </html>
  )
}
