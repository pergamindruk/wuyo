import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TZ } from '@/lib/lab/today/format'

const PROSE = 'prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed ' +
    'prose-headings:text-white prose-h1:hidden prose-h2:mt-4 prose-h2:mb-1 prose-h2:text-sm ' +
    'prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-zinc-400 prose-a:text-yellow-400 ' +
    'prose-code:text-yellow-300 prose-li:my-0.5'

/** Ostatni raport Dyrygenta (7:00 i 19:00): alarmy, jedna rzecz, stan agentów, pytanie. */
export function ConductorCard({ raport }: { raport: { tresc: string; zmieniono: string } }) {
    const kiedy = new Date(raport.zmieniono).toLocaleString('pl-PL', {
        weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ,
    })
    const alarm = /##\s*Alarmy\s*\n(?![\s\S]*?Wszystko chodzi)/.test(raport.tresc.split('## Jedna rzecz')[0])
    return (
        <section className={`rounded-2xl border bg-zinc-900/60 p-5 sm:p-6 ${alarm ? 'border-red-500/40' : 'border-zinc-800'}`}>
            <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    Dyrygent {alarm && <span className="ml-2 rounded-full bg-red-500 px-1.5 text-[10px] text-white">alarm</span>}
                </p>
                <Link href="/lab/centrum/pliki" className="text-[11px] text-zinc-500 hover:text-zinc-300">
                    {kiedy} · historia
                </Link>
            </div>
            <div className={`${PROSE} mt-2`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{raport.tresc}</ReactMarkdown>
            </div>
        </section>
    )
}
