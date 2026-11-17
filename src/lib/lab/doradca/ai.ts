import { geminiTarget } from '@/lib/ai-endpoint'

/**
 * Rozmowa z Gemini dla doradcy: instrukcja systemowa, historia, (opcjonalnie) nagranie albo zdjęcie
 * i wyszukiwanie Google (narzędzie googleSearch). Koszt wyszukiwań schodzi z tego samego konta GCP.
 */

export type Part = { text: string } | { inlineData: { mimeType: string; data: string } }
export type Turn = { role: 'user' | 'model'; parts: Part[] }
export type Zrodlo = { tytul: string; url: string }
export type Wynik = { tekst: string; zrodla: Zrodlo[] }

type GeminiResponse = {
    candidates?: {
        finishReason?: string
        content?: { parts?: { text?: string; thought?: boolean }[] }
        groundingMetadata?: { groundingChunks?: { web?: { uri?: string; title?: string } }[] }
    }[]
}

const RETRYABLE = new Set([429, 500, 503, 504])
const MAX_ZRODEL = 5

/** Źródła z wyszukiwania: bez powtórek, najwyżej kilka. Tytuł Vertex to zwykle domena strony. */
export function zrodlaZOdpowiedzi(data: GeminiResponse): Zrodlo[] {
    const widziane = new Set<string>()
    const out: Zrodlo[] = []
    for (const c of data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []) {
        const url = c.web?.uri
        if (!url || widziane.has(url)) continue
        widziane.add(url)
        out.push({ tytul: c.web?.title || url, url })
        if (out.length >= MAX_ZRODEL) break
    }
    return out
}

async function callModel(model: string, system: string, turns: Turn[], szukaj: boolean): Promise<Wynik> {
    const target = await geminiTarget()
    if (!target) throw new Error('Brak konfiguracji AI (GCP_SA_KEY_B64 albo WUYO_GEMINI_KEY)')
    const res = await fetch(target.url(model), {
        method: 'POST',
        headers: target.headers,
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: turns,
            ...(szukaj ? { tools: [{ googleSearch: {} }] } : {}),
            generationConfig: { maxOutputTokens: 6144, temperature: 0.4, thinkingConfig: { thinkingBudget: 2048 } },
        }),
        signal: AbortSignal.timeout(80_000),
    })
    if (!res.ok) {
        const body = (await res.text()).slice(0, 300).replace(/AIza[\w-]{20,}/g, '***')
        throw Object.assign(new Error(`Gemini ${res.status} (${model}): ${body}`), { status: res.status })
    }
    const data = (await res.json()) as GeminiResponse
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const tekst = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join('')
    if (!tekst.trim()) throw Object.assign(new Error(`Gemini: pusta odpowiedź (${data.candidates?.[0]?.finishReason ?? 'brak'})`), { status: 502 })
    return { tekst, zrodla: zrodlaZOdpowiedzi(data) }
}

/**
 * Główny model z wyszukiwarką. Przy przeciążeniu jeden raz zapasowy model.
 * Gdy wyszukiwarka jest niedostępna (400), odpowiedź bez niej, żeby bot nie milkł.
 */
export async function askAdvisor(system: string, turns: Turn[], opts: { szukaj?: boolean } = {}): Promise<Wynik> {
    const target = await geminiTarget()
    if (!target) throw new Error('Brak konfiguracji AI (GCP_SA_KEY_B64 albo WUYO_GEMINI_KEY)')
    const szukaj = opts.szukaj ?? true
    try {
        return await callModel(target.textModel, system, turns, szukaj)
    } catch (e) {
        const status = (e as { status?: number }).status
        if (szukaj && status === 400) {
            console.warn('Doradca: wyszukiwarka niedostępna, odpowiadam bez niej', e instanceof Error ? e.message : e)
            return callModel(target.textModel, system, turns, false)
        }
        if (status !== undefined && !RETRYABLE.has(status) && status !== 502) throw e
        return callModel(target.fallbackModel, system, turns, szukaj)
    }
}
