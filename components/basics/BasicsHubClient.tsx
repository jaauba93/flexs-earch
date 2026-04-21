'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, MapPin, SlidersHorizontal } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { getContentMessage } from '@/lib/i18n/runtime'
import { BASICS_TOOLS_SECTION, getBasicsCards } from '@/lib/basics/flexBasics'

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

export default function BasicsHubClient() {
  const { locale } = useLocaleContext()
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [kpiVisible, setKpiVisible] = useState(false)
  const kpiRef = useRef<HTMLElement>(null)
  const cards = getBasicsCards()
  const t = (key: string, fallback?: string) => getContentMessage(locale, key, fallback)

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

  const totalSupply = useCountUp(430000, kpiVisible)

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <main className="bg-white">
        <section className="pt-32 pb-24 bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div data-reveal="left">
              <p className="overline mb-6">{t('basics_hub.hero.eyebrow', 'Podstawy flex')}</p>
              <h1
                className="text-[#000759] leading-[1.05] mb-6"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 4.2rem)' }}
              >
                {t('basics_hub.hero.title', 'Zrozum biura elastyczne od podstaw')}
              </h1>
              <p className="text-body-strong text-lg leading-relaxed mb-9">
                {t('basics_hub.hero.lead', 'Poznaj najważniejsze pojęcia, modele najmu i scenariusze, w których biuro flex może być lepszym rozwiązaniem niż najem tradycyjny.')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/podstawy-flex/czym-sa-biura-elastyczne" className="btn-primary inline-flex items-center gap-2">
                  {t('basics_hub.hero.primary_cta', 'Zacznij od definicji')} <ArrowRight size={14} />
                </Link>
                <Link href="/podstawy-flex/modele-biur-elastycznych" className="btn-outline inline-flex items-center gap-2">
                  {t('basics_hub.hero.secondary_cta', 'Porównaj modele')} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div data-reveal="right">
              <div className="surface-panel-soft relative min-h-[320px] overflow-hidden p-8 lg:p-10">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(28,84,244,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(28,84,244,0.08) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
                <div className="absolute -top-12 -right-16 w-64 h-64 rounded-full bg-[#1C54F4]/10 blur-2xl animate-pulse" />
                <div className="relative z-10 space-y-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">FLEX_BASICS_EDITORIAL_VISUAL</p>
                  <div className="grid grid-cols-2 gap-4 text-[#000759]">
                    {['hot desk', 'private office', 'TCO', 'CBD'].map((tag) => (
                      <div key={tag} className="border border-[#d9e4ff] px-3 py-2 text-[11px] uppercase tracking-[0.16em] bg-white/70">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-[#1C54F4] via-[#4D93FF] to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={kpiRef} className="py-20 bg-[#f8faff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
            <div data-reveal="left">
              <p className="overline mb-6">{t('basics_hub.context.eyebrow', 'Kontekst')}</p>
              <h2 className="text-[#000759] leading-tight mb-6" style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(1.8rem,3.2vw,3rem)' }}>
                {t('basics_hub.context.title', 'Flex to nie tylko coworking')}
              </h2>
              <p className="text-body-strong leading-relaxed">
                {t('basics_hub.context.body', 'Rynek biur elastycznych przestał być niszową alternatywą dla małych firm. Dziś to dojrzały segment rynku biurowego, odpowiadający zarówno na potrzeby start-upów, jak i większych organizacji oczekujących szybkości wdrożenia, przewidywalności kosztów i gotowego środowiska pracy. Raport pokazuje też, że podaż flex w siedmiu największych miastach Polski przekracza 430 tys. m², a cały segment rośnie wraz z potrzebą elastyczności i redukcji ryzyka.')}
              </p>
            </div>
            <div className="surface-panel-soft space-y-5 p-6" data-reveal="right">
              <div>
                <p className="text-[#000759] text-4xl font-normal">{formatNumber(totalSupply)}+ m²</p>
                <p className="text-body-muted text-sm">{t('basics_hub.context.kpi_supply_label', 'elastycznej powierzchni w 7 największych miastach')}</p>
              </div>
              <div className="h-px bg-[#e6ebf8]" />
              <div>
                <p className="text-[#000759] text-2xl font-normal">3%+</p>
                <p className="text-body-muted text-sm">{t('basics_hub.context.kpi_share_label', 'udziału w całkowitej podaży biur')}</p>
              </div>
              <div className="h-px bg-[#e6ebf8]" />
              <div>
                <p className="text-[#000759] text-2xl font-normal">3</p>
                <p className="text-body-muted text-sm">{t('basics_hub.context.kpi_models_label', 'główne modele opisane w przewodniku')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{t('basics_hub.evergreens.eyebrow', 'Evergreeny')}</p>
            <h2 className="text-[#000759] mb-10" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2rem,3.6vw,3.3rem)' }}>
              {t('basics_hub.evergreens.title', 'Pięć tematów, od których warto zacząć')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {cards.map((card, idx) => (
                <Link
                  key={card.slug}
                  href={`/podstawy-flex/${card.slug}`}
                  className="surface-panel-soft group relative min-h-[240px] p-7 transition-all duration-500 hover:shadow-[0_22px_64px_rgba(0,7,89,0.11)] hover:-translate-y-1"
                  data-reveal={`d${(idx % 3) + 1}`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_80%_20%,rgba(28,84,244,0.1),transparent_55%)]" />
                  <p className="text-[#1C54F4] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">{t(`basics_hub.card.${idx + 1}.number`, card.number)}</p>
                  <h3 className="text-[#000759] text-[1.45rem] font-normal leading-tight mb-4">{t(`basics_hub.card.${idx + 1}.title`, card.title)}</h3>
                  <p className="text-body-muted text-sm leading-relaxed mb-7">{t(`basics_hub.card.${idx + 1}.description`, card.description)}</p>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] inline-flex items-center gap-2">
                    {t('header.knowledgeBase', 'Baza wiedzy')} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#f8faff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{t('basics_hub.tools.eyebrow', 'Narzędzia')}</p>
            <h2 className="text-[#000759] mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(2rem,3.6vw,3.3rem)' }}>
              Przejdź od wiedzy do decyzji
            </h2>
            <p className="text-body-muted max-w-3xl mb-10">{BASICS_TOOLS_SECTION.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {BASICS_TOOLS_SECTION.cards.map((tool, index) => {
                const Icon = [Calculator, SlidersHorizontal, MapPin][index]
                return (
                  <Link
                    key={tool.title}
                    href={tool.href}
                    className="surface-panel-soft group p-7 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_20px_56px_rgba(0,7,89,0.12)]"
                  >
                    <Icon size={20} className="text-[#1C54F4] mb-5" />
                    <h3 className="text-[#000759] text-xl font-normal mb-4">{tool.title}</h3>
                    <p className="text-body-muted text-sm leading-relaxed mb-8">{tool.text}</p>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] inline-flex items-center gap-2">
                      {tool.cta} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#000759] text-white" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{t('basics_hub.next.eyebrow', 'Dalej')}</p>
            <h2 className="text-white text-4xl font-normal mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('basics_hub.next.title', 'Nie musisz zaczynać od pełnego briefu')}
            </h2>
            <p className="max-w-3xl mb-8 text-white/84">
              {t('basics_hub.next.body', 'Możesz zacząć od definicji, porównać modele albo od razu przejść do narzędzi. Gdy będziesz gotowy, pomożemy przełożyć to na realne opcje rynkowe.')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/kalkulator-flex" className="btn-primary-bright inline-flex items-center gap-2">
                {t('basics_hub.next.primary_cta', 'Uruchom kalkulator')} <ArrowRight size={14} />
              </Link>
              <button onClick={() => setFormOpen(true)} className="btn-outline border-white/35 text-white hover:bg-white hover:text-[#000759]">
                {t('basics_hub.next.secondary_cta', 'Porozmawiaj z doradcą')}
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
