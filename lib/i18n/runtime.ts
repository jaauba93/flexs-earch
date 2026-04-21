import { getStaticPageContentEntries } from '@/lib/i18n/contentCatalog'
import {
  DEFAULT_PUBLIC_LOCALE,
  publicUiMessages,
  type PublicLocale,
} from '@/lib/i18n/messages'

export type RuntimeTranslationOverrides = Record<
  string,
  Partial<Record<PublicLocale, string>>
>

let runtimeTranslationOverrides: RuntimeTranslationOverrides = {}

function flattenMessages(
  input: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      acc[nextKey] = value
      return acc
    }

    if (value && typeof value === 'object') {
      Object.assign(acc, flattenMessages(value as Record<string, unknown>, nextKey))
    }

    return acc
  }, {})
}

const flattenedUiMessages = {
  pl: flattenMessages(publicUiMessages.pl),
  en: flattenMessages(publicUiMessages.en),
  uk: flattenMessages(publicUiMessages.uk),
} satisfies Record<PublicLocale, Record<string, string>>

const staticPageContent = getStaticPageContentEntries().reduce<Record<string, string>>(
  (acc, entry) => {
    acc[entry.key] = entry.value_pl
    return acc
  },
  {}
)

export function setRuntimeTranslationOverrides(next: RuntimeTranslationOverrides) {
  runtimeTranslationOverrides = next
}

function resolveOverride(locale: PublicLocale, key: string) {
  const entry = runtimeTranslationOverrides[key]
  if (!entry) return null

  const localized = entry[locale]
  if (typeof localized === 'string' && localized.trim()) {
    return localized
  }

  const defaultValue = entry[DEFAULT_PUBLIC_LOCALE]
  if (typeof defaultValue === 'string' && defaultValue.trim()) {
    return defaultValue
  }

  return null
}

export function getPublicMessage(locale: PublicLocale, key: string) {
  const override = resolveOverride(locale, key)
  if (override) return override

  return (
    flattenedUiMessages[locale][key] ??
    flattenedUiMessages[DEFAULT_PUBLIC_LOCALE][key] ??
    key
  )
}

export function getContentMessage(
  locale: PublicLocale,
  key: string,
  fallback?: string
) {
  const override = resolveOverride(locale, key)
  if (override) return override

  return fallback ?? staticPageContent[key] ?? key
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

export function formatContentMessage(
  locale: PublicLocale,
  key: string,
  params: Record<string, string | number>,
  fallback?: string
) {
  return Object.entries(params).reduce((message, [paramKey, paramValue]) => {
    return message.replaceAll(`{${paramKey}}`, String(paramValue))
  }, getContentMessage(locale, key, fallback))
}
