import { describe, it, expect } from "vitest";
import { odmienOpinie } from "@/lib/polish-format";
import { staticGoogleReviews } from "@/data/google-reviews-static";

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
        expect(staticGoogleReviews.reviews).toHaveLength(5);
        for (const r of staticGoogleReviews.reviews) {
            expect(r.author.length, r.author).toBeGreaterThan(2);
            expect(r.text.length, r.author).toBeGreaterThan(20);
            expect(r.rating, r.author).toBeGreaterThanOrEqual(1);
            expect(r.rating, r.author).toBeLessThanOrEqual(5);
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
