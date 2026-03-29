'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { generateContent, generateQuote, getGenerations, deleteGeneration, createProjectFromQuote } from './actions'
import { Bot, PenTool, Calculator, Send, Clock, Trash2, RotateCcw, Copy, Check, FolderPlus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Generation = {
    id: string
    type: 'content' | 'quote'
    inputData: Record<string, any>
    output: string
    createdAt: string
}

function AIStudioInner() {
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'content' | 'quote' | 'history'>('content')
    const [topic, setTopic] = useState('')
    const [platform, setPlatform] = useState('LinkedIn')
    const [clientMessage, setClientMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Pipeline state
    const [leadId, setLeadId] = useState<string | null>(null)
    const [pipelineClient, setPipelineClient] = useState('')
    const [showCreateProject, setShowCreateProject] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projectCreated, setProjectCreated] = useState(false)
    const [projectCreating, setProjectCreating] = useState(false)

    // History
    const [history, setHistory] = useState<Generation[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const loadHistory = async () => {
        setHistoryLoading(true)
        const data = await getGenerations(30)
        setHistory(data)
        setHistoryLoading(false)
    }

    // Read URL params (pipeline from CRM)
    useEffect(() => {
        const tab = searchParams.get('tab')
        const client = searchParams.get('client')
        const email = searchParams.get('email')
        const details = searchParams.get('details')
        const lid = searchParams.get('leadId')

        if (tab === 'quote') {
            setActiveTab('quote')
            if (client || email || details) {
                const parts: string[] = []
                if (client) parts.push(`Klient: ${client}`)
                if (email) parts.push(`Email: ${email}`)
                if (details) parts.push(`\nSzczegoly zapytania:\n${details}`)
                setClientMessage(parts.join('\n'))
            }
            if (lid) setLeadId(lid)
            if (client) setPipelineClient(client)
        }
    }, [searchParams])

    useEffect(() => {
        if (activeTab === 'history') loadHistory()
    }, [activeTab])

    const handleContentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)
        const res = await generateContent(topic, platform)
        if (res.success && res.data) setResult(res.data)
        else setResult('Wystapil blad: ' + res.error)
        setLoading(false)
    }

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)
        setShowCreateProject(false)
        setProjectCreated(false)
        const res = await generateQuote(clientMessage)
        if (res.success && res.data) {
            setResult(res.data)
            setShowCreateProject(true)
        } else {
            setResult('Wystapil blad: ' + res.error)
        }
        setLoading(false)
    }

    const handleCreateProject = async () => {
        if (!projectName.trim()) return
        setProjectCreating(true)
        try {
            await createProjectFromQuote(
                pipelineClient || 'Klient',
                projectName,
                leadId || undefined
            )
            setProjectCreated(true)
        } catch (e) {
            console.error(e)
        }
        setProjectCreating(false)
    }

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleLoadFromHistory = (gen: Generation) => {
        if (gen.type === 'content') {
            setActiveTab('content')
            setTopic(gen.inputData.topic || '')
            setPlatform(gen.inputData.platform || 'LinkedIn')
            setResult(gen.output)
        } else {
            setActiveTab('quote')
            setClientMessage(gen.inputData.clientMessage || '')
            setResult(gen.output)
        }
        setShowCreateProject(false)
        setProjectCreated(false)
    }

    const handleDeleteHistory = async (id: string) => {
        if (confirm('Usunac ten wpis z historii?')) {
            await deleteGeneration(id)
            setHistory(h => h.filter(g => g.id !== id))
        }
    }

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Bot size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">AI Studio & Mentor</h1>
                    <p className="text-zinc-400 text-sm">
                        Twoje centrum generowania postow i wycen.
                        {leadId && <span className="text-blue-400 ml-2">Pipeline aktywny</span>}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-800 pb-2">
                <TabButton active={activeTab === 'content'} onClick={() => { setActiveTab('content'); setResult(null); setShowCreateProject(false) }} icon={<PenTool size={16} />} label="Content Generator" />
                <TabButton active={activeTab === 'quote'} onClick={() => { setActiveTab('quote'); setResult(null); setShowCreateProject(false) }} icon={<Calculator size={16} />} label="Wyceniacz" />
                <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Clock size={16} />} label="Historia" badge={history.length > 0 ? history.length : undefined} />
            </div>

            {/* ── History Tab ── */}
            {activeTab === 'history' ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Historia generacji</h2>
                        <button onClick={loadHistory} className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800">
                            <RotateCcw size={16} />
                        </button>
                    </div>

                    {historyLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-center text-zinc-500 py-12">Brak wpisow w historii.</p>
                    ) : (
                        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                            {history.map(gen => (
                                <div key={gen.id} className="group flex items-start gap-4 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => handleLoadFromHistory(gen)}>
                                    <div className="shrink-0 mt-0.5">
                                        {gen.type === 'content' ? <PenTool size={16} className="text-yellow-400" /> : <Calculator size={16} className="text-blue-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${gen.type === 'content' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                {gen.type === 'content' ? 'Post' : 'Wycena'}
                                            </span>
                                            <span className="text-[11px] text-zinc-600">{formatDate(gen.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 truncate">
                                            {gen.type === 'content' ? `${gen.inputData.platform}: ${gen.inputData.topic}` : gen.inputData.clientMessage?.slice(0, 100)}
                                        </p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteHistory(gen.id) }} className="shrink-0 p-2 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* ── Content / Quote Tabs ── */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Input Form */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                        {activeTab === 'content' ? (
                            <form onSubmit={handleContentSubmit} className="flex flex-col gap-5">
                                <h2 className="text-lg font-bold text-white mb-2">Stworz nowy wpis</h2>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-zinc-400">Platforma docelowa</label>
                                    <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5">
                                        <option value="LinkedIn">LinkedIn (Profesjonalny)</option>
                                        <option value="Instagram">Instagram (Wizualny)</option>
                                        <option value="Facebook">Facebook / Fanpage</option>
                                        <option value="Blog">Artykul na Bloga</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-zinc-400">Temat / Pomysl na wpis</label>
                                    <textarea required rows={4} value={topic} onChange={e => setTopic(e.target.value)} placeholder="NP: Jak wazne jest ciemne tlo i zlote akcenty w budowaniu marek premium?" className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5 resize-none" />
                                </div>
                                <button type="submit" disabled={loading} className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                                    {loading ? 'AI pracuje...' : <><Send size={18} /> Generuj Wpis</>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleQuoteSubmit} className="flex flex-col gap-5">
                                <h2 className="text-lg font-bold text-white mb-2">Przeswietl zapytanie od klienta</h2>
                                {leadId && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-400">
                                        Pipeline z CRM — dane leada wstepnie wypelnione
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-zinc-400">Tresc maila lub wiadomosci od klienta</label>
                                    <textarea required rows={6} value={clientMessage} onChange={e => setClientMessage(e.target.value)} placeholder="Czesc! Potrzebuje malej stronki..." className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5 resize-none" />
                                </div>
                                <button type="submit" disabled={loading} className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                                    {loading ? 'Analizowanie...' : <><Bot size={18} /> Przygotuj wycene</>}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Output */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl min-h-[400px]">
                        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                            <h2 className="text-lg font-bold text-zinc-300">
                                {activeTab === 'content' ? 'Wygenerowany Wpis' : 'Wynik Analizy & Wycena'}
                            </h2>
                            {result && !loading && (
                                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 rounded-lg hover:text-white transition-colors">
                                    {copied ? <><Check size={12} /> Skopiowano</> : <><Copy size={12} /> Kopiuj</>}
                                </button>
                            )}
                        </div>

                        <div className="text-zinc-300 text-sm leading-relaxed">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-3 mt-20 text-zinc-500">
                                    <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                                    Pulsowanie serwerow...
                                </div>
                            ) : result ? (
                                <>
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-strong:text-white prose-table:border prose-table:border-zinc-700">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                                    </div>

                                    {/* Pipeline: Create Project button */}
                                    {activeTab === 'quote' && showCreateProject && !projectCreated && (
                                        <div className="mt-6 pt-4 border-t border-zinc-800">
                                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                                <FolderPlus size={16} className="text-yellow-400" />
                                                Utworz projekt z tej wyceny
                                            </h3>
                                            <div className="flex gap-2">
                                                <input
                                                    value={projectName}
                                                    onChange={e => setProjectName(e.target.value)}
                                                    placeholder="Nazwa projektu..."
                                                    className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:border-yellow-400/50 focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleCreateProject}
                                                    disabled={!projectName.trim() || projectCreating}
                                                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    {projectCreating ? 'Tworzenie...' : <><FolderPlus size={14} /> Utworz</>}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {projectCreated && (
                                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400 flex items-center gap-2">
                                            <Check size={16} /> Projekt utworzony! Sprawdz w zakladce Strefy Klienta.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-zinc-500 italic mt-20 text-center">
                                    Wpisz dane po lewej i pozwol Agentowi wykonac magiczna robote.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Wrapper with Suspense (required for useSearchParams) ──

export default function AIStudioPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            </div>
        }>
            <AIStudioInner />
        </Suspense>
    )
}

// ── Tab Button ──

function TabButton({ active, onClick, icon, label, badge }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number
}) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
            {icon}
            {label}
            {badge !== undefined && <span className="ml-1 text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
        </button>
    )
}
