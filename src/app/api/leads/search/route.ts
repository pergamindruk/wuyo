import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireLabUser } from '@/lib/lab/require-user'
import { apifyConfigured, MAX_RESULTS_CAP, searchPlaces } from '@/lib/apify'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const schema = z.object({
    query: z.string().trim().min(2, 'Wpisz branżę, np. „restauracja”.').max(80),
    location: z.string().trim().min(2).max(80).default('Rzeszów'),
    maxResults: z.coerce.number().int().min(1).max(MAX_RESULTS_CAP, `Maksymalnie ${MAX_RESULTS_CAP} wyników.`).default(20),
    withoutWebsiteOnly: z.boolean().default(false),
})

/** POST: szuka firm w Google Maps przez Apify. */
export async function POST(request: Request) {
    const denied = await requireLabUser()
    if (denied) return denied
    if (!apifyConfigured()) {
        return NextResponse.json({ error: 'Brak APIFY_API_TOKEN. Dodaj token w Vercel → Settings → Environment Variables.' }, { status: 503 })
    }

    const parsed = schema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Złe dane.' }, { status: 400 })
    }
    try {
        const results = await searchPlaces(parsed.data)
        return NextResponse.json({ results, query: parsed.data })
    } catch (e) {
        console.error('leads/search:', e)
        const msg = e instanceof Error ? e.message : 'Wyszukiwanie nie wyszło.'
        return NextResponse.json({ error: msg.slice(0, 300) }, { status: 502 })
    }
}
