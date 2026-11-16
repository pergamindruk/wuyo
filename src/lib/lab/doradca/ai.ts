import { geminiTarget } from '@/lib/ai-endpoint'

/** Rozmowa z Gemini dla doradcy: instrukcja systemowa, historia i (opcjonalnie) nagranie głosowe. */

export type Part = { text: string } | { inlineData: { mimeType: string; data: string } }
export type Turn = { role: 'user' | 'model'; parts: Part[] }

type GeminiResponse = {
    candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[]
}

const RETRYABLE = new Set([429, 500, 503, 504])

async function callModel(model: string, system: string, turns: Turn[]): Promise<string> {
    const target = await geminiTarget()
    if (!target) throw new Error('Brak konfiguracji AI (GCP_SA_KEY_B64 albo WUYO_GEMINI_KEY)')
    const res = await fetch(target.url(model), {
        method: 'POST',
        headers: target.headers,
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: turns,
            generationConfig: { maxOutputTokens: 6144, temperature: 0.4, thinkingConfig: { thinkingBudget: 2048 } },
        }),
        signal: AbortSignal.timeout(50_000),
    })
    if (!res.ok) {
        const body = (await res.text()).slice(0, 300).replace(/AIza[\w-]{20,}/g, '***')
        throw Object.assign(new Error(`Gemini ${res.status} (${model}): ${body}`), { status: res.status })
    }
    const data = (await res.json()) as GeminiResponse
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const out = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join('')
    if (!out.trim()) throw Object.assign(new Error(`Gemini: pusta odpowiedź (${data.candidates?.[0]?.finishReason ?? 'brak'})`), { status: 502 })
    return out
}

/** Główny model, a przy przeciążeniu albo błędzie sieci jeden raz zapasowy. */
export async function askAdvisor(system: string, turns: Turn[]): Promise<string> {
    const target = await geminiTarget()
    if (!target) throw new Error('Brak konfiguracji AI (GCP_SA_KEY_B64 albo WUYO_GEMINI_KEY)')
    try {
        return await callModel(target.textModel, system, turns)
    } catch (e) {
        const status = (e as { status?: number }).status
        if (status !== undefined && !RETRYABLE.has(status) && status !== 502) throw e
        return callModel(target.fallbackModel, system, turns)
    }
}
