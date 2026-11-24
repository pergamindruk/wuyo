'use client'
// "use client": kolejka telefonów jest w pełni interaktywna: stan bieżącej karty,
// skróty klawiszowe 1–4 / S, optymistyczne przejście do następnej firmy, formularz.

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { CalendarClock, ChevronDown, ExternalLink, Phone, PhoneOff, Plus, Radar, Search, SkipForward, Sparkles } from 'lucide-react'
import { CALL_OPENERS, OUTCOMES, SOURCE_LABEL } from '@/lib/lab/today/constants'
import { telHref } from '@/lib/lab/today/format'
import type { CallOutcome, QueueItem } from '@/lib/lab/today/types'
import { addManualQueueItem, recordCallOutcome } from '@/app/lab/dzis/actions'
import { ScoreEditor } from '@/components/lab/ScoreEditor'
import { CallNoteBox } from '@/components/lab/CallNoteBox'

const TONE: Record<string, string> = {
    zinc: 'border-white/10 bg-white/[0.05] text-zinc-100 hover:bg-white/[0.09]',
    red: 'border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20',
    yellow: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20',
    emerald: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25',
}

/** Kolor kafelka z punktacją: wysoka zielona, średnia żółta, niska pomarańczowa. */
function scoreTone(score: number): string {
    if (score >= 85) return 'bg-emerald-400 text-zinc-950 shadow-[0_8px_22px_-10px_rgba(52,211,153,.8)]'
    if (score >= 70) return 'bg-yellow-400 text-zinc-950 shadow-[0_8px_22px_-10px_rgba(255,214,10,.8)]'
    return 'bg-orange-400 text-zinc-950 shadow-[0_8px_22px_-10px_rgba(251,146,60,.8)]'
}

/** Ile firm pokazać w siatce kafelków (reszta jako licznik). */
const GRID_LIMIT = 6

const FIELD = 'min-h-12 w-full rounded-xl px-3 text-base text-white placeholder:text-zinc-600'

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
    const [noteBox, setNoteBox] = useState(false)
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

    // Klik w kafelek: ta firma staje się bieżąca (reszta kolejności bez zmian).
    const focus = useCallback(
        (id: string) => {
            setItems((prev) => {
                const hit = prev.find((i) => i.id === id)
                return hit && prev[0]?.id !== id ? [hit, ...prev.filter((i) => i.id !== id)] : prev
            })
            advance()
        },
        [advance],
    )

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

    const grid = items.slice(0, GRID_LIMIT)
    const more = items.length - grid.length

    return (
        <section id="kolejka" className="lab-card scroll-mt-4 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2.5 text-base font-bold text-white sm:text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Phone size={16} strokeWidth={1.8} /></span>
                    Kolejka telefonów
                </h2>
                {current && (
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                        Zostało <strong className="text-white">{items.length}</strong> na dziś
                    </span>
                )}
            </div>

            {error && (
                <p role="alert" className="mb-3 rounded-2xl bg-red-400/10 px-4 py-2.5 text-sm text-red-300">
                    {error}
                </p>
            )}

            {current ? (
                <>
                    {/* Siatka firm: nazwa, branża, punktacja, telefon. Klik w nazwę = ta firma teraz. */}
                    <ul className="grid gap-2.5 sm:grid-cols-2">
                        {grid.map((it, idx) => {
                            const active = idx === 0
                            return (
                                <li
                                    key={it.id}
                                    className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 transition ${
                                        active ? 'bg-yellow-400/[0.07] ring-1 ring-yellow-400/40' : 'bg-white/[0.03] hover:bg-white/[0.06]'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => focus(it.id)}
                                        aria-current={active ? 'true' : undefined}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <span className="block truncate text-sm font-semibold text-white sm:text-base">{it.name}</span>
                                        <span className="mt-1 inline-flex max-w-full truncate rounded-md border border-white/10 px-1.5 py-px text-[11px] text-zinc-400">
                                            {it.industry || SOURCE_LABEL[it.source]}
                                        </span>
                                    </button>
                                    <span className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-xl px-1.5 text-sm font-bold ${scoreTone(it.score)}`} title="Punktacja firmy">
                                        {it.score}
                                    </span>
                                    {it.phone ? (
                                        <a
                                            href={telHref(it.phone)}
                                            aria-label={`Zadzwoń: ${it.name}`}
                                            title={it.phone}
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-zinc-950"
                                        >
                                            <Phone size={18} strokeWidth={2} />
                                        </a>
                                    ) : (
                                        <a
                                            href={`https://www.google.com/search?q=${encodeURIComponent(`${it.name} Rzeszów telefon`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Szukaj numeru: ${it.name}`}
                                            title="Brak numeru, szukaj w Google"
                                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-yellow-400/50 text-yellow-300 transition hover:bg-yellow-400/10"
                                        >
                                            <Search size={17} />
                                        </a>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                    {more > 0 && <p className="mt-2 text-xs text-zinc-500">i jeszcze {more} w kolejce</p>}

                    {/* Bieżąca firma: szczegóły i wynik rozmowy (skróty 1–4, S). */}
                    <div className="mt-5 rounded-[1.5rem] bg-white/[0.03] p-4 ring-1 ring-white/[0.06] sm:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">
                                {SOURCE_LABEL[current.source]}
                            </span>
                            {current.industry && <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">{current.industry}</span>}
                            {current.attempts > 0 && <span className="text-xs text-zinc-500">próba {current.attempts + 1}</span>}
                            <ScoreEditor
                                key={current.id}
                                queueId={current.id}
                                score={current.score}
                                manualReason={current.score_manual_reason}
                                onSaved={(score, reason) =>
                                    setItems((prev) => prev.map((i) => (i.id === current.id ? { ...i, score, score_manual: score, score_manual_reason: reason } : i)))
                                }
                            />
                            {current.client_id && (
                                <Link href={`/lab/klienci/${current.client_id}`} className="text-xs font-medium text-yellow-400 hover:text-yellow-300">
                                    Karta klienta
                                </Link>
                            )}
                        </div>

                        <h3 className="mt-3 break-words font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">{current.name}</h3>
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
                                className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-yellow-400 px-4 text-xl font-bold text-zinc-950 sm:inline-flex sm:w-auto sm:px-10"
                            >
                                <Phone size={22} /> {current.phone}
                            </a>
                        ) : (
                            // CEIDG nie podaje telefonu, numer trzeba znaleźć w Google.
                            <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(`${current.name} Rzeszów telefon`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-yellow-400/60 px-4 text-base font-bold text-yellow-300 transition-colors hover:bg-yellow-400/10 sm:inline-flex sm:w-auto sm:px-10"
                            >
                                <Search size={20} /> Brak numeru, szukaj w Google
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
                                <p className="mt-1 basis-full rounded-2xl bg-white/[0.04] p-4 text-sm leading-relaxed text-zinc-300">
                                    {CALL_OPENERS[current.source]}
                                </p>
                            )}
                        </div>

                        <label className={`mt-3 ${noteBox ? 'hidden' : 'block'}`}>
                            <span className="sr-only">Notatka z rozmowy</span>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                placeholder="Notatka z rozmowy (opcjonalnie)"
                                className="w-full resize-none rounded-xl p-3 text-base text-white placeholder:text-zinc-600"
                            />
                        </label>

                        {!picking && (
                            <button
                                type="button"
                                onClick={() => setNoteBox((v) => !v)}
                                className="mt-1 flex min-h-11 items-center gap-1.5 text-sm text-zinc-400 hover:text-yellow-400"
                            >
                                <Sparkles size={14} /> {noteBox ? 'Schowaj rozpisywanie' : 'Dłuższa rozmowa? Rozpisz notatkę na następny krok'}
                            </button>
                        )}
                        {noteBox && !picking && (
                            <div className="mt-2">
                                <CallNoteBox
                                    key={current.id}
                                    queueId={current.id}
                                    jobId={current.job_id}
                                    clientId={current.client_id}
                                    initialText={note}
                                    onApplied={(wynik) => {
                                        if (wynik !== 'brak') {
                                            setItems((prev) => prev.filter((i) => i.id !== current.id))
                                            advance()
                                            setNoteBox(false)
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {picking ? (
                            <div className="mt-4 rounded-2xl bg-yellow-400/[0.06] p-4 ring-1 ring-yellow-400/30">
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
                                            className="min-h-12 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-2 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/20"
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
                                        className="min-h-12 min-w-0 flex-1 rounded-xl px-3 text-base text-white"
                                    />
                                    <button
                                        type="button"
                                        disabled={!pickDate}
                                        onClick={() => submit('oddzwonic', new Date(`${pickDate}T09:00:00`).toISOString())}
                                        className="min-h-12 rounded-full bg-yellow-400 px-5 text-sm font-bold text-zinc-950 disabled:opacity-40"
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
                                        className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border px-3 text-base font-semibold transition-colors ${TONE[o.tone] ?? TONE.zinc}`}
                                    >
                                        <kbd className="hidden rounded-md bg-black/30 px-1.5 font-mono text-xs sm:inline">{o.hotkey}</kbd>
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
                                <kbd className="hidden rounded-md bg-white/[0.08] px-1.5 font-mono text-xs sm:inline">S</kbd>
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center py-10 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400">
                        <PhoneOff size={22} strokeWidth={1.8} />
                    </span>
                    <p className="mt-4 font-heading text-2xl font-bold text-white">Na dziś wszystko. Wróć jutro.</p>
                    <p className="mt-2 text-sm text-zinc-500">Kolejka jest pusta.</p>
                    <Link
                        href="/lab/centrum"
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-sm font-semibold text-zinc-200 hover:text-white"
                    >
                        <Radar size={16} /> Centrum Dowodzenia
                    </Link>
                </div>
            )}

            <div className="mt-6 border-t border-white/[0.06] pt-4">
                <button
                    type="button"
                    onClick={() => setShowForm((v) => !v)}
                    className="flex min-h-11 items-center gap-2 text-sm text-zinc-400 hover:text-yellow-400"
                >
                    <Plus size={16} /> Dodaj firmę ręcznie
                </button>
                {showForm && (
                    <form ref={formRef} action={onAdd} className="mt-3 grid gap-2 sm:grid-cols-2">
                        <input name="name" required placeholder="Nazwa firmy" className={FIELD} />
                        <input name="phone" required type="tel" inputMode="tel" placeholder="Telefon" className={FIELD} />
                        <input name="industry" placeholder="Branża" className={FIELD} />
                        <input name="note" placeholder="Notatka" className={FIELD} />
                        <button
                            type="submit"
                            disabled={formPending}
                            className="min-h-12 rounded-full bg-yellow-400 px-5 text-sm font-bold text-zinc-950 disabled:opacity-50 sm:col-span-2"
                        >
                            {formPending ? 'Dodaję…' : 'Dodaj do kolejki'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    )
}
