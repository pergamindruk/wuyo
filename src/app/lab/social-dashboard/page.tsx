'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
    runMAP, runNAIL, runEXECUTE, runWD40,
    publishDashboardToFB, publishDashboardToIG,
    generateHookVariant,
    addDashboardToCalendar,
    getFBPostInsights, getIGPostInsights,
} from './actions'
import {
    Map, Crosshair, Rocket, Wrench, Clock, Loader2,
    ChevronDown, ChevronUp, Zap, Copy, Check, Pencil, Save,
    Globe, Camera, X, ExternalLink, Send, Hash, Plus, Trash2,
    CalendarPlus, BarChart3, RefreshCw, ArrowRight, Bold, Italic,
    Heading2, List, ListOrdered, Eye, Smartphone,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════
// Types & Config
// ═══════════════════════════════════════════════════════
type OutputEntry = { id: string; type: 'MAP' | 'NAIL' | 'EXECUTE' | 'WD40'; content: string; date: string }
type ActiveOp = 'MAP' | 'NAIL' | 'EXECUTE' | 'WD40' | null
type PublishStatus = 'idle' | 'publishing-fb' | 'publishing-ig' | 'done'
type PipelineStep = 0 | 1 | 2 | 3 | 4
type Hashtag = { tag: string; category: string; useCount: number }

// ─── localStorage helpers ─────────────────────────────
const STORAGE_KEY = 'wuyo_social_outputs'
const HASHTAG_KEY = 'wuyo_hashtags'

function loadOutputs(): OutputEntry[] {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveOutput(entry: OutputEntry) {
    const all = loadOutputs()
    all.unshift(entry)
    if (all.length > 50) all.length = 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
function loadHashtags(): Hashtag[] {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem(HASHTAG_KEY) || '[]') } catch { return [] }
}
function saveHashtags(tags: Hashtag[]) {
    localStorage.setItem(HASHTAG_KEY, JSON.stringify(tags))
}

const OP_CONFIG = {
    MAP: {
        icon: Map, label: 'MAP', title: 'Research Trendow',
        description: 'Skanuj trendy FB/IG, viralowe formaty, hashtagi i timing.',
        color: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/20',
        border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/10',
    },
    NAIL: {
        icon: Crosshair, label: 'NAIL', title: 'Strategia & Hooki',
        description: '5 pomyslow z Pain Blockami — gotowe do egzekucji.',
        color: 'from-amber-500 to-yellow-400', glow: 'shadow-amber-500/20',
        border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10',
    },
    EXECUTE: {
        icon: Rocket, label: 'EXECUTE', title: 'Gotowe Copy',
        description: 'Finalne copy FB + IG + prompty do grafik i wideo.',
        color: 'from-green-500 to-emerald-400', glow: 'shadow-green-500/20',
        border: 'border-green-500/30', text: 'text-green-400', bg: 'bg-green-500/10',
    },
    WD40: {
        icon: Wrench, label: 'WD-40', title: 'Wyostrz Przekaz',
        description: 'Analiza tresci + brutalna korekta. Zero slopu.',
        color: 'from-purple-500 to-pink-400', glow: 'shadow-purple-500/20',
        border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/10',
    },
}

// ═══════════════════════════════════════════════════════
// Markdown formatter
// ═══════════════════════════════════════════════════════
function formatMarkdown(text: string): string {
    return text
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-yellow-400 mt-8 mb-3 pb-2 border-b border-zinc-800">$2</h2>'.replace('$2', '$1'))
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
        .replace(/(<tr>.*<\/tr>\n?)+/g, (m) => `<table class="w-full border border-zinc-800 rounded-lg overflow-hidden my-4">${m}</table>`)
        .replace(/---/g, '<hr class="border-zinc-800 my-6" />')
        .replace(/\n/g, '<br/>')
}

// Parse hooks from NAIL output
function parseNailHooks(text: string): string[] {
    const hooks: string[] = []
    const regex = /\*\*Hook\s*\(?.*?\)?\s*:?\*\*\s*(.+)/gi
    let match
    while ((match = regex.exec(text)) !== null) {
        const hook = match[1].replace(/\*\*/g, '').replace(/^["']|["']$/g, '').trim()
        if (hook.length > 5) hooks.push(hook)
    }
    return hooks.length > 0 ? hooks : []
}

// ═══════════════════════════════════════════════════════
// Phone Preview Component
// ═══════════════════════════════════════════════════════
function PhonePreview({ platform, content }: { platform: 'facebook' | 'instagram'; content: string }) {
    const isFB = platform === 'facebook'
    const cleanText = content
        .replace(/^#{1,3}\s.+$/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .trim()
        .slice(0, 500)

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className={`px-4 py-2.5 flex items-center gap-2 ${isFB ? 'bg-blue-600/10 border-b border-blue-600/20' : 'bg-gradient-to-r from-purple-600/10 to-pink-500/10 border-b border-purple-500/20'}`}>
                <Smartphone size={12} className={isFB ? 'text-blue-400' : 'text-pink-400'} />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isFB ? 'text-blue-400' : 'text-pink-400'}`}>
                    {isFB ? 'Facebook Preview' : 'Instagram Preview'}
                </span>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-zinc-950 text-xs font-black">W</div>
                    <div>
                        <p className="text-white text-xs font-bold">WUYO - Dobra Grafa</p>
                        <p className="text-zinc-600 text-[10px]">Teraz</p>
                    </div>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">{cleanText || 'Podglad posta pojawi sie tutaj...'}</p>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// Confirm Dialog Component
// ═══════════════════════════════════════════════════════
function ConfirmDialog({
    platform, content, imageUrl, onConfirm, onCancel,
}: {
    platform: 'fb' | 'ig'; content: string; imageUrl: string; onConfirm: () => void; onCancel: () => void
}) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        {platform === 'fb'
                            ? <><Globe size={18} className="text-blue-400" /> Publikuj na Facebooku</>
                            : <><Camera size={18} className="text-pink-400" /> Publikuj na Instagramie</>}
                    </h3>
                    <button onClick={onCancel} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                </div>

                <div className="bg-zinc-950 rounded-xl p-4 mb-4 max-h-[200px] overflow-y-auto">
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{content.slice(0, 300)}{content.length > 300 ? '...' : ''}</p>
                </div>

                {imageUrl && (
                    <p className="text-zinc-500 text-xs mb-4 flex items-center gap-1 truncate">
                        <Camera size={12} /> {imageUrl}
                    </p>
                )}

                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white font-medium text-sm transition-colors">
                        Anuluj
                    </button>
                    <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 ${platform === 'fb' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'}`}>
                        <Send size={14} /> Potwierdz publikacje
                    </button>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// Pipeline Step Indicator
// ═══════════════════════════════════════════════════════
function PipelineIndicator({ step, maxStep }: { step: PipelineStep; maxStep: PipelineStep }) {
    const steps = [
        { label: 'MAP', icon: Map, color: 'blue' },
        { label: 'NAIL', icon: Crosshair, color: 'amber' },
        { label: 'EXECUTE', icon: Rocket, color: 'green' },
        { label: 'Publish', icon: Send, color: 'yellow' },
    ]
    return (
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
            {steps.map((s, i) => {
                const stepNum = (i + 1) as PipelineStep
                const Icon = s.icon
                const isComplete = stepNum < step || (stepNum <= maxStep && stepNum < step)
                const isActive = stepNum === step
                const isPending = stepNum > step

                return (
                    <div key={s.label} className="flex items-center flex-1">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl flex-1 transition-all ${isComplete ? 'bg-green-500/10 border border-green-500/20' : isActive ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-zinc-800/30 border border-zinc-800/50'}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isComplete ? 'bg-green-500/20' : isActive ? 'bg-yellow-400/20' : 'bg-zinc-800'}`}>
                                {isComplete ? <Check size={14} className="text-green-400" /> : isActive ? <Loader2 size={14} className="text-yellow-400 animate-spin" /> : <Icon size={14} className="text-zinc-600" />}
                            </div>
                            <span className={`text-xs font-bold hidden sm:block ${isComplete ? 'text-green-400' : isActive ? 'text-yellow-400' : 'text-zinc-600'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <ArrowRight size={14} className={`mx-1 shrink-0 ${isPending ? 'text-zinc-800' : 'text-zinc-600'}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════
export default function SocialDashboardPage() {
    // Core state
    const [activeOp, setActiveOp] = useState<ActiveOp>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [inputText, setInputText] = useState('')
    const [outputs, setOutputs] = useState<OutputEntry[]>([])
    const [historyOpen, setHistoryOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    // Editor state (M1)
    const [editMode, setEditMode] = useState(false)
    const [editContent, setEditContent] = useState('')
    const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'instagram'>('facebook')
    const editorRef = useRef<HTMLTextAreaElement>(null)

    // Publish state (M2)
    const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle')
    const [publishedLinks, setPublishedLinks] = useState<{ fb?: string; ig?: string }>({})
    const [imageUrl, setImageUrl] = useState('')
    const [showConfirm, setShowConfirm] = useState<'fb' | 'ig' | null>(null)
    const [publishError, setPublishError] = useState<string | null>(null)

    // Pipeline state (M3)
    const [pipelineMode, setPipelineMode] = useState(false)
    const [pipelineStep, setPipelineStep] = useState<PipelineStep>(0)
    const [pipelineMaxStep, setPipelineMaxStep] = useState<PipelineStep>(0)
    const [nailHooks, setNailHooks] = useState<string[]>([])
    const [hookVariants, setHookVariants] = useState<Record<number, string>>({})
    const [variantLoading, setVariantLoading] = useState<number | null>(null)

    // Hashtag state (M4b)
    const [hashtags, setHashtags] = useState<Hashtag[]>([])
    const [showHashtags, setShowHashtags] = useState(false)
    const [newHashtag, setNewHashtag] = useState('')

    // Calendar state (M4c)
    const [showCalendar, setShowCalendar] = useState(false)
    const [calDate, setCalDate] = useState('')
    const [calPlatform, setCalPlatform] = useState('Facebook')
    const [calSuccess, setCalSuccess] = useState(false)

    // Analytics state (M4d)
    const [analytics, setAnalytics] = useState<{ likes: number; comments: number; shares?: number } | null>(null)
    const [analyticsLoading, setAnalyticsLoading] = useState(false)

    useEffect(() => { setOutputs(loadOutputs()) }, [result])
    useEffect(() => { setHashtags(loadHashtags()) }, [])

    // ─── Markdown toolbar insert ──────────────────────
    const insertMd = useCallback((before: string, after: string = '') => {
        const ta = editorRef.current
        if (!ta) return
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const selected = editContent.slice(start, end)
        const newText = editContent.slice(0, start) + before + selected + after + editContent.slice(end)
        setEditContent(newText)
        setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, start + before.length + selected.length) }, 10)
    }, [editContent])

    // ─── Core operation runner ────────────────────────
    const handleRun = async (op: ActiveOp, overrideInput?: string) => {
        if (!op || loading) return
        setActiveOp(op)
        setLoading(true)
        setResult(null)
        setEditMode(false)
        setPublishStatus('idle')
        setPublishedLinks({})
        setPublishError(null)
        setAnalytics(null)

        const text = overrideInput ?? inputText
        let res: { success: boolean; data?: string; error?: string; filename?: string }

        switch (op) {
            case 'MAP': res = await runMAP(); break
            case 'NAIL': res = await runNAIL(text || undefined); break
            case 'EXECUTE':
                if (!text.trim()) { setResult('Wpisz pomysl na post lub wklej hook z etapu NAIL.'); setLoading(false); return }
                res = await runEXECUTE(text); break
            case 'WD40':
                if (!text.trim()) { setResult('Wklej tresci do analizy (posty, copy, drafty).'); setLoading(false); return }
                res = await runWD40(text); break
            default: res = { success: false, error: 'Nieznana operacja' }
        }

        if (res.success && res.data) {
            setResult(res.data)
            saveOutput({ id: Date.now().toString(), type: op, content: res.data, date: new Date().toLocaleString('pl-PL') })
            if (op === 'NAIL') setNailHooks(parseNailHooks(res.data))
        } else {
            setResult('Blad: ' + (res.error || 'Nieznany'))
        }
        setLoading(false)
    }

    // ─── Pipeline control ─────────────────────────────
    const startPipeline = async () => {
        setPipelineMode(true)
        setPipelineStep(1)
        setPipelineMaxStep(1)
        setNailHooks([])
        setHookVariants({})
        await handleRun('MAP')
        setPipelineStep(2)
        setPipelineMaxStep(2)
    }

    const pipelineRunNail = async () => {
        const mapContext = result ? result.slice(0, 500) : ''
        await handleRun('NAIL', mapContext)
        setPipelineStep(3)
        setPipelineMaxStep(3)
    }

    const pipelineSelectHook = async (hook: string) => {
        setInputText(hook)
        await handleRun('EXECUTE', hook)
        setPipelineStep(4)
        setPipelineMaxStep(4)
        setEditMode(true)
        setEditContent(result || '')
    }

    // ─── View file from history ───────────────────────
    const handleViewOutput = (entry: OutputEntry) => {
        setResult(entry.content)
        setActiveOp(entry.type)
        setEditMode(false)
    }

    // ─── Copy to clipboard ───────────────────────────
    const handleCopy = () => {
        const text = editMode ? editContent : result
        if (text) { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    }

    // ─── Save edited file ────────────────────────────
    const handleSave = () => {
        setResult(editContent)
        setEditMode(false)
    }

    // ─── Publish ─────────────────────────────────────
    const handlePublish = async (platform: 'fb' | 'ig') => {
        setShowConfirm(null)
        const content = editMode ? editContent : result
        if (!content) return
        setPublishError(null)

        if (platform === 'fb') {
            setPublishStatus('publishing-fb')
            const res = await publishDashboardToFB(content, imageUrl || undefined)
            if (res.success) {
                setPublishedLinks(prev => ({ ...prev, fb: res.permalink || undefined }))
                setPublishStatus('done')
            } else {
                setPublishError(res.error)
                setPublishStatus('idle')
            }
        } else {
            if (!imageUrl.trim()) { setPublishError('Instagram wymaga URL obrazka'); return }
            setPublishStatus('publishing-ig')
            const res = await publishDashboardToIG(imageUrl, content)
            if (res.success) {
                setPublishedLinks(prev => ({ ...prev, ig: res.permalink || undefined }))
                setPublishStatus('done')
            } else {
                setPublishError(res.error)
                setPublishStatus('idle')
            }
        }
    }

    // ─── A/B Hook variant ────────────────────────────
    const handleVariant = async (index: number, hook: string) => {
        setVariantLoading(index)
        const res = await generateHookVariant(hook)
        if (res.success && res.data) setHookVariants(prev => ({ ...prev, [index]: res.data! }))
        setVariantLoading(null)
    }

    // ─── Hashtag insert ──────────────────────────────
    const handleInsertHashtag = (tag: string) => {
        if (editMode) setEditContent(prev => prev + ' ' + tag)
    }

    const handleAddHashtag = () => {
        if (!newHashtag.trim()) return
        const clean = newHashtag.trim().startsWith('#') ? newHashtag.trim() : `#${newHashtag.trim()}`
        if (hashtags.some(h => h.tag === clean)) return
        const updated = [...hashtags, { tag: clean, category: 'general', useCount: 0 }]
        setHashtags(updated)
        saveHashtags(updated)
        setNewHashtag('')
    }

    const handleRemoveHashtag = (tag: string) => {
        const updated = hashtags.filter(h => h.tag !== tag)
        setHashtags(updated)
        saveHashtags(updated)
    }

    // ─── Calendar add ────────────────────────────────
    const handleAddToCalendar = async () => {
        const content = editMode ? editContent : result
        if (!content || !calDate) return
        const res = await addDashboardToCalendar(content, calPlatform, calDate)
        if (res.success) { setCalSuccess(true); setTimeout(() => { setCalSuccess(false); setShowCalendar(false) }, 2000) }
    }

    // ─── Analytics fetch ─────────────────────────────
    const handleFetchAnalytics = async () => {
        setAnalyticsLoading(true)
        if (publishedLinks.fb) {
            const fbId = publishedLinks.fb?.split('/').pop() || ''
            const data = await getFBPostInsights(fbId)
            if (data) setAnalytics(data)
        } else if (publishedLinks.ig) {
            const data = await getIGPostInsights(publishedLinks.ig)
            if (data) setAnalytics(data)
        }
        setAnalyticsLoading(false)
    }

    const needsInput = activeOp === 'EXECUTE' || activeOp === 'WD40'
    const optionalInput = activeOp === 'NAIL'
    const hasResult = result && !loading

    return (
        <div className="flex flex-col gap-6">
            {/* ════ Header ════ */}
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
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { if (pipelineMode) { setPipelineMode(false); setPipelineStep(0) } else { startPipeline() } }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${pipelineMode ? 'bg-yellow-400 text-zinc-950 shadow-lg shadow-yellow-500/25' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                    >
                        <Zap size={14} />
                        {pipelineMode ? 'Pipeline ON' : 'Pipeline Mode'}
                    </button>
                    <div className="hidden md:flex items-center gap-2 text-xs text-zinc-600">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Engine aktywny
                    </div>
                </div>
            </div>

            {/* ════ Pipeline Indicator (M3) ════ */}
            {pipelineMode && <PipelineIndicator step={pipelineStep} maxStep={pipelineMaxStep} />}

            {/* ════ 4 Operation Cards (hidden in pipeline mode) ════ */}
            {!pipelineMode && (
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
                                className={`relative group p-5 rounded-2xl border transition-all duration-300 text-left
                                    ${isActive ? `bg-zinc-900 ${cfg.border} shadow-xl ${cfg.glow}` : 'bg-zinc-900/50 border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700'}
                                    ${loading && activeOp !== key ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {isRunning && <div className="absolute inset-0 rounded-2xl overflow-hidden"><div className={`absolute inset-0 bg-gradient-to-r ${cfg.color} opacity-5 animate-pulse`} /></div>}
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white shadow-lg`}>
                                            {isRunning ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
                                    </div>
                                    <h3 className="text-white font-bold text-sm mb-1">{cfg.title}</h3>
                                    <p className="text-zinc-500 text-xs leading-relaxed">{cfg.description}</p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* ════ Pipeline NAIL Hook Selection (M3) ════ */}
            {pipelineMode && pipelineStep === 2 && !loading && nailHooks.length === 0 && (
                <button onClick={pipelineRunNail} className="bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 self-start">
                    <Crosshair size={16} /> Generuj 5 Hookow z Pain Blockami
                </button>
            )}

            {pipelineMode && pipelineStep >= 3 && nailHooks.length > 0 && !loading && pipelineStep === 3 && (
                <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-5">
                    <h3 className="text-amber-400 font-bold text-sm mb-4 flex items-center gap-2"><Crosshair size={16} /> Wybierz hook do EXECUTE</h3>
                    <div className="flex flex-col gap-3">
                        {nailHooks.map((hook, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <button
                                    onClick={() => pipelineSelectHook(hook)}
                                    className="flex-1 text-left bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-400/30 rounded-xl px-4 py-3 transition-all group"
                                >
                                    <span className="text-amber-400 text-xs font-bold">Hook #{i + 1}</span>
                                    <p className="text-white text-sm mt-1">{hook}</p>
                                </button>
                                <button
                                    onClick={() => handleVariant(i, hook)}
                                    disabled={variantLoading === i}
                                    className="shrink-0 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-500 hover:text-amber-400 text-xs font-medium transition-colors"
                                    title="Generuj wariant A/B"
                                >
                                    {variantLoading === i ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                </button>
                                {hookVariants[i] && (
                                    <button
                                        onClick={() => pipelineSelectHook(hookVariants[i])}
                                        className="flex-1 text-left bg-zinc-800/50 hover:bg-zinc-700 border border-purple-500/20 hover:border-purple-400/30 rounded-xl px-4 py-3 transition-all"
                                    >
                                        <span className="text-purple-400 text-xs font-bold">Wariant A/B</span>
                                        <p className="text-white text-sm mt-1">{hookVariants[i]}</p>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ════ Input Area (non-pipeline) ════ */}
            {!pipelineMode && (needsInput || optionalInput) && !loading && (
                <div className={`bg-zinc-900 border rounded-2xl p-5 transition-all ${activeOp ? OP_CONFIG[activeOp].border : 'border-zinc-800'}`}>
                    <label className="text-sm font-bold text-zinc-400 mb-2 block">
                        {activeOp === 'NAIL' && 'Kontekst (opcjonalnie)'}
                        {activeOp === 'EXECUTE' && 'Wklej pomysl na post (hook z NAIL lub wlasny temat)'}
                        {activeOp === 'WD40' && 'Wklej tresci do analizy'}
                    </label>
                    <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} rows={4}
                        placeholder={activeOp === 'NAIL' ? 'np. "skupmy sie na druku"' : activeOp === 'EXECUTE' ? 'np. "Twoja strona za 500zl kosztuje Cie 50 klientow miesiecznie"' : 'Wklej tutaj...'}
                        className="w-full bg-zinc-950 border border-zinc-700 text-white text-sm rounded-xl p-3.5 resize-none focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all"
                    />
                    <button onClick={() => handleRun(activeOp)} disabled={loading || (needsInput && !inputText.trim())}
                        className="mt-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-zinc-950 font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-yellow-500/20 disabled:opacity-40 flex items-center gap-2">
                        <Rocket size={16} /> Uruchom {activeOp && OP_CONFIG[activeOp].label}
                    </button>
                </div>
            )}

            {/* ════ Loading State ════ */}
            {loading && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeOp ? OP_CONFIG[activeOp].color : 'from-yellow-400 to-amber-500'} flex items-center justify-center shadow-2xl`}>
                            <Loader2 size={28} className="animate-spin text-white" />
                        </div>
                        <div className={`absolute -inset-4 bg-gradient-to-br ${activeOp ? OP_CONFIG[activeOp].color : ''} rounded-3xl opacity-10 animate-pulse blur-xl`} />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold">Wuyo Social Engine pracuje...</p>
                        <p className="text-zinc-500 text-sm mt-1">
                            {activeOp === 'MAP' && 'Skanowanie trendow i algorytmow FB/IG'}
                            {activeOp === 'NAIL' && 'Generowanie strategii z Pain Blockami'}
                            {activeOp === 'EXECUTE' && 'Tworzenie gotowego copy + prompty graficzne'}
                            {activeOp === 'WD40' && 'Analiza i wyostrzanie przekazu'}
                        </p>
                    </div>
                </div>
            )}

            {/* ════ Result Panel / Editor (M1) ════ */}
            {hasResult && (
                <div className={`bg-zinc-900 border rounded-2xl overflow-hidden ${activeOp ? OP_CONFIG[activeOp].border : 'border-zinc-800'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
                        <div className="flex items-center gap-3">
                            {activeOp && (() => { const Icon = OP_CONFIG[activeOp].icon; return <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${OP_CONFIG[activeOp].color} flex items-center justify-center`}><Icon size={16} className="text-white" /></div> })()}
                            <div>
                                <h2 className="text-white font-bold text-sm">
                                    {editMode ? 'Edytor' : `Wynik: ${activeOp && OP_CONFIG[activeOp].title}`}
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!editMode && (
                                <button onClick={() => { setEditMode(true); setEditContent(result!) }}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all">
                                    <Pencil size={12} /> Edytuj
                                </button>
                            )}
                            {editMode && (
                                <button onClick={handleSave}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-all">
                                    <Save size={12} /> Zapisz
                                </button>
                            )}
                            <button onClick={handleCopy}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all">
                                {copied ? <><Check size={12} className="text-green-400" /> Skopiowano</> : <><Copy size={12} /> Kopiuj</>}
                            </button>
                        </div>
                    </div>

                    {/* Editor Split View (M1) */}
                    {editMode ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                            {/* Left: Toolbar + Textarea */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-800 bg-zinc-950/30">
                                    <button onClick={() => insertMd('**', '**')} title="Bold" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><Bold size={14} /></button>
                                    <button onClick={() => insertMd('*', '*')} title="Italic" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><Italic size={14} /></button>
                                    <button onClick={() => insertMd('## ')} title="Heading" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><Heading2 size={14} /></button>
                                    <button onClick={() => insertMd('- ')} title="Lista" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><List size={14} /></button>
                                    <button onClick={() => insertMd('1. ')} title="Numeracja" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"><ListOrdered size={14} /></button>
                                    <div className="w-px h-4 bg-zinc-800 mx-1" />
                                    <button onClick={() => setShowHashtags(!showHashtags)} title="Hashtagi" className={`p-1.5 rounded transition-colors ${showHashtags ? 'bg-yellow-400/20 text-yellow-400' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}><Hash size={14} /></button>
                                </div>

                                {/* Hashtag Bank (M4b) */}
                                {showHashtags && (
                                    <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950/20">
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {hashtags.map(h => (
                                                <span key={h.tag} className="inline-flex items-center gap-1 group">
                                                    <button onClick={() => handleInsertHashtag(h.tag)}
                                                        className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-yellow-400 hover:bg-yellow-400/20 transition-colors">
                                                        {h.tag}
                                                    </button>
                                                    <button onClick={() => handleRemoveHashtag(h.tag)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"><Trash2 size={10} /></button>
                                                </span>
                                            ))}
                                            {hashtags.length === 0 && <span className="text-zinc-600 text-xs">Brak zapisanych hashtagow</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <input value={newHashtag} onChange={e => setNewHashtag(e.target.value)} placeholder="#nowyhashtag"
                                                onKeyDown={e => e.key === 'Enter' && handleAddHashtag()}
                                                className="flex-1 bg-zinc-950 border border-zinc-700 text-white text-xs rounded-lg px-3 py-1.5 focus:border-yellow-400/50" />
                                            <button onClick={handleAddHashtag} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"><Plus size={14} /></button>
                                        </div>
                                    </div>
                                )}

                                <textarea ref={editorRef} value={editContent} onChange={e => setEditContent(e.target.value)}
                                    className="flex-1 min-h-[400px] bg-zinc-950 text-zinc-200 text-sm p-4 resize-none focus:outline-none font-mono leading-relaxed" />
                            </div>

                            {/* Right: Preview */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-950/30">
                                    <Eye size={14} className="text-zinc-500" />
                                    <span className="text-zinc-500 text-xs font-bold">PREVIEW</span>
                                    <div className="ml-auto flex gap-1">
                                        <button onClick={() => setPreviewPlatform('facebook')}
                                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewPlatform === 'facebook' ? 'bg-blue-600/20 text-blue-400' : 'text-zinc-600 hover:text-white'}`}>FB</button>
                                        <button onClick={() => setPreviewPlatform('instagram')}
                                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewPlatform === 'instagram' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-600 hover:text-white'}`}>IG</button>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto max-h-[500px]">
                                    <PhonePreview platform={previewPlatform} content={editContent} />
                                    <div className="mt-4 text-sm text-zinc-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(editContent) }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Read-only result */
                        <div className="p-6 text-sm text-zinc-300 leading-relaxed max-h-[600px] overflow-y-auto prose-invert" dangerouslySetInnerHTML={{ __html: formatMarkdown(result!) }} />
                    )}
                </div>
            )}

            {/* ════ Publish Panel (M2) ════ */}
            {hasResult && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Send size={16} className="text-yellow-400" /> Publikacja & Narzedzia</h3>

                    {/* Image URL */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1">
                            <label className="text-zinc-500 text-xs mb-1 block">URL obrazka (wymagany dla IG, opcjonalny dla FB)</label>
                            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
                                className="w-full bg-zinc-950 border border-zinc-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-yellow-400/50 focus:border-yellow-400/50" />
                        </div>
                    </div>

                    {/* Buttons row */}
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setShowConfirm('fb')}
                            disabled={publishStatus === 'publishing-fb' || publishStatus === 'publishing-ig'}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all disabled:opacity-40 shadow-lg shadow-blue-600/20">
                            {publishStatus === 'publishing-fb' ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                            Publikuj na FB
                        </button>

                        <button onClick={() => imageUrl.trim() ? setShowConfirm('ig') : setPublishError('Instagram wymaga URL obrazka')}
                            disabled={publishStatus === 'publishing-fb' || publishStatus === 'publishing-ig'}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm transition-all disabled:opacity-40 shadow-lg shadow-purple-600/20">
                            {publishStatus === 'publishing-ig' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                            Publikuj na IG
                        </button>

                        <button onClick={() => setShowCalendar(!showCalendar)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${showCalendar ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                            <CalendarPlus size={16} /> Do kalendarza
                        </button>

                        {publishStatus === 'done' && (publishedLinks.fb || publishedLinks.ig) && (
                            <button onClick={handleFetchAnalytics} disabled={analyticsLoading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-sm font-medium transition-all">
                                {analyticsLoading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                                Sprawdz wyniki
                            </button>
                        )}
                    </div>

                    {/* Calendar form (M4c) */}
                    {showCalendar && (
                        <div className="mt-4 flex flex-wrap gap-3 items-end bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <div>
                                <label className="text-zinc-500 text-xs mb-1 block">Data</label>
                                <input type="date" value={calDate} onChange={e => setCalDate(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="text-zinc-500 text-xs mb-1 block">Platforma</label>
                                <select value={calPlatform} onChange={e => setCalPlatform(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2">
                                    <option>Facebook</option><option>Instagram</option><option>Obie</option>
                                </select>
                            </div>
                            <button onClick={handleAddToCalendar} disabled={!calDate}
                                className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-sm disabled:opacity-40 flex items-center gap-2">
                                {calSuccess ? <><Check size={14} /> Dodano!</> : <><CalendarPlus size={14} /> Dodaj</>}
                            </button>
                        </div>
                    )}

                    {/* Published links */}
                    {(publishedLinks.fb || publishedLinks.ig) && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {publishedLinks.fb && (
                                <a href={publishedLinks.fb} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                                    <Check size={12} /> FB opublikowany <ExternalLink size={10} />
                                </a>
                            )}
                            {publishedLinks.ig && (
                                <a href={publishedLinks.ig} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                                    <Check size={12} /> IG opublikowany <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    )}

                    {/* Analytics (M4d) */}
                    {analytics && (
                        <div className="mt-4 flex gap-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">{analytics.likes}</p>
                                <p className="text-zinc-500 text-xs">Polubienia</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">{analytics.comments}</p>
                                <p className="text-zinc-500 text-xs">Komentarze</p>
                            </div>
                            {'shares' in analytics && analytics.shares !== undefined && (
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">{analytics.shares}</p>
                                    <p className="text-zinc-500 text-xs">Udostepnienia</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {publishError && (
                        <p className="mt-3 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{publishError}</p>
                    )}
                </div>
            )}

            {/* ════ Confirm Dialog (M2) ════ */}
            {showConfirm && (
                <ConfirmDialog
                    platform={showConfirm}
                    content={(editMode ? editContent : result) || ''}
                    imageUrl={imageUrl}
                    onConfirm={() => handlePublish(showConfirm)}
                    onCancel={() => setShowConfirm(null)}
                />
            )}

            {/* ════ Output History ════ */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <button onClick={() => setHistoryOpen(!historyOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <Clock size={18} className="text-zinc-500" />
                        <span className="text-white font-bold text-sm">Historia operacji</span>
                        <span className="text-zinc-600 text-xs">({outputs.length})</span>
                    </div>
                    {historyOpen ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                </button>
                {historyOpen && (
                    <div className="border-t border-zinc-800 divide-y divide-zinc-800/50 max-h-[300px] overflow-y-auto">
                        {outputs.length === 0 ? (
                            <p className="px-6 py-4 text-zinc-600 text-sm italic">Brak wygenerowanych wynikow. Uruchom pierwsza operacje.</p>
                        ) : outputs.map((entry) => {
                            const cfg = OP_CONFIG[entry.type]
                            return (
                                <button key={entry.id} onClick={() => handleViewOutput(entry)}
                                    className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-zinc-800/30 transition-colors">
                                    <div className={`w-7 h-7 rounded-lg ${cfg?.bg || 'bg-zinc-800'} flex items-center justify-center`}>
                                        {cfg && (() => { const Icon = cfg.icon; return <Icon size={14} className={cfg.text} /> })()}
                                    </div>
                                    <div className="flex-1 min-w-0"><p className="text-sm text-zinc-300 font-medium truncate">{cfg?.title} — {entry.content.slice(0, 60)}...</p></div>
                                    <span className="text-xs text-zinc-600 shrink-0">{entry.date}</span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
