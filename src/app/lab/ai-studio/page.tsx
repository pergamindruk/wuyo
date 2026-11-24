'use client'

// "use client": zakładki, formularze ze stanem, kopiowanie do schowka i parametry z adresu (link z CRM).

import { Suspense, useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    Bot, Building2, Calculator, Clock, Copy, Check, FileText, FolderPlus, History, Inbox, MessageSquareReply, Phone,
    PhoneCall, RotateCcw, Sparkles, Trash2, type LucideIcon,
} from 'lucide-react'
import {
    answerClient, createProjectFromQuote, deleteGeneration, generateCallScript, getCallCandidates, getGenerations,
    type CallCandidate, type ClientAnswer, type Generation,
} from './actions'
import { splitAnswer } from '@/lib/lab/ai/context'
import { PostCreator, type PostCreatorInit } from './PostCreator'
import { RefineBar } from './RefineBar'
import { ScoreEditor } from '@/components/lab/ScoreEditor'
import { CallNoteBox } from '@/components/lab/CallNoteBox'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'

type Tab = 'odpowiedz' | 'telefon' | 'post' | 'historia'

const PROSE = 'prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-h2:mt-4 prose-h2:mb-1 ' +
    'prose-h2:text-sm prose-h2:uppercase prose-h2:tracking-wider prose-strong:text-white prose-table:text-xs'

function CopyButton({ text, label = 'Kopiuj' }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false)
    return (
        <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            className="flex items-center gap-1.5 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:text-white"
        >
            {copied ? <><Check size={12} className="text-emerald-400" /> Skopiowano</> : <><Copy size={12} /> {label}</>}
        </button>
    )
}

function Spinner({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-zinc-500">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-yellow-400/25 border-t-yellow-400" />
            {label}
        </div>
    )
}

/** Pusty stan: ikona w szarym kółku + jedno zdanie. */
function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><Icon size={22} strokeWidth={1.8} /></span>
            <p className="max-w-xs text-sm text-zinc-500">{text}</p>
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
            <form onSubmit={submit} className="lab-card flex flex-col gap-4 p-5 sm:p-6">
                <div>
                    <SectionTitle icon={Inbox} title="Wklej wiadomość od klienta" />
                    <p className="-mt-2 text-xs text-zinc-500">Mail, WhatsApp, notatka z rozmowy. Dostaniesz wycenę z cennika i gotową odpowiedź.</p>
                </div>
                {leadId && (
                    <p className="w-fit rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">Dane z CRM wstawione automatycznie</p>
                )}
                <textarea
                    required
                    rows={9}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dzień dobry, potrzebuję strony dla warsztatu i nowego logo. Ile to kosztuje?"
                    className="w-full resize-y p-4 text-sm text-white placeholder:text-zinc-600"
                />
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500">Odpowiedź jako:</span>
                    <div className="flex rounded-full border border-white/10 bg-white/[0.03] p-1">
                        {(['mail', 'whatsapp'] as const).map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setChannel(c)}
                                className={`rounded-full px-3 py-1 font-semibold transition ${channel === c ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
                            >
                                {c === 'mail' ? 'Mail' : 'WhatsApp'}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={pending || !message.trim()}
                    className="flex items-center justify-center gap-2 bg-yellow-400 py-3 font-bold text-zinc-950 disabled:opacity-50"
                >
                    <MessageSquareReply size={17} strokeWidth={1.8} /> {pending ? 'Liczę i piszę...' : 'Przygotuj odpowiedź'}
                </button>
                {error && <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-xs text-red-300">{error}</p>}
            </form>

            <div className="flex flex-col gap-4">
                {pending ? (
                    <div className="lab-card"><Spinner label="Liczę z cennika i piszę odpowiedź..." /></div>
                ) : answer ? (
                    <>
                        <section className="lab-card !border-yellow-400/30 p-5 sm:p-6">
                            <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
                            <SectionTitle icon={MessageSquareReply} title="Odpowiedź do klienta" action={<CopyButton text={answer.reply} label="Kopiuj odpowiedź" />} />
                            <textarea
                                value={answer.reply}
                                onChange={(e) => setAnswer({ ...answer, reply: e.target.value })}
                                rows={Math.min(16, Math.max(6, answer.reply.split('\n').length + 2))}
                                className="mb-3 w-full resize-y p-4 text-sm leading-relaxed text-zinc-100"
                            />
                            <RefineBar text={answer.reply} onResult={(t) => setAnswer({ ...answer, reply: t })} />
                        </section>
                        <section className="lab-card p-5 sm:p-6">
                            <SectionTitle icon={Calculator} title="Dla Ciebie: wycena i pytania" action={<CopyButton text={answer.analysis} />} />
                            <div className={PROSE}><ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.analysis}</ReactMarkdown></div>
                            <div className="mt-5 border-t border-white/[0.07] pt-4">
                                {projectState === 'done' ? (
                                    <p className="flex items-center gap-2 text-sm text-emerald-300"><Check size={16} /> Projekt utworzony. Jest w Strefie Klienta.</p>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            placeholder="Klient się zgodził? Nazwa projektu..."
                                            className="flex-1 px-4 py-2 text-sm text-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={createProject}
                                            disabled={!projectName.trim() || projectState === 'saving'}
                                            className="flex items-center gap-1.5 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 disabled:opacity-50"
                                        >
                                            <FolderPlus size={15} strokeWidth={1.8} /> Utwórz projekt
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="lab-card">
                        <Empty icon={MessageSquareReply} text="Tu pojawi się gotowa odpowiedź do skopiowania, a pod nią wycena z cennika." />
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
            <div className="lab-card p-5 sm:p-6">
                <SectionTitle icon={PhoneCall} title="Do kogo dzwonisz?" />
                <p className="-mt-2 mb-4 text-xs text-zinc-500">Firmy z kolejki na dziś, najlepsze na górze. Kliknij, żeby dostać ściągawkę.</p>
                {firms === null ? <Spinner label="Wczytuję kolejkę..." /> : firms.length === 0 ? (
                    <Empty icon={Phone} text="Kolejka na dziś pusta." />
                ) : (
                    <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
                        {firms.map((f) => (
                            <li key={f.id}>
                                <button
                                    type="button"
                                    onClick={() => pick(f)}
                                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${selected?.id === f.id ? 'bg-yellow-400/10 ring-1 ring-yellow-400/50' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-semibold text-white">{f.name}</span>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${selected?.id === f.id ? 'bg-yellow-400/15 text-yellow-300' : 'bg-white/[0.06] text-zinc-300'}`}>{f.score} pkt</span>
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-zinc-500">{f.industry} · {f.reason}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="lab-card p-5 sm:p-6">
                {!selected ? (
                    <Empty icon={Building2} text="Wybierz firmę z listy, a dostaniesz ściągawkę do rozmowy." />
                ) : (
                    <>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="lab-chip h-11 w-11 shrink-0"><Building2 size={20} strokeWidth={1.8} /></span>
                                <div className="min-w-0">
                                    <h2 className="truncate font-bold text-white">{selected.name}</h2>
                                    <p className="truncate text-xs text-zinc-500">{selected.website || 'brak strony'}</p>
                                    {selected.score > 0 && (
                                        <ScoreEditor
                                            key={selected.id}
                                            queueId={selected.id}
                                            score={selected.score}
                                            manualReason={selected.score_manual_reason}
                                            onSaved={(score, reason) => {
                                                setSelected({ ...selected, score, score_manual_reason: reason })
                                                setFirms((l) => (l ?? []).map((x) => (x.id === selected.id ? { ...x, score, score_manual_reason: reason } : x)))
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                            {selected.phone && (
                                <a href={`tel:${selected.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 bg-yellow-400 px-4 py-2 text-sm font-bold text-zinc-950">
                                    <Phone size={15} strokeWidth={1.8} /> {selected.phone}
                                </a>
                            )}
                        </div>
                        {pending ? <Spinner label="Piszę ściągawkę..." /> : error ? (
                            <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>
                        ) : (
                            <div className={PROSE}><ReactMarkdown remarkPlugins={[remarkGfm]}>{script}</ReactMarkdown></div>
                        )}
                        <div className="mt-5 border-t border-white/[0.07] pt-4">
                            <p className="mb-2 text-xs text-zinc-500">Po rozmowie: wklej notatkę, a zapiszę wynik i następny krok. Krótki wynik możesz też kliknąć na ekranie Dziś (klawisze 1-4).</p>
                            <CallNoteBox key={selected.id} queueId={selected.id} jobId={selected.job_id} clientId={selected.client_id} compact />
                        </div>
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
        <div className="lab-card p-5 sm:p-6">
            <SectionTitle
                icon={History}
                title="Historia"
                action={<button type="button" onClick={load} aria-label="Odśwież" className="rounded-full p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"><RotateCcw size={16} strokeWidth={1.8} /></button>}
            />
            {items === null ? <Spinner label="Wczytuję..." /> : items.length === 0 ? (
                <Empty icon={History} text="Pusto. Tu trafi każda odpowiedź, ściągawka i post." />
            ) : (
                <ul className="flex max-h-[65vh] flex-col gap-2 overflow-y-auto pr-1">
                    {items.map((g) => {
                        const kind = g.inputData.kind
                        const label = g.type === 'content' ? 'Post' : KIND_LABEL[kind] ?? 'Wycena'
                        const preview = g.type === 'content' ? `${g.inputData.platform}: ${g.inputData.topic}`
                            : kind === 'telefon' ? g.inputData.firm : (g.inputData.clientMessage ?? '').slice(0, 110)
                        const Icon = g.type === 'content' ? Sparkles : kind === 'telefon' ? Phone : FileText
                        return (
                            <li key={g.id} className="group flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Icon size={16} strokeWidth={1.8} /></span>
                                <button type="button" onClick={() => onOpen(g)} className="min-w-0 flex-1 text-left">
                                    <span className="mb-1 flex items-center gap-2">
                                        <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-300">{label}</span>
                                        <span className="text-[11px] text-zinc-500">{new Date(g.createdAt).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                    </span>
                                    <span className="block truncate text-sm text-zinc-300">{preview}</span>
                                </button>
                                <button
                                    type="button"
                                    aria-label="Usuń"
                                    onClick={async () => { await deleteGeneration(g.id); setItems((l) => (l ?? []).filter((x) => x.id !== g.id)) }}
                                    className="rounded-full p-2 text-zinc-600 opacity-0 transition hover:bg-red-400/10 hover:text-red-300 group-hover:opacity-100"
                                >
                                    <Trash2 size={15} strokeWidth={1.8} />
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
        { id: 'odpowiedz', label: 'Odpowiedz klientowi', icon: <Calculator size={16} strokeWidth={1.8} /> },
        { id: 'telefon', label: 'Telefon', icon: <Phone size={16} strokeWidth={1.8} /> },
        { id: 'post', label: 'Post', icon: <Sparkles size={16} strokeWidth={1.8} /> },
        { id: 'historia', label: 'Historia', icon: <Clock size={16} strokeWidth={1.8} /> },
    ]

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={Bot}
                title="AI Studio"
                subtitle="Odpowiedzi z wyceną, ściągawki do telefonu i posty. Twoim głosem, z Twojego cennika."
            />

            <nav className="flex w-fit max-w-full flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.id ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'}`}
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
