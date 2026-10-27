import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Printer, Scissors, Thermometer, Zap } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { alternatesFor, route } from "@/lib/i18n";

// Schemat Person zostaje na polskiej /o-mnie (ta sama osoba, jedno źródło prawdy).

export const metadata: Metadata = {
    title: "Mateusz Machoś: graphic designer and web developer",
    description: "Hi, I'm Mateusz, a graphic designer and web developer from Rzeszów, Poland. I work alone, so you talk directly to me, with no agency ping-pong.",
    alternates: alternatesFor("about", "en"),
    openGraph: {
        title: "About: Mateusz Machoś | WUYO Dobra Grafa",
        description: "Who I am and how I work. Graphic designer, web developer and owner of in-house print equipment.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/about",
        locale: "en_GB",
    },
};

const equipment = [
    { icon: <Printer size={22} />, name: "Printing up to A3+", desc: "Standard and speciality papers, photo quality. Business cards, flyers, posters, stickers.", tag: "Print" },
    { icon: <Scissors size={22} />, name: "Cutting to any shape", desc: "Stickers and die-cuts cut along the contour, not just rectangles.", tag: "Die-cutting" },
    { icon: <Thermometer size={22} />, name: "Laminating and trimming", desc: "Matt or gloss finish up to A3 and clean edges instead of scissors.", tag: "Finishing" },
    { icon: <Zap size={22} />, name: "Apparel printing", desc: "T-shirts, hoodies and bags. Personalisation with no minimum, even a single piece.", tag: "Apparel" },
];

const values = [
    { title: "Straight talk", desc: "I don't beat around the bush. I tell you what's possible, what it costs and when it will be ready, before we start, not after." },
    { title: "One person", desc: "No assistants, no surprise subcontractors. I do everything myself, from the brief to the final files." },
    { title: "Print on site", desc: "My own print equipment saves time and cuts out middlemen. You can have business cards and stickers as soon as tomorrow." },
    { title: "A fixed price", desc: "Always a fixed quote before we start. No hourly billing and no surprises on the invoice." },
];

const facts = [
    { label: "Location", value: "Rzeszów, Poland" },
    { label: "Contact", value: "Directly with me, no middlemen" },
    { label: "Specialism", value: "Logos, websites, print" },
    { label: "Web technology", value: "Next.js, React, TypeScript" },
    { label: "Clients", value: "Small and medium businesses, local firms" },
    { label: "Reach", value: "Rzeszów and all of Poland (remote)" },
];

export default function AboutPage() {
    return (
        <div className="w-full">
            <section className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 flex items-end justify-end pointer-events-none select-none overflow-hidden pr-8 pb-8" aria-hidden>
                    <span className="font-black text-white/[0.025] tracking-tighter leading-none" style={{ fontSize: "clamp(5rem,16vw,14rem)", fontFamily: "var(--font-ava-meridian)" }}>WUYO</span>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection animateOnMount hero>
                        <Link href={route("home", "en")} className="inline-flex items-center gap-2 text-white/60 hover:text-white/70 text-sm font-medium transition-colors mb-8 group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Home
                        </Link>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-14 lg:gap-20 items-center">
                            <div className="flex justify-center lg:justify-start">
                                <div className="relative w-72 h-72 md:w-96 md:h-96 group">
                                    <div className="absolute inset-0 bg-gold/15 blur-[60px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
                                    <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] transform -rotate-2 group-hover:rotate-0 transition-transform duration-500">
                                        <Image src="/MojeZdjecie.webp" alt="Mateusz Machoś, graphic designer and web developer, WUYO Rzeszów" fill className="object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-105" priority />
                                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 to-transparent pointer-events-none" />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 bg-gold text-navy-dark font-bold text-xs px-4 py-2 rounded-full shadow-lg">Rzeszów · Poland</div>
                                </div>
                            </div>

                            <div>
                                <p className="eyebrow mb-4">Hi, I&apos;m</p>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                    Mateusz Machoś<br />
                                    <span className="text-gold">— WUYO</span>
                                </h1>
                                <div className="space-y-4 text-white/65 leading-relaxed text-base md:text-lg">
                                    <p>A designer and developer in one. I make logos, websites and print for businesses that want to look serious and sell more.</p>
                                    <p>I work alone: no agency, no assistants, no ping-pong. You talk directly to me, and I&apos;m the one at the computer making your project.</p>
                                    <p>I have my own print equipment, so from design to finished print it&apos;s one phone call, with no waiting on outside print shops.</p>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-8">
                                    <Link href={`${route("home", "en")}#kontakt`} className="btn-gold px-8 py-3.5 inline-flex items-center gap-2 font-bold shadow-[0_0_20px_rgba(255,235,82,0.3)]">
                                        Get in touch <ArrowRight size={16} />
                                    </Link>
                                    <Link href={route("portfolio", "en")} className="px-8 py-3.5 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all font-bold">
                                        See my work
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 relative">
                <div className="section-glow" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection className="mb-14">
                        <p className="eyebrow mb-3">How it works</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">My working rules</h2>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {values.map((v, i) => (
                            <AnimatedSection key={v.title} delay={i * 0.07}>
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

            <section className="py-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="mb-14">
                        <p className="eyebrow mb-3">In-house, not outsourced</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">My own print equipment</h2>
                        <p className="text-white/55 mt-4 max-w-2xl leading-relaxed">
                            Most designers send printing out. I print myself. That means faster, cheaper and full control over quality. From 50 pieces, without waiting a week.
                        </p>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {equipment.map((eq, i) => (
                            <AnimatedSection key={eq.name} delay={i * 0.08}>
                                <div className="glass-card p-6 h-full">
                                    <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-4">{eq.icon}</div>
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
                                <strong className="text-white">Save 40–60%</strong> compared with ordering small runs from an outside print shop.
                            </p>
                            <Link href={route("print", "en")} className="btn-gold px-6 py-2.5 text-sm font-bold shrink-0 whitespace-nowrap">Print services →</Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="mb-10">
                        <p className="eyebrow mb-3">Who I am</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">A few facts</h2>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {facts.map((fact, i) => (
                            <AnimatedSection key={fact.label} delay={i * 0.06}>
                                <div className="glass-card px-6 py-5 flex flex-col gap-1">
                                    <span className="text-white/50 text-[11px] uppercase tracking-widest font-semibold">{fact.label}</span>
                                    <span className="text-white font-bold text-base">{fact.value}</span>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-6 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 grid sm:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Logo and branding</p>
                                <Link href={route("logo", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Logo design →</Link>
                                <p className="text-white/60 text-xs mt-1">from 890 PLN</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Websites</p>
                                <Link href={route("websites", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Business websites →</Link>
                                <p className="text-white/60 text-xs mt-1">from 1,990 PLN</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Print and finishing</p>
                                <Link href={route("print", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">In-house print →</Link>
                                <p className="text-white/60 text-xs mt-1">business cards, stickers, flyers</p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12">
                <AnimatedSection>
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="eyebrow mb-4">Ready to talk?</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Give me 15 minutes.<br />I&apos;ll give you a concrete plan.</h2>
                        <p className="text-white/55 mb-10 leading-relaxed">Describe what you need and get a quote within 24 hours. No obligation, no small talk.</p>
                        <Link href={`${route("home", "en")}#kontakt`} className="btn-gold px-12 py-4 inline-flex items-center gap-3 font-bold text-lg shadow-[0_0_25px_rgba(255,235,82,0.35)]">
                            Let&apos;s go <ArrowRight size={20} />
                        </Link>
                    </div>
                </AnimatedSection>
            </section>
        </div>
    );
}
