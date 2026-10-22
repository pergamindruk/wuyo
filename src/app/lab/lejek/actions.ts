'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { JobStage } from '@/lib/lab/today/types'
import type { ActionResult } from '@/components/lab/pipeline/types'
import { zlToGrosze } from '@/components/lab/pipeline/view'
import { warsawIsoDate } from '@/lib/lab/today/format'

type Supa = Awaited<ReturnType<typeof createClient>>

async function authed(): Promise<{ supabase: Supa } | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? { supabase } : null
}

function done(): ActionResult {
    revalidatePath('/lab/lejek')
    revalidatePath('/lab')
    return { ok: true }
}

const fail = (error: string): ActionResult => ({ ok: false, error })
const NO_AUTH = 'Brak dostępu. Zaloguj się ponownie.'
const todayIso = () => warsawIsoDate()
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isStage(n: number): n is JobStage {
    return Number.isInteger(n) && n >= 1 && n <= 7
}

export async function moveJob(jobId: string, stage: number): Promise<ActionResult> {
    const ctx = await authed()
    if (!ctx) return fail(NO_AUTH)
    if (!isStage(stage)) return fail('Zły etap.')
    const { supabase } = ctx

    const { data: job, error: readErr } = await supabase
        .from('jobs').select('offer_sent_at').eq('id', jobId).maybeSingle()
    if (readErr || !job) return fail('Nie znaleziono zlecenia.')

    const now = new Date().toISOString()
    const patch: Record<string, unknown> = { stage, updated_at: now }
    const firstOffer = stage === 2 && !job.offer_sent_at
    if (firstOffer) patch.offer_sent_at = now
    if (stage === 7) {
        patch.outcome = 'zakonczone'
        patch.closed_at = now
    } else {
        // cofnięcie z „Rachunek końcowy” otwiera zlecenie ponownie
        patch.outcome = 'w_toku'
        patch.closed_at = null
    }

    const { error } = await supabase.from('jobs').update(patch).eq('id', jobId)
    if (error) return fail('Nie udało się przesunąć zlecenia.')

    if (firstOffer) {
        await supabase.from('activity_log').insert({ kind: 'oferta', job_id: jobId, note: 'Oferta wysłana' })
    }
    return done()
}

export interface JobPatch {
    next_step?: string | null
    next_contact_at?: string | null
    price_grosze?: number
    notes?: string | null
}

export async function updateJob(jobId: string, patch: JobPatch): Promise<ActionResult> {
    const ctx = await authed()
    if (!ctx) return fail(NO_AUTH)

    const clean: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (patch.next_step !== undefined) clean.next_step = patch.next_step?.trim() || null
    if (patch.notes !== undefined) clean.notes = patch.notes?.trim() || null
    if (patch.next_contact_at !== undefined) {
        if (patch.next_contact_at && !DATE_RE.test(patch.next_contact_at)) return fail('Zła data.')
        clean.next_contact_at = patch.next_contact_at || null
    }
    if (patch.price_grosze !== undefined) {
        if (!Number.isInteger(patch.price_grosze) || patch.price_grosze < 0) return fail('Zła kwota.')
        clean.price_grosze = patch.price_grosze
    }

    const { error } = await ctx.supabase.from('jobs').update(clean).eq('id', jobId)
    if (error) return fail('Nie udało się zapisać zmian.')
    return done()
}

export async function recordPayment(
    jobId: string,
    amountGrosze: number,
    kind: 'zaliczka' | 'platnosc',
): Promise<ActionResult> {
    const ctx = await authed()
    if (!ctx) return fail(NO_AUTH)
    if (!Number.isInteger(amountGrosze) || amountGrosze <= 0) return fail('Podaj kwotę większą od zera.')
    if (kind !== 'zaliczka' && kind !== 'platnosc') return fail('Zły rodzaj wpłaty.')
    const { supabase } = ctx

    const { data: job } = await supabase
        .from('jobs').select('stage, deposit_grosze').eq('id', jobId).maybeSingle()
    if (!job) return fail('Nie znaleziono zlecenia.')

    const { error: payErr } = await supabase.from('payments').insert({
        job_id: jobId,
        amount_grosze: amountGrosze,
        paid_at: todayIso(),
        channel: 'posrednik',
        note: kind === 'zaliczka' ? 'Zaliczka' : 'Wpłata',
    })
    if (payErr) return fail('Nie udało się zapisać wpłaty.')

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (kind === 'zaliczka') {
        patch.deposit_grosze = (job.deposit_grosze ?? 0) + amountGrosze
        if (job.stage === 4) patch.stage = 5
    }
    const { error } = await supabase.from('jobs').update(patch).eq('id', jobId)
    if (error) return fail('Wpłata zapisana, ale zlecenie nie zostało zaktualizowane.')

    await supabase.from('activity_log').insert({ kind, job_id: jobId, note: `${amountGrosze} gr` })
    return done()
}

export async function markLost(jobId: string, reason: string): Promise<ActionResult> {
    const ctx = await authed()
    if (!ctx) return fail(NO_AUTH)
    const { supabase } = ctx

    const { data: job } = await supabase.from('jobs').select('notes').eq('id', jobId).maybeSingle()
    if (!job) return fail('Nie znaleziono zlecenia.')

    const line = `Przegrane: ${reason.trim() || 'bez podanego powodu'}`
    const notes = job.notes ? `${job.notes}\n${line}` : line
    const now = new Date().toISOString()
    const { error } = await supabase.from('jobs')
        .update({ outcome: 'przegrane', closed_at: now, updated_at: now, notes })
        .eq('id', jobId)
    if (error) return fail('Nie udało się oznaczyć jako przegrane.')
    return done()
}

export async function createJob(formData: FormData): Promise<ActionResult> {
    const ctx = await authed()
    if (!ctx) return fail(NO_AUTH)
    const { supabase } = ctx

    const str = (k: string) => String(formData.get(k) ?? '').trim()
    const title = str('title')
    if (!title) return fail('Podaj tytuł zlecenia.')

    const price = zlToGrosze(str('price_zl') || '0')
    if (price === null) return fail('Zła kwota.')

    const contactAt = str('next_contact_at')
    if (contactAt && !DATE_RE.test(contactAt)) return fail('Zła data.')

    let clientId = str('client_id')
    if (!clientId) {
        const name = str('new_client_name')
        if (!name) return fail('Wybierz klienta albo wpisz nową nazwę.')
        const { data: created, error: cErr } = await supabase
            .from('clients')
            .insert({ name, phone: str('new_client_phone') || null })
            .select('id')
            .single()
        if (cErr || !created) return fail('Nie udało się dodać klienta.')
        clientId = created.id as string
    }

    const { error } = await supabase.from('jobs').insert({
        client_id: clientId,
        title,
        service: str('service') || 'inne',
        stage: 1,
        outcome: 'w_toku',
        price_grosze: price,
        deposit_grosze: 0,
        next_step: str('next_step') || null,
        next_contact_at: contactAt || null,
    })
    if (error) return fail('Nie udało się dodać zlecenia.')
    return done()
}
