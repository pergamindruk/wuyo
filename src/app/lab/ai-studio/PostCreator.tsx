'use client'

// "use client": formularz ze stanem, edycja wyniku, kopiowanie i publikacja z przeglądarki.

import { useState } from 'react'
import {
    Send, Copy, Check, Sparkles, ArrowLeft, RefreshCw, Image as ImageIcon,
    AlertTriangle, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'
import { generatePostForPlatform, publishDirectPost } from './actions'
import { RefineBar } from './RefineBar'

export type PostCreatorInit = {
    topic: string
    tone: string
    platform: string
    extraContext: string
    content?: string
}

const TONES = [
    { id: 'poradnik',    label: 'Poradnik' },
    { id: 'pytanie',     label: 'Pytanie klienta' },
    { id: 'realizacja',  label: 'Realizacja' },
    { id: 'oferta',      label: 'Oferta z ceną' },
    { id: 'za_kulisami', label: 'Za kulisami' },
]

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', emoji: '📸', meta: 'max 2200 zn', publishable: true,  limit: 2200 },
    { id: 'facebook',  label: 'Facebook',  emoji: '👍', meta: 'fanpage',      publishable: true,  limit: 0    },
    { id: 'both',      label: 'IG + FB',   emoji: '🚀', meta: '2 platformy',  publishable: true,  limit: 2200 },
    { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼', meta: 'max 3000 zn',  publishable: false, limit: 3000 },
    { id: 'blog',      label: 'Blog',      emoji: '✍️',  meta: 'artykuł',      publishable: false, limit: 0    },
]

// ─── Post Creator component ───────────────────────────────────────────────────

export function PostCreator({ initialData }: { initialData?: PostCreatorInit }) {
    const [topic,        setTopic]        = useState(initialData?.topic        || '')
    const [tone,         setTone]         = useState(initialData?.tone         || 'poradnik')
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
        if (res.success) {
            setContent(res.data)
            setStep('result')
            setShowPublishPanel(false)
            setPublishState({})
            setPublishMessages({})
        } else {
            setGenError(res.error)
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

                {!generating && content && <RefineBar text={content} onResult={setContent} />}

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
                    placeholder="np. Ile kosztuje strona dla warsztatu samochodowego w Rzeszowie"
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
                    Fakty do posta (realizacja, liczby, klient)
                </button>
                {showExtra && (
                    <textarea
                        rows={2}
                        value={extraContext} onChange={e => setExtraContext(e.target.value)}
                        placeholder="Fakty, których AI ma się trzymać: np. realizacja dla fizjoterapeuty z Rzeszowa, strona 5 podstron, gotowa w 10 dni."
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

