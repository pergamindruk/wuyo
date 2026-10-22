'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const MAX_NOTE_LENGTH = 2000

export async function saveDayNote(
    note: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu' }

    const clean = note.trim().slice(0, MAX_NOTE_LENGTH)
    if (!clean) return { ok: false, error: 'Wpisz choć jedno zdanie' }

    const { error } = await supabase
        .from('activity_log')
        .insert({ kind: 'notatka_dnia', note: clean })
    if (error) return { ok: false, error: 'Nie udało się zapisać. Spróbuj ponownie.' }

    revalidatePath('/lab')
    return { ok: true }
}
