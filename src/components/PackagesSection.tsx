import Link from "next/link";
import { Tag } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

// Zachowane dla kompatybilności wstecznej — używane przez ContactBrief i inne strony
export const packages = [
    {
        name: "Szybki start",
        persona: "Wejście na rynek — dla firm stawiających pierwsze kroki w sieci",
        price: "od 1 500 zł",
        desc: "Szybka, solidna strona, która działa od pierwszego dnia.",
        image: "/tworzenie-stron-www-start-v3.png",
        imageScale: "scale-100",
        features: [
            "Landing page (1 strona) — kompletna wizytówka Twojej firmy w sieci.",
            "Responsywny design — strona wygląda perfekcyjnie na telefonie, tablecie i komputerze.",
            "Formularz kontaktowy — klienci piszą bezpośrednio do Ciebie z poziomu strony.",
            "Integracja Google Maps — pokaż klientom, gdzie Cię znaleźć.",
            "Podstawowe SEO — zadbam, żeby Google w ogóle Cię widział.",
            "Czas realizacji: 5–7 dni roboczych.",
        ],
        featured: false,
        cta: "Zacznij od startu",
    },
    {
        name: "Najpopularniejszy",
        persona: "Strona która sprzedaje — dla firm gotowych na poważną obecność w sieci",
        price: "od 3 500 zł",
        desc: "Strona zaprojektowana pod konwersję — przyciąga klientów, generuje zapytania i sprzedaje nawet gdy śpisz.",
        image: "/tworzenie-stron-www-rozwoj-v3.png",
        imageScale: "scale-100",
        features: [
            "Do 5 podstron — miejsce na ofertę, blog, cennik i wszystko, czego potrzebujesz.",
            "Custom design od zera — żadnych szablonów, które wyglądają jak tysiąc innych stron.",
            "SEO on-page — optymalizacja treści, nagłówków i struktury pod Google.",
            "Google Analytics — wiesz dokładnie, kto przychodzi i co klika.",
            "Formularz kontaktowy z powiadomieniami na e-mail.",
            "Blog (opcjonalnie) — gotowy system do publikowania artykułów.",
            "Czas realizacji: 2–3 tygodnie.",
        ],
        featured: true,
        cta: "Wybierz pakiet Profesjonalny",
    },
    {
        name: "Zaawansowany",
        persona: "Sklep który zarabia — dla firm sprzedających online 24/7",
        price: "od 7 000 zł",
        desc: "Kompletny sklep internetowy lub system rezerwacji.",
        image: "/tworzenie-stron-www-kombajn-v3.png",
        imageScale: "scale-100",
        features: [
            "Sklep internetowy lub system rezerwacji — sprzedajesz 24/7, bez Twojego udziału.",
            "Panel zarządzania — dodajesz produkty i obsługujesz zamówienia bez programisty.",
            "Integracja płatności (Stripe / Przelewy24) — klienci płacą od razu.",
            "SEO techniczne i on-page — sklep widoczny w Google od pierwszego dnia.",
            "Szkolenie z obsługi panelu — wychodzisz i działasz samodzielnie.",
            "Czas realizacji: 30–45 dni roboczych.",
        ],
        featured: false,
        cta: "Otwórz sklep online",
    },
];

const printProducts = [
    {
        name: "Wizytówki",
        note: "dwustronne, 300g błysk",
        variants: [
            { qty: "50 szt.", price: "99 zł" },
            { qty: "100 szt.", price: "159 zł" },
            { qty: "150 szt.", price: "199 zł" },
        ],
    },
    {
        name: "Ulotki A5",
        note: "dwustronne, pełny kolor",
        variants: [
            { qty: "50 szt.", price: "119 zł" },
            { qty: "100 szt.", price: "189 zł" },
            { qty: "150 szt.", price: "239 zł" },
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
        name: "Papier firmowy A4",
        note: "",
        variants: [
            { qty: "50 szt.", price: "79 zł" },
            { qty: "100 szt.", price: "139 zł" },
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

export function PackagesSection({ showButton = true, className = "py-28 px-6 md:px-12" }: { showButton?: boolean; className?: string }) {
    return (
        <section id="pakiety" className={`relative ${className}`}>
            {/* Nagłówek */}
            <AnimatedSection className="text-center mb-10 relative z-10">
                <p className="eyebrow mb-4">Druk &amp; Papeteria</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Projekt + druk. Wszystko w jednym miejscu.
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                    Nie musisz szukać drukarni, tłumaczyć wizji i modlić się żeby wyszło.
                    Projektuję, drukuję, dostarczam — Ty dostajesz gotowy produkt.
                </p>
            </AnimatedSection>

            {/* Baner rabatowy */}
            <AnimatedSection delay={0.1} className="max-w-4xl mx-auto mb-10 relative z-10">
                <div className="bg-[#ffeb52] text-[#1c1b17] rounded-2xl p-5 flex items-start gap-4">
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

            {/* Siatka produktów */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-7xl mx-auto relative z-10">
                {printProducts.map((product, i) => (
                    <AnimatedSection key={product.name} delay={0.05 * i}>
                        <div className="bg-navy/50 border border-white/10 rounded-2xl p-6 h-full">
                            <h3 className="font-bold text-white text-lg mb-1">{product.name}</h3>
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

            {/* CTA */}
            {showButton && (
                <AnimatedSection delay={0.3} className="mt-12 text-center relative z-10">
                    <p className="text-white/60 max-w-2xl mx-auto mb-6 text-sm md:text-base">
                        Nie wiesz co wybrać? Napisz — w 24h dostajesz konkretny zestaw dopasowany do Twojej firmy i budżetu.
                    </p>
                    <Link href="/#kontakt" className="btn-gold px-10 py-4 inline-flex items-center gap-2 font-bold rounded-full">
                        Napisz do mnie
                    </Link>
                </AnimatedSection>
            )}
        </section>
    );
}
