import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import { requireAdminUser } from '@/lib/admin/auth'
import { getAdvisorSummaries } from '@/lib/admin/data'

export default async function AdminAdvisorsPage() {
  const user = await requireAdminUser()
  const advisors = await getAdvisorSummaries()

  return (
    <AdminShell
      user={user}
      title="Doradcy Colliers"
      subtitle="Tutaj zarządzasz osobami przypisywanymi do ofert. E-mail służy też jako identyfikator przy imporcie CSV / Excel."
    >
      <div className="flex justify-end">
        <Link
          href="/admin/advisors/new"
          className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4]"
        >
          Dodaj doradcę
        </Link>
      </div>

      <section className="overflow-hidden rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-[#e4ebf8] bg-white">
              <tr className="text-[11px] uppercase tracking-[0.22em] text-[#7b8bb2]">
                <th className="px-5 py-4 font-bold">Doradca</th>
                <th className="px-5 py-4 font-bold">Kontakt</th>
                <th className="px-5 py-4 font-bold">Zdjęcie</th>
                <th className="px-5 py-4 font-bold">Akcja</th>
              </tr>
            </thead>
            <tbody>
              {advisors.map((advisor) => (
                <tr key={advisor.id} className="border-b border-[#eaf0fa] bg-[#fbfcff] last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#000759]">{advisor.name}</p>
                    <p className="mt-1 text-sm text-[#62739b]">{advisor.title || 'Bez stanowiska'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#33456f]">
                    <p>{advisor.email}</p>
                    <p className="mt-1 text-[#62739b]">{advisor.phone || 'Brak telefonu'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#33456f]">{advisor.photo_url ? 'Dodane' : 'Brak'}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/advisors/${advisor.id}`}
                      className="inline-flex min-h-[38px] items-center justify-center rounded-[14px] border border-[#d6e0f5] px-4 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
                    >
                      Edytuj
                    </Link>
                  </td>
                </tr>
              ))}
              {advisors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-[#62739b]">
                    Nie ma jeszcze żadnych doradców w CMS.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  )
}
