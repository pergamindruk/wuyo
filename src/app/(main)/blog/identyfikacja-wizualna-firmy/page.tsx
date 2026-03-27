import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "Identyfikacja wizualna firmy — czym jest i ile kosztuje w 2026? | WUYO",
    description: "Identyfikacja wizualna to nie tylko logo. Tłumaczę co zawiera, dlaczego ma znaczenie dla małej firmy i ile naprawdę kosztuje spójna identyfikacja od projektanta.",
    openGraph: {
        title: "Identyfikacja wizualna firmy — czym jest i ile kosztuje?",
        description: "Logo to dopiero początek. Tłumaczę co zawiera pełna identyfikacja wizualna i ile warto zapłacić.",
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/blog/identyfikacja-wizualna-firmy",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Identyfikacja wizualna firmy — czym jest i ile kosztuje?",
        description: "Co zawiera identyfikacja wizualna, po co ją robić i ile to kosztuje — bez owijania w bawełnę.",
        images: ["/logo_wuya2.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/blog/identyfikacja-wizualna-firmy" },
};

const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Identyfikacja wizualna firmy — czym jest i ile kosztuje w 2026?",
    "description": "Co zawiera identyfikacja wizualna, dlaczego ma znaczenie dla małej firmy i ile kosztuje spójna identyfikacja od projektanta.",
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
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://wuyo.pl/blog/identyfikacja-wizualna-firmy" },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Czym jest identyfikacja wizualna firmy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Identyfikacja wizualna (CI – Corporate Identity) to kompletny system wizualny marki: logo i jego warianty, paleta kolorów, typografia, szablony dokumentów, materiałów marketingowych i zasady ich stosowania. To co sprawia, że firma jest rozpoznawalna na wszystkich nośnikach — od wizytówki po stronę internetową.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile kosztuje identyfikacja wizualna firmy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "U freelancera z doświadczeniem identyfikacja wizualna kosztuje od 2 500 zł (logo + podstawowe elementy + księga znaku). Pełna identyfikacja z wszystkimi nośnikami (wizytówki, papier firmowy, szablony social media, prezentacja) od 5 000–8 000 zł. Duże agencje wyceniają podobne projekty od 15 000 zł wzwyż.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy mała firma potrzebuje identyfikacji wizualnej?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak — i to właśnie małe firmy potrzebują jej bardziej niż korporacje. Mała firma nie ma budżetu na masową reklamę, więc każdy punkt styku z klientem musi robić dobre wrażenie. Spójna identyfikacja buduje profesjonalizm i zaufanie, które duże firmy kupują budżetem.",
            },
        },
        {
            "@type": "Question",
            "name": "Co zawiera identyfikacja wizualna?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Podstawowa identyfikacja zawiera: logo (wersja podstawowa, monochromatyczna, sygnet), paleta kolorów (hex/CMYK/Pantone), typografia (fonty firmowe), wizytówkę, papier firmowy i stopkę e-mail, szablony social media oraz księgę znaku z zasadami używania. Rozszerzona identyfikacja dodaje: szablony prezentacji, packaging, uniformy, szyldy i materiały drukowane.",
            },
        },
        {
            "@type": "Question",
            "name": "Czym różni się logo od identyfikacji wizualnej?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Logo to jeden element — znak graficzny firmy. Identyfikacja wizualna to cały system, w którym logo jest tylko punktem wyjścia. Firma z samym logo bez identyfikacji wygląda jak człowiek w garniturze z przypadkowymi butami — coś jest, ale całość nie gra.",
            },
        },
    ],
};

const ciElements = [
    {
        tier: "Podstawa",
        label: "Logo + Marka",
        price: "od 800 zł",
        items: [
            "Logo (wersja podstawowa + monochromatyczna)",
            "Sygnet / ikona aplikacji",
            "Paleta kolorów (hex + CMYK)",
            "Typografia firmowa",
        ],
        note: "Minimum żeby istnieć. Bez kontekstu jak stosować.",
        highlight: false,
    },
    {
        tier: "Standard",
        label: "Identyfikacja wizualna",
        price: "od 2 500 zł",
        items: [
            "Wszystko z tier Logo +",
            "Wizytówka (projekt + przygotowanie do druku)",
            "Papier firmowy A4",
            "Stopka e-mail",
            "Szablony social media (3 formaty)",
            "Księga znaku (zasady używania)",
        ],
        note: "To warto mieć. Spójna marka na wszystkich nośnikach.",
        highlight: true,
    },
    {
        tier: "Pełna",
        label: "Identyfikacja rozszerzona",
        price: "od 5 000 zł",
        items: [
            "Wszystko ze Standard +",
            "Szablon oferty / prezentacji",
            "Folder firmowy / teczka ofertowa",
            "Materiały drukowane (ulotki, vouchery)",
            "Packaging / opakowania",
            "Rollup / baner reklamowy",
        ],
        note: "Dla firm z wieloma punktami styku z klientem.",
        highlight: false,
    },
];

export default function ArticlePage() {
    return (
        <main className="flex-1 w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Hero */}
            <section className="relative pt-40 pb-12 px-6 md:pt-48">
                <div className="max-w-3xl mx-auto">
                    <AnimatedSection animateOnMount={true}>
                        <Link href="/blog" className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm mb-8">
                            <ArrowLeft size={16} /> Blog
                        </Link>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="eyebrow text-xs">Logo & Branding</span>
                            <span className="text-white/20">·</span>
                            <span className="text-white/40 text-xs">8 min czytania</span>
                            <span className="text-white/20">·</span>
                            <span className="text-white/40 text-xs">27 marca 2026</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                            Identyfikacja wizualna firmy —<br />
                            <span className="text-gold">czym jest i ile kosztuje</span> w 2026?
                        </h1>
                        <p className="text-lg text-white/60 leading-relaxed">
                            Większość firm zamawia logo i myśli że to koniec. To dopiero początek. Tłumaczę czym jest identyfikacja wizualna, co powinna zawierać i dlaczego mała firma potrzebuje jej bardziej niż korporacja.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            <article className="px-6 pb-20">
                <div className="max-w-3xl mx-auto space-y-12">

                    {/* Intro */}
                    <AnimatedSection>
                        <div className="prose-wuyo">
                            <p>
                                Klient przychodzi z prośbą o logo. Dostaję logo, płaci — i znika. Trzy miesiące później wraca: <em>"Mateusz, potrzebuję wizytówkę. I ten font co na logo, bo mam do zrobienia ulotkę, ale nie wiem jaki to był. I jakie mieliśmy kolory — bo drukarnia pyta o CMYK a ja mam tylko to co mi wysłałeś..."</em>
                            </p>
                            <p>
                                To jest właśnie ten moment, w którym ktoś odkrywa że kupił tylko kawałek identyfikacji wizualnej — i teraz płaci za to co mógł dostać przy okazji pierwszego zamówienia.
                            </p>
                            <p>
                                W tym artykule rozpisuję co tak naprawdę powinna zawierać identyfikacja wizualna firmy, ile to kosztuje i kiedy wydatek ma sens — a kiedy wystarczy samo logo.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Definicja */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Identyfikacja wizualna — o co chodzi?</h2>
                        <div className="prose-wuyo">
                            <p>
                                Identyfikacja wizualna (ang. <em>Corporate Identity</em>, CI) to <strong>kompletny system wizualny marki</strong>. To nie pojedynczy element — to zbiór zasad i materiałów, które sprawiają że firma jest rozpoznawalna i spójna na każdym nośniku.
                            </p>
                            <p>
                                Prosta analogia: logo to twarz. Identyfikacja wizualna to cały wygląd — ubranie, fryzura, sposób mówienia, zachowanie. Możesz mieć ładną twarz i wyglądać chaotycznie. Albo mieć spójny, przemyślany styl i wyróżniać się na tle konkurencji.
                            </p>
                        </div>
                        <div className="glass-card p-6 mt-6 border-l-2 border-gold">
                            <p className="text-white/70 text-sm leading-relaxed">
                                <strong className="text-gold">Definicja robocza:</strong> Identyfikacja wizualna to wszystko co klient widzi zanim przeczyta pierwsze słowo Twojej oferty. Kolor strony, font na wizytówce, grafika na Instagramie, szablon faktury — to wszystko "mówi" zanim przemówisz.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Logo vs CI */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Logo a identyfikacja wizualna — różnica</h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="glass-card p-6">
                                <h3 className="font-bold text-white mb-3">Logo</h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-4">
                                    Jeden element graficzny — znak, logotyp lub ich kombinacja. Punkt wyjścia do budowania marki. Sam w sobie nie wystarczy do spójnej komunikacji.
                                </p>
                                <div className="space-y-2">
                                    {["Plik graficzny (SVG/PNG/PDF)", "Jeden projekt, jedno zastosowanie", "Brak zasad użycia"].map((i, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-white/50 text-xs">
                                            <XCircle size={13} className="text-red-400 shrink-0" /> {i}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card p-6 border border-gold/20">
                                <h3 className="font-bold text-white mb-3">Identyfikacja wizualna</h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-4">
                                    Cały system: logo + paleta kolorów + typografia + szablony + zasady stosowania. Działa spójnie na każdym nośniku bez dodatkowych pytań.
                                </p>
                                <div className="space-y-2">
                                    {["Logo we wszystkich wariantach", "Gotowe materiały do użycia", "Księga znaku z zasadami"].map((i, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-white/60 text-xs">
                                            <CheckCircle2 size={13} className="text-green-400 shrink-0" /> {i}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="prose-wuyo">
                            <p>
                                Firma z samym logo bez identyfikacji to jak człowiek w dobrym garniturze — ale losowych butach, przypadkowej koszuli i bez grzebienia. Coś jest, ale całość nie gra.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Co zawiera */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Co powinna zawierać identyfikacja wizualna?</h2>
                        <p className="text-white/60 mb-6">Rozkładam na elementy od absolutnego minimum po pełny system:</p>

                        <div className="space-y-4">
                            {[
                                {
                                    category: "Logo i jego warianty",
                                    items: [
                                        { name: "Wersja podstawowa (kolorowa)", must: true },
                                        { name: "Wersja monochromatyczna (czarna + biała)", must: true },
                                        { name: "Sygnet / ikona (np. do favicon, avatara)", must: true },
                                        { name: "Wersja pozioma i pionowa", must: false },
                                        { name: "Wariant na ciemne i jasne tło", must: false },
                                    ],
                                },
                                {
                                    category: "Kolory",
                                    items: [
                                        { name: "Paleta kolorów głównych (2–3 kolory)", must: true },
                                        { name: "Wartości HEX (strony www, social media)", must: true },
                                        { name: "Wartości CMYK (druk offsetowy)", must: true },
                                        { name: "Wartości RGB (ekrany, prezentacje)", must: true },
                                        { name: "Kolory uzupełniające / neutralne", must: false },
                                    ],
                                },
                                {
                                    category: "Typografia",
                                    items: [
                                        { name: "Font nagłówkowy (H1/H2)", must: true },
                                        { name: "Font treści (body text)", must: true },
                                        { name: "Zasady hierarchii typograficznej", must: false },
                                        { name: "Alternatywny font systemowy (fallback)", must: false },
                                    ],
                                },
                                {
                                    category: "Materiały podstawowe",
                                    items: [
                                        { name: "Wizytówka (projekt obu stron)", must: true },
                                        { name: "Papier firmowy A4", must: false },
                                        { name: "Stopka e-mail", must: true },
                                        { name: "Sygnatury e-mail", must: false },
                                    ],
                                },
                                {
                                    category: "Social media & digital",
                                    items: [
                                        { name: "Okładka Facebook / LinkedIn", must: false },
                                        { name: "Szablony postów (kwadrat + stories)", must: false },
                                        { name: "Grafika OG (dla udostępnień linków)", must: false },
                                    ],
                                },
                                {
                                    category: "Dokumentacja",
                                    items: [
                                        { name: "Księga znaku (brand guidelines)", must: true },
                                        { name: "Pliki źródłowe (AI/Figma)", must: true },
                                        { name: "Pakiet eksportów (SVG, PNG, PDF)", must: true },
                                    ],
                                },
                            ].map((section, si) => (
                                <div key={si} className="glass-card p-5">
                                    <h3 className="font-bold text-white mb-3 text-sm">{section.category}</h3>
                                    <div className="grid sm:grid-cols-2 gap-2">
                                        {section.items.map((item, ii) => (
                                            <div key={ii} className="flex items-center gap-2">
                                                <CheckCircle2 size={13} className={item.must ? "text-green-400 shrink-0" : "text-white/20 shrink-0"} />
                                                <span className={`text-xs ${item.must ? "text-white/70" : "text-white/40"}`}>{item.name}</span>
                                                {item.must && <span className="text-gold text-xs ml-auto font-bold">must</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/40 text-xs mt-4">
                            <span className="text-green-400">●</span> must — absolutne minimum | <span className="text-white/20">●</span> nice to have — zależy od biznesu
                        </p>
                    </AnimatedSection>

                    {/* Dlaczego mała firma potrzebuje */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Dlaczego mała firma potrzebuje tego bardziej niż korporacja?</h2>
                        <div className="prose-wuyo">
                            <p>
                                Brzmi paradoksalnie — ale to prawda. Duże firmy mają budżet na masową reklamę, która "przykrywa" niespójność. Małe firmy nie mają tego luksusu. Każdy punkt styku z klientem musi robić robotę.
                            </p>
                            <p>
                                Klient dostaje Twoją wizytówkę, wchodzi na stronę, widzi Instagram, dostaje ofertę w PDF — i jeśli to wszystko wygląda tak jakby robiły to trzy różne osoby, nie zaufa Tobie jako profesjonaliście. Nawet jeśli Twoja usługa jest świetna.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mt-6">
                            {[
                                {
                                    title: "Pierwsze wrażenie",
                                    desc: "Masz 3–7 sekund. Spójna identyfikacja mówi \"jestem profesjonalistą\" zanim klient przeczyta cokolwiek.",
                                },
                                {
                                    title: "Zaufanie bez referencji",
                                    desc: "Nowy klient nie zna Cię. Wygląd marki to sygnał jakości. Chaotyczna grafika = sygnał ryzyka.",
                                },
                                {
                                    title: "Wyróżnienie w niszy",
                                    desc: "W morzu przypadkowych logotypów robionych w Canva — spójna identyfikacja wyróżnia bez słowa.",
                                },
                            ].map((card, i) => (
                                <div key={i} className="glass-card p-5">
                                    <h3 className="font-bold text-white mb-2 text-sm">{card.title}</h3>
                                    <p className="text-white/50 text-xs leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Cennik */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Ile kosztuje identyfikacja wizualna w 2026?</h2>
                        <p className="text-white/60 mb-6">
                            Rozpiętość cen jest ogromna — od kilkuset złotych w Canva po dziesiątki tysięcy w dużej agencji. Rozkładam to na realne przedziały:
                        </p>

                        <div className="glass-card overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-white/40 font-medium">Źródło</th>
                                            <th className="text-left p-4 text-white/40 font-medium">Cena</th>
                                            <th className="text-left p-4 text-white/40 font-medium">Co dostajesz</th>
                                            <th className="text-left p-4 text-white/40 font-medium">Ryzyko</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { source: "Canva / gotowy szablon", price: "0–200 zł", get: "Edytowalny szablon", risk: "Brak unikalności, wygląda jak tysiące innych" },
                                            { source: "Freelancer bez doświadczenia", price: "200–800 zł", get: "Logo + kilka plików", risk: "Brak systemu, brak plików źródłowych" },
                                            { source: "Freelancer z portfolio", price: "800–5 000 zł", get: "Logo + identyfikacja + księga znaku", risk: "Niskie — sprawdź portfolio" },
                                            { source: "Mała agencja", price: "3 000–15 000 zł", get: "Pełna identyfikacja + strategia", risk: "Cena za overhead agencji, nie za jakość" },
                                            { source: "Duża agencja", price: "15 000–100 000 zł", get: "Pełen rebranding z badaniami", risk: "Uzasadnione tylko dla dużych firm" },
                                        ].map((row, i) => (
                                            <tr key={i} className={i === 2 ? "bg-gold/5" : ""}>
                                                <td className={`p-4 font-medium ${i === 2 ? "text-gold" : "text-white/70"}`}>{row.source}</td>
                                                <td className="p-4 text-white/60">{row.price}</td>
                                                <td className="p-4 text-white/60">{row.get}</td>
                                                <td className="p-4 text-white/40 text-xs">{row.risk}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {ciElements.map((tier, i) => (
                                <div key={i} className={`glass-card p-6 ${tier.highlight ? "border border-gold/30" : ""}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-white/40 text-xs mb-1">{tier.tier}</p>
                                            <h3 className="font-bold text-white">{tier.label}</h3>
                                        </div>
                                        <span className={`font-bold text-lg ${tier.highlight ? "text-gold" : "text-white/60"}`}>{tier.price}</span>
                                    </div>
                                    <ul className="grid sm:grid-cols-2 gap-2 mb-4">
                                        {tier.items.map((item, ii) => (
                                            <li key={ii} className="flex items-center gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={13} className="text-green-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className={`text-xs ${tier.highlight ? "text-gold/80" : "text-white/40"}`}>
                                        → {tier.note}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/40 text-sm mt-4 text-center">
                            Pełny cennik →{" "}
                            <Link href="/cennik" className="text-gold hover:underline">wuyo.pl/cennik</Link>
                        </p>
                    </AnimatedSection>

                    {/* Kiedy samo logo */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Kiedy wystarczy samo logo?</h2>
                        <div className="prose-wuyo">
                            <p>
                                Nie będę udawać że każdy potrzebuje pełnej identyfikacji od razu. Są sytuacje w których samo logo to właściwa decyzja:
                            </p>
                        </div>
                        <div className="space-y-3 mt-4">
                            {[
                                { ok: true, text: "Testujesz nowy pomysł na biznes — nie wiadomo czy wypali" },
                                { ok: true, text: "Jesteś solopreneurerem z 99% klientów z polecenia — witryna to wizytówka, nie kanał sprzedaży" },
                                { ok: true, text: "Masz napięty budżet — lepsze dobre logo niż kiepska identyfikacja" },
                                { ok: false, text: "Planujesz materiały drukowane (wizytówki, ulotki, vouchery)" },
                                { ok: false, text: "Masz zespół lub podwykonawców — ktoś inny będzie tworzył materiały" },
                                { ok: false, text: "Social media to Twój główny kanał — spójność jest kluczowa" },
                                { ok: false, text: "Chcesz wyglądać profesjonalnie dla klientów biznesowych B2B" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    {item.ok
                                        ? <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
                                        : <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                    }
                                    <p className="text-white/70 text-sm">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Czerwone flagi */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Czerwone flagi przy zlecaniu identyfikacji</h2>
                        <p className="text-white/60 mb-5">Jak rozpoznać że projekt się nie uda zanim zapłacisz:</p>
                        <div className="space-y-3">
                            {[
                                { flag: "Projektant nie pyta o Twoją firmę, klientów i konkurencję", why: "Identyfikacja bez researchu to grafika bez sensu." },
                                { flag: "Dostajesz tylko PNG bez plików źródłowych", why: "Bez SVG/AI/Figma jesteś uzależniony od projektanta na zawsze." },
                                { flag: "Brak informacji o kolorach CMYK i fontach", why: "Drukarnia zapyta — i wtedy okaże się że nikt tego nie wie." },
                                { flag: "Projekt bez wersji monochromatycznej", why: "Logo musi działać czarno-białe (pieczątka, faks, druk ekonomiczny)." },
                                { flag: "\"Nieograniczone poprawki\" w bardzo niskiej cenie", why: "Albo kłamstwo, albo projektant nie ma doświadczenia. Obie opcje złe." },
                                { flag: "Brak umowy lub dokumentu z zakresem prac", why: "Bez zakresu każda strona ma inny pomysł na to co jest \"w cenie\"." },
                            ].map((item, i) => (
                                <div key={i} className="glass-card p-4 flex items-start gap-4">
                                    <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/80 text-sm font-medium">{item.flag}</p>
                                        <p className="text-white/40 text-xs mt-1">{item.why}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Proces */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Jak wygląda proces tworzenia identyfikacji?</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    step: "01",
                                    title: "Brief i research",
                                    desc: "Rozmowa o firmie: kim jesteś, kto jest Twoim klientem, kto jest konkurencją, jakie emocje ma wywoływać marka. Bez tego etapu projektant strzelał by na oślep.",
                                    time: "1–2 dni",
                                },
                                {
                                    step: "02",
                                    title: "Moodboard i kierunek",
                                    desc: "Propozycja kierunku wizualnego: styl, nastrój, paleta kolorów, inspiracje. Zatwierdzasz zanim projektant zacznie rysować logo.",
                                    time: "2–3 dni",
                                },
                                {
                                    step: "03",
                                    title: "Projekt logo",
                                    desc: "Pierwsze propozycje (zazwyczaj 2–3 warianty). Wybierasz kierunek, wprowadzamy poprawki, finalizujemy znak.",
                                    time: "5–7 dni",
                                },
                                {
                                    step: "04",
                                    title: "Rozbudowa systemu",
                                    desc: "Logo + kolory + typografia = system. Nakładamy na materiały: wizytówka, papier firmowy, szablony social media.",
                                    time: "3–5 dni",
                                },
                                {
                                    step: "05",
                                    title: "Księga znaku i pliki",
                                    desc: "Dokumentacja zasad używania identyfikacji + pakiet plików (SVG, PNG, PDF, Figma/AI). Masz wszystko żeby działać samodzielnie.",
                                    time: "2–3 dni",
                                },
                            ].map((step, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="shrink-0 w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold font-bold text-xs">
                                        {step.step}
                                    </div>
                                    <div className="glass-card p-4 flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-white text-sm">{step.title}</h3>
                                            <span className="text-white/30 text-xs">{step.time}</span>
                                        </div>
                                        <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="glass-card p-5 mt-4 border-l-2 border-gold">
                            <p className="text-white/70 text-sm">
                                <strong className="text-gold">Łączny czas:</strong> Pełna identyfikacja wizualna zajmuje 2–4 tygodnie przy aktywnej współpracy. Im szybciej odpowiadasz na pytania i zatwierdzasz etapy — tym szybciej masz gotowy projekt.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* FAQ */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Najczęstsze pytania</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: "Czym jest identyfikacja wizualna firmy?",
                                    a: "Kompletny system wizualny marki: logo i jego warianty, paleta kolorów, typografia, szablony dokumentów i zasady ich stosowania. To co sprawia, że firma jest rozpoznawalna na wszystkich nośnikach — od wizytówki po stronę internetową.",
                                },
                                {
                                    q: "Ile kosztuje identyfikacja wizualna firmy?",
                                    a: "U doświadczonego freelancera identyfikacja podstawowa (logo + paleta + typografia + wizytówka + stopka e-mail + księga znaku) kosztuje od 2 500 zł. Pełna identyfikacja z wszystkimi nośnikami od 5 000 zł. Duże agencje wyceniają podobne projekty od 15 000 zł wzwyż.",
                                },
                                {
                                    q: "Czy mała firma potrzebuje identyfikacji wizualnej?",
                                    a: "Tak — i to właśnie małe firmy potrzebują jej bardziej. Mała firma nie ma budżetu na masową reklamę, więc każdy punkt styku z klientem musi robić dobre wrażenie. Spójna identyfikacja buduje profesjonalizm i zaufanie, które duże firmy kupują budżetem reklamowym.",
                                },
                                {
                                    q: "Czym różni się logo od identyfikacji wizualnej?",
                                    a: "Logo to jeden element — znak graficzny. Identyfikacja to cały system, w którym logo jest punktem wyjścia. Firma z samym logo bez identyfikacji wygląda jak człowiek w dobrym garniturze z przypadkowymi butami — coś jest, ale całość nie gra.",
                                },
                                {
                                    q: "Co to jest księga znaku?",
                                    a: "Dokument (zazwyczaj PDF) opisujący zasady używania identyfikacji: jak używać logo, jakich kolorów, jakich fontów, czego nie robić. Dzięki księdze każda osoba tworząca materiały dla firmy — drukarnia, copywriter, inny grafik — wie jak zachować spójność.",
                                },
                            ].map((item, i) => (
                                <details key={i} className="glass-card group">
                                    <summary className="p-5 cursor-pointer list-none flex items-center justify-between text-white font-medium text-sm hover:text-gold transition-colors">
                                        {item.q}
                                        <span className="text-white/30 group-open:rotate-180 transition-transform duration-200 text-lg leading-none">+</span>
                                    </summary>
                                    <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Linki wewnętrzne */}
                    <AnimatedSection>
                        <h2 className="text-xl font-bold text-white mb-4">Przeczytaj też</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <Link href="/blog/ile-kosztuje-logo" className="glass-card p-5 group block hover:border-gold/30 transition-colors">
                                <p className="text-xs text-white/40 mb-2">Logo & Branding</p>
                                <p className="font-bold text-white group-hover:text-gold transition-colors text-sm leading-tight">Ile kosztuje logo w 2026? Uczciwy cennik projektanta</p>
                                <span className="inline-flex items-center gap-1 text-gold text-xs mt-3 group-hover:gap-2 transition-all">Czytaj <ArrowRight size={12} /></span>
                            </Link>
                            <Link href="/blog/ile-kosztuje-strona-internetowa" className="glass-card p-5 group block hover:border-gold/30 transition-colors">
                                <p className="text-xs text-white/40 mb-2">Strony WWW</p>
                                <p className="font-bold text-white group-hover:text-gold transition-colors text-sm leading-tight">Ile kosztuje strona internetowa dla firmy w 2026?</p>
                                <span className="inline-flex items-center gap-1 text-gold text-xs mt-3 group-hover:gap-2 transition-all">Czytaj <ArrowRight size={12} /></span>
                            </Link>
                        </div>
                    </AnimatedSection>

                    {/* CTA */}
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 text-center border border-gold/20">
                            <p className="eyebrow mb-4">Gotowy na spójną markę?</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                Zbuduję identyfikację, która działa na każdym nośniku
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
                                Logo, kolory, typografia, wizytówki, papier firmowy, szablony social media i księga znaku — wszystko spójne, gotowe do użycia od razu.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="/#kontakt" className="btn-gold px-8 py-3 rounded-full font-bold inline-block">
                                    Zamów identyfikację wizualną
                                </a>
                                <Link href="/cennik" className="px-8 py-3 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">
                                    Zobacz cennik
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>

                </div>
            </article>
        </main>
    );
}
