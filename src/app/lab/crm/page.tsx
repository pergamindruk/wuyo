'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getFilteredLeads, updateLeadStatus, deleteLeadOrBrief } from './actions'
import { Inbox, Trash2, Mail, Search, ArrowUpDown, Calculator, Filter } from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    Nowy: { label: 'Nowy', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    Kontakt: { label: 'Kontakt', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    Wycena: { label: 'Wycena', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    Zamkniety: { label: 'Zamkniety', bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
    Utracony: { label: 'Utracony', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
}

const ALL_STATUSES = ['Nowy', 'Kontakt', 'Wycena', 'Zamkniety', 'Utracony']

export default function CRMDashboard() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortAsc, setSortAsc] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    const loadData = useCallback(async (s?: string, status?: string, asc?: boolean) => {
        setLoading(true)
        const data = await getFilteredLeads(
            s ?? search,
            status ?? filterStatus,
            asc ?? sortAsc
        )
        setItems(data)
        setLoading(false)
    }, [search, filterStatus, sortAsc])

    useEffect(() => {
        loadData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (value: string) => {
        setSearch(value)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            loadData(value, filterStatus, sortAsc)
        }, 300)
    }

    const handleFilterChange = (status: string) => {
        setFilterStatus(status)
        loadData(search, status, sortAsc)
    }

    const handleSortToggle = () => {
        const newAsc = !sortAsc
        setSortAsc(newAsc)
        loadData(search, filterStatus, newAsc)
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateLeadStatus(id, newStatus)
        loadData()
    }

    const handleDelete = async (id: string, type: string) => {
        if (confirm('Na pewno usunac tego leada?')) {
            await deleteLeadOrBrief(id, type !== 'Chatbot')
            loadData()
        }
    }

    const activeCount = items.filter(i => i.status === 'Nowy' || i.status === 'Kontakt').length

    return (
        <div className="flex flex-col gap-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                        <Inbox size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Inbox & CRM</h1>
                        <p className="text-zinc-400 text-sm">
                            {items.length} leadow{activeCount > 0 ? ` \u00B7 ${activeCount} aktywnych` : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Szukaj po nazwie lub emailu..."
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors"
                    />
                </div>

                <div className="relative">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <select
                        value={filterStatus}
                        onChange={e => handleFilterChange(e.target.value)}
                        className="pl-8 pr-8 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-yellow-400/50 transition-colors"
                    >
                        <option value="all">Wszystkie statusy</option>
                        {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSortToggle}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                    <ArrowUpDown size={14} />
                    {sortAsc ? 'Najstarsze' : 'Najnowsze'}
                </button>
            </div>

            {/* ── Table ── */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-300">
                        <thead className="bg-zinc-950/50 text-zinc-500 uppercase text-xs font-medium tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Klient</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Typ</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Detale</th>
                                <th className="px-6 py-4 text-right">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-zinc-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                                            Pobieranie leadow...
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-zinc-500">
                                        {search || filterStatus !== 'all'
                                            ? 'Brak wynikow dla wybranych filtrow.'
                                            : 'Skrzynka jest jeszcze pusta. Poczekaj na wejscia z formularzy.'}
                                    </td>
                                </tr>
                            ) : items.map((item) => {
                                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Nowy
                                return (
                                    <tr key={item.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group">
                                        {/* Klient */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-white">{item.name}</span>
                                                <a
                                                    href={`mailto:${item.email}`}
                                                    className="text-yellow-400/80 text-xs hover:text-yellow-400 hover:underline inline-flex items-center gap-1 w-fit"
                                                >
                                                    <Mail size={11} /> {item.email}
                                                </a>
                                            </div>
                                        </td>

                                        {/* Data */}
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500">
                                            {item.date}
                                        </td>

                                        {/* Typ */}
                                        <td className="px-6 py-4">
                                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-lg text-xs font-medium">
                                                {item.type}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={item.status}
                                                onChange={e => handleStatusChange(item.id, e.target.value)}
                                                className={`${cfg.bg} ${cfg.text} ${cfg.border} border px-2.5 py-1.5 rounded-lg text-xs font-medium bg-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-yellow-400/30 appearance-none`}
                                                style={{ minWidth: '100px' }}
                                            >
                                                {ALL_STATUSES.map(s => (
                                                    <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Detale */}
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-zinc-500 max-w-[220px] truncate" title={item.details}>
                                                {item.details || '\u2014'}
                                            </p>
                                        </td>

                                        {/* Akcje */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/lab/ai-studio?tab=quote&client=${encodeURIComponent(item.name)}&email=${encodeURIComponent(item.email)}&details=${encodeURIComponent(item.details || '')}&leadId=${item.id}`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Calculator size={12} />
                                                    Wycena
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.type)}
                                                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
