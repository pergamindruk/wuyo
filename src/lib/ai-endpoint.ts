import { createSign } from 'node:crypto'

/**
 * Dokąd idą zapytania do Gemini.
 *
 * 1. Vertex AI (GCP) — gdy jest GCP_SA_KEY_B64: konto serwisowe z rolą
 *    „Vertex AI User”, koszty schodzą z kredytu / płatności projektu GCP.
 * 2. Gemini API (AI Studio) — gdy jest tylko WUYO_GEMINI_KEY.
 *
 * Format zapytań i odpowiedzi jest w obu taki sam (generateContent),
 * więc reszta kodu nie musi wiedzieć, która droga działa.
 * Bez dodatkowych bibliotek: token OAuth podpisujemy przez node:crypto.
 */

type ServiceAccount = { client_email: string; private_key: string; project_id: string }

export type GeminiTarget = {
    provider: 'vertex' | 'ai-studio'
    /** Główny model tekstowy i zapasowy (gdy główny przeciążony) - różne w Vertex i AI Studio. */
    textModel: string
    fallbackModel: string
    url: (model: string) => string
    headers: Record<string, string>
}

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/cloud-platform'

let cachedToken: { token: string; expiresAt: number } | null = null

function serviceAccount(): ServiceAccount | null {
    const raw = process.env.GCP_SA_KEY_B64?.trim()
    if (!raw) return null
    try {
        const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
        const sa = JSON.parse(json) as Partial<ServiceAccount>
        if (!sa.client_email || !sa.private_key || !sa.project_id) return null
        return sa as ServiceAccount
    } catch {
        return null
    }
}

const b64url = (data: string | Buffer) => Buffer.from(data).toString('base64url')

async function accessToken(sa: ServiceAccount): Promise<string> {
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token
    const now = Math.floor(Date.now() / 1000)
    const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claims = b64url(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }))
    const signature = createSign('RSA-SHA256').update(`${head}.${claims}`).sign(sa.private_key)
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${head}.${claims}.${b64url(signature)}`,
        }),
        signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`Vertex: nie udało się pobrać tokenu (${res.status})`)
    const data = (await res.json()) as { access_token: string; expires_in: number }
    cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
    return data.access_token
}

/** Czy jest skonfigurowana jakakolwiek droga do Gemini. */
export function aiConfigured(): boolean {
    return !!serviceAccount() || !!process.env.WUYO_GEMINI_KEY
}

export async function geminiTarget(): Promise<GeminiTarget | null> {
    const sa = serviceAccount()
    if (sa) {
        const location = process.env.GCP_VERTEX_LOCATION || 'global'
        const host = location === 'global' ? 'aiplatform.googleapis.com' : `${location}-aiplatform.googleapis.com`
        const token = await accessToken(sa)
        return {
            provider: 'vertex',
            // gemini-2.5-flash jest w Vertex wycofany (404, 28.10.2026).
            textModel: process.env.GCP_VERTEX_MODEL || 'gemini-3.5-flash',
            fallbackModel: 'gemini-3.5-flash-lite',
            url: (model) =>
                `https://${host}/v1/projects/${sa.project_id}/locations/${location}/publishers/google/models/${model}:generateContent`,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
    }
    const key = process.env.WUYO_GEMINI_KEY
    if (!key) return null
    return {
        provider: 'ai-studio',
        textModel: 'gemini-2.5-flash',
        fallbackModel: 'gemini-3.5-flash-lite',
        // Klucz w nagłówku, nie w adresie: adres ląduje w logach i komunikatach błędów.
        url: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    }
}
