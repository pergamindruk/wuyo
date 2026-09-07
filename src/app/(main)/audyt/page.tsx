import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search, Clock, MessageSquare } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AuditSection } from "@/components/AuditSection";

export const metadata: Metadata = {
    title: "Audyt strony i grafiki – bezpłatna analiza | WUYO – Rzeszów",
    description:
        "Wklej link do swojej strony, a powiem Ci wprost, co odstrasza klientów i co zmienić. Bezpłatnie, bez owijania w bawełnę, odpowiedź w 24–48 h.",
    openGraph: {
        title: "Audyt Bez Znieczulenia | WUYO – Dobra Grafa",
        description: "Bezpłatna, szczera analiza strony i materiałów graficznych. Odpowiedź w 24–48 h.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/audyt",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Audyt Bez Znieczulenia | WUYO",
        description: "Bezpłatna, szczera analiza strony i materiałów graficznych.",
        images: ["/og-image.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/audyt" },
};

const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Audyt Konwersji Bez Znieczulenia",
    description:
        "Bezpłatna analiza strony internetowej i materiałów graficznych pod kątem tego, co zniechęca klientów i co poprawić.",
    provider: {
        "@type": "LocalBusiness",
        name: "WUYO – Dobra Grafa",
        url: "https://wuyo.pl",
        telephone: "+48725182053",
        address: {
            "@type": "PostalAddress",
            addressLocality: "Rzeszów",
            addressCountry: "PL",
        },
    },
    areaServed: [
        { "@type": "City", name: "Rzeszów" },
        { "@type": "Country", name: "Polska" },
    ],
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "PLN",
        description: "Audyt bezpłatny, bez zobowiązań.",
    },
};

const kroki = [
    {
        icon: <Search size={22} aria-hidden="true" />,
        title: "Wklejasz link",
        desc: "Adres strony albo profilu w mediach społecznościowych. Nic więcej nie potrzebuję na start.",
    },
    {
        icon: <MessageSquare size={22} aria-hidden="true" />,
        title: "Przeglądam to na spokojnie",
        desc: "Patrzę na pierwsze wrażenie, czytelność oferty, ceny, kontakt i szybkość działania.",
    },
    {
        icon: <Clock size={22} aria-hidden="true" />,
        title: "Dostajesz konkret w 24–48 h",
        desc: "Lista tego, co odstrasza klientów, i co zmienić w pierwszej kolejności. Bez oferty na siłę.",
    },
];

export default function AudytPage() {
    return (
        <div className="flex-1 w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />

            <section className="relative min-h-[40vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-12 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm mb-8"
                    >
                        <ArrowLeft size={14} aria-hidden="true" /> Strona główna
                    </Link>
                    <p className="eyebrow mb-4">Bezpłatnie, bez zobowiązań</p>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Powiem Ci wprost,<br />co odstrasza Twoich klientów
                    </h1>
                    <p className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
                        Wklej link do swojej strony. Przejrzę ją i napiszę, co poprawić w pierwszej
                        kolejności, żeby zaczęła przynosić zapytania. Bez owijania w bawełnę i bez
                        wciskania Ci oferty.
                    </p>
                </AnimatedSection>
            </section>

            <section className="px-6 md:px-12 pb-8">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {kroki.map((krok, i) => (
                        <AnimatedSection key={krok.title} delay={i * 0.1}>
                            <div className="glass-card p-7 h-full flex flex-col gap-3">
                                <span className="text-gold">{krok.icon}</span>
                                <h2 className="text-white font-bold text-lg">{krok.title}</h2>
                                <p className="text-white/60 text-sm leading-relaxed">{krok.desc}</p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </section>

            <AuditSection />

            <section className="px-6 md:px-12 py-20">
                <AnimatedSection className="max-w-2xl mx-auto text-center flex flex-col items-center gap-5">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Wolisz od razu porozmawiać o konkretnym projekcie?
                    </h2>
                    <p className="text-white/60">
                        Audyt jest dla tych, którzy chcą najpierw wiedzieć, co jest nie tak. Jeśli już
                        wiesz, czego potrzebujesz — napisz od razu, wycenię w 24 godziny.
                    </p>
                    <Link
                        href="/#kontakt"
                        className="btn-gold px-10 py-4 rounded-full font-bold inline-flex items-center gap-2"
                    >
                        Napisz do mnie
                    </Link>
                </AnimatedSection>
            </section>
        </div>
    );
}
