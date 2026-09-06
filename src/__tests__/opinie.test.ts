import { describe, it, expect } from "vitest";
import fs from "fs";

// Funkcja odmiany siedzi w komponencie serwerowym — testujemy ją w izolacji,
// wyciągając czystą logikę, żeby nie ładować całego drzewa Reacta.
const src = fs.readFileSync("src/components/GoogleReviews.tsx", "utf-8");
const body = src.slice(src.indexOf("function odmienOpinie"), src.indexOf("/** Rządek gwiazdek"));
const odmienOpinie = new Function(
    body.replace(/: number/g, "").replace(/: string/g, "") + "\nreturn odmienOpinie;"
)() as (n: number) => string;

describe("odmienOpinie", () => {
    it.each([
        [1, "opinia"],
        [2, "opinie"],
        [3, "opinie"],
        [4, "opinie"],
        [5, "opinii"],
        [11, "opinii"],
        [12, "opinii"],
        [13, "opinii"],
        [14, "opinii"],
        [21, "opinii"],
        [22, "opinie"],
        [24, "opinie"],
        [25, "opinii"],
        [102, "opinie"],
        [112, "opinii"],
    ])("%i -> %s", (n, oczekiwane) => {
        expect(odmienOpinie(n)).toBe(oczekiwane);
    });
});
