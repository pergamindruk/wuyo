import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const packages = [
    {
        name: "Lokalny Start",
        price: "1 200 zł",
        desc: "Precyzyjne uderzenie. Solidna strona-wizytówka, która buduje zaufanie od pierwszego wejrzenia. Idealny start, by zaistnieć w sieci bez wstydu i kompromisów.",
        image: "/tworzenie-stron-www-start-v2.webp",
        imageScale: "scale-100",
        features: [
            "Projekt od zera – nie używam gotowych szablonów, które wyglądają jak tysiąc innych stron.",
            "Szybkość, która nie irytuje – strona ładuje się natychmiast, więc nikt nie ucieknie do konkurencji.",
            "Google Cię polubi – ustawiam podstawy tak, żebyś nie był niewidzialny w wyszukiwarce.",
            "Śmiga na telefonach – bo umówmy się, większość Twoich klientów szuka Cię teraz na smartfonie.",
            "Prosty kontakt – intuicyjny formularz i podpięte statystyki (żebyś wiedział, czy to działa).",
        ],
        featured: false,
    },
    {
        name: "Rozwój",
        price: "2 900 zł",
        desc: "Twoje centrum dowodzenia w sieci. Projektuję pod konwersję, optymalizuję pod Google i daję Ci konkretne narzędzia, byś mógł realnie skalować swoją ofertę.",
        image: "/tworzenie-stron-www-rozwoj-v2.webp",
        imageScale: "scale-100",
        features: [
            "Strona główna + 5 podstron – masz miejsce na ofertę, cennik i opis tego, co robisz.",
            "Projekt pod leady – układam treść tak, żeby ludzie zostawiali do siebie kontakt, a nie tylko oglądali obrazki.",
            "Czysty i bezpieczny kod – nie instaluję śmieciowych wtyczek, które spowalniają stronę i psują pozycję w Google.",
            "Pełna analityka – zobaczysz czarno na białym, kto do Ciebie zagląda i w co klika.",
            "Miesiąc wsparcia w cenie – nie zostawiam Cię z tym samego. Przez pierwsze 30 dni pilnuję, żeby wszystko grało.",
        ],
        featured: true,
    },
    {
        name: "Kombajn",
        price: "4 500 zł",
        desc: "Standard bez kompromisów. Składam Twój wizerunek od fundamentów po najbardziej zaawansowane detale. To propozycja dla graczy, którzy wymagają pełnego wsparcia i klasy światowej.",
        image: "/tworzenie-stron-www-kombajn-v2.webp",
        imageScale: "scale-100",
        features: [
            "Kompletny wizerunek – robię logo, dobieram kolory i czcionki. Wszystko spójne i profesjonalne.",
            "Strona „z wyższej półki” – zaawansowany projekt, który od razu buduje zaufanie u dużych klientów.",
            "Maksymalna wydajność – wyciskam ze strony tyle, ile się da, żeby była najszybsza w Twojej branży.",
            "Pakiet grafik na start – dostajesz gotowce na FB i Instagram, żebyś mógł od razu odpalić reklamę i zacząć zarabiać.",
            "Priorytet w kontakcie – Twoje sprawy lądują na górze mojej listy. Masz u mnie status VIP.",
        ],
        featured: false,
    },
];

export function PackagesSection({ showButton = true, className = "py-28 px-6 md:px-12" }: { showButton?: boolean; className?: string }) {
    return (
        <section id="pakiety" className={`relative ${className}`}>
            <AnimatedSection className="text-center mb-16 relative z-10">
                <p className="eyebrow mb-4">Proste zasady, jasne ceny.</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Wybierz pakiet, który pasuje do tego, co teraz robisz.</h2>
                <p className="text-white/50 max-w-xl mx-auto">Nie naciągam na funkcje, których nie potrzebujesz – dostajesz solidny kod i super szybką stronę 🙂</p>
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
                            <p className="text-white/50 text-sm leading-relaxed mb-8">{pkg.desc}</p>

                            <ul className="space-y-3 mb-10 flex-grow">
                                {pkg.features.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-white/70">
                                        <Check size={16} className="text-gold shrink-0 mt-0.5" />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="#kontakt" className={`text-center block w-full py-4 rounded-full font-semibold text-sm transition-all ${pkg.featured
                                ? 'btn-gold !rounded-full !w-full'
                                : 'btn-outline !rounded-full !w-full'
                                }`}>
                                Wchodzę w to
                            </Link>
                        </div>
                    </AnimatedSection>
                ))}
            </div>

            {showButton && (
                <AnimatedSection className="mt-16 text-center">
                    <Link href="/cennik" className="btn-gold px-12 py-5 inline-flex items-center gap-2 font-bold text-lg text-navy uppercase tracking-widest shadow-[0_0_30px_rgba(255,235,82,0.4)] hover:shadow-[0_0_50px_rgba(255,235,82,0.6)] transition-all rounded-full hover:scale-105 active:scale-95">
                        Zobacz pełny Cennik
                    </Link>
                </AnimatedSection>
            )}
        </section>
    );
}
