import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/admin/auth'
import { importTranslationWorkbook } from '@/lib/admin/translations'

export async function POST(request: NextRequest) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Nie znaleziono pliku do importu.' }, { status: 400 })
  }

  try {
    const summary = await importTranslationWorkbook(await file.arrayBuffer())
    return NextResponse.json({ summary })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import tłumaczeń nie powiódł się.' },
      { status: 500 }
    )
  }
}
