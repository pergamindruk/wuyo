'use client'

// Uzasadnienie "use client": modal otwierany przyciskiem, pola zależne od siebie
// (usługa ustawia cenę, wybór klienta przełącza pola nowego klienta) i wysyłka akcji.

import { useState, useTransition } from 'react'
import { Kanban, Plus, X } from 'lucide-react'
import { createJob } from '@/app/lab/lejek/actions'
import { SERVICES } from '@/lib/lab/today/constants'
import type { ClientOption } from './types'
import { groszeToZlInput } from './view'

// Pola: zaokrąglenie i żółty fokus dokłada lab-input (globals.css).
const input = 'lab-input w-full px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600'
const label = 'mb-1.5 block text-xs font-medium text-zinc-400'

export function NewJobForm({ clients, initialOpen = false }: { clients: ClientOption[]; initialOpen?: boolean }) {
    const [open, setOpen] = useState(initialOpen)
    const [clientId, setClientId] = useState('')
    const [price, setPrice] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    function onService(key: string) {
        const s = SERVICES.find((x) => x.key === key)
        if (s && s.priceGrosze > 0) setPrice(groszeToZlInput(s.priceGrosze))
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        const fd = new FormData(form)
        setError(null)
        startTransition(async () => {
            const res = await createJob(fd)
            if (res.ok) {
                form.reset()
                setClientId('')
                setPrice('')
                setOpen(false)
            } else {
                setError(res.error)
            }
        })
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                data-sound="pop"
                className="inline-flex min-h-11 items-center gap-2 bg-yellow-400 px-5 text-sm font-bold text-zinc-950"
            >
                <Plus size={16} strokeWidth={2} /> Nowe zlecenie
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(false)}>
                    <form
                        onSubmit={onSubmit}
                        onClick={(e) => e.stopPropagation()}
                        className="lab-card flex max-h-[92vh] w-full flex-col gap-4 !overflow-y-auto rounded-[1.75rem] p-5 backdrop-blur-xl sm:max-w-lg sm:p-6"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="flex items-center gap-3 text-lg font-bold text-white">
                                <span className="lab-chip h-10 w-10"><Kanban size={18} strokeWidth={1.8} /></span>
                                Nowe zlecenie
                            </h2>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Zamknij" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 transition hover:bg-white/10 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label className={label} htmlFor="nj-client">Klient</label>
                            <select
                                id="nj-client"
                                name="client_id"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className={input}
                            >
                                <option value="">Nowy klient</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {clientId === '' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className={label} htmlFor="nj-name">Nazwa klienta</label>
                                    <input id="nj-name" name="new_client_name" className={input} placeholder="np. Piekarnia Kowalski" />
                                </div>
                                <div>
                                    <label className={label} htmlFor="nj-phone">Telefon</label>
                                    <input id="nj-phone" name="new_client_phone" type="tel" className={input} placeholder="600 100 200" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className={label} htmlFor="nj-title">Tytuł</label>
                            <input id="nj-title" name="title" required className={input} placeholder="np. Strona dla piekarni" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={label} htmlFor="nj-service">Usługa</label>
                                <select id="nj-service" name="service" defaultValue="inne" onChange={(e) => onService(e.target.value)} className={input}>
                                    {SERVICES.map((s) => (
                                        <option key={s.key} value={s.key}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={label} htmlFor="nj-price">Cena netto (zł)</label>
                                <input
                                    id="nj-price"
                                    name="price_zl"
                                    inputMode="decimal"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className={input}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={label} htmlFor="nj-step">Następny krok</label>
                                <input id="nj-step" name="next_step" className={input} placeholder="np. Zadzwonić z wyceną" />
                            </div>
                            <div>
                                <label className={label} htmlFor="nj-date">Data kontaktu</label>
                                <input id="nj-date" name="next_contact_at" type="date" className={input} />
                            </div>
                        </div>

                        {error && <p className="rounded-2xl bg-red-400/10 px-4 py-2.5 text-xs font-medium text-red-300">{error}</p>}

                        <button
                            type="submit"
                            disabled={pending}
                            className="inline-flex items-center justify-center gap-2 bg-yellow-400 px-4 py-3 text-sm font-bold text-zinc-950 disabled:opacity-50"
                        >
                            <Plus size={16} strokeWidth={2} />
                            {pending ? 'Zapisuję…' : 'Dodaj zlecenie'}
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
