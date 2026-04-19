import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'
import AdminFlexCalculatorForm from '@/components/admin/AdminFlexCalculatorForm'
import { requireAdminUser } from '@/lib/admin/auth'
import { getFlexCalculatorCmsData } from '@/lib/flex-calculator/data'

export default async function AdminFlexCalculatorPage() {
  const user = await requireAdminUser()
  const data = await getFlexCalculatorCmsData()

  return (
    <AdminShell
      user={user}
      title="Kalkulator flex"
      subtitle="Tutaj zarządzasz treścią wstępu, profilami zagęszczenia, założeniami oraz niewidocznymi dla klienta market data używanymi do obliczeń kalkulatora."
    >
      <div className="flex justify-end">
        <Link
          href="/kalkulator-flex"
          className="inline-flex min-h-[44px] items-center justify-center rounded-[18px] border border-[#d6e0f5] px-5 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
        >
          Otwórz stronę kalkulatora
        </Link>
      </div>

      <AdminFlexCalculatorForm {...data} />
    </AdminShell>
  )
}
