export type BasicsSlug =
  | 'czym-sa-biura-elastyczne'
  | 'modele-biur-elastycznych'
  | 'kiedy-warto-wybrac-flex'
  | 'flex-a-najem-tradycyjny'
  | 'jak-wybrac-biuro-flex'

export interface BasicsTopicSection {
  title: string
  format: string
  items: string[]
}

export interface BasicsTopic {
  slug: BasicsSlug
  eyebrow: string
  h1: string
  lead: string
  heroVisualPlaceholder: string
  keyTakeaway: string
  whyItMattersH2: string
  whyItMattersText: string
  sections: [BasicsTopicSection, BasicsTopicSection, BasicsTopicSection]
  detailBlocks: string[]
}

export interface BasicsLinkCard {
  title: string
  href: string
  description: string
}

const TOPIC_DESCRIPTIONS: Record<BasicsSlug, string> = {
  'czym-sa-biura-elastyczne':
    'Poznaj definicję rynku, główne cechy modelu i różnice względem tradycyjnego biura.',
  'modele-biur-elastycznych':
    'Zobacz, czym różnią się hot desk, prywatny moduł i dedykowana przestrzeń z brandingiem.',
  'kiedy-warto-wybrac-flex':
    'Sprawdź, w jakich sytuacjach flex daje największą przewagę operacyjną i kosztową.',
  'flex-a-najem-tradycyjny':
    'Porównaj dwa modele pod kątem CAPEX-u, czasu wejścia, skalowalności i usług.',
  'jak-wybrac-biuro-flex':
    'Przejdź przez pytania, które pomagają zawęzić wybór i uniknąć kosztownych błędów.',
}

export const BASICS_ORDER: BasicsSlug[] = [
  'czym-sa-biura-elastyczne',
  'modele-biur-elastycznych',
  'kiedy-warto-wybrac-flex',
  'flex-a-najem-tradycyjny',
  'jak-wybrac-biuro-flex',
]

export const BASICS_TOPICS: Record<BasicsSlug, BasicsTopic> = {
  'czym-sa-biura-elastyczne': {
    slug: 'czym-sa-biura-elastyczne',
    eyebrow: 'Podstawy flex',
    h1: 'Czym są biura elastyczne',
    lead: 'Poznaj definicję rynku, jego główne cechy i powody, dla których flex stał się trwałym elementem strategii biurowej wielu firm.',
    heroVisualPlaceholder: 'FLEX_DEFINITION_VISUAL',
    keyTakeaway:
      'Flex to gotowe do pracy środowisko biurowe, które pozwala szybciej uruchomić biuro i ograniczyć nakłady początkowe.',
    whyItMattersH2: 'Dlaczego flex ma dziś znaczenie',
    whyItMattersText:
      'Biura elastyczne odpowiadają na potrzebę szybszego działania, łatwiejszego skalowania i ograniczania CAPEX-u. Raport pokazuje, że ten segment nie jest już dodatkiem do rynku, ale jego trwałym elementem.',
    sections: [
      {
        title: 'Co wyróżnia model flex',
        format: '4 feature cards',
        items: [
          'Gotowe do pracy środowisko biurowe',
          'Krótszy czas uruchomienia',
          'Skalowalność',
          'Usługi w modelu all-in lub quasi all-in',
        ],
      },
      {
        title: 'Co flex daje firmie',
        format: '4 benefit blocks',
        items: ['Szybsze wejście', 'Mniejsze ryzyko', 'Mniej CAPEX-u', 'Większa elastyczność operacyjna'],
      },
      {
        title: 'Co flex nie oznacza',
        format: 'myth vs reality',
        items: [
          'To nie tylko coworking',
          'To nie tylko rozwiązanie dla małych firm',
          'To nie zawsze najtańsza opcja nominalnie',
        ],
      },
    ],
    detailBlocks: [
      'Biura elastyczne to gotowe do pracy, w pełni operacyjne środowisko biurowe, które można uruchomić szybciej niż w modelu tradycyjnym.',
      'Flex odpowiada na potrzebę szybszego dostosowania skali działania do zmian w zatrudnieniu, modelu pracy i strukturze organizacyjnej.',
      'Dziś segment flex jest dojrzały i odpowiada nie tylko na potrzeby freelancerów czy start-upów, ale także średnich i dużych organizacji.',
      'To, że produkt jest komunikowany jako zryczałtowany, nie oznacza pełnej identyczności ofert – zakres usług dodatkowych może istotnie wpływać na całkowity koszt.',
    ],
  },
  'modele-biur-elastycznych': {
    slug: 'modele-biur-elastycznych',
    eyebrow: 'Podstawy flex',
    h1: 'Modele biur elastycznych',
    lead: 'Zobacz trzy podstawowe modele biur elastycznych i sprawdź, który z nich najlepiej odpowiada wielkości zespołu, poziomowi prywatności i oczekiwanej elastyczności.',
    heroVisualPlaceholder: 'FLEX_MODELS_VISUAL',
    keyTakeaway:
      'Flex nie jest jednym produktem — to spektrum modeli, od hot desku po dedykowaną przestrzeń z brandingiem.',
    whyItMattersH2: 'Dlaczego model ma znaczenie',
    whyItMattersText:
      'W ramach rynku flex firmy mogą wybierać rozwiązania bardzo różne pod względem prywatności, kosztu, długości zobowiązania i możliwości personalizacji. Dlatego wybór modelu jest ważniejszy niż samo hasło „coworking”.',
    sections: [
      {
        title: 'Trzy podstawowe modele',
        format: '3 product cards',
        items: [
          'Hot desk w coworku',
          'Prywatny moduł biurowy',
          'Dedykowana przestrzeń z brandingiem i własną recepcją',
        ],
      },
      {
        title: 'Jak dobrać model do potrzeb',
        format: 'decision matrix',
        items: ['Prywatność', 'Koszt', 'Branding', 'Skalowalność', 'Długość zobowiązania'],
      },
      {
        title: 'Na co uważać przy każdym modelu',
        format: 'caution cards',
        items: [
          'Hot desk: brak prywatności',
          'Prywatny moduł: ograniczona personalizacja',
          'Dedykowana przestrzeń: indeksacja i break option',
        ],
      },
    ],
    detailBlocks: [
      'Hot desk to najniższy koszt i maksymalna elastyczność, ale przy ograniczonej prywatności i personalizacji.',
      'Prywatny moduł biurowy daje równowagę między prywatnością a elastycznością oraz ogranicza konieczność inwestycji w fit-out.',
      'Dedykowana przestrzeń z brandingiem i własną recepcją daje najwyższy poziom prywatności i personalizacji, ale wymaga dokładniejszego sprawdzenia warunków komercyjnych.',
      'Przy modelach dedykowanych trzeba zwrócić uwagę na indeksację stawek, zakres personalizacji, break option i jasno opisane ustalenia komercyjne.',
    ],
  },
  'kiedy-warto-wybrac-flex': {
    slug: 'kiedy-warto-wybrac-flex',
    eyebrow: 'Podstawy flex',
    h1: 'Kiedy warto wybrać flex',
    lead: 'Sprawdź, w jakich sytuacjach flex realnie wygrywa z klasycznym najmem: przy ekspansji, wzroście zespołu, relokacji lub pracy projektowej.',
    heroVisualPlaceholder: 'FLEX_SCENARIOS_VISUAL',
    keyTakeaway:
      'Decyzja o wyborze flexu zwykle wynika z konkretnej potrzeby biznesowej, nie z mody.',
    whyItMattersH2: 'Kiedy elastyczność staje się przewagą',
    whyItMattersText:
      'Flex najczęściej wygrywa wtedy, gdy firma działa w warunkach niepewności, wzrostu lub zmian organizacyjnych. Właśnie dlatego raport opisuje sześć scenariuszy, w których elastyczne rozwiązania wspierają strategię najmu.',
    sections: [
      {
        title: 'Sześć sytuacji, w których flex ma sens',
        format: '6 scenario cards',
        items: [
          'Start-up na starcie',
          'Nowa firma bez historii finansowej',
          'Ekspansja na nowy rynek',
          'Tymczasowa relokacja',
          'Zespół projektowy',
          'Flex jako model docelowy',
        ],
      },
      {
        title: 'Co zyskujesz w tych scenariuszach',
        format: '4 benefit cards',
        items: ['Szybkość', 'Ograniczenie ryzyka', 'Przewidywalność kosztów', 'Elastyczność skali'],
      },
      {
        title: 'Kiedy flex nie będzie optymalny',
        format: '3 editorial notes',
        items: [
          'Gdy potrzebujesz pełnej kontroli nad aranżacją w długim horyzoncie',
          'Gdy masz bardzo specyficzne wymagania techniczne',
          'Gdy porównujesz wyłącznie stawki bez TCO',
        ],
      },
    ],
    detailBlocks: [
      'Flex dobrze sprawdza się wtedy, gdy firma nie chce dziś zamykać się w wieloletnim zobowiązaniu, a potrzebuje zacząć działać szybko.',
      'Raport pokazuje sześć częstych scenariuszy: start-up, nowa firma bez historii, ekspansja, relokacja tymczasowa, zespół projektowy i model docelowy.',
      'W tych scenariuszach przewagi flexu najczęściej wynikają z szybkości, ograniczenia CAPEX-u, przewidywalności kosztów i możliwości skalowania.',
      'Flex nie zawsze będzie optymalny tam, gdzie firma potrzebuje bardzo specyficznej aranżacji lub pełnej kontroli nad środowiskiem w długim horyzoncie.',
    ],
  },
  'flex-a-najem-tradycyjny': {
    slug: 'flex-a-najem-tradycyjny',
    eyebrow: 'Podstawy flex',
    h1: 'Flex a najem tradycyjny',
    lead: 'Porównaj dwa modele najmu z perspektywy kosztów, czasu wejścia, skali zobowiązań, usług i operacyjnej elastyczności.',
    heroVisualPlaceholder: 'FLEX_VS_TRADITIONAL_VISUAL',
    keyTakeaway:
      'Najważniejsza różnica nie sprowadza się do ceny za stanowisko, lecz do całkowitego modelu kosztów i ryzyka.',
    whyItMattersH2: 'Dlaczego to porównanie jest trudniejsze niż wygląda',
    whyItMattersText:
      'Porównanie flexu z biurem tradycyjnym nie powinno opierać się wyłącznie na nominalnej stawce. Raport pokazuje, że różnice dotyczą także historii finansowej, czasu najmu, kosztów aranżacji, dostępności usług i ryzyka operacyjnego.',
    sections: [
      {
        title: 'Najważniejsze różnice',
        format: '2-column comparison table',
        items: ['Historia finansowa', 'Powierzchnia', 'Czas najmu', 'Dostępność', 'Dodatkowe udogodnienia'],
      },
      {
        title: 'Gdzie najczęściej pojawia się przewaga flexu',
        format: '4 editorial cards',
        items: [
          'Brak kosztów fit-out',
          'Krótsze zobowiązania',
          'Dostępność od ręki',
          'Usługi w cenie lub pakiecie',
        ],
      },
      {
        title: 'Jak porównywać oferty uczciwie',
        format: 'quote + checklist',
        items: [
          'Zakres usług podstawowych',
          'Elementy dodatkowe',
          'Parking / sale / IT / internet / dostęp',
          'Zasady indeksacji',
        ],
      },
    ],
    detailBlocks: [
      'W modelu tradycyjnym najemca zwykle bierze na siebie aranżację, umeblowanie i długoterminowe zobowiązanie. W flexie większa część infrastruktury jest gotowa od początku.',
      'Raport wskazuje, że porównanie obu modeli obejmuje historię finansową spółki, powierzchnię, czas najmu, dostępność i zakres usług.',
      'Jedną z przewag flexu jest dostępność od ręki, ale przy wysokiej zajętości rynku trzeba odpowiednio wcześnie zabezpieczać najlepsze moduły.',
      'Kluczowe jest porównanie like-for-like, bo nominalna stawka za stanowisko nie pokazuje różnic w internecie, parkingach, salach, meblach czy IT.',
    ],
  },
  'jak-wybrac-biuro-flex': {
    slug: 'jak-wybrac-biuro-flex',
    eyebrow: 'Podstawy flex',
    h1: 'Jak wybrać biuro flex',
    lead: 'Przejdź przez pytania, które pomagają dobrać właściwy model biura i uniknąć błędów na etapie wyboru oferty.',
    heroVisualPlaceholder: 'FLEX_DECISION_VISUAL',
    keyTakeaway:
      'Dobre biuro flex wybiera się nie po samej stawce, ale po dopasowaniu do sposobu pracy i planów wzrostu.',
    whyItMattersH2: 'Dlaczego wybór wymaga więcej niż szybkiego researchu',
    whyItMattersText:
      'Raport podkreśla, że przed podpisaniem umowy warto zatrzymać się na chwilę i odpowiedzieć na kilka pytań o zespół, lokalizację, prywatność i plany rozwoju. To one porządkują decyzję i zmniejszają ryzyko złego wyboru.',
    sections: [
      {
        title: 'Sześć pytań przed decyzją',
        format: 'numbered checklist',
        items: [
          'Ilu pracowników będzie korzystać z biura',
          'Prywatność czy open space',
          'Centrum czy poza centrum',
          'Priorytety: lokalizacja, reprezentacyjność, koszty',
          'Plan rozwoju zespołu',
          'Preferowany styl pracy',
        ],
      },
      {
        title: 'Na co zwrócić uwagę poza samą stawką',
        format: 'risk / caution cards',
        items: [
          'Sąsiedztwo innych firm',
          'Brak gwarancji stałej lokalizacji',
          'Ograniczona możliwość ekspansji',
          'IT i prywatność',
          'Branding i adaptacja',
        ],
      },
      {
        title: 'Co zrobić po zdefiniowaniu potrzeb',
        format: 'next steps block',
        items: [
          'Uporządkuj brief',
          'Ustal priorytety',
          'Porównaj modele',
          'Sprawdź rynek miejski',
          'Uruchom narzędzia',
        ],
      },
    ],
    detailBlocks: [
      'Punktem wyjścia powinno być określenie realnej liczby użytkowników biura: stałych, rotacyjnych i obecnych w dniach szczytu.',
      'Wybór między przestrzenią prywatną a open space zależy od tego, czy zespół często prowadzi poufne rozmowy i spotkania z klientami.',
      'Lokalizacja to nie tylko adres, ale też kompromis między prestiżem, dostępnością komunikacyjną, kosztem i komfortem zespołu.',
      'Po zdefiniowaniu potrzeb warto przejść do narzędzi: porównać modele, oszacować koszty i sprawdzić warunki na rynku w wybranym mieście.',
    ],
  },
}

export const BASICS_TOOLS_SECTION = {
  h2: 'Sprawdź to na swoim przykładzie',
  intro:
    'Wiedza porządkuje decyzję, ale dopiero narzędzia pomagają przełożyć ją na własny zespół, budżet i model pracy.',
  cards: [
    {
      title: 'Kalkulator kosztów',
      text: 'Oszacuj orientacyjny koszt biura i sprawdź wpływ głównych parametrów na budżet.',
      cta: 'Uruchom kalkulator',
      href: '/porownaj#kalkulator-kosztow',
    },
    {
      title: 'Dobierz model biura',
      text: 'Odpowiedz na kilka pytań i zobacz, który model najlepiej odpowiada Twojej sytuacji.',
      cta: 'Rozpocznij quiz',
      href: '/porownaj#porownanie-modeli',
    },
    {
      title: 'Raporty miejskie',
      text: 'Sprawdź, jak wygląda rynek w Warszawie, Krakowie, Wrocławiu i innych miastach.',
      cta: 'Zobacz rynki miejskie',
      href: '/raporty-miejskie',
    },
  ],
}

const NEXT_LINK_MAP: Record<BasicsSlug, Array<{ title: string; href: string }>> = {
  'czym-sa-biura-elastyczne': [
    { title: 'Modele biur elastycznych', href: '/podstawy-flex/modele-biur-elastycznych' },
    { title: 'Flex a najem tradycyjny', href: '/podstawy-flex/flex-a-najem-tradycyjny' },
    { title: 'Raporty miejskie', href: '/raporty-miejskie' },
  ],
  'modele-biur-elastycznych': [
    { title: 'Czym są biura elastyczne', href: '/podstawy-flex/czym-sa-biura-elastyczne' },
    { title: 'Kiedy warto wybrać flex', href: '/podstawy-flex/kiedy-warto-wybrac-flex' },
    { title: 'Dobierz model biura', href: '/porownaj#porownanie-modeli' },
  ],
  'kiedy-warto-wybrac-flex': [
    { title: 'Modele biur elastycznych', href: '/podstawy-flex/modele-biur-elastycznych' },
    { title: 'Jak wybrać biuro flex', href: '/podstawy-flex/jak-wybrac-biuro-flex' },
    { title: 'Kalkulator kosztów', href: '/porownaj#kalkulator-kosztow' },
  ],
  'flex-a-najem-tradycyjny': [
    { title: 'Czym są biura elastyczne', href: '/podstawy-flex/czym-sa-biura-elastyczne' },
    { title: 'Jak wybrać biuro flex', href: '/podstawy-flex/jak-wybrac-biuro-flex' },
    { title: 'Kalkulator kosztów', href: '/porownaj#kalkulator-kosztow' },
  ],
  'jak-wybrac-biuro-flex': [
    { title: 'Flex a najem tradycyjny', href: '/podstawy-flex/flex-a-najem-tradycyjny' },
    { title: 'Kiedy warto wybrać flex', href: '/podstawy-flex/kiedy-warto-wybrac-flex' },
    { title: 'Raporty miejskie', href: '/raporty-miejskie' },
  ],
}

export function getBasicsTopic(slug: string): BasicsTopic | null {
  if (slug in BASICS_TOPICS) return BASICS_TOPICS[slug as BasicsSlug]
  return null
}

export function getBasicsCards(): Array<{ slug: BasicsSlug; title: string; description: string; number: string }> {
  return BASICS_ORDER.map((slug, index) => ({
    slug,
    title: BASICS_TOPICS[slug].h1,
    description: TOPIC_DESCRIPTIONS[slug],
    number: String(index + 1).padStart(2, '0'),
  }))
}

export function getBasicsNextLinks(slug: BasicsSlug): BasicsLinkCard[] {
  const fallbackDescriptions: Record<string, string> = {
    '/raporty-miejskie': 'Zobacz, jak różnią się warunki flex między największymi rynkami w Polsce.',
    '/porownaj#porownanie-modeli': 'Sprawdź, który model biura najlepiej pasuje do Twojej sytuacji.',
    '/porownaj#kalkulator-kosztow': 'Przelicz założenia i oszacuj koszt biura dla swojego zespołu.',
  }
  return NEXT_LINK_MAP[slug].map((item) => ({
    ...item,
    description: item.href.startsWith('/podstawy-flex/')
      ? TOPIC_DESCRIPTIONS[item.href.split('/').pop() as BasicsSlug]
      : fallbackDescriptions[item.href] ?? 'Przejdź do kolejnego kroku i wykorzystaj wiedzę w praktyce.',
  }))
}
