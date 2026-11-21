/**
 * Wzory dokumentów dla klienta (ta sama treść co w Claude Docs: „WUYO – dokumenty dla klienta”).
 * Pola {{...}} uzupełnia panel z wybranego zlecenia; [w nawiasach] zostaje do ręcznego wpisania.
 * Po rejestracji firmy podmień WYKONAWCA_DANE (nazwa, adres, NIP z CEIDG).
 *
 * Podstawa (stan sprawdzony 21.11.2026):
 * - ustawa o prawie autorskim i prawach pokrewnych, t.j. Dz.U. 2025 poz. 24: art. 16, 41, 43, 45, 46, 49 ust. 2,
 *   50, 52, 53, 67 ust. 5, 68, 74 ust. 4;
 * - ustawa o prawach konsumenta, t.j. Dz.U. 2024 poz. 1796: art. 7a, 7aa (art. 38a uchylony), 12 ust. 1,
 *   15 ust. 3, 21, 27, 28, 32, 34, 35, 36, 38 ust. 1 pkt 1 i 3, załączniki nr 1 i 2.
 * To wzory robocze, nie opinia radcy prawnego ani adwokata.
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

/** Pola eksploatacji: ta sama lista w umowie (zobowiązanie) i w umowie przeniesienia (rozporządzenie). */
const POLA_EKSPLOATACJI = `    1. w zakresie utrwalania i zwielokrotniania: wytwarzanie dowolną techniką egzemplarzy Dzieła, w tym techniką drukarską, reprograficzną, zapisu magnetycznego oraz techniką cyfrową, a także wprowadzanie do pamięci komputera i do sieci komputerowej;
    2. w zakresie obrotu oryginałem albo egzemplarzami, na których Dzieło utrwalono: wprowadzanie do obrotu, użyczenie lub najem oryginału albo egzemplarzy;
    3. w zakresie rozpowszechniania w inny sposób: publiczne wykonanie, wystawienie, wyświetlenie, odtworzenie oraz nadawanie i reemitowanie, a także publiczne udostępnianie Dzieła w taki sposób, aby każdy mógł mieć do niego dostęp w miejscu i w czasie przez siebie wybranym, w tym w internecie, aplikacjach i mediach społecznościowych;
    4. w ramach pól z pkt 1–3, w szczególności: umieszczanie Dzieła na materiałach firmowych, drukach, opakowaniach, towarach, odzieży, pojazdach, szyldach i nośnikach reklamy zewnętrznej oraz w reklamie i promocji w każdej formie;
    5. używanie Dzieła jako oznaczenia przedsiębiorstwa, znaku towarowego albo wzoru przemysłowego, w tym zgłaszanie go do ochrony w Urzędzie Patentowym RP, EUIPO i innych urzędach;
    6. jeżeli Dzieło obejmuje program komputerowy (np. kod strony internetowej): trwałe lub czasowe zwielokrotnianie programu w całości lub w części jakimikolwiek środkami i w jakiejkolwiek formie, jego tłumaczenie, przystosowywanie, zmiana układu i jakiekolwiek inne zmiany oraz rozpowszechnianie, w tym użyczenie lub najem programu albo jego kopii (art. 74 ust. 4 ustawy o prawie autorskim i prawach pokrewnych).`

export const LEGAL_TEMPLATES: LegalTemplate[] = [
    {
        slug: 'umowa',
        title: 'Umowa o wykonanie dzieła',
        when: 'Po akceptacji oferty, przed zaliczką.',
        sign: 'Mail z akceptacją PDF wystarczy do zawarcia umowy. Prawa autorskie NIE przechodzą tą umową: do tego służy dokument nr 3 z podpisem odręcznym albo kwalifikowanym.',
        body: `# Umowa o wykonanie dzieła nr {{NR}}

zawarta w dniu {{DATA}} [w Rzeszowie, przez podpisanie dwóch egzemplarzy / na odległość, przez przesłanie Zamawiającemu treści umowy w PDF i jej akceptację mailem przez Zamawiającego] pomiędzy:

**Wykonawcą:** {{WYKONAWCA}}, e-mail: kontakt@wuyo.pl, tel. 725 182 053,

a

**Zamawiającym:** {{ZAMAWIAJACY}}, e-mail: {{EMAIL}}.

**Zamawiający jest** (zaznaczyć jedno):
☐ przedsiębiorcą, dla którego umowa ma charakter zawodowy;
☐ konsumentem;
☐ osobą fizyczną prowadzącą działalność gospodarczą, dla której umowa nie ma charakteru zawodowego (art. 7aa ustawy o prawach konsumenta).

**Umowę zawarto** (zaznaczyć jedno): ☐ w lokalu przedsiębiorstwa Wykonawcy ☐ na odległość (mail, telefon) ☐ poza lokalem przedsiębiorstwa (np. u Zamawiającego).

## § 1. Przedmiot umowy

1. Wykonawca wykona dla Zamawiającego dzieło opisane w Załączniku nr 1 (dalej: Dzieło), a Zamawiający odbierze je i zapłaci wynagrodzenie.
2. Załącznik nr 1 określa zakres, liczbę koncepcji i rund poprawek, pliki do przekazania, elementy osób trzecich i ich licencje, cenę oraz harmonogram. Załącznik jest częścią umowy.
3. Wszystko, czego nie ma w Załączniku nr 1, jest pracą dodatkową wycenianą osobno po akceptacji Zamawiającego.

## § 2. Współpraca i materiały

1. Zamawiający przekaże materiały potrzebne do wykonania Dzieła (teksty, zdjęcia, logo, dane do strony) w terminie wskazanym w Załączniku nr 1.
2. Zamawiający oświadcza, że ma prawa do przekazanych materiałów, w tym zgody osób widocznych na zdjęciach, i że ich użycie w Dziele nie narusza praw osób trzecich. Za materiały Zamawiającego odpowiada Zamawiający.
3. Opóźnienie w przekazaniu materiałów albo w odpowiedzi na projekt przesuwa terminy Wykonawcy o tyle samo dni.
4. Strony kontaktują się mailem na adresy z nagłówka umowy. Uwagi, akceptacje projektu i zlecenia prac dodatkowych wysłane mailem z tych adresów są wiążące (forma dokumentowa). Nie dotyczy to przeniesienia autorskich praw majątkowych (§ 6 ust. 1).

## § 3. Projekt, poprawki i akceptacja

1. Wykonawca przedstawi projekt w formie podglądu (PDF, link, wizualizacja). Liczba koncepcji i rund poprawek jest określona w Załączniku nr 1.
2. Runda poprawek to jedna lista uwag przesłana w jednej wiadomości. Kolejne rundy oraz zmiany zakresu po akceptacji projektu są płatne według stawki 130 zł netto za godzinę, po uprzedniej akceptacji Zamawiającego mailem.
3. Akceptacja projektu do druku albo publikacji następuje mailem. Po akceptacji do druku Wykonawca nie odpowiada za błędy w treściach zatwierdzonych przez Zamawiającego (np. literówki w numerze telefonu).

## § 4. Wynagrodzenie i płatności

1. Wynagrodzenie wynosi {{KWOTA}}, zgodnie z Załącznikiem nr 1. Wariant VAT (zostawić jeden): [A: Wykonawca korzysta ze zwolnienia z VAT (art. 113 ust. 1 albo 9 ustawy o VAT); kwota wynagrodzenia jest kwotą do zapłaty i nie zawiera VAT.] [B: Do kwoty netto dolicza się VAT 23%; łączna kwota do zapłaty wynosi [KWOTA BRUTTO].] Wobec Zamawiającego, który nie zaznaczył w nagłówku pierwszego pola, umowa podaje łączną kwotę do zapłaty, z podatkami.
2. Zamawiający wpłaca zaliczkę w wysokości 50% wynagrodzenia ({{ZALICZKA}}) w terminie 7 dni od zawarcia umowy. Wykonawca rozpoczyna pracę po wpływie zaliczki, z zastrzeżeniem § 10 ust. 2.
3. Pozostałe 50% Zamawiający płaci po odbiorze Dzieła, w terminie 7 dni od otrzymania faktury albo rachunku, a przy druku i publikacji strony przed wydaniem wydruków albo przekazaniem dostępów.
4. Płatność przelewem na rachunek: [NR KONTA]. W razie opóźnienia Wykonawca może naliczyć odsetki ustawowe za opóźnienie.

## § 5. Odbiór

1. Po wykonaniu Dzieła Wykonawca przekazuje pliki, wydruki albo dostępy zgodnie z Załącznikiem nr 1. Odbiór potwierdza protokół odbioru albo mail Zamawiającego.
2. Zamawiający zgłasza zastrzeżenia w ciągu 7 dni od przekazania Dzieła, wskazując, co jest niezgodne z umową. Wykonawca usuwa niezgodności w rozsądnym terminie uzgodnionym mailem.
3. Jeżeli Zamawiający jest przedsiębiorcą, dla którego umowa ma charakter zawodowy, i nie zgłosi zastrzeżeń w terminie z ust. 2, Dzieło uważa się za odebrane bez zastrzeżeń.

## § 6. Prawa autorskie

1. Ta umowa nie przenosi autorskich praw majątkowych. Przeniesienie wymaga formy pisemnej pod rygorem nieważności (art. 53 ustawy o prawie autorskim i prawach pokrewnych), czyli podpisów własnoręcznych obu stron albo kwalifikowanych podpisów elektronicznych obu stron. Mail, skan i zwykły podpis elektroniczny tej formy nie spełniają.
2. Wykonawca zobowiązuje się przenieść na Zamawiającego autorskie prawa majątkowe do Dzieła, bez ograniczeń czasowych i terytorialnych, na polach eksploatacji z ust. 3, przez zawarcie umowy przeniesienia praw według wzoru „Protokół odbioru i umowa przeniesienia autorskich praw majątkowych”. Wykonawca przedstawi ją do podpisu przy odbiorze Dzieła. Prawa przechodzą z chwilą zapłaty całego wynagrodzenia, ale nie wcześniej niż z chwilą podpisania tej umowy przez obie strony.
3. Pola eksploatacji (art. 41 ust. 2 i art. 50 ustawy o prawie autorskim i prawach pokrewnych), znane w chwili zawarcia umowy, chyba że Załącznik nr 1 je zawęża:
${POLA_EKSPLOATACJI}
4. Wynagrodzenie z § 4 obejmuje przeniesienie praw i korzystanie z Dzieła na wszystkich polach z ust. 3; strony wyłączają odrębne wynagrodzenie za każde pole (art. 45 ustawy o prawie autorskim i prawach pokrewnych).
5. Do czasu przeniesienia praw Wykonawca udziela Zamawiającemu licencji niewyłącznej na korzystanie z projektów i Dzieła wyłącznie w celu ich oceny i akceptacji: wprowadzanie do pamięci komputera, wydruk próbny i wyświetlanie osobom uczestniczącym w decyzji. Inne korzystanie przed przeniesieniem praw wymaga zgody Wykonawcy mailem.
6. Przeniesienie nie obejmuje: a) koncepcji odrzuconych, szkiców i projektów niewybranych, które zostają przy Wykonawcy; b) narzędzi, szablonów i fragmentów kodu Wykonawcy, których używa w wielu projektach i które wskazano w Załączniku nr 1; do nich Wykonawca udziela licencji niewyłącznej opisanej w umowie przeniesienia praw; c) elementów osób trzecich z ust. 7; d) materiałów Zamawiającego.
7. Czcionki, zdjęcia i grafiki z banków obrazów, ikony, wtyczki, motywy, systemy CMS i biblioteki open source (elementy osób trzecich) pozostają przy ich twórcach. Wykonawca dobiera je na licencjach pozwalających na użycie komercyjne w zakresie z Załącznika nr 1, wymienia je w Załączniku nr 1 i wskazuje, gdzie są warunki licencji. Zamawiający korzysta z nich na tych warunkach. Jeżeli licencja musi być kupiona na Zamawiającego, koszt i sposób zakupu wskazuje Załącznik nr 1.
8. Elementy wygenerowane narzędziami sztucznej inteligencji bez twórczego wkładu człowieka mogą nie być utworem (art. 1 ust. 1 ustawy o prawie autorskim i prawach pokrewnych), więc mogą nie być objęte ochroną ani przeniesieniem praw. Wykonawca podaje w Załączniku nr 1, czy i do czego użył takich narzędzi.
9. Wykonawca oświadcza, że Dzieło, poza elementami z ust. 6 lit. c i d oraz ust. 8, będzie jego oryginalnym utworem i nie naruszy praw osób trzecich.
10. Wykonawca zachowuje autorskie prawa osobiste. Prawa te są niezbywalne i nie można się ich zrzec (art. 16 ustawy o prawie autorskim i prawach pokrewnych). Zgody Wykonawcy na określone zmiany Dzieła i sposób oznaczania autorstwa zawiera umowa przeniesienia praw.
11. Pliki źródłowe (otwarte pliki robocze) Wykonawca przekazuje tylko wtedy, gdy przewiduje to Załącznik nr 1.
12. Wykonawca może pokazać Dzieło w swoim portfolio, na stronie i w mediach społecznościowych po jego publikacji przez Zamawiającego, chyba że Zamawiający zastrzeże inaczej mailem. Po przeniesieniu praw podstawą jest licencja z umowy przeniesienia praw.

## § 7. Druk i strona internetowa (jeżeli dotyczy)

1. Druk wykonywany jest na podstawie pliku zaakceptowanego przez Zamawiającego. Dopuszczalne są różnice kolorów między ekranem a wydrukiem wynikające z technologii druku (CMYK) oraz różnice nakładu do 3%. Za brakujące egzemplarze wynagrodzenie za druk obniża się proporcjonalnie.
2. Domenę Wykonawca rejestruje na dane Zamawiającego. Koszt domeny i serwera za pierwszy rok jest wliczony w wynagrodzenie, jeżeli tak stanowi Załącznik nr 1. Po pierwszym roku Zamawiający opłaca je sam albo w ramach usługi Opieka Strony według odrębnego regulaminu.
3. Po odbiorze i zapłacie Wykonawca przekazuje Zamawiającemu dane dostępowe do panelu strony, domeny i serwera.

## § 8. Odpowiedzialność

1. Wobec Zamawiającego będącego przedsiębiorcą, dla którego umowa ma charakter zawodowy, odpowiedzialność Wykonawcy jest ograniczona do wysokości otrzymanego wynagrodzenia i nie obejmuje utraconych korzyści, a uprawnienia z rękojmi są wyłączone. Ograniczenie nie dotyczy szkody wyrządzonej umyślnie.
2. Wobec konsumenta i przedsiębiorcy z art. 7aa ustawy o prawach konsumenta Wykonawca odpowiada na zasadach przewidzianych w Kodeksie cywilnym i ustawie o prawach konsumenta; ust. 1 nie ma zastosowania.

## § 9. Rezygnacja i odstąpienie umowne

1. Niezależnie od § 10 Zamawiający może odstąpić od umowy w każdej chwili przed ukończeniem Dzieła. Zamiast zasady z art. 644 Kodeksu cywilnego strony ustalają, że Zamawiający płaci wtedy wynagrodzenie za część prac wykonaną do dnia odstąpienia, proporcjonalnie do wynagrodzenia z § 4. Kwotę tę rozlicza się z zaliczką: nadwyżkę Wykonawca zwraca w ciągu 14 dni, a brakującą część Zamawiający dopłaca w ciągu 7 dni od rozliczenia przesłanego mailem.
2. Wykonawca może odstąpić od umowy, jeżeli Zamawiający mimo wezwania mailem z wyznaczeniem co najmniej 14-dniowego terminu nie przekaże materiałów albo nie odpowie na projekt, a łączny czas oczekiwania przekroczy 30 dni. Rozliczenie następuje jak w ust. 1.

## § 10. Ustawowe prawo odstąpienia (konsument i przedsiębiorca z art. 7aa)

1. Ten paragraf stosuje się tylko wtedy, gdy Zamawiający zaznaczył w nagłówku drugie albo trzecie pole, a umowę zawarto na odległość albo poza lokalem przedsiębiorstwa Wykonawcy. Zamawiający może wtedy odstąpić od umowy w terminie 14 dni bez podania przyczyny, na zasadach z Informacji o prawie odstąpienia (Załącznik nr 2), którą otrzymał w PDF przed zawarciem umowy. W pozostałych przypadkach ustawowe prawo odstąpienia nie przysługuje.
2. Jeżeli Zamawiający nie złoży żądania z ust. 3, Wykonawca rozpocznie usługę projektową po upływie 14 dni od zawarcia umowy.
3. Zaznaczenie pól jest dobrowolne:
☐ Żądam, aby Wykonawca rozpoczął świadczenie usługi przed upływem 14-dniowego terminu do odstąpienia od umowy. Wiem, że jeżeli odstąpię od umowy po rozpoczęciu prac, zapłacę kwotę proporcjonalną do zakresu świadczeń spełnionych do chwili, w której poinformuję Wykonawcę o odstąpieniu (art. 35 ustawy o prawach konsumenta).
☐ Przyjmuję do wiadomości, że utracę prawo odstąpienia od umowy z chwilą pełnego wykonania usługi przez Wykonawcę (art. 38 ust. 1 pkt 1 ustawy o prawach konsumenta).
4. Przy umowie zawieranej na odległość żądanie składa się w mailu z akceptacją umowy, np. „Zaznaczam oba pola z § 10 ust. 3”. Przy umowie zawieranej poza lokalem przedsiębiorstwa żądanie musi być złożone na trwałym nośniku: na podpisanym egzemplarzu albo mailem (art. 15 ust. 3 i art. 21 ust. 2 ustawy o prawach konsumenta).
5. Usługa projektowa (projekt, pliki, strona internetowa) i wykonanie towarów według projektu (wydruki, odzież, gadżety) to odrębne świadczenia. Wyjątek z art. 38 ust. 1 pkt 3 ustawy o prawach konsumenta dotyczy tylko towaru nieprefabrykowanego, wyprodukowanego według specyfikacji Zamawiającego lub służącego zaspokojeniu jego zindywidualizowanych potrzeb, np. wizytówek z jego danymi. Nie wyłącza prawa odstąpienia od usługi projektowej. Wykonawca zleca produkcję takich towarów dopiero po akceptacji projektu do druku.
6. Wykonawca potwierdza zawarcie umowy, przesyłając Zamawiającemu mailem PDF umowy z załącznikami przed rozpoczęciem świadczenia usługi (art. 15 ust. 1 i art. 21 ust. 1 ustawy o prawach konsumenta).

## § 11. Dane osobowe

Wykonawca przetwarza dane Zamawiającego w celu wykonania umowy i rozliczeń zgodnie z Klauzulą informacyjną RODO, którą Zamawiający otrzymał przed zawarciem umowy. Jeżeli Wykonawca przy wykonaniu Dzieła przetwarza dane klientów Zamawiającego (np. formularz kontaktowy, hosting), strony zawierają umowę powierzenia.

## § 12. Postanowienia końcowe

1. W sprawach nieuregulowanych stosuje się Kodeks cywilny i ustawę o prawie autorskim i prawach pokrewnych, a wobec konsumenta i przedsiębiorcy z art. 7aa także ustawę o prawach konsumenta.
2. Zmiany umowy wymagają formy dokumentowej (mail). Przeniesienie autorskich praw majątkowych i udzielenie licencji wyłącznej wymagają formy pisemnej pod rygorem nieważności (art. 53 i art. 67 ust. 5 ustawy o prawie autorskim i prawach pokrewnych).
3. Spory z przedsiębiorcą, dla którego umowa ma charakter zawodowy, rozstrzyga sąd właściwy dla siedziby Wykonawcy. W pozostałych przypadkach sąd właściwy według przepisów ogólnych. Konsument może też skorzystać z pozasądowych sposobów rozpatrywania sporu, np. pomocy rzecznika konsumentów albo wojewódzkiego inspektora Inspekcji Handlowej.
4. Umowę zawarto [w dwóch jednobrzmiących egzemplarzach / przez akceptację mailem treści przesłanej w PDF].

Załączniki: 1. Zakres, cena i harmonogram. 2. Informacja o prawie odstąpienia z formularzem (tylko w przypadku z § 10 ust. 1). 3. Klauzula informacyjna RODO. Wzór do podpisu przy odbiorze: Protokół odbioru i umowa przeniesienia autorskich praw majątkowych.

| Wykonawca | Zamawiający |
| --- | --- |
| ........................................ | ........................................ |`,
    },
    {
        slug: 'zalacznik',
        title: 'Załącznik nr 1: zakres i cena',
        when: 'Razem z umową, przepisany z oferty.',
        sign: 'Jak umowa (mail z akceptacją PDF albo podpisy).',
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
| Pola eksploatacji | wszystkie z § 6 ust. 3 umowy [albo: tylko pkt ...] |
| Elementy osób trzecich i ich licencje | [np. czcionka X: licencja SIL OFL; zdjęcie Y: licencja standardowa banku Z; wtyczka W: GPL] albo brak |
| Licencje do kupienia na Zamawiającego | [co, gdzie, koszt] albo brak |
| Narzędzia i kod Wykonawcy używane w wielu projektach (licencja zamiast przeniesienia) | [np. szablon i komponenty kodu strony] albo nie dotyczy |
| Narzędzia sztucznej inteligencji | [nie użyto / użyto do: ...] |
| Materiały od Zamawiającego | [teksty, zdjęcia, dane] do dnia [DATA] |
| Wariant VAT | [A: zwolnienie z VAT, kwota bez VAT / B: netto + 23% VAT] |
| Wynagrodzenie | {{KWOTA}} [netto / brutto / bez VAT], łącznie do zapłaty: [KWOTA], zaliczka 50%: {{ZALICZKA}} |
| Termin pierwszego projektu | [liczba dni roboczych od zaliczki i materiałów; u konsumenta bez żądania z § 10 ust. 3 liczony od upływu 14 dni od zawarcia umowy] |
| Termin oddania | [DATA albo liczba dni roboczych od akceptacji projektu] |
| Dane do faktury albo rachunku Zamawiającego | {{ZAMAWIAJACY}} |

Prace dodatkowe: 130 zł netto za godzinę, po akceptacji Zamawiającego mailem.`,
    },
    {
        slug: 'protokol',
        title: 'Protokół odbioru + umowa przeniesienia praw',
        when: 'Przy oddaniu Dzieła, najlepiej po pełnej zapłacie.',
        sign: 'Tylko odręcznie (2 egzemplarze papierowe) albo kwalifikowanym podpisem elektronicznym obu stron. Mail, skan i zwykły podpis w aplikacji NIE przenoszą praw.',
        body: `# Protokół odbioru dzieła i umowa przeniesienia autorskich praw majątkowych

Sporządzony i zawarty w dniu {{DATA}} [w Rzeszowie / przez złożenie kwalifikowanych podpisów elektronicznych] do umowy nr {{NR}} pomiędzy {{WYKONAWCA}} (Wykonawca) a {{ZAMAWIAJACY}} (Zamawiający).

## 1. Odbiór

1. Zamawiający odbiera Dzieło: {{DZIELO}}.
2. Przekazane pliki, wydruki albo dostępy: [lista, np. logo SVG/PDF/PNG, mini księga PDF, 150 wizytówek, dostęp do panelu strony i domeny].
3. ☐ Dzieło odebrane bez zastrzeżeń. ☐ Dzieło odebrane z zastrzeżeniami: [opis i termin poprawy].

## 2. Rozliczenie

☐ Wynagrodzenie {{KWOTA}} zostało zapłacone w całości (zaliczka {{ZALICZKA}} w dniu [DATA], reszta w dniu [DATA]).
☐ Do zapłaty pozostaje [KWOTA] w terminie do [DATA].

## 3. Przeniesienie autorskich praw majątkowych

1. Wykonawca przenosi na Zamawiającego autorskie prawa majątkowe do Dzieła opisanego w pkt 1 [oraz do: ...], bez ograniczeń czasowych i terytorialnych, na następujących polach eksploatacji znanych w chwili zawarcia tej umowy (art. 41 ust. 2 i 4 oraz art. 50 ustawy o prawie autorskim i prawach pokrewnych):
${POLA_EKSPLOATACJI}
2. Prawa przechodzą z chwilą podpisania tej umowy przez obie strony, a jeżeli wynagrodzenie nie zostało jeszcze zapłacone w całości, z chwilą zapłaty całości. Z tą samą chwilą Zamawiający nabywa własność przekazanych nośników i wydruków, jeżeli nie nabył jej wcześniej.
3. Wynagrodzenie z umowy obejmuje przeniesienie praw i korzystanie z Dzieła na wszystkich polach z ust. 1; odrębne wynagrodzenie za każde pole jest wyłączone (art. 45 ustawy o prawie autorskim i prawach pokrewnych).
4. Wykonawca przenosi na Zamawiającego wyłączne prawo zezwalania na wykonywanie zależnego prawa autorskiego do opracowań Dzieła na polach z ust. 1 (art. 2 ust. 2 i art. 46 ustawy o prawie autorskim i prawach pokrewnych).
5. Przeniesienie nie obejmuje: a) koncepcji odrzuconych, szkiców i projektów niewybranych; b) elementów osób trzecich wymienionych w Załączniku nr 1 do umowy [albo: ...], z których Zamawiający korzysta na warunkach ich licencji; c) materiałów Zamawiającego; d) elementów wygenerowanych narzędziami sztucznej inteligencji bez twórczego wkładu człowieka, wskazanych w Załączniku nr 1 do umowy.
6. [Jeżeli dotyczy:] Do narzędzi, szablonów i fragmentów kodu Wykonawcy wskazanych w Załączniku nr 1 do umowy Wykonawca udziela Zamawiającemu licencji niewyłącznej, bez ograniczeń terytorialnych, w zakresie potrzebnym do korzystania z Dzieła na polach z ust. 1, w ramach wynagrodzenia z umowy, na czas nieoznaczony. Wykonawca może ją wypowiedzieć tylko z ważnych powodów leżących po stronie Zamawiającego, z zachowaniem rocznego okresu wypowiedzenia na koniec roku kalendarzowego (art. 68 ust. 1 ustawy o prawie autorskim i prawach pokrewnych).
7. Wykonawca oświadcza, że w zakresie z ust. 1 przysługują mu autorskie prawa majątkowe do Dzieła, nieobciążone prawami osób trzecich.

## 4. Autorskie prawa osobiste i zgody

1. Wykonawca zachowuje autorskie prawa osobiste do Dzieła (art. 16 ustawy o prawie autorskim i prawach pokrewnych). Ta umowa nie jest ich zrzeczeniem się ani zbyciem.
2. Wykonawca wyraża zgodę (art. 49 ust. 2 ustawy o prawie autorskim i prawach pokrewnych) na następujące zmiany Dzieła dokonywane przez Zamawiającego lub na jego zlecenie: zmianę wielkości z zachowaniem proporcji, przygotowanie wersji jednobarwnych, odwróconych i dostosowanych do technologii druku lub ekranu, kadrowanie i dopasowanie do formatów nośników, łączenie Dzieła z innymi elementami (teksty, zdjęcia, hasła) oraz aktualizację treści (dane kontaktowe, ceny, teksty, podstrony) [oraz: ...].
3. Wykonawca wyraża zgodę na to, by Zamawiający decydował o pierwszym udostępnieniu Dzieła publiczności i rozpowszechniał Dzieło bez oznaczania autorstwa, zgodnie ze zwyczajem przyjętym dla tego rodzaju utworów.
4. Zmiany wykraczające poza ust. 2 wymagają odrębnej zgody Wykonawcy wyrażonej mailem.

## 5. Portfolio

☐ Zamawiający udziela Wykonawcy nieodpłatnej licencji niewyłącznej na zwielokrotnianie i publiczne udostępnianie Dzieła w portfolio Wykonawcy (strona internetowa, media społecznościowe, prezentacje ofert), bez ograniczeń terytorialnych, po publikacji Dzieła przez Zamawiającego. ☐ Zamawiający nie wyraża zgody.

## 6. Forma

Umowa przeniesienia autorskich praw majątkowych wymaga formy pisemnej pod rygorem nieważności (art. 53 ustawy o prawie autorskim i prawach pokrewnych). Dokument podpisano własnoręcznie w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej strony, albo kwalifikowanymi podpisami elektronicznymi obu stron.

| Wykonawca | Zamawiający |
| --- | --- |
| ........................................ | ........................................ |`,
    },
    {
        slug: 'odstapienie',
        title: 'Informacja o odstąpieniu + formularz',
        when: 'Przed zawarciem umowy na odległość albo poza lokalem z konsumentem albo JDG bez charakteru zawodowego (art. 7aa).',
        sign: 'Nie podpisuje się. PDF mailem przed zawarciem umowy (trwały nośnik).',
        body: `# Informacja o prawie odstąpienia od umowy

Załącznik nr 2 do umowy nr {{NR}}

**Kiedy przysługuje.** Prawo odstąpienia przysługuje, jeżeli są Państwo konsumentem albo osobą fizyczną prowadzącą działalność gospodarczą, dla której umowa nie ma charakteru zawodowego (art. 7aa ustawy o prawach konsumenta), a umowę zawieramy na odległość (np. mailem) albo poza lokalem naszego przedsiębiorstwa. Nie przysługuje przy umowie zawartej w lokalu przedsiębiorstwa ani przedsiębiorcy, dla którego umowa ma charakter zawodowy.

**Prawo odstąpienia od umowy.** Mają Państwo prawo odstąpić od niniejszej umowy w terminie 14 dni bez podania jakiejkolwiek przyczyny. Termin do odstąpienia od umowy wygasa po upływie 14 dni od dnia zawarcia umowy. [Jeżeli umowa obejmuje także towar, który nie jest wykonywany według Państwa specyfikacji: w odniesieniu do tego towaru termin wygasa po upływie 14 dni od dnia, w którym weszli Państwo w posiadanie towaru lub w którym osoba trzecia inna niż przewoźnik i wskazana przez Państwa weszła w posiadanie towaru.]

Aby skorzystać z prawa odstąpienia od umowy, muszą Państwo poinformować nas: {{WYKONAWCA}}, e-mail kontakt@wuyo.pl, tel. 725 182 053, o swojej decyzji o odstąpieniu od niniejszej umowy w drodze jednoznacznego oświadczenia (na przykład pismo wysłane pocztą lub pocztą elektroniczną). Mogą Państwo skorzystać z wzoru formularza odstąpienia od umowy, jednak nie jest to obowiązkowe. Aby zachować termin do odstąpienia od umowy, wystarczy, aby wysłali Państwo informację dotyczącą wykonania przysługującego Państwu prawa odstąpienia od umowy przed upływem terminu do odstąpienia od umowy.

**Skutki odstąpienia od umowy.** W przypadku odstąpienia od niniejszej umowy zwracamy Państwu wszystkie otrzymane od Państwa płatności, w tym koszty dostarczenia towaru (z wyjątkiem dodatkowych kosztów wynikających z wybranego przez Państwa sposobu dostarczenia innego niż najtańszy zwykły sposób dostarczenia oferowany przez nas), niezwłocznie, a w każdym przypadku nie później niż 14 dni od dnia, w którym zostaliśmy poinformowani o Państwa decyzji o wykonaniu prawa odstąpienia od niniejszej umowy. Zwrotu płatności dokonamy przy użyciu takich samych sposobów płatności, jakie zostały przez Państwa użyte w pierwotnej transakcji, chyba że wyraźnie zgodziliście się Państwo na inne rozwiązanie; w każdym przypadku nie poniosą Państwo żadnych opłat w związku z tym zwrotem.

Jeżeli zażądali Państwo rozpoczęcia świadczenia usług przed upływem terminu do odstąpienia od umowy, zapłacą nam Państwo kwotę proporcjonalną do zakresu świadczeń spełnionych do chwili, w której poinformowali nas Państwo o odstąpieniu od niniejszej umowy. Kwotę oblicza się od wynagrodzenia z umowy, a jeżeli byłoby ono nadmierne, od wartości rynkowej wykonanych prac (art. 35 ustawy o prawach konsumenta). Jeżeli takiego żądania Państwo nie złożyli, nie płacą Państwo za usługi wykonane do chwili odstąpienia (art. 36 pkt 1 ustawy o prawach konsumenta).

[Jeżeli umowa obejmuje towar, który można zwrócić: Proszę odesłać lub przekazać nam towar na adres podany wyżej niezwłocznie, a w każdym razie nie później niż 14 dni od dnia, w którym poinformowali nas Państwo o odstąpieniu od niniejszej umowy. Termin jest zachowany, jeżeli odeślą Państwo towar przed upływem terminu 14 dni. Będą Państwo musieli ponieść bezpośrednie koszty zwrotu towaru. Możemy wstrzymać się ze zwrotem płatności do czasu otrzymania towaru lub do czasu dostarczenia nam dowodu jego odesłania, w zależności od tego, które zdarzenie nastąpi wcześniej. Odpowiadają Państwo tylko za zmniejszenie wartości towaru wynikające z korzystania z niego w sposób inny niż było to konieczne do stwierdzenia charakteru, cech i funkcjonowania towaru.]

**Kiedy prawo odstąpienia nie przysługuje albo wygasa** (art. 38 ust. 1 ustawy o prawach konsumenta):

- przy usłudze, jeżeli wykonaliśmy ją w pełni za Państwa wyraźną i uprzednią zgodą, a przed rozpoczęciem świadczenia zostali Państwo poinformowani, że po jej pełnym wykonaniu utracą Państwo prawo odstąpienia od umowy, i przyjęli to Państwo do wiadomości (pkt 1);
- co do towaru nieprefabrykowanego, wyprodukowanego według Państwa specyfikacji lub służącego zaspokojeniu Państwa zindywidualizowanych potrzeb, np. wizytówek, ulotek i odzieży wydrukowanych według zaakceptowanego projektu (pkt 3).

Wyjątek z pkt 3 dotyczy wyłącznie takich towarów. Nie obejmuje samej usługi projektowej: od usługi projektowej mogą Państwo odstąpić na zasadach opisanych wyżej, także gdy projekt jest przygotowywany indywidualnie dla Państwa.

## Wzór formularza odstąpienia od umowy

(formularz ten należy wypełnić i odesłać tylko w przypadku chęci odstąpienia od umowy)

Adresat: {{WYKONAWCA}}, e-mail: kontakt@wuyo.pl

Ja/My(\\*) niniejszym informuję/informujemy(\\*) o moim/naszym odstąpieniu od umowy sprzedaży następujących towarów(\\*) umowy dostawy następujących towarów(\\*) umowy o dzieło polegającej na wykonaniu następujących towarów(\\*)/o świadczenie następującej usługi(\\*): ........................................

- Data zawarcia umowy(\\*)/odbioru(\\*): ....................
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
    - wystawienie faktur albo rachunków i prowadzenie księgowości (art. 6 ust. 1 lit. c RODO w zw. z przepisami podatkowymi i o rachunkowości),
    - dochodzenie i obrona roszczeń oraz kontakt w sprawach związanych ze współpracą (art. 6 ust. 1 lit. f RODO, uzasadniony interes administratora).
3. **Odbiorcy danych:** biuro rachunkowe, bank, dostawcy poczty e-mail i serwerów (np. Google, Vercel, Supabase), drukarnie i firmy kurierskie, gdy realizują Państwa zamówienie, oraz organy uprawnione na podstawie przepisów.
4. **Przekazywanie poza Europejski Obszar Gospodarczy:** część dostawców usług IT ma siedzibę w USA. Dane są przekazywane na podstawie decyzji Komisji Europejskiej (EU-US Data Privacy Framework) albo standardowych klauzul umownych.
5. **Okres przechowywania:** przez czas współpracy, a potem do upływu terminu przedawnienia roszczeń. Dokumenty księgowe przechowujemy do upływu terminu przedawnienia zobowiązania podatkowego, co do zasady 5 lat od końca roku kalendarzowego, w którym upłynął termin płatności podatku. Dane z zapytań, które nie zakończyły się umową, usuwamy po 12 miesiącach.
6. **Państwa prawa:** dostęp do danych, sprostowanie, usunięcie, ograniczenie przetwarzania, przeniesienie danych, sprzeciw wobec przetwarzania na podstawie uzasadnionego interesu oraz skarga do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).
7. **Dobrowolność:** podanie danych jest dobrowolne, ale bez nich nie przygotuję oferty ani nie zawrę umowy. Dane nie służą do zautomatyzowanego podejmowania decyzji ani profilowania.`,
    },
    {
        slug: 'powierzenie',
        title: 'Umowa powierzenia danych',
        when: 'Strona z formularzem, hosting, Opieka Strony.',
        sign: 'Akceptacja PDF mailem (art. 28 ust. 9 RODO dopuszcza formę elektroniczną).',
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

1. przetwarza dane wyłącznie na udokumentowane polecenie Administratora, także w zakresie przekazywania danych do państwa trzeciego; umowa i zgłoszenia mailowe są takim poleceniem; jeżeli polecenie jego zdaniem narusza przepisy o ochronie danych, niezwłocznie informuje o tym Administratora;
2. zapewnia, że osoby dopuszczone do danych zobowiązały się do zachowania poufności;
3. stosuje środki bezpieczeństwa z art. 32 RODO, w tym szyfrowane połączenie (SSL), silne hasła z uwierzytelnianiem dwuskładnikowym, kopie zapasowe i aktualizacje;
4. może korzystać z dalszych podmiotów przetwarzających (dostawcy serwerów i poczty, np. [Vercel / Supabase / Google / hosting]); Administrator wyraża na to ogólną zgodę, a Podmiot przetwarzający informuje mailem o zmianie dostawcy z 14-dniowym wyprzedzeniem, w którym Administrator może zgłosić sprzeciw; na dalszy podmiot nakłada te same obowiązki ochrony danych i odpowiada za jego działania wobec Administratora (art. 28 ust. 4 RODO);
5. pomaga Administratorowi odpowiadać na żądania osób, których dane dotyczą, oraz wywiązywać się z obowiązków z art. 32–36 RODO;
6. zgłasza Administratorowi naruszenie ochrony danych bez zbędnej zwłoki, nie później niż w ciągu 24 godzin od jego wykrycia;
7. po zakończeniu usługi zwraca dane albo je usuwa, według wyboru Administratora, i usuwa kopie, chyba że prawo nakazuje ich przechowywanie;
8. udostępnia informacje potrzebne do wykazania zgodności z RODO i umożliwia audyt po uprzedzeniu z 14-dniowym wyprzedzeniem, na koszt Administratora.

## § 3. Postanowienia końcowe

1. Odpowiedzialność Podmiotu przetwarzającego wobec Administratora będącego przedsiębiorcą jest ograniczona do wynagrodzenia za ostatnie 12 miesięcy usługi, z wyjątkiem szkody wyrządzonej umyślnie. Ograniczenie nie dotyczy odpowiedzialności wobec osób, których dane dotyczą (art. 82 RODO).
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
2. Usługę świadczy się w pakietach (ceny miesięcznie, [netto + 23% VAT / bez VAT: zwolnienie z VAT]; konsumentowi i przedsiębiorcy z art. 7aa ustawy o prawach konsumenta podaje się łączną cenę do zapłaty):

| Pakiet | Cena | Zakres |
| --- | --- | --- |
| Opieka Strony | 199 zł | serwer, przedłużanie domeny, kopie zapasowe, aktualizacje i zabezpieczenia, 1 godzina zmian w miesiącu |
| Widoczność i Opieka | 690 zł | Opieka Strony + prowadzenie wizytówki Google, obsługa opinii, 5–6 grafik w miesiącu, miesięczny raport |
| Stały Opiekun | 1 290 zł | Widoczność i Opieka + bieżąca grafika i media społecznościowe, pierwszeństwo w kolejce |

3. Niewykorzystane godziny zmian nie przechodzą na kolejny miesiąc. Prace ponad limit wycenia się po 130 zł netto za godzinę, po akceptacji klienta mailem.

## § 2. Zawarcie umowy i płatności

1. Umowa zostaje zawarta z chwilą akceptacji regulaminu i pakietu mailem, na czas nieokreślony.
2. Opłata jest płatna z góry do 10. dnia każdego miesiąca na podstawie faktury albo rachunku. Przy opóźnieniu ponad 30 dni Usługodawca może po wezwaniu mailem wstrzymać prace inne niż utrzymanie strony w sieci.
3. Zmiana cen wymaga powiadomienia mailem z 30-dniowym wyprzedzeniem. Klient może wtedy wypowiedzieć umowę ze skutkiem na dzień zmiany.

## § 3. Zgłoszenia i czas reakcji

1. Zgłoszenia przyjmowane są mailem albo telefonicznie w dni robocze w godzinach 8:00–16:00.
2. Awaria uniemożliwiająca działanie strony: reakcja do [4] godzin roboczych. Zmiany treści: realizacja do [3] dni roboczych.
3. Usługodawca nie odpowiada za przerwy wynikające z awarii dostawców serwerów i domen, zmian wprowadzonych przez klienta albo osoby trzecie oraz siły wyższej, ale w takich przypadkach przywraca działanie strony z kopii zapasowej.

## § 4. Dane i dostępy

1. Domena jest zarejestrowana na dane klienta. Na życzenie klienta Usługodawca przekazuje wszystkie dane dostępowe.
2. Jeżeli strona przetwarza dane osób trzecich, strony zawierają umowę powierzenia przetwarzania danych.

## § 5. Wypowiedzenie i odstąpienie

1. Każda ze stron może wypowiedzieć umowę z miesięcznym okresem wypowiedzenia, ze skutkiem na koniec miesiąca kalendarzowego, mailem.
2. Po zakończeniu umowy Usługodawca w ciągu 14 dni przekazuje dostępy i pełną kopię strony albo przenosi ją do wskazanego dostawcy.
3. Konsumentowi i przedsiębiorcy z art. 7aa ustawy o prawach konsumenta, który zawiera umowę na odległość albo poza lokalem przedsiębiorstwa, przysługuje prawo odstąpienia w terminie 14 dni od zawarcia umowy, bez podania przyczyny, na zasadach z Informacji o prawie odstąpienia przekazanej przed zawarciem umowy.
4. W tym terminie Usługodawca rozpoczyna świadczenie usługi tylko na wyraźne żądanie klienta złożone mailem. Jeżeli klient złoży takie żądanie i odstąpi od umowy, płaci kwotę proporcjonalną do zakresu usługi wykonanej do chwili poinformowania Usługodawcy o odstąpieniu (art. 35 ustawy o prawach konsumenta).

## § 6. Reklamacje

Reklamacje rozpatrywane są w ciągu 14 dni od ich otrzymania mailem. Odpowiedź na reklamację konsumenta Usługodawca przekazuje na papierze albo mailem; brak odpowiedzi w tym terminie oznacza uznanie reklamacji (art. 7a ustawy o prawach konsumenta).`,
    },
]

export function fillTemplate(body: string, f: LegalFields): string {
    return body.replace(/\{\{(\w+)\}\}/g, (m, k: string) => (f as Record<string, string>)[k] ?? m)
}
