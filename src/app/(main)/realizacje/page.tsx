import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
    title: "Realizacje – Portfolio projektów graficznych i stron WWW",
    description: "156+ zrealizowanych projektów: strony internetowe, logotypy, identyfikacja wizualna, druk i social media. Dowody zamiast obietnic — sprawdź moje portfolio.",
    alternates: {
        canonical: "https://wuyo.pl/realizacje",
    },
    openGraph: {
        title: "Realizacje WUYO – Portfolio projektów graficznych",
        description: "Sprawdź projekty zrealizowane dla prawdziwych firm. Logotypy, strony WWW, druk i grafiki social media.",
        url: "https://wuyo.pl/realizacje",
    },
};

const stats = [
    { value: "156+", label: "zrealizowanych projektów" },
    { value: "46", label: "branż" },
];

export default function RealizacjePage() {
    return (
        <div className="w-full">
            {/* ── Hero ── */}
            <section className="relative pt-40 pb-16 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
                    <span
                        className="font-black text-white/[0.025] tracking-tighter"
                        style={{ fontSize: "clamp(6rem,18vw,16rem)", fontFamily: "var(--font-ava-meridian)" }}
                    >
                        PRACE
                    </span>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection animateOnMount hero>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-medium transition-colors mb-8 group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Strona główna
                        </Link>

                        <p className="eyebrow mb-4">Dowody, nie obietnice</p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Projekty, które<br />już zarabiają
                        </h1>
                        <p className="text-white/60 text-lg max-w-2xl leading-relaxed mb-12">
                            Każdy projekt to konkretna historia — realna firma, realny problem, realne rozwiązanie. Przeglądaj według kategorii i klikaj, żeby zobaczyć szczegóły.
                        </p>

                        {/* Statystyki */}
                        <div className="flex flex-wrap gap-8">
                            {stats.map((s) => (
                                <div key={s.label} className="flex flex-col">
                                    <span
                                        className="text-4xl font-black leading-none text-gold"
                                        style={{ fontFamily: "var(--font-ava-meridian)" }}
                                    >
                                        {s.value}
                                    </span>
                                    <span className="text-white/40 text-xs uppercase tracking-widest mt-1">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ── Galeria – wszystkie projekty od razu ── */}
            <PortfolioGallery initialVisible={projects.length} hideHeader />

            {/* ── CTA ── */}
            <section className="py-24 px-6 md:px-12">
                <AnimatedSection>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="eyebrow mb-4">Twój projekt tu?</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Chcesz dołączyć do grona zadowolonych klientów?
                        </h2>
                        <p className="text-white/60 mb-10 leading-relaxed">
                            Każdy projekt zaczynamy od konkretnego briefu. Zero lania wody — wiesz dokładnie co dostajesz i za ile, zanim cokolwiek zaakceptujesz.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/#kontakt"
                                className="btn-gold px-10 py-4 inline-flex items-center justify-center font-bold text-navy shadow-[0_0_20px_rgba(255,235,82,0.3)]"
                            >
                                Zacznijmy projekt →
                            </Link>
                            <Link
                                href="/kalkulator"
                                className="px-10 py-4 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all font-bold"
                            >
                                Sprawdź kalkulator cen
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>
            </section>
        </div>
    );
}
