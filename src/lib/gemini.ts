import { GoogleGenerativeAI } from '@google/generative-ai'

export const GEMINI_MODEL = 'gemini-2.5-flash'

export const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY ?? '')

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

/** SDK 0.24 nie zna jeszcze thinkingConfig, ale API Gemini 2.5 go przyjmuje. */
type GenerationConfigWithThinking = {
    maxOutputTokens: number
    thinkingConfig: { thinkingBudget: number }
}

export function getModel(preset: ModelPreset = 'content', opts?: { noThinking?: boolean }) {
    const { text, thinking } = MODEL_CONFIGS[preset]
    const budget = opts?.noThinking ? 0 : thinking
    const generationConfig: GenerationConfigWithThinking = {
        maxOutputTokens: text + budget,
        thinkingConfig: { thinkingBudget: budget },
    }
    return genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig })
}

/**
 * Generuje tekst; przy chwilowym przeciążeniu Gemini (503/429) ponawia do 2 razy.
 * noThinking: bez „myślenia” modelu, kilka sekund zamiast minuty (do postów i prostych tekstów).
 */
export async function generateWithFallback(preset: ModelPreset, prompt: string, opts?: { noThinking?: boolean }): Promise<string> {
    let lastError: unknown
    let noThinking = opts?.noThinking ?? false
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const result = await getModel(preset, { noThinking }).generateContent(prompt)
            // Ucięte mimo zapasu: jeszcze raz bez myślenia, cały limit idzie na tekst.
            if (result.response.candidates?.[0]?.finishReason === 'MAX_TOKENS' && !noThinking) {
                console.warn(`Gemini uciął odpowiedź (${preset}), ponawiam bez myślenia`)
                noThinking = true
                continue
            }
            return result.response.text()
        } catch (e) {
            lastError = e
            const msg = e instanceof Error ? e.message : String(e)
            if (!/503|429|overloaded|unavailable/i.test(msg)) throw e
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
        }
    }
    throw lastError
}
