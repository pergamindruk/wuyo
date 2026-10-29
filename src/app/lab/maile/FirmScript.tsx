'use client'

// "use client": scenariusz przygotowuje się sam po otwarciu strony (jeśli go jeszcze nie ma) i da się go odświeżyć.
import { useEffect, useRef, useState, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, RefreshCw } from 'lucide-react'
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
        <details className="group rounded-lg border border-zinc-800 bg-zinc-900/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-yellow-400">
                <span>Scenariusz: telefon i odpowiedzi na maila</span>
                <span className="text-zinc-500 group-open:hidden">
                    {pending && !text ? 'przygotowuję…' : 'pokaż'}
                </span>
            </summary>
            <div className="border-t border-zinc-800 px-3 py-3">
                {text ? <div className={PROSE}><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>
                    : <p className="text-xs text-zinc-500">{pending ? 'Przygotowuję scenariusz…' : 'Brak scenariusza.'}</p>}
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <div className="mt-3 flex gap-2">
                    {text && (
                        <button type="button" onClick={() => navigator.clipboard?.writeText(text)}
                            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-500">
                            <Copy size={11} /> Kopiuj
                        </button>
                    )}
                    <button type="button" disabled={pending} onClick={() => run(true)}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-zinc-500 disabled:opacity-50">
                        <RefreshCw size={11} className={pending ? 'animate-spin' : ''} /> {text ? 'Napisz od nowa' : 'Przygotuj'}
                    </button>
                </div>
            </div>
        </details>
    )
}
