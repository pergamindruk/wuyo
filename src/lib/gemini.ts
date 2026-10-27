import { geminiTarget } from '@/lib/ai-endpoint'

export const GEMINI_MODEL = 'gemini-2.5-flash'

// text = ile tokenów ma zostać na sam tekst odpowiedzi.
// thinking = osobny, ograniczony budżet na „myślenie”. Gemini 2.5 wlicza myślenie
// do maxOutputTokens, więc bez tego podziału długie myślenie ucinało tekst (ściągawki, posty).
const MODEL_CONFIGS = {
    chat:     { text: 1024, thinking: 512  },
    content:  { text: 4096, thinking: 2048 },
    quote:    { text: 6000, thinking: 2048 },
    document: { text: 8192, thinking: 2048 },
    seo:      { text: 2048, thinking: 1024 },
} as const

type ModelPreset = keyof typeof MODEL_CONFIGS

type GeminiResponse = {
    candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[]
    error?: { message?: string }
}

class GeminiError extends Error {
    constructor(public status: number, message: string) {
        super(message)
    }
}

const RETRYABLE = new Set([429, 500, 503, 504])

async function callOnce(preset: ModelPreset, prompt: string, noThinking: boolean): Promise<GeminiResponse> {
    const target = await geminiTarget()
    if (!target) throw new GeminiError(500, 'Brak konfiguracji AI (GCP_SA_KEY_B64 albo WUYO_GEMINI_KEY)')
    const { text, thinking } = MODEL_CONFIGS[preset]
    const budget = noThinking ? 0 : thinking
    const res = await fetch(target.url(GEMINI_MODEL), {
        method: 'POST',
        headers: target.headers,
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: text + budget, thinkingConfig: { thinkingBudget: budget } },
        }),
        signal: AbortSignal.timeout(120_000),
    })
    if (!res.ok) {
        const body = (await res.text()).slice(0, 300).replace(/AIza[\w-]{20,}/g, '***')
        throw new GeminiError(res.status, `Gemini ${res.status} (${target.provider}): ${body}`)
    }
    return (await res.json()) as GeminiResponse
}

/**
 * Generuje tekst przez Vertex AI albo Gemini API (patrz ai-endpoint.ts).
 * Przy chwilowym przeciążeniu (429/5xx) ponawia do 2 razy.
 * noThinking: bez „myślenia” modelu, kilka sekund zamiast minuty (do postów i prostych tekstów).
 */
export async function generateWithFallback(preset: ModelPreset, prompt: string, opts?: { noThinking?: boolean }): Promise<string> {
    let lastError: unknown
    let noThinking = opts?.noThinking ?? false
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const data = await callOnce(preset, prompt, noThinking)
            const candidate = data.candidates?.[0]
            // Ucięte mimo zapasu: jeszcze raz bez myślenia, cały limit idzie na tekst.
            if (candidate?.finishReason === 'MAX_TOKENS' && !noThinking) {
                console.warn(`Gemini uciął odpowiedź (${preset}), ponawiam bez myślenia`)
                noThinking = true
                continue
            }
            const out = (candidate?.content?.parts ?? []).filter((p) => !p.thought && p.text).map((p) => p.text).join('')
            if (!out.trim()) throw new GeminiError(502, `Gemini pusta odpowiedź (${candidate?.finishReason ?? 'brak'})`)
            return out
        } catch (e) {
            lastError = e
            const status = e instanceof GeminiError ? e.status : 0
            const network = !(e instanceof GeminiError)
            if (!network && !RETRYABLE.has(status)) throw e
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
        }
    }
    throw lastError
}
