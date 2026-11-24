import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, Info, Siren } from 'lucide-react'
import type { Signal, SignalTone } from '@/lib/lab/asystent/pick'

const TONE: Record<SignalTone, { icon: typeof Info; ring: string; text: string }> = {
    danger: { icon: Siren, ring: 'border-red-500/30 bg-red-500/[0.06]', text: 'text-red-300' },
    warning: { icon: AlertTriangle, ring: 'border-yellow-400/25 bg-yellow-400/[0.05]', text: 'text-yellow-300' },
    info: { icon: Info, ring: 'border-white/10 bg-white/[0.03]', text: 'text-zinc-300' },
    success: { icon: CheckCircle2, ring: 'border-emerald-400/25 bg-emerald-400/[0.05]', text: 'text-emerald-300' },
}

/** Sygnały „co sprawdzić / poprawić”. Serwerowy komponent, bez stanu. */
export function SignalList({ signals }: { signals: Signal[] }) {
    return (
        <ul className="lab-stagger grid gap-2 sm:grid-cols-2">
            {signals.map((s) => {
                const t = TONE[s.tone]
                const Icon = t.icon
                return (
                    <li key={s.text}>
                        <Link href={s.href} className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition hover:border-yellow-400/50 ${t.ring}`}>
                            <Icon className={`h-4 w-4 shrink-0 ${t.text}`} aria-hidden />
                            <span className="min-w-0 flex-1 text-zinc-200">{s.text}</span>
                            <span className={`flex shrink-0 items-center gap-1 text-xs font-semibold ${t.text}`}>
                                {s.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                            </span>
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}
