import type { Job } from '@/lib/lab/today/types'

/** Zlecenie z polami potrzebnymi tylko w lejku (notatki, data zamknięcia). */
export interface PipelineJob extends Job {
    notes: string | null
    closed_at: string | null
}

export interface ClientOption {
    id: string
    name: string
}

export type ActionResult = { ok: true } | { ok: false; error: string }
