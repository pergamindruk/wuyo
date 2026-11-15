import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StickerError } from './image.server'

/**
 * Trasy /api/** omijają middleware (patrz src/middleware.ts), więc logowanie sprawdzamy tutaj.
 * Zwraca odpowiedź 401 albo null, gdy użytkownik jest zalogowany.
 */
export async function requireLabUser(): Promise<NextResponse | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? null : NextResponse.json({ error: 'Zaloguj się do /lab.' }, { status: 401 })
}

export function errorResponse(e: unknown, fallback: string): NextResponse {
    const known = e instanceof StickerError
    const msg = e instanceof Error ? e.message : String(e)
    if (!known) console.error('[stickers]', e)
    return NextResponse.json({ error: known ? msg : `${fallback}: ${msg.slice(0, 200)}` }, { status: known ? 400 : 500 })
}
