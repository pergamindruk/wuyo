import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import { BUSINESS_REF } from "@/lib/business-schema";
import { GOOGLE_PROFILE_URL } from "@/data/google-reviews-static";
import { alternatesFor, route } from "@/lib/i18n";

// Ceny 1:1 z polskiej /druk-rzeszow. Zmiana ceny = zmiana w obu plikach.

export const metadata: Metadata = {
    title: "Business card printing in Rzeszów: pick-up in person",
    description: "Business card and flyer printing in Rzeszów, Poland, with design. 50 business cards with design from 299 PLN, print only from 99 PLN. Ready in 1–3 days, pick up in person.",
    alternates: alternatesFor("printRzeszow", "en"),
    openGraph: {
        title: "Business card printing in Rzeszów | WUYO",
        description: "Design and print in one place. Ready in 1–3 days, pick up in Rzeszów.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/printing-rzeszow",
        locale: "en_GB",
    },
};

const faqs: FaqEntry[] = [
    { q: "How much do business cards cost in Rzeszów?", a: "50 with design from 299 PLN, 100 with design from 349 PLN. Already have a file? Print only starts at 99 PLN for 50. The price includes a unique design (not a template) and double-sided print on 300 g gloss paper. Prices net, plus 23% VAT." },
    { q: "How long until I can pick up my prints in Rzeszów?", a: "Usually 1–3 working days after you approve the design, and for urgent orders even the next day. You collect in person in Rzeszów without waiting for a courier: I print in-house, so nothing goes back and forth to an outside print shop." },
    { q: "Can you do 50 business cards at the last minute?", a: "Yes. I print in-house on A3+ equipment, so I don't wait for a shared print sheet to fill up and there's no industrial minimum run. Need 50 cards for a meeting in Rzeszów tomorrow? I'll make them." },
    { q: "What if my file isn't ready for print?", a: "I check every file before printing and tell you straight what's wrong. Most often bleed is missing, colours are RGB instead of CMYK or the resolution is too low. I fix small things along the way, and if the file needs rebuilding I give you the price before doing anything." },
    { q: "Can the cards be in English?", a: "Of course. I can design your business cards and flyers in English, Polish or double-sided with one language on each side." },
];

const printSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Business card and flyer printing in Rzeszów",
    "description": "Design and print of small stationery in Rzeszów: business cards, flyers, vouchers, stickers. Small runs from 50 pieces, fast turnaround.",
    "provider": BUSINESS_REF,
    "areaServed": [{ "@type": "City", "name": "Rzeszów" }, { "@type": "AdministrativeArea", "name": "Podkarpackie" }],
    "inLanguage": "en",
    "offers": [
        { "@type": "Offer", "name": "50 business cards with design", "price": "299", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "100 business cards with design", "price": "349", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "100 A5 flyers with design", "price": "449", "priceCurrency": "PLN" },
    ],
};

const products = [
    { name: "Business cards", price: "from 299 PLN / 50 pcs", desc: "A unique design + double-sided print on 300 g gloss paper. You can order from just 50 pieces.", items: ["Design", "Double-sided 300 g print", "Gloss finish", "From 50 pcs"] },
    { name: "Flyers", price: "from 449 PLN / 100 pcs", desc: "A5, A6 or DL. A design that actually gets people to act, not just looks nice.", items: ["Design", "A5 / A6 / DL format", "130 g coated paper", "From 50 pcs"] },
    { name: "Vouchers", price: "from 289 PLN / 50 pcs", desc: "A voucher that looks like a premium product. Perforation and numbering optional.", items: ["Design", "Any format", "Optional perforation", "From 50 pcs"] },
    { name: "Stickers and labels", price: "from 219 PLN", desc: "For products, packaging and mailing. Contour-cut to any shape.", items: ["Design", "Any shape", "Standard and premium vinyl", "From 50 pcs"] },
];

export default function PrintingRzeszowPage() {
    return (
        <div className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(printSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }} />

            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <div className="inline-flex items-center gap-2 text-gold/80 text-sm font-medium mb-5 border border-gold/20 bg-gold/5 px-4 py-1.5 rounded-full">
                        <MapPin size={13} />
                        Rzeszów · ready in 1–3 days
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Business card and<br className="hidden md:block" />
                        <span className="text-gold">flyer printing in Rzeszów</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Design and print in one place. No need to find a designer, then a print shop, then explain the specs to both. You order, I design and print, you pick up or I send it by courier.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block shadow-[0_0_20px_rgba(255,235,82,0.3)]">Write to me, quote in 24h</a>
                        <Link href={route("print", "en")} className="px-8 py-3.5 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">All print services →</Link>
                    </div>
                </AnimatedSection>
            </section>

            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "299 PLN", label: "50 business cards with design, from" },
                            { stat: "1–3 days", label: "standard turnaround" },
                            { stat: "no min.", label: "small runs welcome" },
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
                        <p className="eyebrow mb-4">What I print in Rzeszów</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Design and print in one place</h2>
                        <p className="text-white/50 max-w-xl mx-auto mt-4">Every design is unique, no templates from the internet. Prices net, plus 23% VAT.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {products.map((p, i) => (
                            <AnimatedSection key={p.name} delay={i * 0.08}>
                                <div className="glass-card p-7 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-bold text-white text-lg">{p.name}</h3>
                                        <span className="text-gold font-bold text-sm shrink-0 ml-4">{p.price}</span>
                                    </div>
                                    <p className="text-white/55 text-sm leading-relaxed mb-5 flex-1">{p.desc}</p>
                                    <ul className="space-y-2">
                                        {p.items.map((item) => (
                                            <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <PageFaq items={faqs} title="Questions about printing in Rzeszów" />

            <section className="py-12 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 md:p-8 grid md:grid-cols-3 gap-6 text-center border border-white/5">
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Need a logo too?</p>
                                <Link href={route("logo", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Logo design →</Link>
                                <p className="text-white/60 text-xs mt-1">from 890 PLN · designed from scratch</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Designer in Rzeszów</p>
                                <Link href={route("designerRzeszow", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">WUYO studio →</Link>
                                <p className="text-white/60 text-xs mt-1">logo · websites · print</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Client reviews</p>
                                <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-gold transition-colors text-sm">★ Google Maps →</a>
                                <p className="text-white/60 text-xs mt-1">see what clients say</p>
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
