'use client'

// "use client": schowek i pobieranie pliku działają tylko w przeglądarce.
import { useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'

const btn =
    'inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 hover:text-white ' +
    'px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors'

export function CopyButton({ text, label = 'Kopiuj' }: { text: string; label?: string }) {
    const [done, setDone] = useState(false)
    return (
        <button
            type="button"
            className={btn}
            onClick={async () => {
                try {
                    await navigator.clipboard.writeText(text)
                    setDone(true)
                    setTimeout(() => setDone(false), 1500)
                } catch {
                    setDone(false)
                }
            }}
        >
            {done ? <Check size={14} strokeWidth={1.8} className="text-emerald-400" /> : <Copy size={14} strokeWidth={1.8} className="text-yellow-400" />}
            {done ? 'Skopiowane' : label}
        </button>
    )
}

export function DownloadButton({ text, filename }: { text: string; filename: string }) {
    return (
        <button
            type="button"
            className={btn}
            onClick={() => {
                // BOM, żeby Excel poprawnie pokazał polskie znaki w CSV.
                const blob = new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                a.click()
                URL.revokeObjectURL(url)
            }}
        >
            <Download size={14} strokeWidth={1.8} className="text-yellow-400" /> Pobierz
        </button>
    )
}
