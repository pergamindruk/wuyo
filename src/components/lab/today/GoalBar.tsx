import { formatPLN, warsawDaysInMonth, warsawParts } from '@/lib/lab/today/format'
import { SERVICES } from '@/lib/lab/today/constants'
import type { MonthGoal } from '@/lib/lab/today/types'
import { CountUp } from '@/components/lab/fx/CountUp'
import { AreaChart } from '@/components/lab/fx/AreaChart'

export function GoalBar({ goal }: { goal: MonthGoal }) {
    const { goalGrosze, earnedGrosze, pipelineGrosze, daysLeft, cumulative = [] } = goal
    const pct = goalGrosze > 0 ? Math.round((earnedGrosze / goalGrosze) * 100) : 0
    const missing = Math.max(goalGrosze - earnedGrosze, 0)

    const daysInMonth = warsawDaysInMonth()
    const { day, month } = warsawParts()
    const expectedPct = Math.min(Math.round((day / daysInMonth) * 100), 100)
    const behind = pct < expectedPct

    const pack = SERVICES.find((s) => s.key === 'firma_w_internecie')
    const packs = pack && pack.priceGrosze > 0 && missing > 0 ? Math.ceil(missing / pack.priceGrosze) : 0
    const tip = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')} · ${formatPLN(earnedGrosze)}`

    return (
        <section className="lab-card flex h-full flex-col p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                <div>
                    <p className="text-sm font-medium text-zinc-400">Cel miesiąca</p>
                    <p className="mt-2 font-heading text-4xl font-bold leading-none text-white sm:text-6xl">
                        <CountUp value={earnedGrosze} format="pln" />
                        <span className="ml-2 text-lg font-medium text-zinc-600 sm:text-2xl">/ {formatPLN(goalGrosze)}</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="lab-pill px-3 py-1.5 text-zinc-300">Zostało <b className="text-white">{daysLeft}</b> dni</span>
                    {pipelineGrosze > 0 && <span className="lab-pill px-3 py-1.5 text-zinc-300">W lejku <b className="text-white">{formatPLN(pipelineGrosze)}</b></span>}
                </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
                <div
                    className="relative h-8 flex-1 overflow-hidden rounded-full bg-white/[0.06] sm:max-w-md"
                    role="progressbar" aria-valuenow={Math.min(pct, 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Postęp celu miesiąca"
                >
                    <div className="lab-bar lab-shine flex h-full items-center justify-end rounded-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 pr-3 shadow-[0_0_30px_-4px_rgba(255,214,10,.7)]"
                        style={{ width: `${Math.max(Math.min(pct, 100), 8)}%` }}>
                        <span className="relative z-10 text-xs font-bold text-zinc-950">{pct}%</span>
                    </div>
                    <span className="absolute inset-y-1 w-0.5 rounded bg-white/60" style={{ left: `${expectedPct}%` }} title={`Gdzie powinieneś być dziś: ${expectedPct}%`} />
                </div>
                <p className={`text-xs ${behind ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {missing > 0 ? <>brakuje <b>{formatPLN(missing)}</b></> : <b>Cel zrobiony</b>}
                </p>
            </div>

            <AreaChart id="goal" values={[0, ...cumulative]} slots={daysInMonth + 1} height={190} label={tip} className="-mx-2 mt-auto h-36 pt-6 sm:h-44" />
            <p className="mt-2 text-[11px] text-zinc-600">
                Wpłaty narastająco w tym miesiącu · biała kreska: gdzie powinieneś być dziś ({expectedPct}%)
                {packs > 0 && pack && <> · ≈ {packs} × {pack.label}, żeby domknąć</>}
            </p>
        </section>
    )
}
