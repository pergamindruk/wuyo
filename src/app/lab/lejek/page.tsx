import { redirect } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/lib/lab/today/queries'
import { formatPLN } from '@/lib/lab/today/format'
import { Board } from '@/components/lab/pipeline/Board'
import { NewJobForm } from '@/components/lab/pipeline/NewJobForm'
import type { ClientOption, PipelineJob } from '@/components/lab/pipeline/types'
import { shortDate } from '@/components/lab/pipeline/view'

export const dynamic = 'force-dynamic'

export default async function LejekPage({ searchParams }: { searchParams: Promise<{ nowe?: string }> }) {
    const { nowe } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const [jobs, extraRes, clientsRes] = await Promise.all([
        getJobs(supabase),
        supabase.from('jobs').select('id, notes, closed_at'),
        supabase.from('clients').select('id, name, company').order('name'),
    ])

    const extra = new Map(
        (extraRes.data ?? []).map((r) => [r.id as string, { notes: (r.notes as string | null) ?? null, closed_at: (r.closed_at as string | null) ?? null }]),
    )
    const all: PipelineJob[] = jobs.map((j) => ({
        ...j,
        notes: extra.get(j.id)?.notes ?? null,
        closed_at: extra.get(j.id)?.closed_at ?? null,
    }))
    const clients: ClientOption[] = (clientsRes.data ?? []).map((c) => ({
        id: c.id as string,
        name: ((c.company as string | null) || (c.name as string)) ?? 'Klient',
    }))

    const nowIso = new Date().toISOString()
    const today = nowIso.slice(0, 10)
    const monthStart = `${today.slice(0, 7)}-01`

    const open = all.filter((j) => j.outcome === 'w_toku')
    const wonThisMonth = all.filter((j) => j.outcome === 'zakonczone' && !!j.closed_at && j.closed_at.slice(0, 10) >= monthStart)
    const closed = all
        .filter((j) => j.outcome !== 'w_toku')
        .sort((a, b) => (b.closed_at ?? b.updated_at).localeCompare(a.closed_at ?? a.updated_at))

    const inPlay = open.reduce((s, j) => s + j.price_grosze, 0)
    const wonSum = wonThisMonth.reduce((s, j) => s + j.price_grosze, 0)

    return (
        <div className="flex flex-col gap-6 max-w-[1600px]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500/80 mb-2">
                        Zlecenia
                    </p>
                    <h1 className="text-2xl font-bold text-white leading-tight">Lejek</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                        <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">W grze</p>
                        <p className="font-heading text-xl font-bold text-yellow-400 leading-tight">
                            {formatPLN(inPlay)} <span className="text-[10px] font-normal text-zinc-500">netto</span>
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">
                        <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Wygrane w tym miesiącu</p>
                        <p className="font-heading text-xl font-bold text-emerald-400 leading-tight">
                            {formatPLN(wonSum)} <span className="text-[10px] font-normal text-zinc-500">netto</span>
                        </p>
                    </div>
                    <NewJobForm clients={clients} initialOpen={nowe === "1"} />
                </div>
            </header>

            <Board jobs={[...open, ...wonThisMonth]} today={today} nowIso={nowIso} />

            <details className="group bg-zinc-900 border border-zinc-800 rounded-xl">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                    <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        Zamknięte · {closed.length}
                    </span>
                    <ChevronDown size={14} className="text-zinc-600 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="divide-y divide-zinc-800 border-t border-zinc-800">
                    {closed.length === 0 && <li className="px-5 py-4 text-sm text-zinc-600">Nic jeszcze nie zamknięte.</li>}
                    {closed.map((j) => (
                        <li key={j.id} className="flex items-center gap-3 px-5 py-3">
                            <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                                j.outcome === 'zakonczone' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                                {j.outcome === 'zakonczone' ? 'Zakończone' : 'Przegrane'}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-white truncate">{j.title}</p>
                                <p className="text-xs text-zinc-500 truncate">{j.client_name}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-semibold text-zinc-300">{formatPLN(j.price_grosze)}</p>
                                {j.closed_at && <p className="text-[11px] text-zinc-600">{shortDate(j.closed_at)}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    )
}
