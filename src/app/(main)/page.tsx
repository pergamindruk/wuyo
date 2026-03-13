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
import { ArrowRight, Palette, Layout, FileText, Share2, Box, Monitor } from "lucide-react";
import { PackagesSection } from "@/components/PackagesSection";
import { Spotlight } from "@/components/ui/spotlight";
import { MouseSpotlight } from "@/components/ui/mouse-spotlight";

export default function Home() {
    const services = [
        {
            icon: <Palette size={28} />,
            title: "Logotypy i identyfikacja",
            desc: "Fundament Twojego biznesu. Robię loga, które nie wyglądają jak wygenerowane przez AI czy stworzone w Canva. Konkretny wektor, który ludzie zapamiętają, a Ty możesz użyć wszędzie.",
        },
        {
            icon: <Layout size={28} />,
            title: "Kompletne strony WWW (od 1000 zł)",
            desc: "Wykodowane od zera na React/Next.js. Od szybkich stron One-Page po większe serwisy. Co to znaczy dla Ciebie? Kuloodporne bezpieczeństwo, techniczne SEO i prędkość, która zachwyca Google.",
        },
        {
            icon: <FileText size={28} />,
            title: "Materiały drukowane",
            desc: "Ulotki, katalogi, wizytówki, bannery – ta forma reklamy zawsze działa, postaw na prezencje - Wuyo zaprojektuje, Wuyo wydrukuje :)",
        },
        {
            icon: <Share2 size={28} />,
            title: "Grafiki na social media",
            desc: "Wjeżdżam na pełnej na Twoje sociale. Karuzele, posty, rolki i miniatury, które zatrzymają scrollowanie i sprawią, że ludzie zaczną klikać.",
        },
        {
            icon: <Box size={28} />,
            title: "Etykiety i opakowania",
            desc: "Produkt musi się sprzedawać już na półce. Projektuję etykiety i opakowania, które krzyczą: 'kup mnie!'. Dobra grafa na pudełku to połowa sukcesu.",
        },
        {
            icon: <Monitor size={28} />,
            title: "Wsparcie i doradztwo",
            desc: "Czujesz, że Twój wizerunek odstaje od konkurencji, a strona słabo sprzedaje? Przegadajmy to na darmowej konsultacji. Powiem Ci bez owijania w bawełnę co jest do poprawy i ułożę konkretny plan jak to naprawić.",
        },
    ];



    return (
        <main className="flex-1 w-full">

            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-40 md:pt-56 lg:pt-64 overflow-hidden">
                <MouseSpotlight />
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <Spotlight className="top-10 left-full md:right-40 md:top-20" fill="white" />

                <AnimatedSection className="relative z-10 max-w-4xl" animateOnMount={true}>
                    <HeroText />
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed font-medium text-balance">
                        Bierz w pakiecie i oszczędzaj. Grafika skrojona pod twoją markę.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="#pakiety" className="btn-gold px-10 py-4 inline-flex items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]">
                            <span className="font-bold text-lg text-navy">Wybierz pakiet</span>
                        </Link>
                        <Link href="#portfolio" className="relative px-10 py-4 rounded-full inline-flex items-center justify-center overflow-hidden transition-all group backdrop-blur-sm border border-gold/40 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:border-gold hover:bg-gold/10">
                            <span className="font-bold text-lg text-white group-hover:text-gold transition-colors relative z-10 w-full text-center">Portfolio</span>
                        </Link>
                    </div>
                </AnimatedSection>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative z-10">
                    {services.map((service, i) => (
                        <AnimatedSection key={i} delay={i * 0.1}>
                            <div className="glass-card p-8 md:p-10 h-full group transition-all duration-300">
                                <div className="text-gold transition-colors duration-300 mb-6">{service.icon}</div>
                                <h3 className="text-xl font-bold text-white transition-colors duration-300 mb-3">{service.title}</h3>
                                <p className="text-white/50 transition-colors duration-300 leading-relaxed text-sm">{service.desc}</p>
                            </div>
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
            <section id="o-nas" className="py-28 px-6 md:px-12">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <AnimatedSection>
                        <div className="aspect-square bg-navy-light rounded-3xl flex items-center justify-center border border-white/5 overflow-hidden relative group">
                            <Image
                                src="/MojeZdjecie.jpg"
                                alt="Wuyo - Twój graficzny ziomek"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </AnimatedSection>
                    <AnimatedSection delay={0.2}>
                        <p className="eyebrow mb-4">kim jest Wuyo?</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                            Twój graficzny ziomek.
                        </h2>
                        <div className="text-white/60 leading-relaxed mb-8 space-y-4">
                            <p>Zapomnij o wielkich agencjach, gdzie jesteś tylko numerkiem w Excelu. Bez naciągania, czyste zasady. Wuyo to Twój graficzny ziomek. Zjadłem zęby na projektowaniu i gram w otwarte karty.</p>
                            <p>Fundament biznesu musi być solidny.<br />Dla mnie robota ma sens tylko wtedy, gdy grafika na siebie zarabia. Projekt ma sprzedawać, a nie tylko ładnie wyglądać w moim portfolio. Szczery, uczciwy i zawsze na czas.</p>
                        </div>
                        <Link href="#kontakt" className="btn-gradient inline-flex items-center gap-2">
                            Lecimy z tematem <ArrowRight size={18} />
                        </Link>
                    </AnimatedSection>
                </div>
            </section>

            {/* ═══════════════════════ KONTAKT / BRIEF ═══════════════════════ */}
            <ContactBrief />

            {/* ═══════════════════════ ZAUFALI MI ═══════════════════════ */}
            <TrustedBySection />

        </main>
    );
}
