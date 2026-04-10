const polishChars: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n',
  ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n',
  Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
}

export function slugify(text: string): string {
  return text
    .split('')
    .map((char) => polishChars[char] ?? char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function cityToSlug(city: string): string {
  return slugify(city)
}

export function slugToCity(slug: string): string {
  const map: Record<string, string> = {
    warszawa: 'Warszawa',
    krakow: 'Kraków',
    wroclaw: 'Wrocław',
    trojmiasto: 'Trójmiasto',
    poznan: 'Poznań',
    katowice: 'Katowice',
    lodz: 'Łódź',
  }
  return map[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

export function slugToDistrict(slug: string): string {
  const map: Record<string, string> = {
    srodmiescie: 'Śródmieście',
    wola: 'Wola',
    mokotow: 'Mokotów',
    podgorze: 'Podgórze',
    'stare-miasto': 'Stare Miasto',
    ochota: 'Ochota',
    zoliborz: 'Żoliborz',
    praga: 'Praga',
    bielany: 'Bielany',
    ursynow: 'Ursynów',
    wilanow: 'Wilanów',
    wawer: 'Wawer',
    targowek: 'Targówek',
    rembertow: 'Rembertów',
    wesola: 'Wesoła',
    wlochy: 'Włochy',
    ursus: 'Ursus',
    bemowo: 'Bemowo',
  }
  return map[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}
