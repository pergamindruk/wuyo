'use client'

import { useEffect, useState } from 'react'
import { getProjects, createProject, updateProjectStatus, deleteProject, getProjectFiles, deleteProjectFile, type ProjectFile } from './actions'
import { Plus, Link as LinkIcon, Hourglass, Trash2, Copy, ChevronDown, ChevronUp, MessageSquare, Check, Download, Paperclip } from 'lucide-react'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'

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
    const [files, setFiles] = useState<Record<string, ProjectFile[]>>({})

    async function loadData() {
        setLoading(true)
        const data = await getProjects()
        setProjects(data)
        setLoading(false)
        setFiles(await getProjectFiles(data.map((p: { id: string }) => p.id)))
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
        const statusMap = ['Briefing', 'Koncept', 'Poprawki', 'W druku', 'Final']
        const progressMap = [10, 40, 75, 90, 100]
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
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={Hourglass}
                title="Portal Klienta"
                subtitle="Twórz linki dla klientów i pokazuj im postęp prac."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Formularz nowej strefy */}
                <div className="lab-card h-fit p-5 sm:p-6 lg:col-span-1">
                    <SectionTitle icon={Plus} title="Utwórz nową strefę" />
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-400">Nazwa projektu</label>
                            <input required value={name} onChange={e => setName(e.target.value)} placeholder="np. Sklep E-Commerce z meblami" className="lab-input w-full p-2.5 text-sm text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-400">Nazwa klienta</label>
                            <input required value={client} onChange={e => setClient(e.target.value)} placeholder="np. Jan Kowalski / Meble-Pol" className="lab-input w-full p-2.5 text-sm text-white" />
                        </div>
                        <button className="mt-2 flex items-center justify-center gap-2 rounded-full bg-yellow-400 py-2.5 font-bold text-zinc-950">
                            <Plus size={18} strokeWidth={1.8} /> Utwórz strefę
                        </button>
                    </form>
                </div>

                {/* Lista projektów */}
                <div className="lab-stagger flex flex-col gap-4 lg:col-span-2">
                    {loading ? (
                        <div className="lab-card flex justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-400/30 border-t-yellow-400" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="lab-card flex flex-col items-center gap-3 p-10 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><Hourglass size={22} strokeWidth={1.8} /></span>
                            <p className="text-sm text-zinc-400">Brak aktywnych projektów. Utwórz pierwszą strefę w formularzu obok.</p>
                        </div>
                    ) : projects.map((p) => {
                        const updates: UpdateEntry[] = Array.isArray(p.updates) ? p.updates : []
                        const isExpanded = expandedTimeline[p.id]
                        const hasNote = showNote[p.id]

                        return (
                            <div key={p.id} className="lab-card flex flex-col gap-4 p-5 sm:p-6">
                                {/* Nagłówek projektu */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-4">
                                        <span className={`h-12 w-12 shrink-0 ${p.progress === 100 ? 'flex items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300' : 'lab-chip'}`}>
                                            {p.progress === 100 ? <Check size={20} strokeWidth={1.8} /> : <Hourglass size={20} strokeWidth={1.8} />}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="truncate text-xl font-bold text-white">{p.name}</h3>
                                            <p className="text-sm text-zinc-400">Odbiorca: {p.client}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-heading text-3xl font-bold leading-none text-white">{p.progress}%</span>
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.progress === 100 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-yellow-400/15 text-yellow-300'}`}>{p.status}</span>
                                        </div>
                                        <button onClick={() => handleDelete(p.id, p.name)} className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-red-400/10 hover:text-red-400" title="Usuń strefę">
                                            <Trash2 size={16} strokeWidth={1.8} />
                                        </button>
                                    </div>
                                </div>

                                {/* Pasek postępu */}
                                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                    <div className={`lab-bar h-2.5 rounded-full transition-all duration-500 ${p.progress === 100 ? 'bg-emerald-400' : 'bg-yellow-400 shadow-[0_0_16px_-2px_rgba(255,214,10,0.7)]'}`} style={{ width: `${p.progress}%` }} />
                                </div>

                                {/* Notatka (opcjonalna) */}
                                {hasNote && (
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={16} strokeWidth={1.8} className="shrink-0 text-zinc-500" />
                                        <input
                                            value={noteInputs[p.id] || ''}
                                            onChange={e => setNoteInputs(prev => ({ ...prev, [p.id]: e.target.value }))}
                                            placeholder="Notatka do zmiany statusu (opcjonalnie)..."
                                            className="lab-input flex-1 px-3 py-2 text-xs text-white"
                                        />
                                    </div>
                                )}

                                {/* Etapy + akcje */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {['Brief', 'Koncept', 'Poprawki', 'W druku', 'Final'].map((label, i) => {
                                            const progressMap = [10, 40, 75, 90, 100]
                                            const isActive = p.progress === progressMap[i]
                                            const isFinal = i === 4
                                            return (
                                                <button
                                                    key={label}
                                                    onClick={() => handleUpdate(p.id, i)}
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${isActive
                                                        ? isFinal ? 'bg-emerald-400 text-black' : 'bg-yellow-400 text-black'
                                                        : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white'}`}
                                                >
                                                    {label}
                                                </button>
                                            )
                                        })}
                                        <button
                                            onClick={() => setShowNote(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                            className={`rounded-full p-2 transition-colors ${hasNote ? 'bg-yellow-400/15 text-yellow-300' : 'bg-white/[0.04] text-zinc-500 hover:text-white'}`}
                                            title="Dodaj notatkę"
                                        >
                                            <MessageSquare size={14} strokeWidth={1.8} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleCopyUrl(p.id)} className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:text-white">
                                            {copiedId === p.id ? <><Check size={14} strokeWidth={1.8} className="text-emerald-400" /> Skopiowano</> : <><Copy size={14} strokeWidth={1.8} /> Kopiuj link</>}
                                        </button>
                                        <a href={`/c/${p.id}`} target="_blank" rel="noopener noreferrer" className="lab-pill flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-yellow-300">
                                            <LinkIcon size={14} strokeWidth={1.8} /> Podgląd
                                        </a>
                                    </div>
                                </div>

                                {/* Pliki od klienta (prywatny bucket, link ważny 1 h) */}
                                {(files[p.id]?.length ?? 0) > 0 && (
                                    <div className="border-t border-white/[0.07] pt-4">
                                        <p className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-400"><Paperclip size={14} strokeWidth={1.8} className="text-yellow-400" /> Pliki od klienta ({files[p.id].length})</p>
                                        <ul className="flex flex-col gap-1.5">
                                            {files[p.id].map((f) => (
                                                <li key={f.path} className="group flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-2.5 text-xs transition hover:bg-white/[0.06]">
                                                    <span className="min-w-0 flex-1 truncate text-zinc-200">{f.name}</span>
                                                    <span className="text-zinc-500">{f.size < 1048576 ? `${Math.max(1, Math.round(f.size / 1024))} KB` : `${(f.size / 1048576).toFixed(1)} MB`}</span>
                                                    {f.url && <a href={f.url} className="text-yellow-400 hover:text-yellow-300" title="Pobierz"><Download size={16} strokeWidth={1.8} /></a>}
                                                    <button onClick={async () => { if (confirm(`Usunąć plik ${f.name}?`)) { await deleteProjectFile(f.path); setFiles(await getProjectFiles([p.id]).then((x) => ({ ...files, ...x }))) } }}
                                                        className="text-zinc-600 opacity-0 hover:text-red-400 group-hover:opacity-100" title="Usuń"><Trash2 size={14} strokeWidth={1.8} /></button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Historia zmian */}
                                {updates.length > 0 && (
                                    <div className="border-t border-white/[0.07] pt-3">
                                        <button
                                            onClick={() => setExpandedTimeline(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                            className="flex w-full items-center gap-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
                                        >
                                            {isExpanded ? <ChevronUp size={16} strokeWidth={1.8} /> : <ChevronDown size={16} strokeWidth={1.8} />}
                                            Historia zmian ({updates.length})
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-3 space-y-1 border-l border-yellow-400/20 pl-2">
                                                {[...updates].reverse().map((u, i) => (
                                                    <div key={i} className="flex items-start gap-3 py-1 pl-3">
                                                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(255,214,10,0.7)]" />
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="text-[11px] text-zinc-500">{formatDate(u.date)}</span>
                                                                <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-300">{u.status} ({u.progress}%)</span>
                                                            </div>
                                                            {u.note && <p className="mt-0.5 text-xs text-zinc-400">{u.note}</p>}
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
