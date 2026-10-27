'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type DecisionResult = { ok: true } | { ok: false; error: string }
export type Decision = 'approve' | 'reject'

/** Zapisuje decyzję w panelu. Do Harveya trafia przy najbliższym syncu (co 30 min). */
export async function decideMail(id: string, decision: Decision | null): Promise<DecisionResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    if (decision !== null && decision !== 'approve' && decision !== 'reject') {
        return { ok: false, error: 'Nieznana decyzja.' }
    }

    const { data, error } = await supabase
        .from('harvey_outbox')
        .update({ decyzja: decision, decyzja_at: decision ? new Date().toISOString() : null })
        .eq('id', id)
        .eq('status', 'pending_review')
        .is('zastosowano_at', null)
        .select('id')
    if (error) return { ok: false, error: 'Nie udało się zapisać decyzji.' }
    if (!data?.length) return { ok: false, error: 'Ten mail już trafił do Harveya — zmień go w Outboxie.' }

    revalidatePath('/lab/maile')
    revalidatePath('/lab')
    return { ok: true }
}
