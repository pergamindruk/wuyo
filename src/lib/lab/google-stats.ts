import 'server-only'
import { googleToken } from '@/lib/ai-endpoint'

/**
 * Dane z Google Analytics 4 (Data API) i Search Console przez konto serwisowe GCP.
 * Wymaga: GA4_PROPERTY_ID (liczba z ustawień usługi GA4), konto serwisowe dodane w GA4 jako „Wyświetlający”
 * i w Search Console jako użytkownik. Opcjonalnie GSC_SITE (domyślnie sc-domain:wuyo.pl).
 */

export type Ga4Summary = {
    users: number
    newUsers: number
    sessions: number
    engagementRate: number
    avgEngagementSec: number
    keyEvents: number
    prevUsers: number
    prevSessions: number
    daily: { date: string; users: number }[]
    pages: { path: string; views: number; avgSec: number }[]
    sources: { source: string; sessions: number }[]
    devices: { device: string; users: number }[]
    cities: { city: string; users: number }[]
}

export type GscSummary = {
    clicks: number
    impressions: number
    ctr: number
    position: number
    queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[]
    pages: { page: string; clicks: number; impressions: number; position: number }[]
}

export type GoogleStats = {
    ga4: Ga4Summary | null
    gsc: GscSummary | null
    ga4Error?: string
    gscError?: string
}

type Ga4Row = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }

async function ga4Report(token: string, property: string, body: object): Promise<Ga4Row[]> {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
        cache: 'no-store',
    })
    if (!res.ok) throw new Error(`GA4 ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return ((await res.json()) as { rows?: Ga4Row[] }).rows ?? []
}

const num = (r: Ga4Row | undefined, i: number) => Number(r?.metricValues?.[i]?.value ?? 0)
const dim = (r: Ga4Row, i = 0) => r.dimensionValues?.[i]?.value ?? ''

async function getGa4(days: number): Promise<Ga4Summary> {
    const property = process.env.GA4_PROPERTY_ID?.trim()
    if (!property) throw new Error('Brak GA4_PROPERTY_ID')
    const token = await googleToken('https://www.googleapis.com/auth/analytics.readonly')
    if (!token) throw new Error('Brak konta serwisowego (GCP_SA_KEY_B64)')
    const range = { startDate: `${days}daysAgo`, endDate: 'today' }
    const prev = { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` }

    const [totals, daily, pages, sources, devices, cities] = await Promise.all([
        ga4Report(token, property, {
            dateRanges: [range, prev],
            metrics: [{ name: 'totalUsers' }, { name: 'newUsers' }, { name: 'sessions' }, { name: 'engagementRate' }, { name: 'userEngagementDuration' }, { name: 'keyEvents' }],
        }),
        ga4Report(token, property, { dateRanges: [range], dimensions: [{ name: 'date' }], metrics: [{ name: 'totalUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
        ga4Report(token, property, { dateRanges: [range], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }, { name: 'totalUsers' }], limit: 25, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
        ga4Report(token, property, { dateRanges: [range], dimensions: [{ name: 'sessionSourceMedium' }], metrics: [{ name: 'sessions' }], limit: 8, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] }),
        ga4Report(token, property, { dateRanges: [range], dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'totalUsers' }] }),
        ga4Report(token, property, { dateRanges: [range], dimensions: [{ name: 'city' }], metrics: [{ name: 'totalUsers' }], limit: 6, orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }] }),
    ])

    // Przy dwóch zakresach GA4 dokłada wymiar dateRange: date_range_0 = bieżący, date_range_1 = poprzedni.
    const cur = totals.find((r) => dim(r) === 'date_range_0') ?? totals[0]
    const old = totals.find((r) => dim(r) === 'date_range_1')
    const users = num(cur, 0)
    return {
        users,
        newUsers: num(cur, 1),
        sessions: num(cur, 2),
        engagementRate: num(cur, 3),
        avgEngagementSec: users ? num(cur, 4) / users : 0,
        keyEvents: num(cur, 5),
        prevUsers: num(old, 0),
        prevSessions: num(old, 2),
        daily: daily.map((r) => ({ date: dim(r), users: num(r, 0) })),
        // Bez /lab: to wejścia Mateusza do panelu, nie klienci.
        pages: pages.filter((r) => !dim(r).startsWith('/lab')).slice(0, 10)
            .map((r) => ({ path: dim(r), views: num(r, 0), avgSec: num(r, 2) ? num(r, 1) / num(r, 2) : 0 })),
        sources: sources.map((r) => ({ source: dim(r), sessions: num(r, 0) })),
        devices: devices.map((r) => ({ device: dim(r), users: num(r, 0) })),
        cities: cities.map((r) => ({ city: dim(r), users: num(r, 0) })).filter((c) => c.city && c.city !== '(not set)'),
    }
}

type GscRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }

async function gscQuery(token: string, site: string, body: object): Promise<GscRow[]> {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
        cache: 'no-store',
    })
    if (!res.ok) throw new Error(`Search Console ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return ((await res.json()) as { rows?: GscRow[] }).rows ?? []
}

async function getGsc(days: number): Promise<GscSummary> {
    const token = await googleToken('https://www.googleapis.com/auth/webmasters.readonly')
    if (!token) throw new Error('Brak konta serwisowego (GCP_SA_KEY_B64)')
    const site = process.env.GSC_SITE?.trim() || 'sc-domain:wuyo.pl'
    // Search Console ma dane z opóźnieniem ok. 2-3 dni.
    const end = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10)
    const start = new Date(Date.now() - (days + 2) * 86_400_000).toISOString().slice(0, 10)
    const [total, queries, pages] = await Promise.all([
        gscQuery(token, site, { startDate: start, endDate: end }),
        gscQuery(token, site, { startDate: start, endDate: end, dimensions: ['query'], rowLimit: 250 }),
        gscQuery(token, site, { startDate: start, endDate: end, dimensions: ['page'], rowLimit: 10 }),
    ])
    const t = total[0]
    return {
        clicks: t?.clicks ?? 0,
        impressions: t?.impressions ?? 0,
        ctr: t?.ctr ?? 0,
        position: t?.position ?? 0,
        queries: [...queries].sort((a, b) => b.impressions - a.impressions).slice(0, 40).map((r) => ({ query: r.keys?.[0] ?? '', clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position })),
        pages: pages.map((r) => ({ page: (r.keys?.[0] ?? '').replace(/^https?:\/\/(www\.)?wuyo\.pl/, '') || '/', clicks: r.clicks, impressions: r.impressions, position: r.position })),
    }
}

export async function getGoogleStats(days = 28): Promise<GoogleStats> {
    const [ga4, gsc] = await Promise.allSettled([getGa4(days), getGsc(days)])
    return {
        ga4: ga4.status === 'fulfilled' ? ga4.value : null,
        gsc: gsc.status === 'fulfilled' ? gsc.value : null,
        ga4Error: ga4.status === 'rejected' ? String((ga4.reason as Error)?.message ?? ga4.reason) : undefined,
        gscError: gsc.status === 'rejected' ? String((gsc.reason as Error)?.message ?? gsc.reason) : undefined,
    }
}
