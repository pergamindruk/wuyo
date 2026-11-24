'use client'

// "use client": scenariusz przygotowuje się sam po otwarciu strony (jeśli go jeszcze nie ma) i da się go odświeżyć.
import { useEffect, useRef, useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDown, Copy, RefreshCw, ScrollText } from 'lucide-react'
import { prepareFirmScript } from './actions'

const PROSE = 'prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-headings:text-white ' +
    'prose-h2:mt-3 prose-h2:mb-1 prose-h2:text-xs prose-h2:uppercase prose-h2:tracking-wider prose-strong:text-white'

export function FirmScript({ firm, initial }: { firm: string; initial: string | null }) {
    const [text, setText] = useState(initial)
    const [error, setError] = useState<string | null>(null)
    const [pending, start] = useTransition()
    const started = useRef(false)

    const run = (regenerate: boolean) => start(async () => {
        setError(null)
        const r = await prepareFirmScript(firm, regenerate)
        if (r.ok) setText(r.text)
        else setError(r.error)
    })

    useEffect(() => {
        if (!initial && !started.current) {
            started.current = true
            run(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <details className="group rounded-2xl bg-yellow-400/[0.05] ring-1 ring-yellow-400/15">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-semibold text-yellow-300">
                <span className="flex items-center gap-2"><ScrollText size={16} strokeWidth={1.8} /> Scenariusz: telefon i odpowiedzi na maila</span>
                <span className="flex items-center gap-1 text-zinc-500">
                    <span className="group-open:hidden">{pending && !text ? 'przygotowuję…' : 'pokaż'}</span>
                    <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                </span>
            </summary>
            <div className="border-t border-white/[0.06] px-4 py-4">
                {text ? <div className={PROSE}><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>
                    : <p className="text-xs text-zinc-500">{pending ? 'Przygotowuję scenariusz…' : 'Brak scenariusza.'}</p>}
                {error && <p className="mt-2 rounded-2xl bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}
                <div className="mt-3 flex gap-2">
                    {text && (
                        <button type="button" onClick={() => navigator.clipboard?.writeText(text)}
                            className="inline-flex items-center gap-1.5 bg-zinc-800 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-300">
                            <Copy size={12} /> Kopiuj
                        </button>
                    )}
                    <button type="button" disabled={pending} onClick={() => run(true)}
                        className="inline-flex items-center gap-1.5 bg-zinc-800 px-3.5 py-1.5 text-[11px] font-semibold text-zinc-300 disabled:opacity-50">
                        <RefreshCw size={12} className={pending ? 'animate-spin' : ''} /> {text ? 'Napisz od nowa' : 'Przygotuj'}
                    </button>
                </div>
            </div>
        </details>
    )
}
