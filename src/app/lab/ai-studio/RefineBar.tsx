'use client'

// "use client": przyciski wywołują server action i podmieniają tekst w stanie rodzica.

import { useState, useTransition } from 'react'
import { Undo2, Wand2 } from 'lucide-react'
import { refineText } from './actions'

const MODES = [
    { id: 'krocej', label: 'Krócej' },
    { id: 'luzniej', label: 'Luźniej' },
    { id: 'oficjalniej', label: 'Oficjalniej' },
    { id: 'konkretniej', label: 'Konkretniej' },
    { id: 'bez_ceny', label: 'Bez ceny' },
    { id: 'whatsapp', label: 'Na WhatsApp' },
]

/** Szybkie poprawki gotowego tekstu jednym kliknięciem albo własnym poleceniem. */
export function RefineBar({ text, onResult }: { text: string; onResult: (t: string) => void }) {
    const [pending, start] = useTransition()
    const [custom, setCustom] = useState('')
    const [error, setError] = useState('')
    const [previous, setPrevious] = useState<string | null>(null)

    const run = (mode: string) => start(async () => {
        setError('')
        const res = await refineText(text, mode, custom)
        if (res.success) {
            setPrevious(text)
            onResult(res.data)
            setCustom('')
        } else {
            setError(res.error)
        }
    })

    return (
        <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.03] p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${pending ? 'animate-pulse bg-yellow-400/20 text-yellow-300' : 'bg-white/[0.06] text-zinc-400'}`}>
                    <Wand2 size={14} strokeWidth={1.8} />
                </span>
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        disabled={pending}
                        onClick={() => run(m.id)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-yellow-400/50 hover:text-white disabled:opacity-40"
                    >
                        {m.label}
                    </button>
                ))}
                {previous !== null && (
                    <button
                        type="button"
                        disabled={pending}
                        onClick={() => { onResult(previous); setPrevious(null) }}
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
                    >
                        <Undo2 size={12} strokeWidth={1.8} /> Cofnij
                    </button>
                )}
            </div>
            <form
                onSubmit={(e) => { e.preventDefault(); if (custom.trim()) run('wlasne') }}
                className="flex gap-2"
            >
                <input
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Własna poprawka, np. dodaj, że mamy wolny termin w listopadzie"
                    className="flex-1 px-3 py-2 text-xs text-white placeholder:text-zinc-600"
                />
                <button
                    type="submit"
                    disabled={pending || !custom.trim()}
                    className="bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 disabled:opacity-40"
                >
                    Popraw
                </button>
            </form>
            {error && <p className="rounded-xl bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        </div>
    )
}
