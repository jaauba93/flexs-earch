import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import AdminListingForm from '@/components/admin/AdminListingForm'
import { requireAdminUser } from '@/lib/admin/auth'
import { getListingEditorData } from '@/lib/admin/data'

export default async function AdminListingNewPage() {
  const user = await requireAdminUser()
  const editorData = await getListingEditorData()

  return (
    <AdminShell
      user={user}
      title="Nowa oferta"
      subtitle="Tworzenie nowego rekordu odbywa się bezpośrednio w CMS. Po pierwszym zapisie od razu odblokują się zdjęcia galerii i dalsza administracja treścią."
    >
      <div className="flex justify-end">
        <Link
          href="/admin/listings"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[18px] border border-[#d6e0f5] px-5 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
        >
          Wróć do listy ofert
        </Link>
      </div>

      <AdminListingForm {...editorData} />
    </AdminShell>
  )
}
