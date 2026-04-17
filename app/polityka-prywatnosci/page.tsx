import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = { title: 'Polityka prywatności' }

const legalRights = [
  'Prawo dostępu do danych i otrzymania ich kopii.',
  'Prawo do sprostowania lub uzupełnienia danych.',
  'Prawo do usunięcia danych, gdy nie są już niezbędne do celu przetwarzania.',
  'Prawo do ograniczenia przetwarzania w przypadkach przewidzianych w RODO.',
  'Prawo do przenoszenia danych, jeśli przetwarzanie odbywa się na podstawie zgody lub umowy.',
  'Prawo sprzeciwu wobec przetwarzania realizowanego na podstawie prawnie uzasadnionego interesu.',
  'Prawo wniesienia skargi do Prezesa UODO.',
]

const cookies = [
  {
    title: 'Niezbędne',
    text: 'Zapewniają podstawowe funkcje Serwisu, bezpieczeństwo, nawigację i poprawne wyświetlanie stron. Nie wymagają zgody użytkownika.',
  },
  {
    title: 'Analityczne',
    text: 'Zbierają anonimowe informacje o sposobie korzystania z Serwisu, w tym odwiedzanych stronach, czasie sesji i typie urządzenia. Instalowane są wyłącznie po wyrażeniu zgody.',
  },
]

const cookieRows = [
  ['_ga / Google Analytics', 'Rozróżnianie użytkowników i zbieranie danych o ruchu.', 'Analityczny', '2 lata'],
  ['_ga_XXXXXXXX / Google Analytics', 'Przechowywanie stanu sesji Google Analytics 4.', 'Analityczny', '2 lata'],
  ['_gid / Google Analytics', 'Rozróżnianie użytkowników i identyfikacja sesji dobowej.', 'Analityczny', '24 godziny'],
  ['cookieconsent / własny', 'Zapamiętanie wyboru użytkownika dotyczącego zgody na cookies.', 'Niezbędny', '12 miesięcy'],
  ['session / własny', 'Zarządzanie sesją użytkownika w Serwisie i stanem wyszukiwania.', 'Niezbędny', 'Do zamknięcia przeglądarki'],
]

export default function PolitykaPrywatnosci() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="border-b border-[#e6ebf7] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9ff_100%)]">
          <div className="container-colliers py-16 lg:py-20">
            <p className="overline mb-6">Polityka prywatności</p>
            <h1
              className="max-w-4xl text-[#000759]"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(2.7rem,5vw,4.9rem)', lineHeight: 1.02 }}
            >
              Polityka prywatności i plików cookies Colliers Flex
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-normal leading-relaxed text-body-strong">
              Serwis Colliers Flex służy do wyszukiwania i prezentacji ofert biur serwisowanych oraz elastycznych przestrzeni biurowych w Polsce. Poniżej opisujemy zasady przetwarzania danych osobowych, okresy przechowywania danych oraz sposób korzystania z plików cookies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 eyebrow-label text-[11px]">
              <span className="border border-[#dbe4f8] bg-white px-4 py-3">Data wejścia w życie: do uzupełnienia</span>
              <span className="border border-[#dbe4f8] bg-white px-4 py-3">Ostatnia aktualizacja: do uzupełnienia</span>
            </div>
          </div>
        </section>

        <section className="container-colliers py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-12">
              <section>
                <p className="overline mb-5">Administrator</p>
                <div className="border border-[#dbe4f8] bg-[#f7f9ff] p-8">
                  <h2 className="mb-4 text-2xl font-normal text-[#000759]" style={{ fontFamily: 'var(--font-serif)' }}>
                    Colliers International Poland sp. z o.o.
                  </h2>
                  <div className="space-y-2 text-[#5c678c]">
                    <p>ul. Pańska 97, 00-834 Warszawa</p>
                    <p>DaneOsoboweCP@colliers.com</p>
                    <p>flex@colliers.pl</p>
                    <p>+48 22 331 78 00</p>
                  </div>
                </div>
              </section>

              <section>
                <p className="overline mb-5">Cele przetwarzania</p>
                <div className="space-y-6 text-[#5c678c]">
                  <div className="border border-[#e6ebf7] p-6">
                    <h3 className="mb-3 text-xl font-semibold text-[#000759]">Zapytania ofertowe i formularz kontaktowy</h3>
                    <p className="leading-relaxed">
                      Dane przekazane w formularzu służą do rejestracji zapytania, przygotowania dopasowanej oferty, kontaktu z użytkownikiem oraz ewentualnego dochodzenia roszczeń lub obrony przed nimi. Przetwarzamy w szczególności imię i nazwisko, adres e-mail, numer telefonu, treść wiadomości oraz parametry wyszukiwania, takie jak lokalizacja, metraż czy liczba stanowisk.
                    </p>
                    <p className="mt-4 text-sm">
                      Podstawa prawna: art. 6 ust. 1 lit. b RODO oraz art. 6 ust. 1 lit. f RODO.
                    </p>
                  </div>
                  <div className="border border-[#e6ebf7] p-6">
                    <h3 className="mb-3 text-xl font-semibold text-[#000759]">Analityka serwisu</h3>
                    <p className="leading-relaxed">
                      Za zgodą użytkownika wykorzystujemy cookies analityczne do mierzenia ruchu, czasu sesji, typu urządzenia i ogólnych informacji o lokalizacji na poziomie kraju lub miasta. Dane te pomagają rozwijać Serwis i optymalizować doświadczenie użytkownika.
                    </p>
                    <p className="mt-4 text-sm">
                      Podstawa prawna: art. 6 ust. 1 lit. a RODO oraz art. 173 ust. 2 Prawa telekomunikacyjnego.
                    </p>
                  </div>
                  <div className="border border-[#e6ebf7] p-6">
                    <h3 className="mb-3 text-xl font-semibold text-[#000759]">Prawidłowe działanie i marketing własny</h3>
                    <p className="leading-relaxed">
                      Przetwarzamy również dane niezbędne do poprawnego działania Serwisu, zapewnienia bezpieczeństwa i dostępności stron. Dane użytkowników, którzy skontaktowali się z Colliers Flex, mogą być wykorzystywane do marketingu usług własnych Colliers, w tym przesyłania informacji o rynku elastycznych przestrzeni biurowych.
                    </p>
                    <p className="mt-4 text-sm">
                      Podstawa prawna: art. 6 ust. 1 lit. f RODO.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <p className="overline mb-5">Odbiorcy i transfer danych</p>
                <div className="border border-[#e6ebf7] p-6 text-[#5c678c] leading-relaxed">
                  <p>
                    Dane osobowe mogą być przekazywane podmiotom z Polskiej Grupy Colliers, dostawcom usług IT wspierającym działanie Serwisu oraz podmiotom świadczącym usługi analityczne, w szczególności Google Analytics, na podstawie odpowiednich umów powierzenia.
                  </p>
                  <p className="mt-4">
                    Dane mogą być przekazywane poza EOG do Kanady oraz do Stanów Zjednoczonych. Transfer do Kanady odbywa się na podstawie decyzji Komisji Europejskiej, a transfer związany z Google Analytics zabezpieczany jest poprzez standardowe klauzule umowne.
                  </p>
                </div>
              </section>

              <section>
                <p className="overline mb-5">Prawa użytkowników</p>
                <div className="border border-[#e6ebf7] p-6">
                  <ul className="space-y-3 text-[#5c678c]">
                    {legalRights.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1C54F4]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm text-[#5c678c]">
                    Wnioski dotyczące realizacji praw należy kierować na adres: <strong>DaneOsoboweCP@colliers.com</strong>
                  </p>
                </div>
              </section>

              <section>
                <p className="overline mb-5">Polityka cookies</p>
                <div className="grid gap-6 lg:grid-cols-2">
                  {cookies.map((cookie) => (
                    <div key={cookie.title} className="border border-[#e6ebf7] p-6">
                      <h3 className="mb-3 text-xl font-semibold text-[#000759]">{cookie.title}</h3>
                      <p className="text-[#5c678c] leading-relaxed">{cookie.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 overflow-hidden border border-[#e6ebf7]">
                  <div className="grid grid-cols-[1.7fr_1.5fr_0.9fr_0.9fr] bg-[#f7f9ff] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#25408F]">
                    <span>Nazwa / dostawca</span>
                    <span>Cel</span>
                    <span>Rodzaj</span>
                    <span>Okres</span>
                  </div>
                  {cookieRows.map((row) => (
                    <div key={row[0]} className="grid grid-cols-[1.7fr_1.5fr_0.9fr_0.9fr] gap-4 border-t border-[#e6ebf7] px-6 py-4 text-sm text-[#5c678c]">
                      <span>{row[0]}</span>
                      <span>{row[1]}</span>
                      <span>{row[2]}</span>
                      <span>{row[3]}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="border border-[#dbe4f8] bg-[linear-gradient(180deg,#f7f9ff_0%,#eef3ff_100%)] p-8">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4]">Retencja danych</p>
                <div className="space-y-4 text-[#5c678c]">
                  <p>Dane z formularza kontaktowego: do 10 lat od nadania lub odebrania korespondencji.</p>
                  <p>Dane związane z potencjalną współpracą: 3 lata od ostatniego kontaktu lub do skutecznego sprzeciwu.</p>
                  <p>Dokumentacja związana z roszczeniami: 6 lat od zakończenia współpracy.</p>
                  <p>Dane eksploatacyjne i analityczne: usuwane lub anonimizowane nie później niż po 2 latach.</p>
                </div>
              </div>

              <div className="border border-[#e6ebf7] p-8">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4]">Zarządzanie cookies</p>
                <div className="space-y-3 text-[#5c678c]">
                  <p>Google Chrome: Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie.</p>
                  <p>Mozilla Firefox: Opcje → Prywatność i bezpieczeństwo.</p>
                  <p>Microsoft Edge: Ustawienia → Pliki cookie i uprawnienia witryn.</p>
                  <p>Safari: Preferencje → Prywatność.</p>
                  <p className="pt-2 text-sm">
                    Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.
                  </p>
                </div>
              </div>

              <div className="border border-[#e6ebf7] p-8">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1C54F4]">Kontakt</p>
                <div className="space-y-2 text-[#5c678c]">
                  <p>RODO: DaneOsoboweCP@colliers.com</p>
                  <p>Serwis: flex@colliers.pl</p>
                  <p>Telefon: +48 22 331 78 00</p>
                  <p>Adres: ul. Pańska 97, 00-834 Warszawa</p>
                </div>
                <p className="mt-5 text-sm text-[#5c678c]">
                  Organ nadzorczy: Prezes Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
