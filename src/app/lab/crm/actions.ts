'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Lead } from '@/lib/types'
import { logAuditEvent } from '@/lib/audit'
import { SERVICES } from '@/lib/lab/today/constants'
import { warsawIsoDate } from '@/lib/lab/today/format'

const VALID_STATUSES = ['Nowy', 'Kontakt', 'Wycena', 'Zamkniety', 'Utracony'] as const
type ValidStatus = typeof VALID_STATUSES[number]

function isValidStatus(s: string): s is ValidStatus {
    return (VALID_STATUSES as readonly string[]).includes(s)
}

function toLead(l: Record<string, unknown>): Lead {
    return {
        id: l.id as string,
        name: (l.name as string) ?? '',
        email: (l.email as string) ?? '',
        date: new Date(l.created_at as string).toLocaleString('pl-PL'),
        rawDate: l.created_at as string,
        type: (l.type as string) ?? '',
        details: (l.details as string) ?? '',
        status: (l.status as ValidStatus) || 'Nowy',
        jobId: (l.job_id as string | null) ?? null,
    }
}

export async function getLeads() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching leads:', error)
        return []
    }

    return data.map(toLead)
}

const PAGE_SIZE = 20

export async function getFilteredLeads(
    search?: string,
    status?: string,
    sortAsc?: boolean,
    page = 0,
): Promise<{ items: Lead[]; total: number; pageSize: number }> {
    const supabase = await createClient()
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase.from('leads').select('*', { count: 'exact' })

    if (search && search.trim()) {
        const s = `%${search.trim()}%`
        query = query.or(`name.ilike.${s},email.ilike.${s}`)
    }

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: !!sortAsc }).range(from, to)

    const { data, error, count } = await query

    if (error) {
        console.error('Error fetching filtered leads:', error)
        return { items: [], total: 0, pageSize: PAGE_SIZE }
    }

    const items = (data ?? []).map(toLead)

    return { items, total: count ?? 0, pageSize: PAGE_SIZE }
}

export async function updateLeadStatus(id: string, status: string) {
    if (!isValidStatus(status)) {
        throw new Error(`Nieprawidlowy status: ${status}`)
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id)

    if (error) {
        console.error('Error updating lead status:', error)
        throw new Error('Nie udalo sie zaktualizowac statusu')
    }

    await logAuditEvent('lead_status_change', { id, status })
    revalidatePath('/lab/crm')
    return true
}

export async function deleteLeadOrBrief(id: string, isBrief: boolean) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting lead:', error)
        throw new Error('Nie udalo sie usunac zapisu')
    }

    await logAuditEvent('lead_delete', { id })
    revalidatePath('/lab/crm')
    return true
}

/** Usługa z cennika, jeśli typ zapytania jasno na nią wskazuje. W innym razie „Inne” z ceną 0 do uzupełnienia w lejku. */
function guessService(type: string, details: string) {
    const t = `${type} ${details}`.toLowerCase()
    const key = /zamow-strone|strona|stron[ęy]/.test(t) ? 'one_page' : 'inne'
    return SERVICES.find((s) => s.key === key) ?? { key: 'inne', label: 'Inne', priceGrosze: 0 }
}

/** Zapytanie z CRM → klient + zlecenie na etapie 1 (Brief i wycena). Drugi klik nic nie dubluje. */
export async function moveLeadToPipeline(id: string): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Brak dostępu. Zaloguj się ponownie.' }

    const { data: lead, error: readErr } = await supabase
        .from('leads').select('id, name, email, type, details, job_id').eq('id', id).maybeSingle()
    if (readErr || !lead) return { ok: false, error: 'Nie znaleziono zapytania.' }
    if (lead.job_id) return { ok: true, jobId: lead.job_id as string }

    const name = ((lead.name as string | null) ?? '').trim() || 'Klient z formularza'
    const type = (lead.type as string | null) ?? ''
    const details = (lead.details as string | null) ?? ''

    const { data: client, error: clientErr } = await supabase
        .from('clients')
        .insert({ name, email: (lead.email as string | null) || null, source: `CRM: ${type || 'formularz'}`, notes: details || null })
        .select('id').single()
    if (clientErr || !client) return { ok: false, error: 'Nie udało się utworzyć klienta.' }

    const service = guessService(type, details)
    const { data: job, error: jobErr } = await supabase
        .from('jobs')
        .insert({
            client_id: client.id,
            lead_id: id,
            title: type ? `${name}: ${type}` : name,
            service: service.key,
            price_grosze: service.priceGrosze,
            stage: 1,
            outcome: 'w_toku',
            deposit_grosze: 0,
            next_step: 'Odpisać i zebrać brief',
            next_contact_at: warsawIsoDate(),
            notes: details || null,
        })
        .select('id').single()
    if (jobErr || !job) return { ok: false, error: 'Klient dodany, ale zlecenie się nie zapisało.' }

    const { error: leadErr } = await supabase.from('leads').update({ status: 'Wycena', job_id: job.id }).eq('id', id)
    if (leadErr) console.error('Lead not linked to job:', leadErr.message)

    await logAuditEvent('lead_to_pipeline', { id, job_id: job.id })
    revalidatePath('/lab/crm')
    revalidatePath('/lab/lejek')
    revalidatePath('/lab')
    return { ok: true, jobId: job.id as string }
}
