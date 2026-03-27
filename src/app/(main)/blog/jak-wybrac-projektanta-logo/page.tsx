import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "Jak wybrać projektanta logo? 8 pytań zanim zapłacisz | WUYO",
    description: "Jak wybrać projektanta logo żeby nie żałować? Pokazuję 8 pytań które musisz zadać, czerwone flagi których szukać i jak odróżnić dobrego projektanta od grafika z Canvy.",
    openGraph: {
        title: "Jak wybrać projektanta logo? 8 pytań zanim zapłacisz",
        description: "8 pytań które musisz zadać każdemu projektantowi logo zanim zapłacisz. Czerwone flagi i zielone sygnały — konkretnie.",
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/blog/jak-wybrac-projektanta-logo",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Jak wybrać projektanta logo? 8 pytań zanim zapłacisz",
        description: "Jak odróżnić dobrego projektanta od grafika z Canvy — konkretna checklista.",
        images: ["/logo_wuya2.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/blog/jak-wybrac-projektanta-logo" },
};

const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Jak wybrać projektanta logo? 8 pytań zanim zapłacisz",
    "description": "8 pytań które musisz zadać każdemu projektantowi logo — czerwone flagi i zielone sygnały.",
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
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://wuyo.pl/blog/jak-wybrac-projektanta-logo" },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Jak wybrać projektanta logo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sprawdź portfolio pod kątem różnorodności i jakości (nie tylko estetyki), zapytaj o proces (brief → moodboard → projekt → poprawki), upewnij się że dostajesz pliki wektorowe SVG/AI i informacje o kolorach CMYK, zweryfikuj czy projektant pyta o Twój biznes — nie tylko o gust. Unikaj osób które zaczynają od pokazania gotowych propozycji bez rozmowy.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile poprawek powinien oferować projektant logo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Standard to 2–3 rundy poprawek po wyborze kierunku. \"Nieograniczone poprawki\" to zwykle sygnał ostrzegawczy — albo kłamstwo, albo projektant nie ma ustalonego procesu. Dobry projektant robi dobry brief i trafia w oczekiwania w 1–2 rundach.",
            },
        },
        {
            "@type": "Question",
            "name": "Jakie pliki powinienem dostać za logo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Minimum: SVG (skalowalny wektorowy, do wszystkiego), PNG z przezroczystym tłem (web, social media), PDF (druk). Dobrze jeśli dostajesz też AI lub Figma (pliki źródłowe) i wersje: kolorowa, czarna, biała, na ciemne tło.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy mogę zlecić logo na Fiverrze lub przez ogłoszenie?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Możesz — ale ryzyko jest wysokie. Fiverr to loteria: trafiają się dobre projekty, ale większość to gotowe szablony lub prace bez procesu projektowego. Brak briefu = brak strategii = logo które wygląda jak tysiące innych. Jeśli zależy Ci na unikalności i funkcjonalności — szukaj projektanta z portfolio i procesem.",
            },
        },
        {
            "@type": "Question",
            "name": "Freelancer czy agencja — kto lepiej zaprojektuje logo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dla małej i średniej firmy doświadczony freelancer często daje lepszy wynik przy niższej cenie. Agencja dolicza overhead (biuro, obsługa klienta, marża) który nie przekłada się na jakość projektu. Kluczowe jest portfolio i proces — nie to czy to firma czy freelancer.",
            },
        },
    ],
};

const questions = [
    {
        n: "01",
        q: "Czy mogę zobaczyć Twoje portfolio z podobnych branż?",
        why: "Portfolio mówi wszystko. Nie szukaj \"ładnych\" prac — szukaj różnorodności i funkcjonalności. Czy logo wygląda dobrze małe? Czy działa czarno-białe? Czy widać że projektant rozumie kontekst biznesowy?",
        green: "Portfolio z case studies — tłumaczy decyzje projektowe, nie tylko pokazuje efekty",
        red: "Tylko mockupy na ładnych tłach, brak różnorodności branżowej",
    },
    {
        n: "02",
        q: "Jak wygląda Twój proces — od briefu do gotowego logo?",
        why: "Proces to sygnał profesjonalizmu. Dobry projektant ma ustalony workflow: brief → research → moodboard → projekt → poprawki → wdrożenie. Brak procesu = chaos = niezadowolenie po obu stronach.",
        green: "Opisuje kolejne etapy, mówi o briefie i moodboardzie przed pierwszym projektem",
        red: "\"Pokażę Ci kilka propozycji i wybierzesz\" — bez rozmowy o firmie i celach",
    },
    {
        n: "03",
        q: "Jakie pytania zadasz mi o moją firmę zanim zaczniesz?",
        why: "Logo to tłumaczenie strategii na grafikę. Projektant który nie pyta o Twoich klientów, konkurencję i pozycjonowanie — nie projektuje, tylko rysuje. Może ładnie, ale bez sensu.",
        green: "Pyta o grupę docelową, konkurencję, wartości marki, planowane nośniki",
        red: "Pyta tylko o ulubione kolory i \"styl\" — nie interesuje go kontekst",
    },
    {
        n: "04",
        q: "Co dostaję w pakiecie plików?",
        why: "To pytanie eliminuje 80% amatorów. Profesjonalny projektant dostarcza pełny pakiet bez pytania. Jeśli wahają się lub \"muszą sprawdzić\" — zły znak.",
        green: "SVG, PNG (przezroczyste tło), PDF, AI/Figma — kilka wariantów kolorystycznych",
        red: "\"Wyślę PNG\" — to jedyne co wspominają. Brak plików źródłowych.",
    },
    {
        n: "05",
        q: "Ile rund poprawek jest wliczonych w cenę?",
        why: "Standard rynkowy to 2–3 rundy. \"Nieograniczone poprawki\" brzmią świetnie — i są albo kłamstwem, albo sygnałem że projektant nie ma procesu (który minimalizuje potrzebę poprawek).",
        green: "2–3 rundy poprawek z jasnym opisem co jest poprawką, a co nowym zakresem",
        red: "\"Nieograniczone poprawki\" bez definicji co to znaczy",
    },
    {
        n: "06",
        q: "Czy dostarczysz kolory w CMYK i Pantone?",
        why: "To pytanie o druk. Jeśli kiedykolwiek zamówisz wizytówki, ulotki lub szyld — potrzebujesz kolorów w CMYK. Projektant który tego nie dostarcza nie myśli o realnym użyciu logo.",
        green: "Dostarcza HEX (ekrany) + CMYK (druk) + opcjonalnie RGB i Pantone",
        red: "\"Masz HEX, reszta to nie moja sprawa\" — zostawiają Cię bez narzędzi",
    },
    {
        n: "07",
        q: "Czy projekt jest unikalny — czy używasz szablonów?",
        why: "Pytanie niekomfortowe — i dlatego warto je zadać. Część projektantów pracuje na gotowych szablonach z platform typu Creative Market i jedynie je edytuje. To nie jest problem jeśli cena to odzwierciedla — problem gdy płacisz za \"custom design\".",
        green: "Projektuje od zera, ma szkice/wektory z etapu koncepcji",
        red: "Unika odpowiedzi, mówi że \"opiera się na inspiracjach\" — bez konkretu",
    },
    {
        n: "08",
        q: "Czy mam pełne prawa autorskie do gotowego logo?",
        why: "Standardem jest przeniesienie autorskich praw majątkowych na klienta po zapłacie. Bez tego możesz dostać rachunek za każde użycie — lub skończyć z logo którego prawnie nie możesz używać.",
        green: "Przeniesienie praw autorskich majątkowych ujęte w umowie lub fakturze",
        red: "\"To standardowe logo, mam licencję\" — niejasne sformułowania, brak umowy",
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
                            <span className="text-white/40 text-xs">7 min czytania</span>
                            <span className="text-white/20">·</span>
                            <span className="text-white/40 text-xs">27 marca 2026</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
                            Jak wybrać projektanta logo?<br />
                            <span className="text-gold">8 pytań zanim zapłacisz</span>
                        </h1>
                        <p className="text-lg text-white/60 leading-relaxed">
                            Rynek projektantów logo pełen jest ludzi z Canvą i gotowymi szablonami. Podaję Ci konkretną checklistę — 8 pytań, które w 10 minut pokażą czy masz do czynienia z profesjonalistą czy z amatorem.
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
                                Szukasz projektanta logo. Wchodzisz na OLX, Oferteo, Fiverr — albo dostajesz rekomendację od znajomego. Widzisz ceny od 200 zł do 5 000 zł za ten sam "projekt logo". Skąd taka rozpiętość? I jak wybrać tak żeby nie żałować?
                            </p>
                            <p>
                                Pracuję w branży od lat. Widziałem co klienci dostają od tanich wykonawców — i wielokrotnie przeprojektowywałem logo "bo poprzedni zrobił coś co wygląda ładnie ale działa na każdym nośniku inaczej". Napiszę Ci wprost jak wybrać dobrze.
                            </p>
                            <p>
                                Poniżej 8 pytań które możesz zadać każdemu projektantowi. Odpowiedzi pokażą Ci więcej niż portfolio.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Zanim zaczniesz szukać */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Zanim zaczniesz szukać — określ co potrzebujesz</h2>
                        <div className="prose-wuyo">
                            <p>
                                Projektant logo to nie to samo co grafik komputerowy czy osoba "która robi fajne rzeczy w Photoshopie". Projektowanie logo to proces strategiczny, nie tylko estetyczny.
                            </p>
                            <p>
                                Zanim odpiszesz na pierwsze ogłoszenie, odpowiedz sobie na te pytania:
                            </p>
                        </div>
                        <div className="glass-card p-6 mt-4 grid sm:grid-cols-2 gap-4">
                            {[
                                "Gdzie będzie używane logo? (druk, web, szyld, aplikacja?)",
                                "Jaki masz budżet i termin?",
                                "Czy potrzebujesz tylko logo czy pełnej identyfikacji?",
                                "Masz przykłady logo które lubisz i których nie lubisz?",
                                "Co chcesz żeby logo komunikowało klientowi?",
                                "Kto jest Twoją konkurencją i jak ona wygląda?",
                            ].map((q, i) => (
                                <div key={i} className="flex items-start gap-2 text-white/60 text-sm">
                                    <span className="text-gold font-bold shrink-0">→</span>
                                    {q}
                                </div>
                            ))}
                        </div>
                        <p className="text-white/40 text-sm mt-3">
                            Dobry projektant zapyta Cię o to wszystko. Jeśli tego nie robi — to sygnał.
                        </p>
                    </AnimatedSection>

                    {/* 8 pytań */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">8 pytań które musisz zadać</h2>
                        <div className="space-y-6">
                            {questions.map((item) => (
                                <div key={item.n} className="glass-card p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <span className="text-gold font-bold text-2xl leading-none shrink-0 opacity-40">{item.n}</span>
                                        <h3 className="font-bold text-white text-lg leading-snug">{item.q}</h3>
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed mb-5">{item.why}</p>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3 flex items-start gap-2">
                                            <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
                                            <p className="text-green-300/80 text-xs leading-relaxed">{item.green}</p>
                                        </div>
                                        <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 flex items-start gap-2">
                                            <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                            <p className="text-red-300/70 text-xs leading-relaxed">{item.red}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Gdzie szukać */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Gdzie szukać projektanta logo?</h2>
                        <div className="prose-wuyo mb-6">
                            <p>
                                Różne kanały dają różne jakości — i różne ryzyko. Przegląd bez owijania w bawełnę:
                            </p>
                        </div>
                        <div className="space-y-3">
                            {[
                                {
                                    source: "Polecenie od zaufanej osoby",
                                    rating: 5,
                                    desc: "Najlepsza metoda. Ktoś już sprawdził projektanta za Ciebie — wiesz czego oczekiwać.",
                                    risk: "Niskie",
                                },
                                {
                                    source: "Portfolio na Behance / Dribbble",
                                    rating: 4,
                                    desc: "Możesz ocenić faktyczną jakość pracy. Szukaj projektantów z opisami procesu, nie tylko efektami.",
                                    risk: "Niskie–Średnie",
                                },
                                {
                                    source: "LinkedIn",
                                    rating: 4,
                                    desc: "Dobrzy freelancerzy są aktywni na LinkedIn. Możesz sprawdzić historię, rekomendacje i portfolio.",
                                    risk: "Niskie–Średnie",
                                },
                                {
                                    source: "Oferteo / Useme",
                                    rating: 3,
                                    desc: "Duża rozpiętość jakości. Opieraj się na ocenach + portfolio, nie tylko na cenie. Zawsze proś o rozmowę przed zleceniem.",
                                    risk: "Średnie",
                                },
                                {
                                    source: "OLX / lokalne ogłoszenia",
                                    rating: 2,
                                    desc: "Loteria. Zdarzają się dobre projekty, ale bez weryfikacji jakości — szansa na trafienie na amatora wysoka.",
                                    risk: "Wysokie",
                                },
                                {
                                    source: "Fiverr (gig po 50 zł)",
                                    rating: 1,
                                    desc: "W tej cenie dostajesz edytowany szablon lub pracę wykonaną przez AI. Unikalność i prawa autorskie — wątpliwe.",
                                    risk: "Bardzo wysokie",
                                },
                            ].map((item, i) => (
                                <div key={i} className="glass-card p-4 flex items-start gap-4">
                                    <div className="shrink-0 flex gap-0.5 pt-0.5">
                                        {Array.from({ length: 5 }).map((_, si) => (
                                            <div key={si} className={`w-2 h-2 rounded-full ${si < item.rating ? "bg-gold" : "bg-white/10"}`} />
                                        ))}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-white text-sm">{item.source}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                item.risk === "Niskie" ? "bg-green-500/10 text-green-400" :
                                                item.risk === "Niskie–Średnie" ? "bg-green-500/10 text-green-400/70" :
                                                item.risk === "Średnie" ? "bg-yellow-500/10 text-yellow-400" :
                                                item.risk === "Wysokie" ? "bg-red-500/10 text-red-400" :
                                                "bg-red-500/15 text-red-400"
                                            }`}>ryzyko: {item.risk}</span>
                                        </div>
                                        <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Freelancer vs agencja */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-4">Freelancer czy agencja?</h2>
                        <div className="prose-wuyo mb-6">
                            <p>
                                To pytanie zadają prawie wszyscy. Odpowiedź jest prostsza niż myślisz: dla małej i średniej firmy doświadczony freelancer często daje <strong>lepszy wynik przy niższej cenie</strong>.
                            </p>
                        </div>
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left p-4 text-white/40 font-medium">Kryterium</th>
                                            <th className="text-center p-4 text-gold font-bold">Freelancer</th>
                                            <th className="text-center p-4 text-white/60 font-bold">Agencja</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { c: "Cena za to samo logo", a: "800–3 000 zł", b: "3 000–15 000 zł" },
                                            { c: "Kto projektuje?", a: "Ta sama osoba z którą rozmawiasz", b: "Junior po briefie od account managera" },
                                            { c: "Czas realizacji", a: "Szybszy (mniej biurokracji)", b: "Wolniejszy (procesy wewnętrzne)" },
                                            { c: "Komunikacja", a: "Bezpośrednia, elastyczna", b: "Przez account managera" },
                                            { c: "Ryzyko", a: "Sprawdź portfolio i opinie", b: "Marka chroni, ale nie gwarantuje jakości" },
                                            { c: "Dla kogo?", a: "MŚP, startupy, freelancerzy", b: "Duże firmy z budżetem i potrzebą \"mamy agencję\"" },
                                        ].map((row, i) => (
                                            <tr key={i}>
                                                <td className="p-4 text-white/60">{row.c}</td>
                                                <td className="p-4 text-center text-green-400 font-medium text-xs">{row.a}</td>
                                                <td className="p-4 text-center text-white/50 text-xs">{row.b}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="glass-card p-5 mt-4 border-l-2 border-gold">
                            <p className="text-white/70 text-sm">
                                <strong className="text-gold">Moja obserwacja:</strong> W agencji płacisz za biuro, account managera, spotkania statusowe i markę. Projekt i tak trafi do juniora. U freelancera z portfolio — projekt robi ta sama osoba, z którą podpisujesz umowę.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Checklista finalna */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Gotowa checklista — zanim podpiszesz umowę</h2>
                        <div className="glass-card p-6">
                            <div className="space-y-3">
                                {[
                                    "Portfolio z różnymi branżami — nie tylko jeden styl",
                                    "Opisany proces (brief → moodboard → projekt → poprawki)",
                                    "Pytania o Twój biznes zanim pokaże cokolwiek",
                                    "Pakiet plików: SVG, PNG, PDF + pliki źródłowe",
                                    "Kolory w HEX i CMYK",
                                    "Wersja monochromatyczna (czarna + biała) w zakresie",
                                    "Jasna liczba rund poprawek",
                                    "Przeniesienie praw autorskich majątkowych",
                                    "Umowa lub zlecenie pisemne",
                                    "Referencje lub opinie od poprzednich klientów",
                                ].map((item, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-5 h-5 rounded border border-white/20 group-hover:border-gold/50 transition-colors shrink-0 flex items-center justify-center">
                                            <CheckCircle2 size={12} className="text-gold opacity-0 group-hover:opacity-30 transition-opacity" />
                                        </div>
                                        <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-start gap-3 mt-4 glass-card p-4">
                            <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                            <p className="text-white/60 text-sm">
                                Jeśli którakolwiek z powyższych rzeczy budzi wątpliwości lub dostaje odpowiedź wymijającą — to sygnał żeby szukać dalej. Dobry projektant odpowie na każde z tych pytań bez wahania.
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* FAQ */}
                    <AnimatedSection>
                        <h2 className="text-2xl font-bold text-white mb-6">Najczęstsze pytania</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: "Ile poprawek powinien oferować projektant logo?",
                                    a: "Standard to 2–3 rundy poprawek po wyborze kierunku. \"Nieograniczone poprawki\" to sygnał ostrzegawczy — albo kłamstwo, albo projektant nie ma procesu. Dobry projektant robi dobry brief i trafia w oczekiwania bez nieskończonych iteracji.",
                                },
                                {
                                    q: "Jakie pliki powinienem dostać za logo?",
                                    a: "Minimum: SVG (wektorowy, skalowalny do każdego rozmiaru), PNG z przezroczystym tłem (web, social media), PDF (druk). Dobrze gdy dostajesz też AI lub Figma oraz wersje: kolorowa, czarna, biała, na ciemne tło.",
                                },
                                {
                                    q: "Czy mogę zlecić logo na Fiverrze?",
                                    a: "Możesz — ale ryzyko jest wysokie. Za 50–200 zł dostajesz edytowany szablon lub pracę AI, nie custom design. Bez briefu, bez procesu, bez gwarancji unikalności i praw autorskich.",
                                },
                                {
                                    q: "Freelancer czy agencja — kto lepiej zaprojektuje logo?",
                                    a: "Dla MŚP doświadczony freelancer często daje lepszy wynik przy niższej cenie. W agencji płacisz za overhead — biuro, account managera, procesy. Projekt i tak robi grafik. Kluczowe: portfolio i proces — nie to czy to firma czy freelancer.",
                                },
                                {
                                    q: "Jak sprawdzić czy projektant ma dobre referencje?",
                                    a: "Poproś o kontakt do 1–2 poprzednich klientów lub poszukaj opinii na Google/LinkedIn. Sprawdź czy portfolio ma prawdziwe realizacje (istniejące firmy), nie tylko konceptualne projekty. Behance i Dribbble to dobre miejsca do weryfikacji.",
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
                            <Link href="/blog/identyfikacja-wizualna-firmy" className="glass-card p-5 group block hover:border-gold/30 transition-colors">
                                <p className="text-xs text-white/40 mb-2">Logo & Branding</p>
                                <p className="font-bold text-white group-hover:text-gold transition-colors text-sm leading-tight">Identyfikacja wizualna firmy — czym jest i ile kosztuje?</p>
                                <span className="inline-flex items-center gap-1 text-gold text-xs mt-3 group-hover:gap-2 transition-all">Czytaj <ArrowRight size={12} /></span>
                            </Link>
                        </div>
                    </AnimatedSection>

                    {/* CTA */}
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 text-center border border-gold/20">
                            <p className="eyebrow mb-4">Szukasz projektanta który spełni wszystkie 8 punktów?</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                Zacznijmy od briefu — bez zobowiązań
                            </h2>
                            <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
                                Mam portfolio, ustalony proces, dostarczam pełen pakiet plików z CMYK, piszę umowę i przenoszę prawa autorskie. Napisz — opowiedz o swojej firmie i dostaniesz wycenę w 24h.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="/#kontakt" className="btn-gold px-8 py-3 rounded-full font-bold inline-block">
                                    Zamów logo z gwarancją jakości
                                </a>
                                <Link href="/logo" className="px-8 py-3 rounded-full font-bold inline-block border border-gold/40 text-gold hover:bg-gold/10 transition-colors">
                                    Zobacz ofertę logo
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>

                </div>
            </article>
        </main>
    );
}
