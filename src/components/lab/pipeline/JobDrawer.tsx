'use client'

// Uzasadnienie "use client": panel ze stanem formularzy i wywołaniami akcji serwera.
// Importowany tylko przez Board (też wyspa kliencka).

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Kanban, Save, UserRound, Wallet, X, XCircle } from 'lucide-react'
import { markLost, recordPayment, updateJob } from '@/app/lab/lejek/actions'
import { JOB_STAGES, LOST_REASONS } from '@/lib/lab/today/constants'
import { formatPLN } from '@/lib/lab/today/format'
import type { ActionResult, PipelineJob } from './types'
import { groszeToZlInput, zlToGrosze } from './view'

// Pola i przyciski: wygląd (zaokrąglenie, żółty fokus, pigułki) dokłada globals.css (.lab-ui).
const input = 'lab-input w-full px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600'
const label = 'mb-1.5 block text-xs font-medium text-zinc-400'
const btn = 'inline-flex items-center justify-center gap-1.5 bg-zinc-800 px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50'

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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm sm:p-3" onClick={onClose}>
            <aside
                onClick={(e) => e.stopPropagation()}
                className="lab-card flex h-full w-full flex-col gap-5 !overflow-y-auto rounded-[1.75rem] p-5 backdrop-blur-xl sm:max-w-md sm:p-6"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="lab-chip h-11 w-11 shrink-0"><Kanban size={20} strokeWidth={1.8} /></span>
                        <div className="min-w-0">
                            <p className="text-xs text-zinc-500">
                                {job.client_name}
                                {job.client_id && (
                                    <Link href={`/lab/klienci/${job.client_id}`} className="ml-2 inline-flex items-center gap-1 text-yellow-400 hover:text-yellow-300">
                                        <UserRound size={12} /> Karta klienta
                                    </Link>
                                )}
                            </p>
                            <h2 className="text-lg font-bold leading-snug text-white">{job.title}</h2>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Zamknij" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 transition hover:bg-white/10 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
                        <p className="text-xs text-zinc-500">Cena netto</p>
                        <p className="font-heading text-2xl font-bold text-yellow-400">{formatPLN(job.price_grosze)}</p>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] px-4 py-3">
                        <p className="text-xs text-zinc-500">Wpłacono</p>
                        <p className="font-heading text-2xl font-bold text-emerald-300">{formatPLN(job.deposit_grosze)}</p>
                    </div>
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
                                className={`rounded-2xl px-3 py-2.5 text-left text-xs transition-colors ${
                                    s.stage === job.stage
                                        ? 'bg-yellow-400/15 font-semibold text-yellow-300 ring-1 ring-yellow-400/40'
                                        : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200'
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
                    <button type="button" disabled={pending} onClick={save} className="inline-flex items-center justify-center gap-2 bg-yellow-400 px-4 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50">
                        <Save size={16} strokeWidth={1.8} /> Zapisz
                    </button>
                </section>

                {/* Wpłata */}
                <section className="border-t border-white/[0.07] pt-4">
                    <p className={`${label} flex items-center gap-1.5`}><Wallet size={14} className="text-yellow-400" /> Wpłata</p>
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
                <section className="border-t border-white/[0.07] pt-4">
                    {!confirmLost ? (
                        <button type="button" onClick={() => setConfirmLost(true)} className="inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200">
                            <XCircle size={14} /> Oznacz jako przegrane
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className={label} htmlFor="jd-reason">Dlaczego przegrane?</label>
                            <div className="flex flex-wrap gap-1.5">
                                {LOST_REASONS.map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setReason(r)}
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${reason === r ? 'bg-red-400/15 text-red-300 ring-1 ring-red-400/40' : 'bg-white/[0.06] text-zinc-300 hover:bg-white/10'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <input id="jd-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={input} placeholder="albo wpisz własny powód" />
                            <div className="flex gap-2">
                                <button type="button" disabled={pending} onClick={lost} className="rounded-full bg-red-500/90 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50">
                                    Potwierdź
                                </button>
                                <button type="button" onClick={() => setConfirmLost(false)} className={btn}>Anuluj</button>
                            </div>
                        </div>
                    )}
                </section>

                {msg && <p className={`rounded-2xl px-4 py-2.5 text-xs font-medium ${msg.ok ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>{msg.text}</p>}
            </aside>
        </div>
    )
}
