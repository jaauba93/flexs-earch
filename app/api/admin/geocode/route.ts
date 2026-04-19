import { NextRequest, NextResponse } from 'next/server'
import { getAdminUserFromRequest } from '@/lib/admin/auth'
import { geocodeAddress } from '@/lib/admin/geocoding'

export async function POST(request: NextRequest) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const payload = (await request.json()) as {
    street?: string
    postcode?: string
    city?: string
  }

  if (!payload.street || !payload.city) {
    return NextResponse.json({ error: 'Podaj ulicę i miasto do geokodowania.' }, { status: 400 })
  }

  const result = await geocodeAddress({
    street: payload.street,
    postcode: payload.postcode || null,
    city: payload.city,
  })

  return NextResponse.json(result)
}
