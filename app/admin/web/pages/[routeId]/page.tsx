import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import AdminWebRouteEditor from '@/components/admin/AdminWebRouteEditor'
import { requireAdminUser } from '@/lib/admin/auth'
import { getWebRouteEditorData } from '@/lib/admin/webContent'

export default async function AdminWebRoutePage({
  params,
}: {
  params: Promise<{ routeId: string }>
}) {
  const user = await requireAdminUser()
  const { routeId } = await params
  const data = await getWebRouteEditorData(routeId)

  if (!data) {
    notFound()
  }

  return (
    <AdminShell
      user={user}
      title={data.title}
      subtitle={`Edytujesz route \`${data.route}\`. Zmiany zapisują wersje PL / EN / UK do public_site_translations i od razu zasilają publiczny routing językowy.`}
    >
      <AdminWebRouteEditor data={data} />
    </AdminShell>
  )
}
