'use client'

import { useEffect, useState } from 'react'
import { getProjects, createProject, updateProjectStatus, deleteProject } from './actions'
import { Plus, Link as LinkIcon, Play, Trash2, Copy, ChevronDown, ChevronUp, MessageSquare, Check } from 'lucide-react'
import Link from 'next/link'

type UpdateEntry = { date: string; status: string; progress: number; note?: string }

export default function ProjectsLab() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [client, setClient] = useState('')
    const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})
    const [showNote, setShowNote] = useState<Record<string, boolean>>({})
    const [expandedTimeline, setExpandedTimeline] = useState<Record<string, boolean>>({})
    const [copiedId, setCopiedId] = useState<string | null>(null)

    async function loadData() {
        setLoading(true)
        const data = await getProjects()
        setProjects(data)
        setLoading(false)
    }

    useEffect(() => { loadData() }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        await createProject({ name, client })
        setName('')
        setClient('')
        loadData()
    }

    const handleUpdate = async (id: string, phase: number) => {
        const statusMap = ['Briefing', 'Koncept', 'Poprawki', 'Final']
        const progressMap = [10, 40, 75, 100]
        const note = noteInputs[id]?.trim() || undefined
        await updateProjectStatus(id, statusMap[phase], progressMap[phase], note)
        setNoteInputs(prev => ({ ...prev, [id]: '' }))
        setShowNote(prev => ({ ...prev, [id]: false }))
        loadData()
    }

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Usunac strefe projektu: ${name}?\nOperacja jest nieodwracalna.`)) {
            await deleteProject(id)
            loadData()
        }
    }

    const handleCopyUrl = (id: string) => {
        const url = `${window.location.origin}/c/${id}`
        navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Play size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Strefy Klienta (Portal)</h1>
                    <p className="text-zinc-400 text-sm">Generuj magiczne linki i pokazuj klientom postep prac.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl h-fit">
                    <h2 className="text-lg font-bold text-white mb-4">Utworz nowa strefe</h2>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-400">Nazwa projektu</label>
                            <input required value={name} onChange={e => setName(e.target.value)} placeholder="np. Sklep E-Commerce z meblami" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-400">Nazwa klienta</label>
                            <input required value={client} onChange={e => setClient(e.target.value)} placeholder="np. Jan Kowalski / Meble-Pol" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                        </div>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4">
                            <Plus size={18} /> Utworz Przestrzen
                        </button>
                    </form>
                </div>

                {/* Projects List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                        </div>
                    ) : projects.length === 0 ? (
                        <p className="text-zinc-500 text-center py-12">Brak aktywnych projektow w bazie.</p>
                    ) : projects.map((p) => {
                        const updates: UpdateEntry[] = Array.isArray(p.updates) ? p.updates : []
                        const isExpanded = expandedTimeline[p.id]
                        const hasNote = showNote[p.id]

                        return (
                            <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
                                {/* Project header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{p.name}</h3>
                                        <p className="text-sm text-zinc-400">Odbiorca: {p.client}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button onClick={() => handleDelete(p.id, p.name)} className="text-zinc-600 hover:text-red-500 transition-colors p-1">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="flex flex-col items-end">
                                            <span className="text-yellow-400 font-bold text-lg leading-none">{p.progress}%</span>
                                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{p.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-zinc-800 rounded-full h-2.5">
                                    <div className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                                </div>

                                {/* Note input (optional) */}
                                {hasNote && (
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={14} className="text-zinc-500 shrink-0" />
                                        <input
                                            value={noteInputs[p.id] || ''}
                                            onChange={e => setNoteInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                            placeholder="Notatka do zmiany statusu (opcjonalnie)..."
                                            className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-xs rounded-lg px-3 py-2 focus:border-yellow-400/50 focus:outline-none"
                                        />
                                    </div>
                                )}

                                {/* Phase buttons + actions */}
                                <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-zinc-800/50">
                                    <div className="flex items-center gap-2">
                                        {['Brief', 'Koncept', 'Poprawki', 'Final'].map((label, i) => {
                                            const progressMap = [10, 40, 75, 100]
                                            const isActive = p.progress === progressMap[i]
                                            const isFinal = i === 3
                                            return (
                                                <button
                                                    key={label}
                                                    onClick={() => handleUpdate(p.id, i)}
                                                    className={`px-3 py-1 text-xs rounded border transition-colors ${isActive
                                                        ? isFinal ? 'bg-green-500 text-black border-green-500' : 'bg-yellow-400 text-black border-yellow-400'
                                                        : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}
                                                >
                                                    {label}
                                                </button>
                                            )
                                        })}
                                        <button
                                            onClick={() => setShowNote(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                            className={`p-1.5 rounded border transition-colors ${hasNote ? 'border-yellow-400/30 text-yellow-400' : 'border-zinc-700 text-zinc-500 hover:text-white'}`}
                                            title="Dodaj notatke"
                                        >
                                            <MessageSquare size={12} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleCopyUrl(p.id)} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
                                            {copiedId === p.id ? <><Check size={14} className="text-green-400" /> Skopiowano</> : <><Copy size={14} /> Kopiuj URL</>}
                                        </button>
                                        <Link href={`/c/${p.id}`} target="_blank" className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 font-medium bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                                            <LinkIcon size={14} /> Podglad
                                        </Link>
                                    </div>
                                </div>

                                {/* Timeline */}
                                {updates.length > 0 && (
                                    <div className="border-t border-zinc-800/30 pt-3">
                                        <button
                                            onClick={() => setExpandedTimeline(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full"
                                        >
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            Historia zmian ({updates.length})
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-3 space-y-2 pl-2 border-l border-zinc-800">
                                                {[...updates].reverse().map((u, i) => (
                                                    <div key={i} className="flex items-start gap-3 pl-3 py-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 mt-1.5 shrink-0" />
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] text-zinc-500">{formatDate(u.date)}</span>
                                                                <span className="text-[10px] font-bold text-yellow-400/70">{u.status} ({u.progress}%)</span>
                                                            </div>
                                                            {u.note && <p className="text-xs text-zinc-400 mt-0.5">{u.note}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
