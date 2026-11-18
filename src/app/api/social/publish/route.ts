import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireLabUser } from '@/lib/lab/require-user'
import { publishPost } from '@/lib/social/publisher'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const supabaseHost = (() => {
    try {
        return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host
    } catch {
        return ''
    }
})()

const schema = z.object({
    content: z.string().trim().min(1, 'Wpisz treść posta.').max(63_206, 'Tekst za długi.'),
    // Obrazy tylko z naszego bucketu „social” (serwer pobiera je i wysyła dalej — bez obcych adresów).
    images: z.array(z.url().refine((u) => supabaseHost !== '' && new URL(u).host === supabaseHost && u.includes('/storage/v1/object/public/social/'), 'Obraz spoza bucketu social.')).max(10, 'Maksymalnie 10 obrazów.').default([]),
    channelIds: z.array(z.string().min(1).max(200)).min(1, 'Zaznacz co najmniej jedno konto.').max(30),
    mode: z.enum(['now', 'schedule']),
    scheduledAt: z.iso.datetime({ offset: true }).optional(),
    calendarEventId: z.string().regex(/^[\w-]{1,64}$/).optional(),
}).superRefine((v, ctx) => {
    if (v.mode !== 'schedule') return
    if (!v.scheduledAt) {
        ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Wybierz datę publikacji.' })
        return
    }
    const t = new Date(v.scheduledAt).getTime()
    if (t < Date.now() + 2 * 60_000) ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Termin musi być co najmniej 2 minuty w przyszłości.' })
    if (t > Date.now() + 365 * 86_400_000) ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Termin maksymalnie rok do przodu.' })
})

export async function POST(request: Request) {
    const denied = await requireLabUser()
    if (denied) return denied

    let json: unknown
    try {
        json = await request.json()
    } catch {
        return NextResponse.json({ error: 'Zły format danych.' }, { status: 400 })
    }
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Złe dane.' }, { status: 400 })
    }
    const v = parsed.data
    try {
        const r = await publishPost({
            content: v.content,
            images: v.images,
            channelIds: v.channelIds,
            scheduleAt: v.mode === 'schedule' && v.scheduledAt ? new Date(v.scheduledAt) : null,
            calendarEventId: v.calendarEventId ?? null,
        })
        if ('error' in r) return NextResponse.json({ error: r.error }, { status: 422 })
        return NextResponse.json(r)
    } catch (e) {
        console.error('social/publish:', e)
        return NextResponse.json({ error: 'Publikacja nie wyszła. Spróbuj jeszcze raz.' }, { status: 500 })
    }
}
