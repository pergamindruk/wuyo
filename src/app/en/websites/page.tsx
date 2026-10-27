import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, Zap, Shield, PenLine, ShoppingCart } from "lucide-react";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { BUSINESS_REF } from "@/lib/business-schema";
import { alternatesFor } from "@/lib/i18n";

// Ceny i zakresy 1:1 z polskiej strony /strony-www. Zmiana ceny = zmiana w obu plikach.

export const metadata: Metadata = {
    title: "Websites from 1,990 PLN: Next.js and WordPress, SEO",
    description: "Business websites built with Next.js or WordPress: fast, with SEO from day one. WooCommerce shops too. One-page from 1,990 PLN, multi-page from 2,990 PLN. Quote within 24h.",
    alternates: alternatesFor("websites", "en"),
    openGraph: {
        title: "Websites from 1,990 PLN | Next.js, WordPress, SEO | WUYO",
        description: "Fast websites on Next.js or WordPress, with SEO built in. From 1,990 PLN. Rzeszów, Poland and remote.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/websites",
        type: "website",
        locale: "en_GB",
    },
};

const faqs: FaqEntry[] = [
    { q: "How much does a website cost?", a: "A one-page site starts at 1,990 PLN and a multi-page business website at 2,990 PLN. Every quote is fixed: I give you an exact amount before work starts, with no surprises on the invoice. Prices net, plus 23% VAT." },
    { q: "How long does it take to build a website?", a: "7–14 working days, for both one-page and multi-page sites. It mostly depends on how quickly you send content and feedback." },
    { q: "Will I be able to edit the content myself?", a: "Yes. If you want to add posts, projects or offers yourself, I build the site on WordPress and show you how to use the dashboard. With a Next.js site you can simply message me: small changes are part of Website Care." },
    { q: "Next.js or WordPress: which should I choose?", a: "Next.js if the site is a fast business card and I make the changes. WordPress if you want to edit content yourself in a dashboard. I build both. WordPress needs regular updates, so I hand it over together with a care plan." },
    { q: "Do you build WooCommerce shops?", a: "Yes. A WooCommerce shop where you add products and handle orders yourself. I connect payments (PayU, Przelewy24 or Tpay) and InPost shipping. Shops start at 6,900 PLN." },
];

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Business website design and development",
    "description": "Website design and development with Next.js and WordPress: one-page sites, multi-page business websites and WooCommerce shops. Fast, responsive and SEO-ready.",
    "provider": BUSINESS_REF,
    "areaServed": ["Rzeszów", "Poland", "Europe"],
    "url": "https://wuyo.pl/en/websites",
    "inLanguage": "en",
};

const packages = [
    {
        name: "One-page website",
        price: "from 1,990 PLN",
        desc: "One page, one goal: as many enquiries as possible. Ideal for freelancers, coaches and new businesses.",
        includes: ["Custom design made for your business", "Next.js + React (fast loading)", "Responsive (mobile first)", "Contact form", "Basic on-page SEO", "Image optimisation (WebP/AVIF)", "Domain and hosting for the 1st year included"],
        time: "7–14 working days",
        highlight: false,
    },
    {
        name: "Multi-page business website",
        price: "from 2,990 PLN",
        desc: "A full website with subpages, a blog and SEO for many search phrases. For businesses that want to grow through Google.",
        includes: ["Everything in one-page +", "SEO-friendly URL structure", "Service pages with their own SEO", "Blog ready to publish", "Schema markup (JSON-LD)", "Sitemap + robots.txt", "Google Search Console setup"],
        time: "7–14 working days",
        highlight: true,
    },
    {
        name: "UI/UX design",
        price: "from 100 PLN / section",
        desc: "Website design only, if you have your own developers or just want the design priced.",
        includes: ["Design in Figma", "Desktop + mobile", "Style guide (colours, fonts, components)", "Handover to your developer", "Asset export"],
        time: "Individual quote",
        highlight: false,
    },
];

const reasons = [
    { icon: <Zap size={22} className="text-gold" />, title: "Next.js: speed that sells", desc: "The site loads in under a second and Google sees the full content straight away. Every extra second of waiting costs you visitors." },
    { icon: <Shield size={22} className="text-gold" />, title: "Next.js: nothing to hack", desc: "No database and no plugins, so there is nothing to update every week. I make content changes for you as part of Website Care." },
    { icon: <PenLine size={22} className="text-gold" />, title: "WordPress: you edit the content", desc: "Posts, projects, offers: you add them in a simple dashboard without messaging me. A lightweight theme and a fixed set of proven plugins keep the site fast." },
    { icon: <ShoppingCart size={22} className="text-gold" />, title: "WooCommerce: a shop you run yourself", desc: "You add products and handle orders yourself. PayU, Przelewy24 or Tpay payments, InPost shipping. I take care of updates and backups." },
];

const comparison = [
    { c: "Best for", a: "Business card site, rare changes, speed matters", b: "Blog, projects, frequently updated offer, shop" },
    { c: "Who edits content", a: "Me, as part of Website Care", b: "You, in the dashboard" },
    { c: "Loading time", a: "< 1s", b: "Fast with the lightweight theme I use" },
    { c: "SEO", a: "Built into the code", b: "Rank Math plugin, set up by me" },
    { c: "Security", a: "No database to attack", b: "Regular updates, done by me" },
    { c: "Shop", a: "Custom build, individual quote", b: "WooCommerce: products and orders in the dashboard" },
    { c: "Care plan", a: "Optional", b: "Required: updates are ongoing work" },
];

const techStack = [
    { name: "Next.js 16", desc: "React framework: fast rendering, SEO-friendly, ready to scale." },
    { name: "WordPress + WooCommerce", desc: "When you want to edit content yourself or run a shop. A lightweight theme and a fixed set of proven plugins." },
    { name: "TypeScript", desc: "Type-safe code, so fewer bugs make it to the live site." },
    { name: "Tailwind CSS", desc: "A consistent design system with lightweight styles." },
    { name: "Hosting", desc: "Deployed on your hosting. I help set up the domain, SSL and production environment." },
    { name: "Framer Motion", desc: "Smooth animations that don't slow the site down." },
];

const process = [
    { n: "01", title: "Brief and research", desc: "We talk about the site's goal, your audience, competitors and keywords. A site without a plan is a site without visitors." },
    { n: "02", title: "Design (UI)", desc: "A Figma mock-up: structure, colours, typography, layout. You approve the look before I start coding." },
    { n: "03", title: "Development", desc: "Built in Next.js or on WordPress. Responsive layout, image optimisation, forms and animations, all in one." },
    { n: "04", title: "SEO and testing", desc: "Metadata, Open Graph, schema markup, sitemap, PageSpeed tests. A site has to rank, not just look good." },
    { n: "05", title: "Launch and handover", desc: "Deployed to your hosting, domain set up, Google Search Console, a short how-to. You own it and have access to everything." },
];

export default function WebsitesPage() {
    return (
        <div className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }} />

            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Web design · Rzeszów, Poland & remote</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Websites that<br className="hidden md:block" />
                        <span className="text-gold">work for you</span> 24/7
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        I design and build websites with Next.js or WordPress: fast, responsive and SEO-ready from day one. I pick the technology based on how you want to work with your site.
                    </p>
                    <a href="#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block">
                        Get a quote, I reply within 24h
                    </a>
                </AnimatedSection>
            </section>

            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "< 1s", label: "loading time (LCP)" },
                            { stat: "90+", label: "PageSpeed score" },
                            { stat: "Next.js / WP", label: "technology that fits your needs" },
                        ].map((item) => (
                            <div key={item.label}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Technology</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Next.js or WordPress?</h2>
                        <p className="text-white/50 max-w-2xl mx-auto">I build both. The choice comes down to one question: do you want to edit the content yourself, or would you rather I do it?</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {reasons.map((item, i) => (
                            <AnimatedSection key={item.title} delay={i * 0.1}>
                                <div className="glass-card p-6 flex gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">{item.icon}</div>
                                    <div>
                                        <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                        <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                    <AnimatedSection>
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-white/60 font-medium">Criterion</th>
                                            <th className="text-center p-4 text-gold font-bold">Next.js</th>
                                            <th className="text-center p-4 text-gold font-bold">WordPress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {comparison.map((row) => (
                                            <tr key={row.c}>
                                                <td className="p-4 text-white/60">{row.c}</td>
                                                <td className="p-4 text-center text-white/80 text-xs">{row.a}</td>
                                                <td className="p-4 text-center text-white/80 text-xs">{row.b}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Pricing</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Packages and prices</h2>
                        <p className="text-white/50 max-w-xl mx-auto">The quote is the final price. No hidden costs, no surprises on the invoice. Prices net, plus 23% VAT.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg, i) => (
                            <AnimatedSection key={pkg.name} delay={i * 0.1}>
                                <div className={`glass-card p-6 flex flex-col h-full ${pkg.highlight ? "border border-gold/30" : ""}`}>
                                    {pkg.highlight && <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">Most popular</p>}
                                    <div className="mb-1">
                                        <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                        <p className={`text-2xl font-bold ${pkg.highlight ? "text-gold" : "text-white/80"}`}>{pkg.price}</p>
                                        <p className="text-white/50 text-xs mt-1">⏱ {pkg.time}</p>
                                    </div>
                                    <p className="text-white/50 text-sm my-4 leading-relaxed">{pkg.desc}</p>
                                    <ul className="space-y-2 flex-1">
                                        {pkg.includes.map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={13} className="text-green-400 shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href="#kontakt"
                                        className={`mt-6 block text-center py-2.5 rounded-full text-sm font-bold transition-colors ${pkg.highlight ? "btn-gold" : "border border-white/10 text-white/70 hover:border-white/30 hover:text-white"}`}
                                    >
                                        Get a quote
                                    </a>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Tech stack</p>
                        <h2 className="text-3xl font-bold text-white">What I build with</h2>
                    </AnimatedSection>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {techStack.map((tech, i) => (
                            <AnimatedSection key={tech.name} delay={i * 0.07}>
                                <div className="glass-card p-4">
                                    <p className="font-bold text-gold text-sm mb-1">{tech.name}</p>
                                    <p className="text-white/50 text-xs leading-relaxed">{tech.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">How it works</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">How your website gets built</h2>
                    </AnimatedSection>
                    <div className="space-y-4">
                        {process.map((step, i) => (
                            <AnimatedSection key={step.n} delay={i * 0.08}>
                                <div className="flex gap-5">
                                    <div className="shrink-0 w-11 h-11 rounded-full border border-gold/30 flex items-center justify-center text-gold font-bold text-sm">{step.n}</div>
                                    <div className="glass-card p-5 flex-1">
                                        <h3 className="font-bold text-white mb-1">{step.title}</h3>
                                        <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <TestimonialsSection locale="en" />

            <PageFaq items={faqs} title="Website questions" />

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </div>
    );
}
