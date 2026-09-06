import { describe, it, expect } from "vitest";
import { extractFaq, getAllPosts, getPost } from "@/lib/blog";

describe("extractFaq", () => {
    it("wyciąga pary pytanie/odpowiedź z sekcji FAQ", () => {
        const faq = extractFaq(
            "## Wstęp\n\nTekst.\n\n## FAQ\n\n**Ile to kosztuje?**\n\nOd 99 zł.\n\n**Jak długo trwa?**\n\n1–3 dni robocze.\n"
        );
        expect(faq).toEqual([
            { question: "Ile to kosztuje?", answer: "Od 99 zł." },
            { question: "Jak długo trwa?", answer: "1–3 dni robocze." },
        ]);
    });

    it("czyści markdown z odpowiedzi (linki, pogrubienia)", () => {
        const faq = extractFaq("## FAQ\n\n**Gdzie oferta?**\n\nNa stronie [druk w Rzeszowie](/druk-rzeszow) — **konkretnie**.\n");
        expect(faq[0].answer).toBe("Na stronie druk w Rzeszowie — konkretnie.");
    });

    it("zatrzymuje się na kolejnym nagłówku H2", () => {
        const faq = extractFaq("## FAQ\n\n**Pytanie?**\n\nOdpowiedź.\n\n## Kontakt\n\n**To nie jest pytanie**\n\nTekst.\n");
        expect(faq).toHaveLength(1);
    });

    it("zwraca pustą tablicę gdy artykuł nie ma sekcji FAQ", () => {
        expect(extractFaq("## Wstęp\n\nTekst bez FAQ.\n")).toEqual([]);
    });
});

describe("artykuły na blogu", () => {
    it("każdy wpis z sekcją FAQ daje poprawne dane strukturalne", () => {
        const withFaq = getAllPosts()
            .map((meta) => ({ slug: meta.slug, faq: extractFaq(getPost(meta.slug).content) }))
            .filter((post) => post.faq.length > 0);

        expect(withFaq.length).toBeGreaterThan(0);
        for (const post of withFaq) {
            for (const item of post.faq) {
                expect(item.question, post.slug).toMatch(/\?$/);
                expect(item.answer.length, post.slug).toBeGreaterThan(20);
                expect(item.answer, post.slug).not.toContain("**");
            }
        }
    });
});

describe("getImageSize", () => {
    it("czyta prawdziwe wymiary z pliku WebP", async () => {
        const { getImageSize } = await import("@/lib/blog");
        expect(getImageSize("/realizacje/memorial-wizytowka-mockup.webp")).toEqual({ width: 1600, height: 1138 });
        expect(getImageSize("/realizacje/projekt-etykiet.webp")).toEqual({ width: 864, height: 1184 });
        expect(getImageSize("/realizacje/cg-tshirt.webp")).toEqual({ width: 1400, height: 933 });
    });

    it("zwraca undefined dla nieistniejącego pliku", async () => {
        const { getImageSize } = await import("@/lib/blog");
        expect(getImageSize("/realizacje/nie-ma-takiego-pliku.webp")).toBeUndefined();
    });

    it("każdy wpis ze zdjęciem ma poprawne wymiary i alt", () => {
        const withImage = getAllPosts().map((m) => getPost(m.slug)).filter((p) => p.image);
        expect(withImage.length).toBeGreaterThan(0);
        for (const post of withImage) {
            expect(post.imageSize, post.slug).toBeDefined();
            expect(post.imageSize!.width, post.slug).toBeGreaterThan(100);
            expect(post.imageAlt, post.slug).toBeTruthy();
        }
    });
});
