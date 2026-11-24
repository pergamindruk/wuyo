'use client'

// "use client": przyciski z natychmiastową zmianą stanu i komunikatem błędu.
import { useState, useTransition } from 'react'
import { Check, Undo2, X } from 'lucide-react'
import { decideMail, type Decision } from './actions'

const base = 'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50'

export function DecisionButtons({ id, current }: { id: string; current: Decision | null }) {
    const [pending, start] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const run = (d: Decision | null) => start(async () => {
        setError(null)
        const r = await decideMail(id, d)
        if (!r.ok) setError(r.error)
    })

    if (current) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${current === 'approve' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-zinc-300'}`}>
                    {current === 'approve' ? 'Zatwierdzony' : 'Odrzucony'}
                </span>
                <span className="text-xs text-zinc-500">trafi do Harveya przy najbliższym syncu</span>
                <button type="button" disabled={pending} onClick={() => run(null)}
                    className={`${base} bg-zinc-800 text-zinc-300`}>
                    <Undo2 size={14} /> Cofnij
                </button>
                {error && <span className="text-xs text-red-300">{error}</span>}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={pending} onClick={() => run('approve')}
                className={`${base} bg-yellow-400 font-bold text-zinc-950`}>
                <Check size={14} /> Zatwierdź
            </button>
            <button type="button" disabled={pending} onClick={() => run('reject')}
                className={`${base} bg-zinc-800 text-zinc-300 hover:text-red-300`}>
                <X size={14} /> Odrzuć
            </button>
            {error && <span className="text-xs text-red-300">{error}</span>}
        </div>
    )
}
