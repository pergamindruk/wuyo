import { useEffect, useState, type ReactNode } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { pathD } from '@/lib/lab/stickers/geometry'
import type { StickerGeometry, StickerSettings } from '@/lib/lab/stickers/types'

/**
 * Lupa: pełnoekranowy podgląd z przybliżeniem (100–400%) i przewijaniem.
 * Bez "use client": renderuje ją StickerStudio (komponent kliencki).
 */

const ZOOMS = [1, 1.5, 2, 3, 4]

export default function ZoomModal({ title, onClose, children, side, baseMax = 900 }: {
    title: string
    onClose: () => void
    /** Treść do powiększenia (SVG o szerokości 100%). */
    children: ReactNode
    side?: ReactNode
    /** Szerokość przy 100% (px). */
    baseMax?: number
}) {
    const [zi, setZi] = useState(0)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') return onClose()
            // Przy pisaniu w polu tekstowym + i - to zwykłe znaki.
            if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return
            if (e.key === '+' || e.key === '=') setZi((z) => Math.min(ZOOMS.length - 1, z + 1))
            if (e.key === '-') setZi((z) => Math.max(0, z - 1))
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const zoom = ZOOMS[zi]
    return (
        <div className="fixed inset-0 z-[90] flex flex-col bg-black/85 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <p className="truncate text-sm font-semibold text-white">{title}</p>
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-full border border-white/10 text-xs text-zinc-300">
                        <button onClick={() => setZi((z) => Math.max(0, z - 1))} disabled={zi === 0} className="p-2 hover:text-white disabled:opacity-30" aria-label="Oddal"><Minus size={14} /></button>
                        <span className="w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZi((z) => Math.min(ZOOMS.length - 1, z + 1))} disabled={zi === ZOOMS.length - 1} className="p-2 hover:text-white disabled:opacity-30" aria-label="Przybliż"><Plus size={14} /></button>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Zamknij (Esc)"><X size={18} /></button>
                </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-8">
                    <div className="mx-auto" style={{ width: `${zoom * 100}%`, maxWidth: baseMax * zoom }}>
                        {children}
                    </div>
                </div>
                {side && <aside className="max-h-[45vh] shrink-0 overflow-y-auto border-t border-white/10 p-4 lg:max-h-none lg:w-[380px] lg:border-l lg:border-t-0">{side}</aside>}
            </div>
        </div>
    )
}

/** Jedna naklejka w dużym podglądzie: obwódka, grafika, linia cięcia. */
export function StickerCloseup({ src, geo, settings, showCut }: { src: string; geo: StickerGeometry; settings: StickerSettings; showCut: boolean }) {
    const pad = settings.bleedMm + 3
    const d = pathD(geo.contour)
    return (
        <div className="rounded-2xl bg-[repeating-conic-gradient(#3f3f46_0_25%,#27272a_0_50%)] bg-[length:24px_24px] p-4">
            <svg viewBox={`${-pad} ${-pad} ${geo.w + 2 * pad} ${geo.h + 2 * pad}`} className="h-auto w-full">
                <path d={d} fill={settings.borderColor} stroke={settings.borderColor} strokeWidth={settings.bleedMm * 2} strokeLinejoin="round" />
                <image href={src} x={geo.img.x} y={geo.img.y} width={geo.img.w} height={geo.img.h} preserveAspectRatio="none" />
                {showCut && <path d={d} fill="none" stroke="#ef4444" strokeWidth={0.25} strokeDasharray="1 0.6" />}
            </svg>
        </div>
    )
}
