'use client'

// "use client": zakładki, formularze ze stanem, kopiowanie do schowka i parametry z adresu (link z CRM).

import { Suspense, useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    Bot, Calculator, Clock, Copy, Check, FolderPlus, MessageSquareReply, Phone, RotateCcw, Sparkles, Trash2,
} from 'lucide-react'
import {
    answerClient, createProjectFromQuote, deleteGeneration, generateCallScript, getCallCandidates, getGenerations,
    type CallCandidate, type ClientAnswer, type Generation,
} from './actions'
import { splitAnswer } from '@/lib/lab/ai/context'
import { PostCreator, type PostCreatorInit } from './PostCreator'
import { RefineBar } from './RefineBar'

type Tab = 'odpowiedz' | 'telefon' | 'post' | 'historia'

const PROSE = 'prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-h2:mt-4 prose-h2:mb-1 ' +
    'prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-wider prose-strong:text-white prose-table:text-xs'

function CopyButton({ text, label = 'Kopiuj' }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white"
        >
            {copied ? <><Check size={12} className="text-green-400" /> Skopiowano</> : <><Copy size={12} /> {label}</>}
        </button>
    )
}

function Spinner({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-zinc-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-400/30 border-t-yellow-400" />
            {label}
        </div>
    )
}

// ─── Odpowiedz klientowi ─────────────────────────────────────────────────────

function ClientAnswerTab({ initialMessage, leadId, client, restored }: {
    initialMessage: string; leadId: string | null; client: string; restored: ClientAnswer | null
}) {
    const [message, setMessage] = useState(initialMessage)
    const [channel, setChannel] = useState<'mail' | 'whatsapp'>('mail')
    const [answer, setAnswer] = useState<ClientAnswer | null>(restored)
    const [error, setError] = useState('')
    const [pending, start] = useTransition()
    const [projectName, setProjectName] = useState('')
    const [projectState, setProjectState] = useState<'idle' | 'saving' | 'done'>('idle')

    useEffect(() => { setMessage(initialMessage) }, [initialMessage])
    useEffect(() => { if (restored) setAnswer(restored) }, [restored])

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        start(async () => {
            setError('')
            setProjectState('idle')
            const res = await answerClient(message, channel)
            if (res.success) setAnswer(res.data)
            else setError(res.error)
        })
    }

    const createProject = async () => {
        if (!projectName.trim()) return
        setProjectState('saving')
        try {
            await createProjectFromQuote(client || 'Klient', projectName, leadId || undefined)
            setProjectState('done')
        } catch {
            setProjectState('idle')
            setError('Nie udało się utworzyć projektu.')
        }
    }

    return (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div>
                    <h2 className="font-bold text-white">Wklej wiadomość od klienta</h2>
                    <p className="mt-1 text-xs text-zinc-500">Mail, WhatsApp, notatka z rozmowy. Dostaniesz wycenę z cennika i gotową odpowiedź.</p>
                </div>
                {leadId && (
                    <p className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs text-blue-400">Dane z CRM wstawione automatycznie.</p>
                )}
                <textarea
                    required
                    rows={9}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dzień dobry, potrzebuję strony dla warsztatu i nowego logo. Ile to kosztuje?"
                    className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none"
                />
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">Odpowiedź jako:</span>
                    {(['mail', 'whatsapp'] as const).map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setChannel(c)}
                            className={`rounded-lg border px-2.5 py-1 ${channel === c ? 'border-yellow-400 bg-yellow-400 font-bold text-zinc-950' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            {c === 'mail' ? 'Mail' : 'WhatsApp'}
                        </button>
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={pending || !message.trim()}
                    className="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 py-2.5 font-bold text-zinc-950 transition-colors hover:bg-yellow-300 disabled:opacity-50"
                >
                    <MessageSquareReply size={17} /> {pending ? 'Liczę i piszę...' : 'Przygotuj odpowiedź'}
                </button>
                {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400">{error}</p>}
            </form>

            <div className="flex flex-col gap-4">
                {pending ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900"><Spinner label="Liczę z cennika i piszę odpowiedź..." /></div>
                ) : answer ? (
                    <>
                        <section className="rounded-2xl border border-yellow-400/40 bg-zinc-900 p-5">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">Odpowiedź do klienta</h2>
                                <CopyButton text={answer.reply} label="Kopiuj odpowiedź" />
                            </div>
                            <textarea
                                value={answer.reply}
                                onChange={(e) => setAnswer({ ...answer, reply: e.target.value })}
                                rows={Math.min(16, Math.max(6, answer.reply.split('\n').length + 2))}
                                className="mb-3 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-100 focus:border-yellow-400/50 focus:outline-none"
                            />
                            <RefineBar text={answer.reply} onResult={(t) => setAnswer({ ...answer, reply: t })} />
                        </section>
                        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Dla Ciebie: wycena i pytania</h2>
                                <CopyButton text={answer.analysis} />
                            </div>
                            <div className={PROSE}><ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.analysis}</ReactMarkdown></div>
                            <div className="mt-5 border-t border-zinc-800 pt-4">
                                {projectState === 'done' ? (
                                    <p className="flex items-center gap-2 text-sm text-green-400"><Check size={16} /> Projekt utworzony. Jest w Strefie Klienta.</p>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            placeholder="Klient się zgodził? Nazwa projektu..."
                                            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-yellow-400/50 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={createProject}
                                            disabled={!projectName.trim() || projectState === 'saving'}
                                            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                                        >
                                            <FolderPlus size={14} /> Utwórz projekt
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
                        Tu pojawi się gotowa odpowiedź do skopiowania, a pod nią wycena z cennika.
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Telefon: ściągawka do rozmowy ───────────────────────────────────────────

function CallTab({ firmId }: { firmId: string | null }) {
    const [firms, setFirms] = useState<CallCandidate[] | null>(null)
    const [selected, setSelected] = useState<CallCandidate | null>(null)
    const [script, setScript] = useState('')
    const [error, setError] = useState('')
    const [pending, start] = useTransition()

    useEffect(() => { getCallCandidates().then(setFirms) }, [])

    // Wejście z ekranu Dziś (?firma=...): od razu ściągawka dla tej firmy.
    useEffect(() => {
        if (!firmId || firms === null || selected) return
        const found = firms.find((f) => f.id === firmId)
        pick(found ?? { id: firmId, name: 'Firma z kolejki', industry: '', phone: '', website: '', reason: '', problems: [], score: 0 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firmId, firms])

    const pick = (f: CallCandidate) => {
        setSelected(f)
        setScript('')
        start(async () => {
            setError('')
            const res = await generateCallScript(f.id)
            if (res.success) setScript(res.data)
            else setError(res.error)
        })
    }

    return (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <h2 className="mb-1 font-bold text-white">Do kogo dzwonisz?</h2>
                <p className="mb-3 text-xs text-zinc-500">Firmy z kolejki na dziś, najlepsze na górze. Kliknij, żeby dostać ściągawkę.</p>
                {firms === null ? <Spinner label="Wczytuję kolejkę..." /> : firms.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-500">Kolejka na dziś pusta.</p>
                ) : (
                    <ul className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto pr-1">
                        {firms.map((f) => (
                            <li key={f.id}>
                                <button
                                    type="button"
                                    onClick={() => pick(f)}
                                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${selected?.id === f.id ? 'border-yellow-400/60 bg-yellow-400/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-medium text-white">{f.name}</span>
                                        <span className="shrink-0 text-[10px] text-zinc-500">{f.score} pkt</span>
                                    </span>
                                    <span className="block truncate text-xs text-zinc-500">{f.industry} · {f.reason}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                {!selected ? (
                    <p className="py-16 text-center text-sm text-zinc-500">Wybierz firmę z listy.</p>
                ) : (
                    <>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 className="font-bold text-white">{selected.name}</h2>
                                <p className="text-xs text-zinc-500">{selected.website || 'brak strony'}</p>
                            </div>
                            {selected.phone && (
                                <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-bold text-zinc-950 hover:bg-yellow-300">
                                    <Phone size={14} /> {selected.phone}
                                </a>
                            )}
                        </div>
                        {pending ? <Spinner label="Piszę ściągawkę..." /> : error ? (
                            <p className="text-sm text-red-400">{error}</p>
                        ) : (
                            <div className={PROSE}><ReactMarkdown remarkPlugins={[remarkGfm]}>{script}</ReactMarkdown></div>
                        )}
                        <p className="mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                            Wynik rozmowy zapisujesz na ekranie Dziś, w kolejce telefonów (klawisze 1-4).
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}

// ─── Historia ────────────────────────────────────────────────────────────────

const KIND_LABEL: Record<string, string> = { odpowiedz: 'Odpowiedź', telefon: 'Telefon' }

function HistoryTab({ onOpen }: { onOpen: (g: Generation) => void }) {
    const [items, setItems] = useState<Generation[] | null>(null)
    const load = () => { setItems(null); getGenerations(40).then(setItems) }
    useEffect(load, [])

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-white">Historia</h2>
                <button type="button" onClick={load} aria-label="Odśwież" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"><RotateCcw size={16} /></button>
            </div>
            {items === null ? <Spinner label="Wczytuję..." /> : items.length === 0 ? (
                <p className="py-12 text-center text-zinc-500">Pusto.</p>
            ) : (
                <ul className="flex max-h-[65vh] flex-col gap-2 overflow-y-auto pr-1">
                    {items.map((g) => {
                        const kind = g.inputData.kind
                        const label = g.type === 'content' ? 'Post' : KIND_LABEL[kind] ?? 'Wycena'
                        const preview = g.type === 'content' ? `${g.inputData.platform}: ${g.inputData.topic}`
                            : kind === 'telefon' ? g.inputData.firm : (g.inputData.clientMessage ?? '').slice(0, 110)
                        return (
                            <li key={g.id} className="group flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-3 hover:border-zinc-700">
                                <button type="button" onClick={() => onOpen(g)} className="min-w-0 flex-1 text-left">
                                    <span className="mb-1 flex items-center gap-2">
                                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">{label}</span>
                                        <span className="text-[11px] text-zinc-600">{new Date(g.createdAt).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                    </span>
                                    <span className="block truncate text-sm text-zinc-400">{preview}</span>
                                </button>
                                <button
                                    type="button"
                                    aria-label="Usuń"
                                    onClick={async () => { await deleteGeneration(g.id); setItems((l) => (l ?? []).filter((x) => x.id !== g.id)) }}
                                    className="rounded-lg p-2 text-zinc-700 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

// ─── Strona ──────────────────────────────────────────────────────────────────

function AIStudioInner() {
    const params = useSearchParams()
    const [tab, setTab] = useState<Tab>('odpowiedz')
    const [initialMessage, setInitialMessage] = useState('')
    const [leadId, setLeadId] = useState<string | null>(null)
    const [client, setClient] = useState('')
    const [restored, setRestored] = useState<ClientAnswer | null>(null)
    const [postInit, setPostInit] = useState<PostCreatorInit | null>(null)
    const [postKey, setPostKey] = useState(0)
    const [firmId, setFirmId] = useState<string | null>(null)

    useEffect(() => {
        const t = params.get('tab')
        if (t === 'telefon' || t === 'post' || t === 'historia') setTab(t)
        if (t === 'telefon') setFirmId(params.get('firma'))
        if (t === 'quote' || t === 'odpowiedz') {
            setTab('odpowiedz')
            const c = params.get('client'), email = params.get('email'), details = params.get('details')
            const parts = [c && `Klient: ${c}`, email && `Email: ${email}`, details && `\nTreść zapytania:\n${details}`].filter(Boolean)
            if (parts.length) setInitialMessage(parts.join('\n'))
            setLeadId(params.get('leadId'))
            if (c) setClient(c)
        }
    }, [params])

    const openFromHistory = (g: Generation) => {
        if (g.type === 'content') {
            setPostInit({ topic: g.inputData.topic ?? '', tone: g.inputData.tone ?? 'poradnik', platform: g.inputData.platform ?? 'instagram', extraContext: g.inputData.extraContext ?? '', content: g.output })
            setPostKey((k) => k + 1)
            setTab('post')
        } else if (g.inputData.kind === 'telefon') {
            setInitialMessage('')
            setRestored({ analysis: g.output, reply: '' })
            setTab('odpowiedz')
        } else {
            setInitialMessage(g.inputData.clientMessage ?? '')
            setRestored(splitAnswer(g.output))
            setTab('odpowiedz')
        }
    }

    const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'odpowiedz', label: 'Odpowiedz klientowi', icon: <Calculator size={16} /> },
        { id: 'telefon', label: 'Telefon', icon: <Phone size={16} /> },
        { id: 'post', label: 'Post', icon: <Sparkles size={16} /> },
        { id: 'historia', label: 'Historia', icon: <Clock size={16} /> },
    ]

    return (
        <div className="flex max-w-6xl flex-col gap-6">
            <header className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-zinc-950"><Bot size={24} /></div>
                <div>
                    <h1 className="text-2xl font-bold text-white">AI Studio</h1>
                    <p className="text-sm text-zinc-400">Odpowiedzi z wyceną, ściągawki do telefonu i posty. Twoim głosem, z Twojego cennika.</p>
                </div>
            </header>

            <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-zinc-800 text-yellow-400' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'}`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </nav>

            {tab === 'odpowiedz' && <ClientAnswerTab initialMessage={initialMessage} leadId={leadId} client={client} restored={restored} />}
            {tab === 'telefon' && <CallTab firmId={firmId} />}
            {tab === 'post' && <PostCreator key={postKey} initialData={postInit ?? undefined} />}
            {tab === 'historia' && <HistoryTab onOpen={openFromHistory} />}
        </div>
    )
}

export default function AIStudioPage() {
    return (
        <Suspense fallback={<Spinner label="Wczytuję..." />}>
            <AIStudioInner />
        </Suspense>
    )
}
