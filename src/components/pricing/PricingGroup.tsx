import { AnimatedSection } from "@/components/AnimatedSection";
import { PricingCard } from "./PricingCard";
import type { PricingGroupData } from "@/data/pricing";

/** Nagłówek + podtytuł grupy + siatka 3 kart. */
export function PricingGroup({ group }: { group: PricingGroupData }) {
    return (
        <div>
            <AnimatedSection className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{group.heading}</h3>
                <p className="text-white/60 max-w-xl mx-auto">{group.subheading}</p>
            </AnimatedSection>

            {/* pt-5 daje miejsce na plakietkę wystającą nad kartę (nie przycina jej overflow) */}
            <ul role="list" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-5">
                {group.cards.map((card) => (
                    <PricingCard key={card.name} card={card} />
                ))}
            </ul>
        </div>
    );
}
