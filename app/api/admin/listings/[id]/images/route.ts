import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUserFromRequest } from '@/lib/admin/auth'
import { STORAGE_BUCKET } from '@/lib/admin/config'

function fileExtension(file: File) {
  const explicit = file.name.split('.').pop()?.toLowerCase()
  if (explicit) return explicit
  if (file.type.includes('png')) return 'png'
  if (file.type.includes('webp')) return 'webp'
  return 'jpg'
}

function extractStoragePath(publicUrl: string) {
  try {
    const url = new URL(publicUrl)
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
    const index = url.pathname.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(url.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()
  const listingsTable = admin.from('listings') as any
  const imagesTable = admin.from('listing_images') as any
  const formData = await request.formData()
  const file = formData.get('file')
  const kind = String(formData.get('kind') || 'gallery')
  const altText = String(formData.get('altText') || '').trim() || null

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Brak pliku do uploadu.' }, { status: 400 })
  }

  const extension = fileExtension(file)
  const filePath =
    kind === 'main'
      ? `listings/${id}/main-${Date.now()}.${extension}`
      : `listings/${id}/${Date.now()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`

  const uploadResult = await admin.storage.from(STORAGE_BUCKET).upload(filePath, file, {
    contentType: file.type || undefined,
    upsert: true,
  })

  if (uploadResult.error) {
    return NextResponse.json({ error: `Nie udało się wysłać zdjęcia: ${uploadResult.error.message}` }, { status: 500 })
  }

  const { data: publicData } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
  const imageUrl = publicData.publicUrl

  if (kind === 'main') {
    const { error } = await listingsTable.update({ main_image_url: imageUrl }).eq('id', id)
    if (error) {
      return NextResponse.json({ error: `Nie udało się zapisać zdjęcia głównego: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ message: 'Zdjęcie główne zostało zapisane.' })
  }

  const { data: images } = await imagesTable.select('sort_order').eq('listing_id', id).order('sort_order', { ascending: false }).limit(1)
  const nextSortOrder = ((images?.[0]?.sort_order as number | undefined) ?? -1) + 1

  const { error } = await imagesTable.insert({
    listing_id: id,
    image_url: imageUrl,
    alt_text: altText,
    sort_order: nextSortOrder,
  })

  if (error) {
    return NextResponse.json({ error: `Nie udało się zapisać zdjęcia galerii: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ message: 'Zdjęcie galerii zostało zapisane.' })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()
  const listingsTable = admin.from('listings') as any
  const imagesTable = admin.from('listing_images') as any
  const payload = (await request.json()) as {
    imageId?: string
    altText?: string
    sortOrder?: string | number
    makeMain?: boolean
  }

  if (!payload.imageId) {
    return NextResponse.json({ error: 'Brak identyfikatora zdjęcia.' }, { status: 400 })
  }

  const sortOrder = Number(payload.sortOrder)
  const { data: image, error: imageError } = await imagesTable
    .select('*')
    .eq('id', payload.imageId)
    .eq('listing_id', id)
    .maybeSingle()

  if (imageError || !image) {
    return NextResponse.json({ error: 'Nie znaleziono zdjęcia galerii.' }, { status: 404 })
  }

  const { error: updateError } = await imagesTable
    .update({
      alt_text: payload.altText?.trim() || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : image.sort_order,
    })
    .eq('id', payload.imageId)

  if (updateError) {
    return NextResponse.json({ error: `Nie udało się zaktualizować zdjęcia: ${updateError.message}` }, { status: 500 })
  }

  if (payload.makeMain) {
    const { error: mainError } = await listingsTable.update({ main_image_url: image.image_url }).eq('id', id)
    if (mainError) {
      return NextResponse.json({ error: `Nie udało się ustawić zdjęcia głównego: ${mainError.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Metadane zdjęcia zostały zapisane.' })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const { id } = await params
  const admin = createAdminClient()
  const listingsTable = admin.from('listings') as any
  const imagesTable = admin.from('listing_images') as any
  const kind = request.nextUrl.searchParams.get('kind')
  const imageId = request.nextUrl.searchParams.get('imageId')

  if (kind === 'main') {
    const { data: listing } = await listingsTable.select('main_image_url').eq('id', id).maybeSingle()
    const path = listing?.main_image_url ? extractStoragePath(listing.main_image_url) : null
    if (path) {
      await admin.storage.from(STORAGE_BUCKET).remove([path])
    }

    const { error } = await listingsTable.update({ main_image_url: null }).eq('id', id)
    if (error) {
      return NextResponse.json({ error: `Nie udało się usunąć zdjęcia głównego: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ message: 'Zdjęcie główne zostało usunięte.' })
  }

  if (!imageId) {
    return NextResponse.json({ error: 'Brak identyfikatora zdjęcia.' }, { status: 400 })
  }

  const { data: image } = await imagesTable.select('image_url').eq('id', imageId).maybeSingle()
  const path = image?.image_url ? extractStoragePath(image.image_url) : null
  if (path) {
    await admin.storage.from(STORAGE_BUCKET).remove([path])
  }

  const { error } = await imagesTable.delete().eq('id', imageId).eq('listing_id', id)
  if (error) {
    return NextResponse.json({ error: `Nie udało się usunąć zdjęcia galerii: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ message: 'Zdjęcie galerii zostało usunięte.' })
}
