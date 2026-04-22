import {
  BASICS_ORDER,
  BASICS_TOOLS_SECTION,
  BASICS_TOPICS,
  getBasicsCards,
  getBasicsNextLinks,
} from '@/lib/basics/flexBasics'
import { CITY_REPORT_ORDER, CITY_REPORTS } from '@/lib/reports/cityReports'

export interface StaticContentEntry {
  key: string
  group: string
  route: string
  value_pl: string
}

function entry(key: string, group: string, route: string, value_pl: string): StaticContentEntry {
  return { key, group, route, value_pl }
}

const HOME_CONTENT: StaticContentEntry[] = [
  entry('meta.layout.default_title', 'metadata', 'global', 'Colliers Flex — Biura serwisowane w Polsce'),
  entry('meta.layout.description', 'metadata', 'global', 'Wyszukiwarka biur serwisowanych i coworkingów w Polsce. Porównaj oferty, sprawdź ceny i uzyskaj rekomendację doradcy Colliers.'),
  entry('meta.home.title', 'metadata', '/', 'Colliers Flex — Biura serwisowane w Polsce'),
  entry('meta.home.description', 'metadata', '/', 'Przeszukaj setki lokalizacji biur serwisowanych i coworkingów w Polsce. Porównaj oferty i uzyskaj rekomendację doradcy Colliers.'),
  entry('meta.home.og_title', 'metadata', '/', 'Colliers Flex — Biura serwisowane w Polsce'),
  entry('meta.home.og_description', 'metadata', '/', 'Wyszukiwarka biur serwisowanych i coworkingów dla Twojej firmy.'),
  entry('home.hero.eyebrow', 'page', '/', 'Biura serwisowane w Polsce'),
  entry('home.hero.title_line_1', 'page', '/', 'Znajdź biuro serwisowane'),
  entry('home.hero.title_line_2', 'page', '/', 'z pomocą Colliers'),
  entry('home.hero.lead', 'page', '/', 'Przeszukaj oferty w największych miastach, porównaj lokalizacje i zawęź wybór szybciej.'),
  entry('home.hero.search_placeholder', 'page', '/', 'Wpisz miasto, dzielnicę lub nazwę biura...'),
  entry('home.hero.search_cta', 'page', '/', 'Szukaj biur'),
  entry('home.hero.show_all_cta', 'page', '/', 'Pokaż wszystkie biura w Polsce →'),
  entry('home.hero.popular_label', 'page', '/', 'Popularne:'),
  entry('home.hero.search_group_cities', 'page', '/', 'Miasta'),
  entry('home.hero.search_group_offices', 'page', '/', 'Biura'),
  entry('home.hero.search_group_metro', 'page', '/', 'Linie metra'),
  entry('home.hero.search_group_districts', 'page', '/', 'Dzielnice'),
  entry('home.tools.title', 'page', '/', 'Narzędzia i wiedza do lepszej decyzji'),
  entry('home.tools.lead', 'page', '/', 'Nie każda firma potrzebuje tego samego typu biura. Skorzystaj z narzędzi porównawczych i wiedzy eksperckiej, aby szybciej zawęzić wybór i podjąć racjonalną decyzję.'),
  entry('home.tools.model_compare.title', 'page', '/', 'Porównywarka modeli biura'),
  entry('home.tools.model_compare.text', 'page', '/', 'Sprawdź, czy lepszym wyborem będzie biuro serwisowane, najem tradycyjny czy model hybrydowy.'),
  entry('home.tools.model_compare.cta', 'page', '/', 'Porównaj modele'),
  entry('home.tools.calculator.title', 'page', '/', 'Kalkulator kosztów biura'),
  entry('home.tools.calculator.text', 'page', '/', 'Oszacuj orientacyjny koszt biura dla Twojego zespołu i zobacz, jak różne założenia wpływają na budżet.'),
  entry('home.tools.calculator.cta', 'page', '/', 'Uruchom kalkulator'),
  entry('home.tools.guide.title', 'page', '/', 'Przewodnik Flex'),
  entry('home.tools.guide.text', 'page', '/', 'Poznaj podstawy rynku, porównaj modele i przejdź przez kluczowe decyzje przed wyborem biura.'),
  entry('home.tools.guide.cta', 'page', '/', 'Przejdź do przewodnika'),
  entry('home.cta.title', 'page', '/', 'Skonsultuj wybór z doradcą Colliers'),
  entry('home.cta.lead', 'page', '/', 'Jeśli chcesz przejść od inspiracji do shortlisty, pomożemy zawęzić rynek, porównać opcje i przygotować rekomendację dopasowaną do Twojego zespołu.'),
  entry('home.cta.primary', 'page', '/', 'Porozmawiaj z doradcą'),
  entry('home.cta.secondary', 'page', '/', 'Zobacz oferty'),
  entry('home.process.eyebrow', 'page', '/', 'Przewodnik'),
  entry('home.process.title_line_1', 'page', '/', 'Jak działamy'),
  entry('home.process.title_line_2', 'page', '/', 'w Colliers Flex?'),
  entry('home.process.step_1_title', 'page', '/', 'Określ swoje potrzeby'),
  entry('home.process.step_1_text', 'page', '/', 'Powiedz nam, ile stanowisk szukasz, w jakim mieście i na jak długo. Możesz też skorzystać z porównywarki modeli.'),
  entry('home.process.step_2_title', 'page', '/', 'Porównaj najlepsze oferty'),
  entry('home.process.step_2_text', 'page', '/', 'Dobierzemy dla Ciebie oferty dopasowane do budżetu i wymagań. Możesz też je ze sobą zestawić w naszej porównywarce.'),
  entry('home.process.step_3_title', 'page', '/', 'Sfinalizuj umowę'),
  entry('home.process.step_3_text', 'page', '/', 'Nasz doradca przeprowadzi Cię przez negocjacje i formalności — bezpłatnie, bez zobowiązań.'),
]

const GUIDE_CONTENT: StaticContentEntry[] = [
  entry('meta.guide.title', 'metadata', '/przewodnik-flex', 'Przewodnik po biurach elastycznych'),
  entry('meta.guide.description', 'metadata', '/przewodnik-flex', 'Modele najmu, różnice względem biura tradycyjnego, kryteria wyboru i raporty miejskie rynku flex w Polsce.'),
  entry('meta.guide.og_title', 'metadata', '/przewodnik-flex', 'Przewodnik po biurach elastycznych'),
  entry('meta.guide.og_description', 'metadata', '/przewodnik-flex', 'Poznaj podstawy flex, porównaj modele najmu i sprawdź raporty miejskie dla największych rynków w Polsce.'),
  entry('guide.hero.eyebrow', 'page', '/przewodnik-flex', 'Przewodnik Flex'),
  entry('guide.hero.title', 'page', '/przewodnik-flex', 'Przewodnik po biurach elastycznych'),
  entry('guide.hero.lead', 'page', '/przewodnik-flex', 'Modele najmu, różnice względem biura tradycyjnego, praktyczne kryteria wyboru i raporty miejskie dla największych rynków w Polsce. Wszystko w jednym miejscu.'),
  entry('guide.hero.body', 'page', '/przewodnik-flex', 'Biuro flex to dziś nie tylko coworking. To szerokie spektrum rozwiązań — od hot desku po dedykowane moduły z brandingiem, własną recepcją i rozbudowanym zakresem usług. To ważne, bo raport pokazuje, że segment w Polsce przekroczył już 420 tys. m², a na największych rynkach udział flex sięga około 3–4% nowoczesnej podaży biurowej.'),
  entry('guide.hero.primary_cta', 'page', '/przewodnik-flex', 'Zacznij od podstaw'),
  entry('guide.hero.secondary_cta', 'page', '/przewodnik-flex', 'Sprawdź raporty miejskie'),
  entry('guide.nav.eyebrow', 'page', '/przewodnik-flex', 'Szybka nawigacja'),
  entry('guide.context.eyebrow', 'page', '/przewodnik-flex', 'Dlaczego teraz'),
  entry('guide.context.title', 'page', '/przewodnik-flex', 'Rynek flex dojrzał. Decyzja stała się bardziej strategiczna niż doraźna.'),
  entry('guide.context.body', 'page', '/przewodnik-flex', 'Elastyczne biura przestały być formatem kojarzonym wyłącznie z coworkingiem. Dziś są elementem strategii najmu dla firm, które chcą szybciej uruchamiać biura, ograniczać CAPEX, lepiej reagować na zmiany zatrudnienia i korzystać z gotowego środowiska pracy. Raport wskazuje, że w siedmiu największych miastach Polski całkowita podaż flex przekracza 420 tys. m², z najwyższą skalą w Warszawie, Krakowie i Wrocławiu.'),
  entry('guide.context.kpi_supply_label', 'page', '/przewodnik-flex', 'm² elastycznej powierzchni w 7 największych miastach'),
  entry('guide.context.kpi_warsaw_label', 'page', '/przewodnik-flex', 'w Warszawie'),
  entry('guide.context.kpi_krakow_label', 'page', '/przewodnik-flex', 'w Krakowie'),
  entry('guide.section.basics.eyebrow', 'page', '/przewodnik-flex', 'Podstawy flex'),
  entry('guide.section.reports.eyebrow', 'page', '/przewodnik-flex', 'Raporty miejskie'),
  entry('guide.section.tools.eyebrow', 'page', '/przewodnik-flex', 'Narzędzia'),
  entry('guide.cta.eyebrow', 'page', '/przewodnik-flex', 'CTA'),
  entry('guide.cta.title', 'page', '/przewodnik-flex', 'Porozmawiaj z doradcą'),
  entry('guide.next_step.eyebrow', 'page', '/przewodnik-flex', 'Kolejny krok'),
  entry('guide.next_step.primary', 'page', '/przewodnik-flex', 'Porozmawiaj z doradcą'),
]

const BASICS_HUB_CONTENT: StaticContentEntry[] = [
  entry('meta.basics.title', 'metadata', '/podstawy-flex', 'Podstawy flex'),
  entry('meta.basics.description', 'metadata', '/podstawy-flex', 'Zrozum biura elastyczne od podstaw: definicje, modele, scenariusze użycia i praktyczne kryteria wyboru.'),
  entry('meta.basics.og_title', 'metadata', '/podstawy-flex', 'Podstawy flex — Colliers'),
  entry('meta.basics.og_description', 'metadata', '/podstawy-flex', 'Jedna sekcja wiedzy, która porządkuje temat biur elastycznych i prowadzi do narzędzi oraz raportów miejskich.'),
  entry('basics_hub.hero.eyebrow', 'page', '/podstawy-flex', 'Podstawy flex'),
  entry('basics_hub.hero.title', 'page', '/podstawy-flex', 'Zrozum biura elastyczne od podstaw'),
  entry('basics_hub.hero.lead', 'page', '/podstawy-flex', 'Poznaj najważniejsze pojęcia, modele najmu i scenariusze, w których biuro flex może być lepszym rozwiązaniem niż najem tradycyjny.'),
  entry('basics_hub.hero.primary_cta', 'page', '/podstawy-flex', 'Zacznij od definicji'),
  entry('basics_hub.hero.secondary_cta', 'page', '/podstawy-flex', 'Porównaj modele'),
  entry('basics_hub.context.eyebrow', 'page', '/podstawy-flex', 'Kontekst'),
  entry('basics_hub.context.title', 'page', '/podstawy-flex', 'Flex to nie tylko coworking'),
  entry('basics_hub.context.body', 'page', '/podstawy-flex', 'Rynek biur elastycznych przestał być niszową alternatywą dla małych firm. Dziś to dojrzały segment rynku biurowego, odpowiadający zarówno na potrzeby start-upów, jak i większych organizacji oczekujących szybkości wdrożenia, przewidywalności kosztów i gotowego środowiska pracy. Raport pokazuje też, że podaż flex w siedmiu największych miastach Polski przekracza 430 tys. m², a cały segment rośnie wraz z potrzebą elastyczności i redukcji ryzyka.'),
  entry('basics_hub.context.kpi_supply_label', 'page', '/podstawy-flex', 'elastycznej powierzchni w 7 największych miastach'),
  entry('basics_hub.context.kpi_share_label', 'page', '/podstawy-flex', 'udziału w całkowitej podaży biur'),
  entry('basics_hub.context.kpi_models_label', 'page', '/podstawy-flex', 'główne modele opisane w przewodniku'),
  entry('basics_hub.evergreens.eyebrow', 'page', '/podstawy-flex', 'Evergreeny'),
  entry('basics_hub.evergreens.title', 'page', '/podstawy-flex', 'Pięć tematów, od których warto zacząć'),
  entry('basics_hub.tools.eyebrow', 'page', '/podstawy-flex', 'Narzędzia'),
  entry('basics_hub.next.eyebrow', 'page', '/podstawy-flex', 'Dalej'),
  entry('basics_hub.next.title', 'page', '/podstawy-flex', 'Nie musisz zaczynać od pełnego briefu'),
  entry('basics_hub.next.body', 'page', '/podstawy-flex', 'Możesz zacząć od definicji, porównać modele albo od razu przejść do narzędzi. Gdy będziesz gotowy, pomożemy przełożyć to na realne opcje rynkowe.'),
  entry('basics_hub.next.primary_cta', 'page', '/podstawy-flex', 'Uruchom kalkulator'),
  entry('basics_hub.next.secondary_cta', 'page', '/podstawy-flex', 'Porozmawiaj z doradcą'),
]

const REPORTS_HUB_CONTENT: StaticContentEntry[] = [
  entry('meta.reports.title', 'metadata', '/raporty-miejskie', 'Raporty miejskie'),
  entry('meta.reports.description', 'metadata', '/raporty-miejskie', 'Porównaj rynki biur elastycznych w największych miastach Polski: podaż, zajętość, ceny i strukturę operatorów.'),
  entry('meta.reports.og_title', 'metadata', '/raporty-miejskie', 'Raporty miejskie — Colliers Flex'),
  entry('meta.reports.og_description', 'metadata', '/raporty-miejskie', 'Przekrojowe raporty rynków flex: Warszawa, Kraków, Wrocław, Trójmiasto, Poznań, Łódź i Katowice.'),
  entry('reports_hub.hero.eyebrow', 'page', '/raporty-miejskie', 'Raporty miejskie'),
  entry('reports_hub.hero.title', 'page', '/raporty-miejskie', 'Raporty miejskie: biura elastyczne w największych miastach Polski'),
  entry('reports_hub.hero.lead', 'page', '/raporty-miejskie', 'Porównaj skalę rynku, strukturę operatorów, poziom cen i dostępność powierzchni flex w kluczowych ośrodkach biurowych.'),
  entry('reports_hub.hero.open_report_prefix', 'page', '/raporty-miejskie', 'Otwórz raport:'),
  entry('reports_hub.hero.back_to_guide', 'page', '/raporty-miejskie', 'Wróć do Przewodnika Flex'),
  entry('reports_hub.map.placeholder_label', 'page', '/raporty-miejskie', 'Mapa Polski · rynki raportowe'),
  entry('reports_hub.cities.eyebrow', 'page', '/raporty-miejskie', 'Miasta'),
  entry('reports_hub.compare.eyebrow', 'page', '/raporty-miejskie', 'Porównanie rynków'),
  entry('reports_hub.compare.col_city', 'page', '/raporty-miejskie', 'Miasto'),
  entry('reports_hub.compare.col_supply', 'page', '/raporty-miejskie', 'Powierzchnia'),
  entry('reports_hub.compare.col_occupancy', 'page', '/raporty-miejskie', 'Zajętość'),
  entry('reports_hub.compare.col_offices', 'page', '/raporty-miejskie', 'Liczba biur'),
  entry('reports_hub.compare.col_market', 'page', '/raporty-miejskie', 'Charakter rynku'),
  entry('reports_hub.next.eyebrow', 'page', '/raporty-miejskie', 'Kolejny krok'),
  entry('reports_hub.next.title', 'page', '/raporty-miejskie', 'Przejdź od danych do decyzji'),
  entry('reports_hub.next.body', 'page', '/raporty-miejskie', 'Sprawdź porównanie modeli biura i koszty, a jeśli potrzebujesz, przejdź przez analizę rynku z doradcą Colliers.'),
  entry('reports_hub.next.primary_cta', 'page', '/raporty-miejskie', 'Przejdź do porównywarki'),
  entry('reports_hub.next.secondary_cta', 'page', '/raporty-miejskie', 'Porozmawiaj z doradcą'),
]

const COMPARATOR_CONTENT: StaticContentEntry[] = [
  entry('meta.compare.title', 'metadata', '/porownaj', 'Porównaj biura serwisowane'),
  entry('meta.compare.description', 'metadata', '/porownaj', 'Porównaj wybrane biura serwisowane obok siebie i uzyskaj zbiorczą ofertę Colliers.'),
  entry('compare.header.eyebrow', 'page', '/porownaj', 'Twoje zestawienie'),
  entry('compare.header.title', 'page', '/porownaj', 'Porównaj i uzyskaj ofertę na wybrane biura'),
  entry('compare.empty', 'page', '/porownaj', 'Nie dodałeś jeszcze żadnych biur do porównywarki.'),
  entry('compare.empty_cta', 'page', '/porownaj', 'Przeglądaj biura'),
  entry('compare.loading', 'page', '/porownaj', 'Ładowanie…'),
  entry('compare.advisor.eyebrow', 'page', '/porownaj', 'Twój doradca Colliers'),
  entry('compare.advisor.body', 'page', '/porownaj', 'Masz pytania? Wyślij zapytanie o wybrane biura — doradca Colliers przygotuje dla Ciebie indywidualną ofertę.'),
  entry('compare.advisor.cta', 'page', '/porownaj', 'Wyślij zapytanie ofertowe'),
  entry('compare.table.col_name', 'page', '/porownaj', 'Nazwa biura'),
  entry('compare.table.col_address', 'page', '/porownaj', 'Adres'),
  entry('compare.table.col_operator', 'page', '/porownaj', 'Operator'),
  entry('compare.table.col_workstations', 'page', '/porownaj', 'Stanowiska'),
  entry('compare.table.col_price', 'page', '/porownaj', 'Cena (biurko)'),
  entry('compare.table.col_year', 'page', '/porownaj', 'Rok'),
  entry('compare.table.featured', 'page', '/porownaj', 'Polecane'),
  entry('compare.remove_title', 'page', '/porownaj', 'Usuń z porównywarki'),
]

const CONTACT_FORM_CONTENT: StaticContentEntry[] = [
  entry('contact_form.success.title', 'component', 'modal:contact', 'Zapytanie zostało wysłane'),
  entry('contact_form.success.body', 'component', 'modal:contact', 'Dziękujemy. Nasz doradca skontaktuje się z Tobą w ciągu jednego dnia roboczego.'),
  entry('contact_form.success.cta', 'component', 'modal:contact', 'Wróć do wyszukiwarki'),
  entry('contact_form.header.eyebrow', 'component', 'modal:contact', 'Zapytanie ofertowe'),
  entry('contact_form.header.title', 'component', 'modal:contact', 'Zapytaj o ofertę'),
  entry('contact_form.header.body', 'component', 'modal:contact', 'Nasz doradca skontaktuje się z Tobą w ciągu jednego dnia roboczego.'),
  entry('contact_form.email_label', 'component', 'modal:contact', 'Email (wymagane)'),
  entry('contact_form.email_placeholder', 'component', 'modal:contact', 'twoj@email.pl'),
  entry('contact_form.phone_label', 'component', 'modal:contact', 'Telefon (opcjonalnie)'),
  entry('contact_form.phone_placeholder', 'component', 'modal:contact', '+48 ___ ___ ___'),
  entry('contact_form.extra_toggle', 'component', 'modal:contact', 'Dodatkowe informacje (opcjonalnie)'),
  entry('contact_form.workstations_from', 'component', 'modal:contact', 'Stanowisk (od)'),
  entry('contact_form.workstations_to', 'component', 'modal:contact', 'Stanowisk (do)'),
  entry('contact_form.notes_label', 'component', 'modal:contact', 'Dodatkowe uwagi'),
  entry('contact_form.notes_placeholder', 'component', 'modal:contact', 'Inne wymagania...'),
  entry('contact_form.consent', 'component', 'modal:contact', 'Wyrażam zgodę na przetwarzanie moich danych osobowych przez Colliers International Poland sp. z o.o. w celu obsługi zapytania oraz przesyłania informacji handlowych.'),
  entry('contact_form.privacy_link', 'component', 'modal:contact', 'Polityka prywatności'),
  entry('contact_form.submit', 'component', 'modal:contact', 'Wyślij zapytanie'),
  entry('contact_form.selection.eyebrow', 'component', 'modal:contact', 'Twój wybór'),
  entry('contact_form.selection.title', 'component', 'modal:contact', 'Wybrane biura'),
  entry('contact_form.selection.empty', 'component', 'modal:contact', 'Brak wybranych biur.'),
  entry('contact_form.guarantee_1_title', 'component', 'modal:contact', 'Gwarancja jakości Colliers'),
  entry('contact_form.guarantee_1_text', 'component', 'modal:contact', 'Wszystkie przestrzenie są weryfikowane przez naszych ekspertów.'),
  entry('contact_form.guarantee_2_title', 'component', 'modal:contact', 'Szybka odpowiedź'),
  entry('contact_form.guarantee_2_text', 'component', 'modal:contact', 'Otrzymasz propozycje w ciągu jednego dnia roboczego.'),
  entry('contact_form.error.invalid_email', 'component', 'modal:contact', 'Podaj poprawny adres email'),
  entry('contact_form.error.consent', 'component', 'modal:contact', 'Zgoda jest wymagana'),
  entry('contact_form.error.generic', 'component', 'modal:contact', 'Nie udało się wysłać zapytania.'),
]

const LEGAL_CONTENT: StaticContentEntry[] = [
  entry('meta.privacy.title', 'metadata', '/polityka-prywatnosci', 'Polityka prywatności'),
  entry('privacy.hero.eyebrow', 'page', '/polityka-prywatnosci', 'Polityka prywatności'),
  entry('privacy.hero.title', 'page', '/polityka-prywatnosci', 'Polityka prywatności i plików cookies Colliers Flex'),
  entry('privacy.hero.lead', 'page', '/polityka-prywatnosci', 'Serwis Colliers Flex służy do wyszukiwania i prezentacji ofert biur serwisowanych oraz elastycznych przestrzeni biurowych w Polsce. Poniżej opisujemy zasady przetwarzania danych osobowych, okresy przechowywania danych oraz sposób korzystania z plików cookies.'),
  entry('privacy.hero.effective_date', 'page', '/polityka-prywatnosci', 'Data wejścia w życie: do uzupełnienia'),
  entry('privacy.hero.updated_at', 'page', '/polityka-prywatnosci', 'Ostatnia aktualizacja: do uzupełnienia'),
  entry('privacy.admin.eyebrow', 'page', '/polityka-prywatnosci', 'Administrator'),
  entry('privacy.processing.eyebrow', 'page', '/polityka-prywatnosci', 'Cele przetwarzania'),
  entry('privacy.transfers.eyebrow', 'page', '/polityka-prywatnosci', 'Odbiorcy i transfer danych'),
  entry('privacy.rights.eyebrow', 'page', '/polityka-prywatnosci', 'Prawa użytkowników'),
  entry('privacy.cookies.eyebrow', 'page', '/polityka-prywatnosci', 'Polityka cookies'),
  entry('privacy.retention.eyebrow', 'page', '/polityka-prywatnosci', 'Retencja danych'),
  entry('privacy.cookie_management.eyebrow', 'page', '/polityka-prywatnosci', 'Zarządzanie cookies'),
  entry('privacy.contact.eyebrow', 'page', '/polityka-prywatnosci', 'Kontakt'),
  entry('meta.cookies.title', 'metadata', '/polityka-cookies', 'Polityka cookies'),
  entry('cookies_page.title', 'page', '/polityka-cookies', 'Polityka cookies'),
  entry('cookies_page.body_1', 'page', '/polityka-cookies', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Strona korzysta z plików cookies w celu zapewnienia prawidłowego działania oraz analityki.'),
  entry('cookies_page.body_2', 'page', '/polityka-cookies', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Pliki cookies niezbędne są wymagane do działania serwisu.'),
  entry('cookies_page.body_3', 'page', '/polityka-cookies', 'Pliki cookies analityczne (Google Analytics) są używane wyłącznie za Twoją zgodą.'),
  entry('cookies_page.note', 'page', '/polityka-cookies', 'Treść polityki cookies zostanie dostarczona przez Colliers International Poland sp. z o.o.'),
]

const ERROR_CONTENT: StaticContentEntry[] = [
  entry('error_404.eyebrow', 'page', '/404', 'Błąd 404'),
  entry('error_404.title', 'page', '/404', 'Strona nie istnieje'),
  entry('error_404.body', 'page', '/404', 'Nie znaleźliśmy szukanej strony. Sprawdź adres URL lub wróć do wyszukiwarki biur.'),
  entry('error_404.cta', 'page', '/404', 'Wróć do wyszukiwarki'),
  entry('error_500.eyebrow', 'page', '/500', 'Błąd 500'),
  entry('error_500.title', 'page', '/500', 'Wystąpił błąd'),
  entry('error_500.body', 'page', '/500', 'Przepraszamy, coś poszło nie tak. Spróbuj odświeżyć stronę lub wróć do wyszukiwarki.'),
  entry('error_500.retry', 'page', '/500', 'Odśwież stronę'),
  entry('error_500.cta', 'page', '/500', 'Wróć do wyszukiwarki'),
]

function getBasicsContentEntries() {
  const entries: StaticContentEntry[] = []

  for (const slug of BASICS_ORDER) {
    const topic = BASICS_TOPICS[slug]
    const route = `/podstawy-flex/${slug}`

    entries.push(
      entry(`meta.basics.${slug}.title`, 'metadata', route, topic.h1),
      entry(`meta.basics.${slug}.description`, 'metadata', route, topic.lead),
      entry(`meta.basics.${slug}.og_title`, 'metadata', route, `${topic.h1} — Podstawy flex`),
      entry(`meta.basics.${slug}.og_description`, 'metadata', route, topic.lead),
      entry(`basics.${slug}.hero.breadcrumb`, 'page', route, 'Przewodnik Flex / Podstawy flex'),
      entry(`basics.${slug}.hero.eyebrow`, 'page', route, topic.eyebrow),
      entry(`basics.${slug}.hero.title`, 'page', route, topic.h1),
      entry(`basics.${slug}.hero.lead`, 'page', route, topic.lead),
      entry(`basics.${slug}.hero.visual_placeholder`, 'page', route, topic.heroVisualPlaceholder),
      entry(`basics.${slug}.hero.key_takeaway_label`, 'page', route, 'Kluczowa teza'),
      entry(`basics.${slug}.hero.key_takeaway`, 'page', route, topic.keyTakeaway),
      entry(`basics.${slug}.why.eyebrow`, 'page', route, topic.whyItMattersH2),
      entry(`basics.${slug}.why.body`, 'page', route, topic.whyItMattersText),
      entry(`basics.${slug}.next.eyebrow`, 'page', route, 'Co warto sprawdzić dalej'),
      entry(`basics.${slug}.tools.eyebrow`, 'page', route, BASICS_TOOLS_SECTION.h2),
      entry(`basics.${slug}.tools.intro`, 'page', route, BASICS_TOOLS_SECTION.intro),
      entry(`basics.${slug}.final.eyebrow`, 'page', route, 'Dalej'),
      entry(`basics.${slug}.final.title`, 'page', route, 'Nie musisz zaczynać od pełnego briefu'),
      entry(`basics.${slug}.final.body`, 'page', route, 'Możesz zacząć od podstaw, porównać modele albo od razu przejść do narzędzi. Gdy będziesz gotowy, pomożemy przełożyć to na realne opcje rynkowe.'),
      entry(`basics.${slug}.final.primary_cta`, 'page', route, 'Porozmawiaj z doradcą'),
      entry(`basics.${slug}.final.secondary_cta`, 'page', route, 'Zobacz oferty')
    )

    topic.sections.forEach((section, sectionIndex) => {
      entries.push(
        entry(`basics.${slug}.section.${sectionIndex + 1}.title`, 'page', route, section.title),
        entry(`basics.${slug}.section.${sectionIndex + 1}.format`, 'page', route, section.format)
      )
      section.items.forEach((item, itemIndex) => {
        entries.push(
          entry(`basics.${slug}.section.${sectionIndex + 1}.item.${itemIndex + 1}.title`, 'page', route, item.title),
          entry(`basics.${slug}.section.${sectionIndex + 1}.item.${itemIndex + 1}.description`, 'page', route, item.description)
        )
      })
    })

    topic.detailBlocks.forEach((block, index) => {
      entries.push(entry(`basics.${slug}.detail_block.${index + 1}`, 'page', route, block))
    })

    getBasicsNextLinks(slug).forEach((item, index) => {
      entries.push(
        entry(`basics.${slug}.next_link.${index + 1}.title`, 'page', route, item.title),
        entry(`basics.${slug}.next_link.${index + 1}.description`, 'page', route, item.description)
      )
    })
  }

  getBasicsCards().forEach((card, index) => {
    entries.push(
      entry(`basics_hub.card.${index + 1}.number`, 'page', '/podstawy-flex', card.number),
      entry(`basics_hub.card.${index + 1}.title`, 'page', '/podstawy-flex', card.title),
      entry(`basics_hub.card.${index + 1}.description`, 'page', '/podstawy-flex', card.description)
    )
  })

  BASICS_TOOLS_SECTION.cards.forEach((tool, index) => {
    entries.push(
      entry(`basics_tools.card.${index + 1}.title`, 'page', '/podstawy-flex', tool.title),
      entry(`basics_tools.card.${index + 1}.text`, 'page', '/podstawy-flex', tool.text),
      entry(`basics_tools.card.${index + 1}.cta`, 'page', '/podstawy-flex', tool.cta)
    )
  })

  return entries
}

function getReportsContentEntries() {
  const entries: StaticContentEntry[] = []

  CITY_REPORT_ORDER.forEach((slug) => {
    const report = CITY_REPORTS[slug]
    const route = `/raporty-miejskie/${slug}`
    entries.push(
      entry(`meta.report.${slug}.title`, 'metadata', route, `Raport miejski: ${report.cityName}`),
      entry(`meta.report.${slug}.description`, 'metadata', route, `${report.heroLead} Sprawdź oferty, poziom cen i strukturę operatorów.`),
      entry(`meta.report.${slug}.og_title`, 'metadata', route, `Raport miejski: ${report.cityName}`),
      entry(`meta.report.${slug}.og_description`, 'metadata', route, report.heroLead),
      entry(`report.${slug}.hero.eyebrow`, 'page', route, report.heroEyebrow),
      entry(`report.${slug}.hero.title`, 'page', route, report.heroH1),
      entry(`report.${slug}.hero.lead`, 'page', route, report.heroLead),
      entry(`report.${slug}.hero.placeholder`, 'page', route, report.heroImagePlaceholder),
      entry(`report.${slug}.hero.positioning_headline`, 'page', route, report.positioningHeadline),
      entry(`report.${slug}.hero.positioning_text`, 'page', route, report.positioningText),
      entry(`report.${slug}.snapshot.eyebrow`, 'page', route, 'Snapshot rynku'),
      entry(`report.${slug}.snapshot.offices_label`, 'page', route, 'Liczba biur'),
      entry(`report.${slug}.snapshot.supply_label`, 'page', route, 'Powierzchnia flex'),
      entry(`report.${slug}.snapshot.occupancy_label`, 'page', route, 'Szacowana zajętość'),
      entry(`report.${slug}.snapshot.prices_label`, 'page', route, 'Ceny orientacyjne'),
      entry(`report.${slug}.scores.growth_label`, 'page', route, 'Dynamika rozwoju'),
      entry(`report.${slug}.scores.pricing_label`, 'page', route, 'Wzrost stawek'),
      entry(`report.${slug}.scores.availability_label`, 'page', route, 'Dostępność powierzchni'),
      entry(`report.${slug}.market.eyebrow`, 'page', route, 'O rynku'),
      entry(`report.${slug}.market.title`, 'page', route, `Charakterystyka rynku ${report.cityName}`),
      entry(`report.${slug}.key_facts.eyebrow`, 'page', route, 'Kluczowe fakty'),
      entry(`report.${slug}.map.eyebrow`, 'page', route, 'Mapa ofert'),
      entry(`report.${slug}.map.title`, 'page', route, `Oferty biur elastycznych w ${report.cityName}`),
      entry(`report.${slug}.map.cta`, 'page', route, 'Przejdź do wyszukiwarki →'),
      entry(`report.${slug}.map.empty`, 'page', route, 'Brak aktywnych ofert z geolokalizacją dla tego rynku.'),
      entry(`report.${slug}.prices.eyebrow`, 'page', route, 'Ceny orientacyjne'),
      entry(`report.${slug}.prices.title`, 'page', route, 'Ceny i interpretacja'),
      entry(`report.${slug}.prices.hotdesk_center`, 'page', route, 'Hot desk · centrum'),
      entry(`report.${slug}.prices.hotdesk_non_center`, 'page', route, 'Hot desk · poza centrum'),
      entry(`report.${slug}.prices.private_center`, 'page', route, 'Prywatne biuro · centrum'),
      entry(`report.${slug}.prices.private_non_center`, 'page', route, 'Prywatne biuro · poza centrum'),
      entry(`report.${slug}.prices.note`, 'page', route, report.prices.note),
      entry(`report.${slug}.prices.market_commentary_title`, 'page', route, 'Komentarz rynkowy'),
      entry(`report.${slug}.prices.market_commentary`, 'page', route, report.prices.commentary),
      entry(`report.${slug}.expert.eyebrow`, 'page', route, 'Komentarz ekspercki'),
      entry(`report.${slug}.expert.quote`, 'page', route, report.expertQuoteWeb),
      entry(`report.${slug}.expert.name`, 'page', route, report.expertName),
      entry(`report.${slug}.expert.role`, 'page', route, report.expertRole),
      entry(`report.${slug}.next.eyebrow`, 'page', route, 'Działaj dalej'),
      entry(`report.${slug}.next.title`, 'page', route, `Wybierz kolejny krok dla rynku ${report.cityName}`),
      entry(`report.${slug}.next.card_1_title`, 'page', route, `Zobacz oferty w ${report.cityName}`),
      entry(`report.${slug}.next.card_1_cta`, 'page', route, 'Przejdź do listy →'),
      entry(`report.${slug}.next.card_2_title`, 'page', route, 'Dodaj lokalizacje do porównania'),
      entry(`report.${slug}.next.card_2_cta`, 'page', route, 'Otwórz porównywarkę →'),
      entry(`report.${slug}.next.card_3_title`, 'page', route, 'Porozmawiaj z doradcą'),
      entry(`report.${slug}.next.card_3_cta`, 'page', route, 'Skontaktuj się →'),
      entry(`report.${slug}.next.other_reports_label`, 'page', route, 'Pozostałe raporty:')
    )

    report.keyFacts.forEach((fact, index) => {
      entries.push(entry(`report.${slug}.key_fact.${index + 1}`, 'page', route, fact))
    })
  })

  return entries
}

function getCalculatorContentEntries() {
  const route = '/kalkulator-flex'

  return [
    entry('calculator.hero.eyebrow', 'page', route, 'Kalkulator flex'),
    entry('calculator.hero.title', 'page', route, 'Porównaj flex z najmem konwencjonalnym na porównywalnych założeniach'),
    entry('calculator.hero.body', 'page', route, 'To narzędzie pomaga szybko oszacować różnice kosztowe między biurem serwisowanym a najmem konwencjonalnym dla Twojego zespołu. Największą wagę mają tu dwa wskaźniki: łączne zobowiązanie oraz koszt konwencji liczony za identyczny okres jak planowana umowa flex.'),
    entry('calculator.hero.disclaimer_approx', 'page', route, 'Wartości w kalkulatorze mają charakter orientacyjny i służą do wstępnego oszacowania scenariuszy.'),
    entry('calculator.hero.disclaimer_market', 'page', route, 'Założenia opierają się na aktualnych danych rynkowych opracowywanych przez zespół Colliers, ale z natury rzeczy pozostają uśrednione.'),
    entry('calculator.hero.disclaimer_support', 'page', route, 'Jeśli będziesz szukać biura z udziałem Colliers, pomożemy przełożyć te estymacje na realne oferty, negocjacje i rekomendację najlepszego modelu.'),
    entry('calculator.intro.important', 'page', route, 'Ważne przed użyciem'),
    entry('calculator.inputs.title', 'page', route, 'Założenia klienta'),
    entry('calculator.inputs.lead', 'page', route, 'Uzupełnij podstawowe parametry, a narzędzie przeliczy porównywalny scenariusz dla konwencji i flexu.'),
    entry('calculator.inputs.headcount', 'page', route, 'Liczba stanowisk pracy'),
    entry('calculator.inputs.headcount_hint', 'page', route, 'Zakres orientacyjny: 25–1000.'),
    entry('calculator.inputs.city', 'page', route, 'Rynek (miasto)'),
    entry('calculator.inputs.location', 'page', route, 'Lokalizacja'),
    entry('calculator.inputs.fitout', 'page', route, 'Standard wykończenia'),
    entry('calculator.inputs.density', 'page', route, 'Standard zagęszczenia'),
    entry('calculator.inputs.conventional_term', 'page', route, 'Okres najmu konwencjonalnego'),
    entry('calculator.inputs.flex_term', 'page', route, 'Okres flex'),
    entry('calculator.cta.title', 'page', route, 'Co dalej?'),
    entry('calculator.cta.body', 'page', route, 'Ten kalkulator pokazuje scenariusz referencyjny. Jeśli chcesz porównać go z realnymi ofertami i negocjacjami operatorów lub landlordów, zespół Colliers przygotuje doprecyzowany benchmark dla Twojego briefu.'),
    entry('calculator.cta.primary', 'page', route, 'Porozmawiaj z doradcą'),
    entry('calculator.cta.secondary', 'page', route, 'Zobacz oferty'),
    entry('calculator.summary.eyebrow', 'page', route, 'Porównanie kosztów'),
    entry('calculator.summary.title', 'page', route, 'Najważniejsze wskaźniki'),
    entry('calculator.summary.rate_prefix', 'page', route, 'Kurs NBP: 1 EUR = {rate} PLN, tabela z dnia {date}'),
    entry('calculator.loading', 'page', route, 'Liczymy scenariusz…'),
    entry('calculator.error.title', 'page', route, 'Nie udało się wyliczyć kalkulatora.'),
    entry('calculator.card.conventional_liability', 'page', route, 'Łączne zobowiązanie — konwencja'),
    entry('calculator.card.flex_liability', 'page', route, 'Łączne zobowiązanie — flex'),
    entry('calculator.card.conventional_for_flex_period', 'page', route, 'Koszt konwencji za okres flex'),
    entry('calculator.card.flex_for_flex_period', 'page', route, 'Koszt flex za ten sam okres'),
    entry('calculator.card.conventional_liability_detail', 'page', route, 'Pełne {months} miesięcy najmu konwencjonalnego.'),
    entry('calculator.card.flex_liability_detail', 'page', route, 'Pełne {months} miesięcy umowy flex.'),
    entry('calculator.card.conventional_for_flex_period_detail', 'page', route, '{flexMonths} mies. z {conventionalMonths} mies. konwencji.'),
    entry('calculator.card.flex_for_flex_period_detail', 'page', route, 'Pełny koszt flex dla {months} miesięcy.'),
    entry('calculator.comparable_period.title', 'page', route, 'Analogiczny okres porównania'),
    entry('calculator.comparable_period.body', 'page', route, 'Koszt konwencji liczony jest tylko za okres równy wybranej umowie flex, żeby porównanie dotyczyło tego samego horyzontu czasowego zamiast całego kontraktu konwencjonalnego.'),
    entry('calculator.comparable_period.conventional', 'page', route, 'Konwencja'),
    entry('calculator.comparable_period.flex', 'page', route, 'Flex'),
    entry('calculator.comparable_period.flex_full', 'page', route, 'pełne {months} mies.'),
    entry('calculator.card.liability_reduction', 'page', route, 'Redukcja zobowiązania'),
    entry('calculator.card.savings', 'page', route, 'Oszczędność w okresie flex'),
    entry('calculator.card.premium', 'page', route, 'Premia za elastyczność'),
    entry('calculator.card.premium_detail', 'page', route, '{pct}% per capita / mies.'),
    entry('calculator.areas.title', 'page', route, 'Powierzchnia'),
    entry('calculator.areas.conventional_net', 'page', route, 'Konwencja netto'),
    entry('calculator.areas.conventional_gross', 'page', route, 'Konwencja brutto'),
    entry('calculator.areas.flex_private', 'page', route, 'Flex — moduły prywatne'),
    entry('calculator.areas.flex_shared', 'page', route, 'Flex — moduły z udziałem wspólnym'),
    entry('calculator.areas.conventional_per_person', 'page', route, 'Konwencja mkw. / osoba'),
    entry('calculator.areas.flex_per_desk', 'page', route, 'Flex mkw. / stanowisko'),
    entry('calculator.areas.conventional_net_note', 'page', route, 'Podstawowa powierzchnia użytkowa zajmowana wyłącznie przez najemcę.'),
    entry('calculator.areas.conventional_gross_note', 'page', route, 'Powierzchnia netto powiększona o udział najemcy w korytarzach, lobby i innych częściach wspólnych budynku.'),
    entry('calculator.areas.flex_private_note', 'page', route, 'Powierzchnia wewnątrz prywatnych modułów w biurach serwisowanych.'),
    entry('calculator.areas.flex_shared_note', 'page', route, 'Powierzchnia modułów prywatnych razem z proporcjonalnym udziałem w strefach wspólnych operatora, choć nie są one na wyłączność klienta.'),
    entry('calculator.areas.conventional_per_person_note', 'page', route, 'Wartość brutto na osobę, czyli z udziałem w częściach wspólnych budynku.'),
    entry('calculator.areas.flex_per_desk_note', 'page', route, 'Łączna metryka przypisana na stanowisko w modelu flex, razem z udziałem w częściach wspólnych operatora.'),
    entry('calculator.monthly_costs.title', 'page', route, 'Koszty miesięczne'),
    entry('calculator.monthly_costs.lead', 'page', route, 'Źródłowe dane rynkowe pozostają po stronie Colliers, a klient widzi już gotowe wyniki porównawcze.'),
    entry('calculator.monthly_costs.col_item', 'page', route, 'Pozycja'),
    entry('calculator.monthly_costs.col_model', 'page', route, 'Model'),
    entry('calculator.monthly_costs.col_pln', 'page', route, 'PLN / mies.'),
    entry('calculator.monthly_costs.col_eur', 'page', route, 'EUR / mies.'),
    entry('calculator.monthly_costs.model_conventional', 'page', route, 'Konwencja'),
    entry('calculator.monthly_costs.model_flex', 'page', route, 'Flex'),
    entry('calculator.monthly_costs.total_conventional', 'page', route, 'Total konwencja / miesiąc'),
    entry('calculator.monthly_costs.total_flex', 'page', route, 'Total flex / miesiąc'),
    entry('calculator.line.effective_rent', 'page', route, 'Efektywny czynsz bazowy'),
    entry('calculator.line.service_charge', 'page', route, 'Opłata eksploatacyjna'),
    entry('calculator.line.utilities', 'page', route, 'Media i utrzymanie'),
    entry('calculator.line.fitout_gap', 'page', route, 'Amortyzacja luki fit-out'),
    entry('calculator.line.flex_all_in', 'page', route, 'Cena za stanowisko (all-inclusive)'),
    entry('calculator.line.effective_rent_note', 'page', route, 'Uwzględnia zachętę rent-free zgodnie z założeniami rynkowymi.'),
    entry('calculator.line.service_charge_note', 'page', route, 'Rynkowo rozliczany w PLN, tutaj przeliczony także do EUR po kursie NBP.'),
    entry('calculator.line.utilities_note', 'page', route, 'Założenie operacyjne utrzymywane po stronie Colliers.'),
    entry('calculator.line.fitout_gap_note', 'page', route, 'Luka między kosztem fit-out a wkładem właściciela rozłożona na okres najmu.'),
    entry('calculator.line.flex_all_in_note', 'page', route, 'Obejmuje czynsz, service charge, utilities i standardowe przygotowanie powierzchni.'),
  ]
}

function getOfficeModelWizardContentEntries() {
  const route = 'modal:office-model'

  return [
    entry('wizard.title', 'component', route, 'Dobierz model biura'),
    entry('wizard.result_label', 'component', route, 'Wynik rekomendacji'),
    entry('wizard.step_label', 'component', route, 'Krok {step} z {total}'),
    entry('wizard.back', 'component', route, 'Wstecz'),
    entry('wizard.next', 'component', route, 'Dalej'),
    entry('wizard.result', 'component', route, 'Wynik'),
    entry('wizard.reset', 'component', route, 'Zacznij od nowa'),
    entry('wizard.close_aria', 'component', route, 'Zamknij narzędzie'),
    entry('wizard.current_recommendation', 'component', route, 'Aktualna rekomendacja'),
    entry('wizard.progress', 'component', route, 'Postęp'),
    entry('wizard.empty_recommendation', 'component', route, 'Wybierz pierwszą odpowiedź'),
    entry('wizard.mobile_empty_recommendation', 'component', route, 'Uzupełnij odpowiedzi'),
    entry('wizard.advisor.title', 'component', route, 'Wsparcie doradcy'),
    entry('wizard.advisor.team', 'component', route, 'Zespół Colliers Flex'),
    entry('wizard.advisor.role', 'component', route, 'Doradztwo w zakresie biur serwisowanych'),
    entry('wizard.step.1.title', 'component', route, 'Ile osób ma mieć dostęp do biura?'),
    entry('wizard.step.1.helper', 'component', route, 'Chodzi o cały zespół, który będzie z niego korzystać — także rotacyjnie.'),
    entry('wizard.step.2.title', 'component', route, 'Ile stałych stanowisk pracy realnie potrzebujesz?'),
    entry('wizard.step.2.helper', 'component', route, 'Chodzi o faktyczną liczbę biurek dostępnych na co dzień, a nie liczbę wszystkich osób w zespole.'),
    entry('wizard.step.3.title', 'component', route, 'Jak ważna jest prywatność?'),
    entry('wizard.step.3.helper', 'component', route, 'Na przykład możliwość pracy bez ekspozycji na przestrzeń wspólną, rozmów poufnych i większej kontroli dostępu.'),
    entry('wizard.step.4.title', 'component', route, 'Jak ważne jest ograniczenie CAPEX?'),
    entry('wizard.step.4.helper', 'component', route, 'Czyli ograniczenie kosztów wejścia, takich jak fit-out, meble, infrastruktura czy wdrożenie biura.'),
    entry('wizard.step.5.title', 'component', route, 'Jaka jest maksymalna akceptowalna długość zobowiązania?'),
    entry('wizard.option.team.1', 'component', route, '1 osoba'),
    entry('wizard.option.team.2-10', 'component', route, '2-10 osób'),
    entry('wizard.option.team.11-50', 'component', route, '11-50 osób'),
    entry('wizard.option.team.51+', 'component', route, '51+ osób'),
    entry('wizard.option.desk.1', 'component', route, '1 stanowisko'),
    entry('wizard.option.desk.2-10', 'component', route, '2-10 stanowisk'),
    entry('wizard.option.desk.11-50', 'component', route, '11-50 stanowisk'),
    entry('wizard.option.desk.51+', 'component', route, '51+ stanowisk'),
    entry('wizard.scale.-2', 'component', route, 'Nieważne'),
    entry('wizard.scale.-1', 'component', route, 'Raczej nieważne'),
    entry('wizard.scale.0', 'component', route, 'Neutralnie'),
    entry('wizard.scale.1', 'component', route, 'Raczej ważne'),
    entry('wizard.scale.2', 'component', route, 'Bardzo ważne'),
    entry('wizard.term.indefinite', 'component', route, 'Jak najkrótsza / maksymalna elastyczność'),
    entry('wizard.term.12m', 'component', route, 'Do 12 miesięcy'),
    entry('wizard.term.1to5y', 'component', route, '1-5 lat'),
    entry('wizard.term.5yplus', 'component', route, 'Powyżej 5 lat'),
    entry('wizard.model.hotdesk', 'component', route, 'Hot-desk w coworkingu'),
    entry('wizard.model.privateOffice', 'component', route, 'Prywatne biuro'),
    entry('wizard.model.dedicatedSector', 'component', route, 'Dedykowany sektor'),
    entry('wizard.model.traditionalOffice', 'component', route, 'Biuro tradycyjne'),
    entry('wizard.model.hotdesk.description', 'component', route, 'Hot-desk w coworkingu daje największą elastyczność i najniższy próg wejścia. Sprawdza się wtedy, gdy zespół korzysta z biura rotacyjnie i nie potrzebuje stałej, prywatnej przestrzeni.'),
    entry('wizard.model.hotdesk.for_whom', 'component', route, 'Dla małych zespołów, osób pracujących hybrydowo, projektów tymczasowych i organizacji z wysoką rotacyjnością korzystania z biura.'),
    entry('wizard.model.hotdesk.watch_out', 'component', route, 'Trzeba uwzględnić niższy poziom prywatności, mniejszą kontrolę nad otoczeniem pracy i ograniczone możliwości personalizacji przestrzeni.'),
    entry('wizard.model.privateOffice.description', 'component', route, 'Prywatne biuro łączy gotowe środowisko pracy z większą prywatnością i przewidywalnym kosztem wejścia. To najczęściej najbardziej zrównoważony model dla zespołów szukających elastyczności bez rezygnacji z własnej przestrzeni.'),
    entry('wizard.model.privateOffice.for_whom', 'component', route, 'Dla zespołów 2-50 osób, które potrzebują stałych stanowisk, poufnych rozmów i szybkiego startu bez inwestowania w pełny fit-out.'),
    entry('wizard.model.privateOffice.watch_out', 'component', route, 'Warto sprawdzić zakres usług w cenie, możliwość skalowania modułu i to, czy standard przestrzeni odpowiada oczekiwaniom zespołu.'),
    entry('wizard.model.dedicatedSector.description', 'component', route, 'Dedykowany sektor zapewnia większą kontrolę nad układem, prywatnością i identyfikacją przestrzeni, a jednocześnie zachowuje część elastyczności charakterystycznej dla modeli flex.'),
    entry('wizard.model.dedicatedSector.for_whom', 'component', route, 'Dla większych zespołów, firm rozwijających lokalny hub oraz organizacji, które chcą połączyć branding, prywatność i krótszy czas wejścia niż w najmie tradycyjnym.'),
    entry('wizard.model.dedicatedSector.watch_out', 'component', route, 'Przed wyborem dobrze porównać warunki komercyjne, indeksację, zakres personalizacji i realną możliwość dalszej ekspansji.'),
    entry('wizard.model.traditionalOffice.description', 'component', route, 'Biuro tradycyjne daje największą kontrolę nad aranżacją, polityką dostępu i długofalowym kosztem przy dużej skali. Najlepiej działa tam, gdzie zespół jest stabilny i potrzebuje długiego horyzontu planowania.'),
    entry('wizard.model.traditionalOffice.for_whom', 'component', route, 'Dla dużych organizacji, zespołów o niskiej rotacyjności i firm gotowych na dłuższe zobowiązanie oraz większy udział własnych nakładów inwestycyjnych.'),
    entry('wizard.model.traditionalOffice.watch_out', 'component', route, 'Największym ryzykiem są CAPEX, dłuższy czas uruchomienia i mniejsza elastyczność przy zmianach skali lub struktury zespołu.'),
    entry('wizard.result.description_label', 'component', route, 'Opis modelu'),
    entry('wizard.result.for_whom_label', 'component', route, 'Dla kogo'),
    entry('wizard.result.watch_out_label', 'component', route, 'Na co uważać'),
    entry('wizard.result.strongest_drivers', 'component', route, 'Najsilniejsze czynniki'),
    entry('wizard.result.search_cta', 'component', route, 'Zobacz oferty'),
    entry('wizard.result.contact_cta', 'component', route, 'Porozmawiaj z doradcą'),
    entry('wizard.note.header', 'component', route, 'Wynik narzędzia „Dobierz model biura”:'),
    entry('wizard.note.model', 'component', route, '- Rekomendowany model: {value}'),
    entry('wizard.note.team', 'component', route, '- Liczba osób z dostępem: {value}'),
    entry('wizard.note.desk', 'component', route, '- Liczba stałych stanowisk: {value}'),
    entry('wizard.note.privacy', 'component', route, '- Prywatność: {value}'),
    entry('wizard.note.capex', 'component', route, '- Ograniczenie CAPEX: {value}'),
    entry('wizard.note.term', 'component', route, '- Maksymalna długość zobowiązania: {value}'),
    entry('wizard.value.undefined', 'component', route, 'Nie określono'),
    entry('wizard.explanation.initial', 'component', route, 'Wybierz pierwszy wariant, aby zobaczyć wstępną rekomendację.'),
    entry('wizard.explanation.top_leads', 'component', route, 'Na ten moment prowadzi {model} głównie ze względu na: {drivers}.'),
    entry('wizard.explanation.top_simple', 'component', route, 'Na ten moment najwyżej wypada {model}. Kolejne odpowiedzi doprecyzują wynik.'),
    entry('wizard.explanation.tie', 'component', route, 'Najlepiej dopasowane są dwa modele: {first} i {second}. Ostateczny wybór zależy głównie od budżetu, oczekiwanego poziomu prywatności i preferowanej długości umowy.'),
    entry('wizard.hint.high_sharing', 'component', route, 'Twoje odpowiedzi sugerują wysoki poziom rotacyjności korzystania z biura.'),
    entry('wizard.driver.team.small', 'component', route, 'mała liczba osób z dostępem'),
    entry('wizard.driver.team.medium', 'component', route, 'średnia skala zespołu'),
    entry('wizard.driver.team.large', 'component', route, 'duża liczba osób z dostępem'),
    entry('wizard.driver.desk.small', 'component', route, 'mała liczba stałych stanowisk'),
    entry('wizard.driver.desk.large', 'component', route, 'duża liczba stanowisk'),
    entry('wizard.driver.desk.xlarge', 'component', route, 'bardzo duża liczba stanowisk'),
    entry('wizard.driver.privacy.low', 'component', route, 'niska potrzeba prywatności'),
    entry('wizard.driver.privacy.neutral', 'component', route, 'neutralne podejście do prywatności'),
    entry('wizard.driver.privacy.high', 'component', route, 'wysoka potrzeba prywatności'),
    entry('wizard.driver.capex.low', 'component', route, 'niska presja na ograniczenie CAPEX'),
    entry('wizard.driver.capex.neutral', 'component', route, 'neutralne podejście do CAPEX'),
    entry('wizard.driver.capex.high', 'component', route, 'ważne ograniczenie CAPEX'),
    entry('wizard.driver.term.short', 'component', route, 'wysoka elastyczność'),
    entry('wizard.driver.term.medium', 'component', route, 'średni horyzont zobowiązania'),
    entry('wizard.driver.term.long', 'component', route, 'dłuższa akceptowalna umowa'),
    entry('wizard.driver.sharing.low', 'component', route, 'niski poziom rotacyjności'),
    entry('wizard.driver.sharing.medium', 'component', route, 'umiarkowany poziom rotacyjności'),
    entry('wizard.driver.sharing.high', 'component', route, 'wysoki poziom rotacyjności'),
  ]
}

export function getStaticPageContentEntries(): StaticContentEntry[] {
  return [
    ...HOME_CONTENT,
    ...GUIDE_CONTENT,
    ...BASICS_HUB_CONTENT,
    ...getBasicsContentEntries(),
    ...REPORTS_HUB_CONTENT,
    ...getReportsContentEntries(),
    ...getCalculatorContentEntries(),
    ...getOfficeModelWizardContentEntries(),
    ...COMPARATOR_CONTENT,
    ...CONTACT_FORM_CONTENT,
    ...LEGAL_CONTENT,
    ...ERROR_CONTENT,
    entry('meta.calculator.title', 'metadata', '/kalkulator-flex', 'Kalkulator flex'),
    entry('meta.calculator.description', 'metadata', '/kalkulator-flex', 'Porównaj orientacyjny koszt biura serwisowanego i najmu konwencjonalnego dla swojego zespołu z wykorzystaniem założeń Colliers i kursu NBP.'),
  ]
}
