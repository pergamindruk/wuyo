import { AnimatedSection } from "./AnimatedSection";

export interface FaqEntry {
    q: string;
    a: string;
}

/**
 * Sekcja FAQ dla podstron usługowych.
 *
 * Renderuje TĘ SAMĄ tablicę, z której podstrona buduje schemat FAQPage —
 * Google wymaga, żeby dane strukturalne miały pokrycie w widocznej treści,
 * a dwie ręcznie utrzymywane kopie zawsze się w końcu rozjeżdżają.
 * Schemat złóż helperem `faqPageSchema` z lib/faq-schema.
 */
export function PageFaq({
    items,
    title = "Najczęstsze pytania",
    eyebrow = "FAQ",
}: {
    items: FaqEntry[];
    title?: string;
    eyebrow?: string;
}) {
    return (
        <section className="py-20 px-6 md:px-12 bg-white/[0.02]" id="faq">
            <div className="max-w-3xl mx-auto">
                <AnimatedSection className="text-center mb-12">
                    <p className="eyebrow mb-4">{eyebrow}</p>
                    <h2 className="text-3xl font-bold text-white">{title}</h2>
                </AnimatedSection>
                <div className="space-y-4">
                    {items.map((item, i) => (
                        <AnimatedSection key={item.q} delay={i * 0.06}>
                            <div className="glass-card p-5">
                                <h3 className="font-bold text-white mb-2 text-sm">{item.q}</h3>
                                <p className="text-white/55 text-sm leading-relaxed">{item.a}</p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}
