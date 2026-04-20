import Link from 'next/link'
import { ArrowRight, Building2, Sparkles, UploadCloud } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'
import { requireAdminUser } from '@/lib/admin/auth'
import { getAdminDashboardStats, getListingSummaries } from '@/lib/admin/data'

export default async function AdminDashboardPage() {
  const user = await requireAdminUser()
  const [stats, listings] = await Promise.all([getAdminDashboardStats(), getListingSummaries()])
  const statCards = [
    { label: 'Wszystkie oferty', value: stats.totalListings, Icon: Building2 },
    { label: 'Opublikowane', value: stats.activeListings, Icon: Sparkles },
    { label: 'Wyróżnione', value: stats.featuredListings, Icon: Sparkles },
    { label: 'Zapytania ofertowe', value: stats.enquiries, Icon: UploadCloud },
  ]

  return (
    <AdminShell
      user={user}
      title="Dashboard CMS"
      subtitle="Panel administracyjny obejmuje zarządzanie ofertami i doradcami, import danych, automatyczne uzupełnianie lokalizacji z adresu, workflow tłumaczeń zbiorczych oraz konfigurację kalkulatora flex wraz z założeniami i market data."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">{label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-4xl font-semibold tracking-[-0.04em] text-[#000759]">{String(value)}</p>
              <Icon size={20} className="text-[#1c54f4]" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Szybki start</p>
              <h2 className="mt-2 text-xl font-semibold text-[#000759]">Ostatnio aktualizowane oferty</h2>
            </div>
            <Link href="/admin/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1c54f4]">
              Zobacz wszystkie <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {listings.slice(0, 6).map((listing) => (
              <Link
                key={listing.id}
                href={`/admin/listings/${listing.id}`}
                className="flex flex-col gap-3 rounded-[20px] border border-[#e7edf8] bg-white p-4 transition-all duration-200 hover:border-[#cbd9f4] hover:shadow-[0_18px_48px_rgba(15,29,74,0.06)] md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-[#000759]">{listing.name}</p>
                  <p className="mt-1 text-sm text-[#57688f]">
                    {listing.address_city}
                    {listing.address_district ? `, ${listing.address_district}` : ''} • {listing.operator_name || 'Brak operatora'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${listing.is_active ? 'bg-[#ebf8ef] text-[#237a3b]' : 'bg-[#f4f6fa] text-[#6e7d9f]'}`}>
                    {listing.is_active ? 'Opublikowana' : 'Ukryta'}
                  </span>
                  {listing.is_featured ? (
                    <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c54f4]">
                      Featured
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Co już gotowe</p>
          <h2 className="mt-2 text-xl font-semibold text-[#000759]">Zakres v1 CMS</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[#51628b]">
            <li>Logowanie administratora przez Supabase Auth.</li>
            <li>Edycja danych ofert i flag publikacji z poziomu panelu.</li>
            <li>Upload zdjęć głównych i galerii do Supabase Storage.</li>
            <li>Automatyczne pobieranie koordynatów i dzielnicy na podstawie adresu oferty.</li>
            <li>Masowy import z pliku CSV / Excel bez Table Editora.</li>
            <li>Eksport i import pakietu tłumaczeń dla ofert, amenities i wspólnych stringów UI.</li>
            <li>Edycja treści, profili zagęszczenia, założeń i market data kalkulatora flex.</li>
            <li>Fundament pod PL / EN / UK na froncie publicznym wraz z przełącznikiem języka.</li>
          </ul>
        </div>
      </section>
    </AdminShell>
  )
}
