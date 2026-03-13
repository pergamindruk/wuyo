'use client'

import { useEffect, useState } from 'react'
import { getProjects, createProject, updateProjectStatus, deleteProject } from './actions'
import { Plus, Link as LinkIcon, Edit2, Play, CheckCircle, Trash2, Copy } from 'lucide-react'
import Link from 'next/link'

export default function ProjectsLab() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // form state
    const [name, setName] = useState('')
    const [client, setClient] = useState('')

    async function loadData() {
        setLoading(true)
        const data = await getProjects()
        setProjects(data)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        await createProject({ name, client })
        setName('')
        setClient('')
        loadData()
    }

    const handleUpdate = async (id: string, phase: number) => {
        const statusMap = ['Briefing', 'Koncept', 'Poprawki', 'Finał']
        const progressMap = [10, 40, 75, 100]
        await updateProjectStatus(id, statusMap[phase], progressMap[phase])
        loadData()
    }

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Czy na pewno chcesz usunąć strefę projektu: ${name}?\nOperacja jest nieodwracalna, a link dla klienta przestanie działać.`)) {
            await deleteProject(id)
            loadData()
        }
    }

    const handleCopyUrl = (id: string) => {
        const url = `${window.location.origin}/c/${id}`
        navigator.clipboard.writeText(url)
        alert('Skopiowano unikalny Link do schowka: ' + url)
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Play size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Strefy Klienta (Portal)</h1>
                    <p className="text-zinc-400 text-sm">Generuj magiczne linki i pokazuj klientom postęp prac bez mailowego chaosu.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Kolumna Tworzenia */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl h-fit">
                    <h2 className="text-lg font-bold text-white mb-4">Utwórz nową strefę</h2>
                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-400">Nazwa realizowanego projektu</label>
                            <input required value={name} onChange={e => setName(e.target.value)} placeholder="np. Sklep E-Commerce z meblami" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-zinc-400">Nazwa klienta / Alias</label>
                            <input required value={client} onChange={e => setClient(e.target.value)} placeholder="np. Jan Kowalski / Meble-Pol" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 w-full p-2.5" />
                        </div>
                        <button className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4">
                            <Plus size={18} /> Utwórz Przestrzeń
                        </button>
                    </form>
                </div>

                {/* Kolumna Projektów */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {loading ? <p className="text-zinc-500">Wczytywanie projektów...</p> : projects.length === 0 ? <p className="text-zinc-500">Brak aktywnych projektów w bazie.</p> :
                        projects.map((p) => (
                            <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{p.name}</h3>
                                        <p className="text-sm text-zinc-400">Odbiorca: {p.client}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button onClick={() => handleDelete(p.id, p.name)} className="text-zinc-600 hover:text-red-500 transition-colors p-1" title="Usuń cały projekt">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="flex flex-col items-end">
                                            <span className="text-yellow-400 font-bold text-lg leading-none">{p.progress}%</span>
                                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{p.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full bg-zinc-800 rounded-full h-2.5 mt-2">
                                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800/50">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdate(p.id, 0)} className={`px-3 py-1 text-xs rounded border transition-colors ${p.progress === 10 ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}>Brief</button>
                                        <button onClick={() => handleUpdate(p.id, 1)} className={`px-3 py-1 text-xs rounded border transition-colors ${p.progress === 40 ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}>Koncept</button>
                                        <button onClick={() => handleUpdate(p.id, 2)} className={`px-3 py-1 text-xs rounded border transition-colors ${p.progress === 75 ? 'bg-yellow-400 text-black border-yellow-400' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}>Poprawki</button>
                                        <button onClick={() => handleUpdate(p.id, 3)} className={`px-3 py-1 text-xs rounded border transition-colors ${p.progress === 100 ? 'bg-green-500 text-black border-green-500' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}>Finał</button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button onClick={() => handleCopyUrl(p.id)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors" title="Kopiuj link do schowka">
                                            <Copy size={16} /> Kopiuj URL
                                        </button>
                                        <Link href={`/c/${p.id}`} target="_blank" className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 font-medium bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                                            <LinkIcon size={16} /> Podgląd (Dla Klienta)
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
