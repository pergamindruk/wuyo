import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { History, Radar } from 'lucide-react'
import { TZ } from '@/lib/lab/today/format'

const PROSE = 'prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed ' +
    'prose-headings:text-white prose-h1:hidden prose-h2:mt-4 prose-h2:mb-1.5 prose-h2:text-[11px] prose-h2:font-bold ' +
    'prose-h2:uppercase prose-h2:tracking-[0.14em] prose-h2:text-zinc-500 prose-a:text-yellow-400 ' +
    'prose-code:text-yellow-300 prose-li:my-0.5 prose-li:marker:text-yellow-400/70 prose-strong:text-white'

/** Ostatni raport Dyrygenta (7:00 i 19:00): alarmy, jedna rzecz, stan agentów, pytanie. */
export function ConductorCard({ raport }: { raport: { tresc: string; zmieniono: string } }) {
    const kiedy = new Date(raport.zmieniono).toLocaleString('pl-PL', {
        weekday: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ,
    })
    const alarm = /##\s*Alarmy\s*\n(?![\s\S]*?Wszystko chodzi)/.test(raport.tresc.split('## Jedna rzecz')[0])
    return (
        <section className={`lab-card flex h-full min-w-0 flex-col p-5 sm:p-6 ${alarm ? 'ring-1 ring-red-400/40' : ''}`}>
            {alarm && <span className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-500/15 blur-2xl" />}
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2.5 text-base font-bold text-white sm:text-lg">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Radar size={16} strokeWidth={1.8} /></span>
                    Dyrygent
                    {alarm && (
                        <span className="flex items-center gap-1.5 rounded-full bg-red-400/15 px-2.5 py-1 text-[11px] font-semibold text-red-300">
                            <span className="lab-ping h-1.5 w-1.5 rounded-full bg-red-400" /> alarm
                        </span>
                    )}
                </h2>
                <Link
                    href="/lab/centrum/pliki"
                    className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition hover:text-white"
                    title="Historia raportów"
                >
                    <History size={12} /> {kiedy}
                </Link>
            </div>
            <div className={`${PROSE} -mr-2 max-h-[26rem] min-h-0 flex-1 overflow-y-auto pr-2`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{raport.tresc}</ReactMarkdown>
            </div>
        </section>
    )
}
