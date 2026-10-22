import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { OneThing } from '@/lib/lab/today/types'

export function OneThingCard({ thing }: { thing: OneThing }) {
    const external = thing.href.startsWith('http')
    const cls =
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 text-sm font-bold text-zinc-950 transition-colors hover:bg-yellow-300'
    return (
        <section className="rounded-2xl border border-yellow-400/40 bg-gradient-to-br from-yellow-400/10 via-zinc-900 to-zinc-900 p-5 sm:p-7">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">Jedna rzecz teraz</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">{thing.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">{thing.detail}</p>
            <div className="mt-5">
                {external ? (
                    <a href={thing.href} target="_blank" rel="noopener noreferrer" className={cls}>
                        {thing.cta} <ArrowRight size={16} />
                    </a>
                ) : (
                    <Link href={thing.href} className={cls}>
                        {thing.cta} <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </section>
    )
}
