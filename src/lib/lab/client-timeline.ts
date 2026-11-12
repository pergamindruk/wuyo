// Jedna oś czasu klienta z kilku tabel (zapytanie, telefony, notatki, oferty, wpłaty, AI).
// buildTimeline = czysta funkcja (test), loadClientCard = odczyt z bazy (serwer).
import type { createClient } from '@/lib/supabase/server'
import { JOB_STAGES, OUTCOMES } from '@/lib/lab/today/constants'
import { formatPLN } from '@/lib/lab/today/format'

type Supa = Awaited<ReturnType<typeof createClient>>

export type TimelineKind = 'zapytanie' | 'zlecenie' | 'telefon' | 'rozmowa' | 'oferta' | 'akceptacja' | 'wplata' | 'zamkniete' | 'przegrane' | 'ai' | 'mail'

export interface TimelineItem {
    at: string
    kind: TimelineKind
    title: string
    body?: string | null
}

export interface CardJob {
    id: string
    title: string
    service: string
    stage: number
    outcome: string | null
    price_grosze: number | null
    deposit_grosze: number | null
    next_step: string | null
    next_contact_at: string | null
    offer_sent_at: string | null
    offer_accepted_at: string | null
    closed_at: string | null
    created_at: string
    updated_at: string
    lead_id: string | null
    public_token: string | null
    lost_reason?: string | null
    notes: string | null
}

export interface TimelineInput {
    jobs: CardJob[]
    payments: { job_id: string | null; amount_grosze: number; paid_at: string; note: string | null; created_at?: string | null }[]
    activities: { kind: string; outcome: string | null; note: string | null; created_at: string; job_id: string | null }[]
    notes: { tresc: string; created_at: string; zastosowano_at: string | null; analiza: { nastepnyKrok?: string } | null }[]
    leads: { id: string; type: string | null; details: string | null; created_at: string }[]
    generations: { created_at: string; input_data: Record<string, unknown> | null }[]
}

const outcomeLabel = (o: string | null) => OUTCOMES.find((x) => x.key === o)?.label ?? o ?? ''

export function buildTimeline(d: TimelineInput): TimelineItem[] {
    const out: TimelineItem[] = []
    const jobTitle = new Map(d.jobs.map((j) => [j.id, j.title]))

    for (const l of d.leads) out.push({ at: l.created_at, kind: 'zapytanie', title: `Zapytanie (${l.type ?? 'formularz'})`, body: l.details })
    for (const j of d.jobs) {
        out.push({ at: j.created_at, kind: 'zlecenie', title: `Nowe zlecenie: ${j.title}` })
        if (j.offer_sent_at) out.push({ at: j.offer_sent_at, kind: 'oferta', title: `Oferta wysłana: ${j.title}` })
        if (j.offer_accepted_at) out.push({ at: j.offer_accepted_at, kind: 'akceptacja', title: `Oferta zaakceptowana: ${j.title}` })
        if (j.closed_at && j.outcome === 'zakonczone') out.push({ at: j.closed_at, kind: 'zamkniete', title: `Zakończone: ${j.title}` })
        if (j.closed_at && j.outcome === 'przegrane') out.push({ at: j.closed_at, kind: 'przegrane', title: `Przegrane: ${j.title}`, body: j.lost_reason ?? null })
    }
    for (const p of d.payments) {
        out.push({
            at: p.created_at ?? `${p.paid_at}T12:00:00Z`,
            kind: 'wplata',
            title: `${p.note ?? 'Wpłata'} ${formatPLN(p.amount_grosze)}`,
            body: p.job_id ? jobTitle.get(p.job_id) ?? null : null,
        })
    }
    // Wpłaty i oferty mają własne źródło (payments, jobs), rozmowy pełny tekst w notes, więc tu ich nie dublujemy.
    for (const a of d.activities) {
        if (a.kind === 'telefon') out.push({ at: a.created_at, kind: 'telefon', title: `Telefon: ${outcomeLabel(a.outcome)}`, body: a.note })
        else if (a.kind === 'mail') out.push({ at: a.created_at, kind: 'mail', title: 'Mail', body: a.note })
    }
    for (const n of d.notes) {
        if (!n.zastosowano_at) continue
        out.push({ at: n.created_at, kind: 'rozmowa', title: `Notatka z rozmowy${n.analiza?.nastepnyKrok ? ` · dalej: ${n.analiza.nastepnyKrok}` : ''}`, body: n.tresc })
    }
    for (const g of d.generations) {
        const kind = String(g.input_data?.kind ?? '')
        const label = kind === 'telefon' ? 'Ściągawka do rozmowy (AI)' : kind === 'oferta' ? 'Oferta przygotowana (AI)' : 'Odpowiedź przygotowana (AI)'
        out.push({ at: g.created_at, kind: 'ai', title: label })
    }
    return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
}

export interface ClientCard {
    client: { id: string; name: string; company: string | null; phone: string | null; email: string | null; nip: string | null; address: string | null; source: string | null; notes: string | null; created_at: string }
    jobs: CardJob[]
    paidGrosze: number
    queueIds: string[]
    openJob: CardJob | null
    timeline: TimelineItem[]
}

export const stageLabel = (n: number) => JOB_STAGES.find((s) => s.stage === n)?.label ?? `Etap ${n}`

export async function loadClientCard(supabase: Supa, clientId: string): Promise<ClientCard | null> {
    const { data: client } = await supabase.from('clients').select('*').eq('id', clientId).maybeSingle()
    if (!client) return null

    const { data: jobsRaw } = await supabase.from('jobs').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
    const jobs = (jobsRaw ?? []) as CardJob[]
    const jobIds = jobs.map((j) => j.id)
    const none = ['00000000-0000-0000-0000-000000000000']

    const { data: queue } = await supabase.from('call_queue').select('id').or(`client_id.eq.${clientId}${jobIds.length ? `,job_id.in.(${jobIds.join(',')})` : ''}`)
    const queueIds = (queue ?? []).map((q) => q.id as string)
    const leadIds = jobs.map((j) => j.lead_id).filter((x): x is string => !!x)

    const actFilter = [jobIds.length && `job_id.in.(${jobIds.join(',')})`, queueIds.length && `queue_id.in.(${queueIds.map((q) => `"${q}"`).join(',')})`].filter(Boolean).join(',')
    const [payments, activities, notes, leads, generations] = await Promise.all([
        supabase.from('payments').select('job_id, amount_grosze, paid_at, note, created_at').in('job_id', jobIds.length ? jobIds : none),
        actFilter ? supabase.from('activity_log').select('kind, outcome, note, created_at, job_id').or(actFilter) : Promise.resolve({ data: [] }),
        supabase.from('call_notes').select('tresc, created_at, zastosowano_at, analiza').eq('client_id', clientId),
        supabase.from('leads').select('id, type, details, created_at').in('id', leadIds.length ? leadIds : none),
        queueIds.length || leadIds.length
            ? supabase.from('ai_generations').select('created_at, input_data').or(
                [queueIds.length && `input_data->>queueId.in.(${queueIds.map((q) => `"${q}"`).join(',')})`, leadIds.length && `input_data->>leadId.in.(${leadIds.join(',')})`].filter(Boolean).join(','),
            )
            : Promise.resolve({ data: [] }),
    ])

    const pay = (payments.data ?? []) as TimelineInput['payments']
    return {
        client: client as ClientCard['client'],
        jobs,
        paidGrosze: pay.reduce((s, p) => s + (p.amount_grosze ?? 0), 0),
        queueIds,
        openJob: jobs.find((j) => (j.outcome ?? 'w_toku') === 'w_toku') ?? null,
        timeline: buildTimeline({
            jobs,
            payments: pay,
            activities: (activities.data ?? []) as TimelineInput['activities'],
            notes: (notes.data ?? []) as TimelineInput['notes'], // przed migracją 011: błąd → pusta lista
            leads: (leads.data ?? []) as TimelineInput['leads'],
            generations: (generations.data ?? []) as TimelineInput['generations'],
        }),
    }
}
