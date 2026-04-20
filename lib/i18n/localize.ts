import { DEFAULT_PUBLIC_LOCALE, type PublicLocale } from '@/lib/i18n/messages'

export function localizeField<T extends object>(
  record: T | null | undefined,
  baseField: string,
  locale: PublicLocale
) {
  if (!record) return null
  const source = record as Record<string, unknown>
  if (locale === DEFAULT_PUBLIC_LOCALE) {
    return (source[baseField] as string | null | undefined) ?? null
  }

  const localizedField = `${baseField}_${locale}`
  const localizedValue = source[localizedField]
  if (typeof localizedValue === 'string' && localizedValue.trim()) {
    return localizedValue
  }

  const baseValue = source[baseField]
  return typeof baseValue === 'string' ? baseValue : null
}
