import { DEFAULT_PUBLIC_LOCALE, publicUiMessages, type PublicLocale } from '@/lib/i18n/messages'

export function getPublicMessage(locale: PublicLocale, key: string) {
  const segments = key.split('.')
  let current: unknown = publicUiMessages[locale] ?? publicUiMessages[DEFAULT_PUBLIC_LOCALE]

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      current = undefined
      break
    }

    current = (current as Record<string, unknown>)[segment]
  }

  if (typeof current === 'string') {
    return current
  }

  let fallback: unknown = publicUiMessages[DEFAULT_PUBLIC_LOCALE]
  for (const segment of segments) {
    if (!fallback || typeof fallback !== 'object' || !(segment in fallback)) {
      return key
    }

    fallback = (fallback as Record<string, unknown>)[segment]
  }

  return typeof fallback === 'string' ? fallback : key
}

export function formatPublicMessage(
  locale: PublicLocale,
  key: string,
  params: Record<string, string | number>
) {
  return Object.entries(params).reduce((message, [paramKey, paramValue]) => {
    return message.replaceAll(`{${paramKey}}`, String(paramValue))
  }, getPublicMessage(locale, key))
}
