'use client'

// "use client": porady generują się na kliknięcie (AI kosztuje i trwa kilkanaście sekund).
import { useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, Wand2 } from 'lucide-react'
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
        <section className="lab-card border-yellow-400/30 p-5 sm:p-6">
            <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-yellow-400/15 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="lab-chip h-12 w-12 shrink-0"><Sparkles size={20} strokeWidth={1.8} /></span>
                    <div>
                        <h2 className="text-lg font-bold text-white">Co z tym zrobić</h2>
                        <p className="text-xs text-zinc-400">AI czyta liczby z tej strony i daje 3 ruchy marketingowe na ten tydzień.</p>
                    </div>
                </div>
                <button onClick={run} disabled={pending} className={`inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50 ${pending ? 'lab-shine' : ''}`}>
                    <Wand2 size={16} strokeWidth={1.8} />
                    {pending ? 'Analizuję… (ok. 20 s)' : text ? 'Jeszcze raz' : 'Podpowiedz'}
                </button>
            </div>
            {error && <p className="mt-4 rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}
            {text && (
                <div className="prose prose-sm prose-invert relative mt-5 max-w-none rounded-2xl bg-white/[0.03] p-5 prose-strong:text-yellow-300 prose-headings:text-white prose-h2:mb-1 prose-h2:mt-4 prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-wider prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                </div>
            )}
        </section>
    )
}
