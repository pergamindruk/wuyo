"use client";

import { Clock, ShieldCheck, Eye } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

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

export function TrustedBySection() {
    return (
        <section className="py-20 px-6 md:px-12 relative overflow-hidden">
            {/* ═══════ GWARANCJE ═══════ */}
            <div className="max-w-5xl mx-auto mb-20 relative z-10">
                <AnimatedSection className="text-center mb-14">
                    <p className="eyebrow mb-4">Gwarancja spokoju</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Twarde zasady, nie&nbsp;obietnice
                    </h2>
                    <p className="text-white/60 max-w-xl mx-auto">
                        Dopiero rozkręcam firmę — więc każdy projekt to moja najlepsza wizytówka. Dlatego daję Ci gwarancje czarno na białym.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {guarantees.map((g, i) => (
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
