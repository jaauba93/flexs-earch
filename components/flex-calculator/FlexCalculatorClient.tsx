'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Calculator, CheckCircle2, CircleHelp, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { withLocalePath } from '@/lib/i18n/routing'
import type {
  FlexCalculatorComputedResult,
  FlexCalculatorInputs,
  FlexCalculatorPublicData,
} from '@/lib/flex-calculator/types'

interface FlexCalculatorClientProps {
  data: FlexCalculatorPublicData
}

function FilterTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        tabIndex={0}
        aria-label="Pokaż wyjaśnienie"
        className="inline-flex h-4 w-4 items-center justify-center text-[#7d8db5] transition-colors hover:text-[#1C54F4] focus:text-[#1C54F4]"
      >
        <CircleHelp size={14} />
      </button>
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-30 w-64 -translate-x-1/2 rounded-none border border-[#dbe4f8] bg-white px-3 py-2 text-[11px] font-normal leading-relaxed text-[#5c6d97] opacity-0 shadow-[0_12px_30px_rgba(0,7,89,0.12)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  )
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
    <div className="calculator-input-card">
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--colliers-navy)]">{label}</p>
          {hint ? <FilterTooltip text={hint} /> : null}
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

function ResultCard({
  label,
  valuePln,
  valueEur,
  accent = false,
  detail,
}: {
  label: string
  valuePln: number
  valueEur: number
  accent?: boolean
  detail?: string
}) {
  return (
    <div
      className={`border p-5 ${accent ? 'border-[var(--colliers-blue-bright)]' : 'border-[#dbe4f3] bg-white'}`}
      style={accent ? { backgroundColor: 'rgba(219, 229, 255, 0.32)' } : undefined}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{label}</p>
      {detail ? <p className="mt-2 text-xs leading-relaxed text-body-soft">{detail}</p> : null}
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
  const { locale } = useLocaleContext()
  const [formOpen, setFormOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [inputs, setInputs] = useState<FlexCalculatorInputs>(() => getInitialInputs(data))
  const [result, setResult] = useState<FlexCalculatorComputedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasInputInteracted, setHasInputInteracted] = useState(false)

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
  const selectedDensity = useMemo(
    () => densityOptions.find((option) => option.key === inputs.densityKey) ?? densityOptions[0],
    [densityOptions, inputs.densityKey]
  )
  const densityTooltip = selectedDensity
    ? `${selectedDensity.label}: dla flexu przyjmujemy ${formatCompactNumber(selectedDensity.flex_office_sqm_per_desk, 1)} mkw. w prywatnym module na stanowisko, a dla konwencji ${formatCompactNumber(selectedDensity.conventional_sqm_per_person_avg, 1)} mkw. na osobę.`
    : undefined

  function updateInput<K extends keyof FlexCalculatorInputs>(key: K, value: FlexCalculatorInputs[K]) {
    setHasInputInteracted(true)
    setInputs((current) => ({ ...current, [key]: value }))
  }

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
          <div className="grid gap-8 xl:grid-cols-[minmax(320px,0.38fr)_minmax(0,0.62fr)] xl:items-start">
            <div className="xl:sticky xl:top-28">
              <div className="space-y-4">
                <div className="surface-panel-soft p-5">
                  <div className="flex items-center gap-3">
                    <Calculator size={18} className="text-[#1C54F4]" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Założenia klienta</p>
                      <p className="text-sm text-body-muted">
                        Uzupełnij podstawowe parametry, a narzędzie przeliczy porównywalny scenariusz dla konwencji i flexu.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`calculator-inputs-shell ${hasInputInteracted ? '' : 'is-active'}`}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputShell label="Liczba stanowisk pracy" hint="Zakres orientacyjny: 25–1000.">
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={inputs.headcount}
                        onChange={(event) =>
                          updateInput('headcount', Number(event.target.value || data.settings.default_headcount))
                        }
                        className="form-input"
                      />
                    </InputShell>

                    <InputShell label="Rynek (miasto)">
                      <select
                        value={inputs.citySlug}
                        onChange={(event) => updateInput('citySlug', event.target.value)}
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
                        onChange={(event) => updateInput('locationType', event.target.value)}
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
                        onChange={(event) => updateInput('fitoutStandard', event.target.value)}
                        className="form-input"
                      >
                        {data.settings.fitout_options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </InputShell>

                    <InputShell label="Standard zagęszczenia" hint={densityTooltip}>
                      <select
                        value={inputs.densityKey}
                        onChange={(event) => updateInput('densityKey', event.target.value)}
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
                        onChange={(event) => updateInput('conventionalLeaseMonths', Number(event.target.value))}
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
                        onChange={(event) => updateInput('flexLeaseMonths', Number(event.target.value))}
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
                        Ten kalkulator pokazuje scenariusz referencyjny. Jeśli chcesz porównać go z realnymi ofertami i
                        negocjacjami operatorów lub landlordów, zespół Colliers przygotuje doprecyzowany benchmark dla
                        Twojego briefu.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={() => setFormOpen(true)} className="btn-primary" type="button">
                          Porozmawiaj z doradcą
                        </button>
                        <Link href={withLocalePath(locale, '/biura-serwisowane')} className="btn-outline">
                          Zobacz oferty <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-panel-soft p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Porównanie kosztów</p>
                    <h2
                      className="mt-2 text-3xl font-normal text-[var(--colliers-navy)]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Najważniejsze wskaźniki
                    </h2>
                  </div>
                  {result ? (
                    <p className="text-xs text-body-soft">
                      Kurs NBP: 1 EUR = {formatCompactNumber(result.exchangeRate.eurPln, 4)} PLN, tabela z dnia{' '}
                      {result.exchangeRate.effectiveDate}
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
                      detail={`Pełne ${result.inputs.conventionalLeaseMonths} miesięcy najmu konwencjonalnego.`}
                    />
                    <ResultCard
                      label="Łączne zobowiązanie — flex"
                      valuePln={result.totals.flexTotalLiabilityPln}
                      valueEur={result.totals.flexTotalLiabilityEur}
                      accent
                      detail={`Pełne ${result.inputs.flexLeaseMonths} miesięcy umowy flex.`}
                    />
                    <ResultCard
                      label="Koszt konwencji za okres flex"
                      valuePln={result.totals.conventionalCostForFlexPeriodPln}
                      valueEur={result.totals.conventionalCostForFlexPeriodEur}
                      accent
                      detail={`${result.inputs.flexLeaseMonths} mies. z ${result.inputs.conventionalLeaseMonths} mies. konwencji.`}
                    />
                    <ResultCard
                      label="Koszt flex za ten sam okres"
                      valuePln={result.totals.flexCostForFlexPeriodPln}
                      valueEur={result.totals.flexCostForFlexPeriodEur}
                      accent
                      detail={`Pełny koszt flex dla ${result.inputs.flexLeaseMonths} miesięcy.`}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="surface-panel-soft p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                        Analogiczny okres porównania
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-body-muted">
                        Koszt konwencji liczony jest tylko za okres równy wybranej umowie flex, żeby porównanie
                        dotyczyło tego samego horyzontu czasowego zamiast całego kontraktu konwencjonalnego.
                      </p>
                    </div>
                    <div className="surface-panel-soft p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8ab1]">Konwencja</p>
                          <p className="mt-2 text-lg font-semibold text-[#000759]">
                            {result.inputs.flexLeaseMonths} mies. z {result.inputs.conventionalLeaseMonths}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8ab1]">Flex</p>
                          <p className="mt-2 text-lg font-semibold text-[#000759]">pełne {result.inputs.flexLeaseMonths} mies.</p>
                        </div>
                      </div>
                    </div>
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
                        <p
                          className="text-3xl font-normal text-[var(--colliers-navy)]"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {formatCurrency(result.totals.flexPremiumPerCapitaMonthlyEur, 'EUR')}
                        </p>
                        <p className="text-sm text-body-muted">
                          {formatCompactNumber(result.totals.flexPremiumPct * 100, 1)}% per capita / mies.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] xl:items-start">
                    <div className="surface-panel p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Powierzchnia</p>
                      <div className="mt-5 space-y-4 text-sm">
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">Konwencja netto</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.conventionalNetAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            Podstawowa powierzchnia użytkowa zajmowana wyłącznie przez najemcę.
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">Konwencja brutto</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.conventionalGrossAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            Powierzchnia netto powiększona o udział najemcy w korytarzach, lobby i innych częściach
                            wspólnych budynku.
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">Flex — moduły prywatne</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.flexPrivateAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            Powierzchnia wewnątrz prywatnych modułów w biurach serwisowanych.
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">Flex — moduły z udziałem wspólnym</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.flexGrossAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            Powierzchnia modułów prywatnych razem z proporcjonalnym udziałem w strefach wspólnych
                            operatora, choć nie są one na wyłączność klienta.
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">Konwencja mkw. / osoba</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.conventionalGrossPerCapitaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            Wartość brutto na osobę, czyli z udziałem w częściach wspólnych budynku.
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">Flex mkw. / stanowisko</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.flexGrossPerCapitaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            Łączna metryka przypisana na stanowisko w modelu flex, razem z udziałem w częściach
                            wspólnych operatora.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="surface-panel p-5">
                      <div className="flex items-center gap-3">
                        <BarChart3 size={18} className="text-[#1C54F4]" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">Koszty miesięczne</p>
                          <p className="text-sm text-body-muted">
                            Źródłowe dane rynkowe pozostają po stronie Colliers, a klient widzi już gotowe wyniki
                            porównawcze.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[var(--colliers-navy)]">
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                Pozycja
                              </th>
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                Model
                              </th>
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                PLN / mies.
                              </th>
                              <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                EUR / mies.
                              </th>
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
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">
                                  {formatCurrency(item.monthlyTotalPln, 'PLN')}
                                </td>
                                <td className="py-3 text-[var(--colliers-navy)]">
                                  {formatCurrency(item.monthlyTotalEur, 'EUR')}
                                </td>
                              </tr>
                            ))}
                            {result.flexLineItems.map((item) => (
                              <tr key={`flex-${item.label}`} className="border-b border-[#edf1f7] align-top">
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">
                                  <div className="font-semibold">{item.label}</div>
                                  {item.note ? <div className="mt-1 text-xs text-body-soft">{item.note}</div> : null}
                                </td>
                                <td className="py-3 pr-4 text-body-muted">Flex</td>
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">
                                  {formatCurrency(item.monthlyTotalPln, 'PLN')}
                                </td>
                                <td className="py-3 text-[var(--colliers-navy)]">
                                  {formatCurrency(item.monthlyTotalEur, 'EUR')}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-[#f7faff]">
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">Total konwencja / miesiąc</td>
                              <td className="py-3 pr-4 text-body-muted">Konwencja</td>
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">
                                {formatCurrency(result.totals.conventionalMonthlyTotalPln, 'PLN')}
                              </td>
                              <td className="py-3 font-semibold text-[var(--colliers-navy)]">
                                {formatCurrency(result.totals.conventionalMonthlyTotalEur, 'EUR')}
                              </td>
                            </tr>
                            <tr className="bg-[#f7faff]">
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">Total flex / miesiąc</td>
                              <td className="py-3 pr-4 text-body-muted">Flex</td>
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">
                                {formatCurrency(result.totals.flexMonthlyTotalPln, 'PLN')}
                              </td>
                              <td className="py-3 font-semibold text-[var(--colliers-navy)]">
                                {formatCurrency(result.totals.flexMonthlyTotalEur, 'EUR')}
                              </td>
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
