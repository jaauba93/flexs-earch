'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, MapPin, SlidersHorizontal } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import { BASICS_TOOLS_SECTION, type BasicsTopic } from '@/lib/basics/flexBasics'

interface BasicsArticleClientProps {
  topic: BasicsTopic
  nextLinks: Array<{ title: string; href: string; description: string }>
}

function sectionStyle(format: string) {
  if (format.includes('table')) return 'grid grid-cols-1 md:grid-cols-2 gap-3'
  if (format.includes('checklist')) return 'space-y-3'
  if (format.includes('6')) return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'
  return 'grid grid-cols-1 md:grid-cols-2 gap-3'
}

export default function BasicsArticleClient({ topic, nextLinks }: BasicsArticleClientProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <main className="bg-white">
        <section className="pt-32 pb-20 border-b border-[#e7e8ea] bg-[linear-gradient(180deg,#ffffff_0%,#f8faff_100%)]" data-reveal>
          <div className="container-colliers grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div data-reveal="left">
              <p className="eyebrow-label mb-4">
                Przewodnik Flex / Podstawy flex
              </p>
              <p className="overline mb-6">{topic.eyebrow}</p>
              <h1
                className="text-[#000759] leading-[1.05] mb-6"
                style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.1rem, 4.8vw, 4rem)' }}
              >
                {topic.h1}
              </h1>
              <p className="text-body-strong text-lg leading-relaxed mb-8">{topic.lead}</p>
              <div className="flex flex-wrap gap-2">
                <a href="#dlaczego-to-wazne" className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] border border-[#dbe4f8] px-3 py-2">Dlaczego to ważne</a>
                <a href="#glowna-zawartosc" className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] border border-[#dbe4f8] px-3 py-2">Główna zawartość</a>
                <a href="#co-dalej" className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] border border-[#dbe4f8] px-3 py-2">Co dalej</a>
              </div>
            </div>

            <div data-reveal="right">
              <div className="surface-panel-soft relative p-8 lg:p-10 overflow-hidden min-h-[320px]">
                <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(rgba(28,84,244,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(28,84,244,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-10 -right-12 w-56 h-56 rounded-full bg-[#1C54F4]/10 blur-2xl animate-pulse" />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] mb-6">{topic.heroVisualPlaceholder}</p>
                  <div className="border border-[#dbe4f8] bg-white/80 p-5">
                    <p className="eyebrow-label text-[10px] mb-2">Kluczowa teza</p>
                    <p className="text-[#000759] text-lg leading-relaxed">{topic.keyTakeaway}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="dlaczego-to-wazne" className="py-16 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers max-w-[1120px]">
            <p className="overline mb-6">{topic.whyItMattersH2}</p>
            <p className="text-body-strong text-lg leading-relaxed">{topic.whyItMattersText}</p>
          </div>
        </section>

        <section id="glowna-zawartosc" className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers space-y-12">
            {topic.sections.map((section, sectionIndex) => (
              <article key={section.title} data-reveal={sectionIndex % 2 === 0 ? 'left' : 'right'}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <h2 className="text-[#000759] text-3xl font-normal" style={{ fontFamily: 'var(--font-serif)' }}>
                    {section.title}
                  </h2>
                  <p className="eyebrow-label text-[10px]">{section.format}</p>
                </div>
                <div className={sectionStyle(section.format)}>
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={item}
                      className={`surface-panel-soft p-5 text-body-strong leading-relaxed ${
                        section.format.includes('checklist') ? 'flex items-start gap-3' : ''
                      }`}
                    >
                      {section.format.includes('checklist') && (
                        <span className="text-[#1C54F4] text-sm font-bold">{itemIndex + 1}.</span>
                      )}
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topic.detailBlocks.map((block) => (
                <div key={block} className="surface-panel-soft p-5 text-body-strong leading-relaxed">
                  {block}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="co-dalej" className="py-20 bg-[#f8faff] border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">Co warto sprawdzić dalej</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {nextLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="surface-panel-soft group p-6 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,7,89,0.12)]"
                >
                  <h3 className="text-[#000759] text-xl font-normal mb-3">{item.title}</h3>
                  <p className="text-body-muted text-sm leading-relaxed mb-6">{item.description}</p>
                  <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#1C54F4] inline-flex items-center gap-2">
                    Przejdź dalej <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-[#e7e8ea]" data-reveal>
          <div className="container-colliers">
            <p className="overline mb-6">{BASICS_TOOLS_SECTION.h2}</p>
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
            <p className="overline mb-6">Dalej</p>
            <h2 className="text-white text-4xl font-normal mb-5" style={{ fontFamily: 'var(--font-serif)' }}>
              Nie musisz zaczynać od pełnego briefu
            </h2>
            <p className="text-white/84 max-w-3xl mb-8">
              Możesz zacząć od podstaw, porównać modele albo od razu przejść do narzędzi. Gdy będziesz gotowy, pomożemy przełożyć to na realne opcje rynkowe.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setFormOpen(true)} className="btn-primary-bright inline-flex items-center gap-2">
                Porozmawiaj z doradcą <ArrowRight size={14} />
              </button>
              <Link href="/biura-serwisowane" className="btn-outline border-white/35 text-white hover:bg-white hover:text-[#000759]">
                Zobacz oferty
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
