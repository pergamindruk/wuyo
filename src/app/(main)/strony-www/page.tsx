import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, Shield, Search, Smartphone } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";

export const metadata: Metadata = {
    title: "Tworzenie Stron Internetowych dla Firm | WUYO – Rzeszów",
    description: "Tworzę strony www na Next.js — szybkie, responsywne i zoptymalizowane pod SEO. Strona one-page od 1 200 zł, multi-page od 2 900 zł. Rzeszów i cała Polska.",
    openGraph: {
        title: "Tworzenie Stron Internetowych dla Firm | WUYO",
        description: "Strony www na Next.js — szybkie, SEO-friendly, bez WordPressa i pluginów. Od 1 200 zł.",
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/strony-www",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Tworzenie Stron Internetowych dla Firm | WUYO",
        description: "Strony firmowe od 1 200 zł — Next.js, szybkie, SEO, responsywne. Rzeszów i cała Polska.",
        images: ["/logo_wuya2.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/strony-www" },
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tworzenie Stron Internetowych dla Firm",
    "description": "Projektowanie i programowanie stron internetowych na Next.js — one-page, multi-page, sklepy e-commerce. Szybkie, responsywne, zoptymalizowane pod SEO.",
    "provider": {
        "@type": "Person",
        "name": "Mateusz Machoś",
        "url": "https://wuyo.pl",
        "jobTitle": "Web Developer & Projektant",
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
        "name": "Usługi tworzenia stron internetowych",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Strona One-Page" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "1200", "priceCurrency": "PLN", "minPrice": "1200" },
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Strona Firmowa Multi-Page" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "2900", "priceCurrency": "PLN", "minPrice": "2900" },
            },
        ],
    },
    "url": "https://wuyo.pl/strony-www",
};

const packages = [
    {
        name: "Strona One-Page",
        price: "od 1 200 zł",
        desc: "Jedna strona, jeden cel — maksymalna konwersja. Idealna dla freelancerów, coachów, nowych biznesów.",
        includes: [
            "Dedykowany projekt graficzny (UI/UX)",
            "Next.js + React (szybkie ładowanie)",
            "Responsywność (mobile first)",
            "Formularz kontaktowy",
            "Podstawowe SEO on-page",
            "Optymalizacja obrazów (WebP/AVIF)",
            "Deploy na Vercel (darmowy hosting)",
        ],
        time: "1–2 tygodnie",
        highlight: false,
    },
    {
        name: "Strona Firmowa Multi-Page",
        price: "od 2 900 zł",
        desc: "Pełny serwis z podstronami, blogiem i SEO pod wiele fraz. Dla firm które chcą rosnąć organicznie.",
        includes: [
            "Wszystko z one-page +",
            "Architektura URL pod SEO",
            "Podstrony usług z osobnym SEO",
            "Blog gotowy do publikacji",
            "Schema markup (JSON-LD)",
            "Sitemap + robots.txt",
            "Google Search Console setup",
        ],
        time: "3–5 tygodni",
        highlight: true,
    },
    {
        name: "UI/UX Design",
        price: "od 100 zł / sekcja",
        desc: "Sam projekt graficzny strony — jeśli masz własny team deweloperski lub chcesz wycenić samą grafikę.",
        includes: [
            "Projekt w Figma",
            "Desktop + mobile",
            "Style guide (kolory, fonty, komponenty)",
            "Przekazanie plików deweloperowi",
            "Eksport assetów",
        ],
        time: "Wycena ind.",
        highlight: false,
    },
];

const techStack = [
    { name: "Next.js 16", desc: "Framework React — szybki rendering, SEO-friendly, gotowy na skalowanie." },
    { name: "React 19", desc: "Komponenty, interaktywność, wydajność. Standard w nowoczesnym web dev." },
    { name: "TypeScript", desc: "Bezpieczny kod bez błędów typowania — mniej bugów w produkcji." },
    { name: "Tailwind CSS", desc: "Spójny design system, lekkie style, bez zbędnego CSS." },
    { name: "Vercel", desc: "Hosting z CDN, auto-deploy z Git, darmowy SSL. Globalnie szybki." },
    { name: "Framer Motion", desc: "Płynne animacje które nie spowalniają strony." },
];

const process = [
    {
        n: "01",
        title: "Brief i analiza",
        desc: "Rozmowa o celu strony, grupie docelowej, konkurencji i słowach kluczowych. Strona bez strategii to strona bez ruchu.",
    },
    {
        n: "02",
        title: "Projekt graficzny (UI)",
        desc: "Makieta w Figma — struktura, kolory, typografia, rozmieszczenie elementów. Zatwierdzasz wygląd zanim zacznę kodować.",
    },
    {
        n: "03",
        title: "Programowanie",
        desc: "Kodowanie w Next.js. Responsywność, optymalizacja obrazów, formularze, animacje — wszystko w jednym.",
    },
    {
        n: "04",
        title: "SEO i testy",
        desc: "Metadata, Open Graph, Schema markup, Sitemap, PageSpeed test. Strona musi nie tylko wyglądać — musi rankować.",
    },
    {
        n: "05",
        title: "Deploy i przekazanie",
        desc: "Wdrożenie na Vercel, setup domeny, Google Search Console, instrukcja obsługi. Jesteś właścicielem — masz dostęp do wszystkiego.",
    },
];

export default function StronyWwwPage() {
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
                    <p className="eyebrow mb-4">Tworzenie Stron WWW · Rzeszów & cała Polska</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Strony internetowe które<br className="hidden md:block" />
                        <span className="text-gold">pracują na Ciebie</span> 24/7
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Projektuję i programuję strony na Next.js — szybkie, responsywne i zoptymalizowane pod SEO od pierwszego dnia. Bez WordPressa, bez pluginów, bez niespodzianek.
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

            {/* Stats */}
            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "< 1s", label: "czas ładowania (LCP)" },
                            { stat: "100/100", label: "PageSpeed score" },
                            { stat: "Next.js", label: "framework bez kompromisów" },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Dlaczego Next.js */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Technologia</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Dlaczego Next.js zamiast WordPressa?</h2>
                        <p className="text-white/50 max-w-2xl mx-auto">WordPress jest wygodny dla właścicieli. Next.js jest lepszy dla Twojej firmy — szybszy, bezpieczniejszy i lepiej indeksowany przez Google.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {[
                            {
                                icon: <Zap size={22} className="text-gold" />,
                                title: "Szybkość która konwertuje",
                                desc: "Strona na Next.js ładuje się poniżej 1 sekundy. Każda sekunda opóźnienia to -7% konwersji (Google, 2024). WordPress z pluginami — 3–8 sekund.",
                            },
                            {
                                icon: <Search size={22} className="text-gold" />,
                                title: "SEO od pierwszej linii kodu",
                                desc: "Server-side rendering = Google widzi pełen content od razu. Metadata, Open Graph, Schema markup — wbudowane, nie dodawane przez plugin który może się posypać.",
                            },
                            {
                                icon: <Shield size={22} className="text-gold" />,
                                title: "Zero problemów z bezpieczeństwem",
                                desc: "WordPress ma 90%+ udział w atakach na strony CMS. Next.js to statyczny output — nie ma czego hackować. Nie ma bazy danych wystawionej na świat.",
                            },
                            {
                                icon: <Smartphone size={22} className="text-gold" />,
                                title: "Mobile first bez kompromisów",
                                desc: "Projektuję od telefonu w górę. Tailwind CSS gwarantuje perfekcyjne wyświetlanie na każdym urządzeniu — bez \"responsywnych pluginów\" które psują layout.",
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

                    {/* WP vs Next.js tabela */}
                    <AnimatedSection>
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-white/40 font-medium">Kryterium</th>
                                            <th className="text-center p-4 text-gold font-bold">Next.js (moje strony)</th>
                                            <th className="text-center p-4 text-white/40 font-medium">WordPress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { c: "Czas ładowania", a: "< 1s", b: "3–8s (zależy od pluginów)" },
                                            { c: "PageSpeed score", a: "90–100/100", b: "40–70/100 typowo" },
                                            { c: "Bezpieczeństwo", a: "Brak backendu = brak ataków", b: "Cotygodniowe aktualizacje pluginów" },
                                            { c: "SEO", a: "Wbudowane, spójne", b: "Plugin Yoast — zależy od konfiguracji" },
                                            { c: "Koszty utrzymania", a: "Hosting Vercel ~0 zł/mies.", b: "Hosting + SSL + domeny + pluginy premium" },
                                            { c: "Awarie / downtime", a: "Minimalne", b: "Aktualizacja pluginu może posypać stronę" },
                                            { c: "Edycja treści", a: "Prosto przez kod lub CMS", b: "Panel WordPress — wygodny" },
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="p-4 text-white/60">{row.c}</td>
                                                <td className="p-4 text-center text-green-400 font-medium text-xs">{row.a}</td>
                                                <td className="p-4 text-center text-white/40 text-xs">{row.b}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                    <div className="mb-1">
                                        <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                        <p className={`text-2xl font-bold ${pkg.highlight ? "text-gold" : "text-white/80"}`}>{pkg.price}</p>
                                        <p className="text-white/30 text-xs mt-1">⏱ {pkg.time}</p>
                                    </div>
                                    <p className="text-white/50 text-sm my-4 leading-relaxed">{pkg.desc}</p>
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

            {/* Tech stack */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Stack technologiczny</p>
                        <h2 className="text-3xl font-bold text-white">Czym buduję strony</h2>
                    </AnimatedSection>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {techStack.map((tech, i) => (
                            <AnimatedSection key={i} delay={i * 0.07}>
                                <div className="glass-card p-4">
                                    <p className="font-bold text-gold text-sm mb-1">{tech.name}</p>
                                    <p className="text-white/50 text-xs leading-relaxed">{tech.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Proces */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Jak to działa</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Proces tworzenia strony</h2>
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
                                <p className="text-white/40 text-xs mb-1">Z bloga</p>
                                <p className="font-bold text-white mb-1">Zanim zdecydujesz — przeczytaj</p>
                                <p className="text-white/50 text-sm">Ile kosztuje strona i kiedy one-page wystarczy, a kiedy multi-page to konieczność.</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <Link href="/blog/ile-kosztuje-strona-internetowa" className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all">
                                    Ile kosztuje strona? <ArrowRight size={14} />
                                </Link>
                                <Link href="/blog/strona-one-page-czy-multi-page" className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all">
                                    One-page czy multi-page? <ArrowRight size={14} />
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
                            <p className="eyebrow mb-4">Gotowy na stronę która generuje klientów?</p>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Opisz mi swój biznes — wycenię w 24h
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
                                Bez automatycznych odpowiedzi i formularzy briefu do wypełnienia. Piszesz mi o firmie, odpowiadam z konkretną wyceną i terminem.
                            </p>
                            <a href="/#kontakt" className="btn-gold px-10 py-4 rounded-full font-bold inline-block text-lg">
                                Zamów stronę →
                            </a>
                            <p className="text-white/30 text-xs mt-4">Bezpłatna wycena · Odpowiedź w 24h · Bez zobowiązań</p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>
        </main>
    );
}
