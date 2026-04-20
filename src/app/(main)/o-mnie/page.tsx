import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Printer, Scissors, Thermometer, Zap } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "O mnie – Mateusz Machoś, projektant graficzny i web developer",
    description: "Cześć, jestem Mateusz. Projektant graficzny i web developer z Rzeszowa. Działam sam, co znaczy, że rozmawiasz bezpośrednio ze mną — bez agencyjnego ping-ponga.",
    alternates: { canonical: "https://wuyo.pl/o-mnie" },
    openGraph: {
        title: "O mnie – Mateusz Machoś | WUYO – Dobra Grafa",
        description: "Kim jestem i jak pracuję. Mateusz Machoś — projektant graficzny, web developer, właściciel sprzętu poligraficznego.",
        url: "https://wuyo.pl/o-mnie",
    },
};

const equipment = [
    {
        icon: <Printer size={22} />,
        name: "Epson L18050 A3+",
        desc: "Druk A3+ na papierach specjalnych i zwykłych. 6-kolorowy pigment — fotorealistyczna jakość.",
        tag: "Druk",
    },
    {
        icon: <Scissors size={22} />,
        name: "Silhouette Cameo 5",
        desc: "Ploter tnący do naklejek, wykrojników, personalizacji — cięcie w dowolnym kształcie.",
        tag: "Wykrawanie",
    },
    {
        icon: <Thermometer size={22} />,
        name: "Laminator + gilotyna",
        desc: "Laminowanie mat i błysk do A3. Profesjonalne wykończenie materiałów drukowanych.",
        tag: "Wykończenie",
    },
    {
        icon: <Zap size={22} />,
        name: "Prasa termotransfer",
        desc: "Transfer na tkaniny, koszulki, torby. Personalizacja gadżetów reklamowych bez minimum nakładu.",
        tag: "Termotransfer",
    },
];

const values = [
    { title: "Prosto z mostu", desc: "Nie owijam w bawełnę. Mówię, co jest możliwe, ile kosztuje i kiedy będzie gotowe — przed startem, nie po." },
    { title: "Jeden człowiek", desc: "Nie ma asystentów, nie ma podwykonawców-niespodzianek. Wszystko robię osobiście — od briefu po finalne pliki." },
    { title: "Druk na miejscu", desc: "Własny sprzęt poligraficzny skraca czas i eliminuje pośredników. Wizytówki i naklejki możesz mieć nawet jutro." },
    { title: "Konkretna cena", desc: "Zawsze stała wycena przed startem. Zero godzinowego billowania i niespodzianek na fakturze." },
];

export default function OmniePage() {
    return (
        <div className="w-full">
            {/* ── Hero ── */}
            <section className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-end pointer-events-none select-none overflow-hidden pr-8 pb-8" aria-hidden>
                    <span
                        className="font-black text-white/[0.025] tracking-tighter leading-none"
                        style={{ fontSize: "clamp(5rem,16vw,14rem)", fontFamily: "var(--font-ava-meridian)" }}
                    >
                        WUYO
                    </span>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection animateOnMount hero>
                        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium transition-colors mb-8 group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Strona główna
                        </Link>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-14 lg:gap-20 items-center">
                            {/* Zdjęcie */}
                            <div className="flex justify-center lg:justify-start">
                                <div className="relative w-72 h-72 md:w-96 md:h-96 group">
                                    <div className="absolute inset-0 bg-gold/15 blur-[60px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
                                    <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                                        <Image
                                            src="/MojeZdjecie.webp"
                                            alt="Mateusz Machoś – projektant graficzny i web developer, WUYO Rzeszów"
                                            fill
                                            className="object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 to-transparent pointer-events-none" />
                                    </div>
                                    {/* Badge */}
                                    <div className="absolute -bottom-4 -right-4 bg-gold text-navy-dark font-bold text-xs px-4 py-2 rounded-full shadow-lg">
                                        Rzeszów · od 2021
                                    </div>
                                </div>
                            </div>

                            {/* Tekst */}
                            <div>
                                <p className="eyebrow mb-4">Cześć, jestem</p>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                    Mateusz Machoś<br />
                                    <span className="text-gold">— Wuyo</span>
                                </h1>
                                <div className="space-y-4 text-white/65 leading-relaxed text-base md:text-lg">
                                    <p>
                                        Grafik i developer w jednym. Robię logo, strony internetowe i materiały drukowane dla firm, które chcą wyglądać poważnie i sprzedawać więcej.
                                    </p>
                                    <p>
                                        Działam sam — bez agencji, bez asystentów, bez ping-ponga. Rozmawiasz bezpośrednio ze mną i to ja siedzę przy komputerze, kiedy tworzę Twój projekt.
                                    </p>
                                    <p>
                                        Na wyposażeniu mam własny sprzęt poligraficzny, więc od projektu do gotowego wydruku to jeden telefon — bez czekania na zewnętrzne drukarnie.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-8">
                                    <Link href="/#kontakt" className="btn-gold px-8 py-3.5 inline-flex items-center gap-2 font-bold shadow-[0_0_20px_rgba(255,235,82,0.3)]">
                                        Napisz do mnie <ArrowRight size={16} />
                                    </Link>
                                    <Link href="/realizacje" className="px-8 py-3.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all font-bold">
                                        Zobacz realizacje
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ── Wartości / jak pracuję ── */}
            <section className="py-20 px-6 md:px-12 relative">
                <div className="section-glow" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection className="mb-14">
                        <p className="eyebrow mb-3">Jak to działa</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Moje zasady roboty</h2>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {values.map((v, i) => (
                            <AnimatedSection key={i} delay={i * 0.07}>
                                <div className="glass-card p-8 h-full">
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center text-gold text-xs font-black">{i + 1}</span>
                                        {v.title}
                                    </h3>
                                    <p className="text-white/55 leading-relaxed text-sm">{v.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Sprzęt poligraficzny ── */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="mb-14">
                        <p className="eyebrow mb-3">Pod ręką, nie na zewnątrz</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Własny sprzęt poligraficzny</h2>
                        <p className="text-white/55 mt-4 max-w-2xl leading-relaxed">
                            Większość grafików zleca druk na zewnątrz — ja drukuję sam. To znaczy szybciej, taniej i z pełną kontrolą nad jakością. Bez minimum nakładu, bez tygodniowego czekania.
                        </p>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {equipment.map((eq, i) => (
                            <AnimatedSection key={i} delay={i * 0.08}>
                                <div className="glass-card p-6 h-full">
                                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4">
                                        {eq.icon}
                                    </div>
                                    <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest mb-2 block">{eq.tag}</span>
                                    <h3 className="font-bold text-white mb-2 text-sm">{eq.name}</h3>
                                    <p className="text-white/45 text-xs leading-relaxed">{eq.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                    <AnimatedSection className="mt-6">
                        <div className="rounded-2xl border border-gold/20 bg-gold/5 px-8 py-6 flex flex-col sm:flex-row items-center gap-4">
                            <p className="text-white/70 text-sm flex-1 text-center sm:text-left">
                                <strong className="text-white">Oszczędzasz 40–60%</strong> w porównaniu do zamawiania druku w zewnętrznej drukarni przy małych nakładach.
                            </p>
                            <Link href="/druk" className="btn-gold px-6 py-2.5 text-sm font-bold shrink-0 whitespace-nowrap">
                                Oferta druku →
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 px-6 md:px-12">
                <AnimatedSection>
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="eyebrow mb-4">Gotowy do rozmowy?</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Daj mi 15 minut.<br />Dam Ci konkretny plan.
                        </h2>
                        <p className="text-white/55 mb-10 leading-relaxed">
                            Opisz co potrzebujesz, dostaniesz wycenę w 24h. Bez zobowiązań, bez pitu-pitu.
                        </p>
                        <Link href="/#kontakt" className="btn-gold px-12 py-4 inline-flex items-center gap-3 font-bold text-lg shadow-[0_0_25px_rgba(255,235,82,0.35)]">
                            Zaczynamy <ArrowRight size={20} />
                        </Link>
                    </div>
                </AnimatedSection>
            </section>
        </div>
    );
}
