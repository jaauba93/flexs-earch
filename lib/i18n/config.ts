export const PUBLIC_SITE_LOCALES = ['pl', 'en', 'uk'] as const

export const PUBLIC_SITE_LOCALE_LABELS: Record<(typeof PUBLIC_SITE_LOCALES)[number], string> = {
  pl: 'Polski',
  en: 'English',
  uk: 'Українська',
}

export const DEFAULT_PUBLIC_LOCALE = 'pl'
