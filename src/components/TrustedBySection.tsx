"use client";

import Image from "next/image";
import { Spotlight } from "@/components/ui/spotlight";

const trustedLogos = [
    { src: "/logotypy/czysta-gablota-logo-realizacja.png", alt: "Czysta Gablota" },
    { src: "/logotypy/admar-logo-realizacja.png", alt: "ADMAR" },
    { src: "/logotypy/pergamin-logo-realizacja.png", alt: "Pergamin" },
];

export function TrustedBySection() {
    const allLogos = [...trustedLogos, ...trustedLogos, ...trustedLogos, ...trustedLogos];

    return (
        <section className="py-8 relative overflow-hidden border-y border-white/5">
            {/* --- EFEKTOWNE ŚWIATŁO W TLE --- */}
            <Spotlight
                className="-top-20 left-0 md:left-60 md:-top-20 opacity-60"
                fill="#FFEB52"
            />
            {/* Animowany, duży świetlisty orb idealnie za logotypami */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-40 bg-gold/15 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-screen pulse-glow" />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse-light {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
                }
                .pulse-glow {
                    animation: pulse-light 8s ease-in-out infinite;
                }
            `}} />

            <div className="section-glow opacity-30" />

            <div className="max-w-6xl mx-auto px-6 mb-6 text-center relative z-10">
                <p className="eyebrow mb-3">dowód społeczny</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Marki, które zyskały przewagę 🚀
                </h2>
                <p className="text-white/50 text-sm max-w-xl mx-auto">Budowałem wizerunek dla firm, które wiedzą, po co inwestuje się w design.</p>
            </div>

            {/* Karuzela logotypów */}
            <div className="relative w-full overflow-hidden
                before:absolute before:left-0 before:top-0 before:w-24 before:h-full before:bg-gradient-to-r before:from-navy-dark before:to-transparent before:z-10
                after:absolute after:right-0 after:top-0 after:w-24 after:h-full after:bg-gradient-to-l after:from-navy-dark after:to-transparent after:z-10
                group"
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes trusted-scroll {
                        from { transform: translateX(0); }
                        to   { transform: translateX(-50%); }
                    }
                    .trusted-track {
                        animation: trusted-scroll 40s linear infinite;
                    }
                    .group:hover .trusted-track {
                        animation-play-state: paused;
                    }
                    .neon-logo:hover img {
                        filter: grayscale(0) brightness(1.1);
                        opacity: 1;
                    }
                    .neon-logo img {
                        filter: grayscale(1) brightness(0.5);
                        opacity: 0.45;
                        transition: filter 0.4s ease, opacity 0.4s ease;
                    }
                `}} />

                <div className="flex items-center w-max trusted-track gap-16 py-6">
                    {[...allLogos, ...allLogos].map((logo, i) => (
                        <div
                            key={i}
                            className="neon-logo relative flex items-center justify-center h-28 w-44 md:w-52 shrink-0 cursor-default"
                        >
                            <Image
                                src={logo.src}
                                alt={logo.alt}
                                fill
                                className="object-contain px-4 py-6"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
