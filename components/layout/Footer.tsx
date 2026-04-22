'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { getPublicMessage } from '@/lib/i18n/runtime'
import { withLocalePath } from '@/lib/i18n/routing'

export default function Footer() {
  const year = new Date().getFullYear()
  const { locale } = useLocaleContext()

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
              width={1572}
              height={896}
              className="h-auto w-[128px]"
            />
            <p className="max-w-xs text-xs font-normal leading-relaxed uppercase tracking-wider text-white/72">
              {getPublicMessage(locale, 'footer.tagline')}
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20">
            <div className="flex flex-col gap-5">
              <span className="overline">{getPublicMessage(locale, 'footer.platform')}</span>
              <Link href={withLocalePath(locale, '/biura-serwisowane')} className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">{getPublicMessage(locale, 'footer.searchOffices')}</Link>
              <Link href={withLocalePath(locale, '/porownaj')} className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">{getPublicMessage(locale, 'footer.compare')}</Link>
            </div>
            <div className="flex flex-col gap-5">
              <span className="overline">{getPublicMessage(locale, 'footer.privacy')}</span>
              <Link href={withLocalePath(locale, '/polityka-prywatnosci')} className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">{getPublicMessage(locale, 'footer.privacyPolicy')}</Link>
              <Link href={withLocalePath(locale, '/polityka-cookies')} className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">{getPublicMessage(locale, 'footer.cookies')}</Link>
            </div>
            <div className="flex flex-col gap-5">
              <span className="overline">{getPublicMessage(locale, 'footer.contact')}</span>
              <a href="mailto:flex@colliers.pl" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">flex@colliers.pl</a>
              <a href="tel:+48223317800" className="text-[11px] uppercase tracking-widest text-white/78 hover:text-white transition-colors">+48 22 331 78 00</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-white/36">
          <p>© {year} Colliers Flex. {getPublicMessage(locale, 'footer.rightsReserved')}</p>
          <span>{getPublicMessage(locale, 'footer.country')}</span>
        </div>
      </div>
    </footer>
  )
}
