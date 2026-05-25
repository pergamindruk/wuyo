import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Druk Wizytówek i Ulotek Rzeszów – projekt + druk | WUYO",
    description: "Druk wizytówek, ulotek, voucherów i naklejek w Rzeszowie. Projekt graficzny i druk w jednym miejscu. Małe nakłady, szybka realizacja. Wizytówki od 99 zł.",
    keywords: [
        "druk wizytówek Rzeszów",
        "druk ulotek Rzeszów",
        "druk naklejek Rzeszów",
        "drukarnia Rzeszów",
        "wizytówki Rzeszów",
        "ulotki Rzeszów",
        "druk małych nakładów Rzeszów",
        "projekt i druk Rzeszów",
    ],
    openGraph: {
        title: "Druk Wizytówek i Ulotek Rzeszów | WUYO",
        description: "Projekt i druk wizytówek, ulotek i naklejek w Rzeszowie. Małe nakłady, szybka realizacja. Od 99 zł.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/druk-rzeszow",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Druk Wizytówek i Ulotek Rzeszów | WUYO",
        description: "Projekt + druk wizytówek i ulotek w Rzeszowie. Małe nakłady. Od 99 zł.",
        images: ["/og-image.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/druk-rzeszow" },
};

const localSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Druk wizytówek i ulotek – Rzeszów",
    "description": "Projekt graficzny i druk małej papeterii w Rzeszowie — wizytówki, ulotki, vouchery, naklejki. Małe nakłady bez minimum, szybka realizacja.",
    "provider": {
        "@type": "LocalBusiness",
        "name": "WUYO – Dobra Grafa",
        "url": "https://wuyo.pl",
        "telephone": "+48725182053",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Rzeszów",
            "addressRegion": "Podkarpacie",
            "postalCode": "35-203",
            "addressCountry": "PL",
        },
    },
    "areaServed": [
        { "@type": "City", "name": "Rzeszów" },
        { "@type": "AdministrativeArea", "name": "Podkarpacie" },
    ],
    "offers": [
        { "@type": "Offer", "name": "Wizytówki 50 szt. z projektem", "price": "99", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Wizytówki 100 szt. z projektem", "price": "199", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Ulotki z projektem", "price": "250", "priceCurrency": "PLN" },
    ],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile kosztują wizytówki w Rzeszowie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Wizytówki 50 szt. z projektem graficznym od 99 zł, 100 szt. z projektem od 199 zł. W cenie projekt unikalny (nie szablon), druk dwustronny na papierze 350g i wykończenie mat lub gloss.",
            },
        },
        {
            "@type": "Question",
            "name": "Jak szybko można dostać wydruk w Rzeszowie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Wizytówki i naklejki standardowo 1–3 dni robocze od zatwierdzenia projektu. Odbiór osobisty w Rzeszowie lub wysyłka kurierem. Przy pilnych zleceniach realizacja nawet następnego dnia.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy można zamówić mały nakład wizytówek?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak — drukuję u siebie, więc nie obowiązują mnie minimalne nakłady drukarni przemysłowych. Możesz zamówić 20 czy 50 sztuk bez problemu.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy zajmujesz się tylko projektem, czy też drukiem?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Jedno i drugie. Projektuję i drukuję — nie musisz szukać oddzielnie grafika i drukarni. Dostajesz gotowy produkt.",
            },
        },
    ],
};

const products = [
    { name: "Wizytówki", price: "od 99 zł / 50 szt.", desc: "Projekt unikalny + druk dwustronny na 350g. Mat lub gloss. Możesz zamówić już od 20 sztuk.", items: ["Projekt graficzny", "Druk dwustronny 350g", "Mat lub gloss", "Od 20 szt."] },
    { name: "Ulotki", price: "od 250 zł / 100 szt.", desc: "A5, A6 lub DL. Projekt który rzeczywiście skłania do działania, nie tylko ładnie wygląda.", items: ["Projekt graficzny", "Format A5 / A6 / DL", "Papier 130–170g", "Min. 100 szt."] },
    { name: "Vouchery", price: "od 249 zł / 50 szt.", desc: "Voucher który wygląda jak produkt premium. Perforacja, numeracja — opcjonalnie.", items: ["Projekt graficzny", "Format dowolny", "Perforacja opcjonalna", "Od 50 szt."] },
    { name: "Naklejki i etykiety", price: "od 169 zł", desc: "Na produkty, opakowania, kopertowanie. Wycinane konturowo w dowolnym kształcie.", items: ["Projekt graficzny", "Dowolny kształt", "Folie standardowe i premium", "Od 20 szt."] },
];

export default function DrukRzeszowPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* HERO */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <div className="inline-flex items-center gap-2 text-gold/80 text-sm font-medium mb-5 border border-gold/20 bg-gold/5 px-4 py-1.5 rounded-full">
                        <MapPin size={13} />
                        Rzeszów · realizacja 1–3 dni
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Druk wizytówek<br className="hidden md:block" />
                        <span className="text-gold">i ulotek w Rzeszowie</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Projekt i druk w jednym miejscu. Nie musisz szukać grafika, potem drukarni, potem tłumaczyć im specyfikacji. Zamówisz, zaprojektuję, wydrukuję — odbierzesz lub wyślę kurierem.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block shadow-[0_0_20px_rgba(255,235,82,0.3)]">
                            Napisz — wycena w 24h
                        </a>
                        <Link href="/druk" className="px-8 py-3.5 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">
                            Pełna oferta druku →
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* STATS */}
            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "od 99 zł", label: "wizytówki 50 szt. z projektem" },
                            { stat: "1–3 dni", label: "standardowy czas realizacji" },
                            { stat: "bez min.", label: "małe nakłady bez problemu" },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* PRODUKTY */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Co drukuję w Rzeszowie</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Projekt i druk w jednym miejscu</h2>
                        <p className="text-white/50 max-w-xl mx-auto mt-4">Każdy projekt jest unikalny — nie używam szablonów z internetu. Dostajesz grafikę zrobioną pod Twoją firmę.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {products.map((p, i) => (
                            <AnimatedSection key={i} delay={i * 0.08}>
                                <div className="glass-card p-7 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-bold text-white text-lg">{p.name}</h3>
                                        <span className="text-gold font-bold text-sm shrink-0 ml-4">{p.price}</span>
                                    </div>
                                    <p className="text-white/55 text-sm leading-relaxed mb-5 flex-1">{p.desc}</p>
                                    <ul className="space-y-2">
                                        {p.items.map((item, ii) => (
                                            <li key={ii} className="flex items-center gap-2 text-white/60 text-xs">
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

            {/* FAQ */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection className="text-center mb-12">
                        <p className="eyebrow mb-4">FAQ</p>
                        <h2 className="text-3xl font-bold text-white">Pytania o druk w Rzeszowie</h2>
                    </AnimatedSection>
                    <div className="space-y-4">
                        {[
                            { q: "Ile kosztują wizytówki w Rzeszowie?", a: "50 szt. z projektem od 99 zł, 100 szt. z projektem od 199 zł. Projekt unikalny, druk dwustronny 350g, mat lub gloss." },
                            { q: "Jak szybko dostanę wydruk?", a: "Standardowo 1–3 dni robocze od zatwierdzenia projektu. Odbiór w Rzeszowie lub wysyłka kurierem." },
                            { q: "Czy można zamówić mały nakład?", a: "Tak — drukuję u siebie, więc możesz zamówić nawet 20 wizytówek czy naklejek bez żadnego problemu." },
                            { q: "Czy projektujesz i drukujesz jednocześnie?", a: "Tak — jedno zlecenie, jedna osoba, jeden kontakt. Projekt + druk w jednym miejscu." },
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.06}>
                                <div className="glass-card p-5">
                                    <h3 className="font-bold text-white mb-2 text-sm">{item.q}</h3>
                                    <p className="text-white/55 text-sm leading-relaxed">{item.a}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* OPINIE */}
            <TestimonialsSection />

            {/* KONTAKT */}
            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </main>
    );
}
