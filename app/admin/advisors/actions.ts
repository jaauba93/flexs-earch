'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export interface SaveAdvisorState {
  error: string | null
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function saveAdvisorAction(_: SaveAdvisorState, formData: FormData): Promise<SaveAdvisorState> {
  const admin = createAdminClient()
  const advisorsTable = admin.from('advisors') as any

  const advisorId = readText(formData, 'id')
  const name = readText(formData, 'name')
  const email = readText(formData, 'email')

  if (!name || !email) {
    return { error: 'Uzupełnij wymagane pola: imię i nazwisko oraz e-mail.' }
  }

  const payload = {
    name,
    email,
    title: readText(formData, 'title'),
    phone: readText(formData, 'phone'),
    photo_url: readText(formData, 'photo_url'),
  }

  let savedAdvisorId = advisorId

  if (advisorId) {
    const { error } = await advisorsTable.update(payload).eq('id', advisorId)
    if (error) {
      return { error: `Nie udało się zapisać doradcy: ${error.message}` }
    }
  } else {
    const { data, error } = await advisorsTable.insert(payload).select('id').single()
    if (error || !data?.id) {
      return { error: `Nie udało się utworzyć doradcy: ${error?.message || 'nieznany błąd'}` }
    }
    savedAdvisorId = data.id
  }

  revalidatePath('/admin')
  revalidatePath('/admin/advisors')
  revalidatePath(`/admin/advisors/${savedAdvisorId}`)
  redirect(`/admin/advisors/${savedAdvisorId}${advisorId ? '?saved=1' : '?created=1'}`)
}
