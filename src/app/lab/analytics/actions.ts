'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateWithFallback } from '@/lib/gemini'
import { RULES, VOICE, clean } from '@/lib/lab/ai/context'

export type SourceRow = { source: string; visitors: number; leads: number; downloads: number; contacts: number }

export type OwnStats = {
    /** Od kiedy liczymy potwierdzone dane (nowy licznik). */
    since: string
    visitors: number
    prevVisitors: number
    views: number
    daily: { date: string; views: number }[]
    pages: { page: string; views: number }[]
    landings: { page: string; views: number }[]
    sources: SourceRow[]
    events: { event: string; count: number }[]
    leads: { total: number; byType: { type: string; count: number }[] }
    downloads: { requested: number; confirmed: number; withConsent: number; byFile: { file: string; confirmed: number; requested: number }[] }
}

type View = { page: string; visitor: string; source: string | null; landing: boolean; created_at: string }

/**
 * Potwierdzone statystyki z własnego licznika. Liczą się tylko wiersze z identyfikatorem
 * odwiedzającego (nowy licznik od 15.11.2026: bez robotów, localhost i automatów).
 * Osoba = unikalny odwiedzający danego dnia. Leady i pobrania są z bazy, więc to twarde liczby.
 */
export async function getOwnStats(days = 30): Promise<OwnStats | null> {
    // Akcja serwera jest publicznym adresem: najpierw sprawdzamy, czy to zalogowany Mateusz.
    const { data: { user } } = await (await createClient()).auth.getUser()
    if (!user) return null
    const db = createAdminClient()
    const now = Date.now()
    const cut = new Date(now - days * 86_400_000).toISOString()
    const prevCut = new Date(now - days * 2 * 86_400_000).toISOString()

    const [pv, ld, dl, first] = await Promise.all([
        db.from('page_views').select('page, visitor, source, landing, created_at').not('visitor', 'is', null).gte('created_at', prevCut).limit(50000),
        db.from('leads').select('type, source, created_at').gte('created_at', cut).limit(5000),
        db.from('downloads').select('file, source, confirmed_at, marketing_consent, created_at').gte('created_at', cut).limit(5000),
        db.from('page_views').select('created_at').not('visitor', 'is', null).order('created_at', { ascending: true }).limit(1).maybeSingle(),
    ])
    if (pv.error) return null
    const all = (pv.data ?? []) as View[]
    const cur = all.filter((r) => r.created_at >= cut)
    const prev = all.filter((r) => r.created_at < cut)
    const isEvent = (r: View) => r.page.startsWith('/zdarzenie/')
    const visitorsOf = (rows: View[]) => new Set(rows.filter((r) => !isEvent(r)).map((r) => r.visitor)).size

    // Źródło każdej osoby = jej pierwsze wejście z zewnątrz w danym okresie.
    const sourceOf = new Map<string, string>()
    for (const r of [...cur].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
        if (r.landing && r.source && !sourceOf.has(r.visitor)) sourceOf.set(r.visitor, r.source)
    }
    const src = new Map<string, SourceRow>()
    const row = (s: string) => {
        if (!src.has(s)) src.set(s, { source: s, visitors: 0, leads: 0, downloads: 0, contacts: 0 })
        return src.get(s)!
    }
    for (const s of sourceOf.values()) row(s).visitors++

    const byDay = new Map<string, Set<string>>()
    for (let i = days - 1; i >= 0; i--) byDay.set(new Date(now - i * 86_400_000).toISOString().slice(0, 10), new Set())
    const pages = new Map<string, number>()
    const landings = new Map<string, number>()
    const events = new Map<string, number>()
    for (const r of cur) {
        if (isEvent(r)) {
            const e = r.page.slice('/zdarzenie/'.length)
            events.set(e, (events.get(e) ?? 0) + 1)
            row(sourceOf.get(r.visitor) ?? 'nieznane').contacts++
            continue
        }
        byDay.get(r.created_at.slice(0, 10))?.add(r.visitor)
        pages.set(r.page, (pages.get(r.page) ?? 0) + 1)
        if (r.landing) landings.set(r.page, (landings.get(r.page) ?? 0) + 1)
    }

    const leads = (ld.data ?? []) as { type: string | null; source: string | null }[]
    const leadTypes = new Map<string, number>()
    for (const l of leads) {
        leadTypes.set(l.type ?? '?', (leadTypes.get(l.type ?? '?') ?? 0) + 1)
        if (l.source) row(l.source).leads++ // stare leady bez źródła nie wchodzą do tabeli źródeł
    }

    const dls = (dl.data ?? []) as { file: string; source: string | null; confirmed_at: string | null; marketing_consent: boolean }[]
    const files = new Map<string, { file: string; confirmed: number; requested: number }>()
    for (const d of dls) {
        const f = files.get(d.file) ?? { file: d.file, confirmed: 0, requested: 0 }
        f.requested++
        if (d.confirmed_at) { f.confirmed++; row(d.source ?? 'nieznane').downloads++ }
        files.set(d.file, f)
    }

    const top = (m: Map<string, number>, n: number) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
    return {
        since: (first.data?.created_at as string | undefined)?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        visitors: visitorsOf(cur),
        prevVisitors: visitorsOf(prev),
        views: cur.filter((r) => !isEvent(r)).length,
        daily: [...byDay.entries()].map(([date, set]) => ({ date, views: set.size })),
        pages: top(pages, 12).map(([page, views]) => ({ page, views })),
        landings: top(landings, 10).map(([page, views]) => ({ page, views })),
        sources: [...src.values()].sort((a, b) => b.visitors - a.visitors || b.leads - a.leads),
        events: top(events, 10).map(([event, count]) => ({ event, count })),
        leads: { total: leads.length, byType: top(leadTypes, 10).map(([type, count]) => ({ type, count })) },
        downloads: {
            requested: dls.length,
            confirmed: dls.filter((d) => d.confirmed_at).length,
            withConsent: dls.filter((d) => d.confirmed_at && d.marketing_consent).length,
            byFile: [...files.values()],
        },
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
