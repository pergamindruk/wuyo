import { NextResponse } from 'next/server'
import { errorResponse, requireLabUser } from '@/lib/lab/stickers/auth.server'
import { decodeDataUrl, prepareSticker } from '@/lib/lab/stickers/image.server'
import { clampSize, sanitizeSettings } from '@/lib/lab/stickers/types'

export const runtime = 'nodejs'

/** Szybkie przeliczenie linii cięcia dla jednej naklejki (bez Gemini). */
export async function POST(req: Request) {
    const denied = await requireLabUser()
    if (denied) return denied
    try {
        const body = (await req.json()) as { image?: string; sizeMm?: number; offsetMm?: number; smooth?: number }
        const s = sanitizeSettings({ offsetMm: body.offsetMm, smooth: body.smooth })
        const { geo } = await prepareSticker(decodeDataUrl(body.image), clampSize(body.sizeMm), s)
        const r = (n: number) => Math.round(n * 100) / 100
        return NextResponse.json({
            contour: geo.contour.map(([x, y]) => [r(x), r(y)]),
            w: r(geo.w),
            h: r(geo.h),
            img: { x: r(geo.img.x), y: r(geo.img.y), w: r(geo.img.w), h: r(geo.img.h) },
            closed: geo.closed,
        })
    } catch (e) {
        return errorResponse(e, 'Nie udało się policzyć konturu')
    }
}
