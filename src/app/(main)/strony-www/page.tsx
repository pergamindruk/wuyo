import type { Metadata } from "next";
import { seoMeta } from "@/lib/seo-overrides";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Zap, Shield, PenLine, ShoppingCart } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";
import { alternatesFor } from "@/lib/i18n";

const metadata: Metadata = {
    title: "Strony internetowe od 1 990 zł — Next.js i WordPress, SEO",
    description: "Strony na Next.js albo WordPressie — szybkie, z SEO od pierwszego dnia. Sklepy WooCommerce. One-page od 1 990 zł, multi-page od 2 990 zł. Wycena w 24h →",
    openGraph: {
        title: "Strony Internetowe od 1 990 zł | Next.js, WordPress, SEO | WUYO",
        description: "Strony na Next.js albo WordPressie — szybkie, z SEO od startu. Od 1 990 zł. Rzeszów i cała Polska.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/strony-www",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Tworzenie Stron Internetowych dla Firm | WUYO",
        description: "Strony firmowe od 1 990 zł — Next.js albo WordPress, szybkie, SEO, responsywne. Rzeszów i cała Polska.",
        images: ["/og-image.webp"],
    },
    alternates: alternatesFor("websites", "pl"),
};

// Tytuł i opis może podmienić SEO-radca (/lab/seo) bez wdrożenia.
export async function generateMetadata(): Promise<Metadata> {
    return seoMeta("/strony-www", metadata);
}

// Jedna tablica zasila widoczną sekcję FAQ i schemat FAQPage — Google
// wymaga, żeby dane strukturalne miały pokrycie w treści strony.
const faqs: FaqEntry[] = [
    {
        q: "Ile kosztuje strona internetowa?",
        a: "Strona One-Page od 1 990 zł, strona firmowa Multi-Page od 2 990 zł. Każda wycena jest stała — podaję konkretną kwotę przed startem prac, bez niespodzianek na fakturze.",
    },
    {
        q: "Ile trwa zbudowanie strony internetowej?",
        a: "Strona powstaje w 7–14 dni roboczych, zarówno jednostronicowa, jak i z podstronami. Czas zależy głównie od szybkości dostarczenia treści i feedbacku z Twojej strony.",
    },
    {
        q: "Czy będę mógł samodzielnie edytować treści na stronie?",
        a: "Tak. Jeśli chcesz sam dodawać wpisy, realizacje albo ofertę, zrobię stronę na WordPressie i pokażę Ci, jak korzystać z panelu. Przy stronie na Next.js możesz po prostu pisać do mnie — drobne zmiany robię w ramach opieki.",
    },
    {
        q: "Next.js czy WordPress — co wybrać?",
        a: "Next.js, jeśli strona ma być szybką wizytówką, a zmiany robię ja. WordPress, jeśli chcesz sam zmieniać treść w panelu. Robię obie. WordPress potrzebuje regularnych aktualizacji, dlatego taką stronę oddaję razem z opieką.",
    },
    {
        q: "Robisz sklepy na WooCommerce?",
        a: "Tak. Sklep na WooCommerce, w którym sam dodajesz produkty i obsługujesz zamówienia. Podpinam płatności (PayU, Przelewy24 albo Tpay) i wysyłkę InPost. Sklep od 6 900 zł.",
    },
];

const faqSchema = faqPageSchema(faqs);

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tworzenie Stron Internetowych dla Firm",
    "description": "Projektowanie i programowanie stron internetowych na Next.js i WordPressie — one-page, multi-page, sklepy WooCommerce. Szybkie, responsywne, zoptymalizowane pod SEO.",
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
                "priceSpecification": { "@type": "PriceSpecification", "price": "1990", "priceCurrency": "PLN", "minPrice": "1990" },
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Strona Firmowa Multi-Page" },
                "priceSpecification": { "@type": "PriceSpecification", "price": "2990", "priceCurrency": "PLN", "minPrice": "2990" },
            },
        ],
    },
    "url": "https://wuyo.pl/strony-www",
};

const packages = [
    {
        name: "Strona One-Page",
        price: "od 1 990 zł",
        desc: "Jedna strona, jeden cel — maksymalna konwersja. Idealna dla freelancerów, coachów, nowych biznesów.",
        includes: [
            "Projekt graficzny od zera, pod Twoją firmę",
            "Next.js + React (szybkie ładowanie)",
            "Responsywność (mobile first)",
            "Formularz kontaktowy",
            "Podstawowe SEO on-page",
            "Optymalizacja obrazów (WebP/AVIF)",
            "Domena i hosting na 1. rok w cenie",
        ],
        time: "7–14 dni roboczych",
        highlight: false,
    },
    {
        name: "Strona Firmowa Multi-Page",
        price: "od 2 990 zł",
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
        time: "7–14 dni roboczych",
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
    { name: "WordPress + WooCommerce", desc: "Gdy chcesz sam zmieniać treść albo prowadzić sklep. Lekki motyw i stały zestaw sprawdzonych wtyczek." },
    { name: "TypeScript", desc: "Bezpieczny kod bez błędów typowania — mniej bugów w produkcji." },
    { name: "Tailwind CSS", desc: "Spójny design system, lekkie style, bez zbędnego CSS." },
    { name: "Hosting", desc: "Wdrożenie na hostingu klienta — wspieram konfigurację domeny, SSL i środowiska produkcyjnego." },
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
        desc: "Budowa w Next.js albo na WordPressie. Responsywność, optymalizacja obrazów, formularze, animacje — wszystko w jednym.",
    },
    {
        n: "04",
        title: "SEO i testy",
        desc: "Metadata, Open Graph, Schema markup, Sitemap, PageSpeed test. Strona musi nie tylko wyglądać — musi rankować.",
    },
    {
        n: "05",
        title: "Deploy i przekazanie",
        desc: "Wdrożenie na Twoim hostingu, setup domeny, Google Search Console, instrukcja obsługi. Jesteś właścicielem — masz dostęp do wszystkiego.",
    },
];

export default function StronyWwwPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
                        Projektuję i programuję strony na Next.js albo WordPressie — szybkie, responsywne i przygotowane pod Google od pierwszego dnia. Technologię dobieram do tego, jak chcesz pracować ze stroną.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block">
                            Zamów wycenę — odpiszę w 24h
                        </a>
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
                            { stat: "Next.js / WP", label: "technologia pod Twoje potrzeby" },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Next.js czy WordPress */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Technologia</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Next.js czy WordPress?</h2>
                        <p className="text-white/50 max-w-2xl mx-auto">Robię obie. Wybór zależy od jednego pytania: chcesz sam zmieniać treść, czy wolisz, żebym robił to ja?</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {[
                            {
                                icon: <Zap size={22} className="text-gold" />,
                                title: "Next.js: szybkość, która sprzedaje",
                                desc: "Strona ładuje się poniżej 1 sekundy, a Google widzi całą treść od razu. Każda sekunda opóźnienia to -7% konwersji (Google, 2024).",
                            },
                            {
                                icon: <Shield size={22} className="text-gold" />,
                                title: "Next.js: nic do zhakowania",
                                desc: "Strona bez bazy danych i bez wtyczek. Nie ma czego aktualizować co tydzień. Zmiany w treści robię ja w ramach opieki.",
                            },
                            {
                                icon: <PenLine size={22} className="text-gold" />,
                                title: "WordPress: sam zmieniasz treść",
                                desc: "Wpisy, realizacje, oferta — dodajesz w prostym panelu, bez pisania do mnie. Lekki motyw i stały zestaw sprawdzonych wtyczek, więc strona dalej jest szybka.",
                            },
                            {
                                icon: <ShoppingCart size={22} className="text-gold" />,
                                title: "WooCommerce: sklep, który prowadzisz sam",
                                desc: "Sam dodajesz produkty i obsługujesz zamówienia. Płatności PayU, Przelewy24 albo Tpay, wysyłka InPost. Aktualizacje i kopie zapasowe robię ja.",
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
                                            <th className="text-left p-4 text-white/60 font-medium">Kryterium</th>
                                            <th className="text-center p-4 text-gold font-bold">Next.js</th>
                                            <th className="text-center p-4 text-gold font-bold">WordPress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { c: "Dla kogo", a: "Wizytówka, rzadkie zmiany, liczy się szybkość", b: "Blog, realizacje, oferta zmieniana często, sklep" },
                                            { c: "Kto zmienia treść", a: "Ja, w ramach opieki", b: "Ty, sam w panelu" },
                                            { c: "Czas ładowania", a: "< 1s", b: "Szybki przy lekkim motywie, który stosuję" },
                                            { c: "SEO", a: "Wbudowane w kod", b: "Wtyczka Rank Math, ustawiona przeze mnie" },
                                            { c: "Bezpieczeństwo", a: "Brak bazy danych do ataku", b: "Regularne aktualizacje — robię je ja" },
                                            { c: "Sklep", a: "Na zamówienie, pod wycenę", b: "WooCommerce — produkty i zamówienia w panelu" },
                                            { c: "Opieka", a: "Opcjonalna", b: "Konieczna — aktualizacje to stała praca" },
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="p-4 text-white/60">{row.c}</td>
                                                <td className="p-4 text-center text-white/80 text-xs">{row.a}</td>
                                                <td className="p-4 text-center text-white/80 text-xs">{row.b}</td>
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
                                        <p className="text-white/50 text-xs mt-1">⏱ {pkg.time}</p>
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
                                <p className="text-white/60 text-xs mb-1">Z bloga</p>
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

            {/* Kontakt */}
            <PageFaq items={faqs} title="Pytania o strony internetowe" />

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </main>
    );
}
