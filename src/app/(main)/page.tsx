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
import { ArrowRight, Palette, Layout, FileText, Share2, Box, Sparkles, ChevronDown } from "lucide-react";
import { PackagesSection } from "@/components/PackagesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Spotlight } from "@/components/ui/spotlight";
import { MouseSpotlight } from "@/components/ui/mouse-spotlight";
import { StatsCounter } from "@/components/StatsCounter";

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
            title: "Opakowanie, które krzyczy 'kup mnie!'",
            desc: "Produkt musi się sprzedawać już na półce. Projektuję etykiety i opakowania, które krzyczą: 'kup mnie!'. Dobra grafa na pudełku to połowa sukcesu.",
            href: null,
        },
        {
            icon: <Sparkles size={28} />,
            title: "Animacje i motion design",
            desc: "Statyka to przeszłość. Tworzę animowane bannery, intro do rolek i mikro-interakcje na stronę, które wyróżnią Twoją markę na tle konkurencji.",
            href: null,
        },
    ];



    return (
        <main className="flex-1 w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-24 md:pt-56 lg:pt-64 overflow-hidden">
                <MouseSpotlight />
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <Spotlight className="top-10 left-full md:right-40 md:top-20" fill="white" />

                {/* Dekoracyjne tło — signature WUYO */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
                    <span
                        className="font-black text-white/[0.028] tracking-tighter -rotate-6"
                        style={{ fontSize: "clamp(8rem,22vw,20rem)", fontFamily: "var(--font-ava-meridian)" }}
                    >
                        WUYO
                    </span>
                </div>

                <AnimatedSection className="relative z-10 max-w-4xl" animateOnMount={true}>
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
                    <StatsCounter />
                </AnimatedSection>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 animate-bounce pointer-events-none">
                    <ChevronDown size={20} />
                </div>
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
                            className={i < 2 ? "lg:col-span-2" : "lg:col-span-1"}
                        >
                            {service.href ? (
                                <Link href={service.href} className="glass-card p-8 md:p-10 h-full group transition-all duration-300 block hover:border-gold/30">
                                    <div
                                        className="font-black text-gold/25 group-hover:text-gold/50 transition-colors duration-500 mb-6 leading-none select-none"
                                        style={{ fontSize: i < 2 ? "4.5rem" : "3.5rem", fontFamily: "var(--font-ava-meridian)", lineHeight: 1 }}
                                        aria-hidden
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                    <h3 className={`font-bold text-white group-hover:text-gold transition-colors duration-300 mb-3 ${i < 2 ? "text-2xl" : "text-xl"}`}>{service.title}</h3>
                                    <p className="text-white/60 transition-colors duration-300 leading-relaxed text-sm mb-4">{service.desc}</p>
                                    <span className="inline-flex items-center gap-1 text-gold text-xs font-bold group-hover:gap-2 transition-all">Dowiedz się więcej <ArrowRight size={12} /></span>
                                </Link>
                            ) : (
                                <div className="glass-card p-8 md:p-10 h-full group transition-all duration-300">
                                    <div
                                        className="font-black text-gold/25 group-hover:text-gold/50 transition-colors duration-500 mb-6 leading-none select-none"
                                        style={{ fontSize: "3rem", fontFamily: "var(--font-ava-meridian)" }}
                                        aria-hidden
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                    <h3 className="text-xl font-bold text-white transition-colors duration-300 mb-3">{service.title}</h3>
                                    <p className="text-white/60 transition-colors duration-300 leading-relaxed text-sm">{service.desc}</p>
                                </div>
                            )}
                        </AnimatedSection>
                    ))}
                </div>
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
                            Ty robisz biznes,<br />ja ogarniam resztę.
                        </h2>
                        <div className="text-white/60 leading-relaxed mb-8 space-y-4 text-sm md:text-base">
                            <p>Działam sam, co oznacza konkret: rozmawiasz bezpośrednio ze mną. Bez agencyjnego ping-ponga, bez asystentów i lania wody. Tłumaczę najtrudniejsze tech-nowinki po ludzku.</p>
                            <p>Twoja nowa strona czy marka mają sprzedawać, budować prestiż i przede wszystkim — zarabiać. Ja zajmuję się strategią i kodem, a Ty masz święty spokój na to, na czym znasz się najlepiej.</p>
                        </div>
                        
                        <div className="mt-8 mb-10 relative">
                            {/* Ścieżka */}
                            <div className="absolute left-[26px] top-6 bottom-6 w-px bg-gradient-to-b from-gold/50 via-white/10 to-transparent" />
                            
                            <ul className="space-y-6">
                                <li className="relative flex items-start gap-5">
                                    <div className="relative z-10 w-[52px] h-[52px] shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold font-bold text-lg backdrop-blur-md">1</div>
                                    <div className="pt-1.5">
                                        <strong className="block text-white mb-1">Szybki brief</strong>
                                        <p className="text-white/60 text-sm leading-relaxed pr-4">Ustalamy w 15 minut, czego brakuje w Twoim biznesie. Zbieram konkrety i szukam najlepszego rozwiązania.</p>
                                    </div>
                                </li>
                                <li className="relative flex items-start gap-5">
                                    <div className="relative z-10 w-[52px] h-[52px] shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold font-bold text-lg backdrop-blur-md">2</div>
                                    <div className="pt-1.5">
                                        <strong className="block text-white mb-1">Projekt i kodowanie</strong>
                                        <p className="text-white/60 text-sm leading-relaxed pr-4">Po akceptacji propozycji przejmuję stery. Tworzę design, piszę kod, a Ty spokojnie obserwujesz postępy na żywo.</p>
                                    </div>
                                </li>
                                <li className="relative flex items-start gap-5">
                                    <div className="relative z-10 w-[52px] h-[52px] shrink-0 rounded-2xl bg-gold/10 border border-gold/40 shadow-[0_0_15px_rgba(255,235,82,0.3)] flex items-center justify-center text-gold font-bold text-lg backdrop-blur-md">3</div>
                                    <div className="pt-1.5">
                                        <strong className="block text-white mb-1">Mamy to! Gotowy produkt</strong>
                                        <p className="text-white/60 text-sm leading-relaxed pr-4">Odbierasz gotową maszynę, która od pierwszego dnia zarabia i buduje przewagę w Twojej branży.</p>
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

        </main>
    );
}
