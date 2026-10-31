import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { googleToken } from '@/lib/ai-endpoint'
import { generateWithFallback } from '@/lib/gemini'
import { VOICE } from '@/lib/lab/ai/context'
import { sendEmail, FROM_NOTIFICATION, TO_MATEUSZ } from '@/lib/email'
import {
    KEY_PAGES, EVALUATE_AFTER_DAYS, MAX_AUTO_PER_WEEK, MAX_OPEN_PROPOSALS,
    type Alarm, type PageCheck, type PageStat, type QueryStat,
    contentCandidates, evaluate, isManaged, metaCandidates, newAlarms, pageAlarms, parseHtmlMeta, pathOf,
    stripBrand, trafficAlarms, validateMeta,
} from './rules'

/**
 * Jeden przegląd SEO-radcy (cron /api/cron/seo-radca, codziennie rano):
 * 1. sprawdza każdą stronę z mapy strony (działa, tytuł, opis, noindex, czas),
 * 2. Search Console: spadki ruchu tydzień do tygodnia, błędy mapy strony,
 * 3. ocenia zmiany sprzed 28 dni (gorszy CTR = cofa),
 * 4. jedna nowa zmiana tytułu i opisu (sama albo do akceptacji) + propozycja większej zmiany,
 * 5. mail tylko przy nowym alarmie albo gdy coś zrobił.
 * Zwraca, czy zmieniły się podmiany na stronie (wtedy trasa odświeża cache).
 */

const SITE_URL = 'https://wuyo.pl'
const DAY = 86_400_000
const BUDGET_MS = 45_000 // cron ma 60 s; AI tylko, jeśli zostało dość czasu

type Change = {
    id: string; path: string; kind: string; status: string; auto: boolean; query: string | null; created_at: string
    applied_at: string | null; evaluate_after: string | null; before: { title?: string; description?: string }
    after: { title?: string; description?: string }; metrics_before: PageStat | null
}

const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10)

// ---------- strona ----------

async function sitemapUrls(): Promise<string[]> {
    const res = await fetch(`${SITE_URL}/sitemap.xml`, { cache: 'no-store', signal: AbortSignal.timeout(10_000) })
    if (!res.ok) throw new Error(`sitemap.xml ${res.status}`)
    const xml = await res.text()
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter((u) => isManaged(pathOf(u)))
}

async function checkPage(url: string): Promise<PageCheck> {
    const t0 = Date.now()
    try {
        const res = await fetch(url, { cache: 'no-store', redirect: 'follow', headers: { 'User-Agent': 'WUYO-SEO-radca/1.0' }, signal: AbortSignal.timeout(12_000) })
        const html = res.ok ? await res.text() : ''
        const robotsHeader = res.headers.get('x-robots-tag') ?? ''
        const meta = parseHtmlMeta(html)
        return { url, status: res.status, ms: Date.now() - t0, ...meta, noindex: meta.noindex || /noindex/i.test(robotsHeader) }
    } catch (e) {
        return { url, status: 0, ms: Date.now() - t0, noindex: false, error: (e as Error).name === 'TimeoutError' ? 'brak odpowiedzi 12 s' : (e as Error).message }
    }
}

async function checkAll(urls: string[]): Promise<PageCheck[]> {
    const out: PageCheck[] = []
    for (let i = 0; i < urls.length; i += 8) out.push(...(await Promise.all(urls.slice(i, i + 8).map(checkPage))))
    return out
}

// ---------- Search Console ----------

type GscRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }

async function gsc(token: string, body: object): Promise<GscRow[]> {
    const site = process.env.GSC_SITE?.trim() || 'sc-domain:wuyo.pl'
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15_000),
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Search Console ${res.status}`)
    return ((await res.json()) as { rows?: GscRow[] }).rows ?? []
}

async function sitemapErrors(token: string): Promise<Alarm[]> {
    const site = process.env.GSC_SITE?.trim() || 'sc-domain:wuyo.pl'
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/sitemaps`, {
        cache: 'no-store', signal: AbortSignal.timeout(10_000), headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const list = ((await res.json()) as { sitemap?: { path: string; errors?: string; warnings?: string }[] }).sitemap ?? []
    return list.filter((s) => Number(s.errors ?? 0) > 0).map((s) => ({ key: `sitemap:${s.path}`, level: 'alarm' as const, text: `Google zgłasza ${s.errors} błędów w ${s.path}` }))
}

const toPage = (r: GscRow): PageStat => ({ page: pathOf(r.keys?.[0] ?? ''), clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })

async function pageStatFor(token: string, path: string, from: number, to: number): Promise<PageStat | null> {
    const rows = await gsc(token, {
        startDate: isoDay(from), endDate: isoDay(to), dimensions: ['page'],
        dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: `${SITE_URL}${path === '/' ? '/' : path}` }] }],
    })
    return rows[0] ? toPage(rows[0]) : null
}

// ---------- AI ----------

function parseJson<T>(text: string): T | null {
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return null
    try { return JSON.parse(m[0]) as T } catch { return null }
}

async function writeMeta(path: string, before: { title?: string; description?: string }, stat: PageStat, queries: QueryStat[]): Promise<{ title: string; description: string; reason: string } | null> {
    const top = queries.filter((q) => q.page === path).sort((a, b) => b.impressions - a.impressions).slice(0, 8)
    let feedback = ''
    for (let attempt = 0; attempt < 2; attempt++) {
        const prompt = `Jesteś SEO-radcą strony wuyo.pl (grafik i strony WWW, Rzeszów). Strona ${path} jest wysoko w Google, ale mało kto ją klika.
Pozycja średnio ${stat.position.toFixed(1)}, ${stat.impressions} wyświetleń, CTR ${(stat.ctr * 100).toFixed(1)}% w 28 dni.
Obecny tytuł: ${before.title ?? '(brak)'}
Obecny opis: ${before.description ?? '(brak)'}
Frazy, po których ludzie ją widzą (wyświetlenia, pozycja):
${top.map((q) => `- "${q.query}" ${q.impressions}, poz. ${q.position.toFixed(1)}`).join('\n') || '- brak danych'}

Napisz nowy tytuł i opis, które lepiej odpowiadają na te frazy i zachęcają do kliknięcia.
Zasady:
- tytuł 30-60 znaków, główna fraza na początku, bez nazwy WUYO${path === '/' ? ' (wyjątek: strona główna może mieć WUYO na końcu)' : ''}
- opis 120-155 znaków, konkretna korzyść, prosty język, kończy się zachętą
- ceny i terminy TYLKO takie, jakie są w obecnym tytule lub opisie; nie wymyślaj nowych
- bez długich myślników, bez wykrzykników, bez słów: kompleksowy, dedykowany, profesjonalny, najlepszy, premium
${VOICE.split('\n').slice(0, 2).join('\n')}
${feedback}
Odpowiedz samym JSON: {"title": "...", "description": "...", "reason": "jedno zdanie po polsku, dlaczego tak"}`
        const out = parseJson<{ title: string; description: string; reason: string }>(await generateWithFallback('seo', prompt, { noThinking: true }))
        if (!out?.title || !out.description) continue
        const errs = validateMeta(path, out, before)
        if (!errs.length) return { title: out.title.trim(), description: out.description.trim(), reason: out.reason ?? '' }
        feedback = `Poprzednia wersja odrzucona: ${errs.join('; ')}. Popraw.`
    }
    return null
}

async function writeProposal(q: QueryStat, pageTitle?: string): Promise<{ typ: string; tytul: string; plan: string[]; reason: string } | null> {
    const prompt = `Jesteś SEO-radcą strony wuyo.pl (grafik i strony WWW, Rzeszów, klienci: małe firmy).
Fraza "${q.query}" ma ${q.impressions} wyświetleń w 28 dni i średnią pozycję ${q.position.toFixed(1)}. Google pokazuje dla niej stronę ${q.page}${pageTitle ? ` („${pageTitle}”)` : ''}.
Zaproponuj jedną zmianę, która wciągnie tę frazę na pierwszą stronę Google:
- "rozbudowa" = co dopisać na stronie ${q.page} (sekcja, pytania i odpowiedzi, przykład), albo
- "nowy_wpis" = osobny wpis na blog, jeśli fraza to inne pytanie niż temat strony.
Plan: 3-5 konkretnych punktów, prosty język, bez cen i terminów. Bez słów: kompleksowy, dedykowany, profesjonalny.
Odpowiedz samym JSON: {"typ": "rozbudowa" | "nowy_wpis", "tytul": "nagłówek sekcji albo tytuł wpisu", "plan": ["...", "..."], "reason": "jedno zdanie"}`
    const out = parseJson<{ typ: string; tytul: string; plan: string[]; reason: string }>(await generateWithFallback('seo', prompt, { noThinking: true }))
    return out?.tytul && Array.isArray(out.plan) && out.plan.length ? out : null
}

// ---------- przegląd ----------

export type RunResult = { overridesChanged: boolean; alarms: Alarm[]; actions: string[]; error?: string }

export async function runSeoRadca(db: SupabaseClient): Promise<RunResult> {
    const t0 = Date.now()
    const actions: string[] = []
    let alarms: Alarm[] = []
    let overridesChanged = false
    const stats: Record<string, unknown> = {}
    let error: string | undefined

    try {
        // 1. Strony
        const checks = await checkAll(await sitemapUrls())
        alarms.push(...pageAlarms(checks))
        stats.pages = checks.length
        const live = new Map(checks.map((c) => [pathOf(c.url), { title: stripBrand(c.title), description: c.description }]))

        // 2. Search Console
        const token = await googleToken('https://www.googleapis.com/auth/webmasters.readonly')
        if (!token) throw new Error('Brak konta serwisowego (GCP_SA_KEY_B64)')
        const end = Date.now() - 3 * DAY // dane GSC mają ok. 2-3 dni opóźnienia
        const [curW, prevW, pages28, queries28, smErr] = await Promise.all([
            gsc(token, { startDate: isoDay(end - 6 * DAY), endDate: isoDay(end) }),
            gsc(token, { startDate: isoDay(end - 13 * DAY), endDate: isoDay(end - 7 * DAY) }),
            gsc(token, { startDate: isoDay(end - 27 * DAY), endDate: isoDay(end), dimensions: ['page'], rowLimit: 500 }),
            gsc(token, { startDate: isoDay(end - 27 * DAY), endDate: isoDay(end), dimensions: ['page', 'query'], rowLimit: 2000 }),
            sitemapErrors(token),
        ])
        const cur = { clicks: curW[0]?.clicks ?? 0, impressions: curW[0]?.impressions ?? 0 }
        const prev = { clicks: prevW[0]?.clicks ?? 0, impressions: prevW[0]?.impressions ?? 0 }
        alarms.push(...trafficAlarms(cur, prev), ...smErr)
        stats.week = cur
        stats.prevWeek = prev
        const pages = pages28.map(toPage)
        const queries: QueryStat[] = queries28.map((r) => ({ ...toPage(r), query: r.keys?.[1] ?? '' }))
        stats.topPages = pages.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 10)

        // 3. Ocena zmian sprzed 28 dni
        const { data: changes } = await db.from('seo_changes').select('*').order('created_at', { ascending: false }).limit(300)
        const all = (changes ?? []) as Change[]
        const today = isoDay(Date.now())
        for (const c of all.filter((c) => c.kind === 'meta' && c.status === 'aktywna' && c.evaluate_after && c.evaluate_after <= today && c.applied_at)) {
            const after = await pageStatFor(token, c.path, new Date(c.applied_at!).getTime() + 2 * DAY, end)
            const v = evaluate(c.metrics_before, after)
            if (v === 'czekaj') {
                await db.from('seo_changes').update({ evaluate_after: isoDay(Date.now() + 14 * DAY), metrics_after: after }).eq('id', c.id)
                continue
            }
            await db.from('seo_changes').update({ status: v === 'cofnij' ? 'cofnieta' : 'utrzymana', metrics_after: after, decided_at: new Date().toISOString() }).eq('id', c.id)
            const ctr = (s: PageStat | null) => s ? `${(s.ctr * 100).toFixed(1)}%` : '?'
            if (v === 'cofnij') { overridesChanged = true; actions.push(`Cofnąłem tytuł na ${c.path}: CTR ${ctr(c.metrics_before)} → ${ctr(after)}`) }
            else actions.push(`Zostawiam nowy tytuł na ${c.path}: CTR ${ctr(c.metrics_before)} → ${ctr(after)}`)
        }

        // 4a. Nowy tytuł i opis: najwyżej MAX_AUTO_PER_WEEK zmian na tydzień, nic nie czeka już na akceptację
        const weekAgo = Date.now() - 7 * DAY
        const autoThisWeek = all.filter((c) => c.kind === 'meta' && c.auto && new Date(c.created_at).getTime() > weekAgo).length
        const metaWaiting = all.some((c) => c.kind === 'meta' && c.status === 'do_akceptacji')
        if (autoThisWeek < MAX_AUTO_PER_WEEK && !metaWaiting && Date.now() - t0 < BUDGET_MS) {
            const recent = all.filter((c) => c.kind === 'meta').map((c) => ({ path: c.path, created_at: c.created_at }))
            const cand = metaCandidates(pages, recent).find((p) => live.has(p.page))
            if (cand) {
                const before = live.get(cand.page)!
                const meta = await writeMeta(cand.page, before, cand, queries)
                if (meta) {
                    const key = KEY_PAGES.includes(cand.page)
                    const row = {
                        path: cand.page, kind: 'meta', auto: !key, status: key ? 'do_akceptacji' : 'aktywna',
                        query: queries.filter((q) => q.page === cand.page).sort((a, b) => b.impressions - a.impressions)[0]?.query ?? null,
                        reason: meta.reason, before, after: { title: meta.title, description: meta.description }, metrics_before: cand,
                        ...(key ? {} : { applied_at: new Date().toISOString(), evaluate_after: isoDay(Date.now() + EVALUATE_AFTER_DAYS * DAY) }),
                    }
                    if (!key) await db.from('seo_changes').update({ status: 'zastapiona' }).eq('path', cand.page).eq('kind', 'meta').in('status', ['aktywna', 'utrzymana'])
                    const { error: insErr } = await db.from('seo_changes').insert(row)
                    if (insErr) throw new Error(`zapis zmiany: ${insErr.message}`)
                    if (key) actions.push(`Nowy tytuł dla ${cand.page} czeka na Twoją akceptację w /lab/seo`)
                    else { overridesChanged = true; actions.push(`Zmieniłem tytuł i opis ${cand.page}: „${meta.title}”. Ocenię wynik za ${EVALUATE_AFTER_DAYS} dni.`) }
                }
            }
        }

        // 4b. Propozycja większej zmiany (rozbudowa strony albo nowy wpis), gdy mało otwartych
        const open = all.filter((c) => c.kind === 'propozycja' && c.status === 'do_akceptacji').length
        if (open < MAX_OPEN_PROPOSALS && Date.now() - t0 < BUDGET_MS) {
            const used = all.filter((c) => c.kind === 'propozycja' && c.query).map((c) => c.query!)
            const q = contentCandidates(queries, used)[0]
            if (q) {
                const p = await writeProposal(q, live.get(q.page)?.title)
                if (p) {
                    await db.from('seo_changes').insert({
                        path: q.page, kind: 'propozycja', status: 'do_akceptacji', query: q.query, reason: p.reason,
                        before: live.get(q.page) ?? {}, after: { typ: p.typ, tytul: p.tytul, plan: p.plan }, metrics_before: q,
                    })
                    actions.push(`Propozycja: ${p.typ === 'nowy_wpis' ? 'nowy wpis' : `rozbudowa ${q.page}`} pod frazę „${q.query}” (poz. ${q.position.toFixed(1)})`)
                }
            }
        }
    } catch (e) {
        error = (e as Error).message
        alarms.push({ key: 'radca:error', level: 'uwaga', text: `przegląd nie doszedł do końca: ${error}` })
    }

    alarms = alarms.slice(0, 50)
    const { data: last } = await db.from('seo_runs').select('alarms').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const fresh = newAlarms(alarms, ((last?.alarms ?? []) as Alarm[]))
    await db.from('seo_runs').insert({ alarms, stats, actions, error: error ?? null })

    if (fresh.length || actions.length) {
        const li = (s: string) => `<li>${s.replace(/</g, '&lt;')}</li>`
        await sendEmail({
            from: FROM_NOTIFICATION, to: TO_MATEUSZ,
            subject: fresh.some((a) => a.level === 'alarm') ? `SEO-radca: alarm na wuyo.pl (${fresh.length})` : 'SEO-radca: zmiany na wuyo.pl',
            html: `${fresh.length ? `<p><b>Nowe alarmy:</b></p><ul>${fresh.map((a) => li(a.text)).join('')}</ul>` : ''}`
                + `${actions.length ? `<p><b>Co zrobiłem:</b></p><ul>${actions.map(li).join('')}</ul>` : ''}`
                + `<p><a href="${SITE_URL}/lab/seo">Otwórz /lab/seo</a></p>`,
        }, 'seo-radca').catch(() => { /* brak maila nie psuje przeglądu, wynik jest w /lab/seo */ })
    }

    return { overridesChanged, alarms, actions, error }
}
