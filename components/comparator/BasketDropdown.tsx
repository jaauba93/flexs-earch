'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, X, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { useBasketContext } from '@/lib/context/BasketContext'

interface BasketDropdownProps {
  onOpenForm?: () => void
  variant?: 'mobile' | 'desktop'
  transparent?: boolean
}

export default function BasketDropdown({ onOpenForm, variant = 'mobile', transparent = false }: BasketDropdownProps) {
  const { items, count, removeItem, mounted } = useBasketContext()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!mounted) return variant === 'desktop' ? (
    <button
      className={`relative flex items-center gap-2 px-4 py-3 ${transparent ? 'border border-white/30 text-white' : 'border border-[var(--colliers-navy)]/20 text-[var(--colliers-navy)]'}`}
      aria-label="Porównywarka"
    >
      <ArrowLeftRight size={16} />
      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Porównaj</span>
    </button>
  ) : (
    <button className="relative p-2 text-[var(--colliers-navy)]" aria-label="Porównywarka">
      <ShoppingBag size={22} />
    </button>
  )

  return (
    <div ref={ref} className="relative">
      {variant === 'desktop' ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className={`relative flex items-center gap-2 px-4 py-3 transition-all group ${
            transparent
              ? 'border border-white/30 text-white hover:bg-white/8 hover:border-white/55'
              : 'border border-[var(--colliers-navy)]/20 hover:bg-[var(--colliers-navy)]/5 hover:border-[var(--colliers-navy)]/40'
          }`}
          aria-label={`Porównywarka (${count} biur)`}
        >
          <ArrowLeftRight size={16} className={transparent ? 'text-white' : 'text-[var(--colliers-navy)]'} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${transparent ? 'text-white/90 group-hover:text-white' : 'text-[var(--colliers-navy)]/80 group-hover:text-[var(--colliers-navy)]'}`}>
            Porównaj
          </span>
          {count > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1C54F4] opacity-50" />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-[#1C54F4] items-center justify-center text-[9px] font-bold text-white">
                {count}
              </span>
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          className={`relative p-2 transition-colors ${transparent ? 'text-white hover:text-white/80' : 'text-[var(--colliers-navy)] hover:text-[var(--colliers-blue-bright)]'}`}
          aria-label={`Porównywarka (${count} biur)`}
        >
          <ShoppingBag size={22} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--colliers-blue-bright)' }}>
              {count}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[var(--colliers-border)] shadow-[var(--shadow-md)] z-50"
          style={{ animation: 'modal-enter 0.15s ease' }}>
          <div className="p-4 border-b border-[var(--colliers-border)]">
            <p className="font-semibold text-[var(--colliers-navy)]">Twoje biura do porównania</p>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-[var(--colliers-gray)] text-sm">
              Nie dodałeś jeszcze żadnych biur do porównywarki.
            </div>
          ) : (
            <>
              <ul className="max-h-60 overflow-y-auto divide-y divide-[var(--colliers-border)]">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 flex-shrink-0 bg-[var(--colliers-bg-gray)] overflow-hidden">
                      {item.main_image_url ? (
                        <Image src={item.main_image_url} alt={item.name} width={48} height={48}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[var(--colliers-navy)] to-[var(--colliers-blue)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--colliers-navy)] truncate">{item.name}</p>
                      <p className="text-xs text-[var(--colliers-gray)] truncate">{item.address_street}, {item.address_city}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="text-[var(--colliers-gray)] hover:text-[var(--colliers-navy)] flex-shrink-0"
                      aria-label="Usuń z porównywarki">
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="p-4 flex flex-col gap-2 border-t border-[var(--colliers-border)]">
                <button
                  onClick={() => { onOpenForm?.(); setOpen(false) }}
                  className="btn-primary w-full justify-center text-sm py-2.5"
                >
                  Wyślij zapytanie o wybrane biura
                </button>
                <Link href="/porownaj" onClick={() => setOpen(false)}
                  className="btn-outline w-full justify-center text-sm py-2">
                  Porównaj szczegółowo <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
