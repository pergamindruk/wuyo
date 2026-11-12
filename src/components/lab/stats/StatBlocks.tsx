// Wspólne kafelki statystyk dla /lab/analytics i /lab/sprzedaz (komponenty serwerowe).
import type { ReactNode } from 'react'

export const statCard = 'rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5'

export function Tile({ label, value, sub, delta }: { label: string; value: string; sub?: string; delta?: ReactNode }) {
    return (
        <div className={statCard}>
            <p className="text-xs text-zinc-400">{label}</p>
            <div className="mt-2 flex items-baseline gap-2"><p className="text-3xl font-bold text-white">{value}</p>{delta}</div>
            {sub && <p className="mt-1 text-[11px] text-zinc-500">{sub}</p>}
        </div>
    )
}

export function List({ title, rows, empty = 'Brak danych.' }: { title: string; rows: { k: string; v: string; w: number }[]; empty?: string }) {
    return (
        <div className={statCard}>
            <p className="mb-3 text-sm font-semibold text-white">{title}</p>
            {rows.length === 0 ? <p className="text-xs text-zinc-600">{empty}</p> : (
                <ul className="flex flex-col gap-1.5">
                    {rows.map((r) => (
                        <li key={r.k} className="relative overflow-hidden rounded-lg px-2.5 py-1.5 text-xs">
                            <span className="absolute inset-y-0 left-0 bg-white/[0.05]" style={{ width: `${Math.max(3, r.w * 100)}%` }} />
                            <span className="relative flex justify-between gap-3"><span className="truncate text-zinc-300">{r.k}</span><span className="shrink-0 font-semibold text-white">{r.v}</span></span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

/** Udział wartości w maksimum (szerokość paska w List). */
export function rel<T>(rows: T[], val: (r: T) => number) {
    const max = Math.max(1, ...rows.map(val))
    return (r: T) => val(r) / max
}
