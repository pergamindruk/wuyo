import { redirect } from 'next/navigation'
import { Archive, ChevronDown, Coins, Kanban, Trophy } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
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
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
            <PageHeader
                icon={Kanban}
                eyebrow="Zlecenia"
                title="Lejek"
                subtitle="Każde zlecenie od briefu do rachunku. Przeciągnij kartę do następnej kolumny."
                actions={<NewJobForm clients={clients} initialOpen={nowe === "1"} />}
            />

            <div className="lab-stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={Kanban} label="Zlecenia w toku" value={<CountUp value={open.length} />} hot={open.length > 0} />
                <StatCard icon={Coins} label="W grze (netto)" value={<CountUp value={inPlay} format="pln" />} hint="suma otwartych zleceń" />
                <StatCard icon={Trophy} label="Wygrane w tym miesiącu" value={<CountUp value={wonSum} format="pln" />} hint={`${wonThisMonth.length} zamkniętych na plus, netto`} />
            </div>

            <Board jobs={[...open, ...wonThisMonth]} today={today} nowIso={nowIso} />

            <details className="lab-card group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6">
                    <span className="flex items-center gap-2.5 text-base font-bold text-white">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Archive size={16} /></span>
                        Zamknięte
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">{closed.length}</span>
                    </span>
                    <ChevronDown size={16} className="text-zinc-500 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="flex flex-col gap-1.5 px-3 pb-4 sm:px-4">
                    {closed.length === 0 && <li className="px-2 py-3 text-sm text-zinc-500">Nic jeszcze nie zamknięte.</li>}
                    {closed.map((j) => (
                        <li key={j.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]">
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                j.outcome === 'zakonczone' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'
                            }`}>
                                {j.outcome === 'zakonczone' ? 'Zakończone' : 'Przegrane'}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-white">{j.title}</p>
                                <p className="truncate text-xs text-zinc-500">{j.client_name}</p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold text-zinc-200">{formatPLN(j.price_grosze)}</p>
                                {j.closed_at && <p className="text-[11px] text-zinc-500">{shortDate(j.closed_at)}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            </details>
        </div>
    )
}
