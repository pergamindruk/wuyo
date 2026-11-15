import { zipSync, strToU8, type Zippable } from 'fflate'
import {
    A4, REG_MARKS, bbox, layoutSheet, pathD, placeContour, regMarkZones, toDxf, toSvg,
    type Layout, type Pt,
} from './geometry'
import { StickerError, composeProof, composeSheet, decodeDataUrl, prepareSticker, renderTile, rotateTile, type Tile } from './image.server'
import type { DesignInput, StickerGeometry, StickerSettings } from './types'

const LAMINATE_LABEL = { blysk: 'błyszczący', mat: 'matowy', brak: 'bez laminatu' } as const

/** Punkt wyjścia do testu cięcia na Cameo 5. Zawsze najpierw cięcie testowe. */
const CUT_HINT = {
    brak: 'ostrze 2, nacisk 10, prędkość 5, 1 przejście',
    mat: 'ostrze 3, nacisk 18, prędkość 4, 1 przejście',
    blysk: 'ostrze 3, nacisk 20, prędkość 4, 1 przejście',
} as const

export type ExportResult = {
    zip: Uint8Array
    /** Te same pliki osobno (zapis lokalny w output/stickers). */
    files: Record<string, Uint8Array>
    name: string
    layout: Layout
    count: number
    cutBox: { x: number; y: number; w: number; h: number }
}

function proofSvg(polys: Pt[][], s: StickerSettings): string {
    const zones = s.regMarks
        ? regMarkZones().map((z) => `<rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" fill="#f59e0b" fill-opacity="0.12"/>`).join('')
        : ''
    const m = s.marginMm
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${A4.w} ${A4.h}">${zones}` +
        `<rect x="${m}" y="${m}" width="${A4.w - 2 * m}" height="${A4.h - 2 * m}" fill="none" stroke="#3b82f6" stroke-width="0.3" stroke-dasharray="2 2"/>` +
        polys.map((p) => `<path d="${pathD(p)}" fill="none" stroke="#ff0000" stroke-width="0.35"/>`).join('') +
        '</svg>'
}

function instructions(s: StickerSettings, count: number, cutBox: ExportResult['cutBox'], skipped: string[]): string {
    const f = (n: number) => n.toFixed(2).replace('.', ',')
    return [
        'WUYO Sticker Studio A4: jak wydrukować i wyciąć',
        '',
        `Naklejek na arkuszu: ${count}. Offset cięcia: ${f(s.offsetMm)} mm, spad: ${f(s.bleedMm)} mm, laminat: ${LAMINATE_LABEL[s.laminate]}.`,
        skipped.length ? `Nie zmieściło się: ${skipped.join(', ')}.` : '',
        '',
        'W PACZCE',
        '  arkusz_A4_300dpi.png  plik do druku, 2480 x 3508 px, bez linii cięcia',
        '  linie_ciecia.dxf      linie cięcia 1:1 w mm, dla Silhouette Studio Basic',
        '  linie_ciecia.svg      to samo w SVG (Designer Edition, Inkscape)',
        '  podglad.jpg           arkusz z liniami cięcia, do sprawdzenia przed drukiem',
        '  projekt.json          wczytasz go z powrotem w /lab/stickers',
        '',
        '1. SILHOUETTE STUDIO',
        '  Ustawienia strony: A4, pionowo, Cameo 5.',
        s.regMarks
            ? `  Znaczniki rejestracyjne: włącz, Typ 1, odstęp od krawędzi ${REG_MARKS.inset} mm, długość ${REG_MARKS.length} mm.`
            : '  Znaczniki rejestracyjne były wyłączone przy składzie. Włącz je i sprawdź, czy nic nie wchodzi w ich pole.',
        '  Wstaw arkusz_A4_300dpi.png i ustaw: X 0, Y 0, szerokość 210 mm, wysokość 297 mm.',
        '  Otwórz linie_ciecia.dxf, skopiuj wszystkie linie do dokumentu z arkuszem.',
        `  Zaznacz same linie i w oknie Przekształć ustaw: X ${f(cutBox.x)} mm, Y ${f(cutBox.y)} mm`,
        `  (szerokość ${f(cutBox.w)} mm, wysokość ${f(cutBox.h)} mm). Wtedy linie siedzą idealnie na grafice.`,
        '  Zablokuj proporcje, nie skaluj.',
        '',
        '2. DRUK (Epson L18050)',
        '  Drukuj z Silhouette Studio (wtedy wydrukują się znaczniki). Skala 100%, bez dopasowania do strony.',
        '  Jakość: wysoka, rodzaj papieru zgodny z folią (dla folii błyszczącej: Photo Paper Glossy).',
        '  Odczekaj kilka minut, aż tusz wyschnie, zanim nałożysz laminat.',
        '',
        '3. LAMINAT',
        s.laminate === 'brak'
            ? '  Bez laminatu: od razu do cięcia.'
            : '  Laminuj na zimno, bez pęcherzy. Błyszczący laminat potrafi odbijać światło na znacznikach:\n' +
              '  jeśli Cameo ich nie widzi, nie zakrywaj laminatem rogów ze znacznikami albo użyj matowego.',
        '',
        '4. CIĘCIE (Cameo 5)',
        `  Punkt wyjścia: ${CUT_HINT[s.laminate]}. Najpierw cięcie testowe.`,
        '  Cięcie po obrysie (kiss cut): tnie folię i laminat, podkład zostaje cały.',
        '  Wyślij > Wykryj znaczniki > Tnij.',
        '',
    ].filter((l) => l !== '').join('\n').replace(/\n(\d\.|W PACZCE)/g, '\n\n$1') + '\n'
}

export async function buildExport(designs: DesignInput[], s: StickerSettings, now = new Date()): Promise<ExportResult> {
    const prepared = new Map<string, { tile: Tile; rotated: Tile | null; geo: StickerGeometry }>()
    // Po kolei, nie równolegle: każda naklejka to kilka masek po kilka MB.
    for (const d of designs) {
        const p = await prepareSticker(decodeDataUrl(d.src), d.sizeMm, s)
        const tile = await renderTile(p, s)
        prepared.set(d.id, { tile, rotated: s.rotate ? await rotateTile(tile) : null, geo: p.geo })
    }
    const layout = layoutSheet(
        designs.map((d) => ({ id: d.id, w: prepared.get(d.id)!.geo.w, h: prepared.get(d.id)!.geo.h, qty: d.qty })),
        s,
    )
    if (!layout.placements.length) throw new StickerError('Na arkuszu nic się nie zmieściło. Zmniejsz naklejki albo margines.')
    const polys = layout.placements.map((p) => placeContour(prepared.get(p.id)!.geo.contour, p))
    const sheet = await composeSheet(layout.placements, prepared)
    const proof = await composeProof(sheet, proofSvg(polys, s))
    const all = bbox(polys.flat())
    const cutBox = { x: all.x, y: all.y, w: all.w, h: all.h }
    const skipped = Object.entries(layout.overflow).map(([id, n]) => `${designs.find((d) => d.id === id)?.name ?? id} x${n}`)

    const stamp = now.toLocaleString('sv-SE', { timeZone: 'Europe/Warsaw' }).slice(0, 16).replace(/[-: ]/g, '').replace(/^(\d{8})/, '$1_')
    const name = `naklejki_${stamp}`
    const project = {
        app: 'wuyo-sticker-studio',
        version: 1,
        createdAt: now.toISOString(),
        settings: s,
        designs: designs.map(({ id, name, src, sizeMm, qty }) => ({ id, name, src, sizeMm, qty })),
    }
    const files: Record<string, Uint8Array> = {
        'arkusz_A4_300dpi.png': new Uint8Array(sheet),
        'linie_ciecia.dxf': new Uint8Array(strToU8(toDxf(polys))),
        'linie_ciecia.svg': new Uint8Array(strToU8(toSvg(polys))),
        'podglad.jpg': new Uint8Array(proof),
        'INSTRUKCJA.txt': new Uint8Array(strToU8(instructions(s, layout.placements.length, cutBox, skipped))),
        'projekt.json': new Uint8Array(strToU8(JSON.stringify(project))),
    }
    const zippable: Zippable = {}
    for (const [file, data] of Object.entries(files)) {
        // PNG i JPG są już skompresowane: bez ponownego pakowania jest szybciej.
        zippable[`${name}/${file}`] = /\.(png|jpg)$/.test(file) ? [data, { level: 0 }] : data
    }
    return { zip: zipSync(zippable, { level: 6 }), files, name, layout, count: layout.placements.length, cutBox }
}
