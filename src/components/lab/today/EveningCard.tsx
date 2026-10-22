'use client'

// "use client" potrzebne: textarea ze stanem, przycisk wywołujący server action,
// stan zapisu (useTransition) i zegar sprawdzający porę dnia po stronie przeglądarki.

import { useEffect, useRef, useState, useTransition } from 'react'
import type { Activity } from '@/lib/lab/today/types'
import { saveDayNote } from '@/app/lab/dzis/evening-actions'

const EVENING_HOUR = 18
const MAX_NOTE_LENGTH = 2000

// Godzina w strefie studia, żeby serwer i przeglądarka pokazywały to samo.
const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    minute: '2-digit',
})

export function EveningCard({ todayActivities }: { todayActivities: Activity[] }) {
    const [text, setText] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)
    const [isPending, startTransition] = useTransition()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Start false, bo czas różni się między serwerem a przeglądarką. Ustawiamy po zamontowaniu,
    // żeby nie było błędu hydracji. Sprawdzamy co minutę.
    const [evening, setEvening] = useState(false)
    useEffect(() => {
        const check = () => setEvening(new Date().getHours() >= EVENING_HOUR)
        check()
        const id = setInterval(check, 60_000)
        return () => clearInterval(id)
    }, [])

    const phones = todayActivities.filter(a => a.kind === 'telefon').length
    const offers = todayActivities.filter(
        a => a.kind === 'oferta' || (a.kind === 'telefon' && a.outcome === 'chce_oferte'),
    ).length
    const payments = todayActivities.filter(a => a.kind === 'zaliczka' || a.kind === 'platnosc').length

    const lastNote = todayActivities
        .filter(a => a.kind === 'notatka_dnia')
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]

    function handleSubmit() {
        startTransition(async () => {
            setError(null)
            const result = await saveDayNote(text)
            if (result.ok) {
                setText('')
                setSaved(true)
            } else {
                setError(result.error)
            }
        })
    }

    return (
        <section
            className={`bg-zinc-900 rounded-xl p-5 min-w-0 border ${
                evening ? 'border-yellow-400/40' : 'border-zinc-800'
            }`}
        >
            <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Co dziś zrobiłeś dla WUYO?
            </h2>

            <p className="text-sm text-zinc-300 tabular-nums mb-4">
                Telefony: {phones} · Oferty: {offers} · Wpłaty: {payments}
            </p>

            {lastNote && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 mb-4">
                    <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-[11px] text-zinc-500 tabular-nums">
                            {timeFormatter.format(new Date(lastNote.created_at))}
                        </span>
                        <button
                            type="button"
                            onClick={() => textareaRef.current?.focus()}
                            className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300"
                        >
                            Dopisz
                        </button>
                    </div>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap break-words">{lastNote.note}</p>
                </div>
            )}

            <textarea
                ref={textareaRef}
                rows={3}
                maxLength={MAX_NOTE_LENGTH}
                value={text}
                disabled={isPending}
                onChange={e => {
                    setText(e.target.value)
                    setSaved(false)
                }}
                placeholder="Jedno zdanie: co zrobiłem, co jutro."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none disabled:opacity-50"
            />

            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

            <div className="flex items-center justify-between gap-3 mt-3">
                <span className="text-xs text-emerald-400 min-h-4">{saved && !error ? 'Zapisane' : ''}</span>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
                >
                    {isPending ? 'Zapisuję…' : 'Zapisz dzień'}
                </button>
            </div>
        </section>
    )
}
