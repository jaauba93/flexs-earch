'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BarChart3, Calculator, CheckCircle2, CircleHelp, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContactForm from '@/components/forms/ContactForm'
import OfficeModelWizard from '@/components/forms/OfficeModelWizard'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { getLocalizedCityLabel } from '@/lib/i18n/cities'
import { formatContentMessage, getContentMessage } from '@/lib/i18n/runtime'
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

function getLocalizedCalculatorOptionLabel(
  locale: string,
  kind: 'location' | 'fitout' | 'density',
  value: string,
  fallback: string
) {
  if (kind === 'location') {
    if (value === 'cbd') return locale === 'pl' ? 'Centrum' : locale === 'en' ? 'City centre' : 'Центр'
    if (value === 'non_cbd') return locale === 'pl' ? 'Poza centrum' : locale === 'en' ? 'Outside city centre' : 'Поза центром'
  }

  if (kind === 'fitout') {
    if (value === 'basic') return locale === 'pl' ? 'Podstawowy' : locale === 'en' ? 'Basic' : 'Базовий'
    if (value === 'enhanced') return locale === 'pl' ? 'Wyższy' : locale === 'en' ? 'Enhanced' : 'Покращений'
    if (value === 'premium') return locale === 'pl' ? 'Premium' : locale === 'en' ? 'Premium' : 'Преміум'
  }

  if (kind === 'density') {
    if (value === 'dense') return locale === 'pl' ? 'Gęsto' : locale === 'en' ? 'Dense' : 'Щільно'
    if (value === 'standard') return locale === 'pl' ? 'Standard' : locale === 'en' ? 'Standard' : 'Стандартно'
    if (value === 'spacious') return locale === 'pl' ? 'Swobodnie' : locale === 'en' ? 'Spacious' : 'Вільніше'
  }

  return fallback
}

function getLeaseLabel(locale: string, months: number) {
  if (locale === 'pl') {
    if (months === 12) return '12 miesięcy'
    if ([24, 36, 72].includes(months)) return `${months} miesiące`
    return `${months} miesięcy`
  }

  if (locale === 'en') {
    return `${months} months`
  }

  return `${months} міс.`
}

function getCalculatorLineItemContent(locale: 'pl' | 'en' | 'uk', label: string, note?: string) {
  const labelMap: Record<string, string> = {
    'Efektywny czynsz bazowy': 'calculator.line.effective_rent',
    'Opłata eksploatacyjna': 'calculator.line.service_charge',
    'Media i utrzymanie': 'calculator.line.utilities',
    'Amortyzacja luki fit-out': 'calculator.line.fitout_gap',
    'Cena za stanowisko (all-inclusive)': 'calculator.line.flex_all_in',
  }
  const noteMap: Record<string, string> = {
    'Uwzględnia zachętę rent-free zgodnie z założeniami rynkowymi.': 'calculator.line.effective_rent_note',
    'Rynkowo rozliczany w PLN, tutaj przeliczony także do EUR po kursie NBP.': 'calculator.line.service_charge_note',
    'Założenie operacyjne utrzymywane po stronie Colliers.': 'calculator.line.utilities_note',
    'Luka między kosztem fit-out a wkładem właściciela rozłożona na okres najmu.': 'calculator.line.fitout_gap_note',
    'Obejmuje czynsz, service charge, utilities i standardowe przygotowanie powierzchni.': 'calculator.line.flex_all_in_note',
  }

  return {
    label: labelMap[label] ? getContentMessage(locale, labelMap[label], label) : label,
    note: note && noteMap[note] ? getContentMessage(locale, noteMap[note], note) : note,
  }
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
          throw new Error(payload.error || getContentMessage(locale, 'calculator.error.title', 'Nie udało się wyliczyć kalkulatora.'))
        }

        setResult(payload)
      } catch (fetchError) {
        if (controller.signal.aborted) return
        setError(fetchError instanceof Error ? fetchError.message : getContentMessage(locale, 'calculator.error.title', 'Nie udało się wyliczyć kalkulatora.'))
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
  }, [inputs, locale])

  const densityOptions = useMemo(
    () => [...data.densityOptions].sort((a, b) => a.sort_order - b.sort_order),
    [data.densityOptions]
  )
  const selectedDensity = useMemo(() => densityOptions.find((option) => option.key === inputs.densityKey) ?? densityOptions[0], [densityOptions, inputs.densityKey])
  const localizedCityOptions = useMemo(
    () => data.cityOptions.map((option) => ({ ...option, label: getLocalizedCityLabel(option.value, locale) })),
    [data.cityOptions, locale]
  )
  const localizedDensityOptions = useMemo(
    () =>
      densityOptions.map((option) => ({
        ...option,
        label: getLocalizedCalculatorOptionLabel(locale, 'density', option.key, option.label),
      })),
    [densityOptions, locale]
  )
  const localizedLocationOptions = useMemo(
    () =>
      data.settings.location_options.map((option) => ({
        ...option,
        label: getLocalizedCalculatorOptionLabel(locale, 'location', option.value, option.label),
      })),
    [data.settings.location_options, locale]
  )
  const localizedFitoutOptions = useMemo(
    () =>
      data.settings.fitout_options.map((option) => ({
        ...option,
        label: getLocalizedCalculatorOptionLabel(locale, 'fitout', option.value, option.label),
      })),
    [data.settings.fitout_options, locale]
  )
  const densityTooltip = selectedDensity
    ? locale === 'pl'
      ? `${getLocalizedCalculatorOptionLabel(locale, 'density', selectedDensity.key, selectedDensity.label)}: dla flexu przyjmujemy ${formatCompactNumber(selectedDensity.flex_office_sqm_per_desk, 1)} mkw. w prywatnym module na stanowisko, a dla konwencji ${formatCompactNumber(selectedDensity.conventional_sqm_per_person_avg, 1)} mkw. na osobę.`
      : locale === 'en'
        ? `${getLocalizedCalculatorOptionLabel(locale, 'density', selectedDensity.key, selectedDensity.label)}: for flex we assume ${formatCompactNumber(selectedDensity.flex_office_sqm_per_desk, 1)} sqm within the private suite per desk and ${formatCompactNumber(selectedDensity.conventional_sqm_per_person_avg, 1)} sqm per person in a conventional office.`
        : `${getLocalizedCalculatorOptionLabel(locale, 'density', selectedDensity.key, selectedDensity.label)}: для flex ми приймаємо ${formatCompactNumber(selectedDensity.flex_office_sqm_per_desk, 1)} кв. м у приватному модулі на робоче місце, а для традиційного офісу ${formatCompactNumber(selectedDensity.conventional_sqm_per_person_avg, 1)} кв. м на особу.`
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
            <p className="overline mb-5">{getContentMessage(locale, 'calculator.hero.eyebrow', data.settings.intro_eyebrow)}</p>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 className="text-4xl md:text-5xl font-normal text-[var(--colliers-navy)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {getContentMessage(locale, 'calculator.hero.title', data.settings.intro_title)}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-body-muted">{getContentMessage(locale, 'calculator.hero.body', data.settings.intro_body)}</p>
              </div>
              <div className="surface-panel-soft p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{getContentMessage(locale, 'calculator.intro.important')}</p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#42547d]">
                  <li className="flex gap-3"><CheckCircle2 size={16} className="mt-1 text-[#1C54F4]" /> <span>{getContentMessage(locale, 'calculator.hero.disclaimer_approx', data.settings.intro_disclaimer_approx)}</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={16} className="mt-1 text-[#1C54F4]" /> <span>{getContentMessage(locale, 'calculator.hero.disclaimer_market', data.settings.intro_disclaimer_market)}</span></li>
                  <li className="flex gap-3"><CheckCircle2 size={16} className="mt-1 text-[#1C54F4]" /> <span>{getContentMessage(locale, 'calculator.hero.disclaimer_support', data.settings.intro_disclaimer_support)}</span></li>
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
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{getContentMessage(locale, 'calculator.inputs.title')}</p>
                      <p className="text-sm text-body-muted">
                        {getContentMessage(locale, 'calculator.inputs.lead')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`calculator-inputs-shell ${hasInputInteracted ? '' : 'is-active'}`}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputShell label={getContentMessage(locale, 'calculator.inputs.headcount')} hint={getContentMessage(locale, 'calculator.inputs.headcount_hint')}>
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

                    <InputShell label={getContentMessage(locale, 'calculator.inputs.city')}>
                      <select
                        value={inputs.citySlug}
                        onChange={(event) => updateInput('citySlug', event.target.value)}
                        className="form-input"
                      >
                        {localizedCityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </InputShell>

                    <InputShell label={getContentMessage(locale, 'calculator.inputs.location')}>
                      <select
                        value={inputs.locationType}
                        onChange={(event) => updateInput('locationType', event.target.value)}
                        className="form-input"
                      >
                        {localizedLocationOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </InputShell>

                    <InputShell label={getContentMessage(locale, 'calculator.inputs.fitout')}>
                      <select
                        value={inputs.fitoutStandard}
                        onChange={(event) => updateInput('fitoutStandard', event.target.value)}
                        className="form-input"
                      >
                        {localizedFitoutOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </InputShell>

                    <InputShell label={getContentMessage(locale, 'calculator.inputs.density')} hint={densityTooltip}>
                      <select
                        value={inputs.densityKey}
                        onChange={(event) => updateInput('densityKey', event.target.value)}
                        className="form-input"
                      >
                        {localizedDensityOptions.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </InputShell>

                    <InputShell label={getContentMessage(locale, 'calculator.inputs.conventional_term')}>
                      <select
                        value={String(inputs.conventionalLeaseMonths)}
                        onChange={(event) => updateInput('conventionalLeaseMonths', Number(event.target.value))}
                        className="form-input"
                      >
                        {data.settings.conventional_lease_options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {getLeaseLabel(locale, Number(option.value))}
                          </option>
                        ))}
                      </select>
                    </InputShell>

                    <InputShell label={getContentMessage(locale, 'calculator.inputs.flex_term')}>
                      <select
                        value={String(inputs.flexLeaseMonths)}
                        onChange={(event) => updateInput('flexLeaseMonths', Number(event.target.value))}
                        className="form-input"
                      >
                        {data.settings.flex_lease_options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {getLeaseLabel(locale, Number(option.value))}
                          </option>
                        ))}
                      </select>
                    </InputShell>

                    <div className="surface-panel p-5 sm:col-span-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{getContentMessage(locale, 'calculator.cta.title')}</p>
                      <p className="mt-3 text-sm leading-relaxed text-body-muted">
                        {getContentMessage(locale, 'calculator.cta.body')}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button onClick={() => setFormOpen(true)} className="btn-primary" type="button">
                          {getContentMessage(locale, 'calculator.cta.primary')}
                        </button>
                        <Link href={withLocalePath(locale, '/biura-serwisowane')} className="btn-outline">
                          {getContentMessage(locale, 'calculator.cta.secondary')} <ArrowRight size={14} />
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
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{getContentMessage(locale, 'calculator.summary.eyebrow')}</p>
                    <h2
                      className="mt-2 text-3xl font-normal text-[var(--colliers-navy)]"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {getContentMessage(locale, 'calculator.summary.title')}
                    </h2>
                  </div>
                  {result ? (
                    <p className="text-xs text-body-soft">
                      {formatContentMessage(locale, 'calculator.summary.rate_prefix', {
                        rate: formatCompactNumber(result.exchangeRate.eurPln, 4),
                        date: result.exchangeRate.effectiveDate,
                      })}
                    </p>
                  ) : null}
                </div>
              </div>

              {loading && !result ? (
                <div className="surface-panel p-10 text-center text-body-muted">
                  <Loader2 size={20} className="mx-auto animate-spin text-[#1C54F4]" />
                  <p className="mt-4">{getContentMessage(locale, 'calculator.loading')}</p>
                </div>
              ) : error ? (
                <div className="surface-panel p-8 text-center text-[#9a2339]">
                  <p className="font-semibold">{getContentMessage(locale, 'calculator.error.title')}</p>
                  <p className="mt-2 text-sm">{error}</p>
                </div>
              ) : result ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <ResultCard
                      label={getContentMessage(locale, 'calculator.card.conventional_liability')}
                      valuePln={result.totals.conventionalTotalLiabilityPln}
                      valueEur={result.totals.conventionalTotalLiabilityEur}
                      accent
                      detail={formatContentMessage(locale, 'calculator.card.conventional_liability_detail', {
                        months: result.inputs.conventionalLeaseMonths,
                      })}
                    />
                    <ResultCard
                      label={getContentMessage(locale, 'calculator.card.flex_liability')}
                      valuePln={result.totals.flexTotalLiabilityPln}
                      valueEur={result.totals.flexTotalLiabilityEur}
                      accent
                      detail={formatContentMessage(locale, 'calculator.card.flex_liability_detail', {
                        months: result.inputs.flexLeaseMonths,
                      })}
                    />
                    <ResultCard
                      label={getContentMessage(locale, 'calculator.card.conventional_for_flex_period')}
                      valuePln={result.totals.conventionalCostForFlexPeriodPln}
                      valueEur={result.totals.conventionalCostForFlexPeriodEur}
                      accent
                      detail={formatContentMessage(locale, 'calculator.card.conventional_for_flex_period_detail', {
                        flexMonths: result.inputs.flexLeaseMonths,
                        conventionalMonths: result.inputs.conventionalLeaseMonths,
                      })}
                    />
                    <ResultCard
                      label={getContentMessage(locale, 'calculator.card.flex_for_flex_period')}
                      valuePln={result.totals.flexCostForFlexPeriodPln}
                      valueEur={result.totals.flexCostForFlexPeriodEur}
                      accent
                      detail={formatContentMessage(locale, 'calculator.card.flex_for_flex_period_detail', {
                        months: result.inputs.flexLeaseMonths,
                      })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="surface-panel-soft p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                        {getContentMessage(locale, 'calculator.comparable_period.title')}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-body-muted">
                        {getContentMessage(locale, 'calculator.comparable_period.body')}
                      </p>
                    </div>
                    <div className="surface-panel-soft p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8ab1]">{getContentMessage(locale, 'calculator.comparable_period.conventional')}</p>
                          <p className="mt-2 text-lg font-semibold text-[#000759]">
                            {result.inputs.flexLeaseMonths} mies. z {result.inputs.conventionalLeaseMonths}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c8ab1]">{getContentMessage(locale, 'calculator.comparable_period.flex')}</p>
                          <p className="mt-2 text-lg font-semibold text-[#000759]">{formatContentMessage(locale, 'calculator.comparable_period.flex_full', { months: result.inputs.flexLeaseMonths })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <ResultCard
                      label={getContentMessage(locale, 'calculator.card.liability_reduction')}
                      valuePln={result.totals.liabilityReductionPln}
                      valueEur={result.totals.liabilityReductionEur}
                    />
                    <ResultCard
                      label={getContentMessage(locale, 'calculator.card.savings')}
                      valuePln={result.totals.comparablePeriodSavingsPln}
                      valueEur={result.totals.comparablePeriodSavingsEur}
                    />
                    <div className="border border-[#dbe4f3] bg-white p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{getContentMessage(locale, 'calculator.card.premium')}</p>
                      <div className="mt-4 space-y-2">
                        <p
                          className="text-3xl font-normal text-[var(--colliers-navy)]"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {formatCurrency(result.totals.flexPremiumPerCapitaMonthlyEur, 'EUR')}
                        </p>
                        <p className="text-sm text-body-muted">
                          {formatContentMessage(locale, 'calculator.card.premium_detail', {
                            pct: formatCompactNumber(result.totals.flexPremiumPct * 100, 1),
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] xl:items-start">
                    <div className="surface-panel p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{getContentMessage(locale, 'calculator.areas.title')}</p>
                      <div className="mt-5 space-y-4 text-sm">
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">{getContentMessage(locale, 'calculator.areas.conventional_net')}</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.conventionalNetAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            {getContentMessage(locale, 'calculator.areas.conventional_net_note')}
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">{getContentMessage(locale, 'calculator.areas.conventional_gross')}</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.conventionalGrossAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            {getContentMessage(locale, 'calculator.areas.conventional_gross_note')}
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">{getContentMessage(locale, 'calculator.areas.flex_private')}</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.flexPrivateAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            {getContentMessage(locale, 'calculator.areas.flex_private_note')}
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">{getContentMessage(locale, 'calculator.areas.flex_shared')}</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.flexGrossAreaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            {getContentMessage(locale, 'calculator.areas.flex_shared_note')}
                          </p>
                        </div>
                        <div className="border-b border-[#edf1f7] pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">{getContentMessage(locale, 'calculator.areas.conventional_per_person')}</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.conventionalGrossPerCapitaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            {getContentMessage(locale, 'calculator.areas.conventional_per_person_note')}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-body-muted">{getContentMessage(locale, 'calculator.areas.flex_per_desk')}</span>
                            <strong className="text-[var(--colliers-navy)]">
                              {formatCompactNumber(result.areas.flexGrossPerCapitaSqm)} mkw.
                            </strong>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-body-soft">
                            {getContentMessage(locale, 'calculator.areas.flex_per_desk_note')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="surface-panel p-5">
                      <div className="flex items-center gap-3">
                        <BarChart3 size={18} className="text-[#1C54F4]" />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">{getContentMessage(locale, 'calculator.monthly_costs.title')}</p>
                          <p className="text-sm text-body-muted">
                            {getContentMessage(locale, 'calculator.monthly_costs.lead')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-[var(--colliers-navy)]">
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                {getContentMessage(locale, 'calculator.monthly_costs.col_item')}
                              </th>
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                {getContentMessage(locale, 'calculator.monthly_costs.col_model')}
                              </th>
                              <th className="pb-3 pr-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                {getContentMessage(locale, 'calculator.monthly_costs.col_pln')}
                              </th>
                              <th className="pb-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4]">
                                {getContentMessage(locale, 'calculator.monthly_costs.col_eur')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.conventionalLineItems.map((item) => (
                              <tr key={`conv-${item.label}`} className="border-b border-[#edf1f7] align-top">
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">
                                  <div className="font-semibold">{getCalculatorLineItemContent(locale, item.label, item.note).label}</div>
                                  {item.note ? <div className="mt-1 text-xs text-body-soft">{getCalculatorLineItemContent(locale, item.label, item.note).note}</div> : null}
                                </td>
                                <td className="py-3 pr-4 text-body-muted">{getContentMessage(locale, 'calculator.monthly_costs.model_conventional')}</td>
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
                                  <div className="font-semibold">{getCalculatorLineItemContent(locale, item.label, item.note).label}</div>
                                  {item.note ? <div className="mt-1 text-xs text-body-soft">{getCalculatorLineItemContent(locale, item.label, item.note).note}</div> : null}
                                </td>
                                <td className="py-3 pr-4 text-body-muted">{getContentMessage(locale, 'calculator.monthly_costs.model_flex')}</td>
                                <td className="py-3 pr-4 text-[var(--colliers-navy)]">
                                  {formatCurrency(item.monthlyTotalPln, 'PLN')}
                                </td>
                                <td className="py-3 text-[var(--colliers-navy)]">
                                  {formatCurrency(item.monthlyTotalEur, 'EUR')}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-[#f7faff]">
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">{getContentMessage(locale, 'calculator.monthly_costs.total_conventional')}</td>
                              <td className="py-3 pr-4 text-body-muted">{getContentMessage(locale, 'calculator.monthly_costs.model_conventional')}</td>
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">
                                {formatCurrency(result.totals.conventionalMonthlyTotalPln, 'PLN')}
                              </td>
                              <td className="py-3 font-semibold text-[var(--colliers-navy)]">
                                {formatCurrency(result.totals.conventionalMonthlyTotalEur, 'EUR')}
                              </td>
                            </tr>
                            <tr className="bg-[#f7faff]">
                              <td className="py-3 pr-4 font-semibold text-[var(--colliers-navy)]">{getContentMessage(locale, 'calculator.monthly_costs.total_flex')}</td>
                              <td className="py-3 pr-4 text-body-muted">{getContentMessage(locale, 'calculator.monthly_costs.model_flex')}</td>
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
