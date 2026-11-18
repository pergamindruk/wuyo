'use client'

// "use client": pisanie posta, przeciąganie obrazów, wybór kont i wysyłka działają bez przeładowania strony.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarClock, ImagePlus, Loader2, RefreshCw, Send, Wifi, WifiOff, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
    BRANDS, PLATFORM_LABEL, charLimitFor, type ChannelsResponse, type SocialChannel,
} from '@/lib/social/channels'

const MAX_IMAGES = 10
const MAX_MB = 8
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'] as const
type Accepted = (typeof ACCEPTED)[number]

type Img = { key: string; name: string; preview: string; url?: string; error?: string }

type Props = {
    /** Wersja kafla na ekranie „Dziś”: mniejsze pole tekstu, link do pełnego widoku. */
    compact?: boolean
    initialContent?: string
    initialImages?: string[]
    calendarEventId?: string
}

const PLATFORM_DOT: Record<string, string> = {
    facebook: 'bg-[#1877F2]',
    instagram: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    tiktok: 'bg-white',
    youtube: 'bg-[#FF0000]',
    inna: 'bg-zinc-500',
}

function localInputValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function SocialPublisher({ compact = false, initialContent = '', initialImages = [], calendarEventId }: Props) {
    const router = useRouter()
    const [content, setContent] = useState(initialContent)
    const [images, setImages] = useState<Img[]>(() =>
        initialImages.map((u, i) => ({ key: `init-${i}`, name: `grafika-${i + 1}`, preview: u, url: u })),
    )
    const [mode, setMode] = useState<'now' | 'schedule'>('now')
    const [when, setWhen] = useState(() => {
        const d = new Date(Date.now() + 86_400_000)
        d.setHours(9, 0, 0, 0)
        return localInputValue(d)
    })
    const [data, setData] = useState<ChannelsResponse | null>(null)
    const [loadingChannels, setLoadingChannels] = useState(true)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [dragOver, setDragOver] = useState(false)
    const [sending, setSending] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const loadChannels = useCallback(async () => {
        setLoadingChannels(true)
        try {
            const res = await fetch('/api/social/channels', { cache: 'no-store' })
            const json = (await res.json()) as ChannelsResponse & { error?: string }
            if (!res.ok) throw new Error(json.error ?? 'Błąd')
            setData(json)
            setSelected((prev) => new Set([...prev].filter((id) => json.channels.some((c) => c.id === id && !c.disabled))))
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Nie udało się pobrać kont.')
        } finally {
            setLoadingChannels(false)
        }
    }, [])

    useEffect(() => {
        void loadChannels()
    }, [loadChannels])

    const channels = useMemo(() => data?.channels ?? [], [data])
    const chosen = channels.filter((c) => selected.has(c.id))
    const limit = charLimitFor(chosen.map((c) => c.platform))
    const tooLong = content.length > limit
    const needsImage = chosen.some((c) => c.platform === 'instagram' || c.platform === 'tiktok')
    const uploading = images.some((i) => !i.url && !i.error)
    const readyImages = images.filter((i) => i.url).map((i) => i.url as string)

    const grouped = useMemo(() => {
        const map = new Map<string, SocialChannel[]>()
        for (const b of BRANDS) map.set(b, [])
        for (const c of channels) map.get(c.brand)?.push(c)
        return [...map.entries()]
    }, [channels])

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })

    const toggleBrand = (list: SocialChannel[]) => {
        const ids = list.filter((c) => !c.disabled).map((c) => c.id)
        const allOn = ids.every((id) => selected.has(id))
        setSelected((prev) => {
            const next = new Set(prev)
            for (const id of ids) {
                if (allOn) next.delete(id)
                else next.add(id)
            }
            return next
        })
    }

    const addFiles = async (files: FileList | File[]) => {
        const list = [...files]
        const room = MAX_IMAGES - images.length
        if (room <= 0) return toast.error(`Maksymalnie ${MAX_IMAGES} obrazów.`)
        for (const file of list.slice(0, room)) {
            if (!ACCEPTED.includes(file.type as Accepted)) {
                toast.error(`${file.name}: dozwolone JPG, PNG, WEBP.`)
                continue
            }
            if (file.size > MAX_MB * 1024 * 1024) {
                toast.error(`${file.name}: maksymalnie ${MAX_MB} MB.`)
                continue
            }
            const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            const preview = URL.createObjectURL(file)
            setImages((prev) => [...prev, { key, name: file.name, preview }])
            try {
                const res = await fetch('/api/social/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contentType: file.type }),
                })
                const link = (await res.json()) as { path?: string; token?: string; publicUrl?: string; error?: string }
                if (!res.ok || !link.path || !link.token || !link.publicUrl) throw new Error(link.error ?? 'Brak linku')
                const { error } = await createClient().storage.from('social').uploadToSignedUrl(link.path, link.token, file, { contentType: file.type })
                if (error) throw new Error(error.message)
                setImages((prev) => prev.map((i) => (i.key === key ? { ...i, url: link.publicUrl } : i)))
            } catch (e) {
                setImages((prev) => prev.map((i) => (i.key === key ? { ...i, error: e instanceof Error ? e.message : 'Błąd' } : i)))
                toast.error(`${file.name}: wysyłka nie wyszła.`)
            }
        }
    }

    const removeImage = (key: string) =>
        setImages((prev) => {
            const img = prev.find((i) => i.key === key)
            if (img?.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview)
            return prev.filter((i) => i.key !== key)
        })

    const blocker =
        !content.trim() ? 'Wpisz treść posta.'
        : chosen.length === 0 ? 'Zaznacz co najmniej jedno konto.'
        : tooLong ? `Tekst za długi o ${content.length - limit} znaków.`
        : uploading ? 'Czekam na wysyłkę obrazów…'
        : needsImage && readyImages.length === 0 ? 'Instagram i TikTok potrzebują obrazka.'
        : mode === 'schedule' && (!when || new Date(when).getTime() < Date.now() + 2 * 60_000) ? 'Wybierz termin w przyszłości.'
        : null

    const submit = async () => {
        if (blocker || sending) return
        setSending(true)
        try {
            const res = await fetch('/api/social/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content.trim(),
                    images: readyImages,
                    channelIds: chosen.map((c) => c.id),
                    mode,
                    scheduledAt: mode === 'schedule' ? new Date(when).toISOString() : undefined,
                    calendarEventId,
                }),
            })
            const json = (await res.json()) as { error?: string; post?: { status: string; wyniki: { nazwa: string; ok: boolean; oczekuje?: boolean; blad?: string }[] } }
            if (!res.ok || !json.post) throw new Error(json.error ?? 'Publikacja nie wyszła.')
            const { status, wyniki } = json.post
            const failed = wyniki.filter((w) => !w.ok && !w.oczekuje)
            const waiting = wyniki.filter((w) => w.oczekuje)
            if (status === 'opublikowane') toast.success('Opublikowane na wszystkich kontach.')
            else if (status === 'zaplanowane') toast.success('Zaplanowane w Postiz.')
            else if (status === 'w_kolejce') toast.message(`W kolejce: ${waiting.map((w) => w.nazwa).join(', ')}. Wyjdzie, gdy Postiz wróci.`)
            else toast.error(`Nie wyszło: ${failed.map((w) => `${w.nazwa}: ${w.blad}`).join(' · ')}`)
            if (status !== 'blad') {
                setContent('')
                setImages([])
            }
            router.refresh()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Publikacja nie wyszła.')
        } finally {
            setSending(false)
        }
    }

    const postiz = data?.postiz
    const counterTone = tooLong ? 'text-red-400' : content.length > limit * 0.9 ? 'text-yellow-400' : 'text-zinc-500'

    return (
        <section className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5 sm:p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">Publikacja social</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Nowy post</h2>
                </div>
                <div className="flex items-center gap-2">
                    {postiz && (
                        <span
                            title={postiz.error ?? undefined}
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${postiz.online ? 'border-emerald-400/30 text-emerald-300' : 'border-zinc-700 text-zinc-400'}`}
                        >
                            {postiz.online ? <Wifi size={12} /> : <WifiOff size={12} />}
                            {!postiz.configured ? 'Postiz niepodpięty' : postiz.online ? 'Postiz online' : 'Postiz śpi'}
                        </span>
                    )}
                    {compact && (
                        <Link href="/lab/publikuj" className="text-xs font-medium text-zinc-500 hover:text-yellow-400">Historia →</Link>
                    )}
                </div>
            </header>

            <div className={`mt-4 grid gap-5 ${compact ? 'lg:grid-cols-2' : 'lg:grid-cols-5'}`}>
                {/* Treść i obrazy */}
                <div className={`flex flex-col gap-3 ${compact ? '' : 'lg:col-span-3'}`}>
                    <div className="relative">
                        <label htmlFor="sp-content" className="sr-only">Treść posta</label>
                        <textarea
                            id="sp-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={compact ? 5 : 9}
                            placeholder="Co dziś wrzucamy?"
                            className="w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 pb-8 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-yellow-400/50 focus:outline-none"
                        />
                        <span className={`pointer-events-none absolute bottom-3 right-4 text-[11px] tabular-nums ${counterTone}`}>
                            {content.length.toLocaleString('pl-PL')} / {limit.toLocaleString('pl-PL')}
                        </span>
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fileRef.current?.click()}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragOver(true)
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault()
                            setDragOver(false)
                            void addFiles(e.dataTransfer.files)
                        }}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-4 py-5 text-center transition ${dragOver ? 'border-yellow-400 bg-yellow-400/5' : 'border-white/15 hover:border-yellow-400/40'}`}
                    >
                        <ImagePlus size={20} className="text-yellow-400" />
                        <p className="text-xs text-zinc-300">Przeciągnij obrazy albo kliknij</p>
                        <p className="text-[11px] text-zinc-600">JPG, PNG, WEBP · do {MAX_MB} MB · max {MAX_IMAGES}</p>
                        <input
                            ref={fileRef}
                            type="file"
                            accept={ACCEPTED.join(',')}
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files) void addFiles(e.target.files)
                                e.target.value = ''
                            }}
                        />
                    </div>

                    {images.length > 0 && (
                        <ul className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img) => (
                                <li key={img.key} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- podgląd blob: albo obraz z bucketu */}
                                    <img src={img.preview} alt={img.name} className={`h-full w-full object-cover ${img.url ? '' : 'opacity-40'}`} />
                                    {!img.url && !img.error && <Loader2 size={18} className="absolute inset-0 m-auto animate-spin text-yellow-400" />}
                                    {img.error && <span className="absolute inset-x-0 bottom-0 bg-red-500/80 px-1 text-[10px] text-white">błąd</span>}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(img.key)}
                                        aria-label={`Usuń ${img.name}`}
                                        className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-zinc-300 hover:text-white"
                                    >
                                        <X size={12} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Konta, tryb, wysyłka */}
                <div className={`flex flex-col gap-4 ${compact ? '' : 'lg:col-span-2'}`}>
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold text-zinc-300">Konta</p>
                            <button type="button" onClick={() => void loadChannels()} className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white" aria-label="Odśwież konta">
                                <RefreshCw size={11} className={loadingChannels ? 'animate-spin' : ''} /> odśwież
                            </button>
                        </div>
                        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                            {grouped.map(([brand, list]) => (
                                <fieldset key={brand} className="rounded-2xl border border-white/[0.06] bg-black/20 p-3">
                                    <legend className="sr-only">{brand}</legend>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{brand}</span>
                                        {list.some((c) => !c.disabled) && (
                                            <button type="button" onClick={() => toggleBrand(list)} className="text-[11px] text-zinc-500 hover:text-yellow-400">
                                                {list.filter((c) => !c.disabled).every((c) => selected.has(c.id)) ? 'odznacz' : 'wszystkie'}
                                            </button>
                                        )}
                                    </div>
                                    {list.length === 0 ? (
                                        <p className="text-[11px] text-zinc-600">{loadingChannels ? 'Ładuję…' : 'Brak podpiętych kont. Dodasz je w Postiz.'}</p>
                                    ) : (
                                        <ul className="flex flex-col gap-1">
                                            {list.map((c) => (
                                                <li key={c.id}>
                                                    <label
                                                        title={c.disabledReason}
                                                        className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${c.disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:bg-white/5'}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selected.has(c.id)}
                                                            disabled={c.disabled}
                                                            onChange={() => toggle(c.id)}
                                                            className="h-4 w-4 rounded border-zinc-600 bg-transparent accent-yellow-400"
                                                        />
                                                        <span className={`h-2 w-2 shrink-0 rounded-full ${PLATFORM_DOT[c.platform]}`} />
                                                        <span className="min-w-0 flex-1 truncate text-zinc-200">{c.name}</span>
                                                        <span className="shrink-0 text-[11px] text-zinc-500">
                                                            {PLATFORM_LABEL[c.platform]}{c.source === 'graph' ? ' · bezpośrednio' : ''}{c.disabled ? ' · wkrótce' : ''}
                                                        </span>
                                                    </label>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </fieldset>
                            ))}
                        </div>
                    </div>

                    <div className="flex rounded-full border border-white/10 bg-black/30 p-1 text-xs font-semibold" role="radiogroup" aria-label="Kiedy publikować">
                        {([['now', 'Opublikuj teraz', Send], ['schedule', 'Zaplanuj datę', CalendarClock]] as const).map(([m, label, Icon]) => (
                            <button
                                key={m}
                                type="button"
                                role="radio"
                                aria-checked={mode === m}
                                onClick={() => setMode(m)}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 transition ${mode === m ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <Icon size={13} /> {label}
                            </button>
                        ))}
                    </div>

                    {mode === 'schedule' && (
                        <label className="flex flex-col gap-1 text-xs text-zinc-400">
                            Termin (czas polski)
                            <input
                                type="datetime-local"
                                value={when}
                                min={localInputValue(new Date())}
                                onChange={(e) => setWhen(e.target.value)}
                                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 [color-scheme:dark] focus:border-yellow-400/50 focus:outline-none"
                            />
                            {postiz && !postiz.online && (
                                <span className="text-[11px] text-zinc-500">Postiz śpi: post trafi do kolejki i wyjdzie przy porannym przebiegu (9:00) po terminie.</span>
                            )}
                        </label>
                    )}

                    <button
                        type="button"
                        onClick={() => void submit()}
                        disabled={Boolean(blocker) || sending}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 text-sm font-bold text-zinc-950 transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : mode === 'now' ? <Send size={16} /> : <CalendarClock size={16} />}
                        {sending ? 'Wysyłam…' : mode === 'now' ? `Opublikuj (${chosen.length})` : `Zaplanuj (${chosen.length})`}
                    </button>
                    {blocker && content && <p className="-mt-2 text-center text-[11px] text-zinc-500">{blocker}</p>}
                </div>
            </div>
        </section>
    )
}
