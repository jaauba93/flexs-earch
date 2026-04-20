import { NextResponse } from 'next/server'
import { fetchNbpRates } from '@/lib/currency/nbp'

export async function GET() {
  try {
    const payload = await fetchNbpRates()

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=43200, stale-while-revalidate=86400',
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
