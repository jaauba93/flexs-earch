'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, Loader2, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useBasketContext } from '@/lib/context/BasketContext'
import { useLocaleContext } from '@/lib/context/LocaleContext'
import { getContentMessage } from '@/lib/i18n/runtime'
import { withLocalePath } from '@/lib/i18n/routing'
import type { BasketItem } from '@/lib/hooks/useBasket'

export interface ContactFormPrefill {
  message?: string
  workstations_from?: string
  workstations_to?: string
  extraOpen?: boolean
}

interface ContactFormProps {
  onClose: () => void
  preselectedListing?: BasketItem | null
  prefill?: ContactFormPrefill | null
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

export default function ContactForm({ onClose, preselectedListing, prefill }: ContactFormProps) {
  const { items: basketItems } = useBasketContext()
  const { locale } = useLocaleContext()
  const t = (key: string, fallback?: string) => getContentMessage(locale, key, fallback)

  const initialListings: BasketItem[] = preselectedListing
    ? [preselectedListing]
    : basketItems

  const [listings, setListings] = useState<BasketItem[]>(initialListings)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    message: prefill?.message || '',
    workstations_from: prefill?.workstations_from || '',
    workstations_to: prefill?.workstations_to || '',
    consent: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState('')
  const [extraOpen, setExtraOpen] = useState(Boolean(prefill?.extraOpen))

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function validate(): boolean {
    const e: FormErrors = {}
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = t('contact_form.error.invalid_email', 'Podaj poprawny adres email')
    }
    if (!formData.consent) {
      e.consent = t('contact_form.error.consent', 'Zgoda jest wymagana')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
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
      const message = err instanceof Error ? err.message : t('contact_form.error.generic', 'Nie udało się wysłać zapytania.')
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="modal-backdrop overflow-y-auto" data-lenis-prevent onClick={onClose}>
        <div
          data-lenis-prevent
          className="relative my-auto bg-white p-12 text-center max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modal-enter 0.2s ease' }}
        >
          <CheckCircle size={48} className="mx-auto mb-4 text-[#468254]" />
          <h2 className="mb-3 text-2xl font-normal text-[#000759]">
            {t('contact_form.success.title', 'Zapytanie zostało wysłane')}
          </h2>
          <p className="text-body-muted mb-8 text-sm leading-relaxed">
            {t('contact_form.success.body', 'Dziękujemy. Nasz doradca skontaktuje się z Tobą w ciągu jednego dnia roboczego.')}
          </p>
          <Link href={withLocalePath(locale, '/biura-serwisowane')} onClick={onClose} className="btn-outline">
            {t('contact_form.success.cta', 'Wróć do wyszukiwarki')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop overflow-y-auto" data-lenis-prevent onClick={onClose}>
      <div
        data-lenis-prevent
        className="relative my-auto bg-white w-full max-w-5xl flex flex-col md:flex-row shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh', borderRadius: 0, animation: 'modal-enter 0.2s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 text-slate-400 hover:text-[#000759] transition-colors"
        >
          <X size={22} />
        </button>

        {/* LEFT — form */}
        <div className="flex-[3] overflow-y-auto bg-white p-8 md:p-12" data-lenis-prevent>
          <header className="mb-8">
            <p className="overline mb-2">{t('contact_form.header.eyebrow', 'Zapytanie ofertowe')}</p>
            <h2 className="mb-3 text-3xl font-normal text-[#000759]">{t('contact_form.header.title', 'Zapytaj o ofertę')}</h2>
            <p className="text-body-muted max-w-md text-sm font-normal">
              {t('contact_form.header.body', 'Nasz doradca skontaktuje się z Tobą w ciągu jednego dnia roboczego.')}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="ghost-border">
                <label className="form-label">{t('contact_form.email_label', 'Email (wymagane)')}</label>
                <input
                  type="email"
                  className="w-full bg-transparent border-none px-0 py-2 text-sm text-[#000759] placeholder:text-[#9aa7c9] focus:ring-0"
                  placeholder={t('contact_form.email_placeholder', 'twoj@email.pl')}
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
                {errors.email && <p className="text-red-600 text-[11px] mt-1">{errors.email}</p>}
              </div>
              <div className="ghost-border">
                <label className="form-label">{t('contact_form.phone_label', 'Telefon (opcjonalnie)')}</label>
                <input
                  type="tel"
                  className="w-full bg-transparent border-none px-0 py-2 text-sm text-[#000759] placeholder:text-[#9aa7c9] focus:ring-0"
                  placeholder={t('contact_form.phone_placeholder', '+48 ___ ___ ___')}
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            {/* Extra info accordion */}
            <div className="border-t border-b border-[var(--outline-variant)]/20 py-4">
              <button
                type="button"
                onClick={() => setExtraOpen((v) => !v)}
                className="flex items-center justify-between w-full font-bold text-[11px] uppercase tracking-widest text-[#000759] hover:text-[#1C54F4] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">+</span>
                  {t('contact_form.extra_toggle', 'Dodatkowe informacje (opcjonalnie)')}
                </span>
                <ChevronRight size={16} className={`transition-transform ${extraOpen ? 'rotate-90' : ''}`} />
              </button>
              <div
                className={`grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  extraOpen ? 'mt-5 grid-rows-[1fr] opacity-100 translate-y-0' : 'mt-0 grid-rows-[0fr] opacity-0 -translate-y-1'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="ghost-border">
                        <label className="form-label">{t('contact_form.workstations_from', 'Stanowisk (od)')}</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full bg-transparent border-none px-0 py-2 text-sm text-[#000759] placeholder:text-[#9aa7c9] focus:ring-0"
                          placeholder="np. 10"
                          value={formData.workstations_from}
                          onChange={(e) => setFormData((p) => ({ ...p, workstations_from: e.target.value }))}
                        />
                      </div>
                      <div className="ghost-border">
                        <label className="form-label">{t('contact_form.workstations_to', 'Stanowisk (do)')}</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full bg-transparent border-none px-0 py-2 text-sm text-[#000759] placeholder:text-[#9aa7c9] focus:ring-0"
                          placeholder="np. 25"
                          value={formData.workstations_to}
                          onChange={(e) => setFormData((p) => ({ ...p, workstations_to: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="ghost-border">
                      <label className="form-label">{t('contact_form.notes_label', 'Dodatkowe uwagi')}</label>
                      <textarea
                        rows={6}
                        className="w-full min-h-[160px] resize-y bg-transparent border-none px-0 py-2 text-sm text-[#000759] placeholder:text-[#9aa7c9] focus:ring-0"
                        placeholder={t('contact_form.notes_placeholder', 'Inne wymagania...')}
                        value={formData.message}
                        onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent */}
            <div className="flex gap-4 items-start pt-2">
              <input
                type="checkbox"
                className="mt-1 flex-shrink-0 w-4 h-4 accent-[#000759] cursor-pointer"
                checked={formData.consent}
                onChange={(e) => setFormData((p) => ({ ...p, consent: e.target.checked }))}
              />
              <label className="text-body-muted cursor-pointer select-none text-[11px] leading-relaxed">
                {t('contact_form.consent', 'Wyrażam zgodę na przetwarzanie moich danych osobowych przez Colliers International Poland sp. z o.o. w celu obsługi zapytania oraz przesyłania informacji handlowych.')}
                {' '}
                <Link href={withLocalePath(locale, '/polityka-prywatnosci')} target="_blank" className="text-[#1C54F4] underline">
                  {t('contact_form.privacy_link', 'Polityka prywatności')}
                </Link>
                .
              </label>
            </div>
            {errors.consent && <p className="text-red-600 text-[11px]">{errors.consent}</p>}

            {apiError && (
              <p className="text-red-600 text-sm bg-red-50 p-3 border border-red-200">{apiError}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || listings.length === 0}
                className="btn-primary py-4 px-10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {t('contact_form.submit', 'Wyślij zapytanie')}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT — selected offices */}
        <div className="flex-[2] bg-[var(--surface-container-low)] p-8 md:p-12 border-l border-[var(--outline-variant)]/10 overflow-hidden flex flex-col" data-lenis-prevent>
          <div className="mb-8">
            <p className="overline mb-2">{t('contact_form.selection.eyebrow', 'Twój wybór')}</p>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#000759]">{t('contact_form.selection.title', 'Wybrane biura')}</h3>
          </div>

          {listings.length === 0 ? (
            <p className="text-body-soft text-sm italic">{t('contact_form.selection.empty', 'Brak wybranych biur.')}</p>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: 320 }}>
              {listings.map((item) => (
                <div key={item.id} className="bg-white shadow-sm flex items-center gap-4 p-4">
                  <div className="w-14 h-14 flex-shrink-0 overflow-hidden bg-[var(--surface-container-high)]">
                    {item.main_image_url ? (
                      <Image src={item.main_image_url} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#000759] to-[#25408F]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#000759] truncate">{item.name}</p>
                    <p className="text-body-muted truncate text-[11px]">{item.address_street}, {item.address_city}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setListings((prev) => prev.filter((l) => l.id !== item.id))}
                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Guarantees */}
          <div className="mt-8 border-t border-[var(--outline-variant)]/20 pt-8 space-y-5 hidden md:block">
            <div className="flex items-start gap-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C54F4" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <p className="text-xs font-bold text-[#000759] mb-1">{t('contact_form.guarantee_1_title', 'Gwarancja jakości Colliers')}</p>
                <p className="text-[11px] text-body-muted leading-relaxed">{t('contact_form.guarantee_1_text', 'Wszystkie przestrzenie są weryfikowane przez naszych ekspertów.')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C54F4" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <p className="text-xs font-bold text-[#000759] mb-1">{t('contact_form.guarantee_2_title', 'Szybka odpowiedź')}</p>
                <p className="text-[11px] text-body-muted leading-relaxed">{t('contact_form.guarantee_2_text', 'Otrzymasz propozycje w ciągu jednego dnia roboczego.')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
