'use client'

// "use client": przyciski z natychmiastową zmianą stanu i komunikatem błędu.
import { useState, useTransition } from 'react'
import { Check, Undo2, X } from 'lucide-react'
import { decideMail, type Decision } from './actions'

const base = 'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50'

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
                <span className={`text-xs font-semibold ${current === 'approve' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {current === 'approve' ? 'Zatwierdzony' : 'Odrzucony'} · trafi do Harveya przy najbliższym syncu
                </span>
                <button type="button" disabled={pending} onClick={() => run(null)}
                    className={`${base} border border-zinc-700 text-zinc-300 hover:border-zinc-500`}>
                    <Undo2 size={12} /> Cofnij
                </button>
                {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={pending} onClick={() => run('approve')}
                className={`${base} bg-yellow-400 text-zinc-950 hover:bg-yellow-300`}>
                <Check size={12} /> Zatwierdź
            </button>
            <button type="button" disabled={pending} onClick={() => run('reject')}
                className={`${base} border border-zinc-700 text-zinc-300 hover:border-red-400/60 hover:text-red-300`}>
                <X size={12} /> Odrzuć
            </button>
            {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
    )
}
