import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Layers, FileText, Palette, Type } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";

export const metadata: Metadata = {
    title: "Projektowanie Logo dla Firm | WUYO – Rzeszów i cała Polska",
    description: "Projektuję logo które działa — na wizytówce, stronie i szyldzie. Logotyp od 800 zł, pełna identyfikacja od 2 500 zł. Sprawdź proces i zamów wycenę w 24h.",
    openGraph: {
        title: "Projektowanie Logo dla Firm | WUYO",
        description: "Logo z procesem, plikami wektorowymi i prawami autorskimi. Od 800 zł — Rzeszów i cała Polska.",
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/logo",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Projektowanie Logo dla Firm | WUYO",
        description: "Logo od 800 zł — pełen pakiet plików, CMYK, prawa autorskie. Rzeszów i cała Polska.",
        images: ["/logo_wuya2.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/logo" },
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Projektowanie Logo i Identyfikacja Wizualna",
    "description": "Projektowanie logo, logotypów i pełnej identyfikacji wizualnej dla firm i freelancerów. Dedykowany projekt, pliki wektorowe, prawa autorskie w cenie.",
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
                "priceSpecification": { "@type": "PriceSpecification", "price": "800", "priceCurrency": "PLN", "minPrice": "800" },
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Pełna Identyfikacja Wizualna" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "2500", "priceCurrency": "PLN", "minPrice": "2500" },
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Lifting istniejącego logo" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "1000", "priceCurrency": "PLN", "minPrice": "1000" },
            },
        ],
    },
    "url": "https://wuyo.pl/logo",
};

const packages = [
    {
        name: "Logotyp",
        price: "od 800 zł",
        desc: "Punkt wyjścia — profesjonalne logo gotowe do użycia od razu.",
        includes: [
            "Logo (wersja kolorowa + monochromatyczna)",
            "Sygnet / ikona (favicon, avatar)",
            "Paleta kolorów (HEX + CMYK)",
            "Typografia firmowa",
            "Pliki: SVG, PNG, PDF",
            "Prawa autorskie majątkowe",
        ],
        highlight: false,
    },
    {
        name: "Identyfikacja Wizualna",
        price: "od 2 500 zł",
        desc: "Pełny system wizualny — logo plus wszystko co potrzebne do spójnej komunikacji.",
        includes: [
            "Wszystko z pakietu Logotyp +",
            "Wizytówka (projekt + druk-ready)",
            "Papier firmowy A4",
            "Stopka e-mail",
            "Szablony social media (3 formaty)",
            "Księga znaku (brand guidelines PDF)",
            "Pliki źródłowe (Figma / AI)",
        ],
        highlight: true,
    },
    {
        name: "Lifting Logo",
        price: "od 1 000 zł",
        desc: "Masz logo ale coś nie gra? Odświeżam bez zmiany tożsamości marki.",
        includes: [
            "Analiza obecnego logo",
            "Propozycja modernizacji",
            "Nowe pliki we wszystkich formatach",
            "Zaktualizowane kolory i typografia",
            "Prawa autorskie majątkowe",
        ],
        highlight: false,
    },
];

const process = [
    {
        n: "01",
        title: "Brief",
        desc: "Rozmowa o Twojej firmie — kto jest klientem, jaka jest konkurencja, co ma komunikować logo. Bez tego etapu nie zaczynam rysować.",
    },
    {
        n: "02",
        title: "Moodboard",
        desc: "Kierunek wizualny do zatwierdzenia — styl, kolorystyka, nastrój. Zatwierdzasz zanim powstanie pierwsze logo.",
    },
    {
        n: "03",
        title: "Projekt",
        desc: "2–3 koncepcje logo do wyboru. Każda z uzasadnieniem decyzji projektowych — nie tylko estetyka.",
    },
    {
        n: "04",
        title: "Poprawki",
        desc: "2 rundy poprawek wybranej koncepcji. Dobry brief = trafienie w oczekiwania za pierwszym razem.",
    },
    {
        n: "05",
        title: "Pliki i dokumentacja",
        desc: "Pełen pakiet eksportów + księga znaku lub podstawowa dokumentacja kolorów i fontów. Gotowe do użycia wszędzie.",
    },
];

export default function LogoPage() {
    return (
        <main className="flex-1 w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />

            {/* Hero */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Projektowanie Logo · Rzeszów & cała Polska</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Logo które <span className="text-gold">działa</span> —<br className="hidden md:block" /> nie tylko wygląda
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Projektuję logo z procesem, strategią i pełnym pakietem plików. Żadnych szablonów — każde logo powstaje od zera dla konkretnej firmy.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block">
                            Zamów wycenę — odpiszę w 24h
                        </a>
                        <Link href="/cennik" className="px-8 py-3.5 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">
                            Zobacz pełny cennik
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* Social proof */}
            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "156+", label: "zaprojektowanych logo" },
                            { stat: "46", label: "obsłużonych branż" },
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
                                desc: "Wersja kolorowa, monochromatyczna (czarno-biała), sygnet/ikona i warianty na ciemne/jasne tło. Gotowe na każdy nośnik.",
                            },
                            {
                                icon: <Palette size={22} className="text-gold" />,
                                title: "Paleta kolorów z wartościami",
                                desc: "HEX (strony, social media), CMYK (druk offsetowy), RGB (ekrany, prezentacje). Żadnych zgadywanek przy drukarni.",
                            },
                            {
                                icon: <Type size={22} className="text-gold" />,
                                title: "Typografia firmowa",
                                desc: "Dobrane fonty które współgrają z logo — nagłówkowy i treści. Z linkami do pobrania lub licencją komercyjną.",
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
                                <strong className="text-white">Prawa autorskie majątkowe</strong> — przenoszone na Ciebie wraz z dostarczeniem plików. Bez ukrytych opłat za "licencję".
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Pakiety */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Cennik</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pakiety i ceny</h2>
                        <p className="text-white/50 max-w-xl mx-auto">Wycena = cena końcowa. Bez ukrytych kosztów, bez niespodzianek po fakturze.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-3 gap-6">
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
                                Średni czas realizacji: <strong className="text-white">10–14 dni roboczych</strong> od zatwierdzenia briefu.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Dla kogo */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Dla kogo</p>
                        <h2 className="text-3xl font-bold text-white">Projektuję logo dla firm każdej wielkości</h2>
                    </AnimatedSection>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { who: "Startupy i nowe firmy", desc: "Pierwsze logo które otwiera drzwi do klientów zamiast je zamykać." },
                            { who: "Freelancerzy", desc: "Marka osobista którą można pokazać na wizytówce i LinkedIn." },
                            { who: "Lokalne biznesy", desc: "Logo które działa na szyldzie, samochodzie i stronie — bez kompromisów." },
                            { who: "Sklepy i e-commerce", desc: "Rozpoznawalny znak który buduje zaufanie przed pierwszym zakupem." },
                            { who: "Rebranding", desc: "Odświeżenie marki bez utraty rozpoznawalności — gdy firma wyrosła ze starego logo." },
                            { who: "Klienci zagraniczni", desc: "Projekty dla firm z Europy i świata — komunikacja w języku angielskim." },
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

            {/* Blog CTA */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex-1">
                                <p className="text-white/40 text-xs mb-1">Z bloga</p>
                                <p className="font-bold text-white mb-1">Zanim zapłacisz — przeczytaj</p>
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

            {/* CTA główny */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-12 text-center border border-gold/20">
                            <p className="eyebrow mb-4">Gotowy na logo które działa?</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Opisz mi swój biznes — wycenię w 24h
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
                                Bez automatycznych odpowiedzi i cenników do uzupełnienia. Piszesz mi o firmie, odpowiadam z konkretną wyceną i terminem.
                            </p>
                            <a href="/#kontakt" className="btn-gold px-10 py-4 rounded-full font-bold inline-block text-lg">
                                Zamów logo →
                            </a>
                            <p className="text-white/30 text-xs mt-4">Bezpłatna wycena · Odpowiedź w 24h · Bez zobowiązań</p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>
        </main>
    );
}
