import { GoogleGenerativeAI } from '@google/generative-ai'

export const GEMINI_MODEL = 'gemini-2.5-flash'

export const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY ?? '')

const MODEL_CONFIGS = {
    chat:     { maxOutputTokens: 1024  },
    content:  { maxOutputTokens: 2048  },
    quote:    { maxOutputTokens: 6000  },
    document: { maxOutputTokens: 8192  },
    seo:      { maxOutputTokens: 2048  },
} as const

type ModelPreset = keyof typeof MODEL_CONFIGS

/** SDK 0.24 nie zna jeszcze thinkingConfig, ale API Gemini 2.5 go przyjmuje. */
type GenerationConfigWithThinking = (typeof MODEL_CONFIGS)[ModelPreset] & {
    thinkingConfig?: { thinkingBudget: number }
}

export function getModel(preset: ModelPreset = 'content', opts?: { noThinking?: boolean }) {
    const generationConfig: GenerationConfigWithThinking = opts?.noThinking
        ? { ...MODEL_CONFIGS[preset], thinkingConfig: { thinkingBudget: 0 } }
        : MODEL_CONFIGS[preset]
    return genAI.getGenerativeModel({ model: GEMINI_MODEL, generationConfig })
}

/**
 * Generuje tekst; przy chwilowym przeciążeniu Gemini (503/429) ponawia do 2 razy.
 * noThinking: bez „myślenia” modelu, kilka sekund zamiast minuty (do postów i prostych tekstów).
 */
export async function generateWithFallback(preset: ModelPreset, prompt: string, opts?: { noThinking?: boolean }): Promise<string> {
    let lastError: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const result = await getModel(preset, opts).generateContent(prompt)
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
