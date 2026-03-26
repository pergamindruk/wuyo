import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { PackagesSection } from "@/components/PackagesSection";

export const metadata = {
    title: "Cennik | Wuyo – Dobra Grafa",
    description: "Pełen cennik usług graficznych i web designu. Skrojone na miarę pakiety dla Twojej marki bez ukrytych kosztów.",
};

const pricing = [
    {
        category: "🎨 Identyfikacja Wizualna",
        color: "from-amber-500/20 to-transparent",
        accent: "border-amber-500/30",
        items: [
            { name: "Logotyp (baza)", price: "od 800 zł" },
            { name: "Pełna Identyfikacja Wizualna", price: "od 2 500 zł" },
            { name: "Lifting istniejącego logo", price: "od 1 000 zł" },
            { name: "Nowa Typografia / Kolorystyka", price: "od 500 zł" },
            { name: "Księga Znaku", price: "od 1 200 zł" },
        ],
    },
    {
        category: "🌐 Strony Internetowe",
        color: "from-sky-500/20 to-transparent",
        accent: "border-sky-500/30",
        items: [
            { name: "Strona One-Page", price: "od 1 200 zł" },
            { name: "Strona Firmowa (Multi-Page)", price: "od 2 900 zł" },
            { name: "Sklep E-commerce", price: "wycena ind." },
            { name: "UI/UX Design (sam projekt)", price: "od 100 zł / sek." },
            { name: "Zestaw ikon dedykowanych", price: "od 300 zł" },
        ],
    },
    {
        category: "🖨️ Materiały do Druku",
        color: "from-rose-500/20 to-transparent",
        accent: "border-rose-500/30",
        items: [
            { name: "Wizytówka", price: "od 150 zł" },
            { name: "Ulotka / Plakat", price: "od 250 zł" },
            { name: "Menu Restauracji", price: "od 400 zł" },
            { name: "Katalog Produktowy", price: "od 100 zł / str." },
            { name: "Rollup / Banner / Szyld", price: "od 300 zł" },
            { name: "Etykiety / Opakowania", price: "od 500 zł" },
            { name: "Naklejki / Wlepki", price: "od 100 zł" },
            { name: "Certyfikat / Dyplom", price: "od 150 zł" },
        ],
    },
    {
        category: "📱 Social Media & Digital",
        color: "from-purple-500/20 to-transparent",
        accent: "border-purple-500/30",
        items: [
            { name: "Social Media Kit (paka grafik)", price: "od 1 200 zł" },
            { name: "Abonament na grafiki", price: "od 1 500 zł / mies." },
            { name: "Karuzele IG / LinkedIn", price: "od 150 zł / post" },
            { name: "Szablony Prezentacji (Pitch Deck)", price: "od 600 zł" },
            { name: "Szablon Newslettera", price: "od 300 zł" },
            { name: "Stopka Mailowa (HTML)", price: "150 zł" },
            { name: "Banery Google / Meta Ads", price: "od 100 zł / format" },
            { name: "Miniaturki YouTube", price: "od 80 zł / szt." },
        ],
    },
];

export default function PricingPage() {
    return (
        <main className="min-h-screen w-full bg-navy-dark pt-36 md:pt-48 pb-20 px-4 md:px-8 relative overflow-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* HEADER */}
                <div className="mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-gold transition-colors mb-6 font-medium text-sm">
                        <ArrowLeft size={16} /> Wróć na stronę główną
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <p className="eyebrow mb-2">cennik</p>
                            <h1 className="text-3xl md:text-5xl font-bold text-white">Gramy w <span className="text-gold">otwarte karty</span>.</h1>
                            <p className="text-white/50 mt-3 max-w-xl text-sm md:text-base">
                                Zero niespodzianek na rachunku. Klikasz to, co potrzebujesz – i lecimy z tematem. Podane kwoty to ceny brutto (nie jestem płatnikiem VAT, wystawiam rachunek / fakturę bez VAT).
                            </p>
                        </div>
                        <Link href="/#kontakt" className="btn-gold px-8 py-3 rounded-full font-bold text-sm shrink-0 self-start md:self-auto shadow-[0_0_25px_rgba(255,235,82,0.25)]">
                            Zapytaj o wycenę →
                        </Link>
                    </div>
                </div>

                {/* SIATKA KATEGORII */}
                <h2 className="text-2xl font-bold text-white mb-6">Usługi pojedyncze</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {pricing.map((section) => (
                        <div
                            key={section.category}
                            className={`rounded-2xl border bg-navy-dark/80 backdrop-blur-sm flex flex-col overflow-hidden ${section.accent}`}
                        >
                            {/* Nagłówek kategorii */}
                            <div className={`px-5 py-4 bg-gradient-to-br ${section.color} border-b border-white/5`}>
                                <h2 className="font-bold text-white text-base leading-tight">{section.category}</h2>
                            </div>

                            {/* Lista pozycji */}
                            <div className="flex-1 divide-y divide-white/5">
                                {section.items.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/5 transition-colors group">
                                        <span className="text-white/70 text-sm group-hover:text-white transition-colors leading-snug">
                                            {item.name}
                                        </span>
                                        <span className="text-gold font-bold text-sm shrink-0 whitespace-nowrap">
                                            {item.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <PackagesSection showButton={false} className="mt-20 mb-8" />

                {/* UWAGI + CTA */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 bg-white/3 rounded-2xl border border-white/8 p-6">
                        <h3 className="text-white font-bold mb-3 text-base">Kilka słów o wycenach 📌</h3>
                        <ul className="space-y-2 text-white/50 text-sm">
                            <li>• <strong className="text-white/80">Wszystkie podane kwoty to ceny brutto.</strong> Nie doliczam VAT-u, więc na rachunku nie będzie niespodzianek.</li>
                            <li>• Podane kwoty to <strong className="text-white/80">dolne widełki</strong> — finalny koszt zależy od zakresu i czasu realizacji.</li>
                            <li>• Przy <strong className="text-white/80">pakietach łączonych</strong> (np. logo + strona) zawsze staram się wyjść naprzeciw z rabatem.</li>
                            <li>• Każdą wycenę wysyłam <strong className="text-white/80">w ciągu 24 h</strong> od przesłania briefu – bez zbędnych formalności.</li>
                            <li>• <strong className="text-white/80">Nie pracuję z budżetami poniżej 500 zł</strong> — by nie kompromitować jakości. Lepiej mieć jedno dobre logo niż pięć tanich.</li>
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-gold/15 to-transparent rounded-2xl border border-gold/25 p-6 flex flex-col items-start justify-between gap-4">
                        <div>
                            <p className="text-gold font-bold text-base mb-2">Nie widzisz tego co szukasz?</p>
                            <p className="text-white/60 text-sm">Masz niestandardowy projekt? Napisz. Dogadamy się!</p>
                        </div>
                        <Link href="/#kontakt" className="btn-gold px-6 py-3 rounded-full font-bold text-sm w-full text-center shadow-[0_0_20px_rgba(255,235,82,0.2)]">
                            Porozmawiajmy →
                        </Link>
                    </div>
                </div>

            </div>
        </main>
    );
}
