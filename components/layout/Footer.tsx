import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--colliers-navy)' }} className="text-white">
      <div className="container-colliers py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <Image
              src="/images/logo-dark.png"
              alt="Colliers"
              width={160}
              height={40}
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-white/70 max-w-sm">
              Colliers Flex — dedykowana wyszukiwarka biur serwisowanych w Polsce.
            </p>
          </div>
          <nav className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm">
            <Link href="/biura-serwisowane" className="text-white/80 hover:text-white transition-colors">
              Biura serwisowane
            </Link>
            <Link href="/porownaj" className="text-white/80 hover:text-white transition-colors">
              Porównywarka
            </Link>
            <Link href="/polityka-prywatnosci" className="text-white/80 hover:text-white transition-colors">
              Polityka prywatności
            </Link>
            <Link href="/polityka-cookies" className="text-white/80 hover:text-white transition-colors">
              Polityka cookies
            </Link>
          </nav>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-xs text-white/50">
          © {new Date().getFullYear()} Colliers International Poland sp. z o.o. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  )
}
