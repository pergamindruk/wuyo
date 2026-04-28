import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'

export const GEMINI_MODEL = 'gemini-2.5-flash'

export const genAI = new GoogleGenerativeAI(process.env.WUYO_GEMINI_KEY ?? '')
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

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

export async function generateWithFallback(preset: ModelPreset, prompt: string): Promise<string> {
    // Próba z Gemini
    try {
        const result = await getModel(preset).generateContent(prompt)
        return result.response.text()
    } catch (err: any) {
        const isRetryable = err?.message?.includes('503') || err?.message?.includes('overloaded') || err?.message?.includes('high demand')
        if (!isRetryable) throw err
    }

    // Fallback na Claude gdy Gemini niedostępny
    const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: MODEL_CONFIGS[preset].maxOutputTokens,
        messages: [{ role: 'user', content: prompt }],
    })
    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Nieoczekiwany typ odpowiedzi z Claude')
    return block.text
}
