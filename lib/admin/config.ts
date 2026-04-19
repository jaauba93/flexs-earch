export const ADMIN_EMAILS = (
  process.env.CMS_ADMIN_EMAILS
    ?.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean) ?? ['jakub.bawol@colliers.com']
)

export const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
  'colliers-flex'

export const CONTENT_LOCALES = ['pl', 'en', 'uk'] as const

export const CONTENT_LOCALE_LABELS: Record<(typeof CONTENT_LOCALES)[number], string> = {
  pl: 'Polski',
  en: 'Angielski',
  uk: 'Ukraiński',
}

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}
