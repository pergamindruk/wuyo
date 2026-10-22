// Formatowanie tylko w warstwie widoku. Wejście zawsze w groszach.

const pln = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 })

export function formatPLN(grosze: number): string {
    return `${pln.format(Math.round(grosze / 100))} zł`
}

export function telHref(phone: string): string {
    return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function daysBetween(fromIso: string, to: Date = new Date()): number {
    return Math.floor((to.getTime() - new Date(fromIso).getTime()) / 86_400_000)
}

// ── Czas w Warszawie ──
// Serwer (Vercel, iad1) działa w UTC/USA. Dzień, miesiąc i „dziś” liczymy
// zawsze wg Europe/Warsaw, inaczej po 22:00 panel pokazuje wczorajszą datę.
export const TZ = 'Europe/Warsaw'

export function warsawParts(at: Date = new Date()) {
    const p = new Intl.DateTimeFormat('en-CA', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
    }).formatToParts(at)
    const get = (t: string) => Number(p.find((x) => x.type === t)?.value)
    return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') }
}

/** Data YYYY-MM-DD w Warszawie, opcjonalnie przesunięta o N dni. */
export function warsawIsoDate(addDays = 0, at: Date = new Date()): string {
    const { year, month, day } = warsawParts(at)
    const d = new Date(Date.UTC(year, month - 1, day + addDays))
    return d.toISOString().slice(0, 10)
}

/** Moment północy (dziś, Warszawa) jako timestamp ms. */
export function warsawMidnightMs(at: Date = new Date()): number {
    const { year, month, day, hour } = warsawParts(at)
    const utcGuess = Date.UTC(year, month - 1, day)
    const offsetH = hour - new Date(at).getUTCHours()
    const offset = ((offsetH + 24 + 12) % 24) - 12 // -12..+11 h
    return utcGuess - offset * 3_600_000
}

export function warsawDaysInMonth(at: Date = new Date()): number {
    const { year, month } = warsawParts(at)
    return new Date(Date.UTC(year, month, 0)).getUTCDate()
}
