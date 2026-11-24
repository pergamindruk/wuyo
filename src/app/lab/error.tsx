'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function LabError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Lab error:', error)
    }, [error])

    return (
        <div className="flex min-h-[70vh] items-center justify-center p-4">
            <div className="lab-card w-full max-w-md p-8 text-center sm:p-10">
                <span aria-hidden="true" className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
                <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/15 text-red-300 ring-1 ring-red-400/25">
                    <AlertTriangle size={24} strokeWidth={1.8} />
                </span>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-300/80">Błąd panelu</p>
                <h2 className="mb-3 font-heading text-2xl font-bold text-white">Coś poszło nie tak</h2>
                <p className="mb-8 break-words text-sm text-zinc-400">{error.message || 'Nieoczekiwany błąd serwera.'}</p>
                <button
                    type="button"
                    onClick={reset}
                    className="lab-btn inline-flex min-h-12 items-center gap-2 px-6 text-sm font-bold"
                >
                    <RotateCcw size={16} /> Spróbuj ponownie
                </button>
                {error.digest && <p className="mt-4 font-mono text-[10px] text-zinc-600">kod: {error.digest}</p>}
            </div>
        </div>
    )
}
