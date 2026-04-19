'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAILS = ['jakub.bawol@colliers.com']

export default function AdminLoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')
    const destination = nextPath?.startsWith('/admin') ? nextPath : '/admin'

    if (!email || !password) {
      setError('Podaj email i hasło administratora.')
      return
    }

    setPending(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setPending(false)
      setError('Nie udało się zalogować. Sprawdź email i hasło.')
      return
    }

    const normalizedEmail = data.user?.email?.toLowerCase() || email.toLowerCase()
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      await supabase.auth.signOut()
      setPending(false)
      setError('To konto nie ma uprawnień administracyjnych do CMS.')
      return
    }

    router.push(destination)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#10204a]">
          Email administratora
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="h-12 w-full rounded-[16px] border border-[#d7e2f7] bg-white px-4 text-sm text-[#10204a] outline-none transition-all focus:border-[#1c54f4] focus:ring-4 focus:ring-[#1c54f4]/10"
          placeholder="jakub.bawol@colliers.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#10204a]">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="h-12 w-full rounded-[16px] border border-[#d7e2f7] bg-white px-4 text-sm text-[#10204a] outline-none transition-all focus:border-[#1c54f4] focus:ring-4 focus:ring-[#1c54f4]/10"
          placeholder="Wpisz hasło"
        />
      </div>

      {error ? (
        <div className="rounded-[16px] border border-[#ffd5d9] bg-[#fff6f7] px-4 py-3 text-sm text-[#b42318]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#000759_0%,#1c54f4_100%)] px-5 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(28,84,244,0.24)] transition-all duration-200 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? 'Logowanie...' : 'Zaloguj do CMS'}
      </button>
    </form>
  )
}
