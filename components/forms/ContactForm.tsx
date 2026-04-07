'use client'

import { useState } from 'react'
import { X, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useBasketContext } from '@/lib/context/BasketContext'
import type { BasketItem } from '@/lib/hooks/useBasket'

interface ContactFormProps {
  onClose: () => void
  preselectedListing?: BasketItem | null
}

interface FormData {
  email: string
  phone: string
  message: string
  workstations_from: string
  workstations_to: string
  consent: boolean
}

interface FormErrors {
  email?: string
  consent?: string
}

export default function ContactForm({ onClose, preselectedListing }: ContactFormProps) {
  const { items: basketItems } = useBasketContext()

  const initialListings: BasketItem[] = preselectedListing
    ? [preselectedListing]
    : basketItems

  const [listings, setListings] = useState<BasketItem[]>(initialListings)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    message: '',
    workstations_from: '',
    workstations_to: '',
    consent: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')
  const [workstationsOpen, setWorkstationsOpen] = useState(false)

  function validate(): boolean {
    const e: FormErrors = {}
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Podaj poprawny adres email'
    }
    if (!formData.consent) {
      e.consent = 'Zgoda jest wymagana'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (listings.length === 0) return

    setLoading(true)
    setApiError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          workstations_from: formData.workstations_from ? parseInt(formData.workstations_from) : null,
          workstations_to: formData.workstations_to ? parseInt(formData.workstations_to) : null,
          listing_ids: listings.map((l) => l.id),
          listing_names: listings.map((l) => `${l.name} — ${l.address_street}, ${l.address_city}`),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Błąd serwera')
      }

      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nie udało się wysłać zapytania. Sprawdź połączenie i spróbuj ponownie.'
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="bg-white p-12 text-center max-w-md mx-auto" onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modal-enter 0.2s ease' }}>
          <CheckCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--colliers-green)' }} />
          <h2 className="text-2xl font-light mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
            Zapytanie zostało wysłane
          </h2>
          <p className="text-[var(--colliers-gray)] mb-8">
            Dziękujemy za kontakt. Nasz doradca odpowie na Twoje zapytanie w ciągu jednego dnia roboczego.
          </p>
          <Link href="/biura-serwisowane" onClick={onClose} className="btn-outline">
            Wróć do wyszukiwarki
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--colliers-border)]">
          <div>
            <h2 className="text-2xl font-light" style={{ fontFamily: 'var(--font-serif)', color: 'var(--colliers-navy)' }}>
              Zapytaj o ofertę
            </h2>
            <p className="text-sm text-[var(--colliers-gray)] mt-1">
              Nasz doradca skontaktuje się z Tobą w ciągu jednego dnia roboczego.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--colliers-gray)] hover:text-[var(--colliers-navy)] transition-colors ml-4">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--colliers-border)]">
            {/* Left — contact data */}
            <div className="p-8 flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="form-label">Adres email *</label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="adres@firma.pl"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">Numer telefonu</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+48 000 000 000"
                />
              </div>

              <div>
                <label htmlFor="message" className="form-label">Dodatkowe informacje</label>
                <textarea
                  id="message"
                  className="form-input resize-none"
                  rows={3}
                  maxLength={500}
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Opisz swoje potrzeby..."
                />
              </div>

              {/* Workstations accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setWorkstationsOpen((v) => !v)}
                  className="flex items-center justify-between w-full text-left text-sm font-semibold text-[var(--colliers-navy)] py-2 border-t border-[var(--colliers-border)]"
                >
                  Preferowana liczba stanowisk pracy
                  {workstationsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {workstationsOpen && (
                  <div className="flex items-center gap-3 mt-3">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      className="form-input"
                      placeholder="od"
                      value={formData.workstations_from}
                      onChange={(e) => setFormData((p) => ({ ...p, workstations_from: e.target.value }))}
                    />
                    <span className="text-[var(--colliers-gray)] flex-shrink-0">–</span>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      className="form-input"
                      placeholder="do"
                      value={formData.workstations_to}
                      onChange={(e) => setFormData((p) => ({ ...p, workstations_to: e.target.value }))}
                    />
                    <span className="text-[var(--colliers-gray)] text-sm flex-shrink-0">stanowisk</span>
                  </div>
                )}
              </div>

              {/* Consent */}
              <div>
                <label className="flex gap-3 cursor-pointer items-start">
                  <input
                    type="checkbox"
                    className="mt-1 flex-shrink-0 accent-[var(--colliers-navy)]"
                    checked={formData.consent}
                    onChange={(e) => setFormData((p) => ({ ...p, consent: e.target.checked }))}
                  />
                  <span className="text-xs text-[var(--colliers-gray)] leading-relaxed">
                    Wyrażam zgodę na przetwarzanie moich danych osobowych przez Colliers International Poland sp. z o.o.
                    z siedzibą w Warszawie (ul. Złota 59, 00-120 Warszawa) w celu udzielenia odpowiedzi na moje zapytanie.
                    Więcej informacji w{' '}
                    <Link href="/polityka-prywatnosci" target="_blank" className="underline hover:text-[var(--colliers-blue-bright)]">
                      Polityce prywatności
                    </Link>
                    . *
                  </span>
                </label>
                {errors.consent && <p className="text-red-600 text-xs mt-1">{errors.consent}</p>}
              </div>

              {apiError && (
                <p className="text-red-600 text-sm bg-red-50 p-3 border border-red-200">{apiError}</p>
              )}

              <button
                type="submit"
                disabled={loading || listings.length === 0}
                className="btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                title={listings.length === 0 ? 'Dodaj przynajmniej jedno biuro' : undefined}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                Wyślij zapytanie
              </button>
            </div>

            {/* Right — selected listings */}
            <div className="p-8">
              <p className="form-label mb-4">Wybrane biura ({listings.length})</p>
              {listings.length === 0 ? (
                <p className="text-sm text-[var(--colliers-gray)]">Brak wybranych biur.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {listings.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 p-3 border border-[var(--colliers-border)]">
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
                        <p className="text-xs text-[var(--colliers-gray)]">{item.address_street}, {item.address_city}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setListings((prev) => prev.filter((l) => l.id !== item.id))}
                        className="text-[var(--colliers-gray)] hover:text-[var(--colliers-navy)] flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
