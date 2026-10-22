// Pomocniki widoku lejka: zł <-> grosze i daty. Czyste funkcje, bez dyrektyw.

/** "2 990,50" / "2990.5" -> grosze. Zwraca null gdy wejście nie jest kwotą >= 0. */
export function zlToGrosze(input: string): number | null {
    const cleaned = input.replace(/\s/g, '').replace(',', '.')
    if (cleaned === '') return null
    const n = Number(cleaned)
    if (!Number.isFinite(n) || n < 0) return null
    return Math.round(n * 100)
}

/** grosze -> tekst do pola edycji (bez jednostki). */
export function groszeToZlInput(grosze: number): string {
    const zl = grosze / 100
    return Number.isInteger(zl) ? String(zl) : zl.toFixed(2).replace('.', ',')
}

/** "2026-10-23" -> "23 paź" */
export function shortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}
