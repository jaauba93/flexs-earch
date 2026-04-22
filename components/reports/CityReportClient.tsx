'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import MapView from '@/components/search/MapView'
import ListingCard from '@/components/search/ListingCard'
import { useCurrencyContext } from '@/lib/context/CurrencyContext'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { formatPriceShort } from '@/lib/currency/currency'
import { getContentMessage } from '@/lib/i18n/runtime'
import { withLocalePath } from '@/lib/i18n/routing'
import {
  CITY_REPORT_ORDER,
  CITY_REPORTS,
  toScoreValue,
  type CityReportData,
} from '@/lib/reports/cityReports'
import type { Listing, Operator } from '@/types/database'

type ListingWithOperator = Listing & { operator: Operator }

interface CityReportClientProps {
  report: CityReportData
  listings: ListingWithOperator[]
}

function heroBackground(slug: CityReportData['citySlug']) {
  const palette: Record<CityReportData['citySlug'], string> = {
    warszawa: 'radial-gradient(circle at 75% 15%, rgba(28,84,244,0.3), transparent 45%), linear-gradient(180deg, #000759 0%, #12207d 100%)',
    krakow: 'radial-gradient(circle at 65% 20%, rgba(77,147,255,0.3), transparent 48%), linear-gradient(180deg, #000759 0%, #1a2c92 100%)',
    wroclaw: 'radial-gradient(circle at 70% 18%, rgba(28,84,244,0.26), transparent 45%), linear-gradient(180deg, #000759 0%, #162786 100%)',
    trojmiasto: 'radial-gradient(circle at 72% 22%, rgba(42,182,169,0.24), transparent 45%), linear-gradient(180deg, #000759 0%, #18318e 100%)',
    poznan: 'radial-gradient(circle at 72% 22%, rgba(77,147,255,0.25), transparent 45%), linear-gradient(180deg, #000759 0%, #1b2a85 100%)',
    lodz: 'radial-gradient(circle at 70% 20%, rgba(28,84,244,0.3), transparent 48%), linear-gradient(180deg, #000759 0%, #15257f 100%)',
    katowice: 'radial-gradient(circle at 72% 22%, rgba(70,130,84,0.24), transparent 45%), linear-gradient(180deg, #000759 0%, #1a2d8f 100%)',
  }
  return palette[slug]
}

function scorePalette(value: number) {
  if (value >= 75) {
    return {
      text: '#468254',
      gradient: 'linear-gradient(90deg, #2a5f36 0%, #468254 60%, #7fb58b 100%)',
    }
  }
  if (value >= 50) {
    return {
      text: '#9f7b00',
      gradient: 'linear-gradient(90deg, #7a5d00 0%, #b88c00 55%, #ffd447 100%)',
    }
  }
  return {
    text: '#b1262f',
    gradient: 'linear-gradient(90deg, #82131e 0%, #b1262f 55%, #ef5a66 100%)',
  }
}

function compactLabel(label: string): string {
  return label === 'n/a' ? 'n/d' : label
}

export default function CityReportClient({ report, listings }: CityReportClientProps) {
  const { currency, rates } = useCurrencyContext()
  const { locale } = useLocaleContext()
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const topListings = useMemo(() => {
    return [...listings]
      .sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        const aPrice = a.price_desk_private ?? Number.MAX_SAFE_INTEGER
        const bPrice = b.price_desk_private ?? Number.MAX_SAFE_INTEGER
        return aPrice - bPrice
      })
      .slice(0, 8)
  }, [listings])

  const scoreGrowth = toScoreValue(report.scoreGrowth)
  const scorePricing = toScoreValue(report.scorePricing)
  const scoreAvailability = toScoreValue(report.scoreAvailability)
  const t = (key: string, fallback?: string) => getContentMessage(locale, key, fallback)

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <main className="bg-white">
        <section className="pt-32 pb-24 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div data-reveal="left">
              <p className="overline mb-6">{t(`report.${report.citySlug}.hero.eyebrow`, report.heroEyebrow)}</p>
              <h1
                className="text-[#000759] leading-[1.05] mb-6"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.2rem,4.7vw,4rem)' }}
              >
                {t(`report.${report.citySlug}.hero.title`, report.heroH1)}
              </h1>
              <p className="text-body-strong text-lg leading-relaxed mb-9">{t(`report.${report.citySlug}.hero.lead`, report.heroLead)}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="border border-[#dce4f7] bg-white px-4 py-3">
                  <p className="text-[#000759] text-2xl font-normal">{report.kpiOffices}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#6d7da7]">{t(`report.${report.citySlug}.snapshot.offices_label`, 'Liczba biur')}</p>
                </div>
                <div className="border border-[#dce4f7] bg-white px-4 py-3">
                  <p className="text-[#000759] text-2xl font-normal">{report.kpiSupply}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#6d7da7]">{t(`report.${report.citySlug}.snapshot.supply_label`, 'Powierzchnia')}</p>
                </div>
                <div className="border border-[#dce4f7] bg-white px-4 py-3">
                  <p className="text-[#000759] text-2xl font-normal">{report.kpiOccupancy}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#6d7da7]">{t(`report.${report.citySlug}.snapshot.occupancy_label`, 'Zajętość')}</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden border border-[#d8e2fb] min-h-[420px]" data-reveal="right">
              <div className="absolute inset-0" style={{ background: heroBackground(report.citySlug) }} />
              <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.32) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
              <div className="relative z-10 text-white p-7 md:p-8 flex h-full items-end">
                <div className="w-full bg-white/12 border border-white/25 backdrop-blur px-5 py-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#cfe4ff] mb-2">{t(`report.${report.citySlug}.hero.placeholder`, report.heroImagePlaceholder)}</p>
                  <h3 className="text-2xl font-normal mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                    {t(`report.${report.citySlug}.hero.positioning_headline`, report.positioningHeadline)}
                  </h3>
                  <p className="text-white/88 text-sm leading-relaxed">{t(`report.${report.citySlug}.hero.positioning_text`, report.positioningText)}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#f8fbff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-7">{t(`report.${report.citySlug}.snapshot.eyebrow`, 'Snapshot rynku')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {[
                { label: t(`report.${report.citySlug}.snapshot.offices_label`, 'Liczba biur'), value: String(report.kpiOffices) },
                { label: t(`report.${report.citySlug}.snapshot.supply_label`, 'Powierzchnia flex'), value: report.kpiSupply },
                { label: t(`report.${report.citySlug}.snapshot.occupancy_label`, 'Szacowana zajętość'), value: report.kpiOccupancy },
                {
                  label: t(`report.${report.citySlug}.snapshot.prices_label`, 'Ceny orientacyjne'),
                  value: `${formatPriceShort(report.prices.privateCenter, currency, rates)} / ${formatPriceShort(
                    report.prices.privateNonCenter,
                    currency,
                    rates
                  )}`,
                },
              ].map((item) => (
                <div key={item.label} className="surface-panel-soft p-5 hover:shadow-[0_16px_42px_rgba(0,7,89,0.1)] transition-shadow">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.16em] text-[#5c6b95]">{item.label}</p>
                  <p className="text-[#000759] text-2xl font-normal leading-tight">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: t(`report.${report.citySlug}.scores.growth_label`, 'Dynamika rozwoju'), value: scoreGrowth, raw: report.scoreGrowth },
                { label: t(`report.${report.citySlug}.scores.pricing_label`, 'Wzrost stawek'), value: scorePricing, raw: report.scorePricing },
                { label: t(`report.${report.citySlug}.scores.availability_label`, 'Dostępność powierzchni'), value: scoreAvailability, raw: report.scoreAvailability },
              ].map((item) => (
                <div key={item.label} className="border border-[#dce5fa] bg-white p-4">
                  <div className="flex justify-between text-[11px] uppercase tracking-[0.16em] mb-3">
                    <span className="text-[#5d6d97]">{item.label}</span>
                    <span style={{ color: scorePalette(item.value).text }} className="font-bold">
                      {item.raw}
                    </span>
                  </div>
                  <div className="h-2 bg-[#edf2fd] overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${item.value}%`,
                        background: scorePalette(item.value).gradient,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-10">
            <div data-reveal="left">
              <p className="overline mb-5">{t(`report.${report.citySlug}.market.eyebrow`, 'O rynku')}</p>
              <h2 className="text-[#000759] text-4xl font-normal mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
                {t(`report.${report.citySlug}.market.title`, `Charakterystyka rynku ${report.cityName}`)}
              </h2>
              <p className="text-body-strong leading-relaxed mb-4">{t(`report.${report.citySlug}.hero.lead`, report.heroLead)}</p>
              <p className="text-body-strong leading-relaxed mb-4">{t(`report.${report.citySlug}.hero.positioning_text`, report.positioningText)}</p>
              <p className="text-body-strong leading-relaxed">
                {report.marketStructureText}
              </p>
            </div>

            <aside className="surface-panel-soft p-6" data-reveal="right">
              <p className="overline mb-5">{t(`report.${report.citySlug}.key_facts.eyebrow`, 'Kluczowe fakty')}</p>
              <ul className="space-y-3">
                {report.keyFacts.map((fact, idx) => (
                  <li key={idx} className="text-body-strong flex gap-3 text-sm leading-relaxed" data-reveal={`d${Math.min(idx + 1, 4)}`}>
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#1C54F4] shrink-0" />
                    <span>{t(`report.${report.citySlug}.key_fact.${idx + 1}`, fact)}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="overline mb-3">{t(`report.${report.citySlug}.map.eyebrow`, 'Mapa ofert')}</p>
                <h2 className="text-[#000759] text-4xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                  {t(`report.${report.citySlug}.map.title`, `Oferty biur elastycznych w ${report.cityName}`)}
                </h2>
              </div>
              <Link href={withLocalePath(locale, `/biura-serwisowane/${report.citySlug}`)} className="cta-link">
                {t(`report.${report.citySlug}.map.cta`, 'Przejdź do wyszukiwarki →')}
              </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
              <div className="border border-[#dbe4f8] bg-white h-[560px]" data-reveal="left">
                <MapView
                  listings={topListings}
                  highlightedId={highlightedId}
                  onMarkerClick={(id) => setHighlightedId(id)}
                  initialCity={report.citySlug}
                  showDistrictGrid={false}
                  showMetroLines={false}
                  showOverlayControls={false}
                />
              </div>
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1" data-reveal="right" data-lenis-prevent>
                {topListings.length === 0 && (
                  <div className="surface-panel-soft p-6 text-body-muted text-sm">
                    {t(`report.${report.citySlug}.map.empty`, 'Brak aktywnych ofert z geolokalizacją dla tego rynku.')}
                  </div>
                )}
                {topListings.map((listing) => (
                  <div
                    key={listing.id}
                    onMouseEnter={() => setHighlightedId(listing.id)}
                    onMouseLeave={() => setHighlightedId((current) => (current === listing.id ? null : current))}
                  >
                    <ListingCard listing={listing} highlighted={highlightedId === listing.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-5">Ceny orientacyjne</p>
            <h2 className="text-[#000759] text-4xl font-normal mb-7" style={{ fontFamily: 'var(--font-serif)' }}>
              Ceny i interpretacja
            </h2>
            <div className="overflow-x-auto border border-[#dbe4f8] bg-white">
              <table className="w-full min-w-[680px]">
                <tbody>
                  {[
                    ['Hot desk · centrum', formatPriceShort(report.prices.hotdeskCenter, currency, rates)],
                    ['Hot desk · poza centrum', formatPriceShort(report.prices.hotdeskNonCenter, currency, rates)],
                    ['Prywatne biuro · centrum', formatPriceShort(report.prices.privateCenter, currency, rates)],
                    ['Prywatne biuro · poza centrum', formatPriceShort(report.prices.privateNonCenter, currency, rates)],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-[#eef2fb]">
                      <td className="px-5 py-4 text-body-muted text-sm">{label}</td>
                      <td className="px-5 py-4 text-[#000759] text-xl font-normal">{compactLabel(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-body-muted text-sm mt-3">{report.prices.note}</p>
            <div className="mt-6 border border-[#dbe4f8] bg-[#f8fbff] p-5">
              <p className="text-[#000759] font-semibold mb-2">Komentarz rynkowy</p>
              <p className="text-body-strong leading-relaxed">{report.prices.commentary}</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#f8fbff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-5">Komentarz ekspercki</p>
            <blockquote className="border-l-2 border-[#1C54F4] pl-6 md:pl-8">
              <p className="text-[#000759] text-3xl md:text-4xl font-normal leading-tight mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                „{report.expertQuoteWeb}”
              </p>
              <footer className="text-body-muted">
                <p className="font-semibold text-[#000759]">{report.expertName}</p>
                <p className="text-sm">{report.expertRole}</p>
              </footer>
            </blockquote>
          </div>
        </section>

        <section className="py-20 bg-[#000759] text-white" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-5">Działaj dalej</p>
            <h2 className="text-white text-4xl font-normal mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
              Wybierz kolejny krok dla rynku {report.cityName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={withLocalePath(locale, `/biura-serwisowane/${report.citySlug}`)} className="border border-white/25 p-5 hover:bg-white hover:text-[#000759] transition-colors">
                <p className="text-sm mb-3">Zobacz oferty w {report.cityName}</p>
                <span className="text-[11px] uppercase tracking-[0.17em] font-bold">Przejdź do listy →</span>
              </Link>
              <Link href={withLocalePath(locale, '/porownaj')} className="border border-white/25 p-5 hover:bg-white hover:text-[#000759] transition-colors">
                <p className="text-sm mb-3">Dodaj lokalizacje do porównania</p>
                <span className="text-[11px] uppercase tracking-[0.17em] font-bold">Otwórz porównywarkę →</span>
              </Link>
              <button
                onClick={() => setFormOpen(true)}
                className="border border-white/25 text-left p-5 hover:bg-white hover:text-[#000759] transition-colors"
              >
                <p className="text-sm mb-3">Porozmawiaj z doradcą</p>
                <span className="text-[11px] uppercase tracking-[0.17em] font-bold">Skontaktuj się →</span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-sm">
              <span className="text-white/78">Pozostałe raporty:</span>
              {CITY_REPORT_ORDER.filter((slug) => slug !== report.citySlug).map((slug) => (
                <Link key={slug} href={withLocalePath(locale, `/raporty-miejskie/${slug}`)} className="text-[#9ec2ff] hover:text-white transition-colors">
                  {CITY_REPORTS[slug].cityName}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      {formOpen && <ContactForm onClose={() => setFormOpen(false)} />}
      {wizardOpen && <OfficeModelWizard onClose={() => setWizardOpen(false)} />}
    </>
  )
}
