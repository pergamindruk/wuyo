import { NextResponse } from 'next/server'
import { errorResponse, requireLabUser } from '@/lib/lab/stickers/auth.server'
import { buildPrompt, generateStickerImage, STICKER_STYLES, type StickerStyle } from '@/lib/lab/stickers/gemini.server'
import { StickerError, decodeDataUrl, makeCutout, toDataUrl } from '@/lib/lab/stickers/image.server'

export const runtime = 'nodejs'
// Gemini 3 Pro Image w 2K potrafi myśleć 30-60 s.
export const maxDuration = 120

type Body = {
    mode?: 'ai' | 'upload'
    prompt?: string
    style?: string
    reference?: string
    image?: string
    removeBg?: 'auto' | 'tak' | 'nie'
}

/** Nowa grafika naklejki: z Gemini albo z wgranego pliku. Zwraca grafikę z wyciętym tłem (WebP). */
export async function POST(req: Request) {
    const denied = await requireLabUser()
    if (denied) return denied
    try {
        const body = (await req.json()) as Body
        if (body.mode === 'upload') {
            const cut = await makeCutout(decodeDataUrl(body.image), body.removeBg ?? 'auto')
            return NextResponse.json({ cutout: toDataUrl(cut.buf, 'image/webp'), w: cut.w, h: cut.h, removed: cut.removed })
        }
        const description = (body.prompt ?? '').trim().slice(0, 1200)
        if (description.length < 3) throw new StickerError('Opisz, co ma być na naklejce.')
        const style = (body.style && body.style in STICKER_STYLES ? body.style : 'vector') as StickerStyle
        let reference: { mime: string; data: string } | undefined
        if (body.reference) {
            const buf = decodeDataUrl(body.reference)
            const mime = /^data:(image\/[a-z]+);/.exec(body.reference)?.[1] ?? 'image/png'
            reference = { mime: mime === 'image/jpg' ? 'image/jpeg' : mime, data: buf.toString('base64') }
        }
        const { buf, model } = await generateStickerImage(buildPrompt(description, style, !!reference), reference)
        const cut = await makeCutout(buf, 'tak')
        return NextResponse.json({ cutout: toDataUrl(cut.buf, 'image/webp'), w: cut.w, h: cut.h, removed: true, model })
    } catch (e) {
        return errorResponse(e, 'Nie udało się przygotować grafiki')
    }
}
