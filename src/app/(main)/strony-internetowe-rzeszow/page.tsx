import type { Metadata } from "next";
import { seoMeta } from "@/lib/seo-overrides";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Zap, Shield, PenLine } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";
import { BUSINESS_REF, BUSINESS_RATING } from "@/lib/business-schema";
import { alternatesFor } from "@/lib/i18n";

const metadata: Metadata = {
    title: "Strony internetowe Rzeszów — cennik 2026, od 1 990 zł",
    description: "Strony internetowe w Rzeszowie: one-page od 1 990 zł, do 5 podstron 2 990 zł, sklep od 6 900 zł. Domena i hosting na rok w cenie. Wycena w 24h.",
    keywords: [
        "strony internetowe Rzeszów",
        "strony internetowe Rzeszów cennik",
        "tanie strony internetowe Rzeszów",
        "tworzenie stron internetowych Rzeszów",
        "web design Rzeszów",
        "strony www Rzeszów",
        "projektowanie stron Rzeszów",
        "strony internetowe dla firm Rzeszów",
        "Next.js Rzeszów",
        "WordPress Rzeszów",
        "sklep WooCommerce Rzeszów",
        "web developer Rzeszów",
    ],
    openGraph: {
        title: "Strony Internetowe Rzeszów | WUYO – Next.js, WordPress, SEO",
        description: "Strony internetowe dla firm z Rzeszowa. Next.js albo WordPress, szybkie, z SEO. One-page od 1 990 zł. Wycena w 24h.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/strony-internetowe-rzeszow",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Strony Internetowe Rzeszów | WUYO",
        description: "Tworzę strony www dla firm z Rzeszowa. Next.js albo WordPress, SEO, szybkie. Od 1 990 zł.",
        images: ["/og-image.webp"],
    },
    alternates: alternatesFor("websitesRzeszow", "pl"),
};

// Tytuł i opis może podmienić SEO-radca (/lab/seo) bez wdrożenia.
export async function generateMetadata(): Promise<Metadata> {
    return seoMeta("/strony-internetowe-rzeszow", metadata);
}

const localSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Tworzenie Stron Internetowych – Rzeszów",
    "description": "Projektowanie i programowanie stron internetowych dla firm z Rzeszowa i Podkarpacia. Next.js i WordPress, sklepy WooCommerce, szybkie ładowanie, SEO techniczne, responsywne.",
    "provider": { ...BUSINESS_REF, "aggregateRating": BUSINESS_RATING },
    "areaServed": [
        { "@type": "City", "name": "Rzeszów" },
        { "@type": "AdministrativeArea", "name": "Podkarpacie" },
        { "@type": "Country", "name": "Polska" },
    ],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Pakiety stron internetowych",
        "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Strona One-Page" }, "priceSpecification": { "@type": "PriceSpecification", "price": "1990", "priceCurrency": "PLN", "minPrice": "1990" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Strona firmowa do 5 podstron" }, "priceSpecification": { "@type": "PriceSpecification", "price": "2990", "priceCurrency": "PLN" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sklep internetowy" }, "priceSpecification": { "@type": "PriceSpecification", "price": "6900", "priceCurrency": "PLN", "minPrice": "6900" } },
        ],
    },
};

// Jedna tablica zasila widoczną sekcję FAQ i schemat FAQPage — Google
// wymaga, żeby dane strukturalne miały pokrycie w treści strony.
const faqs: FaqEntry[] = [
    {
        q: "Gdzie zrobić tanią stronę internetową w Rzeszowie?",
        a: "Najtańsza sensowna opcja to strona jednostronicowa od 1 990 zł netto: jedna strona z ofertą, galerią, opiniami, mapą i formularzem, działająca na telefonie, z podstawowym SEO lokalnym. Domena i hosting na pierwszy rok są w cenie. Taniej da się zrobić stronę z szablonu, ale zwykle bez SEO i z dopłatami za każdą zmianę. Na co uważać przy tanich ofertach, opisałem we wpisie o tanich stronach internetowych.",
    },
    {
        q: "Ile kosztuje strona internetowa w Rzeszowie?",
        a: "Strona jednostronicowa (one-page) od 1 990 zł, strona firmowa do 5 podstron 2 990 zł, sklep internetowy od 6 900 zł. Domena i hosting na pierwszy rok są w cenie. Każda wycena jest stała — znasz kwotę przed startem, bez stawki godzinowej i niespodzianek po fakturze.",
    },
    {
        q: "Ile kosztuje utrzymanie strony po pierwszym roku?",
        a: "Opieka Strony to 199 zł miesięcznie: serwer, domena, kopie zapasowe, zabezpieczenia i 1 godzina drobnych zmian w miesiącu. Rezygnujesz w każdej chwili z miesięcznym wyprzedzeniem.",
    },
    {
        q: "Czy da się zrobić tanią stronę internetową w Rzeszowie?",
        a: "Najtańsza opcja u mnie to strona jednostronicowa od 1 990 zł — jedna strona, jeden cel, formularz kontaktowy, SEO i domena z hostingiem na rok. Wystarcza nowej firmie, freelancerowi albo jednej usłudze. Tańsze oferty to zwykle gotowy szablon, który trudno potem wypozycjonować w Google.",
    },
    {
        q: "Ile trwa zbudowanie strony internetowej?",
        a: "7–14 dni roboczych, zarówno przy stronie jednostronicowej, jak i z podstronami. Czas zależy głównie od szybkości dostarczenia treści z Twojej strony.",
    },
    {
        q: "Czy tworzysz strony dla firm spoza Rzeszowa?",
        a: "Tak — większość projektów realizuję zdalnie. Rzeszów i Podkarpacie to moja baza, ale obsługuję firmy z całej Polski. Kontakt przez WhatsApp, Messenger lub e-mail.",
    },
    {
        q: "Czy mogę samodzielnie edytować treści?",
        a: "Tak. Jeśli chcesz sam dodawać wpisy, realizacje albo produkty, zrobię stronę na WordPressie i pokażę Ci panel. Przy stronie na Next.js wystarczy napisać do mnie: w Opiece Strony masz 1 godzinę drobnych zmian w miesiącu.",
    },
    {
        q: "Next.js czy WordPress — co wybrać?",
        a: "Next.js, jeśli strona ma być szybką wizytówką, a zmiany robię ja. WordPress, jeśli chcesz sam zmieniać treść albo prowadzić sklep na WooCommerce. Robię obie. WordPress potrzebuje regularnych aktualizacji, dlatego taką stronę oddaję razem z opieką.",
    },
];

const faqSchema = faqPageSchema(faqs);

const priceTable = [
    { name: "Strona jednostronicowa (one-page)", price: "od 1 990 zł" },
    { name: "Strona firmowa do 5 podstron", price: "2 990 zł" },
    { name: "Sklep internetowy", price: "od 6 900 zł" },
    { name: "Dodatkowa sekcja na istniejącej stronie", price: "od 100 zł" },
    { name: "Pakiet Firma w Internecie — logo, identyfikacja i strona do 5 podstron", price: "3 490 zł" },
    { name: "Opieka Strony — serwer, domena, kopie, 1 h zmian", price: "199 zł / mc" },
];

const packages = [
    {
        name: "One-Page",
        price: "od 1 990 zł",
        time: "7–14 dni roboczych",
        desc: "Jedna strona, jeden cel. Idealna dla freelancerów, coachów i nowych firm, które chcą szybko zaistnieć w sieci.",
        items: ["Projekt graficzny UI/UX", "Next.js + React", "Formularz kontaktowy", "SEO on-page", "Domena i hosting na 1. rok w cenie"],
        highlight: false,
    },
    {
        name: "Multi-Page",
        price: "od 2 990 zł",
        time: "7–14 dni roboczych",
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
                        Robię strony od zera w Next.js albo na WordPressie, jeśli chcesz sam zmieniać treść. Strona szybko się ładuje, Google ją widzi od pierwszego dnia, a Ty znasz cenę przed startem.
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
                            { stat: "od 1 990 zł", label: "strona One-Page" },
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
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Strony internetowe Rzeszów: cennik 2026</h2>
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
                                        <p className="text-white/50 text-xs mt-1">⏱ {pkg.time}</p>
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

                    <AnimatedSection className="mt-10">
                        <div className="glass-card p-6 md:p-8">
                            <h3 className="font-bold text-white mb-4">Pełny cennik stron</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-white/50 border-b border-white/10">
                                        <th scope="col" className="py-2 font-medium">Usługa</th>
                                        <th scope="col" className="py-2 font-medium text-right">Cena</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {priceTable.map((row) => (
                                        <tr key={row.name} className="border-b border-white/5 last:border-0">
                                            <td className="py-2.5 pr-4 text-white/70">{row.name}</td>
                                            <td className="py-2.5 text-right font-bold text-white whitespace-nowrap">{row.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-white/50 text-xs mt-4">
                                Domena i hosting na pierwszy rok są w cenie każdej strony. Co dalej i ile to kosztuje, rozpisałem w tekście{" "}
                                <Link href="/blog/ile-kosztuje-utrzymanie-strony-internetowej" className="text-gold hover:underline">ile kosztuje utrzymanie strony</Link>.
                            </p>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection className="mt-6">
                        <div className="glass-card p-6 border-l-2 border-gold">
                            <h3 className="font-bold text-white mb-2">Tanie strony internetowe w Rzeszowie: kiedy wystarczy one-page za 1 990 zł</h3>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Jeśli dopiero startujesz albo sprzedajesz jedną usługę, wystarczy strona jednostronicowa od 1 990 zł. Jedna strona, jeden cel, formularz kontaktowy i SEO od pierwszego dnia. Rozbudujesz ją później, gdy firma urośnie — nie płacisz za podstrony, których dziś nikt nie czyta. Porównanie znajdziesz we wpisie{" "}
                                <Link href="/blog/strona-one-page-czy-multi-page" className="text-gold hover:underline">one page czy multi page</Link>.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* NEXT.JS CZY WORDPRESS */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Technologia</p>
                        <h2 className="text-3xl font-bold text-white">Next.js czy WordPress?</h2>
                        <p className="text-white/50 max-w-2xl mx-auto mt-4">Robię obie. Wybierasz po tym, czy chcesz sam zmieniać treść.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { icon: <Zap size={20} className="text-gold" />, title: "Next.js: ładuje się w < 1s", desc: <span>Każda dodatkowa sekunda ładowania to -7% konwersji. Sprawdź swoją aktualną stronę w <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold underline decoration-dotted">PageSpeed Insights</a> — jeśli wynik to mniej niż 90, czas coś zmienić.</span> },
                            { icon: <Shield size={20} className="text-gold" />, title: "Next.js: nic do zhakowania", desc: <span>Nie ma bazy danych wystawionej na świat. <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="text-gold/70 hover:text-gold underline decoration-dotted">Next.js</a> generuje statyczne pliki — nie ma czego hakować ani aktualizować co tydzień.</span> },
                            { icon: <PenLine size={20} className="text-gold" />, title: "WordPress: sam zmieniasz treść", desc: "Wpisy, realizacje, oferta albo sklep WooCommerce — edytujesz w panelu. Aktualizacje i kopie zapasowe robię ja w ramach opieki." },
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
            <PageFaq items={faqs} title="Pytania o strony internetowe w Rzeszowie" />

            {/* CROSS-SELL */}
            <section className="py-12 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 md:p-8 grid md:grid-cols-2 gap-6 text-center border border-white/5">
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Potrzebujesz też logo?</p>
                                <Link href="/logo" className="font-bold text-white hover:text-gold transition-colors text-sm">Logo dla firmy →</Link>
                                <p className="text-white/60 text-xs mt-1">od 890 zł · projekt od zera</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Grafik z Rzeszowa</p>
                                <Link href="/grafik-rzeszow" className="font-bold text-white hover:text-gold transition-colors text-sm">O studio WUYO →</Link>
                                <p className="text-white/60 text-xs mt-1">logo · strony · druk</p>
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
                                <p className="text-white/60 text-xs mb-1">Z bloga</p>
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
