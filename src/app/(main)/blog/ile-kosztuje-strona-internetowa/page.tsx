import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "Ile kosztuje strona internetowa dla firmy w 2026? | WUYO",
    description: "Strona firmowa od 1 200 zł do 25 000 zł — skąd taka rozpiętość? Tłumaczę co wpływa na cenę, czego nie przepłacać i ile naprawdę kosztuje dobra strona www dla małej firmy.",
    openGraph: {
        title: "Ile kosztuje strona internetowa dla firmy w 2026?",
        description: "Uczciwy cennik stron WWW — one-page, multi-page, sklep. Co wpływa na cenę i kiedy WordPress to błąd.",
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/blog/ile-kosztuje-strona-internetowa",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Ile kosztuje strona internetowa dla firmy w 2026?",
        description: "Od 1 200 zł do 25 000 zł — tłumaczę skąd różnice i ile warto zapłacić.",
        images: ["/logo_wuya2.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/blog/ile-kosztuje-strona-internetowa" },
};

const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Ile kosztuje strona internetowa dla firmy w 2026?",
    "description": "Uczciwy cennik stron www — one-page, multi-page, sklep. Co wpływa na cenę i kiedy WordPress to błąd.",
    "datePublished": "2026-03-27",
    "dateModified": "2026-03-27",
    "author": {
        "@type": "Person",
        "name": "Mateusz Machoś",
        "url": "https://wuyo.pl",
    },
    "publisher": {
        "@type": "Organization",
        "name": "WUYO – Dobra Grafa",
        "url": "https://wuyo.pl",
        "logo": { "@type": "ImageObject", "url": "https://wuyo.pl/logo_wuya2.webp" },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://wuyo.pl/blog/ile-kosztuje-strona-internetowa" },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile kosztuje strona internetowa dla małej firmy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Strona one-page dla małej firmy kosztuje od 1 200 zł, strona multi-page od 2 900 zł. Za tę kwotę u doświadczonego freelancera dostaniesz stronę na Next.js lub podobnym frameworku, z technicznym SEO, szybkim ładowaniem i responsywnym designem.",
            },
        },
        {
            "@type": "Question",
            "name": "Strona one-page czy multi-page — co wybrać?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "One-page sprawdza się dla freelancerów, usług lokalnych i firm z jedną ofertą. Multi-page jest lepsza gdy masz wiele usług, chcesz rankować na wiele fraz SEO lub potrzebujesz bloga. Jeśli Twoja oferta mieści się na jednej stronie — zacznij od one-page.",
            },
        },
        {
            "@type": "Question",
            "name": "WordPress czy Next.js — co lepsze dla firmy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "WordPress jest dobry gdy potrzebujesz CMS do samodzielnej edycji treści. Next.js (React) daje szybszą stronę, lepsze bezpieczeństwo i niższe koszty utrzymania. Dla strony wizytówki lub portfolio — Next.js wygrywa. Dla rozbudowanego bloga z wieloma autorami — WordPress ma sens.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile kosztuje utrzymanie strony internetowej miesięcznie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Strona na Next.js hostowana na Vercel kosztuje 0 zł miesięcznie dla małego ruchu (darmowy plan). Domena to ok. 50–80 zł rocznie. WordPress wymaga hostingu (30–80 zł/mies.) i regularnych aktualizacji wtyczek, co generuje koszty lub ryzyko bezpieczeństwa.",
            },
        },
        {
            "@type": "Question",
            "name": "Jak długo trwa zbudowanie strony www?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Strona one-page — ok. tygodnia od zebrania materiałów. Strona multi-page — 2–4 tygodnie. Czas zależy głównie od tego jak szybko dostarczasz treści, zdjęcia i feedback na projekty.",
            },
        },
    ],
};

const tiers = [
    {
        range: "300–1 199 zł",
        source: "Kreatory (Wix, Squarespace), szablony WordPress",
        icon: "warning",
        pros: ["Szybko online", "Samodzielna edycja"],
        cons: ["Wolne ładowanie (wpływa na SEO)", "Brak unikalności — wyglądasz jak tysiące innych", "Ograniczone możliwości techniczne", "Miesięczne opłaty za abonament platformy", "Trudno przenieść na inny hosting"],
    },
    {
        range: "1 200–3 000 zł",
        source: "Freelancer — strona one-page / wizytówka",
        icon: "good",
        pros: ["Unikalny design", "Szybkie ładowanie", "Techniczne SEO", "Brak miesięcznych opłat za platformę", "Pełna własność kodu"],
        cons: ["Mniejszy zakres niż multi-page", "Jedna osoba = jeden styl"],
    },
    {
        range: "2 900–6 000 zł",
        source: "Freelancer — strona firmowa multi-page",
        icon: "good",
        pros: ["Wiele podstron = więcej fraz SEO", "Blog, portfolio, dedykowane LP", "Skalowalna architektura", "Kompletna identyfikacja online"],
        cons: ["Dłuższy czas realizacji", "Wymaga więcej treści od klienta"],
    },
    {
        range: "5 000–15 000 zł",
        source: "Małe agencje",
        icon: "neutral",
        pros: ["Zespół specjalistów", "Szerszy zakres usług (copywriting, foto)", "Formalne umowy i SLA"],
        cons: ["Część budżetu na koszty agencji", "Możliwe przerzucanie między grafikami", "Mniej bezpośredni kontakt"],
    },
    {
        range: "15 000–80 000+ zł",
        source: "Duże agencje / portale / e-commerce",
        icon: "premium",
        pros: ["Zaawansowane systemy", "Integracje z ERP/CRM", "Dedykowane rozwiązania"],
        cons: ["Dla większości MŚP — zbędny overkill", "Długi czas realizacji (miesiące)"],
    },
];

export default function IleKosztujeStronaPage() {
    return (
        <main className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* ═══ HEADER ═══ */}
            <section className="relative px-6 pt-40 pb-12 md:pt-52 overflow-hidden">
                <div className="max-w-3xl mx-auto relative z-10">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm mb-8">
                        <ArrowLeft size={16} /> Wróć do bloga
                    </Link>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="eyebrow text-xs">Strony WWW</span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-xs">27 marca 2026</span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-xs">8 min czytania</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ile kosztuje strona internetowa<br />
                        <span className="bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent">
                            dla firmy w 2026?
                        </span>
                    </h1>
                    <p className="text-lg text-white/70 leading-relaxed">
                        Od 300 zł na Wixie po 80 000 zł w dużej agencji — rozpiętość jest ogromna i myląca.
                        Tłumaczę co stoi za tymi liczbami, za co naprawdę płacisz i ile warto wydać na stronę dla małej lub średniej firmy.
                    </p>
                </div>
            </section>

            {/* ═══ TREŚĆ ═══ */}
            <article className="px-6 pb-24">
                <div className="max-w-3xl mx-auto">

                    <AnimatedSection>
                        <div className="glass-card p-8 mb-10 border-l-4 border-gold">
                            <p className="text-white/80 leading-relaxed text-base">
                                <strong className="text-white">Krótka odpowiedź:</strong> Strona one-page dla firmy u doświadczonego freelancera kosztuje <strong className="text-gold">1 200–2 500 zł</strong>. Strona multi-page — <strong className="text-gold">2 900–5 000 zł</strong>. Poniżej tych kwot albo bierzesz szablon, albo ryzykujesz złą jakość. Powyżej 6 000 zł u freelancera — prawdopodobnie przepłacasz.
                            </p>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-10 mb-5">Dlaczego strona za 300 zł i za 30 000 zł to zupełnie inne produkty?</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Strona internetowa to jeden z nielicznych produktów, gdzie cena nie mówi prawie nic o jakości wizualnej — ale mówi bardzo dużo o jakości technicznej, bezpieczeństwie i efektywności sprzedażowej.
                        </p>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Strona na Wixie za 400 zł i strona na Next.js za 2 000 zł mogą wyglądać podobnie na zrzucie ekranu. Ale pod spodem to dwa różne światy — prędkość ładowania, bezpieczeństwo, możliwości SEO, koszty utrzymania i skalowalność są nieporównywalnie lepsze w tym droższym wariancie.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Poniżej rozbieram każdy przedział cenowy — żebyś wiedział co kupujesz.
                        </p>
                    </AnimatedSection>

                    {/* TABELA CEN */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6">Cennik stron internetowych 2026 — przegląd rynku</h2>
                        <div className="space-y-4 mb-8">
                            {tiers.map((tier, i) => (
                                <div key={i} className={`glass-card p-6 ${tier.icon === "good" ? "border-gold/20" : tier.icon === "warning" ? "border-yellow-700/30" : "border-white/5"}`}>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <span className="text-gold font-bold text-xl">{tier.range}</span>
                                            <p className="text-white/50 text-sm mt-1">{tier.source}</p>
                                        </div>
                                        {tier.icon === "warning" && <AlertCircle size={24} className="text-yellow-400 shrink-0" />}
                                        {tier.icon === "good" && <CheckCircle2 size={24} className="text-gold shrink-0" />}
                                        {(tier.icon === "neutral" || tier.icon === "premium") && <CheckCircle2 size={24} className="text-white/30 shrink-0" />}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Plusy</p>
                                            <ul className="space-y-1">
                                                {tier.pros.map((p, j) => <li key={j} className="text-white/70 text-sm flex items-start gap-2"><CheckCircle2 size={12} className="text-gold mt-0.5 shrink-0" />{p}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Minusy</p>
                                            <ul className="space-y-1">
                                                {tier.cons.map((c, j) => <li key={j} className="text-white/70 text-sm flex items-start gap-2"><XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />{c}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* ONE-PAGE VS MULTI */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6">One-page czy multi-page — co wybrać?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="glass-card p-6 border-gold/20">
                                <h3 className="font-bold text-gold mb-4 text-lg">Strona One-Page</h3>
                                <p className="text-white/60 text-sm mb-4">Wszystko na jednej, długiej stronie z nawigacją do sekcji. Prosta, szybka, tania w realizacji.</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Idealna gdy:</p>
                                <ul className="space-y-1.5">
                                    {["Jesteś freelancerem lub solo-biznesem", "Masz jedną główną usługę", "Chcesz szybko stanąć online", "Budżet poniżej 2 000 zł", "Lokal, gabinet, usługi lokalne"].map((item, i) => (
                                        <li key={i} className="text-white/70 text-sm flex items-start gap-2"><CheckCircle2 size={12} className="text-gold mt-0.5 shrink-0" />{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-card p-6">
                                <h3 className="font-bold text-white mb-4 text-lg">Strona Multi-Page</h3>
                                <p className="text-white/60 text-sm mb-4">Wiele podstron — każda może rankować na inne słowa kluczowe. Lepsza dla SEO i skalowalności.</p>
                                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Idealna gdy:</p>
                                <ul className="space-y-1.5">
                                    {["Masz wiele usług lub produktów", "Chcesz bloga lub case studies", "Zależy Ci na SEO long-tail", "Planujesz rozwijać stronę", "Chcesz dedykowane LP dla reklam"].map((item, i) => (
                                        <li key={i} className="text-white/70 text-sm flex items-start gap-2"><CheckCircle2 size={12} className="text-gold mt-0.5 shrink-0" />{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* WORDPRESS VS NEXT */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">WordPress czy Next.js — szczera opinia</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            WordPress obsługuje ok. 43% wszystkich stron w internecie. Ale popularność nie znaczy że to dobry wybór dla każdego.
                        </p>
                        <div className="space-y-4">
                            {[
                                { title: "Koszty utrzymania", wp: "30–80 zł/mies. za hosting + wtyczki premium + regularne aktualizacje", next: "0 zł na Vercel (mały ruch) + ok. 60 zł/rok za domenę" },
                                { title: "Bezpieczeństwo", wp: "WordPress to cel nr 1 hakerów — wymaga ciągłych aktualizacji i monitoringu", next: "Statyczne strony Next.js nie mają bazy danych do ataku" },
                                { title: "Prędkość ładowania", wp: "Zależy od hostingu i wtyczek — często 2–5s na budżetowym hostingu", next: "Vercel CDN — poniżej 1s globalnie, świetny wynik Core Web Vitals" },
                                { title: "Samodzielna edycja", wp: "Tak, wbudowany CMS jest intuicyjny", next: "Wymaga edycji kodu lub dodatkowego headless CMS" },
                            ].map((row, i) => (
                                <div key={i} className="border border-white/8 rounded-2xl p-5">
                                    <p className="font-bold text-white mb-3 text-sm uppercase tracking-wider">{row.title}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-white/3 rounded-xl p-3">
                                            <p className="text-xs text-white/40 mb-1">WordPress</p>
                                            <p className="text-white/70 text-sm">{row.wp}</p>
                                        </div>
                                        <div className="bg-gold/5 rounded-xl p-3 border border-gold/10">
                                            <p className="text-xs text-gold mb-1">Next.js</p>
                                            <p className="text-white/70 text-sm">{row.next}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/60 text-sm mt-5 leading-relaxed">
                            <strong className="text-white">Moja rekomendacja:</strong> Jeśli nie potrzebujesz codziennie samodzielnie edytować treści — Next.js to lepsza inwestycja. Jeśli masz sklep lub rozbudowany blog z wieloma autorami — rozważ WordPress lub headless CMS.
                        </p>
                    </AnimatedSection>

                    {/* CO WPŁYWA NA CENĘ */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">Co konkretnie wpływa na cenę strony?</h2>
                        <div className="space-y-5">
                            {[
                                { title: "1. Liczba podstron i sekcji", text: "Strona one-page z 6 sekcjami to ok. 2–3 dni pracy. Strona z 10 podstronami, blogiem i panelem klienta to kilka tygodni. Im więcej, tym drożej — i słusznie." },
                                { title: "2. Projekt graficzny (UI/UX)", text: "Czy strona ma być zbudowana według gotowego projektu z Figmy, czy designer robi projekt od zera? Dedykowany projekt UI/UX wyceniam od 100 zł za sekcję — ale to inwestycja, która zwraca się w konwersji." },
                                { title: "3. Animacje i interaktywność", text: "Proste przejścia CSS są w cenie. Zaawansowane animacje Framer Motion, parallax, efekty 3D — to dodatkowy czas pracy i wyższa cena." },
                                { title: "4. Integracje zewnętrzne", text: "Formularz kontaktowy — standardowo. Ale integracja z CRM, systemem rezerwacji, płatnościami (Stripe, PayU), zewnętrznym API — każda integracja to osobna wycena." },
                                { title: "5. SEO i copywriting", text: "Tworzenie strony i pisanie treści to dwie różne usługi. Jeśli dostarczasz gotowe teksty — płacisz mniej. Jeśli potrzebujesz copywritera — dolicz 200–600 zł za podstronę." },
                                { title: "6. Certyfikat SSL i hosting", text: "Na Vercel SSL jest darmowy i automatyczny. Na tradycyjnym hostingu to dodatkowy koszt lub konfiguracja. Pytaj wykonawcę co wchodzi w cenę." },
                            ].map((item, i) => (
                                <div key={i} className="border-l-2 border-gold/30 pl-6">
                                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-white/60 leading-relaxed text-sm">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* MOJE CENY */}
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 mt-12 border-gold/30">
                            <p className="eyebrow mb-4">Ile u mnie?</p>
                            <h2 className="text-2xl font-bold text-white mb-6">Ceny stron WWW — transparentny cennik</h2>
                            <div className="space-y-3 mb-8">
                                {[
                                    { name: "Strona One-Page", price: "od 1 200 zł", desc: "Do 8 sekcji, formularz, mapa, techniczne SEO, responsywna" },
                                    { name: "Strona Firmowa (Multi-Page)", price: "od 2 900 zł", desc: "Wiele podstron, blog, dedykowane LP, pełne SEO" },
                                    { name: "UI/UX Design (sam projekt)", price: "od 100 zł / sekcja", desc: "Projekt graficzny w Figmie bez kodowania" },
                                    { name: "Sklep E-commerce", price: "wycena indywidualna", desc: "Zależy od liczby produktów i integracji" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="font-medium text-white">{item.name}</p>
                                            <p className="text-white/50 text-sm">{item.desc}</p>
                                        </div>
                                        <span className="text-gold font-bold whitespace-nowrap text-sm">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-white/50 text-sm mb-6">
                                Stack: Next.js 16 + React + TypeScript + Tailwind CSS. Hosting na Vercel — ultra szybki, 0 zł miesięcznie dla standardowego ruchu. Domena to Twój koszt (~60 zł/rok).
                            </p>
                            <Link href="/cennik" className="inline-flex items-center gap-2 text-gold font-bold hover:gap-3 transition-all">
                                Zobacz pełny cennik <ArrowRight size={16} />
                            </Link>
                        </div>
                    </AnimatedSection>

                    {/* PODSUMOWANIE */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">Ile zapłacić za stronę — podsumowanie</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Jeśli jesteś freelancerem, lokalną firmą usługową lub startupisz — <strong className="text-gold">1 200–2 500 zł za one-page</strong> to optymalne wejście. Dostaniesz stronę na nowoczesnym stacku, która ładuje się poniżej sekundy, dobrze rankuje i nie wymaga miesięcznych opłat za platformę.
                        </p>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Jeśli chcesz skalować marketing contentem i SEO — zainwestuj od razu w <strong className="text-gold">2 900–5 000 zł za multi-page</strong> z blogiem. Każdy artykuł to osobna podstrona, która może rankować na kolejne frazy i generować leady przez lata.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Masz wątpliwości który wariant jest dla Ciebie? Napisz — powiem wprost co Ci potrzebne i wycenię co do złotówki.
                        </p>
                    </AnimatedSection>

                    {/* CTA */}
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 mt-12 text-center border-gold/20">
                            <p className="eyebrow mb-3">Masz projekt?</p>
                            <h3 className="text-2xl font-bold text-white mb-4">Wycenię stronę w ciągu 24h</h3>
                            <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm">
                                Opisz w kilku zdaniach czym się zajmujesz i czego potrzebujesz. Dostaniesz konkretną wycenę — bez presji, bez dzwonienia.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/#kontakt" className="btn-gold px-10 py-4 inline-flex items-center gap-3 group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]">
                                    <span className="font-bold text-navy text-lg">Wyślij zapytanie</span>
                                    <ArrowRight size={20} className="text-navy group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/strony-www" className="px-10 py-4 rounded-full font-bold inline-flex items-center gap-2 border border-gold/40 text-gold hover:bg-gold/10 transition-colors">
                                    Zobacz ofertę stron <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* FAQ */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-14 mb-6">Najczęstsze pytania</h2>
                        <div className="space-y-4">
                            {faqSchema.mainEntity.map((item, i) => (
                                <div key={i} className="border border-white/8 rounded-2xl p-6">
                                    <h3 className="font-bold text-white mb-3">{item.name}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    <AnimatedSection>
                        <div className="flex items-center justify-between mt-14 pt-8 border-t border-white/8">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors text-sm">
                                <ArrowLeft size={16} /> Wróć do bloga
                            </Link>
                            <Link href="/strony-www" className="inline-flex items-center gap-2 text-gold font-medium hover:gap-3 transition-all text-sm">
                                Oferta tworzenia stron <ArrowRight size={16} />
                            </Link>
                        </div>
                    </AnimatedSection>

                </div>
            </article>
        </main>
    );
}
