import { NextRequest, NextResponse, after } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompt";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
// Główny model + zapasowy, gdy główny jest przeciążony (Gemini zwraca wtedy 503).
const MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-3.5-flash-lite";

// Statusy, przy których warto spróbować jeszcze raz: limit, przeciążenie, chwilowy błąd.
const RETRYABLE = new Set([429, 500, 503, 504]);
// Okienko czatu przerywa czekanie po 30 s, więc serwer musi się zmieścić wcześniej.
const TOTAL_BUDGET_MS = 25_000;

// Google wkleja klucz do części komunikatów błędów. Nie może trafić do logów.
const redact = (s: string) => s.replace(/AIza[\w-]{20,}|AQ\.[\w.-]{20,}/g, "***");

async function callGemini(apiKey: string, contents: object[]): Promise<Response> {
    const deadline = Date.now() + TOTAL_BUDGET_MS;
    // Dwie próby na głównym modelu, potem jedna na zapasowym.
    const plan = [MODEL, MODEL, FALLBACK_MODEL];
    let last: Response | null = null;

    for (let i = 0; i < plan.length; i++) {
        const left = deadline - Date.now();
        if (left < 2_000) break;

        try {
            // Klucz w nagłówku, nie w adresie: adres ląduje w logach i komunikatach błędów.
            last = await fetch(`${GEMINI_BASE_URL}/${plan[i]}:generateContent`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
                    // Bez maxOutputTokens: Gemini 2.5 wlicza do limitu swoje "myślenie"
                    // i przy 1024 urywał odpowiedzi w pół słowa.
                    contents,
                }),
                signal: AbortSignal.timeout(left),
            });
        } catch (err) {
            // Przekroczony czas albo zerwane połączenie: próbujemy dalej, póki jest czas.
            console.error("Gemini fetch failed:", plan[i], redact(String(err)));
            continue;
        }

        if (!RETRYABLE.has(last.status) || i === plan.length - 1) return last;

        // Przy 429 Google podaje, ile odczekać. Przy 5xx wystarczy krótka pauza.
        let waitMs = 1_000;
        if (last.status === 429) {
            const errBody = await last.json().catch(() => ({}));
            const sec = parseInt(
                errBody?.error?.details?.find((d: { retryDelay?: string }) => d.retryDelay)?.retryDelay ?? "3",
                10
            );
            waitMs = Math.min(sec, 5) * 1000;
        }
        console.warn(`Gemini ${last.status} na ${plan[i]}, ponawiam`);
        await new Promise((r) => setTimeout(r, Math.min(waitMs, Math.max(0, deadline - Date.now() - 2_000))));
    }

    // Brak jakiejkolwiek odpowiedzi traktujemy jak przeciążenie.
    return last ?? new Response(null, { status: 503 });
}

export async function POST(req: NextRequest) {
    const ip = getClientIp(req)
    const supabase = await createClient();

    if (!(await rateLimit(supabase, `chat:${ip}`, LIMITS.chat.limit, LIMITS.chat.windowMs))) {
        return NextResponse.json(
            { error: "RATE_LIMIT", message: "Chwilowo dużo ruchu, spróbuj za chwilę! ⏳" },
            { status: 429, headers: { 'Retry-After': '60' } }
        )
    }

    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }
        // Ogranicznik historii — zapobiega windowaniu kosztu Gemini ogromnym payloadem
        if (messages.length > 30 || messages.some((m: { content?: string }) => (m.content?.length ?? 0) > 4000)) {
            return NextResponse.json({ error: "Wiadomość za długa" }, { status: 400 });
        }

        const apiKey = process.env.WUYO_GEMINI_KEY;
        if (!apiKey) {
            console.error("WUYO_GEMINI_KEY is not set!");
            return NextResponse.json({ error: "Błąd konfiguracji serwera" }, { status: 500 });
        }

        const allContents = messages.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));
        const firstUserIdx = allContents.findIndex((m) => m.role === "user");
        const contents = firstUserIdx >= 0 ? allContents.slice(firstUserIdx) : allContents;

        const response = await callGemini(apiKey, contents);

        if (RETRYABLE.has(response.status)) {
            // Okienko czatu rozpoznaje RATE_LIMIT po polu `error` i pokazuje
            // "chwilowo dużo ruchu". Nie wysyłamy `message`, bo wyglądałby jak odpowiedź AI.
            console.error("Gemini niedostępny po ponowieniach:", response.status);
            return NextResponse.json({ error: "RATE_LIMIT" }, { status: 503 });
        }

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Gemini API error:", response.status, redact(errBody));
            return NextResponse.json(
                { error: "Ups, problem z AI. Spróbuj jeszcze raz!" },
                { status: 500 }
            );
        }

        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini API error body:", data.error);
            return NextResponse.json(
                { error: "Ups, problem z AI. Spróbuj jeszcze raz!" },
                { status: 500 }
            );
        }

        // Odpowiedź bywa podzielona na kilka części, a części "thought" to notatki modelu.
        const parts: { text?: string; thought?: boolean }[] = data.candidates?.[0]?.content?.parts ?? [];
        const responseText = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join("");
        if (data.candidates?.[0]?.finishReason === "MAX_TOKENS") {
            console.warn("Gemini uciął odpowiedź (MAX_TOKENS)");
        }

        if (!responseText.trim()) {
            // Pusta odpowiedź: np. blokada bezpieczeństwa albo ucięcie. Bez tego klient
            // dostawał pusty dymek.
            console.error("Gemini pusta odpowiedź, finishReason:", data.candidates?.[0]?.finishReason);
            return NextResponse.json({
                message: "Nie umiem na to odpowiedzieć. Napisz proszę inaczej albo zostaw e-mail, odezwę się osobiście.",
                lead: null,
            });
        }

        const leadMatch = responseText.match(/\[LEAD:([^:]+):([^\]]+)\]/);
        let lead = null;
        if (leadMatch) {
            lead = { name: leadMatch[1], email: leadMatch[2] };

            // Jeden kanał: /api/lead obsługuje zapis do bazy i wysyłkę maila.
            // after() — Vercel ubija funkcję po odpowiedzi, więc zwykłe "fetch bez await" potrafił zgubić leada.
            const leadUrl = new URL("/api/lead", req.nextUrl.origin).toString();
            const leadBody = JSON.stringify(lead);
            after(() =>
                fetch(leadUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: leadBody,
                }).catch(err => console.error("Lead notification failed:", err))
            );
        }

        const cleanResponse = responseText.replace(/\[LEAD:[^\]]+\]/g, "").trim();
        return NextResponse.json({ message: cleanResponse, lead });

    } catch (error: any) {
        console.error("Chat API error details:", {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json(
            { error: "Ups, coś poszło nie tak. Spróbuj jeszcze raz!" },
            { status: 500 }
        );
    }
}
