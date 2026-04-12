import Image from "next/image";
import Link from "next/link";
import { Check, Flame } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const packages = [
    {
        name: “Szybki start”,
        persona: “Wejście na rynek — dla firm stawiających pierwsze kroki w sieci”,
        price: “od 1 500 zł”,
        desc: “Szybka, solidna strona, która działa od pierwszego dnia. Idealna wizytówka dla małych firm i freelancerów, którzy chcą zaistnieć bez wstydu i kompromisów.”,
        image: “/tworzenie-stron-www-start-v3.png”,
        imageScale: “scale-100”,
        features: [
            “Landing page (1 strona) — kompletna wizytówka Twojej firmy w sieci.”,
            “Responsywny design — strona wygląda perfekcyjnie na telefonie, tablecie i komputerze.”,
            “Formularz kontaktowy — klienci piszą bezpośrednio do Ciebie z poziomu strony.”,
            “Integracja Google Maps — pokaż klientom, gdzie Cię znaleźć.”,
            “Podstawowe SEO — zadbam, żeby Google w ogóle Cię widział.”,
            “Czas realizacji: 5–7 dni roboczych.”,
        ],
        featured: false,
        cta: “Zacznij od startu”,
    },
    {
        name: “Najpopularniejszy”,
        persona: “Strona która sprzedaje — dla firm gotowych na poważną obecność w sieci”,
        price: “od 3 500 zł”,
        desc: “Strona zaprojektowana pod konwersję — przyciąga klientów, generuje zapytania i sprzedaje nawet gdy śpisz. Konkret bez przepłacania.”,
        image: “/tworzenie-stron-www-rozwoj-v3.png”,
        imageScale: “scale-100”,
        features: [
            “Do 5 podstron — miejsce na ofertę, blog, cennik i wszystko, czego potrzebujesz.”,
            “Custom design od zera — żadnych szablonów, które wyglądają jak tysiąc innych stron.”,
            “SEO on-page — optymalizacja treści, nagłówków i struktury pod Google.”,
            “Google Analytics — wiesz dokładnie, kto przychodzi i co klika.”,
            “Formularz kontaktowy z powiadomieniami na e-mail.”,
            “Blog (opcjonalnie) — gotowy system do publikowania artykułów.”,
            “Czas realizacji: 2–3 tygodnie.”,
        ],
        featured: true,
        cta: “Wybierz pakiet Profesjonalny”,
    },
    {
        name: “Zaawansowany”,
        persona: “Sklep który zarabia — dla firm sprzedających online 24/7”,
        price: “od 7 000 zł”,
        desc: “Kompletny sklep internetowy lub system rezerwacji. Pełna integracja płatności, panel zarządzania i szkolenie — wychodzisz z sesji i działasz samodzielnie.”,
        image: “/tworzenie-stron-www-kombajn-v3.png”,
        imageScale: “scale-100”,
        features: [
            “Sklep internetowy lub system rezerwacji — sprzedajesz 24/7, bez Twojego udziału.”,
            “Panel zarządzania — dodajesz produkty i obsługujesz zamówienia bez programisty.”,
            “Integracja płatności (Stripe / Przelewy24) — klienci płacą od razu.”,
            “SEO techniczne i on-page — sklep widoczny w Google od pierwszego dnia.”,
            “Szkolenie z obsługi panelu — wychodzisz i działasz samodzielnie.”,
            “Czas realizacji: 30–45 dni roboczych.”,
        ],
        featured: false,
        cta: “Otwórz sklep online”,
    },
];

export function PackagesSection({ showButton = true, className = "py-28 px-6 md:px-12" }: { showButton?: boolean; className?: string }) {
    return (
        <section id="pakiety" className={`relative ${className}`}>
            <AnimatedSection className="text-center mb-16 relative z-10">
                <p className="eyebrow mb-4">Pakiety stron internetowych</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Wybierz stronę, która pasuje do Twojego biznesu.</h2>
                <p className="text-white/60 max-w-xl mx-auto">Nie naciągam na funkcje, których nie potrzebujesz – dostajesz solidny kod i super szybką stronę 🙂</p>
            </AnimatedSection>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch relative z-10">
                {packages.map((pkg, i) => (
                    <AnimatedSection key={i} delay={i * 0.15}>
                        <div className={`${pkg.featured ? 'pricing-card-featured border-gold' : 'pricing-card border-white/10'} border bg-navy/50 backdrop-blur-md p-8 md:p-10 h-full flex flex-col relative overflow-hidden rounded-3xl group`}>
                            {/* Images Badge Effect */}
                            <div className="w-full relative aspect-[4/3] mb-8 group-hover:scale-105 transition-transform duration-500 rounded-xl overflow-hidden flex items-center justify-center">
                                <Image src={pkg.image} alt={pkg.name} fill className={`object-contain p-2 md:p-4 opacity-100 group-hover:opacity-100 transition-all drop-shadow-2xl ${pkg.imageScale || 'scale-100'}`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy/100 via-navy/5 to-transparent z-10 pointer-events-none" />
                            </div>

                            {pkg.featured && (
                                <div className="absolute top-4 right-4 bg-gold text-navy-dark text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider shadow-glow-gold z-20">
                                    Bestseller
                                </div>
                            )}

                            <div className="mb-3">
                                <span className="inline-block px-3 py-1 text-[11px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-black/50 bg-gold text-navy-dark border-[1.5px] border-gold/50">
                                    {pkg.name}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-3 mb-4">
                                <div className="text-3xl font-bold text-white">{pkg.price}</div>
                            </div>
                            <p className="text-white/60 text-sm leading-relaxed mb-4">{pkg.desc}</p>
                            {pkg.persona && (
                                <p className="text-xs text-gold/70 font-medium mb-8 flex items-center gap-1.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold/50" />
                                    {pkg.persona}
                                </p>
                            )}

                            <ul className="space-y-3 mb-10 flex-grow">
                                {pkg.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-white/70">
                                        <Check size={16} className="text-gold shrink-0 mt-0.5" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={`/?pakiet=${encodeURIComponent(pkg.name)}#kontakt`} className={`text-center block w-full py-4 rounded-full font-semibold text-sm transition-all ${pkg.featured
                                ? 'btn-gold !rounded-full !w-full'
                                : 'btn-outline !rounded-full !w-full'
                                }`}>
                                {pkg.cta}
                            </Link>
                        </div>
                    </AnimatedSection>
                ))}
            </div>

            {/* Zakotwiczenie cenowe */}
            <AnimatedSection className="mt-12 text-center max-w-2xl mx-auto">
                <div className="relative rounded-2xl border border-gold/20 bg-gold/5 backdrop-blur-sm px-6 py-5 md:px-8 md:py-6 overflow-hidden flex flex-col md:flex-row items-center justify-center gap-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10 pointer-events-none" />
                    <div className="bg-gold/10 p-3 rounded-full relative z-10 shrink-0">
                        <Flame className="text-gold animate-pulse" size={24} />
                    </div>
                    <p className="text-white/80 text-sm md:text-base relative z-10 text-center md:text-left">
                        Za analogiczny projekt agencja wystawia fakturę na{" "}
                        <span className="text-gold font-bold">8&nbsp;000–15&nbsp;000 zł</span>.<br className="hidden md:block" />
                        U&nbsp;Wuja dostajesz ten sam wynik w&nbsp;cenie, która nie boli.
                    </p>
                </div>
            </AnimatedSection>

            {showButton && (
                <AnimatedSection className="mt-10 text-center">
                    <Link href="/cennik" className="btn-gold px-12 py-5 inline-flex items-center gap-2 font-bold text-lg text-navy uppercase tracking-widest shadow-[0_0_30px_rgba(255,235,82,0.4)] hover:shadow-[0_0_50px_rgba(255,235,82,0.6)] transition-all rounded-full hover:scale-105 active:scale-95">
                        Zobacz pełny Cennik
                    </Link>
                </AnimatedSection>
            )}
        </section>
    );
}
