"use client";

import { Clock, ShieldCheck, Eye } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import Image from "next/image";

const trustedLogos = [
    { src: "/logotypy/czysta-gablota-logo-realizacja.webp", alt: "Czysta Gablota" },
    { src: "/logotypy/admar-logo-realizacja.webp", alt: "ADMAR" },
    { src: "/logotypy/pergamin-logo-realizacja.webp", alt: "Pergamin" },
];

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
    const allLogos = [...trustedLogos, ...trustedLogos, ...trustedLogos, ...trustedLogos];

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

            {/* ═══════ KARUZELA LOGOTYPÓW ═══════ */}
            <div className="border-t border-white/5 pt-12 relative">
                <AnimatedSection className="text-center mb-8">
                    <p className="eyebrow mb-3">realizacje</p>
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                        Marki, które już ogarniamy 🚀
                    </h3>
                </AnimatedSection>

                <div className="relative w-full overflow-hidden
                    before:absolute before:left-0 before:top-0 before:w-24 before:h-full before:bg-gradient-to-r before:from-navy-dark before:to-transparent before:z-10
                    after:absolute after:right-0 after:top-0 after:w-24 after:h-full after:bg-gradient-to-l after:from-navy-dark after:to-transparent after:z-10
                    group"
                >
                    <div className="flex items-center w-max animate-[trusted-scroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-16 py-6">
                        {[...allLogos, ...allLogos].map((logo, i) => (
                            <div
                                key={i}
                                className="relative flex items-center justify-center h-28 w-44 md:w-52 shrink-0 cursor-default"
                            >
                                <Image
                                    src={logo.src}
                                    alt={logo.alt}
                                    fill
                                    sizes="(max-width: 768px) 176px, 208px"
                                    className="object-contain px-4 py-6 grayscale brightness-50 opacity-45 transition-all duration-400 hover:grayscale-0 hover:brightness-110 hover:opacity-100"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
