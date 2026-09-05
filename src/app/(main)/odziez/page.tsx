import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { AnimatedSection } from "@/components/AnimatedSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Nadruki na Odzieży – koszulki, bluzy, personalizacja | od 49 zł | WUYO",
    description: "Nadruk DTF na koszulkach i bluzach, personalizacja imienna, haft. Bez minimum ilościowego — od 1 sztuki. Rzeszów + wysyłka kurierem →",
    openGraph: {
        title: "Nadruki na Odzieży – koszulki, bluzy, personalizacja | WUYO",
        description: "Nadruk DTF na koszulkach i bluzach, personalizacja imienna, haft. Bez minimum ilościowego. Rzeszów i cała Polska.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/odziez",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Nadruki na Odzieży – koszulki, bluzy, personalizacja | WUYO",
        description: "Nadruk DTF od 49 zł/szt. Bez minimum ilościowego. Projekt + nadruk w jednym miejscu.",
        images: ["/og-image.webp"],
    },
    alternates: {
        canonical: "https://wuyo.pl/odziez",
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Jaka jest minimalna ilość zamówienia?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Koszulki i bluzy z nadrukiem DTF robię od 1 sztuki — bez minimum. Przy haftowaniu minimum to 5 sztuk, bo to inna technologia.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy mogę przynieść własną koszulkę do nadruku?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak. Przynosisz swoją odzież — koszulkę, bluzę, torbę — a ja wprasowuję nadruk w Twoim wzorze. Cena zależy od wielkości nadruku, nie od ubrania.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile czasu zajmuje realizacja?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Nadruk DTF i flex/flock: 1–4 dni robocze, zależnie od ilości i tego czy potrzebujesz projektu od zera. Haft ustalam indywidualnie, bo termin zależy od nakładu.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy zajmujesz się też projektem graficznym nadruku?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak — projekt i nadruk w jednym miejscu. Jeśli masz gotowy plik, wykorzystam go od razu. Jeśli nie, zaprojektuję grafikę pod Twój pomysł.",
            },
        },
        {
            "@type": "Question",
            "name": "Co lepiej sprawdzi się na drużynowych koszulkach — nadruk czy haft?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Do numerów, imion i prostych logo na koszulkach sportowych lepszy jest nadruk DTF lub flex — jest tańszy i szybszy. Haft sprawdza się na czapkach, polówkach i odzieży roboczej, którą pierze się częściej.",
            },
        },
    ],
};

const clothingSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Nadruki na odzieży i personalizacja",
    "description": "Nadruk DTF na koszulkach i bluzach, personalizacja imienna, napisy flex/flock, haft. Projekt i nadruk w jednym miejscu.",
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
        { "@type": "Offer", "name": "Koszulka z nadrukiem DTF", "price": "49", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Bluza z nadrukiem DTF", "price": "139", "priceCurrency": "PLN" },
        { "@type": "Offer", "name": "Nadruk na własnej odzieży klienta", "price": "45", "priceCurrency": "PLN" },
    ],
};

const products = [
    {
        name: "Koszulki z nadrukiem",
        desc: "Twoje logo, hasło albo grafika na koszulce. Nadruk DTF — pełny kolor, trwały, nie pęka i nie blaknie przy praniu.",
        price: "od 49 zł/szt",
        details: ["Nadruk DTF, pełny kolor", "100% bawełna, 205g, unisex", "Bez minimum ilościowego — od 1 szt.", "Twój wzór albo projekt od zera", "Termin 2–4 dni"],
    },
    {
        name: "Bluzy z nadrukiem",
        desc: "Bluza z kapturem albo bez, logo na piersi lub duży wzór na plecach. Sprawdza się na eventy firmowe i prezenty.",
        price: "od 139 zł/szt",
        details: ["Nadruk DTF, pełny kolor", "Bluza 280g, kaptur lub bez", "Bez minimum ilościowego — od 1 szt.", "Twój wzór albo projekt od zera", "Termin 2–4 dni"],
    },
    {
        name: "Nadruk na Twojej odzieży",
        desc: "Masz już koszulki, bluzy albo torby firmowe? Przynosisz swoje, ja wprasowuję nadruk w Twoim wzorze.",
        price: "od 45 zł/szt",
        details: ["Wprasowanie DTF na powierzonej odzieży", "Mały wzór (do A5) lub duży (cały przód)", "Bez minimum ilościowego", "Termin 1–2 dni"],
    },
    {
        name: "Personalizacja imienna",
        desc: "Numer, imię albo nazwisko na koszulce. Idealne na eventy, drużyny, wyjazdy integracyjne i prezenty na jedną osobę.",
        price: "od 15 zł/szt do wzoru",
        details: ["Dopłata do dowolnego nadruku z oferty", "Imię, numer, inicjały", "Krój czcionki dopasowany do reszty wzoru", "Realizacja pojedynczych sztuk"],
    },
    {
        name: "Napisy i numery (flex/flock)",
        desc: "Jednokolorowy napis albo numer wycinany z folii. Dobre rozwiązanie do prostych logotypów i numeracji drużynowej.",
        price: "od 35 zł/szt",
        details: ["Folia flex (gładka) lub flock (aksamitna)", "Jeden kolor, prosty kształt", "Świetne do krótkich napisów i numerów", "Termin 1–2 dni"],
    },
    {
        name: "Haft",
        desc: "Czapki, polówki, odzież robocza. Haft trzyma się latami i wygląda solidniej niż nadruk — kosztem dłuższego terminu.",
        price: "od 45 zł/szt",
        details: ["Czapki, polo, kurtki, odzież robocza", "Trwałość wyższa niż przy nadruku", "Minimum 5 szt.", "Termin ustalany indywidualnie"],
    },
];

export default function OdziezPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(clothingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* ═══ HERO ═══ */}
            <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />

                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <p className="eyebrow mb-4">Nadruk + personalizacja</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Koszulki, bluzy<br />
                        <span className="bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent">
                            i nadruki, które zostają.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Nadruk DTF, personalizacja imienna, haft. Bez minimum ilościowego — jedna koszulka albo cały zespół, jeden kontakt od projektu do gotowej rzeczy.
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
                        <p className="eyebrow mb-4">Co robimy</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                            Od jednej koszulki,<br />po cały zespół
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
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Potrzebujesz logo pod nadruk?</p>
                                <Link href="/logo" className="font-bold text-white hover:text-gold transition-colors text-sm">Logo dla firmy →</Link>
                                <p className="text-white/40 text-xs mt-1">od 890 zł · 10–14 dni</p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Potrzebujesz też wizytówek?</p>
                                <Link href="/druk" className="font-bold text-white hover:text-gold transition-colors text-sm">Druk i papeteria →</Link>
                                <p className="text-white/40 text-xs mt-1">wizytówki od 99 zł</p>
                            </div>
                            <div>
                                <p className="text-white/35 text-xs uppercase tracking-widest mb-2">Jesteś z Rzeszowa?</p>
                                <Link href="/druk-rzeszow" className="font-bold text-white hover:text-gold transition-colors text-sm">Odbiór osobisty →</Link>
                                <p className="text-white/40 text-xs mt-1">bez kosztów wysyłki</p>
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
                            Od pomysłu do gotowej rzeczy
                        </h2>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        <div className="hidden md:block absolute top-7 left-[calc(16.5%+1rem)] right-[calc(16.5%+1rem)] h-px bg-gradient-to-r from-gold/30 via-white/10 to-gold/30" />
                        {[
                            { num: "1", title: "Mówisz co potrzebujesz", desc: "Wzór, ilość, rozmiary — swój lub mój projekt. Zajmuje to kilka minut." },
                            { num: "2", title: "Akceptujesz wzór", desc: "Dostajesz podgląd nadruku na ubraniu, zanim cokolwiek wyląduje pod prasą." },
                            { num: "3", title: "Odbierasz gotowe", desc: "Odbiór w Rzeszowie albo wysyłka kurierem — bez zbędnego czekania." },
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
