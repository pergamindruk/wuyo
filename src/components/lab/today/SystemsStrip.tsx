import Link from 'next/link'
import type { SystemsStatus } from '@/lib/lab/today/types'

function Dot({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
    return (
        <span className="flex items-center gap-1.5" title={`${label}: ${hint}`}>
            <span className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-500'}`} />
            <span className="hidden text-[11px] text-zinc-500 sm:inline">{label}</span>
        </span>
    )
}

export function SystemsStrip({ systems }: { systems: SystemsStatus }) {
    const sync = systems.syncMinutesAgo === null ? 'brak danych' : `sync ${systems.syncMinutesAgo} min temu`
    return (
        <Link
            href="/lab/centrum"
            aria-label="Stan systemów studia"
            className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 transition-colors hover:border-zinc-700"
        >
            <Dot ok={systems.online} label="Komputer" hint={systems.online ? `działa, ${sync}` : `nie odpowiada, ${sync}`} />
            <Dot ok={systems.harveyOk} label="Harvey" hint={systems.harveyOk ? 'działa' : 'nie działa'} />
            <Dot
                ok={!!systems.nightShift}
                label="Nocna zmiana"
                hint={systems.nightShift ? `ostatnio ${systems.nightShift}` : 'brak śladu'}
            />
            {systems.outboxPending > 0 && (
                <span className="rounded-full bg-yellow-400 px-1.5 text-[10px] font-bold text-zinc-950" title="Maile do zatwierdzenia">
                    {systems.outboxPending}
                </span>
            )}
        </Link>
    )
}
