import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { faqsEn, priceRangesEn } from "@/data/pricing-en";
import { alternatesFor, route } from "@/lib/i18n";

export const metadata: Metadata = {
    title: "Pricing: design, print and websites in Rzeszów",
    description: "Public price ranges: logo 890–1,490 PLN, business cards with design from 299 PLN, print only from 99 PLN, websites from 1,990 PLN. Design and print in one place.",
    alternates: alternatesFor("pricing", "en"),
    openGraph: {
        title: "Pricing | WUYO Dobra Grafa",
        description: "Packages with specific prices and ranges for individual services: design, print, apparel, websites.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/pricing",
        locale: "en_GB",
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsEn.map((f) => ({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } })),
};

function PricingCardList({ title, items, note }: { title: string; items: { name: string; price: string }[]; note?: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-navy-dark/80 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-br from-gold/10 to-transparent border-b border-white/5">
                <h3 className="font-bold text-white text-base leading-tight">{title}</h3>
            </div>
            <div className="divide-y divide-white/5">
                {items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/5 transition-colors group">
                        <span className="text-white/70 text-sm group-hover:text-white transition-colors leading-snug">{item.name}</span>
                        <span className="text-gold font-bold text-sm shrink-0 whitespace-nowrap">{item.price}</span>
                    </div>
                ))}
            </div>
            {note && <p className="px-5 py-3 text-white/60 text-xs border-t border-white/5">{note}</p>}
        </div>
    );
}

export default function PricingEnPage() {
    const contact = `${route("home", "en")}#kontakt`;
    return (
        <div className="min-h-screen w-full bg-navy-dark pt-36 md:pt-48 pb-20 px-4 md:px-8 relative overflow-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />

            <div className="max-w-7xl mx-auto relative z-10">
                <AnimatedSection animateOnMount>
                    <div className="mb-14">
                        <Link href={route("home", "en")} className="inline-flex items-center gap-2 text-white/60 hover:text-gold transition-colors mb-6 font-medium text-sm">
                            <ArrowLeft size={16} /> Back to home
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <p className="eyebrow mb-2">pricing</p>
                                <h1 className="text-3xl md:text-5xl font-bold text-white">Cards <span className="text-gold">on the table</span>.</h1>
                                <p className="text-white/50 mt-3 max-w-xl text-sm md:text-base">No surprises on the invoice. Prices in PLN, net, plus 23% VAT.</p>
                            </div>
                            <Link href={contact} className="btn-gold px-8 py-3 rounded-full font-bold text-sm shrink-0 self-start md:self-auto shadow-[0_0_25px_rgba(255,235,82,0.25)]">
                                Ask for a quote →
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>

                <PricingSection className="pb-12" id="pakiety" locale="en" />

                <AnimatedSection delay={0.05}>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">What individual services cost</h2>
                    <p className="text-white/50 text-sm mb-8 max-w-2xl">
                        Ranges, so you know the ballpark. The exact amount depends on the scope: tell me what you need and I&apos;ll give you a specific price.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {priceRangesEn.map((group, i) => (
                        <AnimatedSection key={group.title} delay={0.1 + 0.05 * i}>
                            <PricingCardList title={group.title} items={group.items} note={group.note} />
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection delay={0.3}>
                    <div className="bg-[#ffeb52] text-[#1c1b17] rounded-2xl p-5 flex items-start gap-4 mt-8">
                        <div className="shrink-0 mt-0.5"><Tag size={22} /></div>
                        <div>
                            <p className="font-bold text-base leading-snug">Order 2 or more products and each additional one is 15% off.</p>
                            <p className="font-medium text-sm mt-1 opacity-80">Visually consistent designs, printed in one batch, one contact.</p>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={0.35}>
                    <p className="text-white/60 text-xs mt-6 max-w-2xl">
                        50% deposit before we start, 50% on completion. The price agreed before we start is the final price. More apparel options on the{" "}
                        <Link href={route("apparel", "en")} className="text-gold hover:underline">apparel page</Link>.
                    </p>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                    <div className="mt-14 flex flex-col items-center text-center gap-6">
                        <p className="text-white/60 max-w-2xl text-sm md:text-base">Not sure where to start? Write to me and get a concrete plan and quote within 24 hours.</p>
                        <Link href={contact} className="btn-gold px-10 py-4 rounded-full font-bold inline-flex items-center gap-2 shadow-[0_0_25px_rgba(255,235,82,0.3)] hover:shadow-[0_0_45px_rgba(255,235,82,0.5)] transition-all hover:scale-105 active:scale-95">
                            Get in touch
                        </Link>
                    </div>
                </AnimatedSection>
            </div>

            <FAQSection locale="en" />

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </div>
    );
}
