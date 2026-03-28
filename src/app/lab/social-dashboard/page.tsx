'use client'

import { useState, useEffect } from 'react'
import { runMAP, runNAIL, runEXECUTE, runWD40, getOutputFiles, getOutputFile } from './actions'
import { Map, Crosshair, Rocket, Wrench, FileText, Clock, Loader2, ChevronDown, ChevronUp, Zap, Copy, Check } from 'lucide-react'

type OutputFile = { name: string; type: 'MAP' | 'NAIL' | 'EXECUTE' | 'WD40'; date: string }
type ActiveOp = 'MAP' | 'NAIL' | 'EXECUTE' | 'WD40' | null

const OP_CONFIG = {
    MAP: {
        icon: Map,
        label: 'MAP',
        title: 'Research Trendów',
        description: 'Skanuj trendy FB/IG, viralowe formaty, hashtagi i timing.',
        color: 'from-blue-500 to-cyan-400',
        glow: 'shadow-blue-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
    },
    NAIL: {
        icon: Crosshair,
        label: 'NAIL',
        title: 'Strategia & Hooki',
        description: '5 pomysłów z Pain Blockami — gotowe do egzekucji.',
        color: 'from-amber-500 to-yellow-400',
        glow: 'shadow-amber-500/20',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
    },
    EXECUTE: {
        icon: Rocket,
        label: 'EXECUTE',
        title: 'Gotowe Copy',
        description: 'Finalne copy FB + IG + prompty do grafik i wideo.',
        color: 'from-green-500 to-emerald-400',
        glow: 'shadow-green-500/20',
        border: 'border-green-500/30',
        text: 'text-green-400',
        bg: 'bg-green-500/10',
    },
    WD40: {
        icon: Wrench,
        label: 'WD-40',
        title: 'Wyostrz Przekaz',
        description: 'Analiza treści + brutalna korekta. Zero slopu.',
        color: 'from-purple-500 to-pink-400',
        glow: 'shadow-purple-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
    },
}

function formatMarkdown(text: string): string {
    return text
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-yellow-400 mt-8 mb-3 pb-2 border-b border-zinc-800">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-black text-white mt-6 mb-4">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="text-zinc-300">$1</em>')
        .replace(/^- (.+)$/gm, '<li class="text-zinc-300 ml-4 list-disc">$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li class="text-zinc-300 ml-4 list-decimal">$2</li>')
        .replace(/\|(.+)\|/g, (match) => {
            const cells = match.split('|').filter(Boolean).map(c => c.trim())
            if (cells.every(c => c.match(/^[-:]+$/))) return ''
            const isHeader = cells.some(c => c.startsWith('**') || c === 'Kryterium')
            const tag = isHeader ? 'th' : 'td'
            const cls = isHeader
                ? 'class="px-3 py-2 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-800/50"'
                : 'class="px-3 py-2 text-sm text-zinc-300 border-t border-zinc-800"'
            return `<tr>${cells.map(c => `<${tag} ${cls}>${c}</${tag}>`).join('')}</tr>`
        })
        .replace(/(<tr>.*<\/tr>\n?)+/g, (match) => `<table class="w-full border border-zinc-800 rounded-lg overflow-hidden my-4">${match}</table>`)
        .replace(/---/g, '<hr class="border-zinc-800 my-6" />')
        .replace(/\n/g, '<br/>')
}

export default function SocialDashboardPage() {
    const [activeOp, setActiveOp] = useState<ActiveOp>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [resultFile, setResultFile] = useState<string | null>(null)
    const [inputText, setInputText] = useState('')
    const [outputFiles, setOutputFiles] = useState<OutputFile[]>([])
    const [historyOpen, setHistoryOpen] = useState(false)
    const [viewingFile, setViewingFile] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        getOutputFiles().then(setOutputFiles)
    }, [result])

    const handleRun = async (op: ActiveOp) => {
        if (!op || loading) return
        setActiveOp(op)
        setLoading(true)
        setResult(null)
        setResultFile(null)
        setViewingFile(null)

        let res: { success: boolean; data?: string; error?: string; filename?: string }

        switch (op) {
            case 'MAP':
                res = await runMAP()
                break
            case 'NAIL':
                res = await runNAIL(inputText || undefined)
                break
            case 'EXECUTE':
                if (!inputText.trim()) {
                    setResult('Wpisz pomysł na post lub wklej hook z etapu NAIL.')
                    setLoading(false)
                    return
                }
                res = await runEXECUTE(inputText)
                break
            case 'WD40':
                if (!inputText.trim()) {
                    setResult('Wklej treści do analizy (posty, copy, drafty).')
                    setLoading(false)
                    return
                }
                res = await runWD40(inputText)
                break
            default:
                res = { success: false, error: 'Nieznana operacja' }
        }

        if (res.success && res.data) {
            setResult(res.data)
            setResultFile(res.filename || null)
        } else {
            setResult('Wystapil blad: ' + (res.error || 'Nieznany'))
        }
        setLoading(false)
    }

    const handleViewFile = async (filename: string) => {
        const content = await getOutputFile(filename)
        if (content) {
            setViewingFile(filename)
            setResult(content)
            setActiveOp(filename.split('_')[0] as ActiveOp)
        }
    }

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const needsInput = activeOp === 'EXECUTE' || activeOp === 'WD40'
    const optionalInput = activeOp === 'NAIL'

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-zinc-950 shadow-lg shadow-yellow-500/25">
                        <Zap size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Social Dashboard</h1>
                        <p className="text-zinc-500 text-sm">MONEY Framework — zero slopu, tylko ROI</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-zinc-600">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Wuyo Social Engine aktywny
                </div>
            </div>

            {/* 4 Operation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(OP_CONFIG) as Array<keyof typeof OP_CONFIG>).map((key) => {
                    const cfg = OP_CONFIG[key]
                    const Icon = cfg.icon
                    const isActive = activeOp === key
                    const isRunning = loading && activeOp === key

                    return (
                        <button
                            key={key}
                            onClick={() => !loading && handleRun(key)}
                            disabled={loading && activeOp !== key}
                            className={`
                                relative group p-5 rounded-2xl border transition-all duration-300 text-left
                                ${isActive
                                    ? `bg-zinc-900 ${cfg.border} shadow-xl ${cfg.glow}`
                                    : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'}
                                ${loading && activeOp !== key ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {isRunning && (
                                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${cfg.color} opacity-5 animate-pulse`} />
                                </div>
                            )}

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white shadow-lg`}>
                                        {isRunning ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                                <h3 className="text-white font-bold text-sm mb-1">{cfg.title}</h3>
                                <p className="text-zinc-500 text-xs leading-relaxed">{cfg.description}</p>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Input Area — shows for NAIL (optional), EXECUTE & WD-40 (required) */}
            {(needsInput || optionalInput) && !loading && (
                <div className={`bg-zinc-900 border rounded-2xl p-5 transition-all ${activeOp ? OP_CONFIG[activeOp].border : 'border-zinc-800'}`}>
                    <label className="text-sm font-bold text-zinc-400 mb-2 block">
                        {activeOp === 'NAIL' && 'Kontekst (opcjonalnie — np. "skupmy się na druku" lub "targetujemy startupy")'}
                        {activeOp === 'EXECUTE' && 'Wklej pomysł na post (hook z etapu NAIL lub własny temat)'}
                        {activeOp === 'WD40' && 'Wklej treści do analizy (ostatnie posty, drafty, copy)'}
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={4}
                        placeholder={
                            activeOp === 'NAIL' ? 'np. "Chcę targetować lokalne firmy usługowe"'
                            : activeOp === 'EXECUTE' ? 'np. "Hook: Twoja strona za 500zł kosztuje Cię 50 klientów miesięcznie"'
                            : 'Wklej tutaj treść postów do analizy...'
                        }
                        className="w-full bg-zinc-950 border border-zinc-700 text-white text-sm rounded-xl p-3.5 resize-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                    />
                    <button
                        onClick={() => handleRun(activeOp)}
                        disabled={loading || ((needsInput) && !inputText.trim())}
                        className="mt-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-yellow-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Rocket size={16} />
                        Uruchom {activeOp && OP_CONFIG[activeOp].label}
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeOp ? OP_CONFIG[activeOp].color : ''} flex items-center justify-center shadow-2xl`}>
                            <Loader2 size={28} className="animate-spin text-white" />
                        </div>
                        <div className={`absolute -inset-4 bg-gradient-to-br ${activeOp ? OP_CONFIG[activeOp].color : ''} rounded-3xl opacity-10 animate-pulse blur-xl`} />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold">Wuyo Social Engine pracuje...</p>
                        <p className="text-zinc-500 text-sm mt-1">
                            {activeOp === 'MAP' && 'Skanowanie trendów i algorytmów FB/IG'}
                            {activeOp === 'NAIL' && 'Generowanie strategii z Pain Blockami'}
                            {activeOp === 'EXECUTE' && 'Tworzenie gotowego copy + prompty graficzne'}
                            {activeOp === 'WD40' && 'Analiza i wyostrzanie przekazu'}
                        </p>
                    </div>
                </div>
            )}

            {/* Result Panel */}
            {result && !loading && (
                <div className={`bg-zinc-900 border rounded-2xl overflow-hidden ${activeOp ? OP_CONFIG[activeOp].border : 'border-zinc-800'}`}>
                    {/* Result Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                        <div className="flex items-center gap-3">
                            {activeOp && (() => {
                                const Icon = OP_CONFIG[activeOp].icon
                                return (
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${OP_CONFIG[activeOp].color} flex items-center justify-center`}>
                                        <Icon size={16} className="text-white" />
                                    </div>
                                )
                            })()}
                            <div>
                                <h2 className="text-white font-bold text-sm">
                                    {viewingFile ? viewingFile : `Wynik: ${activeOp && OP_CONFIG[activeOp].title}`}
                                </h2>
                                {resultFile && !viewingFile && (
                                    <p className="text-zinc-600 text-xs flex items-center gap-1">
                                        <FileText size={10} /> Zapisano: {resultFile}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                        >
                            {copied ? <><Check size={12} className="text-green-400" /> Skopiowano</> : <><Copy size={12} /> Kopiuj</>}
                        </button>
                    </div>

                    {/* Result Content */}
                    <div
                        className="p-6 text-sm text-zinc-300 leading-relaxed max-h-[600px] overflow-y-auto prose-invert"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }}
                    />
                </div>
            )}

            {/* Output History */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <button
                    onClick={() => setHistoryOpen(!historyOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-800/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Clock size={18} className="text-zinc-500" />
                        <span className="text-white font-bold text-sm">Historia operacji</span>
                        <span className="text-zinc-600 text-xs">({outputFiles.length} plikow)</span>
                    </div>
                    {historyOpen ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                </button>

                {historyOpen && (
                    <div className="border-t border-zinc-800 divide-y divide-zinc-800/50 max-h-[300px] overflow-y-auto">
                        {outputFiles.length === 0 ? (
                            <p className="px-6 py-4 text-zinc-600 text-sm italic">
                                Brak wygenerowanych plikow. Uruchom pierwsza operacje.
                            </p>
                        ) : (
                            outputFiles.map((file) => {
                                const cfg = OP_CONFIG[file.type]
                                return (
                                    <button
                                        key={file.name}
                                        onClick={() => handleViewFile(file.name)}
                                        className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-zinc-800/30 transition-colors"
                                    >
                                        <div className={`w-7 h-7 rounded-lg ${cfg?.bg || 'bg-zinc-800'} flex items-center justify-center`}>
                                            {cfg && (() => {
                                                const Icon = cfg.icon
                                                return <Icon size={14} className={cfg.text} />
                                            })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-zinc-300 font-medium truncate">{file.name}</p>
                                        </div>
                                        <span className="text-xs text-zinc-600 shrink-0">{file.date}</span>
                                    </button>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
