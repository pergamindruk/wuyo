import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Zap, Shield, Search } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Strony Internetowe Rzeszów – od 1 800 zł | Next.js, SEO | WUYO",
    description: "Tworzę strony internetowe dla firm z Rzeszowa. Next.js – ładuje się w <1s, SEO wbudowane od zera. One-page od 1 800 zł, multi-page od 2 900 zł. Stała cena, wycena w 24h →",
    keywords: [
        "strony internetowe Rzeszów",
        "tworzenie stron internetowych Rzeszów",
        "web design Rzeszów",
        "strony www Rzeszów",
        "projektowanie stron Rzeszów",
        "strony internetowe dla firm Rzeszów",
        "Next.js Rzeszów",
        "web developer Rzeszów",
    ],
    openGraph: {
        title: "Strony Internetowe Rzeszów | WUYO – Next.js, SEO, szybkie",
        description: "Strony internetowe dla firm z Rzeszowa. Next.js, szybkie, SEO. One-page od 1 800 zł. Wycena w 24h.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/strony-internetowe-rzeszow",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Strony Internetowe Rzeszów | WUYO",
        description: "Tworzę strony www dla firm z Rzeszowa. Next.js, SEO, szybkie. Od 1 800 zł.",
        images: ["/og-image.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/strony-internetowe-rzeszow" },
};

const localSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tworzenie Stron Internetowych – Rzeszów",
    "description": "Projektowanie i programowanie stron internetowych dla firm z Rzeszowa i Podkarpacia. Next.js, szybkie ładowanie, SEO techniczne, responsywne.",
    "provider": {
        "@type": "LocalBusiness",
        "name": "WUYO – Dobra Grafa",
        "url": "https://wuyo.pl",
        "telephone": "+48725182053",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rzeszów",
            "addressRegion": "Podkarpacie",
            "postalCode": "35-203",
            "addressCountry": "PL",
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": "5",
            "reviewCount": "5",
        },
    },
    "areaServed": [
        { "@type": "City", "name": "Rzeszów" },
        { "@type": "AdministrativeArea", "name": "Podkarpacie" },
        { "@type": "Country", "name": "Polska" },
    ],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Pakiety stron internetowych",
        "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Strona One-Page" }, "priceSpecification": { "@type": "PriceSpecification", "price": "1800", "priceCurrency": "PLN" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Strona Firmowa Multi-Page" }, "priceSpecification": { "@type": "PriceSpecification", "price": "2900", "priceCurrency": "PLN" } },
        ],
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile kosztuje strona internetowa w Rzeszowie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Strona One-Page od 1 800 zł, strona firmowa Multi-Page od 2 900 zł. Każda wycena jest stała — znasz kwotę przed startem. Nie ma stawki godzinowej ani niespodzianek po fakturze.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy tworzysz strony dla firm spoza Rzeszowa?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak — większość projektów realizuję zdalnie. Rzeszów i Podkarpacie to moja baza, ale obsługuję firmy z całej Polski. Cały kontakt przez WhatsApp, Messenger lub e-mail.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile trwa zbudowanie strony internetowej?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "One-Page: ok. tydzień od zatwierdzenia projektu graficznego. Multi-Page: 2–3 tygodnie. Czas zależy głównie od szybkości dostarczenia treści z Twojej strony.",
            },
        },
        {
            "@type": "Question",
            "name": "Dlaczego Next.js zamiast WordPressa?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Next.js ładuje się poniżej 1 sekundy, nie wymaga aktualizacji pluginów i nie ma backendu do zhackowania. WordPress jest wygodniejszy do edycji, ale gorszy dla SEO, bezpieczeństwa i szybkości — a to te trzy rzeczy decydują o tym, czy strona generuje klientów.",
            },
        },
    ],
};

const packages = [
    {
        name: "One-Page",
        price: "od 1 800 zł",
        time: "~tydzień",
        desc: "Jedna strona, jeden cel. Idealna dla freelancerów, coachów i nowych firm, które chcą szybko zaistnieć w sieci.",
        items: ["Projekt graficzny UI/UX", "Next.js + React", "Formularz kontaktowy", "SEO on-page", "Wdrożenie na hostingu klienta"],
        highlight: false,
    },
    {
        name: "Multi-Page",
        price: "od 2 900 zł",
        time: "2–3 tygodnie",
        desc: "Serwis z podstronami, blogiem i SEO pod wiele fraz. Dla firm które chcą rosnąć organicznie w Google.",
        items: ["Wszystko z One-Page +", "Podstrony usług z SEO", "Blog gotowy do publikacji", "Schema markup JSON-LD", "Google Search Console setup"],
        highlight: true,
    },
];

export default function StronyInternetowerRzeszowPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* HERO */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <div className="inline-flex items-center gap-2 text-gold/80 text-sm font-medium mb-5 border border-gold/20 bg-gold/5 px-4 py-1.5 rounded-full">
                        <MapPin size={13} />
                        Rzeszów · Podkarpacie · cała Polska
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Strony internetowe<br className="hidden md:block" />
                        <span className="text-gold">dla firm z Rzeszowa</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Piszę kod od zera — żadnego WordPressa, żadnych pluginów. Strona ładuje się w poniżej sekundy, Google ją widzi od pierwszego dnia, a Ty masz stałą cenę przed startem.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block shadow-[0_0_20px_rgba(255,235,82,0.3)]">
                            Napisz — wycena w 24h
                        </a>
                        <Link href="/strony-www" className="px-8 py-3.5 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">
                            Pełna oferta stron →
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* STATS */}
            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "< 1s", label: "czas ładowania (LCP)" },
                            { stat: "od 1 800 zł", label: "strona One-Page" },
                            { stat: "24h", label: "czas na wycenę" },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* PAKIETY */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Cennik</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Pakiety stron internetowych</h2>
                        <p className="text-white/50 max-w-xl mx-auto mt-4">Wycena = cena końcowa. Bez stawki godzinowej, bez niespodzianek po fakturze.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {packages.map((pkg, i) => (
                            <AnimatedSection key={i} delay={i * 0.1}>
                                <div className={`glass-card p-7 flex flex-col h-full ${pkg.highlight ? "border border-gold/30" : ""}`}>
                                    {pkg.highlight && <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">Najczęściej wybierany</p>}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                        <p className={`text-2xl font-bold ${pkg.highlight ? "text-gold" : "text-white/80"}`}>{pkg.price}</p>
                                        <p className="text-white/30 text-xs mt-1">⏱ {pkg.time}</p>
                                    </div>
                                    <p className="text-white/55 text-sm mb-5 leading-relaxed">{pkg.desc}</p>
                                    <ul className="space-y-2 flex-1">
                                        {pkg.items.map((item, ii) => (
                                            <li key={ii} className="flex items-center gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="/#kontakt" className={`mt-6 block text-center py-2.5 rounded-full text-sm font-bold transition-colors ${pkg.highlight ? "btn-gold" : "border border-white/10 text-white/70 hover:border-white/30 hover:text-white"}`}>
                                        Zamów wycenę
                                    </a>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* DLACZEGO NEXT.JS */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Technologia</p>
                        <h2 className="text-3xl font-bold text-white">Co zyskujesz zamiast WordPressa</h2>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { icon: <Zap size={20} className="text-gold" />, title: "Ładuje się w < 1s", desc: <span>Każda dodatkowa sekunda ładowania to -7% konwersji. Sprawdź swoją aktualną stronę w <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold underline decoration-dotted">PageSpeed Insights</a> — jeśli wynik to mniej niż 90, czas coś zmienić.</span> },
                            { icon: <Search size={20} className="text-gold" />, title: "SEO od pierwszej linii", desc: "Google widzi pełen content od razu. Metadata, Open Graph, Schema markup — wbudowane w kod, nie jako plugin." },
                            { icon: <Shield size={20} className="text-gold" />, title: "Zero problemów z bezpieczeństwem", desc: <span>Nie ma backendu wystawionego na świat. <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold underline decoration-dotted">Next.js</a> generuje statyczne pliki — nie ma czego hakować i nie ma cotygodniowych aktualizacji pluginów.</span> },
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.08}>
                                <div className="glass-card p-6">
                                    <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mb-3">{item.icon}</div>
                                    <h3 className="font-bold text-white mb-2 text-sm">{item.title}</h3>
                                    <p className="text-white/55 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">FAQ</p>
                        <h2 className="text-3xl font-bold text-white">Pytania o strony internetowe w Rzeszowie</h2>
                    </AnimatedSection>
                    <div className="space-y-4">
                        {[
                            { q: "Ile kosztuje strona internetowa w Rzeszowie?", a: "One-Page od 1 800 zł, Multi-Page od 2 900 zł. Stała cena przed startem — nie stawka godzinowa." },
                            { q: "Ile trwa budowa strony?", a: "One-Page ok. tydzień, Multi-Page 2–3 tygodnie. Czas zależy głównie od szybkości dostarczenia treści." },
                            { q: "Obsługujesz firmy spoza Rzeszowa?", a: "Tak — wszystko idzie zdalnie. Rzeszów to moja baza, ale pracuję dla firm z całej Polski." },
                            { q: "Czy mogę samodzielnie edytować treści?", a: "Tak — dla Multi-Page podłączam lekki CMS. Do One-Page wystarczy napisanie do mnie, drobne zmiany wchodzą w zakres wsparcia." },
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.06}>
                                <div className="glass-card p-5">
                                    <h3 className="font-bold text-white mb-2 text-sm">{item.q}</h3>
                                    <p className="text-white/55 text-sm leading-relaxed">{item.a}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CROSS-SELL */}
            <section className="py-12 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 md:p-8 grid md:grid-cols-3 gap-6 text-center border border-white/5">
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Potrzebujesz też logo?</p>
                                <Link href="/logo" className="font-bold text-white hover:text-gold transition-colors text-sm">Logo dla firmy →</Link>
                                <p className="text-white/40 text-xs mt-1">od 800 zł · projekt od zera</p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Cennik szczegółowy</p>
                                <Link href="/cennik" className="font-bold text-white hover:text-gold transition-colors text-sm">Pełny cennik →</Link>
                                <p className="text-white/40 text-xs mt-1">wszystkie usługi i pakiety</p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Grafik z Rzeszowa</p>
                                <Link href="/grafik-rzeszow" className="font-bold text-white hover:text-gold transition-colors text-sm">O studio WUYO →</Link>
                                <p className="text-white/40 text-xs mt-1">logo · strony · druk</p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* BLOG */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex-1">
                                <p className="text-white/40 text-xs mb-1">Z bloga</p>
                                <p className="font-bold text-white mb-1">Zanim zdecydujesz — przeczytaj</p>
                                <p className="text-white/50 text-sm">One-page czy multi-page, ile kosztuje strona i jak wybrać wykonawcę.</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <Link href="/blog/strona-one-page-czy-multi-page" className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all">
                                    One page czy multi page? <ArrowRight size={14} />
                                </Link>
                                <Link href="/blog/ile-kosztuje-strona-internetowa" className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all">
                                    Ile kosztuje strona? <ArrowRight size={14} />
                                </Link>
                                <Link href="/blog/kto-robi-strony-internetowe-w-rzeszowie" className="inline-flex items-center gap-2 text-gold text-sm font-bold hover:gap-3 transition-all">
                                    Kto robi strony w Rzeszowie? <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* OPINIE */}
            <TestimonialsSection />

            {/* KONTAKT */}
            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </main>
    );
}
