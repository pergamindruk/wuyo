import { GoogleGenerativeAI } from '@google/generative-ai'

const PRIMARY_MODEL = 'gemini-2.5-flash'
const FALLBACK_MODEL = 'gemini-1.5-flash'

export const GEMINI_MODEL = PRIMARY_MODEL

export const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY ?? '')

const MODEL_CONFIGS = {
    chat:     { maxOutputTokens: 1024  },
    content:  { maxOutputTokens: 2048  },
    document: { maxOutputTokens: 4096  },
    seo:      { maxOutputTokens: 2048  },
} as const

type ModelPreset = keyof typeof MODEL_CONFIGS

export function getModel(preset: ModelPreset = 'content', model = PRIMARY_MODEL) {
    return genAI.getGenerativeModel({
        model,
        generationConfig: MODEL_CONFIGS[preset],
    })
}

export async function generateWithFallback(preset: ModelPreset, prompt: string): Promise<string> {
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
        try {
            const result = await getModel(preset, model).generateContent(prompt)
            return result.response.text()
        } catch (err: any) {
            const isRetryable = err?.message?.includes('503') || err?.message?.includes('overloaded') || err?.message?.includes('high demand')
            if (!isRetryable || model === FALLBACK_MODEL) throw err
        }
    }
    throw new Error('Wszystkie modele niedostępne')
}
