'use client'

// "use client": formularz z licznikiem odpowiedzi i potwierdzeniem bez przeładowania strony.
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function BriefForm({ token, questions }: { token: string; questions: string[] }) {
    const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ''))
    const [hp, setHp] = useState('')
    const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
    const [err, setErr] = useState('')
    const filled = answers.filter((a) => a.trim()).length

    const send = async (e: React.FormEvent) => {
        e.preventDefault()
        if (filled === 0) { setErr('Odpowiedz chociaż na jedno pytanie.'); setState('error'); return }
        setState('sending')
        const res = await fetch('/api/brief-klienta', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, hp, answers: questions.map((q, i) => ({ question: q, answer: answers[i] })) }),
        })
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        if (res.ok) setState('done')
        else { setErr(j.error ?? 'Nie udało się wysłać. Spróbuj jeszcze raz albo napisz na kontakt@wuyo.pl.'); setState('error') }
    }

    if (state === 'done') {
        return (
            <div className="flex items-start gap-3 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" />
                <div>
                    <p className="font-semibold text-white">Dziękuję, mam Twoje odpowiedzi.</p>
                    <p className="text-sm text-zinc-300">Przygotuję ofertę i odezwę się w ciągu 1-2 dni roboczych.</p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={send} className="flex flex-col gap-4">
            {questions.map((q, i) => (
                <label key={q} className="flex flex-col gap-2 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
                    <span className="text-sm font-semibold text-white"><span className="mr-2 text-yellow-400">{i + 1}.</span>{q}</span>
                    <textarea rows={3} maxLength={2000} value={answers[i]} onChange={(e) => setAnswers((a) => a.map((x, k) => (k === i ? e.target.value : x)))}
                        className="resize-y rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:border-yellow-400/60 focus:outline-none" />
                </label>
            ))}
            <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden="true" />
            <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-zinc-500">Odpowiedzi: {filled} z {questions.length}</span>
                <button disabled={state === 'sending'} className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                    {state === 'sending' ? 'Wysyłam…' : 'Wyślij odpowiedzi'}
                </button>
            </div>
            {state === 'error' && <p className="text-sm text-red-400">{err}</p>}
        </form>
    )
}
