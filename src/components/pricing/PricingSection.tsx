"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Eye, PenTool, MapPin, LifeBuoy } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PricingGroup } from "./PricingGroup";
import {
    pricingGroups,
    sectionHeader,
    aLaCarte,
    perks,
    pricingFaqs,
    finalCta,
} from "@/data/pricing";

const perkIcons = [Eye, PenTool, MapPin, LifeBuoy] as const;

interface PricingSectionProps {
    /** Pokaż akordeon FAQ (wyłącz na stronie głównej — jest tam osobny FAQSection). */
    showFaq?: boolean;
    /** Pokaż końcowe CTA (wyłącz na stronie głównej — jest tam ContactBrief). */
    showFinalCta?: boolean;
    className?: string;
    id?: string;
}

export function PricingSection({
    showFaq = true,
    showFinalCta = true,
    className = "py-28 px-6 md:px-12",
    id = "cennik-pakiety",
}: PricingSectionProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [jednorazowo, abonament] = pricingGroups;

    return (
        <section id={id} aria-labelledby={`${id}-title`} className={`relative ${className}`}>
            {/* Nagłówek sekcji */}
            <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto relative z-10">
                <p className="eyebrow mb-4">{sectionHeader.eyebrow}</p>
                <h2 id={`${id}-title`} className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {sectionHeader.title}
                </h2>
                <p className="text-white/60">{sectionHeader.subtitle}</p>
            </AnimatedSection>

            {/* Grupa A — jednorazowo */}
            <div className="relative z-10">
                <PricingGroup group={jednorazowo} />
            </div>

            {/* Linijka à la carte */}
            <div className="max-w-3xl mx-auto mt-12 text-center space-y-4 relative z-10">
                <p className="text-white/60 text-sm md:text-base">
                    Potrzebujesz tylko części? Indywidualna strona od{" "}
                    <strong className="text-gold font-semibold">{aLaCarte.siteFrom}</strong>, samo logo od{" "}
                    <strong className="text-gold font-semibold">{aLaCarte.logoFrom}</strong>. Napisz — wycenię
                    konkretnie pod Ciebie.
                </p>
            </div>

            {/* Grupa B — abonament */}
            <div className="mt-24 relative z-10">
                <PricingGroup group={abonament} />
            </div>

            {/* Pasek wyróżników */}
            <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {perks.map((perk, i) => {
                    const Icon = perkIcons[i];
                    return (
                        <AnimatedSection
                            key={perk.title}
                            delay={i * 0.08}
                            className="flex flex-col items-center text-center gap-3"
                        >
                            <div className="text-gold">
                                <Icon size={28} aria-hidden="true" />
                            </div>
                            <h3 className="text-white font-bold text-sm">{perk.title}</h3>
                            <p className="text-white/50 text-xs leading-relaxed">{perk.desc}</p>
                        </AnimatedSection>
                    );
                })}
            </div>

            {/* FAQ — akordeon dostępny z klawiatury */}
            {showFaq && (
                <div className="max-w-3xl mx-auto mt-24 relative z-10">
                    <AnimatedSection className="text-center mb-10">
                        <p className="eyebrow mb-4">FAQ</p>
                        <h3 className="text-2xl md:text-4xl font-bold text-white">Częste pytania o cennik</h3>
                    </AnimatedSection>

                    <ul role="list" className="space-y-4">
                        {pricingFaqs.map((faq, i) => {
                            const open = openFaq === i;
                            return (
                                <li
                                    key={faq.q}
                                    className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
                                        open
                                            ? "bg-navy-light border-gold/30"
                                            : "bg-navy/30 border-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <h4 className="m-0">
                                        <button
                                            type="button"
                                            id={`${id}-faq-btn-${i}`}
                                            aria-expanded={open}
                                            aria-controls={`${id}-faq-panel-${i}`}
                                            onClick={() => setOpenFaq(open ? null : i)}
                                            className="w-full text-left px-6 py-5 flex justify-between items-center gap-4"
                                        >
                                            <span
                                                className={`font-bold transition-colors md:text-lg ${
                                                    open ? "text-gold" : "text-white"
                                                }`}
                                            >
                                                {faq.q}
                                            </span>
                                            <span
                                                className={`p-2 rounded-full flex-shrink-0 transition-transform duration-300 ${
                                                    open ? "bg-gold/10 rotate-180" : "bg-white/5"
                                                }`}
                                            >
                                                <ChevronDown
                                                    size={20}
                                                    aria-hidden="true"
                                                    className={open ? "text-gold" : "text-white/60"}
                                                />
                                            </span>
                                        </button>
                                    </h4>

                                    <AnimatePresence initial={false}>
                                        {open && (
                                            <motion.div
                                                id={`${id}-faq-panel-${i}`}
                                                role="region"
                                                aria-labelledby={`${id}-faq-btn-${i}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <div className="px-6 pb-6 text-white/60 leading-relaxed pt-2 border-t border-white/5 mx-6">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* CTA końcowe */}
            {showFinalCta && (
                <AnimatedSection className="max-w-2xl mx-auto mt-24 text-center flex flex-col items-center gap-5 relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{finalCta.title}</h3>
                    <p className="text-white/60 text-sm md:text-base">{finalCta.text}</p>
                    <Link href="/#kontakt" className="btn-gold px-10 py-4 rounded-full font-bold inline-flex items-center gap-2">
                        {finalCta.button}
                    </Link>
                </AnimatedSection>
            )}
        </section>
    );
}
