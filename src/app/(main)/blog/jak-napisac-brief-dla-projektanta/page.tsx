import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

const domain = "https://wuyo.pl";

export const metadata: Metadata = {
    title: "Jak napisać brief dla projektanta graficznego? Gotowy szablon 2026",
    description:
        "Brief to fundament każdego projektu logo lub strony. Dowiedz się co powinien zawierać, pobierz gotowy szablon i unikaj najczęstszych błędów, które kosztują Cię czas i pieniądze.",
    openGraph: {
        title: "Jak napisać brief dla projektanta graficznego? Gotowy szablon 2026",
        description:
            "Brief to fundament każdego projektu logo lub strony. Dowiedz się co powinien zawierać i unikaj błędów, które kosztują czas i pieniądze.",
        type: "article",
        authors: ["Mateusz Machoś"],
        publishedTime: "2026-03-27T00:00:00Z",
        url: `${domain}/blog/jak-napisac-brief-dla-projektanta`,
        siteName: "WUYO – Dobra Grafa",
        images: ["/logo_wuya2.webp"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Jak napisać brief dla projektanta graficznego? Gotowy szablon 2026",
        description:
            "Brief to fundament projektu logo lub strony. Gotowy szablon + najczęstsze błędy.",
    },
    alternates: {
        canonical: `${domain}/blog/jak-napisac-brief-dla-projektanta`,
    },
};

const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Jak napisać brief dla projektanta graficznego? Gotowy szablon 2026",
    description:
        "Brief to fundament każdego projektu logo lub strony. Dowiedz się co powinien zawierać, pobierz gotowy szablon i unikaj najczęstszych błędów.",
    datePublished: "2026-03-27T00:00:00Z",
    author: {
        "@type": "Person",
        name: "Mateusz Machoś",
    },
    publisher: {
        "@type": "Organization",
        name: "WUYO – Dobra Grafa",
    },
    url: `${domain}/blog/jak-napisac-brief-dla-projektanta`,
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Co to jest brief dla projektanta?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Brief to dokument, w którym opisujesz swój biznes, cele projektu, grupę docelową i oczekiwania wobec projektanta. Im lepszy brief, tym lepszy projekt.",
            },
        },
        {
            "@type": "Question",
            name: "Ile stron powinien mieć brief?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Dobry brief ma 1-3 strony. Wystarczy odpowiedzieć szczerze na kluczowe pytania. Nie musisz pisać pracy dyplomowej — liczy się konkretność, nie objętość.",
            },
        },
        {
            "@type": "Question",
            name: "Co jeśli nie wiem jak odpowiedzieć na pytania z briefu?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "To normalne i nic złego. Dobry projektant pomoże Ci to wypracować przez rozmowę (kick-off call). Blank brief to sygnał, żeby omówić projekt, nie powód do rezygnacji.",
            },
        },
        {
            "@type": "Question",
            name: "Czy brief jest potrzebny do małego projektu jak wizytówka?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Dla wizytówki wystarczy krótka forma: branża, kolory, styl, dane kontaktowe. Pełny brief jest ważniejszy przy logo, identyfikacji i stronie internetowej.",
            },
        },
        {
            "@type": "Question",
            name: "Czy mogę pokazać projektantowi przykłady zamiast pisać brief?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Tak! Inspiracje (logo, strony, kolory) to świetny dodatek do briefu. Pokaż też co Ci się nie podoba — negatywne przykłady są równie cenne jak pozytywne.",
            },
        },
    ],
};

export default function Page() {
    return (
        <main className="bg-gradient-to-b from-navy via-navy to-navy">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Hero */}
            <section className="relative min-h-[60vh] w-full flex items-center justify-center px-4 py-28 pt-40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <nav className="mb-6 flex items-center justify-center gap-2 text-sm text-white/40">
                        <Link href="/" className="hover:text-white transition-colors">Główna</Link>
                        <span>/</span>
                        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                        <span>/</span>
                        <span className="text-white/70">Brief dla projektanta</span>
                    </nav>
                    <div className="mb-6 inline-block">
                        <span className="text-sm font-bold text-gold uppercase tracking-wider border border-gold/30 rounded-full px-4 py-1.5">
                            Przewodnik praktyczny
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Jak napisać brief dla projektanta graficznego?
                    </h1>
                    <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto">
                        Brief to różnica między projektem, który trafił w dziesiątkę za pierwszym razem,
                        a projektem, który przerabiasz cztery razy i wciąż coś nie gra.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                        <span>27 marca 2026</span>
                        <span>•</span>
                        <span>~8 min czytania</span>
                        <span>•</span>
                        <span>Mateusz Machoś</span>
                    </div>
                </div>
            </section>

            {/* Intro */}
            <section className="py-16 px-4 bg-navy/40 border-y border-white/10">
                <div className="max-w-3xl mx-auto">
                    <p className="text-lg text-white/80 leading-relaxed mb-6">
                        Przez kilka lat pracy jako projektant przeczytałem setki briefów. Albo ich brak.
                        I mogę Ci powiedzieć jedno z pełnym przekonaniem:
                    </p>
                    <blockquote className="border-l-4 border-gold pl-6 text-xl font-bold text-white mb-6">
                        Jakość projektu zaczyna się od jakości briefu. Nie od talentu projektanta.
                    </blockquote>
                    <p className="text-white/70 leading-relaxed">
                        Nawet najlepszy projektant nie zrobi logo „które będzie nowoczesne, ale klasyczne,
                        proste, ale bogate i które będzie podobać się wszystkim". Brief nie jest formalnością —
                        to narzędzie, które oszczędza Twój czas, Twoje pieniądze i nerwy obu stron.
                    </p>
                </div>
            </section>

            {/* Co to jest brief */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection>
                        <h2 className="text-3xl font-bold text-white mb-6">Czym jest brief?</h2>
                        <p className="text-white/70 mb-6 leading-relaxed">
                            Brief (z ang. <em>briefing</em>) to dokument, który opisuje projekt zanim jeszcze
                            powstanie piksel czy linia. Zawiera odpowiedzi na fundamentalne pytania:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            {[
                                "Kim jesteś i co robisz?",
                                "Do kogo mówisz (grupa docelowa)?",
                                "Co chcesz osiągnąć tym projektem?",
                                "Jak chcesz być postrzegany?",
                                "Czego NIE chcesz?",
                                "Jakie masz ograniczenia (budżet, czas, format)?",
                            ].map((q, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <FileText size={16} className="text-gold flex-shrink-0 mt-1" />
                                    <span className="text-white/80 text-sm">{q}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/60 text-sm italic border-l-2 border-gold/40 pl-4">
                            Brief to nie pismo urzędowe. Ma być szczery, konkretny i napisany ludzkim językiem.
                            1-3 strony A4 wystarczą.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Brief na logo */}
            <section className="py-20 px-4 bg-navy/30">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection>
                        <h2 className="text-3xl font-bold text-white mb-8">
                            Brief na logo — co powinien zawierać?
                        </h2>
                        <p className="text-white/70 mb-8 leading-relaxed">
                            To najczęstszy projekt, na który klienci nie wiedzą jak pisać briefu.
                            Poniżej kompletna lista pytań:
                        </p>

                        <div className="space-y-6">
                            {[
                                {
                                    title: "1. Firma i branża",
                                    items: [
                                        "Pełna nazwa firmy / marka",
                                        "Branża i czym konkretnie się zajmujesz",
                                        "Jak długo istnieje firma? (startup vs. marka z historią)",
                                        "Czy masz już jakieś materiały / poprzednie logo?",
                                    ],
                                },
                                {
                                    title: "2. Grupa docelowa",
                                    items: [
                                        "Kto jest Twoim klientem? (wiek, płeć, branża, status majątkowy)",
                                        "Gdzie Twój klient spędza czas online/offline?",
                                        "Co dla Twojego klienta jest ważne przy wyborze produktu/usługi?",
                                    ],
                                },
                                {
                                    title: "3. Wartości i charakter marki",
                                    items: [
                                        "Jakie 3 przymiotniki opisują Twoją markę? (np. rzetelna, nowoczesna, ciepła)",
                                        "Gdyby Twoja marka była człowiekiem, jak by wyglądała?",
                                        "Jakie emocje chcesz wzbudzać u klientów?",
                                    ],
                                },
                                {
                                    title: "4. Preferencje wizualne",
                                    items: [
                                        "Ulubione kolory? Kolory których NIE chcesz?",
                                        "Styl: minimalistyczny, organiczny, luksusowy, technologiczny...?",
                                        "Czcionka: szeryfowa (klasyczna), bezszeryfowa (nowoczesna)?",
                                        "3-5 logotypów które lubisz i krótko — dlaczego?",
                                        "3-5 logotypów których NIE lubisz i dlaczego?",
                                    ],
                                },
                                {
                                    title: "5. Konkurencja",
                                    items: [
                                        "Kto jest Twoją główną konkurencją?",
                                        "Jak chcesz wyróżnić się na tle konkurentów?",
                                        "Czy chcesz wyglądać podobnie do branży, czy odróżniać się?",
                                    ],
                                },
                                {
                                    title: "6. Formaty i zastosowania",
                                    items: [
                                        "Gdzie będzie używane logo? (strona, wizytówka, szyld, social media, opakowanie)",
                                        "Czy potrzebujesz wersji ciemnej i jasnej?",
                                        "Formaty plików (PDF/AI/SVG dla wektorów, PNG/JPG dla rastrów)?",
                                    ],
                                },
                                {
                                    title: "7. Deadline i budżet",
                                    items: [
                                        "Kiedy potrzebujesz gotowego projektu?",
                                        "Jaki jest Twój budżet?",
                                        "Czy są jakieś etapy (np. premiera firmy, event, konferencja)?",
                                    ],
                                },
                            ].map((section, i) => (
                                <div key={i} className="border border-gold/20 rounded-lg overflow-hidden">
                                    <div className="bg-gold/5 px-6 py-3 border-b border-gold/20">
                                        <h3 className="font-bold text-gold">{section.title}</h3>
                                    </div>
                                    <ul className="p-6 space-y-2">
                                        {section.items.map((item, j) => (
                                            <li key={j} className="flex gap-3 text-white/80 text-sm">
                                                <CheckCircle2 size={16} className="text-gold/60 flex-shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Brief na stronę */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection>
                        <h2 className="text-3xl font-bold text-white mb-8">
                            Brief na stronę internetową — dodatkowe pytania
                        </h2>
                        <p className="text-white/70 mb-8 leading-relaxed">
                            Strona to bardziej złożony projekt niż logo. Oprócz powyższych punktów (firma,
                            grupy docelowe, styl), dochodzą kwestie techniczne i contentowe:
                        </p>

                        <div className="space-y-6">
                            {[
                                {
                                    title: "Cel strony",
                                    items: [
                                        "Co ma robić strona? (zbierać leady, prezentować portfolio, sprzedawać produkty...)",
                                        "Jaka jest główna akcja użytkownika? (wypełnij formularz, zadzwoń, kup)",
                                        "Czy strona zastępuje stary serwis, czy to nowa?",
                                    ],
                                },
                                {
                                    title: "Struktura i treść",
                                    items: [
                                        "Jakie podstrony/sekcje powinny być? (O nas, Usługi, Blog, Kontakt...)",
                                        "Czy masz gotowe teksty, czy potrzebujesz pomocy przy copywritingu?",
                                        "Czy masz zdjęcia (profesjonalne) czy potrzebujemy stocków?",
                                        "Czy będziesz aktualizować treści samodzielnie (panel CMS)?",
                                    ],
                                },
                                {
                                    title: "Techniczne",
                                    items: [
                                        "Czy masz już domenę i hosting?",
                                        "Formularze kontaktowe — gdzie trafiają zapytania? (email, CRM)",
                                        "Czy potrzebujesz integracji? (Google Analytics, newsletter, sklep)",
                                        "Budżet miesięczny na utrzymanie (hosting, aktualizacje)?",
                                    ],
                                },
                                {
                                    title: "Inspiracje",
                                    items: [
                                        "3-5 stron które lubisz (z komentarzem co dokładnie)",
                                        "3-5 stron które NIE odpowiadają Ci stylem",
                                        "Czy masz materiały brand guidelines / kolorystykę?",
                                    ],
                                },
                            ].map((section, i) => (
                                <div key={i} className="border border-gold/20 rounded-lg overflow-hidden">
                                    <div className="bg-gold/5 px-6 py-3 border-b border-gold/20">
                                        <h3 className="font-bold text-gold">{section.title}</h3>
                                    </div>
                                    <ul className="p-6 space-y-2">
                                        {section.items.map((item, j) => (
                                            <li key={j} className="flex gap-3 text-white/80 text-sm">
                                                <CheckCircle2 size={16} className="text-gold/60 flex-shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Błędy */}
            <section className="py-20 px-4 bg-navy/30">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection>
                        <h2 className="text-3xl font-bold text-white mb-8">
                            7 błędów w briefach, które kosztują Cię czas
                        </h2>

                        <div className="space-y-5">
                            {[
                                {
                                    err: `"Chcę logo nowoczesne, klasyczne i minimalistyczne zarazem"`,
                                    fix: `To sprzeczne oczekiwania. Wybierz jeden kierunek i trzymaj się go. Możesz pokazać 2-3 przykłady i powiedzieć "chcę czegoś bliżej tego".`,
                                },
                                {
                                    err: `"Chcę żeby logo podobało się wszystkim"`,
                                    fix: "Nie istnieje projekt który podoba się wszystkim. Określ konkretną grupę docelową — logo ma przemawiać do nich, nie do Twojego wujka.",
                                },
                                {
                                    err: `Brief = jedno zdanie "chcę logo dla firmy budowlanej"`,
                                    fix: "Projektant musi się domyślać wszystkiego. Dodaj przynajmniej charakter marki, kolory i 2-3 inspiracje.",
                                },
                                {
                                    err: "Brak przykładów — ani pozytywnych ani negatywnych",
                                    fix: "Przykłady są warte tysiąc słów. Pokaż co lubisz i czego nie — to skraca czas pracy o połowę.",
                                },
                                {
                                    err: `"Mam deadline za tydzień" — wysłane w piątek`,
                                    fix: "Dobry projekt wymaga czasu. Brief z późnym deadlinem albo skutkuje gorszym wynikiem, albo przepłacasz za ekspres.",
                                },
                                {
                                    err: "Brak informacji o budżecie",
                                    fix: "Projektant bez budżetu nie wie czy proponować pakiet basic czy premium. Podanie widełek ułatwia wycenę i unika późniejszych nieporozumień.",
                                },
                                {
                                    err: "Zmiana koncepcji po pierwszej wersji projektu",
                                    fix: `"Jednak zmieniamy nazwę / kolorystykę / branżę" po pierwszych projektach to reset całego procesu. Brief ma to zapobiec.`,
                                },
                            ].map((item, i) => (
                                <div key={i} className="border border-red-500/20 rounded-lg overflow-hidden">
                                    <div className="bg-red-500/5 px-6 py-3 border-b border-red-500/20 flex gap-3 items-start">
                                        <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-white font-semibold text-sm">{item.err}</p>
                                    </div>
                                    <div className="px-6 py-4 flex gap-3 items-start">
                                        <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                                        <p className="text-white/70 text-sm">{item.fix}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Co jeśli nie masz briefu */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection>
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Co jeśli nie umiesz napisać briefu?
                        </h2>
                        <p className="text-white/70 mb-6 leading-relaxed">
                            Zdarza się — szczególnie przy pierwszym zleceniu. Nie ma w tym nic złego.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-gold/5 border border-gold/20 rounded-lg p-6">
                                <p className="text-white font-bold mb-2">Opcja A: Kick-off call</p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Dobry projektant przeprowadzi Cię przez pytania briefingowe podczas rozmowy.
                                    15-30 minut rozmowy zastępuje kilka godzin pisania. To mój ulubiony sposób
                                    pracy z klientami, którzy działają po raz pierwszy.
                                </p>
                            </div>
                            <div className="bg-gold/5 border border-gold/20 rounded-lg p-6">
                                <p className="text-white font-bold mb-2">Opcja B: Skrócony brief + inspiracje</p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Wystarczy odpowiedzieć na 3 pytania: co robisz, do kogo mówisz i jakim stylem
                                    coś Ci się podoba. Reszta wyjdzie w trakcie.
                                </p>
                            </div>
                            <div className="bg-gold/5 border border-gold/20 rounded-lg p-6">
                                <p className="text-white font-bold mb-2">Opcja C: Formularz briefu</p>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Na mojej stronie masz gotowy formularz briefu. Wypełniasz go krok po kroku —
                                    nie musisz nic wymyślać. Pytania prowadzą przez cały proces.
                                </p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Podsumowanie */}
            <section className="py-16 px-4 bg-navy/30">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection>
                        <h2 className="text-3xl font-bold text-white mb-6">Checklista briefu — szybka wersja</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                "Firma: nazwa, branża, historia",
                                "Cel projektu (co ma zrobić użytkownik)",
                                "Grupa docelowa (kto, gdzie, co dla nich ważne)",
                                "Charakter marki (3 przymiotniki)",
                                "Styl wizualny (inspiracje + antyinspiracje)",
                                "Kolory — co tak, co nie",
                                "Formaty i zastosowania",
                                "Deadline i budżet",
                                "Konkurencja (i jak się wyróżnić)",
                                "Ograniczenia techniczne / CMS / hosting",
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                                    <span className="text-white/80 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Gotowy? Wypełnij brief — odezwę się w 24h
                    </h2>
                    <p className="text-white/70 mb-8 text-lg leading-relaxed">
                        Formularz briefu na mojej stronie prowadzi Cię przez wszystkie pytania krok po kroku.
                        Nie musisz nic wymyślać — po prostu odpowiadaj szczerze.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/#kontakt"
                            className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-8 py-3 rounded-full font-bold hover:bg-gold/90 transition-colors"
                        >
                            Wypełnij brief teraz
                            <ArrowRight size={16} />
                        </a>
                        <Link
                            href="/logo"
                            className="inline-flex items-center justify-center gap-2 border border-gold/40 text-gold hover:bg-gold/10 px-8 py-3 rounded-full font-bold transition-colors"
                        >
                            Zobacz ofertę logo
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-4 bg-navy/30">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8">FAQ</h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Co to jest brief dla projektanta?",
                                a: "Brief to dokument, w którym opisujesz swój biznes, cele projektu, grupę docelową i oczekiwania wobec projektanta. Im lepszy brief, tym lepszy projekt.",
                            },
                            {
                                q: "Ile stron powinien mieć brief?",
                                a: "Dobry brief ma 1-3 strony. Wystarczy odpowiedzieć szczerze na kluczowe pytania. Nie musisz pisać pracy dyplomowej — liczy się konkretność, nie objętość.",
                            },
                            {
                                q: "Co jeśli nie wiem jak odpowiedzieć na pytania z briefu?",
                                a: "To normalne i nic złego. Dobry projektant pomoże Ci to wypracować przez rozmowę (kick-off call). Blank brief to sygnał, żeby omówić projekt, nie powód do rezygnacji.",
                            },
                            {
                                q: "Czy brief jest potrzebny do małego projektu jak wizytówka?",
                                a: "Dla wizytówki wystarczy krótka forma: branża, kolory, styl, dane kontaktowe. Pełny brief jest ważniejszy przy logo, identyfikacji i stronie internetowej.",
                            },
                            {
                                q: "Czy mogę pokazać projektantowi przykłady zamiast pisać brief?",
                                a: "Tak! Inspiracje (logo, strony, kolory) to świetny dodatek do briefu. Pokaż też co Ci się nie podoba — negatywne przykłady są równie cenne jak pozytywne.",
                            },
                        ].map((item, idx) => (
                            <details
                                key={idx}
                                className="group border border-white/10 rounded-lg overflow-hidden hover:border-gold/20 transition-colors"
                            >
                                <summary className="p-6 cursor-pointer bg-navy/40 hover:bg-navy/50 transition-colors flex items-center justify-between">
                                    <h3 className="text-base font-bold text-white">{item.q}</h3>
                                    <span className="text-gold group-open:rotate-180 transition-transform ml-4 flex-shrink-0">
                                        ▼
                                    </span>
                                </summary>
                                <div className="px-6 py-4 bg-navy/20 border-t border-white/10">
                                    <p className="text-white/70 leading-relaxed text-sm">{item.a}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related */}
            <section className="py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8">Przeczytaj też</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Link
                            href="/blog/jak-wybrac-projektanta-logo"
                            className="group p-6 rounded-lg border border-gold/20 hover:border-gold/40 bg-navy/40 transition-all"
                        >
                            <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors mb-2">
                                Jak wybrać projektanta logo?
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                8 pytań które oddzielają profesjonalistów od amatorów. Checklista do pobrania.
                            </p>
                            <div className="flex items-center gap-2 text-gold text-sm font-bold">
                                Czytaj <ArrowRight size={16} />
                            </div>
                        </Link>
                        <Link
                            href="/blog/identyfikacja-wizualna-firmy"
                            className="group p-6 rounded-lg border border-gold/20 hover:border-gold/40 bg-navy/40 transition-all"
                        >
                            <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors mb-2">
                                Identyfikacja wizualna firmy — czym jest?
                            </h3>
                            <p className="text-white/60 text-sm mb-4">
                                Co wchodzi w skład CI, dlaczego mała firma tego potrzebuje i ile to kosztuje.
                            </p>
                            <div className="flex items-center gap-2 text-gold text-sm font-bold">
                                Czytaj <ArrowRight size={16} />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
