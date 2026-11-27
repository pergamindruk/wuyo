import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSendEmail, mockInsert, mockUpdate, mockUpdateEq, existing } = vi.hoisted(() => {
    const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
    return {
        mockSendEmail: vi.fn().mockResolvedValue(undefined),
        mockInsert: vi.fn().mockResolvedValue({ error: null }),
        mockUpdateEq,
        mockUpdate: vi.fn(() => ({ eq: mockUpdateEq })),
        existing: { row: null as { id: string } | null },
    };
});

vi.mock("@/lib/email", () => ({
    sendEmail: mockSendEmail,
    FROM_NOTIFICATION: "WUYO Formularz <formularz@wuyo.pl>",
    TO_MATEUSZ: "kontakt@wuyo.pl",
}));
vi.mock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn().mockResolvedValue(true),
    LIMITS: { lead: { limit: 5, windowMs: 60_000 } },
}));
vi.mock("@/lib/visitor", () => ({
    sourceForVisitor: vi.fn().mockResolvedValue("Google (wyszukiwarka)"),
}));
vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: () => ({
        from: () => ({
            select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: existing.row }) }) }),
            insert: mockInsert,
            update: mockUpdate,
        }),
    }),
}));

import { chatTranscript, isChatId, saveChatLead, updateChatTranscript, type ChatMessage } from "@/lib/chat-lead";

const CHAT_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";
const ROZMOWA: ChatMessage[] = [
    { role: "assistant", content: "Hej! 👋 Jak mogę pomóc?" },
    { role: "user", content: "Potrzebuję logo dla <piekarni>" },
    { role: "assistant", content: "Jasne. Zostaw imię i e-mail." },
    { role: "user", content: "Agnieszka, aga@test.pl" },
    { role: "assistant", content: "Dzięki, odezwę się. [LEAD:Agnieszka:aga@test.pl]" },
];

describe("chatTranscript", () => {
    it("zaczyna od pierwszej wiadomości klienta, podpisuje strony i usuwa znacznik LEAD", () => {
        expect(chatTranscript(ROZMOWA)).toBe(
            "Klient: Potrzebuję logo dla <piekarni>\n\n" +
            "Czat: Jasne. Zostaw imię i e-mail.\n\n" +
            "Klient: Agnieszka, aga@test.pl\n\n" +
            "Czat: Dzięki, odezwę się.",
        );
    });

    it("zwraca pusty tekst, gdy klient nic nie napisał", () => {
        expect(chatTranscript([{ role: "assistant", content: "Hej!" }])).toBe("");
    });
});

describe("isChatId", () => {
    it("przyjmuje UUID i odrzuca dziwne wartości", () => {
        expect(isChatId(CHAT_ID)).toBe(true);
        expect(isChatId("abc")).toBe(false);
        expect(isChatId("x'; drop table leads;--")).toBe(false);
        expect(isChatId(123)).toBe(false);
    });
});

describe("saveChatLead", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        existing.row = null;
    });

    const input = { name: "Agnieszka", email: "aga@test.pl", chatId: CHAT_ID, messages: ROZMOWA, visitor: "v1", ip: "1.2.3.4" };

    it("nowy lead: zapisuje rozmowę z chat_id i źródłem, wysyła mail z rozmową", async () => {
        await saveChatLead(input);

        expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({
            name: "Agnieszka",
            email: "aga@test.pl",
            type: "Chatbot",
            chat_id: CHAT_ID,
            visitor: "v1",
            source: "Google (wyszukiwarka)",
            details: chatTranscript(ROZMOWA),
        })]);
        expect(mockSendEmail).toHaveBeenCalledTimes(1);
        const [payload, context] = mockSendEmail.mock.calls[0];
        expect(context).toBe("lead-powiadomienie");
        expect(payload.replyTo).toBe("aga@test.pl");
        expect(payload.html).toContain("Potrzebuję logo dla &lt;piekarni&gt;");
        expect(payload.html).not.toContain("[LEAD:");
    });

    it("ten sam czat drugi raz: aktualizuje leada i nie wysyła drugiego maila", async () => {
        existing.row = { id: "lead-1" };
        await saveChatLead(input);

        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ details: chatTranscript(ROZMOWA) }));
        expect(mockUpdateEq).toHaveBeenCalledWith("id", "lead-1");
        expect(mockSendEmail).not.toHaveBeenCalled();
    });

    it("zły e-mail: nic nie zapisuje", async () => {
        await saveChatLead({ ...input, email: "nie-mail" });
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockSendEmail).not.toHaveBeenCalled();
    });
});

describe("updateChatTranscript", () => {
    beforeEach(() => vi.clearAllMocks());

    it("dopisuje rozmowę do leada po chat_id", async () => {
        await updateChatTranscript(CHAT_ID, ROZMOWA);
        expect(mockUpdate).toHaveBeenCalledWith({ details: chatTranscript(ROZMOWA) });
        expect(mockUpdateEq).toHaveBeenCalledWith("chat_id", CHAT_ID);
    });

    it("bez e-maila w wiadomościach klienta nie pyta bazy", async () => {
        await updateChatTranscript(CHAT_ID, ROZMOWA.slice(0, 3));
        expect(mockUpdate).not.toHaveBeenCalled();
    });
});
