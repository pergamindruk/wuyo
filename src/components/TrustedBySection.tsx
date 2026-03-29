"use client";

import { Clock, ShieldCheck, Eye } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import Image from "next/image";
import { trustedClients } from "@/data/clients";

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

            {/* ═══════ REALIZACJE – statyczny grid ═══════ */}
            <div className="border-t border-white/5 pt-12 relative">
                <AnimatedSection className="text-center mb-10">
                    <p className="eyebrow mb-3">realizacje</p>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                        Marki, które już ogarniamy
                    </h3>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {trustedClients.map((client, i) => (
                        <AnimatedSection key={i} delay={i * 0.12}>
                            <div className="glass-card p-6 flex flex-col items-center text-center gap-4 group hover:border-gold/20 transition-all duration-300">
                                <div className="relative w-32 h-16">
                                    <Image
                                        src={client.src}
                                        alt={client.alt}
                                        fill
                                        sizes="128px"
                                        className="object-contain grayscale brightness-50 opacity-50 group-hover:grayscale-0 group-hover:brightness-110 group-hover:opacity-100 transition-all duration-400"
                                    />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm mb-1">{client.name}</p>
                                    <p className="text-white/60 text-xs leading-relaxed">{client.desc}</p>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
