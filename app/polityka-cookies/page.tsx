import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Polityka cookies' }

export default function PolitykaCookies() {
  return (
    <>
      <Header />
      <div className="container-colliers py-16 max-w-3xl">
        <h1 className="heading-serif text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
          Polityka cookies
        </h1>
        <div className="text-[var(--colliers-gray)] space-y-4">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Strona korzysta z plików cookies w celu zapewnienia prawidłowego działania oraz analityki.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Pliki cookies niezbędne są wymagane do działania serwisu.</p>
          <p>Pliki cookies analityczne (Google Analytics) są używane wyłącznie za Twoją zgodą.</p>
          <p className="text-sm italic">Treść polityki cookies zostanie dostarczona przez Colliers International Poland sp. z o.o.</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
