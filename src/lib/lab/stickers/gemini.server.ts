import { geminiTarget } from '@/lib/ai-endpoint'
import { StickerError } from './image.server'

/**
 * Generowanie grafiki naklejki: Gemini 3 Pro Image, kwadrat 1:1, 2K.
 * Idzie tą samą drogą co reszta studia (Vertex albo AI Studio, patrz ai-endpoint.ts).
 * Model można podmienić zmienną STICKER_IMAGE_MODEL.
 */

const MODELS = [
    process.env.STICKER_IMAGE_MODEL?.trim(),
    'gemini-3-pro-image',
    'gemini-3-pro-image-preview',
].filter((m, i, a): m is string => !!m && a.indexOf(m) === i)

export const STICKER_STYLES = {
    vector: 'clean flat vector illustration, bold shapes, limited palette, crisp edges',
    kawaii: 'cute kawaii cartoon style, soft rounded shapes, cheerful pastel colors',
    retro: 'retro vintage badge style, slightly distressed print texture, warm muted colors',
    comic: 'comic book style with bold black ink outlines and halftone shading',
    realistic: 'detailed realistic 3D render, soft studio lighting, glossy materials',
    logo: 'simple emblem suitable for a small business logo sticker, very legible, minimal detail',
} as const
export type StickerStyle = keyof typeof STICKER_STYLES

export function buildPrompt(description: string, style: StickerStyle, hasReference: boolean): string {
    return [
        `Design a single die-cut sticker artwork: ${description.trim()}.`,
        `Style: ${STICKER_STYLES[style]}.`,
        hasReference ? 'Use the attached image as the reference for the subject (shape, colors, character).' : '',
        'Composition: one subject, centered, fully visible, nothing cropped, compact silhouette without thin protruding parts.',
        'Background: perfectly flat pure white #FFFFFF, no shadow, no gradient, no texture, no ground.',
        'Do NOT draw a white sticker border, outline frame, cut line, mockup or paper. We add the border ourselves.',
        'Give the subject a clear dark outline so it separates cleanly from the white background.',
        'Any text must be spelled exactly as given and be large and legible. Print-ready, high detail, sharp.',
    ].filter(Boolean).join('\n')
}

type Part = { text?: string; inlineData?: { mimeType?: string; data?: string }; inline_data?: { mime_type?: string; data?: string } }
type GeminiResponse = {
    candidates?: { content?: { parts?: Part[] }; finishReason?: string }[]
    promptFeedback?: { blockReason?: string }
    error?: { message?: string }
}

export async function generateStickerImage(prompt: string, reference?: { mime: string; data: string }): Promise<{ buf: Buffer; model: string }> {
    const target = await geminiTarget()
    if (!target) throw new StickerError('Brak klucza Gemini (WUYO_GEMINI_KEY albo GCP_SA_KEY_B64).')
    const parts: Part[] = [{ text: prompt }]
    if (reference) parts.push({ inlineData: { mimeType: reference.mime, data: reference.data } })
    const body = JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: { aspectRatio: '1:1', imageSize: '2K' },
        },
    })
    let lastError = ''
    for (const model of MODELS) {
        const res = await fetch(target.url(model), {
            method: 'POST',
            headers: target.headers,
            body,
            signal: AbortSignal.timeout(110_000),
        }).catch((e: unknown) => {
            lastError = e instanceof Error && e.name === 'TimeoutError' ? 'Gemini nie odpowiedział w 110 s.' : 'Brak połączenia z Gemini.'
            return null
        })
        if (!res) continue
        if (res.status === 404) { lastError = `Model ${model} niedostępny.`; continue }
        const json = (await res.json().catch(() => ({}))) as GeminiResponse
        if (!res.ok) {
            const msg = json.error?.message ?? `HTTP ${res.status}`
            if (res.status === 429) throw new StickerError('Limit Gemini wyczerpany. Spróbuj za chwilę.')
            if (res.status === 503) throw new StickerError('Gemini jest przeciążony. Spróbuj za minutę.')
            throw new StickerError(`Gemini: ${msg.slice(0, 200)}`)
        }
        if (json.promptFeedback?.blockReason) throw new StickerError('Gemini odrzucił opis. Zmień treść i spróbuj ponownie.')
        for (const part of json.candidates?.[0]?.content?.parts ?? []) {
            const data = part.inlineData?.data ?? part.inline_data?.data
            if (data) return { buf: Buffer.from(data, 'base64'), model }
        }
        const reason = json.candidates?.[0]?.finishReason
        throw new StickerError(reason === 'SAFETY' || reason === 'IMAGE_SAFETY'
            ? 'Gemini zablokował obraz (filtr bezpieczeństwa). Zmień opis.'
            : 'Gemini nie zwrócił obrazu. Spróbuj jeszcze raz.')
    }
    throw new StickerError(lastError || 'Żaden model graficzny Gemini nie jest dostępny.')
}
