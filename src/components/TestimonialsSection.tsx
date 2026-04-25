import { createClient } from "@/lib/supabase/server";
import { AnimatedSection } from "@/components/AnimatedSection";

type Testimonial = {
    id?: string;
    quote: string;
    name: string;
    role: string;
    company: string;
    service: string;
    featured?: boolean;
};

const STATIC_TESTIMONIALS: Testimonial[] = [
    {
        quote: "Strona internetowa idealnie wpasowana w moje gusta :). Każdy pyta mnie, kto ogarniał Ci stronę — polecam z czystym sumieniem",
        name: "Adam J.",
        role: "Detailer",
        company: "Czysta-Gablota AUTOSPA",
        service: "Strona WWW",
        featured: true,
    },
    {
        quote: "Mateusz stworzył logo, które dokładnie odzwierciedla charakter mojej firmy. Polecam, trafia w gusta",
        name: "Mirek K.",
        role: "Właściciel",
        company: "Firma Narzędziowa — Kraków",
        service: "Logo & Identyfikacja",
    },
    {
        quote: "Pełen profesjonalizm. Dostałam pełen pakiet plików wektorowych, book marki i brand guidelines. Nie spodziewałam się aż tyle za tę cenę.",
        name: "Karolina M.",
        role: "Właścicielka",
        company: "Butik — Rzeszów",
        service: "Identyfikacja wizualna",
    },
    {
        quote: "Komunikacja na poziomie — terminowo, konkretnie, z głową. Pierwsza propozycja wizytówki już mi się spodobała",
        name: "Marcin D.",
        role: "Właściciel",
        company: "Firma budowlana",
        service: "Wizytówka",
    },
];

async function getTestimonials(): Promise<Testimonial[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("testimonials")
            .select("id, quote, name, role, company, service, featured")
            .order("created_at", { ascending: false })
            .limit(10);

        if (error || !data || data.length === 0) return STATIC_TESTIMONIALS;
        return data;
    } catch {
        return STATIC_TESTIMONIALS;
    }
}

export async function TestimonialsSection() {
    const testimonials = await getTestimonials();

    const featured = testimonials.find(t => t.featured) ?? testimonials[0];
    const rest = testimonials.filter(t => t !== featured).slice(0, 3);

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

                {/* Featured testimonial */}
                <AnimatedSection className="mb-6">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-light/60 backdrop-blur-sm p-10 md:p-14">
                        <div
                            className="absolute top-4 left-8 leading-none font-black text-gold/10 select-none pointer-events-none"
                            style={{ fontSize: "9rem", fontFamily: "var(--font-ava-meridian)" }}
                            aria-hidden
                        >
                            &ldquo;
                        </div>

                        <div className="relative z-10 mb-6">
                            <span className="text-xs font-bold text-gold/70 border border-gold/20 rounded-full px-3 py-1 uppercase tracking-widest">
                                {featured.service}
                            </span>
                        </div>

                        <blockquote className="relative z-10 text-xl md:text-2xl font-medium text-white leading-relaxed mb-8 max-w-3xl">
                            &ldquo;{featured.quote}&rdquo;
                        </blockquote>

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold shrink-0">
                                {featured.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-bold">{featured.name}</p>
                                <p className="text-white/50 text-sm">{featured.role} · {featured.company}</p>
                            </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
                    </div>
                </AnimatedSection>

                {/* Compact grid */}
                {rest.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {rest.map((t, i) => (
                            <AnimatedSection key={t.id ?? i} delay={i * 0.1}>
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
                )}
            </div>
        </section>
    );
}
