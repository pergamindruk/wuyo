import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search } from 'lucide-react'
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

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Sprzedaż</p>
                    <h1 className="mt-1 text-3xl font-bold text-white">Klienci</h1>
                    <p className="mt-1 text-sm text-zinc-500">Każdy, kto trafił do lejka: z zapytania, z telefonu albo dodany ręcznie.</p>
                </div>
                <form className="flex w-full max-w-sm items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-4 sm:w-auto" role="search">
                    <Search size={15} className="text-zinc-500" />
                    <input name="q" defaultValue={q} placeholder="Szukaj: nazwa, telefon, mail" aria-label="Szukaj klienta" className="min-h-11 w-full bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none" />
                </form>
            </header>

            {rows.length === 0 ? (
                <p className="rounded-3xl border border-zinc-800 py-16 text-center text-zinc-500">
                    {q ? 'Nic nie pasuje.' : 'Brak klientów. Pojawią się, gdy ktoś trafi do lejka.'}
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {rows.map((r) => (
                        <li key={r.id}>
                            <Link href={`/lab/klienci/${r.id}`} className="grid gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition-colors hover:border-yellow-400/40 sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_auto] sm:items-center">
                                <span className="min-w-0">
                                    <span className="block truncate font-semibold text-white">{r.company || r.name}</span>
                                    <span className="block truncate text-xs text-zinc-500">{[r.company && r.name !== r.company ? r.name : null, r.phone, r.source].filter(Boolean).join(' · ')}</span>
                                </span>
                                <span className="text-sm">
                                    {r.open ? (
                                        <span className="text-zinc-300">
                                            {r.open.stage}. {stageLabel(r.open.stage)}
                                            {r.open.next_contact_at && <span className="text-zinc-500"> · kontakt {r.open.next_contact_at}</span>}
                                        </span>
                                    ) : (
                                        <span className="text-zinc-600">{r.count ? `${r.count} zakończone/przegrane` : 'bez zlecenia'}</span>
                                    )}
                                </span>
                                <span className="text-right text-sm font-semibold text-white">{r.paid ? formatPLN(r.paid) : <span className="font-normal text-zinc-600">0 zł</span>}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
