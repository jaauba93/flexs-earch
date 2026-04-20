'use client'

import Image from 'next/image'
import {
  AirVent,
  Bike,
  CalendarDays,
  ClipboardCheck,
  Droplets,
  Flame,
  Headphones,
  PartyPopper,
  ScanLine,
  ShieldCheck,
  SprayCan,
  Video,
  Waves,
} from 'lucide-react'

const availableImageSlugs = new Set([
  'bms',
  'budki-telefoniczne',
  'catering-gastronomia',
  'certyfikat-ekologiczny',
  'dostep-24h',
  'dostep-niepelnosprawnosci',
  'drukarka-skaner',
  'kantyna-restauracja',
  'kawa-herbata',
  'kuchnia-wspolna',
  'monitoring-cctv',
  'obsluga-poczty',
  'ochrona-24-7',
  'osobiste-szafki',
  'otwierane-okna',
  'parking-gosci',
  'parking-samochodowy',
  'pokoj-gier',
  'pokoje-spotkan',
  'prysznice',
  'recepcja',
  'serwis-techniczny',
  'spolecznosc-community',
  'strefa-retail',
  'swiatlowod',
  'system-rezerwacji-sal',
  'taras-patio-ogrod',
  'umeblowanie',
  'wifi-internet',
  'windy',
  'wydarzenia-community',
])

const fallbackIcons = {
  'kontrola-dostepu': ShieldCheck,
  'kontrola-dostepu-budynek': ShieldCheck,
  'czujniki-dymu': Flame,
  'klimatyzacja-lokalna': AirVent,
  'klimatyzacja-centralna': AirVent,
  'zraszacze-ppoz': Droplets,
  'sprzatanie': SprayCan,
  'it-support': Headphones,
  'parking-rowerowy': Bike,
  'stojaki-rowerowe': Bike,
  'przestrzen-eventowa': PartyPopper,
  'pokoj-relaksu': Waves,
  'aplikacja-operatora': ClipboardCheck,
  'studio-nagran': Video,
} as const

interface AmenityIconProps {
  slug: string
  name: string
}

export default function AmenityIcon({ slug, name }: AmenityIconProps) {
  if (availableImageSlugs.has(slug)) {
    return (
      <span className="relative flex h-10 w-10 items-center justify-center">
        <Image
          src={`/amenities-icons/${slug}-dark.png`}
          alt={name}
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
        />
      </span>
    )
  }

  const Icon =
    fallbackIcons[slug as keyof typeof fallbackIcons] ??
    (slug.includes('rezerwacji') ? CalendarDays : ScanLine)

  return (
    <span className="flex h-10 w-10 items-center justify-center text-[#000759]">
      <Icon size={22} strokeWidth={1.8} />
    </span>
  )
}
