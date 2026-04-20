import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminUserFromRequest } from '@/lib/admin/auth'
import { buildImportPayload, parseImportWorkbook } from '@/lib/admin/import'
import { getTranslationSupport } from '@/lib/admin/data'
import { slugify } from '@/lib/utils/slugify'
import { geocodeAddress } from '@/lib/admin/geocoding'

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
    const admin = createAdminClient()
    const listingsTable = admin.from('listings') as any
    const operatorsTable = admin.from('operators') as any
    const listingAmenitiesTable = admin.from('listing_amenities') as any
    const translationSupport = await getTranslationSupport()
    const rows = parseImportWorkbook(await file.arrayBuffer())

    let created = 0
    let updated = 0
    let deleted = 0
    const errors: string[] = []

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index]
      try {
        if (row.action === 'delete') {
          if (!row.id && !row.slug) {
            errors.push(`Wiersz ${index + 2}: delete wymaga kolumny id albo slug.`)
            continue
          }

          const { error } = row.id
            ? await listingsTable.delete().eq('id', row.id)
            : await listingsTable.delete().eq('slug', row.slug!)

          if (error) {
            errors.push(`Wiersz ${index + 2}: ${error.message}`)
            continue
          }

          deleted += 1
          continue
        }

        let existingListing = null as Record<string, unknown> | null
        if (row.id || row.slug) {
          const existingQuery = row.id
            ? listingsTable.select('*').eq('id', row.id).maybeSingle()
            : listingsTable.select('*').eq('slug', row.slug!).maybeSingle()
          const { data } = await existingQuery
          existingListing = data as Record<string, unknown> | null
        }

        let operatorId = existingListing?.operator_id as string | undefined
        if (!operatorId && (row.operator_slug || row.operator_name)) {
          const operatorLookupQuery = row.operator_slug
            ? operatorsTable.select('id').eq('slug', row.operator_slug).maybeSingle()
            : operatorsTable.select('id').ilike('name', row.operator_name).maybeSingle()

          const { data: operator } = await operatorLookupQuery
          operatorId = (operator as { id?: string } | null)?.id
        }

        if (!operatorId && row.operator_name) {
          const { data: createdOperator, error: createOperatorError } = await operatorsTable
            .insert({ name: row.operator_name, slug: slugify(row.operator_name) })
            .select('id')
            .single()

          if (createOperatorError) {
            errors.push(`Wiersz ${index + 2}: ${createOperatorError.message}`)
            continue
          }

          operatorId = createdOperator?.id
        }

        if (!operatorId) {
          errors.push(`Wiersz ${index + 2}: nie znaleziono operatora po operator_slug.`)
          continue
        }

        let advisorId = existingListing?.advisor_id as string | undefined
        if (row.advisor_email) {
          const { data: advisor } = await admin.from('advisors').select('id').eq('email', row.advisor_email).maybeSingle()
          advisorId = (advisor as { id?: string } | null)?.id
        }

        const payload = {
          ...buildImportPayload(row, translationSupport, existingListing as never),
          operator_id: operatorId,
          advisor_id: advisorId ?? null,
        }

        const payloadRecord = payload as Record<string, unknown>
        if (
          ((payloadRecord.latitude ?? null) === null || (payloadRecord.longitude ?? null) === null || !payloadRecord.address_district) &&
          payloadRecord.address_street &&
          payloadRecord.address_city
        ) {
          const geocoded = await geocodeAddress({
            street: String(payloadRecord.address_street),
            postcode: String(payloadRecord.address_postcode || ''),
            city: String(payloadRecord.address_city),
            fallbackQueries: [row.name ?? '', row.description ?? ''],
          })

          payloadRecord.latitude = payloadRecord.latitude ?? geocoded.latitude
          payloadRecord.longitude = payloadRecord.longitude ?? geocoded.longitude
          payloadRecord.address_district = payloadRecord.address_district ?? geocoded.district
          payloadRecord.address_postcode = payloadRecord.address_postcode || geocoded.postcode || ''
        }

        if ((payloadRecord.latitude ?? null) === null || (payloadRecord.longitude ?? null) === null) {
          errors.push(`Wiersz ${index + 2}: nie udało się wyznaczyć latitude/longitude na podstawie adresu.`)
          continue
        }

        let targetListingId = existingListing?.id as string | undefined
        if (existingListing?.id) {
          const { error } = await listingsTable.update(payload).eq('id', existingListing.id as string)
          if (error) {
            errors.push(`Wiersz ${index + 2}: ${error.message}`)
            continue
          }
          updated += 1
        } else {
          const { data: createdListing, error } = await listingsTable.insert(payload).select('id').single()
          if (error || !createdListing?.id) {
            errors.push(`Wiersz ${index + 2}: ${error?.message || 'nie udało się utworzyć oferty'}`)
            continue
          }
          targetListingId = createdListing.id
          created += 1
        }

        if (targetListingId) {
          const { error: deleteAmenitiesError } = await listingAmenitiesTable.delete().eq('listing_id', targetListingId)
          if (deleteAmenitiesError) {
            errors.push(`Wiersz ${index + 2}: ${deleteAmenitiesError.message}`)
            continue
          }

          if (row.amenity_slugs.length > 0) {
            const { data: amenityRecords } = await admin.from('amenities').select('id, slug').in('slug', row.amenity_slugs)
            const amenitiesPayload =
              ((amenityRecords as Array<{ id: string; slug: string }> | null) ?? []).map((amenity) => ({
                listing_id: targetListingId,
                amenity_id: amenity.id,
              }))

            if (amenitiesPayload.length > 0) {
              const { error: insertAmenitiesError } = await listingAmenitiesTable.insert(amenitiesPayload)
              if (insertAmenitiesError) {
                errors.push(`Wiersz ${index + 2}: ${insertAmenitiesError.message}`)
              }
            }
          }
        }
      } catch (error) {
        errors.push(`Wiersz ${index + 2}: ${error instanceof Error ? error.message : 'nieznany błąd'}`)
      }
    }

    return NextResponse.json({
      summary: {
        created,
        updated,
        deleted,
        errors,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import nie powiódł się.' },
      { status: 500 }
    )
  }
}
