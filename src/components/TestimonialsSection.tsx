"use client";

import { AnimatedSection } from "@/components/AnimatedSection";

const testimonials = [
    {
        quote:
            "Strona internetowa idealnie wpasowana w moje gusta :). Każdy pyta mnie, kto ogarniał Ci stronę — polecam z czystym sumieniem",
        name: "Adam J.",
        role: "Detailer",
        company: "Czysta-Gablota AUTOSPA",
        service: "Strona WWW",
    },
    {
        quote:
            "Mateusz stworzył logo, które dokładnie odzwierciedla charakter mojej firmy. Polecam, trafia w gusta",
        name: "Mirek K.",
        role: "Właściciel",
        company: "Firma Narzędziowa — Kraków",
        service: "Logo & Identyfikacja",
    },
    {
        quote:
            "Pełen profesjonalizm. Dostałem pełen pakiet plików wektorowych, book marki i brand guidelines. Nie spodziewałem się aż tyle za tę cenę.",
        name: "Karolina M.",
        role: "Właścicielka",
        company: "Butik — Rzeszów",
        service: "Identyfikacja wizualna",
    },
    {
        quote:
            "Komunikacja na poziomie — terminowo, konkretnie, z głową. Pierwsza propozycja wizytówki już mi się spodobała",
        name: "Marcin D.",
        role: "Właściciel",
        company: "Firma budowlana",
        service: "Wizytówka",
    },
];

export function TestimonialsSection() {
    const [featured, ...rest] = testimonials;

    return (
        <section className="py-28 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">

                <AnimatedSection className="mb-12">
                    <p className="eyebrow mb-3">Efekty mówią same za siebie</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        Co mówią klienci
                    </h2>
                </AnimatedSection>

                {/* Featured testimonial — full width, big quote */}
                <AnimatedSection className="mb-6">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-light/60 backdrop-blur-sm p-10 md:p-14">
                        {/* Decorative oversized quote mark */}
                        <div
                            className="absolute top-4 left-8 leading-none font-black text-gold/10 select-none pointer-events-none"
                            style={{ fontSize: "9rem", fontFamily: "var(--font-ava-meridian)" }}
                            aria-hidden
                        >
                            &ldquo;
                        </div>

                        {/* Service badge */}
                        <div className="relative z-10 mb-6">
                            <span className="text-xs font-bold text-gold/70 border border-gold/20 rounded-full px-3 py-1 uppercase tracking-widest">
                                {featured.service}
                            </span>
                        </div>

                        {/* Quote text */}
                        <blockquote className="relative z-10 text-xl md:text-2xl font-medium text-white leading-relaxed mb-8 max-w-3xl">
                            &ldquo;{featured.quote}&rdquo;
                        </blockquote>

                        {/* Author */}
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold shrink-0">
                                {featured.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-bold">{featured.name}</p>
                                <p className="text-white/50 text-sm">{featured.role} · {featured.company}</p>
                            </div>
                        </div>

                        {/* Gold accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
                    </div>
                </AnimatedSection>

                {/* Remaining testimonials — compact 3-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {rest.map((t, i) => (
                        <AnimatedSection key={i} delay={i * 0.1}>
                            <div className="glass-card p-6 flex flex-col gap-4 h-full">
                                <p className="text-white/70 leading-relaxed text-sm flex-1">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-bold text-xs shrink-0">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-sm truncate">{t.name}</p>
                                        <p className="text-white/40 text-xs truncate">{t.company}</p>
                                    </div>
                                    <span className="ml-auto shrink-0 text-[10px] font-bold text-gold/60 border border-gold/15 rounded-full px-2 py-0.5 whitespace-nowrap">
                                        {t.service}
                                    </span>
                                </div>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
