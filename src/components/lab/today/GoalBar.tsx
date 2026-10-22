import { formatPLN, warsawDaysInMonth, warsawParts } from '@/lib/lab/today/format'
import { SERVICES } from '@/lib/lab/today/constants'
import type { MonthGoal } from '@/lib/lab/today/types'

export function GoalBar({ goal }: { goal: MonthGoal }) {
    const { goalGrosze, earnedGrosze, pipelineGrosze, daysLeft } = goal
    const pct = goalGrosze > 0 ? Math.round((earnedGrosze / goalGrosze) * 100) : 0
    const missing = Math.max(goalGrosze - earnedGrosze, 0)

    const daysInMonth = warsawDaysInMonth()
    const expectedPct = Math.min(Math.round((warsawParts().day / daysInMonth) * 100), 100)
    const behind = pct < expectedPct

    const pack = SERVICES.find((s) => s.key === 'firma_w_internecie')
    const packs = pack && pack.priceGrosze > 0 && missing > 0 ? Math.ceil(missing / pack.priceGrosze) : 0

    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Cel miesiąca</p>
                    <p className="mt-2 font-heading text-4xl font-bold leading-none text-white sm:text-5xl">
                        {formatPLN(earnedGrosze)}
                        <span className="ml-2 text-lg font-medium text-zinc-600 sm:text-xl">/ {formatPLN(goalGrosze)}</span>
                    </p>
                </div>
                <p className={`font-heading text-3xl font-bold ${behind ? 'text-yellow-400' : 'text-emerald-400'}`}>{pct}%</p>
            </div>

            <div
                className="relative mt-5 h-3 w-full overflow-hidden rounded-full bg-zinc-800"
                role="progressbar"
                aria-valuenow={Math.min(pct, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Postęp celu miesiąca"
            >
                <div
                    className={`h-full rounded-full ${behind ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
            <div className="relative h-4 w-full">
                <span
                    className="absolute -top-1 h-3 w-0.5 bg-white/70"
                    style={{ left: `${expectedPct}%` }}
                    title="Gdzie powinieneś być dziś"
                />
            </div>
            <p className="-mt-1 text-[11px] text-zinc-600">Kreska: gdzie powinieneś być dziś ({expectedPct}%)</p>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
                {missing > 0 ? (
                    <span>
                        Brakuje <strong className="text-white">{formatPLN(missing)}</strong>
                    </span>
                ) : (
                    <strong className="text-emerald-400">Cel zrobiony</strong>
                )}
                <span>
                    Zostało <strong className="text-white">{daysLeft}</strong> dni
                </span>
                {pipelineGrosze > 0 && (
                    <span>
                        W lejku: <strong className="text-white">{formatPLN(pipelineGrosze)}</strong>
                    </span>
                )}
            </div>
            {packs > 0 && pack && (
                <p className="mt-2 text-xs text-zinc-500">
                    ≈ {packs} × {pack.label} ({formatPLN(pack.priceGrosze)}), żeby domknąć
                </p>
            )}
        </section>
    )
}
