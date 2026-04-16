export type CityReportSlug =
  | 'warszawa'
  | 'krakow'
  | 'wroclaw'
  | 'trojmiasto'
  | 'poznan'
  | 'lodz'
  | 'katowice'

export interface CityReportData {
  citySlug: CityReportSlug
  cityName: string
  cityDbNames: string[]
  heroEyebrow: string
  heroH1: string
  heroLead: string
  heroImagePlaceholder: string
  positioningHeadline: string
  positioningText: string
  kpiOffices: number
  kpiSupply: string
  kpiOccupancy: string
  kpiShareOfOfficeStock: string
  scoreGrowth: 'Niska' | 'Umiarkowana' | 'Wysoka'
  scorePricing: 'Niski' | 'Umiarkowany' | 'Wysoki'
  scoreAvailability: 'Niska' | 'Umiarkowana' | 'Wysoka'
  prices: {
    hotdeskCenter: string
    hotdeskNonCenter: string
    privateCenter: string
    privateNonCenter: string
    note: string
    commentary: string
  }
  keyFacts: string[]
  marketStructureText: string
  topOperators: string
  expertName: string
  expertRole: string
  expertQuoteWeb: string
}

export const CITY_REPORTS: Record<CityReportSlug, CityReportData> = {
  warszawa: {
    citySlug: 'warszawa',
    cityName: 'Warszawa',
    cityDbNames: ['Warszawa'],
    heroEyebrow: 'Raport miejski',
    heroH1: 'Biura elastyczne w Warszawie',
    heroLead:
      'Największy i najbardziej dojrzały rynek flex w Polsce, z najwyższą podażą, silną obecnością operatorów międzynarodowych i bardzo wysoką zajętością w centralnych lokalizacjach.',
    heroImagePlaceholder: 'CITY_HERO_WARSZAWA',
    positioningHeadline: 'Największy i najbardziej dojrzały rynek biur elastycznych w Polsce',
    positioningText:
      'Podaż elastycznych przestrzeni biurowych w Warszawie jest najwyższa w Polsce. Szybki rozwój rynku rozpoczął się w 2016 roku. Od tego czasu operatorzy dostarczyli ponad 200 tys. m² nowej przestrzeni w ponad 80 budynkach.',
    kpiOffices: 95,
    kpiSupply: '235 000 m²',
    kpiOccupancy: '90%',
    kpiShareOfOfficeStock: '4% nowoczesnej podaży',
    scoreGrowth: 'Wysoka',
    scorePricing: 'Wysoki',
    scoreAvailability: 'Niska',
    prices: {
      hotdeskCenter: '1 000 PLN',
      hotdeskNonCenter: '700 PLN',
      privateCenter: '1 900 PLN',
      privateNonCenter: '1 400 PLN',
      note: 'ceny uśrednione za 1 stanowisko w biurze dedykowanym',
      commentary:
        'Największa dywersyfikacja stawek i najwyższa premia za lokalizacje centralne.',
    },
    keyFacts: [
      'Całkowita podaż flex sięga 235 tys. m² i stanowi 4% nowoczesnej powierzchni biurowej.',
      'Dominują operatorzy międzynarodowi: Mindspace, Brain Embassy, WeWork, Regus.',
      'Dziewięciu największych operatorów skupia 70% całkowitej podaży rynku.',
      'Wskaźnik zajętości sięga 85%, a w centrum nawet ponad 90%.',
    ],
    marketStructureText:
      'Rynek o najwyższej skali, dużej koncentracji podaży i silnej pozycji operatorów sieciowych. Najemcy traktują flex jako realną alternatywę dla najmu tradycyjnego.',
    topOperators: 'Regus, The Shire, CitySpace, WeWork, Mindspace',
    expertName: 'Robert Romanowski',
    expertRole: 'Senior Associate, Colliers',
    expertQuoteWeb:
      'Warszawa jest dziś rynkiem dojrzałym: najemcy oczekują już nie tylko elastyczności, ale też transparentnych kosztów, wysokiego standardu i lokalizacji wspierających strategię biznesową.',
  },
  krakow: {
    citySlug: 'krakow',
    cityName: 'Kraków',
    cityDbNames: ['Kraków', 'Krakow'],
    heroEyebrow: 'Raport miejski',
    heroH1: 'Biura elastyczne w Krakowie',
    heroLead:
      'Największy regionalny rynek flex w Polsce, z wysoką zajętością, dużą różnorodnością operatorów i silną pozycją poza ścisłym centrum.',
    heroImagePlaceholder: 'CITY_HERO_KRAKOW',
    positioningHeadline: 'Lider wśród miast regionalnych, zróżnicowany i dynamiczny rynek',
    positioningText:
      'Kraków jest liderem wśród miast regionalnych pod względem podaży powierzchni elastycznych. Udział flex sięga tu około 4% nowoczesnych zasobów biurowych.',
    kpiOffices: 37,
    kpiSupply: '71 000 m²',
    kpiOccupancy: '90%',
    kpiShareOfOfficeStock: '4% nowoczesnej podaży',
    scoreGrowth: 'Wysoka',
    scorePricing: 'Umiarkowany',
    scoreAvailability: 'Niska',
    prices: {
      hotdeskCenter: '750 PLN',
      hotdeskNonCenter: '650 PLN',
      privateCenter: '1 500 PLN',
      privateNonCenter: '1 200 PLN',
      note: 'ceny uśrednione za 1 stanowisko w biurze dedykowanym',
      commentary:
        'Silny rynek regionalny z wyraźną premią za lepsze lokalizacje.',
    },
    keyFacts: [
      'Najbardziej zróżnicowany rynek regionalny; działa tu 18 operatorów.',
      'Ponad 2/3 powierzchni zajmują operatorzy sieciowi.',
      'Popyt utrzymuje się na wysokim poziomie; rozpoznawalne lokalizacje są chętnie przejmowane przez kolejnych operatorów.',
      'Większość powierzchni flex jest poza centrum, w nowoczesnych hubach biznesowych.',
    ],
    marketStructureText:
      'Rynek regionalny o najwyższym stopniu dywersyfikacji, wysokiej zajętości i silnej roli operatorów sieciowych.',
    topOperators: 'Regus, Loftmill, Cluster, Chilliflex',
    expertName: 'Anna Galicka-Bieda',
    expertRole: 'Regional Director, Colliers',
    expertQuoteWeb:
      'W Krakowie flex coraz częściej pełni funkcję elementu strategii najmu: pozwala szybciej zabezpieczyć atrakcyjne lokalizacje i ograniczyć CAPEX oraz ryzyko długich zobowiązań.',
  },
  wroclaw: {
    citySlug: 'wroclaw',
    cityName: 'Wrocław',
    cityDbNames: ['Wrocław', 'Wroclaw'],
    heroEyebrow: 'Raport miejski',
    heroH1: 'Biura elastyczne we Wrocławiu',
    heroLead:
      'Rynek w ekspansji, z rosnącą podażą i coraz większym znaczeniem lokalizacji pozacentralnych.',
    heroImagePlaceholder: 'CITY_HERO_WROCLAW',
    positioningHeadline: 'Rynek w ekspansji, z wieloma nowymi lokalizacjami',
    positioningText:
      'Całkowita podaż powierzchni elastycznych we Wrocławiu wzrosła prawie o połowę w ciągu ostatnich trzech lat, osiągając 4% udziału w rynku biurowym.',
    kpiOffices: 27,
    kpiSupply: '48 000 m²',
    kpiOccupancy: '75%',
    kpiShareOfOfficeStock: '4% całkowitej podaży biurowej',
    scoreGrowth: 'Umiarkowana',
    scorePricing: 'Umiarkowany',
    scoreAvailability: 'Umiarkowana',
    prices: {
      hotdeskCenter: '700 PLN',
      hotdeskNonCenter: '575 PLN',
      privateCenter: '1 450 PLN',
      privateNonCenter: '1 250 PLN',
      note: 'ceny uśrednione za 1 stanowisko w biurze dedykowanym',
      commentary:
        'Stawki stabilne, ale rynek coraz bardziej zróżnicowany między centrum a hubami pozacentralnymi.',
    },
    keyFacts: [
      'Największym operatorem pozostaje CitySpace z czterema lokalizacjami.',
      'Około 3/4 powierzchni zarządzają właściciele budynków.',
      'Niespełna połowa zasobów jest w centrum; reszta w hubach pozacentralnych.',
      'Wśród operatorów sieciowych obecni są Loftmill, Regus i Spaces.',
    ],
    marketStructureText:
      'Rynek rosnący, coraz bardziej dojrzały, z wyraźnym znaczeniem lokalizacji pozacentralnych i owner-led flex.',
    topOperators: 'CitySpace, Loftmill, Regus, Spaces',
    expertName: 'Katarzyna Mosoń',
    expertRole: 'Regional Director, Colliers',
    expertQuoteWeb:
      'Wrocław daje firmom szybkie wejście na rynek i elastyczność skali, a zróżnicowanie lokalizacji pomaga łączyć jakość biura z bardziej konkurencyjnym kosztem.',
  },
  trojmiasto: {
    citySlug: 'trojmiasto',
    cityName: 'Trójmiasto',
    cityDbNames: ['Gdańsk', 'Gdansk', 'Gdynia', 'Sopot', 'Trójmiasto', 'Trojmiasto'],
    heroEyebrow: 'Raport miejski',
    heroH1: 'Biura elastyczne w Trójmieście',
    heroLead:
      'Dynamicznie rozwijający się rynek z silną pozycją operatorów lokalnych i koncentracją podaży w Gdańsku.',
    heroImagePlaceholder: 'CITY_HERO_TROJMIASTO',
    positioningHeadline: 'Dynamiczny rozwój, z silną pozycją lokalnych operatorów',
    positioningText:
      'Rynek elastycznych przestrzeni biurowych w Trójmieście jest w fazie dynamicznego rozwoju.',
    kpiOffices: 20,
    kpiSupply: '29 000 m²',
    kpiOccupancy: '80%',
    kpiShareOfOfficeStock: 'prawie 3% nowoczesnej podaży',
    scoreGrowth: 'Umiarkowana',
    scorePricing: 'Niski',
    scoreAvailability: 'Niska',
    prices: {
      hotdeskCenter: 'n/a',
      hotdeskNonCenter: '1 250 PLN',
      privateCenter: '1 600 PLN',
      privateNonCenter: '1 450 PLN',
      note: 'ceny uśrednione za 1 stanowisko w biurze dedykowanym',
      commentary:
        'Wyraźna koncentracja droższych produktów w najlepszych lokalizacjach Trójmiasta.',
    },
    keyFacts: [
      'Podaż przekracza 29 tys. m² i stanowi prawie 3% nowoczesnej powierzchni biurowej.',
      'Większość podaży jest skoncentrowana w Gdańsku.',
      '60% operatorów to operatorzy po stronie właścicieli budynków.',
      'Największym operatorem jest O4 Coworking w Olivia Centre.',
    ],
    marketStructureText:
      'Rynek rozwijający się dynamicznie, z istotną rolą operatorów lokalnych i koncentracją w Gdańsku.',
    topOperators: 'O4 Coworking + lokalni operatorzy',
    expertName: 'Agnieszka Grzywczewska',
    expertRole: 'Senior Associate, Colliers',
    expertQuoteWeb:
      'Trójmiasto jest atrakcyjne dla firm, które chcą działać w prestiżowych kompleksach biurowych bez angażowania się w kosztowny fit-out i długoterminowe zobowiązania.',
  },
  poznan: {
    citySlug: 'poznan',
    cityName: 'Poznań',
    cityDbNames: ['Poznań', 'Poznan'],
    heroEyebrow: 'Raport miejski',
    heroH1: 'Biura elastyczne w Poznaniu',
    heroLead:
      'Relatywnie mały segment flex na tle dojrzałego rynku biurowego, z niskim nasyceniem formatu.',
    heroImagePlaceholder: 'CITY_HERO_POZNAN',
    positioningHeadline: 'Relatywnie mały rynek flex na tle dojrzałego rynku biurowego',
    positioningText:
      'Segment elastycznych przestrzeni w Poznaniu pozostaje niewielki i odpowiada około 2% całkowitych zasobów biurowych miasta.',
    kpiOffices: 8,
    kpiSupply: '12 000 m²',
    kpiOccupancy: '75%',
    kpiShareOfOfficeStock: 'ok. 2% zasobów biurowych',
    scoreGrowth: 'Niska',
    scorePricing: 'Niski',
    scoreAvailability: 'Niska',
    prices: {
      hotdeskCenter: '850 PLN',
      hotdeskNonCenter: 'n/a',
      privateCenter: '1 250 PLN',
      privateNonCenter: 'n/a',
      note: 'ceny uśrednione za 1 stanowisko w biurze dedykowanym',
      commentary:
        'Rynek mały, z ograniczoną konkurencją i relatywnie prostą strukturą cenową.',
    },
    keyFacts: [
      'Około 75% podaży stanowią biura flex zarządzane przez właścicieli biurowców.',
      'Na rynku działa 6 operatorów, z czego 2 mają po 2 lokalizacje.',
      'Zdecydowana większość powierzchni flex jest w centrum.',
      'Największym operatorem jest Business Link w Maratonie i Nowym Rynku E.',
    ],
    marketStructureText:
      'Rynek wciąż niszowy, o niewielkiej skali, ale użyteczny jako uzupełnienie oferty tradycyjnej.',
    topOperators: 'Business Link + lokalni operatorzy',
    expertName: 'Blanka Klawińska-Okonek',
    expertRole: 'Associate Director, Colliers',
    expertQuoteWeb:
      'W Poznaniu flex dobrze uzupełnia tradycyjną ofertę: sprawdza się przy projektach czasowych, wzroście zespołu i potrzebie szybkiego uruchomienia biura.',
  },
  lodz: {
    citySlug: 'lodz',
    cityName: 'Łódź',
    cityDbNames: ['Łódź', 'Lódź', 'Lodz'],
    heroEyebrow: 'Raport miejski',
    heroH1: 'Biura elastyczne w Łodzi',
    heroLead:
      'Stabilny rynek z wysoką dostępnością powierzchni i koncentracją zasobów w centrum miasta.',
    heroImagePlaceholder: 'CITY_HERO_LODZ',
    positioningHeadline: 'Stabilny rozwój z koncentracją w centrum miasta',
    positioningText:
      'Podaż elastycznej powierzchni w Łodzi stopniowo rośnie i stanowi obecnie około 2% całkowitej podaży biurowej.',
    kpiOffices: 8,
    kpiSupply: '15 000 m²',
    kpiOccupancy: '60%',
    kpiShareOfOfficeStock: 'ok. 2% podaży biurowej',
    scoreGrowth: 'Niska',
    scorePricing: 'Niski',
    scoreAvailability: 'Wysoka',
    prices: {
      hotdeskCenter: '800 PLN',
      hotdeskNonCenter: 'n/a',
      privateCenter: '1 100 PLN',
      privateNonCenter: 'n/a',
      note: 'ceny uśrednione za 1 stanowisko w biurze dedykowanym',
      commentary:
        'Rynek bardziej dostępny kosztowo, z wysoką dostępnością powierzchni.',
    },
    keyFacts: [
      'Ponad 75% powierzchni elastycznej jest w centrum miasta.',
      'Wyróżnia się CitySpace Fuzja, zajmujący cały kameralny budynek o pow. ok. 2 tys. m².',
      'Największym operatorem jest CitySpace z ok. 5,5 tys. m² i ponad 820 stanowiskami.',
      'Wśród aktywnych operatorów przeważają sieciowi: Chilliflex, Loftmill, Memos.',
    ],
    marketStructureText:
      'Rynek bardziej przystępny kosztowo, z wysoką dostępnością i dobrą przydatnością dla wejścia, projektów i pracy hybrydowej.',
    topOperators: 'CitySpace, Memos, Loftmill/Chilliflex',
    expertName: 'Andrzej Szczepanik',
    expertRole: 'Regional Director, Colliers',
    expertQuoteWeb:
      'Łódź wspiera efektywne wejście na rynek dzięki centralnym lokalizacjom, umiarkowanym kosztom i rozwiązaniom wygodnym dla zespołów projektowych oraz organizacji hybrydowych.',
  },
  katowice: {
    citySlug: 'katowice',
    cityName: 'Katowice',
    cityDbNames: ['Katowice'],
    heroEyebrow: 'Raport miejski',
    heroH1: 'Biura elastyczne w Katowicach',
    heroLead:
      'Rynek rozwijający się stopniowo, z przewagą lokalnych operatorów i dużym znaczeniem centralnych lokalizacji.',
    heroImagePlaceholder: 'CITY_HERO_KATOWICE',
    positioningHeadline: 'Rynek w fazie szybkiego wzrostu, z przewagą lokalnych operatorów',
    positioningText:
      'Rynek powierzchni elastycznych w Katowicach rozwija się stopniowo od kilku lat; w ostatnich pięciu latach przybyło ponad 12 tys. m² w ośmiu lokalizacjach.',
    kpiOffices: 18,
    kpiSupply: '21 000 m²',
    kpiOccupancy: '75%',
    kpiShareOfOfficeStock: 'n/d',
    scoreGrowth: 'Niska',
    scorePricing: 'Niski',
    scoreAvailability: 'Umiarkowana',
    prices: {
      hotdeskCenter: '750 PLN',
      hotdeskNonCenter: '650 PLN',
      privateCenter: '1 250 PLN',
      privateNonCenter: '1 100 PLN',
      note: 'ceny uśrednione za 1 stanowisko w biurze dedykowanym',
      commentary:
        'Umiarkowany poziom cen ograniczany przez sytuację na tradycyjnym rynku biurowym.',
    },
    keyFacts: [
      'Większość powierzchni elastycznej koncentruje się w centrum miasta.',
      'Dominują produkty dostarczane przez właścicieli biurowców, głównie polskie firmy.',
      'Do najbardziej aktywnych operatorów należą CitySpace, DL Space i Loftmill.',
      'Szacowana dostępność powierzchni na bazie ofert największych operatorów to ok. 25%.',
    ],
    marketStructureText:
      'Rynek na wcześniejszym etapie rozwoju, atrakcyjny dla firm testujących lokalizację i ograniczających ryzyko.',
    topOperators: 'DL Space, Ace of Space, Regus',
    expertName: 'Barbara Pryszcz',
    expertRole: 'Regional Director, Colliers',
    expertQuoteWeb:
      'Katowice są dobrym rynkiem dla firm, które chcą przetestować lokalizację i ograniczyć ryzyko nadmiernego metrażu, korzystając z gotowych przestrzeni w centrum.',
  },
}

export const CITY_REPORT_ORDER: CityReportSlug[] = [
  'warszawa',
  'krakow',
  'wroclaw',
  'trojmiasto',
  'poznan',
  'lodz',
  'katowice',
]

export function getCityReport(slug: string): CityReportData | null {
  if (slug in CITY_REPORTS) return CITY_REPORTS[slug as CityReportSlug]
  return null
}

const SCORE_MAP: Record<string, number> = {
  Wysoka: 86,
  Wysoki: 82,
  Umiarkowana: 62,
  Umiarkowany: 60,
  Niska: 38,
  Niski: 36,
}

export function toScoreValue(value: string): number {
  return SCORE_MAP[value] ?? 50
}
