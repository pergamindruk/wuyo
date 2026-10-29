import { createClient } from '@/lib/supabase/server'
import { DEFAULT_MONTH_GOAL_GROSZE, STALE_OFFER_DAYS } from './constants'
import { daysBetween, formatPLN, warsawIsoDate, warsawParts } from './format'
import type {
    Activity, Job, MonthGoal, OneThing, QueueItem, Renewal, Subscription, SystemsStatus,
} from './types'

type Supa = Awaited<ReturnType<typeof createClient>>

function monthBounds(now = new Date()) {
    const { year, month, day } = warsawParts(now)
    const iso = (y: number, m: number) => new Date(Date.UTC(y, m - 1, 1)).toISOString().slice(0, 10)
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
    return { start: iso(year, month), end: iso(year, month + 1), daysLeft: daysInMonth - day + 1 }
}

/** Cel miesiąca: lab_settings.monthlyGoalGrosze, wpłaty (payments + opłacone finances bez dubli). */
export async function getMonthGoal(supabase: Supa): Promise<MonthGoal> {
    const { start, end, daysLeft } = monthBounds()
    const [settings, payments, finances, jobs] = await Promise.all([
        supabase.from('lab_settings').select('data').eq('id', 1).maybeSingle(),
        supabase.from('payments').select('amount_grosze, finance_id').gte('paid_at', start).lt('paid_at', end),
        supabase.from('finances').select('id, amount, paid_at').gte('paid_at', start).lt('paid_at', end),
        supabase.from('jobs').select('price_grosze, deposit_grosze, stage').eq('outcome', 'w_toku').gte('stage', 2),
    ])
    const data = (settings.data?.data ?? {}) as { monthlyGoalGrosze?: number }
    const linked = new Set((payments.data ?? []).map((p) => p.finance_id).filter(Boolean))
    const fromPayments = (payments.data ?? []).reduce((s, p) => s + (p.amount_grosze ?? 0), 0)
    const fromFinances = (finances.data ?? [])
        .filter((f) => !linked.has(f.id))
        .reduce((s, f) => s + Math.round(Number(f.amount ?? 0) * 100), 0)
    const pipeline = (jobs.data ?? [])
        .filter((j) => j.stage <= 6)
        .reduce((s, j) => s + Math.max((j.price_grosze ?? 0) - (j.deposit_grosze ?? 0), 0), 0)
    return {
        goalGrosze: data.monthlyGoalGrosze && data.monthlyGoalGrosze > 0 ? data.monthlyGoalGrosze : DEFAULT_MONTH_GOAL_GROSZE,
        earnedGrosze: fromPayments + fromFinances,
        pipelineGrosze: pipeline,
        daysLeft,
    }
}

/** Kolejka telefonów: do zadzwonienia teraz (next_at minął), najwyższy score pierwszy. */
export async function getQueue(supabase: Supa, limit = 25): Promise<QueueItem[]> {
    const { data } = await supabase
        .from('call_queue')
        .select('*')
        .in('status', ['do_kontaktu', 'nie_odebral', 'oddzwonic'])
        .lte('next_at', new Date().toISOString())
        .order('status', { ascending: false }) // 'oddzwonic' przed 'nie_odebral' i 'do_kontaktu'
        .order('score', { ascending: false })
        .order('next_at', { ascending: true })
        .limit(limit)
    return (data ?? []) as QueueItem[]
}

export async function getQueueCounts(supabase: Supa): Promise<Record<string, number>> {
    const { data } = await supabase.from('call_queue').select('status, next_at')
    const now = Date.now()
    const out: Record<string, number> = { teraz: 0, pozniej: 0, nie_chce: 0, chce_oferte: 0, wszystkie: 0 }
    for (const r of data ?? []) {
        out.wszystkie++
        if (r.status === 'nie_chce') out.nie_chce++
        else if (r.status === 'chce_oferte') out.chce_oferte++
        else if (new Date(r.next_at).getTime() <= now) out.teraz++
        else out.pozniej++
    }
    return out
}

/** Zlecenia z nazwą klienta (lejek). */
export async function getJobs(supabase: Supa): Promise<Job[]> {
    const { data } = await supabase
        .from('jobs')
        .select('id, client_id, title, service, stage, outcome, price_grosze, deposit_grosze, next_step, next_contact_at, offer_sent_at, updated_at, created_at, clients(name, company)')
        .order('updated_at', { ascending: false })
    return (data ?? []).map((j) => {
        const c = (Array.isArray(j.clients) ? j.clients[0] : j.clients) as { name?: string; company?: string } | null
        return {
            id: j.id, client_id: j.client_id, title: j.title, service: j.service,
            stage: j.stage as Job['stage'], outcome: j.outcome as Job['outcome'],
            price_grosze: j.price_grosze ?? 0, deposit_grosze: j.deposit_grosze ?? 0,
            next_step: j.next_step, next_contact_at: j.next_contact_at, offer_sent_at: j.offer_sent_at,
            updated_at: j.updated_at, created_at: j.created_at,
            client_name: c?.company || c?.name || 'Klient',
        }
    })
}

export async function getRenewalsDue(supabase: Supa, days = 30): Promise<Renewal[]> {
    const until = warsawIsoDate(days)
    const { data } = await supabase.from('renewals').select('id, name, kind, due_at, cost_grosze')
        .lte('due_at', until).order('due_at')
    return (data ?? []) as Renewal[]
}

export async function getSubscriptions(supabase: Supa): Promise<Subscription[]> {
    const { data } = await supabase.from('subscriptions')
        .select('id, client_id, plan, amount_grosze, domain, domain_renewal_at, hosting_renewal_at, active')
        .eq('active', true)
    return (data ?? []) as Subscription[]
}

export async function getActivities(supabase: Supa, sinceIso: string): Promise<Activity[]> {
    const { data } = await supabase.from('activity_log').select('*')
        .gte('created_at', sinceIso).order('created_at', { ascending: false })
    return (data ?? []) as Activity[]
}

/** Status komputera studia z centrum_snapshot (Harvey, nocna zmiana, sync). */
export async function getSystems(supabase: Supa): Promise<SystemsStatus> {
    const { data } = await supabase.from('centrum_snapshot').select('data, updated_at').eq('key', 'latest').maybeSingle()
    if (!data) return { syncMinutesAgo: null, online: false, harveyOk: false, nightShift: null, outboxPending: 0, replies: 0, dyrygent: null }
    const d = data.data as {
        harvey_status?: { procesy: number; panel: boolean }
        nocna?: { ostatnia: string | null }
        harvey?: { outbox?: Record<string, number>; rozmowy?: number }
        dyrygent?: { tresc: string; zmieniono: string } | null
    }
    const min = Math.round((Date.now() - new Date(data.updated_at as string).getTime()) / 60_000)
    return {
        syncMinutesAgo: min,
        online: min <= 45,
        harveyOk: (d.harvey_status?.procesy ?? 0) >= 2 && !!d.harvey_status?.panel,
        nightShift: d.nocna?.ostatnia ?? null,
        outboxPending: d.harvey?.outbox?.pending_review ?? 0,
        replies: d.harvey?.rozmowy ?? 0,
        dyrygent: d.dyrygent ?? null,
    }
}

/**
 * Jedna rzecz teraz. Kolejność (od najważniejszej):
 * odpowiedź klienta > zaliczka do pobrania > Outbox Harveya > zaległy kontakt
 * > oferta bez ruchu > telefon z kolejki > nic.
 */
export function pickOneThing(input: {
    systems: SystemsStatus
    jobs: Job[]
    queue: QueueItem[]
}): OneThing {
    const { systems, jobs, queue } = input
    const today = warsawIsoDate()
    const open = jobs.filter((j) => j.outcome === 'w_toku')

    if (systems.replies > 0) {
        return { kind: 'odpowiedz', title: 'Klient odpisał na mail', detail: `${systems.replies} rozmów czeka w Harveyu. Odpowiedz, póki temat jest ciepły.`, href: '/lab/centrum', cta: 'Zobacz odpowiedzi' }
    }
    const deposit = open.find((j) => j.stage === 3 || (j.stage === 4 && j.deposit_grosze === 0))
    if (deposit) {
        return { kind: 'zaliczka', title: `Zaliczka: ${deposit.client_name}`, detail: `${deposit.title}. Wyślij prośbę o 50% (${formatPLN(Math.round(deposit.price_grosze / 2))}).`, href: '/lab/lejek', cta: 'Otwórz zlecenie' }
    }
    if (systems.outboxPending > 0) {
        return { kind: 'outbox', title: `${systems.outboxPending} maili czeka na zatwierdzenie`, detail: 'Harvey je napisał. Przejrzyj, zatwierdź albo odrzuć. Przy każdej firmie masz gotowy scenariusz telefonu.', href: '/lab/maile', cta: 'Otwórz maile' }
    }
    const overdue = open.find((j) => j.next_contact_at && j.next_contact_at <= today)
    if (overdue) {
        return { kind: 'zalegly_kontakt', title: `Zaległy kontakt: ${overdue.client_name}`, detail: overdue.next_step || overdue.title, href: '/lab/lejek', cta: 'Zadzwoń teraz' }
    }
    const stale = open.find((j) => j.stage === 2 && j.offer_sent_at && daysBetween(j.offer_sent_at) >= STALE_OFFER_DAYS)
    if (stale) {
        return { kind: 'oferta_stoi', title: `Oferta stoi: ${stale.client_name}`, detail: `Wysłana ${daysBetween(stale.offer_sent_at!)} dni temu. Zadzwoń i zapytaj o decyzję.`, href: '/lab/lejek', cta: 'Przypomnij się' }
    }
    if (queue.length > 0) {
        const q = queue[0]
        return { kind: 'telefon', title: `Zadzwoń: ${q.name}`, detail: `${q.reason}. W kolejce ${queue.length} firm na dziś.`, href: '#kolejka', cta: 'Zacznij dzwonić' }
    }
    return { kind: 'nic', title: 'Kolejka pusta', detail: 'Dodaj firmy ręcznie albo poczekaj na nocną zmianę.', href: '/lab/centrum', cta: 'Centrum Dowodzenia' }
}
