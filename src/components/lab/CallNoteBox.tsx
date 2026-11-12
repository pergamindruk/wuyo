'use client'
// "use client": dwustopniowy formularz (notatka → podgląd propozycji AI do poprawy → zapis).

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { analyzeCallNote, applyCallNote } from '@/app/lab/rozmowy/actions'
import { CALL_NOTE_OUTCOMES, CALL_NOTE_OUTCOME_LABEL, type CallNoteAnalysis, type CallNoteOutcome } from '@/lib/lab/call-note'

const input = 'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none'

export function CallNoteBox({
    queueId,
    jobId,
    clientId,
    initialText = '',
    onApplied,
    compact = false,
}: {
    queueId?: string | null
    jobId?: string | null
    clientId?: string | null
    initialText?: string
    onApplied?: (wynik: CallNoteOutcome) => void
    compact?: boolean
}) {
    const [text, setText] = useState(initialText)
    const [noteId, setNoteId] = useState<string | null>(null)
    const [a, setA] = useState<CallNoteAnalysis | null>(null)
    const [step, setStep] = useState('')
    const [date, setDate] = useState('')
    const [wynik, setWynik] = useState<CallNoteOutcome>('brak')
    const [error, setError] = useState<string | null>(null)
    const [saved, setSaved] = useState<{ clientId: string | null } | null>(null)
    const [pending, start] = useTransition()

    function analyze() {
        setError(null)
        start(async () => {
            const res = await analyzeCallNote(text, { queueId, jobId, clientId })
            if (!res.ok) return setError(res.error)
            setNoteId(res.data.noteId)
            setA(res.data.analiza)
            setStep(res.data.analiza.nastepnyKrok)
            setDate(res.data.analiza.kontaktDnia ?? '')
            // Bez kolejki status nie ma czego zmieniać.
            setWynik(queueId ? res.data.analiza.proponowanyWynik : 'brak')
        })
    }

    function apply() {
        if (!noteId) return
        setError(null)
        start(async () => {
            const res = await applyCallNote(noteId, { nastepnyKrok: step, kontaktDnia: date || null, wynik })
            if (!res.ok) return setError(res.error)
            setSaved(res.data)
            onApplied?.(wynik)
        })
    }

    function reset() {
        setText('')
        setNoteId(null)
        setA(null)
        setSaved(null)
    }

    if (saved) {
        return (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 text-sm text-emerald-300">
                <p className="flex items-center gap-2 font-semibold"><Check size={16} /> Zapisane w historii i w zleceniu.</p>
                <div className="mt-2 flex gap-4 text-xs">
                    {saved.clientId && <Link href={`/lab/klienci/${saved.clientId}`} className="text-yellow-400 hover:text-yellow-300">Karta klienta</Link>}
                    <button type="button" onClick={reset} className="text-zinc-400 hover:text-white">Nowa notatka</button>
                </div>
            </div>
        )
    }

    return (
        <div className={compact ? '' : 'rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'}>
            {!a ? (
                <>
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-zinc-400">Notatka z rozmowy</span>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={compact ? 3 : 4}
                            placeholder="Co klient powiedział? Czego potrzebuje, kiedy, ile chce wydać, co dalej. Możesz dyktować z klawiatury telefonu."
                            className={`${input} resize-y text-base`}
                        />
                    </label>
                    <button
                        type="button"
                        disabled={pending || text.trim().length < 15}
                        onClick={analyze}
                        className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-40"
                    >
                        <Sparkles size={15} /> {pending ? 'Rozpisuję… (ok. 10 s)' : 'Rozpisz i zaproponuj krok'}
                    </button>
                </>
            ) : (
                <div className="flex flex-col gap-3 text-sm">
                    <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
                        {a.potrzeba && <><dt className="text-zinc-500">Potrzeba</dt><dd className="text-white">{a.potrzeba}</dd></>}
                        {a.uslugi.length > 0 && <><dt className="text-zinc-500">Usługi</dt><dd className="text-white">{a.uslugi.join(', ')}</dd></>}
                        <dt className="text-zinc-500">Budżet</dt><dd className="text-white">{a.budzet ?? <span className="text-zinc-600">nie padł</span>}</dd>
                        {a.termin && <><dt className="text-zinc-500">Termin</dt><dd className="text-white">{a.termin}</dd></>}
                        {a.obiekcje.length > 0 && <><dt className="text-zinc-500">Obiekcje</dt><dd className="text-white">{a.obiekcje.join('; ')}</dd></>}
                    </dl>
                    {a.niepewne.length > 0 && (
                        <ul className="rounded-xl border border-yellow-400/20 bg-yellow-400/[0.05] p-3 text-xs text-yellow-200">
                            {a.niepewne.map((x) => <li key={x}>• {x}</li>)}
                        </ul>
                    )}
                    <label className="block">
                        <span className="mb-1 block text-xs text-zinc-500">Następny krok</span>
                        <input value={step} onChange={(e) => setStep(e.target.value)} className={input} />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1 block text-xs text-zinc-500">Kiedy kontakt</span>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
                        </label>
                        {queueId && (
                            <label className="block">
                                <span className="mb-1 block text-xs text-zinc-500">Wynik rozmowy</span>
                                <select value={wynik} onChange={(e) => setWynik(e.target.value as CallNoteOutcome)} className={input}>
                                    {CALL_NOTE_OUTCOMES.map((o) => <option key={o} value={o}>{CALL_NOTE_OUTCOME_LABEL[o]}</option>)}
                                </select>
                            </label>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" disabled={pending} onClick={apply} className="min-h-11 rounded-xl bg-yellow-400 px-4 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                            {pending ? 'Zapisuję…' : 'Zapisz'}
                        </button>
                        <button type="button" onClick={() => { setA(null); setNoteId(null) }} className="min-h-11 px-3 text-sm text-zinc-400 hover:text-white">
                            Popraw notatkę
                        </button>
                    </div>
                </div>
            )}
            {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
    )
}
