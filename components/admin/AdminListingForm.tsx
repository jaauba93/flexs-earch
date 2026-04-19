'use client'

import { useMemo, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ImagePlus, Loader2, MapPinned, Star, Trash2 } from 'lucide-react'
import type { ListingImage } from '@/types/database'
import type { ListingTranslationSupport, AdminListingRecord } from '@/lib/admin/data'
import { saveListingAction, type SaveListingState } from '@/app/admin/listings/actions'

interface AdminListingFormProps {
  listing: AdminListingRecord | null
  operators: Array<{ id: string; name: string; slug: string }>
  advisors: Array<{ id: string; name: string; email: string }>
  amenities: Array<{ id: string; name: string; slug: string; category: string; sort_order: number }>
  selectedAmenityIds: string[]
  images: ListingImage[]
  translationSupport: ListingTranslationSupport
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Zapisywanie...' : isNew ? 'Utwórz ofertę' : 'Zapisz zmiany'}
    </button>
  )
}

export default function AdminListingForm({
  listing,
  operators,
  advisors,
  amenities,
  selectedAmenityIds,
  images,
  translationSupport,
}: AdminListingFormProps) {
  const router = useRouter()
  const [state, formAction] = useFormState<SaveListingState, FormData>(saveListingAction, { error: null })
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadPending, setUploadPending] = useState(false)
  const [activeContentTab, setActiveContentTab] = useState<'pl' | 'en' | 'uk'>('pl')
  const [operatorName, setOperatorName] = useState(
    operators.find((operator) => operator.id === listing?.operator_id)?.name ?? ''
  )
  const [addressStreet, setAddressStreet] = useState(listing?.address_street ?? '')
  const [addressPostcode, setAddressPostcode] = useState(listing?.address_postcode ?? '')
  const [addressCity, setAddressCity] = useState(listing?.address_city ?? '')
  const [addressDistrict, setAddressDistrict] = useState(listing?.address_district ?? '')
  const [latitude, setLatitude] = useState(listing?.latitude ? String(listing.latitude) : '')
  const [longitude, setLongitude] = useState(listing?.longitude ? String(listing.longitude) : '')
  const [geocodePending, setGeocodePending] = useState(false)
  const [geocodeStatus, setGeocodeStatus] = useState<string | null>(null)

  const isNew = !listing
  const canManageImages = Boolean(listing?.id)
  const sortedImages = useMemo(() => [...images].sort((a, b) => a.sort_order - b.sort_order), [images])
  const amenitiesByCategory = useMemo(() => {
    const labels: Record<string, string> = {
      building: 'Budynek',
      operator: 'Operator',
      space: 'Przestrzeń',
    }

    return amenities.reduce(
      (acc, amenity) => {
        const key = amenity.category
        if (!acc[key]) {
          acc[key] = {
            label: labels[key] ?? key,
            items: [],
          }
        }
        acc[key].items.push(amenity)
        return acc
      },
      {} as Record<string, { label: string; items: AdminListingFormProps['amenities'] }>
    )
  }, [amenities])

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!listing?.id) {
      setUploadStatus('Najpierw zapisz ofertę, a dopiero potem dodaj zdjęcia.')
      return
    }

    const formData = new FormData(event.currentTarget)
    setUploadPending(true)
    setUploadStatus(null)

    const response = await fetch(`/api/admin/listings/${listing.id}/images`, {
      method: 'POST',
      body: formData,
    })

    const payload = (await response.json()) as { error?: string; message?: string }
    setUploadPending(false)
    setUploadStatus(payload.error || payload.message || 'Gotowe')

    if (response.ok) {
      event.currentTarget.reset()
      router.refresh()
    }
  }

  async function handleDelete(kind: 'main' | 'gallery', imageId?: string) {
    if (!listing?.id) return

    setUploadPending(true)
    setUploadStatus(null)

    const params = new URLSearchParams({ kind })
    if (imageId) params.set('imageId', imageId)

    const response = await fetch(`/api/admin/listings/${listing.id}/images?${params.toString()}`, {
      method: 'DELETE',
    })

    const payload = (await response.json()) as { error?: string; message?: string }
    setUploadPending(false)
    setUploadStatus(payload.error || payload.message || 'Gotowe')

    if (response.ok) {
      router.refresh()
    }
  }

  async function handleGalleryPatch(imageId: string, formData: FormData) {
    if (!listing?.id) return

    setUploadPending(true)
    setUploadStatus(null)

    const response = await fetch(`/api/admin/listings/${listing.id}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageId,
        altText: formData.get(`alt-${imageId}`),
        sortOrder: formData.get(`sort-${imageId}`),
        makeMain: formData.get(`main-${imageId}`) === 'on',
      }),
    })

    const payload = (await response.json()) as { error?: string; message?: string }
    setUploadPending(false)
    setUploadStatus(payload.error || payload.message || 'Gotowe')

    if (response.ok) {
      router.refresh()
    }
  }

  async function handleGeocode() {
    if (!addressStreet || !addressPostcode || !addressCity) {
      setGeocodeStatus('Uzupełnij ulicę, kod pocztowy i miasto, a potem pobierz dane z adresu.')
      return
    }

    setGeocodePending(true)
    setGeocodeStatus(null)

    const response = await fetch('/api/admin/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street: addressStreet,
        postcode: addressPostcode,
        city: addressCity,
      }),
    })

    const payload = (await response.json()) as {
      error?: string
      latitude?: number | null
      longitude?: number | null
      district?: string | null
    }

    setGeocodePending(false)

    if (!response.ok) {
      setGeocodeStatus(payload.error || 'Nie udało się pobrać danych geolokalizacyjnych.')
      return
    }

    if (typeof payload.latitude === 'number') setLatitude(String(payload.latitude))
    if (typeof payload.longitude === 'number') setLongitude(String(payload.longitude))
    if (payload.district) setAddressDistrict(payload.district)

    setGeocodeStatus(
      typeof payload.latitude === 'number' && typeof payload.longitude === 'number'
        ? 'Adres został uzupełniony o koordynaty i dzielnicę.'
        : 'Nie udało się ustalić pełnej lokalizacji. Możesz poprawić adres lub wpisać dane ręcznie.'
    )
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={listing?.id ?? ''} />

        <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 1</p>
            <h2 className="mt-2 text-xl font-semibold text-[#000759]">Dane podstawowe oferty</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="admin-field">
              <span>Nazwa oferty</span>
              <input name="name" defaultValue={listing?.name ?? ''} required />
            </label>
            <label className="admin-field">
              <span>Slug</span>
              <input name="slug" defaultValue={listing?.slug ?? ''} placeholder="np. mindspace-skyliner" />
            </label>
            <label className="admin-field">
              <span>Operator</span>
              <input
                name="operator_name"
                list="operators-list"
                value={operatorName}
                onChange={(event) => setOperatorName(event.target.value)}
                required
                placeholder="Wpisz operatora lub wybierz z listy"
              />
            </label>
            <datalist id="operators-list">
              {operators.map((operator) => (
                <option key={operator.id} value={operator.name} />
              ))}
            </datalist>
            <label className="admin-field">
              <span>Doradca Colliers</span>
              <select name="advisor_id" defaultValue={listing?.advisor_id ?? ''}>
                <option value="">Bez przypisania</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name} ({advisor.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-field">
              <span>Ulica i numer</span>
              <input name="address_street" value={addressStreet} onChange={(event) => setAddressStreet(event.target.value)} required />
            </label>
            <label className="admin-field">
              <span>Kod pocztowy</span>
              <input name="address_postcode" value={addressPostcode} onChange={(event) => setAddressPostcode(event.target.value)} required />
            </label>
            <label className="admin-field">
              <span>Miasto</span>
              <input name="address_city" value={addressCity} onChange={(event) => setAddressCity(event.target.value)} required />
            </label>
            <label className="admin-field">
              <span>Dzielnica</span>
              <input
                name="address_district"
                value={addressDistrict}
                onChange={(event) => setAddressDistrict(event.target.value)}
                placeholder="Może uzupełnić się automatycznie z adresu"
              />
            </label>
            <label className="admin-field">
              <span>Rok otwarcia</span>
              <input name="year_opened" type="number" defaultValue={listing?.year_opened ?? ''} min={1900} max={2100} />
            </label>
            <label className="admin-field">
              <span>Latitude</span>
              <input
                name="latitude"
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="Może uzupełnić się automatycznie"
              />
            </label>
            <label className="admin-field">
              <span>Longitude</span>
              <input
                name="longitude"
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="Może uzupełnić się automatycznie"
              />
            </label>
            <label className="admin-field">
              <span>URL zdjęcia głównego</span>
              <input name="main_image_url" defaultValue={listing?.main_image_url ?? ''} placeholder="Uzupełni się też po uploadzie main image" />
            </label>
          </div>

          <div className="mt-4 rounded-[20px] border border-[#e1e9f8] bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGeocode}
                disabled={geocodePending}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[16px] border border-[#d7e2f6] px-4 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {geocodePending ? <Loader2 size={16} className="animate-spin" /> : <MapPinned size={16} />}
                {geocodePending ? 'Pobieranie...' : 'Uzupełnij z adresu'}
              </button>
              <p className="text-sm text-[#5c6e97]">
                Po zapisie CMS też spróbuje automatycznie uzupełnić dzielnicę i koordynaty, jeśli pola zostaną puste.
              </p>
            </div>
            {geocodeStatus ? <p className="mt-3 text-sm text-[#41547d]">{geocodeStatus}</p> : null}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 1A</p>
            <h2 className="mt-2 text-xl font-semibold text-[#000759]">Udogodnienia oferty</h2>
            <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
              Zaznaczone amenities zapisują się do relacji oferty i będą mogły być używane zarówno na froncie, jak i w imporcie Excel / CSV.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {Object.entries(amenitiesByCategory).map(([category, group]) => (
              <div key={category} className="rounded-[20px] border border-[#e1e9f8] bg-white p-4">
                <h3 className="text-base font-semibold text-[#000759]">{group.label}</h3>
                <div className="mt-4 space-y-2">
                  {group.items.map((amenity) => (
                    <label key={amenity.id} className="admin-toggle min-h-[60px]">
                      <input
                        name="amenity_ids"
                        type="checkbox"
                        value={amenity.id}
                        defaultChecked={selectedAmenityIds.includes(amenity.id)}
                      />
                      <span>
                        <strong>{amenity.name}</strong>
                        <small className="font-mono text-[12px] text-[#7b8bb2]">{amenity.slug}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 2</p>
            <h2 className="mt-2 text-xl font-semibold text-[#000759]">Treści na front publiczny</h2>
            <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
              Sam CMS pozostaje po polsku, ale tutaj przygotowujemy treści dla wersji PL / EN / UK. Jeśli kolumny
              tłumaczeń nie są jeszcze obecne w bazie, pola EN i UK pozostają widoczne jako przygotowanie do migracji.
            </p>
          </div>

          <div className="mb-5 inline-flex rounded-[18px] border border-[#dde7f7] bg-white p-1">
            {(['pl', 'en', 'uk'] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveContentTab(locale)}
                className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition-all ${
                  activeContentTab === locale ? 'bg-[#000759] text-white' : 'text-[#445681] hover:bg-[#f4f7fd]'
                }`}
              >
                {locale === 'pl' ? 'Polski' : locale === 'en' ? 'Angielski' : 'Ukraiński'}
              </button>
            ))}
          </div>

          {activeContentTab === 'pl' ? (
            <label className="admin-field">
              <span>Opis oferty (PL)</span>
              <textarea name="description" rows={6} defaultValue={listing?.description ?? ''} />
            </label>
          ) : null}

          {activeContentTab === 'en' ? (
            <div className="grid gap-4">
              {!translationSupport.name_en || !translationSupport.description_en ? (
                <div className="rounded-[18px] border border-[#ffe1b2] bg-[#fff8ed] px-4 py-3 text-sm text-[#8a5b00]">
                  Kolumny tłumaczeń EN nie są jeszcze dostępne w bazie. Migracja SQL została przygotowana w repozytorium
                  i może zostać uruchomiona w następnym kroku.
                </div>
              ) : null}
              <label className="admin-field">
                <span>Nazwa oferty (EN)</span>
                <input
                  name="name_en"
                  defaultValue={listing?.name_en ?? ''}
                  disabled={!translationSupport.name_en}
                  placeholder="English public title"
                />
              </label>
              <label className="admin-field">
                <span>Opis oferty (EN)</span>
                <textarea
                  name="description_en"
                  rows={6}
                  defaultValue={listing?.description_en ?? ''}
                  disabled={!translationSupport.description_en}
                />
              </label>
            </div>
          ) : null}

          {activeContentTab === 'uk' ? (
            <div className="grid gap-4">
              {!translationSupport.name_uk || !translationSupport.description_uk ? (
                <div className="rounded-[18px] border border-[#ffe1b2] bg-[#fff8ed] px-4 py-3 text-sm text-[#8a5b00]">
                  Kolumny tłumaczeń UK nie są jeszcze dostępne w bazie. Struktura migracji jest już przygotowana w repozytorium.
                </div>
              ) : null}
              <label className="admin-field">
                <span>Nazwa oferty (UK)</span>
                <input
                  name="name_uk"
                  defaultValue={listing?.name_uk ?? ''}
                  disabled={!translationSupport.name_uk}
                  placeholder="Українська назва"
                />
              </label>
              <label className="admin-field">
                <span>Opis oferty (UK)</span>
                <textarea
                  name="description_uk"
                  rows={6}
                  defaultValue={listing?.description_uk ?? ''}
                  disabled={!translationSupport.description_uk}
                />
              </label>
            </div>
          ) : null}
        </section>

        <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 3</p>
            <h2 className="mt-2 text-xl font-semibold text-[#000759]">Parametry komercyjne i publikacja</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="admin-field">
              <span>Cena biura prywatnego</span>
              <input name="price_desk_private" type="number" defaultValue={listing?.price_desk_private ?? ''} />
            </label>
            <label className="admin-field">
              <span>Cena hot-desk</span>
              <input name="price_desk_hotdesk" type="number" defaultValue={listing?.price_desk_hotdesk ?? ''} />
            </label>
            <label className="admin-field">
              <span>Liczba stanowisk</span>
              <input name="total_workstations" type="number" defaultValue={listing?.total_workstations ?? ''} />
            </label>
            <label className="admin-field">
              <span>Min. wielkość biura</span>
              <input name="min_office_size" type="number" defaultValue={listing?.min_office_size ?? ''} />
            </label>
            <label className="admin-field">
              <span>Maks. wielkość biura</span>
              <input name="max_office_size" type="number" defaultValue={listing?.max_office_size ?? ''} />
            </label>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="admin-toggle">
              <input name="is_active" type="checkbox" defaultChecked={listing?.is_active ?? true} />
              <span>
                <strong>Oferta opublikowana</strong>
                <small>Po odznaczeniu oferta znika z frontu, ale zostaje w CMS.</small>
              </span>
            </label>
            <label className="admin-toggle">
              <input name="is_featured" type="checkbox" defaultChecked={listing?.is_featured ?? false} />
              <span>
                <strong>Oferta wyróżniona</strong>
                <small>Pokazywana jako featured na stronie głównej i w wynikach.</small>
              </span>
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

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 4</p>
          <h2 className="mt-2 text-xl font-semibold text-[#000759]">Zdjęcia budynku i galerii</h2>
          <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
            Upload obsługuje zdjęcie główne oraz galerię. Zdjęcia zapisują się w Supabase Storage, a ich adresy są
            aktualizowane w bazie danych przez CMS.
          </p>
        </div>

        {!canManageImages ? (
          <div className="rounded-[18px] border border-dashed border-[#cfdbf2] bg-white px-4 py-4 text-sm text-[#5f709a]">
            Najpierw zapisz nową ofertę. Gdy rekord otrzyma ID, od razu pojawi się upload zdjęć.
          </div>
        ) : (
          <>
            <form onSubmit={handleUpload} className="grid gap-4 rounded-[22px] border border-[#e2e9f7] bg-white p-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
              <label className="admin-field">
                <span>Plik</span>
                <input name="file" type="file" accept=".jpg,.jpeg,.png,.webp" required />
              </label>
              <label className="admin-field">
                <span>Typ zdjęcia</span>
                <select name="kind" defaultValue="gallery">
                  <option value="gallery">Galeria</option>
                  <option value="main">Zdjęcie główne</option>
                </select>
              </label>
              <label className="admin-field">
                <span>Alt text</span>
                <input name="altText" placeholder="Opis zdjęcia na front publiczny" />
              </label>
              <button
                type="submit"
                disabled={uploadPending}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 self-end rounded-[18px] bg-[#edf2ff] px-5 text-sm font-semibold text-[#000759] transition-all hover:bg-[#dfe8ff] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploadPending ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                Dodaj zdjęcie
              </button>
            </form>

            {uploadStatus ? (
              <div className="mt-4 rounded-[16px] border border-[#dce7fb] bg-[#f8fbff] px-4 py-3 text-sm text-[#3d507b]">
                {uploadStatus}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="rounded-[22px] border border-[#e2e9f7] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#000759]">Zdjęcie główne</h3>
                  {listing?.main_image_url ? (
                    <button
                      type="button"
                      onClick={() => handleDelete('main')}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#c4324f] transition-colors hover:text-[#a81f3f]"
                    >
                      <Trash2 size={15} />
                      Usuń
                    </button>
                  ) : null}
                </div>
                {listing?.main_image_url ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] border border-[#e3eaf8]">
                    <Image src={listing.main_image_url} alt={listing.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-[18px] border border-dashed border-[#cfdbf2] bg-[#f8fbff] text-sm text-[#6b7da6]">
                    Brak zdjęcia głównego
                  </div>
                )}
              </div>

              <div className="rounded-[22px] border border-[#e2e9f7] bg-white p-4">
                <h3 className="mb-3 text-base font-semibold text-[#000759]">Galeria</h3>
                {sortedImages.length === 0 ? (
                  <div className="flex min-h-[160px] items-center justify-center rounded-[18px] border border-dashed border-[#cfdbf2] bg-[#f8fbff] text-sm text-[#6b7da6]">
                    Brak zdjęć w galerii
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedImages.map((image) => (
                      <form
                        key={image.id}
                        onSubmit={(event) => {
                          event.preventDefault()
                          handleGalleryPatch(image.id, new FormData(event.currentTarget))
                        }}
                        className="rounded-[18px] border border-[#e8edf8] p-3"
                      >
                        <div className="grid gap-3 md:grid-cols-[116px_minmax(0,1fr)]">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-[#e2e9f7]">
                            <Image src={image.image_url} alt={image.alt_text || listing?.name || 'Zdjęcie oferty'} fill className="object-cover" />
                          </div>
                          <div className="space-y-3">
                            <label className="admin-field">
                              <span>Alt text</span>
                              <input name={`alt-${image.id}`} defaultValue={image.alt_text ?? ''} />
                            </label>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <label className="admin-field">
                                <span>Kolejność</span>
                                <input name={`sort-${image.id}`} type="number" defaultValue={image.sort_order} />
                              </label>
                              <label className="admin-toggle min-h-[72px]">
                                <input name={`main-${image.id}`} type="checkbox" defaultChecked={listing?.main_image_url === image.image_url} />
                                <span>
                                  <strong>Ustaw jako główne</strong>
                                  <small>Po zapisaniu to zdjęcie trafi na listing card i hero oferty.</small>
                                </span>
                              </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="submit"
                                className="inline-flex min-h-[40px] items-center gap-2 rounded-[14px] bg-[#eef3ff] px-4 text-sm font-semibold text-[#000759] transition-colors hover:bg-[#dfe8ff]"
                              >
                                <Star size={15} />
                                Zapisz metadane
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete('gallery', image.id)}
                                className="inline-flex min-h-[40px] items-center gap-2 rounded-[14px] border border-[#ffd6de] px-4 text-sm font-semibold text-[#c4324f] transition-colors hover:bg-[#fff4f6]"
                              >
                                <Trash2 size={15} />
                                Usuń zdjęcie
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
