export interface SelectOption {
  value: string
  label: string
}

export interface FlexCalculatorDensityOption {
  key: string
  label: string
  sort_order: number
  flex_office_sqm_per_desk: number
  conventional_sqm_per_person_avg: number
  is_active: boolean
}

export interface FlexCalculatorMarketDataRow {
  city_slug: string
  city_label: string
  sort_order: number
  is_active: boolean
  headline_rent_cbd_eur: number
  non_cbd_deduction_eur: number
  service_charge_cbd_pln: number
  service_charge_non_cbd_pln: number
  flex_price_cbd_pln: number
  flex_price_non_cbd_pln: number
  fitout_contribution_cbd_eur: number
  fitout_contribution_non_cbd_eur: number
  fitout_cost_basic_eur: number
  fitout_cost_enhanced_eur: number
  fitout_cost_premium_eur: number
}

export interface FlexCalculatorSettings {
  id: string
  intro_eyebrow: string
  intro_title: string
  intro_body: string
  intro_disclaimer_approx: string
  intro_disclaimer_market: string
  intro_disclaimer_support: string
  default_headcount: number
  default_city_slug: string
  default_location_type: string
  default_fitout_standard: string
  default_density_key: string
  default_flex_lease_months: number
  default_conventional_lease_months: number
  utilities_and_maintenance_eur_per_sqm: number
  flex_common_area_sqm_per_desk: number
  add_on_factor: number
  rent_free_months_per_year: number
  location_options: SelectOption[]
  fitout_options: SelectOption[]
  flex_lease_options: SelectOption[]
  conventional_lease_options: SelectOption[]
}

export interface FlexCalculatorPublicData {
  settings: FlexCalculatorSettings
  densityOptions: FlexCalculatorDensityOption[]
  cityOptions: SelectOption[]
}

export interface FlexCalculatorCmsData {
  settings: FlexCalculatorSettings
  densityOptions: FlexCalculatorDensityOption[]
  marketData: FlexCalculatorMarketDataRow[]
}

export interface FlexCalculatorInputs {
  headcount: number
  citySlug: string
  locationType: string
  fitoutStandard: string
  densityKey: string
  conventionalLeaseMonths: number
  flexLeaseMonths: number
}

export interface FlexCalculatorLineItem {
  label: string
  source: string
  monthlyPerSqmEur?: number | null
  monthlyPerDeskEur?: number | null
  monthlyTotalEur: number
  monthlyTotalPln: number
  note?: string
}

export interface FlexCalculatorAreaSummary {
  conventionalNetAreaSqm: number
  conventionalGrossAreaSqm: number
  conventionalGrossPerCapitaSqm: number
  flexPrivateAreaSqm: number
  flexGrossAreaSqm: number
  flexGrossPerCapitaSqm: number
}

export interface FlexCalculatorTotals {
  conventionalMonthlyTotalEur: number
  conventionalMonthlyTotalPln: number
  conventionalMonthlyPerCapitaEur: number
  conventionalMonthlyPerCapitaPln: number
  flexMonthlyTotalEur: number
  flexMonthlyTotalPln: number
  flexMonthlyPerCapitaEur: number
  flexMonthlyPerCapitaPln: number
  conventionalTotalLiabilityEur: number
  conventionalTotalLiabilityPln: number
  flexTotalLiabilityEur: number
  flexTotalLiabilityPln: number
  conventionalCostForFlexPeriodEur: number
  conventionalCostForFlexPeriodPln: number
  flexCostForFlexPeriodEur: number
  flexCostForFlexPeriodPln: number
  liabilityReductionEur: number
  liabilityReductionPln: number
  comparablePeriodSavingsEur: number
  comparablePeriodSavingsPln: number
  flexPremiumPerCapitaMonthlyEur: number
  flexPremiumPct: number
}

export interface FlexCalculatorComputedResult {
  inputs: FlexCalculatorInputs
  assumptions: {
    cityLabel: string
    densityLabel: string
    fitoutLabel: string
    locationLabel: string
    addOnFactor: number
    rentFreeMonthsPerYear: number
    utilitiesAndMaintenanceEurPerSqm: number
    flexCommonAreaSqmPerDesk: number
  }
  exchangeRate: {
    eurPln: number
    effectiveDate: string
    source: 'NBP'
  }
  areas: FlexCalculatorAreaSummary
  conventionalLineItems: FlexCalculatorLineItem[]
  flexLineItems: FlexCalculatorLineItem[]
  totals: FlexCalculatorTotals
}
