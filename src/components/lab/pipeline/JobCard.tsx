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

    const border = stale !== null
        ? 'border-red-500/60'
        : selected ? 'border-yellow-400/60' : 'border-zinc-800 hover:border-zinc-700'

    return (
        <button
            type="button"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onOpen}
            className={`w-full text-left bg-zinc-950 border ${border} rounded-lg p-3 transition-colors cursor-grab active:cursor-grabbing ${dragging ? 'opacity-40' : ''}`}
        >
            <p className="text-[11px] text-zinc-500 truncate">{job.client_name}</p>
            <p className="text-sm font-semibold text-white leading-snug mt-0.5 line-clamp-2">{job.title}</p>
            <p className="font-heading text-lg font-bold text-yellow-400 mt-2 leading-none">
                {formatPLN(job.price_grosze)}
            </p>

            {job.next_step && (
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{job.next_step}</p>
            )}

            {job.next_contact_at && (
                <p className={`flex items-center gap-1.5 text-[11px] mt-2 ${overdue ? 'text-red-400 font-semibold' : 'text-zinc-500'}`}>
                    <CalendarClock size={12} />
                    {job.next_contact_at === today ? 'Dziś' : <>{overdue ? 'Zaległe: ' : ''}{shortDate(job.next_contact_at)}</>}
                </p>
            )}

            {stale !== null && (
                <p className="flex items-center gap-1.5 text-[11px] text-red-400 font-semibold mt-2">
                    <Hourglass size={12} />
                    Oferta stoi {stale} dni
                </p>
            )}

            {job.price_grosze > 0 && (
                <div className="mt-3">
                    <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500/80" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1">
                        Zaliczka {formatPLN(job.deposit_grosze)} z {formatPLN(job.price_grosze)}
                    </p>
                </div>
            )}
        </button>
    )
}
