export function formatPrice(price: number | null | undefined): string {
  if (!price) return '–'
  return `od ${price.toLocaleString('pl-PL')} PLN / stanowisko / miesiąc`
}

export function formatPriceShort(price: number | null | undefined): string {
  if (!price) return '–'
  return `od ${price.toLocaleString('pl-PL')} PLN`
}
