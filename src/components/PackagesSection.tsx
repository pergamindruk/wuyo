import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

export const packages = [
    {
        name: "Start",
        price: "1 200 zł",
        oldPrice: "1 800 zł",
        desc: "Szybkie, skuteczne i nowoczesne wejście do sieci. Idealne na start, żeby pokazać się z najlepszej strony.",
        image: "/tworzenie-stron-www-start.png",
        imageScale: "scale-100",
        features: [
            "Indywidualny projekt (Zero szablonów!)",
            "Błyskawiczne działanie (Next.js / React)",
            "Podstawowa optymalizacja pod Google (SEO)",
            "Zupełna responsywność (Wygląda super na telefonie)",
            "Formularz kontaktowy i spięcie analityki",
        ],
        featured: false,
    },
    {
        name: "Rozwój",
        price: "2 900 zł",
        oldPrice: "3 800 zł",
        desc: "Rozbudowana witryna, która buduje zaufanie i pracuje dla Ciebie 24/7 jako wirtualny handlowiec.",
        image: "/tworzenie-stron-www-rozwoj.png",
        imageScale: "scale-100",
        features: [
            "Strona główna + do 5 podstron (np. Oferta, O nas, Cennik)",
            "Zaprojektowana pod sprzedaż i zbieranie leadów",
            "Szybki, bezpieczny kod dbający o pozycję w wyszukiwarce",
            "Podpięcie Analityki (Zobacz kto i kiedy wchodzi)",
            "Miesiąc darmowej opieki technicznej na start",
        ],
        featured: true,
    },
    {
        name: "Kombajn",
        price: "4 500 zł",
        oldPrice: "5 900 zł",
        desc: "Pełna transformacja. Tworzę Twoją nową markę wizualną i wypuszczam w świat z potężną stroną WWW.",
        image: "/tworzenie-stron-www-kombajn.png",
        imageScale: "scale-100",
        features: [
            "Projekt spójnego wizerunku (Logo, księga znaku, kolory)",
            "Zaawansowana strona pod proces sprzedaży i wizerunek",
            "Maksymalna wydajność i szybkość wczytywania",
            "Paka 5-ciu grafik na start by odpalić kampanię (FB/IG)",
            "Pierwszeństwo wsparcia (Priorytet VIP w kontakcie)",
        ],
        featured: false,
    },
];

export function PackagesSection({ showButton = true, className = "py-28 px-6 md:px-12" }: { showButton?: boolean; className?: string }) {
    return (
        <section id="pakiety" className={`relative ${className}`}>
            <AnimatedSection className="text-center mb-16 relative z-10">
                <p className="eyebrow mb-4">Jasne zasady gry</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Inwestycja w rozwój w sieci</h2>
                <p className="text-white/50 max-w-xl mx-auto">Wybierz pakiet dopasowany do Twojego biznesu. Bez mydlenia oczu i ukrytych kosztów, za to z nowoczesną technologią, która naprawdę sprzedaje.</p>
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
                                {pkg.oldPrice && (
                                    <div className="text-lg text-white/40 line-through decoration-red-500/50 decoration-2">
                                        {pkg.oldPrice}
                                    </div>
                                )}
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

                            <button className={`w-full py-4 rounded-full font-semibold text-sm transition-all ${pkg.featured
                                ? 'btn-gold !rounded-full !w-full'
                                : 'btn-outline !rounded-full !w-full'
                                }`}>
                                Wchodzę w to
                            </button>
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
