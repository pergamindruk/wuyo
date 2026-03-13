'use client'

import { useEffect, useState } from 'react'
import { getLeads, deleteLeadOrBrief } from './actions'
import { Inbox, Trash2, Mail } from 'lucide-react'

export default function CRMDashboard() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    async function loadData() {
        setLoading(true)
        const data = await getLeads()
        // Ustawiamy ujednolicony format
        setItems(data)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleDelete = async (id: string, type: string) => {
        if (confirm('Na pewno pożegnać tego lead-a?')) {
            await deleteLeadOrBrief(id, type !== 'Chatbot')
            loadData()
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Inbox size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Inbox & CRM</h1>
                    <p className="text-zinc-400 text-sm">Tu lądują najgorętsze szanse od Twoich klientów.</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden min-h-[50vh]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-300">
                        <thead className="bg-zinc-950/50 text-zinc-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Klient (E-mail)</th>
                                <th className="px-6 py-4">Data wejścia</th>
                                <th className="px-6 py-4">Typ Zapytania</th>
                                <th className="px-6 py-4">Detale Wyceny</th>
                                <th className="px-6 py-4 text-right">Akcja</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-zinc-500">Pobieranie leadów...</td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-zinc-500">Skrzynka jest jeszcze pusta. Poczekaj na wejścia z formularzy.</td>
                                </tr>
                            ) : items.map((item, idx) => (
                                <tr key={item.id + idx} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white flex flex-col gap-1">
                                        {item.name}
                                        <a href={`mailto:${item.email}`} className="text-yellow-400 font-normal hover:underline inline-flex items-center gap-1">
                                            <Mail size={12} /> {item.email}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-1 rounded text-xs">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-zinc-400 max-w-[200px] truncate" title={item.details}>
                                        {item.details}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(item.id, item.type)} className="text-red-400 hover:text-red-300 p-2 hover:bg-zinc-800 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
