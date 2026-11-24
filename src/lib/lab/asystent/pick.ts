// Asystent sprzedaży: wybór najlepszych ruchów na dziś i sygnały „co sprawdzić”.
// Czysta logika (bez Supabase), żeby dało się ją testować. Kwoty w groszach.

import type { Job, QueueItem, SystemsStatus } from '@/lib/lab/today/types'

export type MoveKind = 'oferta' | 'zalegly' | 'przypomnienie' | 'oddzwon' | 'telefon'

/** Zlecenie z danymi kontaktu (klient + powiązana firma z kolejki). */
export interface AssistantJob extends Job {
    email: string
    phone: string
    notes: string | null
    queue: Pick<QueueItem, 'id' | 'industry' | 'website' | 'reason' | 'problems' | 'notes' | 'phone'> | null
}

export interface Move {
    /** 'job:<uuid>' albo 'queue:<id>' */
    key: string
    kind: MoveKind
    name: string
    /** Krótko: co zrobić. */
    action: string
    /** Dlaczego ta firma teraz. */
    why: string
    score: number
    valueGrosze: number
    daysWaiting: number
    jobId: string | null
    queueId: string | null
    service: string | null
    title: string | null
    phone: string
    email: string
    website: string
    industry: string
    problems: string[]
    notes: string | null
}

export type SignalTone = 'danger' | 'warning' | 'info' | 'success'

export interface Signal {
    tone: SignalTone
    text: string
    href: string
    cta: string
}

const DAY_MS = 86_400_000
/** Działania w activity_log, które liczą się jako sprzedaż. */
export const SALES_KINDS = new Set(['telefon', 'mail', 'oferta', 'rozmowa'])

export function daysSince(iso: string, now: Date): number {
    return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS))
}

export function plural(n: number, one: string, few: string, many: string): string {
    const m10 = n % 10
    const m100 = n % 100
    if (n === 1) return one
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
    return many
}

/** Krok przypomnienia po wysłanej ofercie (metoda: dzień 2–3 mail, 5–7 telefon, 10–14 zamknięcie). */
export function followUpStep(days: number): { label: string; channel: 'mail' | 'telefon'; nextInDays: number } {
    if (days >= 10) return { label: 'uprzejme zamknięcie tematu', channel: 'mail', nextInDays: 30 }
    if (days >= 5) return { label: 'telefon z pytaniem o decyzję', channel: 'telefon', nextInDays: 5 }
    return { label: 'krótkie pytanie mailem', channel: 'mail', nextInDays: 3 }
}

function jobMove(j: AssistantJob, kind: MoveKind, score: number, action: string, why: string, days: number): Move {
    return {
        key: `job:${j.id}`,
        kind,
        name: j.client_name,
        action,
        why,
        score,
        valueGrosze: j.price_grosze,
        daysWaiting: days,
        jobId: j.id,
        queueId: j.queue?.id ?? null,
        service: j.service || null,
        title: j.title || null,
        phone: j.phone || j.queue?.phone || '',
        email: j.email,
        website: j.queue?.website ?? '',
        industry: j.queue?.industry ?? '',
        problems: j.queue?.problems ?? [],
        notes: [j.notes, j.queue?.notes].filter(Boolean).join('\n') || null,
    }
}

/**
 * Wszystkie możliwe ruchy, od najważniejszego. Kolejność:
 * zaległy umówiony kontakt > oferta, na którą klient czeka > przypomnienie o wysłanej ofercie
 * > oddzwonienie z kolejki > nowy telefon z kolejki.
 */
export function rankMoves(input: { jobs: AssistantJob[]; queue: QueueItem[]; now?: Date }): Move[] {
    const now = input.now ?? new Date()
    const today = now.toISOString().slice(0, 10)
    const moves: Move[] = []
    const jobIds = new Set<string>()

    for (const j of input.jobs) {
        if (j.outcome !== 'w_toku') continue
        jobIds.add(j.id)
        const value = Math.min(j.price_grosze / 10_000, 60) // max +60 pkt za wartość
        const contactDue = j.next_contact_at && j.next_contact_at.slice(0, 10) <= today

        if (j.stage === 1) {
            const days = daysSince(j.created_at, now)
            moves.push(jobMove(j, 'oferta', 800 + Math.min(days, 30) * 3 + value,
                'Wyślij ofertę',
                days > 0 ? `Chce oferty od ${days} ${plural(days, 'dnia', 'dni', 'dni')} i jeszcze jej nie dostał.` : 'Chce oferty, jeszcze jej nie dostał.',
                days))
        } else if (j.stage === 2 && contactDue) {
            const days = daysSince(j.next_contact_at!, now)
            moves.push(jobMove(j, 'zalegly', 1000 + Math.min(days, 30) * 3 + value,
                'Umówiony kontakt',
                `Obiecany kontakt ${days === 0 ? 'na dziś' : `zaległy od ${days} ${plural(days, 'dnia', 'dni', 'dni')}`}${j.next_step ? `: ${j.next_step}` : ''}.`,
                days))
        } else if (j.stage === 2 && j.offer_sent_at) {
            const days = daysSince(j.offer_sent_at, now)
            if (days < 2) continue
            const step = followUpStep(days)
            moves.push(jobMove(j, 'przypomnienie', 600 + Math.min(days, 30) * 2 + value,
                `Przypomnij się: ${step.label}`,
                `Oferta wysłana ${days} ${plural(days, 'dzień', 'dni', 'dni')} temu, bez odpowiedzi.`,
                days))
        }
    }

    for (const q of input.queue) {
        if (q.job_id && jobIds.has(q.job_id)) continue
        if (!['do_kontaktu', 'nie_odebral', 'oddzwonic'].includes(q.status)) continue
        if (new Date(q.next_at).getTime() > now.getTime()) continue
        const s = q.score_manual ?? q.score ?? 0
        const base = {
            key: `queue:${q.id}`, name: q.name, valueGrosze: 0, jobId: null, queueId: q.id,
            service: null, title: null, phone: q.phone, email: '', website: q.website, industry: q.industry,
            problems: q.problems ?? [], notes: q.notes, daysWaiting: 0,
        }
        if (q.status === 'oddzwonic') {
            moves.push({ ...base, kind: 'oddzwon', score: 400 + s / 2, action: 'Oddzwoń', why: `Prosił o telefon. ${q.reason}`.trim() })
        } else {
            moves.push({
                ...base, kind: 'telefon', score: 100 + s / 2 - (q.attempts ?? 0) * 5, action: 'Zadzwoń',
                why: [q.reason, q.score_manual_reason].filter(Boolean).join('. ') || 'Firma z kolejki nocnej zmiany.',
            })
        }
    }

    return moves.sort((a, b) => b.score - a.score)
}

/** Ruchy na dziś: najlepsze, bez pominiętych dziś. */
export function pickMoves(ranked: Move[], skipped: Set<string>, limit = 3): Move[] {
    return ranked.filter((m) => !skipped.has(m.key)).slice(0, limit)
}

/** Sygnały: co sprawdzić, poprawić albo zrobić, od najpilniejszego. */
export function buildSignals(input: {
    jobs: AssistantJob[]
    moves: Move[]
    systems: SystemsStatus
    salesActivities7d: number
    harveyDecisions: number
}): Signal[] {
    const { jobs, moves, systems } = input
    const out: Signal[] = []
    const open = jobs.filter((j) => j.outcome === 'w_toku')

    if (systems.replies > 0) {
        out.push({ tone: 'danger', text: `Klient odpisał: ${systems.replies} ${plural(systems.replies, 'rozmowa czeka', 'rozmowy czekają', 'rozmów czeka')} w Harveyu.`, href: '/lab/centrum', cta: 'Odpowiedz' })
    }

    const waiting = moves.filter((m) => m.kind === 'oferta')
    if (waiting.length > 0) {
        const oldest = Math.max(...waiting.map((m) => m.daysWaiting))
        out.push({
            tone: oldest >= 3 ? 'danger' : 'warning',
            text: `${waiting.length} ${plural(waiting.length, 'firma czeka', 'firmy czekają', 'firm czeka')} na ofertę${oldest > 0 ? `, najdłużej ${oldest} ${plural(oldest, 'dzień', 'dni', 'dni')}` : ''}.`,
            href: '#ruchy', cta: 'Przygotuj',
        })
    }

    const due = moves.filter((m) => m.kind === 'zalegly' || m.kind === 'przypomnienie').length
    if (due > 0) {
        out.push({ tone: 'warning', text: `${due} ${plural(due, 'oferta czeka', 'oferty czekają', 'ofert czeka')} na przypomnienie albo umówiony kontakt.`, href: '#ruchy', cta: 'Zobacz' })
    }

    const callbacks = moves.filter((m) => m.kind === 'oddzwon').length
    if (callbacks > 0) {
        out.push({ tone: 'warning', text: `${callbacks} ${plural(callbacks, 'firma prosiła', 'firmy prosiły', 'firm prosiło')} o telefon.`, href: '#ruchy', cta: 'Zadzwoń' })
    }

    if (input.salesActivities7d === 0) {
        out.push({ tone: 'danger', text: 'Zero telefonów, maili i ofert w ostatnich 7 dniach.', href: '#ruchy', cta: 'Zrób pierwszy ruch' })
    }

    if (input.harveyDecisions > 0) {
        out.push({ tone: 'info', text: `${input.harveyDecisions} ${plural(input.harveyDecisions, 'mail Harveya czeka', 'maile Harveya czekają', 'maili Harveya czeka')} na Twoją decyzję.`, href: '/lab/maile', cta: 'Przejrzyj' })
    }

    const deposits = open.filter((j) => j.stage === 3 || (j.stage === 4 && j.deposit_grosze === 0)).length
    if (deposits > 0) {
        out.push({ tone: 'info', text: `${deposits} ${plural(deposits, 'zlecenie czeka', 'zlecenia czekają', 'zleceń czeka')} na umowę albo zaliczkę.`, href: '/lab/lejek', cta: 'Otwórz lejek' })
    }

    if (!systems.online) {
        out.push({ tone: 'warning', text: systems.syncMinutesAgo === null ? 'Centrum nie wysłało jeszcze danych.' : `Centrum milczy od ${systems.syncMinutesAgo} min. Sprawdź, czy komputer i sync działają.`, href: '/lab/centrum', cta: 'Sprawdź' })
    } else if (!systems.harveyOk) {
        out.push({ tone: 'warning', text: 'Harvey nie działa (panel albo pętla wysyłki).', href: '/lab/centrum', cta: 'Sprawdź' })
    }

    if (out.length === 0) out.push({ tone: 'success', text: 'Wszystko na bieżąco. Nic nie czeka na Ciebie.', href: '#ruchy', cta: 'OK' })
    return out
}
