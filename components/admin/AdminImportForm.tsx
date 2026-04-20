'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'

interface ImportResponse {
  summary?: {
    created: number
    updated: number
    deleted: number
    errors: string[]
  }
  error?: string
}

export default function AdminImportForm() {
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<ImportResponse | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setPending(true)
    setResult(null)

    const response = await fetch('/api/admin/import', {
      method: 'POST',
      body: formData,
    })

    const payload = (await response.json()) as ImportResponse
    setPending(false)
    setResult(payload)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Import masowy</p>
          <h2 className="mt-2 text-xl font-semibold text-[#000759]">CSV / Excel bez wchodzenia do Supabase</h2>
          <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
            Obsługiwane są pliki `.csv`, `.xlsx` oraz `.xls`. Import potrafi dodawać, aktualizować i usuwać oferty na
            podstawie kolumn `action`, `id` lub `slug`.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_auto]">
          <label className="admin-field">
            <span>Plik importu</span>
            <input name="file" type="file" accept=".csv,.xlsx,.xls" required />
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <Link
              href="/api/admin/import/template"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 self-end rounded-[18px] border border-[#d6e0f5] bg-white px-5 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
            >
              <Download size={16} />
              Pobierz template Excel
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 self-end rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              {pending ? 'Import trwa...' : 'Uruchom import'}
            </button>
          </div>
        </div>
      </form>

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <h3 className="text-lg font-semibold text-[#000759]">Minimalny układ kolumn</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e6edf8] text-[#7080a8]">
                <th className="px-3 py-2 font-semibold">Kolumna</th>
                <th className="px-3 py-2 font-semibold">Opis</th>
              </tr>
            </thead>
            <tbody className="text-[#33456f]">
              {[
                ['action', '`upsert` albo `delete`'],
                ['id / slug', 'Identyfikator rekordu. Do aktualizacji lub usunięcia wystarczy jedno z nich.'],
                ['operator_name / operator_slug', 'Operator może być wskazany po nazwie albo po slugu. Nowa nazwa utworzy operatora automatycznie.'],
                ['advisor_email', 'Przypisanie doradcy po mailu.'],
                ['name', 'Publiczna nazwa oferty po polsku.'],
                ['address_city', 'Miasto.'],
                ['address_street', 'Ulica i numer.'],
                ['address_postcode', 'Kod pocztowy.'],
                ['address_district / latitude / longitude', 'Można wpisać ręcznie, ale CMS spróbuje też uzupełnić je automatycznie na podstawie adresu.'],
                ['amenity__slug', 'Każde udogodnienie ma własną kolumnę typu `tak/nie` w pliku template.'],
                ['is_active / is_featured', 'Flagi publikacji. Obsługa `tak/nie`, `true/false`, `1/0`.'],
                ['name_en / name_uk / description_en / description_uk', 'Kolumny tłumaczeniowe dla ofert. Do wsadowej pracy wygodniej użyj sekcji Tłumaczenia.'],
              ].map(([label, description]) => (
                <tr key={label} className="border-b border-[#eef3fb] last:border-b-0">
                  <td className="px-3 py-3 font-mono text-[13px]">{label}</td>
                  <td className="px-3 py-3">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {result ? (
        <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <h3 className="text-lg font-semibold text-[#000759]">Wynik importu</h3>
          {result.error ? (
            <p className="mt-4 rounded-[16px] border border-[#ffd1d6] bg-[#fff6f7] px-4 py-3 text-sm text-[#b42318]">
              {result.error}
            </p>
          ) : result.summary ? (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[18px] border border-[#dbe6fa] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b8bb2]">Dodane</p>
                <p className="mt-2 text-3xl font-semibold text-[#000759]">{result.summary.created}</p>
              </div>
              <div className="rounded-[18px] border border-[#dbe6fa] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b8bb2]">Zaktualizowane</p>
                <p className="mt-2 text-3xl font-semibold text-[#000759]">{result.summary.updated}</p>
              </div>
              <div className="rounded-[18px] border border-[#dbe6fa] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b8bb2]">Usunięte</p>
                <p className="mt-2 text-3xl font-semibold text-[#000759]">{result.summary.deleted}</p>
              </div>
              {result.summary.errors.length > 0 ? (
                <div className="md:col-span-3 rounded-[18px] border border-[#ffe1b2] bg-[#fff8ed] p-4">
                  <p className="text-sm font-semibold text-[#8a5b00]">Uwagi i błędy ({result.summary.errors.length})</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#8a5b00]">
                    {result.summary.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
