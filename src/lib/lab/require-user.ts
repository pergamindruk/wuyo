import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Trasy API panelu /lab: tylko zalogowany użytkownik. Zwraca odpowiedź 401 albo null, gdy wszystko gra. */
export async function requireLabUser(): Promise<NextResponse | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Brak dostępu. Zaloguj się ponownie.' }, { status: 401 })
    return null
}
