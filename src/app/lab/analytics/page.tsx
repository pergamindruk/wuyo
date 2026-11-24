import { redirect } from 'next/navigation'
import {
    Activity, ArrowDownRight, ArrowUpRight, BarChart3, Compass, Download, Eye, FileText, Inbox, LogIn, MapPin,
    MousePointerClick, Percent, Phone, Plug, Rocket, Search, ShieldCheck, Smartphone, Target, Timer, Trophy, Users,
} from 'lucide-react'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'
import { AreaChart } from '@/components/lab/fx/AreaChart'
import { createClient } from '@/lib/supabase/server'
import { getGoogleStats, type Ga4Summary, type GscSummary } from '@/lib/lab/google-stats'
import { serviceAccountEmail } from '@/lib/ai-endpoint'
import { getOwnStats, type OwnStats } from './actions'
import { MarketingTips } from './MarketingTips'
import { List, Tile, rel, statCard } from '@/components/lab/stats/StatBlocks'

export const dynamic = 'force-dynamic'

const DAYS = 28
const card = statCard
const fmt = (n: number, d = 0) => n.toLocaleString('pl-PL', { maximumFractionDigits: d, minimumFractionDigits: d })
const pct = (n: number) => `${fmt(n * 100, 1)}%`

function Delta({ now, before }: { now: number; before: number }) {
    if (!before) return null
    const d = (now - before) / before
    const up = d >= 0
    return (
        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${up ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'}`}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{fmt(Math.abs(d) * 100)}%
        </span>
    )
}

/** Wykres dzienny (świecąca linia). Dane prosto z GA4 albo własnego licznika, bez dopisywania. */
function Daily({ id, data }: { id: string; data: { label: string; value: number }[] }) {
    if (data.length === 0) return <p className="text-sm text-zinc-500">Brak danych dziennych.</p>
    const last = data[data.length - 1]
    return (
        <div>
            <AreaChart id={id} values={data.map((d) => d.value)} height={180} label={`${last.label} · ${fmt(last.value)}`} className="h-40 sm:h-48" />
            <div className="mt-2 flex justify-between text-[10px] text-zinc-500">
                <span>{data[0].label}</span>
                <span>{last.label}</span>
            </div>
        </div>
    )
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
        out.push(`Potwierdzone (własny licznik od ${own.since}): ${own.visitors} osób (poprzednio ${own.prevVisitors}), ${own.views} odsłon, leady ${own.leads.total}, pobrania potwierdzone ${own.downloads.confirmed}.`)
        out.push('Źródła (osoby/leady/pobrania/kliknięcia kontakt): ' + own.sources.map((r) => `${r.source} ${r.visitors}/${r.leads}/${r.downloads}/${r.contacts}`).join('; '))
        out.push('Strony wejścia: ' + own.landings.map((p) => `${p.page} ${p.views}`).join('; '))
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
            <PageHeader
                icon={BarChart3}
                eyebrow="Statystyki strony"
                title={`wuyo.pl · ostatnie ${DAYS} dni`}
                subtitle={`${ga4 ? 'Google Analytics' : 'GA4 niepodłączone'} · ${gsc ? 'Search Console' : 'Search Console niepodłączone'} · własny licznik odsłon`}
            />

            {(!ga4 || !gsc) && (
                <details className="lab-card border-yellow-400/25 p-5 text-sm text-zinc-300 sm:p-6" open={!ga4 && !gsc}>
                    <summary className="flex cursor-pointer items-center gap-3 font-semibold text-yellow-300">
                        <span className="lab-chip h-9 w-9 shrink-0"><Plug size={16} strokeWidth={1.8} /></span>
                        Podłącz Google Analytics i Search Console (10 minut, raz)
                    </summary>
                    <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-zinc-300">
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
                    <div className="lab-stagger grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        <Tile icon={Users} label="Użytkownicy" value={fmt(ga4.users)} sub={`nowi: ${fmt(ga4.newUsers)}`} delta={<Delta now={ga4.users} before={ga4.prevUsers} />} />
                        <Tile icon={MousePointerClick} label="Sesje" value={fmt(ga4.sessions)} delta={<Delta now={ga4.sessions} before={ga4.prevSessions} />} />
                        <Tile icon={Timer} label="Zaangażowanie" value={pct(ga4.engagementRate)} sub={`śr. ${fmt(ga4.avgEngagementSec)} s na osobę`} />
                        <Tile icon={Target} label="Kluczowe zdarzenia" value={fmt(ga4.keyEvents)} sub="formularz, telefon, WhatsApp (jeśli ustawione w GA4)" />
                    </div>
                    <div className={card}>
                        <SectionTitle icon={Activity} title="Użytkownicy dziennie" />
                        <Daily id="ga4-daily" data={ga4.daily.map((d) => ({ label: `${d.date.slice(6, 8)}.${d.date.slice(4, 6)}`, value: d.users }))} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <List icon={FileText} title="Najczęściej oglądane" rows={ga4.pages.map((p) => ({ k: p.path, v: `${p.views} · ${fmt(p.avgSec)} s`, w: rel(ga4.pages, (x) => x.views)(p) }))} />
                        <List icon={Compass} title="Skąd przychodzą" rows={ga4.sources.map((s) => ({ k: s.source, v: String(s.sessions), w: rel(ga4.sources, (x) => x.sessions)(s) }))} />
                        <div className="flex flex-col gap-4">
                            <List icon={Smartphone} title="Urządzenia" rows={ga4.devices.map((d) => ({ k: d.device === 'mobile' ? 'telefon' : d.device === 'desktop' ? 'komputer' : d.device, v: String(d.users), w: rel(ga4.devices, (x) => x.users)(d) }))} />
                            <List icon={MapPin} title="Miasta" rows={ga4.cities.map((c) => ({ k: c.city, v: String(c.users), w: rel(ga4.cities, (x) => x.users)(c) }))} />
                        </div>
                    </div>
                </>
            )}

            {gsc && (
                <>
                    <div className="lab-stagger grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        <Tile icon={MousePointerClick} label="Kliknięcia z Google" value={fmt(gsc.clicks)} />
                        <Tile icon={Eye} label="Wyświetlenia w Google" value={fmt(gsc.impressions)} />
                        <Tile icon={Percent} label="CTR" value={pct(gsc.ctr)} sub="ile osób klika po zobaczeniu wyniku" />
                        <Tile icon={Trophy} label="Średnia pozycja" value={fmt(gsc.position, 1)} sub="1 = pierwszy wynik" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className={card}>
                            <SectionTitle icon={Search} title="Czego ludzie szukają" />
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="text-zinc-500"><tr><th className="py-1.5 font-normal">Zapytanie</th><th className="font-normal">Klik.</th><th className="font-normal">Wyśw.</th><th className="font-normal">Poz.</th></tr></thead>
                                    <tbody className="divide-y divide-white/5 text-zinc-300">
                                        {gsc.queries.slice(0, 15).map((q) => (
                                            <tr key={q.query}><td className="max-w-[220px] truncate py-2 pr-2">{q.query}</td><td className="tabular-nums">{q.clicks}</td><td className="tabular-nums">{q.impressions}</td><td className="tabular-nums">{fmt(q.position, 1)}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={card}>
                            <SectionTitle icon={Rocket} title="Szanse: blisko pierwszej strony" />
                            <p className="-mt-2 mb-4 text-[11px] text-zinc-500">Zapytania z wyświetleniami, ale na pozycji 8-25. Poprawa tytułu, treści albo wpis na blogu może je wciągnąć do top 5.</p>
                            {opportunities.length === 0 ? (
                                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.02] px-4 py-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500"><Rocket size={18} strokeWidth={1.8} /></span>
                                    <p className="text-xs text-zinc-500">Na razie brak takich zapytań.</p>
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {opportunities.map((q) => (
                                        <li key={q.query} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 text-xs transition hover:bg-white/[0.06]">
                                            <span className="truncate font-medium text-zinc-200">{q.query}</span>
                                            <span className="shrink-0 rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">{q.impressions} wyśw. · poz. {fmt(q.position, 1)}</span>
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
                    <div className="mt-2 flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400"><ShieldCheck size={18} strokeWidth={1.8} /></span>
                        <div>
                            <h2 className="text-base font-bold text-white">Potwierdzone dane z własnego licznika</h2>
                            <p className="text-xs text-zinc-500">Od {own.since}. Bez robotów, testów i Twojego komputera. Osoba = unikalny odwiedzający danego dnia. Leady i pobrania prosto z bazy.</p>
                        </div>
                    </div>
                    <div className="lab-stagger grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                        <Tile icon={Users} label="Osoby" value={fmt(own.visitors)} delta={<Delta now={own.visitors} before={own.prevVisitors} />} sub={`poprzednie ${DAYS} dni: ${fmt(own.prevVisitors)}`} />
                        <Tile icon={Inbox} label="Leady (formularze, czat, audyt)" value={fmt(own.leads.total)} sub={own.leads.byType.map((t) => `${t.type} ${t.count}`).join(' · ') || 'brak'} />
                        <Tile icon={Download} label="Pobrania potwierdzone" value={fmt(own.downloads.confirmed)} sub={`prośby: ${fmt(own.downloads.requested)} · ze zgodą na maile: ${fmt(own.downloads.withConsent)}`} />
                        <Tile icon={Phone} label="Kliknięcia telefon / WhatsApp" value={fmt(own.events.reduce((a, e) => a + e.count, 0))} sub={own.events.map((e) => `${e.event} ${e.count}`).join(' · ') || 'brak'} />
                    </div>
                    <div className={card}>
                        <SectionTitle icon={Compass} title="Skąd przychodzą klienci" />
                        {own.sources.length === 0 ? <p className="text-sm text-zinc-500">Jeszcze brak danych z nowego licznika.</p> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-left text-xs text-zinc-500">
                                        <tr><th className="py-2 pr-4 font-medium">Źródło</th><th className="py-2 pr-4 font-medium text-right">Osoby</th><th className="py-2 pr-4 font-medium text-right">Leady</th><th className="py-2 pr-4 font-medium text-right">Pobrania</th><th className="py-2 font-medium text-right">Tel./WhatsApp</th></tr>
                                    </thead>
                                    <tbody>
                                        {own.sources.map((r) => (
                                            <tr key={r.source} className="border-t border-white/5 text-zinc-200">
                                                <td className="py-2.5 pr-4">{r.source}</td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums">{fmt(r.visitors)}</td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums">{r.leads ? <span className="rounded-full bg-yellow-400/15 px-2.5 py-1 text-[11px] font-semibold text-yellow-300">{r.leads}</span> : 0}</td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums">{r.downloads}</td>
                                                <td className="py-2.5 text-right tabular-nums">{r.contacts}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <p className="mt-4 text-xs text-zinc-500">Kampanie: dodawaj do linków ?utm_source=facebook&amp;utm_campaign=grudzien, wtedy wejścia pokażą się tu osobno.</p>
                    </div>
                    <div className={card}>
                        <SectionTitle icon={Users} title="Osoby dziennie" />
                        <Daily id="own-daily" data={own.daily.map((d) => ({ label: d.date, value: d.views }))} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <List icon={LogIn} title="Strony wejścia (pierwsza oglądana)" rows={own.landings.map((p) => ({ k: p.page, v: String(p.views), w: rel(own.landings, (x) => x.views)(p) }))} />
                        <List icon={FileText} title="Wszystkie odsłony podstron" rows={own.pages.map((p) => ({ k: p.page, v: String(p.views), w: rel(own.pages, (x) => x.views)(p) }))} />
                    </div>
                </>
            )}

            <MarketingTips summary={summaryText(ga4, gsc, own)} />
        </div>
    )
}
