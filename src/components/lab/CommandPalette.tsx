'use client'
// "use client": globalne skróty klawiszowe, fokus, stan wyszukiwarki i localStorage
// — wyłącznie interaktywna wyspa, nie da się tego zrobić w RSC.

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ComponentType, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
    BarChart3, Bot, Briefcase, Building2, Calendar, Clock, CornerDownLeft, FileText,
    Filter, Home, Inbox, Hourglass, LogOut, Phone, Plus, Radar, Search, Shield, Star,
    User, Zap,
} from 'lucide-react'
import { searchLab, type SearchResult } from '@/app/lab/search/actions'
import { telHref } from '@/lib/lab/today/format'

type IconType = ComponentType<{ className?: string }>

interface PaletteItem {
    id: string
    group: string
    label: string
    hint?: string
    keys?: string[]
    icon: IconType
    keywords?: string
    /** Gdy ustawione, wybór trafia do "Ostatnio używane". */
    href?: string
    run: () => void
}

interface RecentEntry {
    id: string
    label: string
    hint?: string
    href: string
}

const RECENT_KEY = 'wuyo.lab.palette.recent'
const RECENT_MAX = 5

const PAGES: { id: string; label: string; href: string; icon: IconType; keys?: string[] }[] = [
    { id: 'p-today', label: 'Dziś', href: '/lab', icon: Home, keys: ['g', 'd'] },
    { id: 'p-funnel', label: 'Lejek', href: '/lab/lejek', icon: Filter, keys: ['g', 'l'] },
    { id: 'p-centrum', label: 'Centrum Dowodzenia', href: '/lab/centrum', icon: Radar, keys: ['g', 'c'] },
    { id: 'p-pliki', label: 'Raporty i pliki', href: '/lab/centrum/pliki', icon: Radar, keys: ['g', 'r'] },
    { id: 'p-crm', label: 'CRM i leady', href: '/lab/crm', icon: Inbox, keys: ['g', 'k'] },
    { id: 'p-projects', label: 'Portal klienta', href: '/lab/projects', icon: Hourglass },
    { id: 'p-finances', label: 'Finanse i dokumenty', href: '/lab/finances', icon: FileText },
    { id: 'p-ai', label: 'AI Studio', href: '/lab/ai-studio', icon: Bot },
    { id: 'p-calendar', label: 'Kalendarz postów', href: '/lab/calendar', icon: Calendar },
    { id: 'p-social', label: 'Social Dashboard', href: '/lab/social-dashboard', icon: Zap },
    { id: 'p-analytics', label: 'Analityka', href: '/lab/analytics', icon: BarChart3 },
    { id: 'p-testimonials', label: 'Opinie klientów', href: '/lab/testimonials', icon: Star },
    { id: 'p-audit', label: 'Dziennik zdarzeń', href: '/lab/audit-log', icon: Shield },
]

/** Bez wielkości liter i polskich znaków, długość tekstu zachowana. */
function fold(s: string): string {
    let out = ''
    for (const ch of s) {
        const base = ch === 'ł' || ch === 'Ł' ? 'l' : ch.normalize('NFD').replace(/[̀-ͯ]/g, '')
        out += (base[0] ?? ch).toLowerCase()
    }
    return out
}

function isEditable(t: EventTarget | null): boolean {
    if (!(t instanceof HTMLElement)) return false
    const tag = t.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable
}

function Highlight({ text, query }: { text: string; query: string }): ReactNode {
    const q = fold(query.trim())
    if (!q) return text
    const idx = fold(text).indexOf(q)
    if (idx < 0) return text
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-transparent font-semibold text-yellow-400">{text.slice(idx, idx + q.length)}</mark>
            {text.slice(idx + q.length)}
        </>
    )
}

function readRecent(): RecentEntry[] {
    try {
        const raw = window.localStorage.getItem(RECENT_KEY)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed
            .filter(
                (e): e is RecentEntry =>
                    typeof e === 'object' && e !== null &&
                    typeof (e as RecentEntry).id === 'string' &&
                    typeof (e as RecentEntry).label === 'string' &&
                    typeof (e as RecentEntry).href === 'string',
            )
            .slice(0, RECENT_MAX)
    } catch {
        return []
    }
}

function writeRecent(entry: RecentEntry): void {
    try {
        const next = [entry, ...readRecent().filter((e) => e.id !== entry.id)].slice(0, RECENT_MAX)
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
        // localStorage niedostępny — pomijamy
    }
}

export default function CommandPalette() {
    const router = useRouter()
    const uid = useId()
    const listId = `${uid}-list`
    const optId = (i: number) => `${uid}-opt-${i}`

    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const [recent, setRecent] = useState<RecentEntry[]>([])
    const [remote, setRemote] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)

    const inputRef = useRef<HTMLInputElement>(null)
    const returnFocus = useRef<HTMLElement | null>(null)
    const reqId = useRef(0)

    const openPalette = useCallback(() => {
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        setQuery('')
        setActive(0)
        setRemote([])
        setLoading(false)
        setRecent(readRecent())
        setOpen(true)
    }, [])

    const closePalette = useCallback(() => {
        reqId.current += 1
        setOpen(false)
        const el = returnFocus.current
        if (el && document.contains(el)) el.focus()
    }, [])

    // Globalne skróty otwierające
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                if (open) closePalette()
                else openPalette()
                return
            }
            if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !open && !isEditable(e.target)) {
                e.preventDefault()
                openPalette()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, openPalette, closePalette])

    // Fokus na polu po otwarciu + blokada przewijania tła
    useEffect(() => {
        if (!open) return
        const raf = requestAnimationFrame(() => inputRef.current?.focus())
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            cancelAnimationFrame(raf)
            document.body.style.overflow = prev
        }
    }, [open])

    // Wyszukiwanie po serwerze z debounce 200 ms
    useEffect(() => {
        if (!open) return
        const q = query.trim()
        if (q.length < 2) return
        const id = ++reqId.current
        const t = window.setTimeout(async () => {
            setLoading(true)
            try {
                const res = await searchLab(q)
                if (id === reqId.current) setRemote(res)
            } catch {
                if (id === reqId.current) setRemote([])
            } finally {
                if (id === reqId.current) setLoading(false)
            }
        }, 200)
        return () => window.clearTimeout(t)
    }, [query, open])

    const go = useCallback((href: string) => {
        router.push(href)
    }, [router])

    const signOut = useCallback(async () => {
        try {
            // trasa wylogowania przyjmuje tylko POST
            await fetch('/auth/signout', { method: 'POST' })
        } finally {
            window.location.assign('/lab/login')
        }
    }, [])

    const staticItems = useMemo<PaletteItem[]>(() => {
        const pages: PaletteItem[] = PAGES.map((p) => ({
            id: p.id, group: 'Przejdź do', label: p.label, keys: p.keys, icon: p.icon,
            href: p.href, run: () => go(p.href),
        }))
        const actions: PaletteItem[] = [
            { id: 'a-call', group: 'Akcje', label: 'Zacznij dzwonić', icon: Phone, keywords: 'kolejka telefon',
              href: '/lab#kolejka', run: () => go('/lab#kolejka') },
            { id: 'a-newjob', group: 'Akcje', label: 'Nowe zlecenie', icon: Plus, keywords: 'dodaj lejek',
              href: '/lab/lejek?nowe=1', run: () => go('/lab/lejek?nowe=1') },
            { id: 'a-centrum', group: 'Akcje', label: 'Centrum Dowodzenia', icon: Radar,
              href: '/lab/centrum', run: () => go('/lab/centrum') },
            { id: 'a-signout', group: 'Akcje', label: 'Wyloguj', icon: LogOut, keywords: 'wyjdź',
              run: () => { void signOut() } },
        ]
        return [...pages, ...actions]
    }, [go, signOut])

    const items = useMemo<PaletteItem[]>(() => {
        const q = fold(query.trim())
        const out: PaletteItem[] = []
        if (!q) {
            for (const r of recent) {
                out.push({
                    id: `r-${r.id}`, group: 'Ostatnio używane', label: r.label, hint: r.hint, icon: Clock,
                    href: r.href, run: () => go(r.href),
                })
            }
        }
        const matches = q
            ? staticItems.filter((i) => fold(`${i.label} ${i.keywords ?? ''}`).includes(q))
            : staticItems
        out.push(...matches)
        if (q.length >= 2) {
            for (const r of remote) {
                const icon: IconType = r.kind === 'call' ? Building2 : r.kind === 'client' ? User : Briefcase
                const tel = r.kind !== 'job' && r.phone ? telHref(r.phone) : null
                out.push({
                    id: `s-${r.kind}-${r.id}`, group: 'Firmy i klienci', label: r.title,
                    hint: tel ? `${r.subtitle} · Zadzwoń` : r.subtitle, icon,
                    href: tel ? undefined : r.href,
                    run: () => {
                        if (tel) window.location.href = tel
                        else go(r.href)
                    },
                })
            }
        }
        return out
    }, [query, recent, remote, staticItems, go])

    const current = items.length ? Math.min(active, items.length - 1) : -1

    // Przewiń aktywny wiersz w widok
    useEffect(() => {
        if (!open || current < 0) return
        document.getElementById(`${uid}-opt-${current}`)?.scrollIntoView({ block: 'nearest' })
    }, [current, open, uid])

    const choose = (item: PaletteItem) => {
        if (item.href) {
            const id = item.id.startsWith('r-') ? item.id.slice(2) : item.id
            writeRecent({ id, label: item.label, hint: item.hint, href: item.href })
        }
        closePalette()
        item.run()
    }

    const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            closePalette()
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (items.length) setActive((current + 1) % items.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (items.length) setActive((current - 1 + items.length) % items.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (current >= 0) choose(items[current])
        } else if (e.key === 'Tab') {
            // pułapka fokusu: jedyny element interaktywny to pole wyszukiwania
            e.preventDefault()
            inputRef.current?.focus()
        }
    }

    // Grupy w kolejności pojawiania się
    const groups: { name: string; entries: { item: PaletteItem; index: number }[] }[] = []
    items.forEach((item, index) => {
        let g = groups.find((x) => x.name === item.group)
        if (!g) {
            g = { name: item.group, entries: [] }
            groups.push(g)
        }
        g.entries.push({ item, index })
    })

    const q = query.trim()

    return (
        <>
            {!open && (
                <button
                    type="button"
                    onClick={openPalette}
                    aria-label="Szukaj w panelu"
                    className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-yellow-400 shadow-lg shadow-black/50 active:scale-95 md:hidden"
                >
                    <Search className="h-5 w-5" aria-hidden="true" />
                </button>
            )}

            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closePalette()
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Paleta poleceń"
                        onKeyDown={onKeyDown}
                        className="w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 shadow-2xl shadow-black/60"
                    >
                        <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
                            <Search className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => {
                                    const v = e.target.value
                                    setQuery(v)
                                    setActive(0)
                                    if (v.trim().length < 2) {
                                        reqId.current += 1
                                        setRemote([])
                                        setLoading(false)
                                    }
                                }}
                                role="combobox"
                                aria-expanded="true"
                                aria-controls={listId}
                                aria-autocomplete="list"
                                aria-activedescendant={current >= 0 ? optId(current) : undefined}
                                aria-label="Szukaj lub wpisz polecenie"
                                placeholder="Szukaj stron, akcji, firm, klientów…"
                                autoComplete="off"
                                spellCheck={false}
                                className="h-14 flex-1 bg-transparent text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
                            />
                            <kbd className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500">Esc</kbd>
                        </div>

                        <div
                            id={listId}
                            role="listbox"
                            aria-label="Wyniki"
                            className="max-h-[50vh] overflow-y-auto p-2"
                        >
                            {groups.map((g) => (
                                <div key={g.name} role="group" aria-label={g.name} className="mb-1">
                                    <div aria-hidden="true" className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                                        {g.name}
                                    </div>
                                    {g.entries.map(({ item, index }) => {
                                        const Icon = item.icon
                                        const isActive = index === current
                                        return (
                                            <div
                                                key={item.id}
                                                id={optId(index)}
                                                role="option"
                                                aria-selected={isActive}
                                                onMouseMove={() => setActive(index)}
                                                onClick={() => choose(item)}
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                                                    isActive ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-300'
                                                }`}
                                            >
                                                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-yellow-400' : 'text-zinc-500'}`} />
                                                <span className="min-w-0 flex-1 truncate">
                                                    <Highlight text={item.label} query={q} />
                                                    {item.hint && (
                                                        <span className="ml-2 text-xs text-zinc-500">{item.hint}</span>
                                                    )}
                                                </span>
                                                {item.keys && (
                                                    <span className="flex shrink-0 gap-1" aria-hidden="true">
                                                        {item.keys.map((k) => (
                                                            <kbd key={k} className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] uppercase text-zinc-400">
                                                                {k}
                                                            </kbd>
                                                        ))}
                                                    </span>
                                                )}
                                                {isActive && !item.keys && (
                                                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}

                            {items.length === 0 && !loading && (
                                <p className="px-3 py-8 text-center text-sm text-zinc-500">Nic nie znaleziono.</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 text-[11px] text-zinc-500">
                            <span aria-live="polite">{loading ? 'Szukam…' : `Wyniki: ${items.length}`}</span>
                            <span className="hidden gap-3 sm:flex">
                                <span>↑↓ wybierz</span>
                                <span>Enter otwórz</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
