import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "Strona one-page czy multi-page? Która lepsza dla Twojej firmy | WUYO",
    description: "One-page czy multi-page — które rozwiązanie wybrać dla swojej firmy? Porównuję koszty, SEO, konwersję i użyteczność. Konkretna odpowiedź bez marketingowego bełkotu.",
    openGraph: {
        title: "Strona one-page czy multi-page? Która lepsza dla Twojej firmy?",
        description: "Porównuję oba rozwiązania pod kątem SEO, kosztów i konwersji — i mówię wprost, które wybrać.",
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/blog/strona-one-page-czy-multi-page",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Strona one-page czy multi-page? Konkretna odpowiedź",
        description: "SEO, koszty, konwersja — porównuję oba typy stron i mówię co wybrać dla swojej firmy.",
        images: ["/logo_wuya2.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/blog/strona-one-page-czy-multi-page" },
};

const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Strona one-page czy multi-page? Która lepsza dla Twojej firmy?",
    "description": "Porównanie stron one-page i multi-page pod kątem SEO, kosztów, konwersji i użyteczności.",
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
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://wuyo.pl/blog/strona-one-page-czy-multi-page" },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Strona one-page czy multi-page — co lepsze dla SEO?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Multi-page wygrywa w SEO dla firm oferujących wiele usług lub chcących rankować na wiele słów kluczowych. One-page można zoptymalizować pod 1-2 frazy, ale nie pozwoli na szeroki ruch organiczny. Jeśli content marketing i Google są Twoim głównym kanałem pozyskiwania klientów — wybierz multi-page.",
            },
        },
        {
            "@type": "Question",
            "name": "Kiedy strona one-page wystarczy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "One-page wystarczy gdy oferujesz jedną główną usługę lub produkt, Twoi klienci przychodzą z polecenia lub social mediów (nie z Google), chcesz szybko zbudować prostą wizytówkę online lub testujesz nowy pomysł na biznes. To dobre wyjście dla fotografów, coachów, konsultantów z jedną specjalizacją.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy one-page może być responsywna i szybka?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak — dobrze zbudowana strona one-page na Next.js ładuje się poniżej 1 sekundy i działa perfekcyjnie na telefonach. Szybkość zależy od technologii i jakości wykonania, nie od liczby podstron.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile kosztuje strona one-page, a ile multi-page?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "U freelancera z doświadczeniem strona one-page kosztuje od 1 200 zł, a multi-page od 2 900 zł. Cena rośnie wraz ze złożonością projektu, liczbą podstron i dodatkowymi funkcjonalnościami jak blog, formularz lub kalkulator.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy można zacząć od one-page i rozbudować do multi-page?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak, ale wymaga to przepisania strony — nie rozbudowania. One-page i multi-page mają inną architekturę. Warto od razu zdecydować co potrzebujesz, żeby nie płacić za to samo dwa razy.",
            },
        },
    ],
};

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
                            <span className="eyebrow text-xs">Strony WWW</span>
                            <span className="text-white/20">·</span>
                            <span className="text-white/40 text-xs">7 min czytania</span>
                            <span className="text-white/20">·</span>
                            <span className="text-white/40 text-xs">27 marca 2026</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                            Strona one-page czy multi-page?<br />
                            <span className="text-gold">Konkretna odpowiedź</span> dla Twojej firmy
                        </h1>
                        <p className="text-lg text-white/60 leading-relaxed">
                            Każdy projektant powie Ci "to zależy". Ja powiem Ci <strong className="text-white/80">od czego zależy</strong> — i dam konkretne kryteria, żebyś mógł podjąć decyzję bez zgadywania.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Article body */}
            <article className="px-6 pb-20">
                <div className="max-w-3xl mx-auto space-y-12">

                    {/* Intro */}
                    <AnimatedSection>
                        <div className="prose-wuyo">
                            <p>
                                Zanim wydasz ani złotówki na stronę internetową, musisz odpowiedzieć na jedno pytanie: <strong>one-page czy multi-page?</strong> Zła odpowiedź to kilka tysięcy złotych wyrzuconych w błoto — albo strona, która nigdy nie zacznie generować ruchu z Google.
                            </p>
                            <p>
                                Pracuję ze stronami od lat. Widziałem firmy, które zapłaciły za rozbudowany serwis multi-page, a wystarczyłby im elegancki landing. I odwrotnie — freelancerów, którzy po roku żałowali one-page, bo Google ich po prostu nie widział.
                            </p>
                            <p>
                                W tym artykule rozkładam oba rozwiązania na czynniki pierwsze: SEO, konwersja, koszt, czas realizacji. Na końcu dostaniesz prosty test — 5 pytań, które dają jednoznaczną odpowiedź.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Definicje */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Czym właściwie różnią się oba typy?</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-gold mb-3">One-page (landing page)</h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-4">
                                    Jedna strona z wieloma sekcjami przewijanymi w pionie. Kliknięcie w menu nie otwiera nowej strony — scrolluje do sekcji. Cały content żyje pod jednym adresem URL.
                                </p>
                                <p className="text-white/40 text-xs">
                                    Przykład URL: <span className="font-mono text-white/60">twojafirma.pl/#oferta</span>
                                </p>
                            </div>
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-bold text-gold mb-3">Multi-page (strona wielostronicowa)</h3>
                                <p className="text-white/60 text-sm leading-relaxed mb-4">
                                    Każda sekcja to osobna podstrona z własnym URL. Menu prowadzi do odrębnych stron: /o-nas, /uslugi, /kontakt. Każda podstrona jest indeksowana przez Google osobno.
                                </p>
                                <p className="text-white/40 text-xs">
                                    Przykład URL: <span className="font-mono text-white/60">twojafirma.pl/uslugi/logo</span>
                                </p>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Tabela porównawcza */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Porównanie: 8 kluczowych kryteriów</h2>
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-white/40 font-medium w-1/3">Kryterium</th>
                                            <th className="text-center p-4 text-gold font-bold">One-page</th>
                                            <th className="text-center p-4 text-white/70 font-bold">Multi-page</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr>
                                            <td className="p-4 text-white/60">Koszt realizacji</td>
                                            <td className="p-4 text-center text-green-400 font-medium">od 1 200 zł</td>
                                            <td className="p-4 text-center text-white/60">od 2 900 zł</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-white/60">Czas wdrożenia</td>
                                            <td className="p-4 text-center text-green-400 font-medium">1–2 tygodnie</td>
                                            <td className="p-4 text-center text-white/60">3–6 tygodni</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-white/60">SEO — liczba fraz</td>
                                            <td className="p-4 text-center text-yellow-400 font-medium">1–3 frazy</td>
                                            <td className="p-4 text-center text-green-400 font-medium">nieograniczone</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-white/60">Konwersja (1 usługa)</td>
                                            <td className="p-4 text-center text-green-400 font-medium">wyższa</td>
                                            <td className="p-4 text-center text-white/60">zależy od UX</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-white/60">Zarządzanie treścią</td>
                                            <td className="p-4 text-center text-green-400 font-medium">prostsze</td>
                                            <td className="p-4 text-center text-white/60">bardziej złożone</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-white/60">Skalowalność</td>
                                            <td className="p-4 text-center text-yellow-400 font-medium">ograniczona</td>
                                            <td className="p-4 text-center text-green-400 font-medium">wysoka</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-white/60">Blog / content</td>
                                            <td className="p-4 text-center text-red-400 font-medium">niemożliwy</td>
                                            <td className="p-4 text-center text-green-400 font-medium">naturalny</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-white/60">Doświadczenie użytkownika</td>
                                            <td className="p-4 text-center text-white/60">intuicyjne, liniowe</td>
                                            <td className="p-4 text-center text-white/60">wymaga dobrej nawigacji</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Kiedy one-page */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Kiedy one-page to właściwy wybór?</h2>
                        <p className="text-white/60 leading-relaxed mb-6">
                            One-page nie jest gorszy — jest po prostu do innych zastosowań. Sprawdza się gdy:
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                { ok: true, text: "Oferujesz jedną usługę lub jeden produkt (np. coaching, fotografia, konkretna aplikacja)" },
                                { ok: true, text: "Klienci trafiają do Ciebie z polecenia, social mediów lub reklam — nie z wyszukiwarki" },
                                { ok: true, text: "Chcesz mieć stronę w 2 tygodnie z ograniczonym budżetem" },
                                { ok: true, text: "Twój cel to zebranie leadów pod jedną konkretną ofertę (event, premiera, kampania)" },
                                { ok: true, text: "Jesteś freelancerem z jedną specjalizacją i prosty portfolio site w zupełności wystarczy" },
                                { ok: false, text: "Liczysz na ruch organiczny z Google na wiele różnych usług" },
                                { ok: false, text: "Planujesz pisać bloga lub publikować case studies" },
                                { ok: false, text: "Masz 5+ usług, które wymagają osobnego przedstawienia i SEO" },
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
                        <div className="glass-card p-5 border-l-2 border-gold">
                            <p className="text-white/70 text-sm leading-relaxed">
                                <strong className="text-gold">Przykład z życia:</strong> Fotograf ślubny z Rzeszowa, 90% klientów z Instagrama i poleceń. One-page z galerią, cennikiem i formularzem rezerwacyjnym — idealne rozwiązanie. Nie potrzebuje rankować na 20 fraz, potrzebuje dobrego wrażenia w 10 sekund.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Kiedy multi-page */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Kiedy musisz wybrać multi-page?</h2>
                        <p className="text-white/60 leading-relaxed mb-6">
                            Multi-page to nie luksus — to konieczność, gdy Twój biznes zależy od widoczności w Google. Oto kiedy nie ma alternatywy:
                        </p>
                        <div className="space-y-3 mb-6">
                            {[
                                { ok: true, text: "Chcesz rankować na kilka lub kilkanaście różnych fraz (\"logo Rzeszów\", \"strony www dla firm\", \"identyfikacja wizualna\")" },
                                { ok: true, text: "Oferujesz różne usługi wymagające osobnego przedstawienia i innego CTA" },
                                { ok: true, text: "Planujesz prowadzić blog jako kanał pozyskiwania klientów" },
                                { ok: true, text: "Masz portfolio z wieloma kategoriami projektów" },
                                { ok: true, text: "Chcesz budować autorytet w niszy przez content marketing długoterminowo" },
                                { ok: false, text: "Nie jesteś gotowy na dłuższy czas i wyższy budżet realizacji" },
                                { ok: false, text: "Twój jedyny cel to landing pod konkretną kampanię reklamową" },
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
                        <div className="glass-card p-5 border-l-2 border-gold">
                            <p className="text-white/70 text-sm leading-relaxed">
                                <strong className="text-gold">Przykład z życia:</strong> Studio graficzne oferujące logo, strony, druk i social media. Każda usługa to osobna podstrona z własnym SEO, opisem procesu i cennikiem. Blog z artykułami typu "ile kosztuje logo" generuje organiczny ruch co miesiąc bez dodatkowych kosztów reklamy.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* SEO deep dive */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">SEO: tu one-page przegrywa z założenia</h2>
                        <div className="prose-wuyo">
                            <p>
                                To jest argument, który rozstrzyga sprawę dla większości firm. Google indeksuje <strong>podstrony</strong>, nie sekcje. Masz jedną stronę (one-page) — masz jeden URL — możesz rankować na jedną grupę słów kluczowych.
                            </p>
                            <p>
                                W multi-page każda podstrona może rankować osobno:
                            </p>
                        </div>
                        <div className="glass-card overflow-hidden my-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-white/40 font-medium">Podstrona</th>
                                            <th className="text-left p-4 text-white/40 font-medium">Fraza docelowa</th>
                                            <th className="text-left p-4 text-white/40 font-medium">Miesięczne wyszukiwania (est.)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { url: "/logo", phrase: "projektowanie logo Rzeszów", volume: "320+" },
                                            { url: "/strony-www", phrase: "strona internetowa dla firmy", volume: "2 400+" },
                                            { url: "/druk", phrase: "druk wizytówek Rzeszów", volume: "260+" },
                                            { url: "/blog/ile-kosztuje-logo", phrase: "ile kosztuje logo", volume: "1 900+" },
                                            { url: "/blog/strona-one-page-...", phrase: "one-page czy multi-page", volume: "480+" },
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="p-4 font-mono text-gold text-xs">{row.url}</td>
                                                <td className="p-4 text-white/70">{row.phrase}</td>
                                                <td className="p-4 text-white/50">{row.volume}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="prose-wuyo">
                            <p>
                                One-page fizycznie nie może rankować na pięć różnych fraz z taką samą skutecznością. Możesz zoptymalizować go pod "projektowanie logo Rzeszów" — ale wtedy tracisz szansę na "strona internetowa dla firmy". Jeden URL, jeden kontekst semantyczny w oczach Google.
                            </p>
                            <p>
                                Jeśli chcesz żyć z organicznego ruchu — multi-page to nie opcja. To wymóg.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Konwersja */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Konwersja: tu one-page bywa lepszy</h2>
                        <div className="prose-wuyo">
                            <p>
                                Paradoks: one-page, który wydaje się "uboższy", może konwertować lepiej od rozbudowanego serwisu. Dlaczego?
                            </p>
                            <p>
                                Gdy użytkownik trafia na one-page, ma tylko jedną ścieżkę do przejścia: przewija w dół i trafia na formularz lub CTA. Nie może zbłądzić w menu, nie otworzy 6 podstron zamiast wypełnić formularz, nie wyjdzie szukając "cennika" (bo jest tuż pod).
                            </p>
                            <p>
                                W multi-page rozkład konwersji jest rozproszony — i to jest dobra wiadomość, jeśli wiesz jak to zaprojektować. Ale wymaga przemyślanej architektury informacji i CTA na każdej podstronie. Źle zaprojektowany multi-page "gubi" użytkowników między podstronami.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            <div className="glass-card p-5">
                                <h4 className="font-bold text-white mb-3 text-sm">One-page konwertuje lepiej gdy:</h4>
                                <ul className="space-y-2">
                                    {[
                                        "Ruch pochodzi z reklam (zimny traffic)",
                                        "Masz jedną ofertę i jedno CTA",
                                        "Chcesz zebrać leady szybko i prosto",
                                        "Użytkownicy są mobilni (scrolling > clicking)",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-white/60 text-xs">
                                            <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-card p-5">
                                <h4 className="font-bold text-white mb-3 text-sm">Multi-page konwertuje lepiej gdy:</h4>
                                <ul className="space-y-2">
                                    {[
                                        "Ruch organiczny z Google (ciepły traffic)",
                                        "Masz wiele usług z różnymi decydentami",
                                        "Klient potrzebuje czasu i edukacji przed zakupem",
                                        "Blog buduje zaufanie przed pierwszym kontaktem",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-white/60 text-xs">
                                            <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Test decyzyjny */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">5-pytaniowy test: które wybrać?</h2>
                        <p className="text-white/60 mb-6">Odpowiedz na każde pytanie i policz punkty.</p>
                        <div className="space-y-4">
                            {[
                                {
                                    q: "1. Ile różnych usług lub produktów oferujesz?",
                                    a1: { text: "Jedną główną (np. fotografia, coaching, konkretna aplikacja)", pts: "→ +1 dla one-page" },
                                    a2: { text: "Trzy lub więcej (np. logo + strony + druk + social media)", pts: "→ +1 dla multi-page" },
                                },
                                {
                                    q: "2. Skąd głównie przychodzą Twoi klienci?",
                                    a1: { text: "Z polecenia, Instagrama, LinkedIn, reklam Facebook/Google Ads", pts: "→ +1 dla one-page" },
                                    a2: { text: "Z wyszukiwarki Google lub chcę to zmienić", pts: "→ +1 dla multi-page" },
                                },
                                {
                                    q: "3. Czy planujesz prowadzić bloga lub publikować case studies?",
                                    a1: { text: "Nie, nie mam na to czasu ani planu", pts: "→ +1 dla one-page" },
                                    a2: { text: "Tak — chcę budować autorytet przez content", pts: "→ +1 dla multi-page" },
                                },
                                {
                                    q: "4. Jaki masz budżet na stronę?",
                                    a1: { text: "Do 2 000 zł i chcę mieć stronę szybko", pts: "→ +1 dla one-page" },
                                    a2: { text: "Jestem gotowy zainwestować 3 000–10 000 zł w coś długofalowego", pts: "→ +1 dla multi-page" },
                                },
                                {
                                    q: "5. Jak długo działa Twoja firma?",
                                    a1: { text: "Startuję lub testuję nowy pomysł", pts: "→ +1 dla one-page" },
                                    a2: { text: "Działam 2+ lata i chcę skalować", pts: "→ +1 dla multi-page" },
                                },
                            ].map((item, i) => (
                                <div key={i} className="glass-card p-5">
                                    <p className="font-bold text-white text-sm mb-3">{item.q}</p>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-white/60 text-xs mb-1">{item.a1.text}</p>
                                            <p className="text-gold text-xs font-bold">{item.a1.pts}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3">
                                            <p className="text-white/60 text-xs mb-1">{item.a2.text}</p>
                                            <p className="text-gold text-xs font-bold">{item.a2.pts}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                            <div className="glass-card p-5 border border-white/10">
                                <p className="text-gold font-bold mb-2">3–5 punktów dla one-page</p>
                                <p className="text-white/60 text-sm">Zacznij od prostego, szybkiego one-page. Skupisz się na konwersji, a nie na utrzymaniu rozbudowanego serwisu.</p>
                            </div>
                            <div className="glass-card p-5 border border-gold/30">
                                <p className="text-gold font-bold mb-2">3–5 punktów dla multi-page</p>
                                <p className="text-white/60 text-sm">Inwestycja w multi-page zwróci się przez ruch organiczny. Przy odpowiednim SEO to najlepszy długoterminowy kanał.</p>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Ceny WUYO */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Ile to kosztuje u mnie?</h2>
                        <p className="text-white/60 leading-relaxed mb-6">
                            Szczegółowy cennik masz na osobnej stronie, ale krótko:
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-white">Strona one-page</h3>
                                    <span className="text-gold font-bold">od 1 200 zł</span>
                                </div>
                                <ul className="space-y-2 text-white/60 text-sm">
                                    {[
                                        "Dedykowany projekt graficzny",
                                        "Next.js + szybkie ładowanie",
                                        "Responsywność (mobile first)",
                                        "Formularz kontaktowy",
                                        "Podstawowe SEO on-page",
                                        "Czas realizacji: 1–2 tygodnie",
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-card p-6 border border-gold/20">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-white">Strona multi-page</h3>
                                    <span className="text-gold font-bold">od 2 900 zł</span>
                                </div>
                                <ul className="space-y-2 text-white/60 text-sm">
                                    {[
                                        "Wszystko z one-page +",
                                        "Architektura URL pod SEO",
                                        "Podstrony usług z osobnym SEO",
                                        "Blog gotowy do publikacji",
                                        "Schema markup (JSON-LD)",
                                        "Czas realizacji: 3–5 tygodni",
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p className="text-white/40 text-sm mt-4 text-center">
                            Pełny cennik →{" "}
                            <Link href="/cennik" className="text-gold hover:underline">wuyo.pl/cennik</Link>
                        </p>
                    </AnimatedSection>

                    {/* Moja rekomendacja */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Moja szczera rekomendacja</h2>
                        <div className="prose-wuyo">
                            <p>
                                Jeśli jesteś małą firmą lub freelancerem z ograniczonym budżetem i dopiero startujesz — zacznij od one-page. Dobry one-page to lepsza inwestycja niż kiepski multi-page. Strona, która działa i konwertuje, jest warta więcej niż rozbudowany serwis, którego nikt nie znajdzie.
                            </p>
                            <p>
                                Ale jeśli Twoim planem jest organiczny ruch z Google, content marketing i skalowanie oferty — multi-page to nie wydatek. To infrastruktura biznesowa. Każdy artykuł na blogu, każda podstrona usługi pracuje dla Ciebie 24 godziny na dobę, 7 dni w tygodniu, bez kosztów reklamy.
                            </p>
                            <p>
                                Jedno czego <strong>nie rób</strong>: nie zamawiaj one-page z myślą "później to rozbuduję". Rozbudowanie one-page do multi-page to przepisanie strony od zera — płacisz dwa razy. Jeśli widzisz w tym kierunek — od razu zaplanuj multi-page.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* FAQ */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Najczęstsze pytania</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: "Strona one-page czy multi-page — co lepsze dla SEO?",
                                    a: "Multi-page wygrywa w SEO dla firm oferujących wiele usług. One-page można zoptymalizować pod 1–2 frazy, ale nie pozwoli na szeroki ruch organiczny. Jeśli Google to Twój główny kanał — wybierz multi-page.",
                                },
                                {
                                    q: "Kiedy strona one-page wystarczy?",
                                    a: "Gdy oferujesz jedną usługę, klienci przychodzą z polecenia lub social mediów, chcesz szybko zbudować prostą wizytówkę lub testujesz nowy pomysł. Dobry one-page dla fotografa, coacha czy konsultanta to często optymalne rozwiązanie.",
                                },
                                {
                                    q: "Czy można zacząć od one-page i rozbudować do multi-page?",
                                    a: "Technicznie tak, ale w praktyce to przepisanie strony od zera — inna architektura, inne URL-e, inny kod. Jeśli widzisz że pójdziesz w kierunku multi-page, zrób to od razu. Zaoszczędzisz czas i pieniądze.",
                                },
                                {
                                    q: "Czy one-page może być responsywna i szybka?",
                                    a: "Tak. Dobrze zbudowana one-page na Next.js ładuje się poniżej 1 sekundy i działa perfekcyjnie na telefonach. Szybkość zależy od technologii i jakości wykonania, nie od liczby podstron.",
                                },
                                {
                                    q: "Ile kosztuje strona one-page, a ile multi-page?",
                                    a: "U doświadczonego freelancera one-page od 1 200 zł, multi-page od 2 900 zł. Cena rośnie ze złożonością projektu i liczbą podstron.",
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
                            <Link href="/blog/ile-kosztuje-strona-internetowa" className="glass-card p-5 group block hover:border-gold/30 transition-colors">
                                <p className="text-xs text-white/40 mb-2">Strony WWW</p>
                                <p className="font-bold text-white group-hover:text-gold transition-colors text-sm leading-tight">Ile kosztuje strona internetowa dla firmy w 2026?</p>
                                <span className="inline-flex items-center gap-1 text-gold text-xs mt-3 group-hover:gap-2 transition-all">Czytaj <ArrowRight size={12} /></span>
                            </Link>
                            <Link href="/blog/ile-kosztuje-logo" className="glass-card p-5 group block hover:border-gold/30 transition-colors">
                                <p className="text-xs text-white/40 mb-2">Logo & Branding</p>
                                <p className="font-bold text-white group-hover:text-gold transition-colors text-sm leading-tight">Ile kosztuje logo w 2026? Uczciwy cennik projektanta</p>
                                <span className="inline-flex items-center gap-1 text-gold text-xs mt-3 group-hover:gap-2 transition-all">Czytaj <ArrowRight size={12} /></span>
                            </Link>
                        </div>
                    </AnimatedSection>

                    {/* CTA */}
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 text-center border border-gold/20">
                            <p className="eyebrow mb-4">Nie wiesz które wybrać?</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                Powiedz mi o swoim biznesie — odpiszę co wybrać
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
                                Bezpłatna konsultacja — opisz czym się zajmujesz, skąd przychodzą Twoi klienci i jaki masz budżet. Dostaniesz konkretną rekomendację, nie ofertę sprzedażową.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="/#kontakt" className="btn-gold px-8 py-3 rounded-full font-bold inline-block">
                                    Porozmawiajmy o Twojej stronie
                                </a>
                                <Link href="/strony-www" className="px-8 py-3 rounded-full font-bold inline-block border border-gold/40 text-gold hover:bg-gold/10 transition-colors">
                                    Zobacz ofertę stron
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>

                </div>
            </article>
        </main>
    );
}
