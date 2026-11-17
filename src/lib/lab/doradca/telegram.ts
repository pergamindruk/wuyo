import { timingSafeEqual } from 'node:crypto'
import { potnij } from './conversation'

/** Cienka warstwa na Telegram Bot API. Token tylko z env, nigdy w logach. */

const API = 'https://api.telegram.org'
const MAX_AUDIO_BYTES = 12 * 1024 * 1024

function token(): string {
    const t = process.env.TELEGRAM_BOT_TOKEN
    if (!t) throw new Error('Brak TELEGRAM_BOT_TOKEN')
    return t
}

async function call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${API}/bot${token()}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
    })
    const data = (await res.json().catch(() => null)) as { ok?: boolean; result?: T; description?: string } | null
    if (!res.ok || !data?.ok) throw new Error(`Telegram ${method}: ${res.status} ${data?.description ?? ''}`)
    return data.result as T
}

/** Zwykły tekst (bez parse_mode), pocięty na części, które Telegram przyjmie. */
export async function sendMessage(chatId: string | number, text: string): Promise<void> {
    for (const part of potnij(text)) {
        await call('sendMessage', { chat_id: chatId, text: part, link_preview_options: { is_disabled: true } })
    }
}

/** Wysyła tekst jako plik (np. wypełniony wzór umowy). */
export async function sendDocument(chatId: string | number, filename: string, content: string, caption?: string): Promise<void> {
    const form = new FormData()
    form.append('chat_id', String(chatId))
    if (caption) form.append('caption', caption.slice(0, 1000))
    form.append('document', new Blob([content], { type: 'text/markdown; charset=utf-8' }), filename)
    const res = await fetch(`${API}/bot${token()}/sendDocument`, { method: 'POST', body: form, signal: AbortSignal.timeout(20_000) })
    const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null
    if (!res.ok || !data?.ok) throw new Error(`Telegram sendDocument: ${res.status} ${data?.description ?? ''}`)
}

/** „pisze…” na górze czatu, żeby było widać, że bot pracuje. Błąd nieistotny. */
export async function sendTyping(chatId: string | number): Promise<void> {
    await call('sendChatAction', { chat_id: chatId, action: 'typing' }).catch(() => undefined)
}

/** Pobiera nagranie z Telegrama jako base64. null = za duże. */
export async function downloadFile(fileId: string): Promise<string | null> {
    const file = await call<{ file_path?: string; file_size?: number }>('getFile', { file_id: fileId })
    if (!file.file_path) throw new Error('Telegram getFile: brak ścieżki pliku')
    if ((file.file_size ?? 0) > MAX_AUDIO_BYTES) return null
    const res = await fetch(`${API}/file/bot${token()}/${file.file_path}`, { signal: AbortSignal.timeout(20_000) })
    if (!res.ok) throw new Error(`Telegram: pobranie pliku ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > MAX_AUDIO_BYTES ? null : buf.toString('base64')
}

/** Porównanie sekretu webhooka w stałym czasie. */
export function secretMatches(given: string | null, expected: string | undefined): boolean {
    if (!given || !expected) return false
    const a = Buffer.from(given)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
}
