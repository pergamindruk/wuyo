import { describe, it, expect } from "vitest";
import { odmienOpinie, odstepCzasu } from "@/lib/polish-format";
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

function dniTemu(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

describe("odstepCzasu", () => {
    it("mniej niż dwa tygodnie", () => expect(odstepCzasu(dniTemu(3))).toBe("w tym tygodniu"));
    it("kilka tygodni", () => expect(odstepCzasu(dniTemu(20))).toMatch(/tyg\. temu$/));
    it("jeden miesiąc", () => expect(odstepCzasu(dniTemu(32))).toBe("miesiąc temu"));
    it("dwa miesiące", () => expect(odstepCzasu(dniTemu(61))).toBe("2 miesiące temu"));
    it("pięć miesięcy", () => expect(odstepCzasu(dniTemu(152))).toBe("5 miesięcy temu"));
    it("rok", () => expect(odstepCzasu(dniTemu(400))).toBe("rok temu"));
    it("dwa lata", () => expect(odstepCzasu(dniTemu(800))).toBe("2 lata temu"));
    it("brak lub błędna data nie wywala widoku", () => {
        expect(odstepCzasu(undefined)).toBe("");
        expect(odstepCzasu("nie-data")).toBe("");
    });
});

describe("statyczne opinie Google", () => {
    it("wszystkie mają autora, treść, ocenę i poprawną datę", () => {
        expect(staticGoogleReviews.reviews).toHaveLength(5);
        for (const r of staticGoogleReviews.reviews) {
            expect(r.author.length, r.author).toBeGreaterThan(2);
            expect(r.text.length, r.author).toBeGreaterThan(20);
            expect(r.rating, r.author).toBeGreaterThanOrEqual(1);
            expect(Number.isNaN(new Date(r.publishTime!).getTime()), r.author).toBe(false);
            // Data z przyszłości oznaczałaby pusty odstęp czasu w widoku.
            expect(odstepCzasu(r.publishTime), r.author).not.toBe("");
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
