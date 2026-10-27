"use client";

import { Clock, ShieldCheck, Eye } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import type { Locale } from "@/lib/i18n";

const guarantees = [
    {
        icon: <Clock size={28} />,
        title: "Termin murowany",
        desc: "Umawiamy się na konkretny dzień — i w ten dzień dostajesz projekt. Bez wymówek i przesuwania deadlineów.",
    },
    {
        icon: <ShieldCheck size={28} />,
        title: "Wycena = cena końcowa",
        desc: "Kwota, którą Ci podam przed startem, to kwota na fakturze. Zero niespodzianek, zero \"dopłat za poprawki\".",
    },
    {
        icon: <Eye size={28} />,
        title: "Status realizacji online",
        desc: "Dostajesz własny panel klienta, w którym na bieżąco widzisz postęp prac nad projektem. Bez zgadywania, bez pytania \"jak tam moje zlecenie?\".",
    },
];

const EN = {
    items: [
        ["Deadline you can count on", "We agree on a specific day, and on that day you get your project. No excuses, no moving deadlines."],
        ["Quote = final price", "The amount I give you before we start is the amount on the invoice. No surprises, no extra charges for revisions."],
        ["Live project status", "You get your own client panel where you can see how the work is going. No guessing, no asking how your order is doing."],
    ],
    eyebrow: "Peace of mind",
    h2: "Firm rules, not promises",
    lead: "I am still growing the studio, so every project is my best business card. That is why you get guarantees in black and white.",
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
                        {locale === "en" ? EN.lead : "Dopiero rozkręcam firmę — więc każdy projekt to moja najlepsza wizytówka. Dlatego daję Ci gwarancje czarno na białym."}
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {items.map((g, i) => (
                        <AnimatedSection key={i} delay={i * 0.12}>
                            <div className="glass-card p-8 md:p-10 h-full group transition-all duration-300 text-center">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold mb-6 group-hover:bg-gold/20 transition-colors">
                                    {g.icon}
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
