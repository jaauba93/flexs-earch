import {
  DEFAULT_PUBLIC_LOCALE,
  PUBLIC_SITE_LOCALES,
  type PublicLocale,
} from '@/lib/i18n/messages'

function isAbsoluteHref(href: string) {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  )
}

export function stripLocalePrefix(pathname: string) {
  if (!pathname.startsWith('/')) return pathname

  for (const locale of PUBLIC_SITE_LOCALES) {
    if (pathname === `/${locale}`) return '/'
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || '/'
    }
  }

  return pathname
}

export function detectLocaleFromPathname(pathname: string): PublicLocale | null {
  for (const locale of PUBLIC_SITE_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale
    }
  }

  return null
}

export function withLocalePath(locale: PublicLocale, href: string) {
  if (!href || isAbsoluteHref(href) || href.startsWith('#')) return href

  const normalized = href.startsWith('/') ? href : `/${href}`
  const stripped = stripLocalePrefix(normalized)

  if (stripped === '/') {
    return `/${locale}`
  }

  return `/${locale}${stripped}`
}

export function toDefaultLocalePath(href: string) {
  return withLocalePath(DEFAULT_PUBLIC_LOCALE, href)
}
