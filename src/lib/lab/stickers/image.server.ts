import sharp from 'sharp'
import {
    A4, bbox, cutContourFromMask, dilate, mmFromPx, pxFromMm, rasterizePolygon, regMarksSvg,
    type Mask, type Placement, type Pt,
} from './geometry'
import type { StickerGeometry, StickerSettings } from './types'

/**
 * Sticker Studio A4: obróbka obrazu na serwerze (sharp).
 * Czysty TypeScript, bez Pythona i modeli ONNX: działa lokalnie i na Vercel.
 */

const MAX_INPUT_BYTES = 12 * 1024 * 1024
/** Dłuższy bok grafiki po wycięciu. 1600 px = 135 mm przy 300 DPI bez powiększania. */
export const CUTOUT_MAX_SIDE = 1600

export class StickerError extends Error {}

export function decodeDataUrl(dataUrl: unknown): Buffer {
    if (typeof dataUrl !== 'string') throw new StickerError('Brak obrazu.')
    const m = /^data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl)
    if (!m) throw new StickerError('Obsługuję tylko PNG, JPG i WebP.')
    const buf = Buffer.from(m[2], 'base64')
    if (buf.length > MAX_INPUT_BYTES) throw new StickerError('Plik jest za duży (max 12 MB).')
    return buf
}

export const toDataUrl = (buf: Buffer, mime: string) => `data:${mime};base64,${buf.toString('base64')}`

type Raw = { data: Uint8Array; w: number; h: number }

async function toRaw(input: Buffer, maxSide?: number): Promise<Raw> {
    let img = sharp(input, { limitInputPixels: 50_000_000 }).rotate()
    if (maxSide) img = img.resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true })
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    return { data: new Uint8Array(data.buffer, data.byteOffset, data.length), w: info.width, h: info.height }
}

/** Czy obraz ma już przezroczyste tło (np. PNG z wyciętym tłem). */
function hasTransparentBackground({ data, w, h }: Raw): boolean {
    let clear = 0
    let edge = 0
    const check = (x: number, y: number) => {
        edge++
        if (data[(y * w + x) * 4 + 3] < 200) clear++
    }
    for (let x = 0; x < w; x++) { check(x, 0); check(x, h - 1) }
    for (let y = 0; y < h; y++) { check(0, y); check(w - 1, y) }
    return clear / edge > 0.3
}

/**
 * Wycina jednolite tło: zalewanie od krawędzi wszystkiego, co ma kolor zbliżony do tła.
 * Gemini dostaje polecenie rysowania na czystej bieli, więc to wystarcza i nie wymaga AI.
 */
function removeFlatBackground(raw: Raw, tolerance = 38): number {
    const { data, w, h } = raw
    const rs: number[] = [], gs: number[] = [], bs: number[] = []
    const sample = (x: number, y: number) => {
        const i = (y * w + x) * 4
        rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2])
    }
    for (let x = 0; x < w; x += 2) { sample(x, 0); sample(x, h - 1) }
    for (let y = 0; y < h; y += 2) { sample(0, y); sample(w - 1, y) }
    const med = (a: number[]) => a.sort((p, q) => p - q)[a.length >> 1]
    const br = med(rs), bg = med(gs), bb = med(bs)
    const dist = (p: number) => {
        const i = p * 4
        return Math.hypot(data[i] - br, data[i + 1] - bg, data[i + 2] - bb)
    }
    const isBg = new Uint8Array(w * h)
    const queue = new Int32Array(w * h)
    let qh = 0, qt = 0
    const push = (p: number) => {
        if (!isBg[p] && dist(p) < tolerance) { isBg[p] = 1; queue[qt++] = p }
    }
    for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x) }
    for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1) }
    while (qh < qt) {
        const p = queue[qh++]
        const x = p % w
        if (x > 0) push(p - 1)
        if (x < w - 1) push(p + 1)
        if (p >= w) push(p - w)
        if (p < w * (h - 1)) push(p + w)
    }
    let fg = 0
    for (let p = 0; p < w * h; p++) {
        if (isBg[p]) { data[p * 4 + 3] = 0; continue }
        fg++
        // Miękka krawędź: piksel przy tle, kolorem podobny do tła, dostaje częściową przezroczystość.
        const x = p % w
        const nearBg = (x > 0 && isBg[p - 1]) || (x < w - 1 && isBg[p + 1]) || (p >= w && isBg[p - w]) || (p < w * (h - 1) && isBg[p + w])
        if (nearBg) {
            const d = dist(p)
            if (d < tolerance * 2) data[p * 4 + 3] = Math.max(40, Math.min(255, Math.round((255 * (d - tolerance)) / tolerance)))
        }
    }
    return fg / (w * h)
}

export type Cutout = { buf: Buffer; w: number; h: number; removed: boolean }

/** Obraz wejściowy -> grafika z przezroczystym tłem, przycięta do zawartości, WebP. */
export async function makeCutout(input: Buffer, mode: 'auto' | 'tak' | 'nie' = 'auto'): Promise<Cutout> {
    const raw = await toRaw(input, CUTOUT_MAX_SIDE)
    let removed = false
    if (mode === 'tak' || (mode === 'auto' && !hasTransparentBackground(raw))) {
        const left = removeFlatBackground(raw)
        if (left < 0.01) throw new StickerError('Po wycięciu tła nic nie zostało. Spróbuj bez usuwania tła.')
        removed = true
    }
    let x1 = raw.w, y1 = raw.h, x2 = -1, y2 = -1
    for (let y = 0; y < raw.h; y++) {
        for (let x = 0; x < raw.w; x++) {
            if (raw.data[(y * raw.w + x) * 4 + 3] >= 128) {
                if (x < x1) x1 = x
                if (x > x2) x2 = x
                if (y < y1) y1 = y
                if (y > y2) y2 = y
            }
        }
    }
    if (x2 < 0) throw new StickerError('Obraz jest pusty (cały przezroczysty).')
    const pad = 2
    const left = Math.max(0, x1 - pad), top = Math.max(0, y1 - pad)
    const width = Math.min(raw.w, x2 + pad + 1) - left
    const height = Math.min(raw.h, y2 + pad + 1) - top
    const buf = await sharp(Buffer.from(raw.data.buffer, raw.data.byteOffset, raw.data.length), { raw: { width: raw.w, height: raw.h, channels: 4 } })
        .extract({ left, top, width, height })
        .webp({ quality: 92, alphaQuality: 100, effort: 4 })
        .toBuffer()
    return { buf, w: width, h: height, removed }
}

// ─── Kontur i kafelek do druku ─────────────────────────────────────────────

export type PreparedSticker = {
    geo: StickerGeometry
    art: Raw
    pad: number
    canvasW: number
    canvasH: number
    polyPx: Pt[]
    bb: { x: number; y: number; w: number; h: number }
}

/** Skaluje grafikę do rozmiaru w mm (300 DPI) i liczy linię cięcia. */
export async function prepareSticker(src: Buffer, sizeMm: number, s: Pick<StickerSettings, 'offsetMm' | 'bleedMm' | 'smooth'>): Promise<PreparedSticker> {
    const meta = await sharp(src).metadata()
    if (!meta.width || !meta.height) throw new StickerError('Nie umiem odczytać obrazu.')
    const scale = pxFromMm(sizeMm) / Math.max(meta.width, meta.height)
    const tw = Math.max(1, Math.round(meta.width * scale))
    const th = Math.max(1, Math.round(meta.height * scale))
    const { data, info } = await sharp(src).resize(tw, th, { fit: 'fill', kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const art: Raw = { data: new Uint8Array(data.buffer, data.byteOffset, data.length), w: info.width, h: info.height }
    const pad = Math.ceil(pxFromMm(s.offsetMm + s.bleedMm + 3)) + 4
    const canvasW = art.w + 2 * pad
    const canvasH = art.h + 2 * pad
    const mask: Mask = { w: canvasW, h: canvasH, data: new Uint8Array(canvasW * canvasH) }
    for (let y = 0; y < art.h; y++) {
        for (let x = 0; x < art.w; x++) {
            if (art.data[(y * art.w + x) * 4 + 3] >= 128) mask.data[(y + pad) * canvasW + x + pad] = 1
        }
    }
    const { polyPx, closed } = cutContourFromMask(mask, pxFromMm(s.offsetMm), s.smooth)
    if (polyPx.length < 3) throw new StickerError('Nie udało się wyznaczyć linii cięcia.')
    const bb = bbox(polyPx)
    const geo: StickerGeometry = {
        contour: polyPx.map(([x, y]) => [mmFromPx(x - bb.x), mmFromPx(y - bb.y)]),
        w: mmFromPx(bb.w),
        h: mmFromPx(bb.h),
        img: { x: mmFromPx(pad - bb.x), y: mmFromPx(pad - bb.y), w: mmFromPx(art.w), h: mmFromPx(art.h) },
        closed,
    }
    return { geo, art, pad, canvasW, canvasH, polyPx, bb }
}

export type Tile = { buf: Buffer; wPx: number; hPx: number; offX: number; offY: number }

const hexRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

/** Naklejka do druku: obwódka w kolorze (ze spadem poza linię cięcia) + grafika. */
export async function renderTile(p: PreparedSticker, s: Pick<StickerSettings, 'bleedMm' | 'borderColor'>): Promise<Tile> {
    const bleedPx = pxFromMm(s.bleedMm)
    const border = dilate(rasterizePolygon(p.polyPx, p.canvasW, p.canvasH), bleedPx)
    const [r, g, b] = hexRgb(s.borderColor)
    const base = Buffer.alloc(p.canvasW * p.canvasH * 4)
    for (let i = 0; i < border.data.length; i++) {
        if (!border.data[i]) continue
        base[i * 4] = r; base[i * 4 + 1] = g; base[i * 4 + 2] = b; base[i * 4 + 3] = 255
    }
    const x0 = Math.max(0, Math.floor(p.bb.x - bleedPx) - 1)
    const y0 = Math.max(0, Math.floor(p.bb.y - bleedPx) - 1)
    const x1 = Math.min(p.canvasW, Math.ceil(p.bb.x + p.bb.w + bleedPx) + 2)
    const y1 = Math.min(p.canvasH, Math.ceil(p.bb.y + p.bb.h + bleedPx) + 2)
    const composed = await sharp(base, { raw: { width: p.canvasW, height: p.canvasH, channels: 4 } })
        .composite([{ input: Buffer.from(p.art.data.buffer, p.art.data.byteOffset, p.art.data.length), raw: { width: p.art.w, height: p.art.h, channels: 4 }, left: p.pad, top: p.pad }])
        .png()
        .toBuffer()
    const buf = await sharp(composed).extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }).png().toBuffer()
    return { buf, wPx: x1 - x0, hPx: y1 - y0, offX: mmFromPx(x0 - p.bb.x), offY: mmFromPx(y0 - p.bb.y) }
}

/**
 * Arkusz A4 300 DPI (2480 × 3508 px), PNG z przezroczystym tłem, bez linii cięcia.
 * Każda naklejka to osobny kafelek z własną obwódką. Pasery (gdy włączone) są na arkuszu.
 */
export async function composeSheet(
    placements: Placement[],
    tiles: Map<string, { tile: Tile; rotated: Tile | null; geo: StickerGeometry }>,
    opts: { regMarks?: boolean } = {},
): Promise<Buffer> {
    const layers: sharp.OverlayOptions[] = []
    for (const p of placements) {
        const t = tiles.get(p.id)
        if (!t) continue
        const tile = p.rotated ? t.rotated : t.tile
        if (!tile) continue
        // Po obrocie o 90° w prawo róg kafelka (offX, offY) przechodzi na (h - offY - wysokość, offX).
        const offX = p.rotated ? t.geo.h - t.tile.offY - mmFromPx(t.tile.hPx) : tile.offX
        const offY = p.rotated ? t.tile.offX : tile.offY
        const left = Math.round(pxFromMm(p.x + offX))
        const top = Math.round(pxFromMm(p.y + offY))
        if (left < 0 || top < 0 || left + tile.wPx > A4.wPx || top + tile.hPx > A4.hPx) continue
        layers.push({ input: tile.buf, left, top })
    }
    if (opts.regMarks) layers.push({ input: Buffer.from(regMarksSvg(A4.wPx, A4.hPx)), left: 0, top: 0 })
    return sharp({ create: { width: A4.wPx, height: A4.hPx, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite(layers)
        .withMetadata({ density: 300 })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer()
}

export async function rotateTile(t: Tile): Promise<Tile> {
    const buf = await sharp(t.buf).rotate(90).png().toBuffer()
    return { buf, wPx: t.hPx, hPx: t.wPx, offX: 0, offY: 0 }
}

/** Podgląd do sprawdzenia: arkusz zmniejszony, na nim linie cięcia i strefy znaczników. */
export async function composeProof(sheet: Buffer, overlaySvg: string, widthPx = 1240): Promise<Buffer> {
    // Arkusz ma przezroczyste tło: do JPG kładziemy go na białej kartce.
    const small = await sharp(sheet).resize({ width: widthPx }).flatten({ background: '#ffffff' }).png().toBuffer()
    const heightPx = Math.round((widthPx * A4.hPx) / A4.wPx)
    const svg = Buffer.from(overlaySvg.replace('<svg ', `<svg width="${widthPx}" height="${heightPx}" `))
    return sharp(small).composite([{ input: svg, left: 0, top: 0 }]).jpeg({ quality: 85 }).toBuffer()
}
