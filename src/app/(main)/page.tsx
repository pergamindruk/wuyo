import { Suspense } from "react";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { ProcessSection } from "@/components/ProcessSection";
import { AuditSection } from "@/components/AuditSection";
import { FAQSection } from "@/components/FAQSection";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TrustedBySection } from "@/components/TrustedBySection";
import { ContactBrief } from "@/components/ContactBrief";
import { HeroText } from "@/components/HeroText";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Palette, Layout, FileText, Share2, Box } from "lucide-react";
import { PackagesSection } from "@/components/PackagesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { HeroClientEffects, HeroStats, ScrollIndicator, HeroAmbientOrbs } from "@/components/HeroClientEffects";
import { HeroProjectTilesLoader as HeroProjectTiles } from "@/components/HeroProjectTilesLoader";

const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "WUYO – Studio Graficzne",
    "alternateName": "WUYO",
    "description": "Studio graficzne z Rzeszowa. Projektowanie logo, identyfikacja wizualna, strony internetowe na Next.js, druk wizytówek i ulotek. Obsługuję małe i średnie firmy z Rzeszowa i całej Polski.",
    "url": "https://wuyo.pl",
    "logo": "https://wuyo.pl/logo_wuya2.webp",
    "image": "https://wuyo.pl/logo_wuya2.webp",
    "telephone": "+48725182053",
    "email": "kontakt@wuyo.pl",
    "founder": {
        "@type": "Person",
        "name": "Mateusz Machoś",
        "jobTitle": "Projektant graficzny i web developer",
        "url": "https://wuyo.pl/o-mnie",
    },
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "ul. Siemieńskiego 17A/38",
        "addressLocality": "Rzeszów",
        "postalCode": "35-203",
        "addressRegion": "Podkarpacie",
        "addressCountry": "PL",
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 50.0412,
        "longitude": 21.9991,
    },
    "areaServed": [
        { "@type": "City", "name": "Rzeszów" },
        { "@type": "Country", "name": "Polska" },
    ],
    "serviceType": [
        "Projektowanie logo",
        "Identyfikacja wizualna",
        "Tworzenie stron internetowych",
        "Strony na Next.js",
        "Druk wizytówek",
        "Druk ulotek",
        "Grafika social media",
    ],
    "knowsAbout": [
        "Logo design",
        "Brand identity",
        "Web design",
        "Next.js",
        "React",
        "SEO",
        "Druk cyfrowy",
        "Grafika reklamowa",
    ],
    "priceRange": "$$",
    "currenciesAccepted": "PLN",
    "paymentAccepted": "Przelew bankowy",
    "openingHours": "Mo-Fr 08:00-18:00",
    "sameAs": [
        "https://www.facebook.com/wuyo.dobra.grafa",
        "https://www.instagram.com/wuyo.pl/",
        "https://www.youtube.com/@wuyo.dobra.grafa",
    ],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile to wszystko będzie kosztować?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Gram w otwarte karty. Najważniejsze pakiety masz w Cenniku. Jeśli potrzebujesz czegoś nietypowego, napisz maila — wycenię dokładnie co do złotówki przed startem prac, bez niespodzianek na końcu.",
            },
        },
        {
            "@type": "Question",
            "name": "Jak wygląda rozliczenie zapłaty?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Standardowo dzielimy sprawę na pół: 50% zaliczki przed otwarciem programów graficznych i 50% po zakończeniu projektu.",
            },
        },
        {
            "@type": "Question",
            "name": "Co jeśli projekt mi nie wejdzie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Zanim usiądę do projektowania, robimy solidny brief. Po projektowaniu mamy serię poprawek żeby idealnie wyszlifować bryłę — pracuję aż powiesz WOW!",
            },
        },
        {
            "@type": "Question",
            "name": "Czy dostanę pliki edytowalne i źródłowe?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak. Przekazuję wszelkie paczki produkcyjne, tła, fonty, instrukcje i pełne wektory.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile trwa projekt strony WWW?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dla strony One-Page zazwyczaj tydzień od zebrania materiałów. Dużo zależy od szybkości dostarczenia treści i feedbacku.",
            },
        },
        {
            "@type": "Question",
            "name": "Skąd będę wiedział, na jakim etapie jest mój projekt?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dostajesz własny panel klienta z linkiem, w którym na bieżąco widzisz postęp prac — od briefu, przez projektowanie, poprawki, aż po finalne przekazanie.",
            },
        },
    ],
};

export default function Home() {
    const services = [
        {
            icon: <Palette size={28} />,
            title: "Logotyp, który ludzie zapamiętają",
            desc: "Fundament Twojego biznesu. Robię loga, które nie wyglądają jak wygenerowane przez AI czy stworzone w Canva. Konkretny wektor, który ludzie zapamiętają, a Ty możesz użyć wszędzie.",
            href: "/logo",
        },
        {
            icon: <Layout size={28} />,
            title: "Strona, która sprzedaje za Ciebie",
            desc: "Wykodowane od zera na React/Next.js. Od szybkich stron One-Page po większe serwisy. Co to znaczy dla Ciebie? Kuloodporne bezpieczeństwo, techniczne SEO i prędkość, która zachwyca Google.",
            href: "/strony-www",
        },
        {
            icon: <FileText size={28} />,
            title: "Druk, który robi wrażenie",
            desc: "Wizytówki, ulotki, vouchery, katalogi, bannery — projektuję i drukuję. Zamawiasz gotowy projekt albo komplet z wydrukiem. Prosta sprawa, jedno miejsce.",
            href: "/druk",
        },
        {
            icon: <Share2 size={28} />,
            title: "Social media, które zatrzymują scrollowanie",
            desc: "Wjeżdżam na pełnej na Twoje sociale. Karuzele, posty, rolki i miniatury, które zatrzymają scrollowanie i sprawią, że ludzie zaczną klikać.",
            href: null,
        },
        {
            icon: <Box size={28} />,
            title: "Projekty graficzne, które robią robotę",
            desc: "Potrzebujesz czegoś poza logo i stroną? Projektuję opakowania, etykiety, materiały POS, prezentacje, banery i infografiki — wszystko, czego marka potrzebuje, żeby wyglądać spójnie i profesjonalnie na każdym nośniku.",
            href: null,
        },
    ];



    return (
        <div className="w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="relative min-h-[90vh] lg:min-h-screen overflow-hidden">
                <HeroClientEffects />
                <HeroAmbientOrbs />

                <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 min-h-[90vh] lg:min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center pt-32 md:pt-44 lg:pt-52 pb-20">

                    {/* LEFT — tekst + CTA */}
                    <AnimatedSection className="text-center" animateOnMount={true} hero={true}>
                        <p className="eyebrow mb-4">Studio graficzne · Rzeszów i cała Polska</p>
                        <HeroText />
                        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed font-medium text-balance">
                            Obsługuję marki od startupu po skalowanie — od&nbsp;identyfikacji, przez stronę, po&nbsp;grafiki, które zarabiają na social media.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link href="#pakiety" className="btn-gold px-10 py-4 inline-flex items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]">
                                <span className="font-bold text-lg text-navy">Wybierz pakiet</span>
                            </Link>
                            <Link href="#portfolio" className="relative px-10 py-4 rounded-full inline-flex items-center justify-center overflow-hidden transition-all group backdrop-blur-sm border border-gold/40 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:border-gold hover:bg-gold/10">
                                <span className="font-bold text-lg text-white group-hover:text-gold transition-colors relative z-10 w-full text-center">Portfolio</span>
                            </Link>
                        </div>

                        {/* Social proof — animated counters */}
                        <div className="flex justify-center">
                            <HeroStats />
                        </div>
                    </AnimatedSection>

                    {/* RIGHT — ruchome kafelki z realizacjami (desktop only) */}
                    <div className="hidden lg:block relative h-[82vh] max-h-[960px]">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative z-10">
                    {services.map((service, i) => (
                        <AnimatedSection
                            key={i}
                            delay={i * 0.08}
                            className={(i < 2 || i === 4) ? "lg:col-span-2" : "lg:col-span-1"}
                        >
                            {service.href ? (
                                <Link href={service.href} className="glass-card p-8 md:p-10 h-full group transition-all duration-300 block hover:border-gold/30">
                                    <div className="text-gold transition-colors duration-300 mb-6">{service.icon}</div>
                                    <h3 className={`font-bold text-white group-hover:text-gold transition-colors duration-300 mb-3 ${i < 2 ? "text-2xl" : "text-xl"}`}>{service.title}</h3>
                                    <p className="text-white/60 transition-colors duration-300 leading-relaxed text-sm mb-4">{service.desc}</p>
                                    <span className="inline-flex items-center gap-1 text-gold text-xs font-bold group-hover:gap-2 transition-all">Dowiedz się więcej <ArrowRight size={12} /></span>
                                </Link>
                            ) : (
                                <div className="glass-card p-8 md:p-10 h-full group transition-all duration-300">
                                    <div className="text-gold transition-colors duration-300 mb-6">{service.icon}</div>
                                    <h3 className={`font-bold text-white transition-colors duration-300 mb-3 ${i === 4 ? "text-2xl" : "text-xl"}`}>{service.title}</h3>
                                    <p className="text-white/60 transition-colors duration-300 leading-relaxed text-sm">{service.desc}</p>
                                </div>
                            )}
                        </AnimatedSection>
                    ))}
                </div>

                {/* CTA pod gridem */}
                <AnimatedSection className="mt-10 max-w-6xl mx-auto relative z-10">
                    <div className="rounded-2xl border border-gold/20 bg-gold/5 backdrop-blur-sm px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-white/80 text-base font-medium text-center sm:text-left">
                            Nie wiesz od czego zacząć? Napisz — dostaniesz konkretny plan działania w 24h.
                        </p>
                        <Link href="#kontakt" className="btn-gold px-8 py-3 rounded-full font-bold text-sm shrink-0 shadow-[0_0_20px_rgba(255,235,82,0.25)]">
                            Napisz do mnie →
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* ═══════════════════════ PROCES ═══════════════════════ */}
            <ProcessSection />

            {/* ═══════════════════════ REALIZACJE ═══════════════════════ */}
            <PortfolioGallery />

            {/* ═══════════════════════ PAKIETY ═══════════════════════ */}
            <PackagesSection />

            {/* ═══════════════════════ FAQ ═══════════════════════ */}
            <FAQSection />

            {/* ═══════════════════════ AUDYT ═══════════════════════ */}
            <AuditSection />

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
                            <p>Działam sam — rozmawiasz ze mną, nie z asystentem. Nie ma tu agencyjnego ping-ponga ani lania wody. Mówię wprost co zrobię, ile to kosztuje i kiedy będzie gotowe.</p>
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

            {/* ═══════════════════════ OPINIE ═══════════════════════ */}
            <TestimonialsSection />

            {/* ═══════════════════════ KONTAKT / BRIEF ═══════════════════════ */}
            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>

            {/* ═══════════════════════ ZAUFALI MI ═══════════════════════ */}
            <TrustedBySection />

        </div>
    );
}
