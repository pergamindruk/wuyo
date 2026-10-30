/**
 * Wzory dokumentów dla klienta (ta sama treść co w Claude Docs: „WUYO – dokumenty dla klienta”).
 * Pola {{...}} uzupełnia panel z wybranego zlecenia; [w nawiasach] zostaje do ręcznego wpisania.
 * Po rejestracji firmy podmień WYKONAWCA_DANE (nazwa, adres, NIP z CEIDG).
 */

export const WYKONAWCA_DANE = 'Mateusz Machoś, ul. Siemieńskiego 17A/38, 35-203 Rzeszów [po rejestracji: firma i NIP z CEIDG]'
export const DOCS_MASTER_URL = 'https://claude.ai/artifact/2w5MkyuWSwCLHuGRMhJKyF'

export type LegalFields = {
    WYKONAWCA: string
    ZAMAWIAJACY: string
    EMAIL: string
    DATA: string
    NR: string
    DZIELO: string
    KWOTA: string
    ZALICZKA: string
}

export type LegalTemplate = { slug: string; title: string; when: string; sign: string; body: string }

export const LEGAL_TEMPLATES: LegalTemplate[] = [
    {
        slug: 'umowa',
        title: 'Umowa o wykonanie dzieła',
        when: 'Po akceptacji oferty, przed zaliczką.',
        sign: 'Wystarczy akceptacja mailem (przeniesienie praw jest w protokole).',
        body: `# Umowa o wykonanie dzieła nr {{NR}}

zawarta w Rzeszowie w dniu {{DATA}} (albo na odległość, przez akceptację mailem) pomiędzy:

**Wykonawcą:** {{WYKONAWCA}}, e-mail: kontakt@wuyo.pl, tel. 725 182 053,

a

**Zamawiającym:** {{ZAMAWIAJACY}}, e-mail: {{EMAIL}}.

## § 1. Przedmiot umowy

1. Wykonawca wykona dla Zamawiającego dzieło opisane w Załączniku nr 1 (dalej: Dzieło), a Zamawiający odbierze je i zapłaci wynagrodzenie.
2. Załącznik nr 1 określa zakres, liczbę koncepcji i rund poprawek, pliki do przekazania, cenę oraz harmonogram. Załącznik jest częścią umowy.
3. Wszystko, czego nie ma w Załączniku nr 1, jest pracą dodatkową wycenianą osobno po akceptacji Zamawiającego.

## § 2. Współpraca i materiały

1. Zamawiający przekaże materiały potrzebne do wykonania Dzieła (teksty, zdjęcia, logo, dane do strony) w terminie wskazanym w Załączniku nr 1.
2. Zamawiający oświadcza, że ma prawa do przekazanych materiałów i że ich użycie nie narusza praw osób trzecich. Za materiały Zamawiającego odpowiada Zamawiający.
3. Opóźnienie w przekazaniu materiałów albo w odpowiedzi na projekt przesuwa terminy Wykonawcy o tyle samo dni.
4. Strony kontaktują się mailem na adresy z nagłówka umowy. Uwagi i akceptacje przesyłane mailem są wiążące.

## § 3. Projekt, poprawki i akceptacja

1. Wykonawca przedstawi projekt w formie podglądu (PDF, link, wizualizacja). Liczba koncepcji i rund poprawek jest określona w Załączniku nr 1.
2. Runda poprawek to jedna lista uwag przesłana w jednej wiadomości. Kolejne rundy oraz zmiany zakresu po akceptacji projektu są płatne według stawki 100 zł netto za godzinę, po uprzedniej akceptacji Zamawiającego.
3. Akceptacja projektu do druku albo publikacji następuje mailem. Po akceptacji do druku Wykonawca nie odpowiada za błędy w treściach zatwierdzonych przez Zamawiającego (np. literówki w numerze telefonu).

## § 4. Wynagrodzenie i płatności

1. Wynagrodzenie wynosi {{KWOTA}}, zgodnie z Załącznikiem nr 1. [Wykonawca jest zwolniony z VAT na podstawie art. 113 ust. 1 ustawy o VAT. / Do kwoty netto doliczany jest VAT 23%.]
2. Zamawiający wpłaca zaliczkę w wysokości 50% wynagrodzenia ({{ZALICZKA}}) w terminie 7 dni od zawarcia umowy. Wykonawca rozpoczyna pracę po wpływie zaliczki.
3. Pozostałe 50% Zamawiający płaci po odbiorze Dzieła, w terminie 7 dni od otrzymania faktury, a przy druku i publikacji strony przed wydaniem wydruków albo przekazaniem dostępów.
4. Płatność przelewem na rachunek: [NR KONTA]. W razie opóźnienia Wykonawca może naliczyć odsetki ustawowe za opóźnienie.

## § 5. Odbiór

1. Po wykonaniu Dzieła Wykonawca przekazuje pliki, wydruki albo dostępy zgodnie z Załącznikiem nr 1. Odbiór potwierdza protokół odbioru.
2. Zamawiający zgłasza zastrzeżenia w ciągu 7 dni od przekazania Dzieła, wskazując, co jest niezgodne z umową. Wykonawca usuwa niezgodności w rozsądnym terminie uzgodnionym mailem.
3. Jeżeli Zamawiający jest przedsiębiorcą innym niż wskazany w § 10 ust. 1 i nie zgłosi zastrzeżeń w terminie z ust. 2, Dzieło uważa się za odebrane bez zastrzeżeń.

## § 6. Prawa autorskie

1. Autorskie prawa majątkowe do Dzieła przechodzą na Zamawiającego z chwilą zapłaty całego wynagrodzenia, na podstawie protokołu odbioru podpisanego przez obie strony w formie pisemnej, na polach eksploatacji wymienionych w tym protokole. Do tego czasu Zamawiający może korzystać z Dzieła wyłącznie w celu jego oceny i akceptacji.
2. Prawa do koncepcji odrzuconych, szkiców i projektów niewybranych zostają przy Wykonawcy.
3. Pliki źródłowe (otwarte pliki robocze) Wykonawca przekazuje tylko wtedy, gdy przewiduje to Załącznik nr 1.
4. Wykonawca może pokazać Dzieło w swoim portfolio, na stronie i w mediach społecznościowych po jego publikacji przez Zamawiającego, chyba że Zamawiający zastrzeże inaczej mailem.
5. Wykonawca oświadcza, że Dzieło będzie jego oryginalnym utworem. Czcionki, zdjęcia i elementy z banków obrazów użyte w Dziele Wykonawca dobiera na licencjach pozwalających na użycie komercyjne i informuje o nich Zamawiającego.

## § 7. Druk i strona internetowa (jeżeli dotyczy)

1. Druk wykonywany jest na podstawie pliku zaakceptowanego przez Zamawiającego. Dopuszczalne są różnice kolorów między ekranem a wydrukiem wynikające z technologii druku (CMYK) oraz różnice nakładu do 3%.
2. Domenę Wykonawca rejestruje na dane Zamawiającego. Koszt domeny i serwera za pierwszy rok jest wliczony w wynagrodzenie, jeżeli tak stanowi Załącznik nr 1. Po pierwszym roku Zamawiający opłaca je sam albo w ramach usługi Opieka Strony według odrębnego regulaminu.
3. Po odbiorze i zapłacie Wykonawca przekazuje Zamawiającemu dane dostępowe do panelu strony, domeny i serwera.

## § 8. Odpowiedzialność

1. Wobec Zamawiającego będącego przedsiębiorcą innym niż wskazany w § 10 ust. 1 odpowiedzialność Wykonawcy jest ograniczona do wysokości otrzymanego wynagrodzenia i nie obejmuje utraconych korzyści, a uprawnienia z rękojmi są wyłączone. Ograniczenie nie dotyczy szkody wyrządzonej umyślnie.
2. Wobec konsumenta i przedsiębiorcy z § 10 ust. 1 Wykonawca odpowiada na zasadach przewidzianych w Kodeksie cywilnym i ustawie o prawach konsumenta.

## § 9. Odstąpienie od umowy i rezygnacja

1. Zamawiający może zrezygnować z Dzieła w każdej chwili przed jego ukończeniem (art. 644 KC). Wykonawca zachowuje wtedy wynagrodzenie za wykonaną część prac, rozliczane z zaliczki. Nadwyżkę zaliczki Wykonawca zwraca w ciągu 14 dni.
2. Wykonawca może odstąpić od umowy, jeżeli Zamawiający mimo wezwania mailem nie przekaże materiałów albo nie odpowie na projekt przez 30 dni. Wykonawca zachowuje wtedy wynagrodzenie za wykonaną część prac.

## § 10. Konsument i przedsiębiorca na prawach konsumenta

1. Jeżeli Zamawiający jest konsumentem albo osobą fizyczną prowadzącą działalność gospodarczą, dla której umowa nie ma charakteru zawodowego (art. 38a ustawy o prawach konsumenta), a umowa jest zawierana na odległość albo poza lokalem Wykonawcy, może od niej odstąpić w ciągu 14 dni bez podania przyczyny, zgodnie z Informacją o prawie odstąpienia przekazaną przed zawarciem umowy.
2. ☐ Żądam rozpoczęcia prac przed upływem 14 dni na odstąpienie. Wiem, że jeżeli odstąpię po rozpoczęciu prac, zapłacę za prace wykonane do chwili odstąpienia, a po pełnym wykonaniu usługi utracę prawo odstąpienia.
3. Prawo odstąpienia nie przysługuje co do wydruków i innych rzeczy wykonanych według projektu zaakceptowanego przez Zamawiającego (art. 38 ust. 1 pkt 3 ustawy o prawach konsumenta).

## § 11. Dane osobowe

Wykonawca przetwarza dane Zamawiającego w celu wykonania umowy i rozliczeń zgodnie z Klauzulą informacyjną RODO, którą Zamawiający otrzymał przed zawarciem umowy. Jeżeli Wykonawca przy wykonaniu Dzieła przetwarza dane klientów Zamawiającego (np. formularz kontaktowy, hosting), strony zawierają umowę powierzenia.

## § 12. Postanowienia końcowe

1. W sprawach nieuregulowanych stosuje się Kodeks cywilny i ustawę o prawie autorskim i prawach pokrewnych.
2. Zmiany umowy wymagają formy dokumentowej (mail), z wyjątkiem przeniesienia praw autorskich, które wymaga formy pisemnej.
3. Spory z przedsiębiorcą rozstrzyga sąd właściwy dla siedziby Wykonawcy. Konsument może też skorzystać z pozasądowych sposobów rozpatrywania sporu, np. rzecznika konsumentów.
4. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach albo zawarto przez akceptację mailem treści przesłanej w PDF.

Załączniki: 1. Zakres, cena i harmonogram. 2. Informacja o prawie odstąpienia z formularzem (dla konsumenta i przedsiębiorcy z § 10 ust. 1). 3. Klauzula informacyjna RODO.

| Wykonawca | Zamawiający |
| --- | --- |
| ........................................ | ........................................ |`,
    },
    {
        slug: 'zalacznik',
        title: 'Załącznik nr 1: zakres i cena',
        when: 'Razem z umową, przepisany z oferty.',
        sign: 'Jak umowa.',
        body: `# Załącznik nr 1 do umowy nr {{NR}}: zakres, cena i harmonogram

**Dzieło:** {{DZIELO}}

| Pozycja | Ustalenie |
| --- | --- |
| Liczba koncepcji | [np. 1 koncepcja główna + 2 alternatywne kierunki] |
| Rundy poprawek w cenie | [np. 2] |
| Pliki do przekazania | [np. SVG, PDF, EPS, PNG; wersje pozioma, pionowa, mono; mini księga PDF] |
| Pliki źródłowe (otwarte) | [tak / nie] |
| Druk | [format, papier, nakład, wykończenie] albo nie dotyczy |
| Strona WWW | [liczba podstron, formularz, mapa, CMS, domena i serwer na 1. rok w cenie: tak/nie] albo nie dotyczy |
| Materiały od Zamawiającego | [teksty, zdjęcia, dane] do dnia [DATA] |
| Wynagrodzenie | {{KWOTA}}, zaliczka 50%: {{ZALICZKA}} |
| Termin pierwszego projektu | [liczba dni roboczych od zaliczki i materiałów] |
| Termin oddania | [DATA albo liczba dni roboczych od akceptacji projektu] |
| Dane do faktury Zamawiającego | {{ZAMAWIAJACY}} |

Prace dodatkowe: 100 zł netto za godzinę, po akceptacji Zamawiającego mailem.`,
    },
    {
        slug: 'protokol',
        title: 'Protokół odbioru + przeniesienie praw',
        when: 'Przy oddaniu, po pełnej zapłacie.',
        sign: 'Odręcznie, 2 egzemplarze (albo podpis kwalifikowany). Mail nie wystarczy.',
        body: `# Protokół odbioru dzieła i przeniesienia autorskich praw majątkowych

Sporządzony w Rzeszowie w dniu {{DATA}} do umowy nr {{NR}} pomiędzy {{WYKONAWCA}} (Wykonawca) a {{ZAMAWIAJACY}} (Zamawiający).

## 1. Odbiór

1. Zamawiający odbiera Dzieło: {{DZIELO}}.
2. Przekazane pliki, wydruki albo dostępy: [lista, np. logo SVG/PDF/PNG, mini księga PDF, 150 wizytówek, dostęp do panelu strony i domeny].
3. ☐ Dzieło odebrane bez zastrzeżeń. ☐ Dzieło odebrane z zastrzeżeniami: [opis i termin poprawy].

## 2. Rozliczenie

Wynagrodzenie {{KWOTA}} zostało zapłacone w całości w dniu [DATA] (zaliczka {{ZALICZKA}} w dniu [DATA], reszta w dniu [DATA]).

## 3. Przeniesienie autorskich praw majątkowych

1. Wykonawca przenosi na Zamawiającego autorskie prawa majątkowe do Dzieła, bez ograniczeń czasowych i terytorialnych, w ramach wynagrodzenia z umowy, na następujących polach eksploatacji (art. 50 ustawy o prawie autorskim i prawach pokrewnych):
    1. utrwalanie i zwielokrotnianie dowolną techniką, w tym drukarską, reprograficzną, zapisu magnetycznego i cyfrową, oraz wprowadzanie do pamięci komputera i sieci;
    2. wprowadzanie do obrotu, użyczenie i najem oryginału albo egzemplarzy;
    3. publiczne wyświetlanie, wystawianie, nadawanie i reemitowanie oraz publiczne udostępnianie tak, aby każdy miał do Dzieła dostęp w miejscu i czasie przez siebie wybranym, w szczególności w internecie i mediach społecznościowych;
    4. używanie Dzieła w działalności Zamawiającego, w tym na materiałach firmowych, opakowaniach, odzieży, pojazdach, szyldach, w reklamie i promocji;
    5. wykorzystanie Dzieła jako znaku towarowego albo wzoru, w tym zgłoszenie go do ochrony w Urzędzie Patentowym RP, EUIPO i innych urzędach;
    6. jeżeli Dzieło obejmuje stronę internetową albo kod: trwałe i czasowe zwielokrotnianie programu, jego tłumaczenie, przystosowanie i zmiany układu oraz rozpowszechnianie (art. 74 ust. 4 ustawy o prawie autorskim), z wyłączeniem elementów na licencjach otwartych i zewnętrznych, które zachowują własne licencje.
2. Wykonawca zezwala Zamawiającemu na wykonywanie i rozporządzanie opracowaniami Dzieła (prawo zależne) i przenosi to zezwolenie na Zamawiającego.
3. Wykonawca zobowiązuje się nie wykonywać autorskich praw osobistych w sposób ograniczający Zamawiającego, w szczególności zgadza się na zmiany Dzieła i na korzystanie z niego bez oznaczania autorstwa.
4. Wykonawca zachowuje prawo do pokazania Dzieła w portfolio zgodnie z § 6 ust. 4 umowy.
5. Z chwilą podpisania protokołu Zamawiający nabywa własność przekazanych nośników i wydruków.

| Wykonawca | Zamawiający |
| --- | --- |
| ........................................ | ........................................ |`,
    },
    {
        slug: 'odstapienie',
        title: 'Informacja o odstąpieniu + formularz',
        when: 'Przed zawarciem umowy z konsumentem albo JDG spoza branży.',
        sign: 'Nie podpisuje się. PDF mailem przed akceptacją umowy.',
        body: `# Informacja o prawie odstąpienia od umowy

**Prawo odstąpienia.** Mają Państwo prawo odstąpić od umowy w terminie 14 dni bez podania jakiejkolwiek przyczyny. Termin wygasa po upływie 14 dni od dnia zawarcia umowy, a przy umowie, w której wydajemy wydruki, od dnia, w którym weszli Państwo w ich posiadanie.

Aby skorzystać z prawa odstąpienia, muszą Państwo poinformować nas, {{WYKONAWCA}}, e-mail kontakt@wuyo.pl, tel. 725 182 053, o swojej decyzji w drodze jednoznacznego oświadczenia (np. mailem albo listem). Mogą Państwo skorzystać z wzoru formularza poniżej, ale nie jest to obowiązkowe. Aby zachować termin, wystarczy wysłać informację przed jego upływem.

**Skutki odstąpienia.** Zwracamy wszystkie otrzymane płatności niezwłocznie, nie później niż 14 dni od dnia otrzymania oświadczenia, tym samym sposobem płatności, chyba że zgodzą się Państwo na inny. Jeżeli zażądali Państwo rozpoczęcia usługi przed upływem terminu odstąpienia, zapłacą Państwo kwotę proporcjonalną do zakresu usług wykonanych do chwili poinformowania nas o odstąpieniu.

**Kiedy prawo odstąpienia nie przysługuje** (art. 38 ust. 1 ustawy o prawach konsumenta):

- gdy usługa została w pełni wykonana za Państwa wyraźną zgodą, a przed rozpoczęciem zostali Państwo poinformowani o utracie prawa odstąpienia po jej wykonaniu;
- co do rzeczy wyprodukowanych według Państwa specyfikacji albo służących zaspokojeniu Państwa zindywidualizowanych potrzeb, np. wizytówek, ulotek i odzieży wydrukowanych według zaakceptowanego projektu.

## Wzór formularza odstąpienia od umowy

(formularz należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)

Adresat: {{WYKONAWCA}}, kontakt@wuyo.pl

Ja/My(\\*) niniejszym informuję/informujemy(\\*) o moim/naszym odstąpieniu od umowy o świadczenie następującej usługi / dostawy następujących rzeczy(\\*): ........................................

- Data zawarcia umowy / odbioru(\\*): ....................
- Imię i nazwisko konsumenta(-ów): ....................
- Adres konsumenta(-ów): ....................
- Podpis konsumenta(-ów) (tylko jeżeli formularz jest przesyłany w wersji papierowej): ....................
- Data: ....................

(\\*) Niepotrzebne skreślić.`,
    },
    {
        slug: 'rodo',
        title: 'Klauzula informacyjna RODO',
        when: 'Przy pierwszym kontakcie: stopka oferty albo maila, załącznik do umowy.',
        sign: 'Nie podpisuje się.',
        body: `# Klauzula informacyjna RODO

1. **Administrator danych:** {{WYKONAWCA}}, e-mail kontakt@wuyo.pl, tel. 725 182 053.
2. **Cele i podstawy przetwarzania:**
    - przygotowanie oferty i wykonanie umowy (art. 6 ust. 1 lit. b RODO),
    - wystawienie faktur i prowadzenie księgowości (art. 6 ust. 1 lit. c RODO w zw. z przepisami podatkowymi),
    - dochodzenie i obrona roszczeń oraz kontakt w sprawach związanych ze współpracą (art. 6 ust. 1 lit. f RODO, uzasadniony interes administratora).
3. **Odbiorcy danych:** biuro rachunkowe, bank, dostawcy poczty e-mail i serwerów (np. Google, Vercel, Supabase), drukarnie i firmy kurierskie, gdy realizują Państwa zamówienie, oraz organy uprawnione na podstawie przepisów.
4. **Przekazywanie poza Europejski Obszar Gospodarczy:** część dostawców usług IT ma siedzibę w USA. Dane są przekazywane na podstawie decyzji Komisji Europejskiej (EU-US Data Privacy Framework) albo standardowych klauzul umownych.
5. **Okres przechowywania:** przez czas współpracy, a potem do upływu terminu przedawnienia roszczeń i przez 5 lat od końca roku podatkowego, w którym powstał obowiązek podatkowy. Dane z zapytań, które nie zakończyły się umową, usuwamy po 12 miesiącach.
6. **Państwa prawa:** dostęp do danych, sprostowanie, usunięcie, ograniczenie przetwarzania, przeniesienie danych, sprzeciw wobec przetwarzania na podstawie uzasadnionego interesu oraz skarga do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).
7. **Dobrowolność:** podanie danych jest dobrowolne, ale bez nich nie przygotuję oferty ani nie zawrę umowy. Dane nie służą do zautomatyzowanego podejmowania decyzji ani profilowania.`,
    },
    {
        slug: 'powierzenie',
        title: 'Umowa powierzenia danych',
        when: 'Strona z formularzem, hosting, Opieka Strony.',
        sign: 'Akceptacja PDF mailem.',
        body: `# Umowa powierzenia przetwarzania danych osobowych

Zawarta w dniu {{DATA}} pomiędzy {{ZAMAWIAJACY}} (Administrator) a {{WYKONAWCA}} (Podmiot przetwarzający), jako uzupełnienie umowy nr {{NR}} / usługi Opieka Strony.

## § 1. Przedmiot

1. Administrator powierza Podmiotowi przetwarzającemu przetwarzanie danych osobowych w zakresie i celu opisanym w tabeli, na czas obowiązywania umowy głównej.

| Element | Opis |
| --- | --- |
| Charakter i cel | utrzymanie strony internetowej, serwera i poczty formularza; kopie zapasowe; usuwanie awarii |
| Kategorie osób | klienci i użytkownicy strony Administratora, osoby wysyłające formularz |
| Rodzaj danych | imię i nazwisko, e-mail, telefon, treść wiadomości, adres IP i dane techniczne z logów serwera |
| Operacje | przechowywanie, wyświetlanie, kopiowanie w kopiach zapasowych, usuwanie |

## § 2. Obowiązki Podmiotu przetwarzającego (art. 28 ust. 3 RODO)

Podmiot przetwarzający:

1. przetwarza dane wyłącznie na udokumentowane polecenie Administratora; umowa i zgłoszenia mailowe są takim poleceniem;
2. zapewnia, że osoby dopuszczone do danych zobowiązały się do zachowania poufności;
3. stosuje środki bezpieczeństwa z art. 32 RODO, w tym szyfrowane połączenie (SSL), silne hasła z uwierzytelnianiem dwuskładnikowym, kopie zapasowe i aktualizacje;
4. może korzystać z dalszych podmiotów przetwarzających (dostawcy serwerów i poczty, np. [Vercel / Supabase / Google / hosting]); Administrator wyraża na to ogólną zgodę, a Podmiot przetwarzający informuje mailem o zmianie dostawcy z 14-dniowym wyprzedzeniem, w którym Administrator może zgłosić sprzeciw;
5. pomaga Administratorowi odpowiadać na żądania osób, których dane dotyczą, oraz wywiązywać się z obowiązków z art. 32–36 RODO;
6. zgłasza Administratorowi naruszenie ochrony danych bez zbędnej zwłoki, nie później niż w ciągu 24 godzin od jego wykrycia;
7. po zakończeniu usługi zwraca dane albo je usuwa, według wyboru Administratora, i usuwa kopie, chyba że prawo nakazuje ich przechowywanie;
8. udostępnia informacje potrzebne do wykazania zgodności z RODO i umożliwia audyt po uprzedzeniu z 14-dniowym wyprzedzeniem, na koszt Administratora.

## § 3. Postanowienia końcowe

1. Odpowiedzialność Podmiotu przetwarzającego wobec Administratora będącego przedsiębiorcą jest ograniczona do wynagrodzenia za ostatnie 12 miesięcy usługi, z wyjątkiem szkody wyrządzonej umyślnie.
2. Umowa wygasa z zakończeniem umowy głównej albo usługi Opieka Strony.

| Administrator | Podmiot przetwarzający |
| --- | --- |
| ........................................ | ........................................ |`,
    },
    {
        slug: 'regulamin',
        title: 'Regulamin Opieka Strony',
        when: 'Przy pierwszym abonamencie.',
        sign: 'Akceptacja mailem razem z wyborem pakietu.',
        body: `# Regulamin usługi Opieka Strony

## § 1. Usługodawca i pakiety

1. Usługodawcą jest {{WYKONAWCA}}, kontakt@wuyo.pl, tel. 725 182 053.
2. Usługę świadczy się w pakietach (ceny netto miesięcznie, [+ 23% VAT / zw. z VAT]):

| Pakiet | Cena | Zakres |
| --- | --- | --- |
| Opieka Strony | 199 zł | serwer, przedłużanie domeny, kopie zapasowe, aktualizacje i zabezpieczenia, 1 godzina zmian w miesiącu |
| Widoczność i Opieka | 690 zł | Opieka Strony + prowadzenie wizytówki Google, obsługa opinii, 5–6 grafik w miesiącu, miesięczny raport |
| Stały Opiekun | 1 290 zł | Widoczność i Opieka + bieżąca grafika i media społecznościowe, pierwszeństwo w kolejce |

3. Niewykorzystane godziny zmian nie przechodzą na kolejny miesiąc. Prace ponad limit wycenia się po 100 zł netto za godzinę, po akceptacji klienta mailem.

## § 2. Zawarcie umowy i płatności

1. Umowa zostaje zawarta z chwilą akceptacji regulaminu i pakietu mailem, na czas nieokreślony.
2. Opłata jest płatna z góry do 10. dnia każdego miesiąca na podstawie faktury. Przy opóźnieniu ponad 30 dni Usługodawca może po wezwaniu mailem wstrzymać prace inne niż utrzymanie strony w sieci.
3. Zmiana cen wymaga powiadomienia mailem z 30-dniowym wyprzedzeniem. Klient może wtedy wypowiedzieć umowę ze skutkiem na dzień zmiany.

## § 3. Zgłoszenia i czas reakcji

1. Zgłoszenia przyjmowane są mailem albo telefonicznie w dni robocze w godzinach 8:00–16:00.
2. Awaria uniemożliwiająca działanie strony: reakcja do [4] godzin roboczych. Zmiany treści: realizacja do [3] dni roboczych.
3. Usługodawca nie odpowiada za przerwy wynikające z awarii dostawców serwerów i domen, zmian wprowadzonych przez klienta albo osoby trzecie oraz siły wyższej, ale w takich przypadkach przywraca działanie strony z kopii zapasowej.

## § 4. Dane i dostępy

1. Domena jest zarejestrowana na dane klienta. Na życzenie klienta Usługodawca przekazuje wszystkie dane dostępowe.
2. Jeżeli strona przetwarza dane osób trzecich, strony zawierają umowę powierzenia przetwarzania danych.

## § 5. Wypowiedzenie

1. Każda ze stron może wypowiedzieć umowę z miesięcznym okresem wypowiedzenia, ze skutkiem na koniec miesiąca kalendarzowego, mailem.
2. Po zakończeniu umowy Usługodawca w ciągu 14 dni przekazuje dostępy i pełną kopię strony albo przenosi ją do wskazanego dostawcy.
3. Konsumentowi i przedsiębiorcy na prawach konsumenta przysługuje dodatkowo prawo odstąpienia w ciągu 14 dni od zawarcia umowy na zasadach z Informacji o prawie odstąpienia.

## § 6. Reklamacje

Reklamacje rozpatrywane są w ciągu 14 dni od ich otrzymania mailem. Brak odpowiedzi w tym terminie wobec konsumenta oznacza uznanie reklamacji.`,
    },
]

export function fillTemplate(body: string, f: LegalFields): string {
    return body.replace(/\{\{(\w+)\}\}/g, (m, k: string) => (f as Record<string, string>)[k] ?? m)
}
