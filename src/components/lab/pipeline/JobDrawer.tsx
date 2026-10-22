'use client'

// Uzasadnienie "use client": panel ze stanem formularzy i wywołaniami akcji serwera.
// Importowany tylko przez Board (też wyspa kliencka).

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { markLost, recordPayment, updateJob } from '@/app/lab/lejek/actions'
import { JOB_STAGES } from '@/lib/lab/today/constants'
import { formatPLN } from '@/lib/lab/today/format'
import type { ActionResult, PipelineJob } from './types'
import { groszeToZlInput, zlToGrosze } from './view'

const input = 'w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400/60 outline-none rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600'
const label = 'block font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1.5'
const btn = 'bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors'

export function JobDrawer({ job, onClose, onMove }: {
    job: PipelineJob
    onClose: () => void
    onMove: (stage: number) => void
}) {
    const [pending, startTransition] = useTransition()
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

    const [step, setStep] = useState(job.next_step ?? '')
    const [date, setDate] = useState(job.next_contact_at ?? '')
    const [price, setPrice] = useState(groszeToZlInput(job.price_grosze))
    const [notes, setNotes] = useState(job.notes ?? '')
    const [amount, setAmount] = useState('')
    const [kind, setKind] = useState<'zaliczka' | 'platnosc'>(job.stage <= 4 ? 'zaliczka' : 'platnosc')
    const [reason, setReason] = useState('')
    const [confirmLost, setConfirmLost] = useState(false)

    function run(fn: () => Promise<ActionResult>, okText: string, after?: () => void) {
        setMsg(null)
        startTransition(async () => {
            const res = await fn()
            if (res.ok) {
                setMsg({ ok: true, text: okText })
                after?.()
            } else {
                setMsg({ ok: false, text: res.error })
            }
        })
    }

    function save() {
        const grosze = zlToGrosze(price)
        if (grosze === null) return setMsg({ ok: false, text: 'Zła kwota.' })
        run(
            () => updateJob(job.id, { next_step: step, next_contact_at: date || null, price_grosze: grosze, notes }),
            'Zapisano.',
        )
    }

    function pay() {
        const grosze = zlToGrosze(amount)
        if (grosze === null || grosze <= 0) return setMsg({ ok: false, text: 'Podaj kwotę większą od zera.' })
        run(() => recordPayment(job.id, grosze, kind), 'Wpłata zapisana.', () => setAmount(''))
    }

    function lost() {
        run(() => markLost(job.id, reason), 'Oznaczono jako przegrane.', onClose)
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
            <aside
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md h-full overflow-y-auto bg-zinc-900 border-l border-zinc-800 p-5 flex flex-col gap-5"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs text-zinc-500">{job.client_name}</p>
                        <h2 className="text-lg font-bold text-white leading-snug">{job.title}</h2>
                        <p className="font-heading text-2xl font-bold text-yellow-400 mt-1">
                            {formatPLN(job.price_grosze)} <span className="text-[10px] font-normal text-zinc-500">netto</span>
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Wpłacono {formatPLN(job.deposit_grosze)}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Zamknij" className="text-zinc-500 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Etap */}
                <section>
                    <p className={label}>Etap</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {JOB_STAGES.map((s) => (
                            <button
                                key={s.stage}
                                type="button"
                                onClick={() => s.stage !== job.stage && onMove(s.stage)}
                                className={`text-left px-3 py-2 rounded-lg text-xs border transition-colors ${
                                    s.stage === job.stage
                                        ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400 font-semibold'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                            >
                                {s.stage}. {s.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Edycja */}
                <section className="flex flex-col gap-3">
                    <div>
                        <label className={label} htmlFor="jd-step">Następny krok</label>
                        <input id="jd-step" value={step} onChange={(e) => setStep(e.target.value)} className={input} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={label} htmlFor="jd-date">Data kontaktu</label>
                            <input id="jd-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
                        </div>
                        <div>
                            <label className={label} htmlFor="jd-price">Cena netto (zł)</label>
                            <input id="jd-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={input} />
                        </div>
                    </div>
                    <div>
                        <label className={label} htmlFor="jd-notes">Notatki</label>
                        <textarea id="jd-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={input} />
                    </div>
                    <button type="button" disabled={pending} onClick={save} className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                        Zapisz
                    </button>
                </section>

                {/* Wpłata */}
                <section className="border-t border-zinc-800 pt-4">
                    <p className={label}>Wpłata</p>
                    <div className="flex gap-2">
                        <input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            inputMode="decimal"
                            placeholder="Kwota w zł"
                            aria-label="Kwota wpłaty w złotych"
                            className={input}
                        />
                        <select value={kind} onChange={(e) => setKind(e.target.value as 'zaliczka' | 'platnosc')} aria-label="Rodzaj wpłaty" className={`${input} w-auto`}>
                            <option value="zaliczka">Zaliczka</option>
                            <option value="platnosc">Płatność</option>
                        </select>
                    </div>
                    <button type="button" disabled={pending} onClick={pay} className={`${btn} mt-2`}>
                        Zapisz wpłatę
                    </button>
                </section>

                {/* Przegrane */}
                <section className="border-t border-zinc-800 pt-4">
                    {!confirmLost ? (
                        <button type="button" onClick={() => setConfirmLost(true)} className="text-xs text-red-400 hover:text-red-300">
                            Oznacz jako przegrane
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className={label} htmlFor="jd-reason">Dlaczego przegrane?</label>
                            <input id="jd-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={input} placeholder="np. za drogo, wybrał innego" />
                            <div className="flex gap-2">
                                <button type="button" disabled={pending} onClick={lost} className="bg-red-500/90 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg text-xs">
                                    Potwierdź
                                </button>
                                <button type="button" onClick={() => setConfirmLost(false)} className={btn}>Anuluj</button>
                            </div>
                        </div>
                    )}
                </section>

                {msg && <p className={`text-xs ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>}
            </aside>
        </div>
    )
}
