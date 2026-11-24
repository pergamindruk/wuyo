import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertTriangle, Coins, Compass, Kanban, Phone, Route, Target, Timer, TrendingUp, Trophy, Wallet, XCircle } from 'lucide-react'
import { PageHeader, SectionTitle, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
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
            <PageHeader
                icon={TrendingUp}
                eyebrow="Sprzedaż"
                title={period === 365 ? 'Ostatni rok' : `Ostatnie ${period} dni`}
                subtitle="Liczone z lejka, wpłat, zapytań i kolejki telefonów. Bez zgadywania."
                actions={
                    <nav className="lab-pill flex gap-1 p-1" aria-label="Okres">
                        {PERIODS.map((p) => (
                            <Link
                                key={p}
                                href={`/lab/sprzedaz?okres=${p}`}
                                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${p === period ? 'bg-yellow-400 font-semibold text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
                            >
                                {p === 365 ? 'Rok' : `${p} dni`}
                            </Link>
                        ))}
                    </nav>
                }
            />

            {s.malaProba && (
                <p className="flex items-start gap-3 rounded-2xl bg-yellow-400/[0.07] px-4 py-3 text-sm text-zinc-300 ring-1 ring-yellow-400/25">
                    <AlertTriangle size={18} strokeWidth={1.8} className="mt-0.5 shrink-0 text-yellow-400" />
                    Mało danych: {s.won + s.lost} zamkniętych zleceń w tym okresie. Procenty pokażą prawdę dopiero przy około 10.
                </p>
            )}

            <section className={statCard}>
                <SectionTitle
                    icon={Target}
                    title="Cel miesiąca"
                    action={<span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">zostało {goal.daysLeft} dni</span>}
                />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="font-heading text-4xl font-bold leading-none text-white"><CountUp value={goal.earnedGrosze} format="pln" /></p>
                    <p className="text-sm text-zinc-400">z {formatPLN(goal.goalGrosze)} · {Math.round(goalPct * 100)}%</p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="lab-bar h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-300 shadow-[0_0_18px_rgba(255,214,10,0.55)]" style={{ width: `${Math.max(2, goalPct * 100)}%` }} />
                </div>
                <p className="mt-3 text-xs text-zinc-500">W otwartych zleceniach (etapy 2–6) czeka jeszcze {formatPLN(goal.pipelineGrosze)}.</p>
            </section>

            <div className="lab-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={Wallet} label="Wpłaty w okresie" value={<CountUp value={s.paidGrosze} format="pln" />} hot={s.paidGrosze > 0} />
                <Tile icon={Trophy} label="Wygrane / przegrane" value={`${s.won} / ${s.lost}`} sub={`skuteczność ${pct(s.winRate)}`} />
                <Tile icon={Coins} label="Średnie zlecenie" value={s.avgDealGrosze === null ? '–' : formatPLN(s.avgDealGrosze)} sub="netto, zakończone" />
                <Tile icon={Timer} label="Od wpisania do końca" value={s.avgDaysToClose === null ? '–' : `${s.avgDaysToClose} dni`} sub="średnio" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <List
                    icon={Route}
                    title={`Droga klienta (${period} dni)`}
                    rows={s.funnel.map((f) => ({ k: f.label, v: String(f.count), w: funnelMax(f) }))}
                />
                <List
                    icon={Kanban}
                    title="Lejek teraz (otwarte zlecenia)"
                    rows={s.stages.map((x) => ({ k: `${x.stage}. ${x.label}`, v: `${x.count}${x.valueGrosze ? ` · ${formatPLN(x.valueGrosze)}` : ''}`, w: stageMax(x) }))}
                />
                <List
                    icon={Phone}
                    title="Telefony"
                    rows={[
                        { k: 'Wykonane', v: String(s.calls.telefony), w: 1 },
                        { k: 'Rozmowy (odebrane)', v: String(s.calls.rozmowy), w: s.calls.telefony ? s.calls.rozmowy / s.calls.telefony : 0 },
                        { k: 'Oferty / chce ofertę', v: String(s.calls.oferty), w: s.calls.telefony ? s.calls.oferty / s.calls.telefony : 0 },
                    ]}
                />
                <List
                    icon={Compass}
                    title="Skąd przychodzą zlecenia"
                    rows={s.sources.map((x) => ({ k: x.source, v: `${x.jobs} (wygr. ${x.won}${x.valueGrosze ? `, ${formatPLN(x.valueGrosze)}` : ''})`, w: srcMax(x) }))}
                />
                <List
                    icon={XCircle}
                    title="Dlaczego przegrane"
                    empty="Brak przegranych w tym okresie."
                    rows={s.lostReasons.map((r) => ({ k: r.reason, v: String(r.count), w: lostMax(r) }))}
                />
            </div>

            <SalesTips period={period} />
        </div>
    )
}
