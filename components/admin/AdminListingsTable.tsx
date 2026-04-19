'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { ListingSummary } from '@/lib/admin/data'

interface AdminListingsTableProps {
  listings: ListingSummary[]
}

export default function AdminListingsTable({ listings }: AdminListingsTableProps) {
  const router = useRouter()
  const [rows, setRows] = useState(listings)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [operator, setOperator] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'hidden'>('all')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const cityOptions = useMemo(
    () => Array.from(new Set(rows.map((listing) => listing.address_city).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pl')),
    [rows]
  )

  const operatorOptions = useMemo(
    () => Array.from(new Set(rows.map((listing) => listing.operator_name).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'pl')),
    [rows]
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return rows.filter((listing) => {
      const matchesQuery =
        !normalizedQuery ||
        listing.name.toLowerCase().includes(normalizedQuery) ||
        listing.slug.toLowerCase().includes(normalizedQuery) ||
        listing.address_district?.toLowerCase().includes(normalizedQuery)

      const matchesCity = !city || listing.address_city === city
      const matchesOperator = !operator || listing.operator_name === operator
      const matchesStatus =
        status === 'all' || (status === 'active' ? listing.is_active : !listing.is_active)

      return matchesQuery && matchesCity && matchesOperator && matchesStatus
    })
  }, [city, operator, query, rows, status])

  async function togglePublish(listingId: string, nextValue: boolean) {
    setPendingId(listingId)

    const response = await fetch(`/api/admin/listings/${listingId}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: nextValue }),
    })

    setPendingId(null)

    if (!response.ok) {
      return
    }

    setRows((currentRows) =>
      currentRows.map((listing) => (listing.id === listingId ? { ...listing, is_active: nextValue } : listing))
    )
    router.refresh()
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-[#e4ebf8] bg-white">
            <tr className="text-[11px] uppercase tracking-[0.22em] text-[#7b8bb2]">
              <th className="px-5 py-4 font-bold">Oferta</th>
              <th className="px-5 py-4 font-bold">Miasto</th>
              <th className="px-5 py-4 font-bold">Operator</th>
              <th className="px-5 py-4 font-bold">Status</th>
              <th className="px-5 py-4 font-bold">Publikacja</th>
              <th className="px-5 py-4 font-bold">Akcja</th>
            </tr>
            <tr className="border-t border-[#eef3fb]">
              <th className="px-5 py-3">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filtruj po nazwie, slugu lub dzielnicy"
                  className="min-h-[42px] w-full rounded-[14px] border border-[#d6e0f5] bg-white px-3 text-sm text-[#10204a] outline-none transition-all focus:border-[#1c54f4]"
                />
              </th>
              <th className="px-5 py-3">
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="min-h-[42px] w-full rounded-[14px] border border-[#d6e0f5] bg-white px-3 text-sm text-[#10204a] outline-none transition-all focus:border-[#1c54f4]"
                >
                  <option value="">Wszystkie miasta</option>
                  {cityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-5 py-3">
                <select
                  value={operator}
                  onChange={(event) => setOperator(event.target.value)}
                  className="min-h-[42px] w-full rounded-[14px] border border-[#d6e0f5] bg-white px-3 text-sm text-[#10204a] outline-none transition-all focus:border-[#1c54f4]"
                >
                  <option value="">Wszyscy operatorzy</option>
                  {operatorOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-5 py-3">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as 'all' | 'active' | 'hidden')}
                  className="min-h-[42px] w-full rounded-[14px] border border-[#d6e0f5] bg-white px-3 text-sm text-[#10204a] outline-none transition-all focus:border-[#1c54f4]"
                >
                  <option value="all">Wszystkie statusy</option>
                  <option value="active">Opublikowane</option>
                  <option value="hidden">Ukryte</option>
                </select>
              </th>
              <th className="px-5 py-3" />
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((listing) => (
              <tr key={listing.id} className="border-b border-[#eaf0fa] bg-[#fbfcff] last:border-b-0">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#000759]">{listing.name}</p>
                  <p className="mt-1 text-sm text-[#62739b]">{listing.slug}</p>
                </td>
                <td className="px-5 py-4 text-sm text-[#33456f]">
                  {listing.address_city}
                  {listing.address_district ? `, ${listing.address_district}` : ''}
                </td>
                <td className="px-5 py-4 text-sm text-[#33456f]">{listing.operator_name || '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                        listing.is_active ? 'bg-[#ebf8ef] text-[#237a3b]' : 'bg-[#f4f6fa] text-[#6e7d9f]'
                      }`}
                    >
                      {listing.is_active ? 'Opublikowana' : 'Ukryta'}
                    </span>
                    {listing.is_featured ? (
                      <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c54f4]">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => togglePublish(listing.id, !listing.is_active)}
                    disabled={pendingId === listing.id}
                    className={`inline-flex min-h-[38px] min-w-[144px] items-center justify-center gap-2 rounded-[14px] border px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                      listing.is_active
                        ? 'border-[#ffd6de] text-[#c4324f] hover:bg-[#fff4f6]'
                        : 'border-[#d6e0f5] text-[#000759] hover:border-[#1c54f4] hover:text-[#1c54f4]'
                    }`}
                  >
                    {pendingId === listing.id ? <Loader2 size={15} className="animate-spin" /> : null}
                    {listing.is_active ? 'Ukryj ofertę' : 'Opublikuj'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/listings/${listing.id}`}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-[14px] border border-[#d6e0f5] px-4 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
                  >
                    Edytuj
                  </Link>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-[#62739b]">
                  Brak ofert pasujących do wybranych filtrów.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
