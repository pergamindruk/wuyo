import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
// gemini-2.5-flash działa poprawnie na tym kluczu (lite zwracał błędy 429)
const MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `Jesteś chatbotem asystenta Wuyo – małej agencji graficznej / freelancera z Polski. Twój styl komunikacji: kumpelski, konkretny, z humorem i pazurem. Mówisz po polsku, krótko i na temat. Nie używasz korporacyjnego newspeak.

Twoje zadania:
1. Odpowiadasz na pytania o usługi Wuyo (strony internetowe, identyfikacja wizualna, logo, projekty graficzne, social media)
2. Podajesz orientacyjne ceny (logo od 890 zł, strona od 2 490 zł, marka/identyfikacja od 1 490 zł)
3. Zbierasz dane kontaktowe potencjalnych klientów (leady) – imię i adres e-mail
4. Umawiasz na bezpłatną konsultację

Brand voice – ZAWSZE pamiętaj:
- Mówisz: "dobra grafa", "ogarniamy", "bez ściemy", "z głową"
- NIE mówisz: "innowacyjny", "synergia", "kompleksowy", "holistyczny"
- Jesteś pomocny ale nie nachalny
- Masz poczucie humoru

Zbieranie leada:
- Gdy klient dopyta o szczegóły projektu lub wycenę, zapytaj naturalnie o imię i e-mail
- Gdy zbierzesz imię i e-mail, odpowiedz normalnie, a na końcu dodaj specjalny znacznik:
  [LEAD:imię:email]
- Przykład: [LEAD:Marek:marek@example.com]
- Dodaj ten znacznik tylko gdy masz oba: imię I e-mail`;

async function callGemini(apiKey: string, contents: object[], attempt = 0): Promise<Response> {
    const response = await fetch(`${GEMINI_BASE_URL}/${MODEL}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
        }),
    });

    if (response.status === 429 && attempt < 2) {
        // Spróbuj ponownie po krótkim czasie (max 2 retry)
        const errBody = await response.json().catch(() => ({}));
        const retryDelaySec = parseInt(
            errBody?.error?.details?.find((d: { retryDelay?: string }) => d.retryDelay)?.retryDelay ?? "5",
            10
        );
        const waitSec = Math.min(retryDelaySec, 8);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        return callGemini(apiKey, contents, attempt + 1);
    }

    return response;
}

export async function POST(req: NextRequest) {
    const ip = getClientIp(req)
    if (!rateLimit(`chat:${ip}`, LIMITS.chat.limit, LIMITS.chat.windowMs)) {
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

        if (response.status === 429) {
            return NextResponse.json(
                { error: "RATE_LIMIT", message: "Chwilowo dużo ruchu, spróbuj za chwilę! ⏳" },
                { status: 503 }
            );
        }

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Gemini API error:", response.status, errBody);
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

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        const leadMatch = responseText.match(/\[LEAD:([^:]+):([^\]]+)\]/);
        let lead = null;
        if (leadMatch) {
            lead = { name: leadMatch[1], email: leadMatch[2] };

            // Jeden kanał: /api/lead obsługuje zapis do bazy i wysyłkę maila
            const leadUrl = new URL("/api/lead", req.nextUrl.origin).toString();
            fetch(leadUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(lead),
            }).catch(err => console.error("Lead notification failed:", err));
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
