'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Home, Bot, Menu, X, Inbox, Calendar, FileText, BarChart3, Hourglass, Share2 } from 'lucide-react'

const navGroups = [
    {
        label: 'Zarządzanie',
        items: [
            { href: '/lab', label: 'Dashboard', icon: Home },
            { href: '/lab/crm', label: 'CRM & Leady', icon: Inbox },
            { href: '/lab/projects', label: 'Portal Klienta', icon: Hourglass },
            { href: '/lab/finances', label: 'Finanse i Dokumenty', icon: FileText },
        ],
    },
    {
        label: 'Narzędzia',
        items: [
            { href: '/lab/ai-studio', label: 'AI Studio', icon: Bot },
            { href: '/lab/calendar', label: 'Kalendarz Postów', icon: Calendar },
            { href: '/lab/social-media', label: 'Social Media', icon: Share2 },
            { href: '/lab/analytics', label: 'Harbor SEO', icon: BarChart3 },
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
            <div className="md:hidden flex items-center justify-between bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center text-zinc-950 font-bold">
                        W
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">WUYO Lab</span>
                </div>
                <button
                    onClick={toggleMenu}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity"
                    onClick={closeMenu}
                />
            )}

            {/* Sidebar Overlay (Mobile & Desktop) */}
            <aside className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-8 transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 md:z-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                print:hidden
            `}>
                <div className="hidden md:flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center text-zinc-950 font-bold">
                            W
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">WUYO Lab</span>
                    </div>
                    {userEmail && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                            <div className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-yellow-400 text-sm font-bold shrink-0">
                                {userEmail[0].toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white text-xs font-medium truncate">WUYO Studio</p>
                                <p className="text-zinc-500 text-xs truncate">{userEmail}</p>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="flex flex-col gap-5 flex-grow">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-3 mb-2">{group.label}</p>
                            <div className="flex flex-col gap-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeMenu}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                                                ${isActive
                                                    ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent'}
                                            `}
                                        >
                                            <Icon size={18} />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="mt-auto border-t border-zinc-800/50 pt-6">
                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-colors group">
                            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                            Wyloguj się
                        </button>
                    </form>
                </div>
            </aside>
        </>
    )
}
