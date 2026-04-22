'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, ChevronDown, MapPin, SlidersHorizontal } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import { BASICS_TOOLS_SECTION, type BasicsTopic } from '@/lib/basics/flexBasics'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { getContentMessage } from '@/lib/i18n/runtime'
import { withLocalePath } from '@/lib/i18n/routing'

interface BasicsArticleClientProps {
  topic: BasicsTopic
  nextLinks: Array<{ title: string; href: string; description: string }>
}

function sectionStyle(format: string, variant: 'cards' | 'accordion') {
  if (variant === 'accordion') return 'space-y-3'
  if (format.includes('table')) return 'grid grid-cols-1 md:grid-cols-2 gap-3'
  if (format.includes('6')) return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'
  return 'grid grid-cols-1 md:grid-cols-2 gap-3'
}

export default function BasicsArticleClient({ topic, nextLinks }: BasicsArticleClientProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const { locale } = useLocaleContext()
  const t = (key: string, fallback?: string) => getContentMessage(locale, key, fallback)
  const contentSectionLabel =
    locale === 'pl' ? 'Główna zawartość' : locale === 'en' ? 'Main content' : 'Основний зміст'
  const nextSectionLabel =
    locale === 'pl' ? 'Co dalej' : locale === 'en' ? 'What next' : 'Що далі'
  const continueLabel =
    locale === 'pl' ? 'Przejdź dalej' : locale === 'en' ? 'Continue' : 'Перейти далі'

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <main className="bg-white">
        <section className="pt-32 pb-20 border-b border-[#e7e8ea] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div data-reveal="left">
              <p className="eyebrow-label mb-4">
                {t(`basics.${topic.slug}.hero.breadcrumb`, 'Przewodnik Flex / Podstawy flex')}
              </p>
              <p className="overline mb-6">{t(`basics.${topic.slug}.hero.eyebrow`, topic.eyebrow)}</p>
              <h1
                className="text-[#000759] leading-[1.05] mb-6"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.1rem, 4.8vw, 4rem)' }}
              >
                {t(`basics.${topic.slug}.hero.title`, topic.h1)}
              </h1>
              <p className="text-body-strong text-lg leading-relaxed mb-8">{t(`basics.${topic.slug}.hero.lead`, topic.lead)}</p>
              <div className="flex flex-wrap gap-2">
                <a href="#dlaczego-to-wazne" className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] border border-[#dbe4f8] px-3 py-2">{t(`basics.${topic.slug}.why.eyebrow`, 'Dlaczego to ważne')}</a>
                <a href="#glowna-zawartosc" className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] border border-[#dbe4f8] px-3 py-2">{contentSectionLabel}</a>
                <a href="#co-dalej" className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] border border-[#dbe4f8] px-3 py-2">{nextSectionLabel}</a>
              </div>
            </div>

            <div data-reveal="right">
              <div className="surface-panel-soft relative p-8 lg:p-10 overflow-hidden min-h-[320px]">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(28,84,244,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(28,84,244,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-10 -right-12 w-56 h-56 rounded-full bg-[#1C54F4]/10 blur-2xl animate-pulse" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] mb-6">{t(`basics.${topic.slug}.hero.visual_placeholder`, topic.heroVisualPlaceholder)}</p>
                  <div className="border border-[#dbe4f8] bg-white/80 p-5">
                    <p className="eyebrow-label text-[10px] mb-2">{t(`basics.${topic.slug}.hero.key_takeaway_label`, 'Kluczowa teza')}</p>
                    <p className="text-[#000759] text-lg leading-relaxed">{t(`basics.${topic.slug}.hero.key_takeaway`, topic.keyTakeaway)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="dlaczego-to-wazne" className="py-16 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers max-w-[1120px]">
            <p className="overline mb-6">{t(`basics.${topic.slug}.why.eyebrow`, topic.whyItMattersH2)}</p>
            <p className="text-body-strong text-lg leading-relaxed">{t(`basics.${topic.slug}.why.body`, topic.whyItMattersText)}</p>
          </div>
        </section>

        <section id="glowna-zawartosc" className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers space-y-12">
            {topic.sections.map((section, sectionIndex) => (
              <article key={section.title} data-reveal={sectionIndex % 2 === 0 ? 'left' : 'right'}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <h2 className="text-[#000759] text-3xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                    {t(`basics.${topic.slug}.section.${sectionIndex + 1}.title`, section.title)}
                  </h2>
                  <p className="eyebrow-label text-[10px]">{t(`basics.${topic.slug}.section.${sectionIndex + 1}.format`, section.format)}</p>
                </div>
                <div className={sectionStyle(section.format, section.variant)}>
                  {section.items.map((item, itemIndex) =>
                    section.variant === 'accordion' ? (
                      <details
                        key={item.title}
                        className="surface-panel-soft group p-5 text-body-strong leading-relaxed"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[#000759]">
                          <span className="flex items-start gap-3">
                            <span className="text-[#1C54F4] text-sm font-bold">{itemIndex + 1}.</span>
                            <span>{t(`basics.${topic.slug}.section.${sectionIndex + 1}.item.${itemIndex + 1}.title`, item.title)}</span>
                          </span>
                          <ChevronDown size={16} className="shrink-0 text-[#1C54F4] transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <p className="mt-4 text-body-muted text-sm leading-relaxed">{t(`basics.${topic.slug}.section.${sectionIndex + 1}.item.${itemIndex + 1}.description`, item.description)}</p>
                      </details>
                    ) : (
                      <div key={item.title} className="surface-panel-soft p-5 text-body-strong leading-relaxed">
                        <p className="mb-3 text-[15px] font-semibold text-[#000759]">{t(`basics.${topic.slug}.section.${sectionIndex + 1}.item.${itemIndex + 1}.title`, item.title)}</p>
                        <p className="text-body-muted text-sm leading-relaxed">{t(`basics.${topic.slug}.section.${sectionIndex + 1}.item.${itemIndex + 1}.description`, item.description)}</p>
                      </div>
                    )
                  )}
                </div>
              </article>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.detailBlocks.map((block, index) => (
                <div key={index} className="surface-panel-soft p-5 text-body-strong leading-relaxed">
                  {t(`basics.${topic.slug}.detail_block.${index + 1}`, block)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="co-dalej" className="py-20 bg-[#f8faff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{t(`basics.${topic.slug}.next.eyebrow`, 'Co warto sprawdzić dalej')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {nextLinks.map((item, index) => (
                <Link
                  key={item.title}
                  href={withLocalePath(locale, item.href)}
                  className="surface-panel-soft group p-6 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,7,89,0.12)]"
                >
                  <h3 className="text-[#000759] text-xl font-normal mb-3">{t(`basics.${topic.slug}.next_link.${index + 1}.title`, item.title)}</h3>
                  <p className="text-body-muted text-sm leading-relaxed mb-6">{t(`basics.${topic.slug}.next_link.${index + 1}.description`, item.description)}</p>
                  <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] inline-flex items-center gap-2">
                    {continueLabel} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{t(`basics.${topic.slug}.tools.eyebrow`, BASICS_TOOLS_SECTION.h2)}</p>
            <p className="text-body-muted max-w-3xl mb-10">{t(`basics.${topic.slug}.tools.intro`, BASICS_TOOLS_SECTION.intro)}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {BASICS_TOOLS_SECTION.cards.map((tool, index) => {
                const Icon = [Calculator, SlidersHorizontal, MapPin][index]
                return (
                  <Link
                    key={tool.title}
                    href={withLocalePath(locale, tool.href)}
                    className="surface-panel-soft group p-7 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_20px_56px_rgba(0,7,89,0.12)]"
                  >
                    <Icon size={20} className="text-[#1C54F4] mb-5" />
                    <h3 className="text-[#000759] text-xl font-normal mb-4">{t(`basics_tools.card.${index + 1}.title`, tool.title)}</h3>
                    <p className="text-body-muted text-sm leading-relaxed mb-8">{t(`basics_tools.card.${index + 1}.text`, tool.text)}</p>
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] inline-flex items-center gap-2">
                      {t(`basics_tools.card.${index + 1}.cta`, tool.cta)} <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#000759] text-white" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{t(`basics.${topic.slug}.final.eyebrow`, 'Dalej')}</p>
            <h2 className="text-white text-4xl font-normal mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
              {t(`basics.${topic.slug}.final.title`, 'Nie musisz zaczynać od pełnego briefu')}
            </h2>
            <p className="text-white/84 max-w-3xl mb-8">
              {t(`basics.${topic.slug}.final.body`, 'Możesz zacząć od podstaw, porównać modele albo od razu przejść do narzędzi. Gdy będziesz gotowy, pomożemy przełożyć to na realne opcje rynkowe.')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setFormOpen(true)} className="btn-primary-bright inline-flex items-center gap-2">
                {t(`basics.${topic.slug}.final.primary_cta`, 'Porozmawiaj z doradcą')} <ArrowRight size={14} />
              </button>
              <Link href={withLocalePath(locale, '/biura-serwisowane')} className="btn-outline border-white/35 text-white hover:bg-white hover:text-[#000759]">
                {t(`basics.${topic.slug}.final.secondary_cta`, 'Zobacz oferty')}
              </Link>
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
