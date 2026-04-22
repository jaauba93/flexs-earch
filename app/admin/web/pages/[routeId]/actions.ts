'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { PUBLIC_SITE_LOCALES } from '@/lib/i18n/messages'
import { withLocalePath } from '@/lib/i18n/routing'
import { buildWebTranslationUpserts, getWebRouteEditorData } from '@/lib/admin/webContent'

export interface SaveWebRouteState {
  status: 'idle' | 'success' | 'error'
  message?: string
}

export async function saveWebRouteAction(
  routeId: string,
  _prevState: SaveWebRouteState,
  formData: FormData
): Promise<SaveWebRouteState> {
  const routeData = await getWebRouteEditorData(routeId)

  if (!routeData) {
    return { status: 'error', message: 'Nie znaleziono strony w mapie CMS.' }
  }

  const values = routeData.items.reduce<Record<string, { pl: string; en: string; uk: string }>>((acc, item) => {
    acc[item.key] = {
      pl: String(formData.get(`${item.key}__pl`) ?? ''),
      en: String(formData.get(`${item.key}__en`) ?? ''),
      uk: String(formData.get(`${item.key}__uk`) ?? ''),
    }
    return acc
  }, {})

  const admin = createAdminClient()
  const { error } = await (admin as any)
    .from('public_site_translations')
    .upsert(buildWebTranslationUpserts(routeData, values), { onConflict: 'key' })

  if (error) {
    return { status: 'error', message: `Nie udało się zapisać tłumaczeń: ${error.message}` }
  }

  revalidatePath('/admin/web')
  revalidatePath('/admin/web/pages')
  revalidatePath(`/admin/web/pages/${routeId}`)

  if (routeData.route.startsWith('/')) {
    PUBLIC_SITE_LOCALES.forEach((locale) => {
      revalidatePath(withLocalePath(locale, routeData.route))
    })
  } else {
    PUBLIC_SITE_LOCALES.forEach((locale) => {
      revalidatePath(withLocalePath(locale, '/'))
    })
  }

  return { status: 'success', message: 'Zmiany zapisane.' }
}
