import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/config'

export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || !isAdminEmail(user.email)) {
    return null
  }

  return user
}

export async function requireAdminUser() {
  const user = await getAdminUser()

  if (!user) {
    redirect('/admin/login')
  }

  return user
}

export async function getAdminUserFromRequest(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Route handlers only need read access for this auth check.
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || !isAdminEmail(user.email)) {
    return null
  }

  return user
}
