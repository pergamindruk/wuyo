'use client'
// "use client": kolejka telefonów jest w pełni interaktywna — stan bieżącej karty,
// skróty klawiszowe 1–4 / S, optymistyczne przejście do następnej firmy, formularz.

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { CalendarClock, ChevronDown, ExternalLink, Phone, Plus, Search, SkipForward, Sparkles } from 'lucide-react'
import { CALL_OPENERS, OUTCOMES, SOURCE_LABEL } from '@/lib/lab/today/constants'
import { telHref } from '@/lib/lab/today/format'
import type { CallOutcome, QueueItem } from '@/lib/lab/today/types'
import { addManualQueueItem, recordCallOutcome } from '@/app/lab/dzis/actions'

const TONE: Record<string, string> = {
    zinc: 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
    red: 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20',
    yellow: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20',
    emerald: 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25',
}

function inDays(days: number): string {
    const d = new Date()
    d.setDate(d.getDate() + days)
    d.setHours(9, 0, 0, 0)
    return d.toISOString()
}

function siteHref(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function CallQueue({ initialItems }: { initialItems: QueueItem[] }) {
    const [items, setItems] = useState<QueueItem[]>(initialItems)
    const [seen, setSeen] = useState<Set<string>>(() => new Set(initialItems.map((i) => i.id)))
    const [note, setNote] = useState('')
    const [openerOpen, setOpenerOpen] = useState(false)
    const [picking, setPicking] = useState(false)
    const [pickDate, setPickDate] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [formPending, startForm] = useTransition()
    const formRef = useRef<HTMLFormElement>(null)

    // Nowe firmy z serwera (np. po dodaniu ręcznym) dopisz na koniec, bez resetu stanu karty.
    const fresh = initialItems.filter((i) => !seen.has(i.id))
    if (fresh.length > 0) {
        setSeen(new Set([...seen, ...fresh.map((i) => i.id)]))
        setItems([...items, ...fresh])
    }

    const current = items[0]

    const advance = useCallback(() => {
        setNote('')
        setOpenerOpen(false)
        setPicking(false)
        setPickDate('')
    }, [])

    const submit = useCallback(
        (outcome: CallOutcome, callbackAt?: string) => {
            if (!current) return
            const item = current
            const savedNote = note
            setError(null)
            setItems((prev) => prev.filter((i) => i.id !== item.id))
            advance()
            void recordCallOutcome(item.id, outcome, { note: savedNote, callbackAt }).then((res) => {
                if (!res.ok) {
                    setError(res.error)
                    setItems((prev) => [item, ...prev])
                    setNote(savedNote)
                }
            })
        },
        [current, note, advance],
    )

    const choose = useCallback(
        (outcome: CallOutcome) => {
            if (outcome === 'oddzwonic') setPicking(true)
            else submit(outcome)
        },
        [submit],
    )

    const skip = useCallback(() => {
        setItems((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev))
        advance()
    }, [advance])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            const t = e.target as HTMLElement | null
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
            if (e.ctrlKey || e.metaKey || e.altKey || !current || picking) return
            const out = OUTCOMES.find((o) => o.hotkey === e.key)
            if (out) {
                e.preventDefault()
                choose(out.key)
            } else if (e.key.toLowerCase() === 's') {
                e.preventDefault()
                skip()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [current, picking, choose, skip])

    function onAdd(formData: FormData) {
        setError(null)
        startForm(async () => {
            const res = await addManualQueueItem(formData)
            if (res.ok) {
                formRef.current?.reset()
                setShowForm(false)
            } else {
                setError(res.error)
            }
        })
    }

    return (
        <section id="kolejka" className="scroll-mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-7">
            <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Kolejka telefonów</p>
                {current && (
                    <p className="text-xs text-zinc-500">
                        Zostało <strong className="text-white">{items.length}</strong> na dziś
                    </p>
                )}
            </div>

            {error && (
                <p role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                </p>
            )}

            {current ? (
                <div className="mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">
                            {SOURCE_LABEL[current.source]}
                        </span>
                        {current.industry && <span className="text-sm text-zinc-500">{current.industry}</span>}
                        {current.attempts > 0 && <span className="text-xs text-zinc-600">próba {current.attempts + 1}</span>}
                    </div>

                    <h2 className="mt-3 break-words text-3xl font-bold leading-tight text-white sm:text-4xl">{current.name}</h2>
                    {current.reason && <p className="mt-2 text-sm text-zinc-400">{current.reason}</p>}

                    {current.problems.length > 0 && (
                        <ul className="mt-3 flex flex-col gap-1 text-sm text-zinc-400">
                            {current.problems.map((p) => (
                                <li key={p} className="flex gap-2">
                                    <span className="text-red-400">•</span>
                                    {p}
                                </li>
                            ))}
                        </ul>
                    )}

                    {current.website && (
                        <a
                            href={siteHref(current.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 break-all text-sm text-zinc-400 underline-offset-2 hover:text-yellow-400 hover:underline"
                        >
                            {current.website} <ExternalLink size={13} className="shrink-0" />
                        </a>
                    )}

                    {current.phone ? (
                        <a
                            href={telHref(current.phone)}
                            className="mt-5 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-yellow-400 px-4 text-2xl font-bold text-zinc-950 transition-colors hover:bg-yellow-300 sm:w-auto sm:inline-flex sm:px-10"
                        >
                            <Phone size={24} /> {current.phone}
                        </a>
                    ) : (
                        // CEIDG nie podaje telefonu — numer trzeba znaleźć w Google.
                        <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(`${current.name} Rzeszów telefon`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl border border-yellow-400/60 px-4 text-lg font-bold text-yellow-300 transition-colors hover:bg-yellow-400/10 sm:w-auto sm:inline-flex sm:px-10"
                        >
                            <Search size={22} /> Brak numeru — szukaj w Google
                        </a>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-5">
                        <Link
                            href={`/lab/ai-studio?tab=telefon&firma=${encodeURIComponent(current.id)}`}
                            className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-yellow-400 hover:text-yellow-300"
                        >
                            <Sparkles size={15} /> Ściągawka do rozmowy (AI)
                        </Link>
                        <button
                            type="button"
                            onClick={() => setOpenerOpen((v) => !v)}
                            aria-expanded={openerOpen}
                            className="flex min-h-11 items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
                        >
                            <ChevronDown size={16} className={`transition-transform ${openerOpen ? 'rotate-180' : ''}`} />
                            Jak zacząć rozmowę
                        </button>
                        {openerOpen && (
                            <p className="mt-1 basis-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-relaxed text-zinc-300">
                                {CALL_OPENERS[current.source]}
                            </p>
                        )}
                    </div>

                    <label className="mt-3 block">
                        <span className="sr-only">Notatka z rozmowy</span>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="Notatka z rozmowy (opcjonalnie)"
                            className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-base text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none"
                        />
                    </label>

                    {picking ? (
                        <div className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-yellow-300">
                                <CalendarClock size={16} /> Kiedy oddzwonić?
                            </p>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Jutro', days: 1 },
                                    { label: 'Za 3 dni', days: 3 },
                                    { label: 'Za tydzień', days: 7 },
                                ].map((o) => (
                                    <button
                                        key={o.days}
                                        type="button"
                                        onClick={() => submit('oddzwonic', inDays(o.days))}
                                        className="min-h-12 rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-2 text-sm font-semibold text-yellow-200 hover:bg-yellow-400/20"
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="date"
                                    value={pickDate}
                                    onChange={(e) => setPickDate(e.target.value)}
                                    aria-label="Własna data oddzwonienia"
                                    className="min-h-12 min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-white focus:border-yellow-400/60 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    disabled={!pickDate}
                                    onClick={() => submit('oddzwonic', new Date(`${pickDate}T09:00:00`).toISOString())}
                                    className="min-h-12 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-zinc-950 disabled:opacity-40"
                                >
                                    Zapisz
                                </button>
                            </div>
                            <button type="button" onClick={() => setPicking(false)} className="mt-2 min-h-11 text-sm text-zinc-500 hover:text-white">
                                Wróć
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {OUTCOMES.map((o) => (
                                <button
                                    key={o.key}
                                    type="button"
                                    onClick={() => choose(o.key)}
                                    className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-base font-semibold transition-colors ${TONE[o.tone] ?? TONE.zinc}`}
                                >
                                    <kbd className="hidden rounded bg-black/30 px-1.5 text-xs font-mono sm:inline">{o.hotkey}</kbd>
                                    {o.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {!picking && items.length > 1 && (
                        <button
                            type="button"
                            onClick={skip}
                            className="mt-3 flex min-h-11 items-center gap-2 text-sm text-zinc-500 hover:text-white"
                        >
                            <SkipForward size={15} /> Pomiń
                            <kbd className="hidden rounded bg-zinc-800 px-1.5 text-xs font-mono sm:inline">S</kbd>
                        </button>
                    )}
                </div>
            ) : (
                <div className="py-10 text-center">
                    <p className="text-2xl font-bold text-white">Na dziś wszystko. Wróć jutro.</p>
                    <p className="mt-2 text-sm text-zinc-500">Kolejka jest pusta.</p>
                    <Link
                        href="/lab/centrum"
                        className="mt-5 inline-flex min-h-12 items-center rounded-xl border border-zinc-700 px-5 text-sm font-semibold text-zinc-200 hover:border-yellow-400/50"
                    >
                        Centrum Dowodzenia
                    </Link>
                </div>
            )}

            <div className="mt-6 border-t border-zinc-800 pt-4">
                <button
                    type="button"
                    onClick={() => setShowForm((v) => !v)}
                    className="flex min-h-11 items-center gap-2 text-sm text-zinc-400 hover:text-yellow-400"
                >
                    <Plus size={16} /> Dodaj firmę ręcznie
                </button>
                {showForm && (
                    <form ref={formRef} action={onAdd} className="mt-3 grid gap-2 sm:grid-cols-2">
                        <input name="name" required placeholder="Nazwa firmy" className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none" />
                        <input name="phone" required type="tel" inputMode="tel" placeholder="Telefon" className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none" />
                        <input name="industry" placeholder="Branża" className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none" />
                        <input name="note" placeholder="Notatka" className="min-h-12 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-base text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none" />
                        <button
                            type="submit"
                            disabled={formPending}
                            className="min-h-12 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-zinc-950 disabled:opacity-50 sm:col-span-2"
                        >
                            {formPending ? 'Dodaję…' : 'Dodaj do kolejki'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    )
}
