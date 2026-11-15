import { A4, REG_MARKS, pathD, regMarkZones, type Layout } from '@/lib/lab/stickers/geometry'
import type { StickerGeometry, StickerSettings } from '@/lib/lab/stickers/types'

/**
 * Podgląd arkusza A4 210 × 297 mm na żywo. SVG w milimetrach, więc to, co widać,
 * ma te same wymiary co eksport. Bez "use client": renderuje go StickerStudio.
 */

export type PreviewDesign = { id: string; src: string; geo: StickerGeometry; approx: boolean }

type Props = {
    layout: Layout
    designs: Map<string, PreviewDesign>
    settings: StickerSettings
    showCut: boolean
    selectedId: string | null
    onSelect: (id: string) => void
}

export default function SheetPreviewA4({ layout, designs, settings, showCut, selectedId, onSelect }: Props) {
    const m = settings.marginMm
    const { inset: i, length: l, square: sq, thickness: t } = REG_MARKS
    return (
        <svg viewBox={`0 0 ${A4.w} ${A4.h}`} className="h-auto w-full rounded-md bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]" role="img" aria-label="Podgląd arkusza A4">
            <defs>
                <pattern id="sp-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="3" height="3" fill="#fef3c7" /><path d="M0 0v3" stroke="#f59e0b" strokeWidth="0.6" strokeOpacity="0.5" />
                </pattern>
                <linearGradient id="sp-gloss" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" /><stop offset="0.56" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
            </defs>

            {settings.regMarks && (
                <g>
                    {regMarkZones().map((z, k) => <rect key={k} x={z.x} y={z.y} width={z.w} height={z.h} fill="url(#sp-hatch)" />)}
                    <rect x={i} y={i} width={sq} height={sq} fill="#111" />
                    <path d={`M${A4.w - i - l} ${i}H${A4.w - i}V${i + l}`} stroke="#111" strokeWidth={t} fill="none" />
                    <path d={`M${i} ${A4.h - i - l}V${A4.h - i}H${i + l}`} stroke="#111" strokeWidth={t} fill="none" />
                </g>
            )}
            <rect x={m} y={m} width={A4.w - 2 * m} height={A4.h - 2 * m} fill="none" stroke="#3b82f6" strokeWidth="0.3" strokeDasharray="2 2" strokeOpacity="0.6" />

            {layout.placements.map((p, k) => {
                const d = designs.get(p.id)
                if (!d) return null
                const tr = p.rotated ? `translate(${p.x + p.w} ${p.y}) rotate(90)` : `translate(${p.x} ${p.y})`
                const path = pathD(d.geo.contour)
                const selected = p.id === selectedId
                return (
                    <g key={k} transform={tr} onClick={() => onSelect(p.id)} className="cursor-pointer">
                        <path d={path} fill={settings.borderColor} stroke={settings.borderColor === '#ffffff' ? '#e4e4e7' : 'none'} strokeWidth="0.2" />
                        <image href={d.src} x={d.geo.img.x} y={d.geo.img.y} width={d.geo.img.w} height={d.geo.img.h} preserveAspectRatio="none" />
                        {showCut && (
                            <path d={path} fill="none" stroke={selected ? '#2563eb' : '#ef4444'} strokeWidth={selected ? 0.6 : 0.35} strokeDasharray={d.approx ? '1.5 1.5' : undefined} />
                        )}
                    </g>
                )
            })}

            {settings.laminate === 'blysk' && <rect width={A4.w} height={A4.h} fill="url(#sp-gloss)" pointerEvents="none" />}
            {settings.laminate === 'mat' && <rect width={A4.w} height={A4.h} fill="#f4f4f5" fillOpacity="0.12" pointerEvents="none" />}
        </svg>
    )
}
