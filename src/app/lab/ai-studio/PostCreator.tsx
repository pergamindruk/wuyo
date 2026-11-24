'use client'

// "use client": formularz ze stanem, edycja wyniku, kopiowanie i publikacja z przeglądarki.

import { useState } from 'react'
import {
    Send, Copy, Check, Sparkles, ArrowLeft, RefreshCw, Image as ImageIcon,
    AlertTriangle, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'
import { generatePostForPlatform, publishDirectPost } from './actions'
import { RefineBar } from './RefineBar'
import { SectionTitle } from '@/components/lab/ui/PageHeader'

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
                {/* Górny pasek */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                        <ArrowLeft size={16} strokeWidth={1.8} /> Wróć
                    </button>
                    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                            {currentPlatform.emoji} {currentPlatform.label}
                        </span>
                        <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">
                            {currentTone.label}
                        </span>
                        <button
                            type="button"
                            onClick={handleRegenerate} disabled={generating}
                            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-yellow-400/50 hover:text-white disabled:opacity-50"
                        >
                            <RefreshCw size={13} strokeWidth={1.8} className={generating ? 'animate-spin' : ''} />
                            Regeneruj
                        </button>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white"
                        >
                            {copied
                                ? <><Check size={13} className="text-emerald-400" /> Skopiowano</>
                                : <><Copy size={13} strokeWidth={1.8} /> Kopiuj</>}
                        </button>
                    </div>
                </div>

                {/* Edycja treści */}
                <div className="lab-card">
                    {generating ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-500">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-yellow-400/25 border-t-yellow-400" />
                            <span className="text-sm">Piszę nową wersję...</span>
                        </div>
                    ) : (
                        <textarea
                            value={content} onChange={e => setContent(e.target.value)}
                            className="min-h-[320px] w-full resize-none !rounded-none !border-0 !bg-transparent p-6 text-sm leading-relaxed text-zinc-200 !shadow-none focus:outline-none"
                            placeholder="Treść posta..."
                        />
                    )}

                    {/* Licznik znaków */}
                    {charLimit > 0 && !generating && (
                        <div className="border-t border-white/[0.06] px-6 pb-5 pt-3">
                            <div className="mb-1.5 flex justify-between text-[11px]">
                                <span className={overLimit ? 'font-bold text-red-300' : 'text-zinc-500'}>
                                    {charCount.toLocaleString('pl-PL')} / {charLimit.toLocaleString('pl-PL')} znaków
                                </span>
                                {overLimit && <span className="rounded-full bg-red-400/15 px-2.5 py-0.5 font-semibold text-red-300">Przekroczono limit</span>}
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                <div
                                    className={`h-full rounded-full transition-all duration-300 ${overLimit ? 'bg-red-500' : charPercent > 85 ? 'bg-orange-400' : 'bg-yellow-400 shadow-[0_0_12px_rgba(255,214,10,0.6)]'}`}
                                    style={{ width: `${charPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {!generating && content && <RefineBar text={content} onResult={setContent} />}

                {genError && (
                    <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300">
                        {genError}
                    </p>
                )}

                {/* Panel publikacji */}
                {currentPlatform.publishable ? (
                    <div className="lab-card">
                        <button
                            type="button"
                            onClick={() => setShowPublishPanel(v => !v)}
                            data-sound="pop"
                            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.03]"
                        >
                            <span className="flex items-center gap-2.5 text-sm font-bold text-white">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Send size={16} strokeWidth={1.8} /></span>
                                Opublikuj
                            </span>
                            {showPublishPanel ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                        </button>

                        {showPublishPanel && (
                            <div className="flex flex-col gap-4 border-t border-white/[0.06] px-6 pb-6">
                                <div className="flex flex-col gap-2 pt-4">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                                        <ImageIcon size={13} strokeWidth={1.8} />
                                        URL grafiki
                                        {platform === 'facebook'
                                            ? ' (opcjonalnie dla FB)'
                                            : ' (wymagany dla Instagrama)'}
                                    </label>
                                    <input
                                        value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                                        placeholder="https://twoja-domena.pl/grafika.jpg"
                                        className="px-4 py-2.5 text-sm text-white"
                                    />
                                    {(platform === 'instagram' || platform === 'both') && !imageUrl && (
                                        <p className="flex items-center gap-1.5 text-xs text-orange-300/80">
                                            <AlertTriangle size={12} />
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
                    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-5 py-4 text-sm text-zinc-400">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><ExternalLink size={15} strokeWidth={1.8} /></span>
                        <span>Skopiuj tekst i wklej bezpośrednio na <span className="font-medium text-white">{currentPlatform.label}</span></span>
                    </div>
                )}
            </div>
        )
    }

    // ── Form view ──
    return (
        <form onSubmit={handleGenerate} className="lab-card flex max-w-3xl flex-col gap-7 p-5 sm:p-6">
            <SectionTitle icon={Sparkles} title="Nowy post" />

            {/* Temat */}
            <div className="-mt-3 flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">O czym napisać?</label>
                <textarea
                    required rows={3}
                    value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="np. Ile kosztuje strona dla warsztatu samochodowego w Rzeszowie"
                    className="w-full resize-none p-4 text-sm text-white placeholder:text-zinc-600"
                />
            </div>

            {/* Ton */}
            <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Ton</label>
                <div className="flex flex-wrap gap-2">
                    {TONES.map(t => (
                        <button
                            key={t.id} type="button" onClick={() => setTone(t.id)}
                            className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${
                                tone === t.id
                                    ? 'bg-yellow-400 font-bold text-zinc-950'
                                    : 'border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Platforma */}
            <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">Platforma</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {PLATFORMS.map(p => (
                        <button
                            key={p.id} type="button" onClick={() => setPlatform(p.id)}
                            className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3.5 text-center transition-all ${
                                platform === p.id
                                    ? 'bg-yellow-400/10 text-yellow-300 ring-1 ring-yellow-400/50 shadow-[0_0_24px_-10px_rgba(255,214,10,0.6)]'
                                    : 'bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'
                            }`}
                        >
                            <span className="text-xl leading-none">{p.emoji}</span>
                            <span className="text-xs font-bold leading-none">{p.label}</span>
                            <span className="text-[10px] leading-none opacity-60">{p.meta}</span>
                            {!p.publishable && (
                                <span className="text-[9px] leading-none text-zinc-600">tylko kopiuj</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fakty */}
            <div className="flex flex-col gap-2">
                <button
                    type="button" onClick={() => setShowExtra(v => !v)}
                    className="flex w-fit items-center gap-2 rounded-full px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
                >
                    {showExtra ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Fakty do posta (realizacja, liczby, klient)
                </button>
                {showExtra && (
                    <textarea
                        rows={2}
                        value={extraContext} onChange={e => setExtraContext(e.target.value)}
                        placeholder="Fakty, których AI ma się trzymać: np. realizacja dla fizjoterapeuty z Rzeszowa, strona 5 podstron, gotowa w 10 dni."
                        className="w-full resize-none p-3 text-sm text-white placeholder:text-zinc-600"
                    />
                )}
            </div>

            {genError && (
                <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    {genError}
                </p>
            )}

            <button
                type="submit" disabled={generating || !topic.trim()}
                className="flex items-center justify-center gap-2 bg-yellow-400 py-3.5 font-bold text-zinc-950 disabled:cursor-wait disabled:opacity-50"
            >
                {generating ? (
                    <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
                        Generuję post...
                    </>
                ) : (
                    <><Sparkles size={16} strokeWidth={1.8} /> Generuj post</>
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
                type="button"
                onClick={onClick}
                disabled={disabled || state === 'loading' || state === 'success'}
                className={`flex min-w-[180px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50
                    ${state === 'success' ? 'bg-emerald-400/15 text-emerald-300' :
                      state === 'error'   ? 'bg-red-400/15 text-red-300' :
                      'bg-yellow-400 text-zinc-950'}`}
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
                <p className="max-w-[220px] text-xs leading-snug text-red-300/80">{message}</p>
            )}
        </div>
    )
}

