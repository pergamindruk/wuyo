import { CalendarClock, Hourglass } from 'lucide-react'
import { STALE_OFFER_DAYS } from '@/lib/lab/today/constants'
import { daysBetween, formatPLN } from '@/lib/lab/today/format'
import type { PipelineJob } from './types'
import { shortDate } from './view'

// Czysto prezentacyjna karta. Importowana przez Board (wyspa kliencka), sama nie ma stanu.

export function staleDays(job: PipelineJob, now: Date): number | null {
    if (job.stage !== 2 || !job.offer_sent_at) return null
    const d = daysBetween(job.offer_sent_at, now)
    return d >= STALE_OFFER_DAYS ? d : null
}

export function JobCard({ job, today, now, selected, dragging, onOpen, onDragStart, onDragEnd }: {
    job: PipelineJob
    today: string
    now: Date
    selected: boolean
    dragging: boolean
    onOpen: () => void
    onDragStart: (e: React.DragEvent<HTMLButtonElement>) => void
    onDragEnd: () => void
}) {
    const stale = staleDays(job, now)
    const overdue = !!job.next_contact_at && job.next_contact_at <= today
    const pct = job.price_grosze > 0 ? Math.min(100, Math.round((job.deposit_grosze / job.price_grosze) * 100)) : 0

    // Ramka: czerwona gdy oferta stoi, żółta gdy karta otwarta, inaczej delikatna z żółtym hoverem.
    const border = stale !== null
        ? 'border-red-400/50'
        : selected ? 'border-yellow-400/60 shadow-[0_0_0_1px_rgba(255,214,10,0.15),0_18px_40px_-24px_rgba(255,214,10,0.45)]' : 'border-white/[0.06] hover:border-yellow-400/30'

    return (
        <button
            type="button"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onOpen}
            data-sound="pop"
            className={`group w-full cursor-grab rounded-2xl border ${border} bg-white/[0.04] p-3.5 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] active:cursor-grabbing ${dragging ? 'rotate-1 opacity-40' : ''}`}
        >
            <p className="truncate text-[11px] text-zinc-500">{job.client_name}</p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-white">{job.title}</p>
            <p className="mt-2 font-heading text-lg font-bold leading-none text-yellow-400">
                {formatPLN(job.price_grosze)}
            </p>

            {job.next_step && (
                <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{job.next_step}</p>
            )}

            {(job.next_contact_at || stale !== null) && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {job.next_contact_at && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${overdue ? 'bg-red-400/15 text-red-300' : job.next_contact_at === today ? 'bg-yellow-400/15 text-yellow-300' : 'bg-white/[0.06] text-zinc-300'}`}>
                            <CalendarClock size={12} />
                            {job.next_contact_at === today ? 'Dziś' : <>{overdue ? 'Zaległe: ' : ''}{shortDate(job.next_contact_at)}</>}
                        </span>
                    )}
                    {stale !== null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-400/15 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                            <Hourglass size={12} />
                            Oferta stoi {stale} dni
                        </span>
                    )}
                </div>
            )}

            {job.price_grosze > 0 && (
                <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500">
                        Zaliczka {formatPLN(job.deposit_grosze)} z {formatPLN(job.price_grosze)}
                    </p>
                </div>
            )}
        </button>
    )
}
