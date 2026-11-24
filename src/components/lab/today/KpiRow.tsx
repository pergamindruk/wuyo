import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Kanban, Mail, Phone } from 'lucide-react'
import { CountUp } from '@/components/lab/fx/CountUp'
import { AreaChart } from '@/components/lab/fx/AreaChart'

/** series = ostatnie 7 dni (do wykresiku), bez danych = płaska linia, nic nie zmyślamy. */
export type Kpi = { label: string; value: number; hint: string; href: string; icon: LucideIcon; hot?: boolean; series?: number[] }

/** Pas dużych liczb na górze ekranu „Dziś”: co czeka na Mateusza, jednym spojrzeniem. */
export function KpiRow({ items }: { items: Kpi[] }) {
    return (
        <div className="lab-stagger grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {items.map(({ label, value, hint, href, icon: Icon, hot, series }) => (
                <Link key={label} href={href} className="lab-card group flex flex-col p-4 sm:p-5">
                    {hot && <span className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-yellow-400/15 blur-2xl" />}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <span className={`h-11 w-11 shrink-0 sm:h-14 sm:w-14 ${hot ? 'lab-chip' : 'flex items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-300'}`}>
                            <Icon size={22} strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-zinc-400 sm:text-sm">{label}</p>
                            <p className="font-heading text-3xl font-bold leading-none text-white sm:text-4xl"><CountUp value={value} /></p>
                        </div>
                    </div>
                    <AreaChart id={`kpi-${label.replace(/\W/g, '')}`} values={series?.length ? series : [0, 0]} height={70} strokeWidth={2.5}
                        className={`-mx-1 mt-3 h-12 sm:h-14 ${hot ? '' : 'opacity-60'}`} />
                    <p className="mt-1 text-[11px] text-zinc-500 transition-colors group-hover:text-zinc-300">{hint}</p>
                </Link>
            ))}
        </div>
    )
}

export const KPI_ICONS = { Mail, Phone, CalendarDays, Kanban }
