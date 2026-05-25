import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Phone, Mail, Star } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Grafik Rzeszów – logo, strony www, druk | WUYO Mateusz Machoś",
    description: "Szukasz grafika w Rzeszowie? Projektuję logo, identyfikację wizualną, strony internetowe i materiały drukowane dla firm z Rzeszowa i całego Podkarpacia. Wycena w 24h.",
    keywords: [
        "grafik Rzeszów",
        "projektant graficzny Rzeszów",
        "studio graficzne Rzeszów",
        "logo Rzeszów",
        "strony internetowe Rzeszów",
        "identyfikacja wizualna Rzeszów",
        "grafika reklamowa Rzeszów",
        "druk wizytówek Rzeszów",
        "web design Rzeszów",
        "grafik komputerowy Rzeszów",
    ],
    openGraph: {
        title: "Grafik Rzeszów – WUYO | Logo, strony www, druk",
        description: "Projektant graficzny z Rzeszowa. Logo od 800 zł, strony www od 1 200 zł, druk wizytówek. Wycena bezpłatna, odpowiedź w 24h.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/grafik-rzeszow",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Grafik Rzeszów – WUYO | Logo, strony www, druk",
        description: "Projektant graficzny z Rzeszowa. Logo, strony, druk dla firm. Wycena w 24h.",
        images: ["/og-image.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/grafik-rzeszow" },
};

const localSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": "https://wuyo.pl/grafik-rzeszow#business",
    "name": "WUYO – Grafik Rzeszów",
    "description": "Projektant graficzny i web developer z Rzeszowa. Logo, identyfikacja wizualna, strony internetowe na Next.js, druk wizytówek i ulotek dla firm z Rzeszowa i całego Podkarpacia.",
    "url": "https://wuyo.pl",
    "telephone": "+48725182053",
    "email": "kontakt@wuyo.pl",
    "priceRange": "800–5000 PLN",
    "openingHours": "Mo-Fr 08:00-18:00",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "ul. Siemieńskiego 17A/38",
        "addressLocality": "Rzeszów",
        "postalCode": "35-203",
        "addressRegion": "Podkarpacie",
        "addressCountry": "PL",
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 50.0412,
        "longitude": 21.9991,
    },
    "areaServed": [
        { "@type": "City", "name": "Rzeszów" },
        { "@type": "AdministrativeArea", "name": "Podkarpacie" },
        { "@type": "Country", "name": "Polska" },
    ],
    "serviceType": [
        "Projektowanie logo",
        "Identyfikacja wizualna",
        "Tworzenie stron internetowych",
        "Druk wizytówek",
        "Grafika reklamowa",
        "Social media design",
    ],
    "founder": {
        "@type": "Person",
        "name": "Mateusz Machoś",
        "jobTitle": "Projektant graficzny i web developer",
        "url": "https://wuyo.pl/o-mnie",
    },
    "sameAs": [
        "https://www.facebook.com/wuyo.dobra.grafa",
        "https://www.instagram.com/wuyo.pl/",
        "https://www.youtube.com/@wuyo.dobra.grafa",
        "https://share.google/2xca9wmLz1mI5NvIX",
    ],
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile kosztuje grafik w Rzeszowie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Logo dla firmy to koszt od 800 zł, pełna identyfikacja wizualna od 2 500 zł, strona internetowa od 1 200 zł, a wizytówki od 99 zł za 50 sztuk z projektem. Każda wycena jest stała — podaję cenę przed startem prac, bez niespodzianek na końcu.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy grafik z Rzeszowa obsługuje firmy spoza miasta?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak. Większość projektów realizuję zdalnie — przez Messenger, WhatsApp lub e-mail. Obsługuję firmy z całej Polski. Rzeszów i Podkarpacie to moja baza, ale zasięg jest ogólnopolski.",
            },
        },
        {
            "@type": "Question",
            "name": "Jak długo trwa projekt logo w Rzeszowie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Standardowy czas realizacji logo to 10–14 dni roboczych od zatwierdzenia briefu. Strona One-Page zazwyczaj tydzień. Przy pilnych zleceniach możliwy ekspresowy termin — zapytaj.",
            },
        },
        {
            "@type": "Question",
            "name": "Co wyróżnia WUYO spośród grafików w Rzeszowie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Działam sam — nie ma pośredników ani asystentów. Masz bezpośredni kontakt ze mną przez cały projekt. Łączę grafikę z programowaniem i druk mam na miejscu (własny sprzęt poligraficzny), więc od logo po stronę i wydruk to jedno miejsce.",
            },
        },
    ],
};

const services = [
    {
        title: "Logo i identyfikacja wizualna",
        price: "od 800 zł",
        desc: "Logotyp, sygnet, paleta kolorów, typografia i pełen pakiet plików. Opcjonalnie: księga znaku, wizytówki, szablony social media.",
        href: "/logo",
        items: ["Logotyp + sygnet", "Pliki SVG, PNG, PDF", "Paleta kolorów CMYK/HEX", "Prawa autorskie w cenie"],
    },
    {
        title: "Strony internetowe",
        price: "od 1 200 zł",
        desc: "Strony na Next.js — szybkie, responsywne, zoptymalizowane pod SEO od pierwszego dnia. Bez WordPressa, bez pluginów.",
        href: "/strony-www",
        items: ["Next.js + React", "Techniczne SEO on-page", "Mobile first", "Deploy na Vercel (0 zł/mies.)"],
    },
    {
        title: "Druk i papeteria",
        price: "od 99 zł",
        desc: "Projekt i druk w jednym miejscu. Własny sprzęt poligraficzny — wizytówki, ulotki, vouchery, naklejki bez minimum nakładu.",
        href: "/druk",
        items: ["Wizytówki, ulotki, vouchery", "Druk własny — szybciej i taniej", "Laminowanie mat/błysk", "Naklejki w dowolnym kształcie"],
    },
    {
        title: "Grafika reklamowa",
        price: "wycena ind.",
        desc: "Bannery, posty social media, materiały POS, opakowania, etykiety — wszystko czego marka potrzebuje żeby wyglądać spójnie.",
        href: null,
        items: ["Social media (posty, stories)", "Bannery i roll-upy", "Opakowania i etykiety", "Prezentacje i infografiki"],
    },
];

const reasons = [
    { n: "01", title: "Jeden człowiek, pełna odpowiedzialność", desc: "Rozmawiasz ze mną, ja projektuję, ja dostarczam. Zero ping-ponga między działami, zero nieporozumień w przekazie." },
    { n: "02", title: "Grafika + web + druk w jednym miejscu", desc: "Logo, strona i wizytówki — trzy rzeczy które każda firma potrzebuje, w jednym miejscu. Nie musisz szukać trzech różnych wykonawców." },
    { n: "03", title: "Cena ustalona przed startem", desc: "Zawsze dostajesz stałą wycenę zanim zacznę pracę. Żadnych stawek godzinowych, żadnych niespodzianek na fakturze." },
    { n: "04", title: "Druk na miejscu w Rzeszowie", desc: "Własny Epson A3+, laminator i ploter tnący. Wizytówki i naklejki możesz mieć nawet następnego dnia — bez czekania na drukarnię." },
];

export default function GrafikRzeszowPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* ── HERO ── */}
            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <div className="inline-flex items-center gap-2 text-gold/80 text-sm font-medium mb-5 border border-gold/20 bg-gold/5 px-4 py-1.5 rounded-full">
                        <MapPin size={13} />
                        Rzeszów, Podkarpacie
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Grafik w&nbsp;Rzeszowie<br className="hidden md:block" />
                        <span className="text-gold">który dowozi</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-4 leading-relaxed">
                        Logo, strona internetowa i druk dla Twojej firmy — w jednym miejscu, od jednej osoby, za ustaloną z góry cenę.
                    </p>
                    <p className="text-sm text-white/35 mb-10">
                        Mateusz Machoś · WUYO Studio · Rzeszów, ul. Siemieńskiego 17A/38
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block shadow-[0_0_20px_rgba(255,235,82,0.3)]">
                            Napisz — wycena w 24h
                        </a>
                        <Link href="/realizacje" className="px-8 py-3.5 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">
                            Zobacz realizacje
                        </Link>
                    </div>
                </AnimatedSection>
            </section>

            {/* ── STATS ── */}
            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { stat: "5+", label: "lat w branży" },
                            { stat: "150+", label: "projektów w Rzeszowie i Polsce" },
                            { stat: "24h", label: "czas odpowiedzi" },
                            { stat: "1 os.", label: "rozmawiasz ze mną, nie z asystentem" },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* ── USŁUGI ── */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Co robię</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Usługi graficzne w Rzeszowie</h2>
                        <p className="text-white/50 max-w-xl mx-auto mt-4">Nie trzeba szukać kilku wykonawców — logo, strona i druk to jeden projekt, jedna osoba, jeden kontakt.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((s, i) => (
                            <AnimatedSection key={i} delay={i * 0.08}>
                                <div className="glass-card p-7 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-bold text-white text-lg">{s.title}</h3>
                                        <span className="text-gold font-bold text-sm shrink-0 ml-4">{s.price}</span>
                                    </div>
                                    <p className="text-white/55 text-sm leading-relaxed mb-5">{s.desc}</p>
                                    <ul className="space-y-2 flex-1">
                                        {s.items.map((item, ii) => (
                                            <li key={ii} className="flex items-center gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    {s.href && (
                                        <Link href={s.href} className="mt-5 inline-flex items-center gap-1.5 text-gold text-xs font-bold hover:gap-2.5 transition-all">
                                            Więcej o usłudze <ArrowRight size={12} />
                                        </Link>
                                    )}
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DLACZEGO JA ── */}
            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Dlaczego WUYO</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            Co odróżnia mnie od innych<br className="hidden md:block" /> grafików w Rzeszowie
                        </h2>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-4">
                        {reasons.map((r, i) => (
                            <AnimatedSection key={i} delay={i * 0.07}>
                                <div className="glass-card p-6 flex gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                                        {r.n}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-2 text-sm">{r.title}</h3>
                                        <p className="text-white/55 text-xs leading-relaxed">{r.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── OPINIE ── */}
            <TestimonialsSection />

            {/* ── FAQ ── */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">FAQ</p>
                        <h2 className="text-3xl font-bold text-white">Pytania o grafika w Rzeszowie</h2>
                    </AnimatedSection>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Ile kosztuje grafik w Rzeszowie?",
                                a: "Logo od 800 zł, pełna identyfikacja od 2 500 zł, strona od 1 200 zł, wizytówki od 99 zł za 50 szt. z projektem. Każda wycena jest stała — znasz cenę przed startem, nie po.",
                            },
                            {
                                q: "Czy obsługujesz firmy spoza Rzeszowa?",
                                a: "Tak, zdecydowana większość projektów idzie zdalnie. Obsługuję firmy z całej Polski — przez Messenger, WhatsApp lub e-mail. Rzeszów to moja baza, zasięg ogólnopolski.",
                            },
                            {
                                q: "Jak długo czeka się na projekt?",
                                a: "Logo: 10–14 dni roboczych. Strona One-Page: tydzień. Wizytówki z drukiem: 1–3 dni robocze. Przy pilnych zleceniach pytaj o termin ekspresowy.",
                            },
                            {
                                q: "Czy dostaję pliki źródłowe do logo?",
                                a: "Tak. Pełen pakiet: SVG (wektor), PNG z przezroczystym tłem, PDF gotowy do drukarni. Pliki Figma/AI na życzenie. Prawa autorskie majątkowe w cenie.",
                            },
                        ].map((item, i) => (
                            <AnimatedSection key={i} delay={i * 0.06}>
                                <div className="glass-card p-6">
                                    <div className="flex items-start gap-3">
                                        <Star size={14} className="text-gold shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-white mb-2 text-sm">{item.q}</h3>
                                            <p className="text-white/55 text-sm leading-relaxed">{item.a}</p>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── KONTAKT / LOKALIZACJA ── */}
            <section className="py-16 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <p className="eyebrow mb-4">Kontakt</p>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                    Grafik z Rzeszowa<br />do Twojej dyspozycji
                                </h2>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-white/70 text-sm">
                                        <MapPin size={15} className="text-gold shrink-0" />
                                        Rzeszów, ul. Siemieńskiego 17A/38
                                    </li>
                                    <li className="flex items-center gap-3 text-white/70 text-sm">
                                        <Phone size={15} className="text-gold shrink-0" />
                                        <a href="tel:+48725182053" className="hover:text-white transition-colors">+48 725 182 053</a>
                                    </li>
                                    <li className="flex items-center gap-3 text-white/70 text-sm">
                                        <Mail size={15} className="text-gold shrink-0" />
                                        <a href="mailto:kontakt@wuyo.pl" className="hover:text-white transition-colors">kontakt@wuyo.pl</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex flex-col gap-3">
                                <a href="/#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold text-center shadow-[0_0_20px_rgba(255,235,82,0.3)]">
                                    Napisz — odpiszę w 24h
                                </a>
                                <a href="https://wa.me/48725182053" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full font-bold text-center border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors text-sm">
                                    WhatsApp
                                </a>
                                <Link href="/cennik" className="px-8 py-3.5 rounded-full font-bold text-center border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors text-sm">
                                    Zobacz cennik →
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* ── BRIEF / KONTAKT ── */}
            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </main>
    );
}
