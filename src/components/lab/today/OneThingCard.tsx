import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { OneThing } from '@/lib/lab/today/types'

export function OneThingCard({ thing }: { thing: OneThing }) {
    const external = thing.href.startsWith('http')
    const cls =
        'group/btn inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-base font-bold text-yellow-300 shadow-[0_12px_30px_-12px_rgba(0,0,0,.8)] transition hover:bg-black hover:text-yellow-200'
    const arrow = <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
    return (
        <section className="lab-hero-yellow lab-pulse relative flex h-full flex-col justify-center overflow-hidden p-6 sm:p-8">
            <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/40 blur-3xl" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-800/70">Jedna rzecz teraz</p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-tight sm:text-4xl">{thing.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-800">{thing.detail}</p>
            <div className="mt-6">
                {external ? (
                    <a href={thing.href} target="_blank" rel="noopener noreferrer" className={cls} data-sound="pop">{thing.cta} {arrow}</a>
                ) : (
                    <Link href={thing.href} className={cls}>{thing.cta} {arrow}</Link>
                )}
            </div>
        </section>
    )
}
