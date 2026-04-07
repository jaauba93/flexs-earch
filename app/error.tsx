'use client'

import Link from 'next/link'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="overline mb-4">Błąd 500</p>
      <h1 className="heading-serif text-4xl mb-4" style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
        Wystąpił błąd
      </h1>
      <p className="text-[var(--colliers-gray)] mb-8 max-w-md">
        Przepraszamy, coś poszło nie tak. Spróbuj odświeżyć stronę lub wróć do wyszukiwarki.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button onClick={reset} className="btn-primary">Odśwież stronę</button>
        <Link href="/biura-serwisowane" className="btn-outline">Wróć do wyszukiwarki</Link>
      </div>
    </div>
  )
}
