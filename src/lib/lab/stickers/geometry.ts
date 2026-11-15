/**
 * Sticker Studio A4: czysta geometria, bez sharp i bez Node.
 * Działa na serwerze (kontury, eksport) i w przeglądarce (skład arkusza na żywo).
 *
 * Jednostki: maski w pikselach 300 DPI, wszystko na arkuszu w milimetrach.
 */

export const DPI = 300
export const MM_PER_INCH = 25.4
export const pxFromMm = (mm: number) => (mm * DPI) / MM_PER_INCH
export const mmFromPx = (px: number) => (px * MM_PER_INCH) / DPI

/** A4 pionowo. 300 DPI = 2480 × 3508 px. */
export const A4 = { w: 210, h: 297, wPx: 2480, hPx: 3508 } as const

export type Pt = [number, number]
export type Rect = { x: number; y: number; w: number; h: number }
/** Maska binarna: 1 = w środku. */
export type Mask = { w: number; h: number; data: Uint8Array }

// ─── Odległość (EDT, Felzenszwalb) ─────────────────────────────────────────

const INF = 1e20

function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
    let k = 0
    v[0] = 0
    z[0] = -INF
    z[1] = INF
    for (let q = 1; q < n; q++) {
        let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
        while (s <= z[k]) {
            k--
            s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
        }
        k++
        v[k] = q
        z[k] = s
        z[k + 1] = INF
    }
    k = 0
    for (let q = 0; q < n; q++) {
        while (z[k + 1] < q) k++
        const dq = q - v[k]
        d[q] = dq * dq + f[v[k]]
    }
}

/** Odległość (px) każdego piksela do najbliższego piksela, dla którego `isSeed` = true. */
function distanceField(w: number, h: number, isSeed: (i: number) => boolean): Float64Array {
    const grid = new Float64Array(w * h)
    for (let i = 0; i < w * h; i++) grid[i] = isSeed(i) ? 0 : INF
    const n = Math.max(w, h)
    const f = new Float64Array(n)
    const d = new Float64Array(n)
    const v = new Int32Array(n)
    const z = new Float64Array(n + 1)
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) f[y] = grid[y * w + x]
        edt1d(f, h, d, v, z)
        for (let y = 0; y < h; y++) grid[y * w + x] = d[y]
    }
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) f[x] = grid[y * w + x]
        edt1d(f, w, d, v, z)
        for (let x = 0; x < w; x++) grid[y * w + x] = Math.sqrt(d[x])
    }
    return grid
}

/** Rozszerza maskę o promień r (px). */
export function dilate(m: Mask, r: number): Mask {
    if (r <= 0) return { w: m.w, h: m.h, data: m.data.slice() }
    const dist = distanceField(m.w, m.h, (i) => m.data[i] === 1)
    const data = new Uint8Array(m.w * m.h)
    for (let i = 0; i < data.length; i++) data[i] = dist[i] <= r ? 1 : 0
    return { w: m.w, h: m.h, data }
}

/** Zwęża maskę o promień r (px). */
export function erode(m: Mask, r: number): Mask {
    if (r <= 0) return { w: m.w, h: m.h, data: m.data.slice() }
    const dist = distanceField(m.w, m.h, (i) => m.data[i] === 0)
    const data = new Uint8Array(m.w * m.h)
    for (let i = 0; i < data.length; i++) data[i] = m.data[i] === 1 && dist[i] > r ? 1 : 0
    return { w: m.w, h: m.h, data }
}

// ─── Spójne fragmenty ──────────────────────────────────────────────────────

const N8X = [-1, 0, 1, -1, 1, -1, 0, 1]
const N8Y = [-1, -1, -1, 0, 0, 1, 1, 1]

/** Etykiety fragmentów (8-sąsiedztwo). Zwraca etykiety (0 = tło) i rozmiary (indeks = etykieta). */
export function labelComponents(m: Mask): { labels: Int32Array; sizes: number[] } {
    const { w, h, data } = m
    const labels = new Int32Array(w * h)
    const sizes: number[] = [0]
    const stack = new Int32Array(w * h)
    let next = 0
    for (let i = 0; i < w * h; i++) {
        if (data[i] !== 1 || labels[i] !== 0) continue
        next++
        let size = 0
        let sp = 0
        stack[sp++] = i
        labels[i] = next
        while (sp > 0) {
            const p = stack[--sp]
            size++
            const px = p % w
            const py = (p - px) / w
            for (let k = 0; k < 8; k++) {
                const nx = px + N8X[k]
                const ny = py + N8Y[k]
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
                const q = ny * w + nx
                if (data[q] === 1 && labels[q] === 0) {
                    labels[q] = next
                    stack[sp++] = q
                }
            }
        }
        sizes.push(size)
    }
    return { labels, sizes }
}

/** Usuwa drobne plamki (szum po wycinaniu tła). minFrac = część największego fragmentu. */
export function removeSpecks(m: Mask, minFrac = 0.01): Mask {
    const { labels, sizes } = labelComponents(m)
    const biggest = Math.max(0, ...sizes)
    const keep = sizes.map((s) => s >= biggest * minFrac)
    const data = new Uint8Array(m.w * m.h)
    for (let i = 0; i < data.length; i++) data[i] = labels[i] && keep[labels[i]] ? 1 : 0
    return { w: m.w, h: m.h, data }
}

export function componentCount(m: Mask): number {
    return labelComponents(m).sizes.length - 1
}

export function largestComponent(m: Mask): Mask {
    const { labels, sizes } = labelComponents(m)
    let best = 0
    for (let i = 1; i < sizes.length; i++) if (sizes[i] > (sizes[best] ?? 0)) best = i
    const data = new Uint8Array(m.w * m.h)
    if (best) for (let i = 0; i < data.length; i++) data[i] = labels[i] === best ? 1 : 0
    return { w: m.w, h: m.h, data }
}

// ─── Kontur zewnętrzny ─────────────────────────────────────────────────────

// Kierunki zgodnie z ruchem wskazówek (oś y w dół): W, NW, N, NE, E, SE, S, SW.
const DX = [-1, -1, 0, 1, 1, 1, 0, -1]
const DY = [0, -1, -1, -1, 0, 1, 1, 1]
const dirOf = (dx: number, dy: number) => {
    for (let d = 0; d < 8; d++) if (DX[d] === dx && DY[d] === dy) return d
    return 0
}

/**
 * Obrys zewnętrzny pierwszego fragmentu (śledzenie Moore'a).
 * Punkty w środkach pikseli brzegowych (px). Dziury w środku ignoruje.
 */
export function traceOuter(m: Mask): Pt[] {
    const { w, h, data } = m
    const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[y * w + x] === 1
    let start = -1
    for (let i = 0; i < w * h; i++) if (data[i] === 1) { start = i; break }
    if (start < 0) return []
    const sx = start % w
    const sy = (start - sx) / w
    const pts: Pt[] = [[sx + 0.5, sy + 0.5]]
    let cx = sx
    let cy = sy
    let back = 0 // piksel na zachód od startu jest na pewno pusty
    let firstMove = -1
    const maxSteps = 4 * (w + h) * 8 + w * h
    for (let step = 0; step < maxSteps; step++) {
        let found = -1
        for (let k = 1; k <= 8; k++) {
            const d = (back + k) % 8
            if (inside(cx + DX[d], cy + DY[d])) { found = d; break }
        }
        if (found < 0) break // pojedynczy piksel
        if (cx === sx && cy === sy) {
            if (firstMove === -1) firstMove = found
            else if (found === firstMove) break
        }
        const prev = (found + 7) % 8
        const px = cx + DX[prev]
        const py = cy + DY[prev]
        cx += DX[found]
        cy += DY[found]
        back = dirOf(px - cx, py - cy)
        if (cx === sx && cy === sy) continue
        pts.push([cx + 0.5, cy + 0.5])
    }
    return pts
}

/** Wypełnia wielokąt (even-odd) w nowej masce w×h. Punkty w px. */
export function rasterizePolygon(poly: Pt[], w: number, h: number): Mask {
    const data = new Uint8Array(w * h)
    const n = poly.length
    if (n < 3) return { w, h, data }
    const xs: number[] = []
    for (let y = 0; y < h; y++) {
        const cy = y + 0.5
        xs.length = 0
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const [x1, y1] = poly[i]
            const [x2, y2] = poly[j]
            if ((y1 > cy) !== (y2 > cy)) xs.push(x1 + ((cy - y1) / (y2 - y1)) * (x2 - x1))
        }
        xs.sort((a, b) => a - b)
        for (let k = 0; k + 1 < xs.length; k += 2) {
            const from = Math.max(0, Math.ceil(xs[k] - 0.5))
            const to = Math.min(w - 1, Math.floor(xs[k + 1] - 0.5))
            for (let x = from; x <= to; x++) data[y * w + x] = 1
        }
    }
    return { w, h, data }
}

// ─── Upraszczanie i wygładzanie ────────────────────────────────────────────

function segDist(p: Pt, a: Pt, b: Pt) {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len2 = dx * dx + dy * dy
    if (len2 === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function dpOpen(pts: Pt[], eps: number): Pt[] {
    if (pts.length < 3) return pts.slice()
    const keep = new Uint8Array(pts.length)
    keep[0] = 1
    keep[pts.length - 1] = 1
    const stack: [number, number][] = [[0, pts.length - 1]]
    while (stack.length) {
        const [a, b] = stack.pop()!
        let max = 0
        let idx = -1
        for (let i = a + 1; i < b; i++) {
            const d = segDist(pts[i], pts[a], pts[b])
            if (d > max) { max = d; idx = i }
        }
        if (idx >= 0 && max > eps) {
            keep[idx] = 1
            stack.push([a, idx], [idx, b])
        }
    }
    return pts.filter((_, i) => keep[i])
}

/** Douglas-Peucker dla wielokąta zamkniętego. */
export function simplifyClosed(poly: Pt[], eps: number): Pt[] {
    if (poly.length < 4) return poly.slice()
    // Dzielimy w najdalszym od punktu 0 wierzchołku, żeby nie zgubić kształtu.
    let far = 0
    let max = -1
    for (let i = 1; i < poly.length; i++) {
        const d = Math.hypot(poly[i][0] - poly[0][0], poly[i][1] - poly[0][1])
        if (d > max) { max = d; far = i }
    }
    const a = dpOpen(poly.slice(0, far + 1), eps)
    const b = dpOpen([...poly.slice(far), poly[0]], eps)
    return [...a.slice(0, -1), ...b.slice(0, -1)]
}

/** Wygładzanie Chaikina (zamknięty wielokąt). */
export function chaikin(poly: Pt[], iterations = 2): Pt[] {
    let p = poly
    for (let it = 0; it < iterations && p.length >= 3; it++) {
        const out: Pt[] = []
        for (let i = 0; i < p.length; i++) {
            const a = p[i]
            const b = p[(i + 1) % p.length]
            out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]])
            out.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]])
        }
        p = out
    }
    return p
}

export function polygonArea(poly: Pt[]): number {
    let s = 0
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) s += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1])
    return Math.abs(s / 2)
}

export function bbox(poly: Pt[]): Rect {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
    for (const [x, y] of poly) {
        if (x < x1) x1 = x
        if (y < y1) y1 = y
        if (x > x2) x2 = x
        if (y > y2) y2 = y
    }
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

// ─── Kontur cięcia z maski grafiki ─────────────────────────────────────────

export type CutContour = {
    /** Linia cięcia w px, w układzie maski wejściowej. */
    polyPx: Pt[]
    /** Ile razy trzeba było domykać kształt, żeby wyszła jedna naklejka. */
    closed: number
}

/**
 * Linia cięcia: grafika rozszerzona o offset, jeden zewnętrzny obrys.
 * Gdy grafika jest z kilku części, domykamy szczeliny, aż wyjdzie jedna naklejka.
 */
export function cutContourFromMask(art: Mask, offsetPx: number, smooth = 2): CutContour {
    const clean = removeSpecks(art, 0.01)
    let shape = dilate(clean, Math.max(offsetPx, 1))
    let closed = 0
    for (const extra of [pxFromMm(3), pxFromMm(6), pxFromMm(12)]) {
        if (componentCount(shape) <= 1) break
        shape = erode(dilate(shape, extra), extra)
        closed++
    }
    shape = largestComponent(shape)
    let poly = traceOuter(shape)
    poly = simplifyClosed(poly, pxFromMm(0.06))
    if (smooth > 0) poly = simplifyClosed(chaikin(poly, Math.min(4, Math.round(smooth))), pxFromMm(0.03))
    return { polyPx: poly, closed }
}

// ─── Skład arkusza ─────────────────────────────────────────────────────────

/**
 * Znaczniki rejestracyjne Silhouette Studio (typ 1, A4 pionowo):
 * kwadrat w lewym górnym rogu, „L” w prawym górnym i lewym dolnym.
 * Strefy wokół nich zostawiamy puste, żeby kamera Cameo 5 je widziała.
 */
export const REG_MARKS = { inset: 10, length: 20, square: 5, thickness: 0.5 } as const

export type SheetSettings = {
    marginMm: number
    gapMm: number
    regMarks: boolean
    /** Dokłada kopie projektów, aż arkusz będzie pełny. */
    fill: boolean
    /** Pozwala obrócić naklejkę o 90°, gdy tak lepiej się mieści. */
    rotate: boolean
}

export function regMarkZones(): Rect[] {
    const z = REG_MARKS.inset + REG_MARKS.length + 2
    return [
        { x: 0, y: 0, w: z, h: z },
        { x: A4.w - z, y: 0, w: z, h: z },
        { x: 0, y: A4.h - z, w: z, h: z },
    ]
}

export type LayoutItem = { id: string; w: number; h: number; qty: number }
export type Placement = { id: string; x: number; y: number; w: number; h: number; rotated: boolean }
export type Layout = {
    placements: Placement[]
    /** Ile sztuk z zamówionych się nie zmieściło. */
    overflow: Record<string, number>
    /** Wykorzystanie powierzchni użytkowej (bbox naklejek / pole w marginesach). */
    usage: number
}

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

type Shelf = { y: number; h: number; x: number }

/**
 * Skład półkowy: rzędy od góry, w rzędzie od lewej, omija strefy znaczników.
 * Prosty i przewidywalny: ten sam wynik w podglądzie i w eksporcie.
 */
export function layoutSheet(items: LayoutItem[], s: SheetSettings): Layout {
    const left = s.marginMm
    const top = s.marginMm
    const right = A4.w - s.marginMm
    const bottom = A4.h - s.marginMm
    const gap = Math.max(0, s.gapMm)
    const blocked = s.regMarks ? regMarkZones() : []
    const shelves: Shelf[] = []
    const placements: Placement[] = []

    const fitsAt = (x: number, y: number, w: number, h: number): number | null => {
        // Zwraca x, pod którym element staje (po ominięciu stref), albo null.
        let cx = x
        for (let guard = 0; guard < 10; guard++) {
            if (cx + w > right + 1e-9 || y + h > bottom + 1e-9) return null
            const hit = blocked.find((b) => overlaps({ x: cx, y, w, h }, b))
            if (!hit) return cx
            cx = hit.x + hit.w + gap
        }
        return null
    }

    const tryPlace = (id: string, w0: number, h0: number): boolean => {
        const orients: [number, number, boolean][] = [[w0, h0, false]]
        if (s.rotate && Math.abs(w0 - h0) > 0.5) orients.push([h0, w0, true])
        let best: { shelf: Shelf | null; x: number; y: number; w: number; h: number; rot: boolean; score: number } | null = null
        for (const [w, h, rot] of orients) {
            for (const sh of shelves) {
                if (h > sh.h + 1e-9) continue
                const x = fitsAt(sh.x, sh.y, w, h)
                if (x === null) continue
                // Najwyżej położony rząd, najmniej marnowanej wysokości; obrót tylko gdy wyraźnie lepszy.
                const score = sh.y * 10 + (sh.h - h) + (rot ? 2 : 0)
                if (!best || score < best.score) best = { shelf: sh, x, y: sh.y, w, h, rot, score }
            }
        }
        if (!best) {
            const last = shelves[shelves.length - 1]
            const y = last ? last.y + last.h + gap : top
            for (const [w, h, rot] of orients) {
                const x = fitsAt(left, y, w, h)
                if (x === null) continue
                // Nowy rząd: bez obrotu, jeśli się mieści. Obracamy tylko wtedy, gdy inaczej nie wejdzie.
                if (!best) best = { shelf: null, x, y, w, h, rot, score: 0 }
            }
            if (!best) return false
            const sh: Shelf = { y: best.y, h: best.h, x: left }
            shelves.push(sh)
            best.shelf = sh
        }
        placements.push({ id, x: best.x, y: best.y, w: best.w, h: best.h, rotated: best.rot })
        best.shelf!.x = best.x + best.w + gap
        return true
    }

    const ordered = items
        .filter((it) => it.w > 0 && it.h > 0)
        .map((it, i) => ({ ...it, i }))
        .sort((a, b) => Math.max(b.h, b.w) - Math.max(a.h, a.w) || a.i - b.i)
    const overflow: Record<string, number> = {}
    for (const it of ordered) {
        for (let k = 0; k < Math.max(0, Math.floor(it.qty)); k++) {
            if (!tryPlace(it.id, it.w, it.h)) overflow[it.id] = (overflow[it.id] ?? 0) + 1
        }
    }
    if (s.fill && ordered.length) {
        for (let round = 0; round < 500; round++) {
            let any = false
            for (const it of ordered) if (tryPlace(it.id, it.w, it.h)) any = true
            if (!any) break
        }
    }
    // Pole w marginesach minus ta część stref znaczników, która w nie wchodzi.
    const cut = (b: Rect) => Math.max(0, Math.min(right, b.x + b.w) - Math.max(left, b.x)) * Math.max(0, Math.min(bottom, b.y + b.h) - Math.max(top, b.y))
    const usable = (right - left) * (bottom - top) - blocked.reduce((a, b) => a + cut(b), 0)
    const used = placements.reduce((a, p) => a + p.w * p.h, 0)
    return { placements, overflow, usage: usable > 0 ? Math.min(1, used / usable) : 0 }
}

/** Punkty konturu (mm, względem lewego górnego rogu bbox naklejki) przeniesione na arkusz. */
export function placeContour(contour: Pt[], p: Placement): Pt[] {
    // Obrót o 90° zgodnie ze wskazówkami: (x, y) -> (wysokość - y, x); po obrocie wysokość = p.w.
    if (!p.rotated) return contour.map(([x, y]) => [p.x + x, p.y + y])
    return contour.map(([x, y]) => [p.x + (p.w - y), p.y + x])
}

// ─── Eksport linii cięcia ──────────────────────────────────────────────────

const f3 = (n: number) => (Math.round(n * 1000) / 1000).toFixed(3)

/**
 * DXF R12 (POLYLINE), milimetry, skala 1:1. Silhouette Studio Basic czyta ten format.
 * Oś Y w DXF rośnie w górę, więc odwracamy: (0,0) to lewy dolny róg arkusza.
 */
export function toDxf(polys: Pt[][], pageH: number = A4.h): string {
    const out: string[] = []
    const g = (code: number, value: string | number) => out.push(String(code), String(value))
    g(0, 'SECTION'); g(2, 'HEADER')
    g(9, '$ACADVER'); g(1, 'AC1009')
    g(9, '$INSUNITS'); g(70, 4)
    g(9, '$MEASUREMENT'); g(70, 1)
    g(9, '$EXTMIN'); g(10, 0); g(20, 0); g(30, 0)
    g(9, '$EXTMAX'); g(10, f3(A4.w)); g(20, f3(pageH)); g(30, 0)
    g(0, 'ENDSEC')
    g(0, 'SECTION'); g(2, 'TABLES')
    g(0, 'TABLE'); g(2, 'LAYER'); g(70, 1)
    g(0, 'LAYER'); g(2, 'CUT'); g(70, 0); g(62, 1); g(6, 'CONTINUOUS')
    g(0, 'ENDTAB')
    g(0, 'ENDSEC')
    g(0, 'SECTION'); g(2, 'ENTITIES')
    for (const poly of polys) {
        if (poly.length < 3) continue
        g(0, 'POLYLINE'); g(8, 'CUT'); g(66, 1); g(70, 1); g(10, 0); g(20, 0); g(30, 0)
        for (const [x, y] of poly) {
            g(0, 'VERTEX'); g(8, 'CUT'); g(10, f3(x)); g(20, f3(pageH - y)); g(30, 0)
        }
        g(0, 'SEQEND'); g(8, 'CUT')
    }
    g(0, 'ENDSEC')
    g(0, 'EOF')
    return out.join('\r\n') + '\r\n'
}

export function pathD(poly: Pt[]): string {
    if (!poly.length) return ''
    return 'M' + poly.map(([x, y]) => `${f3(x)} ${f3(y)}`).join(' L') + ' Z'
}

/** SVG w milimetrach (viewBox = mm), linie cięcia czerwone 0,1 mm. */
export function toSvg(polys: Pt[][]): string {
    const paths = polys.filter((p) => p.length >= 3).map((p) => `  <path d="${pathD(p)}"/>`).join('\n')
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${A4.w}mm" height="${A4.h}mm" viewBox="0 0 ${A4.w} ${A4.h}">
 <g id="CUT" fill="none" stroke="#ff0000" stroke-width="0.1">
${paths}
 </g>
</svg>
`
}
