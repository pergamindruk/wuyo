import type { FaqEntry } from "@/components/PageFaq";

/**
 * Buduje schemat FAQPage z tej samej tablicy, którą renderuje `PageFaq`.
 *
 * Nie składaj schematu ręcznie obok listy pytań — Google wymaga pokrycia
 * danych strukturalnych w widocznej treści, a dwie kopie tych samych
 * odpowiedzi zawsze rozjeżdżają się przy pierwszej edycji.
 */
export function faqPageSchema(items: FaqEntry[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
    };
}
