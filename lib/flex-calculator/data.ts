import { createAdminClient } from '@/lib/supabase/admin'
import {
  DEFAULT_DENSITY_OPTIONS,
  DEFAULT_FLEX_CALCULATOR_SETTINGS,
  DEFAULT_MARKET_DATA,
} from '@/lib/flex-calculator/defaults'
import type {
  FlexCalculatorCmsData,
  FlexCalculatorDensityOption,
  FlexCalculatorMarketDataRow,
  FlexCalculatorPublicData,
  FlexCalculatorSettings,
  SelectOption,
} from '@/lib/flex-calculator/types'

function normalizeSelectOptions(value: unknown, fallback: SelectOption[]) {
  if (!Array.isArray(value)) return fallback

  const options = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const candidate = item as Record<string, unknown>
      if (typeof candidate.value !== 'string' || typeof candidate.label !== 'string') return null
      return { value: candidate.value, label: candidate.label }
    })
    .filter((item): item is SelectOption => Boolean(item))

  return options.length ? options : fallback
}

function normalizeSettings(row?: Partial<FlexCalculatorSettings> | null): FlexCalculatorSettings {
  return {
    ...DEFAULT_FLEX_CALCULATOR_SETTINGS,
    ...row,
    location_options: normalizeSelectOptions(row?.location_options, DEFAULT_FLEX_CALCULATOR_SETTINGS.location_options),
    fitout_options: normalizeSelectOptions(row?.fitout_options, DEFAULT_FLEX_CALCULATOR_SETTINGS.fitout_options),
    flex_lease_options: normalizeSelectOptions(row?.flex_lease_options, DEFAULT_FLEX_CALCULATOR_SETTINGS.flex_lease_options),
    conventional_lease_options: normalizeSelectOptions(
      row?.conventional_lease_options,
      DEFAULT_FLEX_CALCULATOR_SETTINGS.conventional_lease_options
    ),
  }
}

function sortDensityOptions(options: FlexCalculatorDensityOption[]) {
  return [...options].sort((a, b) => a.sort_order - b.sort_order)
}

function sortMarketData(rows: FlexCalculatorMarketDataRow[]) {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order)
}

export async function getFlexCalculatorCmsData(): Promise<FlexCalculatorCmsData> {
  try {
    const admin = createAdminClient()
    const [settingsResult, densityResult, marketResult] = await Promise.all([
      admin.from('flex_calculator_settings').select('*').eq('id', 'default').maybeSingle(),
      admin.from('flex_calculator_density_options').select('*').order('sort_order'),
      admin.from('flex_calculator_market_data').select('*').order('sort_order'),
    ])

    const settings = normalizeSettings((settingsResult.data as Partial<FlexCalculatorSettings> | null) ?? null)
    const densityOptions =
      ((densityResult.data as FlexCalculatorDensityOption[] | null) ?? []).length > 0
        ? sortDensityOptions((densityResult.data as FlexCalculatorDensityOption[]) ?? [])
        : DEFAULT_DENSITY_OPTIONS
    const marketData =
      ((marketResult.data as FlexCalculatorMarketDataRow[] | null) ?? []).length > 0
        ? sortMarketData((marketResult.data as FlexCalculatorMarketDataRow[]) ?? [])
        : DEFAULT_MARKET_DATA

    return {
      settings,
      densityOptions,
      marketData,
    }
  } catch {
    return {
      settings: DEFAULT_FLEX_CALCULATOR_SETTINGS,
      densityOptions: DEFAULT_DENSITY_OPTIONS,
      marketData: DEFAULT_MARKET_DATA,
    }
  }
}

export async function getFlexCalculatorPublicData(): Promise<FlexCalculatorPublicData> {
  const cmsData = await getFlexCalculatorCmsData()
  const cityOptions = cmsData.marketData
    .filter((row) => row.is_active)
    .map((row) => ({ value: row.city_slug, label: row.city_label }))

  return {
    settings: cmsData.settings,
    densityOptions: cmsData.densityOptions.filter((option) => option.is_active),
    cityOptions,
  }
}
