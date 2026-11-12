import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getMonthGoal } from '@/lib/lab/today/queries'
import { formatPLN } from '@/lib/lab/today/format'
import { computeSalesStats } from '@/lib/lab/sales/stats'
import { PERIODS, loadSalesInput, parsePeriod } from '@/lib/lab/sales/load'
import { List, Tile, rel, statCard } from '@/components/lab/stats/StatBlocks'
import { SalesTips } from './SalesTips'

export const dynamic = 'force-dynamic'

const pct = (n: number | null) => (n === null ? '–' : `${Math.round(n * 100)}%`)

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ okres?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const period = parsePeriod((await searchParams).okres)
    const [input, goal] = await Promise.all([loadSalesInput(supabase, period), getMonthGoal(supabase)])
    const s = computeSalesStats(input, period)

    const goalPct = goal.goalGrosze ? Math.min(1, goal.earnedGrosze / goal.goalGrosze) : 0
    const funnelMax = rel(s.funnel, (f) => f.count)
    const stageMax = rel(s.stages, (x) => x.count)
    const srcMax = rel(s.sources, (x) => x.jobs)
    const lostMax = rel(s.lostReasons, (x) => x.count)

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Sprzedaż</p>
                    <h1 className="mt-1 text-3xl font-bold text-white">Ostatnie {period} dni</h1>
                    <p className="mt-1 text-sm text-zinc-500">Liczone z lejka, wpłat, zapytań i kolejki telefonów. Bez zgadywania.</p>
                </div>
                <nav className="flex gap-1 rounded-full border border-zinc-800 p-1" aria-label="Okres">
                    {PERIODS.map((p) => (
                        <Link
                            key={p}
                            href={`/lab/sprzedaz?okres=${p}`}
                            className={`rounded-full px-4 py-1.5 text-sm ${p === period ? 'bg-yellow-400 font-semibold text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
                        >
                            {p === 365 ? 'Rok' : `${p} dni`}
                        </Link>
                    ))}
                </nav>
            </header>

            {s.malaProba && (
                <p className="flex items-start gap-2 rounded-2xl border border-yellow-400/25 bg-yellow-400/[0.05] px-4 py-3 text-sm text-zinc-300">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-yellow-400" />
                    Mało danych: {s.won + s.lost} zamkniętych zleceń w tym okresie. Procenty pokażą prawdę dopiero przy około 10.
                </p>
            )}

            <section className={statCard}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-white">Cel miesiąca</p>
                    <p className="text-sm text-zinc-400">
                        <b className="text-white">{formatPLN(goal.earnedGrosze)}</b> z {formatPLN(goal.goalGrosze)} · zostało {goal.daysLeft} dni
                    </p>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${Math.max(2, goalPct * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-zinc-500">W otwartych zleceniach (etapy 2–6) czeka jeszcze {formatPLN(goal.pipelineGrosze)}.</p>
            </section>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Tile label="Wpłaty w okresie" value={formatPLN(s.paidGrosze)} />
                <Tile label="Wygrane / przegrane" value={`${s.won} / ${s.lost}`} sub={`skuteczność ${pct(s.winRate)}`} />
                <Tile label="Średnie zlecenie" value={s.avgDealGrosze === null ? '–' : formatPLN(s.avgDealGrosze)} sub="netto, zakończone" />
                <Tile label="Od wpisania do końca" value={s.avgDaysToClose === null ? '–' : `${s.avgDaysToClose} dni`} sub="średnio" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <List
                    title={`Droga klienta (${period} dni)`}
                    rows={s.funnel.map((f) => ({ k: f.label, v: String(f.count), w: funnelMax(f) }))}
                />
                <List
                    title="Lejek teraz (otwarte zlecenia)"
                    rows={s.stages.map((x) => ({ k: `${x.stage}. ${x.label}`, v: `${x.count}${x.valueGrosze ? ` · ${formatPLN(x.valueGrosze)}` : ''}`, w: stageMax(x) }))}
                />
                <List
                    title="Telefony"
                    rows={[
                        { k: 'Wykonane', v: String(s.calls.telefony), w: 1 },
                        { k: 'Rozmowy (odebrane)', v: String(s.calls.rozmowy), w: s.calls.telefony ? s.calls.rozmowy / s.calls.telefony : 0 },
                        { k: 'Oferty / chce ofertę', v: String(s.calls.oferty), w: s.calls.telefony ? s.calls.oferty / s.calls.telefony : 0 },
                    ]}
                />
                <List
                    title="Skąd przychodzą zlecenia"
                    rows={s.sources.map((x) => ({ k: x.source, v: `${x.jobs} (wygr. ${x.won}${x.valueGrosze ? `, ${formatPLN(x.valueGrosze)}` : ''})`, w: srcMax(x) }))}
                />
                <List
                    title="Dlaczego przegrane"
                    empty="Brak przegranych w tym okresie."
                    rows={s.lostReasons.map((r) => ({ k: r.reason, v: String(r.count), w: lostMax(r) }))}
                />
            </div>

            <SalesTips period={period} />
        </div>
    )
}
