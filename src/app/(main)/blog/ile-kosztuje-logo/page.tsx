import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const metadata: Metadata = {
    title: "Ile kosztuje logo w 2026? Uczciwy cennik projektanta | WUYO",
    description: "Logotyp od 100 zł w Canva po 50 000 zł w agencji — skąd tak duże różnice? Tłumaczę co wpływa na cenę logo i ile naprawdę warto zapłacić za projekt dla swojej firmy.",
    openGraph: {
        title: "Ile kosztuje logo w 2026? Uczciwy cennik projektanta",
        description: "Tłumaczę skąd biorą się ceny logo i ile zapłacić, żeby nie przepłacić ani nie wziąć bubla.",
        images: ["/logo_wuya2.webp"],
        url: "https://wuyo.pl/blog/ile-kosztuje-logo",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Ile kosztuje logo w 2026?",
        description: "Uczciwy cennik projektanta — od 800 zł do 50 000 zł. Co kryje się za tą rozpiętością?",
        images: ["/logo_wuya2.webp"],
    },
    alternates: { canonical: "https://wuyo.pl/blog/ile-kosztuje-logo" },
};

const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Ile kosztuje logo w 2026? Uczciwy cennik projektanta",
    "description": "Tłumaczę skąd biorą się ceny logo i ile zapłacić za projekt logotypu dla swojej firmy.",
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
    "mainEntityOfPage": { "@type": "WebPage", "@id": "https://wuyo.pl/blog/ile-kosztuje-logo" },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Ile kosztuje logo dla małej firmy?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Logo dla małej firmy u doświadczonego freelancera kosztuje od 800 do 2 500 zł. Za tę kwotę dostaniesz unikalny projekt w wektorze z pełnymi prawami autorskimi i paczką plików produkcyjnych.",
            },
        },
        {
            "@type": "Question",
            "name": "Czy warto płacić więcej za logo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Tak, do pewnego progu. Logo za 800–2 500 zł od doświadczonego freelancera da Ci dokładnie to samo co logo za 8 000 zł z małej agencji — tylko bez kosztów biura i działu sprzedaży. Przepłacasz powyżej tej kwoty głównie za markę agencji, nie za jakość projektu.",
            },
        },
        {
            "@type": "Question",
            "name": "Dlaczego nie warto robić logo w Canva?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Logo z Canva nie jest unikalne — tysiące firm może używać tego samego szablonu. Nie dostaniesz też pliku wektorowego (AI/SVG/EPS) niezbędnego do druku wielkoformatowego. Prawa autorskie do elementów z Canva są ograniczone. Dla poważnej firmy to ryzyko prawne i wizerunkowe.",
            },
        },
        {
            "@type": "Question",
            "name": "Co wchodzi w skład projektu logo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Profesjonalny projekt logo powinien zawierać: plik wektorowy (AI, EPS, SVG), wersje PNG i JPG w różnych rozdzielczościach, warianty kolorystyczne (kolor, czarno-białe, negatyw), wersję poziomą i pionową oraz instrukcję stosowania. Pełna identyfikacja wizualna obejmuje dodatkowo paletę barw, typografię i przykłady zastosowań.",
            },
        },
        {
            "@type": "Question",
            "name": "Ile trwa projekt logo?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "U mnie projekt logo (wersja bazowa) trwa 5–10 dni roboczych od zebrania briefu. Pełna identyfikacja wizualna z księgą znaku — 3–4 tygodnie.",
            },
        },
    ],
};

export default function IleKosztujeLogoPage() {
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
                        <span className="eyebrow text-xs">Logo & Branding</span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-xs">27 marca 2026</span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-xs">7 min czytania</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ile kosztuje logo w 2026?<br />
                        <span className="bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent">
                            Uczciwy cennik projektanta.
                        </span>
                    </h1>
                    <p className="text-lg text-white/70 leading-relaxed">
                        Od 100 zł w Canva po 50 000 zł w dużej agencji — rozpiętość cen za logo jest ogromna.
                        Tłumaczę co tak naprawdę wpływa na cenę i ile powinieneś zapłacić za logo dla swojej firmy.
                    </p>
                </div>
            </section>

            {/* ═══ TREŚĆ ═══ */}
            <article className="px-6 pb-24">
                <div className="max-w-3xl mx-auto prose-custom">

                    {/* INTRO */}
                    <AnimatedSection>
                        <div className="glass-card p-8 mb-10 border-l-4 border-gold">
                            <p className="text-white/80 leading-relaxed text-base">
                                <strong className="text-white">Krótka odpowiedź:</strong> Logo dla małej lub średniej firmy od doświadczonego freelancera powinno kosztować <strong className="text-gold">800–2 500 zł</strong>. Mniej — ryzykujesz bublem. Więcej — w większości przypadków płacisz za markę agencji, nie za jakość projektu.
                            </p>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">Dlaczego ceny logo tak bardzo się różnią?</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Wpisujesz "projekt logo" w wyszukiwarkę i dostajesz oferty od 50 zł do 50 000 zł. To nie błąd — to rynek. Za tymi liczbami kryją się zupełnie różne produkty, choć na pierwszy rzut oka wyglądają tak samo.
                        </p>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Logo to jeden z niewielu produktów, gdzie cena nie zawsze idzie w parze z jakością. Możesz zapłacić 5 000 zł w małej agencji i dostać gorszy efekt niż za 1 200 zł u dobrego freelancera. I odwrotnie — 200 zł za logo to prawie pewny gwarant problemów w przyszłości.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Poniżej rozbieram rynek na czynniki pierwsze — bez owijania w bawełnę.
                        </p>
                    </AnimatedSection>

                    {/* TABELA CEN */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6">Ile kosztuje logo — przegląd rynku 2026</h2>

                        <div className="space-y-4 mb-8">
                            {[
                                {
                                    range: "50–300 zł",
                                    source: "Canva, szablony, platformy crowd",
                                    icon: "danger",
                                    pros: ["Szybko", "Tanio"],
                                    cons: ["Nie jesteś jedynym właścicielem projektu", "Brak pliku wektorowego", "Ryzyko prawne (prawa do elementów)", "Logo które widziałeś już gdzieś indziej"],
                                },
                                {
                                    range: "300–799 zł",
                                    source: "Początkujący graficy, studenci",
                                    icon: "warning",
                                    pros: ["Niski koszt", "Często dobra wola i zaangażowanie"],
                                    cons: ["Brak doświadczenia w strategii marki", "Ryzyko porzucenia projektu", "Często brak kompletu plików", "Poprawki mogą być chaotyczne"],
                                },
                                {
                                    range: "800–2 500 zł",
                                    source: "Doświadczony freelancer",
                                    icon: "good",
                                    pros: ["Unikalny projekt", "Pełen pakiet plików (AI, EPS, SVG, PNG, JPG)", "Prawa autorskie w cenie", "Brief + strategia marki", "Poprawki do skutku"],
                                    cons: ["Jedna osoba = jeden styl", "Dłuższy czas jeśli zajęty"],
                                },
                                {
                                    range: "2 500–8 000 zł",
                                    source: "Małe i średnie agencje",
                                    icon: "good",
                                    pros: ["Zespół specjalistów", "Szersze możliwości strategii", "Formalne umowy"],
                                    cons: ["Część budżetu idzie na koszty agencji", "Możliwe przerzucanie między grafikami", "Dłuższy proces decyzyjny"],
                                },
                                {
                                    range: "8 000–50 000+ zł",
                                    source: "Duże agencje brandingowe",
                                    icon: "premium",
                                    pros: ["Pełna strategia marki", "Research rynku i konkurencji", "Testy użytkowników"],
                                    cons: ["Dla większości MŚP zdecydowanie przerost formy nad treścią", "Budżet niedostępny dla startupów"],
                                },
                            ].map((tier, i) => (
                                <div key={i} className={`glass-card p-6 ${tier.icon === "good" || tier.icon === "premium" ? "border-gold/20" : tier.icon === "warning" ? "border-yellow-700/30" : "border-red-900/30"}`}>
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <span className="text-gold font-bold text-xl">{tier.range}</span>
                                            <p className="text-white/50 text-sm mt-1">{tier.source}</p>
                                        </div>
                                        {tier.icon === "danger" && <XCircle size={24} className="text-red-400 shrink-0" />}
                                        {tier.icon === "warning" && <AlertCircle size={24} className="text-yellow-400 shrink-0" />}
                                        {(tier.icon === "good" || tier.icon === "premium") && <CheckCircle2 size={24} className="text-gold shrink-0" />}
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

                    {/* CO WPŁYWA NA CENĘ */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">Co konkretnie wpływa na cenę logo?</h2>

                        <div className="space-y-6">
                            {[
                                {
                                    title: "1. Doświadczenie projektanta",
                                    text: "To najbardziej oczywisty czynnik. Grafik z 5 latami portfolio i setkami projektów wie czego unikać, rozumie strategie marki i potrafi bronić swoich decyzji projektowych. Początkujący może być utalentowany, ale brakuje mu kontekstu biznesowego.",
                                },
                                {
                                    title: "2. Zakres projektu",
                                    text: "Samo logo (sygnatura) to jedna rzecz. Ale czy potrzebujesz też wariantów kolorystycznych? Wersji do social mediów? Favicon? Pieczątki? Im szerszy zakres, tym wyższa cena — i słusznie.",
                                },
                                {
                                    title: "3. Czy wchodzi identyfikacja wizualna",
                                    text: "Logo to tylko jeden element systemu. Identyfikacja wizualna to logo + paleta kolorów + typografia + wzorzec graficzny + przykłady zastosowań (wizytówki, strona, social media). Za kompletny system tożsamości marki płacisz więcej — i to się zwraca.",
                                },
                                {
                                    title: "4. Przeniesienie praw autorskich",
                                    text: "Tania opcja często oznacza licencję, nie przeniesienie praw. To znaczy, że technicznie właścicielem logo nadal jest projektant. Sprawdź zawsze co jest w umowie. U mnie przeniesienie majątkowych praw autorskich jest standardem — wchodzi w cenę.",
                                },
                                {
                                    title: "5. Liczba rund poprawek",
                                    text: "Niektórzy projektanci liczą sobie za każdą zmianę. Inni — i ja należę do tej grupy — pracują do skutku. Pytaj o to zanim podpiszesz umowę.",
                                },
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
                        <div className="glass-card p-8 md:p-10 mt-12 mb-4 border-gold/30">
                            <p className="eyebrow mb-4">Ile u mnie?</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Konkretne ceny — bez ściemy</h2>
                            <div className="space-y-3 mb-8">
                                {[
                                    { name: "Logotyp (wersja bazowa)", price: "od 800 zł", desc: "Projekt, pliki produkcyjne, prawa autorskie" },
                                    { name: "Lifting istniejącego logo", price: "od 1 000 zł", desc: "Odświeżenie bez zmiany DNA marki" },
                                    { name: "Pełna identyfikacja wizualna", price: "od 2 500 zł", desc: "Logo + paleta + typografia + wzorzec + zastosowania" },
                                    { name: "Księga znaku", price: "od 1 200 zł", desc: "Dokumentacja systemu identyfikacji" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
                                        <div>
                                            <p className="font-medium text-white">{item.name}</p>
                                            <p className="text-white/50 text-sm">{item.desc}</p>
                                        </div>
                                        <span className="text-gold font-bold whitespace-nowrap">{item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-white/50 text-sm mb-6">
                                Wycena = cena końcowa. Kwota przed startem jest kwotą na fakturze — zero "dopłat za poprawki".
                            </p>
                            <Link
                                href="/cennik"
                                className="inline-flex items-center gap-2 text-gold font-bold hover:gap-3 transition-all"
                            >
                                Zobacz pełny cennik <ArrowRight size={16} />
                            </Link>
                        </div>
                    </AnimatedSection>

                    {/* NA CO UWAŻAĆ */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">Czerwone flagi — kiedy NIE zamawiać</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "Projektant nie pyta o Twoją firmę i konkurencję",
                                "Brak umowy lub pisemnych warunków",
                                "\"Nieograniczone poprawki\" bez żadnego procesu",
                                "Cena poniżej 300 zł za \"profesjonalne\" logo",
                                "Brak przykładów wcześniejszych prac",
                                "Nie ma informacji o prawach autorskich",
                                "Pokazuje tylko gotowe szablony",
                                "Nie dostaniesz pliku wektorowego (AI/EPS/SVG)",
                            ].map((flag, i) => (
                                <div key={i} className="flex items-start gap-3 bg-red-950/20 border border-red-900/20 rounded-xl p-4">
                                    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                                    <p className="text-white/70 text-sm leading-relaxed">{flag}</p>
                                </div>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* PODSUMOWANIE */}
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-5">Podsumowanie — ile zapłacić za logo?</h2>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Jeśli prowadzisz małą lub średnią firmę i szukasz logo które będzie służyć przez lata — celuj w przedział <strong className="text-gold">800–2 500 zł</strong> u sprawdzonego freelancera. Dostaniesz produkt w tym samym standardzie co agencja za 5 000 zł, zapłacisz połowę i będziesz rozmawiać bezpośrednio z osobą, która robi Twój projekt.
                        </p>
                        <p className="text-white/70 leading-relaxed mb-4">
                            Jeśli dopiero zaczynasz i budżet jest napięty — <strong className="text-white">800 zł to absolutne minimum</strong> dla czegoś sensownego. Poniżej tej kwoty ryzykujesz, że za rok będziesz robić logo od nowa.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Jeśli masz wątpliwości — napisz. Rzucę okiem na Twój brief i powiem wprost czy to projekt na 800 zł czy na 2 500 zł. Bez zobowiązań.
                        </p>
                    </AnimatedSection>

                    {/* CTA */}
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 mt-12 text-center border-gold/20">
                            <p className="eyebrow mb-3">Gotowy na projekt?</p>
                            <h3 className="text-2xl font-bold text-white mb-4">Zamów wycenę logo — odpiszę dziś</h3>
                            <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm">
                                Opisz w kilku zdaniach czym się zajmuje Twoja firma i dla kogo. Dostaniesz wycenę co do złotówki — bez niespodzianek.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/#kontakt"
                                    className="btn-gold px-10 py-4 inline-flex items-center gap-3 group shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_40px_rgba(255,235,82,0.6)]"
                                >
                                    <span className="font-bold text-navy text-lg">Wyślij zapytanie</span>
                                    <ArrowRight size={20} className="text-navy group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/logo" className="px-10 py-4 rounded-full font-bold inline-flex items-center gap-2 border border-gold/40 text-gold hover:bg-gold/10 transition-colors">
                                    Zobacz ofertę logo <ArrowRight size={18} />
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

                    {/* NAWIGACJA */}
                    <AnimatedSection>
                        <div className="flex items-center justify-between mt-14 pt-8 border-t border-white/8">
                            <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors text-sm">
                                <ArrowLeft size={16} /> Wróć do bloga
                            </Link>
                            <Link href="/logo" className="inline-flex items-center gap-2 text-gold font-medium hover:gap-3 transition-all text-sm">
                                Oferta projektowania logo <ArrowRight size={16} />
                            </Link>
                        </div>
                    </AnimatedSection>

                </div>
            </article>
        </main>
    );
}
