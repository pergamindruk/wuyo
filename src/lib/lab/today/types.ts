// Wspólne typy ekranu „Dziś”, lejka i statystyk. Kwoty ZAWSZE w groszach.

export type QueueStatus = 'do_kontaktu' | 'nie_odebral' | 'oddzwonic' | 'nie_chce' | 'chce_oferte'
export type QueueSource = 'bez_strony' | 'slaba_strona' | 'strona_nie_dziala' | 'ceidg' | 'reczny'

export interface QueueItem {
    id: string
    name: string
    industry: string
    phone: string
    website: string
    source: QueueSource
    reason: string
    problems: string[]
    score: number
    status: QueueStatus
    attempts: number
    next_at: string
    notes: string | null
    client_id: string | null
    job_id: string | null
}

/** Wynik rozmowy wybierany w kolejce (klawisze 1–4). */
export type CallOutcome = 'nie_odebral' | 'nie_chce' | 'oddzwonic' | 'chce_oferte'

export type ActivityKind = 'telefon' | 'mail' | 'oferta' | 'zaliczka' | 'platnosc' | 'notatka_dnia'

export interface Activity {
    id: string
    kind: ActivityKind
    outcome: string | null
    queue_id: string | null
    job_id: string | null
    note: string | null
    created_at: string
}

/** jobs.stage 1–7 = 7 kroków prowadzenia klienta z CLAUDE.md */
export type JobStage = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface Job {
    id: string
    client_id: string
    client_name: string
    title: string
    service: string
    stage: JobStage
    outcome: 'w_toku' | 'zakonczone' | 'przegrane'
    price_grosze: number
    deposit_grosze: number
    next_step: string | null
    next_contact_at: string | null
    offer_sent_at: string | null
    updated_at: string
    created_at: string
}

export interface Renewal {
    id: string
    name: string
    kind: string
    due_at: string
    cost_grosze: number
}

export interface Subscription {
    id: string
    client_id: string
    plan: string
    amount_grosze: number
    domain: string | null
    domain_renewal_at: string | null
    hosting_renewal_at: string | null
    active: boolean
}

export interface MonthGoal {
    goalGrosze: number
    earnedGrosze: number          // wpłaty w bieżącym miesiącu
    pipelineGrosze: number        // wartość otwartych zleceń (stage 2–6, w_toku)
    daysLeft: number
}

/** Jedno najważniejsze zadanie teraz (tryb MENTOR: jedna rzecz, nie lista). */
export interface OneThing {
    kind: 'odpowiedz' | 'zaliczka' | 'outbox' | 'zalegly_kontakt' | 'oferta_stoi' | 'telefon' | 'nic'
    title: string
    detail: string
    href: string
    cta: string
}

export interface SystemsStatus {
    syncMinutesAgo: number | null
    online: boolean
    harveyOk: boolean
    nightShift: string | null
    outboxPending: number
    replies: number
}
