import {
  DEFAULT_DENSITY_OPTIONS,
  DEFAULT_MARKET_DATA,
} from '@/lib/flex-calculator/defaults'
import type {
  FlexCalculatorComputedResult,
  FlexCalculatorDensityOption,
  FlexCalculatorInputs,
  FlexCalculatorMarketDataRow,
  FlexCalculatorSettings,
  SelectOption,
} from '@/lib/flex-calculator/types'

function round(value: number, digits = 2) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function findOption(options: SelectOption[], value: string, fallback: string) {
  return options.find((option) => option.value === value)?.label ?? fallback
}

function getFitoutCost(marketData: FlexCalculatorMarketDataRow, fitoutStandard: string) {
  if (fitoutStandard === 'basic') return marketData.fitout_cost_basic_eur
  if (fitoutStandard === 'premium') return marketData.fitout_cost_premium_eur
  return marketData.fitout_cost_enhanced_eur
}

export function calculateFlexScenario(params: {
  inputs: FlexCalculatorInputs
  settings: FlexCalculatorSettings
  densityOptions?: FlexCalculatorDensityOption[]
  marketDataRows?: FlexCalculatorMarketDataRow[]
  eurPlnRate: number
  effectiveDate: string
}): FlexCalculatorComputedResult {
  const densityOptions = params.densityOptions?.length ? params.densityOptions : DEFAULT_DENSITY_OPTIONS
  const marketDataRows = params.marketDataRows?.length ? params.marketDataRows : DEFAULT_MARKET_DATA

  const marketData =
    marketDataRows.find((row) => row.city_slug === params.inputs.citySlug && row.is_active) ??
    marketDataRows[0]

  const density =
    densityOptions.find((option) => option.key === params.inputs.densityKey && option.is_active) ??
    densityOptions[0]

  if (!marketData) {
    throw new Error('Brak danych rynkowych dla kalkulatora.')
  }

  if (!density) {
    throw new Error('Brak profilu zagęszczenia dla kalkulatora.')
  }

  const headcount = Math.max(1, params.inputs.headcount)
  const conventionalNetAreaSqm = headcount * density.conventional_sqm_per_person_avg
  const conventionalGrossAreaSqm = conventionalNetAreaSqm * params.settings.add_on_factor
  const conventionalGrossPerCapitaSqm = conventionalGrossAreaSqm / headcount
  const flexPrivateAreaSqm = density.flex_office_sqm_per_desk * headcount
  const flexGrossPerCapitaSqm = density.flex_office_sqm_per_desk + params.settings.flex_common_area_sqm_per_desk
  const flexGrossAreaSqm = flexGrossPerCapitaSqm * headcount

  const baseHeadlineRentEur =
    marketData.headline_rent_cbd_eur + (params.inputs.locationType === 'non_cbd' ? marketData.non_cbd_deduction_eur : 0)
  const effectiveBaseRentPerSqmEur =
    baseHeadlineRentEur * ((12 - params.settings.rent_free_months_per_year) / 12)

  const serviceChargePerSqmPln =
    params.inputs.locationType === 'cbd' ? marketData.service_charge_cbd_pln : marketData.service_charge_non_cbd_pln
  const serviceChargePerSqmEur = serviceChargePerSqmPln / params.eurPlnRate

  const utilitiesPerSqmEur = params.settings.utilities_and_maintenance_eur_per_sqm
  const fitoutContributionEur =
    params.inputs.locationType === 'cbd'
      ? marketData.fitout_contribution_cbd_eur
      : marketData.fitout_contribution_non_cbd_eur
  const fitoutCostEur = getFitoutCost(marketData, params.inputs.fitoutStandard)
  const fitoutGapAmortisationPerSqmEur =
    (fitoutCostEur - fitoutContributionEur) /
    params.settings.add_on_factor /
    params.inputs.conventionalLeaseMonths

  const conventionalLineItems = [
    {
      label: 'Effective base rent',
      source: 'EUR',
      monthlyPerSqmEur: round(effectiveBaseRentPerSqmEur, 2),
      monthlyPerDeskEur: round(effectiveBaseRentPerSqmEur * conventionalGrossPerCapitaSqm, 2),
      monthlyTotalEur: round(effectiveBaseRentPerSqmEur * conventionalGrossAreaSqm, 2),
      monthlyTotalPln: round(effectiveBaseRentPerSqmEur * conventionalGrossAreaSqm * params.eurPlnRate, 2),
      note: 'Uwzględnia zachętę rent-free zgodnie z założeniami rynkowymi.',
    },
    {
      label: 'Service charge',
      source: 'PLN',
      monthlyPerSqmEur: round(serviceChargePerSqmEur, 2),
      monthlyPerDeskEur: round(serviceChargePerSqmEur * conventionalGrossPerCapitaSqm, 2),
      monthlyTotalEur: round(serviceChargePerSqmEur * conventionalGrossAreaSqm, 2),
      monthlyTotalPln: round(serviceChargePerSqmPln * conventionalGrossAreaSqm, 2),
      note: 'Rynkowo rozliczany w PLN, tutaj przeliczony także do EUR po kursie NBP.',
    },
    {
      label: 'Utilities & maintenance',
      source: 'EUR',
      monthlyPerSqmEur: round(utilitiesPerSqmEur, 2),
      monthlyPerDeskEur: round(utilitiesPerSqmEur * conventionalGrossPerCapitaSqm, 2),
      monthlyTotalEur: round(utilitiesPerSqmEur * conventionalGrossAreaSqm, 2),
      monthlyTotalPln: round(utilitiesPerSqmEur * conventionalGrossAreaSqm * params.eurPlnRate, 2),
      note: 'Założenie operacyjne utrzymywane po stronie Colliers.',
    },
    {
      label: 'Fit-out amortisation (gap)',
      source: 'EUR',
      monthlyPerSqmEur: round(fitoutGapAmortisationPerSqmEur, 2),
      monthlyPerDeskEur: round((fitoutCostEur - fitoutContributionEur) * density.conventional_sqm_per_person_avg / params.inputs.conventionalLeaseMonths, 2),
      monthlyTotalEur: round(((fitoutCostEur - fitoutContributionEur) * density.conventional_sqm_per_person_avg / params.inputs.conventionalLeaseMonths) * headcount, 2),
      monthlyTotalPln: round((((fitoutCostEur - fitoutContributionEur) * density.conventional_sqm_per_person_avg) / params.inputs.conventionalLeaseMonths) * headcount * params.eurPlnRate, 2),
      note: 'Luka między kosztem fit-out a wkładem właściciela rozłożona na okres najmu.',
    },
  ]

  const conventionalMonthlyTotalEur = round(
    conventionalLineItems.reduce((sum, item) => sum + item.monthlyTotalEur, 0),
    2
  )
  const conventionalMonthlyTotalPln = round(conventionalMonthlyTotalEur * params.eurPlnRate, 2)
  const conventionalMonthlyPerCapitaEur = round(conventionalMonthlyTotalEur / headcount, 2)
  const conventionalMonthlyPerCapitaPln = round(conventionalMonthlyTotalPln / headcount, 2)

  const flexPricePerDeskPln =
    params.inputs.locationType === 'cbd' ? marketData.flex_price_cbd_pln : marketData.flex_price_non_cbd_pln
  const flexMonthlyTotalPln = round(flexPricePerDeskPln * headcount, 2)
  const flexMonthlyTotalEur = round(flexMonthlyTotalPln / params.eurPlnRate, 2)
  const flexMonthlyPerCapitaPln = round(flexMonthlyTotalPln / headcount, 2)
  const flexMonthlyPerCapitaEur = round(flexMonthlyTotalEur / headcount, 2)

  const flexLineItems = [
    {
      label: 'Cena za stanowisko (all-inclusive)',
      source: 'PLN',
      monthlyTotalEur: flexMonthlyTotalEur,
      monthlyTotalPln: flexMonthlyTotalPln,
      note: 'Obejmuje czynsz, service charge, utilities i standardowe przygotowanie powierzchni.',
    },
  ]

  const conventionalTotalLiabilityEur = round(conventionalMonthlyTotalEur * params.inputs.conventionalLeaseMonths, 2)
  const conventionalTotalLiabilityPln = round(conventionalTotalLiabilityEur * params.eurPlnRate, 2)
  const flexTotalLiabilityEur = round(flexMonthlyTotalEur * params.inputs.flexLeaseMonths, 2)
  const flexTotalLiabilityPln = round(flexMonthlyTotalPln * params.inputs.flexLeaseMonths, 2)
  const conventionalCostForFlexPeriodEur = round(conventionalMonthlyTotalEur * params.inputs.flexLeaseMonths, 2)
  const conventionalCostForFlexPeriodPln = round(conventionalCostForFlexPeriodEur * params.eurPlnRate, 2)
  const flexCostForFlexPeriodEur = flexTotalLiabilityEur
  const flexCostForFlexPeriodPln = flexTotalLiabilityPln
  const liabilityReductionEur = round(conventionalTotalLiabilityEur - flexTotalLiabilityEur, 2)
  const liabilityReductionPln = round(conventionalTotalLiabilityPln - flexTotalLiabilityPln, 2)
  const comparablePeriodSavingsEur = round(conventionalCostForFlexPeriodEur - flexCostForFlexPeriodEur, 2)
  const comparablePeriodSavingsPln = round(conventionalCostForFlexPeriodPln - flexCostForFlexPeriodPln, 2)
  const flexPremiumPerCapitaMonthlyEur = round(flexMonthlyPerCapitaEur - conventionalMonthlyPerCapitaEur, 2)
  const flexPremiumPct = conventionalMonthlyPerCapitaEur === 0
    ? 0
    : round((flexMonthlyPerCapitaEur - conventionalMonthlyPerCapitaEur) / conventionalMonthlyPerCapitaEur, 4)

  return {
    inputs: params.inputs,
    assumptions: {
      cityLabel: marketData.city_label,
      densityLabel: density.label,
      fitoutLabel: findOption(params.settings.fitout_options, params.inputs.fitoutStandard, params.inputs.fitoutStandard),
      locationLabel: findOption(params.settings.location_options, params.inputs.locationType, params.inputs.locationType),
      addOnFactor: params.settings.add_on_factor,
      rentFreeMonthsPerYear: params.settings.rent_free_months_per_year,
      utilitiesAndMaintenanceEurPerSqm: params.settings.utilities_and_maintenance_eur_per_sqm,
      flexCommonAreaSqmPerDesk: params.settings.flex_common_area_sqm_per_desk,
    },
    exchangeRate: {
      eurPln: round(params.eurPlnRate, 4),
      effectiveDate: params.effectiveDate,
      source: 'NBP',
    },
    areas: {
      conventionalNetAreaSqm: round(conventionalNetAreaSqm, 2),
      conventionalGrossAreaSqm: round(conventionalGrossAreaSqm, 2),
      conventionalGrossPerCapitaSqm: round(conventionalGrossPerCapitaSqm, 2),
      flexPrivateAreaSqm: round(flexPrivateAreaSqm, 2),
      flexGrossAreaSqm: round(flexGrossAreaSqm, 2),
      flexGrossPerCapitaSqm: round(flexGrossPerCapitaSqm, 2),
    },
    conventionalLineItems,
    flexLineItems,
    totals: {
      conventionalMonthlyTotalEur,
      conventionalMonthlyTotalPln,
      conventionalMonthlyPerCapitaEur,
      conventionalMonthlyPerCapitaPln,
      flexMonthlyTotalEur,
      flexMonthlyTotalPln,
      flexMonthlyPerCapitaEur,
      flexMonthlyPerCapitaPln,
      conventionalTotalLiabilityEur,
      conventionalTotalLiabilityPln,
      flexTotalLiabilityEur,
      flexTotalLiabilityPln,
      conventionalCostForFlexPeriodEur,
      conventionalCostForFlexPeriodPln,
      flexCostForFlexPeriodEur,
      flexCostForFlexPeriodPln,
      liabilityReductionEur,
      liabilityReductionPln,
      comparablePeriodSavingsEur,
      comparablePeriodSavingsPln,
      flexPremiumPerCapitaMonthlyEur,
      flexPremiumPct,
    },
  }
}
