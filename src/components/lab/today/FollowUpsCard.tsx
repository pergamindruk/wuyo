import Link from 'next/link'
import { ArrowRight, BellRing, CalendarClock, CheckCheck, Hourglass, RefreshCw } from 'lucide-react'
import { STALE_OFFER_DAYS } from '@/lib/lab/today/constants'
import { daysBetween, formatPLN, warsawIsoDate } from '@/lib/lab/today/format'
import type { Job, Renewal, Subscription } from '@/lib/lab/today/types'

const MAX_ITEMS = 6
const RENEWAL_WINDOW_DAYS = 30

interface Item {
    key: string
    kind: 'kontakt' | 'oferta' | 'odnowienie'
    title: string
    detail: string
    amount: number | null
    urgency: number // większe = pilniejsze, w obrębie rodzaju
}

const KIND_ORDER = { kontakt: 0, oferta: 1, odnowienie: 2 } as const

function daysUntil(iso: string, now: Date): number {
    return -daysBetween(iso, now)
}

function dueLabel(days: number): string {
    if (days < 0) return `${-days} dni po terminie`
    if (days === 0) return 'dziś'
    return `za ${days} dni`
}

export function FollowUpsCard({ jobs, renewals, subscriptions }: {
    jobs: Job[]
    renewals: Renewal[]
    subscriptions: Subscription[]
}) {
    const now = new Date()
    const today = warsawIsoDate(0, now)
    const horizon = warsawIsoDate(RENEWAL_WINDOW_DAYS, now)
    const items: Item[] = []

    for (const j of jobs) {
        if (j.outcome !== 'w_toku') continue
        const overdue = !!j.next_contact_at && j.next_contact_at <= today
        const stale = j.stage === 2 && !!j.offer_sent_at && daysBetween(j.offer_sent_at, now) >= STALE_OFFER_DAYS
        if (overdue) {
            const late = daysBetween(j.next_contact_at as string, now)
            items.push({
                key: `k-${j.id}`,
                kind: 'kontakt',
                title: j.client_name,
                detail: `${j.next_step || j.title} · ${late <= 0 ? 'kontakt dziś' : `${late} dni zwłoki`}`,
                amount: j.price_grosze,
                urgency: late,
            })
        } else if (stale) {
            const d = daysBetween(j.offer_sent_at as string, now)
            items.push({
                key: `o-${j.id}`,
                kind: 'oferta',
                title: j.client_name,
                detail: `Oferta stoi ${d} dni · ${j.title}`,
                amount: j.price_grosze,
                urgency: d,
            })
        }
    }

    for (const r of renewals) {
        const d = daysUntil(r.due_at, now)
        if (d > RENEWAL_WINDOW_DAYS) continue
        items.push({
            key: `r-${r.id}`,
            kind: 'odnowienie',
            title: r.name,
            detail: `Odnowienie: ${r.kind} · ${dueLabel(d)}`,
            amount: r.cost_grosze,
            urgency: -d,
        })
    }

    for (const s of subscriptions) {
        const label = s.domain || s.plan
        const dates: [string, string | null][] = [
            ['domena', s.domain_renewal_at],
            ['hosting', s.hosting_renewal_at],
        ]
        for (const [what, at] of dates) {
            if (!at || at > horizon) continue
            items.push({
                key: `s-${s.id}-${what}`,
                kind: 'odnowienie',
                title: label,
                detail: `Odnowienie: ${what} · ${dueLabel(daysUntil(at, now))}`,
                amount: null,
                urgency: -daysUntil(at, now),
            })
        }
    }

    items.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || b.urgency - a.urgency)
    const shown = items.slice(0, MAX_ITEMS)
    const rest = items.length - shown.length

    const subsSum = subscriptions.reduce((acc, s) => acc + s.amount_grosze, 0)

    return (
        <section className="lab-card flex min-w-0 flex-col p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2.5 text-base font-bold text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><BellRing size={16} strokeWidth={1.8} /></span>
                    Do pilnowania
                </h2>
                <Link href="/lab/lejek" className="flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-yellow-400">
                    Lejek <ArrowRight size={13} />
                </Link>
            </div>

            {shown.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><CheckCheck size={20} strokeWidth={1.8} /></span>
                    <p className="mt-3 text-sm text-zinc-400">Nic zaległego. Dobra robota.</p>
                </div>
            ) : (
                <ul className="flex flex-col gap-2">
                    {shown.map((it) => {
                        const Icon = it.kind === 'kontakt' ? CalendarClock : it.kind === 'oferta' ? Hourglass : RefreshCw
                        const tone = it.kind === 'odnowienie' ? 'bg-white/[0.06] text-zinc-400' : 'bg-red-400/15 text-red-300'
                        return (
                            <li key={it.key}>
                                <Link
                                    href="/lab/lejek"
                                    className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3.5 py-2.5 transition hover:bg-white/[0.06]"
                                >
                                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                                        <Icon size={15} strokeWidth={1.8} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-white">{it.title}</p>
                                        <p className="truncate text-xs text-zinc-500">{it.detail}</p>
                                    </div>
                                    {it.amount !== null && it.amount > 0 && (
                                        <span className="shrink-0 font-heading text-sm font-bold text-yellow-400">
                                            {formatPLN(it.amount)}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}

            {rest > 0 && (
                <p className="mt-2 text-[11px] text-zinc-500">+ {rest} więcej w lejku</p>
            )}

            <div className="mt-auto pt-4">
                <p className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-zinc-500">
                    <span>Abonamenty: <strong className="text-zinc-300">{subscriptions.length}</strong></span>
                    <span><strong className="text-zinc-300">{formatPLN(subsSum)}</strong>/mc <span className="text-zinc-600">netto</span></span>
                </p>
            </div>
        </section>
    )
}
