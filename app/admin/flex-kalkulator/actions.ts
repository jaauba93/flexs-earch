'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type {
  FlexCalculatorDensityOption,
  FlexCalculatorMarketDataRow,
  FlexCalculatorSettings,
  SelectOption,
} from '@/lib/flex-calculator/types'

export interface SaveFlexCalculatorState {
  error: string | null
  success: string | null
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function readNumber(formData: FormData, key: string) {
  const value = readText(formData, key)
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function parseJson<T>(formData: FormData, key: string): T {
  const raw = readText(formData, key)
  if (!raw) {
    throw new Error(`Brak danych pola ${key}.`)
  }

  return JSON.parse(raw) as T
}

function sanitizeOptions(options: SelectOption[]) {
  return options
    .map((option) => ({
      value: String(option.value || '').trim(),
      label: String(option.label || '').trim(),
    }))
    .filter((option) => option.value.length > 0 && option.label.length > 0)
}

function sanitizeDensityOptions(options: FlexCalculatorDensityOption[]) {
  return options
    .map((option, index) => ({
      key: String(option.key || '').trim(),
      label: String(option.label || '').trim(),
      sort_order: Number.isFinite(Number(option.sort_order)) ? Number(option.sort_order) : index + 1,
      flex_office_sqm_per_desk: Number(option.flex_office_sqm_per_desk),
      conventional_sqm_per_person_min: Number(option.conventional_sqm_per_person_min),
      conventional_sqm_per_person_max: Number(option.conventional_sqm_per_person_max),
      conventional_sqm_per_person_avg: Number(option.conventional_sqm_per_person_avg),
      is_active: option.is_active !== false,
    }))
    .filter((option) => option.key.length > 0 && option.label.length > 0)
}

function sanitizeMarketData(rows: FlexCalculatorMarketDataRow[]) {
  return rows
    .map((row, index) => ({
      city_slug: String(row.city_slug || '').trim(),
      city_label: String(row.city_label || '').trim(),
      sort_order: Number.isFinite(Number(row.sort_order)) ? Number(row.sort_order) : index + 1,
      is_active: row.is_active !== false,
      headline_rent_cbd_eur: Number(row.headline_rent_cbd_eur),
      non_cbd_deduction_eur: Number(row.non_cbd_deduction_eur),
      service_charge_cbd_pln: Number(row.service_charge_cbd_pln),
      service_charge_non_cbd_pln: Number(row.service_charge_non_cbd_pln),
      flex_price_cbd_pln: Number(row.flex_price_cbd_pln),
      flex_price_non_cbd_pln: Number(row.flex_price_non_cbd_pln),
      fitout_contribution_cbd_eur: Number(row.fitout_contribution_cbd_eur),
      fitout_contribution_non_cbd_eur: Number(row.fitout_contribution_non_cbd_eur),
      fitout_cost_basic_eur: Number(row.fitout_cost_basic_eur),
      fitout_cost_enhanced_eur: Number(row.fitout_cost_enhanced_eur),
      fitout_cost_premium_eur: Number(row.fitout_cost_premium_eur),
    }))
    .filter((row) => row.city_slug.length > 0 && row.city_label.length > 0)
}

export async function saveFlexCalculatorAction(
  _: SaveFlexCalculatorState,
  formData: FormData
): Promise<SaveFlexCalculatorState> {
  try {
    const admin = createAdminClient()
    const settingsTable = admin.from('flex_calculator_settings') as any
    const densityTable = admin.from('flex_calculator_density_options') as any
    const marketTable = admin.from('flex_calculator_market_data') as any
    const locationOptions = sanitizeOptions(parseJson<SelectOption[]>(formData, 'location_options_json'))
    const fitoutOptions = sanitizeOptions(parseJson<SelectOption[]>(formData, 'fitout_options_json'))
    const flexLeaseOptions = sanitizeOptions(parseJson<SelectOption[]>(formData, 'flex_lease_options_json'))
    const conventionalLeaseOptions = sanitizeOptions(
      parseJson<SelectOption[]>(formData, 'conventional_lease_options_json')
    )
    const densityOptions = sanitizeDensityOptions(
      parseJson<FlexCalculatorDensityOption[]>(formData, 'density_options_json')
    )
    const marketData = sanitizeMarketData(parseJson<FlexCalculatorMarketDataRow[]>(formData, 'market_data_json'))

    const settings: Partial<FlexCalculatorSettings> = {
      id: 'default',
      intro_eyebrow: readText(formData, 'intro_eyebrow'),
      intro_title: readText(formData, 'intro_title'),
      intro_body: readText(formData, 'intro_body'),
      intro_disclaimer_approx: readText(formData, 'intro_disclaimer_approx'),
      intro_disclaimer_market: readText(formData, 'intro_disclaimer_market'),
      intro_disclaimer_support: readText(formData, 'intro_disclaimer_support'),
      default_headcount: readNumber(formData, 'default_headcount'),
      default_city_slug: readText(formData, 'default_city_slug'),
      default_location_type: readText(formData, 'default_location_type'),
      default_fitout_standard: readText(formData, 'default_fitout_standard'),
      default_density_key: readText(formData, 'default_density_key'),
      default_flex_lease_months: readNumber(formData, 'default_flex_lease_months'),
      default_conventional_lease_months: readNumber(formData, 'default_conventional_lease_months'),
      utilities_and_maintenance_eur_per_sqm: readNumber(formData, 'utilities_and_maintenance_eur_per_sqm'),
      flex_common_area_sqm_per_desk: readNumber(formData, 'flex_common_area_sqm_per_desk'),
      add_on_factor: readNumber(formData, 'add_on_factor'),
      rent_free_months_per_year: readNumber(formData, 'rent_free_months_per_year'),
      location_options: locationOptions,
      fitout_options: fitoutOptions,
      flex_lease_options: flexLeaseOptions,
      conventional_lease_options: conventionalLeaseOptions,
    }

    const { error: settingsError } = await settingsTable.upsert(settings)
    if (settingsError) {
      throw new Error(`Nie udało się zapisać ustawień kalkulatora: ${settingsError.message}`)
    }

    const { error: deleteDensityError } = await densityTable.delete().neq('key', '')
    if (deleteDensityError) {
      throw new Error(`Nie udało się odświeżyć profili zagęszczenia: ${deleteDensityError.message}`)
    }

    if (densityOptions.length > 0) {
      const { error: densityError } = await densityTable.insert(densityOptions)
      if (densityError) {
        throw new Error(`Nie udało się zapisać profili zagęszczenia: ${densityError.message}`)
      }
    }

    const { error: deleteMarketError } = await marketTable.delete().neq('city_slug', '')
    if (deleteMarketError) {
      throw new Error(`Nie udało się odświeżyć market data: ${deleteMarketError.message}`)
    }

    if (marketData.length > 0) {
      const { error: marketError } = await marketTable.insert(marketData)
      if (marketError) {
        throw new Error(`Nie udało się zapisać market data: ${marketError.message}`)
      }
    }

    revalidatePath('/kalkulator-flex')
    revalidatePath('/admin')
    revalidatePath('/admin/flex-kalkulator')

    return {
      error: null,
      success: 'Kalkulator został zapisany.',
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Nie udało się zapisać kalkulatora.',
      success: null,
    }
  }
}
