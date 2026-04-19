'use client'

import { useFormState, useFormStatus } from 'react-dom'
import type { Advisor } from '@/types/database'
import { saveAdvisorAction, type SaveAdvisorState } from '@/app/admin/advisors/actions'

interface AdminAdvisorFormProps {
  advisor: Advisor | null
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Zapisywanie...' : isNew ? 'Utwórz doradcę' : 'Zapisz zmiany'}
    </button>
  )
}

export default function AdminAdvisorForm({ advisor }: AdminAdvisorFormProps) {
  const [state, formAction] = useFormState<SaveAdvisorState, FormData>(saveAdvisorAction, { error: null })
  const isNew = !advisor

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={advisor?.id ?? ''} />

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Profil doradcy</p>
          <h2 className="mt-2 text-xl font-semibold text-[#000759]">Dane doradcy Colliers</h2>
          <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
            Ten moduł pozwala zarządzać osobami przypisywanymi do ofert. Doradcy będą dostępni od razu na liście wyboru w edycji oferty.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="admin-field">
            <span>Imię i nazwisko</span>
            <input name="name" defaultValue={advisor?.name ?? ''} required />
          </label>
          <label className="admin-field">
            <span>Stanowisko</span>
            <input name="title" defaultValue={advisor?.title ?? ''} placeholder="np. Senior Consultant" />
          </label>
          <label className="admin-field">
            <span>E-mail</span>
            <input name="email" type="email" defaultValue={advisor?.email ?? ''} required />
          </label>
          <label className="admin-field">
            <span>Telefon</span>
            <input name="phone" defaultValue={advisor?.phone ?? ''} placeholder="+48 ..." />
          </label>
          <label className="admin-field md:col-span-2">
            <span>URL zdjęcia</span>
            <input name="photo_url" defaultValue={advisor?.photo_url ?? ''} placeholder="Link do zdjęcia profilowego" />
          </label>
        </div>
      </section>

      {state.error ? (
        <div className="rounded-[18px] border border-[#ffd1d6] bg-[#fff6f7] px-4 py-3 text-sm text-[#b42318]">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton isNew={isNew} />
      </div>
    </form>
  )
}
