// Dane cennika — sekcja pakietów (jednorazowo + abonament).
// Źródło: cennik-brief.md (sekcja 4). JDG zwolniona z VAT — ceny końcowe, bez netto/brutto.

export interface PricingCardData {
    eyebrow: string;
    name: string;
    tagline: string;
    price: string;
    priceSuffix: string;
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

export const vatNote =
    "Nie jestem płatnikiem VAT — podane ceny są cenami końcowymi, bez doliczania 23%. Wystawiam fakturę (zwolnioną z VAT), którą wrzucisz w koszty firmy.";

export const sectionHeader = {
    eyebrow: "Cennik",
    title: "Przejrzysty cennik. Wiesz, ile zapłacisz, zanim zadzwonisz.",
    subtitle:
        "Marka, strona i stała opieka dla firm z Rzeszowa i okolic. Bez ukrytych kosztów, bez doliczania VAT.",
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
        a: "Nie. Nie jestem płatnikiem VAT, więc podane ceny są cenami końcowymi — nic nie doliczam.",
    },
    {
        q: "Czy dostanę fakturę?",
        a: "Tak. Wystawiam fakturę (zwolnioną z VAT), którą bez problemu wrzucisz w koszty firmy.",
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
                priceSuffix: "jednorazowo",
                features: [
                    "Logo + wersje pozioma, pionowa i mono",
                    "Mini księga znaku (kolory, fonty, zasady) — w cenie",
                    "Wizytówki (projekt + plik do druku)",
                    "Stopka mailowa",
                    "Szablon oferty w PDF",
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
                priceSuffix: "jednorazowo",
                features: [
                    "Wszystko z pakietu Marka Start",
                    "Indywidualna strona (do 5 podstron) — nie szablon",
                    "Formularz kontaktowy + mapa",
                    "Dopracowana wersja mobilna",
                    "Podstawowe SEO lokalne",
                    "Szkolenie: jak samemu edytować treść",
                    "1. miesiąc opieki nad stroną gratis",
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
                priceSuffix: "jednorazowo",
                features: [
                    "Pełny branding + indywidualna strona",
                    "Konfiguracja i optymalizacja wizytówki Google",
                    "Pakiet startowy 5 grafik (social / druk)",
                    "Strategia opinii na start",
                    "3 miesiące opieki nad stroną w cenie",
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
                eyebrow: "Klienci po wdrożeniu strony",
                name: "Opieka Strony",
                tagline:
                    "Twoja strona zawsze działa, jest aktualna i bezpieczna — bez Twojej głowy.",
                price: "149 zł",
                priceSuffix: "/ miesiąc",
                features: [
                    "Hosting + domena",
                    "Aktualizacje i kopie zapasowe",
                    "Zabezpieczenia i monitoring",
                    "Drobne zmiany (do 1h / mies.)",
                ],
                delivery: "Reakcja do 48h",
                cta: "Zadbaj o stronę",
                highlighted: false,
            },
            {
                eyebrow: "Firmy, które chcą dzwoniących klientów",
                name: "Widoczność Lokalna",
                tagline: "Bądź wyżej w Google i na Mapach niż lokalna konkurencja.",
                price: "590 zł",
                priceSuffix: "/ miesiąc",
                features: [
                    "Prowadzenie i optymalizacja wizytówki Google",
                    "Strategia opinii + odpowiedzi na recenzje",
                    "4–6 grafik / postów miesięcznie",
                    "Raport miesięczny z efektami",
                ],
                delivery: "Reakcja do 48h",
                cta: "Chcę więcej klientów",
                highlighted: true,
                badge: "Najczęściej wybierany",
            },
            {
                eyebrow: "Firmy, które regularnie potrzebują grafiki",
                name: "Stały Opiekun",
                tagline:
                    "Twój grafik i marketing w abonamencie — bez zatrudniania, bez czekania.",
                price: "1 290 zł",
                priceSuffix: "/ miesiąc",
                features: [
                    "Pełna grafika: posty, banery, ulotki",
                    "Prowadzenie social media",
                    "Opieka nad stroną + wizytówka Google",
                    "Priorytetowy czas realizacji (48h)",
                    "Comiesięczna rozmowa strategiczna",
                ],
                delivery: "Priorytet 48h",
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
