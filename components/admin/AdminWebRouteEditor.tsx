'use client'

import { useMemo } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Save } from 'lucide-react'
import type { WebRouteEditorData } from '@/lib/admin/webContent'
import { saveWebRouteAction, type SaveWebRouteState } from '@/app/admin/web/pages/[routeId]/actions'

const initialState: SaveWebRouteState = { status: 'idle' }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Save size={16} />
      {pending ? 'Zapisywanie...' : 'Zapisz tłumaczenia strony'}
    </button>
  )
}

export default function AdminWebRouteEditor({ data }: { data: WebRouteEditorData }) {
  const action = useMemo(() => saveWebRouteAction.bind(null, data.routeId), [data.routeId])
  const [state, formAction] = useFormState(action, initialState)

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>

      {state.message ? (
        <div
          className={`rounded-[18px] px-4 py-3 text-sm ${
            state.status === 'success'
              ? 'border border-[#dbe9ff] bg-[#f4f8ff] text-[#1f4fcf]'
              : 'border border-[#ffd1d6] bg-[#fff6f7] text-[#b42318]'
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Route</p>
        <p className="mt-2 text-lg font-semibold text-[#000759]">{data.route}</p>
        <p className="mt-2 text-sm text-[#51628b]">Klucze są pogrupowane według content packa. Wartość PL pełni rolę źródła bazowego, a EN i UK są wersjami publicznymi dla routingu językowego.</p>
      </section>

      <section className="space-y-4">
        {data.items.map((item) => (
          <div key={item.key} className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1c54f4]">
                {item.group}
              </span>
              <code className="text-xs text-[#51628b]">{item.key}</code>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <label className="admin-field">
                <span>Polski</span>
                <textarea name={`${item.key}__pl`} rows={4} defaultValue={item.value_pl} />
              </label>
              <label className="admin-field">
                <span>English</span>
                <textarea name={`${item.key}__en`} rows={4} defaultValue={item.value_en} />
              </label>
              <label className="admin-field">
                <span>Українська</span>
                <textarea name={`${item.key}__uk`} rows={4} defaultValue={item.value_uk} />
              </label>
            </div>
          </div>
        ))}
      </section>
    </form>
  )
}
