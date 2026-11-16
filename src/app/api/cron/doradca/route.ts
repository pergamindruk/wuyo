import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { wyslijPoranna } from '@/lib/lab/doradca/advisor'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Poranna wiadomość doradcy na Telegram, 8:00 czasu polskiego.
 * Vercel liczy crony w UTC bez czasu letniego, więc w vercel.json są dwa wpisy (6:00 i 7:00 UTC),
 * a wysyłka rusza tylko wtedy, gdy w Polsce jest godzina 8. ?wymus=1 wysyła od razu (test).
 */
export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const chatId = process.env.TELEGRAM_CHAT_ID
    if (!chatId) return NextResponse.json({ error: 'Brak TELEGRAM_CHAT_ID' }, { status: 500 })
    const wymus = new URL(request.url).searchParams.get('wymus') === '1'
    const wynik = await wyslijPoranna(createAdminClient(), chatId, wymus)
    return NextResponse.json({ wynik })
}
