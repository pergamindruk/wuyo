'use client'

import { useEffect } from 'react'

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
        <div className="min-h-screen flex items-center justify-center bg-navy">
            <div className="glass-card p-10 max-w-md text-center">
                <p className="text-gold font-bold text-xs uppercase tracking-widest mb-3">Błąd panelu</p>
                <h2 className="text-white text-2xl font-bold mb-4">Coś poszło nie tak</h2>
                <p className="text-white/50 text-sm mb-8">{error.message || 'Nieoczekiwany błąd serwera.'}</p>
                <button
                    onClick={reset}
                    className="btn-gold text-sm px-6 py-3"
                >
                    Spróbuj ponownie
                </button>
            </div>
        </div>
    )
}
