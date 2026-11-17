import type { Pt, Rect, SheetSettings } from './geometry'

export type Laminate = 'blysk' | 'mat' | 'brak'

export type StickerSettings = SheetSettings & {
    /** Odległość linii cięcia od grafiki (biała obwódka). */
    offsetMm: number
    /** Ile kolor obwódki wychodzi poza linię cięcia, żeby nie było białych krawędzi. */
    bleedMm: number
    /** Kolor obwódki, #rrggbb. */
    borderColor: string
    /** 0 = ostro po pikselach, 4 = mocno zaokrąglone. */
    smooth: number
    laminate: Laminate
}

export const DEFAULT_SETTINGS: StickerSettings = {
    offsetMm: 2,
    bleedMm: 1,
    borderColor: '#ffffff',
    smooth: 2,
    laminate: 'blysk',
    marginMm: 10,
    gapMm: 3,
    regMarks: true,
    fill: false,
    rotate: true,
}

/** Kontur i położenie grafiki jednej naklejki, w mm, względem lewego górnego rogu linii cięcia. */
export type StickerGeometry = {
    contour: Pt[]
    w: number
    h: number
    img: Rect
    closed: number
}

export type DesignInput = {
    id: string
    name: string
    /** data:image/webp|png;base64 — grafika po wycięciu tła. */
    src: string
    /** Dłuższy bok grafiki w mm (bez obwódki). */
    sizeMm: number
    qty: number
}

const num = (v: unknown, def: number, min: number, max: number) => {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def
}

/** Najmniejszy odstęp, przy którym obwódki (ze spadem) sąsiednich naklejek się nie stykają. */
export const minGapMm = (bleedMm: number) => Math.round((2 * bleedMm + 0.5) * 2) / 2

/** Ustawienia z zewnątrz (formularz, plik projektu) zawsze przez tę funkcję. */
export function sanitizeSettings(raw: unknown): StickerSettings {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const d = DEFAULT_SETTINGS
    const color = typeof r.borderColor === 'string' && /^#[0-9a-f]{6}$/i.test(r.borderColor) ? r.borderColor.toLowerCase() : d.borderColor
    const bleedMm = num(r.bleedMm, d.bleedMm, 0, 3)
    return {
        offsetMm: num(r.offsetMm, d.offsetMm, 0.5, 8),
        bleedMm,
        borderColor: color,
        smooth: Math.round(num(r.smooth, d.smooth, 0, 4)),
        laminate: r.laminate === 'mat' || r.laminate === 'brak' ? r.laminate : 'blysk',
        // Margines co najmniej spad + 1 mm, żeby nic nie wyszło poza kartkę.
        marginMm: num(r.marginMm, d.marginMm, Math.max(3, bleedMm + 1), 40),
        // Spad wychodzi poza linię cięcia z obu stron: przy mniejszym odstępie obwódki sąsiadów
        // zlewałyby się w jedną grafikę. Każda naklejka ma być osobna.
        gapMm: num(r.gapMm, d.gapMm, minGapMm(bleedMm), 20),
        regMarks: typeof r.regMarks === 'boolean' ? r.regMarks : d.regMarks,
        fill: typeof r.fill === 'boolean' ? r.fill : d.fill,
        rotate: typeof r.rotate === 'boolean' ? r.rotate : d.rotate,
    }
}

export const SIZE_MIN = 15
export const SIZE_MAX = 180
export const clampSize = (v: unknown) => num(v, 60, SIZE_MIN, SIZE_MAX)
export const clampQty = (v: unknown) => Math.round(num(v, 1, 0, 200))
