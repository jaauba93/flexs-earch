import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/admin/auth'
import { buildTranslationWorkbook } from '@/lib/admin/translations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const buffer = await buildTranslationWorkbook()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=\"colliers-flex-translations.xlsx\"',
    },
  })
}
