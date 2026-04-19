import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import AdminAdvisorForm from '@/components/admin/AdminAdvisorForm'
import { requireAdminUser } from '@/lib/admin/auth'

export default async function AdminAdvisorNewPage() {
  const user = await requireAdminUser()

  return (
    <AdminShell
      user={user}
      title="Nowy doradca"
      subtitle="Po zapisaniu doradca od razu pojawi się na liście wyboru podczas tworzenia i edycji ofert."
    >
      <div className="flex justify-end">
        <Link
          href="/admin/advisors"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[18px] border border-[#d6e0f5] px-5 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
        >
          Wróć do listy doradców
        </Link>
      </div>

      <AdminAdvisorForm advisor={null} />
    </AdminShell>
  )
}
