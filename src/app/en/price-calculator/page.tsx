import type { Metadata } from "next";
import { PriceCalculator } from "@/app/(main)/kalkulator/PriceCalculator";
import { alternatesFor } from "@/lib/i18n";

export const metadata: Metadata = {
    title: "Price calculator: how much does a design project cost",
    description: "Get a rough estimate for your project in 60 seconds. Logo, website, print, social media: pick a service and see what to expect.",
    alternates: alternatesFor("calculator", "en"),
    openGraph: {
        title: "WUYO price calculator: logo, website, print, social",
        description: "An interactive price calculator. Find out what your project might cost before you get in touch.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/price-calculator",
        locale: "en_GB",
    },
};

export default function PriceCalculatorEnPage() {
    return (
        <div className="w-full min-h-screen pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <p className="eyebrow mb-4">No surprises</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Price calculator</h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto">
                        Pick a service and answer a few questions to get a rough price range on the spot. The final quote always comes by email. Prices in PLN, net.
                    </p>
                </div>
                <PriceCalculator locale="en" />
            </div>
        </div>
    );
}
