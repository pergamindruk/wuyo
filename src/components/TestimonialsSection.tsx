"use client";

import { AnimatedSection } from "@/components/AnimatedSection";
import { Quote } from "lucide-react";

// ═══════════════════════════════════════════════════
// UZUPEŁNIJ: Zastąp poniższe dane prawdziwymi opiniami
// od klientów. Możesz skopiować z maila / WhatsAppa.
// ═══════════════════════════════════════════════════
const testimonials = [
    {
        quote:
            "Mateusz stworzył logo, które dokładnie odzwierciedla charakter mojej restauracji. Klienci często pytają o autora — wizytówka robiła swoją robotę jeszcze przed otwarciem.",
        name: "Anna K.",
        role: "Właścicielka",
        company: "Restauracja — Rzeszów",
        service: "Logo & Identyfikacja",
        // UZUPEŁNIJ: zmień na prawdziwe imię/firmę/cytat
    },
    {
        quote:
            "Strona internetowa zaczęła generować leady już w pierwszym tygodniu po launchu. Inwestycja zwróciła się w dwa miesiące. Polecam każdemu, kto traktuje stronę poważnie.",
        name: "Tomasz W.",
        role: "CEO",
        company: "Firma B2B — Podkarpacie",
        service: "Strona WWW",
        // UZUPEŁNIJ: zmień na prawdziwe imię/firmę/cytat
    },
    {
        quote:
            "Pełen profesjonalizm i zero lania wody. Dostałem pełen pakiet plików wektorowych, book marki i brand guidelines. Nie spodziewałem się aż tyle za tę cenę.",
        name: "Karolina M.",
        role: "Właścicielka",
        company: "Butik — Rzeszów",
        service: "Identyfikacja wizualna",
        // UZUPEŁNIJ: zmień na prawdziwe imię/firmę/cytat
    },
    {
        quote:
            "Komunikacja na poziomie — terminowo, konkretnie, z głową. Logo spodobało się od pierwszego szkicu. Współpracujemy już przy kolejnych projektach.",
        name: "Marcin D.",
        role: "Founder",
        company: "Startup Tech — Polska",
        service: "Logo & Branding",
        // UZUPEŁNIJ: zmień na prawdziwe imię/firmę/cytat
    },
];

export function TestimonialsSection() {
    return (
        <section className="py-28 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <AnimatedSection className="text-center mb-16 relative z-10">
                <p className="eyebrow mb-4">Efekty mówią same za siebie</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white">
                    Co mówią klienci
                </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto relative z-10">
                {testimonials.map((t, i) => (
                    <AnimatedSection key={i} delay={i * 0.1}>
                        <div className="glass-card p-8 flex flex-col gap-5 h-full">
                            {/* Quote icon */}
                            <Quote size={28} className="text-gold/60 flex-shrink-0" />

                            {/* Text */}
                            <p className="text-white/80 leading-relaxed text-sm md:text-base flex-1">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            {/* Footer */}
                            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                {/* Avatar initials */}
                                <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{t.name}</p>
                                    <p className="text-white/50 text-xs">
                                        {t.role} · {t.company}
                                    </p>
                                </div>
                                <span className="ml-auto text-xs font-bold text-gold/70 border border-gold/20 rounded-full px-3 py-1">
                                    {t.service}
                                </span>
                            </div>
                        </div>
                    </AnimatedSection>
                ))}
            </div>
        </section>
    );
}
