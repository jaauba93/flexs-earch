'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Calculator, CheckCircle2, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import type {
  FlexCalculatorComputedResult,
  FlexCalculatorInputs,
  FlexCalculatorPublicData,
} from '@/lib/flex-calculator/types'

interface FlexCalculatorClientProps {
  data: FlexCalculatorPublicData
}

function formatCurrency(value: number, currency: 'PLN' | 'EUR') {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactNumber(value: number, digits = 2) {
  return new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value)
}

function getInitialInputs(data: FlexCalculatorPublicData): FlexCalculatorInputs {
  return {
    headcount: data.settings.default_headcount,
    citySlug: data.settings.default_city_slug,
    locationType: data.settings.default_location_type,
    fitoutStandard: data.settings.default_fitout_standard,
    densityKey: data.settings.default_density_key,
    conventionalLeaseMonths: data.settings.default_conventional_lease_months,
    flexLeaseMonths: data.settings.default_flex_lease_months,
  }
}

function InputShell({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
      <div className="border border-[var(--colliers-yellow)] bg-white shadow-[0_10px_26px_rgba(0,7,89,0.04)]">
      <div
        className="flex items-center justify-between border-b border-[var(--colliers-yellow)] px-4 py-2"
        style={{ backgroundColor: 'rgba(255, 212, 0, 0.18)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--colliers-navy)]">{label}</p>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--colliers-gray)]">Pole klienta</span>
      </div>
      <div className="p-4">
        {children}
        {hint ? <p className="mt-2 text-xs text-body-soft">{hint}</p> : null}
      </div>
    </div>
  )
}

function ResultCard({
  label,
  valuePln,
  valueEur,
  accent = false,
}: {
  label: string
  valuePln: number
  valueEur: number
  accent?: boolean
}) {
  return (
    <div
      className={`border p-5 ${accent ? 'border-[var(--colliers-blue-bright)]' : 'border-[#dbe4f3] bg-white'}`}
      style={accent ? { backgroundColor: 'rgba(219, 229, 255, 0.32)' } : undefined}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{label}</p>
      <div className="mt-4 space-y-2">
        <p className="text-3xl font-normal text-[var(--colliers-navy)]" style={{ fontFamily: 'var(--font-serif)' }}>
          {formatCurrency(valuePln, 'PLN')}
        </p>
        <p className="text-sm text-body-muted">{formatCurrency(valueEur, 'EUR')}</p>
      </div>
    </div>
  )
}

export default function FlexCalculatorClient({ data }: FlexCalculatorClientProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [inputs, setInputs] = useState<FlexCalculatorInputs>(() => getInitialInputs(data))
  const [result, setResult] = useState<FlexCalculatorComputedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/flex-calculator/compute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputs),
          signal: controller.signal,
        })

        const payload = (await response.json()) as FlexCalculatorComputedResult & { error?: string }

        if (!response.ok) {
          throw new Error(payload.error || 'Nie udało się przeliczyć kalkulatora.')
        }

        setResult(payload)
      } catch (fetchError) {
        if (controller.signal.aborted) return
        setError(fetchError instanceof Error ? fetchError.message : 'Nie udało się przeliczyć kalkulatora.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 180)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [inputs])

  const densityOptions = useMemo(
    () => [...data.densityOptions].sort((a, b) => a.sort_order - b.sort_order),
    [data.densityOptions]
  )

  return (
    <>
      <Header onOpenForm={() => setFormOpen(true)} onOpenWizard={() => setWizardOpen(true)} />

      <main>
        <section className="border-b border-[#dbe4f3] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)]">
          <div className="container-colliers py-14 md:py-20">
            <p className="overline mb-5">{data.settings.intro_eyebrow}</p>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 className="text-4xl md:text-5xl font-normal text-[var(--colliers-navy)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {data.settings.intro_title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-body-muted">{data.settings.intro_body}</p>
              </div>
              <div className="surface-panel-soft p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Ważne przed użyciem</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#42547d]">
                  <li className="flex gap-3"><CheckCircle2 size={16} className="mt-1 text-[#1C54F4]" /> <span>{data.settings.intro_disclaimer_approx}</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={16} className="mt-1 text-[#1C54F4]" /> <span>{data.settings.intro_disclaimer_market}</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={16} className="mt-1 text-[#1C54F4]" /> <span>{data.settings.intro_disclaimer_support}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="container-colliers py-12 md:py-16">
          <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-4">
              <div className="surface-panel-soft p-5">
                <div className="flex items-center gap-3">
                  <Calculator size={18} className="text-[#1C54F4]" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Założenia klienta</p>
                    <p className="text-sm text-body-muted">Pola zaznaczone na żółto odpowiadają wejściom z arkusza źródłowego.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InputShell label="Liczba stanowisk pracy" hint="Zakres orientacyjny: 25–1000">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={inputs.headcount}
                    onChange={(event) =>
                      setInputs((current) => ({
                        ...current,
                        headcount: Number(event.target.value || data.settings.default_headcount),
                      }))
                    }
                    className="form-input"
                  />
                </InputShell>

                <InputShell label="Rynek (miasto)">
                  <select
                    value={inputs.citySlug}
                    onChange={(event) => setInputs((current) => ({ ...current, citySlug: event.target.value }))}
                    className="form-input"
                  >
                    {data.cityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputShell>

                <InputShell label="Lokalizacja">
                  <select
                    value={inputs.locationType}
                    onChange={(event) => setInputs((current) => ({ ...current, locationType: event.target.value }))}
                    className="form-input"
                  >
                    {data.settings.location_options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputShell>

                <InputShell label="Standard wykończenia">
                  <select
                    value={inputs.fitoutStandard}
                    onChange={(event) => setInputs((current) => ({ ...current, fitoutStandard: event.target.value }))}
                    className="form-input"
                  >
                    {data.settings.fitout_options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputShell>

                <InputShell label="Standard zagęszczenia">
                  <select
                    value={inputs.densityKey}
                    onChange={(event) => setInputs((current) => ({ ...current, densityKey: event.target.value }))}
                    className="form-input"
                  >
                    {densityOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputShell>

                <InputShell label="Okres najmu konwencjonalnego">
                  <select
                    value={String(inputs.conventionalLeaseMonths)}
                    onChange={(event) =>
                      setInputs((current) => ({
                        ...current,
                        conventionalLeaseMonths: Number(event.target.value),
                      }))
                    }
                    className="form-input"
                  >
                    {data.settings.conventional_lease_options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputShell>

                <InputShell label="Okres flex">
                  <select
                    value={String(inputs.flexLeaseMonths)}
                    onChange={(event) =>
                      setInputs((current) => ({
                        ...current,
                        flexLeaseMonths: Number(event.target.value),
                      }))
                    }
                    className="form-input"
                  >
                    {data.settings.flex_lease_options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </InputShell>

                <div className="surface-panel p-5 sm:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Co dalej?</p>
                  <p className="mt-3 text-sm leading-relaxed text-body-muted">
                    Ten kalkulator pokazuje scenariusz referencyjny. Jeśli chcesz porównać go z realnymi ofertami i negocjacjami operatorów lub landlordów, zespół Colliers przygotuje doprecyzowany benchmark dla Twojego briefu.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => setFormOpen(true)} className="btn-primary" type="button">
                      Porozmawiaj z doradcą
                    </button>
                    <Link href="/biura-serwisowane" className="btn-outline">
                      Zobacz oferty <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel-soft p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Cost comparison</p>
                    <h2 className="mt-2 text-3xl font-normal text-[var(--colliers-navy)]" style={{ fontFamily: 'var(--font-serif)' }}>
                      Najważniejsze wskaźniki
                    </h2>
                  </div>
                  {result ? (
                    <p className="text-xs text-body-soft">
                      Kurs NBP: 1 EUR = {formatCompactNumber(result.exchangeRate.eurPln, 4)} PLN, tabela z dnia {result.exchangeRate.effectiveDate}
                    </p>
                  ) : null}
                </div>
              </div>

              {loading && !result ? (
                <div className="surface-panel p-10 text-center text-body-muted">
                  <Loader2 size={20} className="mx-auto animate-spin text-[#1C54F4]" />
                  <p className="mt-4">Liczymy scenariusz…</p>
                </div>
              ) : error ? (
                <div className="surface-panel p-8 text-center text-[#9a2339]">
                  <p className="font-semibold">Nie udało się wyliczyć kalkulatora.</p>
                  <p className="mt-2 text-sm">{error}</p>
                </div>
              ) : result ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <ResultCard
                      label="Łączne zobowiązanie — konwencja"
                      valuePln={result.totals.conventionalTotalLiabilityPln}
                      valueEur={result.totals.conventionalTotalLiabilityEur}
                      accent
                    />
                    <ResultCard
                      label="Łączne zobowiązanie — flex"
                      valuePln={result.totals.flexTotalLiabilityPln}
                      valueEur={result.totals.flexTotalLiabilityEur}
                      accent
                    />
                    <ResultCard
                      label="Koszt konwencji za okres flex"
                      valuePln={result.totals.conventionalCostForFlexPeriodPln}
                      valueEur={result.totals.conventionalCostForFlexPeriodEur}
                      accent
                    />
                    <ResultCard
                      label="Koszt flex za ten sam okres"
                      valuePln={result.totals.flexCostForFlexPeriodPln}
                      valueEur={result.totals.flexCostForFlexPeriodEur}
                      accent
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <ResultCard
                      label="Redukcja zobowiązania"
                      valuePln={result.totals.liabilityReductionPln}
                      valueEur={result.totals.liabilityReductionEur}
                    />
                    <ResultCard
                      label="Oszczędność w okresie flex"
                      valuePln={result.totals.comparablePeriodSavingsPln}
                      valueEur={result.totals.comparablePeriodSavingsEur}
                    />
                    <div className="border border-[#dbe4f3] bg-white p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Premia za elastyczność</p>
                      <div className="mt-4 space-y-2">
                        <p className="text-3xl font-normal text-[var(--colliers-navy)]" style={{ fontFamily: 'var(--font-serif)' }}>
                          {formatCurrency(result.totals.flexPremiumPerCapitaMonthlyEur, 'EUR')}
                        </p>
                        <p className="text-sm text-body-muted">
                          {formatCompactNumber(result.totals.flexPremiumPct * 100, 1)}% per capita / mies.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
                    <div className="surface-panel p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Powierzchnia</p>
                      <div className="mt-5 space-y-4 text-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-[#edf1f7] pb-3">
                          <span className="text-body-muted">Konwencja netto</span>
                          <strong className="text-[var(--colliers-navy)]">{formatCompactNumber(result.areas.conventionalNetAreaSqm)} mkw.</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-b border-[#edf1f7] pb-3">
                          <span className="text-body-muted">Konwencja brutto</span>
                          <strong className="text-[var(--colliers-navy)]">{formatCompactNumber(result.areas.conventionalGrossAreaSqm)} mkw.</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-b border-[#edf1f7] pb-3">
                          <span className="text-body-muted">Flex gabinety</span>
                          <strong className="text-[var(--colliers-navy)]">{formatCompactNumber(result.areas.flexPrivateAreaSqm)} mkw.</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-b border-[#edf1f7] pb-3">
                          <span className="text-body-muted">Flex łącznie</span>
                          <strong className="text-[var(--colliers-navy)]">{formatCompactNumber(result.areas.flexGrossAreaSqm)} mkw.</strong>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-body-muted">Flex mkw. / stanowisko</span>
                          <strong className="text-[var(--colliers-navy)]">{formatCompactNumber(result.areas.flexGrossPerCapitaSqm)} mkw.</strong>
                        </div>
                      </div>
                    </div>

                    <div className="surface-panel p-5">
                      <div className="flex items-center gap-3">
                        <BarChart3 size={18} className="text-[#1C54F4]" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Koszty miesięczne</p>
                          <p className="text-sm text-body-muted">Źródłowe dane rynkowe pozostają po stronie Colliers, a klient widzi już gotowe wyniki porównawcze.</p>
                        </div>
                      </div>
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[var(--colliers-navy)]">
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Pozycja</th>
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Model</th>
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">PLN / mies.</th>
                              <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">EUR / mies.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.conventionalLineItems.map((item) => (
                              <tr key={`conv-${item.label}`} className="border-b border-[#edf1f7] align-top">
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">
                                  <div className="font-semibold">{item.label}</div>
                                  {item.note ? <div className="mt-1 text-xs text-body-soft">{item.note}</div> : null}
                                </td>
                                <td className="py-3 pr-4 text-body-muted">Konwencja</td>
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">{formatCurrency(item.monthlyTotalPln, 'PLN')}</td>
                                <td className="py-3 text-[var(--colliers-navy)]">{formatCurrency(item.monthlyTotalEur, 'EUR')}</td>
                              </tr>
                            ))}
                            {result.flexLineItems.map((item) => (
                              <tr key={`flex-${item.label}`} className="border-b border-[#edf1f7] align-top">
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">
                                  <div className="font-semibold">{item.label}</div>
                                  {item.note ? <div className="mt-1 text-xs text-body-soft">{item.note}</div> : null}
                                </td>
                                <td className="py-3 pr-4 text-body-muted">Flex</td>
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">{formatCurrency(item.monthlyTotalPln, 'PLN')}</td>
                                <td className="py-3 text-[var(--colliers-navy)]">{formatCurrency(item.monthlyTotalEur, 'EUR')}</td>
                              </tr>
                            ))}
                            <tr className="bg-[#f7faff]">
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">Total konwencja / miesiąc</td>
                              <td className="py-3 pr-4 text-body-muted">Konwencja</td>
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">{formatCurrency(result.totals.conventionalMonthlyTotalPln, 'PLN')}</td>
                              <td className="py-3 font-semibold text-[var(--colliers-navy)]">{formatCurrency(result.totals.conventionalMonthlyTotalEur, 'EUR')}</td>
                            </tr>
                            <tr className="bg-[#f7faff]">
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">Total flex / miesiąc</td>
                              <td className="py-3 pr-4 text-body-muted">Flex</td>
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">{formatCurrency(result.totals.flexMonthlyTotalPln, 'PLN')}</td>
                              <td className="py-3 font-semibold text-[var(--colliers-navy)]">{formatCurrency(result.totals.flexMonthlyTotalEur, 'EUR')}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
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
