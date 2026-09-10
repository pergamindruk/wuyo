// Dane cennika — sekcja pakietów (jednorazowo + abonament).
// Źródło: CENNIK.md w katalogu głównym repo — to jedyny obowiązujący cennik.
// WAŻNE: wszystkie kwoty tutaj to ceny NETTO. Do faktury dochodzi 23% VAT.
// Nie zmieniaj kwot bez równoległej zmiany w CENNIK.md.

export interface PricingCardData {
    eyebrow: string;
    name: string;
    tagline: string;
    price: string;
    priceSuffix: string;
    /** Ile to samo kosztuje kupowane osobno, np. "2 119 zł". Opcjonalne. */
    listPrice?: string;
    /** Różnica na korzyść klienta, np. "379 zł". Renderowana obok listPrice. */
    saving?: string;
    features: string[];
    delivery: string;
    cta: string;
    highlighted: boolean;
    badge?: string;
}

export interface PricingGroupData {
    id: string;
    tabLabel: string;
    heading: string;
    subheading: string;
    cards: PricingCardData[];
}

export const sectionHeader = {
    eyebrow: "Cennik",
    title: "Przejrzysty cennik. Wiesz, ile zapłacisz, zanim zadzwonisz.",
    subtitle:
        "Marka, strona i stała opieka dla firm z Rzeszowa i okolic. Ceny netto, jawne od początku — bez ukrytych kosztów i dopłat po drodze.",
};

// Linijka à la carte — kwoty wyróżnione w komponencie.
export const aLaCarte = {
    siteFrom: "2 490 zł",
    logoFrom: "890 zł",
};

export const perks = [
    { title: "Jawne ceny", desc: "Wiesz, ile zapłacisz, zanim w ogóle zadzwonisz." },
    { title: "Strona robiona indywidualnie", desc: "Nie składana z gotowego szablonu." },
    { title: "Lokalnie w Rzeszowie", desc: "Możliwe spotkanie na żywo, nie tylko mailem." },
    { title: "Stała opieka po wdrożeniu", desc: "Nie zostajesz sam ze stroną." },
];

export const pricingFaqs = [
    {
        q: "Czy do ceny dochodzi VAT?",
        a: "Tak — podane kwoty to ceny netto, do faktury dochodzi 23% VAT. Jeśli prowadzisz firmę i odliczasz VAT, Twój realny koszt to dokładnie kwota z cennika.",
    },
    {
        q: "Czy dostanę fakturę?",
        a: "Tak, na każde zlecenie. Faktura VAT z pełnymi danymi — wrzucasz ją w koszty firmy i odliczasz VAT.",
    },
    {
        q: "Jak wygląda płatność?",
        a: "Zaliczka na start, reszta po akceptacji projektu. Abonament — z góry za dany miesiąc.",
    },
    {
        q: "Czyje są prawa do projektu?",
        a: "Po opłaceniu przekazuję pełne prawa majątkowe i pliki źródłowe. Projekt jest Twój.",
    },
    {
        q: "Ile poprawek jest w cenie?",
        a: "Poprawki do wybranej koncepcji są w cenie — pracujemy aż do akceptacji.",
    },
    {
        q: "Chcę tylko stronę albo tylko logo — da się?",
        a: "Tak. Strona indywidualna od 2 490 zł, logo od 890 zł. Napisz po wycenę.",
    },
    {
        q: "Czy mogę zrezygnować z abonamentu?",
        a: "Tak, w każdej chwili z miesięcznym wyprzedzeniem. Bez zobowiązań na rok.",
    },
];

export const finalCta = {
    title: "Nie wiesz, który pakiet pasuje do Twojej firmy?",
    text: "Napisz w dwóch zdaniach, czym się zajmujesz — odpiszę z konkretną rekomendacją i wyceną. Bez zobowiązań.",
    button: "Napisz po wycenę",
};

export const pricingGroups: PricingGroupData[] = [
    {
        id: "jednorazowo",
        tabLabel: "Jednorazowo",
        heading: "Wystartuj z marką i stroną",
        subheading: "Jednorazowy projekt pod klucz. Płacisz raz, zostaje na lata.",
        cards: [
            {
                eyebrow: "Nowe firmy, rzemiosło, usługi lokalne",
                name: "Marka Start",
                tagline:
                    "Wszystko, czego nowa firma potrzebuje, żeby od pierwszego dnia wyglądać poważnie.",
                price: "1 490 zł",
                priceSuffix: "netto, jednorazowo",
                listPrice: "2 119 zł",
                saving: "629 zł",
                features: [
                    "Logo w 3 wersjach: pozioma, pionowa, mono",
                    "Mini księga znaku — kolory, fonty, zasady użycia",
                    "Wizytówki 150 szt. — projekt dwustronny + druk",
                    "Stopka mailowa gotowa do wklejenia",
                    "Pełne prawa do projektu + pliki źródłowe",
                ],
                delivery: "Czas realizacji: 7–10 dni roboczych",
                cta: "Zacznij od marki",
                highlighted: false,
            },
            {
                eyebrow: "Budowlanka, usługi, gabinety, warsztaty",
                name: "Firma w Internecie",
                tagline:
                    "Obecność online, która generuje zapytania — nie tylko ładnie wygląda.",
                price: "3 490 zł",
                priceSuffix: "netto, jednorazowo",
                listPrice: "4 758 zł",
                saving: "1 268 zł",
                features: [
                    "Wszystko z pakietu Marka Start",
                    "Indywidualna strona do 5 podstron — pisana od zera, nie szablon",
                    "Formularz kontaktowy + mapa dojazdu",
                    "Dopracowana wersja mobilna",
                    "Podstawowe SEO lokalne — Rzeszów i okolice",
                    "Szkolenie: jak samemu zmienić treść na stronie",
                    "Pierwszy miesiąc opieki nad stroną w cenie",
                ],
                delivery: "Czas realizacji: 7–21 dni",
                cta: "Chcę taką stronę",
                highlighted: true,
                badge: "Najczęściej wybierany",
            },
            {
                eyebrow: "Firmy, które chcą być znalezione od razu",
                name: "Pełny Start",
                tagline:
                    "Marka, strona i widoczność w Google — kompletny start pod klucz.",
                price: "5 900 zł",
                priceSuffix: "netto, jednorazowo",
                listPrice: "7 059 zł",
                saving: "1 159 zł",
                features: [
                    "Wszystko z pakietu Firma w Internecie",
                    "Wizytówki 300 szt. zamiast 150 + ulotka A5",
                    "Szablony grafik pod social media",
                    "Wizytówka Google: założenie, konfiguracja, optymalizacja",
                    "Strategia opinii — jak je zbierać i jak odpowiadać",
                    "3 miesiące pełnej widoczności: prowadzenie Google, opinie, 5–6 grafik miesięcznie, raport",
                    "Priorytetowy czas realizacji",
                ],
                delivery: "Czas realizacji: 14–21 dni",
                cta: "Wystartuj kompleksowo",
                highlighted: false,
            },
        ],
    },
    {
        id: "abonament",
        tabLabel: "Abonament miesięczny",
        heading: "Stała opieka, żebyś nie został sam po wdrożeniu",
        subheading:
            "Wybierasz raz, działa co miesiąc. Rezygnacja w każdej chwili z miesięcznym wyprzedzeniem.",
        cards: [
            {
                eyebrow: "Masz już stronę i chcesz mieć spokój",
                name: "Opieka Strony",
                tagline:
                    "Twoja strona po prostu działa — Ty nie musisz o nią myśleć.",
                price: "149 zł",
                priceSuffix: "netto / miesiąc",
                features: [
                    "Strona działa non stop (serwer w cenie)",
                    "Pilnuję adresu strony, żeby nie wygasł",
                    "Robię kopie — jak coś padnie, przywracam",
                    "Chronię przed włamaniem i sprawdzam, czy strona żyje",
                    "Drobna zmiana co miesiąc (np. nowe godziny, numer)",
                ],
                delivery: "Odpisuję do 48h",
                cta: "Zadbaj o stronę",
                highlighted: false,
            },
            {
                eyebrow: "Chcesz, żeby klienci Cię znajdowali i dzwonili",
                name: "Widoczność i Opieka",
                tagline:
                    "Strona pod opieką + jesteś widoczny w Google, gdy ktoś szuka takiej firmy jak Twoja.",
                price: "690 zł",
                priceSuffix: "netto / miesiąc",
                features: [
                    "Wszystko z Opieki Strony (strona działa i jest chroniona)",
                    "Prowadzę Twoją wizytówkę w Google i na Mapach",
                    "Pomagam zbierać opinie i odpowiadam na recenzje za Ciebie",
                    "5–6 gotowych grafik / postów miesięcznie",
                    "Co miesiąc krótko: co zrobiłem i co to dało",
                ],
                delivery: "Odpisuję do 48h",
                cta: "Chcę być widoczny",
                highlighted: true,
                badge: "Najczęściej wybierany",
            },
            {
                eyebrow: "Potrzebujesz grafiki co tydzień, nie co pół roku",
                name: "Stały Opiekun",
                tagline:
                    "Masz grafika i marketing na stałe — bez zatrudniania kogokolwiek i bez czekania w kolejce.",
                price: "1 290 zł",
                priceSuffix: "netto / miesiąc",
                features: [
                    "Wszystko z Widoczności i Opieki",
                    "Grafika bez limitu pozycji: posty, banery, ulotki, oferty",
                    "Prowadzę Twoje social media — nie tylko projektuję",
                    "Wchodzisz przede mną w kolejkę — robię Twoje rzeczy pierwsze",
                    "Co miesiąc rozmawiamy: co działa, co zmieniamy",
                ],
                delivery: "Odpisuję do 48h, priorytet",
                cta: "Zacznij abonament",
                highlighted: false,
            },
        ],
    },
];

// Płaska lista + helper do prefillu formularza kontaktowego (?pakiet=NAZWA).
export const allPricingCards: PricingCardData[] = pricingGroups.flatMap((g) => g.cards);

export function findPricingCard(name: string): PricingCardData | undefined {
    return allPricingCards.find((c) => c.name === name);
}
