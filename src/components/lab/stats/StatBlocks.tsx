// Wspólne kafelki statystyk dla /lab/analytics i /lab/sprzedaz (komponenty serwerowe).
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Karta sekcji w stylu /lab v2 (szklana karta 28 px). */
export const statCard = 'lab-card p-5 sm:p-6'

/** Liczba KPI. icon opcjonalna: z ikoną wygląda jak StatCard, bez niej jak prosty kafelek. */
export function Tile({ label, value, sub, delta, icon: Icon }: { label: string; value: string; sub?: string; delta?: ReactNode; icon?: LucideIcon }) {
    return (
        <div className="lab-card lab-hover p-5">
            <div className="flex items-center gap-3">
                {Icon && (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-300">
                        <Icon size={18} strokeWidth={1.8} />
                    </span>
                )}
                <p className="min-w-0 truncate text-xs font-medium text-zinc-400 sm:text-sm">{label}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <p className="font-heading text-3xl font-bold leading-none text-white">{value}</p>{delta}
            </div>
            {sub && <p className="mt-2 text-[11px] text-zinc-500">{sub}</p>}
        </div>
    )
}

/** Lista z paskami udziału (np. źródła ruchu). w = udział 0..1. */
export function List({ title, rows, empty = 'Brak danych.', icon: Icon }: { title: string; rows: { k: string; v: string; w: number }[]; empty?: string; icon?: LucideIcon }) {
    return (
        <div className={statCard}>
            <h2 className="mb-4 flex items-center gap-2.5 text-base font-bold text-white">
                {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Icon size={16} /></span>}
                {title}
            </h2>
            {rows.length === 0 ? <p className="text-xs text-zinc-500">{empty}</p> : (
                <ul className="flex flex-col gap-1.5">
                    {rows.map((r) => (
                        <li key={r.k} className="relative overflow-hidden rounded-xl bg-white/[0.02] px-3 py-2 text-xs transition hover:bg-white/[0.05]">
                            <span className="lab-bar absolute inset-y-0 left-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-yellow-400/5" style={{ width: `${Math.max(3, r.w * 100)}%` }} />
                            <span className="relative flex justify-between gap-3"><span className="truncate text-zinc-200">{r.k}</span><span className="shrink-0 font-semibold tabular-nums text-white">{r.v}</span></span>
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
