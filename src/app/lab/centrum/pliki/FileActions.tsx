'use client'

// "use client": schowek i pobieranie pliku działają tylko w przeglądarce.
import { useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'

const btn =
    'inline-flex items-center gap-1.5 rounded-md border border-zinc-700 hover:border-yellow-400/50 ' +
    'px-2.5 py-1.5 text-xs text-zinc-200 transition-colors'

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
            {done ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
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
            <Download size={12} /> Pobierz
        </button>
    )
}
