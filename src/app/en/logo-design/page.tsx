import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Layers, FileText, Palette, Type } from "lucide-react";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { BUSINESS_RATING, BUSINESS_REF } from "@/lib/business-schema";
import { alternatesFor, route } from "@/lib/i18n";

// Ceny i zakresy 1:1 z polskiej strony /logo. Zmiana ceny = zmiana w obu plikach.

export const metadata: Metadata = {
    title: "Logo design in Rzeszów, Poland: from 890 PLN",
    description: "Logo design from scratch, no templates. 3 concepts, all files and full copyright included. Logo from 890 PLN, brand identity 1,490 PLN. Quote within 24 hours.",
    alternates: alternatesFor("logo", "en"),
    openGraph: {
        title: "Logo design from 890 PLN | WUYO, Rzeszów",
        description: "A logo with a real process, vector files and full copyright. Quote within 24 hours.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/logo-design",
        type: "website",
        locale: "en_GB",
    },
};

const faqs: FaqEntry[] = [
    {
        q: "How much does a logo cost?",
        a: "A logo starts at 890 PLN, a logo with a mini brand book is 1,190 PLN, a logo with 100 business cards (design + print, Marka Mini package) is 1,090 PLN, and a full brand identity (logo + brand book + printed business cards + email signature) is 1,490 PLN. Refreshing an existing logo starts at 1,000 PLN. Every quote is fixed: you know the price before we start, not after. Prices are net, plus 23% VAT.",
    },
    {
        q: "How long does a logo take?",
        a: "Usually 7–10 working days from the approved brief. A good brief shortens that time: the more I know about your business, the closer the first proposal is.",
    },
    {
        q: "What do I get with my logo?",
        a: "The full package: SVG (vector, scales to any size), PNG with a transparent background and a print-ready PDF. Colour palette in HEX and CMYK, brand typography and all variants (colour, mono, icon). Full copyright passes to you at no extra cost.",
    },
    {
        q: "Can I edit the logo myself afterwards?",
        a: "Yes. On request I hand over the Figma or Adobe Illustrator source files. If you don't use design software, PNG and SVG files are all you need day to day.",
    },
    {
        q: "What if the print shop sends the file back with comments?",
        a: "I fix it at my own cost. Making sure the file is prepared correctly is my job: scale, bleed, colours, resolution. This doesn't cover content changes requested after you approve the design, as that is new work.",
    },
];

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Logo design and brand identity",
    "description": "Logo and full brand identity design for businesses and freelancers. Designed from scratch, vector files and full copyright included.",
    "provider": BUSINESS_REF,
    "areaServed": ["Rzeszów", "Poland", "Europe"],
    "url": "https://wuyo.pl/en/logo-design",
    "inLanguage": "en",
    "aggregateRating": BUSINESS_RATING,
};

const packages = [
    {
        name: "Logo",
        price: "from 890 PLN",
        desc: "The starting point: a logo ready to use straight away.",
        includes: ["Logo (colour + monochrome)", "Icon / symbol (favicon, avatar)", "Colour palette (HEX + CMYK)", "Brand typography", "Files: SVG, PNG, PDF", "Full copyright"],
        highlight: false,
    },
    {
        name: "Logo + mini brand book",
        price: "1,190 PLN",
        desc: "A logo with usage rules, so a printer, embroiderer or engraver knows exactly how it should look.",
        includes: ["Everything in Logo +", "Mini brand book (PDF)", "Clear space and minimum size", "HEX, RGB and CMYK colours", "What not to do with the logo"],
        highlight: false,
    },
    {
        name: "Brand identity",
        price: "1,490 PLN",
        desc: "Marka Start package: a logo plus everything a business needs from day one.",
        includes: ["Everything in Logo +", "Mini brand book (colours, fonts, rules)", "150 business cards, double-sided design + print", "Email signature ready to paste", "Source files (Figma / AI)"],
        highlight: true,
    },
    {
        name: "Logo refresh",
        price: "from 1,000 PLN",
        desc: "Have a logo but something feels off? I refresh it without losing your brand's identity.",
        includes: ["Review of your current logo", "Modernisation proposal", "New files in every format", "Updated colours and typography", "Full copyright"],
        highlight: false,
    },
];

const process = [
    { n: "01", title: "Brief", desc: "We talk about your business: who your customers are, who you compete with and what the logo should say. I don't start drawing without this step." },
    { n: "02", title: "Moodboard", desc: "A visual direction for you to approve: style, colours, mood. You sign it off before the first logo is drawn." },
    { n: "03", title: "Design", desc: "3 concepts to choose from: one main concept built around your brief and 2 alternative directions. Each comes with the reasoning behind it, not just the looks." },
    { n: "04", title: "Revisions", desc: "Revisions to the chosen concept are included. We work until you approve. A good brief means hitting the mark first time." },
    { n: "05", title: "Files and documentation", desc: "The full export package plus a brand book or basic colour and font documentation. Ready to use anywhere." },
];

const included = [
    { icon: <Layers size={22} className="text-gold" />, title: "Logo in every variant", desc: "Colour, monochrome (black and white), icon/symbol and versions for dark and light backgrounds. Ready for any medium." },
    { icon: <Palette size={22} className="text-gold" />, title: "Colour palette with values", desc: "HEX (websites, social media), CMYK (offset print), RGB (screens, presentations). No guesswork at the print shop." },
    { icon: <Type size={22} className="text-gold" />, title: "Brand typography", desc: "Fonts chosen to work with the logo, for headings and body text. With download links or a commercial licence." },
    { icon: <FileText size={22} className="text-gold" />, title: "Complete file package", desc: "SVG (vector, scalable), PNG with transparent background, PDF (print). Source files (Figma/AI) on request." },
];

const audience = [
    { who: "Start-ups and new businesses", desc: "A first logo that opens doors to customers instead of closing them." },
    { who: "Freelancers", desc: "A personal brand you can put on a business card and LinkedIn." },
    { who: "Local businesses", desc: "A logo that works on a shop sign, a van and a website, with no compromises." },
    { who: "Shops and e-commerce", desc: "A recognisable mark that builds trust before the first purchase." },
    { who: "Rebranding", desc: "A refresh without losing recognition, when the business has outgrown its old logo." },
    { who: "Clients from abroad", desc: "Projects for businesses across Europe and beyond, with communication in English." },
];

export default function LogoDesignPage() {
    return (
        <div className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }} />

            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Rzeszów · Poland · remote across Europe</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Logo design<br className="hidden md:block" /> <span className="text-gold">that does its job</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        A logo that works, not just looks good. I design it with a proper process, a clear idea behind it and a full set of files. No templates: every logo is made from scratch for one specific business.
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
                            { stat: "5.0", label: "Google rating" },
                            { stat: "24h", label: "to get a quote" },
                            { stat: "100%", label: "vector files included" },
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
                        <p className="eyebrow mb-4">What's included</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">What you get with every logo</h2>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {included.map((item, i) => (
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
                    <AnimatedSection className="mt-6">
                        <div className="glass-card p-5 flex items-center gap-3 border-l-2 border-gold">
                            <CheckCircle2 size={18} className="text-gold shrink-0" />
                            <p className="text-white/70 text-sm">
                                <strong className="text-white">Full copyright</strong> passes to you when the files are delivered. No hidden &quot;licence&quot; fees.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Pricing</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Packages and prices</h2>
                        <p className="text-white/50 max-w-xl mx-auto">The quote is the final price. No hidden costs, no surprises on the invoice. Prices net, plus 23% VAT.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {packages.map((pkg, i) => (
                            <AnimatedSection key={pkg.name} delay={i * 0.1}>
                                <div className={`glass-card p-6 flex flex-col h-full ${pkg.highlight ? "border border-gold/30" : ""}`}>
                                    {pkg.highlight && <p className="text-gold text-xs font-bold tracking-widest uppercase mb-3">Most popular</p>}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                                        <p className={`text-2xl font-bold ${pkg.highlight ? "text-gold" : "text-white/80"}`}>{pkg.price}</p>
                                    </div>
                                    <p className="text-white/50 text-sm mb-5 leading-relaxed">{pkg.desc}</p>
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
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">How it works</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">The logo design process</h2>
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
                    <AnimatedSection className="mt-6">
                        <div className="glass-card p-5 text-center">
                            <p className="text-white/60 text-sm">
                                Average turnaround: <strong className="text-white">7–10 working days</strong> from the approved brief.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">Who it's for</p>
                        <h2 className="text-3xl font-bold text-white">Logos for businesses of every size</h2>
                    </AnimatedSection>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {audience.map((item, i) => (
                            <AnimatedSection key={item.who} delay={i * 0.07}>
                                <div className="glass-card p-5 h-full">
                                    <h3 className="font-bold text-white text-sm mb-2">{item.who}</h3>
                                    <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                    <AnimatedSection className="mt-8 text-center">
                        <p className="text-white/50 text-sm">
                            Need more than a logo? See my{" "}
                            <Link href={route("websites", "en")} className="text-gold hover:underline">websites</Link>
                            {" "}and{" "}
                            <Link href={route("print", "en")} className="text-gold hover:underline">print services</Link>.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            <TestimonialsSection locale="en" />

            <PageFaq items={faqs} title="Logo design questions" />

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </div>
    );
}
