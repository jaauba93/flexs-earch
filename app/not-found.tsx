import Link from 'next/link'
import { cookies } from 'next/headers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { LOCALE_COOKIE_NAME } from '@/lib/context/LocaleContext'
import { DEFAULT_PUBLIC_LOCALE, PUBLIC_SITE_LOCALES } from '@/lib/i18n/messages'
import { withLocalePath } from '@/lib/i18n/routing'

export default async function NotFound() {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  const locale =
    localeCookie && PUBLIC_SITE_LOCALES.includes(localeCookie as (typeof PUBLIC_SITE_LOCALES)[number])
      ? (localeCookie as (typeof PUBLIC_SITE_LOCALES)[number])
      : DEFAULT_PUBLIC_LOCALE

  return (
    <>
      <Header />
      <div className="container-colliers py-24 text-center">
        <p className="overline mb-4">Błąd 404</p>
        <h1 className="heading-serif text-4xl mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
          Strona nie istnieje
        </h1>
        <p className="text-[var(--colliers-gray)] mb-8 max-w-md mx-auto">
          Nie znaleźliśmy szukanej strony. Sprawdź adres URL lub wróć do wyszukiwarki biur.
        </p>
        <Link href={withLocalePath(locale, '/biura-serwisowane')} className="btn-primary">
          Wróć do wyszukiwarki
        </Link>
      </div>
      <Footer />
    </>
  )
}
