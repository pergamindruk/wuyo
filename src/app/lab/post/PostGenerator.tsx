'use client'

// "use client": kroki ze stanem (research → post → okładka), edycja tekstów, okładka składana na <canvas>
// w przeglądarce (font Syne ze strony) i wysyłka grafiki prosto do bucketu.

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import {
    CalendarPlus, Check, Copy, Download, ExternalLink, ImagePlus, Lightbulb, RefreshCw, Search, Send, Sparkles, Wand2, Youtube,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { warsawIsoDate } from '@/lib/lab/today/format'
import type { CtaGoal, Pillar, PostFormat } from '@/lib/lab/social/playbook'
import {
    createCoverUploadUrl, generateCoverPhoto, generatePost, researchTopics, savePostToCalendar,
    type GeneratedPost, type Research, type TopicIdea,
} from './actions'

const PILLAR_LABEL: Record<Pillar, string> = { ekspert: 'Ekspert', dowod: 'Dowód', zasieg: 'Zasięg', czlowiek: 'Człowiek' }
const FORMAT_LABEL: Record<PostFormat, string> = { karuzela: 'Karuzela', rolka: 'Rolka / Shorts', post: 'Post z grafiką' }
const CTA_LABEL: Record<CtaGoal, string> = { zapis: 'Zapis', komentarz: 'Komentarz', udostepnienie: 'Udostępnienie', wejscie: 'Wejście na wuyo.pl' }

const W = 1080
const H = 1350
const YELLOW = '#FFD60A'
const NBSP = String.fromCharCode(160)

// ─── Okładka na canvasie: zdjęcie + hasło jak na miniaturach YouTube ─────────

let fontReady: Promise<void> | null = null
function loadFont() {
    fontReady ??= new FontFace('SyneCover', 'url(/fonts/syne-subset.woff2)', { weight: '400 800' })
        .load().then((f) => { document.fonts.add(f) }).catch(() => undefined)
    return fontReady
}

function drawCover(canvas: HTMLCanvasElement, img: HTMLImageElement | null, haslo: string, akcent: string) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#0E0E10'
    ctx.fillRect(0, 0, W, H)
    if (img) {
        const s = Math.max(W / img.naturalWidth, H / img.naturalHeight)
        const w = img.naturalWidth * s, h = img.naturalHeight * s
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h)
    }
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, 'rgba(8,8,10,.88)'); g.addColorStop(0.3, 'rgba(8,8,10,.6)'); g.addColorStop(0.5, 'rgba(8,8,10,0)')
    g.addColorStop(0.8, 'rgba(8,8,10,0)'); g.addColorStop(1, 'rgba(8,8,10,.55)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    // Jednoliterowe słowa („W”, „Z”, „I”) nie zostają same na końcu linii: sklejone z następnym.
    const words = haslo.toUpperCase().split(/\s+/).filter(Boolean).reduce<string[]>((acc, w) => {
        const prev = acc[acc.length - 1]
        if (prev && prev.length === 1) acc[acc.length - 1] = `${prev}${NBSP}${w}`
        else acc.push(w)
        return acc
    }, [])
    if (words.length === 0) return
    const maxW = W - 160
    const acc = akcent.toUpperCase().replace(/[,.?!]/g, '')
    let size = 170, lines: string[][] = []
    for (; size >= 70; size -= 4) {
        ctx.font = `800 ${size}px SyneCover, sans-serif`
        if (words.some((w) => ctx.measureText(w).width > maxW)) continue
        lines = []
        let line: string[] = []
        for (const w of words) {
            const test = [...line, w].join(' ')
            if (line.length && ctx.measureText(test).width > maxW) { lines.push(line); line = [w] } else line.push(w)
        }
        lines.push(line)
        if (lines.length * size * 0.94 <= 560) break
    }
    ctx.font = `800 ${size}px SyneCover, sans-serif`
    ctx.textBaseline = 'top'
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 6
    let y = 96
    for (const line of lines) {
        let x = 80
        for (const w of line.flatMap((t) => t.split(NBSP))) {
            ctx.fillStyle = acc && w.replace(/[,.?!]/g, '') === acc ? YELLOW : '#FFFFFF'
            ctx.fillText(w, x, y)
            x += ctx.measureText(`${w} `).width
        }
        y += size * 0.94
    }
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = YELLOW
    ctx.fillRect(80, y + 24, 150, 16)
}

// ─── Drobne elementy ─────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [done, setDone] = useState(false)
    return (
        <button type="button" onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500) }}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:text-white">
            {done ? <><Check size={12} className="text-green-400" /> Skopiowano</> : <><Copy size={12} /> Kopiuj</>}
        </button>
    )
}

function Chips<T extends string>({ value, options, labels, onChange }: { value: T; options: T[]; labels: Record<T, string>; onChange: (v: T) => void }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((o) => (
                <button key={o} type="button" onClick={() => onChange(o)}
                    className={`rounded-lg border px-2.5 py-1 text-xs ${value === o ? 'border-yellow-400 bg-yellow-400 font-bold text-zinc-950' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}>
                    {labels[o]}
                </button>
            ))}
        </div>
    )
}

function Busy({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-400/30 border-t-yellow-400" /> {label}
        </div>
    )
}

const card = 'rounded-2xl border border-zinc-800 bg-zinc-900 p-5'
const input = 'w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white placeholder:text-zinc-600 focus:border-yellow-400 focus:outline-none'

// ─── Strona ──────────────────────────────────────────────────────────────────

export function PostGenerator() {
    const [hint, setHint] = useState('')
    const [research, setResearch] = useState<Research | null>(null)
    const [temat, setTemat] = useState('')
    const [filar, setFilar] = useState<Pillar>('ekspert')
    const [format, setFormat] = useState<PostFormat>('karuzela')
    const [cel, setCel] = useState<CtaGoal>('zapis')
    const [fakty, setFakty] = useState('')
    const [chosen, setChosen] = useState<TopicIdea | null>(null)
    const [post, setPost] = useState<GeneratedPost | null>(null)
    const [error, setError] = useState('')
    const [busy, setBusy] = useState<'' | 'research' | 'post' | 'photo' | 'save'>('')
    const [, start] = useTransition()

    const [haslo, setHaslo] = useState('')
    const [akcent, setAkcent] = useState('')
    const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const [date, setDate] = useState(() => warsawIsoDate(1))
    const [saved, setSaved] = useState<string[] | null>(null)

    useEffect(() => {
        const c = canvasRef.current
        if (!c || !post) return
        loadFont().then(() => drawCover(c, photo, haslo, akcent))
    }, [post, photo, haslo, akcent])

    const run = (kind: typeof busy, fn: () => Promise<void>) => start(async () => {
        setError(''); setBusy(kind)
        try { await fn() } finally { setBusy('') }
    })

    const doResearch = () => run('research', async () => {
        const r = await researchTopics(hint)
        if (r.ok) setResearch({ trendy: r.trendy, tematy: r.tematy, zrodla: r.zrodla })
        else setError(r.error)
    })

    const write = (idea?: TopicIdea) => run('post', async () => {
        const t = idea ?? { temat, filar, format, cel, dlaczego: '', wpis: '' }
        if (idea) { setChosen(idea); setTemat(idea.temat); setFilar(idea.filar); setFormat(idea.format); setCel(idea.cel) }
        const r = await generatePost({ ...t, fakty })
        if (!r.ok) { setError(r.error); return }
        setPost(r.post); setHaslo(r.post.okladka.haslo); setAkcent(r.post.okladka.akcent); setPhoto(null); setSaved(null)
    })

    const makePhoto = () => post && run('photo', async () => {
        const r = await generateCoverPhoto(post.okladka.scena)
        if (!r.ok) { setError(r.error); return }
        const img = new Image()
        img.onload = () => setPhoto(img)
        img.src = r.dataUrl
    })

    const ownPhoto = (file?: File) => {
        if (!file || !file.type.startsWith('image/')) return
        const img = new Image()
        img.onload = () => setPhoto(img)
        img.src = URL.createObjectURL(file)
    }

    const coverBlob = () => new Promise<Blob | null>((res) => canvasRef.current?.toBlob(res, 'image/jpeg', 0.9) ?? res(null))

    const download = async () => {
        const blob = await coverBlob()
        if (!blob) return
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `okladka-${date}.jpg`
        a.click()
    }

    const save = () => post && run('save', async () => {
        let imageUrl: string | undefined
        if (photo) {
            const blob = await coverBlob()
            const link = await createCoverUploadUrl()
            if (!blob || !link.ok) { setError(link.ok ? 'Nie udało się zapisać okładki.' : link.error); return }
            const { error: upErr } = await createClient().storage.from('social').uploadToSignedUrl(link.path, link.token, blob, { contentType: 'image/jpeg' })
            if (upErr) { setError('Wysyłka okładki nie wyszła. Spróbuj jeszcze raz.'); return }
            imageUrl = link.publicUrl
        }
        const final = { ...post, okladka: { ...post.okladka, haslo, akcent } }
        const r = await savePostToCalendar(final, date, imageUrl)
        if (r.ok) setSaved(r.ids)
        else setError(r.error)
    })

    const setText = (k: 'facebook' | 'instagram', v: string) => post && setPost({ ...post, [k]: v })

    return (
        <div className="flex max-w-6xl flex-col gap-6">
            <header className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-zinc-950"><Wand2 size={22} /></div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Generator postów</h1>
                    <p className="text-sm text-zinc-400">Research trendów i pytań z Google, post wg Twojej strategii, okładka w stylu YouTube. Gotowe do kalendarza.</p>
                </div>
            </header>

            {/* Krok 1: temat */}
            <section className={card}>
                <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Search size={16} className="text-yellow-400" /> 1. Temat</h2>
                <p className="mb-4 text-xs text-zinc-500">AI sprawdzi w Google trendy w niszy, okazje w najbliższych tygodniach i pytania właścicieli firm, zajrzy w Search Console, blog i ostatnie posty, i zaproponuje 3 tematy.</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Opcjonalnie: na czym Ci teraz zależy (np. więcej o stronach, grudzień, druk)" className={input} />
                    <button type="button" onClick={doResearch} disabled={!!busy}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                        <Lightbulb size={16} /> {research ? 'Nowy research' : 'Zrób research'}
                    </button>
                </div>
                {busy === 'research' && <div className="mt-4"><Busy label="Szukam trendów, okazji i pytań (ok. 30-60 s)..." /></div>}

                {research && busy !== 'research' && (
                    <div className="mt-5 flex flex-col gap-4">
                        {research.trendy && <p className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-relaxed text-zinc-300">{research.trendy}</p>}
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {research.tematy.map((t, i) => (
                                <div key={i} className={`flex flex-col gap-2 rounded-xl border p-4 ${chosen === t ? 'border-yellow-400/60 bg-yellow-400/5' : 'border-zinc-800 bg-zinc-950/50'}`}>
                                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-yellow-400">{PILLAR_LABEL[t.filar]}</span>
                                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">{FORMAT_LABEL[t.format]}</span>
                                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">{CTA_LABEL[t.cel]}</span>
                                    </div>
                                    <p className="font-medium text-white">{t.temat}</p>
                                    <p className="text-xs leading-relaxed text-zinc-500">{t.dlaczego}</p>
                                    {t.wpis && <p className="text-xs text-zinc-500">Prowadzi do: <span className="text-zinc-300">/blog/{t.wpis}</span></p>}
                                    <button type="button" onClick={() => write(t)} disabled={!!busy}
                                        className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-yellow-400/50 py-2 text-sm font-bold text-yellow-400 hover:bg-yellow-400 hover:text-zinc-950 disabled:opacity-50">
                                        <Sparkles size={14} /> Napisz ten post
                                    </button>
                                </div>
                            ))}
                        </div>
                        {research.zrodla.length > 0 && (
                            <p className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-600">
                                Źródła: {research.zrodla.map((z) => <a key={z.url} href={z.url} target="_blank" rel="noreferrer" className="hover:text-zinc-300">{z.tytul}</a>)}
                            </p>
                        )}
                    </div>
                )}

                <details className="mt-5 border-t border-zinc-800 pt-4">
                    <summary className="cursor-pointer text-sm text-zinc-400 hover:text-white">Albo podaj własny temat</summary>
                    <div className="mt-3 flex flex-col gap-3">
                        <input value={temat} onChange={(e) => setTemat(e.target.value)} placeholder="np. dlaczego logo z Canvy wychodzi rozmyte na banerze" className={input} />
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div><p className="mb-1.5 text-[11px] uppercase tracking-wider text-zinc-500">Filar</p><Chips value={filar} options={Object.keys(PILLAR_LABEL) as Pillar[]} labels={PILLAR_LABEL} onChange={setFilar} /></div>
                            <div><p className="mb-1.5 text-[11px] uppercase tracking-wider text-zinc-500">Format</p><Chips value={format} options={Object.keys(FORMAT_LABEL) as PostFormat[]} labels={FORMAT_LABEL} onChange={setFormat} /></div>
                            <div><p className="mb-1.5 text-[11px] uppercase tracking-wider text-zinc-500">Cel</p><Chips value={cel} options={Object.keys(CTA_LABEL) as CtaGoal[]} labels={CTA_LABEL} onChange={setCel} /></div>
                        </div>
                        <button type="button" onClick={() => write()} disabled={!!busy || !temat.trim()}
                            className="flex w-fit items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-700 disabled:opacity-50">
                            <Sparkles size={14} /> Napisz post
                        </button>
                    </div>
                </details>
                <textarea value={fakty} onChange={(e) => setFakty(e.target.value)} rows={2}
                    placeholder="Fakty, których AI ma się trzymać (prawdziwa realizacja, liczby, opinia klienta). Bez tego nie opisze żadnej realizacji."
                    className={`${input} mt-4 resize-y`} />
            </section>

            {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
            {busy === 'post' && <Busy label="Warsztat hooków, tekst na FB i IG, okładka (ok. 30-60 s)..." />}

            {/* Krok 2: post */}
            {post && busy !== 'post' && (
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <div className="flex flex-col gap-4">
                        <section className={card}>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <h2 className="font-bold text-white">2. {post.temat}</h2>
                                <button type="button" onClick={() => write(chosen ?? undefined)} disabled={!!busy}
                                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-50">
                                    <RefreshCw size={12} /> Napisz inaczej
                                </button>
                            </div>
                            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-zinc-500">Hooki (pierwszy jest w poście)</p>
                            <ul className="mb-3 flex flex-col gap-1">
                                {post.hooki.map((h, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200">
                                        <span>{h.tekst} <span className="text-xs text-zinc-600">· {h.haczyk}</span></span>
                                        <CopyButton text={h.tekst} />
                                    </li>
                                ))}
                            </ul>
                            {post.czemu_zapisze && <p className="text-xs text-zinc-500">Dlaczego zapisze: {post.czemu_zapisze}</p>}
                        </section>

                        {(['facebook', 'instagram'] as const).map((k) => (
                            <section key={k} className={card}>
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white">{k === 'facebook' ? 'Facebook' : 'Instagram'} <span className="font-normal text-zinc-600">· {post[k].length} znaków</span></h3>
                                    <CopyButton text={post[k]} />
                                </div>
                                <textarea value={post[k]} onChange={(e) => setText(k, e.target.value)} rows={Math.min(16, post[k].split('\n').length + 3)} className={`${input} resize-y leading-relaxed`} />
                            </section>
                        ))}

                        {post.slajdy.length > 0 && (
                            <section className={card}>
                                <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-bold text-white">Slajdy karuzeli</h3>
                                    <CopyButton text={post.slajdy.map((s, i) => `${i + 1}. ${s.naglowek}\n${s.tekst}`).join('\n\n')} /></div>
                                <ol className="flex flex-col gap-2 text-sm">
                                    {post.slajdy.map((s, i) => <li key={i} className="rounded-lg bg-zinc-950/60 p-3"><b className="text-white">{i + 1}. {s.naglowek}</b><p className="text-zinc-400">{s.tekst}</p></li>)}
                                </ol>
                            </section>
                        )}
                        {post.rolka && (
                            <section className={card}>
                                <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-bold text-white">Scenariusz rolki</h3><CopyButton text={post.rolka} /></div>
                                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-300">{post.rolka}</pre>
                                <p className="mt-3 text-xs text-zinc-500">Jedno nagranie 9:16: Instagram Reels, Facebook Reels i YouTube Shorts.</p>
                            </section>
                        )}
                        {post.shorts && (
                            <section className={card}>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><Youtube size={16} className="text-red-500" /> YouTube Shorts</h3>
                                {([['Tytuł', post.shorts.tytul], ['Opis', post.shorts.opis], ['Tagi', post.shorts.tagi.join(', ')]] as const).map(([k, v]) => (
                                    <div key={k} className="mb-2 rounded-lg bg-zinc-950/60 p-3">
                                        <div className="mb-1 flex items-center justify-between"><span className="text-[11px] uppercase tracking-wider text-zinc-500">{k}</span><CopyButton text={v} /></div>
                                        <p className="whitespace-pre-wrap text-sm text-zinc-200">{v}</p>
                                    </div>
                                ))}
                                <a href="https://studio.youtube.com" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
                                    <ExternalLink size={12} /> YouTube Studio (wgraj i zaplanuj)
                                </a>
                            </section>
                        )}
                    </div>

                    {/* Okładka + zapis */}
                    <div className="flex flex-col gap-4 lg:sticky lg:top-6">
                        <section className={card}>
                            <h3 className="mb-3 text-sm font-bold text-white">Okładka 1080 × 1350</h3>
                            <canvas ref={canvasRef} width={W} height={H} className="w-full rounded-xl border border-zinc-800" />
                            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                                <input value={haslo} onChange={(e) => setHaslo(e.target.value.toUpperCase())} placeholder="HASŁO 2-4 SŁOWA" className={input} />
                                <select value={akcent} onChange={(e) => setAkcent(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 text-sm text-yellow-400" aria-label="Żółte słowo">
                                    <option value="">bez żółtego</option>
                                    {haslo.split(/\s+/).filter(Boolean).map((w) => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button type="button" onClick={makePhoto} disabled={!!busy}
                                    className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                                    <Sparkles size={14} /> {photo ? 'Inne zdjęcie AI' : 'Zdjęcie AI'}
                                </button>
                                <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700">
                                    <ImagePlus size={14} /> Własne zdjęcie
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => ownPhoto(e.target.files?.[0])} />
                                <button type="button" onClick={download} className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700">
                                    <Download size={14} /> Pobierz
                                </button>
                            </div>
                            {busy === 'photo' && <div className="mt-3"><Busy label="Robię zdjęcie (do 2 minut)..." /></div>}
                            <details className="mt-3 text-xs text-zinc-500"><summary className="cursor-pointer">Opis sceny dla AI</summary><p className="mt-1">{post.okladka.scena}</p></details>
                        </section>

                        <section className={card}>
                            <h3 className="mb-3 text-sm font-bold text-white">3. Do kalendarza</h3>
                            {saved ? (
                                <div className="flex flex-col gap-2 text-sm">
                                    <p className="flex items-center gap-2 text-green-400"><Check size={16} /> Zapisane jako szkic FB + IG na {date}.</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href="/lab/calendar" className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-zinc-200 hover:bg-zinc-700"><ExternalLink size={14} /> Kalendarz</Link>
                                        {saved[0] && <Link href={`/lab/publikuj?z=${saved[0]}`} className="flex items-center gap-1.5 rounded-lg bg-yellow-400 px-3 py-2 font-bold text-zinc-950 hover:bg-yellow-300"><Send size={14} /> Publikuj</Link>}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-white" />
                                    <button type="button" onClick={save} disabled={!!busy}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50">
                                        <CalendarPlus size={16} /> {busy === 'save' ? 'Zapisuję...' : photo ? 'Zapisz z okładką' : 'Zapisz (bez grafiki)'}
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </div>
    )
}
