'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogOut, Bot, Menu, X, Inbox, Calendar, FileText, BarChart3, Hourglass, Shield, Star, Radar, Kanban, Sun, Mail } from 'lucide-react'

const navGroups = [
    // Kolejność = rytm dnia: najpierw sprzedaż, potem prowadzenie studia, na końcu treści.
    {
        label: 'Sprzedaż',
        items: [
            { href: '/lab', label: 'Dziś', icon: Sun },
            { href: '/lab/ai-studio', label: 'AI Studio', icon: Bot },
            { href: '/lab/crm', label: 'Zapytania (CRM)', icon: Inbox },
            { href: '/lab/lejek', label: 'Lejek', icon: Kanban },
            { href: '/lab/maile', label: 'Maile Harveya', icon: Mail },
        ],
    },
    {
        label: 'Studio',
        items: [
            { href: '/lab/centrum', label: 'Centrum Dowodzenia', icon: Radar },
            { href: '/lab/centrum/pliki', label: 'Raporty i pliki', icon: FileText },
            { href: '/lab/projects', label: 'Portal Klienta', icon: Hourglass },
            { href: '/lab/finances', label: 'Finanse i Dokumenty', icon: FileText },
        ],
    },
    {
        label: 'Treści i dane',
        items: [
            { href: '/lab/calendar', label: 'Posty (plan i publikacja)', icon: Calendar },
            { href: '/lab/testimonials', label: 'Opinie klientów', icon: Star },
            { href: '/lab/analytics', label: 'Statystyki strony', icon: BarChart3 },
            { href: '/lab/audit-log', label: 'Dziennik zmian', icon: Shield },
        ],
    },
]

export default function Sidebar({ userEmail }: { userEmail?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60 px-4 py-3 sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-yellow-400 flex items-center justify-center text-zinc-950 font-bold text-xs">W</div>
                    <span className="font-heading font-bold text-base tracking-tight text-white">WUYO Lab</span>
                </div>
                <button
                    onClick={toggleMenu}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-[60] md:hidden"
                    onClick={closeMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[70] w-60 bg-zinc-950 border-r border-zinc-800/60 px-4 py-6 flex flex-col gap-7 transition-transform duration-200 ease-in-out overflow-y-auto
                md:relative md:translate-x-0 md:z-auto md:h-[calc(100vh-2rem)] md:rounded-3xl md:border md:border-white/[0.06] md:bg-white/[0.025] md:backdrop-blur-xl md:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                print:hidden
            `}>
                {/* Logo */}
                <div className="hidden md:flex flex-col gap-5">
                    <div className="flex items-center gap-2.5 px-2">
                        <div className="w-6 h-6 rounded bg-yellow-400 flex items-center justify-center text-zinc-950 font-bold text-xs shrink-0">W</div>
                        <span className="font-heading font-bold text-base tracking-tight text-white">WUYO Lab</span>
                    </div>
                    {userEmail && (
                        <div className="flex items-center gap-2.5 px-2 py-2 border-b border-zinc-800/60">
                            <div className="w-7 h-7 rounded border border-yellow-400/20 flex items-center justify-center text-yellow-400/80 text-xs font-bold shrink-0 bg-yellow-400/5">
                                {userEmail[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white text-xs font-semibold truncate leading-tight">WUYO Studio</p>
                                <p className="text-zinc-600 text-[10px] truncate">{userEmail}</p>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="flex flex-col gap-6 flex-grow">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 px-3 mb-1.5">{group.label}</p>
                            <div className="flex flex-col gap-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeMenu}
                                            className={`
                                                flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-xl transition-all
                                                ${isActive
                                                    ? 'text-zinc-950 bg-yellow-400 shadow-[0_0_24px_-6px_rgba(255,235,82,0.6)]'
                                                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'}
                                            `}
                                        >
                                            <Icon size={15} className={isActive ? 'text-zinc-950' : 'text-zinc-500'} />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-zinc-800/60 pt-4">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-2.5 px-2 py-2 text-[13px] font-medium text-zinc-600 hover:text-red-400 hover:bg-red-400/5 rounded-md transition-colors">
                            <LogOut size={15} />
                            Wyloguj się
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}
