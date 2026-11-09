import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { OfferTabs, type OfferService } from "@/components/offer/OfferTabs";
import { PortfolioShowcase } from "@/components/PortfolioShowcase";
import { ProcessSection } from "@/components/ProcessSection";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TrustedBySection } from "@/components/TrustedBySection";
import { ContactBrief } from "@/components/ContactBrief";
import { HeroText } from "@/components/HeroText";
import { BlogTeaser } from "@/components/BlogTeaser";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { HeroClientEffects, ScrollIndicator, HeroAmbientOrbs } from "@/components/HeroClientEffects";
import { HeroProjectTilesLoader as HeroProjectTiles } from "@/components/HeroProjectTilesLoader";
import { HeroWebThreads } from "@/components/HeroWebThreads";
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

const services: OfferService[] = [
    {
        icon: "logo",
        name: "Logo",
        title: "A logo that doesn't look like it came from Canva",
        short: "People see your logo on your van, your sign and your invoice before they ever call. I draw the mark from scratch and make sure it reads well even when it's small. You get 3 options to choose from and all the files are yours.",
        tags: ["3 options", "files for print and web", "copyright included"],
        href: route("logo", "en"),
        cta: "See logo design",
    },
    {
        icon: "www",
        name: "Website",
        title: "People check you on their phone. What do they see?",
        short: "Before anyone calls, they look your business up on Google. If the site won't load or looks like 2010, they call someone else. I build sites that load fast on a phone, keep your number in reach and show your work.",
        tags: ["fast on a phone", "domain and server for the first year included", "set up for Google"],
        href: route("websites", "en"),
        cta: "See websites",
    },
    {
        icon: "print",
        name: "Print",
        title: "Design and print in one place",
        short: "Business cards, flyers, posters, vouchers. I design and print in-house, so you don't have to run between a designer and a print shop. Already have a design? I'll just print it.",
        tags: ["print up to A3+", "short runs", "shipping across Poland"],
        href: route("print", "en"),
        cta: "See printing",
    },
    {
        icon: "apparel",
        name: "Printed apparel",
        title: "T-shirts with your logo, even just one",
        short: "For your crew, a trade fair or a gift. You don't need to order 50 pieces to get anything. DTF prints on T-shirts and hoodies, embroidery on caps and workwear.",
        tags: ["no minimum order", "DTF print", "embroidery"],
        href: route("apparel", "en"),
        cta: "See apparel",
    },
    {
        icon: "social",
        name: "Social posts",
        title: "Posts ready to publish",
        short: "After a full day of work, hardly anyone sits down to make Facebook graphics. I'll make your posts, carousels and covers in one consistent style. You just post them.",
        tags: ["posts", "carousels", "profile covers"],
        href: "#kontakt",
        cta: "Tell me what you need",
    },
    {
        icon: "design",
        name: "Labels and banners",
        title: "Labels, packaging, banners and everything else",
        short: "A label for a jar, a box for your product, a banner for a building site fence, a menu, a roll-up. Everything people see your business on. I make sure it all looks like it comes from one company.",
        tags: ["labels", "packaging", "banners and roll-ups"],
        href: "#kontakt",
        cta: "Tell me what you want to make",
    },
    {
        icon: "automation",
        name: "AI automation",
        title: "Let a computer do the boring work",
        short: "Copying orders from email into a spreadsheet? Sending reminders to clients by hand? Things like that can be set up to run on their own. Tell me what you do every day and I'll check what could run automatically.",
        tags: ["client reminders", "form orders straight into a spreadsheet", "notifications on your phone"],
        href: "#kontakt",
        cta: "Tell me what eats your time",
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
                <HeroWebThreads />

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

                <OfferTabs services={services} />

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
            <PortfolioShowcase locale="en" />
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
                            <p>No customer service team and no middlemen. You talk to the person who makes your project. You know the price and the deadline before we start. You can write to me in English.</p>
                            <p>You know your trade, I know how a business should look. Let's split the work: you look after your customers, I make sure there are more of them.</p>
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
