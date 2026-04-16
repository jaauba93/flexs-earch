import { NextResponse } from 'next/server'

const NBP_TABLE_A_LAST_2_URL = 'https://api.nbp.pl/api/exchangerates/tables/A/last/2/?format=json'

type NbpRate = {
  code: string
  mid: number
}

type NbpTable = {
  effectiveDate: string
  rates: NbpRate[]
}

function todayInWarsaw() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    return new Date().toISOString().slice(0, 10)
  }

  return `${year}-${month}-${day}`
}

function pickTable(tables: NbpTable[]) {
  const today = todayInWarsaw()
  const sorted = [...tables].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
  return sorted.find((table) => table.effectiveDate < today) ?? sorted[0]
}

export async function GET() {
  try {
    const response = await fetch(NBP_TABLE_A_LAST_2_URL, {
      headers: { Accept: 'application/json' },
      // NBP updates once per business day; a short cache keeps this cheap without becoming stale.
      next: { revalidate: 60 * 60 },
    })

    if (!response.ok) {
      throw new Error(`NBP API returned ${response.status}`)
    }

    const tables = (await response.json()) as NbpTable[]

    if (!Array.isArray(tables) || tables.length === 0) {
      throw new Error('NBP API returned an empty payload')
    }

    const table = pickTable(tables)
    const rateMap = new Map(table.rates.map((rate) => [rate.code, rate.mid]))

    const payload = {
      EUR: rateMap.get('EUR') ?? null,
      USD: rateMap.get('USD') ?? null,
      GBP: rateMap.get('GBP') ?? null,
      effectiveDate: table.effectiveDate,
      fetchedAt: new Date().toISOString(),
      source: 'NBP' as const,
    }

    if (!payload.EUR || !payload.USD || !payload.GBP) {
      throw new Error('Missing one of the required currencies in NBP table A')
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to load NBP exchange rates',
      },
      { status: 502 }
    )
  }
}
