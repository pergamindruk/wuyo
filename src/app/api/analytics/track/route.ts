import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { BOT_UA, hostOf, sourceOf, visitorId } from '@/lib/visitor'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const clip = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : undefined)

/**
 * Odsłona albo zdarzenie (/zdarzenie/telefon, /zdarzenie/whatsapp) z PageTracker.
 * Roboty odcinamy po nagłówku przeglądarki, a wejścia spoza wuyo.pl po nagłówku Origin.
 */
export async function POST(req: NextRequest) {
    try {
        if (BOT_UA.test(req.headers.get('user-agent') ?? '')) return new Response(null, { status: 204 })
        const origin = req.headers.get('origin') ?? ''
        if (origin && origin !== 'https://wuyo.pl') return new Response(null, { status: 204 })

        const body = await req.json()
        const page = clip(body.page, 300)
        if (!page || page.startsWith('/lab')) return new Response(null, { status: 204 })

        const referrer = clip(body.referrer, 500) ?? ''
        const landing = body.landing === true
        const refHost = hostOf(referrer)
        const utm = { source: clip(body.utm_source, 60), medium: clip(body.utm_medium, 60), campaign: clip(body.utm_campaign, 80) }

        await supabase.from('page_views').insert({
            page: page.split('?')[0],
            referrer,
            visitor: visitorId(req),
            landing,
            ref_host: landing ? refHost || null : null,
            source: landing ? sourceOf(refHost, utm) : null,
            utm_source: landing ? utm.source ?? null : null,
            utm_medium: landing ? utm.medium ?? null : null,
            utm_campaign: landing ? utm.campaign ?? null : null,
        })
    } catch { /* licznik nigdy nie psuje strony */ }
    return new Response(null, { status: 204 })
}
