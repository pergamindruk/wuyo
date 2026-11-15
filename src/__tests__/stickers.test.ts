import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { unzipSync, strFromU8 } from 'fflate'
import {
    A4, bbox, cutContourFromMask, layoutSheet, placeContour, polygonArea, pxFromMm, regMarkZones, toDxf,
    type Mask,
} from '@/lib/lab/stickers/geometry'
import { DEFAULT_SETTINGS, sanitizeSettings } from '@/lib/lab/stickers/types'

function circleMask(size: number, r: number): Mask {
    const data = new Uint8Array(size * size)
    const c = size / 2
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) data[y * size + x] = Math.hypot(x + 0.5 - c, y + 0.5 - c) <= r ? 1 : 0
    return { w: size, h: size, data }
}

describe('kontur cięcia', () => {
    it('koło + offset daje koło o promieniu r + offset', () => {
        const { polyPx, closed } = cutContourFromMask(circleMask(400, 100), 30, 2)
        expect(closed).toBe(0)
        const b = bbox(polyPx)
        expect(b.w).toBeGreaterThan(255)
        expect(b.w).toBeLessThan(263)
        const expected = Math.PI * 130 * 130
        expect(Math.abs(polygonArea(polyPx) - expected) / expected).toBeLessThan(0.03)
    })

    it('dwie odległe części domyka w jedną naklejkę', () => {
        const size = 600
        const data = new Uint8Array(size * size)
        for (let y = 250; y < 350; y++) {
            for (let x = 100; x < 200; x++) data[y * size + x] = 1
            for (let x = 300; x < 400; x++) data[y * size + x] = 1
        }
        const { polyPx, closed } = cutContourFromMask({ w: size, h: size, data }, 20, 1)
        expect(closed).toBeGreaterThan(0)
        const b = bbox(polyPx)
        expect(b.w).toBeGreaterThan(330) // obejmuje obie części
    })
})

describe('skład A4', () => {
    const s = { ...DEFAULT_SETTINGS }

    it('omija strefy znaczników i marginesy', () => {
        const { placements } = layoutSheet([{ id: 'a', w: 40, h: 40, qty: 100 }], { ...s, fill: false })
        expect(placements.length).toBeGreaterThan(10)
        for (const p of placements) {
            expect(p.x).toBeGreaterThanOrEqual(s.marginMm - 1e-6)
            expect(p.y).toBeGreaterThanOrEqual(s.marginMm - 1e-6)
            expect(p.x + p.w).toBeLessThanOrEqual(A4.w - s.marginMm + 1e-6)
            expect(p.y + p.h).toBeLessThanOrEqual(A4.h - s.marginMm + 1e-6)
            for (const z of regMarkZones()) {
                const hit = p.x < z.x + z.w && z.x < p.x + p.w && p.y < z.y + z.h && z.y < p.y + p.h
                expect(hit).toBe(false)
            }
        }
    })

    it('nie nakłada naklejek na siebie i zgłasza nadmiar', () => {
        const { placements, overflow } = layoutSheet([{ id: 'a', w: 90, h: 60, qty: 30 }, { id: 'b', w: 25, h: 25, qty: 4 }], s)
        for (let i = 0; i < placements.length; i++) {
            for (let j = i + 1; j < placements.length; j++) {
                const a = placements[i], b = placements[j]
                expect(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h).toBe(false)
            }
        }
        expect(overflow.a).toBeGreaterThan(0)
    })

    it('obrót konturu zostaje w ramce', () => {
        const contour: [number, number][] = [[0, 0], [30, 0], [30, 10], [0, 10]]
        const pts = placeContour(contour, { id: 'a', x: 50, y: 50, w: 10, h: 30, rotated: true })
        const b = bbox(pts)
        expect(b).toEqual({ x: 50, y: 50, w: 10, h: 30 })
    })

    it('DXF ma POLYLINE w mm z odwróconą osią Y', () => {
        const dxf = toDxf([[[10, 20], [30, 20], [30, 40]]])
        expect(dxf).toContain('AC1009')
        expect(dxf).toContain('POLYLINE')
        expect(dxf).toContain('277.000') // 297 - 20
    })

    it('ustawienia z zewnątrz są przycinane', () => {
        const r = sanitizeSettings({ offsetMm: 99, borderColor: 'red', marginMm: 0, bleedMm: 2 })
        expect(r.offsetMm).toBe(8)
        expect(r.borderColor).toBe('#ffffff')
        expect(r.marginMm).toBe(3)
    })
})

describe('pełny eksport', () => {
    it('robi paczkę: PNG 2480×3508 300 DPI, DXF, SVG, instrukcję', async () => {
        const { makeCutout, toDataUrl } = await import('@/lib/lab/stickers/image.server')
        const { buildExport } = await import('@/lib/lab/stickers/export.server')
        // Czerwona gwiazda na białym tle, jak z Gemini.
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#fff"/>
            <polygon points="400,60 490,300 740,300 540,450 620,720 400,560 180,720 260,450 60,300 310,300" fill="#e11d48" stroke="#111" stroke-width="14"/></svg>`
        const png = await sharp(Buffer.from(svg)).png().toBuffer()
        const cut = await makeCutout(png, 'auto')
        expect(cut.removed).toBe(true)
        const meta = await sharp(cut.buf).metadata()
        expect(meta.hasAlpha).toBe(true)

        const out = await buildExport(
            [{ id: 'star', name: 'Gwiazda', src: toDataUrl(cut.buf, 'image/webp'), sizeMm: 50, qty: 6 }],
            { ...DEFAULT_SETTINGS, borderColor: '#fef08a' },
        )
        expect(out.count).toBe(6)
        const files = unzipSync(out.zip)
        const names = Object.keys(files).map((n) => n.split('/')[1])
        expect(names).toEqual(expect.arrayContaining(['arkusz_A4_300dpi.png', 'linie_ciecia.dxf', 'linie_ciecia.svg', 'podglad.jpg', 'INSTRUKCJA.txt', 'projekt.json']))
        const sheetMeta = await sharp(Buffer.from(out.files['arkusz_A4_300dpi.png'])).metadata()
        expect(sheetMeta.width).toBe(2480)
        expect(sheetMeta.height).toBe(3508)
        expect(sheetMeta.density).toBe(300)
        const dxf = strFromU8(out.files['linie_ciecia.dxf'])
        expect(dxf.match(/POLYLINE/g)?.length).toBe(6)

        // Linia cięcia leży w kolorze obwódki (żółty), a nie na białej kartce: sprawdzamy środek pierwszej naklejki.
        const p = out.layout.placements[0]
        const { data, info } = await sharp(Buffer.from(out.files['arkusz_A4_300dpi.png'])).raw().toBuffer({ resolveWithObject: true })
        const px = (xMm: number, yMm: number) => {
            const i = (Math.round(pxFromMm(yMm)) * info.width + Math.round(pxFromMm(xMm))) * info.channels
            return [data[i], data[i + 1], data[i + 2]]
        }
        const center = px(p.x + p.w / 2, p.y + p.h / 2)
        expect(center[0]).toBeGreaterThan(180) // czerwony środek gwiazdy
        expect(center[1]).toBeLessThan(90)
    }, 60_000)
})
