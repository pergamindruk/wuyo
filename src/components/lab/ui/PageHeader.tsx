import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Nagłówek każdej podstrony /lab (system v2): żółty kafelek z ikoną, tytuł Syne, krótki opis, akcje po prawej.
 * Ikona taka sama jak w menu, żeby było wiadomo, gdzie się jest.
 */
export function PageHeader({ icon: Icon, title, subtitle, actions, eyebrow }: {
    icon: LucideIcon
    title: string
    subtitle?: ReactNode
    actions?: ReactNode
    eyebrow?: string
}) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
                <span className="lab-chip h-12 w-12 shrink-0 sm:h-14 sm:w-14"><Icon size={24} strokeWidth={1.9} /></span>
                <div className="min-w-0">
                    {eyebrow && <p className="text-xs font-medium text-zinc-500">{eyebrow}</p>}
                    <h1 className="truncate text-3xl font-bold leading-tight text-white sm:text-4xl">{title}</h1>
                    {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
    )
}

/** Mały nagłówek sekcji w karcie: ikona w kółku + tytuł + opcjonalna akcja. */
export function SectionTitle({ icon: Icon, title, action }: { icon?: LucideIcon; title: string; action?: ReactNode }) {
    return (
        <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-base font-bold text-white">
                {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Icon size={16} /></span>}
                {title}
            </h2>
            {action}
        </div>
    )
}

/** Duża liczba w karcie (KPI). value jako ReactNode, żeby dało się wstawić <CountUp>. */
export function StatCard({ icon: Icon, label, value, hint, hot }: { icon: LucideIcon; label: string; value: ReactNode; hint?: ReactNode; hot?: boolean }) {
    return (
        <div className="lab-card lab-hover p-5">
            {hot && <span className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-yellow-400/15 blur-2xl" />}
            <div className="flex items-center gap-4">
                <span className={`h-12 w-12 shrink-0 ${hot ? 'lab-chip' : 'flex items-center justify-center rounded-2xl bg-white/[0.06] text-zinc-300'}`}><Icon size={22} strokeWidth={1.8} /></span>
                <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-400">{label}</p>
                    <p className="font-heading text-3xl font-bold leading-none text-white">{value}</p>
                </div>
            </div>
            {hint && <p className="mt-3 text-xs text-zinc-500">{hint}</p>}
        </div>
    )
}
