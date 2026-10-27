'use client'
// "use client": nasłuch globalnych skrótów (sekwencje g + litera, ?) i modal z fokusem
// — wymaga zdarzeń przeglądarki, więc nie może być komponentem serwerowym.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Keyboard, X } from 'lucide-react'

const SEQUENCES: Record<string, string> = {
    d: '/lab',
    l: '/lab/lejek',
    c: '/lab/centrum',
    r: '/lab/centrum/pliki',
    k: '/lab/crm',
    m: '/lab/maile',
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
    { keys: ['Ctrl', 'K'], label: 'Paleta poleceń' },
    { keys: ['/'], label: 'Szukaj' },
    { keys: ['g', 'd'], label: 'Przejdź do: Dziś' },
    { keys: ['g', 'l'], label: 'Przejdź do: Lejek' },
    { keys: ['g', 'c'], label: 'Przejdź do: Centrum' },
    { keys: ['g', 'r'], label: 'Przejdź do: Raporty i pliki' },
    { keys: ['g', 'k'], label: 'Przejdź do: CRM' },
    { keys: ['g', 'm'], label: 'Przejdź do: Maile Harveya' },
    { keys: ['1', '–', '4'], label: 'Wynik rozmowy (ekran Dziś)' },
    { keys: ['S'], label: 'Pomiń firmę (ekran Dziś)' },
    { keys: ['?'], label: 'Ta lista' },
    { keys: ['Esc'], label: 'Zamknij' },
]

function isEditable(t: EventTarget | null): boolean {
    if (!(t instanceof HTMLElement)) return false
    const tag = t.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable
}

export default function ShortcutsOverlay() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const openRef = useRef(false)
    const gAt = useRef(0)
    const returnFocus = useRef<HTMLElement | null>(null)
    const closeBtn = useRef<HTMLButtonElement>(null)

    const show = useCallback(() => {
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        openRef.current = true
        setOpen(true)
    }, [])

    const hide = useCallback(() => {
        openRef.current = false
        setOpen(false)
        const el = returnFocus.current
        if (el && document.contains(el)) el.focus()
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                // paleta przejmuje fokus — zamykamy tę nakładkę
                if (openRef.current) hide()
                return
            }
            if (e.ctrlKey || e.metaKey || e.altKey || isEditable(e.target)) return

            if (e.key === '?') {
                e.preventDefault()
                if (openRef.current) hide()
                else show()
                return
            }
            if (openRef.current) return

            const now = Date.now()
            if (gAt.current && now - gAt.current <= 1000) {
                gAt.current = 0
                const href = SEQUENCES[e.key.toLowerCase()]
                if (href) {
                    e.preventDefault()
                    router.push(href)
                }
                return
            }
            gAt.current = e.key === 'g' || e.key === 'G' ? now : 0
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [router, show, hide])

    useEffect(() => {
        if (open) closeBtn.current?.focus()
    }, [open])

    if (!open) return null

    const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            hide()
        } else if (e.key === 'Tab') {
            // pułapka fokusu: jedyny element interaktywny to przycisk zamknięcia
            e.preventDefault()
            closeBtn.current?.focus()
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) hide()
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="shortcuts-title"
                onKeyDown={onKeyDown}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl shadow-black/60"
            >
                <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                    <h2 id="shortcuts-title" className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
                        <Keyboard className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                        Skróty klawiszowe
                    </h2>
                    <button
                        ref={closeBtn}
                        type="button"
                        onClick={hide}
                        aria-label="Zamknij"
                        className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <ul className="divide-y divide-zinc-800/60 px-5 py-2">
                    {SHORTCUTS.map((s) => (
                        <li key={s.label} className="flex items-center justify-between py-2.5 text-sm text-zinc-300">
                            <span>{s.label}</span>
                            <span className="flex gap-1">
                                {s.keys.map((k, i) => (
                                    <kbd
                                        key={`${k}-${i}`}
                                        className="min-w-[1.5rem] rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-center text-xs text-zinc-300"
                                    >
                                        {k}
                                    </kbd>
                                ))}
                            </span>
                        </li>
                    ))}
                </ul>
                <p className="border-t border-zinc-800 px-5 py-3 text-[11px] text-zinc-500">
                    Sekwencje „g” + litera: druga litera w ciągu 1 s. Nie działają w polach tekstowych.
                </p>
            </div>
        </div>
    )
}
