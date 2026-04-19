import { NextRequest, NextResponse } from 'next/server'
import { fetchNbpRates } from '@/lib/currency/nbp'
import { calculateFlexScenario } from '@/lib/flex-calculator/calculate'
import { getFlexCalculatorCmsData } from '@/lib/flex-calculator/data'
import type { FlexCalculatorInputs } from '@/lib/flex-calculator/types'

function parseNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<FlexCalculatorInputs>
    const cmsData = await getFlexCalculatorCmsData()
    const rates = await fetchNbpRates()
    const eurPlnRate = rates.EUR

    if (!eurPlnRate) {
      throw new Error('Brak kursu EUR z NBP.')
    }

    const inputs: FlexCalculatorInputs = {
      headcount: Math.min(1000, Math.max(1, parseNumber(body.headcount, cmsData.settings.default_headcount))),
      citySlug: typeof body.citySlug === 'string' ? body.citySlug : cmsData.settings.default_city_slug,
      locationType:
        typeof body.locationType === 'string' ? body.locationType : cmsData.settings.default_location_type,
      fitoutStandard:
        typeof body.fitoutStandard === 'string'
          ? body.fitoutStandard
          : cmsData.settings.default_fitout_standard,
      densityKey: typeof body.densityKey === 'string' ? body.densityKey : cmsData.settings.default_density_key,
      conventionalLeaseMonths: parseNumber(
        body.conventionalLeaseMonths,
        cmsData.settings.default_conventional_lease_months
      ),
      flexLeaseMonths: parseNumber(body.flexLeaseMonths, cmsData.settings.default_flex_lease_months),
    }

    const result = calculateFlexScenario({
      inputs,
      settings: cmsData.settings,
      densityOptions: cmsData.densityOptions,
      marketDataRows: cmsData.marketData,
      eurPlnRate,
      effectiveDate: rates.effectiveDate,
    })

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nie udało się przeliczyć kalkulatora.' },
      { status: 500 }
    )
  }
}
