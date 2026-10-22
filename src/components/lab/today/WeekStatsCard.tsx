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
        <div className="min-w-0">
            <p className="text-[11px] text-zinc-500 truncate">{label}</p>
            <p className="text-3xl font-bold tabular-nums leading-none text-white mt-2">{value}</p>
            <p className="text-[11px] text-zinc-600 tabular-nums mt-1">cel {goal}</p>
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-2">
                <div
                    className={`h-full rounded-full ${reached ? 'bg-emerald-400' : 'bg-yellow-400'}`}
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
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 min-w-0">
            <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">
                Ten tydzień
            </h2>

            {telefony === 0 ? (
                <p className="text-sm text-zinc-500">
                    Jeszcze zero telefonów w tym tygodniu. Pierwszy zawsze najtrudniejszy.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Stat label="Telefony" value={telefony} goal={WEEK_GOALS.telefony} />
                        <Stat label="Rozmowy" value={rozmowy} goal={WEEK_GOALS.rozmowy} />
                        <Stat label="Oferty" value={oferty} goal={WEEK_GOALS.oferty} />
                        <Stat label="Zaliczki" value={zaliczki} goal={WEEK_GOALS.zaliczki} />
                    </div>

                    <p className="text-xs text-zinc-400 mt-5 tabular-nums">
                        Telefon → rozmowa {percent(rozmowy, telefony)}%
                        <span className="text-zinc-600"> · </span>
                        Rozmowa → oferta {percent(oferty, rozmowy)}%
                    </p>
                </>
            )}

            <div className="mt-6">
                <div className="flex items-end gap-1.5 h-24">
                    {days.map(d => (
                        <div
                            key={d.key}
                            className="flex-1 flex flex-col justify-end items-center h-full min-w-0"
                            title={`${d.weekday}: ${d.count} tel.`}
                        >
                            <span className="text-[10px] text-zinc-500 tabular-nums mb-1">
                                {d.count > 0 ? d.count : ''}
                            </span>
                            <div
                                className="w-full bg-yellow-400/80 rounded-t"
                                style={{ height: `${d.count > 0 ? Math.max((d.count / maxDay) * 100, 4) : 0}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex gap-1.5 mt-1.5">
                    {days.map(d => (
                        <span key={d.key} className="flex-1 text-center text-[10px] text-zinc-600">
                            {d.weekday}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    )
}
