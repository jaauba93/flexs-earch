'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import PolandOverviewMap from '@/components/maps/PolandOverviewMap'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { getContentMessage } from '@/lib/i18n/runtime'
import {
  CITY_REPORT_ORDER,
  CITY_REPORTS,
  type CityReportSlug,
} from '@/lib/reports/cityReports'

export default function ReportsHubClient() {
  const { locale } = useLocaleContext()
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [activeCity, setActiveCity] = useState<CityReportSlug>('warszawa')
  const active = CITY_REPORTS[activeCity]
  const t = (key: string, fallback?: string) => getContentMessage(locale, key, fallback)

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <main className="bg-white">
        <section className="pt-32 pb-24 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div data-reveal="left">
              <p className="overline mb-6">{t('reports_hub.hero.eyebrow', 'Raporty miejskie')}</p>
              <h1
                className="text-[#000759] leading-[1.05] mb-6"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.2rem,4.8vw,4rem)' }}
              >
                {t('reports_hub.hero.title', 'Raporty miejskie: biura elastyczne w największych miastach Polski')}
              </h1>
              <p className="text-body-strong text-lg leading-relaxed mb-10">
                {t('reports_hub.hero.lead', 'Porównaj skalę rynku, strukturę operatorów, poziom cen i dostępność powierzchni flex w kluczowych ośrodkach biurowych.')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/raporty-miejskie/${activeCity}`} className="btn-primary inline-flex items-center gap-2">
                  {t('reports_hub.hero.open_report_prefix', 'Otwórz raport:')} {active.cityName} <ArrowRight size={14} />
                </Link>
                <Link href="/przewodnik-flex" className="btn-outline">
                  {t('reports_hub.hero.back_to_guide', 'Wróć do Przewodnika Flex')}
                </Link>
              </div>
            </div>

            <div className="surface-panel-soft relative overflow-hidden p-7 md:p-8" data-reveal="right">
              <div className="absolute inset-0 opacity-45" style={{ backgroundImage: 'linear-gradient(rgba(28,84,244,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(28,84,244,0.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C54F4] mb-5">{t('reports_hub.map.placeholder_label', 'Mapa Polski · rynki raportowe')}</p>
                <div className="relative h-[350px] border border-[#d4e0fb] bg-[#fbfcff]">
                  <PolandOverviewMap activeCity={activeCity} onActiveCityChange={setActiveCity} showCard={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-7">{t('reports_hub.cities.eyebrow', 'Miasta')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {CITY_REPORT_ORDER.map((slug, idx) => {
                const city = CITY_REPORTS[slug]
                return (
                  <Link
                    key={slug}
                    href={`/raporty-miejskie/${slug}`}
                    onMouseEnter={() => setActiveCity(slug)}
                    className="surface-panel-soft group p-6 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_22px_60px_rgba(0,7,89,0.12)]"
                    data-reveal={`d${(idx % 3) + 1}`}
                  >
                    <p className="mb-2 text-2xl font-normal text-[#000759]">{city.cityName}</p>
                    <p className="text-body-muted mb-5 text-sm leading-relaxed">{city.positioningHeadline}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="border border-[#e2e8f7] py-2 px-1">
                        <p className="text-[#000759] font-semibold text-sm">{city.kpiOffices}</p>
                        <p className="eyebrow-label text-[10px]">Biura</p>
                      </div>
                      <div className="border border-[#e2e8f7] py-2 px-1">
                        <p className="text-[#000759] font-semibold text-sm">{city.kpiSupply.replace(' m²', '')}</p>
                        <p className="eyebrow-label text-[10px]">m²</p>
                      </div>
                      <div className="border border-[#e2e8f7] py-2 px-1">
                        <p className="text-[#000759] font-semibold text-sm">{city.kpiOccupancy}</p>
                        <p className="eyebrow-label text-[10px]">Zajętość</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#f8fbff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-7">{t('reports_hub.compare.eyebrow', 'Porównanie rynków')}</p>
            <div className="overflow-x-auto border border-[#d9e4fa] bg-white">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-[#e7e8ea]">
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-[#1C54F4]">{t('reports_hub.compare.col_city', 'Miasto')}</th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-[#1C54F4]">{t('reports_hub.compare.col_supply', 'Powierzchnia')}</th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-[#1C54F4]">{t('reports_hub.compare.col_occupancy', 'Zajętość')}</th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-[#1C54F4]">{t('reports_hub.compare.col_offices', 'Liczba biur')}</th>
                    <th className="px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-[#1C54F4]">{t('reports_hub.compare.col_market', 'Charakter rynku')}</th>
                  </tr>
                </thead>
                <tbody>
                  {CITY_REPORT_ORDER.map((slug) => {
                    const city = CITY_REPORTS[slug]
                    return (
                      <tr key={slug} className="border-b border-[#eef2fb] hover:bg-[#f8faff] transition-colors">
                        <td className="px-5 py-4 font-semibold text-[#000759]">
                          <Link href={`/raporty-miejskie/${slug}`} className="hover:text-[#1C54F4] transition-colors">
                            {city.cityName}
                          </Link>
                        </td>
                        <td className="text-body-strong px-5 py-4">{city.kpiSupply}</td>
                        <td className="text-body-strong px-5 py-4">{city.kpiOccupancy}</td>
                        <td className="text-body-strong px-5 py-4">{city.kpiOffices}</td>
                        <td className="text-body-muted px-5 py-4 text-sm">{city.marketStructureText}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#000759] text-white" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{t('reports_hub.next.eyebrow', 'Kolejny krok')}</p>
            <h2 className="mb-5 text-4xl font-normal text-white" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('reports_hub.next.title', 'Przejdź od danych do decyzji')}
            </h2>
            <p className="max-w-3xl mb-8 text-white/84">
              {t('reports_hub.next.body', 'Sprawdź porównanie modeli biura i koszty, a jeśli potrzebujesz, przejdź przez analizę rynku z doradcą Colliers.')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/porownaj" className="btn-primary-bright inline-flex items-center gap-2">
                {t('reports_hub.next.primary_cta', 'Przejdź do porównywarki')} <ArrowRight size={14} />
              </Link>
              <button onClick={() => setFormOpen(true)} className="btn-outline border-white/35 text-white hover:bg-white hover:text-[#000759]">
                {t('reports_hub.next.secondary_cta', 'Porozmawiaj z doradcą')}
              </button>
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
