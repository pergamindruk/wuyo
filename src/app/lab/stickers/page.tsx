import type { Metadata } from 'next'
import { Sticker } from 'lucide-react'
import StickerStudio from './components/StickerStudio'
import FeatureAnimations from './components/FeatureAnimations'

export const metadata: Metadata = { title: 'Sticker Studio A4 | WUYO Lab', robots: { index: false, follow: false } }

/** Naklejki do druku i cięcia: Epson L18050 → laminat → Silhouette Cameo 5. Logowanie sprawdza layout /lab. */
export default function StickersPage() {
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
                        <Sticker size={26} className="text-yellow-400" /> Sticker Studio A4
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-zinc-400">
                        Grafika z Gemini albo z pliku, obwódka i linia cięcia w mm, skład na A4 w 300 DPI.
                        Na wyjściu PNG do druku na Epsonie L18050 i DXF do Silhouette Studio Basic (Cameo 5).
                    </p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-zinc-400">
                    {['Epson L18050', 'A4 · 300 DPI', 'Laminator rolowy', 'Cameo 5 · DXF 1:1'].map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">{t}</span>
                    ))}
                </div>
            </header>
            <StickerStudio />
            <FeatureAnimations />
        </div>
    )
}
