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

// Ceny 1:1 z polskiej strony /druk. Bez sklepu z koszykiem (PackagesSection): zamówienie
// online jest po polsku, obcokrajowiec zamawia przez formularz wyceny.

export const metadata: Metadata = {
    title: "Business cards and flyers with design, Poland",
    description: "Design and print of business cards, flyers and vouchers, shipped across Poland. 50 business cards with design from 299 PLN, print only from 99 PLN.",
    alternates: alternatesFor("print", "en"),
    openGraph: {
        title: "Business card and flyer printing with design | WUYO",
        description: "Design and print in one place. Business cards with design from 299 PLN, print only from 99 PLN.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/printing",
        type: "website",
        locale: "en_GB",
    },
};

const faqs: FaqEntry[] = [
    { q: "How much do business cards with design cost?", a: "50 business cards from 99 PLN if you already have a design. With design from 299 PLN, 100 cards with design from 349 PLN. Includes double-sided print on 300 g gloss paper. Prices net, plus 23% VAT." },
    { q: "How quickly will I get my prints?", a: "I print business cards and stickers in-house, usually 1–3 working days after you approve the design. Courier delivery or pick-up in Rzeszów." },
    { q: "Can I order a small run, e.g. 50 business cards?", a: "Yes. I print business cards, flyers and stickers in-house from 50 pieces. No minimum runs like at industrial print shops, which usually start at 250." },
    { q: "Do you only design, or print as well?", a: "Both, in one place. You don't need to find a designer and a print shop separately, explain specifications or send files in the right formats. You get the finished product." },
    { q: "What if the print shop sends the file back with comments?", a: "I fix it at my own cost. Preparing the file correctly is my job: scale, bleed, colours, resolution. This doesn't cover content changes after you approve the design, as that is new work." },
];

const printSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Business card, flyer and voucher printing",
    "description": "Design and print of small stationery: business cards, flyers, vouchers, banners and stickers. Design and print in one place.",
    "provider": BUSINESS_REF,
    "areaServed": [{ "@type": "City", "name": "Rzeszów" }, { "@type": "Country", "name": "Poland" }],
    "inLanguage": "en",
    "offers": [
        { "@type": "Offer", "name": "Business cards: design + print", "price": "299", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Flyers: design + print", "price": "449", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Vouchers: design + print", "price": "289", "priceCurrency": "PLN" },
    ],
};

const products = [
    { name: "Business cards", desc: "Standard 85×55 mm, 300 g gloss paper. A unique design, no templates from the internet.", price: "from 299 PLN", details: ["Design", "Double-sided print", "300 g/m² paper", "Gloss finish", "From 50 pcs"] },
    { name: "Flyers", desc: "A5, A6 or DL. Single or double-sided. A design that catches the eye and actually gets people to act.", price: "from 449 PLN", details: ["Design", "A5 / A6 / DL format", "Single or double-sided", "130 g coated paper", "From 50 pcs"] },
    { name: "Vouchers", desc: "A great gift for your customers: a voucher that looks like a premium product, not a parking ticket.", price: "from 289 PLN", details: ["Design", "Any format", "With or without perforation", "Optional numbering", "Min. 50 pcs"] },
    { name: "Restaurant menus", desc: "Menus that sell. A layout that guides the eye to the dishes with the best margin.", price: "from 400 PLN", details: ["Design", "A4 / A5 or custom format", "Double-sided print", "Optional lamination", "From 1 pc"] },
    { name: "Roll-up / banner", desc: "For events, fairs and exhibitions. A design that matches your brand, ready for large-format print.", price: "from 260 PLN", details: ["Design", "Print-ready file (300 dpi)", "Help with dimensions", "Print can be ordered", "Up to 5 days"] },
    { name: "Stickers and labels", desc: "For products, packaging and mailing. Contour-cut or on sheets.", price: "from 219 PLN", details: ["Design", "Any shape and size", "Standard and premium vinyl", "Version for local print", "Min. 50 pcs"] },
];

const steps = [
    { num: "1", title: "You fill in the brief", desc: "You tell me what you want to achieve, I ask about the rest. It takes 15 minutes." },
    { num: "2", title: "I design, you approve", desc: "You get the design to review. Revisions until it's right, no counting rounds." },
    { num: "3", title: "I print and ship", desc: "The final files go to print. The finished product arrives at your door." },
];

export default function PrintingPage() {
    return (
        <div className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(printSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }} />

            <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Design + print · shipping across Poland</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Business cards, flyers,<br />
                        <span className="bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent">vouchers and more.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                        One place for design and print. No hunting for a print shop, explaining specifications or sending files in five formats. The finished product arrives at your door. Based in Rzeszów?{" "}
                        <Link href={route("printRzeszow", "en")} className="text-gold hover:underline">Pick up your cards in person</Link>.
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
                        <p className="eyebrow mb-4">What I print</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">Small stationery,<br />big impression</h2>
                        <p className="text-white/50 mt-4 text-sm">Prices net, plus 23% VAT.</p>
                    </AnimatedSection>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, i) => (
                            <AnimatedSection key={product.name} delay={i * 0.08}>
                                <div className="glass-card p-8 h-full flex flex-col gap-5">
                                    <div className="flex items-start justify-between gap-4">
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
                        <div className="glass-card p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center border border-white/5">
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Need a logo too?</p>
                                <Link href={route("logo", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Logo design →</Link>
                                <p className="text-white/60 text-xs mt-1">from 890 PLN · 7–10 days</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Need a website?</p>
                                <Link href={route("websites", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Websites →</Link>
                                <p className="text-white/60 text-xs mt-1">from 1,990 PLN · Next.js</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">T-shirts, hoodies?</p>
                                <Link href={route("apparel", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Apparel printing →</Link>
                                <p className="text-white/60 text-xs mt-1">from 79 PLN/pc · no minimum</p>
                            </div>
                            <div>
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">In Rzeszów?</p>
                                <Link href={route("printRzeszow", "en")} className="font-bold text-white hover:text-gold transition-colors text-sm">Printing in Rzeszów →</Link>
                                <p className="text-white/60 text-xs mt-1">pick-up in person · 1–3 days</p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Simple process</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">From brief to your door in a few steps</h2>
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

            <PageFaq items={faqs} title="Design and print questions" />

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </div>
    );
}
