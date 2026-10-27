import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import { Spotlight } from "@/components/ui/spotlight";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { BUSINESS_REF } from "@/lib/business-schema";
import { alternatesFor, route } from "@/lib/i18n";

// Ceny 1:1 z polskiej strony /odziez. Zmiana ceny = zmiana w obu plikach.

export const metadata: Metadata = {
    title: "T-shirt printing in Rzeszów: DTF from 1 piece",
    description: "DTF printing on T-shirts and hoodies in Rzeszów, Poland. No minimum: 1 T-shirt 79 PLN, 20+ pcs 49 PLN each. Printing on your own clothes from 45 PLN. 1–4 working days.",
    alternates: alternatesFor("apparel", "en"),
    openGraph: {
        title: "Apparel printing: T-shirts, hoodies, personalisation | WUYO",
        description: "DTF printing on T-shirts and hoodies, name personalisation, embroidery. No minimum order. Rzeszów and all of Poland.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/apparel-printing",
        type: "website",
        locale: "en_GB",
    },
};

const faqs: FaqEntry[] = [
    { q: "What is the minimum order?", a: "DTF-printed T-shirts and hoodies start from 1 piece, no minimum. Embroidery has a minimum of 5 pieces, as it's a different technology." },
    { q: "Can I bring my own T-shirt to be printed?", a: "Yes. Bring your own clothes (T-shirt, hoodie, bag) and I'll heat-press your design onto them. The price depends on the print size, not the garment." },
    { q: "How long does it take?", a: "DTF and flex/flock printing: 1–4 working days, depending on the quantity and whether you need a design from scratch. Embroidery is agreed individually, as the time depends on the run." },
    { q: "Do you also design the print?", a: "Yes, design and print in one place. If you have a ready file, I'll use it straight away. If not, I'll design the graphic around your idea." },
    { q: "Print or embroidery for team shirts?", a: "For numbers, names and simple logos on sports shirts, DTF or flex printing is better: cheaper and faster. Embroidery works well on caps, polo shirts and workwear that gets washed more often." },
];

const clothingSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Apparel printing and personalisation",
    "description": "DTF printing on T-shirts and hoodies, name personalisation, flex/flock lettering and embroidery. Design and print in one place.",
    "provider": BUSINESS_REF,
    "areaServed": [{ "@type": "City", "name": "Rzeszów" }, { "@type": "Country", "name": "Poland" }],
    "inLanguage": "en",
    "offers": [
        { "@type": "Offer", "name": "DTF-printed T-shirt, 20+ pcs", "price": "49", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "DTF-printed hoodie, 20+ pcs", "price": "139", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Print on the customer's own clothing, small design up to A5", "price": "45", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "DTF-printed T-shirt, 1 pc", "price": "79", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "DTF-printed hoodie, 1 pc", "price": "199", "priceCurrency": "PLN" },
    ],
};

const products = [
    { name: "Printed T-shirts", desc: "Your logo, slogan or artwork on a T-shirt. Full-colour DTF print that lasts and doesn't crack or fade in the wash.", price: "from 79 PLN/pc", details: ["Full-colour DTF print", "100% cotton, 205 g, unisex", "No minimum: 1 pc 79 PLN, 5+ pcs 65 PLN, 20+ pcs 49 PLN", "Your design or one made from scratch", "2–4 days"] },
    { name: "Printed hoodies", desc: "Hooded or not, a logo on the chest or a big design on the back. Great for company events and gifts.", price: "from 199 PLN/pc", details: ["Full-colour DTF print", "280 g hoodie, with or without hood", "No minimum: 1 pc 199 PLN, 5+ pcs 169 PLN, 20+ pcs 139 PLN", "Your design or one made from scratch", "2–4 days"] },
    { name: "Printing on your clothes", desc: "Already have company T-shirts, hoodies or bags? Bring them in and I'll press your design onto them.", price: "from 45 PLN/pc", details: ["DTF transfer on supplied clothing", "Small (up to A5) or large (full front) design", "No minimum order", "1–2 days"] },
    { name: "Name personalisation", desc: "A number, first name or surname on a shirt. Perfect for events, teams, company trips and one-off gifts.", price: "from 15 PLN/pc extra", details: ["Add-on to any print from the offer", "Name, number, initials", "Font matched to the rest of the design", "Single pieces possible"] },
    { name: "Lettering and numbers (flex/flock)", desc: "Single-colour lettering or numbers cut from vinyl. A good choice for simple logos and team numbers.", price: "from 35 PLN/pc", details: ["Flex (smooth) or flock (velvet) vinyl", "One colour, simple shapes", "Great for short text and numbers", "1–2 days"] },
    { name: "Embroidery", desc: "Caps, polo shirts, workwear. Embroidery lasts for years and looks more solid than print, at the cost of a longer turnaround.", price: "from 45 PLN/pc", details: ["Caps, polos, jackets, workwear", "More durable than print", "Minimum 5 pcs", "Turnaround agreed individually"] },
];

const steps = [
    { num: "1", title: "Tell me what you need", desc: "Design, quantity, sizes: your artwork or mine. It takes a few minutes." },
    { num: "2", title: "Approve the design", desc: "You get a preview of the print on the garment before anything goes under the press." },
    { num: "3", title: "Collect it ready", desc: "Pick-up in Rzeszów or courier delivery, without unnecessary waiting." },
];

export default function ApparelPrintingPage() {
    return (
        <div className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(clothingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }} />

            <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">DTF printing · Rzeszów · shipping across Poland</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        T-shirt and hoodie<br />
                        <span className="bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent">printing in Rzeszów</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Prints that last: DTF, name personalisation, embroidery. No minimum order. One T-shirt or a whole team, one contact from design to the finished piece.
                    </p>
                    <Link href="#kontakt" className="btn-gold px-10 py-4 inline-flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]">
                        <span className="font-bold text-lg text-navy">Get a quote</span>
                        <ArrowRight size={20} className="text-navy group-hover:translate-x-1 transition-transform" />
                    </Link>
                </AnimatedSection>
            </section>

            <section className="py-24 px-6 md:px-12 relative">
                <div className="section-glow" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection className="text-center mb-16">
                        <p className="eyebrow mb-4">What I do</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">From one T-shirt<br />to the whole team</h2>
                        <p className="text-white/50 mt-4 text-sm">Prices net, plus 23% VAT.</p>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, i) => (
                            <AnimatedSection key={product.name} delay={i * 0.08}>
                                <div className="glass-card p-8 h-full flex flex-col gap-5">
                                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                        <span className="text-gold font-bold text-sm whitespace-nowrap">{product.price}</span>
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed flex-1">{product.desc}</p>
                                    <ul className="space-y-2 mt-auto">
                                        {product.details.map((detail) => (
                                            <li key={detail} className="flex items-center gap-2 text-white/50 text-xs">
                                                <CheckCircle2 size={14} className="text-gold shrink-0" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-12 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 md:p-8 grid md:grid-cols-3 gap-6 text-center border border-white/5">
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Need a logo to print?</p>
                                <Link href={route("logo", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Logo design →</Link>
                                <p className="text-white/60 text-xs mt-1">from 890 PLN · 7–10 days</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Business cards too?</p>
                                <Link href={route("print", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Print & stationery →</Link>
                                <p className="text-white/60 text-xs mt-1">business cards from 99 PLN</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">In Rzeszów?</p>
                                <Link href={route("printRzeszow", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Pick up in person →</Link>
                                <p className="text-white/60 text-xs mt-1">no shipping costs</p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Simple process</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">From idea to finished piece</h2>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-7 left-[calc(16.5%+1rem)] right-[calc(16.5%+1rem)] h-px bg-gradient-to-r from-gold/30 via-white/10 to-gold/30" />
                        {steps.map((step, i) => (
                            <AnimatedSection key={step.num} delay={i * 0.15} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-xl mx-auto mb-4">{step.num}</div>
                                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <TestimonialsSection locale="en" />

            <PageFaq items={faqs} title="Printing and personalisation questions" />

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </div>
    );
}
