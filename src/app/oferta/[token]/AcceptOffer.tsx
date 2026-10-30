'use client'

// "use client": przycisk akceptacji z potwierdzeniem bez przeładowania strony.
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function AcceptOffer({ token, acceptedAt, acceptedBy, defaultName }: { token: string; acceptedAt: string | null; acceptedBy: string | null; defaultName: string }) {
    const [name, setName] = useState(defaultName)
    const [hp, setHp] = useState('')
    const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>(acceptedAt ? 'done' : 'idle')
    const [err, setErr] = useState('')
    const [by, setBy] = useState(acceptedBy)

    const accept = async (e: React.FormEvent) => {
        e.preventDefault()
        setState('sending')
        const res = await fetch('/api/oferta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, name, hp }) })
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        if (res.ok) { setBy(name); setState('done') } else { setErr(j.error ?? 'Coś poszło nie tak. Zadzwoń albo napisz.'); setState('error') }
    }

    if (state === 'done') {
        return (
            <div className="flex items-start gap-3 text-zinc-800">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                    <p className="font-semibold">Oferta zaakceptowana{by ? ` (${by})` : ''}. Dziękuję!</p>
                    <p className="text-sm text-zinc-600">Odezwę się w ciągu 1 dnia roboczego z umową i danymi do zaliczki.</p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={accept} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-sm text-zinc-700">
                Imię i nazwisko osoby akceptującej
                <input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-zinc-300 px-3 py-2.5 text-zinc-900 focus:border-zinc-900 focus:outline-none" />
            </label>
            <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
            <button disabled={state === 'sending'} className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-[#FFEB52] hover:bg-zinc-800 disabled:opacity-50">
                {state === 'sending' ? 'Wysyłam…' : 'Akceptuję ofertę'}
            </button>
            {state === 'error' && <p className="text-sm text-red-600">{err}</p>}
        </form>
    )
}
