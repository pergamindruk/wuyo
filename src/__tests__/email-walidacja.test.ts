import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail } from "@/lib/sanitize";

describe("isValidEmail", () => {
    it.each([
        "jan@example.com",
        "jan.kowalski@firma.com.pl",
        "j+tag@wuyo.pl",
        "biuro@sub.domena.pl",
    ])("przyjmuje poprawny adres: %s", (email) => {
        expect(isValidEmail(email)).toBe(true);
    });

    // Te formaty przechodziły przez poprzedni regex i dopiero dostawca poczty
    // je odrzucał — już po przyjęciu zgłoszenia od klienta.
    it.each([
        ["nawiasy kątowe", "<jan@example.com>"],
        ["nazwa z adresem", "Jan <jan@example.com>"],
        ["dwa adresy po przecinku", "jan@example.com,anna@example.com"],
        ["średnik", "jan@example.com;"],
        ["kropka na końcu domeny", "jan@example.com."],
        ["podwójna kropka", "jan..kowalski@example.com"],
        ["brak domeny najwyższego poziomu", "jan@example"],
        ["cudzysłów", '"jan"@example.com'],
        ["sama małpa", "@example.com"],
        ["pusty", ""],
        ["spacja w środku", "jan kowalski@example.com"],
    ])("odrzuca %s", (_opis, email) => {
        expect(isValidEmail(email)).toBe(false);
    });

    it("przyjmuje adres ze spacjami na brzegach — trim przed sprawdzeniem", () => {
        expect(isValidEmail("  jan@example.com  ")).toBe(true);
    });

    it("odrzuca wartości, które nie są tekstem", () => {
        expect(isValidEmail(undefined)).toBe(false);
        expect(isValidEmail(null)).toBe(false);
        expect(isValidEmail(["jan@example.com"])).toBe(false);
    });

    it("odrzuca adres dłuższy niż 254 znaki", () => {
        expect(isValidEmail("a".repeat(250) + "@example.com")).toBe(false);
    });
});

describe("normalizeEmail", () => {
    it("obcina spacje i sprowadza do małych liter", () => {
        expect(normalizeEmail("  Jan.Kowalski@Example.COM ")).toBe("jan.kowalski@example.com");
    });

    it("zwraca pusty tekst dla wartości nietekstowych", () => {
        expect(normalizeEmail(undefined)).toBe("");
        expect(normalizeEmail(42)).toBe("");
    });
});
