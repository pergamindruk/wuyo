import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Druk Wizytówek i Ulotek – projekt + druk | od 99 zł | WUYO",
    description: "Projekt i druk wizytówek, ulotek, voucherów w jednym miejscu. Wizytówki 50 szt. od 99 zł, termin 1–3 dni, małe nakłady bez minimum. Rzeszów + wysyłka kurierem →",
    openGraph: {
        title: "Druk Wizytówek i Ulotek – projekt + druk | WUYO",
        description: "Projekt i druk małej papeterii w jednym miejscu. Wizytówki od 99 zł, termin 1–3 dni. Rzeszów i cała Polska.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/druk",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Druk Wizytówek i Ulotek – projekt + druk | WUYO",
        description: "Wizytówki od 99 zł, termin 1–3 dni. Projekt + druk w jednym miejscu.",
        images: ["/og-image.webp"],
    },
    alternates: {
        canonical: "https://wuyo.pl/druk",
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile kosztują wizytówki z projektem?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Wizytówki 50 szt. z projektem od 99 zł, 100 szt. z projektem od 199 zł. W cenie projekt graficzny, druk dwustronny na papierze 350g i wykończenie mat lub gloss.",
            },
        },
        {
            "@type": "Question",
            "name": "Jak szybko dostanę wydruk?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Wizytówki i naklejki drukuję u siebie — standardowo 1–3 dni robocze od zatwierdzenia projektu. Wysyłka kurierem lub odbiór osobisty w Rzeszowie.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy mogę zamówić mały nakład — np. 20 wizytówek?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak. Nie mam minimalnego nakładu na wizytówki i naklejki — drukuję u siebie, więc nie obowiązują mnie minimalne ilości drukarni przemysłowych. Przy ulotkach minimum to 100 szt.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy zajmujesz się tylko projektem, czy też drukiem?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Jedno i drugie — projekt i druk w jednym miejscu. Nie musisz szukać oddzielnie grafika i drukarni, tłumaczyć specyfikacji ani wysyłać plików w odpowiednich formatach. Dostajesz gotowy produkt.",
            },
        },
    ],
};

const drukSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Druk wizytówek, ulotek i voucherów",
    "description": "Projekt graficzny i druk małej papeterii — wizytówki, ulotki, vouchery, bannery, naklejki. Projekt + druk w jednym miejscu.",
    "provider": {
        "@type": "LocalBusiness",
        "name": "WUYO – Dobra Grafa",
        "url": "https://wuyo.pl",
    },
    "areaServed": [
        { "@type": "City", "name": "Rzeszów" },
        { "@type": "Country", "name": "Polska" },
    ],
    "offers": [
        { "@type": "Offer", "name": "Wizytówki – projekt + druk", "price": "199", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Ulotki – projekt + druk", "price": "250", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Vouchery – projekt + druk", "price": "249", "priceCurrency": "PLN" },
    ],
};

const products = [
    {
        name: "Wizytówki",
        desc: "Standard 85×55 mm, papier 350g, zaokrąglone rogi, mat lub gloss. Projekt unikalny — żadnych szablonów z internetu.",
        price: "od 199 zł",
        details: ["Projekt graficzny", "Druk dwustronny", "Papier 350g/m²", "Wykończenie mat lub gloss", "Min. 100 szt."],
    },
    {
        name: "Ulotki",
        desc: "A5, A6 lub DL. Jednostronne i dwustronne. Projekt który przyciąga wzrok i rzeczywiście skłania do działania.",
        price: "od 250 zł",
        details: ["Projekt graficzny", "Format A5 / A6 / DL", "Druk jednostronny lub dwustronny", "Papier 130–170g/m²", "Min. 100 szt."],
    },
    {
        name: "Vouchery",
        desc: "Idealny prezent dla klientów — voucher który wygląda jak produkt premium, nie jak bilet parkingowy.",
        price: "od 249 zł",
        details: ["Projekt graficzny", "Format dowolny", "Perforacja lub bez", "Numeracja opcjonalna", "Min. 50 szt."],
    },
    {
        name: "Menu restauracyjne",
        desc: "Karty dań, które sprzedają. Układ, który prowadzi wzrok klienta do dań z największą marżą.",
        price: "od 400 zł",
        details: ["Projekt graficzny", "Format A4 / A5 lub niestandardowy", "Druk dwustronny", "Laminowanie opcjonalne", "Od 1 szt."],
    },
    {
        name: "Rollup / Banner",
        desc: "Na eventy, targi i wystawiennictwo. Projekt spójny z Twoją marką, gotowy do druku wielkogabarytowego.",
        price: "od 300 zł",
        details: ["Projekt graficzny", "Plik gotowy do druku (300 dpi)", "Konsultacja wymiarów", "Możliwość zamówienia druku", "Termin do 5 dni"],
    },
    {
        name: "Naklejki i etykiety",
        desc: "Na produkty, opakowania, kopertowanie. Wycinane konturowo lub na arkuszach.",
        price: "od 169 zł",
        details: ["Projekt graficzny", "Dowolny kształt i rozmiar", "Folie standardowe i premium", "Wersja do druku lokalnego", "Min. 50 szt."],
    },
];

export default function DrukPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(drukSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* ═══ HERO ═══ */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />

                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Projekt + druk</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Wizytówki, ulotki,<br />
                        <span className="bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent">
                            vouchery i więcej.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Jedno miejsce — projekt i druk. Nie musisz szukać drukarni, tłumaczyć specyfikacji ani przesyłać plików w 5 formatach. Dostajesz gotowy produkt pod drzwi.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/#kontakt"
                            className="btn-gold px-10 py-4 inline-flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]"
                        >
                            <span className="font-bold text-lg text-navy">Zamów wycenę</span>
                            <ArrowRight size={20} className="text-navy group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/cennik"
                            className="relative px-10 py-4 rounded-full inline-flex items-center justify-center border border-gold/40 hover:border-gold hover:bg-gold/10 transition-all"
                        >
                            <span className="font-bold text-lg text-white">Zobacz cennik</span>
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* ═══ PRODUKTY ═══ */}
            <section className="py-24 px-6 md:px-12 relative">
                <div className="section-glow" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <AnimatedSection className="text-center mb-16">
                        <p className="eyebrow mb-4">Co drukujemy</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                            Mała papeteria,<br />duże wrażenie
                        </h2>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, i) => (
                            <AnimatedSection key={i} delay={i * 0.08}>
                                <div className="glass-card p-8 h-full flex flex-col gap-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                        <span className="text-gold font-bold text-sm whitespace-nowrap">{product.price}</span>
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed flex-1">{product.desc}</p>
                                    <ul className="space-y-2 mt-auto">
                                        {product.details.map((detail, j) => (
                                            <li key={j} className="flex items-center gap-2 text-white/50 text-xs">
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

            {/* ═══ CROSS-SELL ═══ */}
            <section className="py-12 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-6 md:p-8 grid md:grid-cols-3 gap-6 text-center border border-white/5">
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Potrzebujesz też logo?</p>
                                <Link href="/logo" className="font-bold text-white hover:text-gold transition-colors text-sm">Logo dla firmy →</Link>
                                <p className="text-white/40 text-xs mt-1">od 800 zł · 10–14 dni</p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Potrzebujesz strony?</p>
                                <Link href="/strony-www" className="font-bold text-white hover:text-gold transition-colors text-sm">Strony internetowe →</Link>
                                <p className="text-white/40 text-xs mt-1">od 1 200 zł · Next.js</p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Jesteś z Rzeszowa?</p>
                                <Link href="/druk-rzeszow" className="font-bold text-white hover:text-gold transition-colors text-sm">Druk w Rzeszowie →</Link>
                                <p className="text-white/40 text-xs mt-1">odbiór osobisty · 1–3 dni</p>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ═══ JAK TO DZIAŁA ═══ */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Prosty proces</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Od briefu do drzwi w kilku krokach
                        </h2>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-7 left-[calc(16.5%+1rem)] right-[calc(16.5%+1rem)] h-px bg-gradient-to-r from-gold/30 via-white/10 to-gold/30" />
                        {[
                            { num: "1", title: "Wypełniasz brief", desc: "Mówisz mi co chcesz osiągnąć, ja pytam o resztę. Zajmuje to 15 minut." },
                            { num: "2", title: "Projektuję i akceptujesz", desc: "Dostajesz projekt do wglądu. Poprawki do skutku — bez liczenia rund." },
                            { num: "3", title: "Drukuję i wysyłam", desc: "Finalne pliki trafiają do druku. Gotowy produkt ląduje pod Twoją firmą." },
                        ].map((step, i) => (
                            <AnimatedSection key={i} delay={i * 0.15} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-xl mx-auto mb-4">
                                    {step.num}
                                </div>
                                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SOCIAL PROOF LINKS ═══ */}
            <section className="pb-4 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-white/40">
                            <a href="https://share.google/2xca9wmLz1mI5NvIX" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                                ★ Opinie na Google Maps
                            </a>
                            <span className="hidden sm:block">·</span>
                            <a href="https://www.instagram.com/wuyo.pl/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                                Portfolio na Instagramie →
                            </a>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Opinie */}
            <TestimonialsSection />

            {/* Kontakt */}
            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </main>
    );
}
