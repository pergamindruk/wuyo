'use client'

// "use client" potrzebne: textarea ze stanem, przycisk wywołujący server action,
// stan zapisu (useTransition) i zegar sprawdzający porę dnia po stronie przeglądarki.

import { useEffect, useRef, useState, useTransition } from 'react'
import { Check, FileSignature, Moon, Phone, Wallet } from 'lucide-react'
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

    const counters = [
        { label: 'Telefony', value: phones, icon: Phone },
        { label: 'Oferty', value: offers, icon: FileSignature },
        { label: 'Wpłaty', value: payments, icon: Wallet },
    ]

    return (
        <section className={`lab-card flex min-w-0 flex-col p-5 sm:p-6 ${evening ? 'ring-1 ring-yellow-400/40' : ''}`}>
            {evening && <span className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-yellow-400/15 blur-2xl" />}
            <h2 className="mb-4 flex items-center gap-2.5 text-base font-bold text-white">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${evening ? 'lab-chip' : 'bg-yellow-400/10 text-yellow-400'}`}>
                    <Moon size={16} strokeWidth={1.8} />
                </span>
                Co dziś zrobiłeś dla WUYO?
            </h2>

            <div className="mb-4 grid grid-cols-3 gap-2">
                {counters.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-2xl bg-white/[0.03] px-3 py-2.5">
                        <p className="flex items-center gap-1.5 text-[11px] text-zinc-500"><Icon size={12} /> {label}</p>
                        <p className="mt-1 font-heading text-xl font-bold leading-none text-white tabular-nums">{value}</p>
                    </div>
                ))}
            </div>

            {lastNote && (
                <div className="mb-4 rounded-2xl bg-white/[0.04] p-3.5">
                    <div className="mb-1 flex items-center justify-between gap-3">
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
                    <p className="whitespace-pre-wrap break-words text-sm text-zinc-200">{lastNote.note}</p>
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
                className="w-full resize-none rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 disabled:opacity-50"
            />

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

            <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                <span className="flex min-h-4 items-center gap-1 text-xs text-emerald-400">
                    {saved && !error ? <><Check size={13} /> Zapisane</> : ''}
                </span>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-yellow-400 px-5 text-sm font-bold text-zinc-950 disabled:opacity-50"
                >
                    {isPending ? 'Zapisuję…' : 'Zapisz dzień'}
                </button>
            </div>
        </section>
    )
}
