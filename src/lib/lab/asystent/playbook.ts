// Zasady rozmowy sprzedażowej asystenta (/lab/asystent).
// Zebrane z metod, których dziś używają agencje: otwarcie z powodem i prośbą o zgodę (dane Gong z 300 mln rozmów,
// Josh Braun), najpierw diagnoza, potem propozycja (Blair Enns, „Win Without Pitching”), widełki ceny już w pierwszej
// rozmowie i jasny następny krok (The Admin Bar), 3 warianty oferty z rekomendacją środkowego.

export const PLAYBOOK = `METODA ROZMOWY (tak dziś sprzedają najlepsze agencje; trzymaj się tego):
1. Otwarcie z powodem, nie "czy przeszkadzam". Kim jesteś, JEDNO konkretne spostrzeżenie o ich firmie (z danych niżej),
   przyznaj, że dzwonisz bez zapowiedzi, poproś o 30 sekund. Nie zaczynaj od prezentacji oferty.
2. Najpierw diagnoza, potem propozycja. 2 krótkie pytania o ich klientów i o to, skąd dziś biorą zlecenia.
   Klient mówi więcej niż Mateusz. Nazwij problem jego słowami ("czyli klienci pytają o cennik, a w Google go nie ma").
3. Pytanie, które pokazuje lukę, bez straszenia: co się dzieje, gdy ktoś wpisze ich nazwę w Google albo szuka usługi w okolicy.
4. Cena wcześnie i uczciwie: widełki z cennika już w rozmowie, bez chowania ceny na koniec.
5. Oferta w 3 wariantach z cennika: najtańszy pasujący, POLECANY (środkowy) i rozszerzony. Uzasadnij polecany jednym zdaniem.
6. Zawsze jeden następny krok z datą (np. "podeślę ofertę dziś, zadzwonię w czwartek o 10?"). Po rozmowie krótkie podsumowanie mailem.
7. Przypomnienie po ofercie: dzień 2-3 krótkie pytanie, dzień 5-7 telefon, dzień 10-14 uprzejme zamknięcie
   ("rozumiem, że temat nie jest teraz na tapecie, zamykam go u siebie; gdyby wrócił, jestem").
8. Żadnych darmowych projektów "na próbę", żadnych rabatów w pierwszym zdaniu, żadnego naciskania.`

/** Sytuacja studia (firma w rejestracji). Zmień tu, gdy firma ruszy. */
export const START_NOTE = `TERMIN: firma jest w trakcie rejestracji. Realizacja rusza po rejestracji (plan: styczeń 2027).
Proponuj rezerwację terminu. Zaliczki NIE bierzesz teraz, zaliczka dopiero po rejestracji. Nie podawaj konkretnej daty startu.`

/** Źródła metody, pokazywane w panelu („Jak pisze asystent”). */
export const PLAYBOOK_SOURCES = [
    { label: 'Gong Labs: najlepsze i najgorsze otwarcia rozmów (300 mln rozmów)', href: 'https://www.gong.io/resources/labs/the-best-and-worst-cold-call-openers-backed-by-data-from-300m-calls/' },
    { label: 'Josh Braun: otwarcie za zgodą i „poke the bear”', href: 'https://echai.ventures/gtm/gtm-outbound/who-should-i-actually-learn-cold-outbound-from-and-what-do-the-very-best-do-differently-on-a-call' },
    { label: 'The Admin Bar: 3 kroki sprzedaży stron', href: 'https://theadminbar.com/sell-websites/' },
    { label: 'AgencyAnalytics: pytania na rozmowę wstępną', href: 'https://agencyanalytics.com/blog/discovery-call-questions' },
] as const

/** Krótkie zasady do pokazania w panelu (to samo co PLAYBOOK, po ludzku). */
export const PLAYBOOK_POINTS = [
    'Otwarcie z powodem i prośbą o 30 sekund, bez „czy przeszkadzam”.',
    'Najpierw 2 pytania o ich klientów, potem propozycja.',
    'Cena w widełkach już w rozmowie.',
    'Oferta w 3 wariantach, polecany środkowy.',
    'Zawsze jeden następny krok z datą.',
    'Przypomnienie: dzień 2–3, telefon dzień 5–7, uprzejme zamknięcie dzień 10–14.',
] as const
