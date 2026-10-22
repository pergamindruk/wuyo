'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { MAX_ATTEMPTS, NO_ANSWER_RETRY_DAYS, OUTCOMES, SERVICES } from '@/lib/lab/today/constants'
import type { CallOutcome, QueueItem } from '@/lib/lab/today/types'

export type ActionResult = { ok: true } | { ok: false; error: string }

type Supa = Awaited<ReturnType<typeof createClient>>

async function requireUser(supabase: Supa): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
}

const DAY_MS = 86_400_000

export async function recordCallOutcome(
    queueId: string,
    outcome: CallOutcome,
    opts?: { note?: string; callbackAt?: string },
): Promise<ActionResult> {
    const supabase = await createClient()
    if (!(await requireUser(supabase))) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }
    if (!OUTCOMES.some((o) => o.key === outcome)) return { ok: false, error: 'Nieznany wynik rozmowy.' }

    const { data: row, error: readError } = await supabase
        .from('call_queue').select('*').eq('id', queueId).maybeSingle()
    if (readError || !row) return { ok: false, error: 'Nie znaleziono firmy w kolejce.' }
    const item = row as QueueItem

    const now = new Date()
    const note = opts?.note?.trim() ?? ''
    const outcomeLabel = OUTCOMES.find((o) => o.key === outcome)?.label ?? outcome
    const noteLine = `[${now.toISOString().slice(0, 10)}] ${outcomeLabel}${note ? `: ${note}` : ''}`
    const notes = item.notes ? `${item.notes}\n${noteLine}` : noteLine

    const patch: Record<string, unknown> = { notes, updated_at: now.toISOString() }
    let jobId: string | null = null

    if (outcome === 'nie_odebral') {
        const attempts = (item.attempts ?? 0) + 1
        patch.attempts = attempts
        if (attempts >= MAX_ATTEMPTS) {
            patch.status = 'nie_chce'
        } else {
            patch.status = 'nie_odebral'
            patch.next_at = new Date(now.getTime() + NO_ANSWER_RETRY_DAYS * DAY_MS).toISOString()
        }
    } else if (outcome === 'nie_chce') {
        patch.status = 'nie_chce'
    } else if (outcome === 'oddzwonic') {
        const cb = opts?.callbackAt ? new Date(opts.callbackAt) : null
        if (!cb || Number.isNaN(cb.getTime())) return { ok: false, error: 'Wybierz, kiedy oddzwonić.' }
        patch.status = 'oddzwonic'
        patch.next_at = cb.toISOString()
    } else {
        const service = SERVICES.find((s) => s.key === 'firma_w_internecie')
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert({ name: item.name, company: item.name, phone: item.phone, source: 'kolejka', notes: note || null })
            .select('id').single()
        if (clientError || !client) return { ok: false, error: 'Nie udało się utworzyć klienta.' }

        const tomorrow = new Date(now.getTime() + DAY_MS).toISOString().slice(0, 10)
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .insert({
                client_id: client.id,
                title: `Oferta: ${item.name}`,
                service: service?.key ?? 'inne',
                price_grosze: service?.priceGrosze ?? 0,
                stage: 1,
                next_step: 'Przygotować i wysłać ofertę',
                next_contact_at: tomorrow,
            })
            .select('id').single()
        if (jobError || !job) return { ok: false, error: 'Klient dodany, ale zlecenie się nie zapisało.' }

        jobId = job.id as string
        patch.status = 'chce_oferte'
        patch.client_id = client.id
        patch.job_id = jobId
    }

    const { error: updateError } = await supabase.from('call_queue').update(patch).eq('id', queueId)
    if (updateError) return { ok: false, error: 'Nie udało się zapisać wyniku.' }

    const { error: logError } = await supabase.from('activity_log').insert({
        kind: 'telefon',
        outcome,
        queue_id: queueId,
        job_id: jobId,
        note: note || null,
    })
    if (logError) console.error('activity_log insert failed:', logError.message)

    revalidatePath('/lab')
    return { ok: true }
}

export async function addManualQueueItem(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient()
    if (!(await requireUser(supabase))) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }

    const name = String(formData.get('name') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const industry = String(formData.get('industry') ?? '').trim()
    const note = String(formData.get('note') ?? '').trim()
    if (!name) return { ok: false, error: 'Podaj nazwę firmy.' }
    if (!phone) return { ok: false, error: 'Podaj numer telefonu.' }

    const nowIso = new Date().toISOString()
    const { error } = await supabase.from('call_queue').insert({
        id: `reczny:${randomUUID()}`,
        name,
        industry,
        phone,
        website: '',
        source: 'reczny',
        reason: 'Dodana ręcznie',
        problems: [],
        score: 6,
        status: 'do_kontaktu',
        attempts: 0,
        next_at: nowIso,
        notes: note || null,
    })
    if (error) return { ok: false, error: 'Nie udało się dodać firmy.' }

    revalidatePath('/lab')
    return { ok: true }
}
