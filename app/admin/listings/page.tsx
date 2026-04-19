import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import AdminListingsTable from '@/components/admin/AdminListingsTable'
import { requireAdminUser } from '@/lib/admin/auth'
import { getListingSummaries } from '@/lib/admin/data'

export default async function AdminListingsPage() {
  const user = await requireAdminUser()
  const listings = await getListingSummaries()

  return (
    <AdminShell
      user={user}
      title="Oferty"
      subtitle="Tutaj zarządzasz aktualnie publikowanymi biurami: danymi, widocznością, featured oraz przejściem do uploadu zdjęć i treści frontowych."
    >
      <div className="flex justify-end">
        <Link
          href="/admin/listings/new"
          className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4]"
        >
          Dodaj nową ofertę
        </Link>
      </div>

      <AdminListingsTable listings={listings} />
    </AdminShell>
  )
}
