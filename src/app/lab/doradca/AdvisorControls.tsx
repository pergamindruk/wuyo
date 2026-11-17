'use client'

// Wyspa kliencka: formularze i przyciski wierszy (stan pól, oczekiwanie na zapis, komunikat błędu).
// Lista i liczby renderują się na serwerze w page.tsx.

import { useState, useTransition } from 'react'
import { Check, RotateCcw, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { addCost, addDeadline, addFact, addTask, deleteCost, deleteDeadline, deleteFact, deleteTask, retryTask, setDeadlineDone, toggleGrant } from './actions'

const input = 'rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none'
const button = 'rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50'
const iconBtn = 'rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-white disabled:opacity-40'

type Result = { ok: true } | { ok: false; error: string }

function useAction() {
    const [pending, start] = useTransition()
    const run = (fn: () => Promise<Result>, onOk?: () => void) =>
        start(async () => {
            const r = await fn()
            if (r.ok) onOk?.()
            else toast.error(r.error)
        })
    return { pending, run }
}

export function CostForm({ defaultDate }: { defaultDate: string }) {
    const { pending, run } = useAction()
    const [f, setF] = useState({ data: defaultDate, kwota: '', opis: '', sprzedawca: '', zDotacji: false })
    return (
        <form
            className="mt-5 flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
                e.preventDefault()
                run(() => addCost(f), () => {
                    setF({ ...f, kwota: '', opis: '', sprzedawca: '', zDotacji: false })
                    toast.success('Koszt zapisany')
                })
            }}
        >
            <input type="date" required value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} className={input} aria-label="Data" />
            <input required inputMode="decimal" placeholder="Kwota, np. 240,50" value={f.kwota} onChange={(e) => setF({ ...f, kwota: e.target.value })} className={`${input} w-40`} aria-label="Kwota brutto" />
            <input required placeholder="Co kupiłeś" value={f.opis} onChange={(e) => setF({ ...f, opis: e.target.value })} className={`${input} min-w-48 flex-1`} aria-label="Opis" />
            <input placeholder="Sklep (opcjonalnie)" value={f.sprzedawca} onChange={(e) => setF({ ...f, sprzedawca: e.target.value })} className={`${input} w-44`} aria-label="Sprzedawca" />
            <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input type="checkbox" checked={f.zDotacji} onChange={(e) => setF({ ...f, zDotacji: e.target.checked })} className="accent-yellow-400" />
                z dotacji
            </label>
            <button type="submit" disabled={pending} className={button}>Dodaj</button>
        </form>
    )
}

export function CostRowActions({ id, zDotacji }: { id: string; zDotacji: boolean }) {
    const { pending, run } = useAction()
    return (
        <span className="flex shrink-0 items-center gap-1">
            <button
                type="button"
                disabled={pending}
                onClick={() => run(() => toggleGrant(id, !zDotacji))}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${zDotacji ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                title="Zakup opłacony z dotacji nie idzie w koszty podatkowe"
            >
                {zDotacji ? 'z dotacji' : 'zwykły'}
            </button>
            <button
                type="button"
                disabled={pending}
                onClick={() => {
                    if (confirm('Usunąć ten koszt?')) run(() => deleteCost(id))
                }}
                className={iconBtn}
                aria-label="Usuń koszt"
            >
                <Trash2 size={15} />
            </button>
        </span>
    )
}

export function DeadlineForm({ defaultDate }: { defaultDate: string }) {
    const { pending, run } = useAction()
    const [data, setData] = useState(defaultDate)
    const [tytul, setTytul] = useState('')
    return (
        <form
            className="mt-4 flex flex-wrap gap-2"
            onSubmit={(e) => {
                e.preventDefault()
                run(() => addDeadline(data, tytul), () => setTytul(''))
            }}
        >
            <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className={input} aria-label="Data" />
            <input required placeholder="Czego pilnować" value={tytul} onChange={(e) => setTytul(e.target.value)} className={`${input} min-w-40 flex-1`} aria-label="Termin" />
            <button type="submit" disabled={pending} className={button}>Dodaj</button>
        </form>
    )
}

export function DeadlineRowActions({ id, zrobione }: { id: string; zrobione: boolean }) {
    const { pending, run } = useAction()
    return (
        <span className="flex shrink-0 items-center gap-1">
            <button type="button" disabled={pending} onClick={() => run(() => setDeadlineDone(id, !zrobione))} className={iconBtn} aria-label={zrobione ? 'Przywróć' : 'Oznacz jako zrobione'}>
                {zrobione ? <Undo2 size={15} /> : <Check size={15} />}
            </button>
            <button
                type="button"
                disabled={pending}
                onClick={() => {
                    if (confirm('Usunąć ten termin?')) run(() => deleteDeadline(id))
                }}
                className={iconBtn}
                aria-label="Usuń termin"
            >
                <Trash2 size={15} />
            </button>
        </span>
    )
}

export function TaskForm() {
    const { pending, run } = useAction()
    const [tresc, setTresc] = useState('')
    const [termin, setTermin] = useState('')
    return (
        <form
            className="mt-4 flex flex-col gap-2"
            onSubmit={(e) => {
                e.preventDefault()
                run(() => addTask(tresc, termin), () => {
                    setTresc('')
                    setTermin('')
                    toast.success('Zadanie w kolejce. Komputer weźmie je po włączeniu.')
                })
            }}
        >
            <textarea
                required
                rows={2}
                placeholder="Np. Przygotuj 3 posty o tym, jak przygotować logo do druku. Szkice do pliku z wynikiem."
                value={tresc}
                onChange={(e) => setTresc(e.target.value)}
                className={`${input} w-full resize-y`}
                aria-label="Opis zadania"
            />
            <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                    Nie wcześniej niż
                    <input type="date" value={termin} onChange={(e) => setTermin(e.target.value)} className={input} aria-label="Najwcześniejszy dzień" />
                </label>
                <button type="submit" disabled={pending} className={button}>Dodaj zadanie</button>
            </div>
        </form>
    )
}

export function TaskRowActions({ id, status }: { id: string; status: string }) {
    const { pending, run } = useAction()
    return (
        <span className="flex shrink-0 items-center gap-1">
            {(status === 'blad' || status === 'w_toku') && (
                <button type="button" disabled={pending} onClick={() => run(() => retryTask(id))} className={iconBtn} aria-label="Spróbuj jeszcze raz">
                    <RotateCcw size={15} />
                </button>
            )}
            <button
                type="button"
                disabled={pending}
                onClick={() => {
                    if (confirm('Usunąć to zadanie?')) run(() => deleteTask(id))
                }}
                className={iconBtn}
                aria-label="Usuń zadanie"
            >
                <Trash2 size={15} />
            </button>
        </span>
    )
}

export function FactForm() {
    const { pending, run } = useAction()
    const [tresc, setTresc] = useState('')
    return (
        <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
                e.preventDefault()
                run(() => addFact(tresc), () => setTresc(''))
            }}
        >
            <input required placeholder="Np. Umowa z PUP podpisana 1.12.2026" value={tresc} onChange={(e) => setTresc(e.target.value)} className={`${input} min-w-0 flex-1`} aria-label="Nowe ustalenie" />
            <button type="submit" disabled={pending} className={button}>Dodaj</button>
        </form>
    )
}

export function FactRowActions({ id }: { id: string }) {
    const { pending, run } = useAction()
    return (
        <button
            type="button"
            disabled={pending}
            onClick={() => {
                if (confirm('Usunąć to ustalenie z pamięci bota?')) run(() => deleteFact(id))
            }}
            className={`${iconBtn} shrink-0`}
            aria-label="Usuń ustalenie"
        >
            <Trash2 size={15} />
        </button>
    )
}
