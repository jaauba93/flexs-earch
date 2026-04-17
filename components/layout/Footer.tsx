import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#000759] text-white px-8 lg:px-16 py-20 border-t border-white/5">
      <div className="w-full">
        {/* Main grid */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 border-b border-white/5 pb-16">
          {/* Logo + tagline */}
          <div className="flex flex-col gap-8">
            <Image
              src="/images/logo-colliers.png"
              alt="Colliers Flex"
              width={120}
              height={120}
              className="h-10 w-auto"
            />
            <p className="max-w-xs text-xs font-normal leading-relaxed uppercase tracking-wider text-white/72">
              Profesjonalne doradztwo w zakresie biur serwisowanych i przestrzeni coworkingowych w całej Polsce.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20">
            <div className="flex flex-col gap-5">
              <span className="overline">Platforma</span>
              <Link href="/biura-serwisowane" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">Szukaj biur</Link>
              <Link href="/porownaj" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">Porównaj</Link>
            </div>
            <div className="flex flex-col gap-5">
              <span className="overline">Prywatność</span>
              <Link href="/polityka-prywatnosci" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">Polityka prywatności</Link>
              <Link href="/polityka-cookies" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">Pliki cookies</Link>
            </div>
            <div className="flex flex-col gap-5">
              <span className="overline">Kontakt</span>
              <a href="mailto:flex@colliers.pl" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">flex@colliers.pl</a>
              <a href="tel:+48223317800" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">+48 22 331 78 00</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-white/36">
          <p>© {year} Colliers Flex. Wszelkie prawa zastrzeżone.</p>
          <span>Polska</span>
        </div>
      </div>
    </footer>
  )
}
