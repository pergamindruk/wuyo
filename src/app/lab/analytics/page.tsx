import { redirect } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getGoogleStats, type Ga4Summary, type GscSummary } from '@/lib/lab/google-stats'
import { serviceAccountEmail } from '@/lib/ai-endpoint'
import { getOwnStats, type OwnStats } from './actions'
import { MarketingTips } from './MarketingTips'

export const dynamic = 'force-dynamic'

const DAYS = 28
const card = 'rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5'
const fmt = (n: number, d = 0) => n.toLocaleString('pl-PL', { maximumFractionDigits: d, minimumFractionDigits: d })
const pct = (n: number) => `${fmt(n * 100, 1)}%`

function Delta({ now, before }: { now: number; before: number }) {
    if (!before) return null
    const d = (now - before) / before
    const up = d >= 0
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{fmt(Math.abs(d) * 100)}%
        </span>
    )
}

function Tile({ label, value, sub, delta }: { label: string; value: string; sub?: string; delta?: React.ReactNode }) {
    return (
        <div className={card}>
            <p className="text-xs text-zinc-400">{label}</p>
            <div className="mt-2 flex items-baseline gap-2"><p className="text-3xl font-bold text-white">{value}</p>{delta}</div>
            {sub && <p className="mt-1 text-[11px] text-zinc-500">{sub}</p>}
        </div>
    )
}

/** Słupki dzienne bez biblioteki: wysokość = udział w maksimum. */
function Bars({ data }: { data: { label: string; value: number }[] }) {
    const max = Math.max(1, ...data.map((d) => d.value))
    return (
        <div className="flex h-32 items-end gap-[3px]">
            {data.map((d) => (
                <div key={d.label} className="group relative flex-1" title={`${d.label}: ${d.value}`}>
                    <div className="w-full rounded-t-sm bg-yellow-400/80 transition group-hover:bg-yellow-300" style={{ height: `${Math.max(2, (d.value / max) * 128)}px` }} />
                </div>
            ))}
        </div>
    )
}

function List({ title, rows }: { title: string; rows: { k: string; v: string; w: number }[] }) {
    return (
        <div className={card}>
            <p className="mb-3 text-sm font-semibold text-white">{title}</p>
            {rows.length === 0 ? <p className="text-xs text-zinc-600">Brak danych.</p> : (
                <ul className="flex flex-col gap-1.5">
                    {rows.map((r) => (
                        <li key={r.k} className="relative overflow-hidden rounded-lg px-2.5 py-1.5 text-xs">
                            <span className="absolute inset-y-0 left-0 bg-white/[0.05]" style={{ width: `${Math.max(3, r.w * 100)}%` }} />
                            <span className="relative flex justify-between gap-3"><span className="truncate text-zinc-300">{r.k}</span><span className="shrink-0 font-semibold text-white">{r.v}</span></span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function rel<T>(rows: T[], val: (r: T) => number) {
    const max = Math.max(1, ...rows.map(val))
    return (r: T) => val(r) / max
}

function summaryText(ga4: Ga4Summary | null, gsc: GscSummary | null, own: OwnStats | null): string {
    const out: string[] = []
    if (ga4) {
        out.push(`GA4 ${DAYS} dni: użytkownicy ${ga4.users} (poprzednio ${ga4.prevUsers}), sesje ${ga4.sessions}, zaangażowanie ${pct(ga4.engagementRate)}, śr. czas ${fmt(ga4.avgEngagementSec)} s, kluczowe zdarzenia ${ga4.keyEvents}.`)
        out.push('Strony: ' + ga4.pages.map((p) => `${p.path} ${p.views} odsł., ${fmt(p.avgSec)} s`).join('; '))
        out.push('Źródła: ' + ga4.sources.map((s) => `${s.source} ${s.sessions}`).join('; '))
        out.push('Urządzenia: ' + ga4.devices.map((d) => `${d.device} ${d.users}`).join('; '))
        out.push('Miasta: ' + ga4.cities.map((c) => `${c.city} ${c.users}`).join('; '))
    }
    if (gsc) {
        out.push(`Google (Search Console): kliknięcia ${gsc.clicks}, wyświetlenia ${gsc.impressions}, CTR ${pct(gsc.ctr)}, śr. pozycja ${fmt(gsc.position, 1)}.`)
        out.push('Zapytania: ' + gsc.queries.map((q) => `"${q.query}" klik ${q.clicks}, wyśw ${q.impressions}, poz ${fmt(q.position, 1)}`).join('; '))
    }
    if (own) {
        out.push(`Własny licznik: ${own.views} odsłon (poprzednio ${own.prevViews}). Strony: ${own.pages.map((p) => `${p.page} ${p.views}`).join('; ')}. Polecające: ${own.referrers.map((r) => `${r.referrer} ${r.views}`).join('; ')}.`)
    }
    return out.join('\n') || 'Brak danych.'
}

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const [google, own] = await Promise.all([getGoogleStats(DAYS), getOwnStats(DAYS)])
    const { ga4, gsc } = google
    const sa = serviceAccountEmail()
    const opportunities = (gsc?.queries ?? []).filter((q) => q.impressions >= 20 && q.position > 7 && q.position <= 25)
        .sort((a, b) => b.impressions - a.impressions).slice(0, 6)

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Statystyki</p>
                <h1 className="mt-1 text-3xl font-bold text-white">wuyo.pl · ostatnie {DAYS} dni</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    {ga4 ? 'Google Analytics' : 'GA4 niepodłączone'} · {gsc ? 'Search Console' : 'Search Console niepodłączone'} · własny licznik odsłon
                </p>
            </header>

            {(!ga4 || !gsc) && (
                <details className="rounded-3xl border border-yellow-400/25 bg-yellow-400/[0.05] p-5 text-sm text-zinc-300" open={!ga4 && !gsc}>
                    <summary className="cursor-pointer font-semibold text-yellow-400">Podłącz Google Analytics i Search Console (10 minut, raz)</summary>
                    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-zinc-300">
                        <li>W Google Cloud (projekt z Vertex) włącz <b>Google Analytics Data API</b> i <b>Google Search Console API</b>.</li>
                        <li>GA4 → Administracja → Zarządzanie dostępem do usługi → dodaj <code className="rounded bg-black/40 px-1">{sa ?? 'adres konta serwisowego'}</code> z rolą <b>Wyświetlający</b>.</li>
                        <li>GA4 → Administracja → Szczegóły usługi → skopiuj <b>identyfikator usługi</b> (same cyfry) i dodaj w Vercel zmienną <code className="rounded bg-black/40 px-1">GA4_PROPERTY_ID</code>.</li>
                        <li>Search Console → Ustawienia → Użytkownicy i uprawnienia → dodaj ten sam adres (uprawnienie: ograniczone). Jeśli usługa to adres URL, a nie domena, dodaj w Vercel <code className="rounded bg-black/40 px-1">GSC_SITE=https://wuyo.pl/</code>.</li>
                        <li>Redeploy w Vercel. Dane pojawią się tutaj same.</li>
                    </ol>
                    {(google.ga4Error || google.gscError) && (
                        <p className="mt-3 text-[11px] text-zinc-500">Teraz: {[google.ga4Error && `GA4: ${google.ga4Error}`, google.gscError && `GSC: ${google.gscError}`].filter(Boolean).join(' · ')}</p>
                    )}
                </details>
            )}

            {ga4 && (
                <>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Tile label="Użytkownicy" value={fmt(ga4.users)} sub={`nowi: ${fmt(ga4.newUsers)}`} delta={<Delta now={ga4.users} before={ga4.prevUsers} />} />
                        <Tile label="Sesje" value={fmt(ga4.sessions)} delta={<Delta now={ga4.sessions} before={ga4.prevSessions} />} />
                        <Tile label="Zaangażowanie" value={pct(ga4.engagementRate)} sub={`śr. ${fmt(ga4.avgEngagementSec)} s na osobę`} />
                        <Tile label="Kluczowe zdarzenia" value={fmt(ga4.keyEvents)} sub="formularz, telefon, WhatsApp (jeśli ustawione w GA4)" />
                    </div>
                    <div className={card}>
                        <p className="mb-3 text-sm font-semibold text-white">Użytkownicy dziennie</p>
                        <Bars data={ga4.daily.map((d) => ({ label: `${d.date.slice(6, 8)}.${d.date.slice(4, 6)}`, value: d.users }))} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                        <List title="Najczęściej oglądane" rows={ga4.pages.map((p) => ({ k: p.path, v: `${p.views} · ${fmt(p.avgSec)} s`, w: rel(ga4.pages, (x) => x.views)(p) }))} />
                        <List title="Skąd przychodzą" rows={ga4.sources.map((s) => ({ k: s.source, v: String(s.sessions), w: rel(ga4.sources, (x) => x.sessions)(s) }))} />
                        <div className="flex flex-col gap-3">
                            <List title="Urządzenia" rows={ga4.devices.map((d) => ({ k: d.device === 'mobile' ? 'telefon' : d.device === 'desktop' ? 'komputer' : d.device, v: String(d.users), w: rel(ga4.devices, (x) => x.users)(d) }))} />
                            <List title="Miasta" rows={ga4.cities.map((c) => ({ k: c.city, v: String(c.users), w: rel(ga4.cities, (x) => x.users)(c) }))} />
                        </div>
                    </div>
                </>
            )}

            {gsc && (
                <>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Tile label="Kliknięcia z Google" value={fmt(gsc.clicks)} />
                        <Tile label="Wyświetlenia w Google" value={fmt(gsc.impressions)} />
                        <Tile label="CTR" value={pct(gsc.ctr)} sub="ile osób klika po zobaczeniu wyniku" />
                        <Tile label="Średnia pozycja" value={fmt(gsc.position, 1)} sub="1 = pierwszy wynik" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <div className={card}>
                            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Search size={15} className="text-yellow-400" /> Czego ludzie szukają</p>
                            <table className="w-full text-left text-xs">
                                <thead className="text-zinc-500"><tr><th className="py-1.5 font-normal">Zapytanie</th><th className="font-normal">Klik.</th><th className="font-normal">Wyśw.</th><th className="font-normal">Poz.</th></tr></thead>
                                <tbody className="divide-y divide-white/5 text-zinc-300">
                                    {gsc.queries.slice(0, 15).map((q) => (
                                        <tr key={q.query}><td className="max-w-[220px] truncate py-1.5 pr-2">{q.query}</td><td>{q.clicks}</td><td>{q.impressions}</td><td>{fmt(q.position, 1)}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className={card}>
                            <p className="mb-1 text-sm font-semibold text-white">Szanse: blisko pierwszej strony</p>
                            <p className="mb-3 text-[11px] text-zinc-500">Zapytania z wyświetleniami, ale na pozycji 8-25. Poprawa tytułu, treści albo wpis na blogu może je wciągnąć do top 5.</p>
                            {opportunities.length === 0 ? <p className="text-xs text-zinc-600">Na razie brak takich zapytań.</p> : (
                                <ul className="flex flex-col gap-2">
                                    {opportunities.map((q) => (
                                        <li key={q.query} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-xs">
                                            <span className="truncate text-zinc-200">{q.query}</span>
                                            <span className="shrink-0 text-zinc-400">{q.impressions} wyśw. · poz. {fmt(q.position, 1)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}

            {own && (
                <>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Tile label="Odsłony (własny licznik)" value={fmt(own.views)} delta={<Delta now={own.views} before={own.prevViews} />} sub={`poprzednie ${DAYS} dni: ${fmt(own.prevViews)}`} />
                        <Tile label="Średnio dziennie" value={fmt(own.views / DAYS, 1)} />
                        <Tile label="Najlepszy dzień" value={fmt(Math.max(0, ...own.daily.map((d) => d.views)))} sub={own.daily.reduce((a, b) => (b.views > a.views ? b : a), own.daily[0] ?? { date: '', views: 0 }).date} />
                        <Tile label="Podstron z ruchem" value={fmt(own.pages.length)} />
                    </div>
                    <div className={card}>
                        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Users size={15} className="text-yellow-400" /> Odsłony dziennie</p>
                        <Bars data={own.daily.map((d) => ({ label: d.date, value: d.views }))} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <List title="Podstrony" rows={own.pages.map((p) => ({ k: p.page, v: String(p.views), w: rel(own.pages, (x) => x.views)(p) }))} />
                        <List title="Strony, z których ktoś przyszedł" rows={own.referrers.map((r) => ({ k: r.referrer, v: String(r.views), w: rel(own.referrers, (x) => x.views)(r) }))} />
                    </div>
                </>
            )}

            <MarketingTips summary={summaryText(ga4, gsc, own)} />
        </div>
    )
}
