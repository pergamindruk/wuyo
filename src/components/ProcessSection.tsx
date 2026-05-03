"use client";

import { motion } from "framer-motion";
import { MessageSquare, Calculator, Zap, Search, PackageCheck, Rocket } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
export function ProcessSection() {
    const steps = [
        {
            title: "Pogawędka",
            icon: <MessageSquare size={24} />,
            desc: "Zaczynam od luźnej gadki :) Poznaję Ciebie, Twój biznes i wizję."
        },
        {
            title: "Wycena pracy",
            icon: <Calculator size={24} />,
            desc: "Krótko i na temat - jasna wycena bez ukrytych kosztów z konkretną datą realizacji"
        },
        {
            title: "Rozpoczęcie prac",
            icon: <Zap size={24} />,
            desc: "Analizuję i projektuję, tak by Twoja grafika była na czas."
        },
        {
            title: "Audyt klienta",
            icon: <Search size={24} />,
            desc: "Pokazuję Ci pierwsze efekty. Ty mówisz co myślisz, ja wprowadzam poprawki, aż jest petarda."
        },
        {
            title: "Przekazanie paczki",
            icon: <PackageCheck size={24} />,
            desc: "Dostajesz wszystko elegancko poukładane w folderach. Pliki, których użyjesz od razu."
        },
        {
            title: "Wdrożenie",
            icon: <Rocket size={24} />,
            desc: "Pomagam to wszystko odpalić w sieci i druku. Jestem z Tobą do samego końca."
        }
    ];

    return (
        <section id="proces" className="py-28 bg-navy-dark/50 border-y border-white/5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center mb-20">
                    <p className="eyebrow mb-4">Gwarancja spokoju</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Proces, który oszczędza Twój czas
                    </h2>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Przejrzysta ścieżka bez zbędnych formalności — od pierwszej rozmowy do w pełni gotowego wizerunku Twojej marki.
                    </p>
                </div>
            </div>

            {/* Responsive Process Layout */}
            <div className="relative w-full mx-auto mt-12">
                {/* DESKTOP: Horizontal Scroll Layout */}
                <div className="hidden md:flex overflow-x-auto pb-12 pt-[60px] px-6 md:px-12 gap-6 snap-x snap-mandatory relative z-10 w-full hide-scrollbar">
                    {/* Connecting line for the background (horizontal) */}
                    <div className="absolute top-[90px] left-[150px] w-max min-w-[1500px] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={`desktop-${index}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative flex flex-col group min-w-[280px] max-w-[280px] w-full snap-start shrink-0"
                        >
                            {/* Center Node / Dot for top line */}
                            <div className="absolute left-1/2 -top-[60px] w-8 h-8 rounded-full bg-navy border-2 border-white/10 flex items-center justify-center -translate-x-1/2 z-20 transition-all duration-300 group-hover:bg-gold group-hover:border-gold shadow-[0_0_0_rgba(255,215,0,0)] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]">
                                <div className="w-2 h-2 rounded-full bg-white/30 group-hover:bg-navy-dark transition-colors" />
                            </div>
                            {/* Vertical connection line from dot to card */}
                            <div className="absolute left-1/2 -top-[30px] w-px h-[30px] bg-gradient-to-b from-white/10 to-transparent -translate-x-1/2 z-10" />

                            {/* Step Number Badge directly on card */}
                            <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-navy border border-white/10 flex items-center justify-center text-xs font-bold text-white/30 group-hover:text-gold group-hover:border-gold/50 transition-colors z-30">
                                0{index + 1}
                            </div>

                            {/* Content Card */}
                            <MagicCard
                                className="bg-navy border border-white/5 p-8 flex-col h-full rounded-2xl relative z-20 overflow-hidden transition-all duration-300 group-hover:border-gold/30 group-hover:-translate-y-1"
                                gradientColor="#FFEB52"
                                gradientFrom="#FFEB52"
                                gradientTo="#262520"
                                gradientOpacity={0.15}
                                gradientSize={400}
                            >

                                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-gold mb-5 group-hover:scale-110 group-hover:from-gold/20 transition-all duration-300 relative z-10 overflow-hidden">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-white/60 leading-relaxed relative z-10">
                                    {step.desc}
                                </p>
                            </MagicCard>
                        </motion.div>
                    ))}
                </div>

                {/* MOBILE: Vertical Timeline Layout */}
                <div className="flex flex-col md:hidden px-6 relative z-10 w-full gap-8">
                    {/* Vertical connecting line */}
                    <div className="absolute top-12 bottom-12 left-[49px] w-[2px] bg-gradient-to-b from-gold/30 via-white/10 to-transparent z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={`mobile-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="relative flex items-stretch gap-6 group w-full"
                        >
                            {/* Process dot on the line */}
                            <div className="relative shrink-0 mt-6 z-20">
                                <div className="w-12 h-12 rounded-full bg-navy border-2 border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:shadow-[0_0_15px_rgba(255,235,82,0.3)] bg-navy-dark">
                                    <span className="text-sm font-bold text-white/60 group-hover:text-gold transition-colors">
                                        {index + 1}
                                    </span>
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 pb-4">
                                <MagicCard
                                    className="bg-navy border border-white/5 p-6 flex-col h-full rounded-2xl relative overflow-hidden transition-all duration-300 group-hover:border-gold/30"
                                    gradientColor="#FFEB52"
                                    gradientFrom="#FFEB52"
                                    gradientTo="#262520"
                                    gradientOpacity={0.1}
                                    gradientSize={200}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-gold mb-3 group-hover:scale-110 group-hover:from-gold/20 transition-all duration-300 relative z-10">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 relative z-10">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-white/60 leading-relaxed relative z-10">
                                        {step.desc}
                                    </p>
                                </MagicCard>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
