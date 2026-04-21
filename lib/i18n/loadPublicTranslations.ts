import { createClient } from '@/lib/supabase/server'
import type { PublicLocale } from '@/lib/i18n/messages'

export type PublicTranslationRow = {
  key: string
  value_pl: string | null
  value_en: string | null
  value_uk: string | null
}

export type PublicTranslationsMap = Record<
  string,
  Partial<Record<PublicLocale, string>>
>

export async function loadPublicTranslations(): Promise<PublicTranslationsMap> {
  try {
    const supabase = await createClient()
    const { data, error } = await (supabase as any)
      .from('public_site_translations')
      .select('key, value_pl, value_en, value_uk')

    if (error || !Array.isArray(data)) {
      return {}
    }

    return (data as PublicTranslationRow[]).reduce<PublicTranslationsMap>((acc, row) => {
      acc[row.key] = {
        pl: row.value_pl ?? '',
        en: row.value_en ?? '',
        uk: row.value_uk ?? '',
      }
      return acc
    }, {})
  } catch {
    return {}
  }
}
