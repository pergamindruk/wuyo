'use client'
// "use client": mały formularz w miejscu (otwórz, wpisz ocenę i powód, zapisz bez przeładowania).

import { useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'
import { setManualScore } from '@/app/lab/dzis/actions'

export function ScoreEditor({
    queueId,
    score,
    manualReason,
    onSaved,
}: {
    queueId: string
    score: number
    manualReason?: string | null
    onSaved?: (score: number, reason: string) => void
}) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(String(score))
    const [reason, setReason] = useState(manualReason ?? '')
    const [error, setError] = useState<string | null>(null)
    const [pending, start] = useTransition()

    function save() {
        setError(null)
        start(async () => {
            const res = await setManualScore(queueId, Number(value), reason)
            if (res.ok) {
                setOpen(false)
                onSaved?.(Math.round(Number(value)), reason.trim())
            } else {
                setError(res.error)
            }
        })
    }

    if (!open) {
        return (
            <span className="inline-flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full border border-zinc-700 px-2 py-0.5 font-semibold text-zinc-300">{score} pkt</span>
                {manualReason && <span title={manualReason}>ręcznie: {manualReason}</span>}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        setOpen(true)
                    }}
                    className="inline-flex min-h-8 items-center gap-1 text-zinc-500 hover:text-yellow-400"
                >
                    <Pencil size={12} /> Zmień ocenę
                </button>
            </span>
        )
    }

    return (
        <div className="mt-2 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
                type="number"
                min={0}
                max={100}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label="Ocena 0–100"
                className="min-h-10 w-20 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-sm text-white focus:border-yellow-400/60 focus:outline-none"
            />
            <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Dlaczego? np. znam właściciela"
                aria-label="Powód zmiany oceny"
                className="min-h-10 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none"
            />
            <button
                type="button"
                disabled={pending}
                onClick={save}
                className="min-h-10 rounded-lg bg-yellow-400 px-3 text-sm font-bold text-zinc-950 disabled:opacity-50"
            >
                {pending ? 'Zapisuję…' : 'Zapisz'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="min-h-10 px-2 text-sm text-zinc-500 hover:text-white">
                Anuluj
            </button>
            {error && <p role="alert" className="basis-full text-xs text-red-400">{error}</p>}
        </div>
    )
}
