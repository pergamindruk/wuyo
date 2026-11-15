import { NextResponse } from 'next/server'
import { errorResponse, requireLabUser } from '@/lib/lab/stickers/auth.server'
import { buildEditPrompt, buildEnhancePrompt, buildPrompt, generateStickerImage, STICKER_STYLES, type StickerStyle } from '@/lib/lab/stickers/gemini.server'
import sharp from 'sharp'
import { generateWithFallback } from '@/lib/gemini'
import { StickerError, decodeDataUrl, makeCutout, toDataUrl } from '@/lib/lab/stickers/image.server'

export const runtime = 'nodejs'
// Gemini 3 Pro Image w 2K potrafi myśleć 30-60 s.
export const maxDuration = 120

type Body = {
    mode?: 'ai' | 'upload' | 'edit' | 'enhance'
    kind?: 'new' | 'edit'
    instruction?: string
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
        if (body.mode === 'enhance') {
            // Szybki model tekstowy, bez „myślenia”: kilka sekund, grosze.
            const text = (body.prompt ?? '').trim().slice(0, 1200)
            if (text.length < 3) throw new StickerError('Najpierw wpisz choć kilka słów.')
            const style = (body.style && body.style in STICKER_STYLES ? body.style : 'vector') as StickerStyle
            const out = await generateWithFallback('content', buildEnhancePrompt(text, body.kind === 'edit' ? 'edit' : 'new', style), { noThinking: true })
            const prompt = out.replace(/^["„”\s]+|["„”\s]+$/g, '').replace(/\*\*/g, '').trim().slice(0, 1200)
            return NextResponse.json({ prompt })
        }
        if (body.mode === 'edit') {
            // Poprawka: obecna grafika na białym tle idzie do Gemini jako wzór.
            const instruction = (body.instruction ?? '').trim().slice(0, 800)
            if (instruction.length < 3) throw new StickerError('Napisz, co poprawić.')
            const flat = await sharp(decodeDataUrl(body.image)).flatten({ background: '#ffffff' })
                .extend({ top: 60, bottom: 60, left: 60, right: 60, background: '#ffffff' }).png().toBuffer()
            const { buf, model } = await generateStickerImage(buildEditPrompt(instruction), { mime: 'image/png', data: flat.toString('base64') })
            const cut = await makeCutout(buf, 'tak')
            return NextResponse.json({ cutout: toDataUrl(cut.buf, 'image/webp'), w: cut.w, h: cut.h, removed: true, model })
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
