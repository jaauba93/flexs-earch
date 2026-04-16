'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronRight, ShieldCheck, Users, Wallet, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ContactFormPrefill } from '@/components/forms/ContactForm'
import {
  buildRecommendationNote,
  DESK_COUNT_LABELS,
  getDeskPrefill,
  getRecommendationResult,
  OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY,
  SCALE_LABELS,
  TEAM_ACCESS_LABELS,
  TERM_LABELS,
  type DeskCountKey,
  type RecommendationAnswers,
  type ScaleKey,
  type TeamAccessKey,
  type TermKey,
} from '@/lib/recommendation/officeModelRecommendation'

interface OfficeModelWizardProps {
  onClose: () => void
  onOpenContactForm?: (prefill: ContactFormPrefill) => void
  onSearchCta?: () => void
}

const TOTAL_QUESTION_STEPS = 5
const WIZARD_STORAGE_KEY = 'colliers-flex-office-model-wizard-state'

const TEAM_ACCESS_OPTIONS: { key: TeamAccessKey; label: string }[] = [
  { key: '1', label: '1 osoba' },
  { key: '2-10', label: '2-10 osób' },
  { key: '11-50', label: '11-50 osób' },
  { key: '51+', label: '51+ osób' },
]

const DESK_COUNT_OPTIONS: { key: DeskCountKey; label: string }[] = [
  { key: '1', label: '1 stanowisko' },
  { key: '2-10', label: '2-10 stanowisk' },
  { key: '11-50', label: '11-50 stanowisk' },
  { key: '51+', label: '51+ stanowisk' },
]

const SCALE_OPTIONS: { key: ScaleKey; label: string }[] = [
  { key: '-2', label: 'Nieważne' },
  { key: '-1', label: 'Raczej nieważne' },
  { key: '0', label: 'Neutralnie' },
  { key: '1', label: 'Raczej ważne' },
  { key: '2', label: 'Bardzo ważne' },
]

const TERM_OPTIONS: { key: TermKey; label: string }[] = [
  { key: 'indefinite', label: 'Jak najkrótsza / maksymalna elastyczność' },
  { key: '12m', label: 'Do 12 miesięcy' },
  { key: '1to5y', label: '1-5 lat' },
  { key: '5yplus', label: 'Powyżej 5 lat' },
]

const STEP_META = [
  {
    title: 'Ile osób ma mieć dostęp do biura?',
    helper: 'Chodzi o cały zespół, który będzie z niego korzystać — także rotacyjnie.',
    icon: <Users size={20} className="text-[#1C54F4]" />,
  },
  {
    title: 'Ile stałych stanowisk pracy realnie potrzebujesz?',
    helper: 'Chodzi o faktyczną liczbę biurek dostępnych na co dzień, a nie liczbę wszystkich osób w zespole.',
    icon: <Users size={20} className="text-[#1C54F4]" />,
  },
  {
    title: 'Jak ważna jest prywatność?',
    helper: 'Na przykład możliwość pracy bez ekspozycji na przestrzeń wspólną, rozmów poufnych i większej kontroli dostępu.',
    icon: <ShieldCheck size={20} className="text-[#1C54F4]" />,
  },
  {
    title: 'Jak ważne jest ograniczenie CAPEX?',
    helper: 'Czyli ograniczenie kosztów wejścia, takich jak fit-out, meble, infrastruktura czy wdrożenie biura.',
    icon: <Wallet size={20} className="text-[#1C54F4]" />,
  },
  {
    title: 'Jaka jest maksymalna akceptowalna długość zobowiązania?',
    helper: '',
    icon: <ChevronRight size={20} className="text-[#1C54F4]" />,
  },
] as const

function StepOptionCard({
  title,
  active,
  onClick,
}: {
  title: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border px-5 py-4 text-left transition-all duration-300 ${
        active
          ? 'border-[#1C54F4] bg-[#edf3ff] shadow-[0_10px_30px_rgba(28,84,244,0.12)]'
          : 'border-[#dbe4f8] bg-white hover:border-[#9dbafc] hover:bg-[#f8fbff]'
      }`}
    >
      <span className={`block text-sm font-semibold ${active ? 'text-[#000759]' : 'text-[#1d2b56]'}`}>{title}</span>
    </button>
  )
}

function ScaleSelector({
  value,
  onChange,
}: {
  value?: ScaleKey
  onChange: (next: ScaleKey) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {SCALE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`border px-2 py-3 text-center transition-all duration-300 ${
              value === option.key
                ? 'border-[#1C54F4] bg-[#000759] text-white shadow-[0_12px_28px_rgba(0,7,89,0.2)]'
                : 'border-[#dbe4f8] bg-white text-[#4f5f88] hover:border-[#9dbafc] hover:text-[#000759]'
            }`}
          >
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em]">
              {option.key === '-2' ? '1' : option.key === '-1' ? '2' : option.key === '0' ? '3' : option.key === '1' ? '4' : '5'}
            </span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {SCALE_OPTIONS.map((option) => (
          <span key={option.key} className="text-[11px] leading-snug text-[#6c7ba5] text-center">
            {option.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function RankingBar({ label, score, active, compact = false }: { label: string; score: number; active: boolean; compact?: boolean }) {
  return (
    <div className={`space-y-2 ${compact ? 'min-h-[54px]' : 'min-h-[58px]'}`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm ${active ? 'font-semibold text-[#000759]' : 'text-[#53628c]'}`}>{label}</span>
        <span className={`text-xs font-bold ${active ? 'text-[#1C54F4]' : 'text-[#7a88b1]'}`}>{score}%</span>
      </div>
      <div className="h-2 overflow-hidden bg-[#e8eefc]">
        <div
          className={`h-full transition-all duration-500 ${active ? 'bg-[linear-gradient(90deg,#000759_0%,#1C54F4_100%)]' : 'bg-[linear-gradient(90deg,#8cb2ff_0%,#4D93FF_100%)]'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function AnimatedRankingList({
  ranking,
  compact = false,
}: {
  ranking: { key: string; label: string; score: number }[]
  compact?: boolean
}) {
  const rowHeight = compact ? 62 : 68

  return (
    <div className="relative" style={{ height: `${ranking.length * rowHeight}px` }}>
      {ranking.map((item, index) => (
        <div
          key={item.key}
          className="absolute left-0 right-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateY(${index * rowHeight}px)` }}
        >
          <RankingBar label={item.label} score={item.score} active={index === 0} compact={compact} />
        </div>
      ))}
    </div>
  )
}

function RecommendationPanel({
  topLabel,
  explanation,
  ranking,
  answeredCount,
  totalSteps,
  highSharingHint,
}: {
  topLabel: string | null
  explanation: string
  ranking: { key: string; label: string; score: number }[]
  answeredCount: number
  totalSteps: number
  highSharingHint: string | null
}) {
  return (
    <div className="border-l border-[#dbe4f8] bg-[linear-gradient(180deg,#fbfcff_0%,#f4f8ff_100%)] lg:sticky lg:top-0 lg:h-full">
      <div className="flex h-full flex-col p-6 md:p-7">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4] mb-2">Aktualna rekomendacja</p>
          <h3 className="text-2xl font-light text-[#000759]" style={{ fontFamily: 'var(--font-serif)' }}>
            {topLabel || 'Wybierz pierwszą odpowiedź'}
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-[#55648f] mb-6">{explanation}</p>

        <div className="rounded-none border border-[#dbe4f8] bg-white px-4 py-3 mb-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a88b1]">Postęp</span>
            <span className="text-sm font-semibold text-[#000759]">{answeredCount}/{totalSteps}</span>
          </div>
        </div>

        <AnimatedRankingList ranking={ranking} compact />

        {highSharingHint && (
          <p className="mt-6 text-xs leading-relaxed text-[#6f7fad]">
            {highSharingHint}
          </p>
        )}
      </div>
    </div>
  )
}

function MobileRecommendationSummary({
  topLabel,
  topScore,
  explanation,
}: {
  topLabel: string | null
  topScore: number
  explanation: string
}) {
  return (
    <div className="lg:hidden sticky bottom-0 z-10 border-t border-[#dbe4f8] bg-white/95 backdrop-blur px-5 py-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1C54F4] mb-1">Aktualna rekomendacja</p>
          <p className="text-sm font-semibold text-[#000759]">{topLabel || 'Uzupełnij odpowiedzi'}</p>
        </div>
        <span className="text-sm font-bold text-[#1C54F4]">{topScore}%</span>
      </div>
      <p className="text-xs leading-relaxed text-[#5d6c95]">{explanation}</p>
    </div>
  )
}

function AdvisorCard() {
  return (
    <div className="border border-[#dbe4f8] bg-[linear-gradient(135deg,#ffffff_0%,#f7faff_100%)] p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4] mb-4">Wsparcie doradcy</p>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 items-center justify-center bg-[#000759] text-white font-semibold">
          CF
        </div>
        <div>
          <p className="text-lg font-semibold text-[#000759]">Zespół Colliers Flex</p>
          <p className="text-sm text-[#5a6a95]">Doradztwo w zakresie biur serwisowanych</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <a href="mailto:jakub.bawol@colliers.com" className="block text-[#1C54F4] hover:underline">
          jakub.bawol@colliers.com
        </a>
        <a href="tel:+48223317800" className="block text-[#000759] hover:text-[#1C54F4] transition-colors">
          +48 22 331 78 00
        </a>
      </div>
    </div>
  )
}

export default function OfficeModelWizard({
  onClose,
  onOpenContactForm,
  onSearchCta,
}: OfficeModelWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<RecommendationAnswers>({})
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = window.sessionStorage.getItem(WIZARD_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as { step?: number; answers?: RecommendationAnswers }
        const restoredAnswers = parsed.answers || {}
        const isComplete =
          Boolean(
            restoredAnswers.teamAccess &&
            restoredAnswers.deskCount &&
            restoredAnswers.privacy &&
            restoredAnswers.capex &&
            restoredAnswers.term
          )

        setAnswers(restoredAnswers)
        setStep(isComplete ? TOTAL_QUESTION_STEPS : Math.min(parsed.step ?? 0, TOTAL_QUESTION_STEPS))
      }
    } catch {
      // ignore malformed stored state
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return

    window.sessionStorage.setItem(
      WIZARD_STORAGE_KEY,
      JSON.stringify({
        step,
        answers,
      })
    )
  }, [answers, isHydrated, step])

  const recommendation = useMemo(() => getRecommendationResult(answers), [answers])
  const currentStepMeta = STEP_META[step]
  const topScore = recommendation.topModelKey ? recommendation.normalizedScores[recommendation.topModelKey] : 50
  const isResultStep = step === TOTAL_QUESTION_STEPS

  function goNext() {
    setStep((current) => Math.min(TOTAL_QUESTION_STEPS, current + 1))
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  function canMoveForward() {
    switch (step) {
      case 0:
        return Boolean(answers.teamAccess)
      case 1:
        return Boolean(answers.deskCount)
      case 2:
        return Boolean(answers.privacy)
      case 3:
        return Boolean(answers.capex)
      case 4:
        return Boolean(answers.term)
      default:
        return true
    }
  }

  function openContactForm() {
    const topModelLabel = recommendation.topModelLabel || 'Brak jednoznacznej rekomendacji'
    const note = buildRecommendationNote(answers, topModelLabel)
    const prefill: ContactFormPrefill = {
      ...getDeskPrefill(answers.deskCount),
      message: note,
      extraOpen: true,
    }

    if (onOpenContactForm) {
      onOpenContactForm(prefill)
      return
    }

    try {
      sessionStorage.setItem(OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY, JSON.stringify(prefill))
    } catch {
      // ignore storage issues and fall back to normal search page navigation
    }

    onClose()
    router.push('/biura-serwisowane?open_contact=1')
  }

  function goToSearch() {
    if (onSearchCta) {
      onSearchCta()
      return
    }

    onClose()
    router.push('/biura-serwisowane')
  }

  function resetWizard() {
    setAnswers({})
    setStep(0)
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(WIZARD_STORAGE_KEY)
    }
  }

  if (!isHydrated) {
    return null
  }

  return (
    <div className="modal-backdrop overflow-y-auto" data-lenis-prevent onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="office-model-wizard-title"
        onClick={(event) => event.stopPropagation()}
        data-lenis-prevent
        className="relative my-auto bg-white w-full max-w-6xl shadow-2xl overflow-hidden"
        style={
          isResultStep
            ? {
                maxHeight: 'calc(100dvh - 48px)',
                height: 'auto',
                overflowY: 'auto',
                animation: 'modal-enter 0.25s cubic-bezier(0.22,1,0.36,1)',
              }
            : {
                height: 'min(92vh, 860px)',
                animation: 'modal-enter 0.25s cubic-bezier(0.22,1,0.36,1)',
              }
        }
      >
        <div className="sticky top-0 z-30 overflow-hidden border-b border-[#d6deef] bg-[linear-gradient(180deg,#ffffff_0%,#f4f7fd_100%)] shadow-[0_12px_28px_rgba(0,7,89,0.06)]">
          <div className="flex items-center justify-between px-6 md:px-8 py-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] mb-1">Dobierz model biura</p>
              <p className="text-sm text-[#6f7da7]">
                {isResultStep ? 'Wynik rekomendacji' : `Krok ${step + 1} z ${TOTAL_QUESTION_STEPS}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex h-10 items-center gap-2 border border-[#dbe4f8] bg-white px-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7a88b1] transition-colors hover:text-[#000759] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={14} />
                Wstecz
              </button>
              {!isResultStep ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canMoveForward()}
                  className="inline-flex h-10 items-center gap-2 border border-[#000759] bg-white px-3 text-xs font-bold uppercase tracking-[0.16em] text-[#000759] transition-colors hover:border-[#1C54F4] hover:text-[#1C54F4] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {step === TOTAL_QUESTION_STEPS - 1 ? 'Wynik' : 'Dalej'}
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetWizard}
                  className="inline-flex h-10 items-center border border-[#dbe4f8] bg-white px-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7a88b1] transition-colors hover:text-[#000759]"
                >
                  Zacznij od nowa
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center text-[#7a88b1] hover:text-[#000759] transition-colors"
                aria-label="Zamknij narzędzie"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="h-[4px] bg-[#e3eaf8]">
            <div
              className="h-full bg-[linear-gradient(90deg,#000759_0%,#1C54F4_100%)] transition-all duration-500"
              style={{ width: `${((Math.min(step, TOTAL_QUESTION_STEPS) + 1) / (TOTAL_QUESTION_STEPS + 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className={`${isResultStep ? 'block' : 'grid lg:grid-cols-[minmax(0,1fr)_360px]'} ${isResultStep ? '' : 'h-[calc(100%-92px)]'}`}>
          <div className="min-h-0 flex flex-col">
            <div className={`${isResultStep ? 'px-6 md:px-8 py-7 md:py-8' : 'flex-1 overflow-y-auto px-6 md:px-8 py-7 md:py-8'}`} data-lenis-prevent>
              <div
                key={isResultStep ? 'result' : `step-${step}`}
                className="animate-[wizard-step-in_0.32s_cubic-bezier(0.22,1,0.36,1)]"
              >
              {!isResultStep && currentStepMeta && (
                <div className="max-w-2xl">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="mt-1 flex h-11 w-11 items-center justify-center bg-[#edf3ff]">
                      {currentStepMeta.icon}
                    </div>
                    <div>
                      <h2 id="office-model-wizard-title" className="text-2xl md:text-3xl font-light text-[#000759] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                        {currentStepMeta.title}
                      </h2>
                      {currentStepMeta.helper && (
                        <p className="text-sm md:text-base leading-relaxed text-[#5a6a95]">{currentStepMeta.helper}</p>
                      )}
                    </div>
                  </div>

                  {step === 0 && (
                    <div className="space-y-3">
                      {TEAM_ACCESS_OPTIONS.map((option) => (
                        <StepOptionCard
                          key={option.key}
                          title={option.label}
                          active={answers.teamAccess === option.key}
                          onClick={() => setAnswers((current) => ({ ...current, teamAccess: option.key }))}
                        />
                      ))}
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-3">
                      {DESK_COUNT_OPTIONS.map((option) => (
                        <StepOptionCard
                          key={option.key}
                          title={option.label}
                          active={answers.deskCount === option.key}
                          onClick={() => setAnswers((current) => ({ ...current, deskCount: option.key }))}
                        />
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <ScaleSelector value={answers.privacy} onChange={(next) => setAnswers((current) => ({ ...current, privacy: next }))} />
                  )}

                  {step === 3 && (
                    <ScaleSelector value={answers.capex} onChange={(next) => setAnswers((current) => ({ ...current, capex: next }))} />
                  )}

                  {step === 4 && (
                    <div className="space-y-3">
                      {TERM_OPTIONS.map((option) => (
                        <StepOptionCard
                          key={option.key}
                          title={option.label}
                          active={answers.term === option.key}
                          onClick={() => setAnswers((current) => ({ ...current, term: option.key }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isResultStep && (
                <div className="space-y-8">
                  <div className="max-w-4xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1C54F4] mb-3">Wynik końcowy</p>
                    <h2 id="office-model-wizard-title" className="text-3xl md:text-4xl font-light text-[#000759] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                      {recommendation.topModelLabel || 'Brak jednoznacznej rekomendacji'}
                    </h2>
                    <p className="text-base leading-relaxed text-[#5a6a95]">
                      {recommendation.tieMessage || recommendation.explanation}
                    </p>
                  </div>

                  <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                    <div className="space-y-6">
                      <div className="border border-[#dbe4f8] bg-white p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] mb-4">Ranking modeli</p>
                        <AnimatedRankingList ranking={recommendation.ranking} />
                      </div>

                      {recommendation.topDescription && (
                        <div className="border border-[#dbe4f8] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] mb-4">Najwyżej dopasowany model</p>
                          <p className="text-base leading-relaxed text-[#4f5f88] mb-5">{recommendation.topDescription.description}</p>
                          <div className="grid gap-5 md:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#000759] mb-2">Dla kogo</p>
                              <p className="text-sm leading-relaxed text-[#5f6e98]">{recommendation.topDescription.dlaKogo}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#000759] mb-2">Na co uważać</p>
                              <p className="text-sm leading-relaxed text-[#5f6e98]">{recommendation.topDescription.naCoUwazac}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="border border-[#dbe4f8] bg-white p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1C54F4] mb-4">Podsumowanie odpowiedzi</p>
                        <div className="space-y-3 text-sm text-[#4f5f88]">
                          <SummaryRow label="Liczba osób z dostępem" value={answers.teamAccess ? TEAM_ACCESS_LABELS[answers.teamAccess] : '—'} />
                          <SummaryRow label="Liczba stałych stanowisk" value={answers.deskCount ? DESK_COUNT_LABELS[answers.deskCount] : '—'} />
                          <SummaryRow label="Prywatność" value={answers.privacy ? SCALE_LABELS[answers.privacy] : '—'} />
                          <SummaryRow label="Ograniczenie CAPEX" value={answers.capex ? SCALE_LABELS[answers.capex] : '—'} />
                          <SummaryRow label="Maksymalna długość zobowiązania" value={answers.term ? TERM_LABELS[answers.term] : '—'} />
                        </div>
                        {recommendation.highSharingHint && (
                          <p className="mt-5 text-xs leading-relaxed text-[#6f7fad]">{recommendation.highSharingHint}</p>
                        )}
                      </div>

                      <AdvisorCard />

                      <div className="space-y-3">
                        <button type="button" onClick={openContactForm} className="btn-primary w-full justify-center">
                          Przejdź do formularza kontaktowego
                        </button>
                        <button type="button" onClick={goToSearch} className="btn-outline w-full justify-center">
                          Przejdź do wyszukiwarki
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>

            {!isResultStep && (
              <div className="border-t border-[#e9edf6] px-6 md:px-8 py-5 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 text-sm text-[#7a88b1] hover:text-[#000759] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={15} />
                  Wstecz
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canMoveForward()}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === TOTAL_QUESTION_STEPS - 1 ? 'Zobacz wynik' : 'Dalej'}
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {isResultStep && (
              <div className="sticky bottom-0 z-20 border-t border-[#d6deef] bg-[linear-gradient(180deg,#f9fbff_0%,#eef3fb_100%)] px-6 md:px-8 py-5 flex items-center justify-between gap-4 shadow-[0_-12px_28px_rgba(0,7,89,0.06)]">
                <button type="button" onClick={goBack} className="btn-outline">
                  Wróć do odpowiedzi
                </button>
                <button type="button" onClick={onClose} className="btn-outline">
                  Zamknij
                </button>
              </div>
            )}

            {!isResultStep && (
              <MobileRecommendationSummary
                topLabel={recommendation.topModelLabel}
                topScore={topScore}
                explanation={recommendation.explanation}
              />
            )}
          </div>

          {!isResultStep && (
          <div className="hidden lg:block min-h-0 overflow-y-auto" data-lenis-prevent>
            <RecommendationPanel
              topLabel={recommendation.topModelLabel}
              explanation={recommendation.explanation}
              ranking={recommendation.ranking}
              answeredCount={recommendation.answeredCount}
              totalSteps={TOTAL_QUESTION_STEPS}
              highSharingHint={recommendation.highSharingHint}
            />
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#edf1f8] pb-3">
      <span className="text-[#7a88b1]">{label}</span>
      <span className="font-medium text-[#000759] text-right">{value}</span>
    </div>
  )
}
