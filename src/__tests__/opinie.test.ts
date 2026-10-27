import { describe, it, expect } from "vitest";
import { odmienOpinie } from "@/lib/polish-format";
import { staticGoogleReviews } from "@/data/google-reviews-static";
import { readFileSync } from "fs";
import { BUSINESS_RATING } from "@/lib/business-schema";
import { join } from "path";

describe("odmienOpinie", () => {
    it.each([
        [1, "opinia"], [2, "opinie"], [3, "opinie"], [4, "opinie"], [5, "opinii"],
        [11, "opinii"], [12, "opinii"], [13, "opinii"], [14, "opinii"], [21, "opinii"],
        [22, "opinie"], [24, "opinie"], [25, "opinii"], [102, "opinie"], [112, "opinii"],
    ])("%i -> %s", (n, oczekiwane) => {
        expect(odmienOpinie(n)).toBe(oczekiwane);
    });
});

describe("opinie z Google", () => {
    it("wszystkie mają autora, treść i ocenę", () => {
        expect(staticGoogleReviews.reviews.length).toBeGreaterThan(0);
        for (const r of staticGoogleReviews.reviews) {
            expect(r.author.length, r.author).toBeGreaterThan(2);
            expect(r.text.length, r.author).toBeGreaterThan(20);
            expect(r.rating, r.author).toBeGreaterThanOrEqual(1);
            expect(r.rating, r.author).toBeLessThanOrEqual(5);
        }
    });

    it("licznik zgadza się z liczbą przepisanych opinii", () => {
        // Po dopisaniu nowej opinii wystarczy podbić `total`, dane strukturalne biorą liczbę stąd.
        expect(staticGoogleReviews.total).toBe(staticGoogleReviews.reviews.length);
    });

    it("dane strukturalne podają tę samą liczbę opinii co strona", () => {
        expect(Number(BUSINESS_RATING.ratingCount)).toBe(staticGoogleReviews.total);
        expect(Number(BUSINESS_RATING.reviewCount)).toBe(staticGoogleReviews.total);
    });

    it("żadna strona nie wpisuje liczby opinii ręcznie, a layout (czyli blog) nie ma oceny", () => {
        const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf-8");
        expect(layout).not.toMatch(/aggregateRating/i);
        for (const page of ["page.tsx", "grafik-rzeszow/page.tsx", "logo/page.tsx", "strony-internetowe-rzeszow/page.tsx"]) {
            const src = readFileSync(join(process.cwd(), "src/app/(main)", page), "utf-8");
            expect(src, page).not.toMatch(/"ratingCount"/);
        }
    });

    it("ma działające odnośniki do profilu i wystawienia opinii", () => {
        expect(staticGoogleReviews.writeReviewUrl).toContain("writereview");
        expect(staticGoogleReviews.mapsUrl).toContain("cid=");
    });

    it("ocena zgadza się ze średnią z opinii", () => {
        const srednia =
            staticGoogleReviews.reviews.reduce((s, r) => s + r.rating, 0) /
            staticGoogleReviews.reviews.length;
        expect(staticGoogleReviews.rating).toBeCloseTo(srednia, 1);
    });
});
