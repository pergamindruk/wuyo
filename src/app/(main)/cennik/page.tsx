import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { faqs } from "@/data/faq";

// Schemat FAQ generowany z tych samych danych, które renderuje FAQSection —
// Google wymaga, żeby schemat miał pokrycie w treści strony, a jedno źródło
// gwarantuje, że nie rozjadą się przy edycji.
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
        "@type": "Question",
        "name": f.question,
        "acceptedAnswer": { "@type": "Answer", "text": f.answer },
    })),
};

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cennik usług graficznych, druku i webowych | WUYO – Rzeszów",
    description: "Jawne widełki: logo 890–1 490 zł, wizytówki z projektem od 299 zł, sam druk od 99 zł, strona od 2 490 zł. Projekt i druk w jednym miejscu.",
    openGraph: {
        title: "Cennik | WUYO – Dobra Grafa",
        description: "Pakiety z konkretnymi cenami i widełki dla pojedynczych usług — grafika, druk, odzież, strony www.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/cennik",
    },
    twitter: {
        card: "summary_large_image",
        title: "Cennik | WUYO – Dobra Grafa",
        description: "Jawne widełki: logo od 890 zł, druk wizytówek od 99 zł, strona od 2 490 zł. Wycena konkretna po jednej wiadomości.",
        images: ["/og-image.webp"],
    },
    alternates: {
        canonical: "https://wuyo.pl/cennik",
    },
};

// ─── Widełki cenowe (widok publiczny) ──────────────────────────────────────────
// Klient widzi tylko zakresy. Pełny cennik pozycja po pozycji siedzi w CENNIK.md
// w katalogu głównym repo i służy wyłącznie do wyceny konkretnego zlecenia.

const priceRanges = [
    {
        title: "Projekt graficzny",
        note: "Sam projekt. Druk liczony osobno.",
        items: [
            { name: "Logo i identyfikacja wizualna", price: "890 – 1 490 zł" },
            { name: "Materiały do druku (wizytówka, ulotka, plakat, menu)", price: "160 – 480 zł" },
            { name: "Reklama zewnętrzna (baner, roll-up, szyld)", price: "260 – 650 zł" },
            { name: "Opakowania i etykiety", price: "od 180 zł" },
            { name: "Grafiki na social media", price: "90 – 1 350 zł" },
        ],
    },
    {
        title: "Druk i papeteria",
        note: "Sam druk z gotowego pliku. Z projektem: wizytówki od 299 zł, ulotki od 449 zł, naklejki od 219 zł. Zamawiasz 2+ produkty — każdy kolejny -15%.",
        items: [
            { name: "Wizytówki — sam druk (50 – 300 szt.)", price: "99 – 299 zł" },
            { name: "Ulotki A5 — sam druk (50 – 300 szt.)", price: "119 – 359 zł" },
            { name: "Naklejki i etykiety — sam druk (50 – 200 szt.)", price: "89 – 229 zł" },
            { name: "Vouchery, magnesy, koperty", price: "69 – 379 zł" },
            { name: "Plakaty", price: "od 29 zł / szt." },
        ],
    },
    {
        title: "Odzież z nadrukiem",
        note: "DTF, pełny kolor, bez minimum — od jednej sztuki.",
        items: [
            { name: "Koszulki", price: "49 – 79 zł / szt." },
            { name: "Bluzy", price: "139 – 199 zł / szt." },
            { name: "Nadruk na Twojej odzieży", price: "od 45 zł" },
        ],
    },
    {
        title: "Strony internetowe",
        note: "Next.js, SEO lokalne, dopracowana wersja mobilna.",
        items: [
            { name: "Landing Page / one-page", price: "od 2 490 zł" },
            { name: "Strona firmowa do 5 podstron", price: "3 490 zł" },
            { name: "Sklep internetowy", price: "od 6 900 zł" },
            { name: "Stała opieka miesięczna", price: "149 – 1 290 zł / mc" },
        ],
    },
];

// ─── Helper: karta cenowa ──────────────────────────────────────────────────────

function PricingCard({
    title,
    items,
    note,
}: {
    title: string;
    items: { name: string; price: string }[];
    note?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-navy-dark/80 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-br from-gold/10 to-transparent border-b border-white/5">
                <h3 className="font-bold text-white text-base leading-tight">{title}</h3>
            </div>
            <div className="divide-y divide-white/5">
                {items.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/5 transition-colors group"
                    >
                        <span className="text-white/70 text-sm group-hover:text-white transition-colors leading-snug">
                            {item.name}
                        </span>
                        <span className="text-gold font-bold text-sm shrink-0 whitespace-nowrap">
                            {item.price}
                        </span>
                    </div>
                ))}
            </div>
            {note && (
                <p className="px-5 py-3 text-white/40 text-xs border-t border-white/5">{note}</p>
            )}
        </div>
    );
}

// ─── Strona ────────────────────────────────────────────────────────────────────

export default function PricingPage() {
    return (
        <main className="min-h-screen w-full bg-navy-dark pt-36 md:pt-48 pb-20 px-4 md:px-8 relative overflow-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* HEADER */}
                <AnimatedSection animateOnMount>
                    <div className="mb-14">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors mb-6 font-medium text-sm"
                        >
                            <ArrowLeft size={16} /> Wróć na stronę główną
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <p className="eyebrow mb-2">cennik</p>
                                <h1 className="text-3xl md:text-5xl font-bold text-white">
                                    Gramy w <span className="text-gold">otwarte karty</span>.
                                </h1>
                                <p className="text-white/50 mt-3 max-w-xl text-sm md:text-base">
                                    Zero niespodzianek na rachunku. Podane kwoty to ceny netto — do faktury dochodzi 23% VAT, który jako firma odliczasz.
                                </p>
                            </div>
                            <Link
                                href="/#kontakt"
                                className="btn-gold px-8 py-3 rounded-full font-bold text-sm shrink-0 self-start md:self-auto shadow-[0_0_25px_rgba(255,235,82,0.25)]"
                            >
                                Zapytaj o wycenę →
                            </Link>
                        </div>
                    </div>
                </AnimatedSection>

                {/* ── PAKIETY (nowa sekcja cennika) ──────────────────── */}
                <PricingSection className="pb-12" id="pakiety" />

                {/* ── WIDEŁKI CENOWE ─────────────────────────────────── */}
                <AnimatedSection delay={0.05}>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Ile kosztują pojedyncze usługi
                    </h2>
                    <p className="text-white/50 text-sm mb-8 max-w-2xl">
                        Widełki, żebyś wiedział, w jakim rzędzie wielkości się poruszamy. Dokładna
                        kwota zależy od zakresu — napisz, co potrzebujesz, a policzę konkretnie.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {priceRanges.map((group, i) => (
                        <AnimatedSection key={group.title} delay={0.1 + 0.05 * i}>
                            <PricingCard title={group.title} items={group.items} note={group.note} />
                        </AnimatedSection>
                    ))}
                </div>

                {/* Rabat na zamówienia łączone */}
                <AnimatedSection delay={0.3}>
                    <div className="bg-[#ffeb52] text-[#1c1b17] rounded-2xl p-5 flex items-start gap-4 mt-8">
                        <div className="shrink-0 mt-0.5">
                            <Tag size={22} />
                        </div>
                        <div>
                            <p className="font-bold text-base leading-snug">
                                Zamów 2 lub więcej produktów — każdy kolejny -15%.
                            </p>
                            <p className="font-medium text-sm mt-1 opacity-80">
                                Projekty spójne wizualnie, druk w jednej partii, jeden kontakt.
                            </p>
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={0.35}>
                    <p className="text-white/40 text-xs mt-6 max-w-2xl">
                        Kwoty netto — do faktury dochodzi 23% VAT, który jako firma odliczasz.
                        50% zaliczki przed startem, 50% po zakończeniu. Cena ustalona przed startem
                        to cena końcowa. Więcej wariantów odzieży na{" "}
                        <Link href="/odziez" className="text-gold hover:underline">
                            stronie odzieży
                        </Link>
                        .
                    </p>
                </AnimatedSection>

                {/* ── CTA KOŃCOWE ──────────────────────────────────────── */}
                <AnimatedSection delay={0.2}>
                    <div className="mt-14 flex flex-col items-center text-center gap-6">
                        <p className="text-white/60 max-w-2xl text-sm md:text-base">
                            Nie wiesz od czego zacząć? Napisz — dostaniesz konkretny plan i wycenę w 24h.
                        </p>
                        <Link
                            href="/#kontakt"
                            className="btn-gold px-10 py-4 rounded-full font-bold inline-flex items-center gap-2 shadow-[0_0_25px_rgba(255,235,82,0.3)] hover:shadow-[0_0_45px_rgba(255,235,82,0.5)] transition-all hover:scale-105 active:scale-95"
                        >
                            Napisz do mnie
                        </Link>
                    </div>
                </AnimatedSection>

            </div>

            <FAQSection />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </main>
    );
}
