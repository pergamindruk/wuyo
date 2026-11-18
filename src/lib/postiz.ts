// Klient publicznego API Postiz (self-hosted). Tylko serwer — klucz API nie może trafić do przeglądarki.
//
// POSTIZ_API_URL: adres publicznego API, np. https://postiz.wuyo.pl/api/public/v1
//   (sam adres panelu też zadziała, końcówkę /api/public/v1 dopiszemy).
// POSTIZ_API_KEY: Settings → Public API w panelu Postiz. Wysyłany w nagłówku Authorization bez „Bearer”.
import 'server-only'
import { brandFromName, platformFromProvider, type SocialChannel } from '@/lib/social/channels'

const TIMEOUT_MS = 8_000
const UPLOAD_TIMEOUT_MS = 30_000

export class PostizError extends Error {
    constructor(message: string, readonly status?: number, readonly offline = false) {
        super(message)
        this.name = 'PostizError'
    }
}

export function postizConfigured(): boolean {
    return Boolean(process.env.POSTIZ_API_URL && process.env.POSTIZ_API_KEY)
}

function baseUrl(): string {
    const raw = (process.env.POSTIZ_API_URL ?? '').trim().replace(/\/+$/, '')
    if (!raw) throw new PostizError('Brak POSTIZ_API_URL', undefined, true)
    if (/\/public\/v1$/.test(raw)) return raw
    if (/\/api$/.test(raw)) return `${raw}/public/v1`
    return `${raw}/api/public/v1`
}

async function call<T>(path: string, init: RequestInit = {}, timeout = TIMEOUT_MS): Promise<T> {
    const key = process.env.POSTIZ_API_KEY
    if (!key) throw new PostizError('Brak POSTIZ_API_KEY', undefined, true)
    let res: Response
    try {
        res = await fetch(`${baseUrl()}${path}`, {
            ...init,
            headers: { Authorization: key, ...(init.headers ?? {}) },
            signal: AbortSignal.timeout(timeout),
            cache: 'no-store',
        })
    } catch (e) {
        // Brak połączenia / timeout: komputer z Postizem wyłączony albo tunel nie działa.
        throw new PostizError(`Postiz nie odpowiada (${e instanceof Error ? e.message : 'błąd sieci'})`, undefined, true)
    }
    const text = await res.text()
    if (!res.ok) {
        // 502/503/504 z Cloudflare = tunel stoi, ale Postiz za nim nie.
        const offline = res.status >= 502 && res.status <= 504
        throw new PostizError(`Postiz ${res.status}: ${text.slice(0, 300)}`, res.status, offline)
    }
    return (text ? JSON.parse(text) : null) as T
}

// ─── Kanały ──────────────────────────────────────────────

type PostizIntegration = {
    id: string
    name: string
    identifier?: string
    providerIdentifier?: string
    picture?: string
    disabled?: boolean
    profile?: string
    customer?: { id?: string; name?: string } | null
}

export async function getChannels(): Promise<SocialChannel[]> {
    const list = await call<PostizIntegration[] | { integrations: PostizIntegration[] }>('/integrations')
    const items = Array.isArray(list) ? list : list?.integrations ?? []
    return items
        .filter((i) => !i.disabled)
        .map((i): SocialChannel => {
            const provider = i.identifier ?? i.providerIdentifier ?? ''
            const platform = platformFromProvider(provider)
            const video = platform === 'youtube'
            return {
                id: i.id,
                name: i.name,
                platform,
                provider,
                brand: brandFromName(i.customer?.name, i.name, i.profile),
                picture: i.picture,
                source: 'postiz',
                disabled: video || undefined,
                disabledReason: video ? 'YouTube przyjmuje tylko wideo. Panel na razie wysyła obrazy.' : undefined,
            }
        })
}

/** Szybkie sprawdzenie, czy Postiz żyje (do wyboru drogi publikacji). */
export async function postizOnline(): Promise<boolean> {
    if (!postizConfigured()) return false
    try {
        await call('/integrations', {}, 4_000)
        return true
    } catch {
        return false
    }
}

// ─── Media ───────────────────────────────────────────────

export type PostizMedia = { id: string; path: string }

/** Pobiera obraz z publicznego URL (bucket „social”) i wgrywa do Postiz. */
export async function uploadImageFromUrl(url: string): Promise<PostizMedia> {
    const img = await fetch(url, { signal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS) })
    if (!img.ok) throw new PostizError(`Nie udało się pobrać obrazu (${img.status})`)
    const blob = await img.blob()
    const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'obraz.jpg')
    const form = new FormData()
    form.append('file', blob, name)
    const res = await call<PostizMedia>('/upload', { method: 'POST', body: form }, UPLOAD_TIMEOUT_MS)
    if (!res?.id || !res?.path) throw new PostizError('Postiz nie zwrócił id/path wgranego pliku')
    return { id: res.id, path: res.path }
}

// ─── Posty ───────────────────────────────────────────────

/** Ustawienia wymagane przez poszczególnych dostawców w Postiz. */
function settingsFor(provider: string): Record<string, unknown> {
    const p = provider.toLowerCase()
    if (p.startsWith('instagram')) return { __type: provider, post_type: 'post', collaborators: [] }
    if (p.startsWith('tiktok')) {
        return {
            __type: provider,
            // Aplikacja TikTok bez audytu może publikować tylko prywatnie (SELF_ONLY).
            privacy_level: process.env.POSTIZ_TIKTOK_PRIVACY || 'SELF_ONLY',
            duet: false,
            stitch: false,
            comment: true,
            autoAddMusic: 'no',
            brand_content_toggle: false,
            brand_organic_toggle: false,
            content_posting_method: 'DIRECT_POST',
        }
    }
    return { __type: provider }
}

export type CreatePostInput = {
    content: string
    channels: { id: string; provider: string }[]
    media: PostizMedia[]
    /** Brak = publikuj teraz. */
    scheduleAt?: Date
}

export async function createPost(input: CreatePostInput): Promise<unknown> {
    const body = {
        type: input.scheduleAt ? 'schedule' : 'now',
        date: (input.scheduleAt ?? new Date()).toISOString(),
        shortLink: false,
        tags: [],
        posts: input.channels.map((ch) => ({
            integration: { id: ch.id },
            value: [{ content: input.content, image: input.media }],
            settings: settingsFor(ch.provider),
        })),
    }
    return call('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }, UPLOAD_TIMEOUT_MS)
}
