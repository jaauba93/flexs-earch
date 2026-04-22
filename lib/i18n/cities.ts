import type { PublicLocale } from '@/lib/i18n/messages'

const CITY_LABELS = {
  warszawa: { pl: 'Warszawa', en: 'Warsaw', uk: 'Варшава' },
  krakow: { pl: 'Kraków', en: 'Krakow', uk: 'Краків' },
  wroclaw: { pl: 'Wrocław', en: 'Wroclaw', uk: 'Вроцлав' },
  trojmiasto: { pl: 'Trójmiasto', en: 'Tricity', uk: 'Тримісто' },
  poznan: { pl: 'Poznań', en: 'Poznan', uk: 'Познань' },
  katowice: { pl: 'Katowice', en: 'Katowice', uk: 'Катовіце' },
  lodz: { pl: 'Łódź', en: 'Lodz', uk: 'Лодзь' },
  gdansk: { pl: 'Gdańsk', en: 'Gdansk', uk: 'Гданськ' },
  lublin: { pl: 'Lublin', en: 'Lublin', uk: 'Люблін' },
} as const

export function getLocalizedCityLabel(citySlug: string, locale: PublicLocale) {
  const normalized = citySlug.trim().toLowerCase()
  const labels = CITY_LABELS[normalized as keyof typeof CITY_LABELS]

  if (!labels) {
    return citySlug
  }

  return labels[locale]
}
