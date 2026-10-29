import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Kanban, Mail, Phone } from 'lucide-react'

export type Kpi = { label: string; value: number; hint: string; href: string; icon: LucideIcon; hot?: boolean }

/** Pas dużych liczb na górze ekranu „Dziś”: co czeka na Mateusza, jednym spojrzeniem. */
export function KpiRow({ items }: { items: Kpi[] }) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {items.map(({ label, value, hint, href, icon: Icon, hot }) => (
                <Link key={label} href={href}
                    className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-4 transition hover:border-yellow-400/30 sm:p-5">
                    {hot && <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-yellow-400/15 blur-2xl" />}
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-zinc-400">{label}</p>
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${hot ? 'bg-yellow-400 text-zinc-950' : 'bg-white/[0.06] text-zinc-300'}`}>
                            <Icon size={16} />
                        </span>
                    </div>
                    <p className={`mt-3 font-heading text-4xl font-bold leading-none ${hot ? 'text-white' : 'text-zinc-300'}`}>{value}</p>
                    <p className="mt-2 text-[11px] text-zinc-500 group-hover:text-zinc-400">{hint}</p>
                </Link>
            ))}
        </div>
    )
}

export const KPI_ICONS = { Mail, Phone, CalendarDays, Kanban }
