'use client'

export const OFFICE_MODEL_CONTACT_PREFILL_STORAGE_KEY = 'colliers-flex-office-model-contact-prefill'

export type OfficeModelKey =
  | 'hotdesk'
  | 'privateOffice'
  | 'dedicatedSector'
  | 'traditionalOffice'

export type TeamAccessKey = '1' | '2-10' | '11-50' | '51+'
export type DeskCountKey = '1' | '2-10' | '11-50' | '51+'
export type ScaleKey = '-2' | '-1' | '0' | '1' | '2'
export type TermKey = 'indefinite' | '12m' | '1to5y' | '5yplus'
export type SharingRatioCategory = 'low' | 'medium' | 'high'

export interface RecommendationAnswers {
  teamAccess?: TeamAccessKey
  deskCount?: DeskCountKey
  privacy?: ScaleKey
  capex?: ScaleKey
  term?: TermKey
}

export interface ContactPrefillPayload {
  message: string
  workstations_from: string
  workstations_to: string
  extraOpen: boolean
}

interface RankedModel {
  key: OfficeModelKey
  label: string
  score: number
}

interface DriverContribution {
  key: string
  label: string
  weight: number
}

export interface OfficeModelDescription {
  description: string
  dlaKogo: string
  naCoUwazac: string
}

export interface RecommendationResult {
  answeredCount: number
  isComplete: boolean
  topModelKey: OfficeModelKey | null
  topModelLabel: string | null
  runnerUpKey: OfficeModelKey | null
  runnerUpLabel: string | null
  rawScores: Record<OfficeModelKey, number>
  normalizedScores: Record<OfficeModelKey, number>
  ranking: RankedModel[]
  explanation: string
  topDescription: OfficeModelDescription | null
  tieMessage: string | null
  sharingRatio: number | null
  sharingRatioCategory: SharingRatioCategory | null
  highSharingHint: string | null
  strongestDrivers: string[]
}

const MODEL_ORDER: OfficeModelKey[] = [
  'hotdesk',
  'privateOffice',
  'dedicatedSector',
  'traditionalOffice',
]

export const OFFICE_MODEL_LABELS: Record<OfficeModelKey, string> = {
  hotdesk: 'Hot-desk w coworkingu',
  privateOffice: 'Prywatne biuro',
  dedicatedSector: 'Dedykowany sektor',
  traditionalOffice: 'Biuro tradycyjne',
}

export const TEAM_ACCESS_LABELS: Record<TeamAccessKey, string> = {
  '1': '1 osoba',
  '2-10': '2–10 osób',
  '11-50': '11–50 osób',
  '51+': '51+ osób',
}

export const DESK_COUNT_LABELS: Record<DeskCountKey, string> = {
  '1': '1 stanowisko',
  '2-10': '2–10 stanowisk',
  '11-50': '11–50 stanowisk',
  '51+': '51+ stanowisk',
}

export const SCALE_LABELS: Record<ScaleKey, string> = {
  '-2': 'Nieważne',
  '-1': 'Raczej nieważne',
  '0': 'Neutralnie',
  '1': 'Raczej ważne',
  '2': 'Bardzo ważne',
}

export const TERM_LABELS: Record<TermKey, string> = {
  indefinite: 'Jak najkrótsza / maksymalna elastyczność',
  '12m': 'Do 12 miesięcy',
  '1to5y': '1–5 lat',
  '5yplus': 'Powyżej 5 lat',
}

const REPRESENTATIVE_RANGE_VALUES: Record<TeamAccessKey | DeskCountKey, number> = {
  '1': 1,
  '2-10': 6,
  '11-50': 30,
  '51+': 60,
}

const WEIGHTS = {
  q1: 2,
  q2: 3,
  privacy: 2,
  capex: 2,
  term: 2.5,
  sharing: 1.5,
} as const

const Q1_MATRIX: Record<TeamAccessKey, Record<OfficeModelKey, number>> = {
  '1': { hotdesk: 2, privateOffice: 1, dedicatedSector: -1, traditionalOffice: -2 },
  '2-10': { hotdesk: 0.5, privateOffice: 2, dedicatedSector: -0.5, traditionalOffice: -2 },
  '11-50': { hotdesk: -1, privateOffice: 1.5, dedicatedSector: 1, traditionalOffice: 0 },
  '51+': { hotdesk: -2, privateOffice: 0.5, dedicatedSector: 1.5, traditionalOffice: 1.5 },
}

const Q2_MATRIX: Record<DeskCountKey, Record<OfficeModelKey, number>> = {
  '1': { hotdesk: 2, privateOffice: 1, dedicatedSector: -1, traditionalOffice: -2 },
  '2-10': { hotdesk: 0.5, privateOffice: 2, dedicatedSector: -0.5, traditionalOffice: -2 },
  '11-50': { hotdesk: -1, privateOffice: 1.5, dedicatedSector: 2, traditionalOffice: 0 },
  '51+': { hotdesk: -2, privateOffice: 0.5, dedicatedSector: 2, traditionalOffice: 2 },
}

const PRIVACY_MATRIX: Record<ScaleKey, Record<OfficeModelKey, number>> = {
  '-2': { hotdesk: 2, privateOffice: 0.5, dedicatedSector: 0, traditionalOffice: 0 },
  '-1': { hotdesk: 1, privateOffice: 0, dedicatedSector: 0, traditionalOffice: 0 },
  '0': { hotdesk: 0, privateOffice: 0, dedicatedSector: 0, traditionalOffice: 0 },
  '1': { hotdesk: -0.5, privateOffice: 1, dedicatedSector: 1, traditionalOffice: 1 },
  '2': { hotdesk: -1.5, privateOffice: 1, dedicatedSector: 2, traditionalOffice: 2 },
}

const CAPEX_MATRIX: Record<ScaleKey, Record<OfficeModelKey, number>> = {
  '-2': { hotdesk: 0, privateOffice: 0, dedicatedSector: 0.5, traditionalOffice: 1.5 },
  '-1': { hotdesk: 0, privateOffice: 0.5, dedicatedSector: 0.5, traditionalOffice: 1 },
  '0': { hotdesk: 0, privateOffice: 0, dedicatedSector: 0, traditionalOffice: 0 },
  '1': { hotdesk: 1.5, privateOffice: 1.5, dedicatedSector: 1, traditionalOffice: -0.5 },
  '2': { hotdesk: 2, privateOffice: 2, dedicatedSector: 1.5, traditionalOffice: -1.5 },
}

const TERM_MATRIX: Record<TermKey, Record<OfficeModelKey, number>> = {
  indefinite: { hotdesk: 2, privateOffice: 1, dedicatedSector: -1, traditionalOffice: -4 },
  '12m': { hotdesk: 1, privateOffice: 2, dedicatedSector: 1, traditionalOffice: -1 },
  '1to5y': { hotdesk: 0, privateOffice: 1, dedicatedSector: 2, traditionalOffice: 0.5 },
  '5yplus': { hotdesk: -0.5, privateOffice: 0.5, dedicatedSector: 1, traditionalOffice: 2 },
}

const SHARING_ADJUSTMENT_MATRIX: Record<SharingRatioCategory, Record<OfficeModelKey, number>> = {
  low: { hotdesk: -0.5, privateOffice: 0.5, dedicatedSector: 0.5, traditionalOffice: 0.5 },
  medium: { hotdesk: 0.5, privateOffice: 0.5, dedicatedSector: 1, traditionalOffice: 0 },
  high: { hotdesk: 1.5, privateOffice: 0.5, dedicatedSector: 1, traditionalOffice: -1 },
}

const MODEL_DESCRIPTIONS: Record<OfficeModelKey, OfficeModelDescription> = {
  hotdesk: {
    description:
      'Hot-desk w coworkingu daje największą elastyczność i najniższy próg wejścia. Sprawdza się wtedy, gdy zespół korzysta z biura rotacyjnie i nie potrzebuje stałej, prywatnej przestrzeni.',
    dlaKogo:
      'Dla małych zespołów, osób pracujących hybrydowo, projektów tymczasowych i organizacji z wysoką rotacyjnością korzystania z biura.',
    naCoUwazac:
      'Trzeba uwzględnić niższy poziom prywatności, mniejszą kontrolę nad otoczeniem pracy i ograniczone możliwości personalizacji przestrzeni.',
  },
  privateOffice: {
    description:
      'Prywatne biuro łączy gotowe środowisko pracy z większą prywatnością i przewidywalnym kosztem wejścia. To najczęściej najbardziej zrównoważony model dla zespołów szukających elastyczności bez rezygnacji z własnej przestrzeni.',
    dlaKogo:
      'Dla zespołów 2–50 osób, które potrzebują stałych stanowisk, poufnych rozmów i szybkiego startu bez inwestowania w pełny fit-out.',
    naCoUwazac:
      'Warto sprawdzić zakres usług w cenie, możliwość skalowania modułu i to, czy standard przestrzeni odpowiada oczekiwaniom zespołu.',
  },
  dedicatedSector: {
    description:
      'Dedykowany sektor zapewnia większą kontrolę nad układem, prywatnością i identyfikacją przestrzeni, a jednocześnie zachowuje część elastyczności charakterystycznej dla modeli flex.',
    dlaKogo:
      'Dla większych zespołów, firm rozwijających lokalny hub oraz organizacji, które chcą połączyć branding, prywatność i krótszy czas wejścia niż w najmie tradycyjnym.',
    naCoUwazac:
      'Przed wyborem dobrze porównać warunki komercyjne, indeksację, zakres personalizacji i realną możliwość dalszej ekspansji.',
  },
  traditionalOffice: {
    description:
      'Biuro tradycyjne daje największą kontrolę nad aranżacją, polityką dostępu i długofalowym kosztem przy dużej skali. Najlepiej działa tam, gdzie zespół jest stabilny i potrzebuje długiego horyzontu planowania.',
    dlaKogo:
      'Dla dużych organizacji, zespołów o niskiej rotacyjności i firm gotowych na dłuższe zobowiązanie oraz większy udział własnych nakładów inwestycyjnych.',
    naCoUwazac:
      'Największym ryzykiem są CAPEX, dłuższy czas uruchomienia i mniejsza elastyczność przy zmianach skali lub struktury zespołu.',
  },
}

function getSharingRatioCategory(teamAccess: TeamAccessKey, deskCount: DeskCountKey) {
  const sharingRatio = REPRESENTATIVE_RANGE_VALUES[teamAccess] / REPRESENTATIVE_RANGE_VALUES[deskCount]

  if (sharingRatio <= 1.2) {
    return { sharingRatio, category: 'low' as const }
  }

  if (sharingRatio <= 1.8) {
    return { sharingRatio, category: 'medium' as const }
  }

  return { sharingRatio, category: 'high' as const }
}

function getTeamAccessDriverLabel(value: TeamAccessKey) {
  switch (value) {
    case '1':
    case '2-10':
      return 'mała liczba osób z dostępem'
    case '11-50':
      return 'średnia skala zespołu'
    case '51+':
      return 'duża liczba osób z dostępem'
  }
}

function getDeskCountDriverLabel(value: DeskCountKey) {
  switch (value) {
    case '1':
    case '2-10':
      return 'mała liczba stałych stanowisk'
    case '11-50':
      return 'duża liczba stanowisk'
    case '51+':
      return 'bardzo duża liczba stanowisk'
  }
}

function getPrivacyDriverLabel(value: ScaleKey) {
  switch (value) {
    case '-2':
    case '-1':
      return 'niska potrzeba prywatności'
    case '0':
      return 'neutralne podejście do prywatności'
    case '1':
    case '2':
      return 'wysoka potrzeba prywatności'
  }
}

function getCapexDriverLabel(value: ScaleKey) {
  switch (value) {
    case '-2':
    case '-1':
      return 'niska presja na ograniczenie CAPEX'
    case '0':
      return 'neutralne podejście do CAPEX'
    case '1':
    case '2':
      return 'ważne ograniczenie CAPEX'
  }
}

function getTermDriverLabel(value: TermKey) {
  switch (value) {
    case 'indefinite':
    case '12m':
      return 'wysoka elastyczność'
    case '1to5y':
      return 'średni horyzont zobowiązania'
    case '5yplus':
      return 'dłuższa akceptowalna umowa'
  }
}

function getSharingDriverLabel(value: SharingRatioCategory) {
  switch (value) {
    case 'low':
      return 'niski poziom rotacyjności'
    case 'medium':
      return 'umiarkowany poziom rotacyjności'
    case 'high':
      return 'wysoki poziom rotacyjności'
  }
}

function formatList(items: string[]) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} i ${items[1]}`
  return `${items.slice(0, -1).join(', ')} i ${items[items.length - 1]}`
}

export function getTopModelDescription(modelKey: OfficeModelKey | null) {
  return modelKey ? MODEL_DESCRIPTIONS[modelKey] : null
}

export function getRecommendationLabel(modelKey: OfficeModelKey | null) {
  return modelKey ? OFFICE_MODEL_LABELS[modelKey] : null
}

export function buildRecommendationNote(answers: RecommendationAnswers, topModelLabel: string) {
  return [
    'Wynik narzędzia „Dobierz model biura”:',
    `- Rekomendowany model: ${topModelLabel}`,
    `- Liczba osób z dostępem: ${answers.teamAccess ? TEAM_ACCESS_LABELS[answers.teamAccess] : 'Nie określono'}`,
    `- Liczba stałych stanowisk: ${answers.deskCount ? DESK_COUNT_LABELS[answers.deskCount] : 'Nie określono'}`,
    `- Prywatność: ${answers.privacy ? SCALE_LABELS[answers.privacy] : 'Nie określono'}`,
    `- Ograniczenie CAPEX: ${answers.capex ? SCALE_LABELS[answers.capex] : 'Nie określono'}`,
    `- Maksymalna długość zobowiązania: ${answers.term ? TERM_LABELS[answers.term] : 'Nie określono'}`,
  ].join('\n')
}

export function getDeskPrefill(value?: DeskCountKey): Pick<ContactPrefillPayload, 'workstations_from' | 'workstations_to'> {
  switch (value) {
    case '1':
      return { workstations_from: '1', workstations_to: '1' }
    case '2-10':
      return { workstations_from: '2', workstations_to: '10' }
    case '11-50':
      return { workstations_from: '11', workstations_to: '50' }
    case '51+':
      return { workstations_from: '51', workstations_to: '' }
    default:
      return { workstations_from: '', workstations_to: '' }
  }
}

export function getRecommendationResult(answers: RecommendationAnswers): RecommendationResult {
  const rawScores: Record<OfficeModelKey, number> = {
    hotdesk: 0,
    privateOffice: 0,
    dedicatedSector: 0,
    traditionalOffice: 0,
  }

  const contributionMap: Record<OfficeModelKey, DriverContribution[]> = {
    hotdesk: [],
    privateOffice: [],
    dedicatedSector: [],
    traditionalOffice: [],
  }

  let answeredCount = 0
  let sharingRatio: number | null = null
  let sharingRatioCategory: SharingRatioCategory | null = null

  const applyMatrix = (
    matrix: Record<string, Record<OfficeModelKey, number>>,
    value: string | undefined,
    weight: number,
    driverLabel: string
  ) => {
    if (!value) return
    answeredCount += 1

    MODEL_ORDER.forEach((modelKey) => {
      const weightedValue = matrix[value][modelKey] * weight
      rawScores[modelKey] += weightedValue

      if (weightedValue > 0) {
        contributionMap[modelKey].push({
          key: `${driverLabel}-${modelKey}-${value}`,
          label: driverLabel,
          weight: weightedValue,
        })
      }
    })
  }

  if (answers.teamAccess) {
    applyMatrix(Q1_MATRIX, answers.teamAccess, WEIGHTS.q1, getTeamAccessDriverLabel(answers.teamAccess))
  }

  if (answers.deskCount) {
    applyMatrix(Q2_MATRIX, answers.deskCount, WEIGHTS.q2, getDeskCountDriverLabel(answers.deskCount))
  }

  if (answers.privacy) {
    applyMatrix(PRIVACY_MATRIX, answers.privacy, WEIGHTS.privacy, getPrivacyDriverLabel(answers.privacy))
  }

  if (answers.capex) {
    applyMatrix(CAPEX_MATRIX, answers.capex, WEIGHTS.capex, getCapexDriverLabel(answers.capex))
  }

  if (answers.term) {
    applyMatrix(TERM_MATRIX, answers.term, WEIGHTS.term, getTermDriverLabel(answers.term))
  }

  if (answers.teamAccess && answers.deskCount) {
    const sharing = getSharingRatioCategory(answers.teamAccess, answers.deskCount)
    sharingRatio = sharing.sharingRatio
    sharingRatioCategory = sharing.category

    MODEL_ORDER.forEach((modelKey) => {
      const weightedValue = SHARING_ADJUSTMENT_MATRIX[sharing.category][modelKey] * WEIGHTS.sharing
      rawScores[modelKey] += weightedValue

      if (weightedValue > 0) {
        contributionMap[modelKey].push({
          key: `sharing-${modelKey}-${sharing.category}`,
          label: getSharingDriverLabel(sharing.category),
          weight: weightedValue,
        })
      }
    })
  }

  const scoreValues = MODEL_ORDER.map((modelKey) => rawScores[modelKey])
  const minScore = Math.min(...scoreValues)
  const maxScore = Math.max(...scoreValues)

  const normalizedScores = MODEL_ORDER.reduce<Record<OfficeModelKey, number>>((acc, modelKey) => {
    if (maxScore === minScore) {
      acc[modelKey] = 50
      return acc
    }

    acc[modelKey] = Math.round(((rawScores[modelKey] - minScore) / (maxScore - minScore)) * 100)
    return acc
  }, {
    hotdesk: 50,
    privateOffice: 50,
    dedicatedSector: 50,
    traditionalOffice: 50,
  })

  const ranking = [...MODEL_ORDER]
    .sort((a, b) => normalizedScores[b] - normalizedScores[a] || MODEL_ORDER.indexOf(a) - MODEL_ORDER.indexOf(b))
    .map((modelKey) => ({
      key: modelKey,
      label: OFFICE_MODEL_LABELS[modelKey],
      score: normalizedScores[modelKey],
    }))

  const topModelKey = answeredCount === 0 ? null : ranking[0].key
  const runnerUpKey = answeredCount === 0 ? null : ranking[1].key
  const topModelLabel = topModelKey ? OFFICE_MODEL_LABELS[topModelKey] : null
  const runnerUpLabel = runnerUpKey ? OFFICE_MODEL_LABELS[runnerUpKey] : null
  const scoreDelta = answeredCount === 0 ? 0 : ranking[0].score - ranking[1].score
  const isComplete = Boolean(
    answers.teamAccess &&
    answers.deskCount &&
    answers.privacy &&
    answers.capex &&
    answers.term
  )

  const tieMessage = (
    isComplete &&
    topModelLabel &&
    runnerUpLabel &&
    scoreDelta < 5
  )
    ? `Najlepiej dopasowane są dwa modele: ${topModelLabel} i ${runnerUpLabel}. Ostateczny wybór zależy głównie od budżetu, oczekiwanego poziomu prywatności i preferowanej długości umowy.`
    : null

  const strongestDrivers = topModelKey
    ? [...contributionMap[topModelKey]]
        .sort((a, b) => b.weight - a.weight)
        .reduce<string[]>((acc, item) => {
          if (acc.includes(item.label)) return acc
          acc.push(item.label)
          return acc
        }, [])
        .slice(0, 3)
    : []

  let explanation = 'Wybierz pierwszy wariant, aby zobaczyć wstępną rekomendację.'

  if (tieMessage) {
    explanation = tieMessage
  } else if (topModelLabel && strongestDrivers.length > 0) {
    explanation = `Na ten moment prowadzi ${topModelLabel} głównie ze względu na: ${formatList(strongestDrivers)}.`
  } else if (topModelLabel) {
    explanation = `Na ten moment najwyżej wypada ${topModelLabel}. Kolejne odpowiedzi doprecyzują wynik.`
  }

  return {
    answeredCount,
    isComplete,
    topModelKey,
    topModelLabel,
    runnerUpKey,
    runnerUpLabel,
    rawScores,
    normalizedScores,
    ranking,
    explanation,
    topDescription: getTopModelDescription(topModelKey),
    tieMessage,
    sharingRatio,
    sharingRatioCategory,
    highSharingHint: sharingRatioCategory === 'high'
      ? 'Twoje odpowiedzi sugerują wysoki poziom rotacyjności korzystania z biura.'
      : null,
    strongestDrivers,
  }
}
