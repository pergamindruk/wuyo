'use client'

// "use client": przycisk otwiera paletę poleceń (ten sam skrót co Ctrl+K).

import { Search } from 'lucide-react'

export function SearchPill() {
    const open = () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    return (
        <button type="button" onClick={open} data-sound="pop"
            className="lab-pill flex h-11 min-w-0 items-center gap-3 px-4 text-sm text-zinc-500 transition hover:border-yellow-400/60 hover:text-zinc-300 sm:w-72">
            <span className="flex-1 text-left">Szukaj</span>
            <kbd className="hidden rounded-md bg-white/[0.06] px-1.5 py-0.5 font-sans text-[11px] text-zinc-400 sm:inline">Ctrl K</kbd>
            <Search size={16} className="text-zinc-400" />
        </button>
    )
}
