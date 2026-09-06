import { AnimatedSection } from "@/components/AnimatedSection";
import { PricingCard } from "./PricingCard";
import type { PricingGroupData } from "@/data/pricing";

/** Nagłówek + podtytuł grupy + siatka kart (2 lub 3, zależnie od grupy). */
export function PricingGroup({ group }: { group: PricingGroupData }) {
    // Abonament ma 2 karty, pakiety jednorazowe 3. Przy sztywnych 3 kolumnach
    // dwie karty zostawiały pustą kolumnę z prawej i całość uciekała w lewo.
    const twoUp = group.cards.length === 2;
    const layout = twoUp
        ? "md:grid-cols-2 max-w-4xl"
        : "md:grid-cols-3 max-w-6xl";

    return (
        <div>
            <AnimatedSection className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{group.heading}</h3>
                <p className="text-white/60 max-w-xl mx-auto">{group.subheading}</p>
            </AnimatedSection>

            {/* pt-5 daje miejsce na plakietkę wystającą nad kartę (nie przycina jej overflow) */}
            <ul role="list" className={`grid grid-cols-1 ${layout} gap-6 mx-auto pt-5`}>
                {group.cards.map((card) => (
                    <PricingCard key={card.name} card={card} />
                ))}
            </ul>
        </div>
    );
}
