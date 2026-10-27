'use client'

// Wyspa kliencka tylko dla schowka. Reszta strony opinii to komponent serwerowy.
import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setCopied(false)
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition-colors whitespace-nowrap"
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Skopiowane' : label}
        </button>
    )
}
