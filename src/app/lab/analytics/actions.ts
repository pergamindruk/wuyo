'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateWithFallback } from '@/lib/gemini'
import { RULES, VOICE, clean } from '@/lib/lab/ai/context'

export type OwnStats = {
    views: number
    prevViews: number
    daily: { date: string; views: number }[]
    pages: { page: string; views: number }[]
    referrers: { referrer: string; views: number }[]
}

/** Własny licznik odsłon (tabela page_views, zapisywana przez /api/analytics/track). */
export async function getOwnStats(days = 30): Promise<OwnStats | null> {
    // Akcja serwera jest publicznym adresem: najpierw sprawdzamy, czy to zalogowany Mateusz.
    const { data: { user } } = await (await createClient()).auth.getUser()
    if (!user) return null
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 2 * 86_400_000)
    const { data, error } = await supabase.from('page_views').select('page, referrer, created_at')
        .gte('created_at', since.toISOString()).limit(20000)
    if (error || !data) return null

    const cut = Date.now() - days * 86_400_000
    const cur = data.filter((r) => new Date(r.created_at as string).getTime() >= cut)
    const byDay = new Map<string, number>()
    for (let i = days - 1; i >= 0; i--) byDay.set(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10), 0)
    const pages = new Map<string, number>()
    const refs = new Map<string, number>()
    for (const r of cur) {
        const d = (r.created_at as string).slice(0, 10)
        if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + 1)
        const page = (r.page as string) || '/'
        if (!page.startsWith('/lab')) pages.set(page, (pages.get(page) ?? 0) + 1)
        if (r.referrer) {
            let host = r.referrer as string
            try { host = new URL(host).hostname.replace(/^www\./, '') } catch { /* zostaje surowy tekst */ }
            if (host && host !== 'wuyo.pl' && host !== 'localhost') refs.set(host, (refs.get(host) ?? 0) + 1)
        }
    }
    const top = (m: Map<string, number>, n: number) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
    return {
        views: cur.length,
        prevViews: data.length - cur.length,
        daily: [...byDay.entries()].map(([date, views]) => ({ date, views })),
        pages: top(pages, 10).map(([page, views]) => ({ page, views })),
        referrers: top(refs, 8).map(([referrer, views]) => ({ referrer, views })),
    }
}

/** 3 konkretne ruchy marketingowe na podstawie liczb ze strony (podsumowanie przychodzi z serwera strony). */
export async function getMarketingTips(summary: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu.' }
    const prompt = `${VOICE}\n\n${RULES}

Jesteś doradcą marketingowym jednoosobowego studia WUYO z Rzeszowa (logo, druk, strony dla małych firm).
Firma startuje w grudniu 2026, teraz buduje zaplecze. Klient: właściciel małej firmy 40-55 lat z Rzeszowa i okolic.

DANE STRONY wuyo.pl:
${summary.slice(0, 6000)}

ZADANIE: markdown, krótko. Zacznij od "## Co mówią liczby" (3 zdania, tylko z danych wyżej, bez zgadywania).
Potem "## 3 ruchy na ten tydzień": każdy ruch = co zrobić, gdzie (konkretna podstrona, zapytanie z Google albo kanał z danych), ile czasu, czego się spodziewać.
Priorytet: zapytania z Google z dużą liczbą wyświetleń i słabą pozycją (8-20) albo niskim CTR, podstrony z ruchem bez kontaktu, lokalne SEO (Rzeszów), wizytówka Google, polecenia.
Na koniec "## Czego nie robić teraz" (1 punkt). Nie wymyślaj liczb. Jeśli danych brakuje, powiedz, czego brakuje.`
    try {
        return { ok: true, text: clean(await generateWithFallback('content', prompt)) }
    } catch {
        return { ok: false, error: 'AI nie odpowiada. Spróbuj za chwilę.' }
    }
}
