import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
const mockSendMail = vi.fn().mockResolvedValue({ messageId: "mock-id" });

vi.mock("nodemailer", () => ({
    default: {
        createTransport: vi.fn().mockReturnValue({ sendMail: mockSendMail }),
    },
}));

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

vi.mock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
    LIMITS: {
        chat:  { limit: 10, windowMs: 60_000 },
        brief: { limit: 5,  windowMs: 60_000 },
        lead:  { limit: 5,  windowMs: 60_000 },
        audit: { limit: 3,  windowMs: 60_000 },
    },
}));

function makeReq(body: unknown, path = "/api/chat"): NextRequest {
    return new NextRequest(`http://localhost${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

// ── /api/chat ────────────────────────────────────────────────────────────────
describe("/api/chat", () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        vi.clearAllMocks();
        process.env.WUYO_GEMINI_KEY = "test-key";
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                candidates: [{ content: { parts: [{ text: "Logo od 800 zł!" }] } }],
            }),
            text: async () => "",
        } as unknown as Response);

        const mod = await import("@/app/api/chat/route");
        POST = mod.POST;
    });

    afterEach(() => {
        delete process.env.WUYO_GEMINI_KEY;
        vi.resetModules();
    });

    it("TC-1 zwraca 200 z message gdy Gemini odpowiada poprawnie", async () => {
        const res = await POST(makeReq({ messages: [{ role: "user", content: "Cena logo?" }] }));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.message).toBe("Logo od 800 zł!");
        expect(body.lead).toBeNull();
    });

    it("TC-2 zwraca 400 gdy messages jest pustą tablicą", async () => {
        const res = await POST(makeReq({ messages: [] }));
        expect(res.status).toBe(400);
    });

    it("TC-3 zwraca 400 gdy brakuje pola messages", async () => {
        const res = await POST(makeReq({}));
        expect(res.status).toBe(400);
    });

    it("TC-4 zwraca 500 gdy brakuje WUYO_GEMINI_KEY", async () => {
        delete process.env.WUYO_GEMINI_KEY;
        const res = await POST(makeReq({ messages: [{ role: "user", content: "Test" }] }));
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toMatch(/konfiguracji/i);
    });

    it("TC-5 zwraca 429 gdy rate limit przekroczony", async () => {
        const { rateLimit } = await import("@/lib/rate-limit");
        vi.mocked(rateLimit).mockReturnValueOnce(false);
        const res = await POST(makeReq({ messages: [{ role: "user", content: "Test" }] }));
        expect(res.status).toBe(429);
        const body = await res.json();
        expect(body.error).toBe("RATE_LIMIT");
    });

    it("TC-6 zwraca 503 gdy Gemini upstream odpowiada 429 po retry", async () => {
        vi.useFakeTimers();
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            json: async () => ({ error: { details: [] } }),
            text: async () => "rate limit",
        } as unknown as Response);

        const resPromise = POST(makeReq({ messages: [{ role: "user", content: "Test" }] }));
        // Skip all retry delays
        await vi.runAllTimersAsync();
        const res = await resPromise;
        vi.useRealTimers();

        expect(res.status).toBe(503);
    });

    it("TC-7 wykrywa [LEAD:name:email] i usuwa go z odpowiedzi", async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({
                    candidates: [{ content: { parts: [{ text: "Super! Przygotuję wycenę. [LEAD:Marek:marek@test.pl]" }] } }],
                }),
                text: async () => "",
            } as unknown as Response)
            .mockResolvedValueOnce({ ok: true } as Response);

        const res = await POST(makeReq({ messages: [{ role: "user", content: "Marek, marek@test.pl" }] }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.message).not.toContain("[LEAD:");
        expect(body.message).toContain("Super!");
        expect(body.lead).toEqual({ name: "Marek", email: "marek@test.pl" });
    });
});

// ── /api/brief ───────────────────────────────────────────────────────────────
describe("/api/brief", () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        vi.clearAllMocks();
        process.env.GMAIL_USER = "test@gmail.com";
        process.env.GMAIL_APP_PASSWORD = "test-pass";
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
            text: async () => "",
        } as unknown as Response);

        const mod = await import("@/app/api/brief/route");
        POST = mod.POST;
    });

    afterEach(() => {
        delete process.env.GMAIL_USER;
        delete process.env.GMAIL_APP_PASSWORD;
        vi.resetModules();
    });

    it("TC-1 zwraca 200 i wysyła maile dla poprawnego briefu quick", async () => {
        const res = await POST(makeReq(
            { path: "quick", name: "Anna", email: "anna@test.pl", quickMessage: "Potrzebuję logo" },
            "/api/brief"
        ));
        const body = await res.json();
        expect(res.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
        expect(mockSendMail).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ to: "kontakt@wuyo.pl" })
        );
        expect(mockSendMail).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ to: "anna@test.pl" })
        );
    });

    it("TC-2 zwraca 400 gdy brakuje name lub email", async () => {
        const res = await POST(makeReq({ path: "quick", quickMessage: "Pytanie" }, "/api/brief"));
        expect(res.status).toBe(400);
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("TC-3 zapisuje lead do Supabase z poprawnym typem", async () => {
        await POST(makeReq(
            { path: "branding", name: "Piotr", email: "piotr@test.pl", companyName: "ACME" },
            "/api/brief"
        ));
        expect(mockFrom).toHaveBeenCalledWith("leads");
        expect(mockInsert).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ name: "Piotr", email: "piotr@test.pl", type: "Branding" }),
            ])
        );
    });

    it("TC-4 zwraca 429 gdy rate limit przekroczony", async () => {
        const { rateLimit } = await import("@/lib/rate-limit");
        vi.mocked(rateLimit).mockReturnValueOnce(false);
        const res = await POST(makeReq({ path: "quick", name: "X", email: "x@test.pl" }, "/api/brief"));
        expect(res.status).toBe(429);
    });

    it("TC-5 zwraca 500 gdy nodemailer rzuca wyjątek", async () => {
        mockSendMail.mockRejectedValueOnce(new Error("SMTP failed"));
        const res = await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(500);
    });

    it("TC-6 wysyła maile nawet gdy Supabase zwraca błąd (graceful degrade)", async () => {
        mockInsert.mockResolvedValueOnce({ data: null, error: { message: "DB down" } });
        const res = await POST(makeReq(
            { path: "quick", name: "Maria", email: "maria@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
    });
});
