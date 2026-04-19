'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/config'

export interface LoginState {
  error: string | null
}

function sanitizeNextPath(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : ''
  if (next.startsWith('/admin') && !next.startsWith('//')) {
    return next
  }
  return '/admin'
}

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const nextPath = sanitizeNextPath(formData.get('next'))

  if (!email || !password) {
    return { error: 'Podaj email i hasło administratora.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Nie udało się zalogować. Sprawdź email i hasło.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || !isAdminEmail(user.email)) {
    await supabase.auth.signOut()
    return { error: 'To konto nie ma uprawnień administracyjnych do CMS.' }
  }

  redirect(nextPath)
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
