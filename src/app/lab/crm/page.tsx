'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getFilteredLeads, updateLeadStatus, deleteLeadOrBrief, moveLeadToPipeline } from './actions'
import { Inbox, Trash2, Mail, Search, ArrowUpDown, Calculator, Filter, Kanban, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Lead } from '@/lib/types'
import { PageHeader, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'

// Kolory statusów jako pigułki (system /lab v2). `!` nadpisuje globalny wygląd pól select.
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
    Nowy: { label: 'Nowy', bg: '!bg-emerald-400/15', text: 'text-emerald-300', border: '!border-transparent' },
    Kontakt: { label: 'Kontakt', bg: '!bg-yellow-400/15', text: 'text-yellow-300', border: '!border-transparent' },
    Wycena: { label: 'Wycena', bg: '!bg-yellow-400/15', text: 'text-yellow-300', border: '!border-transparent' },
    Zamkniety: { label: 'Zamkniety', bg: '!bg-white/[0.06]', text: 'text-zinc-300', border: '!border-transparent' },
    Utracony: { label: 'Utracony', bg: '!bg-red-400/15', text: 'text-red-300', border: '!border-transparent' },
}

const ALL_STATUSES = ['Nowy', 'Kontakt', 'Wycena', 'Zamkniety', 'Utracony']

export default function CRMDashboard() {
    const [items, setItems] = useState<Lead[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(20)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortAsc, setSortAsc] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [movingId, setMovingId] = useState<string | null>(null)
    const [moveError, setMoveError] = useState<string | null>(null)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    const loadData = useCallback(async (s?: string, status?: string, asc?: boolean, p?: number) => {
        setLoading(true)
        const result = await getFilteredLeads(
            s ?? search,
            status ?? filterStatus,
            asc ?? sortAsc,
            p ?? page,
        )
        setItems(result.items)
        setTotal(result.total)
        setPageSize(result.pageSize)
        setLoading(false)
    }, [search, filterStatus, sortAsc, page])

    useEffect(() => {
        loadData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPage(0)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            loadData(value, filterStatus, sortAsc, 0)
        }, 300)
    }

    const handleFilterChange = (status: string) => {
        setFilterStatus(status)
        setPage(0)
        loadData(search, status, sortAsc, 0)
    }

    const handleSortToggle = () => {
        const newAsc = !sortAsc
        setSortAsc(newAsc)
        setPage(0)
        loadData(search, filterStatus, newAsc, 0)
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        loadData(search, filterStatus, sortAsc, newPage)
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateLeadStatus(id, newStatus)
        loadData()
    }

    const handleToPipeline = async (id: string) => {
        setMovingId(id)
        setMoveError(null)
        const res = await moveLeadToPipeline(id)
        setMovingId(null)
        if (!res.ok) {
            setMoveError(res.error)
            return
        }
        loadData()
    }

    const handleDelete = async (id: string, type: string) => {
        if (confirm('Na pewno usunac tego leada?')) {
            await deleteLeadOrBrief(id, type !== 'Chatbot')
            loadData()
        }
    }

    const activeCount = items.filter(i => i.status === 'Nowy' || i.status === 'Kontakt').length
    const totalPages = Math.ceil(total / pageSize)

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={Inbox}
                title="Zapytania"
                subtitle="Wiadomości z formularzy i czatu. Odpisz, wyceń albo przenieś do lejka."
            />

            <div className="lab-stagger grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatCard icon={Inbox} label="Wszystkie zapytania" value={<CountUp value={total} />} hint="z wybranymi filtrami" />
                <StatCard icon={Mail} label="Do obsłużenia" value={<CountUp value={activeCount} />} hint="status Nowy lub Kontakt na tej stronie" hot={activeCount > 0} />
            </div>

            {moveError && (
                <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300">{moveError}</p>
            )}

            {/* Filtry */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] max-w-sm flex-1">
                    <Search size={16} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Szukaj po nazwie lub e-mailu..."
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600"
                    />
                </div>

                <div className="relative">
                    <Filter size={14} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <select
                        value={filterStatus}
                        onChange={e => handleFilterChange(e.target.value)}
                        className="cursor-pointer appearance-none py-2.5 pl-9 pr-8 text-sm text-white"
                    >
                        <option value="all">Wszystkie statusy</option>
                        {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSortToggle}
                    className="flex items-center gap-2 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:text-white"
                >
                    <ArrowUpDown size={14} strokeWidth={1.8} />
                    {sortAsc ? 'Najstarsze' : 'Najnowsze'}
                </button>
            </div>

            {/* Tabela */}
            <div className="lab-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-300">
                        <thead>
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
                                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-400/30 border-t-yellow-400" />
                                            Pobieram zapytania...
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-zinc-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400">
                                                <Inbox size={20} strokeWidth={1.8} />
                                            </span>
                                            {search || filterStatus !== 'all'
                                                ? 'Brak wyników dla wybranych filtrów.'
                                                : 'Skrzynka jest jeszcze pusta. Poczekaj na wejścia z formularzy.'}
                                        </div>
                                    </td>
                                </tr>
                            ) : items.map((item) => {
                                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Nowy
                                return (
                                    <tr key={item.id} className="group border-t border-white/[0.05]">
                                        {/* Klient */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-white">{item.name}</span>
                                                <a
                                                    href={`mailto:${item.email}`}
                                                    className="inline-flex w-fit items-center gap-1 text-xs text-yellow-400/80 hover:text-yellow-400 hover:underline"
                                                >
                                                    <Mail size={11} /> {item.email}
                                                </a>
                                            </div>
                                        </td>

                                        {/* Data */}
                                        <td className="whitespace-nowrap px-6 py-4 text-xs text-zinc-500">
                                            {item.date}
                                        </td>

                                        {/* Typ */}
                                        <td className="px-6 py-4">
                                            <span className="whitespace-nowrap rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                                                {item.type}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={item.status}
                                                onChange={e => handleStatusChange(item.id, e.target.value)}
                                                className={`${cfg.bg} ${cfg.text} ${cfg.border} cursor-pointer appearance-none !rounded-full px-3 py-1.5 text-[11px] font-semibold`}
                                                style={{ minWidth: '100px' }}
                                            >
                                                {ALL_STATUSES.map(s => (
                                                    <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Detale */}
                                        <td className="px-6 py-4">
                                            {item.details ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                                    aria-expanded={expandedId === item.id}
                                                    title={expandedId === item.id ? 'Zwiń' : 'Pokaż całość'}
                                                    className={`text-left text-xs text-zinc-500 transition-colors hover:text-zinc-300 ${expandedId === item.id ? 'max-w-[420px] whitespace-pre-wrap break-words' : 'block max-w-[220px] truncate'}`}
                                                >
                                                    {item.details}
                                                </button>
                                            ) : (
                                                <p className="text-xs text-zinc-600">brak</p>
                                            )}
                                        </td>

                                        {/* Akcje */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {item.jobId ? (
                                                    <Link
                                                        href={`/lab/klienci/zlecenie/${item.jobId}`}
                                                        className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/25"
                                                    >
                                                        Karta klienta <ArrowRight size={12} />
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToPipeline(item.id)}
                                                        disabled={movingId === item.id}
                                                        title="Tworzy klienta i zlecenie na etapie Brief i wycena"
                                                        className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-yellow-400/15 px-3 py-1.5 text-xs font-semibold text-yellow-300 transition-colors hover:bg-yellow-400/25 disabled:opacity-50"
                                                    >
                                                        <Kanban size={12} />
                                                        {movingId === item.id ? 'Dodaję…' : 'Do lejka'}
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/lab/ai-studio?tab=quote&client=${encodeURIComponent(item.name)}&email=${encodeURIComponent(item.email)}&details=${encodeURIComponent(item.details || '')}&leadId=${item.id}`}
                                                    className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-200 opacity-0 transition group-hover:opacity-100"
                                                >
                                                    <Calculator size={12} />
                                                    Wycena
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.type)}
                                                    title="Usuń"
                                                    className="rounded-full p-2 text-zinc-600 opacity-0 transition-colors hover:bg-red-400/15 hover:text-red-300 group-hover:opacity-100"
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

            {/* Strony */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} z {total}</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0 || loading}
                            className="flex items-center gap-1.5 bg-zinc-800 px-4 py-2 text-zinc-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={14} /> Poprzednia
                        </button>
                        <span className="px-3 py-1.5 text-white">{page + 1} / {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages - 1 || loading}
                            className="flex items-center gap-1.5 bg-zinc-800 px-4 py-2 text-zinc-300 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Następna <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
