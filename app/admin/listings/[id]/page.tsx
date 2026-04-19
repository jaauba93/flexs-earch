import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import AdminListingForm from '@/components/admin/AdminListingForm'
import { requireAdminUser } from '@/lib/admin/auth'
import { getListingEditorData } from '@/lib/admin/data'

interface ListingEditPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminListingEditPage({ params }: ListingEditPageProps) {
  const user = await requireAdminUser()
  const { id } = await params
  const editorData = await getListingEditorData(id)

  if (!editorData.listing) {
    notFound()
  }

  return (
    <AdminShell
      user={user}
      title={`Edycja: ${editorData.listing.name}`}
      subtitle="W tej sekcji zarządzasz danymi oferty, flagami publikacji, treściami frontowymi i zdjęciami budynku."
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
