import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Palette, Layout, FileText, Share2, Box, Shirt } from "lucide-react";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { ProcessSection } from "@/components/ProcessSection";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TrustedBySection } from "@/components/TrustedBySection";
import { ContactBrief } from "@/components/ContactBrief";
import { HeroText } from "@/components/HeroText";
import { BlogTeaser } from "@/components/BlogTeaser";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { HeroClientEffects, HeroStats, ScrollIndicator, HeroAmbientOrbs } from "@/components/HeroClientEffects";
import { HeroProjectTilesLoader as HeroProjectTiles } from "@/components/HeroProjectTilesLoader";
import { BUSINESS_ID, BUSINESS_NAME, BUSINESS_RATING } from "@/lib/business-schema";
import { alternatesFor, route } from "@/lib/i18n";

export const metadata: Metadata = {
    title: { absolute: "WUYO: logo design, websites & print | Rzeszów, Poland" },
    description:
        "Graphic designer in Rzeszów, Poland. Logos from 890 PLN, fast Next.js websites from 1,990 PLN, business cards and apparel printing. Clear prices, no surprises.",
    alternates: alternatesFor("home", "en"),
    openGraph: {
        locale: "en_GB",
        url: "https://wuyo.pl/en",
        title: "WUYO Dobra Grafa | Logo design, websites & print in Rzeszów",
        description: "Logos, websites and print for small businesses. Clear prices, no surprises.",
    },
};

// Ten sam wpis co na polskiej stronie głównej (to samo @id), ocena, bo pokazujemy opinie.
const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": BUSINESS_ID,
    "name": BUSINESS_NAME,
    "aggregateRating": BUSINESS_RATING,
};

const services = [
    {
        icon: <Palette size={28} />,
        title: "A logo people remember",
        desc: "The foundation of your business. My logos don't look AI-generated or made in Canva. A clean vector people remember and you can use anywhere.",
        href: route("logo", "en"),
        wide: true,
    },
    {
        icon: <Layout size={28} />,
        title: "A website that sells for you",
        desc: "Coded from scratch in React/Next.js, from fast one-page sites to bigger websites. What it means for you: solid security, technical SEO and speed Google loves.",
        href: route("websites", "en"),
        wide: true,
    },
    {
        icon: <FileText size={28} />,
        title: "Print that makes an impression",
        desc: "Business cards, flyers, posters, vouchers, catalogues, invitations and banners. I design and print in-house up to A3+. Order the design only or design plus print. Short runs without waiting for a print shop.",
        href: route("print", "en"),
        wide: false,
    },
    {
        icon: <Shirt size={28} />,
        title: "Apparel that wears your brand",
        desc: "DTF-printed T-shirts and hoodies, name personalisation, embroidery on caps and workwear. No minimum order, even a single piece.",
        href: route("apparel", "en"),
        wide: false,
    },
    {
        icon: <Share2 size={28} />,
        title: "Social media that stops the scroll",
        desc: "Carousels, posts, reels and thumbnails that stop people scrolling and get them clicking.",
        href: "#kontakt",
        wide: false,
    },
    {
        icon: <Box size={28} />,
        title: "Design that does the job",
        desc: "Need something beyond a logo and a website? I design packaging, labels, POS materials, presentations, banners and infographics, so your brand looks consistent everywhere.",
        href: "#kontakt",
        wide: false,
    },
];

const steps = [
    ["01 — Quick brief", "We talk for 15 minutes. You tell me where you are and what you want to achieve, I work out the best approach and come back with a concrete plan."],
    ["02 — Design and build", "Once you approve, I take over. I design, code or print, depending on the job. You see progress as it happens."],
    ["03 — Done. It works.", "You get something that does the job from day one. Website, logo, materials, all ready to use straight away."],
] as const;

export default function HomeEn() {
    return (
        <div className="w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            />

            {/* ═══════════════════════ HERO ═══════════════════════ */}
            <section className="relative min-h-[90vh] lg:min-h-screen overflow-hidden">
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

                <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 min-h-[90vh] lg:min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center pt-32 md:pt-44 lg:pt-52 pb-20">
                    <AnimatedSection className="text-left min-w-0" animateOnMount={true} hero={true}>
                        <HeroText locale="en" />
                        <p className="text-base md:text-lg text-white/70 max-w-xl mb-12 leading-relaxed font-medium">
                            I design and print what people judge your business by{" "}
                            <span className="text-[#FFEB52] font-semibold whitespace-nowrap">in the first three seconds.</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="#oferta" className="btn-gold px-10 py-4 inline-flex items-center justify-center relative overflow-hidden group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]">
                                <span className="font-bold text-lg text-navy">See services</span>
                            </Link>
                            <Link href="#portfolio" className="relative px-10 py-4 rounded-full inline-flex items-center justify-center overflow-hidden transition-all group backdrop-blur-sm border border-gold/40 shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] hover:border-gold hover:bg-gold/10">
                                <span className="font-bold text-lg text-white group-hover:text-gold transition-colors relative z-10">Portfolio</span>
                            </Link>
                        </div>
                        <div className="flex justify-start">
                            <HeroStats locale="en" />
                        </div>
                    </AnimatedSection>

                    <div className="hidden lg:block relative h-[82vh] max-h-[960px] min-w-0">
                        <HeroProjectTiles />
                    </div>
                </div>

                <ScrollIndicator locale="en" />
            </section>

            {/* ═══════════════════════ SERVICES ═══════════════════════ */}
            <section id="oferta" className="relative py-28 px-6 md:px-12">
                <div className="section-glow" />

                <AnimatedSection className="text-center mb-20 relative z-10">
                    <p className="eyebrow mb-4">What your brand gets</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        I build an image that<br />attracts and sells
                    </h2>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative z-10">
                    {services.map((service, i) => (
                        <AnimatedSection key={service.title} delay={i * 0.08} className={service.wide ? "lg:col-span-2" : "lg:col-span-1"}>
                            <Link href={service.href} className="glass-card p-8 md:p-10 h-full group transition-all duration-300 block hover:border-gold/30">
                                <div className="text-gold transition-colors duration-300 mb-6">{service.icon}</div>
                                <h3 className={`font-bold text-white group-hover:text-gold transition-colors duration-300 mb-3 ${service.wide ? "text-2xl" : "text-xl"}`}>{service.title}</h3>
                                <p className="text-white/60 transition-colors duration-300 leading-relaxed text-sm mb-4">{service.desc}</p>
                                <span className="inline-flex items-center gap-1 text-gold text-xs font-bold group-hover:gap-2 transition-all">Learn more <ArrowRight size={12} /></span>
                            </Link>
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection className="mt-10 max-w-6xl mx-auto relative z-10">
                    <div className="rounded-2xl border border-gold/20 bg-gold/5 backdrop-blur-sm px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="text-white/80 text-base font-medium text-center sm:text-left">
                            Not sure where to start? Write to me and you will get a concrete plan within 24 hours.
                        </p>
                        <Link href="#kontakt" className="btn-gold px-8 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,235,82,0.25)] shrink-0">
                            Get in touch →
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            <ProcessSection locale="en" />
            <PortfolioGallery locale="en" />
            <TestimonialsSection locale="en" />
            <TrustedBySection locale="en" />
            <BlogTeaser locale="en" />

            {/* ═══════════════════════ ABOUT ═══════════════════════ */}
            <section id="o-mnie" className="py-28 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-center relative z-10">
                    <AnimatedSection className="w-full flex justify-center lg:justify-end">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 group">
                            <div className="absolute inset-0 bg-gold/20 blur-[50px] rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <Image
                                    src="/MojeZdjecie.webp"
                                    alt="Mateusz Machoś, founder of WUYO, graphic designer and web developer from Rzeszów"
                                    fill
                                    className="object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/50 to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={0.2} className="max-w-2xl mx-auto lg:mx-0">
                        <p className="eyebrow mb-4">Working together</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            You run your business.<br />I handle the rest.
                        </h2>
                        <div className="text-white/60 leading-relaxed mb-8 space-y-4 text-sm md:text-base">
                            <p>I work alone, so you talk to me, not to an assistant. No agency ping-pong and no waffle. I tell you straight what I will do, what it costs and when it will be ready. You can write to me in English.</p>
                            <p>Your website or brand has one job: to make money, not just to look nice. I take care of it so you can focus on what you do best.</p>
                        </div>

                        <div className="mt-8 mb-10 relative">
                            <div className="absolute left-[26px] top-6 bottom-6 w-px bg-gradient-to-b from-gold/50 via-white/10 to-transparent" />
                            <ul className="space-y-6">
                                {steps.map(([title, desc], i) => (
                                    <li key={title} className="relative flex items-start gap-5">
                                        <div className={`relative z-10 w-[52px] h-[52px] shrink-0 rounded-2xl flex items-center justify-center text-gold font-bold text-lg backdrop-blur-md ${i === 2 ? "bg-gold/10 border border-gold/40 shadow-[0_0_15px_rgba(255,235,82,0.3)]" : "bg-white/5 border border-white/10"}`}>{i + 1}</div>
                                        <div className="pt-1.5">
                                            <strong className="block text-white mb-1">{title}</strong>
                                            <p className="text-white/60 text-sm leading-relaxed pr-4">{desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link href="#kontakt" className="btn-gold inline-flex items-center justify-center gap-3 w-full md:w-auto px-10 py-4 shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)] group">
                            <span className="font-bold text-navy text-lg group-hover:scale-105 transition-transform">Hand me the wheel</span>
                            <ArrowRight size={20} className="text-navy group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </AnimatedSection>
                </div>
            </section>

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </div>
    );
}
