import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import { join } from "path";
import { ROUTES, alternatesFor, counterpartPath, localeFromPath } from "@/lib/i18n";
import { getAllPosts, getBlogPairs } from "@/lib/blog";

const APP = join(process.cwd(), "src/app");

/** Ścieżka URL -> plik page.tsx (polskie strony siedzą w grupie (main)). */
function pageFile(url: string): string {
    if (url === "/") return join(APP, "(main)", "page.tsx");
    if (url.startsWith("/en")) return join(APP, ...url.split("/").filter(Boolean), "page.tsx");
    return join(APP, "(main)", ...url.split("/").filter(Boolean), "page.tsx");
}

describe("wersje językowe", () => {
    it("każda para w ROUTES ma obie strony — przełącznik nie prowadzi do 404", () => {
        for (const [key, pair] of Object.entries(ROUTES)) {
            expect(existsSync(pageFile(pair.pl)), `${key}: brak ${pair.pl}`).toBe(true);
            expect(existsSync(pageFile(pair.en)), `${key}: brak ${pair.en}`).toBe(true);
        }
    });

    it("rozpoznaje język z adresu", () => {
        expect(localeFromPath("/en")).toBe("en");
        expect(localeFromPath("/en/logo-design")).toBe("en");
        expect(localeFromPath("/")).toBe("pl");
        expect(localeFromPath("/energia")).toBe("pl");
    });

    it("odpowiednik strony w drugim języku", () => {
        expect(counterpartPath("/logo", "en")).toBe("/en/logo-design");
        expect(counterpartPath("/en/logo-design/", "pl")).toBe("/logo");
        expect(counterpartPath("/blog/ile-kosztuje-logo", "en")).toBeNull();
    });

    it("hreflang: x-default wskazuje polską wersję", () => {
        const a = alternatesFor("websites", "en");
        expect(a.canonical).toBe("https://wuyo.pl/en/websites");
        expect(a.languages["x-default"]).toBe("https://wuyo.pl/strony-www");
        expect(a.languages["pl-PL"]).toBe("https://wuyo.pl/strony-www");
    });

    it("każdy angielski wpis wskazuje istniejący polski oryginał", () => {
        const pl = new Set(getAllPosts("pl").map((p) => p.slug));
        for (const post of getAllPosts("en")) {
            expect(post.translationOf, `${post.slug} bez translationOf`).toBeTruthy();
            expect(pl.has(post.translationOf ?? ""), `${post.slug} -> ${post.translationOf}`).toBe(true);
        }
        // Jedno tłumaczenie na oryginał, inaczej hreflang wskazywałby dwie strony.
        expect(Object.keys(getBlogPairs()).length).toBe(getAllPosts("en").length);
    });
});
