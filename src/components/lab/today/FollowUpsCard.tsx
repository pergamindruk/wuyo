import Link from 'next/link'
import { ArrowRight, CalendarClock, Hourglass, RefreshCw } from 'lucide-react'
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
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 min-w-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Do pilnowania
                </h2>
                <Link href="/lab/lejek" className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-yellow-400 transition-colors">
                    Lejek <ArrowRight size={12} />
                </Link>
            </div>

            {shown.length === 0 ? (
                <p className="text-sm text-zinc-400 py-2">Nic zaległego. Dobra robota.</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {shown.map((it) => {
                        const Icon = it.kind === 'kontakt' ? CalendarClock : it.kind === 'oferta' ? Hourglass : RefreshCw
                        const tone = it.kind === 'odnowienie' ? 'text-zinc-500' : 'text-red-400'
                        return (
                            <li key={it.key}>
                                <Link
                                    href="/lab/lejek"
                                    className="flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 hover:bg-zinc-800/60 transition-colors"
                                >
                                    <Icon size={14} className={`shrink-0 ${tone}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white truncate">{it.title}</p>
                                        <p className="text-xs text-zinc-500 truncate">{it.detail}</p>
                                    </div>
                                    {it.amount !== null && it.amount > 0 && (
                                        <span className="font-heading text-sm font-bold text-yellow-400 shrink-0">
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
                <p className="text-[11px] text-zinc-600 mt-2">+ {rest} więcej w lejku</p>
            )}

            <p className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-800">
                Abonamenty: {subscriptions.length} · {formatPLN(subsSum)}/mc <span className="text-zinc-600">netto</span>
            </p>
        </section>
    )
}
