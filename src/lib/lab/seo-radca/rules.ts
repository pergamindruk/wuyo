/**
 * SEO-radca: reguły bez sieci i bazy (testowane w src/__tests__/seo-radca.test.ts).
 * Kto decyduje: radca sam zmienia tytuł i opis zwykłych stron i wpisów.
 * Strony, które sprzedają (KEY_PAGES), i wszystko większe idzie do akceptacji w /lab/seo.
 */

/** Strony, na których zmiana tytułu wymaga akceptacji Mateusza. */
export const KEY_PAGES = ['/', '/strony-internetowe-rzeszow', '/grafik-rzeszow', '/druk-rzeszow', '/strony-www', '/logo', '/cennik']

/** Strony, których radca nie rusza wcale. */
const SKIP = [/^\/en(\/|$)/, /^\/lab/, /^\/c\//, /^\/brief/, /^\/oferta/, /^\/polityka/, /^\/audyt/]

export const AUTO_COOLDOWN_DAYS = 45 // ta sama strona najwyżej raz na 45 dni
export const EVALUATE_AFTER_DAYS = 28
export const MAX_AUTO_PER_WEEK = 1
export const MAX_OPEN_PROPOSALS = 3

export type PageStat = { page: string; clicks: number; impressions: number; ctr: number; position: number }
export type QueryStat = PageStat & { query: string }
export type Alarm = { key: string; level: 'alarm' | 'uwaga'; text: string }
export type PageCheck = { url: string; status: number; ms: number; title?: string; description?: string; canonical?: string; noindex: boolean; error?: string }

const DAY = 86_400_000

export function pathOf(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?wuyo\.pl/, '').replace(/\/$/, '') || '/'
}

export function isManaged(path: string): boolean {
    return !SKIP.some((r) => r.test(path))
}

/** Przybliżony CTR, jakiego można się spodziewać na danej pozycji w Google. */
export function expectedCtr(position: number): number {
    if (position <= 1.5) return 0.25
    if (position <= 2.5) return 0.15
    if (position <= 3.5) return 0.1
    if (position <= 4.5) return 0.07
    if (position <= 5.5) return 0.05
    if (position <= 10.5) return 0.03
    return 0.01
}

/** Strony wysoko w Google, które mało kto klika: kandydaci na nowy tytuł i opis. Najlepsza szansa pierwsza. */
export function metaCandidates(pages: PageStat[], recent: { path: string; created_at: string }[], now = Date.now()): PageStat[] {
    const blocked = new Set(recent.filter((r) => now - new Date(r.created_at).getTime() < AUTO_COOLDOWN_DAYS * DAY).map((r) => r.path))
    return pages
        .filter((p) => isManaged(p.page) && !blocked.has(p.page))
        .filter((p) => p.position <= 10.5 && p.impressions >= 80 && p.ctr < expectedCtr(p.position) * 0.5)
        // Ile kliknięć ucieka: wyświetlenia × (oczekiwany CTR - obecny).
        .sort((a, b) => b.impressions * (expectedCtr(b.position) - b.ctr) - a.impressions * (expectedCtr(a.position) - a.ctr))
}

/** Frazy tuż za pierwszą stroną Google: temat na rozbudowę strony albo nowy wpis. */
export function contentCandidates(queries: QueryStat[], recentQueries: string[]): QueryStat[] {
    const seen = new Set(recentQueries.map((q) => q.toLowerCase()))
    return queries
        .filter((q) => isManaged(q.page) && !seen.has(q.query.toLowerCase()))
        .filter((q) => q.position > 7.5 && q.position <= 25 && q.impressions >= 40)
        .sort((a, b) => b.impressions - a.impressions)
}

const FORBIDDEN = /(kompleksow|dedykowan|profesjonaln|innowacyjn|rozwiązani|holistyczn|synergi|premium|najlepsz)/i

/** Sprawdza tytuł i opis od AI. Zwraca listę problemów (pusta = można publikować). */
export function validateMeta(path: string, meta: { title: string; description: string }, before: { title?: string; description?: string }): string[] {
    const errs: string[] = []
    const t = meta.title.trim()
    const d = meta.description.trim()
    if (t.length < 20 || t.length > 60) errs.push(`tytuł ma ${t.length} znaków (20-60)`)
    if (d.length < 70 || d.length > 160) errs.push(`opis ma ${d.length} znaków (70-160)`)
    if (FORBIDDEN.test(t) || FORBIDDEN.test(d)) errs.push('zakazane słowo')
    if (/[—–]/.test(t + d)) errs.push('długi myślnik')
    if (path !== '/' && /\bWUYO\b/i.test(t)) errs.push('marka w tytule (dokleja ją szablon)')
    // Ceny tylko takie, jakie już były na stronie: radca nie wymyśla cen.
    const oldText = `${before.title ?? ''} ${before.description ?? ''}`.replace(/\s/g, '')
    for (const m of `${t} ${d}`.matchAll(/(\d[\d\s]*)\s?zł/g)) {
        if (!oldText.includes(m[1].replace(/\s/g, ''))) errs.push(`cena ${m[0].trim()} spoza strony`)
    }
    if (/\d+\s?(dni|godzin|h)\b/i.test(`${t} ${d}`) && !/\d+\s?(dni|godzin|h)\b/i.test(`${before.title ?? ''} ${before.description ?? ''}`)) {
        errs.push('termin, którego nie było na stronie')
    }
    return errs
}

export type Verdict = 'utrzymaj' | 'cofnij' | 'czekaj'

/** Po 28 dniach: czy nowy tytuł daje więcej kliknięć z wyświetleń niż stary. */
export function evaluate(before: PageStat | null, after: PageStat | null): Verdict {
    if (!after || after.impressions < 50) return 'czekaj'
    if (!before || before.impressions < 50) return 'utrzymaj'
    return after.ctr < before.ctr * 0.8 ? 'cofnij' : 'utrzymaj'
}

/** Alarmy z przeglądu stron wuyo.pl. */
export function pageAlarms(checks: PageCheck[]): Alarm[] {
    const out: Alarm[] = []
    for (const c of checks) {
        const p = pathOf(c.url)
        if (c.error || c.status >= 500 || c.status === 0) out.push({ key: `down:${p}`, level: 'alarm', text: `${p} nie działa (${c.error ?? c.status})` })
        else if (c.status >= 400) out.push({ key: `status:${p}`, level: 'alarm', text: `${p} zwraca ${c.status}` })
        else {
            if (c.noindex) out.push({ key: `noindex:${p}`, level: 'alarm', text: `${p} ma noindex, Google jej nie pokaże` })
            if (!c.title) out.push({ key: `title:${p}`, level: 'alarm', text: `${p} nie ma tytułu` })
            if (!c.description) out.push({ key: `desc:${p}`, level: 'uwaga', text: `${p} nie ma opisu` })
            if (c.canonical && pathOf(c.canonical) !== p) out.push({ key: `canon:${p}`, level: 'uwaga', text: `${p} wskazuje canonical na ${pathOf(c.canonical)}` })
            if (c.ms > 4000) out.push({ key: `slow:${p}`, level: 'uwaga', text: `${p} ładuje się ${(c.ms / 1000).toFixed(1)} s` })
        }
    }
    return out
}

/** Spadek ruchu z Google: tydzień do tygodnia. */
export function trafficAlarms(cur: { clicks: number; impressions: number }, prev: { clicks: number; impressions: number }): Alarm[] {
    const out: Alarm[] = []
    if (prev.impressions >= 100 && cur.impressions < prev.impressions * 0.6) {
        out.push({ key: 'drop:impressions', level: 'alarm', text: `wyświetlenia w Google spadły o ${Math.round((1 - cur.impressions / prev.impressions) * 100)}% (${prev.impressions} → ${cur.impressions}, tydzień do tygodnia)` })
    }
    if (prev.clicks >= 10 && cur.clicks < prev.clicks * 0.5) {
        out.push({ key: 'drop:clicks', level: 'uwaga', text: `kliknięcia z Google spadły z ${prev.clicks} do ${cur.clicks} (tydzień do tygodnia)` })
    }
    return out
}

/** Czy są alarmy, których nie było w poprzednim przeglądzie (żeby nie wysyłać tego samego maila codziennie). */
export function newAlarms(now: Alarm[], before: Alarm[]): Alarm[] {
    const old = new Set(before.map((a) => a.key))
    return now.filter((a) => !old.has(a.key))
}

export function parseHtmlMeta(html: string): { title?: string; description?: string; canonical?: string; noindex: boolean } {
    const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
    const head = html.slice(0, 200_000)
    const title = head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]
    const metaContent = (attr: string, value: string) => {
        for (const tag of head.match(/<(meta|link)\b[^>]*>/gi) ?? []) {
            if (new RegExp(`${attr}=["']${value}["']`, 'i').test(tag)) {
                return tag.match(/(?:content|href)=["']([^"']*)["']/i)?.[1]
            }
        }
        return undefined
    }
    const robots = metaContent('name', 'robots') ?? ''
    return {
        title: title ? decode(title) : undefined,
        description: (() => { const d = metaContent('name', 'description'); return d ? decode(d) : undefined })(),
        canonical: metaContent('rel', 'canonical'),
        noindex: /noindex/i.test(robots),
    }
}

/** Tytuł bez doklejonej marki z szablonu layoutu. */
export function stripBrand(title?: string): string | undefined {
    return title?.replace(/\s*\|\s*WUYO\s*$/, '').trim()
}
