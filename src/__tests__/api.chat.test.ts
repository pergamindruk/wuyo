import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
const mockSendMail = vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null });

vi.mock("resend", () => ({
    Resend: class {
        emails = { send: mockSendMail };
    },
}));

// after() działa tylko w prawdziwym żądaniu Next — w testach wykonujemy callback od razu.
const { mockAfter } = vi.hoisted(() => ({ mockAfter: vi.fn((cb: () => unknown) => { void cb(); }) }));
vi.mock("next/server", async (importOriginal) => ({
    ...(await importOriginal<typeof import("next/server")>()),
    after: mockAfter,
}));

// Trasy publiczne zapisują leady kluczem serwisowym, nie klientem z ciasteczek —
// tabela `leads` ma RLS i anon nie ma do niej żadnej polityki.
vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

vi.mock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn().mockResolvedValue(true),
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
        vi.mocked(rateLimit).mockResolvedValueOnce(false);
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
        expect(mockAfter).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenLastCalledWith("http://localhost/api/lead", expect.objectContaining({ method: "POST" }));
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
        vi.mocked(rateLimit).mockResolvedValueOnce(false);
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

    it("TC-7 cicho odrzuca bota, który wypełnił honeypot", async () => {
        const res = await POST(makeReq(
            { path: "quick", name: "Bot", email: "bot@test.pl", hp: "http://spam.example" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("TC-8 zwraca 400 z komunikatem o imieniu, gdy jest tylko e-mail", async () => {
        const res = await POST(makeReq({ path: "quick", email: "anna@test.pl" }, "/api/brief"));
        const body = await res.json();
        expect(res.status).toBe(400);
        expect(body.error).toMatch(/imię/i);
        expect(mockInsert).not.toHaveBeenCalled();
    });

    it.each([
        "anna@",
        "anna@test",
        "anna test@test.pl",
        "<anna@test.pl>",
        "a..b@test.pl",
        "anna@test.pl, inny@test.pl",
    ])("TC-9 zwraca 400 dla błędnego adresu %s i niczego nie zapisuje", async (email) => {
        const res = await POST(makeReq({ path: "quick", name: "Anna", email }, "/api/brief"));
        const body = await res.json();
        expect(res.status).toBe(400);
        expect(body.error).toMatch(/e-mail/i);
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("TC-10 normalizuje adres ze spacjami i wielkimi literami", async () => {
        const res = await POST(makeReq(
            { path: "quick", name: "Anna", email: "  Anna@Test.PL ", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({ email: "anna@test.pl" })]);
        expect(mockSendMail).toHaveBeenNthCalledWith(1, expect.objectContaining({ replyTo: "anna@test.pl" }));
        expect(mockSendMail).toHaveBeenNthCalledWith(2, expect.objectContaining({ to: "anna@test.pl" }));
    });

    it("TC-11 escapuje HTML od klienta w obu mailach", async () => {
        await POST(makeReq(
            {
                path: "quick",
                name: "<script>alert(1)</script>",
                email: "anna@test.pl",
                quickMessage: "<img src=x onerror=alert(1)>",
                note: "<b>pilne</b>",
            },
            "/api/brief"
        ));
        const [powiadomienie, autoodpowiedz] = mockSendMail.mock.calls.map(([p]) => p.html as string);
        for (const html of [powiadomienie, autoodpowiedz]) {
            expect(html).not.toContain("<script>");
            expect(html).toContain("&lt;script&gt;");
        }
        expect(powiadomienie).not.toContain("<img src=x");
        expect(powiadomienie).toContain("&lt;img src=x onerror=alert(1)&gt;");
        expect(powiadomienie).toContain("&lt;b&gt;pilne&lt;/b&gt;");
    });

    it("TC-12 zwraca 500 gdy Resend odrzuca wysyłkę bez wyjątku", async () => {
        mockSendMail.mockResolvedValueOnce({ data: null, error: { message: "domain is not verified" } });
        const res = await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(500);
        expect(mockSendMail).toHaveBeenCalledTimes(1);
    });

    it("TC-13 ponawia powiadomienie bez reply_to, gdy poczta odrzuca adres klienta", async () => {
        mockSendMail.mockResolvedValueOnce({ data: null, error: { message: "Invalid `reply_to` field" } });
        const res = await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledTimes(3);
        const ponowna = mockSendMail.mock.calls[1][0];
        expect(ponowna).toEqual(expect.objectContaining({ to: "kontakt@wuyo.pl" }));
        expect(ponowna).not.toHaveProperty("replyTo");
        // adres klienta zostaje w treści, więc da się odpisać ręcznie
        expect(ponowna.html).toContain("jan@test.pl");
    });

    it("TC-14 zwraca 200 gdy Mailerlite nie działa", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("network down"));
        const res = await POST(makeReq(
            { path: "quick", name: "Ola", email: "ola@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it("TC-15 ścieżka web: typ leada, temat i etykiety zamiast kluczy", async () => {
        await POST(makeReq(
            { path: "web", name: "Ewa Nowak", email: "ewa@test.pl", siteType: "landing", hasBranding: "nie" },
            "/api/brief"
        ));
        expect(mockInsert).toHaveBeenCalledWith([expect.objectContaining({ type: "Strona WWW" })]);
        const powiadomienie = mockSendMail.mock.calls[0][0];
        expect(powiadomienie.subject).toContain("Strona WWW — Ewa Nowak");
        expect(powiadomienie.html).toContain("Landing Page");
        expect(powiadomienie.html).toContain("Nie, budujemy od zera");
        expect(mockSendMail.mock.calls[1][0].subject).toContain("Cześć Ewa!");
    });

    it("TC-16 zapisuje budżet i notatkę w szczegółach leada", async () => {
        await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", budget: "2000-3000 zł", note: "Na już" },
            "/api/brief"
        ));
        expect(mockInsert).toHaveBeenCalledWith([
            expect.objectContaining({ details: "Budżet: 2000-3000 zł. Notatka: Na już" }),
        ]);
    });

    it("TC-17 zapisuje treść briefu w bazie, nie tylko w mailu", async () => {
        await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", quickMessage: "Potrzebuję logo dla piekarni" },
            "/api/brief"
        ));
        expect(mockInsert).toHaveBeenCalledWith([
            expect.objectContaining({
                details: "Budżet: Brak. Notatka: Brak | Wiadomość: Potrzebuję logo dla piekarni",
            }),
        ]);
    });

    it("TC-18 ścieżka branding: wypełnione pola trafiają do szczegółów, puste nie", async () => {
        await POST(makeReq(
            {
                path: "branding", name: "Piotr", email: "piotr@test.pl",
                companyName: "ACME", industry: "Piekarnia", audience: ["Rodziny", "Firmy"], inspiration: "  ",
            },
            "/api/brief"
        ));
        const { details } = mockInsert.mock.calls[0][0][0];
        expect(details).toContain("Nazwa firmy/marki: ACME");
        expect(details).toContain("Branża / co robi: Piekarnia");
        expect(details).toContain("Grupa docelowa: Rodziny, Firmy");
        expect(details).not.toContain("Inspiracje");
    });

    it("TC-19 ścieżka web: w szczegółach etykiety, nie klucze", async () => {
        await POST(makeReq(
            { path: "web", name: "Ewa", email: "ewa@test.pl", siteType: "sklep", hasBranding: "tak_czesc" },
            "/api/brief"
        ));
        const { details } = mockInsert.mock.calls[0][0][0];
        expect(details).toContain("Typ strony: Sklep internetowy");
        expect(details).toContain("Posiadany branding: Mam tylko logo, reszta do ustalenia");
    });

    it("TC-20 przycina bardzo długą treść i zapisuje lead mimo błędnych typów pól", async () => {
        const res = await POST(makeReq(
            { path: "branding", name: "Jan", email: "jan@test.pl", companyName: 123, audience: "nie-tablica", inspiration: "x".repeat(5000) },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        const { details } = mockInsert.mock.calls[0][0][0];
        expect(details).toHaveLength(2000);
        expect(details).toContain("Nazwa firmy/marki: 123");
    });

    it("TC-21 zwraca 200 gdy powiadomienie doszło, a autoodpowiedź nie", async () => {
        mockSendMail
            .mockResolvedValueOnce({ data: { id: "ok" }, error: null })
            .mockResolvedValueOnce({ data: null, error: { message: "mailbox unavailable" } });
        const res = await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it("TC-22 wysyła maile gdy nie da się utworzyć klienta bazy", async () => {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        vi.mocked(createAdminClient).mockImplementationOnce(() => { throw new Error("Brak kluczy"); });
        const res = await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it("TC-23 wysyła maile gdy zapis do bazy rzuca wyjątek", async () => {
        mockInsert.mockRejectedValueOnce(new Error("fetch failed"));
        const res = await POST(makeReq(
            { path: "quick", name: "Jan", email: "jan@test.pl", quickMessage: "Test" },
            "/api/brief"
        ));
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
    });
});

// ── /api/chat: przeciążenie Gemini i bezpieczeństwo klucza ──────────────────
describe("/api/chat odporność", () => {
    let POST: (req: NextRequest) => Promise<Response>;
    const ok = (text: string) => ({
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
        text: async () => "",
    } as unknown as Response);
    const overloaded = {
        ok: false,
        status: 503,
        json: async () => ({ error: { code: 503 } }),
        text: async () => "high demand",
    } as unknown as Response;

    beforeEach(async () => {
        vi.clearAllMocks();
        process.env.WUYO_GEMINI_KEY = "test-key";
        POST = (await import("@/app/api/chat/route")).POST;
    });

    afterEach(() => {
        delete process.env.WUYO_GEMINI_KEY;
        vi.useRealTimers();
        vi.resetModules();
    });

    it("TC-R1 przy 503 ponawia, a potem przechodzi na model zapasowy", async () => {
        vi.useFakeTimers();
        global.fetch = vi.fn()
            .mockResolvedValueOnce(overloaded)
            .mockResolvedValueOnce(overloaded)
            .mockResolvedValueOnce(ok("Odpowiedź z zapasowego"));

        const resPromise = POST(makeReq({ messages: [{ role: "user", content: "Cena logo?" }] }));
        await vi.runAllTimersAsync();
        const res = await resPromise;

        expect(res.status).toBe(200);
        expect((await res.json()).message).toBe("Odpowiedź z zapasowego");
        const urls = vi.mocked(global.fetch).mock.calls.map((c) => String(c[0]));
        expect(urls[0]).toContain("gemini-2.5-flash:");
        expect(urls[2]).toContain("gemini-3.5-flash-lite:");
    });

    it("TC-R2 zwraca RATE_LIMIT (503), gdy wszystkie próby są przeciążone", async () => {
        vi.useFakeTimers();
        global.fetch = vi.fn().mockResolvedValue(overloaded);

        const resPromise = POST(makeReq({ messages: [{ role: "user", content: "Test" }] }));
        await vi.runAllTimersAsync();
        const res = await resPromise;

        expect(res.status).toBe(503);
        expect((await res.json()).error).toBe("RATE_LIMIT");
    });

    it("TC-R3 wysyła klucz w nagłówku, nigdy w adresie", async () => {
        global.fetch = vi.fn().mockResolvedValue(ok("Hej"));
        await POST(makeReq({ messages: [{ role: "user", content: "Test" }] }));

        const [url, init] = vi.mocked(global.fetch).mock.calls[0];
        expect(String(url)).not.toContain("test-key");
        expect((init as RequestInit).headers).toMatchObject({ "x-goog-api-key": "test-key" });
    });

    it("TC-R4 pusta odpowiedź AI daje komunikat zamiast pustego dymka", async () => {
        global.fetch = vi.fn().mockResolvedValue(ok(""));
        const res = await POST(makeReq({ messages: [{ role: "user", content: "Test" }] }));
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body.message.length).toBeGreaterThan(10);
    });

    it("TC-R5 skleja wiele części odpowiedzi i pomija notatki modelu", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ candidates: [{ content: { parts: [
                { text: "myślę...", thought: true },
                { text: "Logo " },
                { text: "od 890 zł." },
            ] } }] }),
            text: async () => "",
        } as unknown as Response);

        const res = await POST(makeReq({ messages: [{ role: "user", content: "Cena?" }] }));
        expect((await res.json()).message).toBe("Logo od 890 zł.");
    });
});

// ── prompt czatu: ceny ukryte, dopóki cennik jest ukryty na stronie ────────
describe("prompt czatu", () => {
    it("TC-P1 bez SHOW_PRICES nie zawiera żadnej kwoty ani nazw pakietów", async () => {
        const { CHAT_SYSTEM_PROMPT, SHOW_PRICES } = await import("@/lib/chat-prompt");
        if (SHOW_PRICES) return;
        expect(CHAT_SYSTEM_PROMPT).not.toMatch(/\d\s*zł/);
        expect(CHAT_SYSTEM_PROMPT).not.toMatch(/Marka Mini|Marka Start/);
        expect(CHAT_SYSTEM_PROMPT).toContain("kontakt@wuyo.pl");
        expect(CHAT_SYSTEM_PROMPT).not.toContain("${");
    });
});
