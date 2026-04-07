import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Polityka prywatności' }

export default function PolitykaPrywatnosci() {
  return (
    <>
      <Header />
      <div className="container-colliers py-16 max-w-3xl">
        <h1 className="heading-serif text-3xl mb-8" style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
          Polityka prywatności
        </h1>
        <div className="prose max-w-none text-[var(--colliers-gray)] space-y-4">
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
          <p className="text-sm italic">Treść polityki prywatności zostanie dostarczona przez Colliers International Poland sp. z o.o.</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
