'use client'

// "use client": tydzień, panel posta, edycja tekstu i publikacja działają bez przeładowania strony.
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { addDays, addWeeks, format, isSameDay, startOfWeek } from 'date-fns'
import { pl } from 'date-fns/locale'
import {
    Calendar, CalendarCheck, Camera, Check, ChevronLeft, ChevronRight, Clock, Copy, ExternalLink, FilePen, Globe, Images, ListChecks, NotebookText,
    Palette, Plus, RefreshCw, Send, Sparkles, Trash2, Upload, X,
} from 'lucide-react'
import { PageHeader, SectionTitle, StatCard } from '@/components/lab/ui/PageHeader'
import { CountUp } from '@/components/lab/fx/CountUp'
import type { CalendarEvent } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
    addCalendarEvent, createSocialUploadUrl, deleteEvents, getCalendar, planWeek, regeneratePost, schedulePost, setPostImage,
    updateEventContent, updateEventImageUrl, updateEventStatus,
} from './actions'

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
    Canva: 'bg-[#00c4cc]',
    Postiz: 'bg-violet-400',
}
/** „Canva” = post przeniesiony do planera Canvy. Cron panelu go nie publikuje (bierze tylko „Zaplanowane”). */
const STATUS_LABEL: Record<string, string> = { Szkic: 'Szkic', Zaplanowane: 'W kolejce', Canva: 'W Canvie', Postiz: 'W Postiz', Opublikowane: 'Opublikowany' }

function postStatus(p: Post): string {
    const s = rows(p).map((r) => r.status)
    if (s.every((x) => x === 'Opublikowane')) return 'Opublikowane'
    if (s.some((x) => x === 'Canva')) return 'Canva'
    if (s.some((x) => x === 'Postiz')) return 'Postiz'
    if (s.some((x) => x === 'Zaplanowane' || x === 'Opublikowane')) return 'Zaplanowane'
    return 'Szkic'
}

/** 1 post, 2-4 posty, 5+ postów */
function plural(n: number, one: string, few: string, many: string) {
    if (n === 1) return one
    const d = n % 10, h = n % 100
    return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many
}

/** Planer treści Canvy (Canva Pro): tam post dostaje grafikę, tekst i termin publikacji. */
const CANVA_PLANNER = 'https://www.canva.com/planner'

/** Pobiera grafikę jako plik (atrybut download nie działa dla obcych domen, więc przez blob). */
async function downloadImage(url: string, name: string) {
    const blob = await (await fetch(url)).blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}

/** Dowolny obraz (PNG z Canvy itd.) → JPG max 1440 px. Instagram przyjmuje tylko JPG. */
async function toJpeg(file: File): Promise<Blob> {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 1440 / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('jpg'))), 'image/jpeg', 0.9))
}

const card = 'lab-card'
/** Lżejszy kafelek w szufladzie posta (karta w karcie). */
const tile = 'rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05]'
/** Pole formularza w panelach (wygląd z .lab-ui, tu tylko odstępy). */
const field = 'px-4 py-2.5 text-sm text-white placeholder:text-zinc-600'

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
            <PageHeader
                icon={Calendar}
                eyebrow="Plan postów"
                title={days[0].getMonth() === days[6].getMonth()
                    ? `${format(days[0], 'd')}–${format(days[6], 'd MMMM', { locale: pl })}`
                    : `${format(days[0], 'd MMM', { locale: pl })} – ${format(days[6], 'd MMM', { locale: pl })}`}
                subtitle={weekPosts.length
                    ? `${weekPosts.length} ${plural(weekPosts.length, 'post', 'posty', 'postów')} w tym tygodniu${count('Canva') ? ` · w Canvie ${count('Canva')}` : ''}`
                    : 'Pusty tydzień. Zaplanuj go jednym kliknięciem albo dodaj post ręcznie.'}
                actions={<>
                    <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
                        <button type="button" onClick={() => setWeekStart(addWeeks(weekStart, -1))} className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" aria-label="Poprzedni tydzień"><ChevronLeft size={16} strokeWidth={1.8} /></button>
                        <button type="button" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10">Ten tydzień</button>
                        <button type="button" onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" aria-label="Następny tydzień"><ChevronRight size={16} strokeWidth={1.8} /></button>
                    </div>
                    <button type="button" data-sound="pop" onClick={() => setPanel(panel === 'add' ? 'none' : 'add')} className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${panel === 'add' ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300' : 'border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/20'}`}>
                        <Plus size={14} strokeWidth={1.8} /> Dodaj post
                    </button>
                    <button type="button" data-sound="pop" onClick={() => setPanel(panel === 'plan' ? 'none' : 'plan')} className="flex items-center gap-1.5 bg-yellow-400 px-4 py-2 text-xs font-bold text-zinc-950">
                        <Sparkles size={14} strokeWidth={1.8} /> Zaplanuj tydzień
                    </button>
                </>}
            />

            <div className="lab-stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={Calendar} label="Posty w tygodniu" value={<CountUp value={weekPosts.length} />} hot={weekPosts.length > 0} />
                <StatCard icon={FilePen} label="Szkice" value={<CountUp value={count('Szkic')} />} hint="nie wychodzą nigdzie" />
                <StatCard icon={ListChecks} label="W kolejce" value={<CountUp value={count('Zaplanowane')} />} hint="wyjdą ok. 10:00" />
                <StatCard icon={CalendarCheck} label="Opublikowane" value={<CountUp value={count('Opublikowane')} />} />
            </div>

            {panel === 'plan' && <PlanWeekPanel onDone={(first) => { setPanel('none'); if (first) setWeekStart(startOfWeek(new Date(`${first}T12:00:00`), { weekStartsOn: 1 })); load() }} />}
            {panel === 'add' && <AddPostPanel defaultDate={format(days[0], 'yyyy-MM-dd')} onDone={() => { setPanel('none'); load() }} />}

            <div className="lab-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                {days.map((day) => {
                    const ds = format(day, 'yyyy-MM-dd')
                    const dayPosts = weekPosts.filter((p) => p.date === ds)
                    const today = isSameDay(day, new Date())
                    return (
                        <div key={ds} className={`${card} flex min-h-[10rem] flex-col gap-2 !rounded-[1.5rem] p-2.5 ${today ? '!border-yellow-400/40' : ''} ${dayPosts.length || today ? '' : 'opacity-60'}`}>
                            {today && <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-yellow-400/15 blur-2xl" />}
                            <div className="flex items-center justify-between px-1.5 pt-1">
                                <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${today ? 'text-yellow-400' : 'text-zinc-500'}`}>{format(day, 'EEE', { locale: pl })}</span>
                                <span className={`flex h-8 w-8 items-center justify-center rounded-full font-heading text-base font-bold ${today ? 'lab-chip !rounded-full' : 'text-zinc-300'}`}>{format(day, 'd')}</span>
                            </div>
                            {dayPosts.map((p) => <PostTile key={p.key} post={p} onOpen={() => setOpenKey(p.key)} />)}
                        </div>
                    )
                })}
            </div>

            {loading && (
                <p className="flex items-center gap-2 text-sm text-zinc-500">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400/25 border-t-yellow-400" /> Wczytuję…
                </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-white/[0.03] px-4 py-3 text-xs text-zinc-500">
                {(['Szkic', 'Zaplanowane', 'Canva', 'Postiz', 'Opublikowane'] as const).map((s) => (
                    <span key={s} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${STATUS_STYLE[s]}`} />{STATUS_LABEL[s]}</span>
                ))}
                <span className="basis-full sm:basis-auto">Szkic nie wychodzi nigdzie. „W kolejce” = publikacja automatyczna w dniu posta ok. 10:00.</span>
                <Link href="/lab/ai-studio?tab=post" className="flex items-center gap-1 text-zinc-400 hover:text-yellow-400 sm:ml-auto"><Sparkles size={12} /> Jeden post na szybko: AI Studio</Link>
            </div>

            {open && <PostDrawer post={open} onClose={() => setOpenKey(null)} onChanged={load} onTopicChange={(t) => setOpenKey(`${open.date}|${t}`)} />}
        </div>
    )
}

function PostTile({ post, onOpen }: { post: Post; onOpen: () => void }) {
    const st = postStatus(post)
    return (
        <button type="button" data-sound="pop" onClick={onOpen} className="group flex flex-col gap-2 rounded-2xl bg-white/[0.03] p-2 text-left ring-1 ring-white/[0.05] transition hover:-translate-y-0.5 hover:bg-white/[0.06] hover:ring-yellow-400/40">
            {post.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- grafiki z bucketu Supabase albo dowolnego adresu
                <img src={post.images[0]} alt="" className="aspect-[4/5] w-full rounded-xl object-cover ring-1 ring-white/10" />
            ) : null}
            <div className="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[st]}`} />
                {post.format}
                {post.images.length > 1 && <span className="ml-auto flex items-center gap-0.5"><Images size={10} />{post.images.length}</span>}
            </div>
            <p className="line-clamp-3 px-0.5 pb-0.5 text-xs font-medium leading-snug text-zinc-200 group-hover:text-white">{post.topic}</p>
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
        <section className={`${card} flex flex-col gap-3 p-5 sm:p-6`}>
            <SectionTitle icon={Sparkles} title="Zaplanuj tydzień z AI" />
            <p className="-mt-2 text-sm text-zinc-300">3 posty na najbliższy tydzień (porada, kulisy, wiedza), każdy na FB i IG. Bez cen i ofert. Trafiają jako szkice.</p>
            <p className="flex items-center gap-1.5 text-xs text-zinc-500"><Clock size={12} /> Pełny tydzień z grafikami robi też automat w czwartki o 18:00.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Opcjonalnie: o czym w tym tygodniu?"
                    className={`flex-1 ${field}`} />
                <button type="button" onClick={run} disabled={busy} className="flex items-center justify-center gap-1.5 bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50">
                    <Sparkles size={15} strokeWidth={1.8} /> {busy ? 'Piszę… (ok. 30 s)' : 'Zaplanuj'}
                </button>
            </div>
            {err && <p className="rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300">{err}</p>}
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
    return (
        <form onSubmit={submit} className={`${card} grid grid-cols-1 gap-3 p-5 sm:p-6 md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center`}>
            <div className="-mb-4 md:col-span-5"><SectionTitle icon={Plus} title="Nowy post (FB + IG)" /></div>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`${field} [color-scheme:dark]`} />
            <input required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Temat posta, np. jak dobrać papier do wizytówek" className={field} />
            <select value={fmt} onChange={(e) => setFmt(e.target.value)} className={field}>
                <option>Post z grafiką</option><option>Karuzela</option><option>Rolka</option>
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                <input type="checkbox" checked={ai} onChange={(e) => setAi(e.target.checked)} className="h-4 w-4 accent-yellow-400" /> AI napisze tekst
            </label>
            <button disabled={busy} className="flex items-center justify-center gap-1.5 bg-yellow-400 px-5 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50">
                <Plus size={15} strokeWidth={1.8} /> {busy ? 'Zapisuję…' : 'Dodaj (FB + IG)'}
            </button>
        </form>
    )
}

function PostDrawer({ post, onClose, onChanged, onTopicChange }: {
    post: Post; onClose: () => void; onChanged: () => void; onTopicChange: (topic: string) => void
}) {
    const versions = rows(post)
    const [tab, setTab] = useState(versions[0]?.id ?? '')
    const ev = versions.find((v) => v.id === tab) ?? versions[0]
    const [text, setText] = useState(splitContent(ev?.content).caption)
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
    const [busy, setBusy] = useState(false)
    const [imgUrl, setImgUrl] = useState(ev?.image_url || post.images[0] || '')
    const [regenOpen, setRegenOpen] = useState(false)
    const [hint, setHint] = useState('')
    const [newTopic, setNewTopic] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setText(splitContent(ev?.content).caption)
        setImgUrl(ev?.image_url || post.images[0] || '')
        setMsg(null)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])

    // Nowa propozycja albo nowa grafika przyszła z bazy: pokaż ją w polu.
    useEffect(() => {
        setText(splitContent(ev?.content).caption)
    }, [ev?.content])
    useEffect(() => {
        if (ev?.image_url) setImgUrl(ev.image_url)
    }, [ev?.image_url])

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
    /** Publikacja przeniesiona do /lab/publikuj (Postiz + zapas Graph API). Najpierw zapisujemy zmiany w tekście. */
    const openPublisher = () => act(async () => {
        if (dirty) await updateEventContent(ev.id, original.notes ? `${text.trim()}

---
${original.notes}` : text.trim())
        window.location.href = `/lab/publikuj?z=${encodeURIComponent(ev.id)}`
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
    const regenerate = () => act(async () => {
        if (dirty && !window.confirm('Masz niezapisane zmiany w tekście. Nadpisać je nową propozycją?')) return
        const r = await regeneratePost(versions.map((v) => v.id), hint, newTopic)
        if (!r.ok) return { ok: false, text: r.error }
        setRegenOpen(false)
        setHint('')
        if (r.topic !== post.topic) onTopicChange(r.topic)
        return { ok: true, text: 'Nowa propozycja od Gemini gotowa (FB i IG).' }
    })
    /** Do planera Canvy: tekst do schowka, grafiki na dysk (karuzela po kolei), planer w nowej karcie, status „W Canvie”. */
    const toCanva = () => act(async () => {
        const copied = navigator.clipboard?.writeText(text.trim()).then(() => true, () => false) ?? Promise.resolve(false)
        window.open(CANVA_PLANNER, '_blank', 'noopener')
        const imgs = post.images.length ? post.images : imgUrl ? [imgUrl] : []
        let failed = 0
        for (const [i, u] of imgs.entries()) {
            try {
                await downloadImage(u, `wuyo-${post.date}-${imgs.length > 1 ? `slajd-${i + 1}` : 'post'}.jpg`)
            } catch {
                failed++
            }
        }
        await Promise.all(versions.filter((v) => v.status !== 'Opublikowane').map((v) => updateEventStatus(v.id, 'Canva')))
        const parts = [
            (await copied) ? `Tekst ${ev.platform} w schowku.` : 'Tekstu nie udało się skopiować, użyj „Kopiuj”.',
            imgs.length ? `Pobrane grafiki: ${imgs.length - failed}/${imgs.length}.` : 'Post nie ma grafiki.',
            'W planerze: Dodaj → Post → wgraj grafikę → wklej tekst → wybierz termin. Status w panelu: „W Canvie” (panel sam tego nie opublikuje).',
        ]
        return { ok: failed === 0, text: parts.join(' ') }
    })
    const uploadEdited = (file: File) => act(async () => {
        if (!file.type.startsWith('image/')) return { ok: false, text: 'To nie jest obraz.' }
        const jpg = await toJpeg(file).catch(() => null)
        if (!jpg) return { ok: false, text: 'Nie udało się odczytać pliku. Pobierz z Canvy jako JPG albo PNG.' }
        const link = await createSocialUploadUrl(ev.id)
        if (!link.ok) return { ok: false, text: link.error }
        const { error } = await createClient().storage.from('social').uploadToSignedUrl(link.path, link.token, jpg, { contentType: 'image/jpeg' })
        if (error) return { ok: false, text: 'Wysyłka nie wyszła. Spróbuj jeszcze raz.' }
        if (!(await setPostImage(versions.map((v) => v.id), link.publicUrl))) return { ok: false, text: 'Plik wysłany, ale nie podpiął się pod post.' }
        setImgUrl(link.publicUrl)
        return { ok: true, text: 'Poprawiona grafika podpięta pod FB i IG.' }
    })
    const published = versions.every((v) => v.status === 'Opublikowane')

    return (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/70 p-2 backdrop-blur-sm sm:p-3" onClick={onClose}>
            <aside onClick={(e) => e.stopPropagation()}
                className="lab-card flex h-full w-full max-w-xl flex-col gap-5 !overflow-y-auto rounded-[1.75rem] !bg-[#0e0e11] p-5 sm:p-6">
                <span className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-yellow-400/10 blur-3xl" />
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="lab-chip h-11 w-11 shrink-0"><Calendar size={20} strokeWidth={1.8} /></span>
                        <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-400">
                                <span className="capitalize">{format(new Date(`${post.date}T12:00:00`), 'EEEE d MMMM', { locale: pl })}</span>
                                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">{post.format}</span>
                            </p>
                            <h2 className="mt-1 text-xl font-bold leading-snug text-white">{post.topic}</h2>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                        <button type="button" onClick={remove} disabled={busy} className="rounded-full p-2 text-zinc-500 transition hover:bg-red-400/10 hover:text-red-300" aria-label="Usuń post"><Trash2 size={16} strokeWidth={1.8} /></button>
                        <button type="button" data-sound="off" onClick={onClose} className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white" aria-label="Zamknij"><X size={18} strokeWidth={1.8} /></button>
                    </div>
                </div>

                {post.images.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {post.images.map((u, i) => (
                                <div key={u} className="relative shrink-0">
                                    <a href={u} target="_blank" rel="noreferrer">
                                        {/* eslint-disable-next-line @next/next/no-img-element -- grafiki z bucketu Supabase */}
                                        <img src={u} alt={`Grafika ${i + 1}`} className={`h-40 w-32 rounded-2xl object-cover transition ${u === imgUrl ? 'ring-2 ring-yellow-400 shadow-[0_10px_30px_-10px_rgba(255,214,10,0.55)]' : 'opacity-80 ring-1 ring-white/10 hover:opacity-100'}`} />
                                    </a>
                                    {post.images.length > 1 && <span className="absolute left-1.5 top-1.5 rounded-full bg-black/70 px-1.5 text-[10px] font-bold text-white">{i + 1}</span>}
                                    {u !== imgUrl && (
                                        <button type="button" onClick={() => pickImage(u)} className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur hover:text-yellow-400">użyj tej</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {post.images.length > 1 && (
                            <p className="text-[11px] text-zinc-500">Karuzela: publikacja z panelu wrzuca tylko zaznaczoną grafikę. Całą karuzelę dodaj w aplikacji (otwórz slajdy i zapisz po kolei).</p>
                        )}
                    </div>
                )}

                {!published && (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            <button onClick={toCanva} disabled={busy}
                                className="flex items-center gap-1.5 rounded-full border border-[#00c4cc]/40 bg-[#00c4cc]/[0.08] px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:border-[#00c4cc] hover:text-white disabled:opacity-50">
                                <Palette size={13} className="text-[#00c4cc]" /> Do planera Canva
                            </button>
                            <button onClick={() => fileRef.current?.click()} disabled={busy}
                                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-white/25 disabled:opacity-50">
                                <Upload size={13} strokeWidth={1.8} /> Wgraj poprawioną
                            </button>
                            <button onClick={() => setRegenOpen(!regenOpen)} disabled={busy}
                                className="flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/[0.06] px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:border-yellow-400/60 disabled:opacity-50">
                                <RefreshCw size={13} strokeWidth={1.8} /> Nowa propozycja (Gemini)
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) uploadEdited(f) }} />
                        </div>
                        {regenOpen && (
                            <div className={`${tile} flex flex-col gap-2 p-4`}>
                                <input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Opcjonalnie: co zmienić? np. krócej, bardziej z życia, inny przykład"
                                    className="px-4 py-2 text-sm text-white placeholder:text-zinc-600" />
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
                                        <input type="checkbox" checked={newTopic} onChange={(e) => setNewTopic(e.target.checked)} className="h-4 w-4 accent-yellow-400" /> Może zmienić temat
                                    </label>
                                    <button onClick={regenerate} disabled={busy}
                                        className="ml-auto flex items-center gap-1.5 bg-yellow-400 px-4 py-1.5 text-xs font-bold text-zinc-950 disabled:opacity-50">
                                        <Sparkles size={13} strokeWidth={1.8} /> {busy ? 'Piszę… (ok. 20 s)' : 'Wygeneruj FB + IG'}
                                    </button>
                                </div>
                                <p className="text-[11px] text-zinc-500">Nadpisuje tekst obu wersji (opublikowanych nie rusza). Notatki i grafiki zostają.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <div className="flex gap-1 self-start rounded-full border border-white/10 bg-white/[0.03] p-1">
                        {versions.map((v) => (
                            <button key={v.id} onClick={() => setTab(v.id)}
                                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${v.id === ev.id ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}>
                                {v.platform.toLowerCase() === 'instagram' ? <Camera size={13} /> : <Globe size={13} />}
                                {v.platform}
                                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[v.status] ?? 'bg-zinc-500'}`} />
                            </button>
                        ))}
                    </div>

                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
                        className="w-full resize-y p-4 text-sm leading-relaxed text-zinc-100" />
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">{text.length} znaków</span>
                        <button onClick={() => { navigator.clipboard?.writeText(text); setMsg({ ok: true, text: 'Skopiowane.' }) }}
                            className="ml-auto flex items-center gap-1 bg-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-white"><Copy size={12} strokeWidth={1.8} /> Kopiuj</button>
                        {dirty && <button onClick={save} disabled={busy} className="flex items-center gap-1 bg-yellow-400 px-3 py-1.5 font-bold text-zinc-950 disabled:opacity-50"><Check size={12} /> Zapisz zmiany</button>}
                    </div>
                </div>

                <div className={`${tile} flex flex-col gap-3 p-4`}>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-zinc-400">Status {ev.platform}:</span>
                        {(['Szkic', 'Zaplanowane', 'Canva', 'Opublikowane'] as const).map((s) => (
                            <button key={s} onClick={() => setStatus(s)} disabled={busy || ev.status === s}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${ev.status === s ? 'bg-white/10 text-white ring-1 ring-white/15' : 'text-zinc-500 hover:bg-white/[0.06] hover:text-white'}`}>
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
                        <button onClick={openPublisher} disabled={busy}
                            className="flex items-center gap-1.5 self-start bg-yellow-400 px-4 py-2 text-xs font-bold text-zinc-950 disabled:opacity-50">
                            <Send size={13} strokeWidth={1.8} /> {busy ? 'Chwila…' : 'Publikuj w panelu (wybór kont)'}
                        </button>
                    )}
                    {msg && <p className={`rounded-xl px-3 py-2 text-xs ${msg.ok ? 'bg-emerald-400/10 text-emerald-300' : 'bg-red-400/10 text-red-300'}`}>{msg.text}</p>}
                </div>

                {post.notes && (
                    <details className={`${tile} p-4`} open={post.format.toLowerCase().includes('rolka')}>
                        <summary className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-300"><NotebookText size={14} strokeWidth={1.8} className="text-yellow-400" /> Notatki: scenariusz, slajdy, dlaczego ten post</summary>
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
