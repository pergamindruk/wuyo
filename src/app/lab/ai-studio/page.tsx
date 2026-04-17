'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    generateQuote, getGenerations, deleteGeneration, createProjectFromQuote,
    generatePostForPlatform, publishDirectPost,
} from './actions'
import {
    Bot, Calculator, Send, Clock, Trash2, RotateCcw, Copy, Check,
    FolderPlus, Sparkles, ArrowLeft, RefreshCw, Image as ImageIcon,
    AlertTriangle, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─── Types ────────────────────────────────────────────────────────────────────

type Generation = {
    id: string
    type: 'content' | 'quote'
    inputData: Record<string, any>
    output: string
    createdAt: string
}

type PostCreatorInit = {
    topic: string
    tone: string
    platform: string
    extraContext: string
    content?: string
}

// ─── Post Creator config ──────────────────────────────────────────────────────

const TONES = [
    { id: 'ekspercki',    label: 'Ekspercki' },
    { id: 'storytelling', label: 'Storytelling' },
    { id: 'edukacyjny',   label: 'Edukacyjny' },
    { id: 'sprzedazowy',  label: 'Sprzedażowy' },
    { id: 'viralowy',     label: 'Viralowy 🔥' },
]

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', emoji: '📸', meta: 'max 2200 zn', publishable: true,  limit: 2200 },
    { id: 'facebook',  label: 'Facebook',  emoji: '👍', meta: 'fanpage',      publishable: true,  limit: 0    },
    { id: 'both',      label: 'IG + FB',   emoji: '🚀', meta: '2 platformy',  publishable: true,  limit: 2200 },
    { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼', meta: 'max 3000 zn',  publishable: false, limit: 3000 },
    { id: 'blog',      label: 'Blog',      emoji: '✍️',  meta: 'artykuł',      publishable: false, limit: 0    },
]

// ─── Main page ────────────────────────────────────────────────────────────────

function AIStudioInner() {
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'content' | 'quote' | 'history'>('content')

    // PostCreator bridge (load from history)
    const [postCreatorInit, setPostCreatorInit] = useState<PostCreatorInit | null>(null)
    const [postCreatorKey, setPostCreatorKey] = useState(0)

    // Quote tab state
    const [clientMessage, setClientMessage] = useState('')
    const [loading, setLoading]   = useState(false)
    const [result,  setResult]    = useState<string | null>(null)
    const [copied,  setCopied]    = useState(false)

    // Pipeline
    const [leadId,             setLeadId]             = useState<string | null>(null)
    const [pipelineClient,     setPipelineClient]     = useState('')
    const [showCreateProject,  setShowCreateProject]  = useState(false)
    const [projectName,        setProjectName]        = useState('')
    const [projectCreated,     setProjectCreated]     = useState(false)
    const [projectCreating,    setProjectCreating]    = useState(false)

    // History
    const [history,        setHistory]        = useState<Generation[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const loadHistory = async () => {
        setHistoryLoading(true)
        const data = await getGenerations(40)
        setHistory(data)
        setHistoryLoading(false)
    }

    useEffect(() => {
        const tab     = searchParams.get('tab')
        const client  = searchParams.get('client')
        const email   = searchParams.get('email')
        const details = searchParams.get('details')
        const lid     = searchParams.get('leadId')

        if (tab === 'quote') {
            setActiveTab('quote')
            if (client || email || details) {
                const parts: string[] = []
                if (client)  parts.push(`Klient: ${client}`)
                if (email)   parts.push(`Email: ${email}`)
                if (details) parts.push(`\nSzczegoly zapytania:\n${details}`)
                setClientMessage(parts.join('\n'))
            }
            if (lid)    setLeadId(lid)
            if (client) setPipelineClient(client)
        }
    }, [searchParams])

    useEffect(() => { if (activeTab === 'history') loadHistory() }, [activeTab])

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
            setResult('Wystąpił błąd: ' + res.error)
        }
        setLoading(false)
    }

    const handleCreateProject = async () => {
        if (!projectName.trim()) return
        setProjectCreating(true)
        try {
            await createProjectFromQuote(pipelineClient || 'Klient', projectName, leadId || undefined)
            setProjectCreated(true)
        } catch (e) { console.error(e) }
        setProjectCreating(false)
    }

    const handleQuoteCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleLoadFromHistory = (gen: Generation) => {
        if (gen.type === 'content') {
            setActiveTab('content')
            const normPlatform = (p: string) => {
                const map: Record<string, string> = {
                    'LinkedIn': 'linkedin', 'Instagram': 'instagram',
                    'Facebook': 'facebook', 'Facebook / Fanpage': 'facebook',
                    'Blog': 'blog', 'Artykul na Bloga': 'blog',
                }
                return map[p] || p.toLowerCase() || 'instagram'
            }
            setPostCreatorInit({
                topic:        gen.inputData.topic        || '',
                tone:         gen.inputData.tone         || 'ekspercki',
                platform:     normPlatform(gen.inputData.platform || 'instagram'),
                extraContext: gen.inputData.extraContext || '',
                content:      gen.output,
            })
            setPostCreatorKey(k => k + 1)
        } else {
            setActiveTab('quote')
            setClientMessage(gen.inputData.clientMessage || '')
            setResult(gen.output)
        }
        setShowCreateProject(false)
        setProjectCreated(false)
    }

    const handleDeleteHistory = async (id: string) => {
        if (confirm('Usunąć ten wpis z historii?')) {
            await deleteGeneration(id)
            setHistory(h => h.filter(g => g.id !== id))
        }
    }

    const formatDate = (iso: string) => new Date(iso).toLocaleString('pl-PL', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

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
                        Centrum generowania postów i wycen.
                        {leadId && <span className="text-blue-400 ml-2">Pipeline aktywny</span>}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-800 pb-2">
                <TabButton
                    active={activeTab === 'content'}
                    onClick={() => { setActiveTab('content') }}
                    icon={<Sparkles size={16} />}
                    label="Post Creator"
                />
                <TabButton
                    active={activeTab === 'quote'}
                    onClick={() => { setActiveTab('quote'); setResult(null); setShowCreateProject(false) }}
                    icon={<Calculator size={16} />}
                    label="Wyceniacz"
                />
                <TabButton
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                    icon={<Clock size={16} />}
                    label="Historia"
                    badge={history.length > 0 ? history.length : undefined}
                />
            </div>

            {/* ── Post Creator ── */}
            {activeTab === 'content' && (
                <PostCreator key={postCreatorKey} initialData={postCreatorInit || undefined} />
            )}

            {/* ── History ── */}
            {activeTab === 'history' && (
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
                        <p className="text-center text-zinc-500 py-12">Brak wpisów w historii.</p>
                    ) : (
                        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                            {history.map(gen => (
                                <div
                                    key={gen.id}
                                    className="group flex items-start gap-4 p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700 transition-colors cursor-pointer"
                                    onClick={() => handleLoadFromHistory(gen)}
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {gen.type === 'content'
                                            ? <Sparkles size={16} className="text-yellow-400" />
                                            : <Calculator size={16} className="text-blue-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${gen.type === 'content' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                {gen.type === 'content' ? 'Post' : 'Wycena'}
                                            </span>
                                            {gen.type === 'content' && gen.inputData.tone && (
                                                <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded capitalize">{gen.inputData.tone}</span>
                                            )}
                                            <span className="text-[11px] text-zinc-600">{formatDate(gen.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 truncate">
                                            {gen.type === 'content'
                                                ? `${gen.inputData.platform}: ${gen.inputData.topic}`
                                                : gen.inputData.clientMessage?.slice(0, 100)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDeleteHistory(gen.id) }}
                                        className="shrink-0 p-2 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Wyceniacz ── */}
            {activeTab === 'quote' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                        <form onSubmit={handleQuoteSubmit} className="flex flex-col gap-5">
                            <h2 className="text-lg font-bold text-white mb-2">Prześwietl zapytanie od klienta</h2>
                            {leadId && (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-400">
                                    Pipeline z CRM — dane leada wstępnie wypełnione
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-zinc-400">Treść maila lub wiadomości od klienta</label>
                                <textarea
                                    required rows={6}
                                    value={clientMessage} onChange={e => setClientMessage(e.target.value)}
                                    placeholder="Cześć! Potrzebuję małej stronki..."
                                    className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg focus:ring-yellow-400 focus:border-yellow-400 block w-full p-2.5 resize-none"
                                />
                            </div>
                            <button type="submit" disabled={loading} className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                                {loading ? 'Analizowanie...' : <><Bot size={18} /> Przygotuj wycenę</>}
                            </button>
                        </form>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl min-h-[400px]">
                        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                            <h2 className="text-lg font-bold text-zinc-300">Wynik Analizy & Wycena</h2>
                            {result && !loading && (
                                <button onClick={handleQuoteCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 rounded-lg hover:text-white transition-colors">
                                    {copied ? <><Check size={12} /> Skopiowano</> : <><Copy size={12} /> Kopiuj</>}
                                </button>
                            )}
                        </div>
                        <div className="text-zinc-300 text-sm leading-relaxed">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center gap-3 mt-20 text-zinc-500">
                                    <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                                    Analizuję zapytanie...
                                </div>
                            ) : result ? (
                                <>
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-strong:text-white prose-table:border prose-table:border-zinc-700">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                                    </div>
                                    {showCreateProject && !projectCreated && (
                                        <div className="mt-6 pt-4 border-t border-zinc-800">
                                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                                <FolderPlus size={16} className="text-yellow-400" />
                                                Utwórz projekt z tej wyceny
                                            </h3>
                                            <div className="flex gap-2">
                                                <input
                                                    value={projectName} onChange={e => setProjectName(e.target.value)}
                                                    placeholder="Nazwa projektu..."
                                                    className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:border-yellow-400/50 focus:outline-none"
                                                />
                                                <button
                                                    onClick={handleCreateProject}
                                                    disabled={!projectName.trim() || projectCreating}
                                                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    {projectCreating ? 'Tworzenie...' : <><FolderPlus size={14} /> Utwórz</>}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {projectCreated && (
                                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400 flex items-center gap-2">
                                            <Check size={16} /> Projekt utworzony! Sprawdź w zakładce Strefy Klienta.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-zinc-500 italic mt-20 text-center">
                                    Wpisz dane po lewej i pozwól Agentowi wykonać magiczną robotę.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Post Creator component ───────────────────────────────────────────────────

function PostCreator({ initialData }: { initialData?: PostCreatorInit }) {
    const [topic,        setTopic]        = useState(initialData?.topic        || '')
    const [tone,         setTone]         = useState(initialData?.tone         || 'ekspercki')
    const [platform,     setPlatform]     = useState(initialData?.platform     || 'instagram')
    const [extraContext, setExtraContext] = useState(initialData?.extraContext || '')
    const [showExtra,    setShowExtra]    = useState(false)

    const [step,       setStep]       = useState<'form' | 'result'>(initialData?.content ? 'result' : 'form')
    const [generating, setGenerating] = useState(false)
    const [content,    setContent]    = useState(initialData?.content || '')
    const [genError,   setGenError]   = useState('')

    const [showPublishPanel, setShowPublishPanel] = useState(false)
    const [imageUrl,         setImageUrl]         = useState('')
    const [publishState,     setPublishState]     = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({})
    const [publishMessages,  setPublishMessages]  = useState<Record<string, string>>({})
    const [copied,           setCopied]           = useState(false)

    const currentPlatform = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0]
    const currentTone     = TONES.find(t => t.id === tone) || TONES[0]

    const doGenerate = async () => {
        setGenerating(true)
        setGenError('')
        const res = await generatePostForPlatform(topic, tone, platform, extraContext)
        if (res.success && res.data) {
            setContent(res.data)
            setStep('result')
            setShowPublishPanel(false)
            setPublishState({})
            setPublishMessages({})
        } else {
            setGenError(res.error || 'Błąd generowania')
        }
        setGenerating(false)
    }

    const handleGenerate = (e: React.FormEvent) => { e.preventDefault(); doGenerate() }

    const handleRegenerate = () => { setContent(''); doGenerate() }

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handlePublish = async (targets: string[]) => {
        const loading: Record<string, 'loading'> = {}
        targets.forEach(t => { loading[t] = 'loading' })
        setPublishState(p => ({ ...p, ...loading }))

        const results = await publishDirectPost(topic, content, targets, imageUrl || undefined)

        const newState:    Record<string, 'success' | 'error'> = {}
        const newMessages: Record<string, string>              = {}
        for (const [plat, res] of Object.entries(results)) {
            if (res.success) {
                newState[plat]    = 'success'
                newMessages[plat] = 'Opublikowano!'
            } else {
                newState[plat]    = 'error'
                newMessages[plat] = res.error || 'Błąd publikacji'
            }
        }
        setPublishState(p => ({ ...p, ...newState }))
        setPublishMessages(m => ({ ...m, ...newMessages }))
    }

    const charLimit   = currentPlatform.limit
    const charCount   = content.length
    const charPercent = charLimit > 0 ? Math.min(100, (charCount / charLimit) * 100) : 0
    const overLimit   = charLimit > 0 && charCount > charLimit

    // ── Result view ──
    if (step === 'result') {
        return (
            <div className="flex flex-col gap-5">
                {/* Top bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setStep('form')}
                        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} /> Wróć
                    </button>
                    <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
                        <span className="text-xs bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300">
                            {currentPlatform.emoji} {currentPlatform.label}
                        </span>
                        <span className="text-xs bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300">
                            {currentTone.label}
                        </span>
                        <button
                            onClick={handleRegenerate} disabled={generating}
                            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                            Regeneruj
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        >
                            {copied
                                ? <><Check size={12} className="text-green-400" /> Skopiowano</>
                                : <><Copy size={12} /> Kopiuj</>}
                        </button>
                    </div>
                </div>

                {/* Editable content area */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    {generating ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-500">
                            <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                            <span className="text-sm">Piszę nową wersję...</span>
                        </div>
                    ) : (
                        <textarea
                            value={content} onChange={e => setContent(e.target.value)}
                            className="w-full bg-transparent text-zinc-200 text-sm leading-relaxed p-6 resize-none focus:outline-none min-h-[320px]"
                            placeholder="Treść posta..."
                        />
                    )}

                    {/* Char counter */}
                    {charLimit > 0 && !generating && (
                        <div className="px-6 pb-5 border-t border-zinc-800/50 pt-3">
                            <div className="flex justify-between text-[11px] mb-1.5">
                                <span className={overLimit ? 'text-red-400 font-bold' : 'text-zinc-600'}>
                                    {charCount.toLocaleString('pl-PL')} / {charLimit.toLocaleString('pl-PL')} znaków
                                </span>
                                {overLimit && <span className="text-red-400 font-bold">Przekroczono limit!</span>}
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${overLimit ? 'bg-red-500' : charPercent > 85 ? 'bg-orange-400' : 'bg-yellow-400'}`}
                                    style={{ width: `${charPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {genError && (
                    <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                        {genError}
                    </p>
                )}

                {/* Publish panel */}
                {currentPlatform.publishable ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                        <button
                            onClick={() => setShowPublishPanel(v => !v)}
                            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-800/30 transition-colors"
                        >
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                <Send size={15} className="text-yellow-400" /> Opublikuj
                            </span>
                            {showPublishPanel ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                        </button>

                        {showPublishPanel && (
                            <div className="px-6 pb-6 flex flex-col gap-4 border-t border-zinc-800">
                                <div className="flex flex-col gap-2 pt-4">
                                    <label className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                                        <ImageIcon size={12} />
                                        URL grafiki
                                        {platform === 'facebook'
                                            ? ' (opcjonalnie dla FB)'
                                            : ' — wymagany dla Instagram'}
                                    </label>
                                    <input
                                        value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                                        placeholder="https://twoja-domena.pl/grafika.jpg"
                                        className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:border-yellow-400/50 focus:outline-none"
                                    />
                                    {(platform === 'instagram' || platform === 'both') && !imageUrl && (
                                        <p className="text-xs text-orange-400/80 flex items-center gap-1.5">
                                            <AlertTriangle size={11} />
                                            Wrzuć publiczny URL pliku JPG/PNG (np. z CDN lub serwera)
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {(platform === 'instagram' || platform === 'both') && (
                                        <PlatformPublishButton
                                            label="Opublikuj na Instagram"
                                            emoji="📸"
                                            disabled={!imageUrl}
                                            state={publishState.instagram || 'idle'}
                                            message={publishMessages.instagram}
                                            onClick={() => handlePublish(['instagram'])}
                                        />
                                    )}
                                    {(platform === 'facebook' || platform === 'both') && (
                                        <PlatformPublishButton
                                            label="Opublikuj na Facebook"
                                            emoji="👍"
                                            disabled={false}
                                            state={publishState.facebook || 'idle'}
                                            message={publishMessages.facebook}
                                            onClick={() => handlePublish(['facebook'])}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-3 text-sm text-zinc-400">
                        <ExternalLink size={15} className="text-zinc-500 shrink-0" />
                        Skopiuj tekst i wklej bezpośrednio na <span className="text-white font-medium">{currentPlatform.label}</span>
                    </div>
                )}
            </div>
        )
    }

    // ── Form view ──
    return (
        <form onSubmit={handleGenerate} className="flex flex-col gap-7 max-w-2xl">
            {/* Topic */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">O czym napisać?</label>
                <textarea
                    required rows={3}
                    value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="np. Jak dobór typografii wpływa na postrzeganie marki premium..."
                    className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl focus:ring-yellow-400 focus:border-yellow-400 w-full p-4 resize-none placeholder:text-zinc-600"
                />
            </div>

            {/* Tone */}
            <div className="flex flex-col gap-3">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Ton</label>
                <div className="flex flex-wrap gap-2">
                    {TONES.map(t => (
                        <button
                            key={t.id} type="button" onClick={() => setTone(t.id)}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                                tone === t.id
                                    ? 'bg-yellow-400 text-black border-yellow-400 font-bold shadow-[0_0_12px_rgba(250,204,21,0.3)]'
                                    : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Platform */}
            <div className="flex flex-col gap-3">
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Platforma</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {PLATFORMS.map(p => (
                        <button
                            key={p.id} type="button" onClick={() => setPlatform(p.id)}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-center ${
                                platform === p.id
                                    ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400 shadow-[inset_0_0_12px_rgba(250,204,21,0.05)]'
                                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50'
                            }`}
                        >
                            <span className="text-xl leading-none">{p.emoji}</span>
                            <span className="text-xs font-bold leading-none">{p.label}</span>
                            <span className="text-[10px] opacity-60 leading-none">{p.meta}</span>
                            {!p.publishable && (
                                <span className="text-[9px] text-zinc-600 leading-none">tylko kopiuj</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Extra context */}
            <div className="flex flex-col gap-2">
                <button
                    type="button" onClick={() => setShowExtra(v => !v)}
                    className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
                >
                    {showExtra ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Dodatkowy kontekst (opcjonalnie)
                </button>
                {showExtra && (
                    <textarea
                        rows={2}
                        value={extraContext} onChange={e => setExtraContext(e.target.value)}
                        placeholder="np. Mamy nową realizację dla klienta z branży medycznej. Nie używaj słowa 'innowacyjny'."
                        className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl focus:ring-yellow-400 focus:border-yellow-400 w-full p-3 resize-none placeholder:text-zinc-600"
                    />
                )}
            </div>

            {genError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                    {genError}
                </p>
            )}

            <button
                type="submit" disabled={generating || !topic.trim()}
                className="bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.2)] disabled:opacity-50 disabled:cursor-wait"
            >
                {generating ? (
                    <>
                        <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                        Generuję post...
                    </>
                ) : (
                    <><Sparkles size={16} /> Generuj Post</>
                )}
            </button>
        </form>
    )
}

// ─── Platform publish button ──────────────────────────────────────────────────

function PlatformPublishButton({ label, emoji, disabled, state, message, onClick }: {
    label: string
    emoji: string
    disabled: boolean
    state: 'idle' | 'loading' | 'success' | 'error'
    message?: string
    onClick: () => void
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <button
                onClick={onClick}
                disabled={disabled || state === 'loading' || state === 'success'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] justify-center
                    ${state === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      state === 'error'   ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-yellow-400 hover:bg-yellow-500 text-zinc-950'}`}
            >
                {state === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                ) : state === 'success' ? <Check size={15} />
                  : state === 'error'   ? <AlertTriangle size={15} />
                  : <span>{emoji}</span>}
                {state === 'loading' ? 'Publikuję...'
               : state === 'success' ? 'Opublikowano!'
               : state === 'error'   ? 'Błąd'
               : label}
            </button>
            {message && state === 'error' && (
                <p className="text-xs text-red-400/80 max-w-[220px] leading-snug">{message}</p>
            )}
        </div>
    )
}

// ─── Wrappers ─────────────────────────────────────────────────────────────────

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

function TabButton({ active, onClick, icon, label, badge }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
        >
            {icon}
            {label}
            {badge !== undefined && (
                <span className="ml-1 text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full font-bold">{badge}</span>
            )}
        </button>
    )
}
