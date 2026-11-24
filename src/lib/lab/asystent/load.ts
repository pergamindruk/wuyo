// Dane asystenta z Supabase (tylko serwer). Zwraca ruchy, sygnały i zapisane szkice.

import 'server-only'
import type { createClient } from '@/lib/supabase/server'
import { getSystems } from '@/lib/lab/today/queries'
import { warsawIsoDate } from '@/lib/lab/today/format'
import type { QueueItem } from '@/lib/lab/today/types'
import { SALES_KINDS, buildSignals, rankMoves, type AssistantJob, type Move, type Signal } from './pick'
import { DRAFT_VERSION, tidyDraft, type Draft } from './draft'

type Supa = Awaited<ReturnType<typeof createClient>>

export interface SavedDraft {
    draft: Draft
    createdAt: string
    note: string | null
}

export interface AssistantData {
    ranked: Move[]
    signals: Signal[]
    skipped: Set<string>
}

export async function loadJobs(supabase: Supa): Promise<AssistantJob[]> {
    const { data } = await supabase
        .from('jobs')
        .select('id, client_id, title, service, stage, outcome, price_grosze, deposit_grosze, next_step, next_contact_at, offer_sent_at, updated_at, created_at, notes, clients(name, company, email, phone)')
        .eq('outcome', 'w_toku')
        .order('updated_at', { ascending: false })
    const jobs = data ?? []
    const ids = jobs.map((j) => j.id as string)
    const { data: linked } = ids.length
        ? await supabase.from('call_queue').select('id, job_id, industry, website, reason, problems, notes, phone').in('job_id', ids)
        : { data: [] }
    const queueByJob = new Map((linked ?? []).map((q) => [q.job_id as string, q]))

    return jobs.map((j) => {
        const c = (Array.isArray(j.clients) ? j.clients[0] : j.clients) as { name?: string; company?: string; email?: string; phone?: string } | null
        const q = queueByJob.get(j.id as string)
        return {
            id: j.id, client_id: j.client_id, title: j.title ?? '', service: j.service ?? '',
            stage: j.stage, outcome: j.outcome,
            price_grosze: j.price_grosze ?? 0, deposit_grosze: j.deposit_grosze ?? 0,
            next_step: j.next_step, next_contact_at: j.next_contact_at, offer_sent_at: j.offer_sent_at,
            updated_at: j.updated_at, created_at: j.created_at,
            client_name: c?.company || c?.name || 'Klient',
            email: c?.email ?? '',
            phone: c?.phone ?? '',
            notes: (j.notes as string | null) ?? null,
            queue: q ? {
                id: q.id as string, industry: (q.industry as string) ?? '', website: (q.website as string) ?? '',
                reason: (q.reason as string) ?? '', problems: (q.problems as string[]) ?? [], notes: (q.notes as string | null) ?? null,
                phone: (q.phone as string) ?? '',
            } : null,
        } as AssistantJob
    })
}

async function loadQueue(supabase: Supa): Promise<QueueItem[]> {
    const { data } = await supabase
        .from('call_queue')
        .select('*')
        .in('status', ['do_kontaktu', 'nie_odebral', 'oddzwonic'])
        .lte('next_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(60)
    return (data ?? []) as QueueItem[]
}

/** Klucze pominięte dziś przyciskiem „Pomiń dziś”. */
async function loadSkipped(supabase: Supa): Promise<Set<string>> {
    const { data } = await supabase.from('ai_generations').select('input_data')
        .eq('input_data->>kind', 'asystent_pomin').eq('input_data->>date', warsawIsoDate())
    return new Set((data ?? []).map((r) => (r.input_data as { key?: string }).key ?? '').filter(Boolean))
}

export async function loadAssistant(supabase: Supa): Promise<AssistantData> {
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()
    const [jobs, queue, skipped, systems, activities, harvey] = await Promise.all([
        loadJobs(supabase),
        loadQueue(supabase),
        loadSkipped(supabase),
        getSystems(supabase),
        supabase.from('activity_log').select('kind').gte('created_at', weekAgo),
        supabase.from('harvey_outbox').select('id', { count: 'exact', head: true }).eq('status', 'pending_review').is('decyzja', null),
    ])
    const ranked = rankMoves({ jobs, queue })
    const salesActivities7d = (activities.data ?? []).filter((a) => SALES_KINDS.has(a.kind as string)).length
    const signals = buildSignals({ jobs, moves: ranked, systems, salesActivities7d, harveyDecisions: harvey.count ?? 0 })
    return { ranked, signals, skipped }
}

/** Ostatnie zapisane szkice dla podanych kluczy. */
export async function loadDrafts(supabase: Supa, keys: string[]): Promise<Map<string, SavedDraft>> {
    const out = new Map<string, SavedDraft>()
    if (keys.length === 0) return out
    const { data } = await supabase.from('ai_generations').select('input_data, output, created_at')
        .eq('input_data->>kind', 'asystent').in('input_data->>key', keys)
        .order('created_at', { ascending: false }).limit(50)
    for (const r of data ?? []) {
        const input = r.input_data as { key?: string; note?: string | null; v?: number }
        if (!input.key || out.has(input.key) || (input.v ?? 1) !== DRAFT_VERSION) continue
        try {
            out.set(input.key, { draft: tidyDraft(JSON.parse(r.output as string) as Draft), createdAt: r.created_at as string, note: input.note ?? null })
        } catch {
            // uszkodzony zapis: pomijamy, asystent przygotuje nowy
        }
    }
    return out
}

/** Notatki z rozmów (call_notes) do promptu: najświeższe 3. */
export async function loadCallNotes(supabase: Supa, move: Move): Promise<string> {
    const filters = [move.jobId && `job_id.eq.${move.jobId}`, move.queueId && `queue_id.eq.${move.queueId}`].filter(Boolean).join(',')
    if (!filters) return ''
    const { data } = await supabase.from('call_notes').select('tresc, created_at').or(filters).order('created_at', { ascending: false }).limit(3)
    return (data ?? []).map((n) => `[${(n.created_at as string).slice(0, 10)}] ${n.tresc as string}`).join('\n')
}
