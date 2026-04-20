import { GoogleGenerativeAI } from '@google/generative-ai'

export const GEMINI_MODEL = 'gemini-2.5-flash'

export const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY ?? '')

// Presety z max_output_tokens — zapobiega surprise tokenom
const MODEL_CONFIGS = {
    chat:     { maxOutputTokens: 1024  },
    content:  { maxOutputTokens: 2048  },
    document: { maxOutputTokens: 4096  },
    seo:      { maxOutputTokens: 2048  },
} as const

type ModelPreset = keyof typeof MODEL_CONFIGS

export function getModel(preset: ModelPreset = 'content') {
    return genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: MODEL_CONFIGS[preset],
    })
}
