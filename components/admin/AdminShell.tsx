'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BriefcaseBusiness, ChevronDown, FileSpreadsheet, Globe2, LogOut, PencilRuler } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { logoutAction } from '@/app/admin/actions'

interface AdminShellProps {
  user: User
  title: string
  subtitle?: string
  children: React.ReactNode
}

const businessNavItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/listings', label: 'Oferty', icon: PencilRuler },
  { href: '/admin/advisors', label: 'Doradcy', icon: BriefcaseBusiness },
  { href: '/admin/flex-kalkulator', label: 'Kalkulator flex', icon: BarChart3 },
  { href: '/admin/import', label: 'Import', icon: FileSpreadsheet },
]

const webNavItems = [
  { href: '/admin/web', label: 'Dashboard web', icon: Globe2 },
  { href: '/admin/web/pages', label: 'Strony i sitemap', icon: Globe2 },
  { href: '/admin/web/translations', label: 'Tłumaczenia zbiorcze', icon: Globe2 },
]

export default function AdminShell({ user, title, subtitle, children }: AdminShellProps) {
  const pathname = usePathname()
  const isWebOpen = pathname.startsWith('/admin/web') || pathname.startsWith('/admin/translations')

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-[#10204a]">
      <div className="mx-auto grid min-h-screen max-w-[1720px] gap-6 px-4 py-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[28px] border border-white/65 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,29,74,0.08)] backdrop-blur-xl">
          <Link href="/admin" className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(145deg,#000759,#1c54f4)] text-lg font-bold text-white">
              CF
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#6d7da7]">Colliers Flex</p>
              <p className="text-lg font-semibold text-[#000759]">CMS administracyjny</p>
            </div>
          </Link>

          <div className="mb-5 rounded-[22px] border border-[#e3eaf8] bg-[linear-gradient(180deg,#f9fbff_0%,#f1f5fd_100%)] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7d8db5]">Zalogowano jako</p>
            <p className="mt-2 text-sm font-semibold text-[#000759]">{user.email}</p>
          </div>

          <nav className="space-y-2">
            {businessNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#eef4ff] text-[#1c54f4]'
                      : 'text-[#243763] hover:bg-[#eef4ff] hover:text-[#1c54f4]'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}

            <details open={isWebOpen} className="group rounded-[20px] border border-[#e5ecfa] bg-[#fbfcff]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold text-[#243763] marker:hidden">
                <span className="flex items-center gap-3">
                  <Globe2 size={18} />
                  web
                </span>
                <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-1 px-2 pb-2">
                {webNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#eef4ff] text-[#1c54f4]'
                          : 'text-[#243763] hover:bg-[#eef4ff] hover:text-[#1c54f4]'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </details>
          </nav>

          <form action={logoutAction} className="mt-8">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-[#d6e0f5] bg-white px-4 py-3 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#b9caef] hover:bg-[#f8fbff]"
            >
              <LogOut size={16} />
              Wyloguj
            </button>
          </form>
        </aside>

        <main className="space-y-6 rounded-[30px] border border-white/65 bg-white/70 p-5 shadow-[0_24px_80px_rgba(15,29,74,0.08)] backdrop-blur-xl lg:p-8">
          <header className="flex flex-col gap-3 border-b border-[#e6edf8] pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7b8bb5]">Panel administracyjny</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#000759]">{title}</h1>
              {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-7 text-[#4e5f89]">{subtitle}</p> : null}
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  )
}
