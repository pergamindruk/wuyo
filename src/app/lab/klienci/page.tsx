import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight, Kanban, Search, Users, Wallet } from 'lucide-react'
import { PageHeader, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
import { createClient } from '@/lib/supabase/server'
import { formatPLN } from '@/lib/lab/today/format'
import { stageLabel } from '@/lib/lab/client-timeline'

export const dynamic = 'force-dynamic'

type Row = {
    id: string
    name: string
    company: string | null
    phone: string | null
    source: string | null
    created_at: string
}
type JobRow = { id: string; client_id: string; stage: number; outcome: string | null; next_contact_at: string | null; updated_at: string }

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const q = ((await searchParams).q ?? '').trim()
    let query = supabase.from('clients').select('id, name, company, phone, source, created_at').order('created_at', { ascending: false }).limit(200)
    if (q) {
        const safe = q.replace(/[%,()]/g, ' ')
        query = query.or(`name.ilike.%${safe}%,company.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`)
    }
    const [{ data: clients }, { data: jobs }, { data: payments }] = await Promise.all([
        query,
        supabase.from('jobs').select('id, client_id, stage, outcome, next_contact_at, updated_at'),
        supabase.from('payments').select('job_id, amount_grosze'),
    ])

    const jobsBy = new Map<string, JobRow[]>()
    for (const j of (jobs ?? []) as JobRow[]) jobsBy.set(j.client_id, [...(jobsBy.get(j.client_id) ?? []), j])
    const jobClient = new Map(((jobs ?? []) as JobRow[]).map((j) => [j.id, j.client_id]))
    const paidBy = new Map<string, number>()
    for (const p of payments ?? []) {
        const c = p.job_id ? jobClient.get(p.job_id) : undefined
        if (c) paidBy.set(c, (paidBy.get(c) ?? 0) + (p.amount_grosze ?? 0))
    }

    const rows = ((clients ?? []) as Row[]).map((c) => {
        const list = jobsBy.get(c.id) ?? []
        const open = list.find((j) => (j.outcome ?? 'w_toku') === 'w_toku')
        const last = [c.created_at, ...list.map((j) => j.updated_at)].sort().at(-1) as string
        return { ...c, open, count: list.length, paid: paidBy.get(c.id) ?? 0, last }
    }).sort((a, b) => (a.last < b.last ? 1 : -1))

    // Liczby do kafelków: tylko z danych, które strona już ma.
    const openCount = rows.filter((r) => r.open).length
    const paidTotal = rows.reduce((s, r) => s + r.paid, 0)

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={Users}
                eyebrow="Sprzedaż"
                title="Klienci"
                subtitle="Każdy, kto trafił do lejka: z zapytania, z telefonu albo dodany ręcznie."
                actions={
                    <form className="lab-pill flex w-full max-w-sm items-center gap-2 px-4 sm:w-72" role="search">
                        <Search size={16} strokeWidth={1.8} className="shrink-0 text-zinc-500" />
                        <input name="q" defaultValue={q} placeholder="Szukaj: nazwa, telefon, mail" aria-label="Szukaj klienta" className="min-h-11 w-full !border-0 !bg-transparent text-sm text-white placeholder:text-zinc-600 !shadow-none focus:outline-none" />
                    </form>
                }
            />

            <div className="lab-stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard icon={Users} label={q ? 'Pasuje do wyszukiwania' : 'Klienci'} value={<CountUp value={rows.length} />} />
                <StatCard icon={Kanban} label="Z otwartym zleceniem" value={<CountUp value={openCount} />} hot={openCount > 0} />
                <StatCard icon={Wallet} label="Wpłacili łącznie" value={<CountUp value={paidTotal} format="pln" />} />
            </div>

            {rows.length === 0 ? (
                <div className="lab-card flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <span className="lab-chip h-12 w-12"><Users size={20} strokeWidth={1.8} /></span>
                    <p className="text-sm text-zinc-400">{q ? 'Nic nie pasuje. Spróbuj innej nazwy albo numeru.' : 'Brak klientów. Pojawią się, gdy ktoś trafi do lejka.'}</p>
                    <Link href={q ? '/lab/klienci' : '/lab/lejek'} className="bg-yellow-400 px-5 py-2.5 text-sm font-bold">{q ? 'Pokaż wszystkich' : 'Otwórz lejek'}</Link>
                </div>
            ) : (
                <div className="lab-card p-3 sm:p-4">
                    <ul className="lab-stagger flex flex-col gap-1.5">
                        {rows.map((r) => (
                            <li key={r.id}>
                                <Link href={`/lab/klienci/${r.id}`} className="group grid gap-2 rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06] sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_auto] sm:items-center">
                                    <span className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-sm font-bold text-zinc-300 transition group-hover:bg-yellow-400 group-hover:text-zinc-950">
                                            {(r.company || r.name).trim().charAt(0).toUpperCase()}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate font-semibold text-white">{r.company || r.name}</span>
                                            <span className="block truncate text-xs text-zinc-500">{[r.company && r.name !== r.company ? r.name : null, r.phone, r.source].filter(Boolean).join(' · ')}</span>
                                        </span>
                                    </span>
                                    <span className="text-sm">
                                        {r.open ? (
                                            <span className="inline-flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">{r.open.stage}. {stageLabel(r.open.stage)}</span>
                                                {r.open.next_contact_at && <span className="text-xs text-zinc-500">kontakt {r.open.next_contact_at}</span>}
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-400">{r.count ? `${r.count} zakończone/przegrane` : 'bez zlecenia'}</span>
                                        )}
                                    </span>
                                    <span className="flex items-center justify-end gap-2 text-right text-sm font-semibold text-white">
                                        {r.paid ? formatPLN(r.paid) : <span className="font-normal text-zinc-600">0 zł</span>}
                                        <ChevronRight size={16} className="text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-yellow-400" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
