// Logika publikacji: Postiz jako główna droga, Graph API (FB/IG WUYO) jako zapas, kolejka dla reszty.
// Używane przez /api/social/* oraz cron /api/cron/publish. Tylko serwer.
import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPost, getChannels, postizConfigured, PostizError, uploadImageFromUrl, type PostizMedia } from '@/lib/postiz'
import { publishToFB, publishToIG } from '@/lib/social-publish'
import type { ChannelsResponse, SocialChannel } from '@/lib/social/channels'

const CACHE_ID = 'postiz'
/** Po tylu nieudanych próbach z kolejki post dostaje status „blad”. */
const MAX_TRIES = 14

export type ChannelResult = {
    kanal: string
    nazwa: string
    ok: boolean
    oczekuje?: boolean
    droga?: 'postiz' | 'graph'
    blad?: string
}

export type PostStatus = 'w_kolejce' | 'zaplanowane' | 'opublikowane' | 'czesciowo' | 'blad'

export type SocialPostRow = {
    id: string
    tresc: string
    obrazy: string[]
    kanaly: SocialChannel[]
    tryb: 'teraz' | 'zaplanuj'
    termin: string | null
    status: PostStatus
    droga: string | null
    wyniki: ChannelResult[]
    proby: number
    calendar_event_id: string | null
    created_at: string
}

// ─── Kanały ──────────────────────────────────────────────

function graphChannels(): SocialChannel[] {
    const out: SocialChannel[] = []
    if (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
        out.push({ id: 'graph:facebook', name: 'WUYO', platform: 'facebook', provider: 'facebook', brand: 'WUYO', source: 'graph' })
    }
    if (process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN) {
        out.push({ id: 'graph:instagram', name: 'WUYO', platform: 'instagram', provider: 'instagram', brand: 'WUYO', source: 'graph' })
    }
    return out
}

async function readCache(db: SupabaseClient): Promise<SocialChannel[]> {
    const { data } = await db.from('social_channels_cache').select('dane').eq('id', CACHE_ID).maybeSingle()
    return Array.isArray(data?.dane) ? (data.dane as SocialChannel[]) : []
}

export async function listChannels(db: SupabaseClient = createAdminClient()): Promise<ChannelsResponse> {
    const configured = postizConfigured()
    let postiz: SocialChannel[] = []
    let online = false
    let error: string | undefined

    if (configured) {
        try {
            postiz = await getChannels()
            online = true
            await db.from('social_channels_cache').upsert({ id: CACHE_ID, dane: postiz, updated_at: new Date().toISOString() })
        } catch (e) {
            error = e instanceof Error ? e.message : 'Postiz nie odpowiada'
            postiz = await readCache(db)
        }
    }

    // Graph API pokazujemy tylko tam, gdzie Postiz nie ma konta WUYO na tej platformie.
    const graph = graphChannels().filter(
        (g) => !postiz.some((p) => p.brand === g.brand && p.platform === g.platform),
    )
    return { channels: [...postiz, ...graph], postiz: { configured, online, error } }
}

// ─── Publikacja ──────────────────────────────────────────

/** Czy ten kanał da się wysłać przez Graph API, gdy Postiz śpi. */
function graphCapable(ch: SocialChannel): boolean {
    if (ch.brand !== 'WUYO') return false
    if (ch.platform === 'facebook') return Boolean(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN)
    if (ch.platform === 'instagram') return Boolean(process.env.INSTAGRAM_USER_ID && process.env.INSTAGRAM_ACCESS_TOKEN)
    return false
}

async function viaGraph(ch: SocialChannel, content: string, images: string[]): Promise<ChannelResult> {
    const base = { kanal: ch.id, nazwa: `${ch.name} (${ch.platform})`, droga: 'graph' as const }
    if (ch.platform === 'instagram') {
        if (!images[0]) return { ...base, ok: false, blad: 'Instagram potrzebuje obrazka.' }
        const r = await publishToIG(images[0], content)
        return r.success ? { ...base, ok: true } : { ...base, ok: false, blad: r.error }
    }
    const r = await publishToFB(content, images[0])
    return r.success ? { ...base, ok: true } : { ...base, ok: false, blad: r.error }
}

function pending(ch: SocialChannel, why: string): ChannelResult {
    return { kanal: ch.id, nazwa: `${ch.name} (${ch.platform})`, ok: false, oczekuje: true, blad: why }
}

/**
 * Wysyła post na wskazane kanały teraz albo planuje go w Postiz.
 * Kanały bez drogi (Postiz offline, nie-WUYO albo TikTok) zostają „oczekuje” — cron ponowi.
 */
async function dispatch(
    channels: SocialChannel[],
    content: string,
    images: string[],
    scheduleAt: Date | null,
    online: boolean,
): Promise<ChannelResult[]> {
    const results: ChannelResult[] = []
    const viaPostiz = channels.filter((c) => c.source === 'postiz')
    const direct = channels.filter((c) => c.source === 'graph')
    const due = !scheduleAt || scheduleAt.getTime() <= Date.now() + 60_000

    if (viaPostiz.length) {
        let postizOk = false
        if (online) {
            try {
                const media: PostizMedia[] = []
                for (const url of images) media.push(await uploadImageFromUrl(url))
                await createPost({
                    content,
                    channels: viaPostiz.map((c) => ({ id: c.id, provider: c.provider })),
                    media,
                    scheduleAt: due ? undefined : scheduleAt ?? undefined,
                })
                for (const c of viaPostiz) results.push({ kanal: c.id, nazwa: `${c.name} (${c.platform})`, ok: true, droga: 'postiz' })
                postizOk = true
            } catch (e) {
                const offline = e instanceof PostizError && e.offline
                if (!offline) {
                    const msg = e instanceof Error ? e.message : 'Błąd Postiz'
                    for (const c of viaPostiz) results.push({ kanal: c.id, nazwa: `${c.name} (${c.platform})`, ok: false, droga: 'postiz', blad: msg })
                    postizOk = true // błąd merytoryczny, nie ponawiamy w kółko
                }
            }
        }
        if (!postizOk) {
            for (const c of viaPostiz) {
                if (due && graphCapable(c)) results.push(await viaGraph(c, content, images))
                else results.push(pending(c, 'Postiz nie odpowiada (PC wyłączony?). Wyjdzie po jego włączeniu.'))
            }
        }
    }

    for (const c of direct) {
        if (due) results.push(await viaGraph(c, content, images))
        else results.push(pending(c, 'Zaplanowane przez zapas Graph API: wyjdzie przy najbliższym przebiegu crona (9:00).'))
    }
    return results
}

function summarize(results: ChannelResult[], scheduled: boolean): { status: PostStatus; droga: string | null } {
    const ok = results.filter((r) => r.ok)
    const waiting = results.filter((r) => r.oczekuje)
    const failed = results.filter((r) => !r.ok && !r.oczekuje)
    const ways = new Set(ok.map((r) => r.droga))
    const droga = ways.size > 1 ? 'mieszana' : ([...ways][0] ?? null)
    let status: PostStatus
    if (waiting.length) status = 'w_kolejce'
    else if (failed.length === results.length) status = 'blad'
    else if (failed.length) status = 'czesciowo'
    else status = scheduled ? 'zaplanowane' : 'opublikowane'
    return { status, droga }
}

export type PublishInput = {
    content: string
    images: string[]
    channelIds: string[]
    scheduleAt: Date | null
    calendarEventId?: string | null
}

export async function publishPost(input: PublishInput): Promise<{ post: SocialPostRow } | { error: string }> {
    const db = createAdminClient()
    const { channels: all, postiz } = await listChannels(db)
    const chosen = input.channelIds.map((id) => all.find((c) => c.id === id))
    if (chosen.some((c) => !c)) return { error: 'Któreś z wybranych kont już nie istnieje. Odśwież listę.' }
    const channels = chosen as SocialChannel[]
    const blocked = channels.find((c) => c.disabled)
    if (blocked) return { error: `${blocked.name}: ${blocked.disabledReason ?? 'konto wyłączone'}` }
    if (!input.images.length && channels.some((c) => c.platform === 'instagram' || c.platform === 'tiktok')) {
        return { error: 'Instagram i TikTok potrzebują co najmniej jednego obrazka.' }
    }

    const results = await dispatch(channels, input.content, input.images, input.scheduleAt, postiz.online)
    const scheduledInPostiz = Boolean(input.scheduleAt && input.scheduleAt.getTime() > Date.now() + 60_000)
    const { status, droga } = summarize(results, scheduledInPostiz)

    const { data, error } = await db.from('social_posts').insert({
        tresc: input.content,
        obrazy: input.images,
        kanaly: channels,
        tryb: input.scheduleAt ? 'zaplanuj' : 'teraz',
        termin: input.scheduleAt?.toISOString() ?? null,
        status,
        droga,
        wyniki: results,
        proby: 1,
        calendar_event_id: input.calendarEventId ?? null,
    }).select('*').single()
    if (error || !data) {
        console.error('social_posts insert:', error)
        return { error: 'Post poszedł, ale nie zapisał się w historii.' }
    }
    if (input.calendarEventId && (status === 'opublikowane' || status === 'zaplanowane')) {
        await db.from('calendar_events')
            .update(status === 'opublikowane'
                ? { status: 'Opublikowane', published_at: new Date().toISOString() }
                : { status: 'Postiz' })
            .eq('id', input.calendarEventId)
    }
    return { post: data as SocialPostRow }
}

/** Cron: ponawia kanały „oczekuje” z postów, których termin minął. */
export async function processQueue(): Promise<{ checked: number; done: number }> {
    const db = createAdminClient()
    const now = new Date().toISOString()
    const { data: rows } = await db.from('social_posts')
        .select('*')
        .eq('status', 'w_kolejce')
        .or(`termin.is.null,termin.lte.${now}`)
        .order('created_at')
        .limit(10)
    if (!rows?.length) return { checked: 0, done: 0 }

    const { channels: known, postiz } = await listChannels(db)
    let done = 0
    for (const row of rows as SocialPostRow[]) {
        const waitingIds = new Set(row.wyniki.filter((r) => r.oczekuje).map((r) => r.kanal))
        const todo = row.kanaly.filter((c) => waitingIds.has(c.id)).map((c) => known.find((k) => k.id === c.id) ?? c)
        const fresh = await dispatch(todo, row.tresc, row.obrazy, null, postiz.online)
        const wyniki = [...row.wyniki.filter((r) => !waitingIds.has(r.kanal)), ...fresh]
        const summary = summarize(wyniki, false)
        const droga = summary.droga
        const proby = row.proby + 1
        const status: PostStatus = summary.status === 'w_kolejce' && proby >= MAX_TRIES ? 'czesciowo' : summary.status
        await db.from('social_posts').update({ wyniki, status, droga, proby, updated_at: new Date().toISOString() }).eq('id', row.id)
        if (status === 'opublikowane') done++
    }
    return { checked: rows.length, done }
}

export async function recentPosts(db: SupabaseClient, limit = 20): Promise<SocialPostRow[]> {
    const { data } = await db.from('social_posts').select('*').order('created_at', { ascending: false }).limit(limit)
    return (data ?? []) as SocialPostRow[]
}
