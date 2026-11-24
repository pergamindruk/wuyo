'use client'

// "use client": stan menu (zwinięte/rozwinięte, mobilne), aktywna strona i włącznik dźwięków.

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
    BarChart3, Bot, Calendar, FileSignature, FileText, FolderOpen, Hourglass, Inbox, Kanban, LogOut, Mail, MapPinned,
    Menu, PanelLeftClose, PanelLeftOpen, Radar, SearchCheck, Send, Shield, Sparkles, Sticker, Sun, TrendingUp, Users, Volume2,
    VolumeX, Wallet, Wand2, X, type LucideIcon,
} from 'lucide-react'
import { playSound, setSoundEnabled, soundEnabled } from '@/lib/lab/sound'

type NavItem = { href: string; label: string; icon: LucideIcon }

// Kolejność = rytm dnia: najpierw sprzedaż, potem prowadzenie studia, na końcu treści.
export const navGroups: { label: string; items: NavItem[] }[] = [
    {
        label: 'Sprzedaż',
        items: [
            { href: '/lab', label: 'Dziś', icon: Sun },
            { href: '/lab/asystent', label: 'Asystent', icon: Sparkles },
            { href: '/lab/crm', label: 'Zapytania', icon: Inbox },
            { href: '/lab/szukaj-firm', label: 'Szukaj firm', icon: MapPinned },
            { href: '/lab/klienci', label: 'Klienci', icon: Users },
            { href: '/lab/lejek', label: 'Lejek', icon: Kanban },
            { href: '/lab/oferty', label: 'Brief i oferta', icon: FileSignature },
            { href: '/lab/maile', label: 'Maile Harveya', icon: Mail },
            { href: '/lab/ai-studio', label: 'AI Studio', icon: Bot },
            { href: '/lab/sprzedaz', label: 'Sprzedaż (liczby)', icon: TrendingUp },
        ],
    },
    {
        label: 'Studio',
        items: [
            { href: '/lab/centrum', label: 'Centrum Dowodzenia', icon: Radar },
            { href: '/lab/centrum/pliki', label: 'Raporty i pliki', icon: FolderOpen },
            { href: '/lab/projects', label: 'Portal Klienta', icon: Hourglass },
            { href: '/lab/stickers', label: 'Sticker Studio A4', icon: Sticker },
            { href: '/lab/finances', label: 'Finanse i dokumenty', icon: FileText },
            { href: '/lab/doradca', label: 'Doradca i koszty', icon: Wallet },
        ],
    },
    {
        label: 'Treści i dane',
        items: [
            { href: '/lab/post', label: 'Generator postów', icon: Wand2 },
            { href: '/lab/calendar', label: 'Posty (plan)', icon: Calendar },
            { href: '/lab/publikuj', label: 'Publikuj', icon: Send },
            { href: '/lab/analytics', label: 'Statystyki strony', icon: BarChart3 },
            { href: '/lab/seo', label: 'SEO-radca', icon: SearchCheck },
            { href: '/lab/audit-log', label: 'Dziennik zmian', icon: Shield },
        ],
    },
]

const ALL = navGroups.flatMap((g) => g.items)

/** Aktywna pozycja = najdłuższy pasujący adres (np. /lab/centrum/pliki wygrywa z /lab/centrum). */
function activeHref(pathname: string) {
    return ALL.map((i) => i.href)
        .filter((h) => pathname === h || (h !== '/lab' && pathname.startsWith(`${h}/`)))
        .sort((a, b) => b.length - a.length)[0]
}

const NAV_KEY = 'wuyo-lab-nav'

/** Dymek z nazwą przy wąskim pasku: pozycja liczona z elementu, rysowany poza przewijanym menu. */
type Tip = { label: string; top: number; left: number } | null
type SetTip = (t: Tip) => void
const tipHandlers = (label: string, wide: boolean, showTip?: SetTip) => wide || !showTip ? {} : {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect()
        showTip({ label, top: r.top + r.height / 2, left: r.right + 12 })
    },
    onMouseLeave: () => showTip(null),
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect()
        showTip({ label, top: r.top + r.height / 2, left: r.right + 12 })
    },
    onBlur: () => showTip(null),
}

function NavLink({ item, active, wide, onClick, onTip }: { item: NavItem; active: boolean; wide: boolean; onClick?: () => void; onTip?: SetTip }) {
    const Icon = item.icon
    return (
        <Link
            href={item.href}
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            aria-label={wide ? undefined : item.label}
            {...tipHandlers(item.label, wide, onTip)}
            className={`group/nav relative flex shrink-0 items-center gap-3 rounded-2xl transition-all duration-200
                ${wide ? 'h-10 px-3' : 'h-11 w-11 justify-center'}
                ${active ? 'lab-chip text-zinc-950' : 'text-zinc-500 hover:bg-white/[0.06] hover:text-white'}`}
        >
            <Icon size={wide ? 17 : 19} strokeWidth={active ? 2.2 : 1.8} className="shrink-0 transition-transform duration-200 group-hover/nav:scale-110" />
            {wide && <span className={`truncate text-[13px] ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>}
        </Link>
    )
}

function RailButton({ label, wide, onClick, children, danger, sound, onTip }: {
    label: string; wide: boolean; onClick?: () => void; children: React.ReactNode; danger?: boolean; sound?: string; onTip?: SetTip
}) {
    return (
        <button
            type={onClick ? 'button' : 'submit'}
            onClick={onClick}
            data-sound={sound}
            aria-label={label}
            {...tipHandlers(label, wide, onTip)}
            className={`relative flex shrink-0 items-center gap-3 rounded-2xl text-zinc-500 transition-colors
                ${wide ? 'h-10 w-full px-3' : 'h-11 w-11 justify-center'}
                ${danger ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-white/[0.06] hover:text-white'}`}
        >
            {children}
            {wide && <span className="truncate text-[13px] font-medium">{label}</span>}
        </button>
    )
}

export default function Sidebar({ userEmail }: { userEmail?: string }) {
    const pathname = usePathname()
    const active = activeHref(pathname)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [wide, setWide] = useState(false)
    const [sound, setSound] = useState(true)
    const [tip, setTip] = useState<Tip>(null)

    useEffect(() => { setTip(null) }, [pathname, wide])
    useEffect(() => {
        try { setWide(localStorage.getItem(NAV_KEY) === 'wide') } catch { /* brak dostępu do pamięci: zostaje wąskie */ }
        setSound(soundEnabled())
    }, [])
    useEffect(() => { setMobileOpen(false) }, [pathname])

    const toggleWide = () => {
        const next = !wide
        setWide(next)
        try { localStorage.setItem(NAV_KEY, next ? 'wide' : 'rail') } catch { /* bez zapamiętania */ }
        playSound('pop')
    }
    const toggleSound = () => {
        const next = !sound
        setSoundEnabled(next)
        setSound(next)
        if (next) playSound('success')
    }

    const panel = (isWide: boolean, close?: () => void) => (
        <>
            <div className={`flex items-center gap-3 ${isWide ? 'px-1' : 'justify-center'}`}>
                <Link href="/lab" onClick={close} className="shrink-0 rounded-2xl shadow-[0_10px_30px_-10px_rgba(255,214,10,.6)] transition-transform hover:scale-105" aria-label="WUYO Lab">
                    <Image src="/favicon-wuyo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-2xl" priority />
                </Link>
                {isWide && (
                    <div className="min-w-0">
                        <p className="font-heading text-base font-bold leading-tight text-white">WUYO Lab</p>
                        {userEmail && <p className="truncate text-[10px] text-zinc-600">{userEmail}</p>}
                    </div>
                )}
            </div>

            <nav className={`mt-6 flex flex-1 flex-col gap-4 ${isWide ? '' : 'items-center'}`}>
                {navGroups.map((group, gi) => (
                    <div key={group.label} className={`flex flex-col gap-1 ${isWide ? '' : 'items-center'}`}>
                        {isWide
                            ? <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">{group.label}</p>
                            : gi > 0 && <span className="mb-2 h-px w-8 bg-white/[0.08]" />}
                        {group.items.map((item) => (
                            <NavLink key={item.href} item={item} active={item.href === active} wide={isWide} onClick={close} onTip={setTip} />
                        ))}
                    </div>
                ))}
            </nav>

            <div className={`mt-6 flex flex-col gap-1 border-t border-white/[0.06] pt-4 ${isWide ? '' : 'items-center'}`}>
                <RailButton label={sound ? 'Dźwięki włączone' : 'Dźwięki wyłączone'} wide={isWide} onClick={toggleSound} sound="off" onTip={setTip}>
                    {sound ? <Volume2 size={18} className="text-yellow-400" /> : <VolumeX size={18} />}
                </RailButton>
                {!close && (
                    <RailButton label={isWide ? 'Zwiń menu' : 'Pokaż nazwy'} wide={isWide} onClick={toggleWide} sound="off" onTip={setTip}>
                        {isWide ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </RailButton>
                )}
                <form action="/auth/signout" method="post" className={isWide ? 'w-full' : ''}>
                    <RailButton label="Wyloguj się" wide={isWide} danger onTip={setTip}><LogOut size={18} /></RailButton>
                </form>
            </div>
        </>
    )

    return (
        <>
            {/* Telefon: górny pasek + wysuwane menu z nazwami */}
            <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-[#0b0b0d]/90 px-4 py-3 backdrop-blur md:hidden print:hidden">
                <Link href="/lab" className="flex items-center gap-2.5">
                    <Image src="/favicon-wuyo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-xl" />
                    <span className="font-heading text-base font-bold text-white">WUYO Lab</span>
                </Link>
                <button type="button" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white">
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
            {mobileOpen && <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-[70] flex w-72 flex-col overflow-y-auto bg-[#0e0e11] p-5 transition-transform duration-300 md:hidden print:hidden
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {panel(true, () => setMobileOpen(false))}
            </aside>

            {/* Komputer: pasek ikon (z podpowiedziami) albo pełne menu z nazwami */}
            <aside className={`sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/[0.07]
                bg-gradient-to-b from-white/[0.05] to-white/[0.015] py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-[width] duration-300 md:flex print:hidden
                ${wide ? 'w-64 px-4' : 'w-[84px] items-center px-0'}`}
                style={{ scrollbarWidth: 'none' }}
                onScroll={() => setTip(null)}>
                {panel(wide)}
            </aside>
            {tip && (
                <span role="tooltip" className="pointer-events-none fixed z-[80] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-zinc-900/95 px-3 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur md:block"
                    style={{ top: tip.top, left: tip.left }}>
                    {tip.label}
                </span>
            )}
        </>
    )
}
