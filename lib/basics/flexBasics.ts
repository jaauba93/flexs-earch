export type BasicsSlug =
  | 'czym-sa-biura-elastyczne'
  | 'modele-biur-elastycznych'
  | 'kiedy-warto-wybrac-flex'
  | 'flex-a-najem-tradycyjny'
  | 'jak-wybrac-biuro-flex'

export interface BasicsTopicSection {
  title: string
  format: string
  variant: 'cards' | 'accordion'
  items: Array<{
    title: string
    description: string
  }>
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
        variant: 'cards',
        items: [
          {
            title: 'Gotowe do pracy środowisko biurowe',
            description:
              'Biuro jest przygotowane do pracy od pierwszego dnia: umeblowane, wyposażone i obsługiwane operacyjnie. Firma nie musi uruchamiać osobnego fit-outu, koordynować dostawców ani organizować recepcji od zera.',
          },
          {
            title: 'Krótszy czas uruchomienia',
            description:
              'Wejście do biura może nastąpić w ciągu dni lub kilku tygodni, a nie miesięcy. To szczególnie ważne przy szybkim zatrudnianiu, relokacji lub otwieraniu nowej jednostki biznesowej.',
          },
          {
            title: 'Skalowalność',
            description:
              'Model flex pozwala zwiększać albo zmniejszać zajmowaną powierzchnię wraz ze zmianą potrzeb zespołu. Dzięki temu łatwiej ograniczyć ryzyko wynajęcia zbyt dużego albo zbyt małego biura na długi okres.',
          },
          {
            title: 'Usługi all-in lub quasi all-in',
            description:
              'W jednej miesięcznej opłacie często mieszczą się media, sprzątanie, internet, recepcja, sale spotkań i obsługa operacyjna. Z punktu widzenia zarządzania biurem upraszcza to kontrolę kosztów i komunikację z dostawcami.',
          },
        ],
      },
      {
        title: 'Co flex daje firmie',
        format: '4 benefit blocks',
        variant: 'cards',
        items: [
          {
            title: 'Szybsze wejście',
            description:
              'Brak procesu projektowego skraca czas do uruchomienia zespołu. Dla nowych oddziałów i projektów czasowych to często ważniejsze niż różnica w nominalnej stawce.',
          },
          {
            title: 'Mniejsze ryzyko',
            description:
              'Krótsze zobowiązanie i niższy CAPEX ograniczają ekspozycję na błędną decyzję o metrażu lub lokalizacji. Firma zyskuje większą swobodę korekty kursu, jeśli plan wzrostu zmieni się szybciej niż zakładano.',
          },
          {
            title: 'Mniej CAPEX-u',
            description:
              'W wielu przypadkach nie trzeba finansować aranżacji, mebli i infrastruktury IT od zera. To uwalnia kapitał na rozwój biznesu zamiast zamrażać go w aktywach związanych wyłącznie z biurem.',
          },
          {
            title: 'Większa elastyczność operacyjna',
            description:
              'Zmiany headcountu, modelu pracy albo struktury zespołu da się obsłużyć bez klasycznej, wieloletniej renegocjacji najmu. Biuro dopasowuje się do biznesu, a nie odwrotnie.',
          },
        ],
      },
      {
        title: 'Co flex nie oznacza',
        format: 'myth vs reality',
        variant: 'accordion',
        items: [
          {
            title: 'To nie tylko coworking',
            description:
              'Flex obejmuje zarówno hot deski, jak i pełne prywatne biura dla dużych firm. Coworking jest tylko jednym z wariantów, a nie definicją całego rynku.',
          },
          {
            title: 'To nie tylko rozwiązanie dla małych firm',
            description:
              'Z flexu korzystają również korporacje, centra usług wspólnych i zespoły projektowe. Dla większych organizacji jest to często narzędzie zarządzania ryzykiem, a nie wyłącznie kosztami.',
          },
          {
            title: 'To nie zawsze najtańsza opcja nominalnie',
            description:
              'Na poziomie stawki za stanowisko flex może wyglądać drożej niż najem tradycyjny. Sens porównania pojawia się dopiero wtedy, gdy uwzględnisz TCO, CAPEX, czas wejścia i koszt ryzyka.',
          },
        ],
      },
    ],
    detailBlocks: [
      'Biuro elastyczne to gotowe do pracy środowisko, które pozwala wejść szybciej niż w klasycznym modelu najmu. W praktyce oznacza to mniej etapów wdrożeniowych i krótszą drogę do operacyjnego startu.',
      'Flex odpowiada na potrzebę szybszego dostosowania skali działania do zmian w zatrudnieniu, modelu pracy i strukturze organizacyjnej. Jest to szczególnie istotne tam, gdzie biznes nie chce zamykać się w twardym, wieloletnim scenariuszu.',
      'Dziś segment jest dojrzały i obejmuje nie tylko freelancerów czy start-upy, ale także średnie i duże organizacje. Różnica między ofertami dotyczy głównie zakresu usług, poziomu prywatności i warunków umowy.',
      'Ryczałtowa komunikacja ceny nie oznacza identycznego zakresu każdej oferty. Przy decyzji trzeba sprawdzić, co jest w opłacie, a co pojawi się jako koszt dodatkowy po stronie klienta.',
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
        variant: 'cards',
        items: [
          {
            title: 'Hot desk w coworku',
            description:
              'To najlżejszy model wejścia, bez przypisanego stanowiska i z pełnym wykorzystaniem przestrzeni współdzielonej. Sprawdza się tam, gdzie zespół jest mobilny, a obecność w biurze nie wymaga stałych, prywatnych miejsc pracy.',
          },
          {
            title: 'Prywatny moduł biurowy',
            description:
              'To zamknięte biuro dla jednej firmy, funkcjonujące w ramach większego operatora. Łączy prywatność pracy z dostępem do infrastruktury wspólnej i daje bardziej przewidywalny poziom komfortu operacyjnego.',
          },
          {
            title: 'Dedykowana przestrzeń z brandingiem',
            description:
              'To najbardziej zaawansowany model flex, zwykle wybierany przez większe organizacje. Firma dostaje własne środowisko zaprojektowane pod siebie, ale nadal korzysta z elastycznej formuły operatorskiej.',
          },
        ],
      },
      {
        title: 'Jak dobrać model do potrzeb',
        format: 'decision matrix',
        variant: 'cards',
        items: [
          {
            title: 'Prywatność',
            description:
              'Im większa potrzeba poufności, tym mniej odpowiedni jest hot desk. Dla zespołów zarządzających, sprzedażowych lub finansowych częściej właściwszy będzie prywatny moduł albo przestrzeń dedykowana.',
          },
          {
            title: 'Koszt',
            description:
              'Najniższy koszt wejścia oferuje zwykle coworking, ale nie zawsze jest to najlepsza decyzja operacyjna. Koszt warto oceniać razem z efektywnością pracy zespołu i zakresem usług w pakiecie.',
          },
          {
            title: 'Branding',
            description:
              'Jeśli biuro ma wspierać employer branding albo funkcję reprezentacyjną, potrzebna jest większa kontrola nad przestrzenią. W takiej sytuacji lepiej sprawdza się moduł prywatny lub przestrzeń dedykowana.',
          },
          {
            title: 'Skalowalność',
            description:
              'Największą elastyczność wzrostu daje model operatorski z możliwością ekspansji w ramach budynku. Warto sprawdzić dostępność sąsiednich modułów jeszcze na etapie negocjacji.',
          },
          {
            title: 'Długość zobowiązania',
            description:
              'Krótszy horyzont biznesowy zwykle lepiej współgra z flexem niż klasyczny najem. Przy stabilnym, długim planie warto natomiast policzyć oba modele w pełnym horyzoncie finansowym.',
          },
        ],
      },
      {
        title: 'Na co uważać przy każdym modelu',
        format: 'caution cards',
        variant: 'accordion',
        items: [
          {
            title: 'Hot desk - brak prywatności',
            description:
              'Nie każdy zespół dobrze funkcjonuje w przestrzeni otwartej. Warto wcześniej sprawdzić wpływ na koncentrację, rozmowy handlowe i bezpieczeństwo informacji.',
          },
          {
            title: 'Prywatny moduł - ograniczona personalizacja',
            description:
              'Prywatne biuro daje komfort, ale nie zawsze pełną swobodę aranżacji. Przed podpisaniem umowy trzeba sprawdzić, jak szeroki jest zakres możliwych zmian i oznakowania.',
          },
          {
            title: 'Dedykowana przestrzeń - indeksacja i break option',
            description:
              'Przy większych modułach warunki zaczynają przypominać klasyczny najem i wymagają większej dyscypliny w negocjacjach. Kluczowe są zasady indeksacji, wyjścia z umowy i odpowiedzialności stron.',
          },
        ],
      },
    ],
    detailBlocks: [
      'Hot desk daje najniższy próg wejścia, ale kosztem prywatności i kontroli nad otoczeniem pracy. To rozwiązanie raczej dla zespołów mobilnych niż dla środowisk wymagających poufności.',
      'Prywatny moduł biurowy dobrze równoważy prywatność i elastyczność, a jednocześnie ogranicza potrzebę finansowania własnego fit-outu. Dla wielu firm to najbardziej praktyczny model przejściowy i często także model docelowy.',
      'Dedykowana przestrzeń z brandingiem daje najwyższą kontrolę nad doświadczeniem pracownika i odbiorem marki. Jednocześnie wymaga bardziej szczegółowego sprawdzenia warunków komercyjnych i technicznych.',
      'Przy większych rozwiązaniach operatorskich trzeba czytać umowę z tą samą starannością, co przy najmie tradycyjnym. Szczególnie ważne są indeksacja, możliwość ekspansji i warunki wcześniejszego wyjścia.',
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
        variant: 'cards',
        items: [
          {
            title: 'Start-up na starcie',
            description:
              'Brak dużego CAPEX-u pozwala skupić środki na produkcie i sprzedaży, a nie na aranżacji biura. Elastyczna umowa zmniejsza też ryzyko błędnej decyzji w pierwszych miesiącach działalności.',
          },
          {
            title: 'Nowa firma bez historii finansowej',
            description:
              'Operatorzy często oceniają najemcę bardziej pragmatycznie niż klasyczny landlord. To upraszcza wejście na rynek, nawet jeśli spółka dopiero buduje swoją historię kredytową i operacyjną.',
          },
          {
            title: 'Ekspansja na nowy rynek',
            description:
              'Nowy oddział można uruchomić szybko i bez wieloletniego zobowiązania. To wygodny sposób na przetestowanie lokalizacji przed podjęciem decyzji strategicznej.',
          },
          {
            title: 'Tymczasowa relokacja',
            description:
              'Flex dobrze działa jako rozwiązanie pomostowe podczas fit-outu, przeprowadzki lub reorganizacji siedziby. Pozwala utrzymać ciągłość operacyjną bez przestojów i dublowania kosztów.',
          },
          {
            title: 'Zespół projektowy',
            description:
              'Jeśli zespół ma działać przez określony czas, klasyczny najem na wiele lat zwykle nie ma uzasadnienia. Elastyczne biuro upraszcza zarówno wejście, jak i wyjście z projektu.',
          },
          {
            title: 'Flex jako model docelowy',
            description:
              'Dla części firm flex nie jest rozwiązaniem przejściowym, lecz stałą strategią operacyjną. To szczególnie sensowne tam, gdzie zmienność biznesu pozostaje wysoka przez dłuższy czas.',
          },
        ],
      },
      {
        title: 'Co zyskujesz w tych scenariuszach',
        format: '4 benefit cards',
        variant: 'cards',
        items: [
          {
            title: 'Szybkość',
            description:
              'Brak projektu i fit-outu skraca czas wejścia do biura. W scenariuszach wzrostowych lub relokacyjnych to często najważniejszy argument po stronie biznesu.',
          },
          {
            title: 'Ograniczenie ryzyka',
            description:
              'Krótsze zobowiązanie zmniejsza koszt błędnej decyzji o lokalizacji lub wielkości powierzchni. Firma zyskuje większą możliwość korekty, jeśli plan rozwoju zmieni się szybciej niż zakładano.',
          },
          {
            title: 'Przewidywalność kosztów',
            description:
              'W modelu all-in łatwiej zebrać większość kosztów w jedną pozycję budżetową. To upraszcza planowanie i zmniejsza liczbę zmiennych po stronie finansów i administracji.',
          },
          {
            title: 'Elastyczność skali',
            description:
              'Model operatorski pozwala szybciej rosnąć albo się kurczyć bez pełnej renegocjacji najmu. To szczególnie wartościowe przy zmiennym headcountcie lub pracy projektowej.',
          },
        ],
      },
      {
        title: 'Kiedy flex nie będzie optymalny',
        format: '3 editorial notes',
        variant: 'accordion',
        items: [
          {
            title: 'Gdy potrzebujesz pełnej kontroli nad aranżacją w długim horyzoncie',
            description:
              'Jeśli biuro ma być silnym narzędziem kultury organizacyjnej i pełnej personalizacji, tradycyjny najem może być bardziej efektywny. W takim scenariuszu flex bywa dobrym etapem przejściowym, ale nie zawsze najlepszym rozwiązaniem docelowym.',
          },
          {
            title: 'Gdy masz bardzo specyficzne wymagania techniczne',
            description:
              'Zaawansowana infrastruktura IT, laboratoria albo nietypowe wymogi compliance mogą wymagać rozwiązania poza standardem operatora. Wtedy lepiej od razu sprawdzić, czy rynek flex w ogóle odpowie na brief.',
          },
          {
            title: 'Gdy porównujesz wyłącznie stawki bez TCO',
            description:
              'Nominalna cena za stanowisko nie pokazuje pełnego kosztu decyzji. CAPEX, czas uruchomienia i ryzyko operacyjne często zmieniają wynik porównania bardziej niż sama stawka miesięczna.',
          },
        ],
      },
    ],
    detailBlocks: [
      'Flex dobrze sprawdza się wtedy, gdy firma nie chce dziś zamykać się w wieloletnim zobowiązaniu, a potrzebuje zacząć działać szybko. To model szczególnie użyteczny przy zmianach skali, strukturze lub lokalizacji.',
      'Raport pokazuje sześć częstych scenariuszy: start-up, nową firmę bez historii, ekspansję, relokację tymczasową, zespół projektowy i model docelowy. Każdy z nich ma trochę inne uzasadnienie biznesowe, ale wspólnym mianownikiem jest potrzeba ograniczenia tarcia operacyjnego.',
      'W tych scenariuszach przewagi flexu wynikają najczęściej z szybkości, ograniczenia CAPEX-u, przewidywalności kosztów i możliwości skalowania. To argumenty praktyczne, a nie marketingowe.',
      'Flex nie zawsze będzie optymalny tam, gdzie firma potrzebuje bardzo specyficznej aranżacji albo pełnej kontroli nad środowiskiem w długim horyzoncie. Warto to powiedzieć wprost, zamiast zakładać z góry przewagę jednego modelu.',
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
        variant: 'cards',
        items: [
          {
            title: 'Historia finansowa',
            description:
              'Klasyczny landlord zwykle oczekuje mocniejszej weryfikacji finansowej i dłuższego zobowiązania. Operator flex częściej ocenia biznes szybciej i bardziej pragmatycznie, co może uprościć wejście na rynek.',
          },
          {
            title: 'Powierzchnia',
            description:
              'Najem tradycyjny zwykle wymaga większego metrażu i samodzielnej organizacji przestrzeni. Flex pozwala wejść także przy niewielkim zespole, bez konieczności nadmiarowej powierzchni na start.',
          },
          {
            title: 'Czas najmu',
            description:
              'Tradycyjny model opiera się najczęściej na umowach wieloletnich. Flex daje krótszy horyzont i możliwość szybszej zmiany decyzji, jeśli strategia firmy się zmieni.',
          },
          {
            title: 'Dostępność',
            description:
              'Biuro tradycyjne wymaga projektu i wdrożenia, więc czas uruchomienia jest dłuższy. W flexie przestrzeń jest gotowa operacyjnie znacznie szybciej.',
          },
          {
            title: 'Dodatkowe udogodnienia',
            description:
              'Recepcja, sale spotkań, kuchnie, community i obsługa operacyjna w flexie są częścią modelu. W najmie tradycyjnym większość tych elementów trzeba organizować osobno.',
          },
        ],
      },
      {
        title: 'Gdzie najczęściej pojawia się przewaga flexu',
        format: '4 editorial cards',
        variant: 'cards',
        items: [
          {
            title: 'Brak kosztów fit-out',
            description:
              'Brak konieczności finansowania aranżacji obniża próg wejścia i poprawia płynność finansową. Jest to szczególnie ważne przy szybkiej ekspansji albo w scenariuszu, w którym plan wzrostu nadal jest zmienny.',
          },
          {
            title: 'Krótsze zobowiązania',
            description:
              'Firma nie zamraża decyzji na pięć czy siedem lat. Ta elastyczność ma konkretną wartość finansową, zwłaszcza gdy organizacja działa w warunkach niepewności.',
          },
          {
            title: 'Dostępność od ręki',
            description:
              'Czas uruchomienia często decyduje bardziej niż nominalna stawka. Jeżeli biznes potrzebuje wejść natychmiast, gotowa przestrzeń bywa ważniejsza niż niższy czynsz na papierze.',
          },
          {
            title: 'Usługi w cenie lub pakiecie',
            description:
              'Łatwiej przewidzieć koszt operacyjny i ograniczyć liczbę dostawców. To upraszcza budżetowanie, zarządzanie i codzienną obsługę biura.',
          },
        ],
      },
      {
        title: 'Jak porównywać oferty uczciwie',
        format: 'quote + checklist',
        variant: 'accordion',
        items: [
          {
            title: 'Zakres usług podstawowych',
            description:
              'Sprawdź, co realnie zawiera miesięczna opłata: internet, recepcję, media, sprzątanie, sale spotkań i serwis techniczny. Różnice często pojawiają się właśnie tutaj, a nie na pierwszej stronie oferty.',
          },
          {
            title: 'Elementy dodatkowe',
            description:
              'Dodatkowe karty dostępu, ponadstandardowe sale spotkań, druk, eventy czy usługi IT potrafią istotnie zmienić finalny koszt użytkowania. To właśnie te pozycje najlepiej pokazują, jak różnią się pozornie podobne oferty.',
          },
          {
            title: 'Parking, sale, IT, internet i dostęp',
            description:
              'To obszary, w których operatorzy różnią się najbardziej. Warto porównywać je na poziomie rzeczywistego wykorzystania, a nie samej deklaracji marketingowej.',
          },
          {
            title: 'Zasady indeksacji',
            description:
              'Nominalna stawka startowa nie jest najważniejsza, jeśli umowa agresywnie indeksuje koszt w kolejnych latach. Trzeba analizować cały okres zobowiązania i nie zatrzymywać się na pierwszym roku.',
          },
        ],
      },
    ],
    detailBlocks: [
      'W modelu tradycyjnym najemca zwykle bierze na siebie aranżację, umeblowanie i długoterminowe zobowiązanie. W flexie większa część infrastruktury jest gotowa od początku, dlatego droga do uruchomienia biura jest krótsza.',
      'Porównanie obu modeli obejmuje historię finansową spółki, powierzchnię, czas najmu, dostępność i zakres usług. Sama stawka za stanowisko nie wystarczy, żeby ocenić sens decyzji.',
      'Jedną z przewag flexu jest dostępność od ręki, ale przy wysokiej zajętości rynku trzeba odpowiednio wcześnie zabezpieczać najlepsze moduły. Najlepsze lokalizacje i układy nie są dostępne bez końca.',
      'Kluczowe jest porównanie like-for-like, bo nominalna stawka nie pokazuje różnic w internecie, parkingach, salach, meblach czy IT. Dopiero wtedy TCO zaczyna mówić coś użytecznego.',
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
        variant: 'accordion',
        items: [
          {
            title: 'Ilu pracowników będzie korzystać z biura',
            description:
              'Nie chodzi wyłącznie o headcount, ale o realną obecność w biurze. Model hybrydowy często pozwala zoptymalizować potrzebną powierzchnię bez utraty komfortu pracy.',
          },
          {
            title: 'Prywatność czy open space',
            description:
              'Zespoły sprzedażowe, zarządcze i finansowe zwykle wymagają większej prywatności niż organizacje projektowe. Ten wybór powinien wynikać z charakteru pracy, a nie z samej estetyki biura.',
          },
          {
            title: 'Centrum czy poza centrum',
            description:
              'Adres wpływa nie tylko na prestiż, ale też na rekrutację, retencję i wygodę dojazdu. Lokalizacja powinna wspierać biznes, a nie tylko dobrze wyglądać na slajdzie.',
          },
          {
            title: 'Priorytety: lokalizacja, reprezentacyjność, koszty',
            description:
              'Nie da się maksymalizować wszystkiego jednocześnie. Jasna hierarchia priorytetów znacząco przyspiesza proces decyzyjny i usuwa większość fałszywych opcji.',
          },
          {
            title: 'Plan rozwoju zespołu',
            description:
              'Biuro nie powinno być projektowane wyłącznie na dziś. Warto uwzględnić wzrost albo redukcję zespołu w perspektywie 12-24 miesięcy.',
          },
          {
            title: 'Preferowany styl pracy',
            description:
              'Praca stacjonarna, hybrydowa i rozproszona wymagają zupełnie innych modeli biura. To jeden z najważniejszych filtrów decyzji, bo wpływa zarówno na metraż, jak i na układ przestrzeni.',
          },
        ],
      },
      {
        title: 'Na co zwrócić uwagę poza samą stawką',
        format: 'risk / caution cards',
        variant: 'accordion',
        items: [
          {
            title: 'Sąsiedztwo innych firm',
            description:
              'Otoczenie operatora wpływa na kulturę pracy, komfort zespołu i czasem także networking. Nie każdy budynek odpowiada każdej organizacji, nawet jeśli stawka wygląda podobnie.',
          },
          {
            title: 'Brak gwarancji stałej lokalizacji',
            description:
              'W części modeli coworkingowych operator może zmieniać przypisane stanowiska lub warunki korzystania. Warto to jasno sprawdzić przed podpisaniem umowy, zamiast zakładać stałość z automatu.',
          },
          {
            title: 'Ograniczona możliwość ekspansji',
            description:
              'Dobre biuro dziś nie oznacza dobrej dostępności za pół roku. Trzeba sprawdzić potencjał wzrostu w tej samej lokalizacji, zanim zapadnie decyzja.',
          },
          {
            title: 'IT i prywatność',
            description:
              'Standard operatorski nie zawsze odpowiada wymaganiom korporacyjnym. Bezpieczeństwo danych i infrastruktura sieciowa wymagają osobnej weryfikacji.',
          },
          {
            title: 'Branding i adaptacja',
            description:
              'Nie każdy operator pozwala na pełne oznakowanie lub zmiany aranżacyjne. Dla jednych to detal, a dla innych warunek krytyczny, więc trzeba to ustalić wcześnie.',
          },
        ],
      },
      {
        title: 'Co zrobić po zdefiniowaniu potrzeb',
        format: 'next steps block',
        variant: 'cards',
        items: [
          {
            title: 'Uporządkuj brief',
            description:
              'Zbierz wymagania operacyjne, finansowe i lokalizacyjne w jednym dokumencie. To skraca proces i poprawia jakość ofert, które trafią do porównania.',
          },
          {
            title: 'Ustal priorytety',
            description:
              'Oddziel elementy obowiązkowe od preferowanych. Bez tego każda oferta będzie wyglądać dobrze, a decyzja pozostanie niepotrzebnie rozmyta.',
          },
          {
            title: 'Porównaj modele',
            description:
              'Nie zakładaj z góry, że flex albo tradycyjny najem będzie lepszy. Warto zestawić oba scenariusze na poziomie TCO i ryzyka, a nie tylko samej ceny.',
          },
          {
            title: 'Sprawdź rynek miejski',
            description:
              'Dostępność operatorów i standard ofert różnią się znacząco między lokalizacjami. Decyzja powinna być osadzona w realiach konkretnego miasta.',
          },
          {
            title: 'Uruchom narzędzia',
            description:
              'Podłącz kalkulator kosztów, dobór modelu biura i porównanie flex vs tradycyjny najem. Narzędzia mają prowadzić użytkownika dalej, a nie kończyć jego ścieżkę.',
          },
        ],
      },
    ],
    detailBlocks: [
      'Punktem wyjścia powinno być określenie realnej liczby użytkowników biura: stałych, rotacyjnych i obecnych w dniach szczytu. Dopiero wtedy można sensownie dobrać metraż i typ przestrzeni.',
      'Wybór między przestrzenią prywatną a open space zależy od tego, czy zespół często prowadzi poufne rozmowy i spotkania z klientami. To prosty filtr, ale bardzo skuteczny.',
      'Lokalizacja to nie tylko adres, ale też kompromis między prestiżem, dostępnością komunikacyjną, kosztem i komfortem zespołu. Każdy z tych elementów wpływa na decyzję inaczej.',
      'Po zdefiniowaniu potrzeb warto przejść do narzędzi: porównać modele, oszacować koszty i sprawdzić warunki na rynku w wybranym mieście. To pozwala przejść od ogólnych założeń do realnych ofert.',
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
      href: '/kalkulator-flex',
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
    { title: 'Kalkulator kosztów', href: '/kalkulator-flex' },
  ],
  'flex-a-najem-tradycyjny': [
    { title: 'Czym są biura elastyczne', href: '/podstawy-flex/czym-sa-biura-elastyczne' },
    { title: 'Jak wybrać biuro flex', href: '/podstawy-flex/jak-wybrac-biuro-flex' },
    { title: 'Kalkulator kosztów', href: '/kalkulator-flex' },
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
    '/kalkulator-flex': 'Przelicz założenia i oszacuj koszt biura dla swojego zespołu.',
  }
  return NEXT_LINK_MAP[slug].map((item) => ({
    ...item,
    description: item.href.startsWith('/podstawy-flex/')
      ? TOPIC_DESCRIPTIONS[item.href.split('/').pop() as BasicsSlug]
      : fallbackDescriptions[item.href] ?? 'Przejdź do kolejnego kroku i wykorzystaj wiedzę w praktyce.',
  }))
}
