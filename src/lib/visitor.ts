// Tylko serwer (node:crypto). Ten sam skrót IP co getClientIp w rate-limit.
import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Anonimowy, dzienny identyfikator odwiedzającego. Bez ciasteczek i bez zapisu
 * czegokolwiek w przeglądarce: skrót z IP, przeglądarki, daty i tajnej soli.
 * Sól zmienia się z datą, więc tej samej osoby nie da się śledzić między dniami,
 * a z samego skrótu nie da się odtworzyć IP. Wystarcza, żeby policzyć unikalne
 * osoby w danym dniu i przypisać formularz do źródła wejścia.
 */
export function visitorId(req: Request): string {
    const salt = process.env.STATS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'wuyo'
    const day = new Date().toISOString().slice(0, 10)
    const ua = req.headers.get('user-agent') ?? ''
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
    return createHash('sha256').update(`${salt}|${day}|${ip}|${ua}`).digest('hex').slice(0, 20)
}

export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|bingpreview|python|curl|wget|axios|node-fetch/i

const SEARCH: [RegExp, string][] = [
    [/(^|\.)google\./, 'Google'],
    [/(^|\.)bing\.com$/, 'Bing'],
    [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
    [/(^|\.)yahoo\./, 'Yahoo'],
    [/(^|\.)ecosia\.org$/, 'Ecosia'],
]
const SOCIAL: [RegExp, string][] = [
    [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'Facebook'],
    [/(^|\.)instagram\.com$/, 'Instagram'],
    [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, 'LinkedIn'],
    [/(^|\.)tiktok\.com$/, 'TikTok'],
    [/(^|\.)(t\.co|x\.com|twitter\.com)$/, 'X'],
    [/(^|\.)pinterest\./, 'Pinterest'],
    [/(^|\.)youtube\.com$/, 'YouTube'],
    [/(^|\.)(chatgpt\.com|openai\.com)$/, 'ChatGPT'],
    [/(^|\.)perplexity\.ai$/, 'Perplexity'],
    [/(^|\.)(claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/, 'Asystent AI'],
]

/**
 * Jedno źródło wejścia w czytelnej postaci, np. „Google (wyszukiwarka)”,
 * „Facebook”, „kampania: grudzien / facebook”, „bezpośrednio”.
 * UTM ma pierwszeństwo, bo to Ty go ustawiasz w linkach.
 */
export function sourceOf(refHost: string, utm: { source?: string; medium?: string; campaign?: string }): string {
    if (utm.source) {
        const parts = [utm.campaign, utm.source, utm.medium].filter(Boolean)
        return `kampania: ${parts.join(' / ')}`.slice(0, 120)
    }
    if (!refHost) return 'bezpośrednio'
    if (refHost === 'gemini.google.com') return 'Asystent AI'
    for (const [re, name] of SEARCH) if (re.test(refHost)) return `${name} (wyszukiwarka)`
    for (const [re, name] of SOCIAL) if (re.test(refHost)) return name
    return refHost
}

export function hostOf(url: string): string {
    try {
        return new URL(url).hostname.replace(/^(www\.|m\.|l\.|lm\.)/, '').toLowerCase()
    } catch {
        return ''
    }
}

/**
 * Źródło, z którego ta osoba weszła dziś na stronę (ostatnie wejście z zewnątrz).
 * Używane przy formularzach i pobraniach. Brak danych = 'nieznane'.
 */
export async function sourceForVisitor(db: SupabaseClient, visitor: string): Promise<string> {
    try {
        const since = new Date(Date.now() - 86_400_000).toISOString()
        const { data } = await db.from('page_views').select('source')
            .eq('visitor', visitor).eq('landing', true).gte('created_at', since)
            .order('created_at', { ascending: false }).limit(1).maybeSingle()
        return (data?.source as string | undefined) ?? 'nieznane'
    } catch {
        return 'nieznane' // brak źródła nigdy nie blokuje formularza
    }
}
