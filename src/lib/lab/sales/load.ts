// Odczyt danych sprzedaży z bazy (tylko serwer). Liczenie w ./stats.ts.
import type { createClient } from '@/lib/supabase/server'
import type { SalesInput, SalesJob } from './stats'

type Supa = Awaited<ReturnType<typeof createClient>>

export async function loadSalesInput(supabase: Supa, periodDays: number): Promise<SalesInput> {
    const since = new Date(Date.now() - periodDays * 86_400_000).toISOString()
    const [jobs, payments, clients, leads, activities] = await Promise.all([
        // '*': działa przed i po migracji 011 (lost_reason)
        supabase.from('jobs').select('*'),
        supabase.from('payments').select('job_id, amount_grosze, paid_at'),
        supabase.from('clients').select('id, source'),
        supabase.from('leads').select('id, type, created_at'),
        supabase.from('activity_log').select('kind, outcome, created_at').gte('created_at', since),
    ])
    return {
        jobs: (jobs.data ?? []) as SalesJob[],
        payments: payments.data ?? [],
        clients: clients.data ?? [],
        leads: leads.data ?? [],
        activities: activities.data ?? [],
    }
}

export const PERIODS = [30, 90, 365] as const
export function parsePeriod(v: string | undefined): number {
    const n = Number(v)
    return (PERIODS as readonly number[]).includes(n) ? n : 90
}
