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
