import type { Metadata } from "next";
import { seoMeta } from "@/lib/seo-overrides";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Layers, FileText, Palette, Type } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";
import { BUSINESS_RATING } from "@/lib/business-schema";
import { alternatesFor } from "@/lib/i18n";

const metadata: Metadata = {
    title: "Projektowanie logo Rzeszów — od 890 zł, 3 koncepcje",
    description: "Projektuję proste i czytelne logo dla firm z Rzeszowa i okolic. Tworzenie logo od zera, 3 koncepcje, pliki i prawa autorskie w cenie. Od 890 zł netto. Zobacz cennik i napisz do mnie.",
    openGraph: {
        title: "Logo dla Firmy od 890 zł | WUYO – Rzeszów i Polska",
        description: "Logo z procesem, plikami wektorowymi i prawami autorskimi. Od 890 zł. Termin 7–10 dni roboczych. Wycena w 24h.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/logo",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Projektowanie Logo dla Firm | WUYO",
        description: "Logo od 890 zł — pełen pakiet plików, CMYK, prawa autorskie. Rzeszów i cała Polska.",
        images: ["/og-image.webp"],
    },
    alternates: alternatesFor("logo", "pl"),
    keywords: [
        "projektowanie logo Rzeszów",
        "logo dla firmy Rzeszów",
        "projektant logo Rzeszów",
        "identyfikacja wizualna Rzeszów",
        "logo firma cena",
        "ile kosztuje logo",
        "projekt logo dla firmy",
        "grafik logo Rzeszów",
    ],
};

// Tytuł i opis może podmienić SEO-radca (/lab/seo) bez wdrożenia.
export async function generateMetadata(): Promise<Metadata> {
    return seoMeta("/logo", metadata);
}

// Jedna tablica zasila widoczną sekcję FAQ i schemat FAQPage — Google
// wymaga, żeby dane strukturalne miały pokrycie w treści strony.
const faqs: FaqEntry[] = [
    {
        q: "Ile kosztuje zaprojektowanie logo?",
        a: "Logotyp od 890 zł, logo z mini księgą znaku 1 190 zł, logo ze 100 wizytówkami (projekt + druk, pakiet Marka Mini) 1 090 zł, pełna identyfikacja wizualna (logo + księga znaku + wizytówki z drukiem + stopka mailowa) 1 490 zł. Lifting istniejącego logo od 1 000 zł. Cena jest stała i znasz ją przed startem, nie po.",
    },
    {
        q: "Ile trwa projekt logo?",
        a: "Zwykle 7–10 dni roboczych od zatwierdzenia briefu. Dobry brief skraca ten czas. Im więcej wiem o Twojej firmie, tym lepiej trafiam pierwszą propozycją.",
    },
    {
        q: "Co dostaję razem z logo?",
        a: "Pełen pakiet: SVG (wektor do skalowania), PNG z przezroczystym tłem, PDF gotowy do drukarni. Paleta kolorów w HEX i CMYK, typografia firmowa, wszystkie warianty (kolor, mono, sygnet). Prawa autorskie majątkowe przechodzą na Ciebie bez dodatkowej opłaty.",
    },
    {
        q: "Czy mogę samodzielnie edytować logo po projekcie?",
        a: "Tak. Na życzenie przekazuję pliki źródłowe z Figmy lub Adobe Illustratora. Jeśli nie masz programów graficznych, wystarczą Ci pliki PNG i SVG do codziennego użytku.",
    },
    {
        q: "Co jeśli drukarnia zwróci plik z uwagami?",
        a: "Poprawiam na swój koszt. Odpowiadam za to, żeby plik był przygotowany poprawnie: skala, spady, kolory, rozdzielczość. Nie dotyczy to zmian w treści, które zgłosisz po zaakceptowaniu projektu, bo to już nowa robota.",
    },
    {
        q: "Nie wiem, jakie logo chcę. Czy to problem?",
        a: "Nie. Większość moich klientów zaczyna od „chcę, żeby wyglądało porządnie”. Od tego jest brief: pytam o firmę, klientów i konkurencję, a kierunek pokazuję na moodboardzie, zanim powstanie pierwszy szkic.",
    },
    {
        q: "Jak przechodzą na mnie prawa autorskie do logo?",
        a: "Na piśmie. Polskie prawo wymaga pisemnej umowy przeniesienia autorskich praw majątkowych, więc dostajesz ją razem z plikami. Są w niej wypisane pola eksploatacji: druk, internet, szyld, odzież, reklama. Bez takiej umowy logo prawnie nie jest w pełni Twoje, nawet jeśli za nie zapłaciłeś.",
    },
];

const prepare = [
    "Nazwa firmy dokładnie tak, jak ma być w logo (z „sp. z o.o.” czy bez)",
    "Czym się zajmujesz i kto jest Twoim klientem. Dwa, trzy zdania wystarczą",
    "2–3 logo, które Ci się podobają, i 2–3, które nie. Mogą być z dowolnej branży",
    "Gdzie logo będzie najczęściej: szyld, auto, odzież, strona, opakowania",
    "Kolory, których na pewno nie chcesz (albo które muszą zostać)",
    "Twoje stare logo, jeśli jest. Nawet słabe coś mi powie",
];

const briefQuestions = [
    "Co Twoja firma robi lepiej niż konkurencja z okolicy?",
    "Kim jest klient, który zostawia u Ciebie najwięcej pieniędzy?",
    "Jakie trzy słowa mają przyjść do głowy, gdy ktoś zobaczy logo?",
    "Czy planujesz nowe usługi albo wejście na inne miasta?",
];

const faqSchema = faqPageSchema(faqs);

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Projektowanie Logo i Identyfikacja Wizualna",
    "description": "Projektowanie logo, logotypów i pełnej identyfikacji wizualnej dla firm i freelancerów. Projekt od zera, pliki wektorowe, prawa autorskie w cenie.",
    "provider": {
        "@type": "Person",
        "name": "Mateusz Machoś",
        "url": "https://wuyo.pl",
        "jobTitle": "Projektant Graficzny",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rzeszów",
            "addressRegion": "Podkarpacie",
            "addressCountry": "PL",
        },
    },
    "areaServed": ["Rzeszów", "Polska", "Europa"],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Usługi projektowania logo",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Logotyp (baza)" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "890", "priceCurrency": "PLN", "minPrice": "890" },
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Logo + mini księga znaku" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "1190", "priceCurrency": "PLN" },
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Pełna Identyfikacja Wizualna" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "1490", "priceCurrency": "PLN" },
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Lifting istniejącego logo" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "1000", "priceCurrency": "PLN", "minPrice": "1000" },
            },
        ],
    },
    "url": "https://wuyo.pl/logo",
    "aggregateRating": BUSINESS_RATING,
};

const packages = [
    {
        name: "Logotyp",
        price: "od 890 zł",
        desc: "Podstawa: logo gotowe do użycia od razu.",
        includes: [
            "Logo w kolorze i w wersji czarno-białej",
            "Sam znak (na ikonkę strony i zdjęcie profilowe)",
            "Paleta kolorów (HEX + CMYK)",
            "Fonty firmowe",
            "Pliki: SVG, PNG, PDF",
            "Prawa autorskie majątkowe",
        ],
        highlight: false,
    },
    {
        name: "Logo + mini księga znaku",
        price: "1 190 zł",
        desc: "Logo z zasadami użycia. Drukarnia, hafciarnia czy grawer wiedzą, jak znak ma wyglądać.",
        includes: [
            "Wszystko z pakietu Logotyp, a do tego:",
            "Mini księga znaku (PDF)",
            "Pole ochronne i minimalna wielkość",
            "Kolory HEX, RGB i CMYK",
            "Czego z logo nie robić",
        ],
        highlight: false,
    },
    {
        name: "Identyfikacja Wizualna",
        price: "1 490 zł",
        desc: "Pakiet Marka Start: logo i wszystko, czego firma potrzebuje od pierwszego dnia.",
        includes: [
            "Wszystko z pakietu Logotyp, a do tego:",
            "Mini księga znaku (kolory, fonty, zasady)",
            "150 wizytówek: projekt dwustronny i druk",
            "Stopka mailowa gotowa do wklejenia",
            "Pliki źródłowe (Figma / AI)",
        ],
        highlight: true,
    },
    {
        name: "Lifting Logo",
        price: "od 1 000 zł",
        desc: "Masz logo, ale coś nie gra? Odświeżam je tak, żeby klienci dalej je rozpoznawali.",
        includes: [
            "Analiza obecnego logo",
            "Propozycja odświeżenia",
            "Nowe pliki we wszystkich formatach",
            "Odświeżone kolory i fonty",
            "Prawa autorskie majątkowe",
        ],
        highlight: false,
    },
];

const process = [
    {
        n: "01",
        title: "Brief",
        desc: "Rozmawiamy o Twojej firmie: kto jest klientem, jaka jest konkurencja, co ma mówić logo. Sprawdzam też, jak wyglądają znaki firm z Twojej branży w okolicy, żeby Twoje się od nich odróżniało. Bez tego etapu nie zaczynam rysować.",
    },
    {
        n: "02",
        title: "Moodboard",
        desc: "Pokazuję kierunek: styl, kolory, nastrój. Akceptujesz go, zanim powstanie pierwsze logo.",
    },
    {
        n: "03",
        title: "Projekt",
        desc: "3 koncepcje do wyboru: jedna główna, dopracowana pod Twój brief, i 2 alternatywne kierunki. Przy każdej tłumaczę, dlaczego wygląda tak, a nie inaczej.",
    },
    {
        n: "04",
        title: "Poprawki",
        desc: "Poprawki wybranej koncepcji są w cenie. Pracujemy, aż zaakceptujesz projekt. Z dobrym briefem trafiam za pierwszym razem.",
    },
    {
        n: "05",
        title: "Pliki i dokumentacja",
        desc: "Komplet plików oraz księga znaku albo prosta rozpiska kolorów i fontów. Gotowe do użycia wszędzie.",
    },
];

export default function LogoPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* Hero */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Rzeszów · Podkarpacie · cała Polska</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Projektowanie logo<br className="hidden md:block" /> <span className="text-gold">w Rzeszowie</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Logo ma działać, a nie tylko ładnie wyglądać. Każde projektuję od zera dla konkretnej firmy, bez szablonów, i oddaję z kompletem plików.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block">
                            Zamów wycenę. Odpiszę w 24 godziny
                        </a>
                    </div>
                </AnimatedSection>
            </section>

            {/* Social proof */}
            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "5,0", label: "ocena w Google" },
                            { stat: "24h", label: "na wycenę" },
                            { stat: "100%", label: "pliki wektorowe w cenie" },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Co dostajesz */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Zakres prac</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Co dostajesz w każdym projekcie logo</h2>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: <Layers size={22} className="text-gold" />,
                                title: "Logo we wszystkich wariantach",
                                desc: "Wersja kolorowa i czarno-biała, sam znak oraz warianty na ciemne i jasne tło. Gotowe do użycia na każdym materiale.",
                            },
                            {
                                icon: <Palette size={22} className="text-gold" />,
                                title: "Paleta kolorów z wartościami",
                                desc: "HEX (strony, social media), CMYK (druk offsetowy), RGB (ekrany, prezentacje). Bez zgadywania w drukarni.",
                            },
                            {
                                icon: <Type size={22} className="text-gold" />,
                                title: "Typografia firmowa",
                                desc: "Dobrane fonty, które pasują do logo: do nagłówków i do tekstu. Z linkami do pobrania lub licencją komercyjną.",
                            },
                            {
                                icon: <FileText size={22} className="text-gold" />,
                                title: "Pełen pakiet plików",
                                desc: "SVG (wektorowy, skalowalny), PNG z przezroczystym tłem, PDF (druk). Pliki źródłowe (Figma/AI) na życzenie.",
                            },
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.1}>
                                <div className="glass-card p-6 flex gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                        <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                    <AnimatedSection className="mt-6">
                        <div className="glass-card p-5 flex items-center gap-3 border-l-2 border-gold">
                            <CheckCircle2 size={18} className="text-gold shrink-0" />
                            <p className="text-white/70 text-sm">
                                <strong className="text-white">Prawa autorskie majątkowe</strong> przechodzą na Ciebie razem z plikami. Bez ukrytych opłat za „licencję”.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Pakiety */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Cennik</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pakiety i ceny</h2>
                        <p className="text-white/50 max-w-xl mx-auto">Wycena = cena końcowa. Bez ukrytych kosztów, bez niespodzianek po fakturze.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {packages.map((pkg, i) => (
                            <AnimatedSection key={i} delay={i * 0.1}>
                                <div className={`glass-card p-6 flex flex-col h-full ${pkg.highlight ? "border border-gold/30" : ""}`}>
                                    {pkg.highlight && (
                                        <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">Najczęściej wybierany</p>
                                    )}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                        <p className={`text-2xl font-bold ${pkg.highlight ? "text-gold" : "text-white/80"}`}>{pkg.price}</p>
                                    </div>
                                    <p className="text-white/50 text-sm mb-5 leading-relaxed">{pkg.desc}</p>
                                    <ul className="space-y-2 flex-1">
                                        {pkg.includes.map((item, ii) => (
                                            <li key={ii} className="flex items-start gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={13} className="text-green-400 shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href="/#kontakt"
                                        className={`mt-6 block text-center py-2.5 rounded-full text-sm font-bold transition-colors ${pkg.highlight
                                            ? "btn-gold"
                                            : "border border-white/10 text-white/70 hover:border-white/30 hover:text-white"
                                        }`}
                                    >
                                        Zamów wycenę
                                    </a>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Proces */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Jak to działa</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Proces projektowania logo</h2>
                    </AnimatedSection>
                    <div className="space-y-4">
                        {process.map((step, i) => (
                            <AnimatedSection key={i} delay={i * 0.08}>
                                <div className="flex gap-5">
                                    <div className="shrink-0 w-11 h-11 rounded-full border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">
                                        {step.n}
                                    </div>
                                    <div className="glass-card p-5 flex-1">
                                        <h3 className="font-bold text-white mb-1">{step.title}</h3>
                                        <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                    <AnimatedSection className="mt-6">
                        <div className="glass-card p-5 text-center">
                            <p className="text-white/60 text-sm">
                                Średni czas realizacji: <strong className="text-white">7–10 dni roboczych</strong> od zatwierdzenia briefu.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Jak się przygotować */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Przed zamówieniem</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Jak przygotować się do zamówienia logo</h2>
                        <p className="text-white/50 max-w-2xl mx-auto mt-4">
                            Nie musisz znać się na grafice. Wystarczy 15 minut i kilka rzeczy z tej listy. O resztę dopytam w rozmowie.
                        </p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        <AnimatedSection>
                            <div className="glass-card p-6 h-full">
                                <h3 className="font-bold text-white mb-4">Co warto mieć przy sobie</h3>
                                <ul className="space-y-3">
                                    {prepare.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-white/65 text-sm leading-relaxed">
                                            <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </AnimatedSection>
                        <AnimatedSection delay={0.1}>
                            <div className="glass-card p-6 h-full">
                                <h3 className="font-bold text-white mb-4">O co zapytam w briefie</h3>
                                <ul className="space-y-3">
                                    {briefQuestions.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-white/65 text-sm leading-relaxed">
                                            <ArrowRight size={15} className="text-gold shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-white/45 text-xs mt-5 leading-relaxed">
                                    Nie ma złych odpowiedzi. Więcej o tym, jak napisać brief, przeczytasz w{" "}
                                    <Link href="/blog/jak-napisac-brief-dla-projektanta" className="text-gold hover:underline">poradniku o briefie</Link>.
                                </p>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Lokalnie — Rzeszów */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Lokalnie</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Projektowanie logo dla firm z Rzeszowa</h2>
                        <p className="text-white/50 max-w-2xl mx-auto mt-4">
                            Logo robię sam, od briefu do gotowych plików, bez pośredników. Pracuję z Rzeszowa, dla firm z Podkarpacia i całej Polski.
                        </p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                title: "Piszesz do mnie, nie do firmy",
                                desc: "Nie ma działu obsługi ani project managera. Rozmawiasz z osobą, która projektuje Twoje logo.",
                            },
                            {
                                title: "Logo od razu na wizytówkach",
                                desc: "Wizytówki drukuję u siebie. Pakiet Marka Mini: logo + 100 wizytówek z projektem i drukiem za 1 090 zł.",
                            },
                            {
                                title: "Cena znana przed startem",
                                desc: "Dostajesz stałą wycenę, nie stawkę godzinową. Poprawki wybranej koncepcji są w cenie.",
                            },
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.08}>
                                <div className="glass-card p-5 h-full">
                                    <h3 className="font-bold text-white text-sm mb-2">{item.title}</h3>
                                    <p className="text-white/55 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                    <AnimatedSection className="mt-6 text-center">
                        <p className="text-white/50 text-sm">
                            Potrzebujesz więcej niż logo? Zobacz, co robię jako{" "}
                            <Link href="/grafik-rzeszow" className="text-gold hover:underline">grafik w Rzeszowie</Link>
                            {" "}i jak wygląda{" "}
                            <Link href="/druk-rzeszow" className="text-gold hover:underline">druk w Rzeszowie</Link>.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Dla kogo */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Dla kogo</p>
                        <h2 className="text-3xl font-bold text-white">Projektuję logo dla firm każdej wielkości</h2>
                    </AnimatedSection>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { who: "Nowe firmy", desc: "Pierwsze logo, które przyciąga klientów, a nie ich odstrasza." },
                            { who: "Freelancerzy", desc: "Marka osobista, którą możesz pokazać na wizytówce i LinkedInie." },
                            { who: "Lokalne biznesy", desc: "Logo, które dobrze wygląda na szyldzie, samochodzie i stronie." },
                            { who: "Sklepy i e-commerce", desc: "Znak, który budzi zaufanie przed pierwszym zakupem." },
                            { who: "Rebranding", desc: "Gdy firma wyrosła ze starego logo. Odświeżam markę tak, żeby klienci dalej ją rozpoznawali." },
                            { who: "Klienci zagraniczni", desc: "Projektuję dla firm z Europy i świata. Rozmawiamy po angielsku." },
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.07}>
                                <div className="glass-card p-5">
                                    <h3 className="font-bold text-white text-sm mb-2">{item.who}</h3>
                                    <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Opinie */}
            <TestimonialsSection />

            {/* Blog CTA */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex-1">
                                <p className="text-white/60 text-xs mb-1">Z bloga</p>
                                <p className="font-bold text-white mb-1">Przeczytaj, zanim zapłacisz</p>
                                <p className="text-white/50 text-sm">Ile kosztuje logo i jak wybrać projektanta żeby nie żałować.</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <Link href="/blog/ile-kosztuje-logo" className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all">
                                    Ile kosztuje logo? <ArrowRight size={14} />
                                </Link>
                                <Link href="/blog/jak-wybrac-projektanta-logo" className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all">
                                    Jak wybrać projektanta? <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Kontakt */}
            <PageFaq items={faqs} title="Pytania o projekt logo" />

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </main>
    );
}
