import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const { id } = await params
  const payload = (await request.json()) as { isActive?: boolean; is_active?: boolean }
  const isActive = typeof payload.isActive === 'boolean' ? payload.isActive : Boolean(payload.is_active)

  const admin = createAdminClient()
  const { error } = await (admin.from('listings') as any).update({ is_active: isActive }).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
