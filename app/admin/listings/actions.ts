'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTranslationSupport } from '@/lib/admin/data'
import { geocodeAddress } from '@/lib/admin/geocoding'
import { slugify } from '@/lib/utils/slugify'

export interface SaveListingState {
  error: string | null
  success: boolean
  savedListingId: string | null
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function readNumber(formData: FormData, key: string) {
  const value = readText(formData, key)
  if (!value) return null
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

export async function saveListingAction(_: SaveListingState, formData: FormData): Promise<SaveListingState> {
  const admin = createAdminClient()
  const listingsTable = admin.from('listings') as any
  const operatorsTable = admin.from('operators') as any
  const listingAmenitiesTable = admin.from('listing_amenities') as any
  const translationSupport = await getTranslationSupport()

  const listingId = readText(formData, 'id')
  const name = readText(formData, 'name')
  const slug = readText(formData, 'slug') || slugify(name || '')
  const operatorName = readText(formData, 'operator_name')
  const advisorId = readText(formData, 'advisor_id')
  const addressStreet = readText(formData, 'address_street')
  let addressPostcode = readText(formData, 'address_postcode')
  const addressCity = readText(formData, 'address_city')
  const amenityIds = formData.getAll('amenity_ids').filter((value): value is string => typeof value === 'string' && value.length > 0)
  let latitude = readNumber(formData, 'latitude')
  let longitude = readNumber(formData, 'longitude')
  let district = readText(formData, 'address_district')

  if (!name || !slug || !operatorName || !addressStreet || !addressCity) {
    return { error: 'Uzupełnij wymagane pola: nazwa, operator, adres i miasto.', success: false, savedListingId: null }
  }

  let operatorRecord = await operatorsTable.select('id, name, slug').ilike('name', operatorName).maybeSingle()
  if (operatorRecord.error) {
    return { error: `Nie udało się sprawdzić operatora: ${operatorRecord.error.message}`, success: false, savedListingId: null }
  }

  if (!operatorRecord.data) {
    const newOperatorSlug = slugify(operatorName)
    const { data: createdOperator, error: createOperatorError } = await operatorsTable
      .insert({ name: operatorName, slug: newOperatorSlug })
      .select('id, name, slug')
      .single()

    if (createOperatorError) {
      return { error: `Nie udało się utworzyć operatora: ${createOperatorError.message}`, success: false, savedListingId: null }
    }

    operatorRecord = { data: createdOperator, error: null }
  }

  if (latitude === null || longitude === null || !district) {
    const geocoded = await geocodeAddress({
      street: addressStreet,
      postcode: addressPostcode,
      city: addressCity,
    })

    latitude = latitude ?? geocoded.latitude
    longitude = longitude ?? geocoded.longitude
    district = district ?? geocoded.district
    addressPostcode = addressPostcode || geocoded.postcode || ''
  }

  if (latitude === null || longitude === null) {
    return {
      error: 'Nie udało się automatycznie ustalić koordynatów. Uzupełnij latitude i longitude lub popraw adres.',
      success: false,
      savedListingId: null,
    }
  }

  if (!addressPostcode) {
    return {
      error: 'Nie udało się ustalić kodu pocztowego na podstawie adresu. Uzupełnij go ręcznie lub popraw adres.',
      success: false,
      savedListingId: null,
    }
  }

  const payload: Record<string, unknown> = {
    operator_id: operatorRecord.data.id,
    advisor_id: advisorId,
    name,
    slug,
    description: readText(formData, 'description'),
    address_street: addressStreet,
    address_postcode: addressPostcode,
    address_city: addressCity,
    address_district: district,
    latitude,
    longitude,
    price_desk_private: readNumber(formData, 'price_desk_private'),
    price_desk_hotdesk: readNumber(formData, 'price_desk_hotdesk'),
    total_workstations: readNumber(formData, 'total_workstations'),
    min_office_size: readNumber(formData, 'min_office_size'),
    max_office_size: readNumber(formData, 'max_office_size'),
    year_opened: readNumber(formData, 'year_opened'),
    main_image_url: readText(formData, 'main_image_url'),
    is_active: formData.get('is_active') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  }

  if (translationSupport.name_en) payload.name_en = readText(formData, 'name_en')
  if (translationSupport.name_uk) payload.name_uk = readText(formData, 'name_uk')
  if (translationSupport.description_en) payload.description_en = readText(formData, 'description_en')
  if (translationSupport.description_uk) payload.description_uk = readText(formData, 'description_uk')

  let savedListingId = listingId

  if (listingId) {
    const { error } = await listingsTable.update(payload).eq('id', listingId)
    if (error) {
      return { error: `Nie udało się zapisać oferty: ${error.message}`, success: false, savedListingId: null }
    }
    savedListingId = listingId
  } else {
    const { data, error } = await listingsTable.insert(payload).select('id').single()
    if (error || !data?.id) {
      return {
        error: `Nie udało się utworzyć oferty: ${error?.message || 'nieznany błąd'}`,
        success: false,
        savedListingId: null,
      }
    }
    savedListingId = data.id
  }

  if (savedListingId) {
    const { error: deleteAmenitiesError } = await listingAmenitiesTable.delete().eq('listing_id', savedListingId)
    if (deleteAmenitiesError) {
      return {
        error: `Nie udało się odświeżyć listy udogodnień: ${deleteAmenitiesError.message}`,
        success: false,
        savedListingId: null,
      }
    }

    if (amenityIds.length > 0) {
      const { error: insertAmenitiesError } = await listingAmenitiesTable.insert(
        amenityIds.map((amenityId) => ({ listing_id: savedListingId, amenity_id: amenityId }))
      )

      if (insertAmenitiesError) {
        return {
          error: `Nie udało się zapisać udogodnień: ${insertAmenitiesError.message}`,
          success: false,
          savedListingId: null,
        }
      }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/listings')
  revalidatePath('/admin/advisors')
  revalidatePath(`/admin/listings/${savedListingId}`)
  return {
    error: null,
    success: true,
    savedListingId,
  }
}
