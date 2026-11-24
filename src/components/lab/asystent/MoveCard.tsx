'use client'

// "use client": karta sama przygotowuje szkic po otwarciu, ma edycję tekstów, schowek i przyciski akcji.
import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    Check, Copy, ExternalLink, FileText, Loader2, Mail, MessageSquare, Phone, RefreshCw, SkipForward, Sparkles, Star,
} from 'lucide-react'
import { acceptFollowUp, acceptOffer, prepareDraft, skipToday } from '@/app/lab/asystent/actions'
import { recordCallOutcome } from '@/app/lab/dzis/actions'
import { LINK_TOKEN, serviceLabel, type Draft } from '@/lib/lab/asystent/draft'
import type { Move, MoveKind } from '@/lib/lab/asystent/pick'
import { formatPLN, telHref, warsawIsoDate } from '@/lib/lab/today/format'
import type { CallOutcome } from '@/lib/lab/today/types'

const PROSE = 'prose prose-invert prose-sm max-w-none prose-p:my-1 prose-li:my-0.5 prose-ul:my-1 prose-headings:text-white ' +
    'prose-h2:mt-3 prose-h2:mb-1 prose-h2:text-xs prose-h2:uppercase prose-h2:tracking-wider prose-strong:text-white'

const KIND_LABEL: Record<MoveKind, string> = {
    oferta: 'Oferta',
    zalegly: 'Umówiony kontakt',
    przypomnienie: 'Przypomnienie',
    oddzwon: 'Oddzwoń',
    telefon: 'Telefon',
}

const field = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-yellow-400/60'
const ghost = 'inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-zinc-300 transition hover:border-yellow-400/50 hover:text-white disabled:opacity-40'
const primary = 'inline-flex h-11 items-center gap-2 rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300 disabled:opacity-40'

type Tab = 'wiadomosc' | 'telefon' | 'oferta'

async function copy(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

function smsHref(phone: string, body: string) {
    return `sms:${phone.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(body)}`
}

function waHref(phone: string, body: string) {
    const digits = phone.replace(/\D/g, '')
    const intl = digits.length === 9 ? `48${digits}` : digits
    return `https://wa.me/${intl}?text=${encodeURIComponent(body)}`
}

function mailHref(email: string, subject: string, body: string) {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function MoveCard({ move, initial, index }: { move: Move; initial: Draft | null; index: number }) {
    const router = useRouter()
    const [draft, setDraft] = useState<Draft | null>(initial)
    const [error, setError] = useState<string | null>(null)
    const [pending, start] = useTransition()
    const [tab, setTab] = useState<Tab>(move.kind === 'telefon' || move.kind === 'oddzwon' ? 'telefon' : move.kind === 'oferta' ? 'oferta' : 'wiadomosc')
    const [subject, setSubject] = useState(initial?.subject ?? '')
    const [message, setMessage] = useState(initial?.message ?? '')
    const [title, setTitle] = useState(initial?.offer?.title ?? '')
    const [intro, setIntro] = useState(initial?.offer?.intro ?? '')
    const [scope, setScope] = useState(initial?.offer?.scope.join('\n') ?? '')
    const [cta, setCta] = useState(initial?.offer?.cta ?? '')
    const [note, setNote] = useState('')
    const [callNote, setCallNote] = useState('')
    const [fixing, setFixing] = useState(false)
    const [done, setDone] = useState<{ text: string; link?: string; body?: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const started = useRef(false)

    const load = (d: Draft) => {
        setDraft(d)
        setSubject(d.subject)
        setMessage(d.message)
        setTitle(d.offer?.title ?? '')
        setIntro(d.offer?.intro ?? '')
        setScope(d.offer?.scope.join('\n') ?? '')
        setCta(d.offer?.cta ?? '')
    }

    const prepare = (withNote?: string) => start(async () => {
        setError(null)
        const r = await prepareDraft(move.key, withNote)
        if (r.ok) {
            load(r.data)
            setFixing(false)
            setNote('')
        } else setError(r.error)
    })

    useEffect(() => {
        if (!initial && !started.current) {
            started.current = true
            prepare()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const flashCopied = () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }

    const onAcceptOffer = () => start(async () => {
        setError(null)
        const r = await acceptOffer(move.key, { title, intro, scope: scope.split('\n').map((s) => s.trim()).filter(Boolean), cta })
        if (!r.ok) return setError(r.error)
        const body = message.includes(LINK_TOKEN) ? message.replaceAll(LINK_TOKEN, r.data.link) : `${message}\n\nOferta: ${r.data.link}`
        await copy(body)
        setDone({ text: 'Oferta zapisana i oznaczona jako wysłana. Wiadomość z linkiem jest w schowku. Przypomnienie ustawione za 3 dni.', link: r.data.link, body })
    })

    const onAcceptFollowUp = () => start(async () => {
        setError(null)
        await copy(message)
        const r = await acceptFollowUp(move.key)
        if (!r.ok) return setError(r.error)
        setDone({ text: `Wiadomość w schowku. Kolejny kontakt zaplanowany na ${r.data.nextAt.split('-').reverse().join('.')}.`, body: message })
    })

    const onOutcome = (outcome: CallOutcome) => start(async () => {
        if (!move.queueId) return
        setError(null)
        const callbackAt = outcome === 'oddzwonic' ? new Date(`${warsawIsoDate(1)}T10:00:00+01:00`).toISOString() : undefined
        const r = await recordCallOutcome(move.queueId, outcome, { note: callNote.trim() || undefined, callbackAt })
        if (!r.ok) return setError(r.error)
        const label: Record<CallOutcome, string> = {
            nie_odebral: 'Zapisane: nie odebrał. Wróci do kolejki za 2 dni.',
            oddzwonic: 'Zapisane: oddzwonić jutro o 10:00.',
            chce_oferte: 'Zapisane: chce oferty. Asystent przygotuje ją w kolejnym ruchu.',
            nie_chce: 'Zapisane: nie chce. Firma znika z kolejki.',
        }
        setDone({ text: label[outcome], body: outcome === 'chce_oferte' ? message : undefined })
    })

    const onSkip = () => start(async () => {
        const r = await skipToday(move.key)
        if (!r.ok) setError(r.error)
    })

    const isCall = move.kind === 'telefon' || move.kind === 'oddzwon'
    const recommended = draft?.variants.find((v) => v.recommended)

    return (
        <article className="lab-card flex flex-col gap-4 p-5 sm:p-6" aria-label={`Ruch ${index + 1}: ${move.name}`}>
            <header className="flex flex-wrap items-start gap-3">
                <span className="lab-chip h-10 w-10 shrink-0 text-sm font-bold">{index + 1}</span>
                <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-400/90">
                        {KIND_LABEL[move.kind]}
                        {move.valueGrosze > 0 && <span className="lab-pill px-2 py-0.5 text-[11px] normal-case tracking-normal text-zinc-200">{formatPLN(move.valueGrosze)} netto</span>}
                        {move.service && <span className="text-zinc-500 normal-case tracking-normal">{serviceLabel(move.service)}</span>}
                    </p>
                    <h3 className="mt-1 truncate text-lg font-bold text-white">{move.name}</h3>
                    <p className="mt-0.5 text-sm text-zinc-400">{move.why}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    {move.phone && <a href={telHref(move.phone)} className={ghost}><Phone className="h-4 w-4" aria-hidden /> {move.phone}</a>}
                    {move.website && <a href={move.website.startsWith('http') ? move.website : `https://${move.website}`} target="_blank" rel="noreferrer" className={ghost}><ExternalLink className="h-4 w-4" aria-hidden /> Strona</a>}
                </div>
            </header>

            {done ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
                    <p className="flex items-start gap-2 text-sm text-emerald-200"><Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {done.text}</p>
                    {done.body && (
                        <div className="flex flex-wrap gap-2">
                            {move.email && <a href={mailHref(move.email, subject, done.body)} className={primary}><Mail className="h-4 w-4" aria-hidden /> Otwórz mail</a>}
                            {move.phone && <a href={waHref(move.phone, done.body)} target="_blank" rel="noreferrer" className={ghost}><MessageSquare className="h-4 w-4" aria-hidden /> WhatsApp</a>}
                            {move.phone && <a href={smsHref(move.phone, done.body)} className={ghost}><MessageSquare className="h-4 w-4" aria-hidden /> SMS</a>}
                            {done.link && <a href={done.link} target="_blank" rel="noreferrer" className={ghost}><FileText className="h-4 w-4" aria-hidden /> Podgląd oferty</a>}
                        </div>
                    )}
                    <button type="button" onClick={() => router.refresh()} className={`${ghost} self-start`}>Następny ruch</button>
                </div>
            ) : !draft ? (
                <div className="flex min-h-28 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 text-sm text-zinc-400">
                    {pending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Asystent przygotowuje teksty…</> : error ? (
                        <span className="flex flex-col items-center gap-2 text-center">
                            <span className="text-red-300">{error}</span>
                            <button type="button" onClick={() => prepare()} className={ghost}><RefreshCw className="h-4 w-4" aria-hidden /> Spróbuj jeszcze raz</button>
                        </span>
                    ) : 'Za chwilę…'}
                </div>
            ) : (
                <>
                    <div role="tablist" aria-label="Szkice" className="flex flex-wrap gap-1.5">
                        {(['oferta', 'wiadomosc', 'telefon'] as Tab[]).filter((t) => t !== 'oferta' || draft.offer).map((t) => (
                            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                                className={`h-9 rounded-full px-4 text-sm transition ${tab === t ? 'bg-yellow-400 font-semibold text-zinc-950' : 'border border-white/10 text-zinc-300 hover:text-white'}`}>
                                {t === 'oferta' ? 'Oferta' : t === 'wiadomosc' ? (draft.channel === 'mail' ? 'Mail' : 'SMS / WhatsApp') : 'Telefon'}
                            </button>
                        ))}
                    </div>

                    {tab === 'oferta' && draft.offer && (
                        <div className="grid gap-3">
                            <label className="grid gap-1 text-xs text-zinc-500">Tytuł<input value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
                            <label className="grid gap-1 text-xs text-zinc-500">Wstęp<textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className={field} /></label>
                            <label className="grid gap-1 text-xs text-zinc-500">Zakres (jeden punkt w linii)<textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={5} className={field} /></label>
                            <label className="grid gap-1 text-xs text-zinc-500">Zachęta na końcu<textarea value={cta} onChange={(e) => setCta(e.target.value)} rows={2} className={field} /></label>
                            <p className="text-xs text-zinc-500">Cena w ofercie: <b className="text-zinc-200">{formatPLN(move.valueGrosze)} netto</b> (z lejka). Zmienisz ją w Lejku albo w Ofertach.</p>
                        </div>
                    )}

                    {tab === 'wiadomosc' && (
                        <div className="grid gap-3">
                            {draft.channel === 'mail' && <label className="grid gap-1 text-xs text-zinc-500">Temat<input value={subject} onChange={(e) => setSubject(e.target.value)} className={field} /></label>}
                            <label className="grid gap-1 text-xs text-zinc-500">Treść{move.kind === 'oferta' && <span className="text-zinc-600">{LINK_TOKEN} zamieni się w link do oferty po akceptacji</span>}
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7} className={field} />
                            </label>
                            <button type="button" onClick={async () => { if (await copy(message)) flashCopied() }} className={`${ghost} self-start`}>
                                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} {copied ? 'Skopiowane' : 'Kopiuj'}
                            </button>
                        </div>
                    )}

                    {tab === 'telefon' && (
                        <div className={`${PROSE} rounded-2xl border border-white/[0.06] bg-black/20 p-4`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.call || 'Brak scenariusza.'}</ReactMarkdown>
                        </div>
                    )}

                    {draft.variants.length > 0 && (
                        <ul className="grid gap-2 sm:grid-cols-3">
                            {draft.variants.map((v) => (
                                <li key={v.name} className={`rounded-2xl border p-3 text-sm ${v.recommended ? 'border-yellow-400/50 bg-yellow-400/[0.06]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
                                    <p className="flex items-center gap-1.5 font-semibold text-white">{v.recommended && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-label="polecany" />}{v.name}</p>
                                    <p className="text-yellow-300">{v.price}</p>
                                    <p className="mt-1 text-xs text-zinc-400">{v.forWhom}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    {(draft.nextStep || recommended) && (
                        <p className="text-sm text-zinc-400"><b className="text-zinc-200">Następny krok:</b> {draft.nextStep || `zaproponuj „${recommended?.name}”.`}</p>
                    )}

                    {isCall && (
                        <div className="grid gap-2">
                            <input value={callNote} onChange={(e) => setCallNote(e.target.value)} placeholder="Notatka z rozmowy (opcjonalnie)" className={field} />
                            <div className="flex flex-wrap gap-2">
                                <button type="button" disabled={pending} onClick={() => onOutcome('chce_oferte')} className={primary}>Chce ofertę</button>
                                <button type="button" disabled={pending} onClick={() => onOutcome('oddzwonic')} className={ghost}>Oddzwonić jutro</button>
                                <button type="button" disabled={pending} onClick={() => onOutcome('nie_odebral')} className={ghost}>Nie odebrał</button>
                                <button type="button" disabled={pending} onClick={() => onOutcome('nie_chce')} className={ghost}>Nie chce</button>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-300" role="alert">{error}</p>}

                    {fixing && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Co zmienić? np. krócej, bez ceny w mailu, na Ty" className={field} autoFocus />
                            <button type="button" disabled={pending || !note.trim()} onClick={() => prepare(note)} className={primary}>
                                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Sparkles className="h-4 w-4" aria-hidden />} Przepisz
                            </button>
                        </div>
                    )}

                    <footer className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                        {move.kind === 'oferta' && (
                            <button type="button" disabled={pending} onClick={onAcceptOffer} className={primary}>
                                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />} Akceptuję ofertę i kopiuję wiadomość
                            </button>
                        )}
                        {(move.kind === 'przypomnienie' || move.kind === 'zalegly') && (
                            <button type="button" disabled={pending} onClick={onAcceptFollowUp} className={primary}>
                                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Check className="h-4 w-4" aria-hidden />} Akceptuję, kopiuję i planuję kolejny krok
                            </button>
                        )}
                        {isCall && move.phone && (
                            <a href={telHref(move.phone)} className={primary}><Phone className="h-4 w-4" aria-hidden /> Zadzwoń</a>
                        )}
                        <button type="button" disabled={pending} onClick={() => setFixing((f) => !f)} className={ghost}><RefreshCw className="h-4 w-4" aria-hidden /> Popraw</button>
                        <button type="button" disabled={pending} onClick={onSkip} className={ghost}><SkipForward className="h-4 w-4" aria-hidden /> Pomiń dziś</button>
                    </footer>
                </>
            )}
        </article>
    )
}
