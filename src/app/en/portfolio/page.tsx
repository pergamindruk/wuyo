import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { projects } from "@/lib/projects";
import { alternatesFor, route } from "@/lib/i18n";

// Schemat CollectionPage zostaje tylko na polskiej /realizacje: te same prace opisane
// dwa razy w dwóch językach nic nie dają, a polska wersja jest główna.

export const metadata: Metadata = {
    title: "Portfolio: logos, websites and print",
    description: "WUYO portfolio: websites, logos, brand identities, print materials and apparel. Proof instead of promises: see real projects for real businesses.",
    alternates: alternatesFor("portfolio", "en"),
    openGraph: {
        title: "WUYO portfolio: graphic design and websites",
        description: "Projects made for real businesses. Logos, websites, print and social media graphics.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/portfolio",
        locale: "en_GB",
    },
};

const stats = [
    { value: "5.0", label: "Google rating" },
    { value: "24h", label: "to get a quote" },
    { value: "100%", label: "design rights are yours" },
];

export default function PortfolioPage() {
    return (
        <div className="w-full">
            <section className="relative pt-40 pb-16 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
                    <span className="font-black text-white/[0.025] tracking-tighter" style={{ fontSize: "clamp(6rem,18vw,16rem)", fontFamily: "var(--font-ava-meridian)" }}>
                        WORK
                    </span>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection animateOnMount hero>
                        <Link href={route("home", "en")} className="inline-flex items-center gap-2 text-white/60 hover:text-white/70 text-sm font-medium transition-colors mb-8 group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Home
                        </Link>

                        <p className="eyebrow mb-4">Proof, not promises</p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Projects that<br />already make money
                        </h1>
                        <p className="text-white/60 text-lg max-w-2xl leading-relaxed mb-12">
                            Every project is a real story: a real business, a real problem, a real solution. Browse by category and click a project to see the details.
                        </p>

                        <div className="flex flex-wrap gap-8">
                            {stats.map((s) => (
                                <div key={s.label} className="flex flex-col">
                                    <span className="text-4xl font-black leading-none text-gold" style={{ fontFamily: "var(--font-ava-meridian)" }}>{s.value}</span>
                                    <span className="text-white/60 text-xs uppercase tracking-widest mt-1">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <PortfolioGallery initialVisible={projects.length} hideHeader naPierwszymEkranie locale="en" />

            <section className="py-24 px-6 md:px-12">
                <AnimatedSection>
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="eyebrow mb-4">Your project here?</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Want to join my happy clients?</h2>
                        <p className="text-white/60 mb-10 leading-relaxed">
                            Every project starts with a clear brief. No waffle: you know exactly what you get and for how much before you approve anything.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={`${route("home", "en")}#kontakt`} className="btn-gold px-10 py-4 inline-flex items-center justify-center font-bold text-navy shadow-[0_0_20px_rgba(255,235,82,0.3)]">
                                Start a project →
                            </Link>
                            <Link href={route("calculator", "en")} className="px-10 py-4 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all font-bold">
                                Try the price calculator
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>
            </section>
        </div>
    );
}
