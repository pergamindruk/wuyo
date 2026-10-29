'use client'

// "use client": tydzień, panel posta, edycja tekstu i publikacja działają bez przeładowania strony.
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { addDays, addWeeks, format, isSameDay, startOfWeek } from 'date-fns'
import { pl } from 'date-fns/locale'
import {
    Camera, Check, ChevronLeft, ChevronRight, Clock, Copy, ExternalLink, Globe, Images, Plus, Sparkles, Trash2, X,
} from 'lucide-react'
import type { CalendarEvent } from '@/lib/types'
import { addCalendarEvent, deleteEvents, getCalendar, planWeek, schedulePost, updateEventContent, updateEventImageUrl, updateEventStatus } from './actions'
import { publishToFacebook, publishToInstagram } from '../social-media/actions'

/** Treść posta = tekst do publikacji, a po linii „---” notatki dla Mateusza (slajdy, scenariusz, uzasadnienie). */
function splitContent(content?: string): { caption: string; notes: string } {
    const text = content ?? ''
    const i = text.search(/\n---\n/)
    if (i < 0) return { caption: text.trim(), notes: '' }
    return { caption: text.slice(0, i).trim(), notes: text.slice(i).replace(/^\n---\n/, '').trim() }
}

const IMG_URL = /https?:\/\/[^\s)<>"]+\.(?:jpe?g|png|webp)/gi

type Post = {
    key: string
    date: string
    topic: string
    format: string
    goal: string
    fb?: CalendarEvent
    ig?: CalendarEvent
    other: CalendarEvent[]
    images: string[]
    notes: string
}

function groupPosts(events: CalendarEvent[]): Post[] {
    const map = new Map<string, Post>()
    for (const ev of events) {
        const key = `${ev.date}|${ev.topic}`
        const post = map.get(key) ?? { key, date: ev.date, topic: ev.topic, format: ev.format, goal: ev.goal, other: [], images: [], notes: '' }
        const p = (ev.platform || '').toLowerCase()
        if (p === 'facebook') post.fb = ev
        else if (p === 'instagram') post.ig = ev
        else post.other.push(ev)
        const { notes } = splitContent(ev.content)
        if (notes && !post.notes) post.notes = notes
        const urls = [ev.image_url, ...(notes.match(IMG_URL) ?? [])].filter((u): u is string => !!u)
        for (const u of urls) if (!post.images.includes(u)) post.images.push(u)
        map.set(key, post)
    }
    return [...map.values()]
}

const rows = (p: Post) => [p.fb, p.ig, ...p.other].filter((e): e is CalendarEvent => !!e)

const STATUS_STYLE: Record<string, string> = {
    Szkic: 'bg-zinc-500',
    Zaplanowane: 'bg-yellow-400',
    Opublikowane: 'bg-emerald-400',
}
const STATUS_LABEL: Record<string, string> = { Szkic: 'Szkic', Zaplanowane: 'W kolejce', Opublikowane: 'Opublikowany' }

function postStatus(p: Post): string {
    const s = rows(p).map((r) => r.status)
    if (s.every((x) => x === 'Opublikowane')) return 'Opublikowane'
    if (s.some((x) => x === 'Zaplanowane' || x === 'Opublikowane')) return 'Zaplanowane'
    return 'Szkic'
}

const card = 'rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.045] to-white/[0.015] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]'

export default function CalendarLab() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
    const [openKey, setOpenKey] = useState<string | null>(null)
    const [panel, setPanel] = useState<'none' | 'plan' | 'add'>('none')

    async function load() {
        const data = (await getCalendar()) as CalendarEvent[]
        setEvents(data)
        setLoading(false)
    }
    useEffect(() => { load() }, [])

    // Na start pokaż tydzień z najbliższym szkicem, jeśli w bieżącym nic nie ma.
    useEffect(() => {
        if (loading) return
        const end = format(addDays(weekStart, 6), 'yyyy-MM-dd')
        const start = format(weekStart, 'yyyy-MM-dd')
        if (events.some((e) => e.date >= start && e.date <= end)) return
        const next = events.map((e) => e.date).filter((d) => d > end).sort()[0]
        if (next) setWeekStart(startOfWeek(new Date(`${next}T12:00:00`), { weekStartsOn: 1 }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])

    const posts = useMemo(() => groupPosts(events), [events])
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const weekPosts = posts.filter((p) => p.date >= format(days[0], 'yyyy-MM-dd') && p.date <= format(days[6], 'yyyy-MM-dd'))
    const open = posts.find((p) => p.key === openKey) ?? null
    const count = (s: string) => weekPosts.filter((p) => postStatus(p) === s).length

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Posty</p>
                    <h1 className="mt-1 text-3xl font-bold text-white">
                        {format(days[0], 'd', { locale: pl })}–{format(days[6], 'd MMMM', { locale: pl })}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                        {weekPosts.length ? `${weekPosts.length} postów · ${count('Szkic')} szkice · ${count('Zaplanowane')} w kolejce · ${count('Opublikowane')} opublikowane` : 'Pusty tydzień'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
                        <button onClick={() => setWeekStart(addWeeks(weekStart, -1))} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Poprzedni tydzień"><ChevronLeft size={16} /></button>
                        <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10">Ten tydzień</button>
                        <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Następny tydzień"><ChevronRight size={16} /></button>
                    </div>
                    <button onClick={() => setPanel(panel === 'add' ? 'none' : 'add')} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-200 hover:border-white/20">
                        <Plus size={14} /> Dodaj post
                    </button>
                    <button onClick={() => setPanel(panel === 'plan' ? 'none' : 'plan')} className="flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-xs font-bold text-zinc-950 shadow-[0_0_30px_-8px_rgba(255,235,82,0.7)] hover:bg-yellow-300">
                        <Sparkles size={14} /> Zaplanuj tydzień
                    </button>
                </div>
            </header>

            {panel === 'plan' && <PlanWeekPanel onDone={(first) => { setPanel('none'); if (first) setWeekStart(startOfWeek(new Date(`${first}T12:00:00`), { weekStartsOn: 1 })); load() }} />}
            {panel === 'add' && <AddPostPanel defaultDate={format(days[0], 'yyyy-MM-dd')} onDone={() => { setPanel('none'); load() }} />}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                {days.map((day) => {
                    const ds = format(day, 'yyyy-MM-dd')
                    const dayPosts = weekPosts.filter((p) => p.date === ds)
                    const today = isSameDay(day, new Date())
                    return (
                        <div key={ds} className={`${card} flex min-h-[9rem] flex-col gap-2 p-2.5 ${today ? 'ring-1 ring-yellow-400/40' : ''} ${dayPosts.length ? '' : 'opacity-60'}`}>
                            <div className="flex items-baseline justify-between px-1">
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${today ? 'text-yellow-400' : 'text-zinc-500'}`}>{format(day, 'EEE', { locale: pl })}</span>
                                <span className={`text-lg font-bold ${today ? 'text-yellow-400' : 'text-zinc-300'}`}>{format(day, 'd')}</span>
                            </div>
                            {dayPosts.map((p) => <PostTile key={p.key} post={p} onOpen={() => setOpenKey(p.key)} />)}
                        </div>
                    )
                })}
            </div>

            {loading && <p className="text-sm text-zinc-500">Wczytuję…</p>}

            <p className="text-xs text-zinc-600">
                Szkic nie wychodzi nigdzie. „W kolejce” = publikacja automatyczna w dniu posta ok. 10:00.{' '}
                <Link href="/lab/ai-studio?tab=post" className="text-zinc-400 hover:text-yellow-400">Jeden post na szybko: AI Studio</Link>
            </p>

            {open && <PostDrawer post={open} onClose={() => setOpenKey(null)} onChanged={load} />}
        </div>
    )
}

function PostTile({ post, onOpen }: { post: Post; onOpen: () => void }) {
    const st = postStatus(post)
    return (
        <button onClick={onOpen} className="group flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-black/30 p-2 text-left transition hover:border-yellow-400/40 hover:bg-black/50">
            {post.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- grafiki z bucketu Supabase albo dowolnego adresu
                <img src={post.images[0]} alt="" className="aspect-[4/5] w-full rounded-xl object-cover" />
            ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center rounded-xl bg-white/[0.03] text-[10px] text-zinc-600">bez grafiki</div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[st]}`} />
                {post.format}
                {post.images.length > 1 && <span className="ml-auto flex items-center gap-0.5"><Images size={10} />{post.images.length}</span>}
            </div>
            <p className="line-clamp-3 text-xs font-medium leading-snug text-zinc-200 group-hover:text-white">{post.topic}</p>
        </button>
    )
}

function PlanWeekPanel({ onDone }: { onDone: (firstDate?: string) => void }) {
    const [hint, setHint] = useState('')
    const [busy, setBusy] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const run = async () => {
        setBusy(true)
        setErr(null)
        try {
            const r = await planWeek(hint)
            if (r.ok) onDone(r.dates[0])
            else setErr(r.error)
        } catch {
            setErr('Serwer nie odpowiedział na czas. Spróbuj za chwilę.')
        } finally {
            setBusy(false)
        }
    }
    return (
        <section className={`${card} flex flex-col gap-3 p-5`}>
            <p className="text-sm text-zinc-300">3 posty na najbliższy tydzień (porada, kulisy, wiedza), każdy na FB i IG. Bez cen i ofert. Trafiają jako szkice.</p>
            <p className="text-xs text-zinc-500">Pełny tydzień z grafikami robi też automat w czwartki o 18:00.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Opcjonalnie: o czym w tym tygodniu?"
                    className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400/60 focus:outline-none" />
                <button onClick={run} disabled={busy} className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                    {busy ? 'Piszę… (ok. 30 s)' : 'Zaplanuj'}
                </button>
            </div>
            {err && <p className="text-sm text-red-400">{err}</p>}
        </section>
    )
}

function AddPostPanel({ defaultDate, onDone }: { defaultDate: string; onDone: () => void }) {
    const [date, setDate] = useState(defaultDate)
    const [topic, setTopic] = useState('')
    const [fmt, setFmt] = useState('Post z grafiką')
    const [ai, setAi] = useState(true)
    const [busy, setBusy] = useState(false)
    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setBusy(true)
        for (const platform of ['Facebook', 'Instagram']) {
            await addCalendarEvent({ topic, platform, format: fmt, goal: 'Edukacja', date, status: 'Szkic', generateAI: ai })
        }
        setBusy(false)
        onDone()
    }
    const field = 'rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-yellow-400/60 focus:outline-none'
    return (
        <form onSubmit={submit} className={`${card} grid grid-cols-1 gap-3 p-5 md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center`}>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={field} />
            <input required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Temat posta, np. jak dobrać papier do wizytówek" className={field} />
            <select value={fmt} onChange={(e) => setFmt(e.target.value)} className={field}>
                <option>Post z grafiką</option><option>Karuzela</option><option>Rolka</option>
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                <input type="checkbox" checked={ai} onChange={(e) => setAi(e.target.checked)} className="h-4 w-4 accent-yellow-400" /> AI napisze tekst
            </label>
            <button disabled={busy} className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                {busy ? 'Zapisuję…' : 'Dodaj (FB + IG)'}
            </button>
        </form>
    )
}

function PostDrawer({ post, onClose, onChanged }: { post: Post; onClose: () => void; onChanged: () => void }) {
    const versions = rows(post)
    const [tab, setTab] = useState(versions[0]?.id ?? '')
    const ev = versions.find((v) => v.id === tab) ?? versions[0]
    const [text, setText] = useState(splitContent(ev?.content).caption)
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
    const [busy, setBusy] = useState(false)
    const [imgUrl, setImgUrl] = useState(ev?.image_url || post.images[0] || '')

    useEffect(() => {
        setText(splitContent(ev?.content).caption)
        setImgUrl(ev?.image_url || post.images[0] || '')
        setMsg(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    if (!ev) return null
    const original = splitContent(ev.content)
    const dirty = text.trim() !== original.caption
    const isIg = ev.platform.toLowerCase() === 'instagram'
    const isFb = ev.platform.toLowerCase() === 'facebook'

    const act = async (fn: () => Promise<{ ok: boolean; text: string } | void>) => {
        setBusy(true)
        setMsg(null)
        try {
            const r = await fn()
            if (r) setMsg(r)
            onChanged()
        } finally {
            setBusy(false)
        }
    }

    const save = () => act(async () => {
        await updateEventContent(ev.id, original.notes ? `${text.trim()}\n\n---\n${original.notes}` : text.trim())
        return { ok: true, text: 'Zapisane.' }
    })
    const setStatus = (s: string) => act(async () => {
        if (s === 'Zaplanowane') await schedulePost(ev.id, `${ev.date}T08:00:00.000Z`)
        else await updateEventStatus(ev.id, s)
    })
    const publish = () => act(async () => {
        if (dirty) await updateEventContent(ev.id, original.notes ? `${text.trim()}\n\n---\n${original.notes}` : text.trim())
        if (isIg) {
            if (!imgUrl) return { ok: false, text: 'Instagram potrzebuje grafiki.' }
            const r = await publishToInstagram(ev.id, imgUrl, text.trim())
            return r.success ? { ok: true, text: 'Opublikowane na Instagramie.' } : { ok: false, text: r.error }
        }
        const r = await publishToFacebook(ev.id, text.trim(), imgUrl || undefined)
        return r.success ? { ok: true, text: 'Opublikowane na Facebooku.' } : { ok: false, text: r.error }
    })
    const remove = () => act(async () => {
        if (!window.confirm('Usunąć ten post (FB i IG)?')) return
        await deleteEvents(versions.map((v) => v.id))
        onClose()
    })
    const pickImage = (u: string) => act(async () => {
        setImgUrl(u)
        await updateEventImageUrl(ev.id, u)
    })

    return (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <aside onClick={(e) => e.stopPropagation()}
                className="flex h-full w-full max-w-xl flex-col gap-5 overflow-y-auto border-l border-white/10 bg-[#0d0d0f] p-5 shadow-2xl sm:p-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400/80">
                            {format(new Date(`${post.date}T12:00:00`), 'EEEE d MMMM', { locale: pl })} · {post.format}
                        </p>
                        <h2 className="mt-1 text-xl font-bold leading-snug text-white">{post.topic}</h2>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <button onClick={remove} disabled={busy} className="rounded-full p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Usuń post"><Trash2 size={16} /></button>
                        <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Zamknij"><X size={18} /></button>
                    </div>
                </div>

                {post.images.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {post.images.map((u, i) => (
                                <div key={u} className="relative shrink-0">
                                    <a href={u} target="_blank" rel="noreferrer">
                                        {/* eslint-disable-next-line @next/next/no-img-element -- grafiki z bucketu Supabase */}
                                        <img src={u} alt={`Grafika ${i + 1}`} className={`h-40 w-32 rounded-xl object-cover ${u === imgUrl ? 'ring-2 ring-yellow-400' : 'opacity-80 hover:opacity-100'}`} />
                                    </a>
                                    {post.images.length > 1 && <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-1.5 text-[10px] font-bold text-white">{i + 1}</span>}
                                    {u !== imgUrl && (
                                        <button onClick={() => pickImage(u)} className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2 py-0.5 text-[10px] text-zinc-200 hover:text-yellow-400">użyj tej</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {post.images.length > 1 && (
                            <p className="text-[11px] text-zinc-500">Karuzela: publikacja z panelu wrzuca tylko zaznaczoną grafikę. Całą karuzelę dodaj w aplikacji (otwórz slajdy i zapisz po kolei).</p>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 self-start">
                        {versions.map((v) => (
                            <button key={v.id} onClick={() => setTab(v.id)}
                                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold ${v.id === ev.id ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'}`}>
                                {v.platform.toLowerCase() === 'instagram' ? <Camera size={13} /> : <Globe size={13} />}
                                {v.platform}
                                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[v.status] ?? 'bg-zinc-500'}`} />
                            </button>
                        ))}
                    </div>

                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
                        className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-relaxed text-zinc-100 focus:border-yellow-400/50 focus:outline-none" />
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-zinc-500">{text.length} znaków</span>
                        <button onClick={() => { navigator.clipboard?.writeText(text); setMsg({ ok: true, text: 'Skopiowane.' }) }}
                            className="ml-auto flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-zinc-300 hover:border-white/25"><Copy size={12} /> Kopiuj</button>
                        {dirty && <button onClick={save} disabled={busy} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-semibold text-zinc-950 disabled:opacity-50"><Check size={12} /> Zapisz zmiany</button>}
                    </div>
                </div>

                <div className={`${card} flex flex-col gap-3 p-4`}>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-zinc-400">Status {ev.platform}:</span>
                        {(['Szkic', 'Zaplanowane', 'Opublikowane'] as const).map((s) => (
                            <button key={s} onClick={() => setStatus(s)} disabled={busy || ev.status === s}
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${ev.status === s ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}>
                                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s]}`} />{STATUS_LABEL[s]}
                            </button>
                        ))}
                    </div>
                    {ev.status === 'Zaplanowane' && ev.scheduled_at && (
                        <p className="flex items-center gap-1 text-xs text-yellow-400/80"><Clock size={12} />
                            Wyjdzie {new Date(ev.scheduled_at).toLocaleString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' })}
                        </p>
                    )}
                    {ev.status !== 'Opublikowane' && (isIg || isFb) && (
                        <button onClick={publish} disabled={busy}
                            className="self-start rounded-full bg-yellow-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                            {busy ? 'Chwila…' : `Opublikuj teraz na ${ev.platform}`}
                        </button>
                    )}
                    {msg && <p className={`text-xs ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>}
                </div>

                {post.notes && (
                    <details className={`${card} p-4`} open={post.format.toLowerCase().includes('rolka')}>
                        <summary className="cursor-pointer text-xs font-semibold text-zinc-300">Notatki: scenariusz, slajdy, dlaczego ten post</summary>
                        <div className="prose prose-sm prose-invert mt-3 max-w-none break-words text-zinc-300 prose-a:text-yellow-400 prose-p:my-1.5">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.notes}</ReactMarkdown>
                        </div>
                    </details>
                )}

                {imgUrl && (
                    <a href={imgUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-300">
                        <ExternalLink size={11} /> Otwórz grafikę w pełnym rozmiarze
                    </a>
                )}
            </aside>
        </div>
    )
}
