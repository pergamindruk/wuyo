"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { faqs } from "@/data/faq";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-28 px-6 md:px-12 relative overflow-hidden" id="faq">
            <div className="max-w-4xl mx-auto relative z-10">
                <AnimatedSection className="text-center mb-16">
                    <p className="eyebrow mb-4">Rozwiewam wątpliwości</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Zanim oddasz mi swoje pieniądze</h2>
                    <p className="text-white/60 max-w-xl mx-auto">Szanuję Twój czas, dlatego zebrałem odpowiedzi na kluczowe pytania. Żadnego branżowego żargonu, gramy w otwarte karty.</p>
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

                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                        >
                                            <div className="px-6 pb-6 text-white/60 leading-relaxed pt-2 border-t border-white/5 mx-6">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
