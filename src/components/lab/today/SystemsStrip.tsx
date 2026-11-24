import Link from 'next/link'
import { Mail } from 'lucide-react'
import type { SystemsStatus } from '@/lib/lab/today/types'

type Tone = 'ok' | 'warn' | 'bad'

const DOT: Record<Tone, string> = {
    ok: 'lab-ping bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]',
    warn: 'bg-yellow-400 shadow-[0_0_10px_rgba(255,214,10,.7)]',
    bad: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,.7)]',
}

/** Sync starszy niż tyle minut = żółta kropka (komputer działa, ale dawno nie wysłał danych). */
const SYNC_WARN_MIN = 90

function Pill({ tone, label, hint }: { tone: Tone; label: string; hint: string }) {
    return (
        <span
            className="flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 ring-1 ring-white/[0.06]"
            title={`${label}: ${hint}`}
        >
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} />
            <span className="text-[11px] font-medium text-zinc-300">{label}</span>
        </span>
    )
}

export function SystemsStrip({ systems }: { systems: SystemsStatus }) {
    const sync = systems.syncMinutesAgo === null ? 'brak danych' : `sync ${systems.syncMinutesAgo} min temu`
    const pcTone: Tone = !systems.online
        ? 'bad'
        : systems.syncMinutesAgo !== null && systems.syncMinutesAgo > SYNC_WARN_MIN ? 'warn' : 'ok'
    return (
        <Link
            href="/lab/centrum"
            aria-label="Stan systemów studia"
            className="group flex flex-wrap items-center gap-2 self-start"
        >
            <Pill tone={pcTone} label="Komputer" hint={systems.online ? `działa, ${sync}` : `nie odpowiada, ${sync}`} />
            <Pill tone={systems.harveyOk ? 'ok' : 'bad'} label="Harvey" hint={systems.harveyOk ? 'działa' : 'nie działa'} />
            <Pill
                tone={systems.nightShift ? 'ok' : 'bad'}
                label="Nocna zmiana"
                hint={systems.nightShift ? `ostatnio ${systems.nightShift}` : 'brak śladu'}
            />
            {systems.outboxPending > 0 && (
                <span
                    className="flex items-center gap-1.5 rounded-full bg-yellow-400/15 px-2.5 py-1.5 text-[11px] font-semibold text-yellow-300"
                    title="Maile do zatwierdzenia"
                >
                    <Mail size={12} /> {systems.outboxPending}
                </span>
            )}
        </Link>
    )
}
