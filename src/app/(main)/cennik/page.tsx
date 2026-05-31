import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PricingSection } from "@/components/pricing/PricingSection";

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cennik usług graficznych, druku i webowych | WUYO – Rzeszów",
    description: "Transparentne ceny: logo od 890 zł, marka od 1 490 zł, wizytówki 99 zł/50 szt., strona od 2 490 zł. Projekt + druk w jednym miejscu. Bez ukrytych kosztów.",
    openGraph: {
        title: "Cennik | WUYO – Dobra Grafa",
        description: "Pełen cennik usług graficznych, druku, web design i social media. Transparentne ceny, zero niespodzianek.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/cennik",
    },
    twitter: {
        card: "summary_large_image",
        title: "Cennik | WUYO – Dobra Grafa",
        description: "Transparentne ceny usług graficznych i webowych. Logo od 890 zł, wizytówki od 99 zł, strona od 2 490 zł.",
        images: ["/og-image.webp"],
    },
    alternates: {
        canonical: "https://wuyo.pl/cennik",
    },
};

// ─── Dane druku ────────────────────────────────────────────────────────────────

const printProducts = [
    {
        name: "Wizytówki",
        note: "dwustronne, 300g błysk",
        variants: [
            { qty: "50 szt.", price: "99 zł" },
            { qty: "100 szt.", price: "159 zł" },
            { qty: "150 szt.", price: "199 zł" },
            { qty: "300 szt.", price: "299 zł" },
        ],
    },
    {
        name: "Ulotki A5",
        note: "dwustronne, pełny kolor",
        variants: [
            { qty: "50 szt.", price: "119 zł" },
            { qty: "100 szt.", price: "189 zł" },
            { qty: "150 szt.", price: "239 zł" },
            { qty: "300 szt.", price: "359 zł" },
        ],
    },
    {
        name: "Vouchery / bony",
        note: "",
        variants: [
            { qty: "50 szt.", price: "109 zł" },
            { qty: "100 szt.", price: "179 zł" },
        ],
    },
    {
        name: "Naklejki i etykiety",
        note: "",
        variants: [
            { qty: "50 szt.", price: "89 zł" },
            { qty: "100 szt.", price: "149 zł" },
            { qty: "200 szt.", price: "229 zł" },
        ],
    },
    {
        name: "Plakaty",
        note: "",
        variants: [
            { qty: "A4", price: "od 29 zł/szt." },
            { qty: "A3", price: "od 39 zł/szt." },
            { qty: "10+ szt.", price: "cena do ustalenia" },
        ],
    },
    {
        name: "Magnesy reklamowe",
        note: "z laminatem, format wizytówki",
        variants: [
            { qty: "50 szt.", price: "229 zł" },
            { qty: "100 szt.", price: "379 zł" },
        ],
    },
    {
        name: "Koperty z nadrukiem",
        note: "",
        variants: [
            { qty: "25 szt.", price: "69 zł" },
            { qty: "50 szt.", price: "119 zł" },
        ],
    },
];

// ─── Lokalny komponent: siatka produktów druku ─────────────────────────────────

function PrintProductGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {printProducts.map((product, i) => (
                <AnimatedSection key={product.name} delay={0.05 * i}>
                    <div className="bg-navy/50 border border-white/10 rounded-2xl p-6 h-full">
                        <h4 className="font-bold text-white text-lg mb-1">{product.name}</h4>
                        {product.note && (
                            <p className="text-white/40 text-xs mb-3">{product.note}</p>
                        )}
                        <ul className="space-y-2 mt-3">
                            {product.variants.map((v) => (
                                <li key={v.qty} className="flex items-center justify-between gap-2">
                                    <span className="text-white/70 text-sm">{v.qty}</span>
                                    <span className="text-gold font-bold text-sm whitespace-nowrap">{v.price}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </AnimatedSection>
            ))}
        </div>
    );
}

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
                                    Zero niespodzianek na rachunku. Podane kwoty to ceny brutto (nie jestem płatnikiem VAT).
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

                {/* ── PEŁNY CENNIK SZCZEGÓŁOWY ───────────────────────── */}
                <AnimatedSection delay={0.05}>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Pełny cennik szczegółowy</h2>
                    <p className="text-white/50 text-sm mb-8">
                        Pojedyncze usługi i produkty — jeśli potrzebujesz tylko części.
                    </p>
                </AnimatedSection>

                {/* ── PROJEKTY GRAFICZNE ─────────────────────────────── */}
                <AnimatedSection delay={0.05}>
                    <h2 className="text-2xl font-bold text-white mb-5">Projekty graficzne</h2>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <AnimatedSection delay={0.1}>
                        <PricingCard
                            title="Logo"
                            items={[
                                { name: "Logo (3 wersje: pozioma, pionowa, mono)", price: "od 890 zł" },
                                { name: "Logo + mini księga znaku (paleta, typografia, zasady)", price: "1 490 zł" },
                            ]}
                        />
                    </AnimatedSection>
                    <AnimatedSection delay={0.15}>
                        <PricingCard
                            title="Identyfikacja wizualna"
                            items={[
                                { name: "Brand Basic (logo + wizytówka)", price: "od 1 490 zł" },
                                { name: "Brand Full (logo + księga + wizytówka + ulotka + szablon social)", price: "od 2 200 zł" },
                            ]}
                        />
                    </AnimatedSection>
                </div>

                {/* ── SOCIAL MEDIA ────────────────────────────────────── */}
                <AnimatedSection delay={0.2}>
                    <h2 className="text-2xl font-bold text-white mb-5 mt-10">Social media</h2>
                </AnimatedSection>

                <AnimatedSection delay={0.25}>
                    <PricingCard
                        title="Grafiki i szablony social media"
                        items={[
                            { name: "Pojedyncza grafika", price: "80 zł" },
                            { name: "Karuzela (do 6 slajdów)", price: "od 120 zł" },
                            { name: "Miniaturka YouTube", price: "60 zł" },
                            { name: "Zestaw startowy (post + karuzela + story + okładka + highlight)", price: "od 350 zł" },
                            { name: "Pakiet miesięczny (12 grafik)", price: "od 799 zł/msc" },
                        ]}
                    />
                </AnimatedSection>

                {/* ── MATERIAŁY DRUKOWANE (sam projekt) ────────────────── */}
                <AnimatedSection delay={0.3}>
                    <h2 className="text-2xl font-bold text-white mb-5 mt-10">Materiały drukowane — sam projekt</h2>
                </AnimatedSection>

                <AnimatedSection delay={0.35}>
                    <PricingCard
                        title="Projekt do druku (bez kosztów druku)"
                        items={[
                            { name: "Wizytówka (dwustronna)", price: "180 zł" },
                            { name: "Ulotka A5/A6 (dwustronna)", price: "180 zł" },
                            { name: "Plakat A3/A4", price: "210 zł" },
                            { name: "Voucher / bon podarunkowy", price: "220 zł" },
                            { name: "Naklejki / etykiety", price: "od 160 zł" },
                            { name: "Baner reklamowy (roll-up, citylight, outdoor)", price: "od 329 zł" },
                            { name: "Katalog / menu (do 8 stron)", price: "od 480 zł" },
                            { name: "Certyfikat / dyplom", price: "210 zł" },
                        ]}
                    />
                </AnimatedSection>

                {/* ── OPAKOWANIA I ETYKIETY ─────────────────────────────── */}
                <AnimatedSection delay={0.4}>
                    <h2 className="text-2xl font-bold text-white mb-5 mt-10">Opakowania i etykiety</h2>
                </AnimatedSection>

                <AnimatedSection delay={0.45}>
                    <PricingCard
                        title="Projekt opakowania lub etykiety"
                        items={[
                            { name: "Etykieta produktowa (do 2 stron)", price: "od 180 zł" },
                            { name: "Opakowanie (pudełko, torebka, sleeve)", price: "od 400 zł" },
                        ]}
                    />
                </AnimatedSection>

                {/* ── DRUK & PAPETERIA ──────────────────────────────────── */}
                <AnimatedSection delay={0.5}>
                    <div className="mt-14 mb-5">
                        <h2 className="text-2xl font-bold text-white mb-2">Druk &amp; Papeteria</h2>
                        <p className="text-white/50 text-sm">
                            Ceny zawierają projekt + druk. Przy zamówieniu 2 lub więcej produktów — każdy kolejny -15%.
                        </p>
                    </div>
                </AnimatedSection>

                {/* Baner rabatowy */}
                <AnimatedSection delay={0.55}>
                    <div className="bg-[#ffeb52] text-[#1c1b17] rounded-2xl p-5 flex items-start gap-4 mb-8">
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

                <PrintProductGrid />

                {/* ── STRONY WWW ───────────────────────────────────────── */}
                <AnimatedSection delay={0.1}>
                    <h2 className="text-2xl font-bold text-white mb-5 mt-14">Strony WWW</h2>
                </AnimatedSection>

                <AnimatedSection delay={0.15}>
                    <PricingCard
                        title="Projektowanie i wdrażanie stron internetowych"
                        items={[
                            { name: "Landing Page (React/Next.js, SEO, Core Web Vitals, responsywna)", price: "od 2 490 zł" },
                            { name: "Sklep internetowy", price: "od 6 900 zł" },
                            { name: "Strony rozbudowane", price: "wycena indywidualna" },
                        ]}
                        note="50% zaliczki przed startem. 50% po zakończeniu. Gram w otwarte karty — cena ustalona przed startem to cena końcowa."
                    />
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
        </main>
    );
}
