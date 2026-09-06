import type { SupabaseClient } from "@supabase/supabase-js"

// Fallback w pamięci — używany tylko gdy baza akurat nie odpowiada.
// Sam w sobie NIE wystarcza na serverless (każda instancja ma swoją pamięć),
// dlatego główną ścieżką jest check_rate_limit() w Postgresie (supabase/migrations/004_rate_limits.sql).
const memoryStore = new Map<string, number[]>()

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    const timestamps = (memoryStore.get(key) ?? []).filter(t => t > windowStart)

    if (timestamps.length >= limit) {
        memoryStore.set(key, timestamps)
        return false
    }

    timestamps.push(now)
    memoryStore.set(key, timestamps)
    return true
}

export async function rateLimit(
    supabase: SupabaseClient,
    key: string,
    limit: number,
    windowMs: number
): Promise<boolean> {
    const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: Math.floor(windowMs / 1000),
    })

    if (error) {
        console.error("Rate-limit DB error, fallback do pamięci:", error.message)
        return memoryRateLimit(key, limit, windowMs)
    }

    return data === true
}

export function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    return ip
}

// Gotowe presety dla każdego endpointu
export const LIMITS = {
    chat:  { limit: 10, windowMs: 60_000 },   // 10 req / min
    brief: { limit: 5,  windowMs: 60_000 },   // 5 req / min
    audit: { limit: 3,  windowMs: 60_000 },   // 3 req / min
    lead:  { limit: 5,  windowMs: 60_000 },   // 5 req / min
} as const
