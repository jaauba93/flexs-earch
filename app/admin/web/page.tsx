import Link from 'next/link'
import { ArrowRight, FileText, Globe2, Languages } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'
import { requireAdminUser } from '@/lib/admin/auth'
import { getWebRouteSummaries } from '@/lib/admin/webContent'

export default async function AdminWebDashboardPage() {
  const user = await requireAdminUser()
  const routes = await getWebRouteSummaries()

  return (
    <AdminShell
      user={user}
      title="Web"
      subtitle="Ta sekcja porządkuje warstwę witrynową: sitemap stron publicznych, wersje językowe i zbiorczy workflow tłumaczeń. Każda nowa podstrona powinna trafić tutaj równolegle z wdrożeniem frontu."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Publiczne route’y</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#000759]">{routes.length}</p>
          <p className="mt-2 text-sm text-[#51628b]">Wszystkie strony i komponenty treściowe widoczne w edytorze web.</p>
        </div>
        <div className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Języki publiczne</p>
          <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#000759]">3</p>
          <p className="mt-2 text-sm text-[#51628b]">PL, EN i UK działają już na routingu językowym `/pl`, `/en`, `/uk`.</p>
        </div>
        <div className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Model pracy</p>
          <p className="mt-3 text-xl font-semibold text-[#000759]">Per page + bulk import</p>
          <p className="mt-2 text-sm text-[#51628b]">Możesz edytować stronę ręcznie w CMS albo wyeksportować cały pakiet do Excela.</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/admin/web/pages"
          className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5 transition-all duration-200 hover:border-[#cbd9f4] hover:shadow-[0_18px_48px_rgba(15,29,74,0.06)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#edf2ff] text-[#1c54f4]">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#000759]">Strony i sitemap</p>
              <p className="text-sm text-[#51628b]">Edytuj wersje językowe per route i pilnuj, żeby nowe podstrony trafiały do CMS.</p>
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1c54f4]">
            Otwórz edytor stron <ArrowRight size={16} />
          </div>
        </Link>

        <Link
          href="/admin/web/translations"
          className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5 transition-all duration-200 hover:border-[#cbd9f4] hover:shadow-[0_18px_48px_rgba(15,29,74,0.06)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#edf2ff] text-[#1c54f4]">
              <Languages size={18} />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#000759]">Tłumaczenia zbiorcze</p>
              <p className="text-sm text-[#51628b]">Eksportuj i importuj pełny workbook dla ofert, amenities, UI i contentu witryny.</p>
            </div>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1c54f4]">
            Otwórz workflow tłumaczeń <ArrowRight size={16} />
          </div>
        </Link>
      </section>

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="flex items-center gap-2">
          <Globe2 size={18} className="text-[#1c54f4]" />
          <h2 className="text-lg font-semibold text-[#000759]">Zasada na kolejne wdrożenia</h2>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-[#51628b]">
          <li>Każda nowa podstrona publiczna powinna dostać własny zestaw kluczy w content packu.</li>
          <li>Po wdrożeniu frontu strona automatycznie pojawi się w sekcji `Strony i sitemap` w CMS.</li>
          <li>Treści bazowe możesz edytować ręcznie per route albo przetłumaczyć zbiorczo przez eksport/import workbooka.</li>
        </ul>
      </section>
    </AdminShell>
  )
}
