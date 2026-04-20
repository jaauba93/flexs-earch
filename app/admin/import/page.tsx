import AdminShell from '@/components/admin/AdminShell'
import AdminImportForm from '@/components/admin/AdminImportForm'
import { requireAdminUser } from '@/lib/admin/auth'

export default async function AdminImportPage() {
  const user = await requireAdminUser()

  return (
    <AdminShell
      user={user}
      title="Import CSV / Excel"
      subtitle="Ta sekcja zastępuje ręczne grzebanie w Supabase. Możesz wsadowo dodawać, aktualizować i usuwać oferty, a osobny moduł Tłumaczenia obsługuje zbiorczy eksport / import treści EN i UK."
    >
      <AdminImportForm />
    </AdminShell>
  )
}
