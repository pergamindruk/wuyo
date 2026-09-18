import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Pilnuje jednej konkretnej pułapki, która wysypała produkcję 18.09.2026.
 *
 * `redirect()` w akcji serwerowej Next przekazuje adres w nagłówku HTTP
 * `x-action-redirect`. Nagłówki przyjmują tylko ASCII, więc polski znak
 * w adresie kończy się błędem ERR_INVALID_CHAR i odpowiedzią 500 — użytkownik
 * widzi „Coś poszło nie tak" bez żadnej wskazówki, co się stało.
 *
 * Test skanuje źródła, a nie zachowanie, bo błąd powstaje na etapie pisania
 * adresu — zanim cokolwiek da się wywołać.
 */

function plikiZAkcjami(katalog: string): string[] {
    const wynik: string[] = [];
    for (const wpis of fs.readdirSync(katalog, { withFileTypes: true })) {
        const sciezka = path.join(katalog, wpis.name);
        if (wpis.isDirectory()) {
            wynik.push(...plikiZAkcjami(sciezka));
        } else if (/\.tsx?$/.test(wpis.name)) {
            const tresc = fs.readFileSync(sciezka, "utf-8");
            if (tresc.includes("'use server'") || tresc.includes('"use server"')) {
                wynik.push(sciezka);
            }
        }
    }
    return wynik;
}

describe("przekierowania w akcjach serwerowych", () => {
    const pliki = plikiZAkcjami(path.join(process.cwd(), "src/app"));

    it("znajduje pliki z akcjami serwerowymi", () => {
        expect(pliki.length).toBeGreaterThan(0);
    });

    it.each(pliki.map((p) => path.relative(process.cwd(), p)))(
        "%s nie przekierowuje na adres z polskimi znakami",
        (wzgledna) => {
            const tresc = fs.readFileSync(path.join(process.cwd(), wzgledna), "utf-8");
            // Wyłapuje redirect('...') i redirect("...") — pomija szablony z backtickami,
            // bo tam adres składa się dopiero w trakcie działania (i tam używamy
            // encodeURIComponent).
            const adresy = [...tresc.matchAll(/\bredirect\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
            const zPolskimi = adresy.filter((a) => /[^\x20-\x7E]/.test(a));

            expect(
                zPolskimi,
                `Adres w redirect() musi być ASCII — użyj encodeURIComponent na komunikacie. Znalezione: ${zPolskimi.join(", ")}`
            ).toEqual([]);
        }
    );
});
