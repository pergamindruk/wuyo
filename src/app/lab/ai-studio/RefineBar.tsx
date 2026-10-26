'use client'

// "use client": przyciski wywołują server action i podmieniają tekst w stanie rodzica.

import { useState, useTransition } from 'react'
import { Wand2 } from 'lucide-react'
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
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
                <Wand2 size={14} className={pending ? 'animate-pulse text-yellow-400' : 'text-zinc-500'} />
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        disabled={pending}
                        onClick={() => run(m.id)}
                        className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-yellow-400/60 hover:text-white disabled:opacity-40"
                    >
                        {m.label}
                    </button>
                ))}
                {previous !== null && (
                    <button
                        type="button"
                        disabled={pending}
                        onClick={() => { onResult(previous); setPrevious(null) }}
                        className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
                    >
                        Cofnij
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
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-yellow-400/50 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={pending || !custom.trim()}
                    className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                >
                    Popraw
                </button>
            </form>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    )
}
