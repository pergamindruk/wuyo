'use client'
// "use client": to narzędzie operatora (formularze, podgląd na żywo, pobieranie plików), wszystko reaguje na kliknięcia.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Download, FileUp, ImagePlus, Layers, Loader2, Maximize2, Save, Sparkles, Square, Trash2, Undo2, Upload, Wand2, ZoomIn } from 'lucide-react'
import { layoutSheet } from '@/lib/lab/stickers/geometry'
import {
    DEFAULT_SETTINGS, SIZE_MAX, SIZE_MIN, clampQty, clampSize, sanitizeSettings,
    type StickerGeometry, type StickerSettings,
} from '@/lib/lab/stickers/types'
import SheetPreviewA4, { type PreviewDesign } from './SheetPreviewA4'
import ZoomModal, { StickerCloseup } from './ZoomModal'

type Design = {
    id: string
    name: string
    src: string
    /** Wymiary grafiki w px (proporcje). */
    w: number
    h: number
    sizeMm: number
    qty: number
    geo?: StickerGeometry
    geoKey?: string
    /** Poprzednie wersje grafiki (do „Cofnij”), tylko w tej sesji. */
    history?: string[]
}

type Preset = { name: string; settings: StickerSettings }

const STYLES: { id: string; label: string }[] = [
    { id: 'vector', label: 'Płaska grafika' },
    { id: 'kawaii', label: 'Słodki rysunek' },
    { id: 'retro', label: 'Retro odznaka' },
    { id: 'comic', label: 'Komiks' },
    { id: 'realistic', label: 'Realistyczny 3D' },
    { id: 'logo', label: 'Logo firmy' },
]

const REFINE_CHIPS = [
    'większy i czytelniejszy napis',
    'grubszy ciemny kontur',
    'bardziej nasycone kolory',
    'mniej drobnych detali',
    'usuń cienie i połysk',
]

/** Ile naklejek najwyżej w jednej serii (każda to osobne płatne zapytanie do Gemini). */
const SERIES_MAX = 12

const DRAFT_KEY = 'wuyo-stickers-draft'
const PRESETS_KEY = 'wuyo-stickers-presets'
/** Vercel przyjmuje do 4,5 MB w zapytaniu. */
const BODY_WARN = 4.2 * 1024 * 1024

const card = 'rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5'
const input = 'w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/60'
const btnPrimary = 'inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_-8px_rgba(255,235,82,0.7)] transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50'
const btnGhost = 'inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40'
const label = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500'

const newId = () => Math.random().toString(36).slice(2, 10)
const fmt = (n: number, d = 1) => n.toLocaleString('pl-PL', { maximumFractionDigits: d, minimumFractionDigits: d })
const geoKeyOf = (d: Design, s: StickerSettings) => `${d.src.length}:${d.src.slice(-24)}|${d.sizeMm}|${s.offsetMm}|${s.smooth}`

function readStore<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
        return fallback
    }
}
function writeStore(key: string, value: unknown): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
    } catch {
        return false
    }
}

/** Plik -> data URL, zmniejszony do maxSide (WebP zachowuje przezroczystość). */
async function fileToDataUrl(file: Blob, maxSide: number): Promise<string> {
    const url = URL.createObjectURL(file)
    try {
        const img = new Image()
        img.src = url
        await img.decode()
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.naturalWidth * scale)
        canvas.height = Math.round(img.naturalHeight * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/webp', 0.95)
    } finally {
        URL.revokeObjectURL(url)
    }
}

async function imageSize(src: string): Promise<{ w: number; h: number }> {
    const img = new Image()
    img.src = src
    await img.decode()
    return { w: img.naturalWidth, h: img.naturalHeight }
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok) throw new Error(json.error ?? `Błąd ${res.status}`)
    return json
}

/** Przybliżony kontur (prostokąt), zanim serwer policzy prawdziwy. */
function approxGeo(d: Design, s: StickerSettings): StickerGeometry {
    const long = Math.max(d.w, d.h) || 1
    const iw = (d.w / long) * d.sizeMm
    const ih = (d.h / long) * d.sizeMm
    const o = s.offsetMm
    return {
        contour: [[0, 0], [iw + 2 * o, 0], [iw + 2 * o, ih + 2 * o], [0, ih + 2 * o]],
        w: iw + 2 * o,
        h: ih + 2 * o,
        img: { x: o, y: o, w: iw, h: ih },
        closed: 0,
    }
}

export default function StickerStudio() {
    const [designs, setDesigns] = useState<Design[]>([])
    const [settings, setSettings] = useState<StickerSettings>(DEFAULT_SETTINGS)
    const [presets, setPresets] = useState<Preset[]>([])
    const [presetName, setPresetName] = useState('')
    const [loaded, setLoaded] = useState(false)

    const [tab, setTab] = useState<'ai' | 'series' | 'upload'>('ai')
    const [prompt, setPrompt] = useState('')
    const [style, setStyle] = useState('vector')
    const [reference, setReference] = useState<string | null>(null)
    const [theme, setTheme] = useState('')
    const [variants, setVariants] = useState('')
    const [seriesStep, setSeriesStep] = useState<{ i: number; n: number; name: string } | null>(null)
    const stopSeries = useRef(false)
    const [removeBg, setRemoveBg] = useState<'auto' | 'tak' | 'nie'>('auto')
    const [busy, setBusy] = useState(false)
    const [elapsed, setElapsed] = useState(0)
    const [exporting, setExporting] = useState(false)
    const [showCut, setShowCut] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [zoomId, setZoomId] = useState<string | null>(null)
    const [sheetZoom, setSheetZoom] = useState(false)
    const [refineText, setRefineText] = useState('')
    const [refining, setRefining] = useState(false)
    const [enhancing, setEnhancing] = useState<'new' | 'edit' | null>(null)
    /** Tekst sprzed ulepszenia, do „Przywróć mój”. */
    const [before, setBefore] = useState<{ new?: string; edit?: string }>({})

    const inflight = useRef(new Set<string>())
    const projectInput = useRef<HTMLInputElement>(null)

    // Wczytanie szkicu i presetów (tylko przeglądarka, localStorage może być niedostępny).
    useEffect(() => {
        const draft = readStore<{ designs?: Design[]; settings?: unknown } | null>(DRAFT_KEY, null)
        if (draft?.designs?.length) setDesigns(draft.designs.map((d) => ({ ...d, geo: undefined, geoKey: undefined })))
        if (draft?.settings) setSettings(sanitizeSettings(draft.settings))
        setPresets(readStore<Preset[]>(PRESETS_KEY, []))
        setLoaded(true)
    }, [])

    // Autozapis szkicu: po zamknięciu karty naklejki zostają.
    useEffect(() => {
        if (!loaded) return
        const t = setTimeout(() => {
            const ok = writeStore(DRAFT_KEY, { designs: designs.map(({ geo, geoKey, history, ...rest }) => { void geo; void geoKey; void history; return rest }), settings })
            if (!ok) writeStore(DRAFT_KEY, { designs: [], settings })
        }, 800)
        return () => clearTimeout(t)
    }, [designs, settings, loaded])

    // Licznik sekund przy generowaniu (Gemini potrafi myśleć minutę).
    useEffect(() => {
        if (!busy && !refining) return
        setElapsed(0)
        const t = setInterval(() => setElapsed((e) => e + 1), 1000)
        return () => clearInterval(t)
    }, [busy, refining])

    // Prawdziwe kontury z serwera, z opóźnieniem, żeby suwak nie strzelał zapytaniami.
    useEffect(() => {
        const stale = designs.filter((d) => d.geoKey !== geoKeyOf(d, settings) && !inflight.current.has(geoKeyOf(d, settings)))
        if (!stale.length) return
        const t = setTimeout(() => {
            for (const d of stale) {
                const key = geoKeyOf(d, settings)
                inflight.current.add(key)
                postJson<StickerGeometry>('/api/lab/stickers/preview', { image: d.src, sizeMm: d.sizeMm, offsetMm: settings.offsetMm, smooth: settings.smooth })
                    .then((geo) => setDesigns((all) => all.map((x) => (x.id === d.id && geoKeyOf(x, settings) === key ? { ...x, geo, geoKey: key } : x))))
                    .catch((e: Error) => toast.error(`${d.name}: ${e.message}`))
                    .finally(() => inflight.current.delete(key))
            }
        }, 400)
        return () => clearTimeout(t)
    }, [designs, settings])

    const previewMap = useMemo(() => {
        const map = new Map<string, PreviewDesign>()
        for (const d of designs) {
            const fresh = d.geo && d.geoKey === geoKeyOf(d, settings)
            map.set(d.id, { id: d.id, src: d.src, geo: fresh ? d.geo! : d.geo ?? approxGeo(d, settings), approx: !fresh })
        }
        return map
    }, [designs, settings])

    const layout = useMemo(
        () => layoutSheet(designs.map((d) => ({ id: d.id, w: previewMap.get(d.id)!.geo.w, h: previewMap.get(d.id)!.geo.h, qty: d.qty })), settings),
        [designs, previewMap, settings],
    )
    const countById = useMemo(() => {
        const c: Record<string, number> = {}
        for (const p of layout.placements) c[p.id] = (c[p.id] ?? 0) + 1
        return c
    }, [layout])
    const pending = designs.some((d) => previewMap.get(d.id)?.approx)

    const set = <K extends keyof StickerSettings>(k: K, v: StickerSettings[K]) => setSettings((s) => sanitizeSettings({ ...s, [k]: v }))
    const updateDesign = (id: string, patch: Partial<Design>) => setDesigns((all) => all.map((d) => (d.id === id ? { ...d, ...patch } : d)))

    const addDesign = useCallback(async (src: string, name: string) => {
        const { w, h } = await imageSize(src)
        const id = newId()
        setDesigns((all) => [...all, { id, name, src, w, h, sizeMm: 60, qty: 1 }])
        setSelectedId(id)
    }, [])

    async function generate() {
        if (prompt.trim().length < 3) return toast.error('Opisz, co ma być na naklejce.')
        setBusy(true)
        try {
            const r = await postJson<{ cutout: string; model: string }>('/api/lab/stickers/generate', { mode: 'ai', prompt, style, reference })
            await addDesign(r.cutout, prompt.trim().slice(0, 40))
            toast.success(`Gotowe (${r.model}). Naklejka jest na arkuszu.`)
        } catch (e) {
            toast.error((e as Error).message)
        } finally {
            setBusy(false)
        }
    }

    /**
     * Seria: każdy wariant z listy to osobna naklejka z własną linią cięcia.
     * Pierwsza gotowa naklejka staje się wzorem dla kolejnych, żeby cały zestaw miał tę samą kreskę i kolory.
     */
    async function generateSeries() {
        if (theme.trim().length < 3) return toast.error('Opisz motyw serii.')
        const list = variants.split('\n').map((v) => v.trim()).filter((v) => v.length >= 2)
        if (!list.length) return toast.error('Wpisz warianty, każdy w osobnej linii.')
        if (list.length > SERIES_MAX) return toast.error(`Najwyżej ${SERIES_MAX} naklejek w jednej serii.`)
        setBusy(true)
        stopSeries.current = false
        let ref = reference
        let done = 0
        try {
            for (let i = 0; i < list.length; i++) {
                if (stopSeries.current) break
                setSeriesStep({ i: i + 1, n: list.length, name: list[i] })
                try {
                    const r = await postJson<{ cutout: string }>('/api/lab/stickers/generate', { mode: 'ai', theme, prompt: list[i], style, reference: ref })
                    await addDesign(r.cutout, list[i].slice(0, 40))
                    if (done === 0) ref = await fileToDataUrl(await (await fetch(r.cutout)).blob(), 1024)
                    done++
                } catch (e) {
                    toast.error(`${list[i]}: ${(e as Error).message}`)
                }
            }
            if (done) toast.success(`Seria: ${done} z ${list.length} naklejek na arkuszu, każda z własną linią cięcia.`)
        } finally {
            setBusy(false)
            setSeriesStep(null)
        }
    }

    async function pickAsReference(d: Design) {
        setReference(await fileToDataUrl(await (await fetch(d.src)).blob(), 1024))
        toast.success(`„${d.name}” jest teraz wzorem dla nowych naklejek.`)
    }

    async function refine(d: Design, instruction: string) {
        if (instruction.trim().length < 3) return toast.error('Napisz, co poprawić.')
        setRefining(true)
        try {
            const r = await postJson<{ cutout: string }>('/api/lab/stickers/generate', { mode: 'edit', image: d.src, instruction })
            const { w, h } = await imageSize(r.cutout)
            setDesigns((all) => all.map((x) => (x.id === d.id ? { ...x, src: r.cutout, w, h, history: [...(x.history ?? []), x.src].slice(-5) } : x)))
            setRefineText('')
            toast.success('Poprawione. Nie pasuje? Kliknij „Cofnij”.')
        } catch (e) {
            toast.error((e as Error).message)
        } finally {
            setRefining(false)
        }
    }

    /** AI dopisuje detale do opisu. Wynik ląduje w polu, można go jeszcze poprawić ręcznie. */
    async function enhance(kind: 'new' | 'edit') {
        const text = kind === 'new' ? prompt : refineText
        if (text.trim().length < 3) return toast.error('Najpierw wpisz choć kilka słów.')
        setEnhancing(kind)
        try {
            const r = await postJson<{ prompt: string }>('/api/lab/stickers/generate', { mode: 'enhance', kind, prompt: text, style })
            setBefore((b) => ({ ...b, [kind]: text }))
            if (kind === 'new') setPrompt(r.prompt)
            else setRefineText(r.prompt)
        } catch (e) {
            toast.error((e as Error).message)
        } finally {
            setEnhancing(null)
        }
    }

    function restore(kind: 'new' | 'edit') {
        const text = before[kind]
        if (text === undefined) return
        if (kind === 'new') setPrompt(text)
        else setRefineText(text)
        setBefore((b) => ({ ...b, [kind]: undefined }))
    }

    const enhanceRow = (kind: 'new' | 'edit') => (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => enhance(kind)} disabled={!!enhancing || busy || refining} className={btnGhost}
                title="AI rozpisze opis na szczegóły: kolory, detale, kompozycja, napisy">
                {enhancing === kind ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                {enhancing === kind ? 'Dopracowuję opis…' : 'Ulepsz opis (AI)'}
            </button>
            {before[kind] !== undefined && (
                <button type="button" onClick={() => restore(kind)} className="text-[11px] text-zinc-500 underline-offset-2 hover:text-white hover:underline">Przywróć mój</button>
            )}
        </div>
    )

    function undo(d: Design) {
        const prev = d.history?.at(-1)
        if (!prev) return
        imageSize(prev).then(({ w, h }) => updateDesign(d.id, { src: prev, w, h, history: d.history!.slice(0, -1) }))
    }

    async function upload(files: FileList | null) {
        if (!files?.length) return
        setBusy(true)
        try {
            for (const f of Array.from(files)) {
                try {
                    const image = await fileToDataUrl(f, 2048)
                    const r = await postJson<{ cutout: string; removed: boolean }>('/api/lab/stickers/generate', { mode: 'upload', image, removeBg })
                    await addDesign(r.cutout, f.name.replace(/\.[^.]+$/, '').slice(0, 40))
                    toast.success(`${f.name}: ${r.removed ? 'tło wycięte' : 'zostawione tło z pliku'}`)
                } catch (e) {
                    toast.error(`${f.name}: ${(e as Error).message}`)
                }
            }
        } finally {
            setBusy(false)
        }
    }

    async function exportZip() {
        if (!designs.length) return toast.error('Najpierw dodaj naklejkę.')
        const payload = { designs: designs.map(({ id, name, src, sizeMm, qty }) => ({ id, name, src, sizeMm, qty })), settings }
        const body = JSON.stringify(payload)
        if (body.length > BODY_WARN) toast.warning('Dużo grafik naraz: na wuyo.pl serwer może odrzucić paczkę. Lokalnie zadziała.')
        setExporting(true)
        try {
            const res = await fetch('/api/lab/stickers/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
            const type = res.headers.get('Content-Type') ?? ''
            if (res.ok && type.includes('application/zip')) {
                const blob = await res.blob()
                const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'naklejki.zip'
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = name
                a.click()
                setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
                toast.success('Paczka pobrana: PNG 300 DPI, DXF, SVG i instrukcja.')
                return
            }
            const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
            if (!res.ok || !json.url) throw new Error(json.error ?? `Błąd ${res.status}`)
            window.location.href = json.url
            toast.success('Paczka gotowa, pobieranie ruszyło.')
        } catch (e) {
            toast.error((e as Error).message)
        } finally {
            setExporting(false)
        }
    }

    async function importProject(file: File | undefined) {
        if (!file) return
        try {
            const json = JSON.parse(await file.text()) as { app?: string; settings?: unknown; designs?: Partial<Design>[] }
            if (json.app !== 'wuyo-sticker-studio' || !Array.isArray(json.designs)) throw new Error('To nie jest plik projektu z Sticker Studio.')
            const list: Design[] = []
            for (const d of json.designs) {
                if (typeof d.src !== 'string' || !d.src.startsWith('data:image/')) continue
                const { w, h } = await imageSize(d.src)
                list.push({ id: newId(), name: String(d.name ?? 'Naklejka').slice(0, 60), src: d.src, w, h, sizeMm: clampSize(d.sizeMm), qty: clampQty(d.qty) })
            }
            setDesigns(list)
            setSettings(sanitizeSettings(json.settings))
            toast.success(`Wczytano ${list.length} projektów.`)
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    function savePreset() {
        const name = presetName.trim()
        if (!name) return toast.error('Wpisz nazwę, np. imię klienta.')
        const next = [...presets.filter((p) => p.name !== name), { name, settings }]
        setPresets(next)
        writeStore(PRESETS_KEY, next)
        setPresetName('')
        toast.success(`Zapisano ustawienia „${name}”.`)
    }
    function removePreset(name: string) {
        const next = presets.filter((p) => p.name !== name)
        setPresets(next)
        writeStore(PRESETS_KEY, next)
    }

    const total = layout.placements.length
    const zoomDesign = zoomId ? designs.find((d) => d.id === zoomId) ?? null : null
    const zoomGeo = zoomDesign ? previewMap.get(zoomDesign.id)!.geo : null
    const overflow = Object.entries(layout.overflow)

    const styleAndReference = (
        <>
                        <div>
                            <span className={label}>Styl</span>
                            <div className="flex flex-wrap gap-1.5">
                                {STYLES.map((s) => (
                                    <button key={s.id} onClick={() => setStyle(s.id)}
                                        className={`rounded-full border px-3 py-1 text-xs transition ${style === s.id ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-300' : 'border-white/10 text-zinc-400 hover:text-white'}`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <label className={`${btnGhost} cursor-pointer`}>
                                <ImagePlus size={14} /> {reference ? 'Zmień wzór' : 'Dodaj wzór (opcjonalnie)'}
                                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                                    onChange={async (e) => { const f = e.target.files?.[0]; if (f) setReference(await fileToDataUrl(f, 1024)); e.target.value = '' }} />
                            </label>
                            {reference && (
                                <span className="flex items-center gap-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={reference} alt="Wzór" className="h-9 w-9 rounded-lg object-cover" />
                                    <button onClick={() => setReference(null)} className="text-xs text-zinc-500 hover:text-red-400">usuń</button>
                                </span>
                            )}
                        </div>
        </>
    )

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
            <div className="flex min-w-0 flex-col gap-5">
                {/* 1. Grafika */}
                <section className={card}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-white"><span className="mr-2 text-yellow-400">1.</span>Nowa naklejka</h2>
                        <div className="flex rounded-full border border-white/10 p-0.5 text-xs">
                            {(['ai', 'series', 'upload'] as const).map((t) => (
                                <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1.5 font-medium transition ${tab === t ? 'bg-yellow-400 text-zinc-950' : 'text-zinc-400 hover:text-white'}`}>
                                    {t === 'ai' ? 'Generuj z Gemini' : t === 'series' ? 'Seria' : 'Wgraj plik'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {tab === 'ai' ? (
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className={label} htmlFor="st-prompt">Co ma być na naklejce</label>
                                <textarea id="st-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} maxLength={1200}
                                    placeholder="np. uśmiechnięta filiżanka kawy z napisem „Kawiarnia Rynek”, ciepłe kolory"
                                    className={`${input} resize-y`} />
                                {enhanceRow('new')}
                            </div>
                            {styleAndReference}
                            <div className="flex flex-wrap items-center gap-3">
                                <button onClick={generate} disabled={busy} className={btnPrimary}>
                                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    {busy ? `Gemini rysuje… ${elapsed} s` : 'Generuj naklejkę'}
                                </button>
                                <p className="text-[11px] text-zinc-500">Gemini 3 Pro Image, 1:1, 2K. Jedno kliknięcie = jedno płatne zapytanie.</p>
                            </div>
                        </div>
                    ) : tab === 'series' ? (
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className={label} htmlFor="st-theme">Motyw serii (wspólny dla wszystkich)</label>
                                <textarea id="st-theme" value={theme} onChange={(e) => setTheme(e.target.value)} rows={3} maxLength={800}
                                    placeholder="np. rudy lis w zielonym szaliku, zimowy klimat, pastelowe kolory"
                                    className={`${input} resize-y`} />
                            </div>
                            <div>
                                <label className={label} htmlFor="st-variants">Naklejki w serii, każda w osobnej linii (najwyżej {SERIES_MAX})</label>
                                <textarea id="st-variants" value={variants} onChange={(e) => setVariants(e.target.value)} rows={6}
                                    placeholder={'lis z kubkiem gorącej czekolady\nlis na nartach\nlis lepi bałwana\nśpiący lis pod kocem'}
                                    className={`${input} resize-y`} />
                            </div>
                            {styleAndReference}
                            <p className="text-[11px] text-zinc-500">Pierwsza gotowa naklejka staje się wzorem dla kolejnych, więc cała seria ma tę samą kreskę i kolory. Każda dostaje własną linię cięcia.</p>
                            <div className="flex flex-wrap items-center gap-3">
                                <button onClick={generateSeries} disabled={busy} className={btnPrimary}>
                                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Layers size={16} />}
                                    {seriesStep ? `${seriesStep.i}/${seriesStep.n}: ${seriesStep.name.slice(0, 24)}… ${elapsed} s` : 'Generuj serię'}
                                </button>
                                {seriesStep && (
                                    <button onClick={() => { stopSeries.current = true; toast('Zatrzymam po bieżącej naklejce.') }} className={btnGhost}>
                                        <Square size={12} /> Zatrzymaj
                                    </button>
                                )}
                                <p className="text-[11px] text-zinc-500">Każda naklejka to jedno płatne zapytanie, około minuty.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-zinc-950/40 px-4 py-8 text-center transition hover:border-yellow-400/50"
                                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files) }}>
                                {busy ? <Loader2 size={22} className="animate-spin text-yellow-400" /> : <Upload size={22} className="text-yellow-400" />}
                                <span className="text-sm text-zinc-300">Upuść PNG, JPG albo WebP lub kliknij</span>
                                <span className="text-[11px] text-zinc-500">Można kilka naraz. Najlepiej grafika na jednolitym tle albo PNG z przezroczystością.</span>
                                <input type="file" multiple accept="image/png,image/jpeg,image/webp" className="hidden" disabled={busy}
                                    onChange={(e) => { upload(e.target.files); e.target.value = '' }} />
                            </label>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                                <span>Tło:</span>
                                {([['auto', 'samo zdecyduj'], ['tak', 'zawsze wycinaj'], ['nie', 'zostaw']] as const).map(([v, l]) => (
                                    <button key={v} onClick={() => setRemoveBg(v)}
                                        className={`rounded-full border px-2.5 py-1 transition ${removeBg === v ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-300' : 'border-white/10 hover:text-white'}`}>{l}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* 2. Projekty */}
                <section className={card}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-white"><span className="mr-2 text-yellow-400">2.</span>Naklejki na arkuszu</h2>
                        {designs.length > 0 && (
                            <button onClick={() => { if (window.confirm('Usunąć wszystkie naklejki z arkusza?')) setDesigns([]) }} className={btnGhost}><Trash2 size={13} /> Wyczyść</button>
                        )}
                    </div>
                    {designs.length === 0 ? (
                        <p className="rounded-2xl bg-zinc-950/40 px-4 py-6 text-center text-sm text-zinc-500">Arkusz jest pusty. Wygeneruj albo wgraj pierwszą grafikę.</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {designs.map((d) => {
                                const geo = previewMap.get(d.id)!.geo
                                const placed = countById[d.id] ?? 0
                                const missing = layout.overflow[d.id] ?? 0
                                return (
                                    <li key={d.id} onClick={() => setSelectedId(d.id)}
                                        className={`grid grid-cols-[56px_minmax(0,1fr)] gap-3 rounded-2xl border p-2.5 transition sm:grid-cols-[56px_minmax(0,1fr)_auto] ${selectedId === d.id ? 'border-yellow-400/40 bg-yellow-400/[0.04]' : 'border-white/[0.06] bg-zinc-950/30'}`}>
                                        <div onClick={(e) => { e.stopPropagation(); setZoomId(d.id) }} title="Lupa i poprawki" className="flex h-14 w-14 cursor-zoom-in items-center justify-center rounded-xl bg-[repeating-conic-gradient(#27272a_0_25%,#1f1f23_0_50%)] bg-[length:12px_12px] p-1">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={d.src} alt={d.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <div className="min-w-0">
                                            <input value={d.name} onChange={(e) => updateDesign(d.id, { name: e.target.value.slice(0, 60) })}
                                                className="w-full truncate bg-transparent text-sm font-medium text-white outline-none" aria-label="Nazwa naklejki" />
                                            <p className="text-[11px] text-zinc-500">
                                                z obwódką {fmt(geo.w)} × {fmt(geo.h)} mm · na arkuszu {placed}
                                                {missing > 0 && <span className="text-amber-400"> · nie weszło {missing}</span>}
                                                {previewMap.get(d.id)!.approx && <span className="text-zinc-600"> · liczę kontur…</span>}
                                            </p>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                <input type="range" min={SIZE_MIN} max={SIZE_MAX} step={1} value={d.sizeMm}
                                                    onChange={(e) => updateDesign(d.id, { sizeMm: clampSize(e.target.value) })}
                                                    className="w-full accent-yellow-400" aria-label="Rozmiar w mm" />
                                                <span className="w-14 shrink-0 text-right text-xs tabular-nums text-zinc-300">{d.sizeMm} mm</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-2 sm:col-span-1 sm:flex-col sm:items-end">
                                            <label className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                                                sztuk
                                                <input type="number" min={0} max={200} value={d.qty}
                                                    onChange={(e) => updateDesign(d.id, { qty: clampQty(e.target.value) })}
                                                    className="w-16 rounded-lg border border-white/10 bg-zinc-950/60 px-2 py-1 text-right text-sm text-white outline-none focus:border-yellow-400/60" />
                                            </label>
                                            <button onClick={(e) => { e.stopPropagation(); pickAsReference(d) }} title="Użyj jako wzoru dla nowych naklejek i serii"
                                                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-yellow-400/10 hover:text-yellow-300" aria-label={`Użyj jako wzoru: ${d.name}`}>
                                                <ImagePlus size={15} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setZoomId(d.id) }} title="Lupa i poprawki"
                                                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-yellow-400/10 hover:text-yellow-300" aria-label={`Lupa i poprawki: ${d.name}`}>
                                                <ZoomIn size={15} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setDesigns((all) => all.filter((x) => x.id !== d.id)) }}
                                                className="rounded-full p-1.5 text-zinc-500 transition hover:bg-red-400/10 hover:text-red-400" aria-label={`Usuń ${d.name}`}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>

                {/* 3. Cięcie i druk */}
                <section className={card}>
                    <h2 className="mb-4 text-base font-semibold text-white"><span className="mr-2 text-yellow-400">3.</span>Cięcie, druk, laminat</h2>
                    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                        <Slider label="Obwódka (offset cięcia)" unit="mm" min={0.5} max={8} step={0.5} value={settings.offsetMm} onChange={(v) => set('offsetMm', v)}
                            hint="Odległość linii cięcia od grafiki." />
                        <Slider label="Spad za linią cięcia" unit="mm" min={0} max={3} step={0.25} value={settings.bleedMm} onChange={(v) => set('bleedMm', v)}
                            hint="Kolor obwódki wychodzi poza cięcie, żeby nie było białych krawędzi." />
                        <Slider label="Odstęp między naklejkami" unit="mm" min={0} max={15} step={0.5} value={settings.gapMm} onChange={(v) => set('gapMm', v)} />
                        <Slider label="Margines arkusza" unit="mm" min={3} max={30} step={1} value={settings.marginMm} onChange={(v) => set('marginMm', v)} />
                        <Slider label="Wygładzanie konturu" unit="" min={0} max={4} step={1} value={settings.smooth} onChange={(v) => set('smooth', v)}
                            hint="Wyżej = łagodniejsze łuki, nóż mniej szarpie." />
                        <div>
                            <span className={label}>Kolor obwódki</span>
                            <div className="flex items-center gap-2">
                                {['#ffffff', '#18181b', '#facc15', '#f472b6', '#38bdf8'].map((c) => (
                                    <button key={c} onClick={() => set('borderColor', c)} aria-label={`Kolor ${c}`}
                                        className={`h-7 w-7 rounded-full border-2 transition ${settings.borderColor === c ? 'border-yellow-400 scale-110' : 'border-white/15'}`} style={{ background: c }} />
                                ))}
                                <input type="color" value={settings.borderColor} onChange={(e) => set('borderColor', e.target.value)}
                                    className="h-7 w-9 cursor-pointer rounded border border-white/15 bg-transparent" aria-label="Własny kolor" />
                            </div>
                            <p className="mt-1 text-[11px] text-zinc-500">Biały = bez tuszu, kolor folii.</p>
                        </div>
                        <div>
                            <span className={label}>Laminat</span>
                            <div className="flex gap-1.5">
                                {([['blysk', 'Błyszczący'], ['mat', 'Matowy'], ['brak', 'Bez']] as const).map(([v, l]) => (
                                    <button key={v} onClick={() => set('laminate', v)}
                                        className={`rounded-full border px-3 py-1 text-xs transition ${settings.laminate === v ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-300' : 'border-white/10 text-zinc-400 hover:text-white'}`}>{l}</button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-zinc-300">
                            <Toggle checked={settings.regMarks} onChange={(v) => set('regMarks', v)} label="Miejsce na znaczniki Cameo (Typ 1)" />
                            <Toggle checked={settings.rotate} onChange={(v) => set('rotate', v)} label="Obracaj, gdy lepiej się mieści" />
                            <Toggle checked={settings.fill} onChange={(v) => set('fill', v)} label="Wypełnij resztę arkusza kopiami" />
                        </div>
                    </div>

                    <div className="mt-5 border-t border-white/[0.06] pt-4">
                        <span className={label}>Zapisane ustawienia (np. per klient)</span>
                        <div className="flex flex-wrap items-center gap-2">
                            {presets.map((p) => (
                                <span key={p.name} className="inline-flex items-center rounded-full border border-white/10 text-xs">
                                    <button onClick={() => { setSettings(sanitizeSettings(p.settings)); toast.success(`Ustawienia „${p.name}”.`) }} className="py-1 pl-3 pr-1.5 text-zinc-300 hover:text-white">{p.name}</button>
                                    <button onClick={() => removePreset(p.name)} className="py-1 pl-1 pr-2.5 text-zinc-600 hover:text-red-400" aria-label={`Usuń ${p.name}`}>×</button>
                                </span>
                            ))}
                            <input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="nazwa"
                                onKeyDown={(e) => e.key === 'Enter' && savePreset()}
                                className="w-32 rounded-full border border-white/10 bg-zinc-950/60 px-3 py-1 text-xs text-white outline-none focus:border-yellow-400/60" />
                            <button onClick={savePreset} className={btnGhost}><Save size={13} /> Zapisz</button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Podgląd A4 + eksport */}
            <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-0 xl:self-start">
                <section className={card}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h2 className="text-base font-semibold text-white"><span className="mr-2 text-yellow-400">4.</span>Arkusz A4</h2>
                        <div className="flex items-center gap-3">
                            <Toggle checked={showCut} onChange={setShowCut} label="Linie cięcia" small />
                            <button onClick={() => setSheetZoom(true)} className={btnGhost} title="Powiększ arkusz"><Maximize2 size={13} /> Lupa</button>
                        </div>
                    </div>
                    <div className="mx-auto max-w-[420px]" onDoubleClick={() => setSheetZoom(true)} title="Dwuklik: lupa">
                        <SheetPreviewA4 layout={layout} designs={previewMap} settings={settings} showCut={showCut} selectedId={selectedId} onSelect={setSelectedId} />
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <Stat label="Naklejek" value={String(total)} />
                        <Stat label="Zajęte" value={`${Math.round(layout.usage * 100)}%`} />
                        <Stat label="Arkusz" value="2480×3508" />
                    </dl>
                    {overflow.length > 0 && (
                        <p className="mt-3 rounded-2xl bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
                            Nie zmieściło się: {overflow.map(([id, n]) => `${designs.find((d) => d.id === id)?.name ?? id} ×${n}`).join(', ')}. Zmniejsz rozmiar albo liczbę sztuk.
                        </p>
                    )}
                    <div className="mt-4 flex flex-col gap-2">
                        <button onClick={exportZip} disabled={exporting || !total || pending} className={btnPrimary}>
                            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {exporting ? 'Składam arkusz 300 DPI…' : pending ? 'Liczę kontury…' : 'Pobierz paczkę: PNG + DXF + SVG'}
                        </button>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button onClick={() => projectInput.current?.click()} className={btnGhost}><FileUp size={13} /> Wczytaj projekt.json</button>
                            <input ref={projectInput} type="file" accept="application/json,.json" className="hidden"
                                onChange={(e) => { importProject(e.target.files?.[0]); e.target.value = '' }} />
                        </div>
                    </div>
                </section>

                <section className={`${card} text-xs leading-relaxed text-zinc-400`}>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Wand2 size={15} className="text-yellow-400" /> Druk i cięcie w skrócie</h3>
                    <ol className="list-decimal space-y-1 pl-4">
                        <li>Silhouette Studio: strona A4 pionowo, znaczniki Typ 1.</li>
                        <li>Wstaw PNG na X 0, Y 0, 210 × 297 mm. Otwórz DXF i ustaw linie według pozycji z INSTRUKCJA.txt.</li>
                        <li>Drukuj z Silhouette Studio na Epsonie L18050, skala 100%.</li>
                        <li>Laminat {settings.laminate === 'brak' ? 'pomijasz' : settings.laminate === 'mat' ? 'matowy' : 'błyszczący (nie zakrywaj nim znaczników, jeśli kamera ich nie widzi)'}.</li>
                        <li>Cameo 5: wykryj znaczniki, cięcie testowe, potem cały arkusz.</li>
                    </ol>
                </section>
            </aside>

            {sheetZoom && (
                <ZoomModal title="Arkusz A4 · kliknij naklejkę, żeby ją poprawić" onClose={() => setSheetZoom(false)} baseMax={640}>
                    <SheetPreviewA4 layout={layout} designs={previewMap} settings={settings} showCut={showCut} selectedId={selectedId}
                        onSelect={(id) => { setSelectedId(id); setSheetZoom(false); setZoomId(id) }} />
                </ZoomModal>
            )}

            {zoomDesign && zoomGeo && (
                <ZoomModal title={`${zoomDesign.name} · ${zoomDesign.sizeMm} mm`} onClose={() => setZoomId(null)} baseMax={720}
                    side={
                        <div className="flex flex-col gap-5">
                            <div>
                                <div className="mb-1 flex items-baseline justify-between">
                                    <span className={label}>Rozmiar grafiki</span>
                                    <span className="text-xs tabular-nums text-zinc-200">{zoomDesign.sizeMm} mm</span>
                                </div>
                                <input type="range" min={SIZE_MIN} max={SIZE_MAX} step={1} value={zoomDesign.sizeMm}
                                    onChange={(e) => updateDesign(zoomDesign.id, { sizeMm: clampSize(e.target.value) })} className="w-full accent-yellow-400" aria-label="Rozmiar w mm" />
                                <p className="mt-1 text-[11px] text-zinc-500">
                                    Z obwódką {fmt(zoomGeo.w)} × {fmt(zoomGeo.h)} mm · na arkuszu {countById[zoomDesign.id] ?? 0} szt.
                                </p>
                            </div>
                            <div>
                                <label className={label} htmlFor="st-refine">Co poprawić w grafice</label>
                                <textarea id="st-refine" value={refineText} onChange={(e) => setRefineText(e.target.value)} rows={4} maxLength={800}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) refine(zoomDesign, refineText) }}
                                    placeholder="np. napis „KAWA” na czerwono, filiżanka bez łyżeczki, więcej pary"
                                    className={`${input} resize-y`} />
                                {enhanceRow('edit')}
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {REFINE_CHIPS.map((c) => (
                                        <button key={c} onClick={() => setRefineText((t) => (t.trim() ? `${t.trim()}, ${c}` : c))}
                                            className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-zinc-400 transition hover:border-yellow-400/40 hover:text-white">+ {c}</button>
                                    ))}
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button onClick={() => refine(zoomDesign, refineText)} disabled={refining || refineText.trim().length < 3} className={btnPrimary}>
                                        {refining ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        {refining ? `Gemini poprawia… ${elapsed} s` : 'Popraw grafikę'}
                                    </button>
                                    <button onClick={() => undo(zoomDesign)} disabled={refining || !zoomDesign.history?.length} className={btnGhost}>
                                        <Undo2 size={13} /> Cofnij{zoomDesign.history?.length ? ` (${zoomDesign.history.length})` : ''}
                                    </button>
                                </div>
                                <p className="mt-2 text-[11px] text-zinc-500">Gemini zmienia tylko to, co wpiszesz. Każda poprawka to jedno płatne zapytanie. Ctrl+Enter wysyła.</p>
                            </div>
                            <Toggle checked={showCut} onChange={setShowCut} label="Pokaż linię cięcia" small />
                        </div>
                    }>
                    <div className="relative">
                        <StickerCloseup src={zoomDesign.src} geo={zoomGeo} settings={settings} showCut={showCut} />
                        {refining && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                                <Loader2 size={32} className="animate-spin text-yellow-400" />
                            </div>
                        )}
                    </div>
                </ZoomModal>
            )}
        </div>
    )
}

function Slider({ label: l, unit, min, max, step, value, onChange, hint }: {
    label: string; unit: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; hint?: string
}) {
    return (
        <div>
            <div className="mb-1 flex items-baseline justify-between">
                <span className={label}>{l}</span>
                <span className="text-xs tabular-nums text-zinc-200">{unit ? `${fmt(value, step < 1 ? 2 : 0)} ${unit}` : value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-yellow-400" aria-label={l} />
            {hint && <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p>}
        </div>
    )
}

function Toggle({ checked, onChange, label: l, small }: { checked: boolean; onChange: (v: boolean) => void; label: string; small?: boolean }) {
    return (
        <label className={`flex cursor-pointer items-center gap-2 ${small ? 'text-xs text-zinc-400' : ''}`}>
            <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? 'bg-yellow-400' : 'bg-zinc-700'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
            {l}
        </label>
    )
}

function Stat({ label: l, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-zinc-950/40 px-2 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-zinc-500">{l}</dt>
            <dd className="text-sm font-semibold tabular-nums text-white">{value}</dd>
        </div>
    )
}
