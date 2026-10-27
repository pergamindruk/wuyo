import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin, Zap, Shield, PenLine } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import { BUSINESS_RATING, BUSINESS_REF } from "@/lib/business-schema";
import { alternatesFor, route } from "@/lib/i18n";

// Ceny 1:1 z polskiej /strony-internetowe-rzeszow. Zmiana ceny = zmiana w obu plikach.

export const metadata: Metadata = {
    title: "Web design in Rzeszów: websites from 1,990 PLN",
    description: "Websites for businesses in Rzeszów, Poland: one-page from 1,990 PLN, up to 5 pages 2,990 PLN, online shop from 6,900 PLN. Domain and hosting for a year included.",
    alternates: alternatesFor("websitesRzeszow", "en"),
    openGraph: {
        title: "Web design in Rzeszów | WUYO",
        description: "Fast websites on Next.js or WordPress for businesses in Rzeszów. One-page from 1,990 PLN. Quote within 24h.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/web-design-rzeszow",
        locale: "en_GB",
    },
};

const faqs: FaqEntry[] = [
    { q: "How much does a website cost in Rzeszów?", a: "A one-page site starts at 1,990 PLN, a business website with up to 5 pages is 2,990 PLN and an online shop starts at 6,900 PLN. Domain and hosting for the first year are included. Every quote is fixed: you know the amount before we start, with no hourly rate and no surprises. Prices net, plus 23% VAT." },
    { q: "How much is it to keep the site running after the first year?", a: "Website Care is 199 PLN a month: server, domain, backups, security and 1 hour of small changes a month. Cancel any time with one month's notice." },
    { q: "Can I get a cheap website in Rzeszów?", a: "My cheapest option is a one-page site from 1,990 PLN: one page, one goal, a contact form, SEO, and domain and hosting for a year. Enough for a new business, a freelancer or a single service. Cheaper offers are usually a ready-made template that is hard to rank in Google." },
    { q: "How long does it take to build a website?", a: "7–14 working days, for both one-page and multi-page sites. It mostly depends on how quickly you send the content." },
    { q: "Can the website be in English, Polish or both?", a: "Yes. I can build the site in English, Polish or both languages with a language switch, so you can reach both Polish customers and other foreigners in Rzeszów." },
    { q: "Can I edit the content myself?", a: "Yes. If you want to add posts, projects or products yourself, I build the site on WordPress and show you the dashboard. With a Next.js site just message me: Website Care includes 1 hour of small changes a month." },
    { q: "Next.js or WordPress: which should I choose?", a: "Next.js if the site is a fast business card and I make the changes. WordPress if you want to edit content yourself or run a WooCommerce shop. I build both. WordPress needs regular updates, so I hand it over together with a care plan." },
];

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Web design in Rzeszów",
    "description": "Website design and development for businesses in Rzeszów and Podkarpackie. Next.js and WordPress, WooCommerce shops, fast loading, technical SEO, responsive.",
    "provider": { ...BUSINESS_REF, "aggregateRating": BUSINESS_RATING },
    "areaServed": [{ "@type": "City", "name": "Rzeszów" }, { "@type": "AdministrativeArea", "name": "Podkarpackie" }, { "@type": "Country", "name": "Poland" }],
    "inLanguage": "en",
};

const priceTable = [
    { name: "One-page website", price: "from 1,990 PLN" },
    { name: "Business website up to 5 pages", price: "2,990 PLN" },
    { name: "Online shop", price: "from 6,900 PLN" },
    { name: "Extra section on an existing site", price: "from 100 PLN" },
    { name: "Business Online package: logo, identity and website up to 5 pages", price: "3,490 PLN" },
    { name: "Website Care: server, domain, backups, 1h of changes", price: "199 PLN / month" },
];

const packages = [
    { name: "One-page", price: "from 1,990 PLN", time: "7–14 working days", desc: "One page, one goal. Ideal for freelancers, coaches and new businesses that want to get online fast.", items: ["UI/UX design", "Next.js + React", "Contact form", "On-page SEO", "Domain and hosting for the 1st year included"], highlight: false },
    { name: "Multi-page", price: "from 2,990 PLN", time: "7–14 working days", desc: "A website with subpages, a blog and SEO for many phrases. For businesses that want to grow through Google.", items: ["Everything in one-page +", "Service pages with SEO", "Blog ready to publish", "Schema markup JSON-LD", "Google Search Console setup"], highlight: true },
];

const benefits = [
    { icon: <Zap size={20} className="text-gold" />, title: "Next.js: loads in under 1s", desc: "Every extra second of loading loses visitors. Check your current site in PageSpeed Insights: if the score is under 90, it's time for a change." },
    { icon: <Shield size={20} className="text-gold" />, title: "Next.js: nothing to hack", desc: "No database exposed to the internet. Next.js generates static files, so there is very little to hack and nothing to update every week." },
    { icon: <PenLine size={20} className="text-gold" />, title: "WordPress: you edit the content", desc: "Posts, projects, offers or a WooCommerce shop: you edit them in the dashboard. I take care of updates and backups as part of the care plan." },
];

export default function WebDesignRzeszowPage() {
    return (
        <div className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }} />

            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <div className="inline-flex items-center gap-2 text-gold/80 text-sm font-medium mb-5 border border-gold/20 bg-gold/5 px-4 py-1.5 rounded-full">
                        <MapPin size={13} />
                        Rzeszów · Podkarpackie · all of Poland
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Websites for<br className="hidden md:block" />
                        <span className="text-gold">businesses in Rzeszów</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        I build sites from scratch in Next.js, or on WordPress if you want to edit content yourself. Your site loads fast, Google sees it from day one and you get a fixed price before we start.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block shadow-[0_0_20px_rgba(255,235,82,0.3)]">Write to me, quote in 24h</a>
                        <Link href={route("websites", "en")} className="px-8 py-3.5 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">All website services →</Link>
                    </div>
                </AnimatedSection>
            </section>

            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "< 1s", label: "loading time (LCP)" },
                            { stat: "1,990 PLN", label: "one-page from" },
                            { stat: "24h", label: "to get a quote" },
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
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Pricing</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Website prices in Rzeszów (2026)</h2>
                        <p className="text-white/50 max-w-xl mx-auto mt-4">The quote is the final price. No hourly rate, no surprises on the invoice. Prices net, plus 23% VAT.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {packages.map((pkg, i) => (
                            <AnimatedSection key={pkg.name} delay={i * 0.1}>
                                <div className={`glass-card p-7 flex flex-col h-full ${pkg.highlight ? "border border-gold/30" : ""}`}>
                                    {pkg.highlight && <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">Most popular</p>}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                        <p className={`text-2xl font-bold ${pkg.highlight ? "text-gold" : "text-white/80"}`}>{pkg.price}</p>
                                        <p className="text-white/50 text-xs mt-1">⏱ {pkg.time}</p>
                                    </div>
                                    <p className="text-white/55 text-sm mb-5 leading-relaxed">{pkg.desc}</p>
                                    <ul className="space-y-2 flex-1">
                                        {pkg.items.map((item) => (
                                            <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <a href="#kontakt" className={`mt-6 block text-center py-2.5 rounded-full text-sm font-bold transition-colors ${pkg.highlight ? "btn-gold" : "border border-white/10 text-white/70 hover:border-white/30 hover:text-white"}`}>Get a quote</a>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>

                    <AnimatedSection className="mt-10">
                        <div className="glass-card p-6 md:p-8">
                            <h3 className="font-bold text-white mb-4">Full website price list</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-white/50 border-b border-white/10">
                                        <th scope="col" className="py-2 font-medium">Service</th>
                                        <th scope="col" className="py-2 font-medium text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {priceTable.map((row) => (
                                        <tr key={row.name} className="border-b border-white/5 last:border-0">
                                            <td className="py-2.5 pr-4 text-white/70">{row.name}</td>
                                            <td className="py-2.5 text-right font-bold text-white whitespace-nowrap">{row.price}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="text-white/50 text-xs mt-4">Domain and hosting for the first year are included with every website.</p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Technology</p>
                        <h2 className="text-3xl font-bold text-white">Next.js or WordPress?</h2>
                        <p className="text-white/50 max-w-2xl mx-auto mt-4">I build both. You choose based on whether you want to edit the content yourself.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-3 gap-4">
                        {benefits.map((item, i) => (
                            <AnimatedSection key={item.title} delay={i * 0.08}>
                                <div className="glass-card p-6 h-full">
                                    <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center mb-3">{item.icon}</div>
                                    <h3 className="font-bold text-white mb-2 text-sm">{item.title}</h3>
                                    <p className="text-white/55 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <PageFaq items={faqs} title="Questions about websites in Rzeszów" />

            <section className="py-12 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 md:p-8 grid md:grid-cols-2 gap-6 text-center border border-white/5">
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Need a logo too?</p>
                                <Link href={route("logo", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Logo design →</Link>
                                <p className="text-white/60 text-xs mt-1">from 890 PLN · designed from scratch</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Designer in Rzeszów</p>
                                <Link href={route("designerRzeszow", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">About WUYO studio →</Link>
                                <p className="text-white/60 text-xs mt-1">logo · websites · print</p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <TestimonialsSection locale="en" />

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </div>
    );
}
