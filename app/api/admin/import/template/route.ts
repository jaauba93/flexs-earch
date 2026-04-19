import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getAdminUserFromRequest } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUserFromRequest(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Brak uprawnień administratora.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const [{ data: amenities }, { data: operators }, { data: advisors }] = await Promise.all([
    admin.from('amenities').select('slug, name, category').order('category').order('sort_order'),
    admin.from('operators').select('name, slug').order('name'),
    admin.from('advisors').select('name, email').order('name'),
  ])

  const amenityRows = (amenities ?? []) as Array<{ slug: string; name: string; category: string }>
  const operatorRows = (operators ?? []) as Array<{ name: string; slug: string }>
  const advisorRows = (advisors ?? []) as Array<{ name: string; email: string }>
  const amenityColumns = amenityRows.map((amenity) => `amenity__${amenity.slug}`)

  const templateRow = Object.fromEntries(
    [
      'action',
      'id',
      'slug',
      'name',
      'name_en',
      'name_uk',
      'description',
      'description_en',
      'description_uk',
      'operator_name',
      'operator_slug',
      'advisor_email',
      'address_street',
      'address_postcode',
      'address_city',
      'address_district',
      'latitude',
      'longitude',
      'price_desk_private',
      'price_desk_hotdesk',
      'total_workstations',
      'min_office_size',
      'max_office_size',
      'year_opened',
      'main_image_url',
      'is_active',
      'is_featured',
      ...amenityColumns,
    ].map((key) => [key, ''])
  )

  const sampleRow = {
    ...templateRow,
    action: 'upsert',
    name: 'Nowe biuro demo',
    operator_name: 'Nowy operator',
    advisor_email: advisorRows[0]?.email ?? '',
    address_street: 'Prosta 67',
    address_postcode: '00-838',
    address_city: 'Warszawa',
    is_active: 'tak',
    is_featured: 'nie',
  }

  const amenitySheet = amenityRows.map((amenity) => ({
    category: amenity.category,
    slug: amenity.slug,
    name: amenity.name,
    import_column: `amenity__${amenity.slug}`,
  }))

  const instructionsSheet = [
    {
      section: 'upsert',
      details: 'Dodaje nowy rekord albo aktualizuje istniejący po id lub slug.',
    },
    {
      section: 'delete',
      details: 'Usuwa ofertę po id lub slug. W kolumnie action wpisz delete.',
    },
    {
      section: 'operator_name',
      details: 'Możesz podać nową nazwę operatora. Jeśli nie istnieje, CMS utworzy operatora automatycznie.',
    },
    {
      section: 'latitude/longitude/district',
      details: 'Można zostawić puste. CMS spróbuje uzupełnić je automatycznie na podstawie adresu.',
    },
    {
      section: 'amenity__*',
      details: 'Wpisz tak/nie, true/false lub 1/0, aby oznaczyć dostępność udogodnienia.',
    },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([templateRow, sampleRow]), 'oferty_template')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(amenitySheet), 'amenities_reference')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(operatorRows), 'operators_reference')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(advisorRows), 'advisors_reference')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(instructionsSheet), 'instructions')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=\"colliers-flex-import-template.xlsx\"',
    },
  })
}
