import type { Metadata } from 'next'
import { Sticker } from 'lucide-react'
import { PageHeader } from '@/components/lab/ui/PageHeader'
import StickerStudio from './components/StickerStudio'
import FeatureAnimations from './components/FeatureAnimations'

export const metadata: Metadata = { title: 'Sticker Studio A4 | WUYO Lab', robots: { index: false, follow: false } }

/** Naklejki do druku i cięcia: Epson L18050 → laminat → Silhouette Cameo 5. Logowanie sprawdza layout /lab. */
export default function StickersPage() {
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={Sticker}
                title="Sticker Studio A4"
                subtitle={
                    <span className="block max-w-2xl">
                        Grafika z Gemini albo z pliku, obwódka i linia cięcia w mm, skład na A4 w 300 DPI.
                        Na wyjściu PNG do druku na Epsonie L18050 i DXF do Silhouette Studio Basic (Cameo 5).
                    </span>
                }
                actions={['Epson L18050', 'A4 · 300 DPI', 'Laminator rolowy', 'Cameo 5 · DXF 1:1'].map((t) => (
                    <span key={t} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">{t}</span>
                ))}
            />
            <StickerStudio />
            <FeatureAnimations />
        </div>
    )
}
