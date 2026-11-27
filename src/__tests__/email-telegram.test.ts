import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSend, mockTelegram } = vi.hoisted(() => ({
    mockSend: vi.fn().mockResolvedValue({ data: { id: "mail-1" }, error: null }),
    mockTelegram: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("resend", () => ({
    Resend: class {
        emails = { send: mockSend };
    },
}));
vi.mock("@/lib/lab/doradca/telegram", () => ({ powiadomWlasciciela: mockTelegram }));

import { sendEmail, telegramTekst, TO_MATEUSZ } from "@/lib/email";

describe("powiadomienia na Telegram", () => {
    beforeEach(() => vi.clearAllMocks());

    it("wysyła tylko rodzaj zdarzenia i imię, bez maila i treści", async () => {
        await sendEmail({
            from: "WUYO <formularz@wuyo.pl>",
            to: TO_MATEUSZ,
            subject: "🔥 Nowy lead z chatbota: Agnieszka",
            html: "<p>aga@test.pl</p><p>Klient: potrzebuję logo dla piekarni</p>",
        }, "lead-powiadomienie", "Agnieszka");

        expect(mockTelegram).toHaveBeenCalledWith("🔥 Nowy lead z czatu: Agnieszka\nSzczegóły w mailu i w panelu /lab.");
        const tekst = String(mockTelegram.mock.calls[0][0]);
        expect(tekst).not.toContain("@");
        expect(tekst).not.toContain("piekarni");
    });

    it("bez imienia zostaje sama etykieta", () => {
        expect(telegramTekst("⬇️ Ktoś pobrał plik", null)).toBe("⬇️ Ktoś pobrał plik\nSzczegóły w mailu i w panelu /lab.");
    });

    it("maile spoza listy nie idą na Telegram", async () => {
        await sendEmail({ from: "a@wuyo.pl", to: TO_MATEUSZ, subject: "x", html: "<p>x</p>" }, "inny-mail", "Jan");
        expect(mockTelegram).not.toHaveBeenCalled();
    });
});
