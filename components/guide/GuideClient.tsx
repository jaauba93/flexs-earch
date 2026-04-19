'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, Calculator, MapPin, Network, SlidersHorizontal } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import PolandOverviewMap from '@/components/maps/PolandOverviewMap'
import { CITY_REPORT_ORDER, CITY_REPORTS, type CityReportSlug } from '@/lib/reports/cityReports'

const basics = [
  {
    id: 'czym-sa-biura-elastyczne',
    number: '01',
    title: 'Czym są biura elastyczne',
    copy: 'Poznaj definicję rynku, główne formaty najmu i różnice między flexem, coworkingiem i biurem tradycyjnym.',
  },
  {
    id: 'modele-biur-elastycznych',
    number: '02',
    title: 'Modele biur elastycznych',
    copy: 'Od hot desku po dedykowaną przestrzeń z brandingiem — zobacz, który model odpowiada skali i kulturze pracy Twojej firmy.',
  },
  {
    id: 'kiedy-warto-wybrac-flex',
    number: '03',
    title: 'Kiedy warto wybrać flex',
    copy: 'Sprawdź, w jakich sytuacjach biuro elastyczne daje największą przewagę: przy ekspansji, relokacji, wzroście zespołu lub pracy projektowej.',
  },
  {
    id: 'flex-a-najem-tradycyjny',
    number: '04',
    title: 'Flex a najem tradycyjny',
    copy: 'Porównaj czas wejścia, CAPEX, skalowalność, zakres usług i ryzyka związane z oboma modelami.',
  },
  {
    id: 'jak-wybrac-biuro-flex',
    number: '05',
    title: 'Jak wybrać biuro flex',
    copy: 'Zobacz pytania, które warto zadać przed wyborem: liczba użytkowników, lokalizacja, prywatność, plan wzrostu i oczekiwany standard.',
  },
]

const cities = CITY_REPORT_ORDER.map((slug) => ({
  key: slug,
  label: CITY_REPORTS[slug].cityName,
  href: `/raporty-miejskie/${slug}`,
  teaser: CITY_REPORTS[slug].positioningHeadline,
  metric: CITY_REPORTS[slug].kpiSupply,
}))

const toolCards = [
  {
    title: 'Kalkulator kosztów',
    copy: 'Oszacuj orientacyjny koszt biura dla swojego zespołu i zobacz, jak różne założenia wpływają na budżet.',
    cta: 'Uruchom kalkulator',
    href: '/kalkulator-flex',
    icon: Calculator,
  },
  {
    title: 'Dobierz model biura',
    copy: 'Odpowiedz na kilka pytań i sprawdź, czy w Twoim przypadku bardziej racjonalny będzie flex, najem tradycyjny czy model hybrydowy.',
    cta: 'Porównaj modele',
    href: '/porownaj#porownanie-modeli',
    icon: SlidersHorizontal,
  },
]

function formatNumber(value: number) {
  return value.toLocaleString('pl-PL')
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    let raf = 0
    const duration = 1100
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active])

  return value
}

export default function GuideClient() {
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [activeCity, setActiveCity] = useState<CityReportSlug>('warszawa')
  const [kpiVisible, setKpiVisible] = useState(false)
  const kpiRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = kpiRef.current
    if (!section) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setKpiVisible(true)
      },
      { threshold: 0.35 }
    )
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  const count420 = useCountUp(420000, kpiVisible)
  const count235 = useCountUp(235000, kpiVisible)
  const count71 = useCountUp(71000, kpiVisible)

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <main className="bg-white">
        <section className="pt-32 pb-24 bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div data-reveal="left">
              <p className="overline mb-6">Przewodnik Flex</p>
              <h1
                className="text-[#000759] leading-[1.05] mb-6"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 4.4rem)' }}
              >
                Przewodnik po biurach elastycznych
              </h1>
              <p className="text-body-strong text-lg leading-relaxed mb-6">
                Modele najmu, różnice względem biura tradycyjnego, praktyczne kryteria wyboru i raporty miejskie dla największych rynków w Polsce. Wszystko w jednym miejscu.
              </p>
              <p className="text-body-muted text-[1rem] leading-relaxed mb-10 max-w-2xl">
                Biuro flex to dziś nie tylko coworking. To szerokie spektrum rozwiązań — od hot desku po dedykowane moduły z brandingiem, własną recepcją i rozbudowanym zakresem usług. To ważne, bo raport pokazuje, że segment w Polsce przekroczył już 420 tys. m², a na największych rynkach udział flex sięga około 3–4% nowoczesnej podaży biurowej.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="#podstawy-flex" className="btn-primary inline-flex items-center gap-2">
                  Zacznij od podstaw <ArrowRight size={14} />
                </Link>
                <Link href="#raporty-miejskie" className="btn-outline inline-flex items-center gap-2">
                  Sprawdź raporty miejskie <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div data-reveal="right">
              <div className="surface-panel-soft relative overflow-hidden p-8 lg:p-10">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(28,84,244,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(28,84,244,0.08) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
                <div className="absolute -top-12 -right-16 w-64 h-64 rounded-full bg-[#1C54F4]/10 blur-2xl animate-pulse" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                    <span>Placeholder 01</span>
                    <span>Editorial flex collage</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[#000759]">
                    {['private office', 'hot desk', 'Warszawa', 'TCO'].map((tag) => (
                      <div key={tag} className="border border-[#d9e4ff] px-3 py-2 text-[11px] uppercase tracking-[0.16em] bg-white/70">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-[#1C54F4] via-[#4D93FF] to-transparent" />
                  <div className="flex items-center gap-3 text-[#62729d] text-sm">
                    <Network size={16} />
                    <span>Linie łączące: model najmu → koszty → rynek miejski</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="filary" className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-8">Szybka nawigacja</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: 'Podstawy flex',
                  copy: 'Zrozum, czym są biura elastyczne, jakie modele masz do wyboru i kiedy flex realnie wygrywa z tradycyjnym najmem.',
                  href: '#podstawy-flex',
                  icon: Building2,
                },
                {
                  title: 'Raporty miejskie',
                  copy: 'Sprawdź dane, dynamikę i charakterystykę najważniejszych rynków biur elastycznych w Polsce.',
                  href: '#raporty-miejskie',
                  icon: MapPin,
                },
                {
                  title: 'Narzędzia',
                  copy: 'Porównaj modele, oszacuj koszty i zawęź wybór szybciej dzięki praktycznym narzędziom.',
                  href: '#narzedzia',
                  icon: SlidersHorizontal,
                },
              ].map((card, idx) => {
                const Icon = card.icon
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="surface-panel-soft group relative p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,7,89,0.12)]"
                    data-reveal={`d${idx + 1}`}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,rgba(28,84,244,0.12),transparent_45%)]" />
                    <Icon size={20} className="text-[#1C54F4] mb-5" />
                    <h3 className="text-[#000759] text-2xl font-normal mb-4 group-hover:translate-x-1 transition-transform duration-300">{card.title}</h3>
                    <p className="text-body-muted text-sm leading-relaxed mb-6">{card.copy}</p>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] inline-flex items-center gap-2">
                      Przejdź dalej <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section ref={kpiRef} className="py-24 bg-[#f8faff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-12 items-start">
            <div data-reveal="left">
              <p className="overline mb-6">Dlaczego teraz</p>
              <h2 className="text-[#000759] leading-tight mb-6" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(1.8rem,3.2vw,3rem)' }}>
                Rynek flex dojrzał. Decyzja stała się bardziej strategiczna niż doraźna.
              </h2>
              <p className="text-body-strong leading-relaxed">
                Elastyczne biura przestały być formatem kojarzonym wyłącznie z coworkingiem. Dziś są elementem strategii najmu dla firm, które chcą szybciej uruchamiać biura, ograniczać CAPEX, lepiej reagować na zmiany zatrudnienia i korzystać z gotowego środowiska pracy. Raport wskazuje, że w siedmiu największych miastach Polski całkowita podaż flex przekracza 420 tys. m², z najwyższą skalą w Warszawie, Krakowie i Wrocławiu.
              </p>
            </div>

            <div className="space-y-4" data-reveal="right">
              <div className="surface-panel-soft relative p-6">
                <p className="text-[#000759] text-4xl font-normal mb-2">{formatNumber(count420)}+</p>
                <p className="text-body-muted text-sm">m² elastycznej powierzchni w 7 największych miastach</p>
              </div>
              <div className="surface-panel-soft relative p-6">
                <p className="text-[#000759] text-4xl font-normal mb-2">{formatNumber(count235)} m²</p>
                <p className="text-body-muted text-sm">w Warszawie</p>
              </div>
              <div className="surface-panel-soft relative p-6">
                <p className="text-[#000759] text-4xl font-normal mb-2">{formatNumber(count71)} m²</p>
                <p className="text-body-muted text-sm">w Krakowie</p>
              </div>
            </div>
          </div>
        </section>

        <section id="podstawy-flex" className="py-24 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-5">Podstawy flex</p>
            <h2 className="text-[#000759] mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2rem,3.8vw,3.4rem)' }}>
              Od czego zacząć?
            </h2>
            <p className="text-body-muted max-w-3xl mb-10">
              Jeśli dopiero porządkujesz temat, zacznij od pięciu zagadnień, które najczęściej decydują o wyborze modelu biura.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {basics.map((item, idx) => (
                <article
                  id={item.id}
                  key={item.id}
                  className="surface-panel-soft group relative p-7 min-h-[240px] transition-all duration-500 hover:shadow-[0_22px_64px_rgba(0,7,89,0.11)] hover:-translate-y-1"
                  data-reveal={`d${(idx % 3) + 1}`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_80%_20%,rgba(28,84,244,0.1),transparent_55%)]" />
                  <p className="text-[#1C54F4] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">{item.number}</p>
                  <h3 className="text-[#000759] text-[1.45rem] font-normal leading-tight mb-4">{item.title}</h3>
                  <p className="text-body-muted text-sm leading-relaxed mb-7">{item.copy}</p>
                  <Link href={`/podstawy-flex/${item.id}`} className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] inline-flex items-center gap-2">
                    Rozwiń temat <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="raporty-miejskie" className="py-24 bg-[#f8faff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-5">Raporty miejskie</p>
            <h2 className="text-[#000759] mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2rem,3.8vw,3.4rem)' }}>
              Najważniejsze rynki miejskie
            </h2>
            <p className="text-body-muted max-w-4xl mb-12">
              Sytuacja na rynku flex nie wygląda tak samo w każdym mieście. Różnią się skala podaży, dostępność modułów, poziom zajętości, struktura operatorów i relacja kosztu do standardu.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
              <div className="border border-[#dbe4f8] bg-white p-6 md:p-8 relative overflow-hidden" data-reveal="left">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(28,84,244,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,84,244,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C54F4] mb-5">Mapa Polski · rynki raportowe</p>
                  <div className="relative h-[360px] border border-[#dce5fa] bg-[#fbfcff]">
                    <PolandOverviewMap activeCity={activeCity} onActiveCityChange={setActiveCity} />
                  </div>
                </div>
              </div>

              <div className="space-y-3" data-reveal="right">
                {cities.map((city) => (
                  <Link
                    key={city.key}
                    href={city.href}
                    onMouseEnter={() => setActiveCity(city.key)}
                    className={`block border px-5 py-4 transition-all ${
                      activeCity === city.key
                        ? 'border-[#1C54F4] bg-white shadow-[0_10px_26px_rgba(0,7,89,0.08)]'
                        : 'border-[#dbe4f8] bg-white hover:border-[#9cb8fa]'
                    }`}
                  >
                    <p className="text-[#000759] text-lg font-normal mb-1">{city.label}</p>
                    <p className="text-body-muted text-sm leading-relaxed">{city.teaser}</p>
                  </Link>
                ))}
              </div>
            </div>

            <p className="text-body-muted mt-10 max-w-4xl">
              Warszawa pozostaje największym i najbardziej dojrzałym rynkiem flex w Polsce, Kraków jest liderem regionalnym, a Wrocław należy do najszybciej rosnących rynków poza stolicą. Raport pokazuje też wyraźne różnice w poziomie podaży i zajętości między miastami.
            </p>
          </div>
        </section>

        <section id="narzedzia" className="py-24 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-5">Narzędzia</p>
            <h2 className="text-[#000759] mb-10" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2rem,3.8vw,3.3rem)' }}>
              Przejdź od wiedzy do decyzji
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.85fr] gap-5">
              {toolCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="surface-panel-soft group p-7 lg:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,7,89,0.12)]"
                    data-reveal={`d${index + 1}`}
                  >
                    <div className="flex items-center justify-between mb-7">
                      <Icon size={22} className="text-[#1C54F4]" />
                      <span className="eyebrow-label text-[10px]">Mock UI</span>
                    </div>
                    <h3 className="text-[#000759] text-2xl font-normal mb-4">{card.title}</h3>
                    <p className="text-body-muted text-sm leading-relaxed mb-7">{card.copy}</p>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] inline-flex items-center gap-2">
                      {card.cta} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )
              })}

              <div className="border border-[#1C54F4]/35 bg-[linear-gradient(180deg,#0a1175_0%,#000759_100%)] text-white p-7 lg:p-8" data-reveal="d3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9cb9ff] mb-6">CTA</p>
                <h3 className="text-2xl font-normal mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Porozmawiaj z doradcą</h3>
                <p className="text-white/84 text-sm leading-relaxed mb-7">
                  Jeśli wolisz przejść przez rynek z ekspertem, pomożemy zawęzić wybór i porównać oferty bez dodatkowego kosztu po Twojej stronie.
                </p>
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="btn-primary-bright w-full justify-center"
                >
                  Umów rozmowę
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#000759] text-white relative overflow-hidden" data-reveal>
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'linear-gradient(rgba(77,147,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(77,147,255,0.18) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
          <div className="container-colliers relative z-10">
            <p className="overline mb-5">Kolejny krok</p>
            <h2 className="text-white mb-5" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2rem,3.8vw,3.4rem)' }}>
              Nie musisz zaczynać od pełnego briefu.
            </h2>
            <p className="text-white/84 max-w-3xl leading-relaxed mb-10">
              Możesz zacząć od podstaw, sprawdzić rynek w wybranym mieście albo od razu porównać modele i koszty. Jeśli wolisz, przeprowadzimy Cię przez ten proces wspólnie.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/kalkulator-flex" className="btn-primary-bright inline-flex items-center gap-2">
                Uruchom kalkulator <ArrowRight size={14} />
              </Link>
              <button type="button" onClick={() => setFormOpen(true)} className="btn-outline border-white/35 text-white hover:bg-white hover:text-[#000759]">
                Porozmawiaj z doradcą
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
