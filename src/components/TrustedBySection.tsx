"use client";

import { Clock, ShieldCheck, Eye } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import type { Locale } from "@/lib/i18n";

const guarantees = [
    {
        icon: <Clock size={28} />,
        ruch: "zegar",
        title: "Termin murowany",
        desc: "Umawiamy się na konkretny dzień i tego dnia dostajesz projekt. Bez wymówek i przesuwania terminów.",
    },
    {
        icon: <ShieldCheck size={28} />,
        ruch: "tarcza",
        title: "Wycena = cena końcowa",
        desc: "Kwota, którą Ci podam przed startem, to kwota na fakturze. Zero niespodzianek, zero \"dopłat za poprawki\".",
    },
    {
        icon: <Eye size={28} />,
        ruch: "oko",
        title: "Postęp widzisz online",
        desc: "Dostajesz własny panel klienta i na bieżąco widzisz, na jakim etapie jest projekt. Nie musisz pytać „jak tam moje zlecenie?”.",
    },
];

const EN = {
    items: [
        ["Deadline you can count on", "We agree on a specific day, and on that day you get your project. No excuses, no moving deadlines."],
        ["Quote = final price", "The amount I give you before we start is the amount on the invoice. No surprises, no extra charges for revisions."],
        ["See progress online", "You get your own client panel and can see what stage your project is at. No need to ask how your order is doing."],
    ],
    eyebrow: "Peace of mind",
    h2: "Firm rules, not promises",
    lead: "I am still growing the studio, so every project is my business card. That is why the rules are in black and white.",
} as const;

export function TrustedBySection({ locale = "pl" }: { locale?: Locale }) {
    const items = locale === "en" ? guarantees.map((g, i) => ({ ...g, title: EN.items[i][0], desc: EN.items[i][1] })) : guarantees;
    return (
        <section className="py-20 px-6 md:px-12 relative overflow-hidden">
            {/* ═══════ GWARANCJE ═══════ */}
            <div className="max-w-5xl mx-auto mb-20 relative z-10">
                <AnimatedSection className="text-center mb-14">
                    <p className="eyebrow mb-4">{locale === "en" ? EN.eyebrow : "Gwarancja spokoju"}</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        {locale === "en" ? EN.h2 : "Twarde zasady, nie\u00a0obietnice"}
                    </h2>
                    <p className="text-white/60 max-w-xl mx-auto">
                        {locale === "en" ? EN.lead : "Dopiero rozkręcam firmę, więc każdy projekt to moja wizytówka. Dlatego zasady masz czarno na białym."}
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {items.map((g, i) => (
                        <AnimatedSection key={i} delay={i * 0.12}>
                            <div className="glass-card p-8 md:p-10 h-full group transition-all duration-300 text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold mb-6 group-hover:bg-gold/20 transition-colors">
                                    <span className={`gw-ikona gw-${g.ruch}`}>{g.icon}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-3">{g.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed">{g.desc}</p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>

        </section>
    );
}
