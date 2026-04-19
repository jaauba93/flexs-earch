'use client'

import { useMemo, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Plus, Trash2 } from 'lucide-react'
import { saveFlexCalculatorAction, type SaveFlexCalculatorState } from '@/app/admin/flex-kalkulator/actions'
import type {
  FlexCalculatorCmsData,
  FlexCalculatorDensityOption,
  FlexCalculatorMarketDataRow,
} from '@/lib/flex-calculator/types'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[48px] items-center justify-center rounded-[18px] bg-[#000759] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#1c54f4] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Zapisywanie...' : 'Zapisz kalkulator'}
    </button>
  )
}

function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function NumberInput({
  value,
  onChange,
  step = '0.01',
}: {
  value: number
  onChange: (value: number) => void
  step?: string
}) {
  return (
    <input
      type="number"
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  )
}

export default function AdminFlexCalculatorForm({
  settings,
  densityOptions: initialDensityOptions,
  marketData: initialMarketData,
}: FlexCalculatorCmsData) {
  const [state, formAction] = useFormState<SaveFlexCalculatorState, FormData>(saveFlexCalculatorAction, {
    error: null,
    success: null,
  })
  const [densityOptions, setDensityOptions] = useState<FlexCalculatorDensityOption[]>(initialDensityOptions)
  const [marketData, setMarketData] = useState<FlexCalculatorMarketDataRow[]>(initialMarketData)
  const densityJson = useMemo(() => JSON.stringify(densityOptions), [densityOptions])
  const marketJson = useMemo(() => JSON.stringify(marketData), [marketData])

  function updateDensityOption(index: number, patch: Partial<FlexCalculatorDensityOption>) {
    setDensityOptions((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  function updateMarketRow(index: number, patch: Partial<FlexCalculatorMarketDataRow>) {
    setMarketData((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="density_options_json" value={densityJson} />
      <input type="hidden" name="market_data_json" value={marketJson} />

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 1</p>
          <h2 className="mt-2 text-xl font-semibold text-[#000759]">Wstęp i ustawienia domyślne</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <FieldRow label="Eyebrow">
            <input name="intro_eyebrow" defaultValue={settings.intro_eyebrow} />
          </FieldRow>
          <FieldRow label="Domyślny headcount">
            <input name="default_headcount" type="number" defaultValue={settings.default_headcount} />
          </FieldRow>
          <FieldRow label="Tytuł">
            <textarea name="intro_title" defaultValue={settings.intro_title} className="lg:min-h-[96px]" />
          </FieldRow>
          <FieldRow label="Lead">
            <textarea name="intro_body" defaultValue={settings.intro_body} className="lg:min-h-[96px]" />
          </FieldRow>
          <FieldRow label="Notka: wartości przybliżone">
            <textarea name="intro_disclaimer_approx" defaultValue={settings.intro_disclaimer_approx} />
          </FieldRow>
          <FieldRow label="Notka: dane rynkowe Colliers">
            <textarea name="intro_disclaimer_market" defaultValue={settings.intro_disclaimer_market} />
          </FieldRow>
          <FieldRow label="Notka: wsparcie zespołu Colliers">
            <textarea name="intro_disclaimer_support" defaultValue={settings.intro_disclaimer_support} />
          </FieldRow>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldRow label="Domyślne miasto">
              <input name="default_city_slug" defaultValue={settings.default_city_slug} />
            </FieldRow>
            <FieldRow label="Domyślna lokalizacja">
              <input name="default_location_type" defaultValue={settings.default_location_type} />
            </FieldRow>
            <FieldRow label="Domyślny fit-out">
              <input name="default_fitout_standard" defaultValue={settings.default_fitout_standard} />
            </FieldRow>
            <FieldRow label="Domyślny profil zagęszczenia">
              <input name="default_density_key" defaultValue={settings.default_density_key} />
            </FieldRow>
            <FieldRow label="Domyślny okres flex">
              <input name="default_flex_lease_months" type="number" defaultValue={settings.default_flex_lease_months} />
            </FieldRow>
            <FieldRow label="Domyślny okres konwencji">
              <input
                name="default_conventional_lease_months"
                type="number"
                defaultValue={settings.default_conventional_lease_months}
              />
            </FieldRow>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 2</p>
          <h2 className="mt-2 text-xl font-semibold text-[#000759]">Założenia kalkulatora</h2>
          <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
            Tutaj utrzymujesz globalne założenia używane przez silnik kalkulatora niezależnie od konkretnego rynku.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FieldRow label="Utilities & Maintenance (EUR / mkw. / mies.)">
            <input
              name="utilities_and_maintenance_eur_per_sqm"
              type="number"
              step="0.01"
              defaultValue={settings.utilities_and_maintenance_eur_per_sqm}
            />
          </FieldRow>
          <FieldRow label="Mkw. / stanowisko — pow. wspólne">
            <input
              name="flex_common_area_sqm_per_desk"
              type="number"
              step="0.01"
              defaultValue={settings.flex_common_area_sqm_per_desk}
            />
          </FieldRow>
          <FieldRow label="Add-on factor">
            <input name="add_on_factor" type="number" step="0.01" defaultValue={settings.add_on_factor} />
          </FieldRow>
          <FieldRow label="Rent-free (mies. / rok)">
            <input
              name="rent_free_months_per_year"
              type="number"
              step="0.01"
              defaultValue={settings.rent_free_months_per_year}
            />
          </FieldRow>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 3</p>
            <h2 className="mt-2 text-xl font-semibold text-[#000759]">Profile zagęszczenia</h2>
          </div>
          <button
            type="button"
            onClick={() =>
              setDensityOptions((current) => [
                ...current,
                {
                  key: `new-${current.length + 1}`,
                  label: 'Nowy profil',
                  sort_order: current.length + 1,
                  flex_office_sqm_per_desk: 4,
                  conventional_sqm_per_person_avg: 11,
                  is_active: true,
                },
              ])
            }
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[16px] border border-[#d6e0f5] px-4 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
          >
            <Plus size={16} /> Dodaj profil
          </button>
        </div>

        <div className="space-y-4">
          {densityOptions.map((option, index) => (
            <div key={`${option.key}-${index}`} className="rounded-[20px] border border-[#e1e9f8] bg-white p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-base font-semibold text-[#000759]">{option.label}</p>
                <button
                  type="button"
                  onClick={() => setDensityOptions((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a2339]"
                >
                  <Trash2 size={14} /> Usuń
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FieldRow label="Key">
                  <input value={option.key} onChange={(event) => updateDensityOption(index, { key: event.target.value })} />
                </FieldRow>
                <FieldRow label="Etykieta">
                  <input value={option.label} onChange={(event) => updateDensityOption(index, { label: event.target.value })} />
                </FieldRow>
                <FieldRow label="Sort">
                  <NumberInput value={option.sort_order} onChange={(value) => updateDensityOption(index, { sort_order: value })} step="1" />
                </FieldRow>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={option.is_active}
                    onChange={(event) => updateDensityOption(index, { is_active: event.target.checked })}
                  />
                  <span>
                    <strong>Aktywny profil</strong>
                    <small>Wyłączenie ukrywa profil na froncie, ale zachowuje go w CMS.</small>
                  </span>
                </label>
                <FieldRow label="Flex gabinety (mkw. / WS)">
                  <NumberInput value={option.flex_office_sqm_per_desk} onChange={(value) => updateDensityOption(index, { flex_office_sqm_per_desk: value })} />
                </FieldRow>
                <FieldRow label="Konwencja średnia">
                  <NumberInput value={option.conventional_sqm_per_person_avg} onChange={(value) => updateDensityOption(index, { conventional_sqm_per_person_avg: value })} />
                </FieldRow>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c8ab1]">Sekcja 4</p>
            <h2 className="mt-2 text-xl font-semibold text-[#000759]">Market data</h2>
            <p className="mt-2 max-w-3xl text-sm text-[#51628b]">
              Te wartości są niewidoczne na froncie i służą wyłącznie do obliczeń po stronie serwera.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setMarketData((current) => [
                ...current,
                {
                  city_slug: `new-market-${current.length + 1}`,
                  city_label: 'Nowy rynek',
                  sort_order: current.length + 1,
                  is_active: true,
                  headline_rent_cbd_eur: 0,
                  non_cbd_deduction_eur: 0,
                  service_charge_cbd_pln: 0,
                  service_charge_non_cbd_pln: 0,
                  flex_price_cbd_pln: 0,
                  flex_price_non_cbd_pln: 0,
                  fitout_contribution_cbd_eur: 0,
                  fitout_contribution_non_cbd_eur: 0,
                  fitout_cost_basic_eur: 0,
                  fitout_cost_enhanced_eur: 0,
                  fitout_cost_premium_eur: 0,
                },
              ])
            }
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[16px] border border-[#d6e0f5] px-4 text-sm font-semibold text-[#000759] transition-all duration-200 hover:border-[#1c54f4] hover:text-[#1c54f4]"
          >
            <Plus size={16} /> Dodaj rynek
          </button>
        </div>

        <div className="space-y-4">
          {marketData.map((row, index) => (
            <div key={`${row.city_slug}-${index}`} className="rounded-[20px] border border-[#e1e9f8] bg-white p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-base font-semibold text-[#000759]">{row.city_label}</p>
                <button
                  type="button"
                  onClick={() => setMarketData((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#9a2339]"
                >
                  <Trash2 size={14} /> Usuń
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FieldRow label="City slug">
                  <input value={row.city_slug} onChange={(event) => updateMarketRow(index, { city_slug: event.target.value })} />
                </FieldRow>
                <FieldRow label="Etykieta miasta">
                  <input value={row.city_label} onChange={(event) => updateMarketRow(index, { city_label: event.target.value })} />
                </FieldRow>
                <FieldRow label="Sort">
                  <NumberInput value={row.sort_order} onChange={(value) => updateMarketRow(index, { sort_order: value })} step="1" />
                </FieldRow>
                <label className="admin-toggle">
                  <input
                    type="checkbox"
                    checked={row.is_active}
                    onChange={(event) => updateMarketRow(index, { is_active: event.target.checked })}
                  />
                  <span>
                    <strong>Rynek aktywny</strong>
                    <small>Nieaktywny rynek nie pojawi się na froncie, ale pozostanie w bazie kalkulatora.</small>
                  </span>
                </label>
                <FieldRow label="Headline rent CBD (EUR)">
                  <NumberInput value={row.headline_rent_cbd_eur} onChange={(value) => updateMarketRow(index, { headline_rent_cbd_eur: value })} />
                </FieldRow>
                <FieldRow label="Non-CBD deduction (EUR)">
                  <NumberInput value={row.non_cbd_deduction_eur} onChange={(value) => updateMarketRow(index, { non_cbd_deduction_eur: value })} />
                </FieldRow>
                <FieldRow label="Service charge CBD (PLN)">
                  <NumberInput value={row.service_charge_cbd_pln} onChange={(value) => updateMarketRow(index, { service_charge_cbd_pln: value })} />
                </FieldRow>
                <FieldRow label="Service charge Non-CBD (PLN)">
                  <NumberInput value={row.service_charge_non_cbd_pln} onChange={(value) => updateMarketRow(index, { service_charge_non_cbd_pln: value })} />
                </FieldRow>
                <FieldRow label="Flex price CBD (PLN)">
                  <NumberInput value={row.flex_price_cbd_pln} onChange={(value) => updateMarketRow(index, { flex_price_cbd_pln: value })} />
                </FieldRow>
                <FieldRow label="Flex price Non-CBD (PLN)">
                  <NumberInput value={row.flex_price_non_cbd_pln} onChange={(value) => updateMarketRow(index, { flex_price_non_cbd_pln: value })} />
                </FieldRow>
                <FieldRow label="Fit-out contribution CBD (EUR)">
                  <NumberInput value={row.fitout_contribution_cbd_eur} onChange={(value) => updateMarketRow(index, { fitout_contribution_cbd_eur: value })} />
                </FieldRow>
                <FieldRow label="Fit-out contribution Non-CBD (EUR)">
                  <NumberInput value={row.fitout_contribution_non_cbd_eur} onChange={(value) => updateMarketRow(index, { fitout_contribution_non_cbd_eur: value })} />
                </FieldRow>
                <FieldRow label="Fit-out cost basic (EUR)">
                  <NumberInput value={row.fitout_cost_basic_eur} onChange={(value) => updateMarketRow(index, { fitout_cost_basic_eur: value })} />
                </FieldRow>
                <FieldRow label="Fit-out cost enhanced (EUR)">
                  <NumberInput value={row.fitout_cost_enhanced_eur} onChange={(value) => updateMarketRow(index, { fitout_cost_enhanced_eur: value })} />
                </FieldRow>
                <FieldRow label="Fit-out cost premium (EUR)">
                  <NumberInput value={row.fitout_cost_premium_eur} onChange={(value) => updateMarketRow(index, { fitout_cost_premium_eur: value })} />
                </FieldRow>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e4ebf8] bg-[#fbfcff] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {state.error ? <p className="text-sm font-semibold text-[#9a2339]">{state.error}</p> : null}
            {state.success ? <p className="text-sm font-semibold text-[#237a3b]">{state.success}</p> : null}
          </div>
          <SubmitButton />
        </div>
      </section>
    </form>
  )
}
