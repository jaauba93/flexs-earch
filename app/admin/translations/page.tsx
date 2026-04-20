import AdminShell from '@/components/admin/AdminShell'
import AdminTranslationsForm from '@/components/admin/AdminTranslationsForm'
import { requireAdminUser } from '@/lib/admin/auth'

export default async function AdminTranslationsPage() {
  const user = await requireAdminUser()

  return (
    <AdminShell
      user={user}
      title="Tłumaczenia"
      subtitle="Ta sekcja porządkuje wielojęzyczność publicznego frontu. Możesz łączyć edycję ręczną w CMS z eksportem całego pakietu do Excela, tłumaczeniem zbiorczym i importem z powrotem."
    >
      <AdminTranslationsForm />
    </AdminShell>
  )
}
