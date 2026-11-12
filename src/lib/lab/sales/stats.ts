// Liczby sprzedaży dla /lab/sprzedaz. Czyste funkcje: dane z bazy wchodzą, wynik wychodzi.
// Zasada: liczy serwer z rekordów, AI dostaje tylko gotowe liczby. Kwoty w groszach.

import { JOB_STAGES } from '@/lib/lab/today/constants'

export interface SalesJob {
    id: string
    client_id: string | null
    lead_id: string | null
    stage: number
    outcome: 'w_toku' | 'zakonczone' | 'przegrane' | null
    price_grosze: number | null
    deposit_grosze: number | null
    created_at: string
    offer_sent_at: string | null
    offer_accepted_at: string | null
    closed_at: string | null
    lost_reason?: string | null
    notes: string | null
}
export interface SalesPayment { job_id: string | null; amount_grosze: number; paid_at: string }
export interface SalesClient { id: string; source: string | null }
export interface SalesLead { id: string; type: string | null; created_at: string }
export interface SalesActivity { kind: string; outcome: string | null; created_at: string }

export interface SalesInput {
    jobs: SalesJob[]
    payments: SalesPayment[]
    clients: SalesClient[]
    leads: SalesLead[]
    activities: SalesActivity[]
}

export type SourceKey = 'Formularz' | 'Czat' | 'Telefon' | 'Harvey' | 'Polecenie' | 'Inne'

export interface SalesStats {
    periodDays: number
    stages: { stage: number; label: string; count: number; valueGrosze: number }[]
    funnel: { key: string; label: string; count: number }[]
    calls: { telefony: number; rozmowy: number; oferty: number }
    won: number
    lost: number
    winRate: number | null
    avgDealGrosze: number | null
    avgDaysToClose: number | null
    paidGrosze: number
    sources: { source: SourceKey; jobs: number; won: number; valueGrosze: number }[]
    lostReasons: { reason: string; count: number }[]
    /** Mniej niż 10 zamkniętych zleceń w okresie: procenty traktuj ostrożnie. */
    malaProba: boolean
}

const DAY_MS = 86_400_000
export const SMALL_SAMPLE = 10

function inPeriod(iso: string | null | undefined, fromMs: number, toMs: number): boolean {
    if (!iso) return false
    const t = new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).getTime()
    return Number.isFinite(t) && t >= fromMs && t <= toMs
}

/** Powód przegranej: kolumna lost_reason, a dla starszych zleceń linia „Przegrane: …” z notatek. */
export function lostReasonOf(job: Pick<SalesJob, 'lost_reason' | 'notes'>): string {
    if (job.lost_reason?.trim()) return job.lost_reason.trim()
    const m = job.notes?.match(/Przegrane:\s*([^\n]+)/g)
    if (m && m.length) return m[m.length - 1].replace(/^Przegrane:\s*/, '').trim()
    return 'bez podanego powodu'
}

/** Skąd przyszedł klient: lead z formularza/czatu albo clients.source. */
export function sourceOf(job: Pick<SalesJob, 'lead_id' | 'client_id'>, leads: Map<string, SalesLead>, clients: Map<string, SalesClient>): SourceKey {
    const leadType = job.lead_id ? leads.get(job.lead_id)?.type ?? '' : ''
    const clientSource = job.client_id ? clients.get(job.client_id)?.source ?? '' : ''
    const txt = `${leadType} ${clientSource}`.toLowerCase()
    if (/chat|czat/.test(txt)) return 'Czat'
    if (/harvey|mail/.test(txt)) return 'Harvey'
    if (/polec/.test(txt)) return 'Polecenie'
    if (/kolejka|telefon/.test(txt)) return 'Telefon'
    if (job.lead_id || /crm|formularz|brief|kontakt/.test(txt)) return 'Formularz'
    return 'Inne'
}

export function computeSalesStats(input: SalesInput, periodDays: number, now: Date = new Date()): SalesStats {
    const toMs = now.getTime()
    const fromMs = toMs - periodDays * DAY_MS
    const leads = new Map(input.leads.map((l) => [l.id, l]))
    const clients = new Map(input.clients.map((c) => [c.id, c]))

    const open = input.jobs.filter((j) => (j.outcome ?? 'w_toku') === 'w_toku')
    const stages = JOB_STAGES.map((s) => {
        const list = open.filter((j) => j.stage === s.stage)
        return {
            stage: s.stage,
            label: s.label,
            count: list.length,
            valueGrosze: list.reduce((sum, j) => sum + Math.max((j.price_grosze ?? 0) - (j.deposit_grosze ?? 0), 0), 0),
        }
    })

    const acts = input.activities.filter((a) => inPeriod(a.created_at, fromMs, toMs))
    const telefony = acts.filter((a) => a.kind === 'telefon')
    const rozmowy = telefony.filter((a) => a.outcome !== 'nie_odebral')
    const chceOferte = telefony.filter((a) => a.outcome === 'chce_oferte').length
    const ofertyAct = acts.filter((a) => a.kind === 'oferta').length

    const wonJobs = input.jobs.filter((j) => j.outcome === 'zakonczone' && inPeriod(j.closed_at, fromMs, toMs))
    const lostJobs = input.jobs.filter((j) => j.outcome === 'przegrane' && inPeriod(j.closed_at, fromMs, toMs))
    const closed = wonJobs.length + lostJobs.length

    const paidInPeriod = input.payments.filter((p) => inPeriod(p.paid_at, fromMs, toMs))
    const jobsWithPayment = new Set(paidInPeriod.map((p) => p.job_id).filter((x): x is string => !!x))

    const funnel = [
        { key: 'zainteresowani', label: 'Zapytania i „chcę ofertę”', count: input.leads.filter((l) => inPeriod(l.created_at, fromMs, toMs)).length + chceOferte },
        { key: 'zlecenia', label: 'Zlecenia w lejku', count: input.jobs.filter((j) => inPeriod(j.created_at, fromMs, toMs)).length },
        { key: 'oferty', label: 'Oferty wysłane', count: input.jobs.filter((j) => inPeriod(j.offer_sent_at, fromMs, toMs)).length },
        { key: 'akceptacje', label: 'Oferty zaakceptowane', count: input.jobs.filter((j) => inPeriod(j.offer_accepted_at, fromMs, toMs)).length },
        { key: 'wplaty', label: 'Zlecenia z wpłatą', count: jobsWithPayment.size },
        { key: 'zakonczone', label: 'Zakończone', count: wonJobs.length },
    ]

    const avgDealGrosze = wonJobs.length
        ? Math.round(wonJobs.reduce((s, j) => s + (j.price_grosze ?? 0), 0) / wonJobs.length)
        : null
    const avgDaysToClose = wonJobs.length
        ? Math.round(wonJobs.reduce((s, j) => s + (new Date(j.closed_at as string).getTime() - new Date(j.created_at).getTime()) / DAY_MS, 0) / wonJobs.length)
        : null

    const sourceRows = new Map<SourceKey, { source: SourceKey; jobs: number; won: number; valueGrosze: number }>()
    for (const j of input.jobs.filter((x) => inPeriod(x.created_at, fromMs, toMs) || wonJobs.includes(x))) {
        const key = sourceOf(j, leads, clients)
        const row = sourceRows.get(key) ?? { source: key, jobs: 0, won: 0, valueGrosze: 0 }
        row.jobs++
        if (j.outcome === 'zakonczone' && wonJobs.includes(j)) {
            row.won++
            row.valueGrosze += j.price_grosze ?? 0
        }
        sourceRows.set(key, row)
    }

    const reasons = new Map<string, number>()
    for (const j of lostJobs) {
        const r = lostReasonOf(j)
        reasons.set(r, (reasons.get(r) ?? 0) + 1)
    }

    return {
        periodDays,
        stages,
        funnel,
        calls: { telefony: telefony.length, rozmowy: rozmowy.length, oferty: ofertyAct + chceOferte },
        won: wonJobs.length,
        lost: lostJobs.length,
        winRate: closed ? wonJobs.length / closed : null,
        avgDealGrosze,
        avgDaysToClose,
        paidGrosze: paidInPeriod.reduce((s, p) => s + (p.amount_grosze ?? 0), 0),
        sources: [...sourceRows.values()].sort((a, b) => b.jobs - a.jobs),
        lostReasons: [...reasons.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
        malaProba: closed < SMALL_SAMPLE,
    }
}

/** Tekst dla AI: tylko policzone liczby, nic więcej. */
export function salesSummaryText(s: SalesStats, goal: { goalGrosze: number; earnedGrosze: number; pipelineGrosze: number; daysLeft: number }): string {
    const zl = (g: number) => `${Math.round(g / 100)} zł`
    const lines = [
        `Okres: ostatnie ${s.periodDays} dni.`,
        `Cel miesiąca ${zl(goal.goalGrosze)}, wpłacono w tym miesiącu ${zl(goal.earnedGrosze)}, do końca miesiąca ${goal.daysLeft} dni, wartość otwartych zleceń (etapy 2–6) ${zl(goal.pipelineGrosze)}.`,
        `Lejek teraz: ${s.stages.map((x) => `${x.stage}. ${x.label}: ${x.count}`).join('; ')}.`,
        `W okresie: ${s.funnel.map((f) => `${f.label} ${f.count}`).join('; ')}.`,
        `Telefony ${s.calls.telefony}, rozmowy ${s.calls.rozmowy}, oferty/chęć oferty ${s.calls.oferty}.`,
        `Wygrane ${s.won}, przegrane ${s.lost}${s.winRate !== null ? `, skuteczność ${Math.round(s.winRate * 100)}%` : ''}.`,
        s.avgDealGrosze !== null ? `Średnie zlecenie ${zl(s.avgDealGrosze)}, średnio ${s.avgDaysToClose} dni od wpisania do zamknięcia.` : 'Brak zakończonych zleceń w okresie.',
        `Źródła: ${s.sources.map((x) => `${x.source} ${x.jobs} zleceń (${x.won} wygranych)`).join('; ') || 'brak'}.`,
        `Przyczyny przegranych: ${s.lostReasons.map((r) => `${r.reason} ${r.count}`).join('; ') || 'brak'}.`,
    ]
    if (s.malaProba) lines.push(`UWAGA: tylko ${s.won + s.lost} zamkniętych zleceń, za mało na pewne wnioski z procentów.`)
    return lines.join('\n')
}
