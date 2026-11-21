import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockSendMail = vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null });
vi.mock("resend", () => ({
    Resend: class {
        emails = { send: mockSendMail };
    },
}));

// Łańcuch zapytania o duplikat: from().select().eq().eq().eq().gte().limit()
const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });
const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    gte: vi.fn(() => query),
    limit: mockLimit,
};
const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn(() => ({ ...query, insert: mockInsert }));

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: vi.fn(() => ({ from: mockFrom })),
}));
vi.mock("@/lib/visitor", () => ({
    visitorId: vi.fn().mockReturnValue("v1"),
    sourceForVisitor: vi.fn().mockResolvedValue("google"),
}));
vi.mock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn().mockResolvedValue(true),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
    LIMITS: { brief: { limit: 5, windowMs: 60_000 } },
}));

function makeReq(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const ok = {
    name: "Jan Kowalski",
    email: " Jan@Test.PL ",
    note: "Na piątek",
    items: [
        { productId: "wizytowki", productName: "Wizytówki", qty: "100 szt.", price: "1 zł", priceNum: 1, withDesign: true },
    ],
};

describe("/api/order", () => {
    let POST: (req: NextRequest) => Promise<Response>;

    beforeEach(async () => {
        vi.clearAllMocks();
        mockLimit.mockResolvedValue({ data: [], error: null });
        mockInsert.mockResolvedValue({ data: null, error: null });
        POST = (await import("@/app/api/order/route")).POST;
    });

    afterEach(() => {
        vi.resetModules();
    });

    it("TC-1 zapisuje zamówienie w leads z ceną z serwera, nie z przeglądarki", async () => {
        const res = await POST(makeReq(ok));
        expect(res.status).toBe(200);
        expect(mockFrom).toHaveBeenCalledWith("leads");
        expect(mockInsert).toHaveBeenCalledTimes(1);
        const lead = mockInsert.mock.calls[0][0][0];
        expect(lead).toEqual(expect.objectContaining({
            name: "Jan Kowalski",
            email: "jan@test.pl",
            type: "Zamówienie druku",
            visitor: "v1",
            source: "google",
        }));
        // 159 zł druk + 190 zł projekt (designFee produktu), a nie 1 zł z żądania
        expect(lead.details).toContain("Wizytówki (100 szt., z projektem): 349 zł");
        expect(lead.details).toContain("Suma orientacyjna: 349 zł");
        expect(lead.details).toContain("Notatka: Na piątek");
        expect(mockSendMail).toHaveBeenCalledTimes(2);
        expect(mockSendMail.mock.calls[0][0].html).toContain("349 zł");
        expect(mockSendMail.mock.calls[0][0].html).not.toContain(">1 zł<");
    });

    it("TC-2 odrzuca pozycję spoza oferty i niczego nie zapisuje", async () => {
        const res = await POST(makeReq({ ...ok, items: [{ productId: "wizytowki", qty: "1 szt.", priceNum: 1 }] }));
        expect(res.status).toBe(400);
        expect((await res.json()).error).toMatch(/nieaktualna/);
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("TC-3 ten sam koszyk w krótkim czasie nie dubluje wpisu ani maili", async () => {
        mockLimit.mockResolvedValueOnce({ data: [{ id: "l1" }], error: null });
        const res = await POST(makeReq(ok));
        expect(res.status).toBe(200);
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("TC-4 błąd bazy nie blokuje maili", async () => {
        mockInsert.mockResolvedValueOnce({ data: null, error: { message: "DB down" } });
        const res = await POST(makeReq(ok));
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it("TC-5 błąd potwierdzenia dla klienta nie zwraca 500", async () => {
        mockSendMail
            .mockResolvedValueOnce({ data: { id: "a" }, error: null })
            .mockRejectedValueOnce(new Error("SMTP"));
        const res = await POST(makeReq(ok));
        expect(res.status).toBe(200);
    });

    it("TC-6 honeypot: cicho odrzuca bota", async () => {
        const res = await POST(makeReq({ ...ok, hp: "spam" }));
        expect(res.status).toBe(200);
        expect(mockInsert).not.toHaveBeenCalled();
        expect(mockSendMail).not.toHaveBeenCalled();
    });

    it("TC-7 pusty koszyk i zły e-mail dają 400", async () => {
        expect((await POST(makeReq({ ...ok, items: [] }))).status).toBe(400);
        expect((await POST(makeReq({ ...ok, email: "zly@" }))).status).toBe(400);
        expect(mockInsert).not.toHaveBeenCalled();
    });

    it("TC-8 escapuje HTML od klienta", async () => {
        await POST(makeReq({ ...ok, name: "<script>x</script>", note: "<b>pilne</b>" }));
        const html = mockSendMail.mock.calls[0][0].html as string;
        expect(html).not.toContain("<script>");
        expect(html).toContain("&lt;b&gt;pilne&lt;/b&gt;");
    });
});
