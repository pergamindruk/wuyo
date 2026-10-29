'use client'

// "use client": porady generują się na kliknięcie (AI kosztuje i trwa kilkanaście sekund).
import { useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles } from 'lucide-react'
import { getMarketingTips } from './actions'

export function MarketingTips({ summary }: { summary: string }) {
    const [text, setText] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [pending, start] = useTransition()

    const run = () => start(async () => {
        setError(null)
        const r = await getMarketingTips(summary)
        if (r.ok) setText(r.text)
        else setError(r.error)
    })

    return (
        <section className="rounded-3xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/[0.08] to-transparent p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Sparkles size={18} className="text-yellow-400" /> Co z tym zrobić</h2>
                    <p className="text-xs text-zinc-400">AI czyta liczby z tej strony i daje 3 ruchy marketingowe na ten tydzień.</p>
                </div>
                <button onClick={run} disabled={pending} className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                    {pending ? 'Analizuję… (ok. 20 s)' : text ? 'Jeszcze raz' : 'Podpowiedz'}
                </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            {text && (
                <div className="prose prose-sm prose-invert mt-4 max-w-none prose-headings:text-white prose-h2:mb-1 prose-h2:mt-4 prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-wider prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                </div>
            )}
        </section>
    )
}
