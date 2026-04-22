import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AdminShell from '@/components/admin/AdminShell'
import { requireAdminUser } from '@/lib/admin/auth'
import { getWebRouteSummaries } from '@/lib/admin/webContent'

export default async function AdminWebPagesPage() {
  const user = await requireAdminUser()
  const routes = await getWebRouteSummaries()

  return (
    <AdminShell
      user={user}
      title="Strony i sitemap"
      subtitle="To jest witrynowa mapa treści w CMS. Każdy route ma własny pakiet kluczy z wersjami PL / EN / UK, dzięki czemu można zarządzać treścią per page, a nie tylko zbiorczym importem."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={route.routeId}
            href={`/admin/web/pages/${route.routeId}`}
            className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5 transition-all duration-200 hover:border-[#cbd9f4] hover:shadow-[0_18px_48px_rgba(15,29,74,0.06)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">{route.route}</p>
            <h2 className="mt-3 text-xl font-semibold text-[#000759]">{route.title}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {route.groups.map((group) => (
                <span key={group} className="rounded-full bg-[#edf2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1c54f4]">
                  {group}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between text-sm text-[#51628b]">
              <span>{route.keyCount} kluczy</span>
              <span className="inline-flex items-center gap-2 font-semibold text-[#1c54f4]">
                Edytuj <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </AdminShell>
  )
}
