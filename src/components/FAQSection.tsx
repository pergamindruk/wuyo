"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const faqs = [
    {
        question: "Ile to wszystko będzie kosztować?",
        answer: "Gram w otwarte karty. Najważniejsze pakiety masz w Cenniku. Jeśli potrzebujesz czegoś nietypowego, napisz maila - wycenię dokładnie co do złotówki przed startem prac, bez niespodzianek na końcu."
    },
    {
        question: "Jak wygląda rozliczenie zapłaty?",
        answer: "Standardowo dzielimy sprawę na pół: 50% potężnej zaliczki (tzw. startowe) przed otwarciem programów graficznych, i 50% na mecie, kiedy Ty uśmiechasz się na widok gotowych materiałów."
    },
    {
        question: "A co jak projekt mi nie wejdzie?",
        answer: "Zanim w ogóle usiądę do projektowania, robimy solidny brief (wypytuję Cię o wszystko). Dzięki temu wiem, czego potrzebujesz. Po projektowaniu mamy serię poprawek żeby idealnie wyszlifować bryłę, pracuję aż powiesz WOW!"
    },
    {
        question: "Dostaję pliki edytowalne/źródłowe?",
        answer: "Pewnie. Jesteś szefem, płacisz za projekt, to go masz. Przekazuję Ci wszelkie paczki produkcyjne, tła, fonty, instrukcje i pełne wektory."
    },
    {
        question: "Ile zazwyczaj trwa projekt strony WWW?",
        answer: "Dla One-Page'a lecimy szybko – zwykle wyrabiam się w około tydzień od zebrania materiałów. Dużo zależy od tego, jak szybko dostarczysz mi treści, zdjęcia i jak sprawnie dajesz feedback. Żadnego bujania w chmurach – konkret praca."
    },
    {
        question: "Skąd będę wiedział, na jakim etapie jest mój projekt?",
        answer: "Dostajesz własny panel klienta z linkiem, w którym na bieżąco widzisz postęp prac — od briefu, przez projektowanie, poprawki, aż po finalne przekazanie. Jak śledzenie paczki, tylko że działa. Zero zgadywania i pytania \"jak tam moje zlecenie?\"."
    }
];

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
                    <p className="text-white/50 max-w-xl mx-auto">Szanuję Twój czas, dlatego zebrałem odpowiedzi na kluczowe pytania. Żadnego branżowego żargonu, gramy w otwarte karty.</p>
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
                                        <ChevronDown size={20} className={openIndex === index ? "text-gold" : "text-white/50"} />
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
