// Sliding window in-memory rate limiter — działa per Vercel instance
// Wystarczający dla portfolio jednej osoby bez zewnętrznych zależności

const store = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const windowStart = now - windowMs
    const timestamps = (store.get(key) ?? []).filter(t => t > windowStart)

    if (timestamps.length >= limit) {
        store.set(key, timestamps)
        return false
    }

    timestamps.push(now)
    store.set(key, timestamps)
    return true
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
