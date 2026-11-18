/**
 * Baza wiedzy doradcy z Telegrama.
 *
 * Każda sekcja ma datę sprawdzenia i źródło. W treści:
 *   [PEWNE]          = potwierdzone w źródle w dniu `sprawdzono`
 *   [DO POTWIERDZENIA] = prawdopodobne, ale bez potwierdzenia w przepisie albo umowie
 * Bot ma te oznaczenia przekazywać dalej, a nie udawać pewność.
 *
 * Zmiana przepisów = zmiana tutaj (i nowa data). Bot nie ma innego źródła liczb.
 */

export type Wiedza = { id: string; tytul: string; sprawdzono: string; zrodlo: string; tresc: string }

export const WIEDZA: Wiedza[] = [
    {
        id: 'sytuacja',
        tytul: 'Sytuacja Mateusza i WUYO',
        sprawdzono: '2026-11-17',
        zrodlo: 'ustalenia z Mateuszem',
        tresc: `
- WUYO: jednoosobowe studio graficzne z Rzeszowa (logo, druk, strony www, nadruki DTF). Cel: 7000 zł przychodu miesięcznie.
- Stan na 17.11.2026: firma NIE jest jeszcze w CEIDG. Mateusz działa jako działalność nierejestrowana, część zleceń przez Useme.
- Dotacja z PUP Rzeszów na podjęcie działalności: przyznana. Rejestracja firmy planowana na grudzień 2026.
- Wstępny plan Mateusza: skala podatkowa, KPiR, zwolnienie z VAT, księgowość przez inFakt albo podobny serwis. Sam mówi, że się na tym nie zna i chce być prowadzony.
- Treści umowy z PUP jeszcze nie znasz. Dopóki Mateusz nie poda jej punktów (terminy, zabezpieczenie, lista wydatków), przy każdym pytaniu o dotację proś o konkretny zapis z umowy.
- Mateusz nie zostawia komputera na noc i nie lubi list 10 zadań. Jedna rzecz naraz.`,
    },
    {
        id: 'dotacja',
        tytul: 'Dotacja z PUP Rzeszów (rezerwa Funduszu Pracy)',
        sprawdzono: '2026-11-17',
        zrodlo: 'ogłoszenie naboru rzeszow.praca.gov.pl (nabór 30.10.2026); ustawa z 20.03.2025 o rynku pracy i służbach zatrudnienia',
        tresc: `
[PEWNE] z ogłoszenia PUP Rzeszów:
- Program: aktywizacja bezrobotnych zamieszkujących na wsi. Kwota około 30 000 zł, limit 9 osób.
- Urząd ocenia zakupy pod kątem celowości i może nie uznać wydatku albo obniżyć kwotę za sprzęt droższy niż typowy.
- Obowiązuje „Regulamin w sprawie dofinansowania podjęcia działalności gospodarczej” PUP Rzeszów i umowa ze starostą z zabezpieczeniem.
- Ogłoszenie wspomina okres 5 lat przy rozliczeniu i zwrocie równowartości VAT (przedawnienie, art. 70 § 1 Ordynacji podatkowej).

[DO POTWIERDZENIA] w umowie i regulaminie (typowe warunki takich dotacji, w tej umowie mogą być inne):
- Minimalny okres prowadzenia firmy (zwykle 12 miesięcy) i zasady zawieszenia.
- Data, od której wolno zarejestrować firmę. Zwykle NIE wolno wpisać się do CEIDG przed podpisaniem umowy i terminem z umowy. Rejestracja za wcześnie = utrata dotacji.
- Data, od której wolno kupować. Zakup przed tą datą zwykle nie jest uznawany.
- Termin wydania pieniędzy i termin złożenia rozliczenia z fakturami.
- Zmiana listy zakupów tylko za pisemną zgodą urzędu, przed zakupem.
- Zakaz sprzedaży kupionego sprzętu w okresie umowy.
- Status bezrobotnego do dnia rejestracji firmy: przychód ponad połowę minimalnego wynagrodzenia w miesiącu może go odebrać. Uwaga na Useme i sprzedaż nierejestrowaną przed startem.

Podatki przy dotacji [DO POTWIERDZENIA z księgową]:
- Dotacja z Funduszu Pracy jest zwolniona z PIT (art. 21 ust. 1 pkt 121 ustawy o PIT).
- Wydatków opłaconych dotacją nie wpisuje się w koszty (art. 23 ust. 1 pkt 56 ustawy o PIT). Częsty błąd początkujących.
- Zwolniony z VAT nie odlicza VAT, więc nic nie zwraca. Jeśli Mateusz zostanie VAT-owcem i odliczy VAT od zakupów z dotacji, równowartość odliczenia zwraca urzędowi.

Zasada: przy dotacji każdy błąd może oznaczać zwrot całości z odsetkami. Wątpliwość = pytanie na piśmie do opiekuna w PUP, przed działaniem.`,
    },
    {
        id: 'nierejestrowana',
        tytul: 'Działalność nierejestrowana (stan do rejestracji)',
        sprawdzono: '2026-11-17',
        zrodlo: 'art. 5 Prawa przedsiębiorców; ustalenie z 30.10.2026',
        tresc: `
- [PEWNE] Limit od 1.01.2026 liczony kwartalnie: 10 813,50 zł przychodu na kwartał (225% minimalnego wynagrodzenia 4806 zł).
- Przekroczenie limitu = działalność gospodarcza od dnia przekroczenia i 7 dni na wniosek do CEIDG.
- Kruczek przy dotacji: przekroczenie limitu przed terminem z umowy PUP wymusiłoby rejestrację za wcześnie. Pilnuj sumy kwartału do dnia startu.
- Przychód z działalności nierejestrowanej rozlicza się w PIT-36 na skali.
- Do rejestracji nie podpisywać umów o dzieło z firmami (ustalenie z 30.10.2026).`,
    },
    {
        id: 'rejestracja',
        tytul: 'Rejestracja firmy w CEIDG i ZUS na start',
        sprawdzono: '2026-11-17',
        zrodlo: 'Prawo przedsiębiorców, ustawa o systemie ubezpieczeń społecznych (wiedza ogólna, kwoty niesprawdzone)',
        tresc: `
- Wniosek CEIDG-1: bezpłatny, przez biznes.gov.pl z profilem zaufanym. W jednym wniosku: data startu, kody PKD, forma opodatkowania, zgłoszenie do ZUS.
- Zwolnienie z VAT z limitu obrotu nie wymaga zgłoszenia VAT-R.
- Osobne konto bankowe: przy JDG nieobowiązkowe, ale ułatwia księgowość i rozliczenie dotacji.
- Ulga na start: 6 pełnych miesięcy kalendarzowych bez składek społecznych, płacisz tylko zdrowotną. Start innego dnia niż pierwszy dzień miesiąca daje dodatkowy niepełny miesiąc ulgi. Data startu musi jednak zgadzać się z umową PUP.
- Koszt ulgi na start: brak chorobowego i brak okresu składkowego do emerytury za te miesiące.
- Po uldze: 24 miesiące składek preferencyjnych (od 30% minimalnego wynagrodzenia), potem ewentualnie Mały ZUS Plus.
- Ulga na start i preferencyjny ZUS nie działają, gdy robisz dla byłego pracodawcy to samo, co na etacie w tym albo poprzednim roku.
- [DO POTWIERDZENIA] Kwot składek nie podawaj z pamięci. Odsyłaj do kalkulatora na zus.pl albo proś o aktualizację bazy.`,
    },
    {
        id: 'podatki',
        tytul: 'Forma opodatkowania: skala czy ryczałt',
        sprawdzono: '2026-11-17',
        zrodlo: 'ustawa o PIT, ustawa o zryczałtowanym podatku dochodowym; infakt.pl (składka zdrowotna 2026)',
        tresc: `
Skala podatkowa:
- 12% do 120 000 zł dochodu, 32% powyżej. Kwota wolna 30 000 zł. Koszty obniżają podatek. Można rozliczać się z małżonkiem.
- Składka zdrowotna 9% dochodu, nie mniej niż składka minimalna.

Ryczałt (podatek od przychodu, bez kosztów, bez kwoty wolnej):
- [PEWNE] strony internetowe i programowanie (PKWiU 62.01): 12%.
- [DO POTWIERDZENIA] projektowanie graficzne (PKWiU 74.1): źródła podają różnie, 14% albo 15%. Sprawdzić w art. 12 ustawy o ryczałcie albo w interpretacji KIS.
- [DO POTWIERDZENIA] usługi druku i nadruków: 8,5%, sprzedaż towarów: 3%.
- [PEWNE] składka zdrowotna na ryczałcie w 2026: 498,35 zł miesięcznie przy przychodzie do 60 000 zł rocznie, 830,58 zł do 300 000 zł, 1495,04 zł powyżej.

Wybór i zmiana:
- Formę wybiera się we wniosku CEIDG. Zmiana na kolejny rok: do 20. dnia miesiąca po miesiącu, w którym był pierwszy przychód w tym roku.

Wstępna ocena dla WUYO (do przeliczenia na prawdziwych liczbach):
- Start w grudniu 2026 na skali ma sens: kwota wolna, proste zasady, przychody z działalności nierejestrowanej i tak idą na skalę.
- Przy 7000 zł przychodu miesięcznie i małych kosztach skala wychodzi zwykle taniej niż ryczałt 12-15%. Ryczałt zaczyna wygrywać przy wyższych przychodach albo dużym udziale druku (8,5%).
- Decyzję na 2027 podjąć w styczniu 2027 z księgową, na liczbach z grudnia.`,
    },
    {
        id: 'vat',
        tytul: 'VAT: zwolnienie i pułapki',
        sprawdzono: '2026-11-17',
        zrodlo: 'art. 113 ustawy o VAT (zmiana z 24.06.2025); poradnikprzedsiebiorcy.pl, infor.pl',
        tresc: `
- [PEWNE] Limit zwolnienia od 1.01.2026: 240 000 zł sprzedaży rocznie. Przy starcie w trakcie roku liczony proporcjonalnie do liczby dni do końca roku. Start 1.12.2026: 240 000 × 31 / 365 = około 20 384 zł na grudzień.
- Na fakturze bez VAT dopisek: „zwolnienie na podstawie art. 113 ust. 1 ustawy o VAT”.
- Klient-firma nie odliczy VAT z Twojej faktury, ale Twoja cena jest ceną końcową. Dla małych firm zwolnionych z VAT i osób prywatnych jesteś tańszy o 23%.
- Kruczek, o którym mało kto wie: zakup usług od firm zagranicznych (Canva, Adobe, Google Workspace, reklamy Meta, hosting zza granicy) to import usług. Nawet zwolniony z VAT musi przed pierwszym takim zakupem zarejestrować się do VAT-UE (druk VAT-R), a potem składać VAT-9M i płacić 23% VAT do 25. dnia następnego miesiąca. [DO POTWIERDZENIA szczegóły z księgową przed pierwszym zakupem na firmę]
- Przekroczenie limitu: VAT od sprzedaży ponad limit, rejestracja przed dniem przekroczenia.`,
    },
    {
        id: 'ksef',
        tytul: 'KSeF (Krajowy System e-Faktur)',
        sprawdzono: '2026-11-17',
        zrodlo: 'harmonogram KSeF wg jpk.info.pl, ifirma.pl, prawo.pl (serwisy branżowe, nie tekst ustawy)',
        tresc: `
- [PEWNE] Odbieranie faktur w KSeF: wszyscy od 1.02.2026.
- [PEWNE] Najmniejsze firmy muszą wystawiać faktury w KSeF od 1.01.2027. Dotyczy też zwolnionych z VAT.
- [DO POTWIERDZENIA] Do końca 2026 mała firma (sprzedaż na fakturach do 10 000 zł brutto miesięcznie) może wystawiać faktury poza KSeF. Źródła różnie opisują okres przejściowy.
- Faktury dla osób prywatnych: poza obowiązkiem KSeF.
- Wniosek dla WUYO: start w grudniu 2026, a od stycznia 2027 KSeF. Program do faktur wybrać od razu taki, który ma KSeF (inFakt, ifirma, Fakturownia mają).`,
    },
    {
        id: 'ksiegowosc',
        tytul: 'Księgowość: sam, serwis czy biuro',
        sprawdzono: '2026-11-17',
        zrodlo: 'ocena doradcy',
        tresc: `
- KPiR na skali da się prowadzić samemu w inFakt albo ifirma. Trudniejsze są: rozliczenie dotacji, środki trwałe kupione z dotacji, import usług (VAT-9M), KSeF od 2027.
- Rekomendacja na pierwszy rok: pakiet z księgową (inFakt, ifirma albo lokalne biuro w Rzeszowie). Jeden błąd przy dotacji kosztuje więcej niż rok księgowej. Po roku można zejść na samodzielny pakiet.
- Koszt księgowości jest kosztem firmy.
- Cen pakietów nie podawaj z pamięci. Każ sprawdzić na stronie i porównać 2-3 oferty, w tym jedno lokalne biuro.
- Pytania do księgowej przed podpisaniem: czy rozliczała dotacje z PUP, kto składa VAT-9M, czy pomaga wybrać formę opodatkowania na 2027, ile kosztuje wyjście z umowy.`,
    },
    {
        id: 'zaopatrzenie',
        tytul: 'Zakupy materiałów do personalizacji (koszulki, bluzy, folia DTF)',
        sprawdzono: '2026-11-18',
        zrodlo: 'ustalenia z 18.11.2026, skill zaopatrzenie (wiedza ogólna, cen sklepów tu nie ma)',
        tresc: `
- Do rejestracji firmy Mateusz kupuje na próbę jako osoba prywatna, żeby nabrać praktyki z prasą i DTF.
- Proces DTF: WUYO zleca tylko wydruk folii, wgrzewa sam na własnej prasie, pakuje i dostarcza.
- Cen sklepów nie podawaj z pamięci. Wyszukaj w Google i podaj źródło z datą. Pełne porównanie (3 oferty, koszt sztuki z dostawą) robi komputer: zaproponuj zadanie „uruchom zaopatrzenie: <co, ile sztuk, budżet>”.
- Liczy się koszt sztuki z dostawą do Rzeszowa, nie cena z cennika. Wzór: (cena × ilość + dostawa) / ilość.
- Wiele hurtowni B2B sprzedaje tylko firmom albo pokazuje ceny po zalogowaniu. Przed rejestracją szukaj sklepów sprzedających bez NIP.
- Plus zakupu jako osoba prywatna: 14 dni na zwrot przy zakupie przez internet (nie dotyczy wydruku DTF z własnym wzorem, bo to rzecz na zamówienie).
- Na kartach produktów sprawdzaj skład i gramaturę (g/m²). DTF trzyma się bawełny i poliestru. Przy ciemnym poliestrze barwnik może przebijać przez biały nadruk.
- Na próbę kupuj małe ilości (ok. 10 szt.) i różne modele, żeby porównać, co dobrze znosi prasę i pranie.
- Zachowuj paragony i faktury na imię i nazwisko. [DO POTWIERDZENIA z księgową] wydatki sprzed rejestracji związane z późniejszą firmą bywają uznawane za koszt po starcie.
- [DO POTWIERDZENIA w umowie PUP] Zakupy na próbę przed umową nie idą z dotacji. Nie wpisuj ich jako wydatków dotacyjnych.`,
    },
    {
        id: 'klienci',
        tytul: 'Umowy i klienci',
        sprawdzono: '2026-10-30',
        zrodlo: 'wzory WUYO w /lab/finances (zakładka Umowy i dokumenty), ustalenia z 30.10.2026',
        tresc: `
- Proces WUYO: brief i wycena, oferta, umowa, zaliczka 50%, realizacja, odbiór, rachunek końcowy.
- W umowie „zaliczka”, nie „zadatek”.
- Prawa autorskie przechodzą tylko na piśmie (art. 53 prawa autorskiego), z wymienionymi polami eksploatacji. Bez tego klient ma najwyżej licencję. Przeniesienie dopiero po zapłacie całości.
- Osoba prywatna i jednoosobowa firma kupująca poza swoją branżą (art. 38a ustawy o prawach konsumenta) mają 14 dni na odstąpienie od umowy zawartej na odległość. Wyjątki: rzecz wykonana na zamówienie według specyfikacji klienta, usługa wykonana w całości za wyraźną zgodą.
- Domena rejestrowana na klienta, nie na WUYO.
- Gotowe wzory (umowa o dzieło, protokół odbioru, RODO, powierzenie danych) są w panelu /lab/finances.`,
    },
]

export function wiedzaJakoTekst(): string {
    return WIEDZA.map(
        (w) => `### ${w.tytul}\n(sprawdzono: ${w.sprawdzono}; źródło: ${w.zrodlo})\n${w.tresc.trim()}`,
    ).join('\n\n')
}
