import Image from "next/image";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

// Kwoty i zawartość: CENNIK.md, część 3A. Ceny końcowe w groszach.
const PACKAGES = [
    {
        id: "staly-klient",
        name: "Stały Klient",
        forWho: "Beauty, barber, trenerzy, gabinety, gastro",
        headline: "Druki, których klienci nie wyrzucają do kosza",
        priceGrosze: 109900,
        items: [
            "Projekt druków z Twoim logo",
            "200 wizytówek z soft-touch i zaokrąglonymi narożnikami",
            "50 bigowanych voucherów lub kart stałego klienta",
            "50 naklejek ciętych po obrysie",
        ],
    },
    {
        id: "ekipa",
        name: "Ekipa",
        forWho: "Wykończenia, detailing, elektrycy, serwis",
        headline: "Dobre wrażenie, zanim wyjmiesz narzędzia",
        priceGrosze: 149000,
        items: [
            "Projekt znakowania z Twoim logo",
            "4 grube koszulki: logo z przodu i duży nadruk na plecach",
            "2 czapki z nadrukiem (haft na osobną wycenę)",
            "100 wizytówek albo 50 naklejek na sprzęt",
        ],
    },
    {
        id: "cala-marka",
        name: "Cała Marka",
        forWho: "Firmy, którym urosły stare materiały",
        headline: "Dział graficzny bez etatu",
        priceGrosze: 399000,
        items: [
            "Odświeżone logo, kolory i typografia",
            "2 bluzy, 4 koszulki i 2 czapki",
            "200 wizytówek, 50 voucherów, 100 naklejek",
            "Uporządkowane pliki źródłowe",
        ],
    },
];

const NBSP = String.fromCharCode(160);
const pln = (grosze: number) =>
    `${String(grosze / 100).replace(/\B(?=(\d{3})+$)/g, NBSP)}${NBSP}zł`;

const whatsapp = (name: string) =>
    `https://wa.me/48725182053?text=${encodeURIComponent(`Dzień dobry, interesuje mnie pakiet ${name}. Prowadzę: `)}`;

export function BusinessPackages() {
    return (
        <section id="pakiety" aria-labelledby="pakiety-h" className="scroll-mt-28 py-20 px-6 md:px-12">
            <div className="max-w-6xl mx-auto">
                <AnimatedSection className="text-center mb-12">
                    <p className="eyebrow mb-4">Rzeszów i wysyłka w całej Polsce</p>
                    <h2 id="pakiety-h" className="text-3xl md:text-4xl font-bold text-white">Pakiety dla firm</h2>
                    <p className="text-white/55 max-w-xl mx-auto mt-4">
                        Dajesz logo, a my robimy resztę: projekt, druk, wykończenie i odzież. W Rzeszowie pokażemy próbki na miejscu.
                    </p>
                </AnimatedSection>
                <div className="grid lg:grid-cols-3 gap-6">
                    {PACKAGES.map((p, i) => (
                        <AnimatedSection key={p.id} delay={i * 0.08}>
                            <article className="glass-card p-3 flex flex-col h-full">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                                    <Image src={`/pakiety/${p.id}.webp`} alt="" fill sizes="(max-width: 1024px) 92vw, 380px" className="object-cover" />
                                </div>
                                <div className="flex flex-col flex-1 p-4">
                                    <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                                    <p className="text-white/50 text-sm mt-1">{p.forWho}</p>
                                    <p className="text-white font-semibold mt-3 leading-snug">{p.headline}</p>
                                    <ul className="space-y-2 mt-4 mb-6">
                                        {p.items.map((item) => (
                                            <li key={item} className="flex gap-2 text-white/65 text-sm leading-snug">
                                                <CheckCircle2 size={15} className="text-gold shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-auto">
                                        <p className="text-3xl font-bold text-gold">{pln(p.priceGrosze)}</p>
                                        <p className="text-white/45 text-xs mt-1">cena końcowa</p>
                                        <a href={whatsapp(p.name)} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4 px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 text-sm">
                                            Napisz na WhatsApp <ArrowRight size={16} />
                                        </a>
                                    </div>
                                </div>
                            </article>
                        </AnimatedSection>
                    ))}
                </div>
                <p className="text-center text-white/55 text-sm mt-8">
                    Wolisz porozmawiać?{" "}
                    <a href="tel:+48725182053" className="inline-flex items-center gap-1.5 font-bold text-white hover:text-gold transition-colors">
                        <Phone size={14} /> 725 182 053
                    </a>
                </p>
            </div>
        </section>
    );
}
