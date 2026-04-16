import type { CurrencyCode, CurrencyRates } from '@/lib/currency/currency'
import { formatPricePreview, formatPriceShort as formatCurrencyShort } from '@/lib/currency/currency'

export function formatPrice(
  price: number | string | null | undefined,
  currency: CurrencyCode = 'PLN',
  rates?: Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'>
): string {
  return formatPricePreview(price, currency, rates)
}

export function formatPriceShort(
  price: number | string | null | undefined,
  currency: CurrencyCode = 'PLN',
  rates?: Pick<CurrencyRates, 'EUR' | 'USD' | 'GBP'>
): string {
  return formatCurrencyShort(price, currency, rates)
}
