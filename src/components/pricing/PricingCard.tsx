import Link from "next/link";
import { Check } from "lucide-react";
import type { PricingCardData } from "@/data/pricing";

/**
 * Reużywalna karta cennika. Karta wyróżniona: żółta obwódka + poświata +
 * plakietka nad kartą. Na mobile karta wyróżniona ląduje pierwsza (order-first).
 */
export function PricingCard({ card }: { card: PricingCardData }) {
    const { eyebrow, name, tagline, price, priceSuffix, features, delivery, cta, highlighted, badge } = card;

    // Prefill formularza kontaktowego nazwą pakietu.
    const ctaHref = `/?pakiet=${encodeURIComponent(name)}#kontakt`;

    return (
        <li
            className={`relative flex flex-col rounded-3xl p-7 border transition-colors h-full ${
                highlighted
                    ? "bg-gold/5 border-gold/50 shadow-[0_0_60px_-10px_rgba(255,235,82,0.25)] order-first md:order-none"
                    : "bg-navy/50 border-white/10 hover:border-white/20"
            }`}
        >
            {badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-navy text-[11px] font-bold px-4 py-1 rounded-full tracking-wide whitespace-nowrap">
                    {badge}
                </span>
            )}

            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-5">{eyebrow}</p>

            <h4 className={`text-2xl font-bold mb-2 ${highlighted ? "text-gold" : "text-white"}`}>{name}</h4>
            <p className="text-white/50 text-sm leading-relaxed mb-6">{tagline}</p>

            <div className="mb-7">
                <span className={`text-4xl font-bold tabular-nums ${highlighted ? "text-gold" : "text-white"}`}>
                    {price}
                </span>
                <span className="text-white/40 text-sm ml-2">{priceSuffix}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
                {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                        <Check
                            size={13}
                            strokeWidth={3}
                            aria-hidden="true"
                            className={`mt-0.5 shrink-0 ${highlighted ? "text-gold" : "text-white/50"}`}
                        />
                        <span>{f}</span>
                    </li>
                ))}
            </ul>

            <p className="text-white/30 text-xs mb-5">{delivery}</p>

            <Link
                href={ctaHref}
                className={`text-center py-3.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    highlighted
                        ? "bg-gold text-navy hover:bg-gold-light"
                        : "border border-white/20 text-white hover:border-white/50 hover:bg-white/5"
                }`}
            >
                {cta}
            </Link>
        </li>
    );
}
