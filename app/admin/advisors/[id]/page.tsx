import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import AdminAdvisorForm from '@/components/admin/AdminAdvisorForm'
import { requireAdminUser } from '@/lib/admin/auth'
import { getAdvisorEditorData } from '@/lib/admin/data'

interface AdvisorEditPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminAdvisorEditPage({ params }: AdvisorEditPageProps) {
  const user = await requireAdminUser()
  const { id } = await params
  const advisor = await getAdvisorEditorData(id)

  if (!advisor) {
    notFound()
  }

  return (
    <AdminShell
      user={user}
      title={`Edycja: ${advisor.name}`}
      subtitle="Edytujesz profil doradcy wykorzystywany w ofertach i imporcie danych."
    >
      <div className="flex justify-end">
        <Link
          href="/admin/advisors"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[18px] border border-[#d6e0f5] px-5 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
        >
          Wróć do listy doradców
        </Link>
      </div>

      <AdminAdvisorForm advisor={advisor} />
    </AdminShell>
  )
}
