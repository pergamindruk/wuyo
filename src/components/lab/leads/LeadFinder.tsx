'use client'

// "use client": formularz, czekanie na Apify (do kilku minut), filtr i eksport CSV dzieją się w przeglądarce.
import { useMemo, useState } from 'react'
import { Download, ExternalLink, Globe, Loader2, MapPin, Phone, Search, Star } from 'lucide-react'
import { toast } from 'sonner'
import type { LeadPlace } from '@/lib/apify'

const QUICK = ['restauracja', 'salon kosmetyczny', 'fryzjer', 'mechanik samochodowy', 'gabinet stomatologiczny', 'kwiaciarnia']

function csvCell(v: string | number | null): string {
    const s = v === null ? '' : String(v)
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV pod polskiego Excela: średnik jako separator, BOM dla polskich znaków. */
function toCsv(rows: LeadPlace[]): string {
    const head = ['Nazwa', 'Kategoria', 'Telefon', 'Strona WWW', 'Ocena', 'Liczba opinii', 'Adres', 'Google Maps']
    const body = rows.map((r) =>
        [r.name, r.category, r.phone, r.website, r.rating !== null ? r.rating.toLocaleString('pl-PL') : null, r.reviews, r.address, r.mapsUrl]
            .map(csvCell)
            .join(';'),
    )
    return '﻿' + [head.join(';'), ...body].join('\r\n')
}

function slug(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function LeadFinder() {
    const [query, setQuery] = useState('')
    const [location, setLocation] = useState('Rzeszów')
    const [maxResults, setMaxResults] = useState(20)
    const [noWebsite, setNoWebsite] = useState(true)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<LeadPlace[] | null>(null)
    const [lastQuery, setLastQuery] = useState<{ query: string; location: string } | null>(null)

    const shown = useMemo(() => (results ?? []).filter((r) => !noWebsite || !r.website), [results, noWebsite])

    const search = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (loading || query.trim().length < 2) return
        setLoading(true)
        try {
            const res = await fetch('/api/leads/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim(), location: location.trim() || 'Rzeszów', maxResults, withoutWebsiteOnly: noWebsite }),
            })
            const json = (await res.json()) as { results?: LeadPlace[]; error?: string }
            if (!res.ok || !json.results) throw new Error(json.error ?? 'Wyszukiwanie nie wyszło.')
            setResults(json.results)
            setLastQuery({ query: query.trim(), location: location.trim() || 'Rzeszów' })
            toast.success(`Znalezione: ${json.results.length}`)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Wyszukiwanie nie wyszło.')
        } finally {
            setLoading(false)
        }
    }

    const exportCsv = () => {
        if (!shown.length) return
        const blob = new Blob([toCsv(shown)], { type: 'text/csv;charset=utf-8' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `firmy-${slug(lastQuery?.query ?? 'wyniki')}-${slug(lastQuery?.location ?? '')}-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(a.href)
    }

    const input = 'rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-yellow-400/50 focus:outline-none'

    return (
        <div className="flex flex-col gap-5">
            <form onSubmit={search} className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5 sm:p-6">
                <div className="grid gap-3 sm:grid-cols-[2fr_1.3fr_auto]">
                    <label className="flex flex-col gap-1 text-xs text-zinc-400">
                        Branża / fraza
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="np. salon kosmetyczny" className={input} required minLength={2} maxLength={80} />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-zinc-400">
                        Miejscowość
                        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Rzeszów" className={input} maxLength={80} />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-zinc-400">
                        Ile wyników (max 50)
                        <input
                            type="number" min={1} max={50} value={maxResults}
                            onChange={(e) => setMaxResults(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
                            className={`${input} sm:w-28`}
                        />
                    </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    {QUICK.map((q) => (
                        <button key={q} type="button" onClick={() => setQuery(q)}
                            className={`rounded-full border px-2.5 py-1 text-[11px] transition ${query === q ? 'border-yellow-400/50 text-yellow-300' : 'border-white/10 text-zinc-400 hover:text-white'}`}>
                            {q}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-200">
                        <button
                            type="button" role="switch" aria-checked={noWebsite} onClick={() => setNoWebsite((v) => !v)}
                            className={`relative h-6 w-11 rounded-full transition ${noWebsite ? 'bg-yellow-400' : 'bg-zinc-700'}`}
                        >
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-zinc-950 transition-all ${noWebsite ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                        Tylko firmy bez strony WWW
                    </label>
                    <button type="submit" disabled={loading || query.trim().length < 2}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-zinc-950 hover:bg-yellow-300 disabled:opacity-40">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        {loading ? 'Szukam… (do 2–3 min)' : 'Szukaj'}
                    </button>
                </div>
                <p className="mt-3 text-[11px] text-zinc-600">Każde wyszukiwanie zużywa kredyty Apify (płatne za wynik). Limit 50 na raz.</p>
            </form>

            {results && (
                <section className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-white">
                            {shown.length} {shown.length === 1 ? 'firma' : 'firm'}
                            {lastQuery && <span className="ml-2 text-sm font-normal text-zinc-500">{lastQuery.query} · {lastQuery.location}</span>}
                        </h2>
                        <button type="button" onClick={exportCsv} disabled={!shown.length}
                            className="inline-flex items-center gap-2 rounded-xl border border-yellow-400/40 px-4 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-40">
                            <Download size={14} /> Eksportuj do CSV
                        </button>
                    </div>

                    {shown.length === 0 ? (
                        <p className="mt-4 text-sm text-zinc-500">Brak wyników. Spróbuj innej frazy albo wyłącz filtr „bez WWW”.</p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                                        <th className="py-2 pr-3 font-semibold">Nazwa</th>
                                        <th className="py-2 pr-3 font-semibold">Kategoria</th>
                                        <th className="py-2 pr-3 font-semibold">Telefon</th>
                                        <th className="py-2 pr-3 font-semibold">Strona WWW</th>
                                        <th className="py-2 pr-3 font-semibold">Ocena</th>
                                        <th className="py-2 font-semibold">Adres</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05]">
                                    {shown.map((r, i) => (
                                        <tr key={`${r.name}-${r.address}-${i}`} className="align-top hover:bg-white/[0.02]">
                                            <td className="py-2.5 pr-3 font-medium text-white">
                                                {r.mapsUrl ? (
                                                    <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-yellow-300">
                                                        {r.name} <ExternalLink size={11} className="text-zinc-600" />
                                                    </a>
                                                ) : r.name}
                                            </td>
                                            <td className="py-2.5 pr-3 text-zinc-400">{r.category ?? '—'}</td>
                                            <td className="whitespace-nowrap py-2.5 pr-3">
                                                {r.phone ? (
                                                    <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 text-zinc-200 hover:text-yellow-300">
                                                        <Phone size={12} className="text-zinc-500" /> {r.phone}
                                                    </a>
                                                ) : <span className="text-zinc-600">—</span>}
                                            </td>
                                            <td className="max-w-[200px] py-2.5 pr-3">
                                                {r.website ? (
                                                    <a href={r.website} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-zinc-300 hover:text-yellow-300">
                                                        <Globe size={12} className="shrink-0 text-zinc-500" />
                                                        <span className="truncate">{r.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                                                    </a>
                                                ) : <span className="rounded-full bg-yellow-400/10 px-2 py-0.5 text-[11px] font-semibold text-yellow-300">brak strony</span>}
                                            </td>
                                            <td className="whitespace-nowrap py-2.5 pr-3 text-zinc-300">
                                                {r.rating !== null ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                        {r.rating.toLocaleString('pl-PL')}
                                                        {r.reviews !== null && <span className="text-zinc-600">({r.reviews})</span>}
                                                    </span>
                                                ) : <span className="text-zinc-600">—</span>}
                                            </td>
                                            <td className="py-2.5 text-zinc-400">
                                                {r.address ? <span className="inline-flex gap-1"><MapPin size={12} className="mt-0.5 shrink-0 text-zinc-600" />{r.address}</span> : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}
