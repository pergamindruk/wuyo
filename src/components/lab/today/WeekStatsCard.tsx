import { BarChart3, PhoneCall } from 'lucide-react'
import { CountUp } from '@/components/lab/fx/CountUp'
import type { Activity } from '@/lib/lab/today/types'

// Cele tygodnia. Zmieniaj tylko tutaj.
const WEEK_GOALS = { telefony: 50, rozmowy: 15, oferty: 4, zaliczki: 1 } as const

const DAY_MS = 86_400_000
const WEEKDAYS = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sb'] as const

// Dni liczymy w strefie studia, bo serwer (Vercel) działa w UTC i o 23:30 w Polsce
// zaliczyłby aktywność do innego dnia.
const dayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})

function dayKey(date: Date): string {
    return dayFormatter.format(date) // format YYYY-MM-DD
}

function percent(part: number, whole: number): number {
    return whole > 0 ? Math.round((part / whole) * 100) : 0
}

/* ───────────── małe klocki UI ───────────── */

function Stat({ label, value, goal }: { label: string; value: number; goal: number }) {
    const reached = value >= goal
    const width = Math.min((value / goal) * 100, 100)
    return (
        <div className="min-w-0 rounded-2xl bg-white/[0.03] p-3">
            <p className="truncate text-[11px] font-medium text-zinc-400">{label}</p>
            <p className="mt-1.5 font-heading text-2xl font-bold leading-none text-white tabular-nums">
                <CountUp value={value} />
                <span className="ml-1 text-xs font-medium text-zinc-500">/ {goal}</span>
            </p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                    className={`lab-bar h-full rounded-full ${reached ? 'bg-emerald-400' : 'bg-gradient-to-r from-yellow-500 to-yellow-300'}`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    )
}

/* ───────────── komponent ───────────── */

// Server component: liczy same statystyki z przekazanych danych, bez stanu i handlerów.
export function WeekStatsCard({ activities }: { activities: Activity[] }) {
    const phones = activities.filter(a => a.kind === 'telefon')
    // Rozmowa = telefon z zapisanym wynikiem, inny niż brak odpowiedzi.
    const talks = phones.filter(a => a.outcome !== null && a.outcome !== 'nie_odebral')
    const offers = activities.filter(
        a => a.kind === 'oferta' || (a.kind === 'telefon' && a.outcome === 'chce_oferte'),
    )
    const deposits = activities.filter(a => a.kind === 'zaliczka')

    const telefony = phones.length
    const rozmowy = talks.length
    const oferty = offers.length
    const zaliczki = deposits.length

    // Ostatnie 7 dni, najstarszy po lewej, dzisiaj po prawej.
    const days = Array.from({ length: 7 }, (_, i) => {
        const key = dayKey(new Date(Date.now() - (6 - i) * DAY_MS))
        const count = phones.filter(a => dayKey(new Date(a.created_at)) === key).length
        const weekday = WEEKDAYS[new Date(`${key}T12:00:00Z`).getUTCDay()]
        return { key, count, weekday }
    })
    const maxDay = Math.max(...days.map(d => d.count), 1)

    return (
        <section className="lab-card flex min-w-0 flex-col p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2.5 text-base font-bold text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><BarChart3 size={16} strokeWidth={1.8} /></span>
                    Ten tydzień
                </h2>
                {telefony > 0 && (
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">7 dni</span>
                )}
            </div>

            {telefony === 0 ? (
                <div className="flex flex-col items-center py-4 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><PhoneCall size={20} strokeWidth={1.8} /></span>
                    <p className="mt-3 text-sm text-zinc-400">
                        Jeszcze zero telefonów w tym tygodniu. Pierwszy zawsze najtrudniejszy.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-2.5">
                        <Stat label="Telefony" value={telefony} goal={WEEK_GOALS.telefony} />
                        <Stat label="Rozmowy" value={rozmowy} goal={WEEK_GOALS.rozmowy} />
                        <Stat label="Oferty" value={oferty} goal={WEEK_GOALS.oferty} />
                        <Stat label="Zaliczki" value={zaliczki} goal={WEEK_GOALS.zaliczki} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 tabular-nums">
                        <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">
                            Telefon → rozmowa {percent(rozmowy, telefony)}%
                        </span>
                        <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">
                            Rozmowa → oferta {percent(oferty, rozmowy)}%
                        </span>
                    </div>
                </>
            )}

            <div className="mt-auto pt-5">
                <div className="flex h-24 items-end gap-1.5">
                    {days.map((d, i) => (
                        <div
                            key={d.key}
                            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                            title={`${d.weekday}: ${d.count} tel.`}
                        >
                            <span className="mb-1 text-[10px] text-zinc-500 tabular-nums">
                                {d.count > 0 ? d.count : ''}
                            </span>
                            <div
                                className={`w-full rounded-t-lg rounded-b-sm ${
                                    i === days.length - 1
                                        ? 'bg-gradient-to-t from-yellow-500 to-yellow-300 shadow-[0_0_18px_-4px_rgba(255,214,10,.7)]'
                                        : 'bg-gradient-to-t from-yellow-400/25 to-yellow-400/60'
                                }`}
                                style={{ height: `${d.count > 0 ? Math.max((d.count / maxDay) * 100, 4) : 0}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-1.5 flex gap-1.5">
                    {days.map((d, i) => (
                        <span key={d.key} className={`flex-1 text-center text-[10px] ${i === days.length - 1 ? 'font-semibold text-yellow-300' : 'text-zinc-600'}`}>
                            {d.weekday}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}
