'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Globe2, Loader2, Upload } from 'lucide-react'

interface TranslationImportResponse {
  summary?: {
    listingsUpdated: number
    amenitiesUpdated: number
    publicUiUpdated: number
    pageContentUpdated: number
    errors: string[]
  }
  error?: string
}

export default function AdminTranslationsForm() {
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<TranslationImportResponse | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    setPending(true)
    setResult(null)

    const response = await fetch('/api/admin/translations/import', {
      method: 'POST',
      body: formData,
    })

    const payload = (await response.json()) as TranslationImportResponse
    setPending(false)
    setResult(payload)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Workflow tłumaczeń</p>
        <h2 className="mt-2 text-xl font-semibold text-[#000759]">Eksport, tłumaczenie zbiorcze, import</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#51628b]">
          Wyeksportuj aktualne treści do Excela, przetłumacz je zbiorczo poza CMS i zaimportuj z powrotem bez edytowania
          każdego stringa osobno. Pakiet obejmuje nazwy i opisy ofert, nazwy amenities, wspólne teksty UI oraz osobny
          arkusz z contentem strony głównej, podstron, CTA i metadanych SEO.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/api/admin/translations/export"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border border-[#d6e0f5] bg-white px-5 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
          >
            <Download size={16} />
            Pobierz pakiet tłumaczeń
          </Link>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Import tłumaczeń</p>
          <h3 className="mt-2 text-lg font-semibold text-[#000759]">Załaduj uzupełniony workbook</h3>
          <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
            Import aktualizuje tylko kolumny tłumaczeniowe. Dane bazowe ofert nie są nadpisywane. Arkusze UI i page content
            zapisują się do bazy po uruchomieniu migracji SQL dla tabeli `public_site_translations`.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_auto]">
          <label className="admin-field">
            <span>Plik tłumaczeń</span>
            <input name="file" type="file" accept=".xlsx,.xls" required />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 self-end rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {pending ? 'Import trwa...' : 'Importuj tłumaczenia'}
          </button>
        </div>
      </form>

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="flex items-center gap-2">
          <Globe2 size={18} className="text-[#1c54f4]" />
          <h3 className="text-lg font-semibold text-[#000759]">Zakres pakietu</h3>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-[#51628b]">
          <li>Arkusz `listings_translations`: nazwy i opisy ofert w PL / EN / UK.</li>
          <li>Arkusz `amenities_translations`: nazwy udogodnień w PL / EN / UK.</li>
          <li>Arkusz `public_ui_translations`: wspólne stringi interfejsu i elementów nawigacyjnych.</li>
          <li>Arkusz `page_content_translations`: treści home, przewodnika, podstaw flex, raportów, polityk, formularzy i metadanych.</li>
        </ul>
      </section>

      {result ? (
        <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <h3 className="text-lg font-semibold text-[#000759]">Wynik importu</h3>
          {result.error ? (
            <p className="mt-4 rounded-[16px] border border-[#ffd1d6] bg-[#fff6f7] px-4 py-3 text-sm text-[#b42318]">
              {result.error}
            </p>
          ) : result.summary ? (
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="rounded-[18px] border border-[#dbe6fa] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b8bb2]">Oferty</p>
                <p className="mt-2 text-3xl font-semibold text-[#000759]">{result.summary.listingsUpdated}</p>
              </div>
              <div className="rounded-[18px] border border-[#dbe6fa] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b8bb2]">Amenities</p>
                <p className="mt-2 text-3xl font-semibold text-[#000759]">{result.summary.amenitiesUpdated}</p>
              </div>
              <div className="rounded-[18px] border border-[#dbe6fa] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b8bb2]">UI / wspólne teksty</p>
                <p className="mt-2 text-3xl font-semibold text-[#000759]">{result.summary.publicUiUpdated}</p>
              </div>
              <div className="rounded-[18px] border border-[#dbe6fa] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7b8bb2]">Page content</p>
                <p className="mt-2 text-3xl font-semibold text-[#000759]">{result.summary.pageContentUpdated}</p>
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
