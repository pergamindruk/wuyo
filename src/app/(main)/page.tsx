import { Suspense } from "react";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { ProcessSection } from "@/components/ProcessSection";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TrustedBySection } from "@/components/TrustedBySection";
import { ContactBrief } from "@/components/ContactBrief";
import { HeroText } from "@/components/HeroText";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { OfferTabs, type OfferService } from "@/components/offer/OfferTabs";
import { BlogTeaser } from "@/components/BlogTeaser";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { HeroClientEffects, ScrollIndicator, HeroAmbientOrbs } from "@/components/HeroClientEffects";
import { HeroProjectTilesLoader as HeroProjectTiles } from "@/components/HeroProjectTilesLoader";
import { HeroWebThreads } from "@/components/HeroWebThreads";
import { BUSINESS_ID, BUSINESS_NAME, BUSINESS_RATING } from "@/lib/business-schema";
import type { Metadata } from "next";
import { seoMeta } from "@/lib/seo-overrides";
import { alternatesFor } from "@/lib/i18n";

// Canonical + hreflang do wersji angielskiej (/en). x-default zostaje na polskiej.
const metadata: Metadata = { alternates: alternatesFor("home", "pl") };

// Tytuł i opis może podmienić SEO-radca (/lab/seo) bez wdrożenia.
export async function generateMetadata(): Promise<Metadata> {
    return seoMeta("/", metadata);
}

// Pełny opis firmy jest w layout.tsx (to samo @id). Tutaj tylko ocena z Google,
// bo strona główna pokazuje opinie.
const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": BUSINESS_ID,
    "name": BUSINESS_NAME,
    "aggregateRating": BUSINESS_RATING,
};

export default function Home() {
    const services: OfferService[] = [
        {
            icon: "logo",
            name: "Logo",
            title: "Logo, które nie wygląda jak z Canvy",
            short: "Klient widzi Twoje logo na aucie, szyldzie i fakturze, zanim w ogóle zadzwoni. Robię znak od zera, czytelny także w małym rozmiarze. Dostajesz 3 propozycje do wyboru i wszystkie pliki na własność.",
            tags: ["3 propozycje", "pliki do druku i internetu", "prawa autorskie w cenie"],
            href: "/logo",
            cta: "Zobacz ofertę logo",
        },
        {
            icon: "www",
            name: "Strona internetowa",
            title: "Klient sprawdza Cię w telefonie. Co tam widzi?",
            short: "Zanim ktoś zadzwoni, wpisuje Twoją firmę w Google. Jeśli strona się nie otwiera albo wygląda jak z 2010 roku, dzwoni do konkurencji. Robię stronę, która szybko działa na telefonie, ma numer pod ręką i pokazuje Twoje realizacje.",
            tags: ["szybka na telefonie", "domena i serwer na pierwszy rok w cenie", "ustawiona pod Google"],
            href: "/strony-www",
            cta: "Zobacz ofertę stron",
        },
        {
            icon: "print",
            name: "Druk",
            title: "Projekt i druk w jednym miejscu",
            short: "Wizytówki, ulotki, plakaty, vouchery. Projektuję i drukuję u siebie, więc nie musisz krążyć między grafikiem a drukarnią. Masz gotowy projekt? Wydrukuję sam plik.",
            tags: ["druk do A3+", "małe nakłady", "wysyłka w całej Polsce"],
            href: "/druk",
            cta: "Zobacz ofertę druku",
        },
        {
            icon: "apparel",
            name: "Odzież z nadrukiem",
            title: "Koszulki z Twoim logo, nawet jedna sztuka",
            short: "Dla ekipy, na targi albo na prezent. Nie musisz zamawiać 50 sztuk, żeby cokolwiek dostać. Koszulki i bluzy z nadrukiem DTF, czapki i odzież robocza z haftem.",
            tags: ["bez minimum ilościowego", "nadruk DTF", "haft"],
            href: "/odziez",
            cta: "Zobacz ofertę odzieży",
        },
        {
            icon: "social",
            name: "Posty i grafiki",
            title: "Posty gotowe do wrzucenia",
            short: "Po całym dniu pracy mało kto siada do grafik na Facebooka. Zrobię Ci posty, karuzele i okładki w jednym stylu z Twoją firmą. Ty tylko je wrzucasz.",
            tags: ["posty", "karuzele", "okładki profilu"],
            href: "/#kontakt",
            cta: "Napisz, czego potrzebujesz",
        },
        {
            icon: "design",
            name: "Etykiety i banery",
            title: "Etykiety, opakowania, banery i cała reszta",
            short: "Etykieta na słoik, pudełko na produkt, baner na płot budowy, menu, roll-up. Wszystko, na czym ludzie widzą Twoją firmę. Pilnuję, żeby każda rzecz wyglądała jak z jednej firmy.",
            tags: ["etykiety", "opakowania", "banery i roll-upy"],
            href: "/#kontakt",
            cta: "Napisz, co chcesz zrobić",
        },
        {
            icon: "automation",
            name: "Automatyzacja",
            title: "Nudną robotę może robić komputer",
            short: "Przepisujesz zamówienia z maila do Excela? Wysyłasz klientom przypomnienia ręcznie? Takie rzeczy da się ustawić tak, żeby działy same. Powiedz mi, co robisz codziennie, a sprawdzę, co z tego może iść automatem.",
            tags: ["przypomnienia dla klientów", "zamówienia z formularza do arkusza", "powiadomienia na telefon"],
            href: "/#kontakt",
            cta: "Napisz, co Ci zjada czas",
        },
    ];



    return (
        <div className="w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />

            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="relative min-h-[90vh] lg:min-h-screen overflow-hidden">
                {/* Olive-green top glow — per Figma */}
                <div
                    className="absolute inset-x-0 top-0 pointer-events-none z-0"
                    style={{
                        height: "65%",
                        background: "radial-gradient(ellipse 85% 70% at 50% 0%, rgba(95, 115, 5, 0.72) 0%, transparent 70%)",
                    }}
                    aria-hidden
                />
                <HeroClientEffects />
                <HeroAmbientOrbs />
                <HeroWebThreads />

                <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 min-h-[90vh] lg:min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center pt-32 md:pt-44 lg:pt-52 pb-20">

                    {/* LEFT — tekst + CTA */}
                    <AnimatedSection className="text-left min-w-0" animateOnMount={true} hero={true}>
                        <HeroText />
                        <p className="text-base md:text-lg text-white/70 max-w-xl mb-12 leading-relaxed font-medium">
                            Projektuję i drukuję to, po czym ludzie oceniają Twoją firmę{" "}
                            <span className="text-[#FFEB52] font-semibold whitespace-nowrap">w pierwsze trzy sekundy.</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="#oferta" className="btn-gold px-10 py-4 inline-flex items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]">
                                <span className="font-bold text-lg text-navy">Sprawdź ofertę</span>
                            </Link>
                            <Link href="#portfolio" className="relative px-10 py-4 rounded-full inline-flex items-center justify-center overflow-hidden transition-all group backdrop-blur-sm border border-gold/40 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:border-gold hover:bg-gold/10">
                                <span className="font-bold text-lg text-white group-hover:text-gold transition-colors relative z-10">Portfolio</span>
                            </Link>
                        </div>

                    </AnimatedSection>

                    {/* RIGHT — ruchome kafelki z realizacjami (desktop only) */}
                    <div className="hidden lg:block relative h-[82vh] max-h-[960px] min-w-0">
                        <HeroProjectTiles />
                    </div>

                </div>

                {/* Scroll indicator */}
                <ScrollIndicator />
            </section>

            {/* ═══════════════════════ OFERTA ═══════════════════════ */}
            <section id="oferta" className="relative py-28 px-6 md:px-12">
                <div className="section-glow" />

                <AnimatedSection className="text-center mb-20 relative z-10">
                    <p className="eyebrow mb-4">Co zyska Twoja marka</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        Tworzę wizerunek, który<br />przyciąga i sprzedaje
                    </h2>
                </AnimatedSection>

                <OfferTabs services={services} />

                {/* CTA pod gridem */}
                <AnimatedSection className="mt-10 max-w-6xl mx-auto relative z-10">
                    <div className="rounded-2xl border border-gold/20 bg-gold/5 backdrop-blur-sm px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-white/80 text-base font-medium text-center sm:text-left">
                            Nie wiesz od czego zacząć? Napisz — dostaniesz konkretny plan działania w 24h.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            <Link href="#kontakt" className="btn-gold px-8 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,235,82,0.25)]">
                                Napisz do mnie →
                            </Link>
                            <Link href="/audyt" className="px-6 py-3 rounded-full font-bold text-sm text-gold border border-gold/40 hover:bg-gold/10 hover:border-gold transition-colors whitespace-nowrap">
                                Bezpłatny audyt
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>
            </section>

            {/* ═══════════════════════ PROCES ═══════════════════════ */}
            <ProcessSection />

            {/* ═══════════════════════ REALIZACJE ═══════════════════════ */}
            <PortfolioGallery />

            {/* ═══════════════════════ OPINIE ═══════════════════════ */}
            <TestimonialsSection />

            {/* ═══════════════════════ ZAUFALI MI ═══════════════════════ */}
            <TrustedBySection />


            {/* ═══════════════════════ BLOG ═══════════════════════ */}
            <BlogTeaser />

            {/* ═══════════════════════ O NAS ═══════════════════════ */}
            <section id="o-mnie" className="py-28 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-center relative z-10">
                    {/* Left: Avatar / Portrait */}
                    <AnimatedSection className="w-full flex justify-center lg:justify-end">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 group">
                            {/* Decorative Glow */}
                            <div className="absolute inset-0 bg-gold/20 blur-[50px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
                            {/* Image Container */}
                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src="/MojeZdjecie.webp"
                                    alt="Mateusz Machoś – założyciel WUYO, projektant graficzny i web developer z Rzeszowa"
                                    fill
                                    className="object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/50 to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Right: Text Content */}
                    <AnimatedSection delay={0.2} className="max-w-2xl mx-auto lg:mx-0">
                        <p className="eyebrow mb-4">Współpraca</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Ty robisz swoje.<br />Ja ogarniam resztę.
                        </h2>
                        <div className="text-white/60 leading-relaxed mb-8 space-y-4 text-sm md:text-base">
                            <p>Działam sam — rozmawiasz ze mną, nie z asystentem. Nie ma tu agencyjnego ping-ponga ani lania wody. Mówię wprost co zrobię, ile to kosztuje i kiedy będzie gotowe. Więcej o tym, jak pracuję jako <Link href="/grafik-rzeszow" className="text-gold hover:underline">grafik w Rzeszowie</Link>.</p>
                            <p>Twoja strona czy marka mają jedno zadanie: zarabiać. Nie tylko wyglądać. Zajmuję się tym żebyś Ty mógł skupić się na tym, na czym znasz się najlepiej.</p>
                        </div>

                        <div className="mt-8 mb-10 relative">
                            {/* Ścieżka */}
                            <div className="absolute left-[26px] top-6 bottom-6 w-px bg-gradient-to-b from-gold/50 via-white/10 to-transparent" />

                            <ul className="space-y-6">
                                <li className="relative flex items-start gap-5">
                                    <div className="relative z-10 w-[52px] h-[52px] shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold font-bold text-lg backdrop-blur-md">1</div>
                                    <div className="pt-1.5">
                                        <strong className="block text-white mb-1">01 — Szybki brief</strong>
                                        <p className="text-white/60 text-sm leading-relaxed pr-4">Gadamy 15 minut. Mówisz mi gdzie jesteś i co chcesz osiągnąć — ja szukam najlepszego rozwiązania i wracam z konkretnym planem.</p>
                                    </div>
                                </li>
                                <li className="relative flex items-start gap-5">
                                    <div className="relative z-10 w-[52px] h-[52px] shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold font-bold text-lg backdrop-blur-md">2</div>
                                    <div className="pt-1.5">
                                        <strong className="block text-white mb-1">02 — Projekt i realizacja</strong>
                                        <p className="text-white/60 text-sm leading-relaxed pr-4">Po akceptacji przejmuję stery. Tworzę design, piszę kod, drukuję — zależnie od zlecenia. Postępy widzisz na bieżąco.</p>
                                    </div>
                                </li>
                                <li className="relative flex items-start gap-5">
                                    <div className="relative z-10 w-[52px] h-[52px] shrink-0 rounded-2xl bg-gold/10 border border-gold/40 shadow-[0_0_15px_rgba(255,235,82,0.3)] flex items-center justify-center text-gold font-bold text-lg backdrop-blur-md">3</div>
                                    <div className="pt-1.5">
                                        <strong className="block text-white mb-1">03 — Gotowe. Działa.</strong>
                                        <p className="text-white/60 text-sm leading-relaxed pr-4">Odbierasz produkt który od pierwszego dnia robi robotę. Strona, logo, materiały — wszystko gotowe do użycia od razu.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <Link href="#kontakt" className="btn-gold inline-flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)] group">
                            <span className="font-bold text-navy text-lg group-hover:scale-105 transition-transform">Przekaż mi stery</span>
                            <ArrowRight size={20} className="text-navy group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </AnimatedSection>
                </div>
            </section>

            {/* ═══════════════════════ KONTAKT / BRIEF ═══════════════════════ */}
            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>

        </div>
    );
}
