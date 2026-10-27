"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { faqs as faqsPl } from "@/data/faq";
import { faqsEn } from "@/data/pricing-en";
import type { Locale } from "@/lib/i18n";

export function FAQSection({ locale = "pl" }: { locale?: Locale }) {
    const en = locale === "en";
    const faqs = en ? faqsEn : faqsPl;
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-28 px-6 md:px-12 relative overflow-hidden" id="faq">
            <div className="max-w-4xl mx-auto relative z-10">
                <AnimatedSection className="text-center mb-16">
                    <p className="eyebrow mb-4">{en ? "Clearing up doubts" : "Rozwiewam wątpliwości"}</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{en ? "Before you hand over your money" : "Zanim oddasz mi swoje pieniądze"}</h2>
                    <p className="text-white/60 max-w-xl mx-auto">{en ? "I respect your time, so here are answers to the key questions. No industry jargon, cards on the table." : "Szanuję Twój czas, dlatego zebrałem odpowiedzi na kluczowe pytania. Żadnego branżowego żargonu, gramy w otwarte karty."}</p>
                </AnimatedSection>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <AnimatedSection key={index} delay={index * 0.1}>
                            <div
                                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${openIndex === index ? "bg-navy-light border-gold/30" : "bg-navy/30 border-white/5 hover:border-white/20"}`}
                            >
                                <button
                                    className="w-full text-left px-6 py-6 flex justify-between items-center gap-4"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span className={`font-bold transition-colors md:text-lg ${openIndex === index ? "text-gold" : "text-white"}`}>
                                        {faq.question}
                                    </span>
                                    <div className={`p-2 rounded-full flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "bg-gold/10 rotate-180" : "bg-white/5"}`}>
                                        <ChevronDown size={20} className={openIndex === index ? "text-gold" : "text-white/60"} />
                                    </div>
                                </button>

                                {/* Odpowiedź zostaje w kodzie strony także po zwinięciu —
                                    wcześniej znikała z drzewa i nie było jej w źródle. */}
                                <div className="rozwijka" data-otwarte={openIndex === index ? "tak" : undefined}>
                                    <div className="rozwijka-srodek">
                                        <div className="px-6 pb-6 text-white/60 leading-relaxed pt-2 border-t border-white/5 mx-6">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
