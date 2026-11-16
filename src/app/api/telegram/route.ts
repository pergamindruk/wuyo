import { after, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { obsluzWiadomosc, type TelegramUpdate } from '@/lib/lab/doradca/advisor'
import { secretMatches } from '@/lib/lab/doradca/telegram'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Webhook Telegrama dla doradcy.
 * 1. Sekret w nagłówku (ustawiany przy setWebhook) — bez niego 401.
 * 2. Tylko prywatny czat właściciela (TELEGRAM_CHAT_ID) — reszta dostaje ciszę.
 * Odpowiadamy 200 od razu, a rozmowa z AI idzie w tle, żeby Telegram nie ponawiał dostawy.
 */
export async function POST(request: Request) {
    if (!secretMatches(request.headers.get('x-telegram-bot-api-secret-token'), process.env.TELEGRAM_WEBHOOK_SECRET)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const update = (await request.json().catch(() => null)) as TelegramUpdate | null
    const chat = update?.message?.chat
    const owner = process.env.TELEGRAM_CHAT_ID
    if (!update || !chat || !owner || chat.type !== 'private' || String(chat.id) !== owner) {
        return NextResponse.json({ ok: true })
    }
    after(async () => {
        try {
            await obsluzWiadomosc(createAdminClient(), update)
        } catch (e) {
            console.error('Doradca: webhook', e instanceof Error ? e.message : e)
        }
    })
    return NextResponse.json({ ok: true })
}
