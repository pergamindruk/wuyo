'use client'

// Uzasadnienie "use client": modal otwierany przyciskiem, pola zależne od siebie
// (usługa ustawia cenę, wybór klienta przełącza pola nowego klienta) i wysyłka akcji.

import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { createJob } from '@/app/lab/lejek/actions'
import { SERVICES } from '@/lib/lab/today/constants'
import type { ClientOption } from './types'
import { groszeToZlInput } from './view'

const input = 'w-full bg-zinc-950 border border-zinc-800 focus:border-yellow-400/60 outline-none rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600'
const label = 'block font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1.5'

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
                className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold px-4 py-2 rounded-lg transition-colors text-xs"
            >
                <Plus size={14} /> Nowe zlecenie
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4" onClick={() => setOpen(false)}>
                    <form
                        onSubmit={onSubmit}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Nowe zlecenie</h2>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Zamknij" className="text-zinc-500 hover:text-white">
                                <X size={16} />
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

                        {error && <p className="text-xs text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={pending}
                            className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-950 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
                        >
                            {pending ? 'Zapisuję…' : 'Dodaj zlecenie'}
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
