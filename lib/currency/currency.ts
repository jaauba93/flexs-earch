export type CurrencyCode = 'PLN' | 'EUR' | 'USD' | 'GBP'

export type ForeignCurrencyCode = Exclude<CurrencyCode, 'PLN'>

export interface CurrencyRates {
  EUR: number
  USD: number
  GBP: number
  effectiveDate: string
  fetchedAt: string
  source: 'NBP'
}

export const CURRENCY_ORDER: CurrencyCode[] = ['PLN', 'EUR', 'USD', 'GBP']

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  PLN: 'PLN (polski złoty)',
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
}

export const CURRENCY_SHORT_LABELS: Record<CurrencyCode, string> = {
  PLN: 'PLN',
  EUR: 'EUR',
  USD: 'USD',
  GBP: 'GBP',
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PLN: 'PLN',
  EUR: '€',
  USD: '$',
  GBP: '£',
}

export const CURRENCY_NOTE =
  'Umowy na biura serwisowane w Polsce są zawierane w złotówkach. Przełącznik waluty służy wyłącznie do szybkiego podglądu.'

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value === 'PLN' || value === 'EUR' || value === 'USD' || value === 'GBP'
}

export function parsePlnAmount(input: number | string | null | undefined): number | null {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null
  }

  if (!input) return null

  const normalized = input
    .toLowerCase()
    .replace(/n\/a|n\/d|brak|–|—/g, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9,.-]/g, '')
    .replace(',', '.')

  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function convertFromPln(
  amountPln: number | string | null | undefined,
  currency: CurrencyCode,
  rates?: Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'> | null
): number | null {
  const parsed = parsePlnAmount(amountPln)
  if (parsed == null) return null
  if (currency === 'PLN') return parsed

  const rate = rates?.[currency]
  if (!rate || rate <= 0) return null

  return parsed / rate
}

export function formatCurrencyAmount(
  amountPln: number | string | null | undefined,
  currency: CurrencyCode,
  rates?: Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'> | null,
  options?: {
    prefix?: string
    suffix?: string
    decimals?: number
    fallback?: string
  }
): string {
  if (typeof amountPln === 'string' && /n\/a|n\/d|brak|–|—/i.test(amountPln)) {
    return options?.fallback ?? 'n/d'
  }

  const parsed = convertFromPln(amountPln, currency, rates)
  if (parsed == null) return options?.fallback ?? '–'

  const decimals = options?.decimals ?? 0
  const rounded = decimals === 0 ? Math.round(parsed) : Number(parsed.toFixed(decimals))
  const amountText = new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded)

  const unit = currency === 'PLN' ? 'PLN' : CURRENCY_SYMBOLS[currency]
  const prefix = options?.prefix ?? 'od '
  const suffix = options?.suffix ?? ''

  return `${prefix}${currency === 'PLN' ? `${amountText} ${unit}` : `${unit} ${amountText}`}${suffix}`
}

export function formatPricePreview(
  amountPln: number | string | null | undefined,
  currency: CurrencyCode,
  rates?: Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'> | null
): string {
  return formatCurrencyAmount(amountPln, currency, rates, {
    prefix: 'od ',
    suffix: ' / stanowisko / miesiąc',
    decimals: 0,
  })
}

export function formatPriceShort(
  amountPln: number | string | null | undefined,
  currency: CurrencyCode,
  rates?: Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'> | null
): string {
  return formatCurrencyAmount(amountPln, currency, rates, {
    prefix: 'od ',
    suffix: '',
    decimals: 0,
  })
}
